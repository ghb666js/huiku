import * as THREE from "three";
import EventBus from "@/bus";
export function loaderModel(app) {
  return new Promise((resolve) => {
    app.controlGroup = new THREE.Group();
    app.scene.add(app.controlGroup);
    // 存储模型的所有材质
    app.modelMaterials = {};
    app.rayModel = []
    let urls = [
      {
        type: "glb",
        //模型地址
        url: "model/store.glb",
        onLoad: (object) => {
          console.log("模型加载完成", object);
          app.scene.add(object.scene);
          app.model = object.scene;
          app.animations = object.animations; // 保存动画供遥控进退使用
          //需要接收阴影的小模型
          const receiveModel = []
          // 使用辉光渲染的模型
          const bloomModels=[]
          //遍历模型里的小模型
          app.model.children[0].children[11].traverse((obj) => {
            obj.visible = false;
          })

          // 播放动画
          EventBus.$on('cartoonPlay', (e) => {
              if(e.run){
                app.mixer = new THREE.AnimationMixer(app.model);
                const animations = object.animations;
                console.log('动画列表:', animations.map(a => a.name));
                if (animations && animations.length > 0) {
                  const runClips = animations.filter(a => a.name.includes('run'));
                  console.log('播放动画:', runClips.map(a => a.name));
                  // 清除旧的"全部播完"监听
                  if (app._onRunMixerFinished) {
                    app.mixer.removeEventListener('finished', app._onRunMixerFinished);
                  }
                  // 找到最长的一个动画
                  let longest = runClips[0];
                  runClips.forEach(clip => {
                    const action = app.mixer.clipAction(clip);
                    action.setLoop(THREE.LoopOnce);
                    action.clampWhenFinished = true;
                    action.play();
                    if (clip.duration > longest.duration) longest = clip;
                  });
                  // 最长动画结束时，整体循环重播
                  app._onRunMixerFinished = (e) => {
                    if (e.action.getClip() === longest) {
                      runClips.forEach(clip => {
                        const a = app.mixer.clipAction(clip);
                        a.reset().play();
                      });
                    }
                  };
                  app.mixer.addEventListener('finished', app._onRunMixerFinished);
                }
              }
            });

          app.model.traverse((obj) => {
            // 模型材质缩放
            if (!obj.isMesh) return;
            const material = obj.material;
            if (!material) return;
            // 提升贴图清晰度：各向异性过滤（改善小模型/倾斜视角模糊）
            if (!app._maxAnisotropy) {
              app._maxAnisotropy = app.renderer.capabilities.getMaxAnisotropy();
            }
            const mats = Array.isArray(material) ? material : [material];
            mats.forEach(m => {
              ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'].forEach(key => {
                if (m[key]) m[key].anisotropy = app._maxAnisotropy;
              });
            });
            // 只设置钢板库
           if(obj.name.indexOf('钢板库')>-1){
             // 配置所有纹理类型
            const textureTypes = ['map', 'normalMap', 'roughnessMap', 'metalnessMap'];
            textureTypes.forEach(type => {
              if (material[type]) {
                const texture = material[type];
                
                // 关键设置
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.matrixAutoUpdate = false;  //  ✨ 禁用自动更新
                
                // 应用变换参数
                texture.repeat.set(2.8, 2.8);   // XY方向重复2次
                texture.offset.set(0.5, 0); // X方向偏移50%
                
                texture.updateMatrix();     // ✨ 手动更新矩阵
                texture.needsUpdate = true; // 标记纹理更新
              }
              });
            material.needsUpdate = true; // 标记材质更新
          }

          
            // 如果模型的材质存在
            if (obj.material) {
              app.modelMaterials[obj.name] = {
                material: obj.material,
              };
            }
           //  隐藏半库
            if(obj.name.indexOf('半库') > -1){
             obj.visible = false;
            }

            let { x, y, z } = obj.position;
            obj.position_tmp = { x, y, z };

            if (receiveModel.includes(obj.name)) {
              obj.receiveShadow = true;
            } else {
              obj.castShadow = true;
              obj.receiveShadow = false;
            }

            for (let i = 0; i <bloomModels.length; i++){
              const value = bloomModels[i]
              if(obj.name.indexOf(value)>-1){
                obj.layers.enable(1)
                break
              }else{
                obj.layers.enable(0)
              }
            }
          });
        },
      },
    ];

    // [加载动画] resolve移入onAllLoad回调，确保模型真正加载完成后才结束loading
    app.iterateLoad(urls, null, () => {
      resolve();
    });
  });
}
// 删除标签
export function destroyControlsGroupText(app, className) {
  const textDoms = document.getElementsByClassName(className);
  for (let i = 0; i < textDoms.length; i++) {
    const textDom = textDoms[i];
    textDom.onclick = null;
  }
  app.instance.removeAll(app.controlGroup);
}

// 恢复所有模型的材质
export function setModelDefaultMaterial(app) {
    app.model.traverse((obj) => {  
    if (obj && obj.material && app.modelMaterials[obj.name]) {
      obj.material = app.modelMaterials[obj.name].material;
    }
  });
}

// 删除模型
export function destroyControlsGroup(app, className) {
  if (app?.controlGroup?.children?.length === 0) {
    return;
  }
  if (className) {
    destroyControlsGroupText(app, className);
  }
  // three.js对组的遍历最好是倒序，否则有时容易出bug
  for (let i = app.controlGroup.children.length - 1; i > -1; i--) {
    const obj = app.controlGroup.children[i];
    if (obj.isMesh) {
      obj.geometry.dispose();
      obj.material.dispose();
      app.controlGroup.remove(obj);
    }
  }
}
