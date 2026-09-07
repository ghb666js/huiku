<template>
  <div class="set-time-container">
    <div class="title-btn">
      <!-- <h2 class="section-title">上午</h2> -->
      <div class="button-section">
        <!-- <button class="control-btn" @click="startCircleReading">循环读取</button> -->
        <button class="control-btn" @click="setTimeGet">配置</button>
      </div>
    </div>
    
     
    <table class="time-table">
      <tr v-for="(row, rowIndex) in morningRows" :key="`morning-${rowIndex}`">
        <td v-for="(time, colIndex) in row" :key="`morning-${rowIndex}-${colIndex}`">
          <input type="checkbox" :id="`morning-${time.hour}-${time.minute}-00`" v-model="selectedTimes[`${time.hour}_${time.minute}_00`]" />
          {{ time.hour }}:{{ time.minute.toString().padStart(2, '0') }}
        </td>
      </tr>
    </table>

    <!-- <h2 class="section-title">下午</h2> -->
    <table class="time-table">
      <tr v-for="(row, rowIndex) in afternoonRows" :key="`afternoon-${rowIndex}`">
        <td v-for="(time, colIndex) in row" :key="`afternoon-${rowIndex}-${colIndex}`">
          <input type="checkbox" :id="`afternoon-${time.hour}-${time.minute}-00`" v-model="selectedTimes[`${time.hour}_${time.minute}_00`]" />
          {{ time.hour }}:{{ time.minute.toString().padStart(2, '0') }}
        </td>
      </tr>
    </table>

    <div class="status-message" v-if="statusMessage">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
// import { connect } from 'echarts/lib/echarts';
import * as generalfunction from '../../utils/generalfunction'
import axios from 'axios';
import EventBus from '@/bus'
import store from '@/store';
export default {
  name: 'setTime',
  data() {
    return {
      connectedPorts:[],
      selectedTimes: {},
      statusMessage: '',
      timerInterval: null,
      isCircleReading: false
    };
  },
  mounted(){
    if ('serial' in navigator) {
      navigator.serial.onconnect = (e) => {
        console.log('serial connected', e);
      };
      navigator.serial.ondisconnect = (e) => {
        console.log('serial disconnected', e);
        this.connectedPorts = this.connectedPorts.filter(item => item.port !== e.target);
      };
    }
  },
  computed: {
    morningRows() {
      const rows = [];
      let currentRow = [];
      for (let hour = 0; hour < 12; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          currentRow.push({ hour, minute });
          if (currentRow.length === 6) {
            rows.push([...currentRow]);
            currentRow = [];
          }
        }
      }
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      return rows;
    },
    afternoonRows() {
      const rows = [];
      let currentRow = [];
      for (let hour = 12; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          currentRow.push({ hour, minute });
          if (currentRow.length === 6) {
            rows.push([...currentRow]);
            currentRow = [];
          }
        }
      }
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      return rows;
    }
  },
  methods: {
    async connectMultiplePorts() {
      try {
        if (!('serial' in navigator)) {
          alert('当前浏览器不支持 Web Serial API');
          return;
        }
        const ports = await navigator.serial.getPorts();
        for (const port of ports) {
          try {
            await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
            this.connectedPorts.push({ port });
            this.$store.state.connectedPorts = this.connectedPorts
          } catch (e) {
            console.warn('打开已配对端口失败', e);
          }
        }
        // this.responseText = `已连接 ${this.connectedPorts.length} 个端口`;
        // this.configureTimer()
      } catch (err) {      
        console.error('connectMultiplePorts 出错', err);
        this.responseText = `连接端口出错: ${err.message || err}`;
      }
    },
    async setTimeGet(){
      console.log('进入定时');
      if(!this.$store.state.connectedPorts.length) {
        await this.connectMultiplePorts();
        this.configureTimer()
      }else{
        this.configureTimer()
      };
    },
    configureTimer() {
      const selectedTimeArray = [];
      // 收集选中的时间
      for (const timeKey in this.selectedTimes) {
        if (this.selectedTimes[timeKey]) {
          const parts = timeKey.split('_');
          selectedTimeArray.push({
            hour: parseInt(parts[0]),
            minute: parseInt(parts[1]),
            second: parseInt(parts[2])
          });
        }
      }

      if (selectedTimeArray.length === 0) {
        this.statusMessage = '请至少选择一个时间';
        return;
      }

      // 清除之前的定时器
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }

      this.statusMessage = `已设置 ${selectedTimeArray.length} 个定时数据采集时间节点`;

      // 设置新的定时器
      this.timerInterval = setInterval(async () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();

        for (const time of selectedTimeArray) {
          if (currentHour === time.hour && currentMinute === time.minute && currentSecond === time.second) {
            console.log('开始获取数据')
            // const [finalArr, flag] = await generalfunction.main(this.connectedPorts);
            
            const [finalArr, flag] = await generalfunction.main(this.$store.state.connectedPorts);
            // 清除数组中的空元素
            const sensorData = await generalfunction.removeEmptyObjects(finalArr)
            console.log(sensorData);    
            /*-------------------------------------处理应变计-----------------------------------------*/
            // 返回应力计校准数据
            const strainCheckTable = await generalfunction.calculateStrainAverage();
            console.log('应变校准', strainCheckTable);
            // 返回应力计传感器状态
            const strainStatus = await generalfunction.compareStrainCheckTable(sensorData, strainCheckTable, 20);
            console.log('应力计状态', strainStatus);

            /*-------------------------------------处理倾角计-----------------------------------------*/
            const tiltCheckTable = await generalfunction.calculateTiltAverage();
            console.log('倾角校准', tiltCheckTable);
            // 返回倾角计传感器状态
            const tiltStatus = await generalfunction.compareTiltCheckTable(sensorData, tiltCheckTable, 0.01);
            console.log('倾角状态', tiltStatus);


            /*-------------------------------------处理沉降仪-----------------------------------------*/
            //将每个沉降值减去基准沉降值
            const settlementProcessedData = await generalfunction.processSettlementData(sensorData)
            // 获取处理后的基准沉降值的每个沉降值
            const settlementHistoryData = await generalfunction.getHistoryData('settlementHistoryData', 7)
            console.log('沉降值历史数据', settlementHistoryData)
            // 将实时处理后的沉降值与上次处理后的沉降值对比
            const settlementObject = await generalfunction.checkSettlementChange(settlementProcessedData, settlementHistoryData, 50);
            console.log(settlementObject)

            const settlementTotalStatus = settlementObject.totalStatus // 沉降仪的总状态
            const settlementStatusArray = settlementObject.settlementStatusArr // 各个沉降仪的状态
            console.log('沉降仪各个状态数组', settlementStatusArray)


            //应变变系数
            const strainCoefficients = [1000 * 0.173773943450445, 1000 * 0.135335283236613, 1000 * 0.105399224561864, 1000 * 0.0820849986238988,
            1000 * 0.0639278612067076, 1000 * 0.0497870683678639, 1000 * 0.0387742078317220, 1000 * 0.0301973834223185,
            1000 * 0.0235177458560091, 1000 * 0.0183156388887342, 1000 * 0.0142642339089993, 1000 * 0.0111089965382423,
            1000 * 0.00865169520312063, 1000 * 0.00673794699908547, 1000 * 0.00524751839918138, 1000 * 0.00408677143846407
            ];

            // 对倾角和应力传感器进行处理
            //返回倾角计，应力计总状态以及异常应力计的应变值总和
            const strainSum = await generalfunction.strainStatusProcess(strainStatus, strainCoefficients);
            console.log('应变值之和', strainSum)

            

            const tiltTotalStatus = this.calculateTileStatus(tiltStatus);
            console.log('倾角总状态', tiltTotalStatus);  // 输出: 0 或 1

            // 对整个系统进行健康评估
            const totalHealthStatus = await generalfunction.healthEva(tiltTotalStatus, settlementTotalStatus, strainSum)
            console.log(totalHealthStatus)
            // 返回会 'G' 'Y' 'O' 'R'

            // 创建excel文档
            // generalfunction.creatExcel(finalArr)
            // 导入所有传感器最原始数据
            await generalfunction.saveToMySQL('data', sensorData)
            // console.log(sensorData);
            
            // 延迟1000ms再导入状态数据（避免事务冲突）
            // 导入应力计状态数据
            
            setTimeout(async () => {
            // console.log(strainStatus); 
                await generalfunction.saveToMySQL('strainStatus', strainStatus);
            }, 1000);

            // 导入倾角计状态数据
            setTimeout(async () => {
            // console.log(tiltStatus);  
                await generalfunction.saveToMySQL('tiltStatus', tiltStatus)
            }, 1000);

            // 导入减去基准沉降值的沉降仪数据
            setTimeout(async () => {
            // console.log(settlementProcessedData);  
                await generalfunction.saveToMySQL('settlementHistoryData', settlementProcessedData)
            }, 1000);

            //  导入沉降仪状态数据
            setTimeout(async () => {
            // console.log(settlementStatusArray);
                await generalfunction.saveToMySQL('settlementStatus', settlementStatusArray);
            }, 1000);
          }
        }
      }, 1000);
    },
    // async connectMultiplePorts() {
    //   try {
    //     if (!('serial' in navigator)) {
    //       alert('当前浏览器不支持 Web Serial API');
    //       return;
    //     }
    //     const ports = await navigator.serial.getPorts();
    //     for (const port of ports) {
    //       try {
    //         await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    //         this.connectedPorts.push({ port });
    //       } catch (e) {
    //         console.warn('打开已配对端口失败', e);
    //       }
    //     }
    //     this.responseText = `已连接 ${this.connectedPorts.length} 个端口`;
    //   } catch (err) {
    //     console.log(222);
        
    //     console.error('connectMultiplePorts 出错', err);
    //     this.responseText = `连接端口出错: ${err.message || err}`;
    //   }
    // },
    
    calculateTileStatus(results) {
        // 如果没有数据，返回正常状态0
        if (!results || results.length === 0) {
            return 0;
        }
        // 对所有状态进行与运算：所有状态都为0时总状态为0，否则为1
        return results.some(item => item['状态'] === 1) ? 1 : 0;
    },
    async simulateDataCollection() {
      // 模拟数据采集过程
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('模拟数据采集完成');
          resolve();
        }, 2000);
      });
    }
  },
  beforeDestroy() {
    // 清理定时器
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
};
</script>

<style scoped>
.set-time-container {
  width: 98.2%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1vw;
  padding: 1vw;
  overflow-y: auto;
}
.title-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.button-section {
  display: flex;
  gap: 0.75vw;
  margin-bottom: 1vw;
}

.control-btn {
  right: 10%;
  padding: 0.5vw 1vw;
  font-size: 0.7vw;
  color: #ffffff;
  background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
  border: 0.05vw solid #0088ff;
  border-radius: 0.3vw;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0.1vw 0.2vw rgba(0, 0, 0, 0.2);
  text-shadow: 0 0.05vw 0.05vw rgba(0, 0, 0, 0.3);
}

.control-btn:hover {
  background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
  border-color: #00aaff;
  box-shadow: 0 0.2vw 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 136, 255, 0.4);
  transform: translateY(-0.1vw);
}

.section-title {
  font-size: 0.9vw;
  font-weight: bold;
  color: #ffffff;
  margin: 0.5vw 0;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

.time-table {
  width: 96%;
  border-collapse: collapse;
  margin-bottom: 1vw;
  background-color: rgba(0, 40, 80, 0.7);
  border: 0.05vw solid rgba(0, 140, 255, 0.6);
  border-radius: 0.3vw;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

.time-table th,
.time-table td {
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  padding: 0.5vw;
  text-align: left;
  color: #ffffff;
}

.time-table td {
  padding: 0.5vw;
  font-size: 0.7vw;
}

.time-table input[type="checkbox"] {
  margin-right: 0.4vw;
  transform: scale(1.2);
}

.status-message {
  margin-top: 1vw;
  padding: 0.5vw;
  background-color: rgba(0, 40, 80, 0.7);
  border: 0.05vw solid rgba(0, 140, 255, 0.6);
  border-radius: 0.2vw;
  color: #ffffff;
  font-size: 0.7vw;
  text-align: center;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

</style>