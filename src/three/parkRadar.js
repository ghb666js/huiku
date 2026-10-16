
import { floorBaseMaterial2 } from "@/three/material";
import EventBus from "@/bus";
import { setModelDefaultMaterial } from '@/three/loaderModel';
import * as THREE from "three";
import { RADAR_DETAIL } from "@/constants/api";
// 处理电力监测功能
export function loaderParkRadar(app) {
  app.flyTo({
    position: [0, 28, 0],
    controls: [0, 34, 0],
    done: () => {
      createParkRadar(app);
    },
  });
}


export function createParkRadar(app) {
  app.rayModel = [];
  app.model.traverse(obj => {
  if (obj.name && obj.name.indexOf("雷达") > -1 && obj.isMesh) {
    app.rayModel.push(obj);
  }
  if (obj.name && obj.name.indexOf("半库") > -1) {
    obj.visible = true;
  }
});
  app.model.traverse((obj) => {
   if (obj.isMesh && obj.name.indexOf("雷达") === -1 && obj.name.indexOf("半库") === -1) {
      obj.material = floorBaseMaterial2;
      floorBaseMaterial2.opacity = 0
    }

  });
  // 找到雷达Mesh或Group的中心位置
  let radarCenter = null;
  app.model.traverse((obj) => {
    if (obj.name && obj.name.indexOf("雷达") > -1) {
      // 获取世界坐标
      radarCenter = new THREE.Vector3();
      obj.getWorldPosition(radarCenter);
    }
  });
  let ring = null;
  // 创建雷达波形特效
  function animateRadarWave() {
      ring.scale.x += 0.01;
      ring.scale.y += 0.01;
      ring.material.opacity -= 0.003;
      if (ring.material.opacity <= 0) {
        ring.scale.set(1, 1, 1);
        ring.material.opacity = 0.5;
      }
      requestAnimationFrame(animateRadarWave);
    }
  if (radarCenter) {
    // 创建一个圆环几何体
    const geometry = new THREE.RingGeometry(2, 2.2, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    ring = new THREE.Mesh(geometry, material);
    // 让波形中心在雷达中心基础上向X轴正方向偏移2个单位
    ring.position.copy(radarCenter).add(new THREE.Vector3(0, -1.2, 0));
    ring.rotation.x = -Math.PI / 2; // 水平放置
    app.scene.add(ring);
    // 保存到app对象以便在destroy函数中访问
    app.ring = ring;

    // 动画：半径扩散+透明度渐变
    animateRadarWave();
  }


  // 定义高亮材质
const highlightMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  emissive: 0xffff00,
  transparent: true,  
  opacity: 0.7
});

let lastHoverObj = null;
let lastOriginalMaterial = null;
  // 先销毁旧的射线监听，防止重复绑定导致多次 window.open
  app.destroyRaycaster('click');
  app.destroyRaycaster('pointermove');

  app.initRaycaster(
    (activeObj, app, event) => {
      if (activeObj.object && activeObj.object.name.indexOf("雷达") > -1) {
        window.open(RADAR_DETAIL, '_blank');
      }
    },
    app.rayModel,
    'click'
  );
  // 鼠标悬停高亮
  app.initRaycaster(
  (activeObj, app, event) => {
    // 先还原上一个高亮对象
    if (lastHoverObj && lastOriginalMaterial) {
      lastHoverObj.material = lastOriginalMaterial;
      lastHoverObj = null;
      lastOriginalMaterial = null;
    }
    // 如果当前有悬停对象且是雷达
    if (activeObj.object && activeObj.object.name.indexOf("雷达005_2") > -1) {
      lastHoverObj = activeObj.object;
      lastOriginalMaterial = lastHoverObj.material;
      lastHoverObj.material = highlightMaterial;

      const tooltipText = '点击了解雷达详细信息';

      // 获取指针位置（兼容不同事件对象）
      const x = (event && (event.clientX ?? event.x)) || 0;
      const y = (event && (event.clientY ?? event.y)) || 0;

      // 通过 EventBus 发出显示 tooltip 的事件，payload 可按你的监听端调整
      EventBus.$emit('showText', {
        show: true,
        text: tooltipText,
        x,
        y
      });
    }else {
      // 隐藏 tooltip
      EventBus.$emit('showText', {
        show: false
      });
    }
  },
  app.rayModel,
  'pointermove'
);
}

// 销毁
export function destroyParkRadar(app) {
  app.selectedObjects = [];
  app.outlinePass.selectedObjects = app.selectedObjects;
  setModelDefaultMaterial(app);
  app.destroyRaycaster('click');
  // 停止雷达波形动画
  if (app.ringAnimationId) {
    cancelAnimationFrame(app.ringAnimationId);
    app.ringAnimationId = null;
  }
  // 移除雷达波形模型
  if (app.ring) {
    app.scene.remove(app.ring);
    // 清理几何体和材质以释放内存
    app.ring.geometry.dispose();
    app.ring.material.dispose();
    app.ring = null;
  }
  app.model.traverse(obj => {
    if(obj.name.indexOf('半库') > -1){
       obj.visible = false;
    }
  })
  floorBaseMaterial2.opacity = 0.5;
}