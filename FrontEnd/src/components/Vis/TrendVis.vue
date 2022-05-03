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
import { computed, onMounted, onUpdated } from "@vue/runtime-core";

const props = defineProps({
  history_records: {
    type: Array,
    default: [],
    required: true,
  },
});

const records = computed(() =>
  props.history_records.map((d) => {
    return { time: new Date(d.time).toUTCString(), price: d.price };
  })
);

function PrintRecords() {
  console.log(records.value);
}

onMounted(() => {});
onUpdated(() => {});
</script>

<style>
</style>