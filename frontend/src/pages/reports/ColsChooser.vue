<script>
/* انتخاب‌گر ستون‌های خروجی گزارش — پورت SFC (چک‌باکس‌ها با v-show مخفی می‌شوند) */
import { readJson, faNum as fa } from '@/lib/kit.js';

export default {
  name: 'ColsChooser',
  data() {
    const payload = readJson('cols-data') || { headers: [], base: [] };
    return {
      headers: payload.headers || [],
      base: payload.base || [],
      q: '',
      sel: new Set(payload.headers || []),
      preset: 'all'
    };
  },
  methods: {
    fa,
    toggle(h, e) {
      const s = new Set(this.sel);
      if (e.target.checked) s.add(h); else s.delete(h);
      this.sel = s;
      this.preset = 'custom';
    },
    setPreset(p) {
      this.preset = p;
      if (p === 'all') this.sel = new Set(this.headers);
      else if (p === 'base') this.sel = new Set(this.headers.filter(h => this.base.includes(h)));
      else this.sel = new Set();
    }
  },
};
</script>
<template>
  <div class="chooser mb-4">
    <div class="ch-ctl no-print">
      <div class="srch"><svg class="ic"><use href="#i-search"/></svg><input type="text" v-model="q" placeholder="جستجوی ستون..."></div>
      <button type="button" class="chipbtn" :class="{on: preset==='all'}" @click="setPreset('all')">همه</button>
      <button type="button" class="chipbtn" :class="{on: preset==='base'}" @click="setPreset('base')">پایه</button>
      <button type="button" class="chipbtn" :class="{on: preset==='none'}" @click="setPreset('none')">هیچ‌کدام</button>
      <span class="ch-cnt"><b>{{ fa(sel.size) }}</b> ستون انتخاب‌شده</span>
    </div>
    <div class="ch-list">
      <label v-for="h in headers" :key="h" class="colopt" :class="{off: !sel.has(h)}" v-show="!q.trim() || h.includes(q.trim())">
        <input type="checkbox" class="colchk" :value="h" :checked="sel.has(h)" @change="toggle(h, $event)"> {{ h }}
      </label>
      <div v-if="q.trim() && !headers.some(h => h.includes(q.trim()))" class="mute" style="padding:8px 4px">ستونی با این نام یافت نشد.</div>
    </div>
  </div>
</template>
