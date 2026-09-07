import * as THREE from 'three';
import EventBus from "@/bus";
import { floorBaseMaterial } from './material.js';
import { setModelDefaultMaterial } from '@/three/loaderModel';
export function createParticleSystem(app) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i < 1000; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(200), // x
      THREE.MathUtils.randFloatSpread(200), // y
      THREE.MathUtils.randFloatSpread(200)  // z
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    sizeAttenuation: true,
  });

  const particleSystem = new THREE.Points(geometry, material);
  app.scene.add(particleSystem);
}

export function loaderCartoon(app) {
  if (!app) return;
  // 停止正在运行的flyTo动画，防止其修改已切换的camera
  if (app._flyTween) {
    app._flyTween.stop();
    app._flyTween = null;
  }
  app.model.children[0].children[11].traverse((obj) => {
        obj.visible = true;
  })
  app.model.traverse((obj) => {
    // if (obj.name && obj.name.indexOf('groundface') > -1 || obj.name.indexOf('road') > -1) obj.visible = false;
    if (obj.name && obj.name.indexOf('钢板库') > -1 || obj.name.indexOf('库顶') > -1) {
      obj.material = floorBaseMaterial
      floorBaseMaterial.opacity = 0.2
    }
  })

  // 保存原始相机与控制器信息（第一次进入时保存）8
  if (!app._savedCamera) {
    app._savedCamera = app.camera; // 保存默认相机
    app._savedControlsObject = app.controls ? (app.controls.object || null) : null;
    app._savedControlsTarget = app.controls && app.controls.target ? app.controls.target.clone() : null;
  }
   EventBus.$emit('cartoonPlay', {
    run: true,
   });
  // // 切换到 camera1
  if (app.camera1) {
    // 确保 camera1 是正交相机
    if (!app.camera1.isOrthographicCamera) {
      const width = app.el.offsetWidth;
      const height = app.el.offsetHeight;
      const aspect = width / height || 1;
      const frustumSize = 100; // 根据场景大小调整
      const halfH = frustumSize / 2;
      const halfW = halfH * aspect;

      // 创建正交相机
      app.camera1 = new THREE.OrthographicCamera(
        -halfW, halfW, halfH, -halfH, 0.1, 1000
      );
    }

    app.camera1.position.set(-5, 15, 20); // 设置 camera1 的位置
    // app.camera1.up.set(0, 0, 0); // 设置相机的上方向
    app.camera1.lookAt(new THREE.Vector3(-5, 15, 0));
    app.camera1.updateProjectionMatrix(); // 更新投影矩阵

    // 切换到 camera1
    app.camera = app.camera1;
    app.scene.add(app.camera); // 确保 camera1 被添加到场景中
     // 手动更新渲染器尺寸和相机的投影矩阵
    const width = app.el.offsetWidth;
    const height = app.el.offsetHeight;
    const aspect = width / height || 1;
    const frustumSize = 60; // 与相机的 frustumSize 保持一致
    const halfH = frustumSize / 2;
    const halfW = halfH * aspect;

    app.camera.left = -halfW;
    app.camera.right = halfW;
    app.camera.top = halfH;
    app.camera.bottom = -halfH;
    app.camera.updateProjectionMatrix();
    if (app.renderer) {
      app.renderer.setSize(width, height, false); // 更新渲染器尺寸
      app.renderer.toneMappingExposure = 0.5; // 设置曝光度
    } 
     // 确保只有当前模块的渲染循环在运行
    if (!app._isCartoonRendering) {
      app._isCartoonRendering = true; // 标记当前模块渲染循环已启动
      app.render(() => {
        if (app._isCartoonRendering) {
          app.renderer.render(app.scene, app.camera);
        }
      });
    }
    //  if (app.controls) {
    //   app.controls.object = app.camera; // 绑定 controls 到正交相机
    //   app.controls.target.set(0, 0, 0); // 设置目标点
    //   app.controls.update(); // 更新 controls
    // }
  } else {
    console.warn('camera1 未定义，无法切换到 camera1');
  }

}



export function destroyCartoon(app) {
  if (!app) return;
  app.model.children[0].children[11].traverse((obj) => {
      obj.visible = false;
  })
  app.model.traverse((obj) => {
    if (obj.name && obj.name.indexOf('groundface') > -1 || obj.name.indexOf('road') > -1) {
        obj.visible = true;
    }
  })
   // 切换回默认 camera
  if (app._savedCamera) {
    app.camera = app._savedCamera; // 恢复默认相机
    app._savedCamera = null;
    // 更新 controls，使其绑定回默认 camera
    if (app.controls) {
      try {
        app.controls.object = app.camera; // 绑定 controls 到默认 camera
        if (app._savedControlsTarget) {
          app.controls.target.copy(app._savedControlsTarget); // 恢复目标点
        }
        app.controls.update(); // 更新 controls
      } catch (e) {
        console.warn('切换回默认 camera 时更新 controls 失败', e);
      }
    }
    // 停止渲染循环
    app._isCartoonRendering = false;
    if (app.mixer) {
      app.mixer.stopAllAction(); // 停止所有动画
      app.mixer = null; // 清除混合器
    }
    app.renderer.toneMappingExposure = 1;
  }
  setModelDefaultMaterial(app);
}       