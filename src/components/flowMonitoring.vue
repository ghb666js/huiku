<template>
<section class="flow" v-if="isShowFlow">
  <div class="flow-containor">
    <div class="flow-body">
      <div class="flowmeter-containor">
        <h2 class="section-title">动态计量</h2>
        <div class="flowmeter-image">
          <img src="../assets/image/流量计.jpg" alt="flowMeter">
        </div>
        <div class="flowmeter-data">
          <div class="data-row">
            <div class="data-item" v-for="item in flowData.slice(0, 3)" :key="item.label">
              <span class="data-label">{{ item.label }}</span>
              <span class="data-value" :class="{ 'value-highlight': item.highlight }">{{ item.value }}</span>
            </div>
          </div>
          <div class="data-row">
            <div class="data-item" v-for="item in flowData.slice(3, 5)" :key="item.label">
              <span class="data-label">{{ item.label }}</span>
              <span class="data-value" :class="{ 'value-highlight': item.highlight }">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="camera-containor">
        <h2 class="section-title">对位系统</h2>
        <div class="camera-video"></div>
        <div class="handle-image">
          <div class="before-handle"></div>
          <div class="after-handle"></div>
        </div>

      </div>
    </div>
  </div>
</section>
</template>

<script>
import EventBus from '@/bus';

export default {
    name: 'flowMonitioring',
    data() {
        return {
          isShowFlow: false,
          // [加载动画] 流量计模拟数据，后续可替换为真实数据
          flowData: [
            { label: '设定料量(吨)', value: '35.0', highlight: false },
            { label: '已装料量(吨)', value: '28.7', highlight: false },
            { label: '装车时间(分钟)', value: '12.5', highlight: false },
            { label: '阀门设定/给定', value: '85%', highlight: false },
            { label: '实际流量(吨)', value: '2.30', highlight: false },
          ],
        };
    },
    components: {

    },
    watch: {

    },
    computed: {
    },
    mounted() {
      EventBus.$on('flowMonitoring', this.updateFlow);
    },
    beforeDestroy() {
      EventBus.$off('flowMonitoring', this.updateFlow);
     
    },
    methods: {
      updateFlow(data){
        this.isShowFlow = data.show
      }
    }
};
</script>

<style lang="less" scoped>
// ==================== 系统统一风格变量 ====================
@bg-dark: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 30, 60, 0.95));
@border-color: rgba(64, 158, 255, 0.6);
@accent: #409eff;
@accent-light: #00d4ff;
@text-glow: 0 0 8px rgba(64, 158, 255, 0.8), 0 0 15px rgba(64, 158, 255, 0.4);
@panel-glow: 0 0 15px rgba(64, 158, 255, 0.4), inset 0 0 30px rgba(64, 158, 255, 0.1);
@border-glow: 0 0 8px rgba(64, 158, 255, 0.5);

.flow {
  width: 100%;
  height: 100%;
  top: 2%;
  position: fixed;
  left: 2%;
  display: flex;
  flex-direction: row;
  align-items: center;

  .flow-containor {
    width: 78%;
    height: 88%;
    background: @bg-dark;
    border: 1px solid @border-color;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    // gap: 0.25vw;
    padding: 0.5vw;
    box-shadow:
      @panel-glow,
      0 4px 20px rgba(0, 0, 0, 0.5),
      inset 0 0 60px rgba(64, 158, 255, 0.05);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg,
        rgba(64, 158, 255, 0.8) 0%,
        @accent 30%,
        rgba(64, 158, 255, 0.9) 50%,
        @accent 70%,
        rgba(64, 158, 255, 0.8) 100%);
      box-shadow:
        0 0 10px rgba(64, 158, 255, 0.6),
        0 0 20px rgba(64, 158, 255, 0.4),
        0 0 30px rgba(64, 158, 255, 0.2);
    }

    &::after {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      width: 25px;
      height: 25px;
      border-top: 3px solid @accent;
      border-left: 3px solid @accent;
      box-shadow:
        @border-glow,
        inset 0 0 5px rgba(64, 158, 255, 0.2);
    }
  }

  .section-title {
    margin: 0;
    font-size: 1.1vw;
    color: rgba(255, 255, 255, 1);
    text-shadow: @text-glow;
    font-family: 'Arial', sans-serif;
    letter-spacing: 2px;
    text-align: center;
  }

  .flow-body {
    display: flex;
    flex-direction: row;
    flex: 10;
    gap: 0.25vw;

    .flowmeter-containor {
      padding: 0.25vw;
      gap: 0.3vw;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 100%;
      flex: 5;

      .flowmeter-image {
        flex: 8;
        width: 100%;
        background: @bg-dark;
        border: 2px solid rgba(64, 158, 255, 0.5);
        border-radius: 4px;
        box-shadow:
          0 0 12px rgba(64, 158, 255, 0.5),
          0 0 30px rgba(64, 158, 255, 0.2),
          inset 0 0 20px rgba(0, 0, 0, 0.6),
          inset 0 0 4px rgba(64, 158, 255, 0.3);
        position: relative;
        overflow: hidden;
        padding: 5px;
        box-sizing: border-box;

        // 内框装饰线
        &::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          right: 4px;
          bottom: 4px;
          border: 1px solid rgba(64, 158, 255, 0.25);
          border-radius: 2px;
          pointer-events: none;
          z-index: 2;
        }

        // 外发光边框
        &::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 1px solid rgba(64, 158, 255, 0.15);
          border-radius: 5px;
          box-shadow: 0 0 15px rgba(64, 158, 255, 0.3);
          pointer-events: none;
          z-index: 1;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          border-radius: 2px;
        }
      }

      .flowmeter-data {
        flex: 2;
        background: @bg-dark;
        border: 1px solid @border-color;
        border-radius: 4px;
        box-shadow: @panel-glow;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.6vw 0.8vw;
        gap: 0.6vw;
        
        .data-row {
          display: flex;
          justify-content: center;
          gap: 0.8vw;
          width: 80%;
        }

        .data-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35vw;
          flex: 1;
          max-width: 8vw;
          padding: 0.5vw 0.6vw;
          background: rgba(64, 158, 255, 0.06);
          border: 1px solid rgba(64, 158, 255, 0.25);
          border-radius: 4px;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(64, 158, 255, 0.12);
            border-color: rgba(64, 158, 255, 0.5);
            box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
          }

          .data-label {
            font-size: 0.9vw;
            color: rgba(64, 158, 255, 0.85);
            letter-spacing: 1px;
            white-space: nowrap;
          }

          .data-value {
            font-size: 1.35vw;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.9);
            text-shadow: @text-glow;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;

            &.value-highlight {
              color: @accent-light;
              text-shadow:
                0 0 10px rgba(0, 212, 255, 0.8),
                0 0 20px rgba(0, 212, 255, 0.5);
            }
            
          }
        }
      }
    }

    .camera-containor {
      padding: 0.25vw;
      gap: 0.3vw;
      flex: 5;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 100%;

      .camera-video {
        flex: 6;
        width: 100%;
        background: @bg-dark;
        border: 1px solid @border-color;
        border-radius: 4px;
        box-shadow: @panel-glow;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          width: 20px;
          height: 20px;
          border-top: 2px solid @accent;
          border-left: 2px solid @accent;
        }
        &::after {
          content: '';
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-bottom: 2px solid @accent;
          border-right: 2px solid @accent;
        }
      }

      .handle-image {
        width: 100%;
        flex: 4;
        display: flex;
        gap: 0.3vw;

        .before-handle,
        .after-handle {
          flex: 5;
          height: 100%;
          background: @bg-dark;
          border: 1px solid @border-color;
          border-radius: 4px;
          box-shadow: @panel-glow;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 4px;
            left: 4px;
            width: 18px;
            height: 18px;
            border-top: 2px solid @accent;
            border-left: 2px solid @accent;
          }
          &::after {
            content: '';
            position: absolute;
            bottom: 4px;
            right: 4px;
            width: 18px;
            height: 18px;
            border-bottom: 2px solid @accent;
            border-right: 2px solid @accent;
          }
        }
      }
    }
  }
}

// ==================== 滚动条样式 ====================
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 40, 80, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 140, 255, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 140, 255, 0.8);
}
</style>
