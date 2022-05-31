<template>
  <div class="sun-chart" style="pointer-events: none">
    <svg
      style="transition: 0.5s"
      :viewBox="view_box"
      width="600"
      height="600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- <SunChartCorona
        v-if="open_corona"
        :coord="props.myCoordinates"
        :inner-radius="corona_radius"
      ></SunChartCorona> -->
      <circle
        v-for="mark in data.user_marks"
        :key="mark.id"
        class="arc"
        cx="0"
        cy="0"
        fill="none"
        :stroke="mark.color"
        :r="mark.radius"
        stroke-linecap="round"
        :style="{
          strokeWidth: `${mark.stroke_width}`,
          strokeDashoffset: `${GetDash(mark.angle, mark.radius)}`,
          strokeDasharray: `${GetDash(0, mark.radius)}`,
          transform: `rotate(${mark.orientation}deg)`,
        }"
      />
      <!-- cicle in the middle -->
      <circle
        class="sun-chart-price"
        :r="price_r"
        cx="0"
        cy="0"
        :fill="color"
        @click="ClickMiddle"
      />
    </svg>
    <div class="sun-chart-text-container">
      <div class="sun-chart-text" :style="{ fontSize: `${price_text_size}px` }">
        {{ props.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw } from "@vue/reactivity";
import { computed, onMounted, watch } from "@vue/runtime-core";
import SunChartCorona from "./SunChartCorona.vue";

const props = withDefaults(
  defineProps<{
    myCoordinates: [number, number];
    marks: Array<any>;
    color: string;
    text: string;
    open_corona?: boolean;
  }>(),
  {
    open_corona: true,
  }
);

const open_corona = computed(() => props.open_corona);
const corona_radius = computed(() =>
  60 > data.user_marks.length * 15 + 38 ? 60 : data.user_marks.length * 15 + 38
);

class WeightStrip {
  id: string;
  color: string;
  radius: number;
  orientation: number;
  stroke_width: number;
  angle: number;
  constructor(
    id?: string,
    color?: string,
    radius?: number,
    orientation?: number,
    stroke_width?: number,
    angle?: number
  ) {
    this.id = id;
    this.color = color;
    this.radius = radius;
    this.orientation = orientation;
    this.stroke_width = stroke_width;
    this.angle = angle;
  }
}

const data = reactive({
  user_marks: new Array<WeightStrip>(),
});

const emits = defineEmits(["click"]);

let view_box = computed(() => {
  if (data.user_marks.length <= 3) {
    return "-500 -500 1000 1000";
  } else {
    let p = (props.marks.length - 3) * 200 + 1000;
    let n = -((props.marks.length - 3) * 100 + 500);
    return `${n} ${n} ${p} ${p}`;
  }
});

let price_r = computed(() => {
  if (props.marks.length == 0) {
    return 45;
  } else if (props.marks.length) {
    return 29;
  }
});

// font size
let price_text_size = computed(() => {
  if (props.marks.length == 0) {
    return 12;
  } else if (props.marks.length) {
    return 3;
  }
});

function ClickMiddle() {
  emits("click");
}

let timeOut = 1500;

function ChangeWeightStrip() {
  data.user_marks = props.marks
    .sort((a: any, b: any) => a.get("weight") - b.get("weight"))
    .map((feature: any, index: number) => {
      let angle = GetAngle(feature);

      let weight_strip = new WeightStrip(
        feature.ol_uid,
        feature.get("color"),
        (index + 3) * 12,
        GetRotation(
          angle,
          GetOrientation(
            props.myCoordinates,
            feature.getGeometry().getCoordinates()
          )
        ),
        12,
        angle
      );

      return weight_strip;
    });
}

onMounted(() => {
  ChangeWeightStrip();
});

watch(
  () => [props.marks, props.myCoordinates],
  () => {
    setTimeout(() => {
      ChangeWeightStrip();
    }, timeOut);

    // if (timeOut === 0) {
    //   timeOut = 1500;
    // }
  },
  { deep: true }
);

/*
    radius
    color
    stroke_width
    orientation
    angle
*/

function GetDash(angle: number, radius: number): number {
  return (Math.PI * radius * (360 - angle)) / 180.0;
}

function GetRotation(end: number, orientation: number): number {
  return -orientation - end / 2;
}

function GetDistance(feature: any) {
  return Math.sqrt(
    Math.pow(
      props.myCoordinates[0] * 100 -
        feature.getGeometry().getCoordinates()[0] * 100,
      2
    ) +
      Math.pow(
        props.myCoordinates[1] * 100 -
          feature.getGeometry().getCoordinates()[1] * 100,
        2
      )
  );
}

function GetAngle(feature: any) {
  let angle = (5 / GetDistance(feature)) * 360;
  angle = angle > 360 ? 360 : angle;
  return angle;
}

function GetOrientation(
  my_coordinates: [number, number],
  target_coordinates: [number, number]
): number {
  let normalized_coord = [
    target_coordinates[0] * 1000 - my_coordinates[0] * 1000,
    target_coordinates[1] * 1000 - my_coordinates[1] * 1000,
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

.sun-chart {
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
}

.sun-chart-text-container {
  position: absolute;
  width: 600px;
  height: 600px;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-content: center;
  justify-content: center;
}

.sun-chart-price {
  pointer-events: all;
  opacity: 0.8;
  transition: 1s;
  user-select: none;
  animation: inputPrice 1s;
  &:hover {
    cursor: pointer;
  }
}

@keyframes inputPrice {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.8;
  }
}

.sun-chart-text {
  // pointer-events: all;
  align-self: center;
  color: white;
  filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.8));
  font-weight: 700;
  transition: 1s;
  white-space: pre-line;
}
</style>
