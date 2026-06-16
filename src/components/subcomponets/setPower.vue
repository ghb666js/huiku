<template>
  <div>
    <h1 class="main-title">监测硬件配置</h1>

    <div :class="['system-status', systemStatusClass]" id="system-status" v-html="systemStatus">
    </div>

    <div class="auth-section">
      <button class="auth-btn" id="btn-auto-detect" @click="authorizeAndAutoDetect()">
        一键授权并自动识别
      </button>
      <button class="auth-btn warning" id="btn-query-devices" @click="queryDevices()" :disabled="!canQueryDevices">
        智能查询设备类型
      </button>
      <div class="auth-status" id="auth-status" v-html="authStatus">
      </div>
      <div class="error-detail" id="error-detail" :class="{ show: showErrorDetail }" v-html="errorDetail"></div>
      <div class="query-log" id="query-log" :class="{ show: showQueryLog }">
        <div v-for="(entry, index) in queryLog" :key="index" :class="['log-entry', entry.type]" v-html="entry.message">
        </div>
      </div>
      <div class="refresh-shutdown-log" id="refresh-shutdown-log" :class="{ show: showRefreshLog }" v-html="refreshLog"></div>
    </div>

    <div class="detect-result" id="detect-result" :class="{ show: showDetectResult }">
      <div class="detect-title">✓ 系统COM端口映射</div>
      <table class="port-table">
        <thead>
          <tr>
            <th>系统COM号</th>
            <th>VID</th>
            <th>PID</th>
            <th>制造商</th>
            <th>设备类型</th>
          </tr>
        </thead>
        <tbody id="port-table-body">
          <tr v-for="(port, index) in sortedPorts" :key="index">
            <td class="com-cell">{{ port.comName }}</td>
            <td>{{ port.vendorId }}</td>
            <td>{{ port.productId }}</td>
            <td>{{ port.manufacturer }}</td>
            <td>
              <span v-if="port.deviceType === 'radar'" class="device-type radar">雷达电源</span>
              <span v-else-if="port.deviceType === 'sensor'" class="device-type sensor">解调仪电源</span>
              <span v-else class="device-type unknown">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="control-panel">
      <div class="control-block" id="block-radar" :class="{ 'active-device': powerState.radar }">
        <div class="block-title1">智能3D雷达机器人电源控制系统</div>
        <div class="port-row">
          <span class="port-label">通讯端口：</span>
          <select class="port-select" id="port-radar" :disabled="!portSelectEnabled" @change="onPortChange('radar')" v-model="selectedPorts.radar">
            <option value="">-- 请选择系统COM端口 --</option>
            <option v-for="(port, index) in sortedPortOptions" :key="index" :value="port.index">
              {{ port.label }}
            </option>
          </select>
        </div>
        <div class="button-row">
          <button class="control-btn btn-on" id="btn-radar-on" @click="togglePower('radar', true)" :disabled="!canPowerOn('radar')">供电</button>
          <button class="control-btn btn-off" id="btn-radar-off" @click="togglePower('radar', false)" :disabled="!powerState.radar" :class="{ active: powerState.radar }">断电</button>
        </div>
        <div class="status-tip" id="status-radar" :class="statusClasses.radar">{{ statusMessages.radar }}</div>
      </div>

      <div class="control-block" id="block-sensor" :class="{ 'active-device': powerState.sensor }">
        <div class="block-title1">传感器解调仪电源控制系统</div>
        <div class="port-row">
          <span class="port-label">通讯端口：</span>
          <select class="port-select" id="port-sensor" :disabled="!portSelectEnabled" @change="onPortChange('sensor')" v-model="selectedPorts.sensor">
            <option value="">-- 请选择系统COM端口 --</option>
            <option v-for="(port, index) in sortedPortOptions" :key="index" :value="port.index">
              {{ port.label }}
            </option>
          </select>
        </div>
        <div class="button-row">
          <button class="control-btn btn-on" id="btn-sensor-on" @click="togglePower('sensor', true)" :disabled="!canPowerOn('sensor')">供电</button>
          <button class="control-btn btn-off" id="btn-sensor-off" @click="togglePower('sensor', false)" :disabled="!powerState.sensor" :class="{ active: powerState.sensor }">断电</button>
        </div>
        <div class="status-tip" id="status-sensor" :class="statusClasses.sensor">{{ statusMessages.sensor }}</div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'SetPower',
  data() {
    return {
      // 控制指令
      openCommand: new Uint8Array([0xa0, 0x01, 0x03, 0xa4]),
      closeCommand: new Uint8Array([0xa0, 0x01, 0x02, 0xa3]),
      openResponse: [0xA0, 0x01, 0x01, 0xA2],
      closeResponse: [0xA0, 0x01, 0x00, 0xA1],
      
      // 查询指令
      queryCommand: new Uint8Array([0xa0, 0x01, 0x05, 0xa6]),
      queryResponse: [0xA0, 0x01, 0x00, 0xA1],
      sensorQueryCommand: new Uint8Array([0x02, 0x06, 0x00, 0x00, 0x00, 0x31, 0x48, 0x2D]),
      sensorQueryResponse: [0x02, 0x06, 0x00, 0x00, 0x00, 0x31, 0x48, 0x2D],
      
      powerState: { radar: false, sensor: false },
      selectedPorts: { radar: '', sensor: '' },
      portHandles: { radar: { port: null }, sensor: { port: null } },
      deviceConfig: {
        radar: { name: '智能3D雷达机器人' },
        sensor: { name: '传感器解调仪' }
      },
      
      // 运行时设备类型标记（仅当前会话有效，刷新后清空）
      runtimeDeviceTypes: {},
      
      authorizedPorts: [],  // 浏览器授权的端口对象数组
      systemComPorts: [],   // Node.js返回的系统COM端口信息
      portMapping: {},      // 浏览器索引 -> 系统COM信息映射
      NODE_SERVER: 'http://localhost:3000',
      
      // UI状态
      systemStatus: '正在初始化...',
      systemStatusClass: '',
      authStatus: '等待操作...',
      showErrorDetail: false,
      errorDetail: '',
      showQueryLog: false,
      queryLog: [],
      showRefreshLog: false,
      refreshLog: '',
      showDetectResult: false,
      portSelectEnabled: false,
      canQueryDevices: false,
      statusMessages: { radar: '', sensor: '' },
      statusClasses: { radar: 'status-tip', sensor: 'status-tip' }
    };
  },
  computed: {
    sortedPorts() {
      console.log('sortedPorts - runtimeDeviceTypes:', this.runtimeDeviceTypes);
      console.log('sortedPorts - portMapping:', this.portMapping);
      
      const result = Object.entries(this.portMapping)
        .map(([browserIdx, sysPort]) => {
          const deviceType = this.runtimeDeviceTypes[browserIdx] || this.runtimeDeviceTypes[parseInt(browserIdx)];
          console.log(` sortedPorts- browserIdx: ${browserIdx} (${typeof browserIdx}), deviceType: ${deviceType}`);
          return {
            ...sysPort,
            deviceType: deviceType
          };
        })
        .sort((a, b) => {
          const numA = parseInt(a.comName.replace('COM', ''));
          const numB = parseInt(b.comName.replace('COM', ''));
          return numA - numB;
        });
      
      console.log('sortedPorts - result:', result);
      return result;
    },
    sortedPortOptions() {
      return Object.entries(this.portMapping)
        .sort((a, b) => {
          const numA = parseInt(a[1].comName.replace('COM', ''));
          const numB = parseInt(b[1].comName.replace('COM', ''));
          return numA - numB;
        })
        .map(([browserIdx, sysPort]) => {
          const deviceTypeLabel = this.runtimeDeviceTypes[browserIdx] || this.runtimeDeviceTypes[parseInt(browserIdx)];
          let labelText = sysPort.comName;
          if (deviceTypeLabel === 'radar') {
            labelText += ' [雷达电源]';
          } else if (deviceTypeLabel === 'sensor') {
            labelText += ' [解调仪电源]';
          } else {
            labelText += ` [${sysPort.manufacturer}]`;
          }
          return {
            index: browserIdx,
            label: labelText
          };
        });
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      // 检测是否为页面刷新（使用sessionStorage）
      if (this.isPageRefresh()) {
        console.log('检测到页面刷新，准备执行断电操作...');
        await this.executeRefreshShutdown();
      } else {
        console.log('新页面会话，跳过断电操作');
      }

      await this.checkNodeService();

      // 清空运行时设备类型（确保刷新后重新查询）
      Object.keys(this.runtimeDeviceTypes).forEach(key => delete this.runtimeDeviceTypes[key]);

      // 尝试从浏览器获取已授权的端口（不需要重新授权）
      try {
        this.authorizedPorts = await navigator.serial.getPorts();
        console.log('页面加载时获取的授权端口:', this.authorizedPorts.length, '个');
      } catch (e) {
        console.log('获取授权端口失败:', e);
      }

      // 尝试恢复端口映射（但不恢复设备类型）
      const saved = localStorage.getItem('port_mapping_v2');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.systemComPorts = data.systemComPorts || [];
          this.portMapping = data.portMapping || {};

          // 只有在获取到授权端口后才尝试匹配
          if (this.authorizedPorts.length > 0 && this.validateConfiguration()) {
            this.showDetectResult = true;
            this.updateMainPortLists();
            this.systemStatusClass = 'system-status connected';
            this.systemStatus = 
              `已恢复端口配置：${Object.keys(this.portMapping).length} 个端口可用，等待设备类型查询`;

            // 有端口映射就启用查询按钮，但设备类型为空
            if (Object.keys(this.portMapping).length >= 1) {
              this.canQueryDevices = true;
            }
          } else {
            this.systemStatusClass = 'system-status warning';
            this.systemStatus = 
              '配置需要更新，请重新点击"一键授权并自动识别"';
          }
        } catch (e) {
          console.error('加载配置失败:', e);
          this.systemStatus = 
            '首次使用，请点击"一键授权并自动识别"';
        }
      } else {
        this.systemStatus = 
          '首次使用，请点击"一键授权并自动识别"';
      }
    },
    
    // 检测是否为页面刷新
    isPageRefresh() {
      const hasSession = sessionStorage.getItem('page_session_active');

      if (hasSession) {
        // sessionStorage存在，说明是刷新页面
        return true;
      } else {
        // sessionStorage不存在，说明是新打开页面或重新运行
        sessionStorage.setItem('page_session_active', 'true');
        return false;
      }
    },
    
    // 页面刷新时执行断电操作
    async executeRefreshShutdown() {
      this.refreshLog = '<div class="log-entry">检测到页面刷新，正在关闭电源端口...</div>';
      this.showRefreshLog = true;

      try {
        // 获取已授权的端口
        const ports = await navigator.serial.getPorts();
        if (ports.length === 0) {
          this.refreshLog += '<div class="log-entry">无已授权端口，跳过断电操作</div>';
          setTimeout(() => this.showRefreshLog = false, 2000);
          return;
        }

        this.refreshLog += `<div class="log-entry">发现 ${ports.length} 个已授权端口，准备发送断电指令</div>`;

        // 向所有已授权端口发送断电指令
        let successCount = 0;
        for (let i = 0; i < ports.length; i++) {
          const port = ports[i];
          try {
            // 尝试打开端口（如果未打开）
            if (!port.writable || !port.readable) {
              await port.open({ baudRate: 9600 });
            }

            // 发送断电指令
            const writer = port.writable.getWriter();
            await writer.write(this.closeCommand);
            writer.releaseLock();

            // 等待短暂时间确保指令发送
            await new Promise(r => setTimeout(r, 200));

            // 关闭端口
            await port.close();
            this.refreshLog += `<div class="log-entry" style="color: #28a745;">端口[${i}]: 断电成功</div>`;
            successCount++;
          } catch (e) {
            this.refreshLog += `<div class="log-entry" style="color: #dc3545;">端口[${i}]: 断电失败 - ${e.message}</div>`;
            // 尝试强制关闭
            try { if (port.readable) await port.close(); } catch (e) { }
          }
        }

        this.refreshLog += `<div class="log-entry" style="color: #28a745; font-weight: bold;">断电操作完成，成功: ${successCount}/${ports.length}</div>`;

      } catch (e) {
        this.refreshLog += `<div class="log-entry" style="color: #dc3545;">断电操作异常: ${e.message}</div>`;
      }

      // 3秒后隐藏日志
      setTimeout(() => {
        this.showRefreshLog = false;
      }, 3000);
    },
    
    // 验证配置是否有效
    validateConfiguration() {
      if (this.authorizedPorts.length === 0) return false;
      if (Object.keys(this.portMapping).length === 0) return false;
      return true;
    },
    
    // 检查Node服务
    async checkNodeService() {
      try {
        const response = await fetch(`${this.NODE_SERVER}/api/health`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        if (response.ok) {
          const data = await response.json();
          this.systemStatusClass = 'system-status connected';
          this.systemStatus = `✓ Node.js服务运行正常`;
          return true;
        }
      } catch (e) {
        console.log('Node服务未连接:', e);
      }
      this.systemStatusClass = 'system-status error';
      this.systemStatus = `✗ Node.js服务未连接<br><span style="font-size: 11px;">请运行: node server.js</span>`;
      return false;
    },
    
    // 一键授权并自动识别
    async authorizeAndAutoDetect() {
      this.showErrorDetail = false;
      this.authStatus = '正在连接Node服务...';

      // 1. 检查Node服务
      const nodeReady = await this.checkNodeService();
      if (!nodeReady) {
        this.authStatus = '<span style="color: #dc3545;">Node服务未启动</span>';
        return;
      }

      // 2. 获取系统COM端口
      this.authStatus = '正在获取系统COM端口列表...';
      try {
        const response = await fetch(`${this.NODE_SERVER}/api/com-ports`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error || '获取失败');
        this.systemComPorts = data.ports || [];
        console.log('系统COM端口:', this.systemComPorts);
      } catch (e) {
        this.authStatus = `<span style="color: #dc3545;">获取COM端口失败: ${e.message}</span>`;
        return;
      }

      // 3. 浏览器授权（关键步骤：获取新的授权端口列表）
      this.authStatus = '请在弹出的对话框中授权访问串口设备...';
      try {
        // 这会弹出浏览器授权对话框
        await navigator.serial.requestPort();
        this.authStatus = '授权成功，正在获取端口列表...';
      } catch (e) {
        this.authStatus = `<span style="color: #dc3545;">浏览器授权失败: ${e.message}</span>`;
        return;
      }

      // 4. 重新获取浏览器授权后的端口列表（关键！）
      try {
        this.authorizedPorts = await navigator.serial.getPorts();
        console.log('授权后的端口列表:', this.authorizedPorts);
        console.log('端口数量:', this.authorizedPorts.length);

        // 打印每个端口的详细信息
        this.authorizedPorts.forEach((port, idx) => {
          const info = port.getInfo();
          console.log(`端口[${idx}]:`, {
            vid: info.usbVendorId?.toString(16),
            pid: info.usbProductId?.toString(16),
            readable: !!port.readable,
            writable: !!port.writable
          });
        });
      } catch (e) {
        this.authStatus = `<span style="color: #dc3545;">获取端口列表失败: ${e.message}</span>`;
        return;
      }

      // 5. 匹配端口
      this.authStatus = '正在匹配端口...';
      await this.matchPorts();

      // 6. 清空之前的设备类型识别结果（确保重新授权后需要重新查询）
      Object.keys(this.runtimeDeviceTypes).forEach(key => delete this.runtimeDeviceTypes[key]);

      // 7. 保存配置（不包含设备类型）
      this.savePortMapping();

      // 8. 显示结果（设备类型为空）
      this.showDetectResult = true;
      this.updateMainPortLists();

      this.authStatus = `
        <span style="color: #28a745;">✓ 识别完成！</span><br>
        授权端口: ${this.authorizedPorts.length} 个，匹配成功: ${Object.keys(this.portMapping).length} 个<br>
        <span style="color: #f0ad4e;">请点击"智能查询设备类型"识别设备</span>
      `;

      // 启用智能查询按钮（只要有端口就启用）
      if (this.authorizedPorts.length >= 1) {
        this.canQueryDevices = true;
      }
    },
    
    // 仅保存端口映射（不包含设备类型）
    savePortMapping() {
      localStorage.setItem('port_mapping_v2', JSON.stringify({
        systemComPorts: this.systemComPorts,
        portMapping: this.portMapping,
        authorizedPortCount: this.authorizedPorts.length,
        timestamp: new Date().toISOString()
        // 注意：不保存设备类型，每次刷新后需要重新查询
      }));

      console.log('端口映射已保存（不含设备类型）');
    },
    
    // 匹配端口
    async matchPorts() {
      this.portMapping = {};

      for (let browserIdx = 0; browserIdx < this.authorizedPorts.length; browserIdx++) {
        const browserPort = this.authorizedPorts[browserIdx];
        const browserInfo = browserPort.getInfo();
        const browserVid = browserInfo.usbVendorId?.toString(16).toUpperCase().padStart(4, '0');
        const browserPid = browserInfo.usbProductId?.toString(16).toUpperCase().padStart(4, '0');

        // 查找匹配的系统COM端口
        const candidates = this.systemComPorts.filter(sysPort =>
          sysPort.vendorId.toUpperCase() === browserVid &&
          sysPort.productId.toUpperCase() === browserPid &&
          !Object.values(this.portMapping).some(m => m.comName === sysPort.comName)
        );

        if (candidates.length > 0) {
          this.portMapping[browserIdx] = candidates[0];
          console.log(`匹配成功: [${browserIdx}] -> ${candidates[0].comName}`);
        } else {
          console.warn(`未找到匹配: [${browserIdx}] VID=${browserVid} PID=${browserPid}`);
        }
      }
    },
    
    // 智能查询设备类型（严格按照指定逻辑）
    async queryDevices() {
      this.showQueryLog = true;
      this.queryLog = [];
      this.systemStatusClass = 'system-status processing';
      this.systemStatus = '正在进行智能设备查询...';

      const log = (msg, type = 'info') => {
        this.queryLog.push({
          message: `[${new Date().toLocaleTimeString()}] ${msg}`,
          type: type
        });
        console.log(msg);
      };

      try {
        // ==================== 步骤1 ====================
        // 对所有授权端口发送查询指令 0xA0 0x01 0x05 0xA6
        // 若返回 0xA0 0x01 0x00 0xA1 则标记该端口
        log('步骤1: 对所有授权端口发送查询指令 0xA0 0x01 0x05 0xA6', 'info');

        const markedPorts = []; // 存储标记端口的索引和端口对象

        for (let i = 0; i < this.authorizedPorts.length; i++) {
          const port = this.authorizedPorts[i];
          const comName = this.portMapping[i]?.comName || `端口${i}`;

          try {
            // 打开端口
            if (!port.readable || !port.writable) {
              await port.open({ baudRate: 9600 });
            }

            // 发送查询指令
            const response = await this.sendCommandAndRead(port, this.queryCommand, 1000);
            log(`${comName}: 发送 0xA0 0x01 0x05 0xA6，响应 ${this.formatBytes(response)}`, 'info');

            // 检查响应是否为 0xA0 0x01 0x00 0xA1
            if (this.checkResponseExact(response, this.queryResponse)) {
              log(`${comName}: ✓ 返回 0xA0 0x01 0x00 0xA1，标记为候选端口`, 'success');
              markedPorts.push({
                index: i,
                comName: comName,
                port: port,
                isOpen: true
              });
            } else {
              log(`${comName}: 响应不匹配，关闭端口`, 'error');
              if (port.readable) await port.close();
            }
          } catch (e) {
            log(`${comName}: 通信错误 - ${e.message}`, 'error');
            try { if (port.readable) await port.close(); } catch (e) { }
          }
        }

        if (markedPorts.length === 0) {
          throw new Error('没有端口响应查询指令，请检查设备连接');
        }

        log(`步骤1完成: 标记了 ${markedPorts.length} 个端口`, 'success');

        // ==================== 步骤2-4 遍历每个标记端口 ====================
        // 对每个标记端口：
        // 1. 发送 0xA0 0x01 0x03 0xA4，确认返回 0xA0 0x01 0x01 0xA2
        // 2. 对所有未标记端口发送 0x02 0x06 0x00 0x00 0x00 0x31 0x48 0x2D
        // 3. 根据响应判断设备类型
        // 4. 发送 0xA0 0x01 0x02 0xA3 断电

        log('步骤2-4: 遍历每个标记端口进行详细测试...', 'info');

        // 收集所有未标记端口
        const unmarkedPortIndices = [];
        for (let i = 0; i < this.authorizedPorts.length; i++) {
          if (!markedPorts.some(mp => mp.index === i)) {
            unmarkedPortIndices.push(i);
          }
        }

        log(`未标记端口: [${unmarkedPortIndices.join(', ')}]`, 'info');

        // 遍历每个标记端口
        for (let idx = 0; idx < markedPorts.length; idx++) {
          const currentPort = markedPorts[idx];
          log(`========== 测试标记端口[${idx + 1}/${markedPorts.length}]: ${currentPort.comName} ==========`, 'info');

          // ---- 2.1 发送开电指令 0xA0 0x01 0x03 0xA4 ----
          log(`向 ${currentPort.comName} 发送 0xA0 0x01 0x03 0xA4`, 'info');

          let openSuccess = false;
          try {
            if (!currentPort.port.readable || !currentPort.port.writable) {
              await currentPort.port.open({ baudRate: 9600 });
              currentPort.isOpen = true;
            }

            const openResp = await this.sendCommandAndRead(currentPort.port, this.openCommand, 1000);
            log(`${currentPort.comName}: 响应 ${this.formatBytes(openResp)}`, 'info');

            if (this.checkResponseExact(openResp, this.openResponse)) {
              log(`${currentPort.comName}: ✓ 返回 0xA0 0x01 0x01 0xA2，支持电源控制`, 'success');
              openSuccess = true;
            } else {
              log(`${currentPort.comName}: ✗ 响应不匹配，跳过此端口`, 'error');
              continue; // 跳过此端口，测试下一个
            }
          } catch (e) {
            log(`${currentPort.comName}: 开电测试失败 - ${e.message}`, 'error');
            continue; // 跳过此端口，测试下一个
          }

          // ---- 2.2 对所有未标记端口发送解调仪查询指令 ----
          log(`向所有未标记端口发送 0x02 0x06 0x00 0x00 0x00 0x31 0x48 0x2D...`, 'info');

          let foundSensor = false;

          await this.waitSeconds(40);
          console.log('等了40秒');
          for (const unmarkedIdx of unmarkedPortIndices) {
            const unmarkedPort = this.authorizedPorts[unmarkedIdx];
            const unmarkedName = this.portMapping[unmarkedIdx]?.comName || `端口${unmarkedIdx}`;

            try {
              if (!unmarkedPort.readable || !unmarkedPort.writable) {
                await unmarkedPort.open({ baudRate: 9600 });
              }

              const sensorResp = await this.sendCommandAndRead(unmarkedPort, this.sensorQueryCommand, 500);
              log(`${unmarkedName}: 响应 ${this.formatBytes(sensorResp)}`, 'info');

              // 检查是否返回 0x02 0x06 0x00 0x00 0x00 0x31 0x48 0x2D
              if (this.checkResponseExact(sensorResp, this.sensorQueryResponse)) {
                log(`${unmarkedName}: ✓ 匹配解调仪特征！`, 'success');
                foundSensor = true;
                // 关闭此端口，继续测试其他未标记端口
                if (unmarkedPort.readable) await unmarkedPort.close();
              } else {
                log(`${unmarkedName}: 非解调仪响应`, 'error');
                if (unmarkedPort.readable) await unmarkedPort.close();
              }
            } catch (e) {
              log(`${unmarkedName}: 查询失败 - ${e.message}`, 'error');
              try { if (unmarkedPort.readable) await unmarkedPort.close(); } catch (e) { }
            }
          }

          // ---- 2.3 根据结果判断设备类型 ----
          if (foundSensor) {
            // 有未标记端口返回解调仪特征，则当前标记端口为解调仪电源
            this.runtimeDeviceTypes[currentPort.index] = 'sensor';
            this.runtimeDeviceTypes[currentPort.index.toString()] = 'sensor';
            console.log(`设置设备类型: index=${currentPort.index} (${typeof currentPort.index}), type=sensor`);
            console.log(`runtimeDeviceTypes:`, this.runtimeDeviceTypes);
            log(`判断: ${currentPort.comName} 为 解调仪电源端口`, 'success');
          } else {
            // 没有未标记端口返回解调仪特征，则当前标记端口为雷达电源
            this.runtimeDeviceTypes[currentPort.index] = 'radar';
            this.runtimeDeviceTypes[currentPort.index.toString()] = 'radar';
            console.log(`设置设备类型: index=${currentPort.index} (${typeof currentPort.index}), type=radar`);
            console.log(`runtimeDeviceTypes:`, this.runtimeDeviceTypes);
            log(`${currentPort.comName}: 为 雷达电源端口`, 'success');
          }

          // ---- 2.4 发送断电指令 0xA0 0x01 0x02 0xA3 ----
          log(`向 ${currentPort.comName} 发送断电指令 0xA0 0x01 0x02 0xA3`, 'info');

          try {
            const closeResp = await this.sendCommandAndRead(currentPort.port, this.closeCommand, 1000);
            log(`${currentPort.comName}: 响应 ${this.formatBytes(closeResp)}`, 'info');

            if (this.checkResponseExact(closeResp, this.closeResponse)) {
              log(`${currentPort.comName}: ✓ 返回 0xA0 0x01 0x00 0xA1，断电成功`, 'success');
            } else {
              log(`${currentPort.comName}: 断电响应异常`, 'warning');
            }

            // 关闭端口
            if (currentPort.port.readable) await currentPort.port.close();
            currentPort.isOpen = false;

          } catch (e) {
            log(`${currentPort.comName}: 断电失败 - ${e.message}`, 'error');
            try { if (currentPort.port.readable) await currentPort.port.close(); } catch (e) { }
          }
        }

        log('========== 所有标记端口测试完成 ==========', 'info');

        // ==================== 查询结束，更新UI ====================
        log('查询功能结束，同步端口信息到下拉框...', 'info');

        // 更新UI
        this.updateMainPortLists();

        // 自动选择端口
        const radarIndices = Object.entries(this.runtimeDeviceTypes)
          .filter(([idx, type]) => type === 'radar')
          .map(([idx]) => parseInt(idx));
        const sensorIndices = Object.entries(this.runtimeDeviceTypes)
          .filter(([idx, type]) => type === 'sensor')
          .map(([idx]) => parseInt(idx));

        // 选择第一个雷达和第一个解调仪
        const radarIdx = radarIndices.length > 0 ? radarIndices[0] : null;
        const sensorIdx = sensorIndices.length > 0 ? sensorIndices[0] : null;

        if (radarIdx !== null || sensorIdx !== null) {
          this.autoSelectDevicePorts(radarIdx, sensorIdx);
        }

        // 显示结果
        let resultHtml = '<span style="color: #28a745;">✓ 智能查询完成！</span><br>';
        if (radarIndices.length > 0) {
          resultHtml += `雷达电源: ${radarIndices.map(i => this.portMapping[i]?.comName || `端口${i}`).join(', ')}<br>`;
        }
        if (sensorIndices.length > 0) {
          resultHtml += `解调仪电源: ${sensorIndices.map(i => this.portMapping[i]?.comName || `端口${i}`).join(', ')}`;
        }
        this.authStatus = resultHtml;

        this.systemStatusClass = 'system-status connected';
        this.systemStatus = '设备类型识别完成';

      } catch (error) {
        log(`查询失败: ${error.message}`, 'error');
        this.authStatus = `<span style="color: #dc3545;">查询失败: ${error.message}</span>`;
        this.systemStatusClass = 'system-status error';
        this.systemStatus = '设备查询失败';

        // 确保所有端口关闭
        for (const port of this.authorizedPorts) {
          try { if (port.readable) await port.close(); } catch (e) { }
        }
      } finally {
        // 不重新启用按钮，因为按钮状态是通过 canQueryDevices 控制的
      }
    },
    
    // 延时函数
    async waitSeconds(seconds) {
      return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
      });
    },
    
    // 辅助函数：发送指令并读取响应
    async sendCommandAndRead(port, command, timeoutMs = 1500) {
      const expectedLength = command.length;

      if (!port.writable || !port.readable) {
        throw new Error('端口未打开');
      }

      const writer = port.writable.getWriter();
      const reader = port.readable.getReader();
      const startTime = Date.now();
      let receivedData = [];

      // 预期响应长度 = 指令长度（根据协议，响应长度通常等于指令长度）
      console.log('长度,验证指令', expectedLength, command);

      try {
        await writer.write(command);
        while (Date.now() - startTime < timeoutMs) {
          const { value, done } = await Promise.race([
            reader.read(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('读取超时')), timeoutMs)
            )
          ]);

          if (done) break;
          if (value) {
            receivedData = receivedData.concat(Array.from(value));
            // 收到足够数据后提前退出
            if (receivedData.length >= expectedLength) break;
          }
        }

        console.log('返回接收数据', receivedData);
        return receivedData;
      } finally {
        writer.releaseLock();
        reader.releaseLock();
      }
    },
    
    // 辅助函数：精确匹配响应
    checkResponseExact(data, expected) {
      if (data.length < expected.length) return false;
      for (let i = 0; i < expected.length; i++) {
        if (data[i] !== expected[i]) return false;
      }
      return true;
    },
    
    // 辅助函数：格式化字节数组
    formatBytes(bytes) {
      if (!bytes || bytes.length === 0) return '无数据';
      return bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(', ');
    },
    
    // 自动选择设备端口
    autoSelectDevicePorts(radarIdx, sensorIdx) {
      if (radarIdx !== null) {
        this.selectedPorts.radar = radarIdx.toString();
        this.onPortChange('radar');

        this.statusMessages.radar = `已自动识别: ${this.portMapping[radarIdx]?.comName} (雷达电源)`;
        this.statusClasses.radar = 'status-tip connected';
      }

      if (sensorIdx !== null) {
        this.selectedPorts.sensor = sensorIdx.toString();
        this.onPortChange('sensor');

        this.statusMessages.sensor = `已自动识别: ${this.portMapping[sensorIdx]?.comName} (解调仪电源)`;
        this.statusClasses.sensor = 'status-tip connected';
      }
    },
    
    // 更新主界面下拉框
    updateMainPortLists() {
      if (Object.keys(this.portMapping).length === 0) {
        this.portSelectEnabled = false;
        this.statusMessages.radar = '请先点击"一键授权并自动识别"';
        this.statusClasses.radar = 'status-tip warning';
        this.statusMessages.sensor = '请先点击"一键授权并自动识别"';
        this.statusClasses.sensor = 'status-tip warning';
      } else {
        this.portSelectEnabled = true;
        this.statusMessages.radar = `就绪: ${Object.keys(this.portMapping).length} 个端口可用`;
        this.statusClasses.radar = 'status-tip';
        this.statusMessages.sensor = `就绪: ${Object.keys(this.portMapping).length} 个端口可用`;
        this.statusClasses.sensor = 'status-tip';
      }
    },
    
    // 端口选择变化
    onPortChange(deviceType) {
      const value = this.selectedPorts[deviceType];

      if (value === '') {
        return;
      }

      const portIndex = parseInt(value);

      // 验证索引有效性
      if (portIndex < 0 || portIndex >= this.authorizedPorts.length) {
        console.error(`无效端口索引: ${portIndex}, 可用范围: 0-${this.authorizedPorts.length - 1}`);
        alert('端口配置已过期，请重新点击"一键授权并自动识别"');
        this.selectedPorts[deviceType] = '';
        return;
      }

      const otherDevice = deviceType === 'radar' ? 'sensor' : 'radar';
      if (this.selectedPorts[otherDevice] === value && this.powerState[otherDevice]) {
        alert('该端口正在被另一个设备使用');
        this.selectedPorts[deviceType] = '';
        return;
      }
    },
    
    // 检查是否可以供电
    canPowerOn(deviceType) {
      const portIndex = this.selectedPorts[deviceType];
      if (!portIndex) return false;
      
      const otherDevice = deviceType === 'radar' ? 'sensor' : 'radar';
      if (this.selectedPorts[otherDevice] === portIndex && this.powerState[otherDevice]) {
        return false;
      }
      
      return true;
    },
    
    // 供电/断电控制
    async togglePower(device, turnOn) {
      const portIndex = this.selectedPorts[device];

      // 关键检查1: 索引是否有效
      if (portIndex === null || portIndex === undefined || portIndex === '') {
        alert('请先选择COM端口');
        return;
      }

      // 关键检查2: 索引是否在有效范围内
      if (portIndex < 0 || portIndex >= this.authorizedPorts.length) {
        const errorMsg = `端口索引 ${portIndex} 无效，当前授权端口数: ${this.authorizedPorts.length}`;
        console.error(errorMsg);
        this.statusMessages[device] = '错误: ' + errorMsg;
        this.statusClasses[device] = 'status-tip error';
        this.errorDetail = errorMsg + '\n请重新点击"一键授权并自动识别"更新配置';
        this.showErrorDetail = true;
        alert('端口配置已过期，请重新授权识别');
        return;
      }

      // 关键检查3: 获取端口对象
      const port = this.authorizedPorts[portIndex];
      if (!port) {
        const errorMsg = `端口对象不存在: authorizedPorts[${portIndex}]`;
        console.error(errorMsg, 'authorizedPorts:', this.authorizedPorts);
        this.statusMessages[device] = '错误: 端口对象不存在';
        this.statusClasses[device] = 'status-tip error';
        alert('端口对象无效，请重新授权');
        return;
      }

      // 检查占用
      const otherDevice = device === 'radar' ? 'sensor' : 'radar';
      if (turnOn && this.selectedPorts[otherDevice] === portIndex && this.powerState[otherDevice]) {
        alert('该端口正在被另一个设备使用');
        return;
      }

      if (turnOn) {
        try {
          this.statusMessages[device] = '正在连接...';
          this.statusClasses[device] = 'status-tip info';
          this.showErrorDetail = false;

          // 检查端口是否已打开
          console.log(`尝试打开端口[${portIndex}]:`, {
            readable: !!port.readable,
            writable: !!port.writable
          });

          if (!port.readable || !port.writable) {
            console.log(`端口未打开，正在打开...`);
            await port.open({ baudRate: 9600 });
            console.log(`端口打开成功`);
          }

          this.portHandles[device].port = port;

          const receivedData = await this.readData(port, this.openCommand);
          if (!this.checkResponse(receivedData, this.openResponse)) {
            throw new Error('设备响应异常');
          }

          this.powerState[device] = true;

          const comName = this.portMapping[portIndex]?.comName || `端口${portIndex}`;
          this.statusMessages[device] = `已连接 - ${comName}`;
          this.statusClasses[device] = 'status-tip connected';

        } catch (error) {
          console.error('供电失败:', error);
          this.statusMessages[device] = '连接失败: ' + error.message;
          this.statusClasses[device] = 'status-tip error';

          // 如果端口打开失败，尝试清理
          try {
            if (port.readable || port.writable) {
              await port.close();
            }
          } catch (e) {
            // 忽略关闭错误
          }

          alert('供电失败: ' + error.message);
        }
      } else {
        // 断电逻辑...
        try {
          this.statusMessages[device] = '正在断开...';
          const port = this.portHandles[device].port || this.authorizedPorts[portIndex];

          if (port && port.readable) {
            await this.readData(port, this.closeCommand);
            await port.close();
          }

          this.powerState[device] = false;
          this.portHandles[device].port = null;
          this.statusMessages[device] = '';
          this.statusClasses[device] = 'status-tip';

        } catch (error) {
          console.error('断电错误:', error);
          // 强制重置状态
          this.powerState[device] = false;
          this.portHandles[device].port = null;
          this.statusMessages[device] = '';
          this.statusClasses[device] = 'status-tip';
        }
      }
    },
    
    // 串口通信
    async readData(sourcePort, command) {
      // 检查端口有效性
      if (!sourcePort) {
        throw new Error('端口对象为空');
      }
      if (!sourcePort.writable || !sourcePort.readable) {
        throw new Error('端口未打开或不可读写');
      }

      const writer = await sourcePort.writable.getWriter();
      const reader = await sourcePort.readable.getReader();
      const timeout = 1500;
      const startTime = Date.now();
      let receivedData = [];

      try {
        await writer.write(command);
        while (true) {
          const { value, done } = await Promise.race([
            reader.read(),
            new Promise(r => setTimeout(() => r({ value: null, done: false }), timeout))
          ]);
          if (value) receivedData = receivedData.concat(Array.from(value));
          if (done || Date.now() - startTime > timeout) break;
        }
        writer.releaseLock();
        reader.releaseLock();
        return receivedData;
      } catch (error) {
        writer.releaseLock();
        reader.releaseLock();
        throw error;
      }
    },
    
    checkResponse(data, expected) {
      if (data.length < expected.length) return false;
      for (let i = 0; i < expected.length; i++) {
        if (data[i] !== expected[i]) return false;
      }
      return true;
    }
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}



.main-title {
  font-size: 1vw;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-align: center;
  flex-shrink: 0;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

.system-status {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 4px;
  font-size: 0.8vw;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

.system-status.connected {
  background-color: rgba(20, 80, 20, 0.7);
  border-color: rgba(0, 255, 100, 0.6);
  color: #ffffff;
  box-shadow: inset 0 0 10px rgba(0, 255, 100, 0.3);
}

.system-status.error {
  background-color: rgba(80, 20, 20, 0.7);
  border-color: rgba(255, 0, 0, 0.6);
  color: #ffffff;
  box-shadow: inset 0 0 10px rgba(255, 0, 0, 0.3);
}

.system-status.processing {
  background-color: rgba(80, 60, 20, 0.7);
  border-color: rgba(255, 200, 0, 0.6);
  color: #ffffff;
  box-shadow: inset 0 0 10px rgba(255, 200, 0, 0.3);
}

.auth-section {
  text-align: center;
  margin-bottom: 10px;
  padding: 15px;
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
  max-height: 15vh;
  overflow-y: auto;
}

.auth-btn {
  padding: 8px 20px;
  font-size: 0.7vw;
  background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
  color: #ffffff;
  border: 1px solid #0088ff;
  border-radius: 6px;
  cursor: pointer;
  font-family: "SimSun", "宋体", "Microsoft YaHei", serif;
  margin: 0 5px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.auth-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.auth-btn:hover {
  background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
  border-color: #00aaff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 136, 255, 0.4);
  transform: translateY(-2px);
}

.auth-btn:hover:before {
  left: 100%;
}

.auth-btn.warning {
  background: linear-gradient(180deg, #ff8800 0%, #cc6600 100%);
  border-color: #ffaa00;
}

.auth-btn.warning:hover {
  background: linear-gradient(180deg, #ffaa00 0%, #ff8800 100%);
  border-color: #ffcc00;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 136, 0, 0.4);
}

.auth-btn:disabled {
  background: linear-gradient(180deg, #666666 0%, #444444 100%);
  border-color: #888888;
  color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.auth-btn:disabled:before {
  display: none;
}

.auth-status {
  font-size: 0.7vw;
  color: #ffffff;
  margin-top: 10px;
  line-height: 1.5;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.detect-result {
  background-color: rgba(20, 80, 20, 0.7);
  border: 2px solid rgba(0, 255, 100, 0.6);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  display: none;
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 25vh;
  box-shadow: inset 0 0 10px rgba(0, 255, 100, 0.3);
}

.detect-result.show {
  display: flex;
  flex-direction: column;
}

.detect-title {
  font-size: 0.75vw;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
  text-align: center;
  flex-shrink: 0;
  text-shadow: 0 0 10px rgba(0, 255, 100, 0.8);
}

.port-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.6vw;
  font-family: "Consolas", "Courier New", monospace;
  flex-shrink: 0;
}

.port-table th,
.port-table td {
  padding: 4px 6px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 255, 100, 0.3);
  color: #ffffff;
}

.port-table th {
  background-color: rgba(0, 100, 0, 0.7);
  color: #ffffff;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 255, 100, 0.5);
}

.port-table .com-cell {
  font-weight: bold;
  color: #00d4ff;
  font-size: 0.65vw;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.port-table .device-type {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 3px;
  display: inline-block;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

.device-type.radar {
  background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
  color: white;
  border: 1px solid #0088ff;
}

.device-type.sensor {
  background: linear-gradient(180deg, #008800 0%, #006600 100%);
  color: white;
  border: 1px solid #00ff00;
}

.device-type.unknown {
  color: #999;
  font-style: italic;
  background: linear-gradient(180deg, #666666 0%, #444444 100%);
  border: 1px solid #888888;
}

.control-panel {
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 6px;
  padding: 0.75vw;
  overflow-y: auto;
  display: flex;
  flex-direction: row;
  gap: 1vw;
  justify-content: space-between;
  align-items: center;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
  height: 20vh;
  flex-shrink: 0;
}

.control-block {
  margin-bottom: 0;
  padding: 0.5vw;
  border: 2px solid rgba(0, 140, 255, 0.4);
  border-radius: 6px;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 15vw;
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 0.5vw;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 30, 60, 0.6);
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.1);
}

.control-block.active-device {
  border-color: rgba(0, 255, 100, 0.6);
  background-color: rgba(0, 40, 20, 0.6);
  box-shadow: inset 0 0 15px rgba(0, 255, 100, 0.2);
}

.block-title1 {
  font-size: 0.7vw;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  flex-shrink: 0;
  padding: 0.4vw 0;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

.port-row {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65vw;
  flex-shrink: 0;
  gap: 0.5vw;
  width: 10vw;
  max-width: 10vw;
}

.port-label {
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.port-select {
  width: 9vw;
  height: 4vh;
  font-size: 0.65vw;
  border: 1px solid rgba(0, 140, 255, 0.6);
  background-color: rgba(0, 30, 60, 0.8);
  color: #ffffff;
  text-align: center;
  text-align-last: center;
  font-family: "Consolas", "Courier New", monospace;
  box-shadow: inset 0 0 5px rgba(0, 212, 255, 0.2);
}

.port-select:disabled {
  background-color: rgba(60, 60, 60, 0.6);
  color: #999;
  border-color: #666666;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 0.75vw;
  align-items: center;
  flex-shrink: 0;
  margin-top: 0.25vw;
}

.control-btn {
  width: 6vw;
  height: 3vh;
  font-size: 0.8vw;
  border: 1px solid #0088ff;
  border-radius: 6px;
  cursor: pointer;
  font-family: "SimSun", "宋体", "Microsoft YaHei", serif;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.btn-on {
  background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
  color: #ffffff;
  border-color: #0088ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-on:hover {
  background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
  border-color: #00aaff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 136, 255, 0.4);
  transform: translateY(-2px);
}

.btn-on:disabled {
  background: linear-gradient(180deg, #666666 0%, #444444 100%);
  border-color: #888888;
  color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-off {
  background: linear-gradient(180deg, #666666 0%, #444444 100%);
  color: #999999;
  border-color: #888888;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-off.active {
  background: linear-gradient(180deg, #cc0000 0%, #990000 100%);
  color: #ffffff;
  border-color: #ff0000;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-off.active:hover {
  background: linear-gradient(180deg, #ff0000 0%, #cc0000 100%);
  border-color: #ff4444;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 0, 0, 0.4);
  transform: translateY(-2px);
}

.control-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.control-btn:hover:before {
  left: 100%;
}

.control-btn:disabled:before {
  display: none;
}


.status-tip {
  font-size: 0.65vw;
  color: #ffffff;
  text-align: center;
  margin-top: 5px;
  height: 4vh;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.status-tip.connected {
  color: #00ff00;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
}

.status-tip.error {
  color: #ff0000;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
}

.status-tip.warning {
  color: #ffcc00;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
}

.status-tip.info {
  color: #00d4ff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

.error-detail {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  font-size: 0.6vw;
  color: #721c24;
  font-family: "Consolas", monospace;
  display: none;
}

.error-detail.show {
  display: block;
}

.query-log {
  background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  font-size: 0.6vw;
  font-family: "Consolas", monospace;
  max-height: 15vh;
  overflow-y: auto;
  text-align: left;
  display: none;
}

.query-log.show {
  display: block;
}

.query-log .log-entry {
  margin: 2px 0;
  padding: 2px 0;
  border-bottom: 1px dotted #ccc;
}

.query-log .log-success {
  color: #28a745;
}

.query-log .log-error {
  color: #dc3545;
}

.query-log .log-info {
  color: #17a2b8;
}

.query-log .log-warning {
  color: #f0ad4e;
}

.refresh-shutdown-log {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  font-size: 0.6vw;
  color: #856404;
  font-family: "Consolas", monospace;
  max-height: 10vh;
  overflow-y: auto;
  text-align: left;
  display: none;
}

.refresh-shutdown-log.show {
  display: block;
}

.refresh-shutdown-log .log-entry {
  margin: 2px 0;
}
</style>