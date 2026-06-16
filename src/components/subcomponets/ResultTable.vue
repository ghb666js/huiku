<template>
  <div class="overlay" @click.self="close">
    <div class="modal">
      <header class="modal-head">
        <h3>读取结果（{{ rows.length }} 条）</h3>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <div class="modal-body">
        <table v-if="rows.length">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in rows" :key="idx">
              <td v-for="col in columns" :key="col">{{ formatCell(r[col]) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty">无数据</div>
      </div>

      <footer class="modal-foot">
        <button @click="onExport">导出 CSV</button>
        <button @click="close">关闭</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultTable',
  props: {
    data: { type: Array, default: () => [] }
  },
  emits: ['close'],
  computed: {
    rows() {
       return Array.isArray(this.data) ? this.data.filter(r => r && typeof r === 'object') : [];
    },
    columns() {
      if (!this.rows.length) return [];
      // 找到首个有效对象作为列定义
      const first = this.rows.find(r => r && typeof r === 'object');
      return first ? Object.keys(first) : [];
    }
  },
  methods: {
    close() { this.$emit('close'); },
    formatCell(val) {
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    },
    onExport() {
      if (!this.rows.length) return;
      const cols = this.columns;
      const csv = [
        cols.join(','),
        ...this.rows.map(r => cols.map(c => {
          const v = this.formatCell(r[c]).replace(/"/g, '""');
          return `"${v}"`;
        }).join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `result_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }
};
</script>

<style scoped>
/* th{
  color: black;
}
td{
  color: black;
} */
 tr{
  color: black;
  font-size: 1vw;
 }
.overlay{
  position: fixed; inset:0; background: rgba(0,0,0,0.45);
  display:flex; align-items:center; justify-content:center; z-index: 9999;
}
.modal{
  width: min(1100px, 95%); max-height: 85vh; background: #fff; border-radius:6px;
  display:flex; flex-direction:column; overflow:hidden;
}
.modal-head{
  display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #c0c4cc; color: black; font-size: 0.9vw;
}
.modal-body{ padding:12px; overflow:auto; }
table{ width:100%; border-collapse:collapse; font-size:12px; }
th,td{ border:1px solid #777777c7; padding:6px 8px; text-align:left; }
.empty{ padding:20px; color:black; text-align:center; }
.modal-foot{ padding:10px 16px; border-top:1px solid #c0c4cc; display:flex; gap:8px; justify-content:flex-end; }
.close-btn{ background:transparent;border:none;font-size:16px;cursor:pointer;}
</style>