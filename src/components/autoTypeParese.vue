<template>
  <div class="serial-page">
    <h1 style="font-size: 24px;">串口连接</h1>
    <div class="controls">
      <button @click="impowerSerialPort" :disabled="impowerDisabled">授权端口</button>
      <button @click="connectMultiplePorts" :disabled="connectDisabled">连接已配对端口</button>
      <button @click="startMain" :disabled="gainDisabled">获取数据</button>
      <button @click="closeAllPorts">断开所有端口</button>
    </div>

    <div id="portList">
      <div v-for="(p, idx) in connectedPorts" :key="idx" class="port-item">
        <h3>端口: {{ portLabel(p.port) }}</h3>
      </div>
    </div>

    <!-- 进度条容器 -->
    <div class="progress-container" v-show="showProgress">
      <!-- 进度条 -->
      <div class="progress-bar" id="progress-bar" :style="{width: currentProgress + '%'}">{{ Math.round(currentProgress) }}%</div>
    </div>

    <pre id="responseDisplay">{{ responseText }}</pre>
    <!-- <ResultTable v-if="showResultModal" :data="resultData" @close="showResultModal = false" /> -->
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
// import ResultTable from './ResultTable.vue';
/* load 'fs' for readFile and writeFile support */
// import * as fs from 'fs';
// XLSX.set_fs(fs);

export default {
  name: 'AutoTypeParse',
  // components: { ResultTable },
  components: {  },
  data() {
    return {
      connectedPorts: [],
      responseText: '无端口连接',
      impowerDisabled: false,
      connectDisabled: false,
      gainDisabled: false,
      // showResultModal: false,
      showProgress:false,
      flag:false,
      // resultData: [],
      currentProgress:0,
      port:null,
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
    tableShow(finalArr) {

      // 存储数据到 localStorage
      localStorage.setItem('sensorData', JSON.stringify(finalArr));
      // 跳转到页面B
      window.open('pageB.html');
    },
    async impowerSerialPort() {
      try {
        if (!('serial' in navigator)) {
          alert('当前浏览器不支持 Web Serial API');
          return;
        }
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
        this.connectedPorts.push({ port });
        this.responseText = `已授权并打开端口: ${this.portLabel(port)}`;
      } catch (err) {
        console.error('授权端口出错', err);
        this.responseText = `授权端口出错: ${err.message || err}`;
      }
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
        case 8056: position = 'ZS16B'; break;
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
        case 38710: position = 'ZZY7Y16'; break;
        case 65415: position = 'ZY9'; break;
        case 60416: position = 'ZZY11Y13'; break;
        case 17270: position = 'ZYZY1616'; break;
        case 49075: position = 'ZS21C'; break;
        case 22601: position = 'ZY13'; break;

        case 34596: position = '库顶'; break;
        case 62812: position = '竖向桥架B16'; break;
        case 63324: position = '竖向桥架B7'; break;
        case 63580: position = '竖向桥架D16'; break;
        case 64092: position = '竖向桥架D7'; break;
        case 63836: position = '竖向桥架F16'; break;
        case 61532: position = '竖向桥架F7'; break;
        case 62044: position = '竖向桥架H16'; break;
        case 63068: position = '竖向桥架H6'; break;
        case 34663: position = '库顶'; break;
        case 45927: position = '库顶'; break;
        case 39015: position = '库顶'; break;
        case 42461: position = '横向桥架'; break;
        case 13530: position = '横向桥架'; break;
        case 60630: position = '横向桥架'; break;
        case 23782: position = '横向桥架'; break;
        case 28759: position = '横向桥架'; break;
        case 6413: position = '横向桥架'; break;
        case 33966: position = '横向桥架'; break;
          // break;
        default: position = '未找到对应编码';
      }
      return position
    },
    vibraParse(jointArr, address) {
      const objectArray = [];
      const date = new Date()
      const dateYMD = date.toLocaleDateString()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minutes = date.getMinutes()

      const timeStr = year + '/' + month + '/' + day + '/' + hour + ':' + minutes
      for (let i = 0, j = 1; i < jointArr.length; i += 4, j++) {
        const group = {
           '采集时间': timeStr,    //时间-----------------新加
          '解调仪地址': address,  // 解调仪地址
          '解调仪类型': null,  // 解调仪类型 --------新加
          '传感器ID': jointArr[i],  // 传感器ID ------------新加
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
        const type = parseInt(objectArray[i].type);
        const sensorId = this.unsignedHexToDecimal(objectArray[i]['传感器ID']) ;
        switch (type) {
          case 3: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId),
            objectArray[i]['解调仪类型'] = '振弦式解调仪',
            objectArray[i]['传感器类型'] = '钢筋应力计',
            objectArray[i]['温度(°C)'] = this.signedHexToDecimal(objectArray[i]['温度(°C)']) / 16,
            objectArray[i]['频率(Hz)'] = this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 10,
            objectArray[i]['应变值(με)'] = 0.02 * this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) * this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 100
            break;
          case 6: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)
            objectArray[i]['解调仪类型'] = '振弦式解调仪'
            objectArray[i]['传感器类型'] = '埋入型应力计(6)',
            objectArray[i]['温度(°C)'] = this.signedHexToDecimal(objectArray[i]['温度(°C)']) / 16,
            objectArray[i]['频率(Hz)'] = this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 10,
            objectArray[i]['应变值(με)'] = 0.02 * this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) * this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 100
            break;
          // case 0: delete objectArray[i]
          case 0: objectArray[i]['采集时间'] = null,
            objectArray[i]['解调仪地址'] = null,
            objectArray[i]['传感器ID'] = null,
            objectArray[i]['安装位置'] = null
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
      return objectArray;
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
      const objectArray = [];
      const date = new Date()
      const dateYMD = date.toLocaleDateString()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minutes = date.getMinutes()
      const timeStr = year + '/' + month + '/' + day + '/' + hour + ':' + minutes
      for (let i = 0, j = 1; i < jointArr.length; i += 5, j++) {
        const group = {
          '采集时间': timeStr,    //时间-----------------新加
          '解调仪地址': address,  // 解调仪地址
          '解调仪类型': null,  // 解调仪类型 --------新加
          '传感器ID': jointArr[i],  // 传感器ID ------------新加
          '安装位置': null,
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
        const type = this.unsignedHexToDecimal(objectArray[i].type);
        const sensorId = this.unsignedHexToDecimal(objectArray[i]['传感器ID'])
        switch (type) {
          case 12: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '智能沉降仪',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 16,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = this.hexToSignedDecimal(objectArray[i]['沉降值(mm)']) / 100,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 72: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '温湿度',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 10,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = this.unsignedHexToDecimal(objectArray[i]['湿度(%)']) / 10,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 73: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '温度计',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 10,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 76: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '高精度表面式倾角计',
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
      return objectArray;
    },

    creatExcel(result) {
      if (!window.XLSX) {
        alert('请在页面中引入 xlsx 库');
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(result);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "database");
      XLSX.writeFile(workbook, "database.xlsx");
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
    async progress() {
      this.flag = false
      // 总时间（秒）
      const totalTime = 80;
      // 每次更新的时间间隔（毫秒）
      const intervalTime = 100;
      // 计算每次更新的进度百分比
      const increment = (100 / (totalTime * 1000 / intervalTime));
      // 当前进度
      this.currentProgress = 0;

      // 设置定时器，每隔 intervalTime 毫秒更新一次进度条
      const interval = setInterval(async () => {
        // this.currentProgress = Math.round(this.currentProgress);
        // 增加当前进度
        this.currentProgress += increment;
        // 更新进度条的宽度
        // this.progressBar.style.width = `${currentProgress}%`;
        // 更新进度条内的文本
        

        // 当进度达到 100% 时，清除定时器
        if (this.currentProgress >= 100) {
          clearInterval(interval);
          this.currentProgress = Math.round(this.currentProgress);
          await this.waitSeconds(0.1)
          // progressContainer.style.display = 'none'
          // progressBar.style.display = 'none'
          this.showProgress = false;
          this.flag = true
        }
      }, intervalTime);

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
        // return objArr;
        return [objArr, this.flag]
      } catch (error) {
        console.error('main 出错', error);
        this.responseText = `发送/接收出错: ${error.message || error}`;
        return [];
      }
    },

    async startMain() {
      // const t = true
      // while(t){
      if (!this.connectedPorts[0]) {
        alert('未连接端口')
        return
      } else {
          this.showProgress = true;
      this.progress()
      if (this.connectedPorts.length === 0) {
        alert('没有已连接的端口');
        return;
      }
      this.gainDisabled = true;
      try {
        const [finalArr, flag] = await this.main();
        // console.log(finalArr);
        // this.creatExcel(finalArr)
        // 过滤掉 null/undefined/非对象项，避免后续渲染出错
        const safeArr = Array.isArray(finalArr) ? finalArr.filter(item => item && typeof item === 'object') : [];
        
        this.responseText = JSON.stringify(safeArr, null, 2);

        if (flag) {

            await this.tableShow(finalArr)
          }
        // 显示弹窗
        // this.resultData = finalArr || [];
        // this.showResultModal = true;
        } finally {
          this.gainDisabled = false;
        }
      }
    // }
      
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



<style scoped>
button{
  font-size: 1.3vw;
}
.controls { 
  margin-bottom: 12px; 
  /* font-size: 24px; */
}
.port-item { margin: 8px 0; padding: 6px; border: 1px solid #ccc; }
pre { 
  background:#f7f7f7; 
  padding:8px; 
  max-height:22vh; 
  font-size: 1.3vw;
  color: black;
  overflow:auto; 
  white-space:pre-wrap; 
}
/* 进度条容器样式 */
    .progress-container {
      width: 32vw;
      height: 4vh;
      background-color: #f3f3f3;
      border: 1px solid #ccc;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 1vh;
      margin-bottom: 1vh;
    }

    /* 进度条样式 */
    .progress-bar {
      height: 100%;
      width: 0%;
      background-color: #4caf50;
      text-align: center;
      line-height: 4vh;
      color: black;
      transition: width 0.3s ease;
    }
</style>
