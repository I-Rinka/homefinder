<template>
  <div style="pointer-events: none">
    <svg
      viewBox="-500 -500 1000 1000"
      width="800"
      height="800"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        v-for="(feature, i) in props.marks"
        :key="i"
        class="arc"
        cx="0"
        cy="0"
        fill="none"
        :stroke="MarksAdaptor(feature).color"
        stroke-width="15"
        stroke-linecap="round"
        :style="{
          r: Number(i + 2) * 14,
          strokeDashoffset: `${GetDash(end, Number(i + 1) * 10)}`,
          strokeDasharray: `${GetDash(0, Number(i + 1) * 10)}`,
          transform: `rotate(${GetRotation(
            end,
            GetOrientation(myCoordinates, MarksAdaptor(feature).coordinates)
          )}deg)`,
        }"
      />
      <!-- <circle cx="50%" cy="50%" r="100" fill="none" stroke="blue" stroke-width="15" stroke-dashoffset="200" -->
      <!-- stroke-dasharray="300" transform="rotate(-90 60 60)" stroke-linecap="round" /> -->
    </svg>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "@vue/reactivity";
import { computed, onMounted, watch } from "@vue/runtime-core";
import * as d3 from "d3";
const props = defineProps({
  myCoordinates: { type: Array as () => Array<number> },
  marks: { type: Array },
});
let color_array = d3.schemeSet1;

let end = 280;
let radius = 20;

onMounted(() => {
  console.log(props.marks);
});

function PrintData() {
  console.log(props.marks);
}

function GetDash(angle: number, radius: number): number {
  return (Math.PI * radius * (360 - angle)) / 180.0;
}

function GetRotation(end: number, orientation: number): number {
  return -orientation - end / 2;
}

function MarksAdaptor(feature: any) {
  return {
    coordinates: feature.getGeometry().getCoordinates(),
    color: feature.get("color"),
  };
}

function GetDistance(feature: any) {
  return Math.sqrt(
    Math.pow(props.myCoordinates[0] - MarksAdaptor(feature).coordinates[0], 2) +
      Math.pow(props.myCoordinates[1] - MarksAdaptor(feature).coordinates[1], 2)
  );
}

function GetOrientation(
  my_coordinates: [number, number],
  target_coordinates: [number, number]
): number {
  let normalized_coord = [
    target_coordinates[0] - my_coordinates[0],
    target_coordinates[1] - my_coordinates[1],
  ];
  // first quartile
  if (normalized_coord[0] >= 0 && normalized_coord[1] >= 0) {
    return (
      (Math.atan2(normalized_coord[1], normalized_coord[0]) * 180) / Math.PI
    );
  }
  // second quartile
  else if (normalized_coord[0] < 0 && normalized_coord[1] >= 0) {
    return (
      180 -
      (Math.atan2(normalized_coord[1], -normalized_coord[0]) * 180) / Math.PI
    );
  }
  // third quartile
  else if (normalized_coord[0] < 0 && normalized_coord[1] < 0) {
    return (
      180 +
      (Math.atan2(-normalized_coord[1], -normalized_coord[0]) * 180) / Math.PI
    );
  }
  // forth quartile
  else if (normalized_coord[0] >= 0 && normalized_coord[1] < 0) {
    return (
      360 -
      (Math.atan2(-normalized_coord[1], normalized_coord[0]) * 180) / Math.PI
    );
  }
  return 0;
}
</script>

<style lang="less" scoped>
.arc {
  transition: 0.5s;
}
</style>