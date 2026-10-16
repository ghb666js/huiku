<template>
<section class="sale" v-if="saleData.show">
  <div class="sale-container">
    <div class="sale-header">
      <div class="corner-top-left"></div>
      <div class="corner-top-right"></div>
      <h1 class="sale-title">景德镇电厂灰库生产销售分析表</h1>
    </div>
    <div class="sale-data">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>订单号</th>
              <th>车牌</th>
              <th>入厂时间</th>
              <!-- <th>空车称重时间</th> -->
              <th>库底装车时间</th>
              <!-- <th>满车称重时间</th> -->
              <th>出厂时间</th>
              <th>地磅净重(吨)</th>
              <th>流量计(吨)</th>
              <th>物料名称</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in tableData" :key="index">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ row.订单号 }}</td>
              <td>{{ row.车牌 }}</td>
              <td>{{ row.入厂时间 }}</td>
              <!-- <td>{{ row.空车称重时间 }}</td> -->
              <td>{{ row.库底装车时间 }}</td>
              <!-- <td>{{ row.满车称重时间 }}</td> -->
              <td>{{ row.出厂时间 }}</td>
              <td>{{ row['地磅净重(吨)'] }}</td>
              <td>{{ row.流量计 }}</td>
              <td>{{ row.物料名称 }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div class="pagination-info">
            共 {{ total }} 条记录，第 {{ currentPage }}/{{ totalPages }} 页
          </div>
          <div class="pagination-controls">
            <button class="page-btn" @click="getNewData">获取最新数据</button>
            <button class="page-btn refresh-btn" @click="refreshData">刷新</button>
            <button class="page-btn" @click="goToFirstPage" :disabled="currentPage === 1">首页</button>
            <button class="page-btn" @click="goToPrevPage" :disabled="!hasPrevPage">上一页</button>
            <button
              v-for="page in displayedPages"
              :key="page"
              class="page-btn"
              :class="{ active: page === currentPage, ellipsis: page === '...' }"
              @click="page !== '...' && goToPage(page)"
            >
              {{ page }}
            </button> 
            <button class="page-btn" @click="goToNextPage" :disabled="!hasNextPage">下一页</button>
            <button class="page-btn" @click="goToLastPage" :disabled="currentPage === totalPages">末页</button>
            <button class="page-btn" @click="showMoreInfoDialog">更多生产信息</button>
          </div>
        </div>
      </div>
      <div class="data-histogram">
        <h2>上月粉煤灰销售统计图</h2>
        <div class="histogram-up" ref="lastMonthChart"></div>
        <h2>当月粉煤灰销售统计图</h2>
        <div class="histogram-down" ref="currentMonthChart"></div>
      </div>
    </div>
  </div>
</section>
</template>

<script>
import EventBus from '@/bus';
import * as echarts from 'echarts';
import { refresh, watch } from 'less';
import { saveToMySQL } from '@/utils/generalfunction';
import { API_ORDER, LOCAL_QUERY_ORDER } from '@/constants/api';
export default {
    name: 'saleAnalyse',
    data() {
        return {
          saleData:{
            show:false,
            name:'',
          },
          allData: [
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-06 23:18:52', 空车称重时间: '2026-04-06 23:22:17', 库底装车时间: '2026-04-06 23:36:24',满车称重时间:"2026-04-06 23:52:49",出厂时间:"2026-04-06 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-06 23:18:52', 空车称重时间: '2026-04-06 23:22:17', 库底装车时间: '2026-04-06 23:36:24',满车称重时间:"2026-04-06 23:52:49",出厂时间:"2026-04-06 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-06 23:18:52', 空车称重时间: '2026-04-06 23:22:17', 库底装车时间: '2026-04-06 23:36:24',满车称重时间:"2026-04-06 23:52:49",出厂时间:"2026-04-06 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-06 23:18:52', 空车称重时间: '2026-04-06 23:22:17', 库底装车时间: '2026-04-06 23:36:24',满车称重时间:"2026-04-06 23:52:49",出厂时间:"2026-04-06 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-06 23:18:52', 空车称重时间: '2026-04-06 23:22:17', 库底装车时间: '2026-04-06 23:36:24',满车称重时间:"2026-04-06 23:52:49",出厂时间:"2026-04-06 23:55:30",物料名称:"原灰"},

            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-05 23:18:52', 空车称重时间: '2026-04-05 23:22:17', 库底装车时间: '2026-04-05 23:36:24',满车称重时间:"2026-04-05 23:52:49",出厂时间:"2026-04-05 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-05 23:18:52', 空车称重时间: '2026-04-05 23:22:17', 库底装车时间: '2026-04-05 23:36:24',满车称重时间:"2026-04-05 23:52:49",出厂时间:"2026-04-05 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-05 23:18:52', 空车称重时间: '2026-04-05 23:22:17', 库底装车时间: '2026-04-05 23:36:24',满车称重时间:"2026-04-05 23:52:49",出厂时间:"2026-04-05 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-05 23:18:52', 空车称重时间: '2026-04-05 23:22:17', 库底装车时间: '2026-04-05 23:36:24',满车称重时间:"2026-04-05 23:52:49",出厂时间:"2026-04-05 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-05 23:18:52', 空车称重时间: '2026-04-05 23:22:17', 库底装车时间: '2026-04-05 23:36:24',满车称重时间:"2026-04-05 23:52:49",出厂时间:"2026-04-05 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-05 23:18:52', 空车称重时间: '2026-04-05 23:22:17', 库底装车时间: '2026-04-05 23:36:24',满车称重时间:"2026-04-05 23:52:49",出厂时间:"2026-04-05 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-05 23:18:52', 空车称重时间: '2026-04-05 23:22:17', 库底装车时间: '2026-04-05 23:36:24',满车称重时间:"2026-04-05 23:52:49",出厂时间:"2026-04-05 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406023', 车牌: '赣L28798', 入厂时间: '2026-04-05 23:18:52', 空车称重时间: '2026-04-05 23:22:17', 库底装车时间: '2026-04-05 23:36:24',满车称重时间:"2026-04-05 23:52:49",出厂时间:"2026-04-05 23:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406012', 车牌: '赣L28787', 入厂时间: '2026-03-06 12:18:52', 空车称重时间: '2026-03-06 12:22:17', 库底装车时间: '2026-03-06 12:36:24',满车称重时间:"2026-03-06 12:52:49",出厂时间:"2026-03-06 12:55:30",物料名称:"粗灰"},
            {订单号: 'JD20260406013', 车牌: '赣L28788', 入厂时间: '2026-03-06 13:18:52', 空车称重时间: '2026-03-06 13:22:17', 库底装车时间: '2026-03-06 13:36:24',满车称重时间:"2026-03-06 13:52:49",出厂时间:"2026-03-06 13:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406014', 车牌: '赣L28789', 入厂时间: '2026-03-06 14:18:52', 空车称重时间: '2026-03-06 14:22:17', 库底装车时间: '2026-03-06 14:36:24',满车称重时间:"2026-03-06 14:52:49",出厂时间:"2026-03-06 14:55:30",物料名称:"二级灰"},
            {订单号: 'JD20260406015', 车牌: '赣L28790', 入厂时间: '2026-03-06 15:18:52', 空车称重时间: '2026-03-06 15:22:17', 库底装车时间: '2026-03-06 15:36:24',满车称重时间:"2026-03-06 15:52:49",出厂时间:"2026-03-06 15:55:30",物料名称:"原灰"},
            {订单号: 'JD20260406016', 车牌: '赣L28791', 入厂时间: '2026-03-06 16:18:52', 空车称重时间: '2026-03-06 16:22:17', 库底装车时间: '2026-03-06 16:36:24',满车称重时间:"2026-03-06 16:52:49",出厂时间:"2026-03-06 16:55:30",物料名称:"原灰"},    
          ],
          tableData: [],
          currentPage: 1,
          pageSize: 10,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          maxDisplayPages: 5,
          lastMonthChart: null,
          currentMonthChart: null,
          moreData: [],
          watchNum:0,
        };
    },
    components: {

    },
    watch: {
      watchNum:{
        handler(newVal){
          console.log('自动更新页面');
          this.refreshData()
        },
        deep:true
      }
    },
    computed: {
      displayedPages() {
        const pages = [];
        const total = this.totalPages;
        const current = this.currentPage;
        const maxDisplay = this.maxDisplayPages;

        if (total <= maxDisplay) {
          for (let i = 1; i <= total; i++) {
            pages.push(i);
          }
        } else {
          if (current <= Math.floor(maxDisplay / 2) + 1) {
            for (let i = 1; i <= maxDisplay - 1; i++) {
              pages.push(i);
            }
            pages.push('...');
            pages.push(total);
          } else if (current >= total - Math.floor(maxDisplay / 2)) {
            pages.push(1);
            pages.push('...');
            for (let i = total - maxDisplay + 2; i <= total; i++) {
              pages.push(i);
            }
          } else {
            pages.push(1);
            pages.push('...');
            for (let i = current - 1; i <= current + 1; i++) {
              pages.push(i);
            }
            pages.push('...');
            pages.push(total);
          }
        }
        return pages;
      }
    },
    mounted() {
      EventBus.$on('saleAnalyse', this.updateSale);
      this.initData();
      // setTimeout(() => {
        this.fetchData()
      // }, 100);
      this.scheduleDailyTask()
    },
    beforeDestroy() {
      EventBus.$off('saleAnalyse', this.updateSale);
      if (this.lastMonthObserver) {
        this.lastMonthObserver.disconnect();
      }
      if (this.currentMonthObserver) {
        this.currentMonthObserver.disconnect();
      }
      if (this.lastMonthChart) {
        this.lastMonthChart.dispose();
      }
      if (this.currentMonthChart) {
        this.currentMonthChart.dispose();
      }
    },
    methods: {
      async getNewData(){
        // window.open('/orderData.html')
        const currentDate = this.getCurrentDate();

            const params = new URLSearchParams({
                time: currentDate,
                Company_id: '837c4265-361c-4c0e-9c33-8273b8d1846d',
                Mode: '40'
                // Mode: '1'
            });

            try {
                const res = await fetch(API_ORDER + '?' + params);
                const data = await res.json();

                if (data.error) {
                    // document.getElementById('result').textContent = '错误: ' + JSON.stringify(data);
                    console.log('错误: ' + JSON.stringify(data))

                } else if (data.rawResponse) {
                    // document.getElementById('result').textContent = data.rawResponse;
                    // console.log(data.rawResponse)
                    
                    const stringData = data.rawResponse
                    console.log('原始字符串:');
                    // console.log(stringData);

                    const changeData = this.convertToArrayFormat(stringData);
                    console.log('转换后的数据:');
                    // console.log(changeData);

                    const orderRecordData = changeData.data.OrderRecordData
                    console.log('提取出来的数据:');
                    // console.log(orderRecordData)

                    // 调用函数进行数据处理
                    const processedOrderRecordData = this.extractAndAddAttributes(orderRecordData);
                    console.log('增添属性后的对象数组');
                    // console.log(processedOrderRecordData)

                    const endOrderRecordData = this.convertMaterialName(processedOrderRecordData)
                    console.log('转化物料名称后的数据');
                    // console.log(endOrderRecordData)
                    await saveToMySQL('newOrderRecordData', endOrderRecordData)
                    this.watchNum++
                } else {
                    // document.getElementById('result').textContent = JSON.stringify(data, null, 2);// 执行
                    console.log(JSON.stringify(data, null, 2))
                    alert('已是最新数据')

                }
            } catch (err) {
                // document.getElementById('result').textContent = '请求失败: ' + err.message;
                console.log('请求失败: ' + err.message)

            }
      },
      getCurrentDate() {
          // 1. 获取当前日期
          const now = new Date();
          // 2. 加一天（自动处理月末）     
          now.setDate(now.getDate() + 1);
          // 3. 格式化日期为 YYYY-MM-DD
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
      },
     
      convertMaterialName(data) {
          // 物料映射表
          const materialMap = {
              '180103': '二级灰',
              '180104': '原灰',
              '180105': '粗灰',
          };

          // 返回新数组，避免修改原数据
          return data.map(item => ({
              ...item,
              物料名称: materialMap[item.物料名称] || item.物料名称 // 如果找不到映射则保留原值
          }));
      },
      // 提取并添加属性的函数
      extractAndAddAttributes(data) {
          // 定义属性名称映射
          const keys = [
              '订单号',
              '车牌',
              '入厂时间',
              '空车称重时间',
              '库底装车时间',
              '满车称重时间',
              '出厂时间',
              '地磅净重(吨)',
              '物料名称',
              '流量计'
          ];

          // 将数组转换为对象数组
          const orderObjects = data.map(item => {
              const obj = {};
              keys.forEach((key, index) => {
                  obj[key] = item[index];
              });
              return obj;
          });
          return orderObjects
      },
       // 将字符串数据转换为数组格式
      convertToArrayFormat(originalData) {
          // 如果传入的是字符串，先解析修复
          let dataObj;
          if (typeof originalData === 'string') {
              dataObj = this.parseAndFixData(originalData);
          } else {
              dataObj = originalData;
          }

          const result = {
              "code": dataObj.code,
              "msg": dataObj.msg,
              "RecordNumber": dataObj.RecordNumber,
              "data": {
                  "Company_id": dataObj.data.Company_id,
                  "time": dataObj.data.time,
                  "OrderRecordData": []
              }
          };

          dataObj.data.OrderRecordData.forEach(order => {
              // 注意：修复后 order 已经是数组格式了，直接使用即可
              // 但为了兼容性，如果还是对象则用 Object.values
              let orderArray;
              if (Array.isArray(order)) {
                  orderArray = order;
              } else {
                  orderArray = Object.values(order);
              }
              result.data.OrderRecordData.push(orderArray);
          });

          return result;
      },
      // 解析并修复数据
      parseAndFixData(rawString) {
          // 第一步：修复非法格式，将 {...} 转换为 [...]
          const fixedString = this.fixInvalidJSON(rawString);

          // 第二步：解析为JSON对象
          const parsedData = JSON.parse(fixedString);

          return parsedData;
      },
      // 修复非法JSON格式的函数（将 {a, b, c} 转换为 [a, b, c]）
      fixInvalidJSON(jsonString) {
          // 匹配 {"值1", "值2", ...} 这种非法格式，将其替换为 ["值1", "值2", ...]
          // 使用正则匹配 {...} 内部不是键值对的结构
          return jsonString.replace(/\{\s*"([^"]+)"(?:\s*,\s*"([^"]+)")*\s*\}/g, function (match) {
              // 提取所有引号内的值
              const values = [];
              const valueRegex = /"([^"]*)"/g;
              let valueMatch;
              while ((valueMatch = valueRegex.exec(match)) !== null) {
                  values.push(valueMatch[0]); // 保留引号
              }
              return '[' + values.join(', ') + ']';
          });
      },
      // 每天凌晨定时获取
      scheduleDailyTask() {
          // 获取当前时间
          const now = new Date();
          // 创建次日凌晨 0 点的日期对象
          const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
          // 计算距离次日凌晨 0 点的毫秒数
          const timeUntilMidnight = nextMidnight - now;

          // 首次定时，在次日凌晨 0 点执行任务
          setTimeout(async () => {

              console.log('任务在凌晨 0 点启动');
              await this.getNewData();
              console.log('任务在凌晨 0 点启动');

              // 之后以 24 小时为周期循环执行任务
              setInterval(this.getNewData, 24 * 60 * 60 * 1000);
          }, timeUntilMidnight);
      },
      updateSale(data){
        this.saleData.show = data.show;
        if (data.show) {
          this.$nextTick(() => {
            this.initCharts();
          });
        }
      },
      refreshData(){
        this.currentPage = 1;
        this.fetchData();
        this.initData();
        this.initCharts();
      },
      formatDateTime(isoString){
        if(!isoString) return '-'
        const date = new Date(isoString)
        return date.toLocaleString
        ('zh-CN',{
          year:'numeric',
          month:'2-digit',
          day:'2-digit',
          hour:'2-digit',
          minute:'2-digit'
        }

        )
      },
      initData() {
        // 处理时间格式
        this.allData.forEach(e => {
          for(let k in e){
            if(e && k.includes('时间')){
              e[k] = this.formatDateTime(e[k])
              if(k !== '入厂时间') e[k] = e[k].substring(11,19)
              // k === '入厂时间' ? e[k] = e[k].substring(0,10) + ' ' +  e[k].substring(11,16) : e[k] = e[k].substring(11,16)
            }
          }
        });
        
        // 按入厂时间排序（最新的在前）
        this.allData.sort((a, b) => new Date(b.入厂时间) - new Date(a.入厂时间));
        
        // 获取最近一天的数据
        if (this.allData.length > 0) {
          const latestDate = new Date(this.allData[0].入厂时间).toDateString();
          const todayData = this.allData.filter(item => {
            return new Date(item.入厂时间).toDateString() === latestDate;
          });
          
          // 准备更多数据（除了最近一天的数据）
          this.moreData = this.allData.filter(item => {
            return new Date(item.入厂时间).toDateString() !== latestDate;
          });
          
          // 更新表格数据
          this.total = todayData.length;
          this.totalPages = Math.ceil(this.total / this.pageSize);
          this.updatePagination();
          this.loadPageData(todayData);
        }
      },
      loadPageData(data = null) {
        const sourceData = data || this.allData;
        const startIndex = (this.currentPage - 1) * this.pageSize;
        // const endIndex = Math.min(startIndex + this.pageSize, sourceData.length);
        const endIndex = Math.min(startIndex + this.pageSize, this.total);
        this.tableData = sourceData.slice(startIndex, endIndex);
      },
      updatePagination() {
        this.hasNextPage = this.currentPage < this.totalPages;
        this.hasPrevPage = this.currentPage > 1;
      },
      // loadPageData() {
      //   const startIndex = (this.currentPage - 1) * this.pageSize;
      //   const endIndex = Math.min(startIndex + this.pageSize, this.total);
      //   this.tableData = this.allData.slice(startIndex, endIndex);
      // },
      async fetchData() {
        try {
          const response = await fetch(LOCAL_QUERY_ORDER);
          const result = await response.json();
            if (result.data && result.data.length > 0) {
              this.allData = result.data;
              this.initData();
            }
        } catch (error) {
          console.error('获取数据错误:', error);
        }
      },
      goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
          this.updatePagination();
          this.loadPageData();
        }
      },
      goToFirstPage() {
        this.goToPage(1);
      },
      goToLastPage() {
        this.goToPage(this.totalPages);
      },
      goToPrevPage() {
        if (this.hasPrevPage) {
          this.goToPage(this.currentPage - 1);
        }
      },
      goToNextPage() {
        if (this.hasNextPage) {
          this.goToPage(this.currentPage + 1);
        }
      },
      showMoreInfoDialog() {
        // 通过事件总线触发显示更多销售信息的弹窗
        this.$EventBus.$emit('showMoreSaleInfo', this.moreData);      
      },
      closeMoreInfoDialog() {
        // 通过事件总线触发关闭更多销售信息的弹窗
        this.$EventBus.$emit('closeMoreSaleInfo');
      },
      initCharts() {
        this.initLastMonthChart();
        this.initCurrentMonthChart();
        this.addResizeObserver();
      },
      addResizeObserver() {
        if (this.$refs.lastMonthChart) {
          this.lastMonthObserver = new ResizeObserver(() => {
            if (this.lastMonthChart && !this.lastMonthResizing) {
              this.lastMonthResizing = true;
              requestAnimationFrame(() => {
                this.lastMonthChart.resize();
                this.lastMonthResizing = false;
              });
            }
          });
          this.lastMonthObserver.observe(this.$refs.lastMonthChart);
        }
        
        if (this.$refs.currentMonthChart) {
          this.currentMonthObserver = new ResizeObserver(() => {
            if (this.currentMonthChart && !this.currentMonthResizing) {
              this.currentMonthResizing = true;
              requestAnimationFrame(() => {
                this.currentMonthChart.resize();
                this.currentMonthResizing = false;
              });
            }
          });
          this.currentMonthObserver.observe(this.$refs.currentMonthChart);
        }
      },
      initLastMonthChart() {
        if (!this.$refs.lastMonthChart) return;
        const lastMonthData = this.calculateMonthData('last');
        this.lastMonthChart = echarts.init(this.$refs.lastMonthChart);
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['粗灰', '原灰', '二级灰', '总装车数'],
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              fontWeight:600,
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(64, 158, 255, 0.6)'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: '单位：车',
            nameTextStyle: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              fontWeight:600,
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              fontWeight:600,
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(64, 158, 255, 0.6)'
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(64, 158, 255, 0.2)'
              }
            }
          },
          series: [{
            name: '上月销售',
            type: 'bar',
            data: lastMonthData,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.8)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.3)' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '50%'
          }]
        };
        this.lastMonthChart.setOption(option);
      },
      initCurrentMonthChart() {
        if (!this.$refs.currentMonthChart) return;
        const currentMonthData = this.calculateMonthData('current');
        this.currentMonthChart = echarts.init(this.$refs.currentMonthChart);
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['粗灰', '原灰', '二级灰', '总装车数'],
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              fontWeight:600,
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(64, 158, 255, 0.6)'
              }
            }
          },
          yAxis: {
            type: 'value',
            name: '单位：车',
            nameTextStyle: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              fontWeight:600,
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              fontWeight:600,
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(64, 158, 255, 0.6)'
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(64, 158, 255, 0.2)'
              }
            }
          },
          series: [{
            name: '本月销售',
            type: 'bar',
            data: currentMonthData,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.8)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.3)' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '50%'
          }]
        };
        this.currentMonthChart.setOption(option);
      },
      calculateMonthData(monthType) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        let targetYear, targetMonth;
        
        if (monthType === 'current') {
          targetYear = currentYear;
          targetMonth = currentMonth;
        } else {
          if (currentMonth === 1) {
            targetYear = currentYear - 1;
            targetMonth = 12;
          } else {
            targetYear = currentYear;
            targetMonth = currentMonth - 1;
          }
        }
        
        const monthData = {
          '粗灰': 0,
          '原灰': 0,
          '二级灰': 0,
          '总': 0
        };
        
        this.allData.forEach(item => {
          const entryDate = new Date(item.入厂时间);
          const entryYear = entryDate.getFullYear();
          const entryMonth = entryDate.getMonth() + 1;
          
          if (entryYear === targetYear && entryMonth === targetMonth) {
            const materialName = item.物料名称;
            if (materialName === '粗灰') {
              monthData['粗灰']++;
              monthData['总']++;
            } else if (materialName === '原灰') {
              monthData['原灰']++;
              monthData['总']++;
            } else if (materialName === '二级灰' || materialName === '二级灰') {
              monthData['二级灰']++;
              monthData['总']++;
            }
          }
        });
        
        return [monthData['粗灰'], monthData['原灰'], monthData['二级灰'], monthData['总']];
      }
}
};
</script>

<style lang="less" scoped>
.sale {
  width: 100%;
  height: 100%;
  top: 2%;
  position: fixed;
  left: 2%;
  display: flex;
  flex-direction: row;
  align-items: center;

  .sale-container {
    width: 78%;
    height: 88%;
    background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 30, 60, 0.95));
    border: 1px solid rgba(64, 158, 255, 0.6);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.5vw;
    padding: 0.5vw;
    box-shadow:
      0 0 15px rgba(64, 158, 255, 0.4),
      inset 0 0 30px rgba(64, 158, 255, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.5),
      inset 0 0 60px rgba(64, 158, 255, 0.05);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg,
        rgba(64, 158, 255, 0.8) 0%,
        #409eff 30%,
        rgba(64, 158, 255, 0.9) 50%,
        #409eff 70%,
        rgba(64, 158, 255, 0.8) 100%);
      box-shadow:
        0 0 10px rgba(64, 158, 255, 0.6),
        0 0 20px rgba(64, 158, 255, 0.4),
        0 0 30px rgba(64, 158, 255, 0.2);
    }

    &::after {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      width: 25px;
      height: 25px;
      border-top: 3px solid #409eff;
      border-left: 3px solid #409eff;
      box-shadow:
        0 0 8px rgba(64, 158, 255, 0.5),
        inset 0 0 5px rgba(64, 158, 255, 0.2);
    }
  }

  .sale-header {
    flex: 0.08;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .corner-top-left {
      position: absolute;
      top: 0;
      left: 0;
      width: 25px;
      height: 25px;
      border-top: 3px solid #409eff;
      border-left: 3px solid #409eff;
      box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
    }

    .corner-top-right {
      position: absolute;
      top: 0;
      right: 0;
      width: 25px;
      height: 25px;
      border-top: 3px solid #409eff;
      border-right: 3px solid #409eff;
      box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
    }

    .sale-title {
      margin: 0;
      font-size: 1.2vw;
      color: rgba(255, 255, 255, 1);
      text-shadow:
        0 0 8px rgba(64, 158, 255, 0.8),
        0 0 15px rgba(64, 158, 255, 0.6),
        0 0 20px rgba(64, 158, 255, 0.4);
      font-family: 'Arial', sans-serif;
      letter-spacing: 1px;
    }
  }

  .sale-data {
    flex: 1;
    display: flex;
    // justify-content: space-between;
    gap: 0.5vw;
    padding: 0.5vw;

    .data-table-wrapper {
      flex: 6.5;
      background: rgba(0, 20, 40, 0.5);
      border: 1px solid rgba(64, 158, 255, 0.4);
      border-radius: 6px;
      box-shadow: inset 0 0 15px rgba(64, 158, 255, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 40, 80, 0.5);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 140, 255, 0.6);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 140, 255, 0.8);
      }
    }

    .data-table {
      // flex: 8.5;
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.85vw;
      color: rgba(255, 255, 255, 0.9);
      overflow: auto;

      thead {
        background: linear-gradient(180deg, rgba(0, 60, 120, 0.8), rgba(0, 40, 80, 0.9));

        th {
          padding: 0.6vw 0.4vw;
          text-align: center;
          height: 2.5vh;
          font-weight: bold;
          color: rgba(255, 255, 255, 1);
          text-shadow: 0 0 5px rgba(64, 158, 255, 0.6);
          border-bottom: 1px solid rgba(64, 158, 255, 0.6);
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
          background: linear-gradient(180deg, rgba(0, 60, 120, 0.9), rgba(0, 40, 80, 0.95));

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #409eff, transparent);
          }

          &:not(:last-child) {
            border-right: none;
          }
        }
      }

      tbody {
        tr {
          transition: all 0.3s ease;
          height: 3vw;

          &:hover {
            background: rgba(64, 158, 255, 0.15);
          }

          td {
            height: 5vh;
            padding: 0 0.4vw;
            text-align: center;
            border-bottom: 1px solid rgba(64, 158, 255, 0.2);
            border-right: 1px solid rgba(64, 158, 255, 0.3);
            max-width: 8vw;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle;

            &:first-child {
              color: rgba(64, 158, 255, 0.8);
            }

            &:last-child {
              border-right: none;
            }
          }

          &:nth-child(even) {
            background: rgba(0, 30, 60, 0.3);
          }
        }
      }
    }

    .pagination-wrapper {
      // flex: 1.5;
      display: flex;
      flex-direction: column;
      gap: 0.5vw;
      padding: 0.5vw;
      background: rgba(0, 20, 40, 0.7);
      border-top: 1px solid rgba(64, 158, 255, 0.4);
      border-radius: 0 0 6px 6px;
      box-shadow: inset 0 0 15px rgba(64, 158, 255, 0.1);
      height: 10vh;
      .pagination-info {
        font-size: 0.7vw;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
        padding: 0.3vw;
      }

      .pagination-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3vw;
        justify-content: center;

        .page-btn {
          min-width: 2.5vw;
          height: 2vw;
          padding: 0.3vw 0.6vw;
          font-size: 0.65vw;
          color: rgba(255, 255, 255, 0.9);
          background: linear-gradient(180deg, rgba(0, 80, 160, 0.8), rgba(0, 50, 100, 0.9));
          border: 1px solid rgba(64, 158, 255, 0.6);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

          &:hover:not(:disabled) {
            background: linear-gradient(180deg, rgba(64, 158, 255, 0.8), rgba(0, 100, 200, 0.9));
            border-color: #409eff;
            box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
            transform: translateY(-1px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }

          &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          &.active {
            background: linear-gradient(180deg, #409eff, #0066cc);
            border-color: #409eff;
            color: white;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
          }

          &.ellipsis {
            background: transparent;
            border: none;
            cursor: default;
            box-shadow: none;

            &:hover {
              transform: none;
            }
          }
        }
      }
    }

    .data-histogram {
      flex: 3.5;
      display: flex;
      flex-direction: column;

      h2 {
        border-top-left-radius: 0.5vw;
        border-top-right-radius: 0.5vw;
        flex: 1;
        margin: 0;
        font-size: 0.9vw;
        vertical-align: middle;
        text-align: center;
        color: rgba(255, 255, 255, 1);
        text-shadow:
          0 0 8px rgba(64, 158, 255, 0.8),
          0 0 15px rgba(64, 158, 255, 0.6),
          0 0 20px rgba(64, 158, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(0, 40, 80, 0.8), rgba(0, 20, 40, 0.9));
        border: 1px solid rgba(64, 158, 255, 0.4);
        border-bottom: none;
        position: relative;
        overflow: hidden;
        font-family: 'Arial', sans-serif;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-weight: bold;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 0.1vw;
          background: linear-gradient(90deg, transparent, #409eff, transparent);
          box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 0.05vw;
          background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.6), transparent);
        }
      }

      .histogram-up, .histogram-down {
        flex: 9;
        background: rgba(0, 20, 40, 0.5);
        border-bottom-right-radius: 4px;
        border-bottom-left-radius: 4px;
        border: 1px solid rgba(64, 158, 255, 0.3);
        border-top: none;
        box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
        position: relative;
        overflow: hidden;
      }

      .histogram-up {
        margin-bottom: 0.5vw;
      }

      .histogram-up::before, .histogram-down::before {
        content: '';
        position: absolute;
        bottom: -0.05vw;
        left: -0.05vw;
        width: 1vw;
        height: 1vw;
        border-bottom-left-radius: 0.2vw;
        border-bottom: 0.1vw solid #409eff;
        border-left: 0.1vw solid #409eff;
        box-shadow: 0 0 0.5vw rgba(64, 158, 255, 0.6);
      }

      .histogram-up::after, .histogram-down::after {
        content: '';
        position: absolute;
        bottom: -0.05vw;
        right: -0.05vw;
        width: 1vw;
        height: 1vw;
        border-bottom-right-radius: 0.2vw;
        border-bottom: 0.1vw solid #409eff;
        border-right: 0.1vw solid #409eff;
        box-shadow: 0 0 0.5vw rgba(64, 158, 255, 0.6);
      }
    }
  }
}



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
