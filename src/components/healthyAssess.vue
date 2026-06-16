<template>
<section class="assess" v-if="assessData.show">
    <!-- <p>{{monitorData.name}}</p> -->
    <div class="container-left">
      <div class="corner-top-right"></div>
      <div class="container-left-content">
        <h2>钢板仓健康安全融合评估与决策</h2>
      </div>
      <div class="container-left-state">
        <div class="state-heading">
          <h3>安全评估</h3>
        </div>
        <div class="ring-container">
          <div class="ring-item" :class="[ring.state, { 'health-ring': ring.isHealth }]" v-for="(ring, index) in ringStates" :key="index">
            <div class="ring">
              <div class="ring-inner"></div>
              <div class="ring-progress"></div>
            </div>
            <div class="ring-label">{{ ring.label }}</div>
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
                <span class="sensor-id">{{ sensor.id }}</span>
                <span class="sensor-status" :class="sensor.status">异常</span>
                <span class="status-dot" :class="sensor.status"></span>
              </div>
              <div class="no-abnormal" v-if="abnormalSettlementSensors.length === 0">
                <span>传感器无异常</span>
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
                <span class="sensor-id">{{ sensor.id }}</span>
                <span class="sensor-status" :class="sensor.status">异常</span>
                <span class="status-dot" :class="sensor.status"></span>
              </div>
              <div class="no-abnormal" v-if="abnormalInclinationSensors.length === 0">
                <span>传感器无异常</span>
              </div>
            </div>
          </div>
          
          <!-- 应力计 -->
          <div class="warning-section">
            <div class="section-title">
              <span>应力计</span>
            </div>
            <div class="stress-info">
              <span class="stress-text">异常见孪生模型</span>
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
              <span>{{ materialLevel }}</span>
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
import EventBus from '@/bus';
export default {
    name: 'healthyAssess',
    data() {
        return {
          assessData:{
            show:false,
            name:'',
          },
          ringStates: [
            { label: '倾角', state: 'normal' },
            { label: '沉降', state: 'normal' },
            { label: '应变', state: 'normal' },
            { label: '仓体健康状态', state: 'normal', isHealth: true }
          ],
          // 模拟传感器数据
          settlementSensors: [
            { id: 'S001', status: 'normal' },
            { id: 'S002', status: 'normal' },
            { id: 'S003', status: 'normal' },
            { id: 'S004', status: 'normal' },
            { id: 'S005', status: 'normal' },
            { id: 'S006', status: 'normal' }
          ],
          inclinationSensors: [
            { id: 'I001', status: 'normal' },
            { id: 'I002', status: 'normal' },
            { id: 'I003', status: 'error' },
            { id: 'I004', status: 'error' },
            { id: 'I005', status: 'error' }
          ],
          // 轮播相关数据
          settlementCarouselIndex: 0,
          inclinationCarouselIndex: 0,
          carouselInterval: null,
          maxDisplaySensors: 2, // 每种传感器最多显示2列
          // 料位相关数据
          materialLevel: 3, // 模拟料位值
         
        };
    },
     components:{ 
      
    },
    watch: {
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
      }
    },
     computed: {
      abnormalSettlementSensors() {
        return this.settlementSensors.filter(sensor => sensor.status !== 'normal');
      },
      abnormalInclinationSensors() {
        return this.inclinationSensors.filter(sensor => sensor.status !== 'normal');
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
    mounted() {
      EventBus.$on('healthassessUI', this.updateAssess);
      this.startCarousel();
      this.updateRingStates();
    },
    beforeDestroy() {
      EventBus.$off('healthassessUI', this.updateAssess);
      this.stopCarousel();
    },
    methods: {
      updateAssess(data){
        // console.log(1);
        this.assessData.show = data.show;
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
      
      // Test method to change ring states dynamically
      testRingStates() {
        // Simulate different states for first three rings
        const states = ['normal', 'error'];
        for (let i = 0; i < 3; i++) {
          this.ringStates[i].state = states[Math.floor(Math.random() * states.length)];
        }
        // Calculate health state based on the other three states
        this.calculateHealthState();
      },
      
      // Calculate health state based on the other three states
      calculateHealthState() {
        const states = this.ringStates.slice(0, 3).map(ring => ring.state);
        
        // Health state logic: if any state is error, health is error
        // Otherwise, health is normal
        if (states.includes('error')) {
          this.ringStates[3].state = 'error';
        } else {
          this.ringStates[3].state = 'normal';
        }
      },
      
      // Update ring states based on sensor data
      updateRingStates() {
        // Update inclination state (first ring)
        this.ringStates[0].state = this.hasInclinationError ? 'error' : 'normal';
        // Update settlement state (second ring)
        this.ringStates[1].state = this.hasSettlementError ? 'error' : 'normal';
        // Calculate health state based on updated states
        this.calculateHealthState();
      },
      
      // Get CSS class for material level based on value
      getLevelClass() {
        if (this.materialLevel < 5) {
          return 'level-green';
        } else if (this.materialLevel < 10) {
          return 'level-blue';
        } else if (this.materialLevel < 20) {
          return 'level-yellow';
        } else if (this.materialLevel < 30) {
          return 'level-orange';
        } else {
          return 'level-red';
        }
      }
    
    }
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
      border: 1px solid rgba(64, 158, 255, 0.6);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
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
        height: 3px;
        background: linear-gradient(90deg, 
          rgba(64, 158, 255, 0.8) 0%, 
          #409eff 30%, 
          rgba(64, 158, 255, 0.9) 50%, 
          #409eff 70%, 
          rgba(64, 158, 255, 0.8) 100%);
        box-shadow: 
          0 0 10px rgba(64, 158, 255, 0.6),
          0 0 20px rgba(64, 158, 255, 0.4),
          0 0 30px rgba(64, 158, 255, 0.2);
        z-index: 10;
        animation: borderGlow 2s ease-in-out infinite alternate;
      }
      
      // Corner decorations
      &::after {
        content: '';
        position: absolute;
        top: 8px;
        left: 8px;
        width: 25px;
        height: 25px;
        border-top: 3px solid #409eff;
        border-left: 3px solid #409eff;
        box-shadow: 
          0 0 8px rgba(64, 158, 255, 0.5),
          inset 0 0 5px rgba(64, 158, 255, 0.2);
        z-index: 10;
      }
      
      // Top right corner
      .corner-top-right {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 25px;
        height: 25px;
        border-top: 3px solid #409eff;
        border-right: 3px solid #409eff;
        box-shadow: 
          0 0 8px rgba(64, 158, 255, 0.5),
          inset 0 0 5px rgba(64, 158, 255, 0.2);
        z-index: 10;
      }
      
      // Tech grid background
      & {
        background-image: 
          url(@/assets/image/BG@2x.png),
          linear-gradient(rgba(64, 158, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(64, 158, 255, 0.1) 1px, transparent 1px);
        background-size: cover, 20px 20px, 20px 20px;
        background-position: center, center, center;
        background-repeat: no-repeat, repeat, repeat;
      }
      
      // Tech glow effect
      & {
        box-shadow: 
          0 0 15px rgba(64, 158, 255, 0.4),
          inset 0 0 30px rgba(64, 158, 255, 0.1),
          0 4px 20px rgba(0, 0, 0, 0.5),
          inset 0 0 60px rgba(64, 158, 255, 0.05);
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
            0 0 8px rgba(64, 158, 255, 0.8),
            0 0 15px rgba(64, 158, 255, 0.6),
            0 0 20px rgba(64, 158, 255, 0.4);
          font-family: 'Arial', sans-serif;
          letter-spacing: 1px;
          position: relative;
          
          // &::after {
          //   content: '';
          //   position: absolute;
          //   bottom: -7px;
          //   left: 50%;
          //   transform: translateX(-50%);
          //   width: 100%;
          //   height: 2px;
          //   background: linear-gradient(90deg, transparent, #409eff, transparent);
          //   border-radius: 1px;
          // }
        }
      }

      .container-left-state{
        flex:0.42;
        width: 100%;
        height: 100%;
        z-index: 3;
        position: relative;
        display: flex;
        flex-direction: column;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #409eff, transparent);
          box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
        }
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #409eff, transparent);
          box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
        }
        
        .state-heading{
          text-align: center;
          padding: 5px 0;
          
          h3{
            margin: 0;
            font-size: 1vw;
            color: rgba(255, 255, 255, 0.9);
            text-shadow: 
              0 0 5px rgba(64, 158, 255, 0.5),
              0 0 10px rgba(64, 158, 255, 0.3);
            font-family: 'Arial', sans-serif;
            letter-spacing: 1px;
            position: relative;
            
            &::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 50%;
              height: 1px;
              background: linear-gradient(90deg, transparent, #409eff, transparent);
              border-radius: 1px;
            }
          }
        }
        
        .ring-container{
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          gap: 20px;
        }
        
        .ring-item{
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex: 1;
          
          .ring{
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &::before{
              content: '';
              position: absolute;
              width: 100%;
              height: 100%;
              border: 5px solid rgba(64, 158, 255, 0.3);
              border-radius: 50%;
              box-shadow: 0 0 15px rgba(64, 158, 255, 0.2);
            }
            
            .ring-inner{
              width: 56px;
              height: 56px;
              background: rgba(0, 20, 40, 0.8);
              border-radius: 50%;
              border: 2px solid rgba(64, 158, 255, 0.5);
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
              border: 5px solid transparent;
              border-top: 5px solid #409eff;
              animation: spin 3s linear infinite;
              z-index: 1;
            }
          }
          
          .ring-label{
            font-size: 0.8vw;
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
            text-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
          }
          
          // Special styling for health state ring
          &.health-ring {
            flex: 1.2; // Make it slightly larger
            
            .ring{
              width: 90px;
              height: 90px;
              
              &::before{
                border: 6px solid rgba(64, 158, 255, 0.5);
                box-shadow: 0 0 20px rgba(64, 158, 255, 0.4);
              }
              
              .ring-inner{
                width: 62px;
                height: 62px;
                border: 3px solid rgba(64, 158, 255, 0.8);
                background: rgba(0, 30, 60, 0.9);
              }
              
              .ring-progress{
                border: 6px solid transparent;
                border-top: 6px solid #409eff;
                box-shadow: 0 0 20px rgba(64, 158, 255, 0.6);
              }
            }
            
            .ring-label{
              font-size: 0.9vw;
              font-weight: bold;
              color: rgba(255, 255, 255, 0.95);
              text-shadow: 
                0 0 5px rgba(64, 158, 255, 0.8),
                0 0 10px rgba(64, 158, 255, 0.5);
            }
          }
          
          &.normal .ring .ring-progress {
            border: 5px solid transparent;
            border-top: 5px solid #67c23a;
            box-shadow: 0 0 15px rgba(103, 194, 58, 0.5);
          }
          
          &.error .ring .ring-progress {
            border: 5px solid transparent;
            border-top: 5px solid #f56c6c;
            box-shadow: 0 0 15px rgba(245, 108, 108, 0.5);
          }
          
          // Health ring state styles
          &.health-ring.normal .ring .ring-progress {
            border: 6px solid transparent;
            border-top: 6px solid #67c23a;
            box-shadow: 0 0 20px rgba(103, 194, 58, 0.6);
          }
          
          &.health-ring.error .ring .ring-progress {
            border: 6px solid transparent;
            border-top: 6px solid #f56c6c;
            box-shadow: 0 0 20px rgba(245, 108, 108, 0.6);
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
        z-index: 3;
        display: flex;
        flex-direction: column;
        
        .warning-heading{
          text-align: center;
          padding: 5px 0;
          
          h3{
            margin: 0;
            font-size: 1vw;
            color: rgba(255, 255, 255, 0.85);
            text-shadow: 
              0 0 5px rgba(64, 158, 255, 0.5),
              0 0 10px rgba(64, 158, 255, 0.3);
            font-family: 'Arial', sans-serif;
            letter-spacing: 1px;
            position: relative;
            
            &::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 50%;
              height: 1px;
              background: linear-gradient(90deg, transparent, #409eff, transparent);
              border-radius: 1px;
            }
          }
        }
        
        .warning-content{
          flex: 1;
          padding: 10px;
          overflow-y: auto;
        }
        
        .warning-section{
          margin-bottom: 15px;
          padding: 8px;
          background: rgba(0, 20, 40, 0.5);
          border-radius: 4px;
          border-left: 2px solid #409eff;
        }
        
        .section-title{
          font-size: 0.9vw;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(64, 158, 255, 0.3);
          font-weight: bold;
        }
        
        .sensor-list{
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          min-height: 6vh;
          overflow: hidden;
        }
        
        
        .sensor-item{
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          background: rgba(0, 30, 60, 0.3);
          border-radius: 3px;
          font-size: 0.8vw;
          animation: slideDown 0.5s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
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
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #67c23a;
          
          &.normal {
            background: #67c23a;
            box-shadow: 0 0 5px rgba(103, 194, 58, 0.6);
          }
          
          &.error {
            background: #f56c6c;
            box-shadow: 0 0 5px rgba(245, 108, 108, 0.6);
          }
        }
        
        .stress-info{
          padding: 10px;
          background: rgba(0, 30, 60, 0.3);
          border-radius: 3px;
          border-left: 3px solid #f56c6c;
        }
        
        .stress-text{
          font-size: 0.8vw;
          color: #f56c6c;
          text-shadow: 0 0 5px rgba(245, 108, 108, 0.5);
        }
        
        .no-abnormal{
          text-align: center;
          padding: 15px;
          color: #67c23a;
          font-size: 0.9vw;
          text-shadow: 0 0 5px rgba(103, 194, 58, 0.5);
        }
      }
    }
    .container-right{
      background-image: 
        url(@/assets/image/BG@2x.png),
        linear-gradient(rgba(64, 158, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(64, 158, 255, 0.1) 1px, transparent 1px);
      background-size: cover, 20px 20px, 20px 20px;
      background-position: center, center, center;
      background-repeat: no-repeat, repeat, repeat;
      opacity: 0.9;
      width: 30%;
      height: 80%;
      z-index: 2000;
      border: 1px solid rgba(64, 158, 255, 0.6);
      border-radius: 8px;
      box-shadow: 
        0 0 15px rgba(64, 158, 255, 0.4),
        inset 0 0 30px rgba(64, 158, 255, 0.1),
        0 4px 20px rgba(0, 0, 0, 0.5),
        inset 0 0 60px rgba(64, 158, 255, 0.05);
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
          font-size: 1.2vw;
          color: rgba(255, 255, 255, 1);
          text-shadow: 
            0 0 8px rgba(64, 158, 255, 0.8),
            0 0 15px rgba(64, 158, 255, 0.6),
            0 0 20px rgba(64, 158, 255, 0.4);
          font-family: 'Arial', sans-serif;
          letter-spacing: 1px;
          position: relative;
          text-align: center;
          &::after {
            content: '';
            position: absolute;
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #409eff, transparent);
            border-radius: 1px;
          }
        }
      }
      
      .container-right-show{
        flex:0.8;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 20px;
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
        padding-right: 5px;
        font-size: 1vw;
        color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
      
      .scale-item span::after {
        content: 'm';
        margin-left: 2px;
        font-size: 0.8vw;
      }
      
      .current-scale{
        position: absolute;
        left: 0;
        width: 100%;
        text-align: right;
        padding-right: 5px;
        font-size: 0.8vw;
        color: rgba(255, 255, 255, 1);
        text-shadow: 0 0 8px rgba(64, 158, 255, 1);
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
      
      .current-scale span::after {
        content: 'm';
        margin-left: 2px;
        font-size: 0.6;
      }
      
      .level-cylinder{
        position: relative;
        width: 80%;
        height: 100%;
        border: 2px solid rgba(64, 158, 255, 0.6);
        border-radius: 10px;
        background: rgba(0, 30, 60, 0.2);
        overflow: hidden;
        box-shadow: 
          0 0 15px rgba(64, 158, 255, 0.4),
          inset 0 0 30px rgba(64, 158, 255, 0.1);
      }
      
      .fixed-scale-line{
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: transparent;
        border-top: 1px dashed rgba(64, 158, 255, 0.3);
        border-spacing: 10px;
        background-image: linear-gradient(to right, rgba(64, 158, 255, 0.3) 5px, transparent 5px);
        background-size: 10px 1px;
      }
      
      .level-shadow{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: repeating-linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.1) 10px,
          rgba(255, 255, 255, 0.05) 10px,
          rgba(255, 255, 255, 0.05) 20px
        );
        transition: height 0.5s ease;
      }
      
      .level-green{
        background: linear-gradient(to top, rgba(103, 194, 58, 0.6), rgba(103, 194, 58, 0.2));
        box-shadow: inset 0 0 20px rgba(103, 194, 58, 0.4);
      }
      
      .level-blue{
        background: linear-gradient(to top, rgba(64, 158, 255, 0.6), rgba(64, 158, 255, 0.2));
        box-shadow: inset 0 0 20px rgba(64, 158, 255, 0.4);
      }
      
      .level-yellow{
        background: linear-gradient(to top, rgba(230, 162, 60, 0.6), rgba(230, 162, 60, 0.2));
        box-shadow: inset 0 0 20px rgba(230, 162, 60, 0.4);
      }
      
      .level-orange{
        background: linear-gradient(to top, rgba(247, 127, 0, 0.6), rgba(247, 127, 0, 0.2));
        box-shadow: inset 0 0 20px rgba(247, 127, 0, 0.4);
      }
      
      .level-red{
        background: linear-gradient(to top, rgba(245, 108, 108, 0.6), rgba(245, 108, 108, 0.2));
        box-shadow: inset 0 0 20px rgba(245, 108, 108, 0.4);
      }
      
      .level-line{
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.5);
        transition: bottom 0.5s ease;
      }
      
      .level-info{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      
      .level-value{
        font-size: 1.25vw;
        font-weight: bold;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 0 10px rgba(64, 158, 255, 0.8);
      }
      
      .level-label{
        font-size: 1.2vw;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 0 5px rgba(64, 158, 255, 0.6);
      }

      // Top border decoration
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, 
          rgba(64, 158, 255, 0.8) 0%, 
          #409eff 30%, 
          rgba(64, 158, 255, 0.9) 50%, 
          #409eff 70%, 
          rgba(64, 158, 255, 0.8) 100%);
        box-shadow: 
          0 0 10px rgba(64, 158, 255, 0.6),
          0 0 20px rgba(64, 158, 255, 0.4),
          0 0 30px rgba(64, 158, 255, 0.2);
        z-index: 10;
        animation: borderGlow 2s ease-in-out infinite alternate;
      }
      
      // Corner decorations
      &::after {
        content: '';
        position: absolute;
        top: 8px;
        left: 8px;
        width: 25px;
        height: 25px;
        border-top: 3px solid #409eff;
        border-left: 3px solid #409eff;
        box-shadow: 
          0 0 8px rgba(64, 158, 255, 0.5),
          inset 0 0 5px rgba(64, 158, 255, 0.2);
        z-index: 10;
      }
      
      // Top right corner
      .corner-top-right {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 25px;
        height: 25px;
        border-top: 3px solid #409eff;
        border-right: 3px solid #409eff;
        box-shadow: 
          0 0 8px rgba(64, 158, 255, 0.5),
          inset 0 0 5px rgba(64, 158, 255, 0.2);
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
          0 0 10px rgba(64, 158, 255, 0.4),
          0 0 20px rgba(64, 158, 255, 0.2);
      }
      100% { 
        opacity: 1;
        box-shadow: 
          0 0 15px rgba(64, 158, 255, 0.8),
          0 0 30px rgba(64, 158, 255, 0.5),
          0 0 45px rgba(64, 158, 255, 0.3);
      }
    }
}
</style>