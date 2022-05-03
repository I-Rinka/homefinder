<template>
  <div class="trend-vis">
    <svg
      ref="visMountPoint"
      width="600"
      height="600"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  </div>
</template>

<script setup>
import { computed, onMounted, onUpdated, toRaw, ref } from "@vue/runtime-core";
import * as d3 from "d3";

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
    return props.history_records;
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
        return { time: d.time, price: d.price };
      });
  }
});

function PrintRecords() {
  console.log(records.value);
}

function Update() {
  let x = d3
    .scaleTime()
    .range([20, 200])
    .domain([
      d3.min(records.value, (d) => new Date(d.time)),
      d3.max(records.value, (d) => new Date(d.time)),
    ]);

  const height = 200;
  let y = d3
    .scaleLinear()
    .range([10, 200])
    .domain([0, d3.max(records.value, (d) => d.price)]);

  let svg = d3.select(visMountPoint.value);

  let bar = svg.selectAll("rect").data(records.value);
  console.log(records.value);

  bar
    .exit()
    .transition()
    .attr("transform", (d) => "translate(" + 0 + "," + height + ")")
    .duration(600)
    .attr("height", 0)
    .remove();
  bar
    .enter()
    .append("rect")
    .style("fill", "steelblue")
    .attr("width", (200 - 20) / records.value.length)
    .attr("transform", (d) => "translate(" + x(d.time) + "," + height + ")")
    .transition()
    .duration(600)
    .attr("transform", (d) => "translate(" + x(d.time) + "," + y(d.price) + ")")
    .attr("height", (d) => height - y(d.price));
}

let visMountPoint = ref(null);
onMounted(() => {
  //   console.log(visMountPoint.value);
  Update();
});
onUpdated(() => {
  Update();
});
</script>

<style>
</style>