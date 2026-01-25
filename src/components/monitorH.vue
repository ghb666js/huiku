<template>
<section class="monitor" v-if="monitorData.show">
    <!-- <p>{{monitorData.name}}</p> -->
    <div class="fuction">
      <AutoTypeParese v-show="monitorData.name === '监测硬件配置'"></AutoTypeParese>
      <!-- <AutoProject  v-show="monitorData.name === '历史数据查询'"></AutoProject> -->
    </div>
    <div class="null"></div>
</section>
</template>

<script>
import EventBus from '@/bus';
import AutoTypeParese from './autoTypeParese.vue';
// import * as THREE from 'three';
// import AutoProject from '../../public/lib/auto-project.min.js';
export default {
    name: 'monitorH',
    data() {
        return {
          monitorData:{
            show:false,
            name:'',
          },
         
        };
    },
     components:{ 
      AutoTypeParese,
      // AutoProject 
    },
     computed: {
     
    },
    mounted() {
      EventBus.$on('changeMonitorUI', this.updateMonitor);
    
    },
    beforeDestroy() {
      EventBus.$off('changeMonitorUI', this.updateMonitor);
     
    },
    methods: {
      updateMonitor(data){
        // console.log(1);
        this.monitorData.show = data.show;
        this.monitorData.name = data.name || '';
        if(this.monitorData.name === '历史数据查询'){
          window.open('http://127.0.0.1:5502/public/dist/dataVistual.html')
          this.monitorData.name = '监测硬件配置';
          // 发送事件通知bigControl.vue更新currentMonitor
          EventBus.$emit('updateCurrentMonitor', '监测硬件配置');
        }
      },
    
    }
};
</script>

<style lang="less" scoped>
.monitor {
    width: 64%;
    height: 75%;
    position: fixed;
    left: 94%;
    top: 40%;
    transform: translate(-120%, -30%);
    // background: white;
    background-image: url(@/assets/image/interface.jpg);  // 背景图片的路径
    opacity: 0.9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    border-radius: 6px;
    
    // p{
    //   top: 0%;
    // }
    p { 
      color: white;
      flex: 0.1;
      margin: 0; 
      padding: 8px; 
      font-size: 1.8vw;
      z-index: 2000;
    }
    .fuction{
      // width: 100%;
      flex: 0.8;
      z-index: 2000;
    }
    .null{
      flex: 0.1;
    }
    
}
</style>