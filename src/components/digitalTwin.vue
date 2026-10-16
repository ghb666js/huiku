<template>
  <div v-show="open" class="dt">
    <div class="dt-left">
      <div class="panel-head">
        <span class="ph-bar"></span>
        <h3 class="dt-bar-title">传感器总览</h3>
        <span class="ph-mark"></span>
      </div>

      <!-- 模块一:传感器种类统计 -->
      <div class="mod">
        <div class="mod-title">传感器种类统计</div>
        <div class="mod-body">
          <div class="type-grid">
            <div v-for="c in categories" :key="c.name" class="type-item">
              <div class="type-emble" :style="{ background: c.bg }"></div>
              <div class="type-name">{{ c.name }}</div>
              <div class="type-count"><b>{{ c.count }}</b>{{ c.unit }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块二:预警状态统计 -->
      <div class="mod">
        <div class="mod-title">传感器预警状态统计</div>
        <div class="mod-body">
          <div class="ring-row">
            <div v-for="s in statusStats" :key="s.label" class="ring-cell">
              <div class="ring" :style="ringStyle(s.color, s.count, statusTotal)">
                <span>{{ s.count }}</span>
              </div>
              <div class="ring-label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块三:预警明细滚动 -->
      <div class="mod mod-list">
        <div class="mod-title">预警传感器明细(非正常)</div>
        <div class="mod-body table-body">
          <div class="warn-wrap">
            <div class="warn-inner">
              <div v-for="(w, i) in warnList" :key="'a' + i" class="warn-row" :style="{ borderLeftColor: colorOf(w.eff) }">
                <span class="w-type">{{ w.type }}</span>
                <span class="w-id">{{ w.id }}</span>
                <span class="w-state" :style="{ color: colorOf(w.eff) }">{{ stateText(w.eff) }}</span>
                <span class="w-layer">层{{ w.layer }}</span>
                <span class="w-data">{{ w.data }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间弹性留白区(留给3D场景,不拦截操作) -->
    <div class="dt-center"></div>

    <!-- 右边:层级选取 + 折线图 平分, 返回在最下方 -->
    <div class="dt-right">
      <div class="dt-half">
        <div class="panel-head">
          <span class="ph-bar"></span>
          <div class="dt-layer-title">选择层</div>
          <span class="ph-mark"></span>
        </div>
        <div class="layer-col">
          <button v-for="n in 16" :key="n" class="layer-btn" :class="{ on: activeLayer === n }" @click="chooseLayer(n)">
            {{ pad(n) }}
          </button>
        </div>
      </div>
      <div class="dt-half">
        <div class="dt-chart-title">
          <span v-if="chartMain" class="dt-chart-main">{{ chartMain }}</span>
          <span class="dt-chart-sub">近10次数据</span>
        </div>
        <div class="dt-chart" ref="mini"></div>
      </div>
      <button class="dt-back" title="返回" @click="$emit('close')">
        <img :src="require('@/assets/image/back.png')" alt="返回" class="dt-back-img">
      </button>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import { selectSensorLayer, exitSensorLayers } from '@/three/sensorLayers';
import { REMOTE_QUERY_SETTLEMENT, REMOTE_QUERY_TILT, REMOTE_QUERY_STRAIN } from '@/constants/api';

const STATUS_COLORS = { 0: '#27ae60', 1: '#ffc107', 2: '#ff7f00', 3: '#ff3b30' };
const STATUS_TEXT = { 0: '正常', 1: '数据异常', 2: '设备异常', 3: '设备损坏' };

export default {
  name: 'digitalTwin',
  props: {
    open: { type: Boolean, default: false },
    mini: { type: Object, default: () => ({ title: '', series: [], categories: [], fulls: [] }) }
  },
  data() {
    return {
      activeLayer: null,
      miniChart: null,
      categories: [
        { name: '应力计', count: 196, unit: '套', bg: 'linear-gradient(135deg,#27ae60,#8ee39a)' },
        { name: '倾角计', count: 8, unit: '台', bg: 'linear-gradient(135deg,#ffc107,#ffe28a)' },
        { name: '沉降仪', count: 7, unit: '套', bg: 'linear-gradient(135deg,#ff7f00,#ffc78a)' },
        { name: '温湿度计', count: 4, unit: '台', bg: 'linear-gradient(135deg,#ff3b30,#ff9a94)' }
      ],
      statusStats: [
        { label: '正常', key: 0, color: '#27ae60', count: 0 },
        { label: '数据异常', key: 1, color: '#ffc107', count: 0 },
        { label: '设备异常', key: 2, color: '#ff7f00', count: 0 },
        { label: '设备损坏', key: 3, color: '#ff3b30', count: 0 }
      ],
      warnList: [],
      timer: null
    };
  },
  computed: {
    // 折线图大标题: 传感器种类 + ID
    chartMain() {
      const m = this.mini || {};
      const s = (m.series || []).map(x => x.name || '').join(' ');
      const joined = s + ' ' + (m.title || '');
      let kind = '传感器';
      if (/倾角/.test(joined)) kind = '倾角计';
      else if (/沉降/.test(joined)) kind = '沉降仪';
      else if (/应变|应力/.test(joined)) kind = '应变计';
      else if (/温度/.test(joined)) kind = '温湿度计';
      const idMatch = /(\d{4,})/.exec(m.title || '');
      const id = idMatch ? idMatch[1] : '';
      if (id) return kind + ' ' + id;
      if (s) return kind + '（模拟数据）'; // 尚未点选传感器时的固定模拟数据
      return '';
    },
    statusTotal() {
      return this.statusStats.reduce((a, s) => a + (s.count || 0), 0);
    }
  },
  watch: {
    open(v) {
      if (v) {
        this.fetchAll();
        this.timer = setInterval(() => this.fetchAll(), 60000);
        this.$nextTick(() => this.drawMini());
      } else if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
        exitSensorLayers();
      }
    },
    mini: {
      handler() {
        if (this.open) this.$nextTick(() => this.drawMini());
      },
      deep: true
    }
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.unbindResize();
    if (this.miniChart) { this.miniChart.dispose(); this.miniChart = null; }
    exitSensorLayers();
  },
  methods: {
    pad(n) { return String(n).padStart(2, '0'); },
    bindResize(el) {
      if (this._resizeBound) return;
      this._resizeBound = true;
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => {
          if (this.miniChart && el && el.offsetParent !== null) this.miniChart.resize();
        });
        this._ro.observe(el);
      }
      this._onWinResize = () => { if (this.miniChart) this.miniChart.resize(); };
      window.addEventListener('resize', this._onWinResize);
    },
    unbindResize() {
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      if (this._onWinResize) {
        window.removeEventListener('resize', this._onWinResize);
        this._onWinResize = null;
      }
      this._resizeBound = false;
    },
    ensureMiniChart() {
      if (!this.miniChart && this.$refs.mini) {
        this.miniChart = echarts.init(this.$refs.mini);
        this.bindResize(this.$refs.mini);
      }
    },
    hexToRgba(hex, a) {
      const m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex);
      if (!m) return `rgba(0,229,255,${a})`;
      const n = (i) => parseInt(m[i], 16);
      return `rgba(${n(1)},${n(2)},${n(3)},${a})`;
    },
    drawMini() {
      if (!this.open || !this.$refs.mini) return;
      this.ensureMiniChart();
      if (!this.miniChart) return;
      const m = this.mini || {};
      let series = m.series || [];
      let categories = m.categories || [];
      let fulls = m.fulls || [];
      // 进入模块但尚未点选传感器时,显示固定的模拟数据
      if (!series.length) {
        series = [{ name: '应变值(με)', values: [3180, 3210, 3205, 3240, 3230, 3270, 3260, 3290, 3320, 3310] }];
        categories = ['08:00', '08:10', '08:20', '08:30', '08:40', '08:50', '09:00', '09:10', '09:20', '09:30'];
        fulls = categories.map(t => '2026-09-06 ' + t + ':00');
      }
      const colors = ['#00d4ff', '#f7c948', '#6fe3c1'];
      this.miniChart.resize();
      this.miniChart.setOption({
        backgroundColor: 'transparent',
        color: colors,
        legend: {
          top: 2,
          right: 6,
          textStyle: { color: '#bfe0f5', fontSize: 10 },
          itemWidth: 16,
          itemHeight: 9
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(6,20,38,0.94)',
          borderColor: 'rgba(0,190,255,0.5)',
          textStyle: { color: '#e6f4ff' },
          axisPointer: { lineStyle: { color: 'rgba(0,220,255,0.6)' } },
          formatter: (params) => {
            const idx = params && params.length ? params[0].dataIndex : 0;
            let html = fulls[idx] || categories[idx] || '';
            (params || []).forEach(p => {
              const v = p.value === null || p.value === undefined ? '--' : p.value;
              html += '<br/>' + p.marker + p.seriesName + '：' + v;
            });
            return html;
          }
        },
        grid: { left: 36, right: 16, top: 26, bottom: 30 },
        xAxis: {
          type: 'category', data: categories,
          boundaryGap: false,
          axisLabel: { color: '#a8d6f0', fontSize: 10 },
          axisLine: { lineStyle: { color: 'rgba(0,190,255,0.4)' } }
        },
        yAxis: {
          type: 'value',
          name: series.length === 1 ? series[0].name : '',
          nameTextStyle: { color: '#a8d6f0', fontSize: 10 },
          axisLabel: { color: '#cfe6f5', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(0,150,255,0.15)' } }
        },
        series: (series || []).map((s, i) => {
          const color = colors[i % colors.length];
          return {
            name: s.name,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            connectNulls: true,
            data: s.values || [],
            lineStyle: { width: 2, color },
            itemStyle: { color, borderColor: '#ffffff' },
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: this.hexToRgba(color, 0.32) },
                  { offset: 1, color: this.hexToRgba(color, 0.02) }
                ]
              }
            }
          };
        })
      }, true);
    },
    colorOf(eff) { return STATUS_COLORS[eff] || '#888'; },
    stateText(eff) { return STATUS_TEXT[eff] || '未知'; },
    ringStyle(color, count, total) {
      const pct = total ? Math.round((count / total) * 100) : 0;
      return {
        background: `conic-gradient(${color} 0 ${pct}%, rgba(0,190,255,0.16) ${pct}% 100%)`,
        boxShadow: `0 0 0.6vw ${this.hexToRgba(color, 0.55)}, inset 0 0 0.3vw rgba(0,0,0,0.4)`
      };
    },
    effOf(raw) {
      if (raw === 0 || raw === '0') return 0;
      if (raw === 1 || raw === '1') return 1;
      if (raw === 2 || raw === '2') return 2;
      return 3;
    },
    format4(x) {
      if (x === null || x === undefined || x === '') return '--';
      const n = Number(x);
      if (Number.isNaN(n)) return String(x);
      return n.toFixed(4);
    },
    // 由安装位置提取所在层,如 GBC07-B-R -> 07
    layerOf(pos) {
      const m = /GBC(\d+)/.exec(pos || '');
      return m ? this.pad(parseInt(m[1], 10)) : '--';
    },
    summarize(row, type) {
      if (/沉降/.test(type)) return `变化值:${this.format4(row['变化值'])} 当前值:${this.format4(row['当前值'])}`;
      if (/倾角/.test(type)) return `X:${this.format4(row['X向倾角(°)'])}° Y:${this.format4(row['Y向倾角(°)'])}°`;
      if (/应力|应变/.test(type)) return `应变值:${this.format4(row['应变值'])}`;
      return this.format4(row['应变值']) + ' ' + this.format4(row['当前值']);
    },
    async fetchAll() {
      const get = async (url) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        return (Array.isArray(j) ? j : (j && j.data)) || [];
      };
      try {
        const [settle, tilt, strain] = await Promise.all([
          get(REMOTE_QUERY_SETTLEMENT),
          get(REMOTE_QUERY_TILT),
          get(REMOTE_QUERY_STRAIN)
        ]);
        const rows = [...settle, ...tilt, ...strain];
        const stats = this.statusStats.map(s => ({ ...s, count: 0 }));
        const list = [];
        rows.forEach((row) => {
          const eff = this.effOf(row['状态']);
          const st = stats.find(s => s.key === eff);
          if (st) st.count++;
          if (eff !== 0) {
            const type = row['类型'] || row['传感器类型'] || '传感器';
            list.push({
              type,
              id: row['传感器ID'],
              eff,
              layer: this.layerOf(row['安装位置']),
              data: this.summarize(row, type)
            });
          }
        });
        this.statusStats = stats;
        this.warnList = list;
      } catch (e) {
        console.error('数字孪生数据获取失败', e);
      }
    },
    chooseLayer(layer) {
      this.activeLayer = layer;
      selectSensorLayer(layer);
    }
  }
};
</script>

<style lang="less" scoped>
// ==================== 帆软智慧园区监控 · 大屏风格 ====================
@bg-deep:   #06152b;
@bg-panel:  linear-gradient(180deg, rgba(12, 34, 58, 0.86) 0%, rgba(7, 20, 38, 0.92) 100%);
@border:    rgba(0, 190, 255, 0.28);
@border-hi: rgba(0, 200, 255, 0.55);
@cyan:      #00d4ff;
@cyan-soft: #20ade5;
@gold:      #f7c948;
@gold-hi:   #ffd23f;
@text:      #e6f4ff;
@text-blue: #a8d6f0;
@text-dim:  #7fb4d6;

.dt {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: space-between;
  z-index: 600;
  pointer-events: none;
  // 顶部一层淡淡的科技氛围光
  background:
    radial-gradient(ellipse at 50% -10%, rgba(0, 190, 255, 0.10), transparent 55%),
    linear-gradient(180deg, rgba(6, 21, 43, 0.28) 0%, transparent 24%);
}

.dt-left, .dt-right {
  pointer-events: auto;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6vw;
  padding: 1vw 0.8vw;
  box-sizing: border-box;
  overflow: hidden;
  background: @bg-panel;
  backdrop-filter: blur(0.3vw);
}

.dt-center {
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  pointer-events: none; // 不拦截中间3D场景操作
}

.dt-left {
  flex: 0 0 24vw;
  border-right: 1px solid @border;
}

.dt-right {
  flex: 0 0 24vw;
  align-items: center;
  overflow: visible; // 允许返回键伸到左边界外
  border-left: 1px solid @border;
}

// ============ 面板标题条（带状 header） ============
.panel-head {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.5vw;
  height: 2.2vw;
  padding: 0 0.7vw;
  margin: 0 -0.2vw 0.1vw;
  background: linear-gradient(90deg, rgba(0, 190, 255, 0.28) 0%, rgba(0, 120, 200, 0.10) 60%, rgba(0, 90, 160, 0.05) 100%);
  border-bottom: 1px solid @border;
  box-shadow: inset 0 -0.7vw 0.9vw -0.8vw rgba(0, 200, 255, 0.45);
  box-sizing: border-box;
  .ph-bar {
    flex: none;
    width: 0.3vw;
    height: 1.1vw;
    border-radius: 0.1vw;
    background: linear-gradient(180deg, @gold-hi, #d99a1c);
    box-shadow: 0 0 0.4vw rgba(247, 201, 72, 0.8);
  }
  .ph-mark {
    flex: none;
    width: 0.4vw; height: 0.4vw;
    margin-left: auto;
    border-radius: 50%;
    background: @cyan;
    box-shadow: 0 0 0.4vw @cyan;
    opacity: 0.85;
  }
}

.dt-bar-title {
  margin: 0;
  color: @text;
  letter-spacing: 0.2vw;
  font-size: 1vw;
  font-weight: 700;
  text-shadow: 0 0 0.5vw rgba(0, 212, 255, 0.7);
}

// ============ 模块卡片 ============
.mod {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(13, 40, 66, 0.45) 0%, rgba(8, 22, 40, 0.55) 100%);
  border: 1px solid @border;
  border-radius: 0; // 直角
  box-shadow: inset 0 0 0.9vw rgba(0, 140, 255, 0.06);
}
.mod-list { flex: 1 1 0; display: flex; flex-direction: column; min-height: 0; }

.mod-title {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.4vw;
  color: @text;
  font-size: 0.75vw;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 0 0.4vw rgba(0, 212, 255, 0.6);
  padding: 0.5vw 0.6vw 0.4vw;
  box-sizing: border-box;
  background: linear-gradient(90deg, rgba(0, 190, 255, 0.16) 0%, rgba(0, 120, 200, 0.05) 70%, transparent 100%);
  border-bottom: 1px solid @border;
}
.mod-title::before {
  content: '';
  flex: none;
  width: 0.2vw;
  height: 0.75vw;
  border-radius: 2px;
  background: linear-gradient(180deg, @cyan, #0080ff);
  box-shadow: 0 0 0.4vw rgba(0, 234, 255, 0.9);
}

.mod-body {
  flex: 1;
  min-height: 0;
  padding: 0.5vw 0.6vw;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// ============ 模块一:每类传感器代表样式(玻璃卡片) ============
.type-grid {
  flex: 1;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5vw;
  overflow-y: auto;
  align-content: start;
}
.type-item {
  position: relative;
  background: linear-gradient(180deg, rgba(14, 58, 84, 0.72) 0%, rgba(7, 27, 50, 0.85) 100%);
  border: 1px solid rgba(0, 190, 255, 0.26);
  border-radius: 0; // 直角
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25vw;
  padding: 0.6vw 0.3vw 0.75vw;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.25s ease;
  // 顶部高光棱线
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 0.1vw;
    background: linear-gradient(90deg, transparent, rgba(0, 220, 255, 0.9), transparent);
    box-shadow: 0 0 0.5vw rgba(0, 220, 255, 0.7);
  }
  // 底部光台
  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 18%; right: 18%;
    height: 0.1vw;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.7), transparent);
    box-shadow: 0 0 0.5vw rgba(0, 212, 255, 0.6);
  }
}
.type-item:hover {
  border-color: @border-hi;
  box-shadow: 0 0 0.7vw rgba(0, 200, 255, 0.28);
  transform: translateY(-0.1vw);
}
.type-emble {
  width: 1.7vw; height: 1.7vw; border-radius: 50%;
  box-shadow: 0 0 0.5vw rgba(0, 220, 255, 0.4);
  position: relative;
}
.type-emble::after {
  content: '';
  position: absolute; inset: 30%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.2) 60%, transparent);
}
.type-name { color: @text-blue; font-size: 0.6vw; letter-spacing: 1px; }
.type-count { color: @cyan-soft; font-size: 0.6vw; }
.type-count b { font-size: 1.1vw; color: @gold; margin-right: 0.15vw; text-shadow: 0 0 0.5vw rgba(247, 201, 72, 0.6); }

// ============ 模块二:环形仪表(甜甜圈) ============
.ring-row {
  flex: 1;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7vw 0.5vw;
  justify-items: center;
  align-content: center;
}
.ring-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35vw;
  text-align: center;
}
.ring {
  position: relative;
  width: 2.6vw; height: 2.6vw; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 0.8vw; font-weight: bold;
  border: 1px solid rgba(255,255,255,0.18);
  // 内芯挖空形成甜甜圈
  &::before {
    content: '';
    position: absolute; inset: 0.3vw;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 30%, #103250, #071a30 80%);
    box-shadow: inset 0 0 0.4vw rgba(0,0,0,0.5);
  }
  span { position: relative; z-index: 1; text-shadow: 0 0 0.4vw rgba(0, 212, 255, 0.5); }
}
.ring-label { color: @text-blue; font-size: 0.55vw; text-align: center; letter-spacing: 1px; }

// ============ 模块三:预警明细表格 ============
.table-body { padding: 0.3vw 0.6vw 0.4vw; }
.warn-wrap { flex: 1; overflow: hidden; position: relative; }
.warn-inner { animation: scrollUp 14s linear infinite; }
.warn-wrap:hover .warn-inner { animation-play-state: paused; }
.warn-row {
  display: flex; align-items: center; gap: 0.3vw;
  font-size: 0.55vw; color: #cde8f7;
  padding: 0.3vw 0.4vw; margin-bottom: 0.2vw;
  border-left: 0.15vw solid;
  background: linear-gradient(90deg, rgba(11, 34, 58, 0.72), rgba(8, 22, 40, 0.5));
  border-radius: 0.2vw;
  white-space: nowrap;
}
.warn-row:nth-child(even) { background: linear-gradient(90deg, rgba(9, 28, 50, 0.72), rgba(7, 18, 34, 0.5)); }
// 五个信息等宽、等间隔
.warn-row > span {
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}
.w-type { color: @text-blue; }
.w-id { color: @cyan; }
.w-state { font-weight: 600; }
.w-layer { color: @gold; }

@keyframes scrollUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

// ============ 右边:返回 + 层级 + 折线图 ============
.dt-back {
  position: absolute;
  left: -2.6vw;  // 放在右栏左边框外侧
  bottom: 1vw;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}
.dt-back-img {
  display: block;
  width: 2.1vw;
  height: 2.1vw;
  object-fit: contain;
  filter: drop-shadow(0 0 0.3vw rgba(0, 200, 255, 0.4));
}
.dt-back:hover .dt-back-img { filter: drop-shadow(0 0 0.5vw rgba(0, 220, 255, 0.8)); }
.dt-back:active { transform: scale(0.92); }

.dt-half {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.dt-right .dt-half + .dt-half {
  border-top: 0.05vw solid @border;
  padding-top: 0.05vw;
  margin-top: 0.2vw;
}

.dt-layer-title {
  flex: none;
  color: @text;
  font-size: 0.8vw;
  font-weight: 700;
  letter-spacing: 0.1vw;
  text-shadow: 0 0 0.4vw rgba(0, 212, 255, 0.7);
}
.layer-col {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: 0.4vw;
  justify-items: center; // 圆形按钮在格子内居中
  align-items: center;
  padding: 0.5vw 0.1vw 0.1vw;
  overflow: hidden;
}
.layer-btn {
  width: 2.7vw;
  height: 2.7vw;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d5ecf9;
  background: linear-gradient(180deg, rgba(0, 68, 120, 0.7) 0%, rgba(0, 40, 80, 0.8) 100%);
  border: 1px solid rgba(0, 140, 255, 0.5);
  border-radius: 50%; // 圆形
  cursor: pointer;
  letter-spacing: 1px;
  font-size: 0.75vw;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0.3vw; right: 0.3vw;
    height: 0.05vw;
    background: rgba(0, 220, 255, 0.5);
  }
}
.layer-btn:hover {
  background: linear-gradient(180deg, rgba(0, 130, 210, 0.75), rgba(0, 90, 170, 0.85));
  border-color: @border-hi;
  color: #fff;
  box-shadow: 0 0 0.5vw rgba(0, 200, 255, 0.3);
}
.layer-btn.on {
  background: linear-gradient(180deg, #f7c948 0%, #e0a41f 100%);
  border: 1px solid #ffd23f;
  color: #2a1c00;
  font-weight: 800;
  box-shadow: 0 0 0.8vw rgba(247, 201, 72, 0.7), inset 0 0 0.5vw rgba(255, 255, 255, 0.25);
}
.layer-btn.on::before { background: rgba(255, 255, 255, 0.7); }

.dt-chart-title {
  flex: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.1vw;
  padding: 0.3vw 0.2vw 0.3vw;
  text-align: left;
}
.dt-chart-main {
  color: @cyan;
  font-size: 0.9vw;
  font-weight: 700;
  letter-spacing: 0.1vw;
  text-shadow: 0 0 0.5vw rgba(0, 212, 255, 0.8);
}
.dt-chart-sub {
  color: @text-blue;
  font-size: 0.6vw;
  letter-spacing: 0.1vw;
}
.dt-chart {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  background: transparent;
}
</style>
