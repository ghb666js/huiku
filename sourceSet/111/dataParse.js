require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { SerialPort } = require('serialport');

const app = express();
app.use(cors());
app.use(express.json());

const HTTP_PORT = 3000;

// ==========================================
// 数据库连接池配置
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
// 数据库表初始化
// ==========================================

async function initTables() {
  const conn = await pool.getConnection();
  try {
    // 第一张表：data（原始传感器数据）
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

    console.log('✅ 数据库表创建完成');
    console.log('  - data, sensorStatus, settlementHistoryData, settlementStatus, strainStatus, tiltStatus');
  } finally {
    conn.release();
  }
}

// ==========================================
// 数据插入函数
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

// ==========================================
// API 路由 - 健康检查
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: '景德镇电厂电源控制系统 - 综合数据服务',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// API 路由 - COM端口识别
// ==========================================

app.get('/api/com-ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    console.log('原始端口列表:', ports);

    const formattedPorts = ports.map((port, index) => {
      let vendorId = '0000';
      let productId = '0000';

      if (port.vendorId) {
        vendorId = port.vendorId.toString(16).toUpperCase().padStart(4, '0');
      }
      if (port.productId) {
        productId = port.productId.toString(16).toUpperCase().padStart(4, '0');
      }

      let locationInfo = '';
      if (port.pnpId) {
        const locationMatch = port.pnpId.match(/Location_(\d+)/);
        if (locationMatch) {
          locationInfo = locationMatch[1];
        }
      }

      return {
        index: index,
        comName: port.path,
        vendorId: vendorId,
        productId: productId,
        manufacturer: port.manufacturer || 'Unknown',
        serialNumber: port.serialNumber || null,
        locationId: port.locationId || locationInfo || null,
        pnpId: port.pnpId || null,
        friendlyName: port.friendlyName || port.path
      };
    });

    // 过滤USB转串口设备
    const usbPorts = formattedPorts.filter(p => {
      const vid = p.vendorId.toUpperCase();
      const usbVids = ['1A86', '067B', '0403', '0483', '10C4', '4348', '0525'];
      const isUsbDevice = usbVids.includes(vid);

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
// API 路由 - 传感器数据插入
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

    if (table === 'data' || table === 'sensor' || table === 'sensorData') {
      inserted = await insertData(conn, rows);
      targetTable = 'data';
    } else if (table === 'sensorStatus' || table === 'status') {
      inserted = await insertStatus(conn, rows);
      targetTable = 'sensorStatus';
    } else if (table === 'settlement' || table === 'settlementHistoryData') {
      inserted = await insertSettlement(conn, rows);
      targetTable = 'settlementHistoryData';
    } else if (table === 'settlementStatus' || table === 'settlementResult') {
      inserted = await insertSettlementStatus(conn, rows);
      targetTable = 'settlementStatus';
    } else if (table === 'strainStatus' || table === 'strain') {
      inserted = await insertStrainStatus(conn, rows);
      targetTable = 'strainStatus';
    } else if (table === 'tiltStatus' || table === 'tilt') {
      inserted = await insertTiltStatus(conn, rows);
      targetTable = 'tiltStatus';
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
// API 路由 - 传感器数据查询
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

// ==========================================
// 服务启动
// ==========================================

initTables().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log('='.repeat(60));
    console.log(' 景德镇电厂电源控制系统 - 综合数据服务已启动');
    console.log('='.repeat(60));
    console.log(` 服务地址: http://localhost:${HTTP_PORT}`);
    console.log('');
    console.log(' 【系统状态API】');
    console.log(`   健康检查: http://localhost:${HTTP_PORT}/api/health`);
    console.log('');
    console.log(' 【硬件接口API】');
    console.log(`   COM端口:  http://localhost:${HTTP_PORT}/api/com-ports`);
    console.log('');
    console.log(' 【传感器数据API】');
    console.log(`   插入数据: POST http://localhost:${HTTP_PORT}/api/insert`);
    console.log(`   查询数据: GET  http://localhost:${HTTP_PORT}/api/query/{table}`);
    console.log('');
    console.log(' 支持的数据表:');
    console.log('   - data, sensorStatus, settlementHistoryData');
    console.log('   - settlementStatus, strainStatus, tiltStatus');
    console.log('='.repeat(60));
  });
}).catch(console.error);

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n服务已停止');
  process.exit(0);
});