<template>
<section class="monitor" v-if="monitorData.show">
    <!-- <p>{{monitorData.name}}</p> -->
    <div class="fuction">
      <div class="main-window">
        <AutoTypeParese v-show="monitorData.name === '即采数据显示'"></AutoTypeParese>
        <queryHistory v-show="monitorData.name === '历史数据查询'"></queryHistory>
        <abnormalDate v-show="monitorData.name === '灰库异常分布'"></abnormalDate>
      </div>
      <!-- <setPower v-show="monitorData.name === '监测硬件配置'"></setPower> -->
      
    </div>
    <div class="changeButton">
      <div class="image-container">
        <!-- 自定义图片容器 -->
        <div class="image-item" v-for="(item, index) in monitorButtons" :key="'img-' + index">
          <div class="custom-image" :class="{ active: currentMonitor === item.name }">
            <img :src="item.url" alt="自定义图片">
          </div>
        </div>
      </div>
      <div class="button-container">
        <button 
          v-for="(item, index) in monitorButtons" 
          :key="index"
          :class="['monitor-btn', { active: currentMonitor === item.name }]"
          @click="changeMonitor(item.name)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>
</section>
</template>

<script>
import EventBus from '@/bus';
import AutoTypeParese from './subcomponets/autoTypeParese.vue';
import queryHistory from './subcomponets/queryHistory.vue';
import abnormalDate from './subcomponets/abnormalDate.vue';
export default {
    name: 'monitorH',
    data() {
        return {
          monitorData:{
            show:false,
            name:'',
          },
          monitorButtons: [
            {name:'灰库异常分布',url:require('@/assets/image/异常.png')},
            // {name:'采集时间配置',url:require('@/assets/image/时间.png')},
            {name:'即采数据显示',url:require('@/assets/image/数据.png')},
            {name:'历史数据查询',url:require('@/assets/image/历史数据.png')},
            {name:'数据可视平台',url:require('@/assets/image/数据可视化.png')}
          ],
          currentMonitor: '监测硬件配置',
        };
    },
     components:{ 
      AutoTypeParese,
      queryHistory,
      abnormalDate
      // setPower,
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
        this.monitorData.show = data.show;
        this.monitorData.name = data.name || '';
        this.currentMonitor = data.name || '灰库异常分布';
        // if(this.monitorData.name === '历史数据查询'){
        //   window.open('http://127.0.0.1:5502/public/dist/dataVistual.html')
        //   this.monitorData.name = '监测硬件配置';
        //   this.currentMonitor = '监测硬件配置';
        //   EventBus.$emit('updateCurrentMonitor', '监测硬件配置');
        // }
      },
      changeMonitor(item) {
        this.currentMonitor = item;
        this.monitorData.name = item;
        // EventBus.$emit('updateCurrentMonitor', item);
        if (item === '数据可视平台') {
          window.open('http://127.0.0.1:5502/public/dist/dataVistual.html')
          this.monitorData.name = '灰库异常分布';
          this.currentMonitor = '灰库异常分布';
          EventBus.$emit('updateCurrentMonitor', '灰库异常分布');
        }
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
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    border-radius: 6px;
    border: 1px solid rgba(0, 110, 255, 0.733);
    box-shadow: 
        0 0 20px rgba(0, 140, 255, 0.685),
        inset 0 0 30px rgba(0, 212, 255, 0.1);
    // background: linear-gradient(135deg, rgba(0, 40, 80, 0.8) 0%, rgba(0, 20, 40, 0.9) 100%);
    backdrop-filter: blur(5px);
    
    p { 
      color: white;
      flex: 0.1;
      margin: 0; 
      padding: 8px; 
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
        border: 1px solid rgba(0, 110, 255, 0.733);
        border-radius: 6px;
        padding: 1vw 1.25vw;
        width: 91.8%;
        height: 87%;
        margin: 0 auto;
        box-shadow: 
          0 0 20px rgba(0, 140, 255, 0.685),
          inset 0 0 30px rgba(0, 212, 255, 0.1);
        backdrop-filter: blur(5px);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
    }
    .changeButton{
      flex: 0.2;
      display: flex;
      flex-direction: column;
      z-index: 2000;
      justify-content: center;
      align-items: center;
      
      .image-container {
        flex: 0.5;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.4vw;
        white-space: nowrap;
        padding: 0 0.5vw;
        width: 56.4%;
        justify-content: center;
        
        .image-item {
          flex: 1;
          height: 90%;
          max-width: calc(25% - 6px);
          
          .custom-image {
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, #004499 0%, #003366 100%);
            border: 1px solid #0088ff;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            overflow: hidden;
            
            img {
              max-width: 48%;
              max-height: 48%;
              object-fit: contain;
              padding: 5px;
            }
            
            &.active {
              background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
              border: 1px solid #00aaff;
              border-bottom: 3px solid #00ffff;
              box-shadow: 0 4px 12px rgba(0, 255, 255, 0.6);
              transform: scale(1.02);
              
              img {
                filter: brightness(1.1);
              }
            }
          }
        }
      }
      
      .button-container {
        flex: 0.5;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0.4vw;
        white-space: nowrap;
        padding: 0 0.5vw;
        width: 100%;
        
        .monitor-btn {
          padding: 10px 20px;
          font-size: 14px;
          color: #ffffff;
          background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
          border: 1px solid #0088ff;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
          
          &:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          &:hover {
            background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
            border-color: #00aaff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 136, 255, 0.4);
            transform: translateY(-2px);
          }
          
          &:hover:before {
            left: 100%;
          }
          
          &.active {
            background: linear-gradient(180deg, #004499 0%, #003366 100%);
            border: 1px solid #0066cc;
            color: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(0, 136, 255, 0.5);
          }
        }
      }
    }
}
</style>