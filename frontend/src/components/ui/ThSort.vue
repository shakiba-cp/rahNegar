<script>
/* سرستون مرتب‌شونده — رویداد sort با کلید به والد سپرده می‌شود */
export default {
  name: 'ThSort',
  props: {
    k: { type: String, required: true },   /* کلید مرتب‌سازی */
    t: { type: String, default: '' },      /* عنوان ستون (خالی = از والد پر می‌شود) */
    sortKey: { type: String, default: '' },
    sortDir: { type: Number, default: 1 },
  },
  emits: ['sort'],
  computed: {
    icon() {
      if (this.sortKey !== this.k) return '⇅';
      return this.sortDir > 0 ? '▲' : '▼';
    }
  },
};
</script>
<template>
  <th class="sortable" :class="{on: sortKey===k}" @click="$emit('sort', k)">
    {{ t }} <span class="sa">{{ icon }}</span>
  </th>
</template>
