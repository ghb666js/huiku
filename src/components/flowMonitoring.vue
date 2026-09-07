<template>
<section class="flow" v-if="isShowFlow">
  <div class="flow-containor">
    <div class="flow-body">
      <div class="flowmeter-containor">
        <h2 class="section-title">科里奥利动态计量系统</h2>
        <div class="flowmeter-image">
          <img src="../assets/image/流量计.jpg" alt="flowMeter">
        </div>
        <div class="flowmeter-data">
          <div class="data-row">
            <div class="data-item" v-for="item in flowData" :key="item.label">
              <span class="data-label">{{ item.label }}</span>
              <span class="data-value" :class="{ 'value-highlight': item.highlight }">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

        <div class="camera-containor">
          <h2 class="section-title">自动装车引导对位系统</h2>
          <div class="camera">
            <div class="camera-video" @click="toggleVideoPlay">
              <img v-if="videoSrc" :src="videoSrc" alt="视频流" />
              <span v-else class="camera-placeholder">监控画面待接入</span>
              <button class="video-play-btn" :class="{ paused: !videoPlaying }">
                {{ videoPlaying ? '⏸' : '▶' }}
              </button>
            </div>
            <div class="handle-image">
              <div class="before-handle">
                <div class="handle-label">处理前激光雷达罐口点云图</div>
                <img v-if="beforeImageUrl" :src="beforeImageUrl" alt="处理前" />
              </div>
              <div class="after-handle">
                <div class="handle-label">处理后罐口中心坐标图</div>
                <img v-if="afterImageUrl" :src="afterImageUrl" alt="处理后" />
              </div>
            </div>
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
          beforeImageUrl: '',
          afterImageUrl: '',
          // 视频流状态
          videoSrc: '',
          videoPlaying: true,
          videoStopped: false,
          videoTimer: null,
          videoLastB64: '',
          videoCurrentUrl: null,
          // [加载动画] 流量计模拟数据，后续可替换为真实数据
          flowData: [
            { label: '设定料量(吨)', value: '---', highlight: false },
            { label: '已装料量(吨)', value: '---', highlight: false },
            { label: '装车时间(分钟)', value: '---', highlight: false },
          ],
        };
    },
    components: {

    },
    watch: {
      isShowFlow(val) {
        if (val) {
          this.fetchFlowData();
          this.fetchPlcData();
          this.connectWebSocket();
          this.startVideoStream();
          this.plcTimer = setInterval(() => this.fetchPlcData(), 10 * 60 * 1000);
        } else {
          this.disconnectWebSocket();
          this.stopVideoStream();
        }
      },
    },
    computed: {
    },
    mounted() {
      EventBus.$on('flowMonitoring', this.updateFlow);
    },
    beforeDestroy() {
      EventBus.$off('flowMonitoring', this.updateFlow);
      this.disconnectWebSocket();
      this.stopVideoStream();
      clearInterval(this.plcTimer);
    },
    methods: {
      updateFlow(data) {
        this.isShowFlow = data.show;
      },
      // [WebSocket测试] 连接 ws://localhost:3000/flow
      connectWebSocket() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
        this.ws = new WebSocket('ws://localhost:3000/flow');
        this.ws.onopen = () => {
          console.log('[WS] 已连接 ws://localhost:3000/flow');
        };
        this.ws.onmessage = () => {
          this.fetchFlowData();
        };
        this.ws.onerror = (err) => {
          console.error('[WS] 连接错误:', err);
        };
        this.ws.onclose = () => {
          console.log('[WS] 连接关闭');
          this.ws = null;
        };
      },
      disconnectWebSocket() {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
      },
      decodeVideoFrame(rawBase64) {
        if (!rawBase64 || rawBase64.length < 30) return null;
        try {
          const b64 = rawBase64.replace('/tf/', '/9j/');
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          // 提取第一帧 SOI-EOI
          let soi = -1;
          for (let i = 0; i < bytes.length - 1; i++) {
            if (bytes[i] === 0xFF && bytes[i + 1] === 0xD8 && soi === -1) soi = i;
            if (bytes[i] === 0xFF && bytes[i + 1] === 0xD9 && soi >= 0) {
              const frame = bytes.slice(soi, i + 2);
              const blob = new Blob([frame], { type: 'image/jpeg' });
              return { objectUrl: URL.createObjectURL(blob), rawB64: rawBase64 };
            }
          }
          return null;
        } catch (e) { return null; }
      },
      async fetchVideoFrame() {
        if (!this.videoPlaying || this.videoStopped) return;
        const fps = 5;
        try {
          const res = await fetch('http://localhost:3000/api/video');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const json = await res.json();
          if (json.code !== 0 || !json.data || !json.data.FlowmeterData || json.data.FlowmeterData.length === 0) {
            if (this.videoPlaying && !this.videoStopped)
              this.videoTimer = setTimeout(() => this.fetchVideoFrame(), 500);
            return;
          }
          const rawB64 = json.data.FlowmeterData[0];
          // console.log(json.data.FlowmeterData);
          
          if (rawB64 === this.videoLastB64) {
            if (this.videoPlaying && !this.videoStopped)
              this.videoTimer = setTimeout(() => this.fetchVideoFrame(), Math.round(1000 / fps));
            return;
          }
          const result = this.decodeVideoFrame(rawB64);
          if (!result) {
            if (this.videoPlaying && !this.videoStopped)
              this.videoTimer = setTimeout(() => this.fetchVideoFrame(), 500);
            return;
          }
          this.videoLastB64 = rawB64;
          if (this.videoCurrentUrl) URL.revokeObjectURL(this.videoCurrentUrl);
          this.videoCurrentUrl = result.objectUrl;
          this.videoSrc = result.objectUrl;
          if (this.videoPlaying && !this.videoStopped)
            this.videoTimer = setTimeout(() => this.fetchVideoFrame(), Math.round(1000 / fps));
        } catch (e) {
          console.error('[视频流] 获取失败:', e);
          if (this.videoPlaying && !this.videoStopped)
            this.videoTimer = setTimeout(() => this.fetchVideoFrame(), 500);
        }
      },
      startVideoStream() {
        this.videoStopped = false;
        if (this.videoTimer) { clearTimeout(this.videoTimer); this.videoTimer = null; }
        this.videoPlaying = true;
        this.fetchVideoFrame();
      },
      stopVideoStream() {
        this.videoStopped = true;
        if (this.videoTimer) { clearTimeout(this.videoTimer); this.videoTimer = null; }
        this.videoPlaying = false;
        // 保留当前帧画面，不清除 videoSrc
      },
      toggleVideoPlay() {
        this.videoPlaying ? this.stopVideoStream() : this.startVideoStream();
      },
      // 解码base64帧（处理前/后图片，简单版）：剥离 /tf/ 前缀，转为data URI
      decodeFrame(rawBase64) {
        if (!rawBase64 || rawBase64.length < 30) return '';
        const b64 = rawBase64.replace('/tf/', '');
        return 'data:image/jpeg;base64,' + b64;
      },
      async fetchFlowData() {
        try {
          const res = await fetch('http://localhost:3000/api/img');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const json = await res.json();
          console.log(json,'图片数据');
          
          if (json.code !== 0 || !json.data) throw new Error('接口返回异常');

          const frames = json.data.FlowmeterData;
          if (Array.isArray(frames)) {
            if (frames.length > 0) this.beforeImageUrl = this.decodeFrame(frames[0]);
            if (frames.length > 1) this.afterImageUrl = this.decodeFrame(frames[1]);
          }
        } catch (e) {
          console.error('[API/img] 获取图片失败:', e);
        }
      },
      async fetchPlcData() {
        try {
          const res = await fetch('http://localhost:3000/api/plc');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const json = await res.json();
          console.log('[API/plc] 返回数据:', json);
          // 返回格式: [设定料量, 已装料量, 开始时间, 结束时间, 装车时间]
          const arr = json.data.original[0];
          this.flowData = [
            { label: '设定料量(吨)', value: String(arr[0] ?? '---'), highlight: false },
            { label: '已装料量(吨)', value: String(arr[1] ?? '---'), highlight: false },
            { label: '装车时间(分钟)', value: String(arr[4] ?? '---'), highlight: false },
          ];
        } catch (e) {
          console.error('[API/plc] 获取PLC数据失败:', e);
        }
      },
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
  left: 1%;
  display: flex;
  flex-direction: row;
  align-items: center;

  .flow-containor {
    width: 80%;
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
    font-size: 1.2vw;
    color: rgba(255, 255, 255, 1);
    text-shadow: @text-glow;
    font-family: 'SimHei', '黑体', sans-serif;
    letter-spacing: 2px;
    text-align: center;
  }

  .flow-body {
    display: flex;
    flex-direction: row;
    flex: 10;
    gap: 0.25vw;

    .flowmeter-containor {
      padding: 0.15vw;
      gap: 0.3vw;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 100%;
      flex: 3.5;

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
            font-size: 1.0vw;
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
      padding: 0.15vw;
      gap: 0.3vw;
      flex: 6.5;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 100%;

      .camera{
        display: flex;
        flex-direction: row;
        height: 100%;
        .camera-video {
        flex: 6.5;
        width: 100%;
        background: @bg-dark;
        border: 1px solid @border-color;
        // border-radius: 4px;
        border-top-left-radius: 4px;
        border-bottom-left-radius:4px ;
        box-shadow: @panel-glow;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          width: 20px;
          height: 20px;
          border-top: 2px solid @accent;
          border-left: 2px solid @accent;
          z-index: 2;
          pointer-events: none;
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
          z-index: 2;
          pointer-events: none;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .camera-placeholder {
          color: rgba(64, 158, 255, 0.5);
          font-size: 0.8vw;
          letter-spacing: 2px;
          z-index: 1;
        }

        .video-play-btn {
          position: absolute;
          bottom: 6px;
          left: 6px;
          width: 28px;
          height: 28px;
          background: rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(64, 158, 255, 0.5);
          border-radius: 4px;
          color: @accent;
          font-size: 14px;
          cursor: pointer;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;

          &:hover {
            background: rgba(64, 158, 255, 0.2);
            border-color: @accent;
          }

          &.paused {
            color: rgba(64, 158, 255, 0.6);
          }
        }
      }

      
        .handle-image {
        width: 100%;
        flex: 3.5;
        display: flex;
        flex-direction: column;

        .before-handle,
        .after-handle {
          flex: 5;
          background: @bg-dark;
          border: 1px solid @border-color;
          // border-radius: 4px;
          border-top-right-radius: 4px;
          border-bottom-right-radius:4px ;
          box-shadow: @panel-glow;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          &::after {
            content: '';
            position: absolute;
            bottom: 4px;
            right: 4px;
            width: 18px;
            height: 18px;
            border-bottom: 2px solid @accent;
            border-right: 2px solid @accent;
            z-index: 2;
            pointer-events: none;
          }

          .handle-label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 0.2vw 0;
            font-size: 0.8vw;
            color: rgba(255, 230, 0, 0.945);
            letter-spacing: 1px;
            text-align: center;
            white-space: nowrap;
            z-index: 3;
            pointer-events: none;
            background: linear-gradient(transparent, rgba(0, 10, 30, 0.7));
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
          }

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
