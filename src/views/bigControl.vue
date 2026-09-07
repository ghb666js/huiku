<template>
    <div class="container">
        <form>
            <label v-for="(item, index) in controls" @click="activeFun(item, index)" :key="index">
                <input type="radio" name="radio" :checked="index === activeVar" />
                <span class="dynamic-font">{{ item.name }}</span>
            </label>
        </form>
    </div>
</template>

<script>
import { loaderParkRadar,destroyParkRadar } from '@/three/parkRadar'
import { loaderCartoon, destroyCartoon } from '@/three/cartoon'
import EventBus from '@/bus'
export default {
    components: { 
        // layer, tooltip 
    },
    data() {
        return {
            isShowDrawer: this.showDrawer,
            roomTooltipStyle: {
                show: false,
                x: 0,
                y: 0,
                name: ''
            },
            controls: [
                {
                    name: '科创项目简介',
                    goFunction: () => {
                        
                        app.flyTo({
                            position: app.cameraPosition,
                            controls: app.controlsTarget
                        });
                    },
                    backFunction: () => { }
                },
                {
                    name:'灰库运行工艺',
                    goFunction: () => {
                        loaderCartoon(window.app)
                        
                    },
                    backFunction: () => {
                        destroyCartoon(window.app)
                    }
                },
                {
                    name: '系统功能配置',
                    goFunction: () => {
                        EventBus.$emit('deviceControlUI',{
                            show: true,
                            name: this.currentDevice
                        })
                    },
                    backFunction: () => {
                        EventBus.$emit('deviceControlUI',{
                            show: false,
                        })
                        this.currentDevice =  '传感端口配置'
                    }
                }, 
                {
                    name: '孪生健康监测',
                    goFunction: () => {
                       
                         EventBus.$emit('changeMonitorUI', {
                            show: true,
                            name: this.currentMonitor,
                        });             
                    },
                    backFunction: () => {
                         EventBus.$emit('changeMonitorUI', {
                            show: false,
                            name: '',
                        });
                        this.currentMonitor =  '传感异常分布'
                    }
                },
                {
                    name: '雷达形貌监测',
                    goFunction: () => {
                        loaderParkRadar(window.app)
                    },
                    backFunction: () => {
                        destroyParkRadar(window.app)
                    }
                },
                {
                    name: '仓体健康评估',
                    goFunction: () => {    
                        app.flyTo({
                            position: [30,15,30],
                            controls: [5,15,5]
                        });
                        EventBus.$emit('healthassessUI',{
                            show: true,
                        })
                    },
                    backFunction: () => {
                        // destroyParkElectricity(window.app)
                        this.isShowBriges = false
                        // this.currentBrige = '桥架选择'
                        EventBus.$emit('healthassessUI',{
                            show: false,
                        })
                    }
                },
                {
                    name: '灰库生产统计',
                    goFunction: () => {    
                        // loaderParkElectricity(window.app,this.currentBrige)
                        EventBus.$emit('saleAnalyse',{
                            show: true,
                        })
                    },
                    backFunction: () => {
                        EventBus.$emit('saleAnalyse',{
                            show: false,
                        })
                    }
                },
                {
                    name: '对位流量监控',
                    goFunction: () => {    
                        // loaderParkElectricity(window.app,this.currentBrige)
                        EventBus.$emit('flowMonitoring',{
                            show: true,
                        })
                    },
                    backFunction: () => {
                        EventBus.$emit('flowMonitoring',{
                            show: false,
                        })
                    }
                },
            ],
            activeVar: 0,
            currentMonitor: '传感异常分布',
            currentDevice: '传感端口配置',
        }
    },
    mounted() {
       
    },
    updated() {
       
    },
    methods: {
        activeFun(item, index) {
            this.activeVar = index
        },
    },
    watch: {
        activeVar(newVal, oldVal) {
            const oldControl = this.controls.filter((item) => item.name === this.controls[oldVal].name);
            oldControl[0].backFunction();
            const newControl = this.controls.filter((item) => item.name === this.controls[newVal].name);
            newControl[0].goFunction();
            // Emit event to notify current active module
            this.$EventBus.$emit('bigcontrol-active', newControl[0].name);
        },
    },
}
</script>
<style lang="less" scoped>
.dynamic-font {
    font-size: 1.8vw; /* 字体大小根据视口宽度动态调整 */
    /* 或者使用 vh */
    /* font-size: 2vh; */
}

.container form {
    display: flex;
    flex-wrap: wrap;
    flex-flow: column nowrap;
    justify-content: space-between;
    z-index: 50;
}

// ==================== 参考drawerT风格 ====================
// drawerT: bg=linear-gradient(180deg, rgba(0,40,80,0.95), rgba(0,20,40,0.95))
//           text=#c6d6ea / 强调=#00d4ff, border=rgba(0,140,255,0.3)
@btn-bg: rgba(0, 30, 60, 0.6);
@btn-bg-hover: rgba(0, 50, 100, 0.75);
@btn-bg-active: linear-gradient(180deg, rgba(0, 40, 80, 0.95), rgba(0, 20, 40, 0.95));
@btn-text: #c6d6ea;
@btn-accent: #00d4ff;
@btn-border: rgba(0, 140, 255, 0.3);
@btn-border-active: rgba(0, 140, 255, 0.6);

.container label {
  display: flex;
  cursor: pointer;
  font-weight: 500;
  position: relative;
  overflow: visible;
  margin-bottom: 0.3em;
}

.container label input {
  position: absolute;
  left: -9999px;
}

// ==================== 未选中 ====================
.container label span {
  display: flex;
  align-items: center;
  padding: 0.45em 1em;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: @btn-text;
  background: @btn-bg;
  border: 1px solid @btn-border;
  font-family: 'Arial', sans-serif;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 140, 255, 0.2);
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 140, 255, 0.06);
}

.container label span:hover {
  color: #ffffff;
  background: @btn-bg-hover;
  border-color: rgba(0, 140, 255, 0.5);
  text-shadow: 0 0 6px rgba(0, 140, 255, 0.4);
}

// ==================== 左侧指示条（未选中） ====================
.container label span:after {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  bottom: 25%;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: transparent;
  transition: all 0.3s ease;
}

// ==================== 选中 ====================
.container label input:checked + span {
  background: @btn-bg-active;
  border: 1px solid @btn-border-active;
  color: @btn-accent;
  font-weight: 600;
  text-shadow:
    0 0 8px rgba(0, 212, 255, 0.7),
    0 0 16px rgba(0, 212, 255, 0.4);
  box-shadow:
    0 0 12px rgba(0, 140, 255, 0.25),
    inset 0 0 15px rgba(0, 140, 255, 0.12);
}

// ==================== 左侧指示条（选中） ====================
.container label input:checked + span:after {
  background: @btn-accent;
  box-shadow:
    0 0 6px rgba(0, 212, 255, 0.8),
    0 0 14px rgba(0, 212, 255, 0.4);
  top: 18%;
  bottom: 18%;
}

// 隐藏原始radio圆点
.container label span:before {
  display: none;
}
</style>