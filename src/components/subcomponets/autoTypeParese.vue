<template>
  <div class="serial-page">
    <h1 style="font-size: 24px;">串口连接</h1>
    <div class="button-container">
      <div class="button-section">
        <button class="control-btn" @click="impowerSerialPort" :disabled="impowerDisabled">授权端口</button>
        <button class="control-btn" @click="connectMultiplePorts" :disabled="connectDisabled">连接端口</button>
        <button class="control-btn" @click="closeAllPorts">断开所有端口</button>
      </div>
      <div class="port-list-section">
      <h2>端口连接列表</h2>
      <div v-for="(p, idx) in connectedPorts" :key="idx" class="port-item">
        <h3>端口: {{ portLabel(p.port) }}</h3>
      </div>
      <div v-if="connectedPorts.length === 0" class="port-item">
        <h3>未连接任何端口</h3>
      </div>
    </div>
      <h1 style="font-size: 24px;">数据采集和显示</h1>
      <div class="button-section">
        <button class="control-btn" @click="startMain" :disabled="gainDisabled">获取数据</button>
        <button class="control-btn" @click="tableShow" :disabled="gainDisabled">表单显示</button>
        <button class="control-btn" @click="creatExcel" :disabled="gainDisabled">导出 Excel 文档</button>
        <button class="control-btn" @click="saveToMySQL" :disabled="gainDisabled">导入 MySQL</button>
      </div>
      <pre id="responseDisplay">{{ responseText }}</pre>
    </div>

    

    <!-- 进度条容器 -->
    <div class="progress-container" v-show="showProgress">
      <!-- 进度条 -->
      <div class="progress-bar" id="progress-bar" :style="{width: currentProgress + '%'}">{{ Math.round(currentProgress) }}%</div>
    </div>

    

  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import axios from 'axios';
// import ResultTable from './ResultTable.vue';
/* load 'fs' for readFile and writeFile support */
// import * as fs from 'fs';
// XLSX.set_fs(fs);

export default {
  name: 'AutoTypeParse',
  // components: { ResultTable },
  components: {  },
  data() {
    return {
      connectedPorts: [],
      responseText: '无端口连接',
      impowerDisabled: false,
      connectDisabled: false,
      gainDisabled: false,
      // showResultModal: false,
      showProgress:false,
      flag:false,
      // resultData: [],
      currentProgress:0,
      port:null,
      tableData: [],
      statsInfo: '请输入查询条件并点击查询按钮',
      // 校验表数据
      checkTable: [
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-B-R", "应变值(με)": 3672.87143, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-B-R-V", "应变值(με)": 3436.527576, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-A-R", "应变值(με)": 3223.324636, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-A-L", "应变值(με)": 7461.979125, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-B-L", "应变值(με)": 4129.864713, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-E-R", "应变值(με)": 3832.318404, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-E-L", "应变值(με)": 3580.908649, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-D-R", "应变值(με)": 3287.581129, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-D-R-V", "应变值(με)": 3577.94348, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-F-L", "应变值(με)": 3670.930777, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-G-L", "应变值(με)": 0, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-H-R-V", "应变值(με)": 3951.69548, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-H-R", "应变值(με)": 3585.937343, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-G-R", "应变值(με)": 3392.425428, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-H-L", "应变值(με)": 3560.925604, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-F-R", "应变值(με)": 3557.828053, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-F-R-V", "应变值(με)": 3179.898257, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-D-L", "应变值(με)": 3059.797931, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-C-R", "应变值(με)": 3953.482257, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC1-C-L", "应变值(με)": 3232.767207, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-B-R-V", "应变值(με)": 3274.744056, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-B-L", "应变值(με)": 3606.486917, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-A-L", "应变值(με)": 3487.574787, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-F-L", "应变值(με)": 3457.432529, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-D-R-V", "应变值(με)": 3500.018223, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-E-L", "应变值(με)": 3572.322578, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-G-L", "应变值(με)": 3676.98407, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-H-R-V", "应变值(με)": 3356.584208, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-H-L", "应变值(με)": 3700.371525, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-F-R-V", "应变值(με)": 3452.620962, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-C-L", "应变值(με)": 3176.074931, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC2-D-L", "应变值(με)": 3294.97758, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-B-R-V", "应变值(με)": 3727.526607, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-B-R", "应变值(με)": 3698.76929, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-B-L", "应变值(με)": 3406.247466, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-A-L", "应变值(με)": 3760.219313, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-D-R-V", "应变值(με)": 3489.311409, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-D-R", "应变值(με)": 3430.84467, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-E-L", "应变值(με)": 3328.642278, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-G-L", "应变值(με)": 3484.596788, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-H-R-V", "应变值(με)": 3270.527289, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-H-R", "应变值(με)": 3404.27893, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-H-L", "应变值(με)": 3306.541342, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-F-R", "应变值(με)": 3502.112277, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-F-R-V", "应变值(με)": 3247.889826, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-D-L", "应变值(με)": 3375.076445, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC3-C-L", "应变值(με)": 3522.422637, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-B-L", "应变值(με)": 3364.199009, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-A-L", "应变值(με)": 1168.183717, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-D-R-V", "应变值(με)": 3415.785803, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-F-L", "应变值(με)": 3438.343483, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-E-L", "应变值(με)": 3535.762877, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-F-R-V", "应变值(με)": 3667.141786, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-G-L", "应变值(με)": 3423.269814, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-H-R-V", "应变值(με)": 3601.867437, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-H-L", "应变值(με)": 3087.575224, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-D-L", "应变值(με)": 3592.210015, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC4-C-L", "应变值(με)": 3431.8707, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-B-R", "应变值(με)": 3702.307007, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-B-L", "应变值(με)": 3562.182854, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-A-L", "应变值(με)": 3233.601473, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-F-L", "应变值(με)": 3624.07594, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-D-R-V", "应变值(με)": 3530.819888, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-E-L", "应变值(με)": 3005.436839, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-F-R-V", "应变值(με)": 3734.269794, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-G-L", "应变值(με)": 3388.067899, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-H-R-V", "应变值(με)": 3655.228123, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-H-L", "应变值(με)": 3603.368725, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-C-L", "应变值(με)": 3516.37971, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-D-L", "应变值(με)": 3565.430961, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC5-B-R-V", "应变值(με)": 3453.054275, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-B-L", "应变值(με)": 3410.985553, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-A-L", "应变值(με)": 3466.247422, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-D-R-V", "应变值(με)": 3520.166163, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-E-L", "应变值(με)": 3679.956903, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-F-R-V", "应变值(με)": 3610.999326, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-H-R-V", "应变值(με)": 2753.833062, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-G-L", "应变值(με)": 3473.691923, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-H-L", "应变值(με)": 3882.017231, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-C-L", "应变值(με)": 3644.787532, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-D-L", "应变值(με)": 3359.577069, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC6-B-R-V", "应变值(με)": 3621.353583, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "总线式式解调仪", "安装位置": "GBC7-B-R", "应变值(με)": null, "沉降值(mm)": null, "X向倾角(°)": 0.3755, "Y向倾角(°)": -0.4175, },
        { "解调仪类型": "总线式式解调仪", "安装位置": "GBC7-D-R", "应变值(με)": 4000, "沉降值(mm)": null, "X向倾角(°)": -1.6105, "Y向倾角(°)": 2.6592, },
        { "解调仪类型": "总线式式解调仪", "安装位置": "GBC7-F-R", "应变值(με)": 4000, "沉降值(mm)": null, "X向倾角(°)": -2.2444, "Y向倾角(°)": 0.2922, },
        { "解调仪类型": "总线式式解调仪", "安装位置": "GBC7-H-R", "应变值(με)": null, "沉降值(mm)": null, "X向倾角(°)": -0.517, "Y向倾角(°)": -0.2344, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-B-L", "应变值(με)": 0, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-A-L", "应变值(με)": 0, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-D-R-V", "应变值(με)": 3406.941922, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-E-L", "应变值(με)": 3357.99244, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-F-R-V", "应变值(με)": 3167.868732, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-G-L", "应变值(με)": 3364.680946, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-H-R-V", "应变值(με)": 3326.866908, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-H-L", "应变值(με)": 3791.98499, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-F-L", "应变值(με)": 3635.35855, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-D-L", "应变值(με)": 3324.332118, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-C-L", "应变值(με)": 3172.882372, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC7-B-R-V", "应变值(με)": 3383.955024, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-B-L", "应变值(με)": 0, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-A-L", "应变值(με)": 3561.434271, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-D-R-V", "应变值(με)": 3222.425472, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-E-L", "应变值(με)": 3523.488455, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-F-R-V", "应变值(με)": 3517.743465, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-H-R-V", "应变值(με)": 3665.338868, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-G-L", "应变值(με)": 3440.842865, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-H-L", "应变值(με)": 3946.179709, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-F-L", "应变值(με)": 3503.006666, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-C-L", "应变值(με)": 3220.701828, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-D-L", "应变值(με)": 3107.17116, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC8-B-R-V", "应变值(με)": 3623.383202, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-A-L", "应变值(με)": 3611.499752, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-E-L", "应变值(με)": 3148.486288, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-F-R-V", "应变值(με)": 3258.725923, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-G-L", "应变值(με)": 3296.050016, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-H-L", "应变值(με)": 3535.06603, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-F-L", "应变值(με)": 2999.392234, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-C-L", "应变值(με)": 3453.01817, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-D-L", "应变值(με)": 3391.996404, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC9-B-R-V", "应变值(με)": 4310.1076, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC10-B-L", "应变值(με)": 3476.009579, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC10-F-R-V", "应变值(με)": 3386.138772, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC10-H-L", "应变值(με)": 3520.044017, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC10-F-L", "应变值(με)": 3380.432795, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC10-D-L", "应变值(με)": 3450.851137, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC10-B-R-V", "应变值(με)": 3566.48707, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC11-B-L", "应变值(με)": 3469.888947, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC11-D-L", "应变值(με)": 3326.87468, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC11-F-R-V", "应变值(με)": 3667.732014, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC11-H-L", "应变值(με)": 3758.140202, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC11-F-L", "应变值(με)": 3369.398439, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC11-B-R-V", "应变值(με)": 3408.826087, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC12-B-L", "应变值(με)": 3542.56864, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC12-D-L", "应变值(με)": 3433.551072, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC12-F-R-V", "应变值(με)": 3709.330263, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC12-H-L", "应变值(με)": 3547.589091, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC12-F-L", "应变值(με)": 3385.022844, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC12-B-R-V", "应变值(με)": 3692.420303, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC13-B-L", "应变值(με)": 3401.80431, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC13-D-L", "应变值(με)": 3326.827931, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC13-F-R-V", "应变值(με)": 3686.562502, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC13-H-L", "应变值(με)": 3424.508868, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC13-F-L", "应变值(με)": 3654.598196, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC13-B-R-V", "应变值(με)": 3632.985042, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC14-B-L", "应变值(με)": 3548.88052, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC14-D-L", "应变值(με)": 3501.94857, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC14-F-R-V", "应变值(με)": 2890.510863, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC14-H-L", "应变值(με)": 3432.851916, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC14-F-L", "应变值(με)": 3486.680657, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC14-B-R-V", "应变值(με)": 3079.244186, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC15-B-L", "应变值(με)": 3604.796067, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC15-D-L", "应变值(με)": 3398.252545, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC15-F-R-V", "应变值(με)": 3117.179046, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC15-H-L", "应变值(με)": 3593.116296, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC15-F-L", "应变值(με)": 3448.650541, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC15-B-R-V", "应变值(με)": 4108.782486, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "总线式解调仪", "安装位置": "GBC16-B-R", "应变值(με)": null, "沉降值(mm)": null, "X向倾角(°)": 1.632857143, "Y向倾角(°)": 2.122904762, },
        { "解调仪类型": "总线式解调仪", "安装位置": "GBC16-D-R", "应变值(με)": null, "沉降值(mm)": null, "X向倾角(°)": -2.738952381, "Y向倾角(°)": -0.273904762, },
        { "解调仪类型": "总线式解调仪", "安装位置": "GBC16-F-R", "应变值(με)": null, "沉降值(mm)": null, "X向倾角(°)": 0.345142857, "Y向倾角(°)": 0.016714286, },
        { "解调仪类型": "总线式解调仪", "安装位置": "GBC16-H-R", "应变值(με)": null, "沉降值(mm)": null, "X向倾角(°)": -2.57152381, "Y向倾角(°)": 0.772904762, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC16-B-L", "应变值(με)": 3939.422357, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC16-D-L", "应变值(με)": 3624.004661, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC16-H-L", "应变值(με)": 3393.63699, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "GBC16-F-L", "应变值(με)": 3472.772002, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY1", "应变值(με)": 3297.361168, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY13", "应变值(με)": 3209.665096, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY10", "应变值(με)": 3161.416557, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY16", "应变值(με)": 3002.930398, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY6", "应变值(με)": 3312.370685, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY7", "应变值(με)": 3235.871415, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY11", "应变值(με)": 3226.14185, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY9", "应变值(με)": 3252.538412, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY2", "应变值(με)": 3154.569959, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY3", "应变值(με)": 3028.120327, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZY8", "应变值(με)": 3269.1245, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS3A", "应变值(με)": 5829.036113, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS3B", "应变值(με)": 5275.727414, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS3C", "应变值(με)": 5658.84933, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS4A", "应变值(με)": 5997.874055, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS4B", "应变值(με)": 5555.087174, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS5A", "应变值(με)": 5921.80357, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS5B", "应变值(με)": 5612.183679, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS5C", "应变值(με)": 5222.788726, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS8A", "应变值(με)": 5753.805502, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS8B", "应变值(με)": 5511.717705, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS8C", "应变值(με)": 5767.485034, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS10A", "应变值(με)": 5639.335123, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS10B", "应变值(με)": 5778.732469, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS10C", "应变值(με)": 5639.335123, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS11B", "应变值(με)": 5582.979487, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS11C", "应变值(με)": 5457.403198, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS13A", "应变值(με)": 5220.156739, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS13B", "应变值(με)": 5273.96337, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS14A", "应变值(με)": 5622.168345, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS14B", "应变值(με)": 5184.703524, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS14C", "应变值(με)": 4779.450799, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS16B", "应变值(με)": 5152.761191, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS16C", "应变值(με)": 5504.301974, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS18A", "应变值(με)": 5717.067404, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS18B", "应变值(με)": 5708.689697, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS18C", "应变值(με)": 5652.828804, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS20A", "应变值(με)": 5303.801307, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS20C", "应变值(με)": 5830.953285, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS21A", "应变值(με)": 4696.240387, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS21B", "应变值(με)": 5598.563923, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
        { "解调仪类型": "振弦式解调仪", "安装位置": "ZS21C", "应变值(με)": 4916.176917, "沉降值(mm)": null, "X向倾角(°)": null, "Y向倾角(°)": null, },
      ],
    };
  },
  mounted() {
    if ('serial' in navigator) {
      navigator.serial.onconnect = (e) => {
        console.log('serial connected', e);
      };
      navigator.serial.ondisconnect = (e) => {
        console.log('serial disconnected', e);
        this.connectedPorts = this.connectedPorts.filter(item => item.port !== e.target);
      };
    }
    window.addEventListener('beforeunload', this.closeAllPorts);
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.closeAllPorts);
    this.closeAllPorts();
  },
  methods: {
    portLabel(port) {
      try {
        const info = port.getInfo ? port.getInfo() : {};
        return info.usbVendorId ? `USB ${info.usbVendorId}:${info.usbProductId}` : '未知';
      } catch (e) {
        return '未知';
      }
    },

    unsignedHexToDecimal(hexStr) {

      return parseInt(hexStr, 16);
    },
    tableShow(finalArr) {
      // 过滤掉 null/undefined/非对象项
      const safeArr = Array.isArray(finalArr) ? finalArr.filter(item => item && typeof item === 'object') : [];
      
      // 更新表格数据
      this.tableData = safeArr;
      
      // 更新统计信息
      this.statsInfo = `共 ${safeArr.length} 条数据`;
      
      // 存储数据到 localStorage
      localStorage.setItem('sensorData', JSON.stringify(safeArr));
    },
    async impowerSerialPort() {
      try {
        if (!('serial' in navigator)) {
          alert('当前浏览器不支持 Web Serial API');
          return;
        }
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
        this.connectedPorts.push({ port });
        this.responseText = `已授权并打开端口: ${this.portLabel(port)}`;
      } catch (err) {
        console.error('授权端口出错', err);
        this.responseText = `授权端口出错: ${err.message || err}`;
      }
    },

    async connectMultiplePorts() {
      try {
        if (!('serial' in navigator)) {
          alert('当前浏览器不支持 Web Serial API');
          return;
        }
        const ports = await navigator.serial.getPorts();
        for (const port of ports) {
          try {
            await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
            this.connectedPorts.push({ port });
          } catch (e) {
            console.warn('打开已配对端口失败', e);
          }
        }
        this.responseText = `已连接 ${this.connectedPorts.length} 个端口`;
      } catch (err) {
        console.log(222);
        
        console.error('connectMultiplePorts 出错', err);
        this.responseText = `连接端口出错: ${err.message || err}`;
      }
    },

    calculateCRC(data) {
      let crc = 0xFFFF;
      for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
          if (crc & 0x0001) crc = (crc >> 1) ^ 0xA001;
          else crc = crc >> 1;
        }
      }
      return [(crc & 0xFF), ((crc >> 8) & 0xFF)];
    },

    hexToDecimal(hexStr) {
      return parseInt(hexStr, 16);
    },

    getHexComplement(hexStr) {
      let decimal = parseInt(hexStr, 16);
      if (decimal & 0x8000) {
        decimal = ~decimal + 1;
        decimal &= 0xFFFF;
      }
      return decimal.toString(16).padStart(4, '0');
    },
    
    signedHexToDecimal(hexStr) {

      // 先计算补码
      let complementHex = this.getHexComplement(hexStr);
      // 将十六进制补码转换为二进制
      let binaryStr = parseInt(complementHex, 16).toString(2).padStart(16, '0');

      if (binaryStr[0] === '0') {
        // 正数直接转换为十进制
        return parseInt(binaryStr, 2);
      } else {
        // 负数需要特殊处理
        // 先去掉符号位
        let absBinary = binaryStr.slice(1);
        // 取反加一得到绝对值的二进制
        let invertedBinary = '';
        for (let bit of absBinary) {
          invertedBinary += bit === '0' ? '1' : '0';
        }
        let carry = 1;
        let absBinaryStr = '';
        for (let i = invertedBinary.length - 1; i >= 0; i--) {
          let sum = parseInt(invertedBinary[i]) + carry;
          if (sum === 2) {
            absBinaryStr = '0' + absBinaryStr;
            carry = 1;
          } else {
            absBinaryStr = sum.toString() + absBinaryStr;
            carry = 0;
          }
        }
        // 计算绝对值的十进制
        let absDecimal = parseInt(absBinaryStr, 2);
        return -absDecimal;
      }
    },

    verifyCode(data) {
      const hexArray = data.split(' ');
      const byteArray = hexArray.map(hex => parseInt(hex, 16));
      const slaveAddress = byteArray[0];
      const functionCode = byteArray[1];
      const byteCount = byteArray[2];
      switch (functionCode) {
        case 4:
         {
           let hexRegisterData;
          if (byteCount < 200) {
            hexRegisterData = hexArray.slice(3, 3 + byteCount);
          } else {
            hexRegisterData = hexArray.slice(7, byteCount - 1);
          }
          const newArray = [];
          for (let i = 0; i < hexRegisterData.length; i += 2) {
            if (i + 1 < hexRegisterData.length) {
              newArray.push(hexRegisterData[i] + hexRegisterData[i + 1]);
            } else {
              newArray.push(hexRegisterData[i]);
            }
          }
          const receivedCRC = byteArray.slice(byteArray.length - 2);
          const calculatedCRC = this.calculateCRC(byteArray.slice(0, byteArray.length - 2));
          const isCRCValid = (receivedCRC[0] === calculatedCRC[0]) && (receivedCRC[1] === calculatedCRC[1]);
          if (isCRCValid) {
            return [newArray, slaveAddress];
          } else {
            console.log('验证校验码未通过');
            return [[], slaveAddress];
          }
          
         }
        default:
          return { error: `不支持的功能码: ${functionCode}` };
      }
    },
    installPosition(sensorId) {

      let position
      switch (sensorId) {

        case 54379: position = 'GBC1-B-L'; break;
        case 33475: position = 'GBC1-A-R'; break;
        case 33336: position = 'GBC3-A-L'; break;
        case 33199: position = 'GBC1-A-L'; break;
        case 15139: position = 'GBC4-B-L'; break;
        case 42596: position = 'GBC2-B-L'; break;
        case 9859: position = 'GBC9-A-L'; break;
        case 40243: position = 'GBC8-A-L'; break;
        case 47523: position = 'GBC6-B-L'; break;
        case 38937: position = 'GBC5-B-L'; break;
        case 53625: position = 'GBC2-A-L'; break;
        case 64178: position = 'GBC3-B-L'; break;
        case 15391: position = 'GBC4-A-L'; break;
        case 447: position = 'GBC5-A-L'; break;
        case 10142: position = 'GBC7-A-L'; break;
        case 54218: position = 'GBC6-A-L'; break;
        case 15804: position = 'GBC14-B-L'; break;
        case 2927: position = 'GBC12-B-L'; break;
        case 17710: position = 'GBC1-B-R-V'; break;
        case 60847: position = 'GBC5-B-R'; break;
        case 61603: position = 'GBC8-B-L'; break;
        case 15998: position = 'GBC13-B-L'; break;
        case 47778: position = 'GBC16-B-L'; break;
        case 55809: position = 'GBC11-B-L'; break;
        case 27773: position = 'GBC15-B-L'; break;
        case 30256: position = 'GBC1-B-R'; break;
        case 12452: position = 'GBC3-B-R-V'; break;
        case 20422: position = 'GBC3-B-R'; break;
        case 65123: position = 'GBC10-B-L'; break;
        case 27645: position = 'GBC7-B-L'; break;
        case 52632: position = 'GBC2-B-R-V'; break;

        case 13686: position = 'GBC1-C-L'; break;
        case 3641: position = 'GBC5-B-R-V'; break;
        case 9384: position = 'GBC11-B-R-V'; break;
        case 23383: position = 'GBC9-B-R-V'; break;
        case 13979: position = 'GBC6-B-R-V'; break;
        case 25440: position = 'GBC13-B-R-V'; break;
        case 25685: position = 'GBC7-B-R-V'; break;
        case 19044: position = 'GBC8-B-R-V'; break;
        case 19439: position = 'GBC4-C-L'; break;
        case 35177: position = 'GBC10-B-R-V'; break;
        case 11346: position = 'GBC15-B-R-V'; break;
        case 58498: position = 'GBC14-B-R-V'; break;
        case 12653: position = 'GBC3-C-L'; break;
        case 54743: position = 'GBC12-B-R-V'; break;
        case 63602: position = 'GBC3-D-L'; break;
        case 2140: position = 'GBC4-B-R-V'; break;
        case 33623: position = 'GBC6-D-L'; break;
        case 12394: position = 'GBC4-D-L'; break;
        case 12699: position = 'GBC9-C-L'; break;
        case 47451: position = 'GBC6-C-L'; break;
        case 38044: position = 'GBC1-D-L'; break;
        case 53404: position = 'GBC8-C-L'; break;
        case 23906: position = 'GBC2-D-L'; break;
        case 15406: position = 'GBC5-D-L'; break;
        case 27543: position = 'GBC1-C-R'; break;
        case 17020: position = 'GBC7-C-L'; break;
        case 33732: position = 'GBC5-C-L'; break;
        case 27427: position = 'GBC2-C-L'; break;
        case 30700: position = 'GBC8-D-L'; break;
        case 10610: position = 'GBC10-D-L'; break;
        case 594: position = 'GBC7-D-L'; break;
        case 19313: position = 'GBC9-D-L'; break;

        case 55932: position = 'GBC14-D-L'; break;
        case 21100: position = 'GBC7-D-R-V'; break;
        case 31587: position = 'GBC12-D-L'; break;
        case 13916: position = 'GBC2-D-R-V'; break;
        case 15188: position = 'GBC5-E-L'; break;
        case 31133: position = 'GBC11-D-L'; break;
        case 27467: position = 'GBC3-D-R'; break;
        case 59305: position = 'GBC3-E-L'; break;
        case 12128: position = 'GBC13-D-L'; break;
        case 38839: position = 'GBC7-E-L'; break;
        case 35181: position = 'GBC4-E-L'; break;
        case 5401: position = 'GBC8-E-L'; break;
        case 27746: position = 'GBC2-E-L'; break;
        case 9974: position = 'GBC9-E-L'; break;
        case 61488: position = 'GBC6-E-L'; break;
        case 23413: position = 'GBC1-F-L'; break;
        case 44259: position = 'GBC3-D-R-V'; break;
        case 24376: position = 'GBC1-E-R'; break;
        case 31834: position = 'GBC5-D-R-V'; break;
        case 56404: position = 'GBC8-D-R-V'; break;
        case 3680: position = 'GBC1-E-L'; break;
        case 64186: position = 'GBC2-F-L'; break;
        case 64168: position = 'GBC4-F-L'; break;
        case 29290: position = 'GBC6-D-R-V'; break;
        case 35188: position = 'GBC1-D-R-V'; break;
        case 51963: position = 'GBC5-F-L'; break;
        case 43688: position = 'GBC4-D-R-V'; break;
        case 26309: position = 'GBC1-D-R'; break;
        case 44230: position = 'GBC16-D-L'; break;
        case 32457: position = 'GBC15-D-L'; break;

        case 18459: position = 'GBC8-H-R-V'; break;
        case 64118: position = 'GBC7-H-R-V'; break;
        case 64575: position = 'GBC6-H-R-V'; break;
        case 59100: position = 'GBC7-G-L'; break;
        case 43357: position = 'GBC9-G-L'; break;
        case 46189: position = 'GBC4-H-R-V'; break;
        case 30905: position = 'GBC1-H-R'; break;
        case 53402: position = 'GBC5-H-R-V'; break;
        case 24180: position = 'GBC1-H-R-V'; break;
        case 30523: position = 'GBC3-H-R-V'; break;
        case 34886: position = 'GBC3-H-R'; break;
        case 61194: position = 'GBC5-G-L'; break;
        case 37526: position = 'GBC1-G-R'; break;
        case 58575: position = 'GBC2-H-R-V'; break;
        case 2647: position = 'GBC8-G-L'; break;
        case 22373: position = 'GBC6-G-L'; break;
        case 30780: position = 'GBC8-F-R-V'; break;
        case 8377: position = 'GBC4-G-L'; break;
        case 11645: position = 'GBC12-F-R-V'; break;
        case 7101: position = 'GBC3-G-L'; break;
        case 22866: position = 'GBC7-F-R-V'; break;
        case 59685: position = 'GBC10-F-R-V'; break;
        case 13167: position = 'GBC1-G-L'; break;
        case 59313: position = 'GBC15-F-R-V'; break;
        case 26722: position = 'GBC2-G-L'; break;
        case 97: position = 'GBC9-F-R-V'; break;
        case 62405: position = 'GBC4-F-R-V'; break;
        case 59879: position = 'GBC14-F-R-V'; break;
        case 56542: position = 'GBC5-F-R-V'; break;
        case 49523: position = 'GBC6-F-R-V'; break;
        case 9794: position = 'GBC11-F-R-V'; break;
        case 37744: position = 'GBC13-F-R-V'; break;

        case 42652: position = 'GBC10-F-L'; break;
        case 36717: position = 'GBC9-F-L'; break;
        case 25447: position = 'GBC8-F-L'; break;
        case 16574: position = 'GBC1-F-R'; break;
        case 45913: position = 'GBC11-F-L'; break;
        case 417: position = 'GBC1-F-R-V'; break;
        case 16556: position = 'GBC12-F-L'; break;
        case 21049: position = 'GBC16-F-L'; break;
        case 62650: position = 'GBC3-F-R-V'; break;
        case 7991: position = 'GBC2-F-R-V'; break;
        case 38885: position = 'GBC15-F-L'; break;
        case 14051: position = 'GBC3-F-R'; break;
        case 20443: position = 'GBC14-F-L'; break;
        case 10068: position = 'GBC7-F-L'; break;
        case 30273: position = 'GBC13-F-L'; break;
        case 48184: position = 'GBC1-H-L'; break;
        case 2809: position = 'GBC9-H-L'; break;
        case 47197: position = 'GBC14-H-L'; break;
        case 38687: position = 'GBC6-H-L'; break;
        case 23897: position = 'GBC15-H-L'; break;
        case 4041: position = 'GBC10-H-L'; break;
        case 2673: position = 'GBC2-H-L'; break;
        case 18796: position = 'GBC8-H-L'; break;
        case 9047: position = 'GBC4-H-L'; break;
        case 60962: position = 'GBC12-H-L'; break;
        case 52579: position = 'GBC16-H-L'; break;
        case 25661: position = 'GBC7-H-L'; break;
        case 46760: position = 'GBC13-H-L'; break;
        case 1395: position = 'GBC5-H-L'; break;
        case 40174: position = 'GBC11-H-L'; break;
        case 60922: position = 'GBC3-H-L'; break;

        case 45729: position = 'ZS3A'; break;
        case 7987: position = 'ZS3B'; break;
        case 22193: position = 'ZS3C'; break;
        case 6300: position = 'ZS4A'; break;
        case 18176: position = 'ZS4B'; break;
        case 31116: position = 'ZS5A'; break;
        case 56388: position = 'ZS5B'; break;
        case 14114: position = 'ZS5C'; break;
        case 27192: position = 'ZS8A'; break;
        case 5955: position = 'ZS8B'; break;
        case 61114: position = 'ZS8C'; break;
        case 60477: position = 'ZS10A'; break;
        case 7156: position = 'ZS10B'; break;
        case 32151: position = 'ZS10C'; break;
        case 22245: position = 'ZS11B'; break;
        case 53714: position = 'ZS11C'; break;
        case 34672: position = 'ZS12C'; break;
        case 39507: position = 'ZS13A'; break;
        case 39020: position = 'ZS21A'; break;
        case 64789: position = 'ZS14A'; break;
        case 46678: position = 'ZS14B'; break;
        case 8056: position = 'ZS14C'; break;
        case 52055: position = 'ZS16B'; break;
        case 43642: position = 'ZS16C'; break;
        case 21332: position = 'ZS18A'; break;
        case 23798: position = 'ZS18B'; break;
        case 29711: position = 'ZS18C'; break;
        case 49809: position = 'ZS20A'; break;
        case 22165: position = 'ZS20C'; break;
        case 15859: position = 'ZS13B'; break;
        case 21417: position = 'ZS21B'; break;
        case 64215: position = 'ZS12A'; break;

        case 1096: position = 'ZY1'; break;
        case 48251: position = 'ZY2'; break;
        case 55375: position = 'ZY3'; break;
        case 3172: position = 'ZY6'; break;

        case 46199: position = 'ZY8'; break;
        case 6129: position = 'ZY10'; break;
        case 38710: position = 'ZY7'; break;
        case 65415: position = 'ZY9'; break;
        case 60416: position = 'ZY11'; break;
        case 17270: position = 'ZY16'; break;
        case 49075: position = 'ZS21C'; break;
        case 22601: position = 'ZY13'; break;

        case 34596: position = '库顶1'; break;
        case 62812: position = 'GBC7-B-R'; break;
        case 63324: position = 'GBC16-B-R'; break;
        case 63580: position = 'GBC7-D-R'; break;
        case 64092: position = 'GBC16-D-R'; break;
        case 63836: position = 'GBC7-F-R'; break;
        case 61532: position = 'GBC16-F-R'; break;
        case 62044: position = 'GBC7-H-R'; break;
        case 63068: position = 'GBC16-H-R'; break;
        case 34663: position = '库顶2'; break;
        case 45927: position = '库顶3'; break;
        case 39015: position = '库顶4'; break;
        case 42461: position = '横向桥架A'; break;
        case 13530: position = '横向桥架B'; break;
        case 60630: position = '横向桥架C'; break;
        case 23782: position = '横向桥架D'; break;
        case 28759: position = '横向桥架E'; break;
        case 6413: position = '横向桥架F'; break;
        case 33966: position = '横向桥架G'; break;
        default: position = 'null'; break
      }
      return position
    },
    vibraParse(jointArr, address) {
      const date = new Date()
      const dateYMD = date.toLocaleDateString()
      const year = date.getFullYear()
      const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

      const timeStr = year + '/' + month + '/' + day + '/' + hour + ':' + minutes

      const objectArray = [];
      for (let i = 0, j = 1; i < jointArr.length; i += 4, j++) {

        const group = {
          '采集时间': timeStr,    //时间-----------------新加
          '解调仪地址': address,  // 解调仪地址
          '解调仪类型': null,  // 解调仪类型 --------新加
          '传感器ID': jointArr[i],  // 传感器ID ------------新加
          '安装位置': null,  //----------------------------------------------------------------------//
          '通道号': jointArr.length < 68 ? j : j + 15, // 解调仪通道号
          '传感器类型': (jointArr[i + 1] || null),  // 传感器型号
          '温度(°C)': (jointArr[i + 2] || null),  // 温度
          '湿度(%)': null,  // 湿度
          '频率(Hz)': (jointArr[i + 3] || null),
          '应变值(με)': null,  // 应变值
          '沉降值(mm)': null,   // 沉降值
          'X向倾角(°)': null,  // X向倾角
          'Y向倾角(°)': null,  // Y向倾角
        };
        objectArray.push(group);
      }

      for (let i = 0; i < objectArray.length; i++) {

        const type = this.unsignedHexToDecimal(objectArray[i]['传感器类型'])
        const sensorId = this.unsignedHexToDecimal(objectArray[i]['传感器ID'])  //------------------------------------//



        switch (type) {
          case 3: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)  //--------------------------------------------//
            objectArray[i]['解调仪类型'] = '振弦式解调仪',
              objectArray[i]['传感器类型'] = '钢筋应力计(3)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(objectArray[i]['温度(°C)']) / 16,
              objectArray[i]['频率(Hz)'] = this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 10,
              objectArray[i]['应变值(με)'] = 0.002 * (objectArray[i]['频率(Hz)']) * (objectArray[i]['频率(Hz)'])
            break;
          case 6: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId)
            objectArray[i]['解调仪类型'] = '振弦式解调仪'
            objectArray[i]['传感器类型'] = '埋入型应力计(6)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(objectArray[i]['温度(°C)']) / 16,
              objectArray[i]['频率(Hz)'] = this.unsignedHexToDecimal(objectArray[i]['频率(Hz)']) / 10,
              objectArray[i]['应变值(με)'] = 0.002 * (objectArray[i]['频率(Hz)']) * (objectArray[i]['频率(Hz)'])
            break;
          // case 0: delete objectArray[i]
          //   break;
          case 0: objectArray[i]['采集时间'] = null,
            objectArray[i]['解调仪地址'] = null,
            objectArray[i]['传感器ID'] = null,
            objectArray[i]['安装位置'] = null,
            objectArray[i]['通道号'] = null,
            objectArray[i]['传感器类型'] = null
            objectArray[i]['温度(°C)'] = null,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;
          default:
            break;
        }
      }
      return objectArray
    },
    hexToSignedDecimal(hexStr) {
      // 将十六进制字符串转换为 16 位二进制字符串
      let binaryStr = parseInt(hexStr, 16).toString(2).padStart(16, '0');
      // 判断符号位
      if (binaryStr[0] === '0') {
        // 正数，直接转换为十进制
        return parseInt(binaryStr, 2);
      } else {
        // 负数，先求反码
        let invertedBinary = '';
        for (let i = 1; i < binaryStr.length; i++) {
          invertedBinary += binaryStr[i] === '0' ? '1' : '0';
        }
        // 反码加 1 得到原码（除符号位）
        let carry = 1;
        let originalBinary = '';
        for (let i = invertedBinary.length - 1; i >= 0; i--) {
          let sum = parseInt(invertedBinary[i]) + carry;
          if (sum === 2) {
            originalBinary = '0' + originalBinary;
            carry = 1;
          } else {
            originalBinary = sum.toString() + originalBinary;
            carry = 0;
          }
        }
        // 计算绝对值的十进制
        let absDecimal = parseInt(originalBinary, 2);
        // 添加负号
        return -absDecimal;
      }
    },
    //........................................
    BUSParse(jointArr, address) {
      const date = new Date()
      const dateYMD = date.toLocaleDateString()
      const year = date.getFullYear()
      const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

      const timeStr = year + '/' + month + '/' + day + '/' + hour + ':' + minutes

      const objectArray = [];
      for (let i = 0, j = 1; i < jointArr.length; i += 5, j++) {

        const group = {

          '采集时间': timeStr,    //时间-----------------新加
          '解调仪地址': address,  // 解调仪地址
          '解调仪类型': '总线式解调仪',  // 解调仪类型 --------新加
          '传感器ID': jointArr[i],  // 传感器ID ------------新加
          '安装位置': null,  //---------------------------------------------------------
          '通道号': j, // 解调仪通道号
          '传感器类型': (jointArr[i + 1] || null),  // 传感器型号
          '温度(°C)': (jointArr[i + 2] || null),  // 温度
          '湿度(%)': (jointArr[i + 3] || null),  // 湿度
          '频率(Hz)': null,
          '应变值(με)': null,  // 应变值
          '沉降值(mm)': ((jointArr[i + 3] + jointArr[i + 4]) || null),   // 沉降值
          'X向倾角(°)': (jointArr[i + 3] || null),  // X向倾角
          'Y向倾角(°)': (jointArr[i + 4] || null),  // Y向倾角

        };
        objectArray.push(group);
      }

      for (let i = 0; i < objectArray.length; i++) {

        const type = this.unsignedHexToDecimal(objectArray[i]['传感器类型'])
        const sensorId = this.unsignedHexToDecimal(objectArray[i]['传感器ID'])  //----------------------------------//
        switch (type) {

          case 12: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['安装位置'] = this.installPosition(sensorId) //-------------------------------------------//
            objectArray[i]['传感器类型'] = '智能沉降仪(12)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 16,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = this.unsignedHexToDecimal(objectArray[i]['沉降值(mm)']) / 100,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 72: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId) //-------------------------------------------//
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '温湿度(72)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 10,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = this.unsignedHexToDecimal(objectArray[i]['湿度(%)']) / 10,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 73: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId) //-------------------------------------------//
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '温度计(73)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 10,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;

          case 76: objectArray[i]['传感器ID'] = this.unsignedHexToDecimal(objectArray[i]['传感器ID']),
            objectArray[i]['安装位置'] = this.installPosition(sensorId) //-------------------------------------------//
            objectArray[i]['解调仪类型'] = '总线式解调仪'
            objectArray[i]['传感器类型'] = '表面式倾角计(76)',
              objectArray[i]['温度(°C)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['温度(°C)'])) / 10,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['X向倾角(°)'])) / 1000,
              objectArray[i]['Y向倾角(°)'] = this.signedHexToDecimal(this.getHexComplement(objectArray[i]['Y向倾角(°)'])) / 1000
            break;

          // case 0: delete objectArray[i]
          //   break;
          case 0: objectArray[i]['采集时间'] = null,
            objectArray[i]['解调仪地址'] = null,
            objectArray[i]['解调仪类型'] = null,
            objectArray[i]['传感器ID'] = null,
            objectArray[i]['安装位置'] = null, //-------------------------------------------//
            objectArray[i]['通道号'] = null,
            objectArray[i]['传感器类型'] = null
            objectArray[i]['温度(°C)'] = null,
              objectArray[i]['频率(Hz)'] = null,
              objectArray[i]['应变值(με)'] = null,
              objectArray[i]['湿度(%)'] = null,
              objectArray[i]['沉降值(mm)'] = null,
              objectArray[i]['X向倾角(°)'] = null,
              objectArray[i]['Y向倾角(°)'] = null
            break;
          default:
            break;
        }
      }
      return objectArray
    },

    // 删除空对象
    removeEmptyObjects(arr) {
      return arr.filter(item => {
        for (let key in item) {
          if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
            return true;
          }
        }
        return false;
      });
    },

    // 保存到MySQL数据库
    async saveToMySQL(tableName, data) {
      try {
        const res = await axios.post('http://localhost:3000/api/insert', {
          table: tableName,
          rows: data
        });
        console.log(`✅ 成功：${res.data.message}`);
      } catch (e) {
        console.error('❌ 失败：' + (e.response?.data?.error || e.message));
      }
    },

    // 获取历史数据
    async getHistoryData(tableName, limit) {
      try {
        if (!tableName || typeof tableName !== 'string') {
          throw new Error('表名必须是有效的字符串');
        }
        if (!Number.isInteger(limit) || limit < 1 || limit > 20000) {
          throw new Error('limit 必须是 1-20000 之间的整数');
        }
        const res = await fetch(`http://localhost:3000/api/query/${tableName}?limit=${limit}`);
        if (!res.ok) {
          throw new Error(`HTTP 错误: ${res.status}`);
        }
        const result = await res.json();
        return result.data || [];
      } catch (err) {
        console.error('获取历史数据错误:', err);
        throw err;
      }
    },

    // 检查历史数据（应力值为0时判断设备异常还是通讯异常）
    checkHistoryData(historyData, location) {
      const recentFive = [];
      for (let i = 0; i < historyData.length; i++) {
        const item = historyData[i];
        if (item && item['安装位置'] === location) {
          recentFive.push(item);
          if (recentFive.length === 5) {
            break;
          }
        }
      }
      let isDeviceAbnormal = false;
      if (recentFive.length >= 5) {
        isDeviceAbnormal = true;
        for (let i = 0; i < recentFive.length; i++) {
          const strain = recentFive[i]['应变值'];
          if (strain !== 0 && strain !== '0') {
            isDeviceAbnormal = false;
            break;
          }
        }
      }
      if (isDeviceAbnormal) {
        return '应变值为0，设备异常';
      } else {
        return '应变值为0，通讯异常';
      }
    },

    // 处理沉降数据（每个沉降值减去基准值）
    processSettlementData(sensorData) {
      const referenceItem = sensorData.find(item => item["传感器ID"] === 42461);
      const referenceSettlement = referenceItem ? referenceItem["沉降值(mm)"] : 0;
      return sensorData
        .filter(item => item["沉降值(mm)"] !== null)
        .map(item => ({
          安装位置: item["安装位置"],
          传感器ID: item["传感器ID"],
          沉降值: item["沉降值(mm)"] - referenceSettlement
        }));
    },

    // 检查沉降值变化
    async checkSettlementChange(data1, data2, threshold) {
      const data1Map = new Map();
      data1.forEach(item => {
        data1Map.set(item.传感器ID, item);
      });
      const settlementStatusArr = [];
      data2.forEach(item2 => {
        const item1 = data1Map.get(item2.传感器ID);
        if (!item1) {
          return;
        }
        const change = item2.沉降值 - item1.沉降值;
        const absChange = Math.abs(change);
        const isOverThreshold = absChange > threshold;
        const status = isOverThreshold ? 1 : 0;
        const result = {
          安装位置: item2.安装位置,
          类型: '沉降仪',
          状态: status,
          传感器ID: item2.传感器ID,
          初始值: item1.沉降值,
          当前值: item2.沉降值,
          变化值: change
        };
        settlementStatusArr.push(result);
      });
      const totalStatus = settlementStatusArr.some(r => r.状态 === 1) ? 1 : 0;
      return {
        totalStatus,
        settlementStatusArr
      };
    },

    // 与校验表比较（应力和倾角传感器健康状态判断）
    async compareWithCheckTable(newData, checkTable, threshold = 20) {
      if (!Array.isArray(newData) || !Array.isArray(checkTable)) {
        throw new Error("输入数据必须是数组");
      }
      const checkMap = {};
      checkTable.forEach(item => {
        if (item["安装位置"] !== undefined) {
          checkMap[item["安装位置"]] = item;
        }
      });
      const createResult = (位置, 类型, 状态, 应变值, 异常) => ({
        安装位置: 位置,
        类型: 类型,
        状态: 状态,
        应变值: 应变值,
        异常情况: 异常
      });
      const calcPercent = (newVal, checkVal) =>
        (newVal - checkVal) / Math.abs(checkVal) * 100;
      const getDeviceFailureReason = async (position) => {
        const straintiltHistoryData = await this.getHistoryData('sensorstatus', 1020);
        const result = await this.checkHistoryData(straintiltHistoryData, position);
        return result;
      };
      const analyzeStrain = async (newItem, checkItem) => {
        const position = newItem["安装位置"];
        const newVal = newItem["应变值(με)"];
        const checkVal = checkItem["应变值(με)"];
        if (newVal === null || checkVal === null) {
          return createResult(position, "应力计", null, null, "无有效应变数据");
        }
        if (checkVal === 0) {
          return createResult(position, "应力计", null, null, "校验值为0,设备损坏");
        }
        if (newVal === 0) {
          const reason = await getDeviceFailureReason(position);
          return createResult(position, "应力计", 2, newVal, reason);
        }
        const change = calcPercent(newVal, checkVal);
        const isAbnormal = change > threshold && change !== 100;
        if (isAbnormal) {
          return createResult(position, "应力计", 1, newVal, `应变值变化${change.toFixed(2)}%,数据异常`);
        }
        return createResult(position, "应力计", 0, newVal, "无");
      };
      const analyzeTilt = async (newItem, checkItem) => {
        const position = newItem["安装位置"];
        const newX = newItem["X向倾角(°)"];
        const newY = newItem["Y向倾角(°)"];
        const checkX = checkItem["X向倾角(°)"];
        const checkY = checkItem["Y向倾角(°)"];
        if (newX === null || newY === null || checkX === null || checkY === null) {
          return createResult(position, "倾角计", null, null, "无有效倾角数据");
        }
        if (checkX === 0 && checkY === 0) {
          return createResult(position, "倾角计", null, null, "校验值为0,设备损坏");
        }
        if (newX === 0 || newY === 0) {
          const reason = await getDeviceFailureReason(position);
          return createResult(position, "倾角计", 2, null, reason);
        }
        const xChange = checkX !== 0 ? calcPercent(newX, checkX) : 0;
        const yChange = checkY !== 0 ? calcPercent(newY, checkY) : 0;
        const xAbnormal = xChange > threshold;
        const yAbnormal = yChange > threshold;
        if (xAbnormal || yAbnormal) {
          return createResult(position, "倾角计", 1, null,
            `X向倾角变化${xChange.toFixed(2)}%；Y向倾角变化${yChange.toFixed(2)}%`);
        }
        return createResult(position, "倾角计", 0, null, "无");
      };
      const processAll = async () => {
        const results = [];
        for (const newItem of newData) {
          const position = newItem["安装位置"];
          const checkItem = checkMap[position];
          if (!checkItem) {
            continue;
          }
          const hasStrain = newItem["应变值(με)"] !== undefined && newItem["应变值(με)"] !== null;
          const hasTiltX = newItem["X向倾角(°)"] !== undefined && newItem["X向倾角(°)"] !== null;
          const hasTiltY = newItem["Y向倾角(°)"] !== undefined && newItem["Y向倾角(°)"] !== null;
          const hasTilt = hasTiltX || hasTiltY;
          let result = null;
          if (hasStrain) {
            result = await analyzeStrain(newItem, checkItem);
          } else if (hasTilt) {
            result = await analyzeTilt(newItem, checkItem);
          } else {
            continue;
          }
          if (result) {
            results.push(result);
          }
        }
        return results;
      };
      return processAll();
    },

    // 状态处理
    statusProcess(sensorStatus, strainCoefficients) {
      const tiltResults = [];
      const strainResults = [];
      sensorStatus.forEach(result => {
        if (result.状态 === null) return;
        if (result["类型"] === "倾角计") {
          tiltResults.push(result);
        } else if (result["类型"] === "应力计") {
          strainResults.push(result);
        }
      });
      const tiltProcessed = {
        type: "倾角值",
        status: tiltResults.length > 0 && tiltResults.every(item => item.状态 === 1) ? 1 : 0
      };
      let weightedSum = 0;
      strainResults.forEach((result, index) => {
        if (result["状态"] === 1) {
          const positionMatch = result.安装位置.match(/GBC(\d+)/);
          if (positionMatch && positionMatch[1]) {
            const positionIndex = parseInt(positionMatch[1]) - 1;
            if (positionIndex >= 0 && positionIndex < strainCoefficients.length) {
              const coefficient = strainCoefficients[positionIndex];
              weightedSum += coefficient * (result.应变值 || 0);
            }
          }
        }
      });
      return {
        tiltTotalStatus: tiltProcessed,
        strainSum: weightedSum
      };
    },

    // 健康评估
    healthEva(totalStatus, settlementTotalStatus) {
      if (totalStatus.tiltTotalStatus.status || settlementTotalStatus) {
        console.log(totalStatus.tiltTotalStatus.status);
        console.log(settlementTotalStatus);
        return 'R';
      } else {
        console.log(totalStatus.strainSum);
        if (totalStatus.strainSum >= 0 && totalStatus.strainSum < 1040.376764200341) {
          return 'G';
        } else if (totalStatus.strainSum >= 1040.376764200341 && totalStatus.strainSum < 3121.1302926010226) {
          return 'Y';
        } else if (totalStatus.strainSum >= 3121.1302926010226 && totalStatus.strainSum < 7282.6373494023865) {
          return "O";
        } else {
          return "R";
        }
      }
    },

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

    async sendForceCommand(forceCommand, idx) {
      const port = this.connectedPorts[idx].port;
      let writer, reader;
      const timeout = 100;
      const start = Date.now();
      let receivedData = [];
      try {
        writer = await port.writable.getWriter();
        reader = await port.readable.getReader();
        await writer.write(forceCommand);
        while (timeout) {
          const res = await Promise.race([
            reader.read(),
            new Promise(resolve => setTimeout(() => resolve({ value: null, done: false }), timeout))
          ]);
          if (res.value) receivedData = receivedData.concat(Array.from(res.value));
          if (res.done || (Date.now() - start > timeout)) break;
        }
      } finally {
        try { writer && writer.releaseLock(); } catch(e) {
          console.debug('release writer failed', e);
        }
        try { reader && reader.releaseLock(); } catch(e) {
          console.debug('release reader failed', e);
        }
      }
      return receivedData;
    },

    async readData(gainCommand, idx, timeout = 500) {
      const port = this.connectedPorts[idx].port;
      let writer, reader;
      const start = Date.now();
      let receivedData = [];
      try {
        writer = await port.writable.getWriter();
        reader = await port.readable.getReader();
        await writer.write(gainCommand);
        while (timeout) {
          const res = await Promise.race([
            reader.read(),
            new Promise(resolve => setTimeout(() => resolve({ value: null, done: false }), timeout))
          ]);
          if (res.value) receivedData = receivedData.concat(Array.from(res.value));
          if (res.done || (Date.now() - start > timeout)) break;
        }
        return receivedData;
      } finally {
        try { writer && writer.releaseLock(); } catch(e) {
          console.debug('release writer failed', e);
        }
        try { reader && reader.releaseLock(); } catch(e) {
          console.debug('release reader failed', e);
        }
      }
    },

    waitSeconds(seconds) {
      return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    },
    async progress() {
      this.flag = false
      // 总时间（秒）
      const totalTime = 80;
      // 每次更新的时间间隔（毫秒）
      const intervalTime = 100;
      // 计算每次更新的进度百分比
      const increment = (100 / (totalTime * 1000 / intervalTime));
      // 当前进度
      this.currentProgress = 0;

      // 设置定时器，每隔 intervalTime 毫秒更新一次进度条
      const interval = setInterval(async () => {
        // this.currentProgress = Math.round(this.currentProgress);
        // 增加当前进度
        this.currentProgress += increment;
        // 更新进度条的宽度
        // this.progressBar.style.width = `${currentProgress}%`;
        // 更新进度条内的文本
        

        // 当进度达到 100% 时，清除定时器
        if (this.currentProgress >= 100) {
          clearInterval(interval);
          this.currentProgress = Math.round(this.currentProgress);
          await this.waitSeconds(0.1)
          // progressContainer.style.display = 'none'
          // progressBar.style.display = 'none'
          this.showProgress = false;
          this.flag = true
        }
      }, intervalTime);

    },
    async main() {
      try {
        const forceCommands = [
          new Uint8Array([0x01,0x06,0x00,0x00,0x00,0x31,0x48,0x1E]),
          new Uint8Array([0x02,0x06,0x00,0x00,0x00,0x31,0x48,0x2D]),
          new Uint8Array([0x03,0x06,0x00,0x00,0x00,0x31,0x49,0xFC]),
          new Uint8Array([0x04,0x06,0x00,0x00,0x00,0x31,0x48,0x4B]),
          new Uint8Array([0x05,0x06,0x00,0x00,0x00,0x31,0x49,0x9A]),
          new Uint8Array([0x06,0x06,0x00,0x00,0x00,0x31,0x49,0xA9]),
          new Uint8Array([0x08,0x06,0x00,0x00,0x00,0x31,0x48,0x87]),
          new Uint8Array([0x07,0x06,0x00,0x00,0x00,0x31,0x48,0x78]),
          new Uint8Array([0x09,0x06,0x00,0x00,0x00,0x31,0x49,0x56])
        ];
        const gainCommands = [
          new Uint8Array([0x01,0x04,0x00,0x00,0x00,0x3C,0xF0,0x1B]),
          new Uint8Array([0x01,0x04,0x00,0x3c,0x00,0x44,0x30,0x35]),
          new Uint8Array([0x02,0x04,0x00,0x00,0x00,0x3C,0xF0,0x28]),
          new Uint8Array([0x02,0x04,0x00,0x3c,0x00,0x44,0x30,0x06]),
          new Uint8Array([0x03,0x04,0x00,0x00,0x00,0x3C,0xF1,0xF9]),
          new Uint8Array([0x03,0x04,0x00,0x3C,0x00,0x44,0x31,0xD7]),
          new Uint8Array([0x04, 0x04, 0x00, 0x00, 0x00, 0x3C, 0xF0, 0x4E]),
          new Uint8Array([0x04, 0x04, 0x00, 0x3C, 0x00, 0x44, 0x30, 0x60]),
          new Uint8Array([0x05, 0x04, 0x00, 0x00, 0x00, 0x3C, 0xF1, 0x9F]),
          new Uint8Array([0x05, 0x04, 0x00, 0x3C, 0x00, 0x44, 0x31, 0xB1]),
          new Uint8Array([0x06, 0x04, 0x00, 0x00, 0x00, 0x3C, 0xF1, 0xAC]),
          new Uint8Array([0x06, 0x04, 0x00, 0x3C, 0x00, 0x44, 0x31, 0x82]),
          new Uint8Array([0x07, 0x04, 0x00, 0x00, 0x00, 0x3C, 0xF0, 0x7D]),
          new Uint8Array([0x07, 0x04, 0x00, 0x3C, 0x00, 0x44, 0x30, 0x53]),
          new Uint8Array([0x08, 0x04, 0x00, 0x00, 0x00, 0x68, 0xf1, 0x7d]),
          new Uint8Array([0x09, 0x04, 0x00, 0x00, 0x00, 0x68, 0xf0, 0xac]),
        ];

        for (let i = 0; i < this.connectedPorts.length; i++) {
          for (let j = 0; j < forceCommands.length; j++) {
            await this.sendForceCommand(forceCommands[j], i);
          }
        }

        await this.waitSeconds(40);

        let objArr = [];
        for (let i = 0; i < this.connectedPorts.length; i++) {
          for (let j = 0; j < gainCommands.length; j++) {
            const receivedData = await this.readData(gainCommands[j], i);
            if (receivedData.length !== 0) {
              const responseData = receivedData.map(b => b.toString(16).padStart(2, '0')).join(' ');
              const res = this.verifyCode(responseData);
              if (Array.isArray(res) && res.length === 2) {
                const [jointArr, slaveAddress] = res;
                let parsed;
                if (receivedData.length < 200) parsed = this.vibraParse(jointArr, slaveAddress);
                else parsed = this.BUSParse(jointArr, slaveAddress);
                objArr = objArr.concat(parsed);
              }
            }
          }
        }
        // return objArr;
        return [objArr, this.flag]
      } catch (error) {
        console.error('main 出错', error);
        this.responseText = `发送/接收出错: ${error.message || error}`;
        return [];
      }
    },

    async startMain() {
      if (!this.connectedPorts[0]) {
        alert('未连接端口');
        return;
      } else {
        this.showProgress = true;
        this.progress();
        if (this.connectedPorts.length === 0) {
          alert('没有已连接的端口');
          return;
        }
        this.gainDisabled = true;
        try {
          const [finalArr, flag] = await this.main();
          
          // 清除数组中的空元素
          const sensorData = this.removeEmptyObjects(finalArr);
          
          // 返回应力计和倾角计传感器状态
          const straintiltStatus = await this.compareWithCheckTable(sensorData, this.checkTable, 20);
          console.log('倾角计与应力计状态', straintiltStatus);
          
          // 处理沉降值传感器
          // 将每个沉降值减去基准沉降值
          const settlementProcessedData = this.processSettlementData(sensorData);
          // 获取处理后的基准沉降值的每个沉降值
          const settlementHistoryData = await this.getHistoryData('settlementHistoryData', 7);
          console.log('沉降值历史数据', settlementHistoryData);
          // 将实时处理后的沉降值与上次处理后的沉降值对比
          const settlementObject = await this.checkSettlementChange(settlementProcessedData, settlementHistoryData, 50);
          
          const settlementTotalStatus = settlementObject.totalStatus; // 沉降仪的总状态
          const settlementStatusArray = settlementObject.settlementStatusArr; // 各个沉降仪的状态
          console.log('沉降仪各个状态数组', settlementStatusArray);
          
          // 形变系数
          const strainCoefficients = [
            1000 * 0.173773943450445, 1000 * 0.135335283236613, 1000 * 0.105399224561864, 1000 * 0.0820849986238988,
            1000 * 0.0639278612067076, 1000 * 0.0497870683678639, 1000 * 0.0387742078317220, 1000 * 0.0301973834223185,
            1000 * 0.0235177458560091, 1000 * 0.0183156388887342, 1000 * 0.0142642339089993, 1000 * 0.0111089965382423,
            1000 * 0.00865169520312063, 1000 * 0.00673794699908547, 1000 * 0.00524751839918138, 1000 * 0.00408677143846407
          ];
          
          // 对倾角和应力传感器进行处理
          // 返回倾角计，应力计总状态以及异常应力计的应变值总和
          const totalStatus = this.statusProcess(straintiltStatus, strainCoefficients);
          console.log(totalStatus);
          
          // 对整个系统进行健康评估
          const totalHealthStatus = this.healthEva(totalStatus, settlementTotalStatus);
          console.log('系统健康状态:', totalHealthStatus);
          // 返回 'G' 'Y' 'O' 'R'
          
          // 保存数据到数据库
          // 导入所有传感器最原始数据
          await this.saveToMySQL('data', sensorData);
          
          // 延迟1000ms再导入状态数据（避免事务冲突）
          setTimeout(async () => {
            // 导入应力倾角传感器状态数据
            await this.saveToMySQL('status', straintiltStatus);
          }, 1000);
          
          // 延迟1000ms再导入状态数据（避免事务冲突）
          setTimeout(async () => {
            // 导入减去基准沉降值的沉降仪数据
            await this.saveToMySQL('settlementHistoryData', settlementProcessedData);
          }, 1000);
          
          // 延迟1000ms再导入状态数据（避免事务冲突）
          setTimeout(async () => {
            // 导入沉降仪状态数据
            await this.saveToMySQL('settlementStatus', settlementStatusArray);
          }, 1000);
          
          // 过滤掉 null/undefined/非对象项，避免后续渲染出错
          const safeArr = Array.isArray(finalArr) ? finalArr.filter(item => item && typeof item === 'object') : [];
          
          this.responseText = JSON.stringify(safeArr, null, 2);
          
          if (flag) {
            await this.tableShow(finalArr);
          }
        } finally {
          this.gainDisabled = false;
        }
      }
    },

    async closeAllPorts() {
      this.showProgress = false;
      this.currentProgress = 0;
      for (const item of this.connectedPorts) {
        try {
          if (item.port.readableLocked) {
            try { await item.port.readable.cancel(); } catch(e) {
              console.debug('cancel failed for port', item.port, e);
            }
          }
          if (item.port.writableLocked) {
            try { item.port.writable.getWriter().releaseLock(); } catch(e) {
              console.debug('releaseLock failed for port', item.port, e);
            }
          }
          if (item.port.close) await item.port.close();
        } catch (e) {
          console.warn('关闭端口失败', e);
        }
      }
      this.connectedPorts = [];
      this.responseText = '已关闭所有端口';
    }
  }
};
</script>



<style scoped>
.serial-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1vw;
  padding: 1vw;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.serial-page > * {
  flex-shrink: 0;
}

h1 {
  font-size: 1.5vw;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 1vw 0;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 0.75vw;
  margin-bottom: 1vw;
}

.button-section {
  display: flex;
  gap: 0.75vw;
}

.control-btn {
  padding: 0.5vw 1vw;
  font-size: 0.7vw;
  color: #ffffff;
  background: linear-gradient(180deg, #0066cc 0%, #004499 100%);
  border: 1px solid #0088ff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.control-btn:hover {
  background: linear-gradient(180deg, #0088ff 0%, #0066cc 100%);
  border-color: #00aaff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 136, 255, 0.4);
  transform: translateY(-2px);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.port-item {
  margin: 0.5vw 0;
  padding: 0.5vw;
  border: 1px solid rgba(0, 140, 255, 0.6);
  border-radius: 6px;
  background-color: rgba(0, 30, 60, 0.8);
  color: #ffffff;
}

.port-item h3 {
  margin: 0;
  font-size: 0.8vw;
  color: #ffffff;
}

pre {
  background: rgba(0, 40, 80, 0.7);
  padding: 1vw;
  max-height: 22vh;
  font-size: 0.7vw;
  color: #ffffff;
  overflow: auto;
  white-space: pre-wrap;
  border: 1px solid rgba(0, 140, 255, 0.4);
  border-radius: 6px;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

/* 进度条容器样式 */
.progress-container {
  width: 32vw;
  height: 4vh;
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.4);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 1vh;
  margin-bottom: 1vh;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

/* 进度条样式 */
.progress-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #00cc66 0%, #009944 100%);
  text-align: center;
  line-height: 4vh;
  color: #ffffff;
  transition: width 0.3s ease;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

/* 数据表格区域 */
.table-section {
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.4);
  border-radius: 6px;
  overflow-x: auto;
  margin: 1vw 0;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

.stats-info {
  padding: 0.8vw;
  background-color: rgba(0, 60, 120, 0.8);
  border-bottom: 1px solid rgba(0, 140, 255, 0.4);
  font-size: 0.8vw;
  color: #ffffff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7vw;
  white-space: nowrap;
}

.data-table th {
  background: linear-gradient(to bottom, rgba(0, 80, 160, 0.8) 0%, rgba(0, 60, 120, 0.8) 100%);
  border: 1px solid rgba(0, 140, 255, 0.4);
  padding: 0.6vw 1vw;
  text-align: center;
  font-weight: normal;
  color: #ffffff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

.data-table td {
  border: 1px solid rgba(0, 140, 255, 0.4);
  padding: 0.5vw 1vw;
  text-align: center;
  color: #ffffff;
}

.data-table tr:nth-child(even) {
  background-color: rgba(0, 50, 100, 0.6);
}

.data-table tr:hover {
  background-color: rgba(0, 80, 160, 0.6);
}

/* 列宽控制 */
.col-time {
  min-width: 140px;
}

.col-addr {
  min-width: 110px;
}

.col-type {
  min-width: 100px;
}

.col-id {
  min-width: 80px;
}

.col-pos {
  min-width: 120px;
}

.col-channel {
  min-width: 60px;
}

.col-sensor {
  min-width: 90px;
}

.col-temp {
  min-width: 70px;
}

.col-humidity {
  min-width: 60px;
}

.col-freq {
  min-width: 80px;
}

.col-strain {
  min-width: 90px;
}

.col-settle {
  min-width: 90px;
}

.col-tiltx {
  min-width: 90px;
}

.col-tilty {
  min-width: 90px;
}

.port-list-section {
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.4);
  border-radius: 6px;
  padding: 1vw;
  margin-bottom: 1vw;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

/* 时间选择表格 */
table {
  border-collapse: collapse;
  width: 96%;
  margin: 1vw 0;
  background-color: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 140, 255, 0.4);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
}

table, th, td {
  border: 1px solid rgba(0, 140, 255, 0.4);
}

th, td {
  border: 1px solid rgba(0, 140, 255, 0.4);
  padding: 0.5vw;
  text-align: left;
  color: #ffffff;
}

th {
  background-color: rgba(0, 60, 120, 0.8);
}

h2 {
  /* margin-top: 0.3vw; */
  margin-bottom: 0.5vw;
  font-size: 1vw;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

input[type="checkbox"] {
  margin-right: 0.4vw;
  transform: scale(1.2);
}
</style>
