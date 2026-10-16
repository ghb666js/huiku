// ============================================================
// 统一接口地址配置
// 所有模块的请求地址统一从此处引用，便于集中维护与切换环境
// ============================================================

/* ========== 服务基地址 ========== */
export const NODE_SERVER = 'http://localhost:3000'          // 本地 Node 综合数据服务(电厂内部本地部署)
export const AI_SERVER = 'http://127.0.0.1:3003'             // AI 助手服务（独立部署，见 ai-service）
export const REMOTE_SERVER = 'http://47.97.3.132'            // 远程数据服务
export const RADAR_SERVER = 'http://192.168.1.120:33490'     // 雷达设备服务

/* ========== WebSocket ========== */
export const WS_FLOW = 'ws://localhost:3002/flow'            // 流量监控实时推送

/* ========== 本地服务 - 固定接口 ========== */
export const API_INSERT = `${NODE_SERVER}/api/insert`        // 数据插入
export const API_HEALTH = `${NODE_SERVER}/api/health`        // 健康检查
export const API_COM_PORTS = `${NODE_SERVER}/api/com-ports`  // 串口列表
export const API_ORDER = `${NODE_SERVER}/api/order`          // 订单代理
export const API_VIDEO = `${NODE_SERVER}/api/video`          // 对位视频流
export const API_IMG = `${NODE_SERVER}/api/img`              // 处理前/后图片
export const API_PLC = `${NODE_SERVER}/api/plc`              // PLC 数据

/* ========== 查询接口构造器 ========== */
// 本地服务查询（表名动态）
export const queryUrl = (table, limit = 20) => `${NODE_SERVER}/api/query/${table}?limit=${limit}`
// 远程服务查询（表名动态）
export const remoteQueryUrl = (table, limit = 20) => `${REMOTE_SERVER}/api/query/${table}?limit=${limit}`

/* ========== 远程服务 - 具体数据查询 ========== */
export const REMOTE_QUERY_DATA = remoteQueryUrl('data', 5000)                 // 原始传感器数据
export const REMOTE_QUERY_SETTLEMENT = remoteQueryUrl('settlementstatus', 7)  // 沉降状态
export const REMOTE_QUERY_TILT = remoteQueryUrl('tiltstatus', 8)              // 倾角状态
export const REMOTE_QUERY_STRAIN = remoteQueryUrl('strainstatus', 197)        // 应变状态

/* ========== 本地服务 - 具体数据查询 ========== */
export const LOCAL_QUERY_SETTLEMENT = queryUrl('settlementstatus', 7)         // 沉降状态
export const LOCAL_QUERY_TILT = queryUrl('TiltStatus', 8)                     // 倾角状态
export const LOCAL_QUERY_STRAIN = queryUrl('strainStatus', 197)               // 应变状态
export const LOCAL_QUERY_ORDER = queryUrl('neworderrecorddata', 2000)         // 订单记录

/* ========== 雷达设备接口 ========== */
export const RADAR_SURFACE = `${RADAR_SERVER}/api/result_data/surface?tank_id=1&mode=round` // 料面数据
export const RADAR_DETAIL = `${RADAR_SERVER}/app-detail/1`                                  // 雷达详情页
