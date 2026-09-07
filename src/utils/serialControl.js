// 串口控制模块（Web Serial API），逻辑与 send/11.html 完全一致
import EventBus from "@/bus";

let port = null;
let writer = null;
let reader = null;
let reading = false;

let feedSending = false, feedStop = false;
let aroundSending = false, aroundStop = false;
let fluctuateSending = false, fluctuateStop = false;
let pendingCommand = false; // 是否正在等待指令响应
let disconnecting = false;  // 是否正在断开（主动断开时不打印读取错误）

async function sendCommand(command) {
  try {
    if (!writer) throw new Error('串口未连接或写入器未初始化');
    const hex = command.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    console.log('[串口] 下发指令:', hex);
    await writer.write(new Uint8Array(command));
    pendingCommand = true; // 标记等待指令响应
    return true;
  } catch (error) {
    console.error('发送指令失败:', error);
    return false;
  }
}

function waitSeconds(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// 连接串口
export async function connectSerial() {
  try {
    if (!('serial' in navigator)) {
      alert('当前浏览器不支持 Web Serial API');
      return false;
    }
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 38400 });
    writer = port.writable.getWriter();
    startReading();
    console.log('[串口] 连接成功');
    return true;
  } catch (error) {
    console.error('连接串口时出错:', error);
    return false;
  }
}

// 监听设备响应：区分连接响应与指令响应
async function startReading() {
  if (reading || !port) return;
  reading = true;
  try {
    reader = port.readable.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value && value.length > 0) {
        if (pendingCommand) {
          // 下发指令后设备响应 → 设备正在运行
          pendingCommand = false;
          EventBus.$emit('serialCommandResponded');
        } else {
          // 连接阶段设备响应 → 设备已连接
          EventBus.$emit('serialDeviceResponded');
        }
      }
    }
  } catch (error) {
    // 主动断开导致的读取错误不打印
    if (!disconnecting) {
      console.error('读取串口失败:', error);
    }
  } finally {
    reading = false;
  }
}

// 断开串口
export async function disconnectSerial() {
  disconnecting = true;
  try {
    if (reader) {
      await reader.cancel().catch(() => {});
      reader = null;
    }
    if (writer) {
      writer.releaseLock();
      writer = null;
    }
    if (port) {
      await port.close().catch(() => {});
      port = null;
    }
  } catch (error) {
    console.error('断开串口失败:', error);
  } finally {
    disconnecting = false;
  }
}

// ==================== 进给 ====================
const FEED_CMDS = [
  [0x01, 0x06, 0x00, 0x22, 0x00, 0x01, 0xE8, 0x00],
  [0x01, 0x10, 0x00, 0x37, 0x00, 0x02, 0x04, 0x00, 0x00, 0x75, 0x30, 0x97, 0xD9],
  [0x01, 0x06, 0x00, 0x4E, 0x00, 0x01, 0x28, 0x1D],
  [0x01, 0x06, 0x00, 0x22, 0x00, 0x00, 0x29, 0xC0],
  [0x01, 0x10, 0x00, 0x37, 0x00, 0x02, 0x04, 0x00, 0x00, 0x75, 0x30, 0x97, 0xD9],
  [0x01, 0x06, 0x00, 0x4E, 0x00, 0x01, 0x28, 0x1D],
];

// 进给 toggle：正在发送→停止；否则→开始（与 11.html 按钮点击逻辑一致）
export function toggleFeed() {
  if (feedSending) {
    feedStop = true;
    feedSending = false;
    console.log('[串口] 进给停止');
    // return false;
  }else{
    feedSending = true;
    feedStop = false;
    console.log('[串口] 进给启动');
  }
  feedLoop();
  // return true;
}

async function feedLoop() {
  try {
    while (feedSending && !feedStop) {
      for (let i = 0; i < 3 && !feedStop; i++) {
        await sendCommand(FEED_CMDS[i]);
        await waitSeconds(0.1);
      }
      await waitSeconds(17);
      for (let i = 3; i < 6 && !feedStop; i++) {
        await sendCommand(FEED_CMDS[i]);
        await waitSeconds(0.1);
      }
      await waitSeconds(17);
    }
  } catch (error) {
    console.error('发送过程出错:', error);
  } finally {
    feedSending = false;
    feedStop = false;
  }
}

// ==================== 左右 ====================
const AROUND_CMDS = [
  [0x02, 0x06, 0x00, 0x22, 0x00, 0x01, 0xE8, 0x33],
  [0x02, 0x10, 0x00, 0x37, 0x00, 0x02, 0x04, 0x00, 0x00, 0xBB, 0x80, 0xCD, 0x49],
  [0x02, 0x06, 0x00, 0x4E, 0x00, 0x01, 0x28, 0x2E],
  [0x02, 0x06, 0x00, 0x22, 0x00, 0x00, 0x29, 0xF3],
  [0x02, 0x10, 0x00, 0x37, 0x00, 0x02, 0x04, 0x00, 0x00, 0xBB, 0x80, 0xCD, 0x49],
  [0x02, 0x06, 0x00, 0x4E, 0x00, 0x01, 0x28, 0x2E],
];

// 左右 toggle
export function toggleAround() {
  if (aroundSending) {
    aroundStop = true;
    aroundSending = false;
    console.log('[串口] 左右停止');
  }else{
    aroundSending = true;
    aroundStop = false;
    console.log('[串口] 左右启动');
  }
  aroundLoop();
}

async function aroundLoop() {
  try {
    while (aroundSending && !aroundStop) {
      for (let i = 0; i < 3 && !aroundStop; i++) {
        await sendCommand(AROUND_CMDS[i]);
        await waitSeconds(0.1);
      }
      await waitSeconds(27);
      for (let i = 3; i < 6 && !aroundStop; i++) {
        await sendCommand(AROUND_CMDS[i]);
        await waitSeconds(1);
      }
      await waitSeconds(27);
    }
  } catch (error) {
    console.error('发送过程出错:', error);
  } finally {
    aroundSending = false;
    aroundStop = false;
  }
}

// ==================== 起伏 ====================
const FLUCTUATE_CMDS = [
  [0x03, 0x06, 0x00, 0x22, 0x00, 0x01, 0xE9, 0xE2],
  [0x03, 0x10, 0x00, 0x37, 0x00, 0x02, 0x04, 0x00, 0x00, 0x9C, 0x40, 0xD2, 0x15],
  [0x03, 0x06, 0x00, 0x4E, 0x00, 0x01, 0x29, 0xFF],
  [0x03, 0x06, 0x00, 0x22, 0x00, 0x00, 0x28, 0x22],
  [0x03, 0x10, 0x00, 0x37, 0x00, 0x02, 0x04, 0x00, 0x00, 0x9C, 0x40, 0xD2, 0x15],
  [0x03, 0x06, 0x00, 0x4E, 0x00, 0x01, 0x29, 0xFF],
];

// 起伏 toggle
export function toggleFluctuate() {
  if (fluctuateSending) {
    fluctuateStop = true;
    fluctuateSending = false;
    console.log('[串口] 起伏停止');
  }else{
    fluctuateSending = true;
    fluctuateStop = false;
    console.log('[串口] 起伏启动');
  }
 
  fluctuateLoop();
}

async function fluctuateLoop() {
  try {
    while (fluctuateSending && !fluctuateStop) {
      for (let i = 0; i < 3 && !fluctuateStop; i++) {
        await sendCommand(FLUCTUATE_CMDS[i]);
        await waitSeconds(0.1);
      }
      await waitSeconds(23);
      for (let i = 3; i < 6 && !fluctuateStop; i++) {
        await sendCommand(FLUCTUATE_CMDS[i]);
        await waitSeconds(0.1);
      }
      await waitSeconds(23);
    }
  } catch (error) {
    console.error('发送过程出错:', error);
  } finally {
    fluctuateSending = false;
    fluctuateStop = false;
  }
}

// 停止所有串口指令
export function stopAllSerial() {
  feedStop = true; feedSending = false;
  aroundStop = true; aroundSending = false;
  fluctuateStop = true; fluctuateSending = false;
}
