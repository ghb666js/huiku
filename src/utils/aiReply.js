// ============================================================
// AI 回复：优先调用大模型，未配置 Key 时回退本地知识库
// 配置位置：src/constants/ai.js
// ============================================================
import { AI_READY, AI_USE_PROXY, AI_PROXY_API, AI_DIRECT } from '@/constants/ai';

// 知识库：命中任意关键词即返回对应答复，按顺序优先匹配
const KB = [
  {
    keys: ['你好', '您好', 'hello', 'hi', '在吗'],
    answer: '您好，我是钢板仓智能助手。可以询问料位、传感器、雷达监测、清堵机器人等问题。',
  },
  {
    keys: ['料位', '料仓', '库容', '仓内'],
    answer: '仓内料位信息可在「孪生健康监测」中查看。系统会实时显示平均料位高度，超过 27 米将触发爆仓风险预警。',
  },
  {
    keys: ['传感器', '监测', '异常', '应变', '沉降', '倾角'],
    answer: '传感器包括沉降仪、倾角计和应力计三类。异常分布可在「孪生健康监测 — 传感异常分布」中查看，也可按 01~16 层分层浏览。',
  },
  {
    keys: ['雷达', '料面', '形貌'],
    answer: '雷达形貌监测用于扫描仓内料面轮廓。进入「雷达形貌监测」模块后，点击雷达模型可打开详细页面。',
  },
  {
    keys: ['机器人', '清堵', '清灰', '廊道'],
    answer: '清堵机器人位于机器人廊道。在首页点击廊道上的悬浮标记即可进入机器人视角，通过遥控界面控制进给、左右、起伏三个动作。',
  },
  {
    keys: ['遥控', '进给', '左右', '起伏', '串口'],
    answer: '遥控界面支持连接设备下发指令：进给（往返 13 秒/单程）、左右（23 秒）、起伏（19 秒），两端各停顿 2 秒。未连接设备时仅执行仿真动画。',
  },
  {
    keys: ['数据孪生', '数字孪生', '孪生'],
    answer: '数字孪生平台可查看传感器状态的统计图表。点击「数据孪生平台」按钮即可进入全屏视图。',
  },
  {
    keys: ['健康', '评估', '安全'],
    answer: '仓体健康评估从倾角、沉降、应变三个维度综合计算健康状态，分为正常（绿）、预警（黄）、报警（橙）、危险（红）四级。',
  },
  {
    keys: ['流量', '装车', '对位', '计量'],
    answer: '对位流量监控包含科里奥利动态计量系统和自动装车引导对位系统，可查看设定料量、已装料量、装车时间，以及激光雷达点云图。',
  },
  {
    keys: ['统计', '订单', '销售', '生产'],
    answer: '灰库生产统计模块汇总订单记录，包括车牌、入厂时间、装车时间与物料名称等信息。',
  },
  {
    keys: ['帮助', '功能', '能做什么', '怎么用'],
    answer: '系统主要功能：孪生健康监测、雷达形貌监测、仓体健康评估、灰库生产统计、对位流量监控、数据孪生平台，以及清堵机器人遥控。',
  },
];

// 未命中时的兜底回复
const FALLBACK = [
  '抱歉，我暂时没有找到相关信息。您可以尝试询问：料位、传感器、雷达、清堵机器人等。',
  '这个问题我还需要进一步学习。目前我能回答钢板仓监测、传感器状态、机器人遥控等方面的问题。',
];

// 本地知识库回复（未配置 API Key 时使用）
export function localReply(text) {
  const q = String(text || '').toLowerCase();
  for (const item of KB) {
    if (item.keys.some((k) => q.includes(k.toLowerCase()))) {
      return item.answer;
    }
  }
  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
}

// ============================================================
// AI 回复统一入口：
//   已配置 Key → 调用大模型；未配置或调用失败 → 回退本地知识库
// history: [{ role: 'user' | 'assistant', text: string }]，可选，用于多轮上下文
// ============================================================
export async function reply(text, history = []) {
  if (!AI_READY) return localReply(text);
  try {
    const answer = AI_USE_PROXY
      ? await callProxy(text, history)
      : await callModel(text, history);
    return answer || localReply(text);
  } catch (e) {
    console.error('[AI] 调用失败，回退本地知识库:', e);
    return localReply(text);
  }
}

// 方式一：后端代理
async function callProxy(text, history) {
  const res = await fetch(AI_PROXY_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, history }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  return data.answer || data.content || '';
}

// 方式二：前端直连（OpenAI 兼容格式）
async function callModel(text, history) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_DIRECT.timeout);

  // 组装多轮消息
  const messages = [{ role: 'system', content: AI_DIRECT.systemPrompt }];
  history.slice(-6).forEach((m) => {
    messages.push({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    });
  });
  messages.push({ role: 'user', content: text });

  try {
    const res = await fetch(AI_DIRECT.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_DIRECT.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_DIRECT.model,
        messages,
        temperature: AI_DIRECT.temperature,
        max_tokens: AI_DIRECT.maxTokens,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status} ${errText}`);
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || '';
  } finally {
    clearTimeout(timer);
  }
}
