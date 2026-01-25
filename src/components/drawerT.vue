<template>
<!-- 侧拉框 -->
    <div>
      <aside class="drawer" :class="{ collapsed: !drawerOpen }" role="complementary" aria-label="侧拉面板">
      <button class="drawer-toggle" @click="toggleDrawer" :aria-expanded="drawerOpen" :title="drawerOpen ? '收起' : '展开'">
        <span class="arrow" :class="{ right: !drawerOpen }">❯</span>
      </button>
      <div class="drawer-content">
        <section class="drawer-text">
          <h3>项目简介</h3>
          <p>随着火电机组超低排放改造的稳步推进，粉煤灰等固废产量逐年攀升，为满足粉煤灰综合利用与智慧储运管理的双重需求，钢板仓灰库于2025年1月开工，2025年8月竣工，总投资2500万元。灰库直径30米，设计高度37.3米，容量共计约2.5万立方米，可装粉煤灰2.5万吨。该库可有效缓解电力生产的灰库库容压力，有利地保障了景德镇电厂的安全生产，具有重要的经济社会生态效益。</p>
          <p>为了保障灰库的稳定生产和钢板仓灰库的结构安全，由江西中业兴达实业有限公司和江西水利电力大学联合开发设计了景德镇电厂灰库数字孪生健康管理系统。该系统采用了智能传感器、机器人、微波视觉、物联网、数字孪生等先进技术，系统主要包括掘进式板结清理机器人、3D雷达灰堆形貌扫描机器人、库体形变监测与预警等模块。本项目获2023年省重大科技专项经费资助，其显著提高了灰库生产管理的技术水平，保障了灰库生产的安全度与透明度，也提高了灰库运行和电力生产的数字化与智能化水平。</p>
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
        
        this.$nextTick(() => {
        const el = document.querySelector('.control');
        // console.log(el);
        if (!el) return console.warn('.control 未找到');
        // 设置单个属性，避免覆盖其它内联样式
        el.style.background = 'linear-gradient(90deg, rgba(10,12,20,0), rgba(20,22,30,0))';
        el.style.transform = 'translateX(0%)';
        el.style.top = '10%';
        // el.style.height = '50%';
        });
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
  width: 50%;
  // width: 30%;
  background-image: url(@/assets/image/uibg.png);
  color: #e6eef8;
  box-shadow: 2px 0 12px rgba(0,0,0,0.3);
  transition: width 0.26s ease, transform 0.26s ease;
  z-index: 100;
  overflow: hidden;
  display: flex;
  align-items: center;
  .drawer-toggle {
    position: absolute;
    right: -18px;
    top: 50%;
    width: 36px;
    height: 50px;
    border-radius: 18px;
    background: #0b1220;
    border: 1px solid rgba(255,255,255,0.06);
    color: #cfe8ff;
    cursor: pointer;
    display: flex;
    align-items: center;
    // justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    .arrow {
      display: inline-block;
      transform: rotate(0deg);
      transition: transform 0.2s ease;
      &.right { transform: rotate(180deg); }
    }
  }

  .drawer-content {
    width: 100%;
    padding: 2.4vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.5vh;
  }
  .drawer-text {
    flex: 0.54;
    // margin: 20px;
    h3 { 
      margin:0 0 0.7vh 0; 
      color:#fff; 
      font-size:1.5vw; 
      margin-bottom: 1.5vh;
      text-align: center;}
    p { 
      margin:0 0 0.7vw 0; 
      color:#c6d6ea; 
      font-size:1.25vw;
      line-height:1.4; 
      border-radius:6px;
      text-indent: 2em;
      text-align: justify; /* 添加两端对齐 */
      border: 1px solid rgba(255,255,255,0.08);
    }   
      
  }
  .drawer-image {
    flex: 0.4;
    text-align: center;
    h4 { margin:0 0 0.7vh 0; color:#fff; font-size:1.5vw; }
    .drawer-image-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      max-width: 100%;
      height: 40vh;
      border-radius:6px;
      border: 1px solid rgba(255,255,255,0.08);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative; /* 为按钮定位提供参考 */
      
      img {
        max-width: 100%;
        height: auto;
        object-fit: contain;
        display: block;
        margin: 0 auto;
        max-height: calc(40vh - 5px);
        transition: transform 0.3s ease;
      }
      &:hover img {
        transform: scale(1.02);
      }
      
      /* 轮播切换按钮样式 */
      .carousel-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 2;
        
        &:hover {
          background: rgba(0, 0, 0, 0.8);
          transform: translateY(-50%) scale(1.1);
        }
        
        .arrow {
          pointer-events: none; /* 防止箭头文字被点击 */
        }
      }
      
      .prev-btn {
        left: 10px; /* 左侧按钮 */
      }
      
      .next-btn {
        right: 10px; /* 右侧按钮 */
      }
    }
    
    /* 轮播指示器样式 */
    .carousel-indicators {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 12px;
      gap: 8px;
      
      .indicator-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.5);
        
        &:hover {
          background: rgba(255, 255, 255, 0.6);
          transform: scale(1.1);
        }
        
        &.active {
          background: #fff;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          transform: scale(1.2);
        }
      }
    }
  }
}

.drawer.collapsed {
  width: 36px; /* 只显示箭头 */
  .drawer-content { display:none; }
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  border: none;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
}

.close-button:hover {
  background: #ff3742;
  transform: scale(1.1);
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-info {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
  text-align: center;
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