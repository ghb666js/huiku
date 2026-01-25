import { roomTexts, generateParkData } from "@/assets/mock/mock";
import { floorBaseMaterial2 } from "@/three/material";
import { Notification } from "element-ui";
import EventBus from "@/bus";
import { setModelDefaultMaterial } from '@/three/loaderModel';
// 处理电力监测功能
export function loaderParkElectricity(app,currentBrige) {
  // app.flyTo({
  //   position: [17.05, 5.51,19.18],
  //   controls: [5.68, 1.39, 4.69],
  //   done: () => {
      for (let i = 0; i < app.model.children[0].children[1].children.length; i++) {//桥架层级
            const brige = app.model.children[0].children[1].children[i];
            if(currentBrige === '桥架选择'){
              EventBus.$emit("changeBrigeUI", {
                isShowFloorBack: true,
                model:app.model.children[0].children[0].children[10],
              },app);
            }
            if(brige.name.substring(3,7) === currentBrige || brige.name === currentBrige){
              EventBus.$emit("changeBrigeUI", {
                isShowFloorBack: true,
                model: brige,
              },app);
            }
          }

      // createParkElectricity(app);
  //   },
  // });
}
export function flyToTarget(app,target) {
  app.flyTo(target)
}
// let parkData = {}

export function createParkElectricity(app,model) {
  //  每次都先清空高亮，避免叠加
  app.selectedObjects = [];
  app.rayModel = [];  ``
  let notifIndex = 0;
  // console.log(app.model);
  generateParkData(app).then(parkData => {
    // console.log(parkData);
  model.traverse((obj) => {
    if (obj.isMesh && obj.name.indexOf("应变计") > -1) {
      if (!obj.userData.originScale) {
        obj.userData.originScale = obj.scale.clone();
      }
      // 计算数据
      const floorName = model.name;
      const layerName = obj.name.substring(0, 3);
      const roomName = obj.name.substring(13);
      const value = parkData?.[floorName]?.[layerName]?.[roomName]?.['电'] ?? '无数据';
      // 如果大于设定值：460的处理逻辑
      if (value > 3500) {
        app.selectedObjects.push(obj);
        app.rayModel.push(obj);
        obj.scale.set(
          obj.userData.originScale.x * 3,
          obj.userData.originScale.y * 3,
          obj.userData.originScale.z * 3
        );
        setTimeout(() => {
          if (notifIndex < 6) {
            Notification({
              title: "警告",
              message: `${floorName}的${layerName}${roomName}的应力值为${value}，已超出平均值，请留意`,
              type: "warning",
              duration: 6000,
            });
            notifIndex++;
            
          }
        }, notifIndex * 200);
      } else {
        obj.material = floorBaseMaterial2;
        // obj.scale.set(1, 1, 1);
        obj.scale.copy(obj.userData.originScale);
      }
    } else if (obj.isMesh) {
      // 其它对象设置为基础材质
      obj.material = floorBaseMaterial2;
      if (obj.userData.originScale) {
        obj.scale.copy(obj.userData.originScale);
      }
    }
    // if (obj.isMesh) {
    //   console.log(obj);
    //   if (obj.name.indexOf("应变计") === -1) {
    //     if(obj && obj.material){
    //       obj.material = floorBaseMaterial2;
    //     }
    //   } else {
    //     // app.selectedObjects.push(obj);
    //     // app.rayModel.push(obj);
    //     //楼栋
        // const floorName = obj.parent.parent.name;
        // const floorName = model.name;
        // // const layerName = obj.parent.name
        // const layerName = obj.name.substring(0, 3);
        // const roomName = obj.name.substring(13);
        // // const value = parkData[floorName][layerName][roomName]["电"];
        // const value = parkData?.[floorName]?.[layerName]?.[roomName]?.['电'] ?? '无数据';
    //     // console.log(value);
        
    //     //    如果大于设定值：460的处理逻辑
        // if (value > 460) {
        //   app.selectedObjects.push(obj);
        //   setTimeout(() => {
        //     if (notifIndex < 6) {
        //       Notification({
        //         title: "警告",
        //         message: `${floorName}的${layerName}${roomName}的用电量为${value}度，已超出平均值，请留意`,
        //         type: "warning",
        //         duration: 6000,
        //       });
        //       notifIndex++;
        //     }   
        //   }, notifIndex * 200);
        // }
        // app.rayModel.push(obj);
        
    //      // 放大电表模型
    //     // obj.scale.set(2.3, 2.3, 2.3); // 调整放大倍数
    //   }
    // }
  });
  // ...高亮对象处理完后
  if (app.outlinePass) {  
    app.outlinePass.selectedObjects = app.selectedObjects;
  }
  app.initRaycaster(
    (activeObj, app, event) => {
      // console.log(activeObj);
      // parkData = generateParkData(app);
      if (activeObj.object && activeObj.object.material) {
        const obj = activeObj.object;
        // console.log(obj);
        const floorName = model.name;
        const layerName = obj.name.substring(0,3)
        const roomName = obj.name.substring(13);
        const value = parkData[floorName][layerName][roomName]['电'];
        // const value = parkData?.[floorName]?.[layerName]?.[roomName]?.['电'] ?? '无数据';
        EventBus.$emit('changeTooltip', {
          桥架: floorName,
          传感器类型: layerName,
          ID: roomName,
          度数: value,
          name: obj.name,
          type: '电',
          x: event.x,
          y: event.y,
          show: true
        });
      } 
    },
    app.rayModel,
    'click'
  )
  })
}

// 销毁
export function destroyParkElectricity(app) {
 
  app.selectedObjects = [];
  // app.rayModel = [];
  // if (app.outlinePass) {
  //   app.outlinePass.selectedObjects = [];
  // }
  app.outlinePass.selectedObjects = app.selectedObjects;
  EventBus.$emit('changeTooltip', {
    show: false
  });
  
  // if(model){
  //   setModelDefaultMaterial(model);
  // }
  setModelDefaultMaterial(app);
  app.destroyRaycaster('click');
}
