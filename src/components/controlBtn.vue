<template>
  <div class="robot-remote">
    <div class="remote-title">清堵机器人远程遥控界面</div>
    <div class="remote-status" :class="deviceStatus">
      {{ statusText }}
    </div>
    <div class="remote-row">
      <button class="remote-btn connect-btn" :class="{ connected: serialConnected }" @click="handleConnect">
        {{ serialConnected ? '设备\n已连' : '连接\n设备' }}
      </button>
      <button class="remote-btn" :class="{ active: robotState === 'go' }" :disabled="robotState === 'back'" @click="handleGoBack">
        {{ robotState === 'go' ? '进给\n停止' : '进给\n启动' }}
      </button>
    </div>
    <div class="remote-row">
      <button class="remote-btn" :class="{ active: swingState === 'swinging' }" :disabled="swingState === 'returning'" @click="handleSwing">
        {{ swingState === 'swinging' ? '左右\n停止' : '左右\n启动' }}
      </button>
      <button class="remote-btn" :class="{ active: bounceState === 'swinging' }" :disabled="bounceState === 'returning'" @click="handleBounce">
        {{ bounceState === 'swinging' ? '起伏\n停止' : '起伏\n启动' }}
      </button>
    </div>
  </div>
</template>

<script>
import EventBus from '@/bus';
import { toggleRobotGoBack, toggleRobotSwing, toggleRobotBounce, resetRobotAll } from '@/three/robot';
import { connectSerial, disconnectSerial, toggleFeed, toggleAround, toggleFluctuate } from '@/utils/serialControl';

export default {
  name: 'controlBtn',
  data() {
    return {
      serialConnected: false, // 串口是否已连接
      deviceStatus: 'idle',   // 设备状态: idle/connecting/connected/simulate/running
      robotState: 'idle',  // 进退键状态: idle/go/back
      swingState: 'idle',  // 左右键状态: idle/swinging/returning
      bounceState: 'idle', // 起伏键状态: idle/swinging/returning
    };
  },
  computed: {
    statusText() {
      if (this.deviceStatus === 'running') return '设备正在运行';
      if (this.deviceStatus === 'connected') return '设备已连接';
      if (this.deviceStatus === 'simulate') return '正在仿真';
      if (this.deviceStatus === 'connecting') return '连接中';
      return '未连接设备';
    },
  },
  mounted() {
    // 回退完成 → 重新启用按钮
    this._onRobotBackDone = () => {
      this.robotState = 'idle';
    };
    EventBus.$on('robotBackDone', this._onRobotBackDone);
    // 左右回零位完成 → 重新启用按钮
    this._onRobotSwingDone = () => {
      this.swingState = 'idle';
    };
    EventBus.$on('robotSwingDone', this._onRobotSwingDone);
    // 起伏回零位完成 → 重新启用按钮
    this._onRobotBounceDone = () => {
      this.bounceState = 'idle';
    };
    EventBus.$on('robotBounceDone', this._onRobotBounceDone);
    // 连接阶段串口响应 → 设备已连接
    this._onDeviceResponded = () => {
      this.deviceStatus = 'connected';
    };
    EventBus.$on('serialDeviceResponded', this._onDeviceResponded);
    // 下发指令后设备响应 → 设备正在运行
    this._onCommandResponded = () => {
      clearTimeout(this._cmdTimeout);
      this.deviceStatus = 'running';
    };
    EventBus.$on('serialCommandResponded', this._onCommandResponded);
  },
  beforeDestroy() {
    clearTimeout(this._cmdTimeout);
    EventBus.$off('robotBackDone', this._onRobotBackDone);
    EventBus.$off('robotSwingDone', this._onRobotSwingDone);
    EventBus.$off('robotBounceDone', this._onRobotBounceDone);
    EventBus.$off('serialDeviceResponded', this._onDeviceResponded);
    EventBus.$off('serialCommandResponded', this._onCommandResponded);
    disconnectSerial();
  },
  methods: {
    // 下发指令后等待响应：超时未响应 → 正在仿真
    _expectCommandResponse() {
      clearTimeout(this._cmdTimeout);
      this._cmdTimeout = setTimeout(() => {
        this.deviceStatus = 'simulate';
      }, 3000);
    },
    async handleConnect() {
      if (this.serialConnected) {
        // 已连接：点击不动作，退出模块时自动断开
        return;
      }
      this.deviceStatus = 'connecting';
      const ok = await connectSerial();
      this.serialConnected = ok;
      if (ok) {
        // 连接成功即归零所有动作，再启用三个启动按钮（避免响应时打断用户操作）
        resetRobotAll(window.app);
        this.robotState = 'idle';
        this.swingState = 'idle';
        this.bounceState = 'idle';
        this.deviceStatus = 'simulate'; // 等待设备响应后变"设备正在运行"
      } else {
        this.deviceStatus = 'idle';
      }
    },
    handleGoBack() {
      const s = toggleRobotGoBack(window.app);
      this.robotState = s;
      // 前进 → 进给toggle开始；回退 → 进给toggle停止；未连接设备只仿真不下发
      if (this.serialConnected) {
        if (s === 'go') {
          toggleFeed();
          this._expectCommandResponse();
        } else if (s === 'back') {
          toggleFeed();
        }
      } else {
        this.deviceStatus = 'simulate';
      }
    },
    handleSwing() {
      const s = toggleRobotSwing(window.app);
      this.swingState = s;
      // 左右启动 → 左右toggle开始；左右停止 → 左右toggle停止；未连接设备只仿真不下发
      if (this.serialConnected) {
        if (s === 'swinging') {
          toggleAround();
          this._expectCommandResponse();
        } else if (s === 'returning') {
          toggleAround();
        }
      } else {
        this.deviceStatus = 'simulate';
      }
    },
    handleBounce() {
      const s = toggleRobotBounce(window.app);
      this.bounceState = s;
      // 起伏启动 → 起伏toggle开始；起伏停止 → 起伏toggle停止；未连接设备只仿真不下发
      if (this.serialConnected) {
        if (s === 'swinging') {
          toggleFluctuate();
          this._expectCommandResponse();
        } else if (s === 'returning') {
          toggleFluctuate();
        }
      } else {
        this.deviceStatus = 'simulate';
      }
    },
  },
};
</script>

<style lang="less" scoped>
.robot-remote {
  position: fixed;
  left: 2vw;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.92), rgba(0, 30, 60, 0.92));
  border: 1px solid rgba(64, 158, 255, 0.6);
  border-radius: 0.8vw;
  padding: 1.2vw 1.6vw;
  box-shadow: 0 0 1.5vw rgba(64, 158, 255, 0.3), inset 0 0 2vw rgba(64, 158, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vw;

  .remote-title {
    font-size: 1.4vw;
    color: #00d4ff;
    letter-spacing: 0.3vw;
    text-shadow: 0 0 0.8vw rgba(0, 212, 255, 0.6);
  }

  .remote-status {
    width: 16.2vw; /* 与按钮行宽度一致：152*2 + 20 */
    box-sizing: border-box;
    text-align: center;
    padding: 0.5vw 0;
    border-radius: 0.4vw;
    background: rgba(0, 20, 40, 0.6);
    border: 1px solid rgba(64, 158, 255, 0.4);
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9vw;
    letter-spacing: 0.15vw;
    box-shadow: inset 0 0 0.75vw rgba(64, 158, 255, 0.1);

    &.simulate {
      color: #e6a23c;
      border-color: rgba(230, 162, 60, 0.6);
      box-shadow: inset 0 0 0.75vw rgba(230, 162, 60, 0.15);
    }

    &.connected,
    &.running {
      color: #67c23a;
      border-color: rgba(103, 194, 58, 0.6);
      box-shadow: inset 0 0 0.75vw rgba(103, 194, 58, 0.15);
      text-shadow: 0 0 0.5vw rgba(103, 194, 58, 0.4);
    }

    &.connecting {
      color: #409eff;
    }
  }

  .remote-row {
    display: flex;
    gap: 1vw;
    justify-content: center;
  }

  .remote-btn {
    width: 7.6vw;
    height: 7.6vw;
    border-radius: 3.8vw;
    background: rgba(0, 30, 60, 0.8);
    border: 0.1vw solid rgba(64, 158, 255, 0.5);
    color: #409eff;
    font-size: 1.5vw;
    line-height: 1.4;
    letter-spacing: 0.2vw;
    white-space: pre-line; /* 支持上下两行各两个字 */
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 50, 100, 0.8);
      border-color: #00d4ff;
      box-shadow: 0 0 0.6vw rgba(0, 212, 255, 0.4);
    }

    &.active {
      background: linear-gradient(180deg, rgba(0, 212, 255, 0.25), rgba(0, 100, 180, 0.25));
      border-color: #00d4ff;
      color: #00d4ff;
      box-shadow: 0 0 0.75vw rgba(0, 212, 255, 0.5);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      box-shadow: none;
      background: rgba(0, 30, 60, 0.6);
    }

    &.connected {
      border-color: #67c23a;
      color: #67c23a;
      box-shadow: 0 0 0.6vw rgba(103, 194, 58, 0.4);
    }
  }
}
</style>
