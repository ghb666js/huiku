<template>
    <div class="changeButton">
      <div class="image-container" :style="styles">
        <!-- 自定义图片容器 -->
        <div class="image-item" v-for="(item, index) in monitorButtons" :key="'img-' + index">
          <div class="custom-image" :class="{ active: currentMonitor === item.name }">
            <img :src="item.url" alt="自定义图片">
          </div>
        </div>
      </div>
      <div class="button-container">
        <button 
          v-for="(item, index) in monitorButtons" 
          :key="index"
          :class="['monitor-btn', { active: currentMonitor === item.name }]"
          @click="handleClick(item.name)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>
</template>

<script>

    export default{
        name:'generalButton',
        props:{
            monitorButtons:{
                type: [Object, Array]
            },
            currentMonitor:{
                type: String
            },
            styles:{
                type: Object
            }
        },
        data(){
            return{
                
            }
        },
        methods:{
            handleClick(item) {
                this.$emit('change', item);
            }
        }
    }
</script>

<style lang="less" scoped>
.changeButton{
      flex: 0.2;
      display: flex;
      flex-direction: column;
      z-index: 2000;
      justify-content: center;
      align-items: center;
      
      .image-container {
        flex: 0.5;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.4vw;
        white-space: nowrap;
        padding: 0 0.5vw;
        // width: 118%;
        justify-content: center;
        
        .image-item {
          flex: 1;
          height: 90%;
          max-width: calc(25% - 0.3vw);
          
          .custom-image {
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, #004499 0%, #003366 100%);
            border: 0.05vw solid #0088ff;
            border-radius: 0.3vw;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0.1vw 0.2vw rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            overflow: hidden;
            
            img {
              max-width: 48%;
              max-height: 48%;
              object-fit: contain;
              padding: 0.25vw;
            }
            
            &.active {
              background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
              border: 0.05vw solid #00aaff;
              border-bottom: 0.15vw solid #00ffff;
              box-shadow: 0 0.2vw 0.6vw rgba(0, 255, 255, 0.6);
              transform: scale(1.02);
              
              img {
                filter: brightness(1.1);
              }
            }
          }
        }
      }
      
      .button-container {
        flex: 0.5;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0.4vw;
        white-space: nowrap;
        padding: 0 0.5vw;
        width: 100%;
        
        .monitor-btn {
          padding: 0.6vw 1vw;
          font-size: 0.77vw;
          color: #ffffff;
          background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
          border: 0.05vw solid #0088ff;
          border-radius: 0.3vw;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0.1vw 0.2vw rgba(0, 0, 0, 0.2);
          text-shadow: 0 0.05vw 0.05vw rgba(0, 0, 0, 0.3);
          
          &:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          &:hover {
            background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
            border-color: #00aaff;
            box-shadow: 0 0.2vw 0.4vw rgba(0, 0, 0, 0.3), 0 0 0.75vw rgba(0, 136, 255, 0.4);
            transform: translateY(-0.1vw);
          }
          
          &:hover:before {
            left: 100%;
          }
          
          &.active {
            background: linear-gradient(180deg, #004499 0%, #003366 100%);
            border: 0.05vw solid #0066cc;
            color: #ffffff;
            box-shadow: 0 0.1vw 0.2vw rgba(0, 0, 0, 0.3), inset 0 0 0.5vw rgba(0, 136, 255, 0.5);
          }
        }
      }
    }
</style>