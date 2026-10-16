<template>
<section class="monitor" v-show="monitorData.show">
    <!-- <p>{{monitorData.name}}</p> -->
    <div class="fuction">
      <div class="main-window">
        <AutoTypeParese v-show="!layerMode && monitorData.name === '即采数据显示'"></AutoTypeParese>
        <queryHistory v-show="!layerMode && monitorData.name === '历史数据查询'"></queryHistory>
        <abnormalDate v-show="!layerMode && monitorData.name === '传感异常分布'"></abnormalDate>
        <!-- 传感器分层浏览 -->
        <div v-show="layerMode" class="layer-picker">
          <div class="lp-head">
            <span class="lp-title">传感器分层浏览（01 ~ 16 层）</span>
            <span class="lp-sub">点击下方按钮或场景中的传感器模型选取某一层</span>
          </div>
          <div class="lp-grid">
            <button v-for="n in 16" :key="n" class="lp-item" :class="{ on: activeLayer === n }"
              @click="chooseLayer(n)">
              {{ pad2(n) }} 层
            </button>
          </div>
          <div class="lp-tip" v-if="activeLayer">当前查看：第 {{ pad2(activeLayer) }} 层</div>
          <div class="lp-actions">
            <button class="lp-back" @click="backLayerMode">返回上一级</button>
          </div>
        </div>
      </div>
      <!-- <setPower v-show="monitorData.name === '监测硬件配置'"></setPower> -->
      
    </div>

    <generalButton :monitorButtons="monitorButtons" :currentMonitor="currentMonitor" @change="changeMonitor" :styles="{width: '28vw'}"></generalButton>
</section>
</template>

<script>
import EventBus from '@/bus';
import { selectSensorLayer, exitSensorLayers } from '@/three/sensorLayers';
import AutoTypeParese from '../components/subcomponets/autoTypeParese.vue';
import queryHistory from '../components/subcomponets/queryHistory.vue';
import abnormalDate from '../components/subcomponets/abnormalDate.vue';
import generalButton from '../components/generalButton.vue';
export default {
    name: 'monitorH',
    data() {
        return {
          monitorData:{
            show:false,
            name:'',
          },
          layerMode: false,
          activeLayer: null,
          monitorButtons: [
            {name:'数据孪生平台',url:require('@/assets/image/数据可视化.png')},
            {name:'传感异常分布',url:require('@/assets/image/异常.png')},
            // {name:'采集时间配置',url:require('@/assets/image/时间.png')},
            {name:'历史数据查询',url:require('@/assets/image/历史数据.png')},
            {name:'即采数据显示',url:require('@/assets/image/数据.png')}
          ],
          currentMonitor: '传感异常分布',
        };
    },
     components:{
      AutoTypeParese,
      queryHistory,
      abnormalDate,
      generalButton
      // setPower,
    },
     computed: {

    },
    mounted() {
      EventBus.$on('changeMonitorUI', this.updateMonitor);
      EventBus.$on('sensorLayerSelected', this.onSensorLayerSelected);
    },
    beforeDestroy() {
      EventBus.$off('changeMonitorUI', this.updateMonitor);
      EventBus.$off('sensorLayerSelected', this.onSensorLayerSelected);
    },
    methods: {
      pad2(n) {
        return String(n).padStart(2, '0');
      },
      enterLayer(layer) {
        this.layerMode = true;
        this.activeLayer = layer || null;
      },
      onSensorLayerSelected(layer) {
        this.monitorData.show = true;
        this.currentMonitor = '数据孪生平台';
        this.monitorData.name = '数据孪生平台';
        this.enterLayer(layer);
      },
      chooseLayer(layer) {
        this.activeLayer = layer;
        if (selectSensorLayer(layer)) {
          EventBus.$emit('layerViewEnter', layer);
        }
      },
      backLayerMode() {
        this.layerMode = false;
        this.activeLayer = null;
        exitSensorLayers();
        this.monitorData.name = '传感异常分布';
        this.currentMonitor = '传感异常分布';
        EventBus.$emit('updateCurrentMonitor', '传感异常分布');
      },
      updateMonitor(data){
        this.monitorData.show = data.show;
        this.monitorData.name = data.name || '';
        this.currentMonitor = data.name || '传感异常分布';
        this.layerMode = false;
        this.activeLayer = null;
        if (!data.show) {
          exitSensorLayers();
        }
        // if(this.monitorData.name === '历史数据查询'){
        //   window.open('http://127.0.0.1:5502/public/dist/dataVistual.html')
        //   this.monitorData.name = '监测硬件配置';
        //   this.currentMonitor = '监测硬件配置';
        //   EventBus.$emit('updateCurrentMonitor', '监测硬件配置');
        // }
      },
      changeMonitor(item) {
        if (item === '数据孪生平台') {
          // 不再跳转外部网页,改为打开"数字孪生"全屏界面(左右状态栏)
          EventBus.$emit('dataTwinEnter');
          return;
        }
        this.layerMode = false;
        this.activeLayer = null;
        exitSensorLayers();
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
        padding: 0.5vw 1vw;
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
        gap: 0.7vw;
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
    // ============ 传感器分层选取 ============
    .layer-picker {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      gap: 1vh;
      padding: 1vh 0.2vw;
    }
    .lp-head {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4vh;
      flex: none;
    }
    .lp-title {
      font-size: 1.05vw;
      color: #00d4ff;
      letter-spacing: 2px;
      text-shadow: 0 0 6px rgba(0, 212, 255, 0.6);
    }
    .lp-sub {
      font-size: 0.68vw;
      color: #9cc4e8;
    }
    .lp-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5vw;
      flex: 1;
      align-content: start;
      overflow-y: auto;
      padding: 0.4vh 0;
    }
    .lp-item {
      padding: 0.9vh 0;
      font-size: 0.8vw;
      color: #ffffff;
      background: linear-gradient(180deg, #004499 0%, #003366 100%);
      border: 1px solid rgba(0, 140, 255, 0.6);
      border-radius: 0.3vw;
      cursor: pointer;
      transition: all 0.2s ease;
      text-shadow: 0 0 4px rgba(0, 140, 255, 0.3);
      letter-spacing: 1px;
    }
    .lp-item:hover {
      background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
      border-color: #00aaff;
      box-shadow: 0 0 0.6vw rgba(0, 140, 255, 0.5);
    }
    .lp-item.on {
      background: linear-gradient(180deg, #00b3ff 0%, #0088cc 100%);
      border-color: #00eaff;
      box-shadow: 0 0 0.8vw rgba(0, 255, 255, 0.55);
      color: #02121f;
      font-weight: 600;
    }
    .lp-tip {
      text-align: center;
      font-size: 0.78vw;
      color: #00ffd0;
      text-shadow: 0 0 5px rgba(0, 255, 208, 0.4);
      flex: none;
    }
    .lp-actions {
      display: flex;
      justify-content: center;
      flex: none;
    }
    .lp-back {
      padding: 0.6vh 2vw;
      font-size: 0.78vw;
      color: #ffffff;
      background: linear-gradient(180deg, #7a1f1f 0%, #4d1212 100%);
      border: 1px solid rgba(255, 120, 120, 0.5);
      border-radius: 0.3vw;
      cursor: pointer;
      letter-spacing: 2px;
      transition: all 0.2s ease;
    }
    .lp-back:hover {
      background: linear-gradient(180deg, #a52f2f 0%, #6d1a1a 100%);
      box-shadow: 0 0 0.8vw rgba(255, 80, 80, 0.5);
    }

}
</style>