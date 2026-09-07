<template>
  <div class="main">
    <big-control v-show="!showRobotView && !layerView && !dtOpen" class="control"></big-control>
    <drawerT :show="showDrawer && !showRobotView"></drawerT>
    <img v-if="showRobotView" class="robot-back-btn" src="@/assets/image/back.png" alt="返回首页" @click="backFromRobot" />
    
    <!-- 机器人遥控界面 -->
    <controlBtn v-if="showRobotView" />

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
      <div class="ui-wrap" v-show="!layerView && !dtOpen">
        <monitorH></monitorH>
      </div>
      <deviceControl></deviceControl>
      <healthyAssess></healthyAssess>
      <saleAnalyse></saleAnalyse>
      <flowMonitoring></flowMonitoring>
      <!-- 分层沉浸视图 -->
      <div class="layer-view-tag" v-show="layerView">
        <span class="lvt-label">第 {{ padNo(layerViewNo) }} 层</span>
        <button class="lvt-back" @click="leaveLayerView">返回</button>
      </div>
      <button class="fullscreen-btn" @click="toggleFullscreen" title="全屏">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H10V10H4V4Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 4H20V10H14V4Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 14H10V20H4V14Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 14H20V20H14V14Z" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
        <!-- 数据孪生全屏界面 -->
    <digital-twin :open="dtOpen" :mini="dtMini" @close="closeDigitalTwin"></digital-twin>
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
import { createReprocessing } from '@/three/reprocessing'
import { darkMaterial } from '@/three/material'
import { initRobotMark, setRobotMarkVisible, setRobotModelVisible, setPipesVisible, stopRobotAnimations, resetRobotNodes, destroyRobotMark } from '@/three/robot'
import { initSensorLayers, exitSensorLayers, selectSensorLayer, getActiveLayer, pickableMeshes, meshLayer, setSensorBaseScale, setHoverSensor, clearHoverSensor, applySensorStatuses, clearSensorStatuses, pulseSensorStatuses } from '@/three/sensorLayers'
import monitorH from '@/components/monitorH.vue'
import drawerT from '@/components/drawerT.vue'
import healthyAssess from '@/components/healthyAssess.vue'
import deviceControl from '@/components/deviceControl.vue'
import saleAnalyse from '@/components/saleAnalyse.vue'
import flowMonitoring from '@/components/flowMonitoring.vue'
import controlBtn from '@/components/controlBtn.vue'
import digitalTwin from '@/components/digitalTwin.vue'

let app, camera, scene, renderer, controls, clock, reprocessing, materials={}
// 进入监测时传感器的整体放大倍数(便于观察/点选)，离开时还原为1
const SENSOR_BASE_SCALE = 1.8
// 点击时允许的屏幕吸附距离(px)，点不中时自动吸附最近的传感器
const PICK_TOLERANCE = 22
export default {
  name: 'HomeView',
  components: { bigControl,monitorH,drawerT,healthyAssess,deviceControl,saleAnalyse,flowMonitoring,controlBtn,digitalTwin },
  data() {
    return {
      showDrawer: true, // 默认首页显示侧拉框
      showRobotView: false, // 清灰机器人视角
      monitoringOn: false, // 孪生健康监测界面是否显示(启用传感器点选)
      layerView: false, // 选层后的沉浸视图(隐藏选取框与模块栏)
      layerViewNo: null, // 当前沉浸视图的层号
      dtOpen: false, // 数据孪生全屏界面是否打开
      dtMini: { title: '', series: [], categories: [], fulls: [] }, // 数字孪生右栏内嵌折线图数据
      // [加载动画]
      loading: false
    }
  },
  methods: {
    async initZThree() {
      app = await new ZThree('screen');
      
      app.initThree()
      // app.initHelper()
      app.initOrbitControls()
      app.initLight()
      app.initSky()
      window.app = app
      
      app.cameraPosition = [-10, 10, 60]
      app.controlsTarget = [-10, 12, 0]

      controls = app.controls
      controls.target.set(...app.controlsTarget)
      clock = new THREE.Clock()
      camera = app.camera
      camera.position.set(...app.cameraPosition)
      scene = app.scene
      renderer = app.renderer
      
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
      initSensorLayers(app)
      this.bindSensorPicking()
      this.loading = false
      console.log(app);
      initRobotMark(app);
      app.render(() => {
        const delta = clock.getDelta()
        controls.update(delta)
        if (app.mixer) app.mixer.update(delta);
        renderer.render(scene, app.camera)
        // 开启辉光
        scene.traverse(this.darkenNonBloomed)
        reprocessing.render()
        scene.traverse(this.restoreMaterial)
        app.finalComposer.render()

        app.cssRenderer.render(scene, app.camera)
        TWEEN.update()
        pulseSensorStatuses(performance.now() / 1000)
      })
    
    },
    backFromRobot() {
      this.showRobotView = false;
      stopRobotAnimations(app);
      setRobotMarkVisible(app, true);
      setRobotModelVisible(app, false);
      setPipesVisible(app, true);
      if (app && app.controls) app.controls.enablePan = true;
      if (app && app.cameraPosition) {
        app.flyTo({
          position: app.cameraPosition,
          controls: app.controlsTarget
        });
      }
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
     // 绑定场景内传感器拾取：悬停高亮 + 点击选取/弹图(带吸附容差)
    bindSensorPicking() {
      if (this._sensorPickBound) return;
      const dom = renderer.domElement;
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const tmp = new THREE.Vector3();
      const targets = () => pickableMeshes().filter(o => o.visible);

      const raycastSensor = (e) => {
        const rect = dom.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObjects(targets(), false);
        return hits.length ? hits[0].object : null;
      };

      const nearestSensor = (e, maxPx) => {
        const rect = dom.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        if (app && app.scene) app.scene.updateMatrixWorld(true);
        let best = null;
        let bestD = maxPx * maxPx;
        targets().forEach(o => {
          tmp.setFromMatrixPosition(o.matrixWorld);
          tmp.project(camera);
          if (tmp.z > 1 || tmp.z < -1) return;
          const sx = ((tmp.x + 1) / 2) * rect.width;
          const sy = ((-tmp.y + 1) / 2) * rect.height;
          const dx = sx - cx;
          const dy = sy - cy;
          const d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; best = o; }
        });
        return best;
      };

      const onMove = (e) => {
        if (!this.monitoringOn) {
          clearHoverSensor();
          dom.style.cursor = '';
          return;
        }
        const hit = raycastSensor(e);
        if (hit) {
          setHoverSensor(hit);
          dom.style.cursor = 'pointer';
        } else {
          clearHoverSensor();
          dom.style.cursor = '';
        }
      };

      const onPick = (e) => {
        clearHoverSensor();
        dom.style.cursor = '';
        if (!this.monitoringOn) return;
        let obj = raycastSensor(e);
        if (!obj) obj = nearestSensor(e, PICK_TOLERANCE);
        if (!obj) return;
        const layer = meshLayer(obj);
        if (layer == null) return;
        // 数字孪生界面：点击传感器 -> 显示到右栏内嵌折线图
        if (this.dtOpen) {
          this.showSensorChart(obj);
          return;
        }
        if (getActiveLayer() != null) return; // 已选层(非数字孪生)时点击不再弹窗
        // 尚未选层 -> 点击选取该传感器所在层
        if (selectSensorLayer(layer)) {
          this.$EventBus.$emit('sensorLayerSelected', layer);
          this.enterLayerView(layer);
        }
      };

      this._sensorPickFn = onPick;
      this._sensorHoverFn = onMove;
      dom.addEventListener('click', onPick);
      dom.addEventListener('pointermove', onMove);
      this._sensorPickBound = true;
    },
    _setMonitoringOn(data) {
      this.monitoringOn = !!(data && data.show);
    },
    padNo(n) {
      if (n == null) return '--';
      return String(n).padStart(2, '0');
    },
    enterLayerView(layer) {
      this.layerView = true;
      this.layerViewNo = layer;
    },
    leaveLayerView() {
      // 退出沉浸视图：回到上一层级，即“数据孪生平台”选层界面，保留当前选中层效果
      this.layerView = false;
      this.layerViewNo = null;
    },
    makeMockMini() {
      const times = ['08:00', '08:10', '08:20', '08:30', '08:40', '08:50', '09:00', '09:10', '09:20', '09:30'];
      return {
        title: '传感器ID 00001(模拟)',
        series: [{ name: '应变值(με)', values: [3180, 3210, 3205, 3240, 3230, 3270, 3260, 3290, 3320, 3310] }],
        categories: times,
        fulls: times.map(t => '2026-09-06 ' + t + ':00')
      };
    },
    openDigitalTwin() {
      this.dtOpen = true;
      this.$EventBus.$emit('setClock', false); // 进入数字孪生隐藏右上角时间
      this.dtMini = this.makeMockMini(); // 先显示模拟传感器图表
      this.flyToSiloCenter(); // 相机移动到钢板库中心
      // 仅在数字孪生模块里给传感器上颜色预警,并周期刷新
      this.refreshSensorStatus();
      if (!this._statusTimer) {
        this._statusTimer = setInterval(() => this.refreshSensorStatus(), 60000);
      }
    },
    flyToSiloCenter() {
      if (!app || !app.model) return;
      const box = new THREE.Box3();
      let found = false;
      app.model.traverse((o) => {
        if (o.isMesh && /钢板库/.test(o.name || '')) {
          box.expandByObject(o);
          found = true;
        }
      });
      const fallback = () => {
        app.flyTo({
          position: app.cameraPosition || [-10, 10, 60],
          controls: app.controlsTarget || [-10, 12, 0],
          duration: 900
        });
      };
      if (!found) { fallback(); return; }
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const radius = size.length() / 2;
      const dist = Math.min(120, Math.max(48, radius * 1.35));
      // 相机在钢板库正前方、与中心同高平视
      const pos = new THREE.Vector3(center.x, center.y, center.z + dist);
      app.flyTo({
        position: [pos.x, pos.y, pos.z],
        controls: [center.x, center.y, center.z],
        duration: 1000,
        easing: TWEEN.Easing.Quadratic.InOut
      });
    },
    closeDigitalTwin() {
      this.dtOpen = false;
      this.$EventBus.$emit('setClock', true);
      clearHoverSensor();
      exitSensorLayers(); // 还原选层效果(钢板库/桥架透明度、隐藏模型等)
      clearSensorStatuses(); // 还原传感器预警颜色材质为原始材质
      if (this._statusTimer) {
        clearInterval(this._statusTimer);
        this._statusTimer = null;
      }
      this.$EventBus.$emit('changeMonitorUI', { show: true, name: '传感异常分布' });
    },
    // 物体名字第13位后的数字即传感器ID，如 应变计GBC01-A-L-33199 -> 33199
    sensorIdFromName(name) {
      if (!name) return null;
      const m = /^(\d+)/.exec(name.slice(13));
      return m ? parseInt(m[1], 10) : null;
    },
    async fetchSensorData() {
      if (this._sensorCache) return this._sensorCache;
      const res = await fetch('http://47.97.3.132/api/query/data?limit=5000');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : ((json && json.data) || []);
      this._sensorCache = arr;
      return arr;
    },
    // 采集时间 -> 只取 "时:分"(不含年份)，完整时间放到悬浮提示里
    formatTimeLabel(t) {
      if (t === null || t === undefined || t === '') return '';
      const s = String(t);
      const d = new Date(s.indexOf(' ') > 0 ? s.replace(' ', 'T') : s);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return hh + ':' + mm;
      }
      // 解析失败时也只保留时刻,避免把完整日期(含年份)显示到X轴
      const m = s.match(/(\d{1,2}):(\d{2})/);
      if (m) return String(m[1]).padStart(2, '0') + ':' + m[2];
      return '';
    },
    valOf(row, key) {
      const raw = row[key];
      if (raw === null || raw === undefined || raw === '') return null;
      const v = Number(raw);
      return Number.isNaN(v) ? null : v;
    },
    buildChartData(rows) {
      const categories = rows.map(r => this.formatTimeLabel(r['采集时间']));
      const fulls = rows.map(r => (r['采集时间'] != null && r['采集时间'] !== '') ? String(r['采集时间']) : '');
      const has = key => rows.some(r => r[key] !== null && r[key] !== undefined && r[key] !== '');
      let type = '';
      for (let i = 0; i < rows.length; i++) {
        if (rows[i]['传感器类型']) { type = String(rows[i]['传感器类型']); break; }
      }
      const series = [];
      // 倾角计：X/Y两个方向的倾角画成两根不同颜色折线
      if (/倾角/.test(type)) {
        if (has('X向倾角(°)')) series.push({ name: 'X向倾角(°)', values: rows.map(r => this.valOf(r, 'X向倾角(°)')) });
        if (has('Y向倾角(°)')) series.push({ name: 'Y向倾角(°)', values: rows.map(r => this.valOf(r, 'Y向倾角(°)')) });
      }
      if (!series.length) {
        const candidates = ['应变值(με)', '沉降值(mm)', 'X向倾角(°)', 'Y向倾角(°)', '频率(Hz)', '温度(°C)'];
        let metric = null;
        if (/应力|应变/.test(type)) metric = '应变值(με)';
        else if (/沉降/.test(type)) metric = '沉降值(mm)';
        else if (/倾角/.test(type)) metric = 'X向倾角(°)';
        else if (/温湿度|温度/.test(type)) metric = '温度(°C)';
        if (!metric) {
          for (const c of candidates) {
            if (has(c)) { metric = c; break; }
          }
        }
        if (!metric) metric = candidates[0];
        series.push({ name: metric, values: rows.map(r => this.valOf(r, metric)) });
      }
      return { series, categories, fulls };
    },
    // 在数字孪生里点击传感器 -> 把近10次数据画到右栏内嵌折线图
    async showSensorChart(mesh) {
      const name = (mesh && mesh.name) || '';
      const id = this.sensorIdFromName(name);
      this._miniSeq = (this._miniSeq || 0) + 1;
      const req = this._miniSeq;
      const title = id != null ? ('传感器ID ' + id) : (name || '传感器');
      this.dtMini = { title, series: [], categories: [], fulls: [] };
      if (id == null) return;
      try {
        const all = await this.fetchSensorData();
        const mine = all.filter(r => String(r['传感器ID']) === String(id));
        const recent = mine.slice(0, 10).reverse();
        const { series, categories, fulls } = this.buildChartData(recent);
        if (req === this._miniSeq && this.dtOpen) {
          this.dtMini = { title, series, categories, fulls };
        }
      } catch (e) {
        console.error('获取传感器近10次数据失败', e);
        if (req === this._miniSeq && this.dtOpen) {
          this.dtMini = { title, series: [], categories: [], fulls: [] };
        }
      }
    },
    // 拉取三类传感器状态接口,给传感器模型上色:0绿 1黄 2橙 3红闪烁
    async refreshSensorStatus() {
      const fetchRows = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const j = await res.json();
        return (Array.isArray(j) ? j : (j && j.data)) || [];
      };
      try {
        const [settle, tilt, strain] = await Promise.all([
          fetchRows('http://47.97.3.132/api/query/settlementstatus?limit=7'),
          fetchRows('http://47.97.3.132/api/query/tiltstatus?limit=8'),
          fetchRows('http://47.97.3.132/api/query/strainstatus?limit=197')
        ]);
        const map = {};
        // 规则与 dealAlarmData 一致：状态1/2直接使用；状态非0且非1/2(如null等)归为3(红闪)；0为正常绿
        settle.concat(tilt, strain).forEach((r) => {
          const id = r['传感器ID'];
          if (id == null) return;
          const raw = r['状态'];
          let eff;
          if (raw === 0 || raw === '0') eff = 0;
          else if (raw === 1 || raw === '1') eff = 1;
          else if (raw === 2 || raw === '2') eff = 2;
          else eff = 3;
          map[String(id)] = eff;
        });
        applySensorStatuses(map);
      } catch (e) {
        console.error('刷新传感器状态失败', e);
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
    this._onBigControlActive = (name) => {
      this.showDrawer = (name === '科创项目简介');
      if (app && app.sky) app.sky.visible = (name !== '灰库运行工艺');
      if (name === '孪生健康监测') {
        this.monitoringOn = true;
        setSensorBaseScale(app, SENSOR_BASE_SCALE);
      } else {
        this.monitoringOn = false;
        clearHoverSensor();
        this.layerView = false;
        this.layerViewNo = null;
        exitSensorLayers();
        setSensorBaseScale(app, 1);
      }
      // 只有首页显示机器人廊道标记
      setRobotMarkVisible(app, name === '科创项目简介');
    };
    this.$EventBus.$on('bigcontrol-active', this._onBigControlActive);
    // 点击机器人标记进入机器人视角
    this._onRobotView = (show) => {
      this.showRobotView = !!show;
      if (show) {
        resetRobotNodes(app); // 左右键/起伏键回到零点
        setRobotMarkVisible(app, false);
        setRobotModelVisible(app, true);
        setPipesVisible(app, false);
      } else {
        stopRobotAnimations(app);
        setRobotModelVisible(app, false);
        setPipesVisible(app, true);
      }
    };
    this._onMonitorUI = (data) => { this._setMonitoringOn(data); };
    this._onLayerViewEnter = (layer) => { this.enterLayerView(layer); };
    this._onDataTwinEnter = () => { this.openDigitalTwin(); };
    this.$EventBus.$on('robotView', this._onRobotView);
    this.$EventBus.$on('changeMonitorUI', this._onMonitorUI);
    this.$EventBus.$on('layerViewEnter', this._onLayerViewEnter);
    this.$EventBus.$on('dataTwinEnter', this._onDataTwinEnter);
  },
  beforeDestroy() {
    try{ this.$EventBus.$off('bigcontrol-active', this._onBigControlActive); }catch(e){console.log(e);
    }
    this.$EventBus.$off('robotView', this._onRobotView);
    destroyRobotMark(app);
    try{ this.$EventBus.$off('changeMonitorUI', this._onMonitorUI); }catch(e){console.log(e); }
    try{ this.$EventBus.$off('layerViewEnter', this._onLayerViewEnter); }catch(e){console.log(e); }
    try{ this.$EventBus.$off('dataTwinEnter', this._onDataTwinEnter); }catch(e){console.log(e); }
    if (this._statusTimer) {
      clearInterval(this._statusTimer);
      this._statusTimer = null;
    }
    if (renderer && renderer.domElement) {
      if (this._sensorPickFn) renderer.domElement.removeEventListener('click', this._sensorPickFn);
      if (this._sensorHoverFn) renderer.domElement.removeEventListener('pointermove', this._sensorHoverFn);
    }
    clearHoverSensor();
    clearSensorStatuses();
    this._sensorPickBound = false;
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

  .robot-back-btn {
    position: fixed;
    bottom: 40px;
    left: 40px;
    width: 48px;
    height: 48px;
    cursor: pointer;
    z-index: 1001;
    opacity: 0.9;
    transition: all 0.3s ease;

    &:hover {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  .control {
    // height: 70%;
    position: absolute;
    top: 50%;
    // bottom: 3%;
    border-radius: 5%;
    left: 90%;
    width: 20%;
    transform: translate(-50%, -50%);
    z-index: 3;
    // float: left;
    font-size: 1.5vw;
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
    bottom: 2vw;
    right: 2vw;
    width: 2.4vw;
    height: 2.4vw;
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