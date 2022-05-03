<template>
  <div class="trend-vis">
    <svg
      ref="visMountPoint"
      width="100"
      height="100"
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  onUpdated,
  toRaw,
  ref,
  watch,
} from "@vue/runtime-core";
import * as d3 from "d3";
import { config } from "../../config";

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

watch(
  () => props.selection_time,
  () => {
    console.log("change");
    Update();
  }
);

function GetRecords() {
  if (props.selection_time === null || props.selection_time[0].year === 0) {
    return props.history_records.filter(
      (d) =>
        d.time >=
          Date.UTC(config.timeRange[0].year, config.timeRange[0].month) &&
        d.time <= Date.UTC(config.timeRange[1].year, config.timeRange[1].month)
    );
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
    .domain([
      (d3.min(data, (d) => d.price) * 2) / 3,
      d3.max(data, (d) => d.price),
    ]);

  let svg = d3.select(visMountPoint.value);

  let bar = svg.selectAll("rect").data(data);

  bar
    .join("rect")
    .style("fill", "rgba(184, 48, 31,.8)")
    .attr("width", (d, i, nodes) =>
      nodes[i].getAttribute("width")
        ? nodes[i].getAttribute("width")
        : (width / data.length) * 0.9
    )
    .attr("height", (d, i, nodes) =>
      nodes[i].getAttribute("height") ? nodes[i].getAttribute("height") : 0
    )
    .attr("transform", (d, i, nodes) =>
      nodes[i].getAttribute("transform")
        ? nodes[i].getAttribute("transform")
        : "translate(" +
          (x(d.time) - (width / 2 / data.length) * 0.8) +
          "," +
          height +
          ")"
    )
    .transition()
    .duration(600)
    .attr(
      "transform",
      (d) =>
        "translate(" +
        (x(d.time) - (width / 2 / data.length) * 0.8) +
        "," +
        (height - y(d.price)) +
        ")"
    )
    .attr("width", (width / data.length) * 0.9)
    .attr("height", (d) => y(d.price));
}

let visMountPoint = ref(null);
onMounted(() => {
  Update();
});
</script>

<style>
.trend-vis {
  position: relative;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
}
</style>