<template>
  <div class="main">
    <big-control class="control"></big-control>
    <div id="screen" class="screen">
      <monitorH></monitorH>
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
let app, camera, scene, renderer, controls, clock, reprocessing, materials={}
export default {
  name: 'HomeView',
  components: { bigControl,monitorH },
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

      await loaderModel(app)
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
    
    }
    //开启辉光
    ,
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
  },
 
}
</script>

<style lang="less">
.main {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;

  .control {
    // height: 70%;
    position: absolute;
    top: 20%;
    // bottom: 3%;
    border-radius: 5%;
    left: 80%;
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
}
</style>