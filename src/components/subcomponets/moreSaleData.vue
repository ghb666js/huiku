<template>
  <div v-if="visible" class="more-info-dialog">
    <div class="more-info-content">
      <div class="more-info-header">
        <h3>更多销售信息</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="more-info-body">
        <!-- 时间筛选框 -->
        <div class="filter-bar">
          <div class="filter-item">
            <label>年份:</label>
            <select v-model="selectedYear" @change="filterData">
              <option value="">全部</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="filter-item">
            <label>月份:</label>
            <select v-model="selectedMonth" @change="filterData">
              <option value="">全部</option>
              <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
            </select>
          </div>
          <button class="reset-btn" @click="resetFilter">重置筛选</button>
        </div>
        <table class="more-info-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>订单号</th>
              <th>车牌</th>
              <th>入厂时间</th>
              <th>空车称重时间</th>
              <th>库底装车时间</th>
              <th>满车称重时间</th>
              <th>出厂时间</th>
              <th>物料名称</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredData" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ row.订单号 }}</td>
              <td>{{ row.车牌 }}</td>
              <td>{{ row.入厂时间 }}</td>
              <td>{{ row.空车称重时间 }}</td>
              <td>{{ row.库底装车时间 }}</td>
              <td>{{ row.满车称重时间 }}</td>
              <td>{{ row.出厂时间 }}</td>
              <td>{{ row.物料名称 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'moreSaleData',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const currentDate = new Date();
    return {
      selectedYear: currentDate.getFullYear().toString(),
      selectedMonth: String(currentDate.getMonth() + 1).padStart(2, '0'),
      filteredData: [],
      years: this.getYears(),
      months: [
        { value: '01', label: '1月' },
        { value: '02', label: '2月' },
        { value: '03', label: '3月' },
        { value: '04', label: '4月' },
        { value: '05', label: '5月' },
        { value: '06', label: '6月' },
        { value: '07', label: '7月' },
        { value: '08', label: '8月' },
        { value: '09', label: '9月' },
        { value: '10', label: '10月' },
        { value: '11', label: '11月' },
        { value: '12', label: '12月' }
      ]
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.filteredData = this.data;
        this.filterData();
      }
    },
    data(newVal) {
      if (this.visible) {
        this.filteredData = newVal;
        this.filterData();
      }
    }
  },
  methods: {
    getYears() {
      const currentYear = new Date().getFullYear();
      const years = [];
      // 获取数据中所有的年份
      const dataYears = [...new Set(this.data.map(item => {
        const date = new Date(item.入厂时间);
        return date.getFullYear().toString();
      }))];
      // 合并并排序年份
      const allYears = [...new Set([currentYear.toString(), currentYear - 1, ...dataYears])];
      return allYears.sort((a, b) => b - a);
    },
    filterData() {
      let result = [...this.data];
      
      if (this.selectedYear) {
        result = result.filter(item => {
          const date = new Date(item.入厂时间);
          return date.getFullYear().toString() === this.selectedYear;
        });
      }
      
      if (this.selectedMonth) {
        result = result.filter(item => {
          const date = new Date(item.入厂时间);
          return String(date.getMonth() + 1).padStart(2, '0') === this.selectedMonth;
        });
      }
      
      this.filteredData = result;
    },
    resetFilter() {
      const currentDate = new Date();
      this.selectedYear = currentDate.getFullYear().toString();
      this.selectedMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      this.filterData();
    },
    close() {
      this.$emit('close');
    }
  },
  mounted() {
    if (this.visible) {
      this.filterData();
    }
  }
};
</script>

<style lang="less" scoped>
.more-info-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.more-info-content {
  width: 90%;
  max-width: 1200px;
  height: 80%;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 30, 60, 0.95));
  border: 1px solid rgba(64, 158, 255, 0.6);
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.5);
  display: flex;
  flex-direction: column;
}

.more-info-header {
  padding: 1vw;
  border-bottom: 1px solid rgba(64, 158, 255, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(0, 60, 120, 0.8), rgba(0, 40, 80, 0.9));
  border-radius: 8px 8px 0 0;

  h3 {
    margin: 0;
    font-size: 1.4vw;
    color: rgba(255, 255, 255, 1);
    text-shadow: 0 0 0.4vw rgba(64, 158, 255, 0.8);
  }

  .close-btn {
    width: 2vw;
    height: 2vw;
    background: rgba(64, 158, 255, 0.2);
    border: 1px solid rgba(64, 158, 255, 0.6);
    border-radius: 0.2vw;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.4vw;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(64, 158, 255, 0.4);
      box-shadow: 0 0 0.5vw rgba(64, 158, 255, 0.6);
    }
  }
}

.more-info-body {
  flex: 1;
  padding: 1vw;
  overflow: auto;
}

/* 时间筛选框样式 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1vw;
  padding: 0.8vw;
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(64, 158, 255, 0.4);
  border-radius: 6px;
  margin-bottom: 1vw;
  flex-wrap: wrap;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 0.5vw;

    label {
      font-size: 0.85vw;
      color: rgba(255, 255, 255, 0.8);
      font-weight: bold;
      text-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
    }

    select {
      min-width: 7vw;
      padding: 0.3vw 0.5vw;
      font-size: 0.8vw;
      color: rgba(255, 255, 255, 0.9);
      background: linear-gradient(180deg, rgba(0, 60, 120, 0.8), rgba(0, 40, 80, 0.9));
      border: 1px solid rgba(64, 158, 255, 0.5);
      border-radius: 4px;
      cursor: pointer;
      outline: none;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(64, 158, 255, 0.8);
        box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
      }

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
      }

      option {
        background: rgba(0, 30, 60, 0.95);
        color: rgba(255, 255, 255, 0.9);
        padding: 0.3vw;
      }
    }
  }

  .reset-btn {
    padding: 0.3vw 0.8vw;
    font-size: 0.8vw;
    color: rgba(255, 255, 255, 0.9);
    background: linear-gradient(180deg, rgba(64, 158, 255, 0.6), rgba(0, 80, 160, 0.8));
    border: 1px solid rgba(64, 158, 255, 0.6);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(180deg, rgba(64, 158, 255, 0.8), rgba(0, 100, 200, 0.9));
      border-color: #409eff;
      box-shadow: 0 0 10px rgba(64, 158, 255, 0.4);
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.more-info-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85vw;
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;

  thead {
    background: linear-gradient(180deg, rgba(0, 70, 140, 0.9), rgba(0, 50, 100, 1));

    th {
      padding: 0.6vw 0.4vw;
      text-align: center;
      font-weight: bold;
      color: rgba(255, 255, 255, 1);
      text-shadow: 0 0 5px rgba(64, 158, 255, 0.6);
      border-bottom: 2px solid rgba(64, 158, 255, 0.8);
      white-space: nowrap;
      position: sticky;
      top: 0;
      z-index: 10;
      background: linear-gradient(180deg, rgba(0, 70, 140, 0.95), rgba(0, 50, 100, 1));
      box-shadow: 0 2px 10px rgba(64, 158, 255, 0.4);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 0.05vw;
        background: linear-gradient(90deg, transparent, #40a0ffab, transparent);
        box-shadow: 0 0 10px rgba(64, 158, 255, 0.6);
      }

      &:not(:last-child) {
        border-right: 1px solid rgba(64, 158, 255, 0.3);
      }
    }
  }

  tbody {
    tr {
      transition: all 0.3s ease;
      height: 3vw;

      &:hover {
        background: rgba(64, 158, 255, 0.15);
        box-shadow: 0 0 10px rgba(64, 158, 255, 0.3) inset;
      }

      &:nth-child(even) {
        background: rgba(0, 25, 50, 0.6);
      }

      &:nth-child(odd) {
        background: rgba(0, 35, 70, 0.4);
      }

      td {
        height: 3vw;
        padding: 0 0.4vw;
        text-align: center;
        border-bottom: 1px solid rgba(64, 158, 255, 0.3);
        border-right: 1px solid rgba(64, 158, 255, 0.3);
        max-width: 8vw;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;

        &:first-child {
          color: rgba(64, 158, 255, 0.8);
          font-weight: bold;
        }

        &:last-child {
          border-right: none;
        }
      }
    }
  }
}
  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 40, 80, 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 140, 255, 0.6);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 140, 255, 0.8);
  }
</style>