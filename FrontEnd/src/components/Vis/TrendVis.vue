<template>
  <div class="trend-vis">
    <svg
      ref="visMountPoint"
      width="100"
      height="100"
      viewBox="0 -50 200 200"
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

function GetRecords() {
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
}

function Update() {
  const width = 200;
  let data = GetRecords();
  let x = d3
    .scaleTime()
    .range([20, width - 20])
    .domain([d3.min(data, (d) => d.time), d3.max(data, (d) => d.time)]);

  const height = 100;
  let y = d3
    .scaleLinear()
    .range([0, height])
    .domain([d3.min(data, (d) => d.price)/2, d3.max(data, (d) => d.price)]);

  let svg = d3.select(visMountPoint.value);

  let bar = svg.selectAll("rect").data(data);

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
    .attr("width", (200 - 20) / data.length)
    .attr("transform", (d) => "translate(" + x(d.time) + "," + height + ")")
    .transition()
    .duration(600)
    .attr(
      "transform",
      (d) => "translate(" + x(d.time) + "," + (height-y(d.price)) + ")"
    )
    .attr("height", (d) => y(d.price));
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
.trend-vis {
  position: relative;
}
</style>