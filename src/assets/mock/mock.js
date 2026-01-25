import * as THREE from 'three'
// 这个模块是数据处理模块，对数据库的数据进行对应的处理
//  样式，具体可以在blender中对应其模型的名字然后生成图片
export const roomTexts = [
    {
        name:'沉降仪',
        class:'camera-bg',
        type:'摄像头'
    }, 
    {
        name:'倾角计',
        class:'water-bg',
        type:'水'
    }, 
    {
        name:'应变计',
        class:'electricity-bg',
        type:'电'
    },
]
export async function generateParkData(app) {
const floors = ['竖向矮桥架-A','竖向高桥架-B','竖向矮桥架-C','竖向高桥架-D','竖向矮桥架-E','竖向高桥架-F','竖向矮桥架-G','竖向高桥架-H','环形桥架']
const layers = ['应变计','沉降仪','倾角计']
let rooms = []
app.model.traverse((obj) => {
    if (obj.isMesh) {
       if(obj.name.indexOf('GBC') > -1){
        rooms.push(obj.name.substring(13))
       }
    }
})

let parkData = {}
let dataArr = []
// fetch('http://192.168.1.12:3000/')
//         .then(res => res.json())
//         .then(data => {
//           console.log(data);
//           dataArr = data;
//       });
const res = await fetch('http://10.136.135.216:3000/');
dataArr = await res.json();
console.log(dataArr);
floors.forEach(v => {
    parkData[v] = {}
    layers.forEach(k=>{
        parkData[v][k] = {}
        // rooms.forEach(j => {
        //     // console.log(j);
        //      dataArr.forEach(e => {
        //         // console.log(e.sensor_id);
        //             if(e.sensor_id == j){ 
        //                 // console.log(e);
        //                  parkData[v][k][j] = {
        //                     水:e.sensor_frequency,
        //                     电:e.sensor_digangle_x
        //                  } //传感器的数据
        //             }
        //         })
        // })

        const dataMap = new Map();
        dataArr.forEach(e => {
        dataMap.set(e.sensor_id, e);
        });
        rooms.forEach(j => {
        const matches = dataArr.filter(e => e.sensor_id == j);
        if (matches.length > 0) {
            // parkData[v][k][j] = matches.map(e => ({
            // 水: e.sensor_frequency,
            // 电: e.sensor_digangle_x
            // }));
            parkData[v][k][j] = {
                电: matches[0].sensor_frequency*matches[0].sensor_frequency*0.002,
                水: `${matches[0].sensor_digangle_x}°,${matches[0].sensor_digangle_y}`
            };
        }
        });
    })
})

return parkData
}

export const cameraUrls = {
    摄像头A:`movie/${THREE.MathUtils.randInt(1,3)}.mp4`,
    摄像头B:`movie/${THREE.MathUtils.randInt(1,3)}.mp4`,
    摄像头C:`movie/${THREE.MathUtils.randInt(1,3)}.mp4`
}