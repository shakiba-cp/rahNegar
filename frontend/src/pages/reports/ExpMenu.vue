<script>
/* منوی خروجی گزارش — روی <details id="exp-app"> سوار می‌شود (دو ریشه: summary + منو)
   خروجی با همان فیلترهای URL + ستون‌های تیک‌خورده (.colchk:checked) ساخته می‌شود. */
export default {
  name: 'ExpMenu',
  methods: {
    exp(kind) {
      const p = new URLSearchParams(location.search);
      p.delete('export'); p.delete('col'); p.set('export', kind);
      document.querySelectorAll('.colchk:checked').forEach(c => p.append('col', c.value));
      location.href = location.pathname + '?' + p.toString();
    }
  },
};
</script>
<template>
  <summary class="btn pri"><svg class="ic"><use href="#i-download"/></svg> خروجی <svg class="ic i14"><use href="#i-down"/></svg></summary>
  <div class="expmenu">
    <button type="button" @click="exp('excel')"><svg class="ic"><use href="#i-download"/></svg> Excel</button>
    <button type="button" @click="exp('csv')"><svg class="ic"><use href="#i-file"/></svg> CSV</button>
    <button type="button" @click="exp('pdf')"><svg class="ic"><use href="#i-printer"/></svg> PDF (با نمودار)</button>
  </div>
</template>
