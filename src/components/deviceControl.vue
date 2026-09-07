<template>
<section class="monitor" v-show="monitorData.show">
    <!-- <p>{{monitorData.name}}</p> -->
    <div class="fuction">
      <!-- <AutoTypeParese v-show="monitorData.name === '即采数据显示'"></AutoTypeParese> -->
     <div class="main-window">
       <setPower v-show="monitorData.name === '传感端口配置'"></setPower>
       <setTime v-show="monitorData.name === '采集时间配置'"></setTime>
     </div>
      
    </div>

    <generalButton :monitorButtons="monitorButtons" :currentMonitor="currentMonitor" @change="changeMonitor" :styles="{ width: '28vw' }" ></generalButton>

</section>
</template>

<script>
import EventBus from '@/bus';
import setPower from './subcomponets/setPower.vue'
import setTime from './subcomponets/setTime.vue'
import generalButton from './generalButton.vue';

export default {
    name: 'deviceControl',
    data() {
        return {
          monitorData:{
            show:false,
            name:'',
          },
          monitorButtons: [
            {name:'传感端口配置',url:require('@/assets/image/系统.png')},
            {name:'采集时间配置',url:require('@/assets/image/时间.png')},
            
          ],
          currentMonitor: '传感端口配置',
        };
    },
     components:{ 
      generalButton,
      setPower,
      setTime,
    },
     computed: {
     
    },
    mounted() {
      EventBus.$on('deviceControlUI', this.updateMonitor);
    },
    beforeDestroy() {
      EventBus.$off('deviceControlUI', this.updateMonitor);
    },
    methods: {
      updateMonitor(data){
        this.monitorData.show = data.show;
        this.monitorData.name = data.name || '';
        this.currentMonitor = data.name || '传感端口配置';
      },
      changeMonitor(item) {
        this.currentMonitor = item;
        this.monitorData.name = item;
        // EventBus.$emit('updateCurrentMonitor', item);
      }
    }
};
</script>

<style lang="less" scoped>
.monitor {
    width: 64%;
    height: 85%;
    position: fixed;
    left: 94%;
    top: 35%;
    transform: translate(-120%, -30%);
    background-image: url(@/assets/image/interface.jpg);
    background-size: 100% 100%;
    opacity: 0.9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0.4vw 1.2vw rgba(0,0,0,0.15);
    border-radius: 0.3vw;
    border: 0.05vw solid rgba(0, 110, 255, 0.733);
    box-shadow: 
        0 0 1vw rgba(0, 140, 255, 0.685),
        inset 0 0 1.5vw rgba(0, 212, 255, 0.1);
    // background: linear-gradient(135deg, rgba(0, 40, 80, 0.8) 0%, rgba(0, 20, 40, 0.9) 100%);
    backdrop-filter: blur(0.25vw);
    
    p { 
      color: white;
      flex: 0.1;
      margin: 0; 
      padding: 0.4vw; 
      font-size: 1.8vw;
      z-index: 2000;
    }
    .fuction{
      width: 100%;
      height: 80%;
      flex: 0.8;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      .main-window {
        background-image: url(@/assets/image/interface.jpg);
        background-size: 100% 100%;
        border: 0.05vw solid rgba(0, 110, 255, 0.733);
        border-radius: 0.3vw;
        padding: 1vw 1.25vw;
        width: 91.8%;
        height: 87%;
        margin: 0 auto;
        box-shadow: 
          0 0 1vw rgba(0, 140, 255, 0.685),
          inset 0 0 1.5vw rgba(0, 212, 255, 0.1);
        backdrop-filter: blur(0.25vw);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75vw;
      }
      ::-webkit-scrollbar{
        width: 0.4vw;
        height: 0.4vw;
      }
      ::-webkit-scrollbar-track{
        background: transparent;
      }
      ::-webkit-scrollbar-thumb{
        background: rgba(0, 140, 255, 0.5);
        border-radius: 0.2vw;
      }
      ::-webkit-scrollbar-thumb:hover{
        background: rgba(0, 140, 255, 0.8);
      }

    }
    
}
</style>