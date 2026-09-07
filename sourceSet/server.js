require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const http = require('http');
const url = require('url');
const { SerialPort } = require('serialport');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// ==========================================
// MySQL 连接池配置
// ==========================================
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'base',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

// ==========================================
// 初始化数据库表
// ==========================================

async function initTables() {
  const conn = await pool.getConnection();
  try {
    // 第一张表：data（对应 sensorData 的14个字段）
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS \`data\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`采集时间\` VARCHAR(50),
        \`解调仪地址\` INT,
        \`解调仪类型\` VARCHAR(50),
        \`传感器ID\` INT,
        \`安装位置\` VARCHAR(50),
        \`通道号\` INT,
        \`传感器类型\` VARCHAR(50),
        \`温度(°C)\` DECIMAL(5,2),
        \`湿度(%)\` DECIMAL(5,2),
        \`频率(Hz)\` INT,
        \`应变值(με)\` DECIMAL(15,4),
        \`沉降值(mm)\` DECIMAL(10,2),
        \`X向倾角(°)\` DECIMAL(8,4),
        \`Y向倾角(°)\` DECIMAL(8,4)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 第二张表：sensorStatus
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS \`sensorStatus\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`采集时间\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`安装位置\` VARCHAR(50),
        \`类型\` VARCHAR(50),
        \`状态\` VARCHAR(50),
        \`应变值\` DECIMAL(15,4),
        \`异常情况\` VARCHAR(200)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 第三张表：settlementHistoryData
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS \`settlementHistoryData\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`采集时间\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`安装位置\` VARCHAR(50),
        \`传感器ID\` INT,
        \`沉降值\` DECIMAL(10,2)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 第四张表：settlementStatus
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS \`settlementStatus\` (
        id INT AUTO_INCREMENT,
        \`采集时间\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`安装位置\` VARCHAR(20),
        \`类型\` VARCHAR(20),
        \`状态\` INT,
        \`传感器ID\` INT,
        \`初始值\` DECIMAL(7,3),
        \`当前值\` DECIMAL(7,3),
        \`变化值\` DECIMAL(7,3),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 第五张表：strainStatus（应变状态表）
    await conn.execute(`
            CREATE TABLE IF NOT EXISTS \`strainStatus\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                \`采集时间\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`安装位置\` VARCHAR(50),
                \`类型\` VARCHAR(50),
                \`状态\` INT,
                \`传感器ID\` INT,
                \`应变值\` DECIMAL(15,10),
                \`异常情况\` VARCHAR(200)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

    // 第六张表：tiltStatus（倾角状态表）
    await conn.execute(`
            CREATE TABLE IF NOT EXISTS \`tiltStatus\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                \`采集时间\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`安装位置\` VARCHAR(50),
                \`类型\` VARCHAR(50),
                \`状态\` INT,
                \`传感器ID\` INT,
                \`X向倾角(°)\` DECIMAL(8,4),
                \`Y向倾角(°)\` DECIMAL(8,4),
                \`异常情况\` VARCHAR(200)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

    // 第七张表：orderRecordData（订单记录表）
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS \`orderRecordData\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`请求时间\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`订单号\` BIGINT NOT NULL,
        \`车牌\` VARCHAR(20),
        \`入厂时间\` DATETIME,
        \`空车称重时间\` DATETIME,
        \`库底装车时间\` DATETIME,
        \`满车称重时间\` DATETIME,
        \`出厂时间\` DATETIME,
        \`物料名称\` VARCHAR(200)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ 数据库表创建完成');
    console.log('  - data, sensorStatus, settlementHistoryData, settlementStatus, strainStatus, tiltStatus,orderRecordData');
  } finally {
    conn.release();
  }
}

// ==========================================
// 插入逻辑
// ==========================================

async function insertData(conn, rows) {
  const columns = [
    '采集时间', '解调仪地址', '解调仪类型', '传感器ID',
    '安装位置', '通道号', '传感器类型', '温度(°C)',
    '湿度(%)', '频率(Hz)', '应变值(με)', '沉降值(mm)',
    'X向倾角(°)', 'Y向倾角(°)'
  ];

  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO \`data\` (\`${columns.join('`,`')}\`) VALUES (${placeholders})`;

  let count = 0;
  for (const row of rows) {
    const values = [
      row['采集时间'] ? row['采集时间'].toString().replace(/\//g, '-') : null,
      row['解调仪地址'],
      row['解调仪类型'],
      row['传感器ID'],
      row['安装位置'],
      row['通道号'],
      row['传感器类型'],
      row['温度(°C)'],
      row['湿度(%)'],
      row['频率(Hz)'],
      row['应变值(με)'],
      row['沉降值(mm)'],
      row['X向倾角(°)'],
      row['Y向倾角(°)']
    ];

    await conn.execute(sql, values);
    count++;
  }
  return count;
}

async function insertStatus(conn, rows) {
  const columns = ['采集时间', '安装位置', '类型', '状态', '应变值', '异常情况'];
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO \`sensorStatus\` (\`${columns.join('`,`')}\`) VALUES (${placeholders})`;

  let count = 0;
  for (const row of rows) {
    const values = [
      row['采集时间'] || new Date(),
      row['安装位置'],
      row['类型'],
      row['状态'],
      row['应变值'],
      row['异常情况']
    ];

    await conn.execute(sql, values);
    count++;
  }
  return count;
}

async function insertStrainStatus(conn, rows) {
  const columns = ['采集时间', '安装位置', '类型', '状态', '传感器ID', '应变值', '异常情况'];
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO \`strainStatus\` (\`${columns.join('`,`')}\`) VALUES (${placeholders})`;

  let count = 0;
  for (const row of rows) {
    const values = [
      row['采集时间'] || new Date(),
      row['安装位置'],
      row['类型'],
      row['状态'],
      row['传感器ID'],
      row['应变值'],
      row['异常情况']
    ];
    await conn.execute(sql, values);
    count++;
  }
  return count;
}

async function insertTiltStatus(conn, rows) {
  const columns = ['采集时间', '安装位置', '类型', '状态', '传感器ID', 'X向倾角(°)', 'Y向倾角(°)', '异常情况'];
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO \`tiltStatus\` (\`${columns.join('`,`')}\`) VALUES (${placeholders})`;

  let count = 0;
  for (const row of rows) {
    const values = [
      row['采集时间'] || new Date(),
      row['安装位置'],
      row['类型'],
      row['状态'],
      row['传感器ID'],
      row['X向倾角(°)'],
      row['Y向倾角(°)'],
      row['异常情况']
    ];
    await conn.execute(sql, values);
    count++;
  }
  return count;
}

async function insertSettlement(conn, rows) {
  const columns = ['采集时间', '安装位置', '传感器ID', '沉降值'];
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO \`settlementHistoryData\` (\`${columns.join('`,`')}\`) VALUES (${placeholders})`;

  let count = 0;
  for (const row of rows) {
    const values = [
      row['采集时间'] || new Date(),
      row['安装位置'],
      row['传感器ID'],
      row['沉降值']
    ];

    await conn.execute(sql, values);
    count++;
  }
  return count;
}

async function insertSettlementStatus(conn, rows) {
  const columns = ['采集时间', '安装位置', '类型', '状态', '传感器ID', '初始值', '当前值', '变化值'];
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO \`settlementStatus\` (\`${columns.join('`,`')}\`) VALUES (${placeholders})`;

  let count = 0;
  for (const row of rows) {
    const values = [
      row['采集时间'] || new Date(),
      row['安装位置'],
      row['类型'],
      row['状态'],
      row['传感器ID'],
      row['初始值'],
      row['当前值'],
      row['变化值']
    ];

    await conn.execute(sql, values);
    count++;
  }
  return count;
}

async function insertOrderRecord(conn, rows) {
  const columns = ['订单号', '车牌', '入厂时间', '空车称重时间', '库底装车时间', '满车称重时间', '出厂时间', '物料名称'];
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO \`orderRecordData\` (\`${columns.join('`,`')}\`) VALUES (${placeholders})`;

  let count = 0;
  for (const row of rows) {
    const values = [
      row['订单号'],
      row['车牌'],
      row['入厂时间'],
      row['空车称重时间'],
      row['库底装车时间'],
      row['满车称重时间'],
      row['出厂时间'],
      row['物料名称']
    ];

    await conn.execute(sql, values);
    count++;
  }
  return count;
}

// ==========================================
// API 路由：数据插入
// ==========================================

app.post('/api/insert', async (req, res) => {
  const { table, rows } = req.body;

  if (!table || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: '参数错误' });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    let inserted = 0;
    let targetTable = '';


    if (table === 'data' || table === 'sensorData' || table === 'sensordata') {
      inserted = await insertData(conn, rows);
      targetTable = 'data';
    } else if (table === 'settlementhistorydata' || table === 'settlementHistoryData') {
      inserted = await insertSettlement(conn, rows);
      targetTable = 'settlementHistoryData';
    } else if (table === 'settlementStatus' || table === 'settlementstatus') {
      inserted = await insertSettlementStatus(conn, rows);
      targetTable = 'settlementStatus';
    } else if (table === 'strainStatus' || table === 'strainstatus') {
      // 注：原代码中此函数未定义，这里使用 sensorStatus 表
      inserted = await insertStrainStatus(conn, rows);
      targetTable = 'strainStatus';
    } else if (table === 'tiltStatus' || table === 'tiltstatus') {
      // 注：原代码中此函数未定义，这里使用 sensorStatus 表
      inserted = await insertTiltStatus(conn, rows);
      targetTable = 'tiltStatus';
    } else if (table === 'orderRecordData' || table === 'orderrecorddata') {
      inserted = await insertOrderRecord(conn, rows);
      targetTable = 'orderRecordData';
    } else {
      throw new Error('未知的表类型');
    }

    await conn.commit();

    const [check] = await conn.execute(`SELECT COUNT(*) as total FROM \`${targetTable}\``);

    res.json({
      success: true,
      message: `成功写入 ${targetTable} 表 ${inserted} 条数据`,
      tableTotal: check[0].total
    });

  } catch (error) {
    await conn.rollback();
    console.error('插入错误:', error);
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// ==========================================
// API 路由：数据查询
// ==========================================

app.get('/api/query/:table', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const limit = parseInt(req.query.limit) || 20;
    const [rows] = await conn.execute(
      `SELECT * FROM \`${req.params.table}\` ORDER BY id DESC LIMIT ${limit}`
    );
    res.json({
      table: req.params.table,
      count: rows.length,
      data: rows
    });
  } finally {
    conn.release();
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: '景德镇电厂电源控制系统-综合数据服务',
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

// ==========================================
// API 路由：订单代理
// ==========================================

app.get('/api/order', (req, res) => {
  const params = req.query;

  const targetHost = '192.168.1.201';
  const targetPort = 8003;
  const targetPath = '/SearchLadeInterface.asmx/OrderRecordData';

  // 构建请求参数
  const queryParams = new URLSearchParams();
  if (params.time) queryParams.append('time', `"${params.time}"`);
  if (params.Company_id) queryParams.append('Company_id', `"${params.Company_id}"`);
  if (params.Mode) queryParams.append('Mode', `"${params.Mode}"`);

  const fullPath = `${targetPath}?${queryParams.toString()}`;

  console.log('\n========== 请求信息 ==========');
  console.log('时间:', new Date().toLocaleString());
  console.log('请求参数:', params);
  console.log('完整路径:', fullPath);
  console.log('================================\n');

  const options = {
    hostname: targetHost,
    port: targetPort,
    path: fullPath,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';

    proxyRes.on('data', (chunk) => {
      data += chunk;
    });

    proxyRes.on('end', () => {
      console.log('响应状态码:', proxyRes.statusCode);
      console.log('原始响应内容:', data);
      console.log('响应类型:', typeof data);

      // 尝试处理各种响应格式
      let responseData;

      // 1. 尝试直接解析JSON
      try {
        responseData = JSON.parse(data);
        console.log('✅ 成功解析为JSON');
      } catch (e1) {
        // 2. 尝试处理可能包含BOM的响应
        try {
          const cleanData = data.replace(/^\uFEFF/, '');
          responseData = JSON.parse(cleanData);
          console.log('✅ 移除BOM后成功解析为JSON');
        } catch (e2) {
          // 3. 尝试提取JSON部分
          try {
            const jsonMatch = data.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              responseData = JSON.parse(jsonMatch[0]);
              console.log('✅ 提取JSON部分成功');
            } else {
              throw new Error('未找到JSON格式数据');
            }
          } catch (e3) {
            // 4. 如果不是JSON，返回原始文本
            console.log('⚠️ 响应不是JSON格式，返回原始文本');
            responseData = {
              rawResponse: data,
              message: '服务器返回的不是标准JSON格式',
              hint: '原始响应内容见 rawResponse 字段'
            };
          }
        }
      }

      res.status(200).json(responseData);
      console.log('✅ 返回数据处理完成\n');
    });
  });

  proxyReq.on('error', (error) => {
    console.error('❌ 请求失败:', error.message);
    res.status(500).json({
      error: '代理请求失败',
      message: error.message,
      hint: '请检查目标服务器是否可访问'
    });
  });

  proxyReq.setTimeout(10000, () => {
    console.error('❌ 请求超时');
    proxyReq.destroy();
    res.status(504).json({ error: '请求超时', message: '目标服务器10秒未响应' });
  });

  proxyReq.end();
});

// ==========================================
// 启动服务
// ==========================================

initTables().then(() => {
  app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('✅ 合并服务启动成功！');
    console.log(`📡 监听地址: http://localhost:${PORT}`);
    console.log(`   健康检查: http://localhost:${PORT}/api/health`);
    console.log('\n🔗 可用接口:');
    console.log(`  • 订单代理: GET  http://localhost:${PORT}/api/order?time=...&Company_id=...&Mode=...`);
    console.log(`  • 数据插入: POST http://localhost:${PORT}/api/insert`);
    console.log(`  • 数据查询: GET  http://localhost:${PORT}/api/query/:table?limit=20`);
    console.log('========================================\n');
    console.log('表结构（严格按原始数据字段）：');
    console.log('  - data 表: 采集时间、解调仪地址、解调仪类型、传感器ID、安装位置、通道号、传感器类型、温度(°C)、湿度(%)、频率(Hz)、应变值(με)、沉降值(mm)、X向倾角(°)、Y向倾角(°)');
    console.log('  - sensorStatus 表: id(主键)、采集时间(TIMESTAMP)、安装位置、类型、状态、应变值、异常情况');
    console.log('  - strainStatus 表: id(主键)、采集时间(TIMESTAMP)、安装位置、类型、状态、传感器ID、应变值、异常情况');
    console.log('  - tiltStatus 表: id(主键)、采集时间(TIMESTAMP)、安装位置、类型、状态、传感器ID、X向倾角(°)、Y向倾角(°)、异常情况');
    console.log('  - settlementHistoryData 表: id(主键)、采集时间(TIMESTAMP)、安装位置、传感器ID、沉降值');
    console.log('  - settlementStatus 表: id(主键)、采集时间(TIMESTAMP)、安装位置、类型、状态、传感器ID、初始值、当前值、变化值');
    console.log('  - orderRecordData 表: id(主键)、请求时间、订单号、车牌、入厂时间、空车称重时间、库底装车时间、满车称重时间、出厂时间、物料名称');
  });
}).catch(console.error);