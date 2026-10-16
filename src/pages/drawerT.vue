<template>
<!-- 侧拉框 -->
    <div v-if="show">
      <aside class="drawer" :class="{ collapsed: !drawerOpen }" role="complementary" aria-label="侧拉面板">
      <button class="drawer-toggle" @click="toggleDrawer" :aria-expanded="drawerOpen" :title="drawerOpen ? '收起' : '展开'">
        <span class="arrow" :class="{ right: !drawerOpen }">❯</span>
      </button>
      <div class="drawer-content">
        <section class="drawer-text">
          <h3>项目简介</h3>
          <p>随着火电机组超低排放改造的稳步推进，粉煤灰等固废产量逐年攀升，为满足粉煤灰综合利用与智慧储运管理的双重需求，钢板仓灰库于2025年1月开工， 2025年8月竣工，总投资2500万元。灰库直径30米，设计高度37.3米，容量共计约2.5万立方米，可装粉煤灰2.5万吨。该库可有效缓解电力生产的灰库库容压力，有利地保障了景德镇电厂的安全生产，具有重要的经济社会生态效益。</p>
          <p>为了保障灰库的稳定生产和钢板仓灰库的结构安全，由江西中业兴达实业有限公司和江西水利电力大学联合开发设计了景德镇电厂灰库数字孪生健康管理系统。该系统采用了智能传感器、机器人、微波视觉、物联网、数字孪生等先进技术，系统主要包括掘进式板结清理机器人、3D雷达灰堆形貌扫描机器人、 库体形变监测与预警等模块。本项目获2023年省重大科技专项经费资助，其显著提高了灰库生产管理的技术水平，保障了灰库生产的安全度与透明度，也提高了灰库运行和电力生产的数字化与智能化水平。</p>
          <!-- <textarea v-model="drawerInput" placeholder="在此输入文字..." rows="6"></textarea> -->
        </section>

        <section class="drawer-image">
          <h4>现场照片</h4>
          <div class="drawer-image-container" @click="showImagePreview = true" @mouseenter="stopCarousel" @mouseleave="startCarousel">
            <!-- 上一张按钮 -->
            <button class="carousel-btn prev-btn" @click.stop="prevImage">
              <span class="arrow">‹</span>
            </button>
            
            <!-- 图片 -->
            <img :src="drawerImages[currentImageIndex]" alt="项目实景照片" />
            
            <!-- 下一张按钮 -->
            <button class="carousel-btn next-btn" @click.stop="nextImage">
              <span class="arrow">›</span>
            </button>
          </div>
          <!-- 小圆点指示器 -->
          <div class="carousel-indicators">
            <span 
              v-for="(image, index) in drawerImages" 
              :key="index"
              class="indicator-dot"
              :class="{ active: index === currentImageIndex }"
              @click.stop="goToImage(index)"
            ></span>
          </div>
        </section>
      </div>
    </aside>
    
    <!-- 图片预览模态框 -->
    <div v-if="showImagePreview" class="image-preview-modal" @click="showImagePreview = false">
      <div class="modal-overlay"></div>
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="showImagePreview = false">&times;</button>
        <img :src="drawerImages[currentImageIndex]" alt="项目实景照片" class="preview-image" />
        <div class="preview-info">
          <p>点击图片查看大图 ({{ currentImageIndex + 1 }} / {{ drawerImages.length }})</p>
          <p>点击遮罩区域或关闭按钮退出预览</p>
        </div>
      </div>
    </div>
    
    <div :style="{ marginLeft: drawerOpen ? drawerWidth + 'px' : collapsedWidth + 'px' }"></div>
  </div>
</template>

<script>
  export default {
    name: 'drawerT',
    props: {
      show: {
        type: Boolean,
        default: true
      }
    },
    data(){
      return {
        drawerOpen: true,            // 默认显示
        drawerWidth: 320,           // 展开宽度（px）
        collapsedWidth: 36,         // 收起后仍保留箭头宽度
        // drawerInput: '',
        drawerImages: [              // 轮播图片数组
          require('@/assets/image/gbc01.jpg'),
          require('@/assets/image/gbc02.jpg'),
          require('@/assets/image/gbc03.jpg'),
          require('@/assets/image/gbc04.jpg'),
          require('@/assets/image/gbc05.jpg')
        ], // 图片列表
        currentImageIndex: 0,        // 当前显示的图片索引
        showImagePreview: false,     // 控制图片预览模态框显示
        carouselInterval: null,      // 轮播定时器
      }
    },
    methods: {
      toggleDrawer() {
        this.drawerOpen = !this.drawerOpen;
      },

      // 轮播相关方法
      startCarousel() {
        this.stopCarousel(); // 确保先停止现有的定时器
        this.carouselInterval = setInterval(() => {
          this.nextImage();
        }, 4000); // 每4秒切换一次
      },

      stopCarousel() {
        if (this.carouselInterval) {
          clearInterval(this.carouselInterval);
          this.carouselInterval = null;
        }
      },

      nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.drawerImages.length;
      },

      prevImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.drawerImages.length) % this.drawerImages.length;
      },

      goToImage(index) {
        this.currentImageIndex = index;
      },
   
    },
    mounted() {
      this.startCarousel(); // 组件挂载时启动轮播
    },
    beforeDestroy() {
      this.stopCarousel(); // 组件销毁时清理定时器
    }
  }
</script>

<style lang="less" scoped>
/* 侧拉框 */
.drawer {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40%;
  background: linear-gradient(180deg, rgba(0, 40, 80, 0.95) 0%, rgba(0, 20, 40, 0.95) 100%);
  color: #ffffff;
  box-shadow: 2px 0 15px rgba(0, 140, 255, 0.3);
  border-right: 1px solid rgba(0, 140, 255, 0.3);
  transition: width 0.3s ease, transform 0.3s ease;
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  .drawer-toggle {
    position: absolute;
    right: -18px;
    top: 50%;
    width: 36px;
    height: 60px;
    border-radius: 0 18px 18px 0;
    background: linear-gradient(90deg, rgba(0, 40, 80, 0.95) 0%, rgba(0, 60, 120, 0.95) 100%);
    border: 1px solid rgba(0, 140, 255, 0.6);
    color: #00d4ff;
    cursor: pointer;
    display: flex;
    align-items: center;
    box-shadow: 2px 0 8px rgba(0, 140, 255, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(90deg, rgba(0, 60, 120, 0.95) 0%, rgba(0, 80, 160, 0.95) 100%);
      box-shadow: 2px 0 12px rgba(0, 140, 255, 0.5);
    }
    
    .arrow {
      display: inline-block;
      transform: rotate(0deg);
      transition: transform 0.3s ease;
      text-shadow: 0 0 5px rgba(0, 212, 255, 0.8);
      margin-left: 3px;
      
      &.right {
        transform: rotate(180deg);
        margin-left: 3px;
      }
    }
  }

  .drawer-content {
    width: 100%;
    padding: 1.2vw;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1.2vw;
    flex: 1;
    overflow: hidden;
  }
  
  .drawer-text {
    flex: 1.1;
    background: rgba(0, 30, 60, 0.6);
    border: 1px solid rgba(0, 140, 255, 0.3);
    border-radius: 8px;
    padding: 0.8vw;
    box-shadow: inset 0 0 10px rgba(0, 140, 255, 0.1);
    overflow: hidden;
    
    h3 {
      margin: 0 0 0.8vw 0;
      color: #00d4ff;
      font-size: 1.2vw;
      font-weight: bold;
      text-align: center;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
      padding-bottom: 0.8vw;
      border-bottom: 1px solid rgba(0, 140, 255, 0.3);
    }
    
    p {
      margin: 0 0 0.8vw 0;
      color: #c6d6ea;
      font-size: 1.93vh;
      line-height: 1.5;
      text-indent: 1.5em;
      text-align: justify;
      overflow: hidden;
      // text-overflow: ellipsis;
      display: -webkit-box;
      // -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
    }
    
    p:last-child {
      margin-bottom: 0;
    }
  }
  
  .drawer-image {
    flex: 1;
    min-height: 10vh;
    background: rgba(0, 30, 60, 0.6);
    border: 1px solid rgba(0, 140, 255, 0.3);
    border-radius: 8px;
    padding: 0.8vw;
    box-shadow: inset 0 0 10px rgba(0, 140, 255, 0.1);
    text-align: center;
    display: flex;
    flex-direction: column;
    
    h4 {
      margin: 0 0 0.8vw 0;
      color: #00d4ff;
      font-size: 1.2vw;
      font-weight: bold;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
      padding-bottom: 0.8vw;
      border-bottom: 1px solid rgba(0, 140, 255, 0.3);
    }
    
    .drawer-image-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      max-width: 100%;
      flex: 1;
      border-radius: 6px;
      border: 1px solid rgba(0, 140, 255, 0.3);
      background: rgba(0, 20, 40, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0, 140, 255, 0.5), transparent);
      }
      
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0, 140, 255, 0.5), transparent);
      }
      
      &:hover {
        box-shadow: 0 0 20px rgba(0, 140, 255, 0.4);
        border-color: rgba(0, 140, 255, 0.6);
      }
      
      img {
        max-width: 95%;
        height: auto;
        object-fit: contain;
        display: block;
        margin: 0 auto;
        max-height: 100%;
        transition: transform 0.3s ease;
        border-radius: 4px;
      }
      
      &:hover img {
        transform: scale(1.03);
      }
      
      /* 轮播切换按钮样式 */
      .carousel-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border: 1px solid rgba(0, 140, 255, 0.6);
        border-radius: 50%;
        background: rgba(0, 40, 80, 0.8);
        color: #00d4ff;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 2;
        text-shadow: 0 0 5px rgba(0, 212, 255, 0.8);
        
        &:hover {
          background: rgba(0, 60, 120, 0.9);
          border-color: rgba(0, 140, 255, 0.8);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 15px rgba(0, 140, 255, 0.6);
        }
        
        .arrow {
          pointer-events: none;
        }
      }
      
      .prev-btn {
        left: 10px;
      }
      
      .next-btn {
        right: 10px;
      }
    }
    
    /* 轮播指示器样式 */
    .carousel-indicators {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 0.8vw;
      gap: 0.8vw;
      
      .indicator-dot {
        width: 0.4vw;
        height: 0.4vw;
        border-radius: 50%;
        background: rgba(0, 140, 255, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid rgba(0, 140, 255, 0.5);
        
        &:hover {
          background: rgba(0, 140, 255, 0.6);
          transform: scale(1.1);
          box-shadow: 0 0 0.8vw rgba(0, 140, 255, 0.6);
        }
        
        &.active {
          background: #00d4ff;
          box-shadow: 0 0 1.2vw rgba(0, 212, 255, 0.8);
          transform: scale(1.2);
        }
      }
    }
  }
}

.drawer.collapsed {
  width: 40px;
  .drawer-content { 
    display: none;
  }
  
  .drawer-toggle {
    right: -20px;
    width: 40px;
    border-radius: 0 20px 20px 0;
  }
}

/* 图片预览模态框样式 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 20, 40, 0.9);
  backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: linear-gradient(180deg, rgba(0, 40, 80, 0.95) 0%, rgba(0, 20, 40, 0.95) 100%);
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 140, 255, 0.3);
  animation: scaleIn 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-button {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 35px;
  height: 35px;
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 50%;
  background: rgba(0, 40, 80, 0.9);
  color: #00d4ff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 140, 255, 0.4);
}

.close-button:hover {
  background: rgba(0, 60, 120, 0.9);
  border-color: rgba(0, 140, 255, 0.8);
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(0, 140, 255, 0.6);
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid rgba(0, 140, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 140, 255, 0.3);
}

.preview-info {
  margin-top: 15px;
  font-size: 14px;
  color: #c6d6ea;
  text-align: center;
  text-shadow: 0 0 5px rgba(0, 140, 255, 0.3);
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.8);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
    padding: 15px;
  }
  
  .close-button {
    top: -12px;
    right: -12px;
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
  
  .preview-image {
    max-height: 70vh;
  }
  
  .preview-info {
    font-size: 12px;
  }
}
</style>