<template>
  <div v-if="tooltip.show"
         class="simple-tooltip"
         :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
            {{ tooltip.text }}
    </div>
</template>

<script>
  import EventBus from '@/bus';
  export default{
    name:'showText',
    data(){
      return {
        tooltip: {
        show: false,
        text: '',
        x: 0,
        y: 0
        }
      }
    },
    mounted() {
      // 监听来自三维射线拾取的悬浮事件
      EventBus.$on('showText', this.onShowText);
    },
    beforeDestroy() {
      EventBus.$off('showText', this.onShowText);
    },
    methods:{
      onShowText(payload) {
      if (!payload) return;
      if (payload.show) {
        // payload.x / payload.y 为页面坐标（调用端已提供）
        this.tooltip.show = true;
        this.tooltip.text = payload.text || '';
        this.tooltip.x = payload.x || 0;
        this.tooltip.y = payload.y || 0;
      } else {
        this.tooltip.show = false; 
      }
    }
    }
  }
</script>

<style lang="less" scoped>
/* 提示文本 */
.simple-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  padding: 4px 6px;
  background: rgba(255,255,255,0.95);
  color: #000;
  font-size: 20px;
  border-radius: 2px;
  transform: translate(-50%, -120%); /* 让提示出现在指针上方居中 */
}
</style>