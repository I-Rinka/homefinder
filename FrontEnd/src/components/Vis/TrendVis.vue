<template>
  <div class="trend-vis">
    <svg
      ref="visMountPoint"
      :width="200"
      :height="200"
      viewBox="0 0 400 100"
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
  subregion_records: {
    type: Array,
    default: [],
    required: false,
  },
  selection_time: {
    type: Array,
    default: null,
    required: false,
  },
  subregion_name: {
    type: String,
    default: "",
    required: false,
  },
  feature_type: {
    type: String,
    required: false,
  },
});

watch(
  () => props.selection_time,
  () => {
    Update();
  }
);

watch(
  () => props.history_records,
  () => {
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

function GetSubRegionRecords() {
  if (props.selection_time === null || props.selection_time[0].year === 0) {
    return props.subregion_records.filter(
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
    return props.subregion_records
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

  if (props.feature_type !== "blocks") {
    svg.selectAll("path").remove();
    svg.selectAll("text").remove();
  }

  svg.insert("g");
  let bar_group = svg.select("g").selectAll("g").data(data).join("g");

  bar_group
    .attr("transform", (d, i, nodes) =>
      nodes[i].getAttribute("transform")
        ? nodes[i].getAttribute("transform")
        : "translate(" +
          (x(d.time) - (width / 2 / data.length) * 0.8) +
          "," +
          0 +
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
        0 +
        ")"
    );

  bar_group.insert("rect"); // only one rect

  bar_group
    .select("rect") // bar
    .style("fill", "rgba(184, 48, 31,.8)")
    .attr("width", (d, i, nodes) =>
      nodes[i].getAttribute("width")
        ? nodes[i].getAttribute("width")
        : (width / data.length) * 0.9
    )
    .attr("height", (d, i, nodes) =>
      nodes[i].getAttribute("height") && nodes[i].getAttribute("transform")
        ? nodes[i].getAttribute("height")
        : 0
    )
    .attr("transform", (d, i, nodes) =>
      nodes[i].getAttribute("transform")
        ? nodes[i].getAttribute("transform")
        : "translate(" + 0 + "," + height + ")"
    )
    .transition()
    .duration(600)
    .attr(
      "transform",
      (d) => "translate(" + 0 + "," + (height - y(d.price)) + ")"
    )
    .attr("width", (width / data.length) * 0.9)
    .attr("height", (d) => {
      let h = y(d.price);
      return h > 0 ? h : 0;
    });

  bar_group
    .select("rect")
    .insert("title")
    .text((d) => {
      let v = `${new Date(d.time).getUTCFullYear()}.${
        new Date(d.time).getUTCMonth() + 1
      }: ${d.price.toFixed(2)} rmb/m²`;

      if (props.subregion_name && props.subregion_name != "") {
        let find_subregion = props.subregion_records.find(
          (d2) => d2.time >= d.time
        );
        if (find_subregion) {
          v +=
            "\n" +
            `sub region ${
              props.subregion_name
            } average price:${find_subregion.price.toFixed(2)} rmb/m²`;
        }
      }

      return v;
    }); // hover title

  // add sub region records
  svg.append("path");
  svg
    .select("path")
    .datum(GetSubRegionRecords())
    .attr("fill", "none")
    .attr("stroke", "#547bc0")
    .attr("stroke-width", 4)
    .attr("stroke-linecap", "round")
    .attr(
      "d",
      d3
        .line()
        .curve(d3.curveMonotoneX)
        .x((d) => {
          if (x(d.time) == NaN) {
            console.log("x error", d);
            return 0;
          }
          return x(d.time);
        })
        .y((d) => {
          if (y(d.price) == NaN) {
            console.log("y error", d);
            return height;
          }
          return height - y(d.price);
        })
    );

  if (props.feature_type === "blocks") {
    if (
      props.subregion_records.at(-1) &&
      x(props.subregion_records.at(-1).time) != NaN &&
      y(props.subregion_records.at(-1).price) != NaN
    ) {
      svg
        .insert("text")
        .attr("x", x(props.subregion_records.at(-1).time) + 2)
        .attr("y", height - y(props.subregion_records.at(-1).price))
        // .attr("fill", "#547bc0")
        .attr("class", "subregion-text")
        .text(props.subregion_name);
    }
  }
}

let visMountPoint = ref(null);
onMounted(() => {
  Update();
});
</script>

<style lang="less">
.trend-vis {
  left: 25%;
  position: relative;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));

  svg {
    g {
      pointer-events: all;
      cursor: pointer;

      g {
        &:hover {
          rect {
            fill: rgb(255, 50, 20) !important;
          }
        }
      }
    }
  }
}

.subregion-text {
  fill: #547bc0;
  font-weight: 900;
}
</style>
