<template>
  <div class="trend-vis">
    <el-button style="pointer-events: all" @click="PrintRecords"
      >Show Records</el-button
    >
    <div v-for="t in records" :key="t">
      {{ t.time }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUpdated, toRaw } from "@vue/runtime-core";

const props = defineProps({
  history_records: {
    type: Array,
    default: [],
    required: true,
  },
  selection_time: {
    type: Array,
    default: null,
    required: false,
  },
});

const records = computed(() => {
  // select All
  if (props.selection_time === null || props.selection_time[0].year === 0) {
    return props.history_records.map((d) => {
      return { time: new Date(d.time).toUTCString(), price: d.price };
    });
  } else {
    let l = Date.UTC(
      props.selection_time[0].year,
      props.selection_time[0].month - 1
    );
    let r = Date.UTC(
      props.selection_time[1].year,
      props.selection_time[1].month - 1
    );
    return props.history_records
      .filter((d) => d.time >= l && d.time <= r)
      .map((d) => {
        return { time: new Date(d.time).toUTCString(), price: d.price };
      });
  }
});

function PrintRecords() {
  console.log(records.value);
}

onMounted(() => {});
onUpdated(() => {});
</script>

<style>
</style>