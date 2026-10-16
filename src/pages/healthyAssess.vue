<template>
<section class="assess" v-if="assessData.show">
    <!-- <p>{{monitorData.name}}</p> -->
    <div class="container-left">
      <div class="corner-top-right"></div>
      <div class="container-left-content">
        <h2>钢板仓健康安全融合评估与决策</h2>
      </div>
      <div class="container-left-state">
        <!--<div class="state-heading">
          <h3>安全评估</h3>
        </div>-->
        <div class="ring-container">
          <div class="ring-item" :class="[ring['状态'], { 'health-ring': ring.isHealth }]" v-for="(ring, index) in ringStates" :key="index">
            <div class="ring">
              <div class="ring-inner"></div>
              <div class="ring-progress" v-if="ring['状态'] !== 'disconnected'"></div>
            </div>
            <div class="ring-label">{{ ring['状态'] === 'disconnected' ? '断开连接' : ring.label }}</div>

            <div class="status-tooltip" v-if="ring.isHealth">
              <div style="display: flex; flex-direction: column; gap: 0.25vw;">
                <div style="display: flex; align-items: center; gap: 0.5vw;">
                  <div style="width: 0.75vw; height: 0.75vw; background-color: #67c23a; border-radius: 2px;"></div>
                  <span>绿色: 库体安全，状态正常，正常作业，正常维护保养</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5vw;">
                  <div style="width: 0.75vw; height: 0.75vw; background-color: #fcec09; border-radius: 2px;"></div>
                  <span>黄色: 库体传感器存在失效，建议排查更换传感器，加强维保</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5vw;">
                  <div style="width: 0.75vw; height: 0.75vw; background-color: #f77f00; border-radius: 2px;"></div>
                  <span>橙色: 库体局部或钢板环存在安全隐患，待进一步排查，示警上报</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5vw;">
                  <div style="width: 0.75vw; height: 0.75vw; background-color: #f56c6c; border-radius: 2px;"></div>
                  <span>红色: 库体存在倾覆或爆仓风险，立即停止作业，启动应急措施</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div class="container-left-warning">
        <div class="warning-heading">
          <h3>预警信息</h3>
        </div>
        <div class="warning-content">
          <!-- 沉降仪 -->
          <div class="warning-section">
            <div class="section-title">
              <span>沉降仪</span>
            </div>
            <div class="sensor-list">
              <div class="sensor-item" v-for="sensor in displayedSettlementSensors" :key="sensor.id">
                <span class="sensor-id">{{ sensor['传感器ID'] }}</span>
                <span class="sensor-status" :class="sensor['状态'] ? 'error' : 'normal'">异常</span>
                <span class="status-dot" :class="sensor['状态'] ? 'error' : 'normal'"></span>
              </div>
              <div class="no-abnormal" v-if="abnormalSettlementSensors.length === 0" :class="{ 'no-data': !dataLoaded }">
                <span>{{ dataLoaded ? '传感器无异常' : '传感器断开连接' }}</span>
              </div>
              <div class="carousel-indicator" v-if="abnormalSettlementSensors.length > maxDisplaySensors">
                <span class="dot" v-for="(_, index) in Math.ceil(abnormalSettlementSensors.length / maxDisplaySensors)" :key="index" :class="{ active: Math.floor(settlementCarouselIndex / maxDisplaySensors) === index }"></span>
              </div>
            </div>
          </div>

          <!-- 倾角计 -->
          <div class="warning-section">
            <div class="section-title">
              <span>倾角计</span>
            </div>
            <div class="sensor-list">
              <div class="sensor-item" v-for="sensor in displayedInclinationSensors" :key="sensor.id">
                <span class="sensor-id">{{ sensor['传感器ID'] }}</span>
                <span class="sensor-status" :class="sensor['状态'] ? 'error' : 'normal'">异常</span>
                <span class="status-dot" :class="sensor['状态'] ? 'error' : 'normal'"></span>
              </div>
              <div class="no-abnormal" v-if="abnormalInclinationSensors.length === 0" :class="{ 'no-data': !dataLoaded }">
                <span>{{ dataLoaded ? '传感器无异常' : '传感器断开连接' }}</span>
              </div>
            </div>
          </div>

          <!-- 应力计 -->
          <div class="warning-section">
            <div class="section-title">
              <span>应力计</span>
            </div>
            <div class="stress-info">
              <span class="stress-text">具体异常点见异常分布图</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-right">
      <div class="corner-top-right"></div>
      <div class="container-right-content">
        <h2>钢板仓料位库容状态显示与预警</h2>
      </div>
      <div class="container-right-show">
        <!-- 料位高度标签 -->
        <div class="level-info">
          <div class="level-label">仓内当前料位平均高度 </div>
        </div>
        <!-- 料位容器 -->
        <div class="level-container">
          <!-- 刻度容器 -->
          <div class="scale-container">
            <!-- 固定刻度 -->
            <div class="fixed-scale">
              <div class="scale-item" style="bottom: 0%;"><span>0</span></div>
              <div class="scale-item" style="bottom: 16.67%;"><span>5</span></div>
              <div class="scale-item" style="bottom: 33.33%;"><span>10</span></div>
              <div class="scale-item" style="bottom: 66.67%;"><span>20</span></div>
              <div class="scale-item" style="bottom: 100%;"><span>30</span></div>
            </div>
            <!-- 当前刻度 -->
            <div class="current-scale" :style="{ bottom: materialLevel / 30 * 100 + '%' }">
              <span>{{ realLeverl ? materialLevel : '----'}}</span>
            </div>
          </div>
          <!-- 圆柱容器 -->
          <div class="level-cylinder">
            <!-- 固定刻度线 -->
            <div class="fixed-scale-line" style="bottom: 0%;"></div>
            <div class="fixed-scale-line" style="bottom: 16.67%;"></div>
            <div class="fixed-scale-line" style="bottom: 33.33%;"></div>
            <div class="fixed-scale-line" style="bottom: 66.67%;"></div>
            <div class="fixed-scale-line" style="bottom: 100%;"></div>
            <!-- 料位阴影 -->
            <div class="level-shadow" :style="{ height: materialLevel / 30 * 100 + '%' }" :class="getLevelClass()"></div>
            <!-- 当前料位线 -->
            <div class="level-line" :style="{ bottom: materialLevel / 30 * 100 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
</section>
</template>

<script>
import { Notification } from "element-ui";
import EventBus from '@/bus';
import { LOCAL_QUERY_SETTLEMENT, LOCAL_QUERY_TILT, LOCAL_QUERY_STRAIN, RADAR_SURFACE } from '@/constants/api';
export default {
    name: 'healthyAssess',
    data() {
        return {
          assessData:{
            show:false,
            name:'',
          },
          dataLoaded: false, // 数据是否已加载
          ringStates: [
            { label: '倾角', '状态': 'disconnected', isHealth: false },
            { label: '沉降', '状态': 'disconnected', isHealth: false },
            { label: '应变', '状态': 'disconnected', isHealth: false },
            { label: '仓体健康状态', '状态': 'disconnected', isHealth: true }
          ],
          // 模拟传感器数据
          settlementSensors: [],
          inclinationSensors: [],
          strainSensors:[],
          strainCoefficients:[
            1000 * 0.173773943450445, 1000 * 0.135335283236613, 1000 * 0.105399224561864, 1000 * 0.0820849986238988,
            1000 * 0.0639278612067076, 1000 * 0.0497870683678639, 1000 * 0.0387742078317220, 1000 * 0.0301973834223185,
            1000 * 0.0235177458560091, 1000 * 0.0183156388887342, 1000 * 0.0142642339089993, 1000 * 0.0111089965382423,
            1000 * 0.00865169520312063, 1000 * 0.00673794699908547, 1000 * 0.00524751839918138, 1000 * 0.00408677143846407
          ],
          // 轮播相关数据
          settlementCarouselIndex: 0,
          inclinationCarouselIndex: 0,
          carouselInterval: null,
          maxDisplaySensors: 2, // 每种传感器最多显示2列
          // 料位相关数据
          timer:null,
          materialLevel: 15, // 模拟料位值
          realLeverl:0,
          weightedSum: 0,
        };
    },
     components:{ 
      
    },
    watch: {
      // 监听压力计变化
      strainSensors:{
        handler() {
          this.updateRingStates();
        },
        deep: true
      },
      // 监听沉降传感器变化
      settlementSensors: {
        handler() {
          this.updateRingStates();
        },
        deep: true
      },
      // 监听倾角传感器变化
      inclinationSensors: {
        handler() {
          this.updateRingStates();
        },
        deep: true
      },
      // 监听平均料位
      realLeverl:{
        handler(){
          this.getLevelClass()
        }
      },
      deep:true,
    },
     computed: {
      // 兜底 (|| []) ：接口异常时数组可能为 undefined，避免渲染期 .filter 崩溃
      abnormalSettlementSensors() {
        return (this.settlementSensors || []).filter(sensor => sensor['状态'] !== 0);
      },
      abnormalInclinationSensors() {
        return (this.inclinationSensors || []).filter(sensor => sensor['状态'] !== 0);
      },
      displayedSettlementSensors() {
        const abnormal = this.abnormalSettlementSensors;
        const startIndex = this.settlementCarouselIndex % Math.max(abnormal.length, 1);
        return abnormal.slice(startIndex, startIndex + this.maxDisplaySensors);
      },
      displayedInclinationSensors() { 
        const abnormal = this.abnormalInclinationSensors;
        const startIndex = this.inclinationCarouselIndex % Math.max(abnormal.length, 1);
        return abnormal.slice(startIndex, startIndex + this.maxDisplaySensors);
      },
      // 检测沉降仪是否有异常
      hasSettlementError() {
        return this.abnormalSettlementSensors.length > 0;
      },
      // 检测倾角计是否有异常
      hasInclinationError() {
        return this.abnormalInclinationSensors.length > 0;
      }
     },
    mounted: async function() {
      EventBus.$on('healthassessUI', this.updateAssess);
      await this.getRaderData();
      await this.getRealData();
      this.startCarousel();
      this.updateRingStates();
      this.timer = setInterval(() => {
        this.getRaderData();
        this.getRealData();
      }, 180000);
    },
    beforeDestroy() {
      EventBus.$off('healthassessUI', this.updateAssess);
      this.stopCarousel();
      if(this.timer){
        clearInterval(this.timer);
      }
    },
    methods: {
      updateAssess(data){
        // console.log(1);
        this.assessData.show = data.show;
      },
      async getRealData(){
        try {
          const retSettle = await fetch(LOCAL_QUERY_SETTLEMENT)
          const retCline = await fetch(LOCAL_QUERY_TILT)
          const retStrain = await fetch(LOCAL_QUERY_STRAIN)
          // 接口异常时（如 503 返回 {error}）没有 data 字段，兜底为空数组，
          // 否则赋值 undefined 会让渲染期的 .filter 崩溃、整个面板无法显示
          this.settlementSensors = (await retSettle.json()).data || []
          this.inclinationSensors = (await retCline.json()).data || []
          this.strainSensors = (await retStrain.json()).data || []
          this.dataLoaded = true
        } catch(e) {
          this.settlementSensors = []
          this.inclinationSensors = []
          this.strainSensors = []
          this.dataLoaded = false
        }
        this.srainStatusProcess()
      },
      // 计算整体应变状态
      srainStatusProcess() {
            // 加权和清零，防止累加权使返回错误样式
            this.weightedSum = 0;
            // 存储数据
            const strainResults = [];       
            // 遍历结果，分类存储（仅存储状态不为null的数据）
            this.strainSensors.forEach(result => {
                if (result.状态 === null) return;  // 跳过状态为null的数据
                else if (result["类型"] === "应力计") {
                    strainResults.push(result);
                }                
            });
            // console.log(strainResults,'====================。。。。。。。。。。。');
            // 计算应变值的加权求和
            strainResults.forEach((result, index) => {
              // console.log(result["状态"]);
                if (result["状态"] === 1) {
                    // 提取安装位置编号（如GBC1 → 1）
                    // console.log(result.安装位置);
                    
                    const positionMatch = result.安装位置.match(/GBC(\d+)/);
                    if (positionMatch && positionMatch[1]) {
                        const positionIndex = parseInt(positionMatch[1]) - 1; // 转换为0-based索引
                        // 确保索引在系数数组范围内
                        if (positionIndex >= 0 && positionIndex < this.strainCoefficients.length) {
                            const coefficient = this.strainCoefficients[positionIndex];
                            this.weightedSum += coefficient * (result['状态'] || 0);
                            // console.log(this.weightedSum,result.安装位置,'------------加权和');
                        }
                    }
                }
            });
            // console.log(this.weightedSum,'------------加权和');
            // 返回处理后的结果
            // return weightedSum;
        },

      // 轮播相关方法
      startCarousel() {
        this.stopCarousel();
        this.carouselInterval = setInterval(() => {
          if (this.abnormalSettlementSensors.length > this.maxDisplaySensors) {
            this.settlementCarouselIndex++;
          }
          if (this.abnormalInclinationSensors.length > this.maxDisplaySensors) {
            this.inclinationCarouselIndex++;
          }
        }, 3000); // 每3秒轮播一次
      },
      
      stopCarousel() {
        if (this.carouselInterval) {
          clearInterval(this.carouselInterval);
          this.carouselInterval = null;
        }
      },
      
      // 模拟数据
      // testRingStates() {
      //   // Simulate different states for first three rings
      //   const states = [0, 1];
      //   for (let i = 0; i < 3; i++) {
      //     this.ringStates[i]['状态'] = states[Math.floor(Math.random() * states.length)];
      //   }
      //   // Calculate health state based on the other three states
      //   this.calculateHealthState();
      // },
      
      // 总体健康状态
      calculateHealthState() {
        const states = this.ringStates.slice(0, 2).map(ring => ring['状态']);
        // console.log(states,'===================');
        // Health state logic: if any state is error, health is error
        // Otherwise, health is normal
        if (states.includes('error')) {
          this.ringStates[3]['状态'] = 'error';
        } else {
          this.ringStates[3]['状态'] = this.ringStates[2]['状态'];
        }
      },
      
      // 更新所有状态
      updateRingStates() {
        if (!this.dataLoaded) {
          for (let i = 0; i < this.ringStates.length; i++) {
            this.ringStates[i]['状态'] = 'disconnected';
          }
          return;
        }
        // 计算倾角计状态
        this.ringStates[0]['状态'] = this.hasInclinationError ? 'error' : 'normal';
        // 计算沉降仪状态
        this.ringStates[1]['状态'] = this.hasSettlementError ? 'error' : 'normal';
        // 计算应变计状态
        if (this.weightedSum >= 0 && this.weightedSum < 1040.376764200341) {
            this.ringStates[2]['状态'] = 'normal'
        }
        else if (this.weightedSum >= 1040.376764200341 && this.weightedSum < 3121.1302926010226) {
            this.ringStates[2]['状态'] = 'warning'
        }
        else if (this.weightedSum >= 3121.1302926010226 && this.weightedSum < 7282.6373494023865) {
            this.ringStates[2]['状态'] = "alarm"
        }
        else {
            this.ringStates[2]['状态'] = "error"
        }

        this.calculateHealthState();
      },
      // 获取雷达的数据
      async getRaderData(){
        try {
          const raderData = await fetch(RADAR_SURFACE);
          this.realLeverl = (await raderData.json()).data.average_height
        } catch(e) {
          console.error('雷达数据获取失败:', e);
          this.realLeverl = null;
        }
      },
      // 渲染颜色等级
      getLevelClass() {
        if(this.realLeverl){
          this.materialLevel = this.realLeverl
          if (this.materialLevel < 27 ) {
            return 'level-green';
          } else {
             if (!this._notifyActive) {
               this._notifyActive = true;
               Notification({
                title: "警告",
                message: `灰库平均料位已超出27米，有爆仓风险，请前往雷达或评估模块查看详情`,
                type: "warning",
                duration: 60000,
                position: 'top-left',
                onClose: () => { this._notifyActive = false; },
              });
             }
            return 'level-red';
          }
        } else {
          if (!this._notifyActive) {
            this._notifyActive = true;
            Notification({
                title: "警告",
                message: `雷达故障或被埋，请注意排查`,
                type: "warning",
                duration: 60000,
                position: 'top-left',
                onClose: () => { this._notifyActive = false; },
            });
          }
          return 'level-red'
        }

      }
    
    },
};
</script>

<style lang="less" scoped>
.assess {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 10%;
    // transform: translate(-120%, -30%);
    display: flex;
    flex-direction: row;
    align-items: center;
    // justify-content: center;
    gap: 10vw;
    
    .container-left{
      background-image: url(@/assets/image/BG@2x.png);
      opacity: 0.9;
      width: 30%;
      height: 80%;
      z-index: 2000;
      border: 0.05vw solid rgba(64, 158, 255, 0.6);
      border-radius: 0.4vw;
      position: relative;
      overflow: visible !important;
      display: flex;
      flex-direction: column;
      align-items: center;
      // justify-content: space-between;
      gap: 2vh;
      
      // Top border decoration
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 0.15vw;
        background: linear-gradient(90deg, 
          rgba(64, 158, 255, 0.8) 0%, 
          #409eff 30%, 
          rgba(64, 158, 255, 0.9) 50%, 
          #409eff 70%, 
          rgba(64, 158, 255, 0.8) 100%);
        box-shadow: 
          0 0 0.5vw rgba(64, 158, 255, 0.6),
          0 0 1vw rgba(64, 158, 255, 0.4),
          0 0 1.5vw rgba(64, 158, 255, 0.2);
        z-index: 10;
        animation: borderGlow 2s ease-in-out infinite alternate;
      }
      
      // Corner decorations
      &::after {
        content: '';
        position: absolute;
        top: 0.4vw;
        left: 0.4vw;
        width: 1.25vw;
        height: 1.25vw;
        border-top: 0.15vw solid #409eff;
        border-left: 0.15vw solid #409eff;
        box-shadow: 
          0 0 0.4vw rgba(64, 158, 255, 0.5),
          inset 0 0 0.25vw rgba(64, 158, 255, 0.2);
        z-index: 10;
      }
      
      // Top right corner
      .corner-top-right {
        position: absolute;
        top: 0.4vw;
        right: 0.4vw;
        width: 1.25vw;
        height: 1.25vw;
        border-top: 0.15vw solid #409eff;
        border-right: 0.15vw solid #409eff;
        box-shadow: 
          0 0 0.4vw rgba(64, 158, 255, 0.5),
          inset 0 0 0.25vw rgba(64, 158, 255, 0.2);
        z-index: 10;
      }
      
      // Tech grid background
      & {
        background-image: 
          url(@/assets/image/BG@2x.png),
          linear-gradient(rgba(64, 158, 255, 0.1) 0.05vw, transparent 0.05vw),
          linear-gradient(90deg, rgba(64, 158, 255, 0.1) 0.05vw, transparent 0.05vw);
        background-size: cover, 1vw 1vw, 1vw 1vw;
        background-position: center, center, center;
        background-repeat: no-repeat, repeat, repeat;
      }
      
      // Tech glow effect
      & {
        box-shadow: 
          0 0 0.75vw rgba(64, 158, 255, 0.4),
          inset 0 0 1.5vw rgba(64, 158, 255, 0.1),
          0 0.2vw 1vw rgba(0, 0, 0, 0.5),
          inset 0 0 3vw rgba(64, 158, 255, 0.05);
      }

      .container-left-content{
        // padding-top: 1vh;
        flex:0.06;
        z-index: 3;
        h2{
          margin: 0;
          padding-top: 1.5vh;
          font-size: 1.2vw;
          color: rgba(255, 255, 255, 1);
          text-shadow: 
            0 0 0.4vw rgba(64, 158, 255, 0.8),
            0 0 0.75vw rgba(64, 158, 255, 0.6),
            0 0 1vw rgba(64, 158, 255, 0.4);
          font-family: 'Arial', sans-serif;
          letter-spacing: 0.05vw;
          position: relative;
        
        }
      }

      .container-left-state{
        flex:0.38;
        width: 100%;
        height: 100%;
        z-index: 3;
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: visible !important;
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 0.1vw;
          background: linear-gradient(90deg, transparent, #409eff, transparent);
          box-shadow: 0 0 0.5vw rgba(64, 158, 255, 0.5);
        }
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 0.1vw;
          background: linear-gradient(90deg, transparent, #409eff, transparent);
          box-shadow: 0 0 0.5vw rgba(64, 158, 255, 0.5);
        }
        
        .state-heading{
          text-align: center;
          padding: 0.25vw 0;
          
          h3{
            margin: 0;
            font-size: 1vw;
            color: rgba(255, 255, 255, 0.9);
            text-shadow: 
              0 0 0.25vw rgba(64, 158, 255, 0.5),
              0 0 0.5vw rgba(64, 158, 255, 0.3);
            font-family: 'Arial', sans-serif;
            letter-spacing: 0.05vw;
            position: relative;
            
            &::after {
              content: '';
              position: absolute;
              bottom: -0.1vw;
              left: 50%;
              transform: translateX(-50%);
              width: 50%;
              height: 0.1vw;
              background: linear-gradient(90deg, transparent, #409eff, transparent);
              border-radius: 0.05vw;
            }
          }
        }
        
        .ring-container{
          flex: 1;
          // height: 90%;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          gap: 0.9vw;
        }
        
        .ring-item{
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5vw;
          flex: 1;
          position: relative;
          cursor: pointer;
          overflow: visible !important;
          .status-tooltip {
            position: absolute;
            top: 100%;
            left: 100%;
            margin-top: 0.5vw;
            margin-left: 0.5vw;
            transform: none;
            background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 30, 60, 0.95));
            border: 1px solid rgba(64, 158, 255, 0.8);
            border-radius: 6px;
            padding: 0.75vw;
            font-size: 0.8vw;
            color: rgba(255, 255, 255, 0.95);
            white-space: normal;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 9; /* 提高z-index确保不被覆盖 */
            box-shadow: 
              0 0 1.5vw rgba(64, 158, 255, 0.6),
              inset 0 0 1vw rgba(64, 158, 255, 0.1);
            backdrop-filter: blur(5px);
            border-left: 3px solid #409eff;
            text-align: left;
            min-width: 16vw;
            max-width: 25vw;
            min-height: 12vw;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-sizing: border-box;
            gap: 0.5vw;
          }
          
          &:hover .status-tooltip {
            opacity: 1;
            visibility: visible;
            transform: translate(-5vw,-0.25vw);
          }
          
          .ring{
            position: relative;
            width: 4vw;
            height: 4vw;
            display: flex;
            align-items: center;
            justify-content: center;

            &::before{
              content: '';
              position: absolute;
              width: 100%;
              height: 100%;
              border: 0.25vw solid rgba(64, 158, 255, 0.3);
              border-radius: 50%;
              box-shadow: 0 0 0.75vw rgba(64, 158, 255, 0.2);
            }

            .ring-inner{
              width: 2.8vw;
              height: 2.8vw;
              background: rgba(0, 20, 40, 0.8);
              border-radius: 50%;
              border: 0.1vw solid rgba(64, 158, 255, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              z-index: 2;
            }
            
            .ring-progress{
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 0.25vw solid transparent;
              border-top: 0.25vw solid #409eff;
              animation: spin 3s linear infinite;
              z-index: 1;
            }
          }
          
          .ring-label{
            font-size: 0.8vw;
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
            text-shadow: 0 0 0.25vw rgba(64, 158, 255, 0.5);
          }
          
          // Special styling for health state ring
          &.health-ring {
            flex: 1; // Make it slightly larger
            
            .ring{
              width: 4.8vw;
              height: 4.8vw;
              
              &::before{
                border: 0.3vw solid rgba(64, 158, 255, 0.5);
                box-shadow: 0 0 1vw rgba(64, 158, 255, 0.4);
              }
              
              .ring-inner{
                width: 3.5vw;
                height: 3.5vw;
                border: 0.15vw solid rgba(64, 158, 255, 0.8);
                background: rgba(0, 30, 60, 0.9);
              }
              
              .ring-progress{
                border: 0.3vw solid transparent;
                border-top: 0.3vw solid #409eff;
                box-shadow: 0 0 1vw rgba(64, 158, 255, 0.6);
              }
            }
            
            .ring-label{
              font-size: 0.9vw;
              font-weight: bold;
              color: rgba(255, 255, 255, 0.95);
              text-shadow: 
                0 0 0.25vw rgba(64, 158, 255, 0.8),
                0 0 0.5vw rgba(64, 158, 255, 0.5);
            }
            .status-tooltip {
              width: 14vw;
              white-space: normal;
              text-align: center;
              padding: 1vw;
              bottom: -6vw;
            }
            
            &.normal .status-tooltip {
              border-color: #67c23a;
              border-left-color: #67c23a;
              box-shadow: 
                0 0 1.5vw rgba(103, 194, 58, 0.6),
                inset 0 0 1vw rgba(103, 194, 58, 0.1);
            }
            &.warning .status-tooltip{
              border-color: #fcec09;
              border-left-color: #fcec09;
              box-shadow: 
                0 0 1.5vw rgba(245, 231, 108, 0.6),
                inset 0 0 1vw rgba(245, 108, 108, 0.1);
            }

            &.alarm .status-tooltip {
              border-color: #ff7b00;
              border-left-color: #ff7b00;
              box-shadow: 
                0 0 1.5vw rgba(241, 163, 46, 0.6),
                inset 0 0 1vw rgba(245, 108, 108, 0.1);
            }          
            &.error .status-tooltip {
              border-color: #f56c6c;
              border-left-color: #f56c6c;
              box-shadow: 
                0 0 1.5vw rgba(245, 108, 108, 0.6),
                inset 0 0 1vw rgba(245, 108, 108, 0.1);
            }
            
          }
          
          &.normal .ring .ring-progress {
            border: 0.25vw solid transparent;
            border-top: 0.25vw solid #67c23a;
            box-shadow: 0 0 0.75vw rgba(103, 194, 58, 0.5);
          }
          &.warning .ring .ring-progress {
            border: 0.25vw solid transparent;
            border-top: 0.25vw solid#fcec09;
            box-shadow: 
              0 0 1.5vw rgba(245, 231, 108, 0.6),
              inset 0 0 1vw rgba(245, 108, 108, 0.1);
          }

          &.alarm .ring .ring-progress {
            border: 0.25vw solid transparent;
            border-top: 0.25vw solid #ff7b00;
            box-shadow: 
              0 0 1.5vw rgba(241, 163, 46, 0.6),
              inset 0 0 1vw rgba(245, 108, 108, 0.1);
          }

          &.error .ring .ring-progress {
            border: 0.25vw solid transparent;
            border-top: 0.25vw solid #f56c6c;
            box-shadow: 0 0 0.75vw rgba(245, 108, 108, 0.5);
          }
          // Health ring state styles
          &.health-ring.normal .ring .ring-progress {
            border: 0.3vw solid transparent;
            border-top: 0.3vw solid #67c23a;
            box-shadow: 0 0 1vw rgba(103, 194, 58, 0.6);
          }
          &.health-ring.warning .ring .ring-progress {
            order: 0.3vw solid transparent;
            border-top: 0.3vw solid #fcec09;
            box-shadow: 
              0 0 1.5vw rgba(245, 231, 108, 0.6),
              inset 0 0 1vw rgba(245, 108, 108, 0.1);
          }

          &.health-ring.alarm .ring .ring-progress {
            border: 0.3vw solid transparent;
            border-top: 0.3vw solid #ff7b00;
            box-shadow: 
              0 0 1.5vw rgba(241, 163, 46, 0.6),
              inset 0 0 1vw rgba(245, 108, 108, 0.1);
          }

          &.health-ring.error .ring .ring-progress {
            border: 0.3vw solid transparent;
            border-top: 0.3vw solid #f56c6c;
            box-shadow: 0 0 1vw rgba(245, 108, 108, 0.6);
          }
        }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .container-left-warning{
        flex:0.5;
        width: 90%;
        height: 100%;
        background-image: url(@/assets/image/card_bg.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        z-index: 1;
        display: flex;
        flex-direction: column;
        
        .warning-heading{
          text-align: center;
          padding: 0.25vw 0;
          
          h3{
            margin: 0;
            font-size: 1vw;
            color: rgba(255, 255, 255, 0.85);
            text-shadow: 
              0 0 0.25vw rgba(64, 158, 255, 0.5),
              0 0 0.5vw rgba(64, 158, 255, 0.3);
            font-family: 'Arial', sans-serif;
            letter-spacing: 0.05vw;
            position: relative;
            
            &::after {
              content: '';
              position: absolute;
              bottom: -0.1vw;
              left: 50%;
              transform: translateX(-50%);
              width: 50%;
              height: 0.1vw;
              background: linear-gradient(90deg, transparent, #409eff, transparent);
              border-radius: 0.05vw;
            }
          }
        }
        
        .warning-content{
          flex: 1;
          padding: 0.5vw;
          // bottom: 0.5vw;
          overflow-y: auto;
        }
        
        .warning-section{
          margin-bottom: 0.5vw;
          padding: 0.4vw;
          background: rgba(0, 20, 40, 0.5);
          border-radius: 0.2vw;
          border-left: 0.1vw solid #409eff;
        }

        .section-title{
          font-size: 0.9vw;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 0.4vw;
          padding-bottom: 0.2vw;
          border-bottom: 0.05vw solid rgba(64, 158, 255, 0.3);
          font-weight: bold;
        }
        
        .sensor-list{
          display: flex;
          flex-direction: column;
          gap: 0.3vw;
          position: relative;
          min-height: 6vh;
          overflow: hidden;
        }
        
        
        .sensor-item{
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.2vw 0.4vw;
          background: rgba(0, 30, 60, 0.3);
          border-radius: 0.15vw;
          font-size: 0.8vw;
          animation: slideDown 0.5s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-0.1vw);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .sensor-id{
          color: rgba(255, 255, 255, 0.8);
          flex: 1;
        }
        
        .sensor-status{
          color: rgba(255, 255, 255, 0.7);
          flex: 1;
          
          &.normal {
            color: #67c23a;
          }
          
          &.error {
            color: #f56c6c;
          }
        }
        
        .status-dot{
          width: 0.4vw;
          height: 0.4vw;
          border-radius: 50%;
          background: #67c23a;
          
          &.normal {
            background: #67c23a;
            box-shadow: 0 0 0.25vw rgba(103, 194, 58, 0.6);
          }
          
          &.error {
            background: #f56c6c;
            box-shadow: 0 0 0.25vw rgba(245, 108, 108, 0.6);
          }
        }
        
        .stress-info{
          padding: 0.5vw;
          background: rgba(0, 30, 60, 0.3);
          border-radius: 0.15vw;
          border-left: 0.15vw solid #f56c6c;
        }
        
        .stress-text{
          font-size: 0.8vw;
          color: #f56c6c;
          text-shadow: 0 0 0.25vw rgba(245, 108, 108, 0.5);
        }
        
        .no-abnormal{
          text-align: center;
          padding: 0.75vw;
          color: #67c23a;
          font-size: 0.9vw;
          text-shadow: 0 0 0.25vw rgba(103, 194, 58, 0.5);

          &.no-data {
            color: #f56c6c;
            text-shadow: 0 0 0.25vw rgba(245, 108, 108, 0.5);
          }
        }
      }
    }
    .container-right{
      background-image: 
        url(@/assets/image/BG@2x.png),
        linear-gradient(rgba(64, 158, 255, 0.1) 0.05vw, transparent 0.05vw),
        linear-gradient(90deg, rgba(64, 158, 255, 0.1) 0.05vw, transparent 0.05vw);
      background-size: cover, 0.5vw 0.5vw, 0.5vw 0.5vw;
      background-position: center, center, center;
      background-repeat: no-repeat, repeat, repeat;
      opacity: 0.9;
      width: 30%;
      height: 80%;
      z-index: 1;
      border: 0.05vw solid rgba(64, 158, 255, 0.6);
      border-radius: 0.4vw;
      box-shadow: 
        0 0 0.75vw rgba(64, 158, 255, 0.4),
        inset 0 0 1.5vw rgba(64, 158, 255, 0.1),
        0 0.2vw 0.5vw rgba(0, 0, 0, 0.5),
        inset 0 0 3vw rgba(64, 158, 255, 0.05);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .container-right-content{
        flex:0.1;
        z-index: 3;
        h2{
          margin: 0;
          padding-top: 1.5vh;
          padding-bottom: 1.2vh;
          font-size: 1.2vw;
          color: rgba(255, 255, 255, 1);
          text-shadow: 
            0 0 0.4vw rgba(64, 158, 255, 0.8),
            0 0 0.75vw rgba(64, 158, 255, 0.6),
            0 0 1vw rgba(64, 158, 255, 0.4);
          font-family: 'Arial', sans-serif;
          letter-spacing: 0.05vw;
          position: relative;
          text-align: center;
          &::after {
            content: '';
            position: absolute;
            bottom: -0.6vw;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            height: 0.1vw;
            background: linear-gradient(90deg, transparent, #409eff, transparent);
            border-radius: 0.05vw;
          }
        }
        
      }
      
      .container-right-show{
        flex:0.8;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 1vw;
        gap: 5vh;
        
      }
      
      .level-info{
        margin-bottom: 2vh;
        align-self: flex-start;
      }
      
      .level-container{
        display: flex;
        align-items: center;
        gap: 1vw;
        width: 100%;
        height: 80%;
      }
      
      .scale-container{
        position: relative;
        width: 3vw;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      
      .fixed-scale{
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
      }
      
      .scale-item{
        position: absolute;
        left: 0;
        width: 100%;
        text-align: right;
        padding-right: 0.25vw;
        font-size: 1vw;
        color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
      
      .scale-item span::after {
        content: 'm';
        margin-left: 0.1vw;
        font-size: 0.8vw;
      }
      
      .current-scale{
        position: absolute;
        left: 0;
        width: 100%;
        text-align: right;
        padding-right: 0.25vw;
        font-size: 0.8vw;
        color: rgba(255, 255, 255, 1);
        text-shadow: 0 0 0.4vw rgba(64, 158, 255, 1);
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
      
      .current-scale span::after {
        content: 'm';
        margin-left: 0.1vw;
        font-size: 0.6;
      }
      
      .level-cylinder{
        position: relative;
        width: 80%;
        height: 100%;
        border: 0.1vw solid rgba(64, 158, 255, 0.6);
        border-radius: 0.5vw;
        background: rgba(0, 30, 60, 0.2);
        overflow: hidden;
        box-shadow: 
          0 0 0.75vw rgba(64, 158, 255, 0.4),
          inset 0 0 1.5vw rgba(64, 158, 255, 0.1);
      }
      
      .fixed-scale-line{
        position: absolute;
        left: 0;
        right: 0;
        height: 0.05vw;
        background: transparent;
        border-top: 0.05vw dashed rgba(64, 158, 255, 0.3);
        border-spacing: 0.5vw;
        background-image: linear-gradient(to right, rgba(64, 158, 255, 0.3) 0.25vw, transparent 0.25vw);
        background-size: 0.5vw 0.05vw;
      }
      
      .level-shadow{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: repeating-linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.1) 0.5vw,
          rgba(255, 255, 255, 0.05) 0.5vw,
          rgba(255, 255, 255, 0.05) 1vw
        );
        transition: height 0.5s ease;
      }
      
      .level-green{
        background: linear-gradient(to top, rgba(103, 194, 58, 0.6), rgba(103, 194, 58, 0.2));
        box-shadow: inset 0 0 1vw rgba(103, 194, 58, 0.4);
      }
      
      .level-blue{
        background: linear-gradient(to top, rgba(64, 158, 255, 0.6), rgba(64, 158, 255, 0.2));
        box-shadow: inset 0 0 1vw rgba(64, 158, 255, 0.4);
      }
      
      .level-yellow{
        background: linear-gradient(to top, rgba(230, 162, 60, 0.6), rgba(230, 162, 60, 0.2));
        box-shadow: inset 0 0 1vw rgba(230, 162, 60, 0.4);
      }
      
      .level-orange{
        background: linear-gradient(to top, rgba(247, 127, 0, 0.6), rgba(247, 127, 0, 0.2));
        box-shadow: inset 0 0 1vw rgba(247, 127, 0, 0.4);
      }
      
      .level-red{
        background: linear-gradient(to top, rgba(245, 108, 108, 0.6), rgba(245, 108, 108, 0.2));
        box-shadow: inset 0 0 1vw rgba(245, 108, 108, 0.4);
      }
      
      .level-line{
        position: absolute;
        left: 0;
        right: 0;
        height: 0.1vw;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 0.5vw rgba(255, 255, 255, 0.8), 0 0 1vw rgba(255, 255, 255, 0.5);
        transition: bottom 0.5s ease;
      }
      
      .level-info{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5vw;
      }
      
      .level-value{
        font-size: 1.25vw;
        font-weight: bold;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 0 0.5vw rgba(64, 158, 255, 0.8);
      }
      
      .level-label{
        font-size: 1.1vw;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 0 0.25vw rgba(64, 158, 255, 0.6);
      }

      // Top border decoration
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 0.15vw;
        background: linear-gradient(90deg, 
          rgba(64, 158, 255, 0.8) 0%, 
          #409eff 30%, 
          rgba(64, 158, 255, 0.9) 50%, 
          #409eff 70%, 
          rgba(64, 158, 255, 0.8) 100%);
        box-shadow: 
          0 0 0.5vw rgba(64, 158, 255, 0.6),
          0 0 1vw rgba(64, 158, 255, 0.4),
          0 0 1.5vw rgba(64, 158, 255, 0.2);
        z-index: 10;
        animation: borderGlow 2s ease-in-out infinite alternate;
      }
      
      // Corner decorations
      &::after {
        content: '';
        position: absolute;
        top: 0.4vw;
        left: 0.4vw;
        width: 1.25vw;
        height: 1.25vw;
        border-top: 0.15vw solid #409eff;
        border-left: 0.15vw solid #409eff;
        box-shadow: 
          0 0 0.4vw rgba(64, 158, 255, 0.5),
          inset 0 0 0.25vw rgba(64, 158, 255, 0.2);
        z-index: 10;
      }
      
      // Top right corner
      .corner-top-right {
        position: absolute;
        top: 0.4vw;
        right: 0.4vw;
        width: 1.25vw;
        height: 1.25vw;
        border-top: 0.15vw solid #409eff;
        border-right: 0.15vw solid #409eff;
        box-shadow: 
          0 0 0.4vw rgba(64, 158, 255, 0.5),
          inset 0 0 0.25vw rgba(64, 158, 255, 0.2);
        z-index: 10;
      }
    }
    
    @keyframes scan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes borderGlow {
      0% { 
        opacity: 0.7;
        box-shadow: 
          0 0 0.5vw rgba(64, 158, 255, 0.4),
          0 0 1vw rgba(64, 158, 255, 0.2);
      }
      100% { 
        opacity: 1;
        box-shadow: 
          0 0 0.75vw rgba(64, 158, 255, 0.8),
          0 0 1.5vw rgba(64, 158, 255, 0.5),
          0 0 2.25vw rgba(64, 158, 255, 0.3);
      }
    }
}
</style>