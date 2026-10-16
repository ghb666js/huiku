<template>
  <div class="query-history-container">
    <!-- 查询条件区域 -->
    <div class="query-section">
      <div class="query-title">查询条件</div>

      <div class="query-row">
        <span class="query-label">开始日期：</span>
        <div class="date-group">
          <input type="date" class="date-input" v-model="queryParams.startDate" style="width: 150px;">
          <span class="date-separator">结束日期：</span>
          <input type="date" class="date-input" v-model="queryParams.endDate" style="width: 150px;">
          <span class="query-label">传感器ID：</span>
          <input type="text" class="query-input" v-model="queryParams.sensorId" placeholder="请输入传感器ID">
          <span class="query-label">安装位置：</span>
          <input type="text" class="query-input" v-model="queryParams.installPosition" placeholder="请输入安装位置">
        </div>
      </div>

      <div class="button-row">
        <button class="btn" @click="queryData">查询</button>
        <button class="btn" @click="clearData">清空</button>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-section">
      <div class="stats-info">{{ statsInfo }}</div>
      <div class="table-content">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-time">采集时间</th>
              <th class="col-addr">解调器地址</th>
              <th class="col-type">解调器类型</th>
              <th class="col-id">传感器ID</th>
              <th class="col-pos">安装位置</th>
              <th class="col-channel">通道号</th>
              <th class="col-sensor">传感器类型</th>
              <th class="col-temp">温度(℃)</th>
              <th class="col-humidity">湿度(%)</th>
              <th class="col-freq">频率(Hz)</th>
              <th class="col-strain">应变值(με)</th>
              <th class="col-settle">沉降值(mm)</th>
              <th class="col-tiltx">X向倾角(°)</th>
              <th class="col-tilty">Y向倾角(°)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length === 0">
              <td colspan="14" style="text-align: center; color: #999; padding: 20px;">暂无数据</td>
            </tr>
            <tr v-for="(row, index) in filteredData" :key="index">
              <td>{{ row["采集时间"] }}</td>
              <td>{{ row["解调仪地址"] }}</td>
              <td>{{ row["解调仪类型"] }}</td>
              <td>{{ row["传感器ID"] }}</td>
              <td>{{ row["安装位置"] }}</td>
              <td>{{ row["通道号"] }}</td>
              <td>{{ row["传感器类型"] }}</td>
              <td>{{ row["温度(°C)"] }}</td>
              <td>{{ row["湿度(%)"] }}</td>
              <td>{{ row["频率(Hz)"] }}</td>
              <td>{{ row["应变值(με)"] }}</td>
              <td>{{ row["沉降值(mm)"] }}</td>
              <td>{{ row["X向倾角(°)"] }}</td>
              <td>{{ row["Y向倾角(°)"] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { queryUrl } from '@/constants/api';
export default {
  name: 'queryHistory',
  data() {
    return {
      queryParams: {
        startDate: '',
        endDate: '',
        sensorId: '',
        installPosition: ''
      },
      allData: [],
      filteredData: [],
      statsInfo: '请输入查询条件并点击查询按钮',
      isLoading: false
    };
  },
  methods: {
    async queryData() {
      const { startDate, endDate, sensorId, installPosition } = this.queryParams;

      // 验证输入
      if (!startDate || !endDate) {
        alert('请输入开始日期和结束日期');
        return;
      }

      // 解析日期
      const parseDate = (dateStr) => {
        const parts = dateStr.split('-');
        return new Date(parts[0], parts[1] - 1, parts[2]);
      };
      const start = parseDate(startDate);
      start.setHours(0, 0, 0, 0);
      const end = parseDate(endDate);
      end.setHours(23, 59, 59, 999);

      if (start > end) {
        alert('开始日期不能大于结束日期');
        return;
      }

      this.isLoading = true;
      this.statsInfo = '正在查询数据...';

      try {
        // 获取历史数据
        const historyData = await this.getHistoryData('data', 12840);
        this.allData = historyData;

        // 筛选数据
        this.filteredData = historyData.filter(item => {
          // 解析 '2025-11-15-08:07' 格式
          const parseCustomDate = (dateStr) => {
            const parts = dateStr.split('-');
            return new Date(parts[0], parts[1] - 1, parts[2], parts[3].split(':')[0], parts[3].split(':')[1]);
          };
          const itemDate = parseCustomDate(item["采集时间"]);
          const dateMatch = itemDate >= start && itemDate <= end;

          let sensorMatch = true;
          if (sensorId) {
            sensorMatch = String(item["传感器ID"]).includes(sensorId);
          }

          let positionMatch = true;
          if (installPosition) {
            positionMatch = item["安装位置"].includes(installPosition);
          }

          return dateMatch && sensorMatch && positionMatch;
        });

        this.statsInfo = `共查询到 ${this.filteredData.length} 条数据`;
      } catch (error) {
        console.error('查询数据失败:', error);
        this.statsInfo = `查询失败: ${error.message}`;
        this.filteredData = [];
      } finally {
        this.isLoading = false;
      }
    },

    clearData() {
      // 清空查询条件
      this.queryParams = {
        startDate: '',
        endDate: '',
        sensorId: '',
        installPosition: ''
      };
      // 清空数据
      this.filteredData = [];
      this.statsInfo = '请输入查询条件并点击查询按钮';
    },

    async getHistoryData(tableName, limit) {
      try {
        // 参数校验
        if (!tableName || typeof tableName !== 'string') {
          throw new Error('表名必须是有效的字符串');
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100000) {
          throw new Error('limit 必须是 1-10000 之间的整数');
        }

        const res = await fetch(queryUrl(tableName, limit));

        if (!res.ok) {
          throw new Error(`HTTP 错误: ${res.status}`);
        }

        const result = await res.json();
        const data = result.data || [];

        return data;

      } catch (err) {
        console.error('获取历史数据错误:', err);
        throw err;
      }
    }
  }
};
</script>

<style scoped>
.query-history-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75vw;
  padding: 1vw;
  overflow-y: auto;
  box-sizing: border-box;
}

.query-section {
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.6);
  padding: 0.75vw;
  border-radius: 6px;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

.query-title {
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.75vw;
  font-size: 0.7vw;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.query-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.6vw;
  gap: 0.75vw;
  flex-wrap: wrap;
}

.query-row:last-child {
  margin-bottom: 0;
}

.query-label {
  width: 4vw;
  text-align: right;
  color: #ffffff;
  flex-shrink: 0;
  font-size: 0.7vw;
}

.query-input {
  flex: 1;
  min-width: 7.5vw;
  height: 3.5vh;
  border: 1px solid rgba(0, 140, 255, 0.6);
  padding: 0.1vw 0.5vw;
  font-size: 0.7vw;
  background-color: rgba(0, 30, 60, 0.8);
  color: #ffffff;
  border-radius: 4px;
}

.date-group {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 0.5vw;
  flex-wrap: wrap;
}

.date-input {
  width: 7.5vw;
  height: 3.5vh;
  border: 1px solid rgba(0, 140, 255, 0.6);
  padding: 0.1vw 0.5vw;
  font-size: 0.7vw;
  background-color: rgba(0, 30, 60, 0.8);
  color: #ffffff;
  border-radius: 4px;
}

.date-separator {
  color: #ffffff;
  font-size: 0.7vw;
}

.button-row {
  display: flex;
  justify-content: flex-start;
  gap: 0.75vw;
  margin-top: 0.75vw;
  padding-top: 0.75vw;
  border-top: 1px solid rgba(0, 140, 255, 0.4);
}

.btn {
  height: 3.5vh;
  padding: 0 1vw;
  font-size: 0.7vw;
  cursor: pointer;
  border: 1px solid rgba(0, 140, 255, 0.6);
  background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
  color: #ffffff;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.btn:hover {
  background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
  border-color: rgba(0, 140, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 140, 255, 0.4);
  transform: translateY(-1px);
}

.btn:active {
  background: linear-gradient(180deg, #004499 0%, #003366 100%);
  transform: translateY(0);
}

.table-section {
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-content {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7vw;
  white-space: nowrap;
}

.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 横向滚动条样式 */
.table-content::-webkit-scrollbar {
  width: 0.4vw;
  height: 0.4vw;
}

.table-content::-webkit-scrollbar-track {
  background: rgba(0, 40, 80, 0.5);
  border-radius: 4px;
}

.table-content::-webkit-scrollbar-thumb {
  background: rgba(0, 140, 255, 0.6);
  border-radius: 4px;
}

.table-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 140, 255, 0.8);
}

.data-table th {
  background: linear-gradient(180deg, rgba(0, 60, 120, 0.8) 0%, rgba(0, 40, 80, 0.8) 100%);
  border: 1px solid rgba(0, 140, 255, 0.4);
  padding: 0.4vw 0.6vw;
  text-align: center;
  font-weight: normal;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  border: 1px solid rgba(0, 140, 255, 0.2);
  padding: 0.4vw 0.6vw;
  text-align: center;
  color: #ffffff;
  background-color: rgba(0, 30, 60, 0.6);
}

.data-table tr:nth-child(even) td {
  background-color: rgba(0, 30, 60, 0.8);
}

.data-table tr:hover td {
  background-color: rgba(0, 50, 100, 0.8);
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

.stats-info {
  padding: 0.5vw 0.75vw;
  border-bottom: 1px solid rgba(0, 140, 255, 0.4);
  font-size: 0.7vw;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
  flex-shrink: 0;
}

/* 列宽控制 */
.col-time {
  min-width: 8vw;
}

.col-addr {
  min-width: 6vw;
}

.col-type {
  min-width: 5.5vw;
}

.col-id {
  min-width: 4.5vw;
}

.col-pos {
  min-width: 6.5vw;
}

.col-channel {
  min-width: 3.5vw;
}

.col-sensor {
  min-width: 5vw;
}

.col-temp {
  min-width: 4vw;
}

.col-humidity {
  min-width: 3.5vw;
}

.col-freq {
  min-width: 4.5vw;
}

.col-strain {
  min-width: 5vw;
}

.col-settle {
  min-width: 5vw;
}

.col-tiltx {
  min-width: 5vw;
}

.col-tilty {
  min-width: 5vw;
}

/* 滚动条样式 */
.query-history-container::-webkit-scrollbar {
  width: 8px;
}

.query-history-container::-webkit-scrollbar-track {
  background: rgba(0, 40, 80, 0.5);
  border-radius: 4px;
}

.query-history-container::-webkit-scrollbar-thumb {
  background: rgba(0, 140, 255, 0.6);
  border-radius: 4px;
}

.query-history-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 140, 255, 0.8);
}

/* 日期选择器样式 */
input[type="date"] {
  font-family: "Microsoft YaHei", sans-serif;
  padding: 2px 10px;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(1) hue-rotate(180deg);
}

/* 响应式调整 */
@media (max-width: 39.2vw) {
  .query-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5vw;
  }
  
  .query-label {
    width: 100%;
    text-align: left;
  }
  
  .date-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  
  .date-input {
    width: 100%;
  }
}
</style>