const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: '景德镇电厂电源控制系统 - COM端口识别服务',
    timestamp: new Date().toISOString()
  });
});

// 获取系统COM端口列表（核心API）
app.get('/api/com-ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();

    console.log('原始端口列表:', ports);

    // 格式化端口信息
    const formattedPorts = ports.map((port, index) => {
      // 提取VID和PID
      let vendorId = '0000';
      let productId = '0000';

      if (port.vendorId) {
        vendorId = port.vendorId.toString(16).toUpperCase().padStart(4, '0');
      }
      if (port.productId) {
        productId = port.productId.toString(16).toUpperCase().padStart(4, '0');
      }

      // 从PNP ID提取更精确的信息（Windows）
      let locationInfo = '';
      if (port.pnpId) {
        // 提取位置信息用于区分同型号设备
        const locationMatch = port.pnpId.match(/Location_(\d+)/);
        if (locationMatch) {
          locationInfo = locationMatch[1];
        }
      }

      return {
        index: index,
        comName: port.path,                    // 系统COM号，如 COM11
        vendorId: vendorId,                     // 如 1A86
        productId: productId,                   // 如 7523
        manufacturer: port.manufacturer || 'Unknown',
        serialNumber: port.serialNumber || null,
        locationId: port.locationId || locationInfo || null,
        pnpId: port.pnpId || null,
        friendlyName: port.friendlyName || port.path
      };
    });

    // 过滤：只保留USB转串口设备（排除系统虚拟端口）
    const usbPorts = formattedPorts.filter(p => {
      const vid = p.vendorId.toUpperCase();
      // 常见USB转串口芯片VID
      const usbVids = ['1A86', '067B', '0403', '0483', '10C4', '1A86', '4348', '0525'];
      const isUsbDevice = usbVids.includes(vid);

      // 或者通过制造商名称判断
      const usbManufacturers = ['wch', 'prolific', 'ftdi', 'stm', 'silicon', 'ch340', 'usb'];
      const hasUsbManufacturer = usbManufacturers.some(m =>
        p.manufacturer.toLowerCase().includes(m)
      );

      return isUsbDevice || hasUsbManufacturer;
    });

    console.log('USB端口列表:', usbPorts);

    res.json({
      success: true,
      ports: usbPorts,
      totalPorts: ports.length,
      usbPorts: usbPorts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取COM端口失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(' 景德镇电厂电源控制系统 - Node.js服务已启动');
  console.log('='.repeat(60));
  console.log(` 服务地址: http://localhost:${PORT}`);
  console.log(` API测试: http://localhost:${PORT}/api/health`);
  console.log(` COM列表: http://localhost:${PORT}/api/com-ports`);
  console.log('='.repeat(60));
  console.log(' 请在前端页面点击"一键授权并自动识别"按钮');
  console.log('='.repeat(60));
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n服务已停止');
  process.exit(0);
});