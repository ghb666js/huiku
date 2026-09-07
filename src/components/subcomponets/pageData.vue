<template>
  <div v-if="visible" class="more-info-dialog">
    <div class="more-info-content">
      <div class="more-info-header">
        <h3>传感器实时数据</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="more-info-body">
        <!-- 时间筛选框 -->
        <!-- <div class="filter-bar">
          <div class="filter-item">
            <label>年份:</label>
            <select v-model="selectedYear" @change="filterData">
              <option value="">全部</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div> -->
          <!-- <div class="filter-item">
            <label>月份:</label>
            <select v-model="selectedMonth" @change="filterData">
              <option value="">全部</option>
              <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
            </select>
          </div>
          <button class="reset-btn" @click="resetFilter">重置筛选</button> -->
        <!-- </div> -->
        <button class="reset-btn" @click="creatExcel(tableData)">导出EXCEL表</button>
        <table class="more-info-table">
          <thead>
            <tr>
                <th>序号</th>
                <th>传感器ID</th>
                <th>安装位置</th>
                <th>通道号</th>
                <th>传感器类型</th>
                <th>温度(°C)</th>
                <th>湿度(%)</th>
                <th>频率(Hz)</th>
                <th>应变值(με)</th>
                <th>沉降值(mm)</th>
                <th>X向倾角(°)</th>
                <th>Y向倾角(°)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in tableData" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ row.传感器ID }}</td>
              <td>{{ row.安装位置 }}</td>
              <td>{{ row.通道号 }}</td>
              <td>{{ row.传感器类型 }}</td>
              <td>{{ row['温度(°C)'] }}</td>
              <td>{{ row['湿度(%)'] }}</td>
              <td>{{ row['频率(Hz)'] }}</td>
              <td>{{ row['应变值(με)'] }}</td>
              <td>{{ row['沉降值(mm)'] }}</td>
              <td>{{ row['X向倾角(°)'] }}</td>
              <td>{{ row['Y向倾角(°)'] }}</td>
              
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  name: 'pageData',
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
    return {
     tableData:[],
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.data.forEach((e,index) => {
           if(!e.传感器ID)  this.data.splice(index,1)
        });
        console.log(this.data);
    
        this.tableData = this.data;
      }
    },
    data(newVal) {
      if (this.visible) {
        newVal.forEach((e,index) => {
           if(!e.传感器ID)  newVal.splice(index,1)
        });
        console.log(newVal);
    
        this.tableData = newVal;
      }
    }
  },
  methods: {
    creatExcel(result) {
      if (!window.XLSX) {
        alert('请在页面中引入 xlsx 库');
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(result);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "database");
      XLSX.writeFile(workbook, "database.xlsx");
    },
    close() {
      this.$emit('close');
    }
  },
//   mounted() {
//     if (this.visible) {
//       this.filterData();
//     }
//   }
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

.reset-btn {
    padding: 0.3vw 0.8vw;
    font-size: 0.8vw;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    background: linear-gradient(180deg, rgba(64, 158, 255, 0.6), rgba(0, 80, 160, 0.8));
    border: 1px solid rgba(64, 158, 255, 0.6);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1vw;
    &:hover {
      background: linear-gradient(180deg, rgba(64, 158, 255, 0.8), rgba(0, 100, 200, 0.9));
      border-color: #409eff;
      box-shadow: 0 0 10px rgba(64, 158, 255, 0.4);
    }
    &:active {
      transform: scale(0.98);
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