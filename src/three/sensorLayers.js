import * as THREE from 'three'
import TWEEN from 'three/examples/jsm/libs/tween.module.js'

// 传感器放大倍数
const ENLARGE = 2.5
// 悬停时再放大倍数(在基础放大之上)
const HOVER_SCALE = 1.4
// 悬停高亮颜色
const HOVER_COLOR = 0x00e5ff
// 钢板库透视后的不透明度
const GATE_OPACITY = 0.12
// 桥架模型透视后的不透明度
const BRIDGE_OPACITY = 0.15
// 桥架/竖向结构模型的名字匹配
const BRIDGE_RE = /桥架|竖向|桁架/
// 变透明模型的材质颜色(淡蓝色)
const FADE_TINT = 0x5a9bff

const state = {
  app: null,
  byLayer: new Map(),   // 层号(1~16) -> 该层传感器mesh数组
  allSensors: [],       // 所有带层号的传感器mesh
  gateMeshes: [],       // 钢板库 mesh
  bridgeRoots: [],      // 名字含"桥架/竖向"的根节点(可能是组或网格)
  bridgeMeshes: [],     // 实际需要淡化的桥架/竖向结构网格
  auxNodes: [],         // 选层时需隐藏的辅助模型(中控室/smallstore)
  saved: new Map(),     // 每个被修改过的mesh的原始状态
  fadeOrig: new Map(), // 钢板库/桥架被淡化前的原始材质引用(还原时直接换回)
  fadeClone: new Map(), // 钢板库/桥架淡化用的克隆材质(还原时dispose释放)
  activeLayer: null,    // 当前选中的层
  hover: null,          // 当前悬停高亮的传感器 {obj, scale, material}
  status: {             // 传感器健康状态着色
    originals: new Map(), // obj -> 原始材质(用于还原)
    clones: [],           // 每次上色生成的克隆材质(还原时dispose)
    blink: [],            // 需要红色闪烁的传感器
  },
}

const _v = new THREE.Vector3()

// 从模型名字中解析传感器层号，如 "应变计GBC01-A-L-33199" -> 1，"倾角计GBC16-H-QJ63068" -> 16
export function layerOfName(name) {
  if (!name) return null
  const m = /GBC(\d+)/.exec(name)
  return m ? parseInt(m[1], 10) : null
}

export function initSensorLayers(app) {
  state.app = app || null
  state.byLayer.clear()
  state.allSensors = []
  state.gateMeshes = []
  state.bridgeRoots = []
  state.bridgeMeshes = []
  state.auxNodes = []
  if (!app || !app.model) return
  app.model.traverse((o) => {
    if (o.isMesh) {
      const L = layerOfName(o.name)
      if (L !== null && L >= 1 && L <= 16) {
        let arr = state.byLayer.get(L)
        if (!arr) {
          arr = []
          state.byLayer.set(L, arr)
        }
        arr.push(o)
        state.allSensors.push(o)
      } else if (/钢板库/.test(o.name || '')) {
        state.gateMeshes.push(o)
      }
    }
    if (BRIDGE_RE.test(o.name || '')) {
      state.bridgeRoots.push(o)
    }
    if (/中控室|smallstore|机器人廊道/.test(o.name || '')) {
      state.auxNodes.push(o)
    }
  })

  // 竖向桥架在运行时是"组"节点,真正的结构网格在其内部(立方体001_1等名字不含桥架)
  // 因此对每个桥架/竖向根节点,收集其内部所有"非传感器"网格用于淡化
  const bridgeSet = new Set()
  state.bridgeRoots.forEach((root) => {
    root.traverse((o) => {
      if (!o.isMesh) return
      if (layerOfName(o.name) !== null) return // 传感器不淡化
      if (/钢板库|中控室|smallstore|机器人廊道/.test(o.name || '')) return
      bridgeSet.add(o)
    })
  })
  state.bridgeMeshes = [...bridgeSet]
}

export function layerNumbers() {
  return [...state.byLayer.keys()].sort((a, b) => a - b)
}

export function pickableMeshes() {
  return state.allSensors
}

export function meshLayer(obj) {
  return layerOfName(obj && obj.name)
}

export function getActiveLayer() {
  return state.activeLayer
}

function remember(o) {
  if (state.saved.has(o)) return state.saved.get(o)
  const rec = {
    visible: o.visible,
    scale: o.scale ? o.scale.clone() : new THREE.Vector3(1, 1, 1),
    material: null,
  }
  const m = o.material
  if (m) {
    rec.material = {
      transparent: m.transparent,
      opacity: m.opacity,
      depthWrite: m.depthWrite,
      color: m.color ? m.color.clone() : null,
    }
  }
  state.saved.set(o, rec)
  return rec
}

// 记录钢板库/桥架淡化前的原始材质引用
function rememberFade(o) {
  if (state.fadeOrig.has(o)) return
  state.fadeOrig.set(o, o.material)
}

function restoreAll() {
  state.saved.forEach((rec, o) => {
    if (rec.visible !== undefined) o.visible = rec.visible
    if (rec.scale) o.scale.copy(rec.scale)
    const m = o.material
    if (m && rec.material) {
      m.transparent = rec.material.transparent
      m.opacity = rec.material.opacity
      m.depthWrite = rec.material.depthWrite
      if (rec.material.color && m.color) m.color.copy(rec.material.color)
      m.needsUpdate = true
    }
  })
  // 直接换回淡化前的原始材质引用,并释放淡化克隆材质,避免材质/程序堆积
  state.fadeOrig.forEach((origMat, o) => {
    if (origMat && o.material !== origMat) {
      o.material = origMat
      origMat.needsUpdate = true
    }
    const clone = state.fadeClone.get(o)
    if (clone && clone !== origMat) {
      clone.dispose()
    }
    state.fadeClone.delete(o)
  })
  state.fadeOrig.clear()
  state.saved.clear()
  state.activeLayer = null
  if (state.app && state.app.scene) state.app.scene.updateMatrixWorld(true)
}

function flyToFocus(target) {
  const app = state.app
  const camPos = app.camera.position.clone()
  const curTarget = app.controls.target.clone()
  const dir = _v.subVectors(camPos, curTarget)
  if (dir.lengthSq() < 1e-6) dir.set(0, 0.5, 1)
  const camDist = Math.min(45, Math.max(22, dir.length() * 0.4))
  dir.normalize()
  const pos = target.clone().addScaledVector(dir, camDist)
  app.flyTo({
    position: [pos.x, pos.y, pos.z],
    controls: [target.x, target.y, target.z],
    duration: 900,
    easing: TWEEN.Easing.Quadratic.InOut,
  })
}

// 选中某一层：放大该层传感器、隐藏其它层传感器、钢板库半透明，并飞向该层
export function selectSensorLayer(layer) {
  const num = Number(layer)
  if (!state.app || !state.byLayer.has(num)) return false

  clearHoverSensor()
  restoreAll()

  const meshes = state.byLayer.get(num) || []
  const centroid = new THREE.Vector3()

  meshes.forEach((o) => {
    const rec = remember(o)
    o.visible = true
    if (o.scale) o.scale.set(rec.scale.x * ENLARGE, rec.scale.y * ENLARGE, rec.scale.z * ENLARGE)
    o.getWorldPosition(_v)
    centroid.add(_v)
  })

  if (meshes.length) centroid.multiplyScalar(1 / meshes.length)

  state.allSensors.forEach((o) => {
    if (meshLayer(o) === num) return
    remember(o)
    o.visible = false
  })

  state.gateMeshes.forEach((o) => {
    remember(o)
    rememberFade(o)
    const orig = state.fadeOrig.get(o) || o.material
    const m = orig.clone()
    if (m) {
      m.transparent = true
      m.opacity = GATE_OPACITY
      m.depthWrite = false
      if (m.color) m.color.set(FADE_TINT)
      m.needsUpdate = true
      o.material = m
      state.fadeClone.set(o, m)
    }
  })

  // 名字含"桥架"的模型也降低透明度，方便看清其上/后方的传感器
  state.bridgeMeshes.forEach((o) => {
    remember(o)
    rememberFade(o)
    const orig = state.fadeOrig.get(o) || o.material
    const m = orig.clone()
    if (m) {
      m.transparent = true
      m.opacity = BRIDGE_OPACITY
      m.depthWrite = false
      if (m.color) m.color.set(FADE_TINT)
      m.needsUpdate = true
      o.material = m
      state.fadeClone.set(o, m)
    }
  })

  // 隐藏中控室 / smallstore 等辅助模型，只突出钢板库与该层传感器
  state.auxNodes.forEach((o) => {
    remember(o)
    o.visible = false
  })

  state.activeLayer = num
  flyToFocus(centroid)
  return true
}

// 退出选层：还原所有模型并回到默认视角
export function exitSensorLayers() {
  clearHoverSensor()
  if (!state.app) return false
  const hadActive = state.activeLayer !== null
  restoreAll()
  if (hadActive) {
    const app = state.app
    app.flyTo({
      position: app.cameraPosition ? app.cameraPosition.slice() : [-10, 10, 60],
      controls: app.controlsTarget ? app.controlsTarget.slice() : [-10, 12, 0],
      duration: 800,
      easing: TWEEN.Easing.Quadratic.InOut,
    })
  }
  return true
}

// ============ 让传感器更显眼 / 更易点选 ============

// 对全部传感器整体放大 factor 倍(用于监测时放大、退出时还原为1)
export function setSensorBaseScale(app, factor) {
  if (!app || !app.model) return
  const f = factor || 1
  app.model.traverse((o) => {
    if (!o.isMesh) return
    if (layerOfName(o.name) === null) return
    if (!o.userData._sensorBaseScale) {
      o.userData._sensorBaseScale = o.scale.clone()
    }
    o.scale.copy(o.userData._sensorBaseScale).multiplyScalar(f)
  })
}

// 悬停高亮某个传感器(放大 + 发亮)，同一时刻只高亮一个
export function setHoverSensor(obj) {
  if (!obj || !obj.isMesh) return
  if (state.hover && state.hover.obj === obj) return
  clearHoverSensor()
  const rec = {
    obj,
    scale: obj.scale.clone(),
    material: obj.material,
  }
  state.hover = rec
  rec.obj.scale.multiplyScalar(HOVER_SCALE)
  const m = rec.material
  if (m && m.emissive) {
    const c = m.clone()
    c.emissive = new THREE.Color(HOVER_COLOR)
    if ('emissiveIntensity' in c) c.emissiveIntensity = 1.2
    c.needsUpdate = true
    rec.clone = c
    rec.obj.material = c
  }
}

export function clearHoverSensor() {
  if (!state.hover) return
  const rec = state.hover
  rec.obj.scale.copy(rec.scale)
  if (rec.material && rec.obj.material !== rec.material) {
    rec.obj.material = rec.material
  }
  if (rec.clone) { try { rec.clone.dispose(); } catch (e) { /* ignore */ } }
  state.hover = null
}

// ============ 传感器健康状态着色(0绿/1黄/2橙/3红闪烁) ============

// 状态 -> 发光颜色
const STATUS_COLORS = {
  0: 0x27ae60, // 绿
  1: 0xffc107, // 黄(琥珀黄,与绿拉开区别)
  2: 0xff7f00, // 橙
  3: 0xff3b30, // 红
}

function sensorIdFromName(name) {
  if (!name) return null
  const m = /^(\d+)/.exec(name.slice(13))
  return m ? parseInt(m[1], 10) : null
}

// statusMap: { 传感器ID(number或string): 状态(number) }
export function applySensorStatuses(statusMap) {
  clearSensorStatuses()
  if (!state.app || !statusMap) return

  state.allSensors.forEach((o) => {
    const id = sensorIdFromName(o.name)
    if (id == null) return
    const st = Number(statusMap[id])
    if (!(st in STATUS_COLORS)) return

    const origMat = o.material
    if (!origMat || !origMat.clone) return
    state.status.originals.set(o, origMat)

    const mat = origMat.clone()
    const glow = new THREE.Color(STATUS_COLORS[st])
    if (mat.color) mat.color = glow.clone()
    if (mat.emissive) mat.emissive = glow.clone()
    // 只用表面颜色发光,不加 bloom 辉光层,避免大片白光
    if ('emissiveIntensity' in mat) mat.emissiveIntensity = st === 3 ? 0.35 : 0.5
    mat.needsUpdate = true
    o.material = mat
    state.status.clones.push(mat)

    if (st === 3 && !state.status.blink.includes(o)) {
      state.status.blink.push(o)
    }
  })
}

// 每帧驱动“红色闪烁”的传感器
export function pulseSensorStatuses(t) {
  if (!state.status.blink.length) return
  const s = (Math.sin(t * 6) + 1) / 2 // 0 ~ 1 正弦
  state.status.blink.forEach((o) => {
    const m = o.material
    if (m && 'emissiveIntensity' in m) {
      m.emissiveIntensity = 0.1 + 0.45 * s
    }
  })
}

// 还原所有传感器的原始材质,并释放上色克隆材质
export function clearSensorStatuses() {
  state.status.originals.forEach((origMat, o) => {
    o.layers.disable(1)
    if (origMat && o.material !== origMat) {
      o.material = origMat
      if (origMat.needsUpdate !== undefined) origMat.needsUpdate = true
    }
  })
  state.status.clones.forEach((c) => { try { c.dispose(); } catch (e) { /* ignore */ } })
  state.status.originals.clear()
  state.status.clones = []
  state.status.blink = []
}
