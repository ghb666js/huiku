<template>
    <div class="container">
        <form>
            <label v-for="(item, index) in controls" @click="activeFun(item, index)" :key="index">
                <input type="radio" name="radio" :checked="index === activeVar" />
                <span class="dynamic-font">{{ item.name }}</span>
            </label>
        </form>
        <!-- 楼层返回 -->
        <div class="back animated fadeIn" @click="backFloorBase" v-if="isShowLayers">
            <img src="./../assets/image/back.png" alt="" />
            <p>返回</p>
        </div>
        <!-- 楼层UI -->
        <layer v-if="isShowLayers" :layers="layerData" :active="currentLayer" @change="changeLayer"
            :styles="{ top: '60%', left: '60%', height: '400px',flexDirection: 'column', alignItems: 'center',gap: '8px',whiteSpace: 'nowrap' }"></layer>
        <layer v-show="isShowBriges" :layers="brigeData" :active="currentBrige" @change="changeBrige"
        :styles="{ top: '25%', left: '10%', height: 'auto', flexDirection: 'column', alignItems: 'center',gap: '8px',whiteSpace: 'nowrap',}" ></layer>
        <layer v-show="isShowMonitor" :layers="monitorData" :active="currentMonitor" @change="changeMonitor"
        :styles="{ top: '86%', left: '37%', height: 'auto', flexDirection: 'row', alignItems: 'center',gap: '8px',whiteSpace: 'nowrap',}" ></layer>
        <!-- 提示框 -->
        <tooltip v-show="roomTooltipStyle.show" :style="{ left: roomTooltipStyle.x + 'px', top: roomTooltipStyle.y + 'px' }"
            :data="roomTooltipStyle"></tooltip>
    </div>
</template>

<script>
import { loaderFloorManage, setModelLayer,setModelBrige } from '@/three/floorManage'
import { setModelDefaultMaterial, destroyControlsGroup } from '@/three/loaderModel'
import { loaderParkElectricity,destroyParkElectricity,flyToTarget } from '@/three/parkElectricity'
// import { loaderParkWater,destroyParkWater } from '@/three/parkWater'
import { loaderParkRadar,destroyParkRadar } from '@/three/parkRadar'
import { generateParkData, cameraUrls } from '@/assets/mock/mock'
import { healthMonitor, hideMonitor } from '@/three/healthyMonitor'
import { loaderCartoon, destroyCartoon } from '@/three/cartoon'
import layer from '@/components/layer'
import tooltip from '@/components/tooltip'
// import EventBus from '@/bus'
// import monitorH from '@/components/monitorH.vue'
export default {
    components: { layer, tooltip },
    data() {
        return {
            roomTooltipStyle: {
                show: false,
                x: 0,
                y: 0,
                name: ''
            },
            controls: [
                {
                    name: '首页',
                    goFunction: () => {
                        app.flyTo({
                            position: app.cameraPosition,
                            controls: app.controlsTarget
                        });
                    },
                    backFunction: () => { }
                },
                {
                    name:'工艺流程',
                    goFunction: () => {
                        // flyToTarget(window.app,{position: [0,0,60],controls: [0,1,0],})
                        loaderCartoon(window.app)
                        
                    },
                    backFunction: () => {
                        destroyCartoon(window.app)
                        // console.log(window.app.camera);
                    }
                },
                {
                    name: '桥架管理',
                    goFunction: () => {
                        loaderFloorManage(window.app)
                    },
                    backFunction: () => {
                        // destroyParkElectricity(window.app)
                        destroyControlsGroup(window.app, 'floorText-3d')
                        this.isShowLayers = false
                        // this.isShowBriges = false
                        this.roomTooltipStyle.show = false
                        if (this.curFloorModel && this.currentLayer !== '传感器') {
                            this.currentLayer = '传感器'
                            setModelLayer(window.app, this.curFloorModel, this.currentLayer, this.layerData,
                                () => {
                                    setModelDefaultMaterial(window.app)//将 Three.js 场景中的所有模型材质恢复为默认材质（通常是取消高亮、还原初始状态）。
                                    this.curFloorModel = null//将当前选中的楼层模型引用清空，表示当前没有选中的楼层。
                                }
                            )
                            // destroyParkElectricity(window.app)
                        } else {
                            setModelDefaultMaterial(window.app)
                        }
                    }
                }, 
                {
                    name: '健康监测',
                    goFunction: () => {
                        // loaderParkWater(window.app)
                        this.isShowMonitor = true
                        // console.log(this.isShowMonitor)            
                        healthMonitor(this.currentMonitor)                
                    },
                    backFunction: () => {
                        // destroyParkWater(window.app)
                        hideMonitor()
                        this.currentMonitor =  '监测硬件配置'
                        this.isShowMonitor = false
                    }
                },
                {
                    name: '形貌监测',
                    goFunction: () => {
                        loaderParkRadar(window.app)
                    },
                    backFunction: () => {
                        destroyParkRadar(window.app)
                    }
                },
                {
                    name: '健康评估',
                    goFunction: () => {    
                        flyToTarget(window.app,{position: [30,15,30],controls: [5,15,5],})
                        loaderParkElectricity(window.app,this.currentBrige)
                    },
                    backFunction: () => {
                        destroyParkElectricity(window.app)
                        this.isShowBriges = false
                        this.currentBrige = '桥架选择'
                        
                    }
                }
            ],
            activeVar: 0,
            isShowLayers: false,
            isShowBriges: false,
            isShowMonitor: false,
            currentLayer: '传感器',
            currentBrige: '桥架选择',
            currentMonitor: '监测硬件配置',
            brigeData:[],
            // 楼层层数
            layerData: [],
            monitorData:['监测硬件配置','采集时间配置','即采数据显示','历史数据查询'],
            // 楼层模型
            curFloorModel: null,
            currentModel:null,
        }
    },
    mounted() {
        let num = 0;
        this.$EventBus.$on('changeBrigeUI', (brige,app) => {
            // console.log(1);
            num++
            // console.log(num);
            this.isShowBriges = brige.isShowFloorBack
            this.currentModel = brige.model
            // console.log(app.model);
            // console.log(this.currentModel);
            
            if(num === 1){
                // console.log(3);
                const brigeNames = app.model.children[0].children[1].children.filter(item => item.name.indexOf('桥架') > -1 ).
                map(item => item.name === '环形桥架' ? item.name : item.name.substring(3,7)).sort()
                this.brigeData = [this.currentBrige].concat(brigeNames)
            }
        })
        // 健康监测界面
        // this.$EventBus.$on('changeMonitorUI', (obj) => {
            
        // });

        this.$EventBus.$on('changeFloorUI', (obj) => {
            this.isShowLayers = obj.isShowFloorBack
            this.curFloorModel = obj.model//当前桥架
            // console.log(obj.model);
            const layerNames = obj.model.children.filter(item => item.name.indexOf('计') > -1 || item.name.indexOf('仪') > -1).map(item => item.name.substring(0,3))
            this.layerData = [this.currentLayer].concat(layerNames)
        })
        // 这段代码的作用是监听房间/摄像头标签的点击事件，并根据不同类型动态设置提示框的数据内容，用于在页面上显示详细信息。
        // 实际中则是为一根桥架中不同的传感器匹配上各自的对应的的数据
        this.$EventBus.$on('changeRoomTooltip', (obj,parkData) => {

            if (obj.name.indexOf('沉降仪') > -1) {
                this.roomTooltipStyle = Object.assign({
                    楼栋: this.curFloorModel.name,
                    楼层: this.currentLayer,
                    摄像头: obj.name,
                    视频: cameraUrls[obj.name.substr(0, 4)]
                }, obj)
            } else {
                const roomName = obj.name.substring(13)
                this.roomTooltipStyle = Object.assign({
                    桥架: this.curFloorModel.name,
                    传感器类型: this.currentLayer,
                    ID: roomName,
                    度数: parkData[this.curFloorModel.name][this.currentLayer][roomName][obj.type]
                }, obj)
            }
        })

        this.$EventBus.$on('changeTooltip', (obj) => {
            this.roomTooltipStyle = obj;
        });

        // 添加监听器，接收来自monitorH.vue的事件
        this.$EventBus.$on('updateCurrentMonitor', (monitorName) => {
            this.currentMonitor = monitorName;
        });

        // this.moveLayersToScreen();
    },
    updated() {
        console.log(this.roomTooltipStyle.show);
        this.moveLayersToScreen();
    },
    methods: {
        moveLayersToScreen() {
            this.$nextTick(() => {
                const screen = document.querySelector('#screen');
                if (!screen) return;
                
                // 移动 layer 组件到 screen
                const nodes = this.$el.querySelectorAll('.layers');
                nodes.forEach(node => {
                if (node.parentNode !== screen) {
                    // 标记为从 bigControl 移动过来的，方便 cleanup
                    node.setAttribute('data-from-bigcontrol', '1');
                    // 保持原来样式定位生效：把节点直接 append 到 screen（screen 需 position: relative）
                    screen.appendChild(node);
                    // console.log('移动层:', node);
                }
                });
                
                // 将tooltip组件移动到screen下
                const tooltip = this.$el.querySelector('.tooltip-wrapper');
                if (tooltip && tooltip.parentNode !== screen) {
                    screen.appendChild(tooltip);
                }
                
                // console.log(this.isShowMonitor);
            });
        },

        activeFun(item, index) {
            this.activeVar = index
        },
        // 返回按钮功能实现
        backFloorBase() {
            // destroyParkElectricity(window.app)
            this.isShowLayers = false
            this.roomTooltipStyle.show = false
            if (this.curFloorModel && this.currentLayer !== '传感器') {
                this.currentLayer = '传感器'
                setModelLayer(window.app, this.curFloorModel, this.currentLayer, this.layerData,
                    () => {
                        loaderFloorManage(window.app)
                        setModelDefaultMaterial(window.app)
                        this.curFloorModel = null
                    }
                )
                
            } else {
                loaderFloorManage(window.app)
                setModelDefaultMaterial(window.app)
            }
        },
        changeBrige(layer){
            setModelDefaultMaterial(window.app)
            this.currentBrige = layer
            loaderParkElectricity(window.app,layer)
            setModelBrige(window.app, this.currentModel, layer, this.brigeData)
        },
        changeLayer(layer) {
            this.currentLayer = layer
            setModelLayer(window.app, this.curFloorModel, layer, this.layerData)
            // destroyParkElectricity(window.app)
        },
        changeMonitor(layer) {
            // console.log(0);
            this.currentMonitor = layer
            healthMonitor(this.currentMonitor)
            // setModelLayer(window.app, this.curFloorModel, layer, this.layerData)
            // destroyParkElectricity(window.app)
        },
        // 控制roomTooltipStyle隐藏事件
        roomTooltipStyleShowEvent(){
            this.roomTooltipStyle.show = false
            window.removeEventListener('mousedown',this.roomTooltipStyleShowEvent)
        }
        
    },
    watch: {
        activeVar(newVal, oldVal) {
            const oldControl = this.controls.filter((item) => item.name === this.controls[oldVal].name);
            oldControl[0].backFunction();
            const newControl = this.controls.filter((item) => item.name === this.controls[newVal].name);
            newControl[0].goFunction();
        },
        //使标签在显示后再点击鼠标隐藏标签
        roomTooltipStyle(){
            if(this.roomTooltipStyle.show){
                setTimeout(()=>{window.addEventListener('mousedown',this.roomTooltipStyleShowEvent)},100)
            }
        },
        // isShowMonitor(newVal) {
        //     console.log('isShowMonitor changed to:', newVal);
        //     // console.log(this.$el.querySelectorAll('.layers'));
            
        //     if (newVal) {
        //         this.$nextTick(() => {
        //             this.moveLayersToScreen(); // 确保在显示时移动层
        //         });
        //     } else {
        //         this.removeMovedLayers(); // 隐藏时移除层
        //     }
        // }
    },
}
</script>
<style lang="less" scoped>
.dynamic-font {
    font-size: 1.8vw; /* 字体大小根据视口宽度动态调整 */
    /* 或者使用 vh */
    /* font-size: 2vh; */
}
.back {
    width: 48px;
    position: fixed;
    bottom: -30%;
    left:-300%;
    z-index: 3;
    cursor: pointer;
    font-size: 18px;

    img {
        width: 100%;
    }

    p {
        color: #fff;
        text-align: center;
    }
}

.container form {
    display: flex;
    flex-wrap: wrap;
    flex-flow: column nowrap;
    justify-content: space-between;
    // margin: 20px;
}

.container label {
    display: flex;
    cursor: pointer;
    font-weight: 500;
    position: relative;
    overflow: hidden;
    margin-bottom: 0.375em;
}

.container label input {
    position: absolute;
    left: -9999px;
}

.container label input:checked+span {
    background-color: #414181;
    color: white;
}

.container label input:checked+span:before {
    box-shadow: inset 0 0 0 0.4375em #00005c;
}

.container label span {
    display: flex;
    align-items: center;
    padding: 0.375em 0.75em 0.375em 0.375em;
    border-radius: 99em;
    transition: 0.25s ease;
    color: #373785;
}

.container label span:hover {
    background-color: #d6d6e5;
}

.container label span:before {
    display: flex;
    flex-shrink: 0;
    content: '';
    background-color: #fff;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
    margin-right: 0.375em;
    transition: 0.25s ease;
    box-shadow: inset 0 0 0 0.125em #00005c;
}
</style>