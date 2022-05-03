<template>
  <div class="trend-vis">
    <el-button style="pointer-events: all" @click="PrintRecords"
      >Show Records</el-button
    >
    <div v-for="t in props.history_records" :key="t">
      {{ t.time }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUpdated } from "@vue/runtime-core";

const props = defineProps({
  history_records: {
    type: Array,
    default: [],
    required: true,
  },
});

function PrintRecords() {
  console.log(props.history_records);
}

onMounted(() => {});
onUpdated(() => {});
</script>

<style>
</style>