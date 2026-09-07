<template>
  <div class="serial-page">
     <!-- 第一个容器：标题 -->
    <div class="container-title">
      <h1>即时数据采集与显示</h1>
    </div>

    <!-- 第二个容器：四个半圆形仪表盘 -->
    <div class="container-gauges">
      <!-- 应力计仪表盘 -->
      <div class="gauge-item">
        <div class="gauge-container">
          <svg viewBox="0 0 220 130" class="gauge-svg">
            <defs>
              <linearGradient id="gaugeGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#00c6ff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0072ff;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M 10 110 A 100 100 0 0 1 210 110" fill="none" stroke="#1a3a5c" stroke-width="21" stroke-linecap="round"/>
            <path :d="gaugeArc(100, progressData.stress)" fill="none" stroke="url(#gaugeGradient1)" stroke-width="21" stroke-linecap="round" class="gauge-progress"/>
            <text x="110" y="100" text-anchor="middle" class="gauge-value">{{ progressData.stress }}%</text>
          </svg>
        </div>
        <div class="gauge-label">
          <span class="gauge-name">应力计</span>
          <span class="gauge-count">({{ sensorCounts.stress }}套)</span>
        </div>
      </div>

      <!-- 倾角计仪表盘 -->
      <div class="gauge-item">
        <div class="gauge-container">
          <svg viewBox="0 0 220 130" class="gauge-svg">
            <defs>
              <linearGradient id="gaugeGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M 10 110 A 100 100 0 0 1 210 110" fill="none" stroke="#1a3a5c" stroke-width="21" stroke-linecap="round"/>
            <path :d="gaugeArc(100, progressData.inclinometer)" fill="none" stroke="url(#gaugeGradient2)" stroke-width="21" stroke-linecap="round" class="gauge-progress"/>

            <text x="110" y="100" text-anchor="middle" class="gauge-value">{{ progressData.inclinometer }}%</text>
          </svg>
        </div>
        <div class="gauge-label">
          <span class="gauge-name">倾角计</span>
          <span class="gauge-count">({{ sensorCounts.inclinometer }}台)</span>
        </div>
      </div>

      <!-- 沉降仪仪表盘 -->
      <div class="gauge-item">
        <div class="gauge-container">
          <svg viewBox="0 0 220 130" class="gauge-svg">
            <defs>
              <linearGradient id="gaugeGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#43e97b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#38f9d7;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M 10 110 A 100 100 0 0 1 210 110" fill="none" stroke="#1a3a5c" stroke-width="21" stroke-linecap="round"/>
            <path :d="gaugeArc(100, progressData.settlement)" fill="none" stroke="url(#gaugeGradient3)" stroke-width="21" stroke-linecap="round" class="gauge-progress"/>

            <text x="110" y="100" text-anchor="middle" class="gauge-value">{{ progressData.settlement }}%</text>
          </svg>
        </div>
        <div class="gauge-label">
          <span class="gauge-name">沉降仪</span>
          <span class="gauge-count">({{ sensorCounts.settlement }}套)</span>
        </div>
      </div>

      <!-- 温湿度计仪表盘 -->
      <div class="gauge-item">
        <div class="gauge-container">
          <svg viewBox="0 0 220 130" class="gauge-svg">
            <defs>
              <linearGradient id="gaugeGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#ffecd2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fcb69f;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M 10 110 A 100 100 0 0 1 210 110" fill="none" stroke="#1a3a5c" stroke-width="21" stroke-linecap="round"/>
            <path :d="gaugeArc(100, progressData.humidity)" fill="none" stroke="url(#gaugeGradient4)" stroke-width="21" stroke-linecap="round" class="gauge-progress"/>

            <text x="110" y="100" text-anchor="middle" class="gauge-value">{{ progressData.humidity }}%</text>
          </svg>
        </div>
        <div class="gauge-label">
          <span class="gauge-name">温湿度计</span>
          <span class="gauge-count">({{ sensorCounts.humidity }}台)</span>
        </div>
      </div>
    </div>
   
      <div class="button-section">
        <!-- <button class="control-btn" @click="impowerSerialPort" :disabled="impowerDisabled">授权端口</button> -->
        <!-- <button class="control-btn" @click="connectMultiplePorts" :disabled="connectDisabled">连接端口</button> -->
        <button class="control-btn" @click="startMain" :disabled="gainDisabled">即时获取</button>
        <button class="control-btn" @click="tableShow(tableData)" :disabled="gainDisabled">表单显示</button>
        <!-- <button class="control-btn" @click="creatExcel(tableData)" :disabled="gainDisabled">导出 Excel 文档</button> -->
        <!-- <button class="control-btn" @click="closeAllPorts">断开所有端口</button> -->
        <!-- <button class="control-btn" @click="saveToMySQL" :disabled="gainDisabled">导入 MySQL</button>  -->
      </div>
      <!-- 进度条容器 -->
      <!-- <div class="progress-container" v-show="showProgress"> -->
        <!-- 进度条 -->
        <!-- <div class="progress-bar" id="progress-bar" :style="{width: currentProgress + '%'}">{{ Math.round(currentProgress) }}%</div> -->
      <!-- </div> -->
      <pre id="responseDisplay" style="font-size: 1vw">{{ responseText }}</pre>
    </div>

  
</template>

<script>
import axios from 'axios';
export default {
  name: 'AutoTypeParse',
  // components: { ResultTable },
  components: {  },
  data() {
    return {
      progressFlag:false,
      connectedPorts: [],
      responseText: '无端口连接',
      impowerDisabled: false,
      connectDisabled: false,
      gainDisabled: false,
      // showResultModal: false,
      flag:false,
      // resultData: [],
      currentProgress:0,
      port:null,
      tableData: [],
      statsInfo: '请输入查询条件并点击查询按钮',

      // 校验表数据
      progressAnimationTimer: null,
      progressData: {
        stress: 0,        // 应力计进度
        inclinometer: 0,  // 倾角计进度
        settlement: 0,    // 沉降仪进度
        humidity: 0        // 温湿度计进度
      },
      // 传感器数量
      sensorCounts: {
        stress: 196,
        inclinometer: 8,
        settlement: 7,
        humidity: 4
      },
      // 进度条完成时间配置（秒）
      progressDuration: {
        stress: 240,
        inclinometer: 100,
        settlement: 80,
        humidity: 60
      }
    };
  },
  mounted() {
    if ('serial' in navigator) {
      navigator.serial.onconnect = (e) => {
        console.log('serial connected', e);
      };
      navigator.serial.ondisconnect = (e) => {
        console.log('serial disconnected', e);
        this.connectedPorts = this.connectedPorts.filter(item => item.port !== e.target);
      };
    }
    window.addEventListener('beforeunload', this.closeAllPorts);
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.closeAllPorts);
    this.closeAllPorts();
  },
  methods: {
    // 计算半圆形仪表盘弧线路径
    gaugeArc(maxValue, currentValue) {
      const startX = 10;
      const startY = 110;
      const radius = 100;
      // const progress = Math.min(Math.max(currentValue / maxValue, 0), 1);
      // 将currentValue转换为数字并限制范围，然后计算进度
      const numValue = Number(currentValue) || 0;
      const safeValue = Math.min(Math.max(numValue, 0), 100);
      const progress = safeValue / 100;
      const angle = Math.PI * progress;
      const endX = startX + radius * (1 - Math.cos(angle));
      const endY = startY - radius * Math.sin(angle);
      return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
    },
    // 启动进度条动画
    startProgressAnimation() {
      // 清除之前的动画定时器
      if (this.progressAnimationTimer) {
        clearInterval(this.progressAnimationTimer);
      }
      
      // 每次更新的时间间隔（毫秒）
      const intervalTime = 500;
      
      // 获取各自的完成时间配置（秒）
      const stressTime = this.progressDuration.stress || 20;
      const inclinometerTime = this.progressDuration.inclinometer || 20;
      const settlementTime = this.progressDuration.settlement || 20;
      const humidityTime = this.progressDuration.humidity || 20;
      
      // 计算每个进度条每次更新的增量百分比
      const stressIncrement = 100 / (stressTime * 1000 / intervalTime);
      const inclinometerIncrement = 100 / (inclinometerTime * 1000 / intervalTime);
      const settlementIncrement = 100 / (settlementTime * 1000 / intervalTime);
      const humidityIncrement = 100 / (humidityTime * 1000 / intervalTime);
      
      // 初始化进度
      this.progressData.stress = 0;
      this.progressData.inclinometer = 0;
      this.progressData.settlement = 0;
      this.progressData.humidity = 0;
      
      // 存储当前的精确进度值（用于计算）
      let stressValue = 0;
      let inclinometerValue = 0;
      let settlementValue = 0;
      let humidityValue = 0;
      
      // 设置定时器，每隔 intervalTime 毫秒更新一次进度条
      this.progressAnimationTimer = setInterval(() => {
        // 更新进度条数据（确保不超过100）
        if (stressValue < 100) {
          stressValue = Math.min(stressValue + stressIncrement, 100);
          this.progressData.stress = Math.min(Math.round(stressValue * 100) / 100, 100);
        }
        if (inclinometerValue < 100) {
          inclinometerValue = Math.min(inclinometerValue + inclinometerIncrement, 100);
          this.progressData.inclinometer = Math.min(Math.round(inclinometerValue * 100) / 100, 100);
        }
        if (settlementValue < 100) {
          settlementValue = Math.min(settlementValue + settlementIncrement, 100);
          this.progressData.settlement = Math.min(Math.round(settlementValue * 100) / 100, 100);
        }
        if (humidityValue < 100) {
          humidityValue = Math.min(humidityValue + humidityIncrement, 100);
          this.progressData.humidity = Math.min(Math.round(humidityValue * 100) / 100, 100);
        }
        
        // 当所有进度都达到 100% 时，清除定时器
        if (stressValue >= 100 && 
            inclinometerValue >= 100 && 
            settlementValue >= 100 && 
            humidityValue >= 100) {
          clearInterval(this.progressAnimationTimer);
          this.progressAnimationTimer = null;
        }
      }, intervalTime);
    },
    // 停止进度条动画
    stopProgressAnimation() {
      if (this.progressAnimationTimer) {
        clearInterval(this.progressAnimationTimer);
        this.progressAnimationTimer = null;
      }
      // 确保所有进度值不超过100
      this.progressData.stress = Math.min(Number(this.progressData.stress) || 0, 100);
      this.progressData.inclinometer = Math.min(Number(this.progressData.inclinometer) || 0, 100);
      this.progressData.settlement = Math.min(Number(this.progressData.settlement) || 0, 100);
      this.progressData.humidity = Math.min(Number(this.progressData.humidity) || 0, 100);
    },

    portLabel(port) {
      try {
        const info = port.getInfo ? port.getInfo() : {};
        return info.usbVendorId ? `USB ${info.usbVendorId}:${info.usbProductId}` : '未知';
      } catch (e) {
        return '未知';
      }
    },

    unsignedHexToDecimal(hexStr) {

      return parseInt(hexStr, 16);
    },
    async tableShow(finalArr) {
      // 过滤掉 null/undefined/非对象项
      // console.log(finalArr,'--------'); 
      const safeArr = await Array.isArray(finalArr) ? finalArr.filter(item => item && typeof item === 'object') : [];
      // 更新表格数据
      // this.tableData = safeArr;
      // 更新统计信息
      this.statsInfo = `共 ${safeArr.length} 条数据`;
      
      // 存储数据到 localStorage
      localStorage.setItem('sensorData', JSON.stringify(safeArr));
      // 使用完整路径打开页面
      setTimeout(() => {
        // window.open('/pageB.html');
        this.$EventBus.$emit('showPageData',safeArr);
      }, 500);
    },
    

    async connectMultiplePorts() {
      try {
        if (!('serial' in navigator)) {
          alert('当前浏览器不支持 Web Serial API');
          return;
        }
        const ports = await navigator.serial.getPorts();
        for (const port of ports) {
          try {
            await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
            this.connectedPorts.push({ port });
          } catch (e) {
            console.warn('打开已配对端口失败', e);
          }
        }
        this.responseText = `已连接 ${this.connectedPorts.length} 个端口`;
        this.$store.state.connectedPorts = this.connectedPorts
        // this.startMain()
      } catch (err) {
        console.log(222);
        
        console.error('connectMultiplePorts 出错', err);
        this.responseText = `连接端口出错: ${err.message || err}`;
      }
    },

    calculateCRC(data) {
      let crc = 0xFFFF;
      for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
          if (crc & 0x0001) crc = (crc >> 1) ^ 0xA001;
          else crc = crc >> 1;
        }
      }
      return [(crc & 0xFF), ((crc >> 8) & 0xFF)];
    },

    hexToDecimal(hexStr) {
      return parseInt(hexStr, 16);
    },

    getHexComplement(hexStr) {
      let decimal = parseInt(hexStr, 16);
      if (decimal & 0x8000) {
        decimal = ~decimal + 1;
        decimal &= 0xFFFF;
      }
      return decimal.toString(16).padStart(4, '0');
    },
    
    signedHexToDecimal(hexStr) {

      // 先计算补码
      let complementHex = this.getHexComplement(hexStr);
      // 将十六进制补码转换为二进制
      let binaryStr = parseInt(complementHex, 16).toString(2).padStart(16, '0');

      if (binaryStr[0] === '0') {
        // 正数直接转换为十进制
        return parseInt(binaryStr, 2);
      } else {
        // 负数需要特殊处理
        // 先去掉符号位
        let absBinary = binaryStr.slice(1);
        // 取反加一得到绝对值的二进制
        let invertedBinary = '';
        for (let bit of absBinary) {
          invertedBinary += bit === '0' ? '1' : '0';
        }
        let carry = 1;
        let absBinaryStr = '';
        for (let i = invertedBinary.length - 1; i >= 0; i--) {
          let sum = parseInt(invertedBinary[i]) + carry;
          if (sum === 2) {
            absBinaryStr = '0' + absBinaryStr;
            carry = 1;
          } else {
            absBinaryStr = sum.toString() + absBinaryStr;
            carry = 0;
          }
        }
        // 计算绝对值的十进制
        let absDecimal = parseInt(absBinaryStr, 2);
        return -absDecimal;
      }
    },

    verifyCode(data) {
      const hexArray = data.split(' ');
      const byteArray = hexArray.map(hex => parseInt(hex, 16));
      const slaveAddress = byteArray[0];
      const functionCode = byteArray[1];
      const byteCount = byteArray[2];
      switch (functionCode) {
        case 4:
         {
           let hexRegisterData;
          if (byteCount < 200) {
            hexRegisterData = hexArray.slice(3, 3 + byteCount);
          } else {
            hexRegisterData = hexArray.slice(7, byteCount - 1);
          }
          const newArray = [];
          for (let i = 0; i < hexRegisterData.length; i += 2) {
            if (i + 1 < hexRegisterData.length) {
              newArray.push(hexRegisterData[i] + hexRegisterData[i + 1]);
            } else {
              newArray.push(hexRegisterData[i]);
            }
          }
          const receivedCRC = byteArray.slice(byteArray.length - 2);
          const calculatedCRC = this.calculateCRC(byteArray.slice(0, byteArray.length - 2));
          const isCRCValid = (receivedCRC[0] === calculatedCRC[0]) && (receivedCRC[1] === calculatedCRC[1]);
          if (isCRCValid) {
            return [newArray, slaveAddress];
          } else {
            console.log('验证校验码未通过');
            return [[], slaveAddress];
          }
          
         }
        default:
          return { error: `不支持的功能码: ${functionCode}` };
      }
    },
    installPosition(sensorId) {

      let position
      switch (sensorId) {

        case 54379: position = 'GBC1-B-L'; break;
        case 33475: position = 'GBC1-A-R'; break;
        case 33336: position = 'GBC3-A-L'; break;
        case 33199: position = 'GBC1-A-L'; break;
        case 15139: position = 'GBC4-B-L'; break;
        case 42596: position = 'GBC2-B-L'; break;
        case 9859: position = 'GBC9-A-L'; break;
        case 40243: position = 'GBC8-A-L'; break;
        case 47523: position = 'GBC6-B-L'; break;
        case 38937: position = 'GBC5-B-L'; break;
        case 53625: position = 'GBC2-A-L'; break;
        case 64178: position = 'GBC3-B-L'; break;
        case 15391: position = 'GBC4-A-L'; break;
        case 447: position = 'GBC5-A-L'; break;
        case 10142: position = 'GBC7-A-L'; break;
        case 54218: position = 'GBC6-A-L'; break;
        case 15804: position = 'GBC14-B-L'; break;
        case 2927: position = 'GBC12-B-L'; break;
        case 17710: position = 'GBC1-B-R-V'; break;
        case 60847: position = 'GBC5-B-R'; break;
        case 61603: position = 'GBC8-B-L'; break;
        case 15998: position = 'GBC13-B-L'; break;
        case 47778: position = 'GBC16-B-L'; break;
        case 55809: position = 'GBC11-B-L'; break;
        case 27773: position = 'GBC15-B-L'; break;
        case 30256: position = 'GBC1-B-R'; break;
        case 12452: position = 'GBC3-B-R-V'; break;
        case 20422: position = 'GBC3-B-R'; break;
        case 65123: position = 'GBC10-B-L'; break;
        case 27645: position = 'GBC7-B-L'; break;
        case 52632: position = 'GBC2-B-R-V'; break;

        case 13686: position = 'GBC1-C-L'; break;
        case 3641: position = 'GBC5-B-R-V'; break;
        case 9384: position = 'GBC11-B-R-V'; break;
        case 23383: position = 'GBC9-B-R-V'; break;
        case 13979: position = 'GBC6-B-R-V'; break;
        case 25440: position = 'GBC13-B-R-V'; break;
        case 25685: position = 'GBC7-B-R-V'; break;
        case 19044: position = 'GBC8-B-R-V'; break;
        case 19439: position = 'GBC4-C-L'; break;
        case 35177: position = 'GBC10-B-R-V'; break;
        case 11346: position = 'GBC15-B-R-V'; break;
        case 58498: position = 'GBC14-B-R-V'; break;
        case 12653: position = 'GBC3-C-L'; break;
        case 54743: position = 'GBC12-B-R-V'; break;
        case 63602: position = 'GBC3-D-L'; break;
        case 2140: position = 'GBC4-B-R-V'; break;
        case 33623: position = 'GBC6-D-L'; break;
        case 12394: position = 'GBC4-D-L'; break;
        case 12699: position = 'GBC9-C-L'; break;
        case 47451: position = 'GBC6-C-L'; break;
        case 38044: position = 'GBC1-D-L'; break;
        case 53404: position = 'GBC8-C-L'; break;
        case 23906: position = 'GBC2-D-L'; break;
        case 15406: position = 'GBC5-D-L'; break;
        case 27543: position = 'GBC1-C-R'; break;
        case 17020: position = 'GBC7-C-L'; break;
        case 33732: position = 'GBC5-C-L'; break;
        case 27427: position = 'GBC2-C-L'; break;
        case 30700: position = 'GBC8-D-L'; break;
        case 10610: position = 'GBC10-D-L'; break;
        case 594: position = 'GBC7-D-L'; break;
        case 19313: position = 'GBC9-D-L'; break;

        case 55932: position = 'GBC14-D-L'; break;
        case 21100: position = 'GBC7-D-R-V'; break;
        case 31587: position = 'GBC12-D-L'; break;
        case 13916: position = 'GBC2-D-R-V'; break;
        case 15188: position = 'GBC5-E-L'; break;
        case 31133: position = 'GBC11-D-L'; break;
        case 27467: position = 'GBC3-D-R'; break;
        case 59305: position = 'GBC3-E-L'; break;
        case 12128: position = 'GBC13-D-L'; break;
        case 38839: position = 'GBC7-E-L'; break;
        case 35181: position = 'GBC4-E-L'; break;
        case 5401: position = 'GBC8-E-L'; break;
        case 27746: position = 'GBC2-E-L'; break;
        case 9974: position = 'GBC9-E-L'; break;
        case 61488: position = 'GBC6-E-L'; break;
        case 23413: position = 'GBC1-F-L'; break;
        case 44259: position = 'GBC3-D-R-V'; break;
        case 24376: position = 'GBC1-E-R'; break;
        case 31834: position = 'GBC5-D-R-V'; break;
        case 56404: position = 'GBC8-D-R-V'; break;
        case 3680: position = 'GBC1-E-L'; break;
        case 64186: position = 'GBC2-F-L'; break;
        case 64168: position = 'GBC4-F-L'; break;
        case 29290: position = 'GBC6-D-R-V'; break;
        case 35188: position = 'GBC1-D-R-V'; break;
        case 51963: position = 'GBC5-F-L'; break;
        case 43688: position = 'GBC4-D-R-V'; break;
        case 26309: position = 'GBC1-D-R'; break;
        case 44230: position = 'GBC16-D-L'; break;
        case 32457: position = 'GBC15-D-L'; break;

        case 18459: position = 'GBC8-H-R-V'; break;
        case 64118: position = 'GBC7-H-R-V'; break;
        case 64575: position = 'GBC6-H-R-V'; break;
        case 59100: position = 'GBC7-G-L'; break;
        case 43357: position = 'GBC9-G-L'; break;
        case 46189: position = 'GBC4-H-R-V'; break;
        case 30905: position = 'GBC1-H-R'; break;
        case 53402: position = 'GBC5-H-R-V'; break;
        case 24180: position = 'GBC1-H-R-V'; break;
        case 30523: position = 'GBC3-H-R-V'; break;
        case 34886: position = 'GBC3-H-R'; break;
        case 61194: position = 'GBC5-G-L'; break;
        case 37526: position = 'GBC1-G-R'; break;
        case 58575: position = 'GBC2-H-R-V'; break;
        case 2647: position = 'GBC8-G-L'; break;
        case 22373: position = 'GBC6-G-L'; break;
        case 30780: position = 'GBC8-F-R-V'; break;
        case 8377: position = 'GBC4-G-L'; break;
        case 11645: position = 'GBC12-F-R-V'; break;
        case 7101: position = 'GBC3-G-L'; break;
        case 22866: position = 'GBC7-F-R-V'; break;
        case 59685: position = 'GBC10-F-R-V'; break;
        case 13167: position = 'GBC1-G-L'; break;
        case 59313: position = 'GBC15-F-R-V'; break;
        case 26722: position = 'GBC2-G-L'; break;
        case 97: position = 'GBC9-F-R-V'; break;
        case 62405: position = 'GBC4-F-R-V'; break;
        case 59879: position = 'GBC14-F-R-V'; break;
        case 56542: position = 'GBC5-F-R-V'; break;
        case 49523: position = 'GBC6-F-R-V'; break;
        case 9794: position = 'GBC11-F-R-V'; break;
        case 37744: position = 'GBC13-F-R-V'; break;

        case 42652: position = 'GBC10-F-L'; break;
        case 36717: position = 'GBC9-F-L'; break;
        case 25447: position = 'GBC8-F-L'; break;
        case 16574: position = 'GBC1-F-R'; break;
        case 45913: position = 'GBC11-F-L'; break;
        case 417: position = 'GBC1-F-R-V'; break;
        case 16556: position = 'GBC12-F-L'; break;
        case 21049: position = 'GBC16-F-L'; break;
        case 62650: position = 'GBC3-F-R-V'; break;
        case 7991: position = 'GBC2-F-R-V'; break;
        case 38885: position = 'GBC15-F-L'; break;
        case 14051: position = 'GBC3-F-R'; break;
        case 20443: position = 'GBC14-F-L'; break;
        case 10068: position = 'GBC7-F-L'; break;
        case 30273: position = 'GBC13-F-L'; break;
        case 48184: position = 'GBC1-H-L'; break;
        case 2809: position = 'GBC9-H-L'; break;
        case 47197: position = 'GBC14-H-L'; break;
        case 38687: position = 'GBC6-H-L'; break;
        case 23897: position = 'GBC15-H-L'; break;
        case 4041: position = 'GBC10-H-L'; break;
        case 2673: position = 'GBC2-H-L'; break;
        case 18796: position = 'GBC8-H-L'; break;
        case 9047: position = 'GBC4-H-L'; break;
        case 60962: position = 'GBC12-H-L'; break;
        case 52579: position = 'GBC16-H-L'; break;
        case 25661: position = 'GBC7-H-L'; break;
        case 46760: position = 'GBC13-H-L'; break;
        case 1395: position = 'GBC5-H-L'; break;
        case 40174: position = 'GBC11-H-L'; break;
        case 60922: position = 'GBC3-H-L'; break;

        case 45729: position = 'ZS3A'; break;
        case 7987: position = 'ZS3B'; break;
        case 22193: position = 'ZS3C'; break;
        case 6300: position = 'ZS4A'; break;
        case 18176: position = 'ZS4B'; break;
        case 31116: position = 'ZS5A'; break;
        case 56388: position = 'ZS5B'; break;
        case 14114: position = 'ZS5C'; break;
        case 27192: position = 'ZS8A'; break;
        case 5955: position = 'ZS8B'; break;
        case 61114: position = 'ZS8C'; break;
        case 60477: position = 'ZS10A'; break;
        case 7156: position = 'ZS10B'; break;
        case 32151: position = 'ZS10C'; break;
        case 22245: position = 'ZS11B'; break;
        case 53714: position = 'ZS11C'; break;
        case 34672: position = 'ZS12C'; break;
        case 39507: position = 'ZS13A'; break;
        case 39020: position = 'ZS21A'; break;
        case 64789: position = 'ZS14A'; break;
        case 46678: position = 'ZS14B'; break;
        case 8056: position = 'ZS14C'; break;
        case 52055: position = 'ZS16B'; break;
        case 43642: position = 'ZS16C'; break;
        case 21332: position = 'ZS18A'; break;
        case 23798: position = 'ZS18B'; break;
        case 29711: position = 'ZS18C'; break;
        case 49809: position = 'ZS20A'; break;
        case 22165: position = 'ZS20C'; break;
        case 15859: position = 'ZS13B'; break;
        case 21417: position = 'ZS21B'; break;
        case 64215: position = 'ZS12A'; break;

        case 1096: position = 'ZY1'; break;
        case 48251: position = 'ZY2'; break;
        case 55375: position = 'ZY3'; break;
        case 3172: position = 'ZY6'; break;

        case 46199: position = 'ZY8'; break;
        case 6129: position = 'ZY10'; break;
        case 38710: position = 'ZY7'; break;
        case 65415: position = 'ZY9'; break;
        case 60416: position = 'ZY11'; break;
        case 17270: position = 'ZY16'; break;
        case 49075: position = 'ZS21C'; break;
        case 22601: position = 'ZY13'; break;

        case 34596: position = '库顶1'; break;
        case 62812: position = 'GBC7-B-R'; break;
        case 63324: position = 'GBC16-B-R'; break;
        case 63580: position = 'GBC7-D-R'; break;
        case 64092: position = 'GBC16-D-R'; break;
        case 63836: position = 'GBC7-F-R'; break;
        case 61532: position = 'GBC16-F-R'; break;
        case 62044: position = 'GBC7-H-R'; break;
        case 63068: position = 'GBC16-H-R'; break;
        case 34663: position = '库顶2'; break;
        case 45927: position = '库顶3'; break;
        case 39015: position = '库顶4'; break;
        case 42461: position = '横向桥架A'; break;
        case 13530: position = '横向桥架B'; break;
        case 60630: position = '横向桥架C'; break;
        case 23782: position = '横向桥架D'; break;
        case 28759: position = '横向桥架E'; break;
        case 6413: position = '横向桥架F'; break;
        case 33966: position = '横向桥架G'; break;
        default: position = 'null'; break
      }
      return position
    },
    vibraParse(jointArr, address) {
      const date = new Date()
      const dateYMD = date.toLocaleDateString()
      const year = date.getFullYear()
      const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

      const timeStr = year + '/' + month + '/' + day + '/' + hour + ':' + minutes

      const objectArray = [];
      for (let i = 0, j = 1; i < jointArr.length; i += 4, j++) {

        const group = {
          '采集时间': timeStr,    //时间-----------------新加
          '解调仪地址': address,  // 解调仪地址
          '解调仪类型': null,  // 解调仪类型 --------新加
          '传感器ID': jointArr[i],  // 传感器ID ------------新加
          '安装位置': null,  //----------------------------------------------------------------------//
          '通道号': jointArr.length < 68 ? j : j + 15, // 解调仪通道号
          '传感器类型': (jointArr[i + 1] || null),  // 传感器型号
          '温度(°C)': (jointArr[i + 2] || null),  // 温度
          '湿度(%)': null,  // 湿度
          '频率(Hz)': (jointArr[i + 3] || null),
          '应变值(με)': null,  // 应变值
          '沉降值(mm)': null,   // 沉降值
          'X向倾角(°)': null,  // X向倾角
          'Y向倾角(°)': null,  // Y向倾角
        };
        objectArray.push(group);
      }

      for (let i = 0; i < objectArray.length; i++) {

        const type = this.unsignedHexToDecimal(objectArray[i]['传感器类型'])
        const sensorId = this.unsignedHexToDecimal(objectArray[i]['传感器ID'])  //------------------------------------//



        switch (type) {
          case 3: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)  //--------------------------------------------//
            objectArray[i]['解调仪类型'] = '振弦式解调仪',
              objectArray[i]['传感器类型'] = '钢筋应力计(3)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(objectArray[i]['温度(°C)']) / 16,
              objectArray[i]['频率(Hz)'] = this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 10,
              objectArray[i]['应变值(με)'] = 0.002 * (objectArray[i]['频率(Hz)']) * (objectArray[i]['频率(Hz)'])
            break;
          case 6: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)
            objectArray[i]['解调仪类型'] = '振弦式解调仪'
            objectArray[i]['传感器类型'] = '埋入型应力计(6)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(objectArray[i]['温度(°C)']) / 16,
              objectArray[i]['频率(Hz)'] = this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 10,
              objectArray[i]['应变值(με)'] = 0.002 * (objectArray[i]['频率(Hz)']) * (objectArray[i]['频率(Hz)'])
            break;
          // case 0: delete objectArray[i]
          //   break;
          case 0: objectArray[i]['采集时间'] = null,
            objectArray[i]['解调仪地址'] = null,
            objectArray[i]['传感器ID'] = null,
            objectArray[i]['安装位置'] = null,
            objectArray[i]['通道号'] = null,
            objectArray[i]['传感器类型'] = null
            objectArray[i]['温度(°C)'] = null,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;
          default:
            break;
        }
      }
      return objectArray
    },
    hexToSignedDecimal(hexStr) {
      // 将十六进制字符串转换为 16 位二进制字符串
      let binaryStr = parseInt(hexStr, 16).toString(2).padStart(16, '0');
      // 判断符号位
      if (binaryStr[0] === '0') {
        // 正数，直接转换为十进制
        return parseInt(binaryStr, 2);
      } else {
        // 负数，先求反码
        let invertedBinary = '';
        for (let i = 1; i < binaryStr.length; i++) {
          invertedBinary += binaryStr[i] === '0' ? '1' : '0';
        }
        // 反码加 1 得到原码（除符号位）
        let carry = 1;
        let originalBinary = '';
        for (let i = invertedBinary.length - 1; i >= 0; i--) {
          let sum = parseInt(invertedBinary[i]) + carry;
          if (sum === 2) {
            originalBinary = '0' + originalBinary;
            carry = 1;
          } else {
            originalBinary = sum.toString() + originalBinary;
            carry = 0;
          }
        }
        // 计算绝对值的十进制
        let absDecimal = parseInt(originalBinary, 2);
        // 添加负号
        return -absDecimal;
      }
    },
    //........................................
    BUSParse(jointArr, address) {
      const date = new Date()
      const dateYMD = date.toLocaleDateString()
      const year = date.getFullYear()
      const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

      const timeStr = year + '/' + month + '/' + day + '/' + hour + ':' + minutes

      const objectArray = [];
      for (let i = 0, j = 1; i < jointArr.length; i += 5, j++) {

        const group = {

          '采集时间': timeStr,    //时间-----------------新加
          '解调仪地址': address,  // 解调仪地址
          '解调仪类型': '总线式解调仪',  // 解调仪类型 --------新加
          '传感器ID': jointArr[i],  // 传感器ID ------------新加
          '安装位置': null,  //---------------------------------------------------------
          '通道号': j, // 解调仪通道号
          '传感器类型': (jointArr[i + 1] || null),  // 传感器型号
          '温度(°C)': (jointArr[i + 2] || null),  // 温度
          '湿度(%)': (jointArr[i + 3] || null),  // 湿度
          '频率(Hz)': null,
          '应变值(με)': null,  // 应变值
          '沉降值(mm)': ((jointArr[i + 3] + jointArr[i + 4]) || null),   // 沉降值
          'X向倾角(°)': (jointArr[i + 3] || null),  // X向倾角
          'Y向倾角(°)': (jointArr[i + 4] || null),  // Y向倾角

        };
        objectArray.push(group);
      }

      for (let i = 0; i < objectArray.length; i++) {

        const type = this.unsignedHexToDecimal(objectArray[i]['传感器类型'])
        const sensorId = this.unsignedHexToDecimal(objectArray[i]['传感器ID'])  //----------------------------------//
        switch (type) {

          case 12: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['安装位置'] = this.installPosition(sensorId) //-------------------------------------------//
            objectArray[i]['传感器类型'] = '智能沉降仪(12)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 16,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = this.unsignedHexToDecimal(objectArray[i]['沉降值(mm)']) / 100,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 72: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId) //-------------------------------------------//
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '温湿度(72)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 10,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = this.unsignedHexToDecimal(objectArray[i]['湿度(%)']) / 10,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 73: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId) //-------------------------------------------//
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '温度计(73)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 10,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 76: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId) //-------------------------------------------//
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '表面式倾角计(76)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 10,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['X向倾角(°)'])) / 1000,
              objectArray[i]['Y向倾角(°)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['Y向倾角(°)'])) / 1000
            break;

          // case 0: delete objectArray[i]
          //   break;
          case 0: objectArray[i]['采集时间'] = null,
            objectArray[i]['解调仪地址'] = null,
            objectArray[i]['解调仪类型'] = null,
            objectArray[i]['传感器ID'] = null,
            objectArray[i]['安装位置'] = null, //-------------------------------------------//
            objectArray[i]['通道号'] = null,
            objectArray[i]['传感器类型'] = null
            objectArray[i]['温度(°C)'] = null,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;
          default:
            break;
        }
      }
      return objectArray
    },

    // 删除空对象
    removeEmptyObjects(arr) {
      return arr.filter(item => {
        for (let key in item) {
          if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
            return true;
            // arr.splice(index,1);
          }
        }
        return false;
      });
      // arr.forEach((item,index) => {
      //   for (let key in item) {
      //     if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
      //       return false;
      //       // arr.splice(index,1);
      //     }
      //   }
      //   return false;
      // });
    },

    // 保存到MySQL数据库
    async saveToMySQL(tableName, data) {
      try {
        const res = await axios.post('http://localhost:3000/api/insert', {
          table: tableName,
          rows: data
        });
        console.log(`✅ 成功：${res.data.message}`);
        this.responseText = `✅ 状态：成功将215条传感器实时数据存入传感器数据库`;
      } catch (e) {
        console.error('❌ 失败：' + (e.response?.data?.error || e.message));
         this.responseText = '❌ 失败：' + (e.response?.data?.error || e.message);
      }
    },

    // 获取历史数据
    async getHistoryData(tableName, limit) {
      try {
        if (!tableName || typeof tableName !== 'string') {
          throw new Error('表名必须是有效的字符串');
        }
        if (!Number.isInteger(limit) || limit < 1 || limit > 20000) {
          throw new Error('limit 必须是 1-20000 之间的整数');
        }
        const res = await fetch(`http://localhost:3000/api/query/${tableName}?limit=${limit}`);
        if (!res.ok) {
          throw new Error(`HTTP 错误: ${res.status}`);
        }
        const result = await res.json();
        return result.data || [];
      } catch (err) {
        console.error('获取历史数据错误:', err);
        throw err;
      }
    },

    // 检查历史数据（应力值为0时判断设备异常还是通讯异常）
    checkHistoryData(historyData, location) {
      const recentFive = [];
      for (let i = 0; i < historyData.length; i++) {
        const item = historyData[i];
        if (item && item['安装位置'] === location) {
          recentFive.push(item);
          if (recentFive.length === 10) {
            break;
          }
        }
      }
      let isDeviceAbnormal = false;
      if (recentFive.length >= 10) {
        isDeviceAbnormal = true;
        for (let i = 0; i < recentFive.length; i++) {
          const strain = recentFive[i]['应变值'];
          if (strain !== 0 && strain !== '0') {
            isDeviceAbnormal = false;
            break;
          }
        }
      }
      if (isDeviceAbnormal) {
        return '应变值为0，设备异常';
      } else {
        return '应变值为0，通讯异常';
      }
    },

    // 处理沉降数据（每个沉降值减去基准值）
    processSettlementData(sensorData) {
      const referenceItem = sensorData.find(item => item["传感器ID"] === 42461);
      const referenceSettlement = referenceItem ? referenceItem["沉降值(mm)"] : 0;
      return sensorData
        .filter(item => item["沉降值(mm)"] !== null)
        .map(item => ({
          安装位置: item["安装位置"],
          传感器ID: item["传感器ID"],
          沉降值: item["沉降值(mm)"] - referenceSettlement
        }));
    },

    // 检查沉降值变化
    async checkSettlementChange(data1, data2, threshold) {
      const data1Map = new Map();
      data1.forEach(item => {
        data1Map.set(item.传感器ID, item);
      });
      const settlementStatusArr = [];
      data2.forEach(item2 => {
        const item1 = data1Map.get(item2.传感器ID);
        if (!item1) {
          return;
        }
        const change = item2.沉降值 - item1.沉降值;
        const absChange = Math.abs(change);
        const isOverThreshold = absChange > threshold;
        const status = isOverThreshold ? 1 : 0;
        const result = {
          安装位置: item2.安装位置,
          类型: '沉降仪',
          状态: status,
          传感器ID: item2.传感器ID,
          初始值: item1.沉降值,
          当前值: item2.沉降值,
          变化值: change
        };
        settlementStatusArr.push(result);
      });
      const totalStatus = settlementStatusArr.some(r => r.状态 === 1) ? 1 : 0;
      return {
        totalStatus,
        settlementStatusArr
      };
    },

    // 与校验表比较（应力和倾角传感器健康状态判断）
   


    async checkTable(){
      const createResult = (解调仪类型, 安装位置, 应变值, 沉降值, X向倾角, Y向倾角) => ({
                "解调仪类型": 解调仪类型,
                "安装位置": 安装位置,
                "应变值(με)": 应变值,
                "沉降值(mm)": 沉降值,
                "X向倾角(°)": X向倾角,
                "Y向倾角(°)": Y向倾角
            });

            const data = await this.getHistoryData('data', 2150)

            // 第一步：过滤出有应变值的数据（不为null、不为undefined、不为空字符串，并转换为数字）
            const validData = data.filter(item => {
                const strain = item['应变值(με)'];
                return strain !== null && strain !== undefined && strain !== '';
            }).map(item => ({
                ...item,
                '应变值(με)': Number(item['应变值(με)']) // 将字符串转换为数字
            }));

            // 第二步：按安装位置分组
            const grouped = validData.reduce((acc, item) => {
                const location = item['安装位置'];
                if (!acc[location]) {
                    acc[location] = [];
                }
                acc[location].push(item);
                return acc;
            }, {});

            // 第三步：对每个位置计算平均应变值并生成结果
            const results = [];

            for (const [location, items] of Object.entries(grouped)) {
                // 过滤掉应变值为0的数据，只保留非0值参与平均计算
                const nonZeroItems = items.filter(item => item['应变值(με)'] !== 0);

                // 如果没有非0数据，则平均值为null
                let avgStrain = null;
                if (nonZeroItems.length > 0) {
                    const sum = nonZeroItems.reduce((acc, item) => acc + item['应变值(με)'], 0);
                    avgStrain = sum / nonZeroItems.length;
                }

                // 取该位置第一个数据的解调仪类型
                const demodulatorType = items[0]['解调仪类型'];

                // 对于其他字段，如果有值则取第一个非null值，否则为null
                const settlement = items.find(item => item['沉降值(mm)'] !== null)?.['沉降值(mm)'] || null;
                const xAngle = items.find(item => item['X向倾角(°)'] !== null)?.['X向倾角(°)'] || null;
                const yAngle = items.find(item => item['Y向倾角(°)'] !== null)?.['Y向倾角(°)'] || null;

                // 创建结果对象
                results.push(createResult(
                    demodulatorType,
                    location,
                    avgStrain !== null ? Math.round(avgStrain * 100000) / 100000 : null, // 保留5位小数
                    settlement,
                    xAngle,
                    yAngle
                ));
            }
            return results;
    },

    compareStrainCheckTable(newData, checkTable, threshold = 20) {

            if (!Array.isArray(newData) || !Array.isArray(checkTable)) {
                throw new Error("输入数据必须是数组");
            }

            // 构建校验表映射
            const checkMap = {};
            checkTable.forEach(item => {
                if (item["安装位置"] !== undefined) {
                    checkMap[item["安装位置"]] = item;
                }
            });

            // 辅助函数：创建标准返回格式（增加传感器ID字段）
            const createResult = (位置, 类型, 状态, ID, 应变值, 异常) => ({
                安装位置: 位置,
                类型: 类型,
                状态: 状态,
                传感器ID: ID,
                应变值: 应变值,
                异常情况: 异常
            });

            // 辅助函数：计算变化百分比
            const calcPercent = (newVal, checkVal) =>
                (newVal - checkVal) / (checkVal) * 100;

            // 辅助函数：检查设备故障
            const getDeviceFailureReason = async (position) => {
                const strainHistoryData = await this.getHistoryData('strainStatus', 1960);
                const result = await this.checkHistoryData(strainHistoryData, position);
                return result;
            };

            // 辅助函数：分析应力计
            const analyzeStrain = async (newItem, checkItem) => {
                const position = newItem["安装位置"];
                const sensorId = newItem["传感器ID"];
                const newVal = newItem["应变值(με)"];
                const checkVal = checkItem["应变值(με)"];

                // 无有效应变数据
                if (newVal === null || checkVal === null) {
                    return createResult(position, "应力计", null, sensorId, null, "实时值与校验值为null,设备损坏");
                }

                // // 校验值为0：设备损坏
                // if (checkVal === null) {
                //     return createResult(position, "应力计", null, sensorId, null, "校验值为null,设备损坏");
                // }

                // 新值为0：设备故障
                if (newVal === 0) {
                    const reason = await getDeviceFailureReason(position);
                    return createResult(position, "应力计", 2, sensorId, newVal, reason);
                }

                // 计算变化并判断
                const change = calcPercent(newVal, checkVal);
                const isAbnormal = change > threshold && change !== 100;

                if (isAbnormal) {
                    return createResult(position, "应力计", 1, sensorId, newVal, `应变值变化${change.toFixed(2)}%,数据异常`);
                }

                // 正常情况
                return createResult(position, "应力计", 0, sensorId, newVal, "无");
            };

            // 主处理逻辑
            const processAll = async () => {
                const results = [];

                for (const newItem of newData) {
                    const position = newItem["安装位置"];
                    const checkItem = checkMap[position];

                    // 校验表中无此位置数据，跳过
                    if (!checkItem) {
                        continue;
                    }

                    // 判断是否为应力计（有应变值字段）
                    const hasStrain = newItem["应变值(με)"] !== undefined && newItem["应变值(με)"] !== null;

                    // 非应力计数据，跳过
                    if (!hasStrain) {
                        continue;
                    }

                    // 分析应力计数据
                    const result = await analyzeStrain(newItem, checkItem);

                    // 只添加有效结果
                    if (result) {
                        results.push(result);
                    }
                }

                return results;
            };

            // 返回Promise
            return processAll();
    },

    async calculateStrainAverage() {

            const createResult = (解调仪类型, 安装位置, 应变值, 沉降值, X向倾角, Y向倾角) => ({
                "解调仪类型": 解调仪类型,
                "安装位置": 安装位置,
                "应变值(με)": 应变值,
                "沉降值(mm)": 沉降值,
                "X向倾角(°)": X向倾角,
                "Y向倾角(°)": Y向倾角
            });

            const data = await this.getHistoryData('data', 2150)

            // 第一步：过滤出有应变值的数据（不为null、不为undefined、不为空字符串，并转换为数字）
            const validData = data.filter(item => {
                const strain = item['应变值(με)'];
                return strain !== null && strain !== undefined && strain !== '';
            }).map(item => ({
                ...item,
                '应变值(με)': Number(item['应变值(με)']) // 将字符串转换为数字
            }));

            // 第二步：按安装位置分组
            const grouped = validData.reduce((acc, item) => {
                const location = item['安装位置'];
                if (!acc[location]) {
                    acc[location] = [];
                }
                acc[location].push(item);
                return acc;
            }, {});

            // 第三步：对每个位置计算平均应变值并生成结果
            const results = [];

            for (const [location, items] of Object.entries(grouped)) {
                // 过滤掉应变值为0的数据，只保留非0值参与平均计算
                const nonZeroItems = items.filter(item => item['应变值(με)'] !== 0);

                // 如果没有非0数据，则平均值为null
                let avgStrain = null;
                if (nonZeroItems.length > 0) {
                    const sum = nonZeroItems.reduce((acc, item) => acc + item['应变值(με)'], 0);
                    avgStrain = sum / nonZeroItems.length;
                }

                // 取该位置第一个数据的解调仪类型
                const demodulatorType = items[0]['解调仪类型'];

                // 对于其他字段，如果有值则取第一个非null值，否则为null
                const settlement = items.find(item => item['沉降值(mm)'] !== null)?.['沉降值(mm)'] || null;
                const xAngle = items.find(item => item['X向倾角(°)'] !== null)?.['X向倾角(°)'] || null;
                const yAngle = items.find(item => item['Y向倾角(°)'] !== null)?.['Y向倾角(°)'] || null;

                // 创建结果对象
                results.push(createResult(
                    demodulatorType,
                    location,
                    avgStrain !== null ? Math.round(avgStrain * 100000) / 100000 : null, // 保留5位小数
                    settlement,
                    xAngle,
                    yAngle
                ));
            }
            return results;
    },

    strainStatusProcess(strainStatus, strainCoefficients) {
            // 存储数据
            const strainResults = [];

            // 遍历结果，分类存储（仅存储状态不为null的数据）
            strainStatus.forEach(result => {
                if (result.状态 === null) return; // 跳过状态为null的数据

                else if (result["类型"] === "应力计") {
                    strainResults.push(result);
                }
            });

            // 计算应变值的加权求和
            let weightedSum = 0;
            strainResults.forEach((result, index) => {
                if (result["状态"] === 1) {
                    // 提取安装位置编号（如GBC1 → 1）
                    const positionMatch = result.安装位置.match(/GBC(\d+)/);
                    if (positionMatch && positionMatch[1]) {
                        const positionIndex = parseInt(positionMatch[1]) - 1; // 转换为0-based索引
                        // 确保索引在系数数组范围内
                        if (positionIndex >= 0 && positionIndex < strainCoefficients.length) {
                            const coefficient = strainCoefficients[positionIndex];
                            weightedSum += coefficient * (result.应变值 || 0);
                        }
                    }
                }

            });

            // 返回处理后的结果
            return weightedSum;
        },

    async calculateTiltAverage() {

            const sensorData = await this.getHistoryData('data', 2160)

            // 辅助函数：创建返回格式
            const createResult = (安装位置, X向倾角, Y向倾角) => ({
                "安装位置": 安装位置,
                "X向倾角(°)": X向倾角,
                "Y向倾角(°)": Y向倾角
            });

            // 按安装位置分组，收集有倾角值的数据
            const grouped = {};

            sensorData.forEach(item => {
                const xTilt = item["X向倾角(°)"];
                const yTilt = item["Y向倾角(°)"];

                // 只处理有倾角值的元素（X或Y不为null、不为undefined、不为空字符串）
                const hasXTilt = xTilt !== null && xTilt !== undefined && xTilt !== '';
                const hasYTilt = yTilt !== null && yTilt !== undefined && yTilt !== '';

                if (!hasXTilt && !hasYTilt) {
                    return; // 跳过无倾角值的元素
                }

                const position = item["安装位置"];

                if (!grouped[position]) {
                    grouped[position] = {
                        xValues: [],
                        yValues: []
                    };
                }

                // 将字符串转换为数字后存入
                if (hasXTilt) {
                    grouped[position].xValues.push(Number(xTilt));
                }
                if (hasYTilt) {
                    grouped[position].yValues.push(Number(yTilt));
                }
            });

            // 计算平均值并生成结果
            const results = [];

            for (const [position, data] of Object.entries(grouped)) {
                const xAvg = data.xValues.length > 0
                    ? data.xValues.reduce((sum, val) => Math.abs(sum) + Math.abs(val), 0) / data.xValues.length
                    : null;

                const yAvg = data.yValues.length > 0
                    ? data.yValues.reduce((sum, val) => Math.abs(sum) + Math.abs(val), 0) / data.yValues.length
                    : null;

                results.push(createResult(position, xAvg, yAvg));
            }
            console.log(results)
            return results;
        },
    async compareTiltCheckTable(data1, data2, threshold) {

            const checkMap = {};
            data2.forEach(item => {
                checkMap[item['安装位置']] = item;
            });

            const results = [];

            data1.forEach(item => {
                const position = item['安装位置'];
                const checkItem = checkMap[position];

                // 如果data2中没有对应位置的数据，跳过
                if (!checkItem) {
                    return;
                }

                const xTilt = item['X向倾角(°)'];
                const yTilt = item['Y向倾角(°)'];
                const temperature = item['温度(°C)'];
                const sensorId = item['传感器ID'];

                // 检查是否有有效的倾角值和温度值
                const hasXTilt = xTilt !== null && xTilt !== undefined;
                const hasYTilt = yTilt !== null && yTilt !== undefined;
                const hasTemp = temperature !== null && temperature !== undefined && temperature !== 0;

                // 如果没有有效数据，跳过
                if ((!hasXTilt && !hasYTilt) || !hasTemp) {
                    return;
                }

                const checkXTilt = checkItem['X向倾角(°)'];
                const checkYTilt = checkItem['Y向倾角(°)'];

                let xResult = null;
                let yResult = null;
                let status = 0;
                const abnormalDetails = [];

                // 计算X向倾角差值除以温度的绝对值
                if (hasXTilt && checkXTilt !== null && checkXTilt !== undefined) {
                    const xDiff = Math.abs((Math.abs(xTilt) - checkXTilt) / temperature);
                    xResult = xTilt;
                    if (xDiff >= threshold) {
                        status = 1;
                        abnormalDetails.push(`X向倾角异常:差值比例为${xDiff.toFixed(6)}`);
                    }
                }

                // 计算Y向倾角差值除以温度的绝对值
                if (hasYTilt && checkYTilt !== null && checkYTilt !== undefined) {
                    const yDiff = Math.abs((Math.abs(yTilt) - checkYTilt) / temperature);
                    yResult = yTilt;
                    if (yDiff >= threshold) {
                        status = 1;
                        abnormalDetails.push(`Y向倾角异常:差值比例为${yDiff.toFixed(6)}`);
                    }
                }

                // 构建异常情况描述
                let abnormal = "无";
                if (abnormalDetails.length > 0) {
                    abnormal = abnormalDetails.join('；');
                }

                // 添加结果
                results.push({
                    '安装位置': position,
                    '类型': '倾角计',
                    '状态': status,
                    '传感器ID': sensorId || null,
                    'X向倾角(°)': xResult,
                    'Y向倾角(°)': yResult,
                    '异常情况': abnormal
                });
            });

            // console.log(results)
            return results;
        },

    // 健康评估
    healthEva(totalStatus, settlementTotalStatus, strainSum) {

            if (totalStatus || settlementTotalStatus) {

                console.log(totalStatus)
                console.log(settlementTotalStatus)
                return 'R'
            }
            else {
                if (strainSum >= 0 && strainSum < 1040.376764200341) {
                    return 'G'
                }
                else if (strainSum >= 1040.376764200341 && strainSum < 3121.1302926010226) {
                    return 'Y'
                }
                else if (strainSum >= 3121.1302926010226 && strainSum < 7282.6373494023865) {
                    return "O"
                }
                else {
                    return "R"
                }
            }
        },


    async sendForceCommand(forceCommand, idx) {
      const port = this.connectedPorts[idx].port;
      let writer, reader;
      const timeout = 100;
      const start = Date.now();
      let receivedData = [];
      try {
        writer = await port.writable.getWriter();
        reader = await port.readable.getReader();
        await writer.write(forceCommand);
        while (timeout) {
          const res = await Promise.race([
            reader.read(),
            new Promise(resolve => setTimeout(() => resolve({ value: null, done: false }), timeout))
          ]);
          if (res.value) receivedData = receivedData.concat(Array.from(res.value));
          if (res.done || (Date.now() - start > timeout)) break;
        }
      } finally {
        try { writer && writer.releaseLock(); } catch(e) {
          console.debug('release writer failed', e);
        }
        try { reader && reader.releaseLock(); } catch(e) {
          console.debug('release reader failed', e);
        }
      }
      return receivedData;
    },

    async readData(gainCommand, idx, timeout = 500) {
      const port = this.connectedPorts[idx].port;
      let writer, reader;
      const start = Date.now();
      let receivedData = [];
      try {
        writer = await port.writable.getWriter();
        reader = await port.readable.getReader();
        await writer.write(gainCommand);
        while (timeout) {
          const res = await Promise.race([
            reader.read(),
            new Promise(resolve => setTimeout(() => resolve({ value: null, done: false }), timeout))
          ]);
          if (res.value) receivedData = receivedData.concat(Array.from(res.value));
          if (res.done || (Date.now() - start > timeout)) break;
        }
        return receivedData;
      } finally {
        try { writer && writer.releaseLock(); } catch(e) {
          console.debug('release writer failed', e);
        }
        try { reader && reader.releaseLock(); } catch(e) {
          console.debug('release reader failed', e);
        }
      }
    },

    waitSeconds(seconds) {
      return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    },
    
    async main() {
      try {
        const forceCommands = [
          new Uint8Array([0x01,0x06,0x00,0x00,0x00,0x31,0x48,0x1E]),
          new Uint8Array([0x02,0x06,0x00,0x00,0x00,0x31,0x48,0x2D]),
          new Uint8Array([0x03,0x06,0x00,0x00,0x00,0x31,0x49,0xFC]),
          new Uint8Array([0x04,0x06,0x00,0x00,0x00,0x31,0x48,0x4B]),
          new Uint8Array([0x05,0x06,0x00,0x00,0x00,0x31,0x49,0x9A]),
          new Uint8Array([0x06,0x06,0x00,0x00,0x00,0x31,0x49,0xA9]),
          new Uint8Array([0x08,0x06,0x00,0x00,0x00,0x31,0x48,0x87]),
          new Uint8Array([0x07,0x06,0x00,0x00,0x00,0x31,0x48,0x78]),
          new Uint8Array([0x09,0x06,0x00,0x00,0x00,0x31,0x49,0x56])
        ];
        const gainCommands = [
          new Uint8Array([0x01,0x04,0x00,0x00,0x00,0x3C,0xF0,0x1B]),
          new Uint8Array([0x01,0x04,0x00,0x3c,0x00,0x44,0x30,0x35]),
          new Uint8Array([0x02,0x04,0x00,0x00,0x00,0x3C,0xF0,0x28]),
          new Uint8Array([0x02,0x04,0x00,0x3c,0x00,0x44,0x30,0x06]),
          new Uint8Array([0x03,0x04,0x00,0x00,0x00,0x3C,0xF1,0xF9]),
          new Uint8Array([0x03,0x04,0x00,0x3C,0x00,0x44,0x31,0xD7]),
          new Uint8Array([0x04, 0x04, 0x00, 0x00, 0x00, 0x3C, 0xF0, 0x4E]),
          new Uint8Array([0x04, 0x04, 0x00, 0x3C, 0x00, 0x44, 0x30, 0x60]),
          new Uint8Array([0x05, 0x04, 0x00, 0x00, 0x00, 0x3C, 0xF1, 0x9F]),
          new Uint8Array([0x05, 0x04, 0x00, 0x3C, 0x00, 0x44, 0x31, 0xB1]),
          new Uint8Array([0x06, 0x04, 0x00, 0x00, 0x00, 0x3C, 0xF1, 0xAC]),
          new Uint8Array([0x06, 0x04, 0x00, 0x3C, 0x00, 0x44, 0x31, 0x82]),
          new Uint8Array([0x07, 0x04, 0x00, 0x00, 0x00, 0x3C, 0xF0, 0x7D]),
          new Uint8Array([0x07, 0x04, 0x00, 0x3C, 0x00, 0x44, 0x30, 0x53]),
          new Uint8Array([0x08, 0x04, 0x00, 0x00, 0x00, 0x68, 0xf1, 0x7d]),
          new Uint8Array([0x09, 0x04, 0x00, 0x00, 0x00, 0x68, 0xf0, 0xac]),
        ];

        for (let i = 0; i < this.connectedPorts.length; i++) {
          for (let j = 0; j < forceCommands.length; j++) {
            await this.sendForceCommand(forceCommands[j], i);
          }
        }

        await this.waitSeconds(40);

        let objArr = [];
        for (let i = 0; i < this.connectedPorts.length; i++) {
          for (let j = 0; j < gainCommands.length; j++) {
            const receivedData = await this.readData(gainCommands[j], i);
            if (receivedData.length !== 0) {
              const responseData = receivedData.map(b => b.toString(16).padStart(2, '0')).join(' ');
              const res = this.verifyCode(responseData);
              if (Array.isArray(res) && res.length === 2) {
                const [jointArr, slaveAddress] = res;
                let parsed;
                if (receivedData.length < 200) parsed = this.vibraParse(jointArr, slaveAddress);
                else parsed = this.BUSParse(jointArr, slaveAddress);
                objArr = objArr.concat(parsed);
              }
            }
          }
        }
        this.flag = true;
        // return objArr;
        // EventBus.$emit('portsData',this.connectedPorts)
        return [objArr, this.flag]
      } catch (error) {
        console.error('main 出错', error);
        this.responseText = `发送/接收出错: ${error.message || error}`;
        return [];
      }
    },

   calculateTileStatus(results) {
        // 如果没有数据，返回正常状态0
        if (!results || results.length === 0) {
            return 0;
        }
        // 对所有状态进行与运算：所有状态都为0时总状态为0，否则为1
        return results.some(item => item['状态'] === 1) ? 1 : 0;
    },

    async startMain() {
      // if (!this.connectedPorts[0]) {
      if (!this.$store.state.connectedPorts.length) {
        this.connectMultiplePorts()
        alert('未连接端口');
        return;
      } else {
        this.connectedPorts = this.$store.state.connectedPorts
        this.responseText = `已连接${this.connectedPorts.length}个端口`
        this.showProgress = true;
        // 开始获取数据时，重置所有进度条为空
        this.progressData.stress = 0;
        this.progressData.inclinometer = 0;
        this.progressData.settlement = 0;
        this.progressData.humidity = 0;
        // 启动进度条动画
        this.startProgressAnimation();
        if (this.$store.state.connectedPorts.length === 0) {
          alert('没有已连接的端口');
          return;
        }
        this.gainDisabled = true;
        try {
          const [finalArr, flag] = await this.main();
          // console.log(flag,'-------------');
          this.tableData = finalArr;
          // 清除数组中的空元素
          const sensorData = this.removeEmptyObjects(finalArr);

          // 返回应力计和倾角计传感器状态
          const strainCheckTable = await this.calculateStrainAverage();
          const strainStatus = await this.compareStrainCheckTable(sensorData, strainCheckTable, 20);
          console.log('倾角计与应力计状态', strainStatus);
          
          const tiltCheckTable = await this.calculateTiltAverage();
                // console.log('倾角校准', tiltCheckTable);
                // 返回倾角计传感器状态
          const tiltStatus = await this.compareTiltCheckTable(sensorData, tiltCheckTable,0.03);
                // console.log('倾角状态', tiltStatus);
          // 处理沉降值传感器
          // 将每个沉降值减去基准沉降值
          //将每个沉降值减去基准沉降值
          const settlementProcessedData = await this.processSettlementData(sensorData)
          // 获取处理后的基准沉降值的每个沉降值
          const settlementHistoryData = await this.getHistoryData('settlementHistoryData', 7)
          // console.log('沉降值历史数据', settlementHistoryData)
                // 将实时处理后的沉降值与上次处理后的沉降值对比
          const settlementObject = await this.checkSettlementChange(settlementProcessedData, settlementHistoryData, 50);
          // console.log(settlementObject)

          const settlementTotalStatus = settlementObject.totalStatus // 沉降仪的总状态
          const settlementStatusArray = settlementObject.settlementStatusArr // 各个沉降仪的状态
          console.log('沉降仪各个状态数组', settlementStatusArray)
          
          // 形变系数
          const strainCoefficients = [
            1000 * 0.173773943450445, 1000 * 0.135335283236613, 1000 * 0.105399224561864, 1000 * 0.0820849986238988,
            1000 * 0.0639278612067076, 1000 * 0.0497870683678639, 1000 * 0.0387742078317220, 1000 * 0.0301973834223185,
            1000 * 0.0235177458560091, 1000 * 0.0183156388887342, 1000 * 0.0142642339089993, 1000 * 0.0111089965382423,
            1000 * 0.00865169520312063, 1000 * 0.00673794699908547, 1000 * 0.00524751839918138, 1000 * 0.00408677143846407
          ];
          


          // 对倾角和应力传感器进行处理
          // 返回倾角计，应力计总状态以及异常应力计的应变值总和
          const strainSum = await this.strainStatusProcess(strainStatus, strainCoefficients);
                console.log('应变值之和', strainSum)
                const tiltTotalStatus = this.calculateTileStatus(tiltStatus);
                console.log('倾角总状态', tiltTotalStatus);  // 输出: 0 或 1
                // 对整个系统进行健康评估
                const totalHealthStatus = await this.healthEva(tiltTotalStatus, settlementTotalStatus, strainSum)
                console.log(totalHealthStatus)
          // 返回 'G' 'Y' 'O' 'R'
          
          // 保存数据到数据库
          // 导入所有传感器最原始数据
          // 导入所有传感器最原始数据
          await this.saveToMySQL('data', sensorData)
          console.log(sensorData);
          
          // 延迟1000ms再导入状态数据（避免事务冲突）
          // 导入应力计状态数据
          setTimeout(async () => {
            console.log(strainStatus);
            
              await this.saveToMySQL('strainStatus', strainStatus);
          }, 1000);

          // 导入倾角计状态数据
          setTimeout(async () => {
            console.log(tiltStatus);
            
              await this.saveToMySQL('tiltStatus', tiltStatus)
          }, 1000);

          // 导入减去基准沉降值的沉降仪数据
          setTimeout(async () => {
            console.log(settlementProcessedData);

              await this.saveToMySQL('settlementHistoryData', settlementProcessedData)
          }, 1000);

          //  导入沉降仪状态数据
          setTimeout(async () => {
            console.log(settlementStatusArray);

              await this.saveToMySQL('settlementStatus', settlementStatusArray);
          }, 1000);

          // --------------------------------------------------------------------------------------------
          
          // 过滤掉 null/undefined/非对象项，避免后续渲染出错
          const safeArr = Array.isArray(finalArr) ? finalArr.filter(item => item && typeof item === 'object') : [];
          
          // this.responseText = JSON.stringify(safeArr, null, 2);
          this.responseText = '采集已完成';

          
          if (flag) {
            await this.tableShow(finalArr);
            this.progressFlag = true;
          }
        } finally {
          this.progressData.stress = 100;
          this.progressData.inclinometer = 100;
          this.progressData.settlement = 100;
          this.progressData.humidity = 100;
          this.stopProgressAnimation()
          this.gainDisabled = false;
        }
      }
    },

    async closeAllPorts() {
      this.showProgress = false;
      this.currentProgress = 0;
      for (const item of this.connectedPorts) {
        try {
          if (item.port.readableLocked) {
            try { await item.port.readable.cancel(); } catch(e) {
              console.debug('cancel failed for port', item.port, e);
            }
          }
          if (item.port.writableLocked) {
            try { item.port.writable.getWriter().releaseLock(); } catch(e) {
              console.debug('releaseLock failed for port', item.port, e);
            }
          }
          if (item.port.close) await item.port.close();
        } catch (e) {
          console.warn('关闭端口失败', e);
        }
      }
      this.connectedPorts = [];
      this.responseText = '已关闭所有端口';
    }
  }
};
</script>



<style lang="less" scoped>
.serial-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1vw;
  padding: 1vw;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.serial-page > * {
  flex-shrink: 0;
}

h1 {
  font-size: 1.5vw;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 1vw 0;
  text-shadow: 0 0 0.5vw rgba(0, 212, 255, 0.8);
}

.button-container {
  display: flex;
  flex-direction: column;
  // align-items: center;
  // justify-content: center;
  gap: 0.75vw;
  margin-bottom: 1vw;
}

.button-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75vw;
}

.control-btn {
  padding: 0.5vw 1vw;
  font-size: 1vw;
  color: #ffffff;
  background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
  border: 0.05vw solid #0088ff;
  border-radius: 0.3vw;
  cursor: pointer;
  transition: all 0.3s ease;
  // position: relative;
  overflow: hidden;
  box-shadow: 0 0.1vw 0.2vw rgba(0, 0, 0, 0.2);
  text-shadow: 0 0.05vw 0.05vw rgba(0, 0, 0, 0.3);
}

.control-btn:hover {
  background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
  border-color: #00aaff;
  box-shadow: 0 0.2vw 0.4vw rgba(0, 0, 0, 0.3), 0 0 0.75vw rgba(0, 136, 255, 0.4);
  transform: translateY(-0.1vw);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.port-item {
  margin: 0.5vw 0;
  padding: 0.5vw;
  border: 0.05vw solid rgba(0, 140, 255, 0.6);
  border-radius: 0.3vw;
  background-color: rgba(0, 30, 60, 0.8);
  color: #ffffff;
}

.port-item h3 {
  margin: 0;
  font-size: 0.8vw;
  color: #ffffff;
}

pre {
  background: rgba(0, 40, 80, 0.7);
  padding: 1vw;
  max-height: 22vh;
  font-size: 0.7vw;
  color: #ffffff;
  overflow: auto;
  white-space: pre-wrap;
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  border-radius: 0.3vw;
  box-shadow: inset 0 0 0.5vw rgba(0, 212, 255, 0.2);
}

/* 进度条容器样式 */
.progress-container {
  width: 32vw;
  height: 4vh;
  background-color: rgba(0, 40, 80, 0.7);
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  border-radius: 0.3vw;
  overflow: hidden;
  margin-top: 1vh;
  margin-bottom: 1vh;
  box-shadow: inset 0 0 0.5vw rgba(0, 212, 255, 0.2);
}

/* 进度条样式 */
.progress-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #00cc66 0%, #009944 100%);
  text-align: center;
  line-height: 4vh;
  color: #ffffff;
  transition: width 0.3s ease;
  text-shadow: 0 0.05vw 0.05vw rgba(0, 0, 0, 0.3);
}

/* 数据表格区域 */
.table-section {
  background-color: rgba(0, 40, 80, 0.7);
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  border-radius: 0.3vw;
  overflow-x: auto;
  margin: 1vw 0;
  box-shadow: inset 0 0 0.5vw rgba(0, 212, 255, 0.2);
}

.stats-info {
  padding: 0.8vw;
  background-color: rgba(0, 60, 120, 0.8);
  border-bottom: 0.05vw solid rgba(0, 140, 255, 0.4);
  font-size: 0.8vw;
  color: #ffffff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7vw;
  white-space: nowrap;
}

.data-table th {
  background: linear-gradient(to bottom, rgba(0, 80, 160, 0.8) 0%, rgba(0, 60, 120, 0.8) 100%);
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  padding: 0.6vw 1vw;
  text-align: center;
  font-weight: normal;
  color: #ffffff;
  text-shadow: 0 0.05vw 0.05vw rgba(0, 0, 0, 0.3);
}

.data-table td {
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  padding: 0.5vw 1vw;
  text-align: center;
  color: #ffffff;
}

.data-table tr:nth-child(even) {
  background-color: rgba(0, 50, 100, 0.6);
}

.data-table tr:hover {
  background-color: rgba(0, 80, 160, 0.6);
}

/* 列宽控制 */
.col-time {
  min-width: 7vw;
}

.col-addr {
  min-width: 5.5vw;
}

.col-type {
  min-width: 5vw;
}

.col-id {
  min-width: 4vw;
}

.col-pos {
  min-width: 6vw;
}

.col-channel {
  min-width: 3vw;
}

.col-sensor {
  min-width: 4.5vw;
}

.col-temp {
  min-width: 3.5vw;
}

.col-humidity {
  min-width: 3vw;
}

.col-freq {
  min-width: 4vw;
}

.col-strain {
  min-width: 4.5vw;
}

.col-settle {
  min-width: 4.5vw;
}

.col-tiltx {
  min-width: 4.5vw;
}

.col-tilty {
  min-width: 4.5vw;
}

.port-list-section {
  background-color: rgba(0, 40, 80, 0.7);
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  border-radius: 0.3vw;
  padding: 1vw;
  margin-bottom: 1vw;
  box-shadow: inset 0 0 0.5vw rgba(0, 212, 255, 0.2);
}

/* 时间选择表格 */
table {
  border-collapse: collapse;
  width: 96%;
  margin: 1vw 0;
  background-color: rgba(0, 40, 80, 0.7);
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  border-radius: 0.3vw;
  overflow: hidden;
  box-shadow: inset 0 0 0.5vw rgba(0, 212, 255, 0.2);
}

table, th, td {
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
}

th, td {
  border: 0.05vw solid rgba(0, 140, 255, 0.4);
  padding: 0.5vw;
  text-align: left;
  color: #ffffff;
}

th {
  background-color: rgba(0, 60, 120, 0.8);
}

h2 {
  /* margin-top: 0.3vw; */
  margin-bottom: 0.5vw;
  font-size: 1vw;
  color: #ffffff;
  text-shadow: 0 0 0.5vw rgba(0, 212, 255, 0.8);
}

input[type="checkbox"] {
  margin-right: 0.4vw;
  transform: scale(1.2);
}

/* 三个大容器布局 */
.serial-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1vw;
  box-sizing: border-box;
}

/* 第一个容器：标题 */
.container-title {
  text-align: center;
  padding: 1vw 0;
  flex-shrink: 0;

  h1 {
    font-size: 1.4vw;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
    margin: 0;
  }
}

/* 第二个容器：四个半圆形仪表盘 */
.container-gauges {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.2vw;
  flex: 1;
  gap: 0.2vw;
}

.gauge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
}

.gauge-container {
  width: 16vw;
  height: 12vw;
  max-width: 220px;
  max-height: 160px;
  min-width: 160px;
  min-height: 120px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
}

.gauge-progress {
  transition: all 0.5s ease-in-out;
}

.gauge-value {
  font-size: 1.2vw;
  font-weight: bold;
  fill: rgba(255, 255, 255, 0.9);
}

.gauge-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.5vw;
}

.gauge-name {
  font-size: 1.2vw;
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
}

.gauge-count {
  font-size: 1vw;
  color: rgba(255, 255, 255, 0.7);
}

// /* 第三个容器：按钮 */
// .container-buttons {
//   padding: 1vw;
//   flex-shrink: 0;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 1vw;
// }

#responseDisplay {
//   max-height: 8vh;
//   overflow-y: auto;
//   font-size: 1vw;
//   color: rgba(255, 255, 255, 0.8);
//   background: rgba(0, 20, 40, 0.6);
//   padding: 0.5vw;
//   border-radius: 4px;
//   width: 100%;
//   text-align: left;
}
</style>
