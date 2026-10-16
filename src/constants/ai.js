// ============================================================
// AI 助手配置
// ============================================================
import { AI_SERVER } from './api';

/* ------------------------------------------------------------
 * 【方式一 · 推荐】走后端代理
 * AI 为独立服务（sourceSet/ai-service），可单独部署到公网，
 * API Key 保存在该服务端环境变量里，前端不接触 Key，安全。
 * ------------------------------------------------------------ */
export const AI_USE_PROXY = true                // 改成 true 即启用后端代理
// 跟随 AI_SERVER 的地址与端口（见 constants/api.js）
export const AI_PROXY_API = `${AI_SERVER}/api/ai/chat`

/* ------------------------------------------------------------
 * 【方式二】前端直连大模型
 * 直接填 API Key。注意：打包后 Key 会出现在 JS 文件里，
 * 任何人都能从浏览器拿到，仅适用于内网/演示环境。
 * ------------------------------------------------------------ */
export const AI_DIRECT = {
  // 接口地址（OpenAI 兼容格式均可）
  //   DeepSeek : https://api.deepseek.com/v1/chat/completions
  //   阿里通义 : https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
  //   智谱GLM  : https://open.bigmodel.cn/api/paas/v4/chat/completions
  //   OpenAI   : https://api.openai.com/v1/chat/completions
  baseURL: 'https://api.deepseek.com/v1/chat/completions',

  // ★ 在这里填入你的 API Key（也可以用下面的环境变量方式）
  apiKey: '',

  // 模型名称
  model: 'deepseek-chat',

  // 系统提示词：限定 AI 的角色与回答范围
  systemPrompt:
    '你是"大型钢板仓灰库数字孪生健康管理系统"的智能助手。' +
    '请用简体中文、简洁专业地回答用户关于料位、传感器（沉降/倾角/应力）、' +
    '雷达形貌监测、清堵机器人遥控、仓体健康评估、生产统计、对位流量监控等问题。' +
    '回答控制在 100 字以内。',

  temperature: 0.7,
  maxTokens: 500,
  timeout: 30000, // 超时(ms)
}

/* ------------------------------------------------------------
 * API Key 也可以通过环境变量注入（优先级更高，不写进代码）
 * 在项目根目录新建 .env.local 文件，内容：
 *   VUE_APP_AI_API_KEY=sk-xxxxxxxx
 * ------------------------------------------------------------ */
if (process.env.VUE_APP_AI_API_KEY) {
  AI_DIRECT.apiKey = process.env.VUE_APP_AI_API_KEY
}
if (process.env.VUE_APP_AI_BASE_URL) {
  AI_DIRECT.baseURL = process.env.VUE_APP_AI_BASE_URL
}
if (process.env.VUE_APP_AI_MODEL) {
  AI_DIRECT.model = process.env.VUE_APP_AI_MODEL
}

// 是否已配置可用的 Key
export const AI_READY = AI_USE_PROXY || !!AI_DIRECT.apiKey
