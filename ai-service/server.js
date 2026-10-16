// ============================================================
// AI 助手代理服务（独立部署版）
// 仅依赖 express / cors / dotenv，不依赖数据库、串口等内网资源，
// 可单独部署到公网服务器，由前端直接调用。
//
// 启动：node server.js
// 配置：同目录 .env（见 .env.example）
// ============================================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const PORT = Number(process.env.PORT) || 3003;

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'deepseek-chat';
const AI_SYSTEM_PROMPT =
  process.env.AI_SYSTEM_PROMPT ||
  '你是"大型钢板仓灰库数字孪生健康管理系统"的智能助手。' +
  '请用简体中文、简洁专业地回答用户关于料位、传感器（沉降/倾角/应力）、' +
  '雷达形貌监测、清堵机器人遥控、仓体健康评估、生产统计、对位流量监控等问题。' +
  '回答控制在 100 字以内。';

// 允许跨域的来源，多个用逗号分隔；默认 *（生产建议改成前端实际域名，如 https://your-domain.com）
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',') }));
app.use(express.json({ limit: '1mb' }));

// ============================================================
// AI 对话接口
// 请求体：{ message: string, history?: [{ role, text }] }
// 响应：  { answer: string }
// ============================================================
app.post('/api/ai/chat', async (req, res) => {
  if (!AI_API_KEY) {
    return res.status(503).json({ error: '服务端未配置 AI_API_KEY' });
  }

  const { message, history } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: '缺少 message 参数' });
  }

  // 组装多轮消息
  const messages = [{ role: 'system', content: AI_SYSTEM_PROMPT }];
  (Array.isArray(history) ? history.slice(-6) : []).forEach((m) => {
    messages.push({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    });
  });
  messages.push({ role: 'user', content: message });

  try {
    const aiRes = await fetch(AI_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('❌ AI 接口返回错误:', aiRes.status, errText);
      return res.status(502).json({ error: `AI 接口错误 ${aiRes.status}` });
    }

    const data = await aiRes.json();
    const answer = data?.choices?.[0]?.message?.content?.trim() || '';
    res.json({ answer });
  } catch (error) {
    console.error('❌ AI 代理请求失败:', error.message);
    res.status(500).json({ error: 'AI 代理请求失败', message: error.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI 助手代理服务',
    ai: AI_API_KEY ? 'configured' : 'not configured',
    model: AI_MODEL,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('✅ AI 助手服务启动成功！');
  console.log(`📡 监听地址: http://localhost:${PORT}`);
  console.log(`   健康检查: http://localhost:${PORT}/api/health`);
  console.log(`   对话接口: POST http://localhost:${PORT}/api/ai/chat`);
  console.log(`   跨域来源: ${CORS_ORIGIN}`);
  console.log(`   AI Key  : ${AI_API_KEY ? '已配置' : '❌ 未配置（请在 .env 填 AI_API_KEY）'}`);
  console.log(`   模型    : ${AI_MODEL}`);
  console.log('========================================\n');
});
