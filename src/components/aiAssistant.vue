<template>
  <div class="ai-assistant">
    <!-- 悬浮圆形按钮（可拖拽） -->
    <div
      class="ai-fab"
      :class="{ 'ai-fab--dragging': dragging, 'ai-fab--open': open }"
      :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
      @mousedown.prevent="onDragStart"
      @click="onFabClick"
      title="AI 助手"
    >
      <!-- 机器人图标（Bootstrap Icons / 阿里矢量库） -->
      <svg class="ai-fab__icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25.9 25.9 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.3 25.3 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z"/>
        <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
      </svg>
    </div>

    <!-- 对话面板 -->
    <div
      v-show="open"
      class="ai-panel"
      :style="{ left: panelPos.left + 'px', top: panelPos.top + 'px' }"
    >
      <div class="ai-panel__header">
        <span class="ai-panel__title">AI 助手</span>
        <button class="ai-panel__close" @click="open = false" title="收起">×</button>
      </div>

      <div ref="body" class="ai-panel__body">
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="ai-msg"
          :class="'ai-msg--' + m.role"
        >
          <div class="ai-msg__bubble">{{ m.text }}</div>
        </div>
        <div v-if="thinking" class="ai-msg ai-msg--assistant">
          <div class="ai-msg__bubble ai-msg__bubble--typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <div class="ai-panel__footer">
        <input
          v-model.trim="input"
          class="ai-panel__input"
          placeholder="输入问题后回车…"
          @keyup.enter="send"
        />
        <button class="ai-panel__send" :disabled="!input" @click="send">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reply } from '@/utils/aiReply';

const FAB_SIZE = 56;      // 悬浮按钮尺寸(px)，与样式中的 width/height 保持一致
const EDGE_MARGIN = 8;    // 距离视口边缘的最小间距
const RIGHT_MARGIN = 32;  // 初始贴右边距

export default {
  name: 'aiAssistant',
  data() {
    return {
      open: false,
      input: '',
      thinking: false,
      dragging: false,
      // 悬浮按钮位置（左上角坐标）
      pos: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
      moved: false,
      userMoved: false, // 用户是否手动拖动过（决定 resize 时重新贴边还是仅限制在视口内）
      messages: [
        { role: 'assistant', text: '您好，我是钢板仓智能助手，可以帮您了解料位、传感器、雷达与清堵机器人等信息。' },
      ],
    };
  },
  computed: {
    // 面板跟随按钮：靠右侧时面板显示在左边，避免超出屏幕
    panelPos() {
      const W = 340;
      const H = 420;
      const gap = 16;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = this.pos.x - W - gap;
      if (left < 8) left = Math.min(this.pos.x + 72 + gap, vw - W - 8);
      let top = this.pos.y + 56 - H;
      top = Math.max(8, Math.min(top, vh - H - 8));
      return { left, top };
    },
  },
  mounted() {
    this.anchorToRight();
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    // 贴到屏幕右侧、垂直居中（自适应窗口尺寸）
    anchorToRight() {
      this.pos.x = window.innerWidth - FAB_SIZE - RIGHT_MARGIN;
      this.pos.y = Math.round(window.innerHeight / 2);
    },
    // 窗口尺寸变化：未拖动过则重新贴边；拖动过则仅保证不出视口
    onResize() {
      const maxX = window.innerWidth - FAB_SIZE - EDGE_MARGIN;
      const maxY = window.innerHeight - FAB_SIZE - EDGE_MARGIN;
      if (!this.userMoved) {
        this.anchorToRight();
        return;
      }
      this.pos.x = Math.max(EDGE_MARGIN, Math.min(this.pos.x, maxX));
      this.pos.y = Math.max(EDGE_MARGIN, Math.min(this.pos.y, maxY));
    },
    onDragStart(e) {
      this.dragging = true;
      this.moved = false;
      this.dragOffset.x = e.clientX - this.pos.x;
      this.dragOffset.y = e.clientY - this.pos.y;
    },
    onDragMove(e) {
      if (!this.dragging) return;
      let x = e.clientX - this.dragOffset.x;
      let y = e.clientY - this.dragOffset.y;
      // 限制在视口内
      x = Math.max(EDGE_MARGIN, Math.min(x, window.innerWidth - FAB_SIZE - EDGE_MARGIN));
      y = Math.max(EDGE_MARGIN, Math.min(y, window.innerHeight - FAB_SIZE - EDGE_MARGIN));
      if (Math.abs(x - this.pos.x) > 3 || Math.abs(y - this.pos.y) > 3) {
        this.moved = true;
        this.userMoved = true; // 一旦真实拖动过，resize 时不再自动贴边
      }
      this.pos.x = x;
      this.pos.y = y;
    },
    onDragEnd() {
      if (!this.dragging) return;
      this.dragging = false;
    },
    // 拖拽结束的点击不触发展开，区分点击与拖动
    onFabClick() {
      if (this.moved) {
        this.moved = false;
        return;
      }
      this.open = !this.open;
      if (this.open) this.$nextTick(this.scrollToBottom);
    },
    async send() {
      const text = this.input;
      if (!text || this.thinking) return;
      this.messages.push({ role: 'user', text });
      this.input = '';
      this.thinking = true;
      this.$nextTick(this.scrollToBottom);

      const answer = await this.getReply(text);

      this.thinking = false;
      this.messages.push({ role: 'assistant', text: answer });
      this.$nextTick(this.scrollToBottom);
    },
    // 获取回复：已配置 API Key 走大模型，否则走本地知识库
    async getReply(text) {
      // 排除刚加入的当前提问，取之前最近几轮作为上下文
      const history = this.messages.slice(0, -1).slice(-6);
      return reply(text, history);
    },
    scrollToBottom() {
      const el = this.$refs.body;
      if (el) el.scrollTop = el.scrollHeight;
    },
  },
};
</script>

<style lang="less" scoped>
// ==================== 悬浮按钮 ====================
.ai-fab {
  position: fixed;
  z-index: 1200;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: #00d4ff;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.95), rgba(0, 20, 40, 0.95));
  border: 2px solid rgba(0, 212, 255, 0.55);
  box-shadow:
    0 0 12px rgba(0, 212, 255, 0.45),
    inset 0 0 12px rgba(0, 212, 255, 0.12);
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
  user-select: none;

  &:hover {
    transform: scale(1.06);
    border-color: #00d4ff;
    box-shadow:
      0 0 20px rgba(0, 212, 255, 0.75),
      inset 0 0 16px rgba(0, 212, 255, 0.2);
  }

  &--dragging {
    cursor: grabbing;
    transform: scale(1.08);
    box-shadow: 0 0 24px rgba(0, 212, 255, 0.85);
  }

  &--open {
    color: #67e8f9;
    border-color: #67e8f9;
  }

  &__icon {
    width: 30px;
    height: 30px;
    pointer-events: none;
  }
}

// ==================== 对话面板 ====================
.ai-panel {
  position: fixed;
  z-index: 1201;
  width: 340px;
  height: 420px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.97), rgba(0, 30, 60, 0.97));
  border: 1px solid rgba(64, 158, 255, 0.55);
  box-shadow:
    0 0 20px rgba(64, 158, 255, 0.35),
    inset 0 0 30px rgba(64, 158, 255, 0.06);

  &__header {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(64, 158, 255, 0.25);
    background: rgba(0, 30, 60, 0.5);
  }

  &__title {
    font-size: 15px;
    color: #00d4ff;
    letter-spacing: 2px;
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
  }

  &__close {
    background: transparent;
    border: none;
    color: rgba(0, 212, 255, 0.75);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    padding: 0 4px;
    transition: color 0.2s;

    &:hover { color: #00d4ff; }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 140, 255, 0.5);
      border-radius: 3px;
    }
  }

  &__footer {
    flex: none;
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border-top: 1px solid rgba(64, 158, 255, 0.25);
    background: rgba(0, 30, 60, 0.5);
  }

  &__input {
    flex: 1;
    min-width: 0;
    background: rgba(0, 20, 40, 0.8);
    border: 1px solid rgba(64, 158, 255, 0.4);
    border-radius: 6px;
    padding: 7px 10px;
    color: #e6f2ff;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;

    &::placeholder { color: rgba(150, 190, 230, 0.5); }
    &:focus { border-color: #00d4ff; }
  }

  &__send {
    flex: none;
    padding: 7px 14px;
    border-radius: 6px;
    border: 1px solid rgba(0, 212, 255, 0.55);
    background: rgba(0, 60, 110, 0.7);
    color: #00d4ff;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: rgba(0, 90, 150, 0.8);
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

// ==================== 消息气泡 ====================
.ai-msg {
  display: flex;

  &--user { justify-content: flex-end; }
  &--assistant { justify-content: flex-start; }

  &__bubble {
    max-width: 78%;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.6;
    word-break: break-word;
    white-space: pre-wrap;
  }

  &--assistant &__bubble {
    background: rgba(0, 60, 110, 0.5);
    border: 1px solid rgba(64, 158, 255, 0.35);
    color: #d8ecff;
  }

  &--user &__bubble {
    background: linear-gradient(135deg, rgba(0, 140, 220, 0.75), rgba(0, 90, 170, 0.75));
    border: 1px solid rgba(0, 212, 255, 0.5);
    color: #ffffff;
  }

  // 思考中动画
  &__bubble--typing {
    display: flex;
    gap: 5px;
    align-items: center;

    span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00d4ff;
      animation: aiBlink 1.2s infinite ease-in-out;

      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
}

@keyframes aiBlink {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40%           { opacity: 1;    transform: translateY(-3px); }
}
</style>
