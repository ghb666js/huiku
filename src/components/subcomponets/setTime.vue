<template>
  <div class="set-time-container">
    <div class="title-btn">
      <h2 class="section-title">上午</h2>
      <div class="button-section">
        <button class="control-btn" @click="startCircleReading">循环读取</button>
        <button class="control-btn" @click="configureTimer">配置</button>
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

    <h2 class="section-title">下午</h2>
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
export default {
  name: 'setTime',
  data() {
    return {
      selectedTimes: {},
      statusMessage: '',
      timerInterval: null,
      isCircleReading: false
    };
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
    startCircleReading() {
      if (this.isCircleReading) {
        this.statusMessage = '循环读取已停止';
        this.isCircleReading = false;
        return;
      }

      this.statusMessage = '开始循环读取...';
      this.isCircleReading = true;
      
      // 模拟循环读取过程
      const circleRead = async () => {
        if (!this.isCircleReading) return;

        try {
          this.statusMessage = '正在采集数据...';
          // 模拟数据采集
          await this.simulateDataCollection();
          this.statusMessage = '数据采集完成，30分钟后再次采集';
        } catch (error) {
          this.statusMessage = `采集失败: ${error.message}`;
        } finally {
          // 30分钟后再次采集
          setTimeout(circleRead, 30 * 60 * 1000);
        }
      };

      circleRead();
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

      this.statusMessage = `已配置 ${selectedTimeArray.length} 个定时任务`;

      // 设置新的定时器
      this.timerInterval = setInterval(async () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();

        for (const time of selectedTimeArray) {
          if (currentHour === time.hour && currentMinute === time.minute && currentSecond === time.second) {
            this.statusMessage = `执行定时任务: ${time.hour}:${time.minute.toString().padStart(2, '0')}:${time.second.toString().padStart(2, '0')}`;
            await this.simulateDataCollection();
            this.statusMessage = '定时任务执行完成';
          }
        }
      }, 1000);
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
  padding: 0.5vw 1vw;
  font-size: 0.7vw;
  color: #ffffff;
  background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
  border: 1px solid #0088ff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.control-btn:hover {
  background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
  border-color: #00aaff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 136, 255, 0.4);
  transform: translateY(-2px);
}

.section-title {
  font-size: 18px;
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
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

.time-table th,
.time-table td {
  border: 1px solid rgba(0, 140, 255, 0.4);
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
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 4px;
  color: #ffffff;
  font-size: 0.7vw;
  text-align: center;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

/* 滚动条样式 */
.set-time-container::-webkit-scrollbar {
  width: 8px;
}

.set-time-container::-webkit-scrollbar-track {
  background: rgba(0, 40, 80, 0.5);
  border-radius: 4px;
}

.set-time-container::-webkit-scrollbar-thumb {
  background: rgba(0, 140, 255, 0.6);
  border-radius: 4px;
}

.set-time-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 140, 255, 0.8);
}
</style>