<template>
  <div id="app">
    <showText></showText>
    <div class="main" ></div>
    <h1 class="title">大型钢板仓灰库数字孪生健康管理系统</h1>
    <div class="clock" v-show="showClock">{{ currentTime }}</div>
    <img class="header-img" src="@/assets/image/header.png" alt="">
    <keep-alive>
      <router-view />
    </keep-alive>
    <more-sale-data
    :visible="showMoreSaleInfo"
    :data="moreSaleData"
    @close="closeMoreSaleInfo"
    />
    <pageData
    :visible="showPageData"
    :data="pageData"
    @close="closePageData"
    />
  </div>
</template>

<script>
import showText from './components/showText.vue';
import moreSaleData from './components/subcomponets/moreSaleData.vue';
// import PageData from './components/subcomponets/pageData.vue';
import pageData from './components/subcomponets/pageData.vue';
export default {
  name: 'App',
  components: { showText,moreSaleData,pageData },
  data() {
    return {
      showMoreSaleInfo:false,
      moreSaleData:[],
      showPageData:false,
      pageData:[],
      currentTime: this.formatTime(),
      showClock: true
    };
  },
  mounted(){
    this.timer = setInterval(() => {
      this.currentTime = this.formatTime();
    }, 1000);
    this.$EventBus.$on('setClock',(visible) => {
      this.showClock = !!visible;
    });
    this.$EventBus.$on('showMoreSaleInfo',(data) => {
      this.moreSaleData = data;
      this.showMoreSaleInfo = true;
    });
    this.$EventBus.$on('showPageData',(data) => { 
      this.pageData = data;
      this.showPageData = true;
    });
    this.$EventBus.$on('closeMoreSaleInfo',() => {
      this.showMoreSaleInfo = false;
    });
    this.$EventBus.$on('closePageData',() => {
      this.showPageData = false;
    });
  },
  beforeDestroy(){
    this.$EventBus.$off('showMoreSaleInfo');
    this.$EventBus.$off('closeMoreSaleInfo');
    this.$EventBus.$off('showPageData');
    this.$EventBus.$off('closePageData');
    clearInterval(this.timer);
  },
  methods:{
    formatTime() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const h = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    },
    closeMoreSaleInfo(){
      this.showMoreSaleInfo = false;
    },
    closePageData(){
      this.showPageData = false;
    }
  }
};
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  .title{
    text-align: center;
    position: fixed;
    top: 0vh;
    font-size:1.8vw;
    color: aliceblue;
    width: 100vw;
    left: 50%;
    z-index: 999;
    transform: translateX(-50%);
  }
  .clock {
    position: fixed;
    top: 4.5%;
    right: 2.5%;
    z-index: 1000;
    font-size: 1.2vw;
    color: #00d4ff;
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
    text-shadow:
      0 0 8px rgba(0, 212, 255, 0.7),
      0 0 16px rgba(0, 212, 255, 0.4);
    background: transparent;
    border: none;
    pointer-events: none;
  }

  .header-img {
    position: fixed;
    top: -6vh;
    width: 100vw;
    left: 50%;
    z-index: 998;
    transform: translateX(-50%);
  }
}

/* 主体区 */
.main {
  flex: 1;
  transition: margin-left 0.26s ease;
  padding: 60px 20px 20px 20px;
  background: #0b1020;
  min-height: 100vh;
  box-sizing: border-box;
  color: #fff;
}


</style>
