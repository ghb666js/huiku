import axios from 'axios';

// 端口标签生成
export function portLabel(port) {
  try {
    const info = port.getInfo ? port.getInfo() : {};
    return info.usbVendorId ? `USB ${info.usbVendorId}:${info.usbProductId}` : '未知';
  } catch (e) {
    return '未知';
  }
}

// 无符号十六进制转十进制
export function unsignedHexToDecimal(hexStr) {
  return parseInt(hexStr, 16);
}

// 计算CRC校验码
export function calculateCRC(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) crc = (crc >> 1) ^ 0xA001;
      else crc = crc >> 1;
    }
  }
  return [(crc & 0xFF), ((crc >> 8) & 0xFF)];
}

// 十六进制转十进制
export function hexToDecimal(hexStr) {
  return parseInt(hexStr, 16);
}

// 获取十六进制补码
export function getHexComplement(hexStr) {
  let decimal = parseInt(hexStr, 16);
  if (decimal & 0x8000) {
    decimal = ~decimal + 1;
    decimal &= 0xFFFF;
  }
  return decimal.toString(16).padStart(4, '0');
}

// 有符号十六进制转十进制
export function signedHexToDecimal(hexStr) {
  // 先计算补码
  let complementHex = getHexComplement(hexStr);
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
}

// 验证校验码
export function verifyCode(data) {
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
      const calculatedCRC = calculateCRC(byteArray.slice(0, byteArray.length - 2));
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
}

// 安装位置映射
export function installPosition(sensorId) {
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
}

// 振弦式数据解析
export function vibraParse(jointArr, address) {
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

    const type = unsignedHexToDecimal(objectArray[i]['传感器类型'])
    const sensorId = unsignedHexToDecimal(objectArray[i]['传感器ID'])  //------------------------------------//

    switch (type) {
      case 3: objectArray[i]['传感器ID'] = unsignedHexToDecimal(objectArray[i]['传感器ID']),
        objectArray[i]['安装位置'] = installPosition(sensorId)  //--------------------------------------------//
        objectArray[i]['解调仪类型'] = '振弦式解调仪',
          objectArray[i]['传感器类型'] = '钢筋应力计(3)',
          objectArray[i]['温度(°C)'] = signedHexToDecimal(objectArray[i]['温度(°C)']) / 16,
          objectArray[i]['频率(Hz)'] = unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 10,
          objectArray[i]['应变值(με)'] = 0.002 * (objectArray[i]['频率(Hz)']) * (objectArray[i]['频率(Hz)'])
        break;
      case 6: objectArray[i]['传感器ID'] = unsignedHexToDecimal(objectArray[i]['传感器ID']),
        objectArray[i]['安装位置'] = installPosition(sensorId)
        objectArray[i]['解调仪类型'] = '振弦式解调仪'
        objectArray[i]['传感器类型'] = '埋入型应力计(6)',
          objectArray[i]['温度(°C)'] = signedHexToDecimal(objectArray[i]['温度(°C)']) / 16,
          objectArray[i]['频率(Hz)'] = unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 10,
          objectArray[i]['应变值(με)'] = 0.002 * (objectArray[i]['频率(Hz)']) * (objectArray[i]['频率(Hz)'])
        break;
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
}

// 十六进制转有符号十进制
export function hexToSignedDecimal(hexStr) {
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
}

// 总线式数据解析
export function BUSParse(jointArr, address) {
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

    const type = unsignedHexToDecimal(objectArray[i]['传感器类型'])
    const sensorId = unsignedHexToDecimal(objectArray[i]['传感器ID'])  //----------------------------------//
    switch (type) {

      case 12: objectArray[i]['传感器ID'] = unsignedHexToDecimal(objectArray[i]['传感器ID']),
        objectArray[i]['解调仪类型'] = '总线式解调仪'
        objectArray[i]['安装位置'] = installPosition(sensorId) //-------------------------------------------//
        objectArray[i]['传感器类型'] = '智能沉降仪(12)',
          objectArray[i]['温度(°C)'] = signedHexToDecimal(getHexComplement(objectArray[i]['温度(°C)'])) / 16,
          objectArray[i]['频率(Hz)'] = null,
          objectArray[i]['应变值(με)'] = null,
          objectArray[i]['湿度(%)'] = null,
          objectArray[i]['沉降值(mm)'] = unsignedHexToDecimal(objectArray[i]['沉降值(mm)']) / 100,
          objectArray[i]['X向倾角(°)'] = null,
          objectArray[i]['Y向倾角(°)'] = null
        break;

      case 72: objectArray[i]['传感器ID'] = unsignedHexToDecimal(objectArray[i]['传感器ID']),
        objectArray[i]['安装位置'] = installPosition(sensorId) //-------------------------------------------//
        objectArray[i]['解调仪类型'] = '总线式解调仪'
        objectArray[i]['传感器类型'] = '温湿度(72)',
          objectArray[i]['温度(°C)'] = signedHexToDecimal(getHexComplement(objectArray[i]['温度(°C)'])) / 10,
          objectArray[i]['频率(Hz)'] = null,
          objectArray[i]['应变值(με)'] = null,
          objectArray[i]['湿度(%)'] = unsignedHexToDecimal(objectArray[i]['湿度(%)']) / 10,
          objectArray[i]['沉降值(mm)'] = null,
          objectArray[i]['X向倾角(°)'] = null,
          objectArray[i]['Y向倾角(°)'] = null
        break;

      case 73: objectArray[i]['传感器ID'] = unsignedHexToDecimal(objectArray[i]['传感器ID']),
        objectArray[i]['安装位置'] = installPosition(sensorId) //-------------------------------------------//
        objectArray[i]['解调仪类型'] = '总线式解调仪'
        objectArray[i]['传感器类型'] = '温度计(73)',
          objectArray[i]['温度(°C)'] = signedHexToDecimal(getHexComplement(objectArray[i]['温度(°C)'])) / 10,
          objectArray[i]['频率(Hz)'] = null,
          objectArray[i]['应变值(με)'] = null,
          objectArray[i]['湿度(%)'] = null,
          objectArray[i]['沉降值(mm)'] = null,
          objectArray[i]['X向倾角(°)'] = null,
          objectArray[i]['Y向倾角(°)'] = null
        break;

      case 76: objectArray[i]['传感器ID'] = unsignedHexToDecimal(objectArray[i]['传感器ID']),
        objectArray[i]['安装位置'] = installPosition(sensorId) //-------------------------------------------//
        objectArray[i]['解调仪类型'] = '总线式解调仪'
        objectArray[i]['传感器类型'] = '表面式倾角计(76)',
          objectArray[i]['温度(°C)'] = signedHexToDecimal(getHexComplement(objectArray[i]['温度(°C)'])) / 10,
          objectArray[i]['频率(Hz)'] = null,
          objectArray[i]['应变值(με)'] = null,
          objectArray[i]['湿度(%)'] = null,
          objectArray[i]['沉降值(mm)'] = null,
          objectArray[i]['X向倾角(°)'] = signedHexToDecimal(getHexComplement(objectArray[i]['X向倾角(°)'])) / 1000,
          objectArray[i]['Y向倾角(°)'] = signedHexToDecimal(getHexComplement(objectArray[i]['Y向倾角(°)'])) / 1000
        break;

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
}

// 删除空对象
export function removeEmptyObjects(arr) {
  return arr.filter(item => {
    for (let key in item) {
      if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
        return true;
      }
    }
    return false;
  });
}

// 保存到MySQL数据库
export async function saveToMySQL(tableName, data) {
  try {
    const res = await axios.post('http://localhost:3000/api/insert', {
      table: tableName,
      rows: data
    });
    console.log(`✅ 成功：${res.data.message}`);
  } catch (e) {
    console.error('❌ 失败：' + (e.response?.data?.error || e.message));
  }
}

// 获取历史数据
export async function getHistoryData(tableName, limit) {
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
}

// 检查历史数据（应力值为0时判断设备异常还是通讯异常）
export function checkHistoryData(historyData, location) {
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
}

// 处理沉降数据（每个沉降值减去基准值）
export function processSettlementData(sensorData) {
  const referenceItem = sensorData.find(item => item["传感器ID"] === 42461);
  const referenceSettlement = referenceItem ? referenceItem["沉降值(mm)"] : 0;
  return sensorData
    .filter(item => item["沉降值(mm)"] !== null)
    .map(item => ({
      安装位置: item["安装位置"],
      传感器ID: item["传感器ID"],
      沉降值: item["沉降值(mm)"] - referenceSettlement
    }));
}

// 检查沉降值变化
export async function checkSettlementChange(data1, data2, threshold) {
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
}

// 检查校验表
export async function checkTable() {
  const createResult = (解调仪类型, 安装位置, 应变值, 沉降值, X向倾角, Y向倾角) => ({
            "解调仪类型": 解调仪类型,
            "安装位置": 安装位置,
            "应变值(με)": 应变值,
            "沉降值(mm)": 沉降值,
            "X向倾角(°)": X向倾角,
            "Y向倾角(°)": Y向倾角
        });

        const data = await getHistoryData('data', 2150)

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
}

// 与校验表比较（应力和倾角传感器健康状态判断）
export function compareStrainCheckTable(newData, checkTable, threshold = 20) {
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
      const strainHistoryData = await getHistoryData('strainStatus', 1960);
      const result = checkHistoryData(strainHistoryData, position);
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

      // 校验值为0：设备损坏
      if (checkVal === null) {
          return createResult(position, "应力计", null, sensorId, null, "校验值为null,设备损坏");
      }

      return null;
  };

  return null;
}

// 表单显示
export function tableShow(finalArr) {
  // 过滤掉 null/undefined/非对象项
  const safeArr = Array.isArray(finalArr) ? finalArr.filter(item => item && typeof item === 'object') : [];
  
  // 更新表格数据
  this.tableData = safeArr;
  
  // 更新统计信息
  this.statsInfo = `共 ${safeArr.length} 条数据`;
  
  // 存储数据到 localStorage
  localStorage.setItem('sensorData', JSON.stringify(safeArr));
  // 使用完整路径打开页面
  window.open('/pageB.html');
}
