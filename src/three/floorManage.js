import * as THREE from "three";
import { CSS3DSprite } from "three/examples/jsm/renderers/CSS3DRenderer";
import { floorBaseMaterial } from "./material";
import EventBus from "@/bus";
import { destroyControlsGroupText } from "./loaderModel";
import { roomTexts, generateParkData } from "@/assets/mock/mock";
import {createParkElectricity,destroyParkElectricity} from "@/three/parkElectricity";
export function loaderFloorManage(app) {
  // 点击楼栋管理切换视角
  app.flyTo({
    position: [0, 65, 0],//相机飞到指定位置
    controls: [0, 0, 0],//控制点
    done: () => {
      createFloorText(app);
    },
  });
}
//将除A栋外的其他模型材质设置为基础材质，替换成除点击的模型外其他的模型材质替换为基础材质 
function hiddenModel(obj){
      obj.forEach((childrenObj) => {
        if (childrenObj.material) {
          childrenObj.material = floorBaseMaterial;
        }
      });
    }

// 创建文字标签
let flyToPosition; 
export function createFloorText(app) {
  console.log(generateParkData(app));
  
  let arr = []
  app.model.traverse((obj) => {//全部模型层级
    //隐藏模型函数
    if (obj.name.indexOf("桥架") > -1) {//遍历所有模型筛选出name为楼顶的模型，可替换为筛选出桥架模型
      const name = obj.name;
      const position = Object.values(app.getModelWorldPosition(obj));//获取楼栋位置，可替换成桥架位置
      // console.log(position);
      if (name.indexOf("竖向") > -1) position[1] = 30;//将标签的y坐标设置为库顶高
      const html = `<div class="floorText-3d animated fadeIn" id="${name}"><p class="text">${name}</p></div>`;//添加A栋的动态标签，可以拓展为给多个桥架添加标签
      app.instance.add({//通过这个方法添加想要的标签、属性
        element: html,
        position,
        cssObject: CSS3DSprite,
        name,
        scale: [0.025, 0.025, 0.025],
        parent: app.controlGroup,
      });
      const textDoms = document.getElementsByClassName("floorText-3d");
      // console.log(textDoms);
      for (let i = 0; i < textDoms.length; i++) {
        const textDom = textDoms[i];
        textDom.onclick = () => {
          for (let i = 0; i < app.model.children[0].children[1].children.length; i++) {//桥架层级
            const brige = app.model.children[0].children[1].children[i];
            
            if (brige.name === textDom.id) {//匹配标签对应的桥架
              //筛选出除点击的桥架外的其他模型
              app.model.traverse(e => {
                if(e.name !== textDom.id && e.isMesh) arr.push(e)
              })
              // 将除点击的桥架外的其他模型隐藏
              hiddenModel(arr)

              EventBus.$emit("changeFloorUI", {
                isShowFloorBack: true,
                model: brige,
              });
              let centerPosition = Object.values(
                app.getModelWorldPosition(brige)//获取桥架的坐标
              );

              

              if (brige.name.indexOf('矮') > -1) {
                // “矮”类型
                flyToPosition = [
                  centerPosition[0] + 10,
                  centerPosition[1] - 2 ,
                  centerPosition[2] + 16,
                ];
                centerPosition = [centerPosition[0],centerPosition[1],centerPosition[2]]
              } else if (brige.name.indexOf('高') > -1) {
                // “高”类型
                flyToPosition = [
                  centerPosition[0] - 10,
                  centerPosition[1] + 1,
                  centerPosition[2] + 30,
                ];
              } else if (brige.name.indexOf('环形') > -1) {
                // “环形”类型
                flyToPosition = [
                  centerPosition[0] + 20,
                  centerPosition[1] + 15,
                  centerPosition[2] + 10,
                ];
                centerPosition = [centerPosition[0],centerPosition[1] - 8,centerPosition[2]]
              }
              app.flyTo({
                  position: flyToPosition,
                  controls: centerPosition,



              });  
              // app.flyTo({
              //   position: [
              //     centerPosition[0] + 10,
              //     centerPosition[1],
              //     centerPosition[2] + 10,
              //   ],
              //   controls: centerPosition,
              // });

              brige.traverse((childrenObj) => {
                if (childrenObj.material) {
                  childrenObj.material =
                    app.modelMaterials[childrenObj.name].material;
                }
              });
            } 
            // else {
            //   // brige.traverse((childrenObj) => {
            //   //   // childrenObj.material = floorBaseMaterial;//将除A栋外的其他模型材质设置为基础材质，替换成除点击的模型外其他的模型材质替换为基础材质
            //   //   childrenObj.visible = false; // 将除A栋外的其他模型隐藏
            //   // });
            // }
          }
          destroyControlsGroupText(app, "floorText-3d"); 


        };
      }
    }
  });
}

// 楼层的文字
export function createRoomText(app, model) {
  // model是整个楼层的模型，可以替换为一根桥架的模型
  console.log(model);
  
  model.traverse((obj) => {
    if (obj.isMesh) {
      roomTexts.forEach((item) => {
        if (obj.name.indexOf(item.name) > -1) {
          const fullName = obj.name;
          const name = obj.name.substring(0,3);
          const position = Object.values(app.getModelWorldPosition(obj));
          const html = `<div class="room-3d animated fadeIn" id="${name}" _type="${item.type}" data-id="${fullName}"><p class="text">${name}</p>
            <div class="${item.class}"></div>
            </div>`;
            // 为传感器添加对应的3Dhtml动态标签，并添加到正确的位置
          app.instance.add({
            element: html,
            position,
            cssObject: CSS3DSprite,
            name,
            scale: [0.007, 0.007, 0.007],
            parent: app.controlGroup,
          });
        }
      });
    }
  });
  const textDoms = document.getElementsByClassName("room-3d");
  // console.log(textDoms);
  for (let i = 0; i < textDoms.length; i++) {//遍历楼层所有的标签，实际中则是遍历一个桥架中所有的传感器
    const textDom = textDoms[i];
    textDom.onclick = event => {
        //点击某个具体的房间内容触发的点击事件，实际中替换成发送的api接口
        const type = textDom.getAttribute('_type')
        const model = app.model.getObjectByName(textDom.dataset.id)//匹配到和标签对应的模型
        // console.log(model);
        
        // 通知具体窗口的显示
        generateParkData(app).then(parkData => {
          // console.log(parkData);
        EventBus.$emit("changeRoomTooltip", {
            name: model.name,
            type,
            x: event.x,
            y: event.y,
            show: true
          }, parkData);
        });

        // EventBus.$emit("changeRoomTooltip", {
        //     name: model.name,
        //     type,
        //     x:event.x,//点击事件的x坐标
        //     y:event.y,//点击事件的y坐标
        //     show:true
        //   },generateParkData(app));
    };
  }
}
// 楼层动画
                              //  楼栋模型，楼层名称， 楼层数据，  返回函数
export function setModelLayer(app, model, layerName, layerData, callback) {
    // num++
    console.log(model);
    destroyControlsGroupText(app, "room-3d");//清除之前的标签
    // console.log(model, layerName, layerData);
    
  // const currentLayer = Number(layerName.substring(0, layerName.indexOf("F")));

  for (let i = 0; i < model.children.length; i++) {
    let mesh = model.children[i];
    // let name = mesh.name;
    // let num;
    
    //对楼顶进行特殊的处理
    // if (name.indexOf("楼顶") > -1) {
    //   num = layerData.length + 1;
    // } else {
    //   num = Number(name.substr(0, name.indexOf("F")));
    // }
    // let value = num - currentLayer;
    let position = mesh.position;
    // let position_tmp = mesh.position_tmp;
    let toPosition;

    // if (layerName === "全楼") {
    //   toPosition = [position_tmp.x, position_tmp.y, position_tmp.z];
    // } else {
    //   if (value >= 1) {
    //     toPosition = [
    //       position_tmp.x,
    //       position_tmp.y + value * 20,
    //       position_tmp.z,
    //     ];
    //   } else {
    //     toPosition = [position_tmp.x, position_tmp.y, position_tmp.z];
    //   }
    // }
    // 控制楼层模型的移动
    app.modelMove(
      {
        fromPosition: [position.x, position.y, position.z],
        toPosition,
        duration: 300,
        done: () => {
          
          if (layerName === "传感器") {
            if (callback) {
              callback();
              return;
            }
            const centerPosition = Object.values(
              app.getModelWorldPosition(model)
            );
            app.flyTo({
              //调整全楼的相机位置
              position: [
                centerPosition[0] + 20,
                centerPosition[1] + 10,
                centerPosition[2] + 20,
              ],
              controls: [centerPosition[0], centerPosition[1] + 3, centerPosition[2]],
            });
            // destroyParkElectricity(app);
            // createParkElectricity(app,model);
            console.log(model.parent);
            
            return;
          } else if(layerName === '倾角计'){
            // destroyParkElectricity(app,model);
            if (mesh.name.indexOf(layerName) > -1) {
              if (callback) {
                callback();
                
                return;
              }
              let centerPosition = Object.values(
                app.getModelWorldPosition(mesh)
              );
              if (mesh.parent.name.indexOf('H') > -1) {
                centerPosition = [centerPosition[0],centerPosition[1] + 5,centerPosition[2]]
              }
              app.flyTo({
                position: [
                  centerPosition[0] + 5,
                  centerPosition[1] + 18.5,
                  centerPosition[2] + 5,
                ],
                controls: [centerPosition[0], centerPosition[1] + 10, centerPosition[2]],
                done: () => {
                  console.log(mesh);
                  // 这里传入的是单层楼的模型
                  createRoomText(app, mesh);
                },
              });
            }
          } else {
            // destroyParkElectricity(app,model);
            if (mesh.name.indexOf(layerName) > -1) {
              
              if (callback) {
                callback();
                
                return;
              }
              let centerPosition = Object.values(
                app.getModelWorldPosition(mesh)
              );
              // changePerspective(mesh.parent,app)
              if (mesh.parent.name.indexOf('H') > -1) {
                flyToPosition = [flyToPosition[0] - 45,flyToPosition[1],flyToPosition[2]]
                centerPosition = [centerPosition[0] + 58,centerPosition[1] + 5,centerPosition[2] - 35]
              }
               if (mesh.parent.name.indexOf('D') > -1) {
                flyToPosition = [flyToPosition[0] + 100,flyToPosition[1],flyToPosition[2]]
                centerPosition = [centerPosition[0] - 63,centerPosition[1] - 1.5,centerPosition[2] - 25]
              }
              if (mesh.parent.name.indexOf('F') > -1 || mesh.parent.name.indexOf('B') > -1) {
                centerPosition = [centerPosition[0],centerPosition[1] + 0.5,centerPosition[2]]
              }
              if(mesh.parent.name.indexOf('矮') > -1) {
                centerPosition = [centerPosition[0],centerPosition[1] - 3,centerPosition[2]]
                if(mesh.parent.name.indexOf('A') > -1) { 
                  centerPosition = [centerPosition[0],centerPosition[1] + 2.5,centerPosition[2]]
                }
                if(mesh.parent.name.indexOf('C') > -1) { 
                  flyToPosition = [ centerPosition[0] + 15, centerPosition[1] + 5, centerPosition[2] - 15,];
                  centerPosition = [centerPosition[0],centerPosition[1] + 3,centerPosition[2]]
                }
                if(mesh.parent.name.indexOf('G') > -1 ){
                  flyToPosition = [flyToPosition[0] - 29,flyToPosition[1],flyToPosition[2] - 10]
                  centerPosition = [centerPosition[0],centerPosition[1] + 2.5,centerPosition[2]]
                }
              } 
              if (mesh.parent.name.indexOf('环形') > -1) {
                centerPosition = [centerPosition[0],centerPosition[1] + 5,centerPosition[2]]
              }
              app.flyTo({
                position: flyToPosition,
                controls: centerPosition,
                done: () => {
                  console.log(mesh);
                  // 这里传入的是单层楼的模型
                  createRoomText(app, mesh);
                },
              });
            }
          }
        },
      },
      mesh
    );
  }
}

function changePerspective(model,app){
   let flyToTarget
   let centerPosition = Object.values(
          app.getModelWorldPosition(model)
        );
        if(model.name.indexOf('A') > -1) {
          flyToTarget = [ centerPosition[0] - 13, centerPosition[1] + 5, centerPosition[2] - 13,];
          centerPosition = [centerPosition[0],centerPosition[1] + 1,centerPosition[2]]
        }
        if(model.name.indexOf('B') > -1) {
          flyToTarget = [ centerPosition[0] + 10, centerPosition[1] + 5, centerPosition[2] - 30,];
          centerPosition = [centerPosition[0],centerPosition[1],centerPosition[2]]
        }
        if(model.name.indexOf('C') > -1) {
          flyToTarget = [ centerPosition[0] + 15, centerPosition[1] + 5, centerPosition[2] - 15,];
          centerPosition = [centerPosition[0],centerPosition[1] + 1,centerPosition[2]]
        }
        if(model.name.indexOf('D') > -1) {
          flyToTarget = [ centerPosition[0] + 28, centerPosition[1] + 5, centerPosition[2] + 2.8,];
          centerPosition = [centerPosition[0],centerPosition[1] + 1,centerPosition[2]]
        }
        if(model.name.indexOf('E') > -1) {
          flyToTarget = [ centerPosition[0] + 15, centerPosition[1] + 5, centerPosition[2] + 15,];
          centerPosition = [centerPosition[0],centerPosition[1],centerPosition[2]]
        }
        if(model.name.indexOf('F') > -1) {
          flyToTarget = [ centerPosition[0] - 13.5, centerPosition[1] + 5, centerPosition[2] + 27,];
          centerPosition = [centerPosition[0],centerPosition[1] - 0.3,centerPosition[2]]
        }
        if(model.name.indexOf('G') > -1) {
          flyToTarget = [ centerPosition[0] - 15, centerPosition[1] + 5, centerPosition[2] + 15,];
          centerPosition = [centerPosition[0],centerPosition[1] + 1,centerPosition[2]]
        }
        if(model.name.indexOf('H') > -1) {
          flyToTarget = [ centerPosition[0] - 30, centerPosition[1] + 5, centerPosition[2],];
          centerPosition = [centerPosition[0],centerPosition[1] + 1,centerPosition[2]]
        }
        if(model.name.indexOf('环形') > -1) {
          flyToTarget = [ centerPosition[0], centerPosition[1] + 5, centerPosition[2] + 22,];
          centerPosition = [centerPosition[0],centerPosition[1] + 1,centerPosition[2]]
        }
        app.flyTo({
          position: flyToTarget,
          controls: centerPosition,
        })
}

export function setModelBrige(app, model, layerName, layerData, callback){
 destroyControlsGroupText(app, "room-3d");//清除之前的标签
  // for (let i = 0; i < app.model.children[0]..length; i++) {
  destroyParkElectricity(app);
  console.log(model);
    let arr1 = []
    let arr2 = []
    // let mesh = model
    let position = model.position;
    let toPosition;
    app.modelMove(
      {
        fromPosition: [position.x, position.y, position.z],
        toPosition,
        duration: 300,
        done: () => {
            if (callback) {
              callback();
              return;
            }
        changePerspective(model,app);
        model.traverse(obj => {
          if(obj.isMesh && obj.name.indexOf('计')){
            arr1.push(obj)
          }
        })
        app.model.traverse(obj => {
          arr2.push(obj)
        })
       const diffArr = [
         ...arr1.filter(item => !arr2.includes(item)),
         ...arr2.filter(item => !arr1.includes(item))
       ];
       diffArr.forEach(item =>{
       if (item && item.material) {
         item.material = floorBaseMaterial;
       }
       })
       
            // app.flyTo({
            //   //调整全楼的相机位置
            //   position: 
            //     centerPosit[ion[0],
            //     centerPosition[1],
            //     centerPosition[2],
            //   ],
            //   controls: [centerPosition[0], centerPosition[1], centerPosition[2]],
            // });
            
            createParkElectricity(app,model);
            
            return;
        },
      },
      model
    );
  }

