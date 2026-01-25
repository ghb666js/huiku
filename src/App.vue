<template>
  <div id="app">
    <drawerT></drawerT>
    <showText></showText>

    <div class="main" ></div>
    <h1 class="title">景德镇电厂灰库数字孪生健康管理系统</h1>
    <img class="header-img" src="@/assets/image/header.png" alt="">
    <router-view />
  </div>
</template>

<script>
import showText from './components/showText.vue';
import drawerT from './components/drawerT.vue';
export default {
  name: 'App',
  components: { showText,drawerT },
  data() {
    return {
      
    };
  },
  
  
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
    z-index: 3;
    transform: translateX(-50%);
  }
  .header-img {
    position: fixed;
    top: -6vh;
    width: 100vw;
    left: 50%;
    z-index: 2;
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
