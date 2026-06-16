<template>
  <div class="main">
    <big-control class="control" ></big-control>
    <drawerT :show="showDrawer"></drawerT>

    <!-- ========== [加载动画] 开始 ========== -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring spinner-ring--reverse"></div>
        <div class="spinner-dot"></div>
      </div>
      <p class="loading-text">模型加载中...</p>
    </div>
    <!-- ========== [加载动画] 结束 ========== -->

    <div id="screen" class="screen">
      <monitorH></monitorH>
      <deviceControl></deviceControl>
      <healthyAssess></healthyAssess>
      <saleAnalyse></saleAnalyse>
      <flowMonitoring></flowMonitoring>
      <button class="fullscreen-btn" @click="toggleFullscreen" title="全屏">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H10V10H4V4Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 4H20V10H14V4Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 14H10V20H4V14Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 14H20V20H14V14Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import ZThree from '@/three/ZThree.js'
import * as THREE from 'three'
import { loaderModel } from '@/three/loaderModel.js'
import bigControl from '@/views/bigControl'
import TWEEN from 'three/examples/jsm/libs/tween.module.js'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { cssRender } from '@/three/cssRender'
import { createReprocessing } from '@/three/reprocessing';
import { darkMaterial } from '@/three/material'
import {addParkWater} from '@/three/parkWater'
import monitorH from '@/components/monitorH.vue'
import drawerT from '@/components/drawerT.vue';
import healthyAssess from '@/components/healthyAssess.vue'
import deviceControl from '@/components/deviceControl.vue'
import saleAnalyse from '@/components/saleAnalyse.vue'
import flowMonitoring from '@/components/flowMonitoring.vue'
let app, camera, scene, renderer, controls, clock, reprocessing, materials={}
export default {
  name: 'HomeView',
  components: { bigControl,monitorH,drawerT,healthyAssess,deviceControl,saleAnalyse,flowMonitoring },
  data() {
    return {
      showDrawer: true, // 默认首页显示侧拉框
      // [加载动画]
      loading: false
    }
  },
  methods: {
    async initZThree() {
      app = await new ZThree('screen');
      console.log(app);
      
      app.initThree()
      // app.initHelper()
      app.initOrbitControls()
      app.initLight()
      window.app = app

      app.cameraPosition = [-10, 20, 67]
      app.controlsTarget = [-10, 10, 0]

      controls = app.controls
      controls.target.set(...app.controlsTarget)
      clock = new THREE.Clock()
      camera = app.camera
      camera.position.set(...app.cameraPosition)
      scene = app.scene
      renderer = app.renderer
      // console.log(app.camera);
      
      // 开启辉光
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      // 开启场景投影
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      let instance = new cssRender(CSS3DRenderer, app)
      app.cssRenderer = instance.cssRenderer
      app.instance = instance

      //开启辉光
      reprocessing = createReprocessing(app)

      // [加载动画] 显示loading → 加载模型 → 隐藏loading
      this.loading = true
      await this.$nextTick()
      await loaderModel(app)
      this.loading = false
      // console.log(app);
      app.render(() => {
        const delta = clock.getDelta()
        // 确保 controls 使用最新的相机
        // if (app.controls && app.controls.object !== app.camera) {
        //   app.controls.object = app.camera;
        //   app.controls.update();
        // }
        controls.update(delta)
        if (app.mixer) app.mixer.update(delta);
        // console.log(app.camera);
        renderer.render(scene, app.camera)
        // console.log(1);
        
        // console.log(app.camera);
        // console.log(app);
        


        // 开启辉光
        scene.traverse(this.darkenNonBloomed)
        reprocessing.render()
        scene.traverse(this.restoreMaterial)
        app.finalComposer.render()

        app.cssRenderer.render(scene, app.camera)
        TWEEN.update()
      })
    
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },
    //开启辉光
    darkenNonBloomed(obj) {
      if (obj.isMesh && app.bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
      }
    },
    restoreMaterial(obj) {
      if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
      }
    }

  },
  mounted() {
    this.initZThree();
    // 监听 bigControl 的激活模块变化，只有在“首页”时显示 drawerT
    this._onBigControlActive = (name) => { this.showDrawer = (name === '科创项目简介'); };
    this.$EventBus.$on('bigcontrol-active', this._onBigControlActive);
  },
  beforeDestroy() {
    try{ this.$EventBus.$off('bigcontrol-active', this._onBigControlActive); }catch(e){console.log(e);
    }
  },
 
}
</script>

<style lang="less">
// ==================== [加载动画] 样式开始 ====================
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(0, 20, 40, 0.95) 0%, rgba(0, 0, 0, 1) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;

  &--reverse {
    width: 60px;
    height: 60px;
    top: 10px;
    left: 10px;
    border-top-color: #3e9ae0;
    animation-direction: reverse;
    animation-duration: 0.8s;
  }
}

.spinner-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #00d4ff;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.6), 0 0 24px rgba(0, 212, 255, 0.3);
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-text {
  margin-top: 24px;
  color: rgba(0, 212, 255, 0.8);
  font-size: 14px;
  letter-spacing: 4px;
  animation: flicker 2s ease-in-out infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.5; }
}
@keyframes flicker {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}
// ==================== [加载动画] 样式结束 ====================

.main {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;

  .control {
    // height: 70%;
    position: absolute;
    top: 10%;
    // bottom: 3%;
    border-radius: 5%;
    left: 90%;
    width: 20%;
    transform: translateX(-50%);
    z-index: 3;
    // float: left;
    font-size: 30px;
    display: flex;
    justify-content: center;
  }
} 

.screen {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  
  .fullscreen-btn {
    position: absolute;
    bottom: 40px;
    right: 40px;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, rgba(0, 64, 128, 0.8) 0%, rgba(0, 32, 64, 0.9) 100%);
    border: 1px solid rgba(0, 212, 255, 0.5);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
    z-index: 1000;
    
    &:hover {
      background: linear-gradient(135deg, rgba(0, 96, 192, 0.8) 0%, rgba(0, 48, 96, 0.9) 100%);
      border-color: #00d4ff;
      box-shadow: 0 6px 16px rgba(0, 212, 255, 0.5);
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}
</style>