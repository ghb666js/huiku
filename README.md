# 大型钢板仓灰库数字孪生健康管理系统

基于 **Vue 2 + Three.js** 的火电厂钢板仓（灰库）三维数字孪生平台，集成传感器健康监测、雷达形貌扫描、清堵机器人遥控、对位流量监控等业务模块。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 2.7 + Vue Router 3 + Vuex 3 |
| 三维渲染 | Three.js 0.151（GLTF/DRACO 加载、后处理抗锯齿、CSS3D 标签） |
| UI / 图表 | Element UI 2.15、ECharts 4.9 |
| 数据交互 | Axios、Fetch、WebSocket、Web Serial API |
| 后端服务 | Node.js + Express + MySQL（`ai-service/` 为独立 AI 代理服务） |

---

## 功能模块

右侧栏 `bigControl` 提供 8 个可切换模块：

| 模块 | 说明 |
|------|------|
| 科创项目简介 | 回到默认视角，显示项目侧拉框与机器人廊道标记 |
| 灰库运行工艺 | 播放模型工艺流程动画（`run*` 系列动画循环） |
| 系统功能配置 | 传感端口配置、设备电源控制（Web Serial 下发 Modbus 指令） |
| 孪生健康监测 | 即采数据显示、历史数据查询、传感异常分布、传感器分层浏览 |
| 雷达形貌监测 | 相机飞向雷达、雷达波形动效、点击跳转雷达详情页 |
| 仓体健康评估 | 倾角/沉降/应变三维度健康环评估 + 料位库容显示与预警 |
| 灰库生产统计 | 订单记录统计与图表分析 |
| 对位流量监控 | 科里奥利动态计量、自动装车引导对位（视频流 + 点云图） |

此外还有：

- **清堵机器人遥控**：点击场景中「机器人廊道」上的悬浮标记进入机器人视角，通过遥控界面对进给/左右/起伏三个机构下发指令
- **AI 助手**：右下角可拖拽的悬浮圆钮，支持自然语言问答（大模型 + 本地知识库降级）
- **数字孪生全屏**：左右状态栏形式的传感器总览界面

---

## 项目结构

```
├── ai-service/                  # AI 代理服务（可独立部署，不依赖数据库/串口）
│   ├── server.js
│   ├── package.json
│   └── .env                     # AI_API_KEY 等配置（已 gitignore）
├── public/
│   ├── model/store.glb          # 主场景模型
│   ├── draco/                   # DRACO 解码器
│   └── textures/                # HDR 环境贴图
├── src/
│   ├── views/
│   │   ├── HomeView.vue         # 主场景（初始化 Three.js、渲染循环、事件中枢）
│   │   └── bigControl.vue       # 右侧功能模块切换栏
│   ├── pages/                   # 业务面板（相对较重，独立目录）
│   │   ├── monitorH.vue         # 孪生健康监测
│   │   ├── healthyAssess.vue    # 仓体健康评估
│   │   ├── deviceControl.vue    # 系统功能配置
│   │   ├── saleAnalyse.vue      # 灰库生产统计
│   │   ├── flowMonitoring.vue   # 对位流量监控
│   │   └── drawerT.vue          # 项目简介侧拉框
│   ├── components/              # 通用组件
│   │   ├── aiAssistant.vue      # AI 助手悬浮窗
│   │   ├── controlBtn.vue       # 机器人遥控界面
│   │   ├── digitalTwin.vue      # 数字孪生全屏界面
│   │   ├── generalButton.vue    # 通用按钮组
│   │   ├── layer.vue            # 分层选择器
│   │   ├── showText.vue         # 悬停提示
│   │   └── subcomponets/        # 二级子组件
│   ├── three/                   # Three.js 逻辑
│   │   ├── ZThree.js            # 场景/相机/渲染器/控制器/相机动画基类
│   │   ├── loaderModel.js       # 模型加载与材质处理
│   │   ├── robot.js             # 清堵机器人（标记、遥控动画、视角切换）
│   │   ├── sensorLayers.js      # 传感器分层浏览与状态着色
│   │   ├── parkRadar.js         # 雷达形貌监测
│   │   ├── cartoon.js           # 工艺流程动画
│   │   ├── reprocessing.js      # 后处理管线（边缘高亮 + FXAA）
│   │   ├── cssRender.js         # CSS3D 场景标签
│   │   └── material.js          # 统一材质管理
│   ├── utils/
│   │   ├── aiReply.js           # AI 回复（大模型优先，本地知识库降级）
│   │   ├── serialControl.js     # Web Serial 串口指令下发
│   │   └── generalfunction.js   # 通用数据方法
│   ├── constants/
│   │   ├── api.js               # 统一接口地址配置
│   │   └── ai.js                # AI 助手配置
│   ├── router/                  # 路由
│   ├── store/                   # Vuex
│   ├── bus.js                   # 全局事件总线
│   └── App.vue                  # 根组件（标题、时钟、全局弹窗）
└── vue.config.js
```

---

## 快速开始

### 前端

```bash
npm install
npm run serve      # 开发（默认 8080）
npm run build      # 生产构建，产物在 dist/
```

> ⚠️ `vue.config.js` 中配置了 `hot: false, liveReload: false`，改动代码后需**手动重启 dev server 并强制刷新浏览器**（`Ctrl + Shift + R`）。

### AI 助手服务（独立）

```bash
cd ai-service
cp .env.example .env        # 首次需手动创建并填写 AI_API_KEY
npm install
npm start                   # 默认 3003
```

### 主数据服务

`sourceSet/server.js`（若存在于内网部署环境）：提供 MySQL 数据查询/插入、订单代理、串口列表等接口。

```bash
cd sourceSet
npm install
npm start
```

---

## 接口配置

所有接口地址集中在 [src/constants/api.js](src/constants/api.js)，改一处全局生效：

```js
export const NODE_SERVER   = 'http://localhost:3000'      // 本地数据服务（电厂内网）
export const AI_SERVER     = 'http://127.0.0.1:3003'      // AI 助手服务
export const REMOTE_SERVER = 'http://47.97.3.132'         // 远程数据服务
export const RADAR_SERVER  = 'http://192.168.1.120:33490' // 雷达设备服务

export const WS_FLOW = 'ws://localhost:3002/flow'         // 流量监控 WebSocket
```

> **注意**：`127.0.0.1` / `localhost` 在**浏览器中指向运行浏览器的电脑**。若前端部署在服务器上由其他机器访问，必须改成服务器的实际 IP 或走 Nginx 反向代理（此时填 `''` 使用相对路径）。

### 环境切换建议

| 场景 | NODE_SERVER | AI_SERVER |
|------|-------------|-----------|
| 本机开发 | `http://localhost:3000` | `http://127.0.0.1:3003` |
| 局域网部署 | `http://192.168.x.x:3000` | `http://192.168.x.x:3003` |
| Nginx 反代 | `''`（相对路径） | `''`（相对路径） |

---

## AI 助手

### 配置：[src/constants/ai.js](src/constants/ai.js)

支持两种接入方式：

**方式一 · 走后端代理（推荐）**

```js
export const AI_USE_PROXY = true
```

API Key 保存在 `ai-service/.env`，前端不接触密钥。

**方式二 · 前端直连**

```js
export const AI_USE_PROXY = false
export const AI_DIRECT = { apiKey: 'sk-xxx', ... }
```

> ⚠️ 方式二的 Key 会打包进 JS 文件，任何人可从前端获取，**仅适合内网/演示**。

### 支持的模型服务

均为 OpenAI 兼容格式，改 `baseURL` 即可：

| 服务 | baseURL |
|------|---------|
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` |
| 阿里通义 | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4/chat/completions` |
| OpenAI | `https://api.openai.com/v1/chat/completions` |

### 降级机制

[src/utils/aiReply.js](src/utils/aiReply.js) 的 `reply()` 是统一入口：

- 已配置 Key → 调用大模型（自动携带最近 6 轮上下文）
- 未配置 Key 或调用失败 → **自动回退本地知识库**，不会白屏报错

### ai-service 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/chat` | 对话，请求 `{ message, history }`，返回 `{ answer }` |
| GET | `/api/health` | 健康检查 |

---

## 串口遥控

[src/utils/serialControl.js](src/utils/serialControl.js) 基于 **Web Serial API**（波特率 38400），由浏览器直接向串口设备下发 Modbus 指令，采用 toggle 结构（同一按钮切换启动/停止）。

| 指令组 | 周期 | 说明 |
|--------|------|------|
| 进给（0x01） | 17s | 往返一个行程 |
| 左右（0x02） | 27s | 左右摆动一个周期 |
| 起伏（0x03） | 23s | 上下起伏一个周期 |

**未连接设备时**，遥控按钮仅播放三维仿真动画，不下发任何指令；连接后动画与指令同步。

---

## 三维场景要点

### 相机与渲染

- 场景初始化封装在 [ZThree.js](src/three/ZThree.js) 的 `initThree()`
- 后处理管线 [reprocessing.js](src/three/reprocessing.js)：`RenderPass → OutlinePass(按需) → FXAA`
- **动态像素比**：静止时 `min(devicePixelRatio, 3)` 保证清晰，交互（拖动/缩放）时降至 `1.5` 保证流畅

### 射线拾取注意事项

Three.js 的 `Raycaster.intersectObject` **只检查 `layers`，不检查 `object.visible`**。因此「隐藏后不应被点击」的物体（如机器人标记），必须在点击回调中显式判断 `visible`，或将其移出拾取范围。

### 机器人控制节点

| 节点名 | 作用 |
|--------|------|
| `机器人廊道` | 悬浮标记锚点，点击进入机器人视角 |
| `清灰机器人` | 机器人模型，未进入视角时隐藏 |
| `进退键` | 进给机构，由 `go` / `back` 动画驱动 |
| `左右键` | 左右机构，由 `right` / `left` 动画驱动 |
| `起伏键` | 起伏机构，由 `up` / `down` 动画驱动 |

动画播放采用 TWEEN 插值实现「端点往复 + 两端停顿 2 秒」，停止时完成当前行程后回到零点。

---

## Blender 建模规范

模型命名直接决定前端能否正确识别，务必遵守。

### 命名约定

| 模型 | 命名要求 | 前端用途 |
|------|----------|----------|
| 钢板库 | 名称含 `钢板库` | 应用纹理重复（repeat 2.8）、单独材质处理 |
| 半库 | 名称含 `半库` | 默认隐藏 |
| 雷达 | 名称含 `雷达` | 雷达形貌监测的可交互目标 |
| 机器人廊道 | 精确名称 | 生成机器人入口标记 |
| 清灰机器人 | 精确名称 | 机器人模型本体 |
| 进退键 / 左右键 / 起伏键 | 精确名称 | 三个遥控机构的动画载体（**空物体**） |
| 支撑 | 名称含 `支撑` | 进入机器人视角时隐藏 |

### 动画导出

每个动作需 **Push Down 到独立的 NLA 轨道**，导出 GLB 时选择 NLA Tracks 模式，使每个动作成为独立的 `AnimationClip`：

- `go` / `back` —— 进退机构往返
- `left` / `right` —— 左右机构摆动
- `up` / `down` —— 起伏机构升降
- `run*` —— 工艺流程动画（名称含 `run` 的会被一起循环播放）

### 建模注意事项

1. **修改器要「应用」** —— 阵列、镜像等修改器未应用时，效果只存在于 Blender 内，导出后丢失
2. **控制烘焙** —— 使用约束（IK、驱动器）制作的动画导出前需「烘焙动作」，否则 GLB 中不生效
3. **简化模型** —— 引入外部复杂模型时建议减面，控制总面数（当前场景约 200 万面，已属偏高）
4. **命名统一** —— 中文命名需与前端约定保持一致，避免出现同义词

---

## 部署

### 前端

```bash
npm run build
# 将 dist/ 部署到 Nginx / 静态服务器
```

Nginx 需为 SPA history 路由配置回退：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### AI 服务

`ai-service/` 只依赖 `express` / `cors` / `dotenv`，**不含数据库和原生模块**，可直接部署到公网服务器：

```bash
cd ai-service
cp .env.example .env     # 填写 AI_API_KEY
npm install --production
pm2 start server.js --name huiku-ai
```

配套 Nginx 反向代理（注意结尾的斜杠）：

```nginx
location /api/ai/ {
    proxy_pass http://127.0.0.1:3003;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 60s;      # AI 响应较慢，勿低于 60s
}
```

> nginx 的 location 按**最长前缀**匹配，`/api/ai/` 会优先于 `/api/`，两者可以共存。

---

## 常见问题

**Q：改了代码页面没变化？**
`vue.config.js` 关闭了热更新，需重启 dev server 并 `Ctrl + Shift + R` 强刷。

**Q：AI 对话提示 `ERR_CONNECTION_TIMED_OUT`？**
依次检查：① `AI_SERVER` 地址是否正确（别用 `localhost` 做远程访问）；② 服务是否启动；③ 服务器防火墙 / 云安全组是否放行端口。

**Q：健康评估等面板数据全是「断开连接」？**
说明数据服务不可达，检查 `NODE_SERVER` 地址与后端运行状态。前端已做降级，不会崩溃。

**Q：场景中误点到隐藏的机器人标记？**
Three.js 射线拾取不忽略 `visible`，已在 `robot.js` 的点击回调中显式判断。
