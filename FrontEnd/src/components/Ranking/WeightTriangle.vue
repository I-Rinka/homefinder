<template>
  <div class="triangle-block">
    <div class="top-ends">
      <vue-draggable-next
        class="global-weight-hinter"
        :group="{ name: 'tri' }"
        :list="exclude_criterias"
      >
        <div
          v-for="c in exclude_criterias"
          :key="c"
          class="reserved"
          :style="{
            '--strip-color': c.color,
            '--strip-width': `${100 * c.weight}%`,
          }"
        >
          <el-tooltip
            :content="c.name"
            :popper-options="{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 15],
                  },
                },
              ],
            }"
            placement="top"
            effect="customized"
            :hide-after="0"
            popper-class="popper"
          >
            <!-- Make the tooltip show -->
            <div style="height: 100%; width: 100%"></div>
          </el-tooltip>
        </div>
        <div
          class="current"
          :style="{
            '--strip-width': `${100 * current_weight_overall}%`,
          }"
        ></div>
      </vue-draggable-next>
    </div>

    <!-- slider top end -->
    <div class="top-ends">
      <vue-draggable-next
        class="slider-ends"
        :list="data.tri"
        :group="{ name: 'tri', pull: false }"
        @add="ReplaceTopCriteria"
      >
        <!-- :move="PrintData" -->
        <div
          v-if="data.tri[0]"
          :style="{
            '--strip-width': `${100}%`,
            '--strip-color': data.tri[0].color,
          }"
        >
          <div :style="{ '--text-length': data.tri[0].length }">
            {{ data.tri[0].name }}
          </div>
        </div>
      </vue-draggable-next>
    </div>

    <div class="triangle-container">
      <svg
        ref="triSvg"
        style="height: 25vh; width: 100%"
        viewBox="-3 0 206 174"
        xmlns="http://www.w3.org/2000/svg"
        :style="{
          cursor: !data.slider.pressed ? 'default' : 'move',
        }"
      >
        <polygon
          class="triangle"
          :points="`0,${Root3(100)} 100,0 200,${Root3(100)} 0,${Root3(100)}`"
          vector-effect="non-scaling-stroke"
          @mousemove="MoveSlider"
          @click="PrintData"
        />

        <line
          class="slider-height-line"
          :x1="`${data.slider.x - 3}px`"
          :y1="`${Root3(100) - 1.5}`"
          :x2="`${data.slider.x - 3}px`"
          :y2="`${data.slider.y + 7}px`"
          style="
            stroke-width: 3;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.3));
            opacity: 0.8;
            pointer-events: none;
          "
          :style="{ stroke: data.tri[0].color }"
        />
        <line
          class="slider-height-line"
          :x1="`${
            (data.slider.x - 0.5 + Root3(1) * (data.slider.y + 3) + 300) / 4 - 3
          }`"
          :y1="`${
            (Root3(1) * (data.slider.x - 0.5) +
              3 * (data.slider.y + 3) -
              Root3(100)) /
              4 -
            3
          }`"
          :x2="`${data.slider.x + 3}px`"
          :y2="`${data.slider.y - 3}px`"
          style="
            stroke-width: 3;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.3));
            opacity: 0.8;
            pointer-events: none;
          "
          :style="{ stroke: data.tri[1].color }"
        />
        <line
          class="slider-height-line"
          :x1="`${
            (data.slider.x - 0.5 - Root3(1) * (data.slider.y + 3) + 300) / 4 + 3
          }`"
          :y1="`${
            (-Root3(1) * (data.slider.x - 0.5) +
              3 * (data.slider.y + 3) +
              Root3(100)) /
              4 -
            3
          }`"
          :x2="`${data.slider.x - 9}px`"
          :y2="`${data.slider.y - 3}px`"
          style="
            stroke-width: 3;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.3));
            opacity: 0.8;
            pointer-events: none;
          "
          :style="{ stroke: data.tri[2].color }"
        />

        <circle
          class="slider"
          ref="triSlider"
          @pointerdown="PressSlider"
          :style="{
            '--slider-x': `${data.slider.x - 0.5}px`,
            '--slider-y': `${data.slider.y + 3}px`,
            pointerEvents: !data.slider.pressed ? 'all' : 'none',
          }"
          cx="-2.5"
          cy="-2.5"
          r="5"
        />
      </svg>
    </div>

    <div class="bottom-ends">
      <vue-draggable-next
        :list="data.tri"
        class="slider-ends"
        :group="{ name: 'tri', pull: false }"
        @add="ReplaceBottomCriteria0"
      >
        <div
          v-if="data.tri[1]"
          :style="{
            '--strip-width': `${100}%`,
            '--strip-color': data.tri[1].color,
          }"
        >
          <div :style="{ '--text-length': data.tri[1].length }">
            {{ data.tri[1].name }}
          </div>
        </div>
      </vue-draggable-next>

      <vue-draggable-next
        :list="data.tri"
        class="slider-ends"
        :group="{ name: 'tri', pull: false }"
        @add="ReplaceBottomCriteria1"
      >
        <div
          v-if="data.tri[2]"
          :style="{
            '--strip-width': `${100}%`,
            '--strip-color': data.tri[2].color,
          }"
        >
          <div :style="{ '--text-length': data.tri[2].length }">
            {{ data.tri[2].name }}
          </div>
        </div>
      </vue-draggable-next>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, toRaw, ref } from "@vue/reactivity";
import { useStore } from "../store/weight";
import { VueDraggableNext } from "vue-draggable-next";
import { onMounted, watch } from "@vue/runtime-core";

function PrintData(d) {
  console.log(d);
}

const props = defineProps({
  criterias: {
    type: Array,
  },
});

const store = useStore();

function Root3(number) {
  return Math.sqrt(3) * number;
}
const data = reactive({
  tri: store.GetCriterias(props.criterias),
  slider: {
    pressed: false,
    x: 100,
    y: Root3((100 * 2) / 3),
  },
});

const include_names = computed(() => data.tri.map((d) => d.name));

const exclude_criterias = computed(() =>
  store.GetCriterias(store.GetCriteriaNames(include_names.value))
);

const current_weight_overall = computed(() => {
  let sum = 0;
  data.tri.forEach((x) => (sum += x.weight));
  return sum;
});

function ReplaceTopCriteria(d) {
  if (data.tri.length == 3) {
  } else {
    if (d.newIndex === 0) {
      data.tri.splice(1, 1);
    } else {
      data.tri.splice(0, 1);
    }
  }
}

function ReplaceBottomCriteria0(d) {
  if (data.tri.length == 3) {
    console.log(d);
  } else {
    if (d.newIndex === 0) {
      data.tri[2] = data.tri[0];
      data.tri.splice(0, 1);
    } else {
      data.tri[2] = data.tri[1];
      data.tri.splice(1, 1);
    }
  }
}

function ReplaceBottomCriteria1(d) {
  if (data.tri.length == 3) {
    console.log(d);
  } else {
    if (d.newIndex === 0) {
      data.tri[3] = data.tri[0];
      data.tri.splice(0, 1);
    } else {
      data.tri[3] = data.tri[1];
      data.tri.splice(1, 1);
    }
  }
}

watch(
  () => data.tri[0].weight,
  () => {
    if (!data.slider.pressed) {
      point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
      data.slider.x = point.x;
      data.slider.y = point.y;
    }
  }
);

watch(
  () => data.tri[1].weight,
  () => {
    if (!data.slider.pressed) {
      point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
      data.slider.x = point.x;
      data.slider.y = point.y;
    }
  }
);

watch(
  () => data.tri[2].weight,
  () => {
    if (!data.slider.pressed) {
      point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
      data.slider.x = point.x;
      data.slider.y = point.y;
    }
  }
);

function PressSlider() {
  data.slider.pressed = true;
  window.addEventListener("pointerup", ReleaseSlider);
}

function ReleaseSlider() {
  data.slider.pressed = false;
  window.removeEventListener("pointerup", ReleaseSlider);
}

let triSlider = ref(null);

const tri_point = [
  { x: 0, y: Root3(100) },
  { x: 100, y: 0 },
  { x: 200, y: Root3(100) },
];

const overall_weight = computed(
  () => data.tri[0].weight + data.tri[1].weight + data.tri[2].weight
);

const wp0 = computed({
  get() {
    return data.tri[0].weight / overall_weight.value;
  },
  set(value) {
    let overall = overall_weight.value;
    let old_12 = data.tri[1].weight + data.tri[2].weight;
    let v = value < 0.01 ? 0.01 : value;
    v = value > 0.99 ? 0.99 : v;
    data.tri[0].weight = overall * v;
    data.tri[1].weight *= ((1 - v) / old_12) * overall;
    data.tri[2].weight *= ((1 - v) / old_12) * overall;
  },
});

const wp1 = computed({
  get() {
    return data.tri[1].weight / overall_weight.value;
  },
  set(value) {
    let overall = overall_weight.value;
    let old_12 = data.tri[0].weight + data.tri[2].weight;
    let v = value < 0.01 ? 0.01 : value;
    v = value > 0.99 ? 0.99 : v;
    data.tri[1].weight = overall * v;
    data.tri[0].weight *= ((1 - v) / old_12) * overall;
    data.tri[2].weight *= ((1 - v) / old_12) * overall;
  },
});

const wp2 = computed({
  get() {
    return data.tri[2].weight / overall_weight.value;
  },
  set(value) {
    let overall = overall_weight.value;
    let old_12 = data.tri[0].weight + data.tri[1].weight;
    let v = value < 0.01 ? 0.01 : value;
    v = value > 0.99 ? 0.99 : v;
    data.tri[2].weight = overall * v;
    data.tri[1].weight *= ((1 - v) / old_12) * overall;
    data.tri[0].weight *= ((1 - v) / old_12) * overall;
  },
});

function GetABC(point1, point2) {
  return [
    point1.y - point2.y,
    point2.x - point1.x,
    point1.y * (point1.x - point2.x) - point1.x * (point1.y - point2.y),
  ];
}

function GetDistance(line_point1, line_point2, point) {
  let [A, B, C] = GetABC(line_point1, line_point2);
  return (A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
}

function WeightToPoint(weights) {
  let [w1, w2, w3] = weights;
  let y = (1 - w1) * Root3(100);
  let x = 100 * w1 + (200 * (1 - w1) * w3) / (w2 + w3);
  return { x, y };
}

let wv1,
  wv2,
  wv3 = 0;
let weighchange_timeout = null;
async function ChangeWeight(v1, v2, v3) {
  wv1 = v1;
  wv2 = v2;
  wv3 = v3;

  if (weighchange_timeout == null) {
    weighchange_timeout = setTimeout(() => {
      wp0.value = v1;
      wp1.value = v2;
      wp2.value = v3;

      weighchange_timeout = null;
    }, 100);
  }
}

let moveslider_timeout = null;
let point = null;
function MoveSlider(e) {
  if (data.slider.pressed) {
    let XRatio =
      triSlider.value.getBBox().width /
      triSlider.value.getBoundingClientRect().width;
    let YRatio =
      triSlider.value.getBBox().height /
      triSlider.value.getBoundingClientRect().height;
    let x = e.offsetX * XRatio;
    let y = e.offsetY * YRatio;
    point = { x: x - 3, y: y + 0.5 };

    if (moveslider_timeout === null) {
      moveslider_timeout = setTimeout(() => {
        let d1 = GetDistance(tri_point[2], tri_point[0], point);
        let d2 = GetDistance(tri_point[1], tri_point[2], point);
        let d3 = GetDistance(tri_point[0], tri_point[1], point);

        let overall = d1 + d2 + d3;
        let v1 = d1 / overall;
        let v2 = d2 / overall;
        let v3 = d3 / overall;

        ChangeWeight(v1, v2, v3);
        // wp0.value = v1;
        // wp1.value = v2;
        // wp2.value = v3;

        // point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
        data.slider.x = point.x;
        data.slider.y = point.y;

        moveslider_timeout = null;
      }, 10);
    }
  }
}

onMounted(() => {
  point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
  data.slider.x = point.x;
  data.slider.y = point.y;
});
</script>

<style lang="less" scoped>
.triangle-block {
  align-items: center;
  margin-left: 30px;
  margin-right: 30px;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));

  .el-slider {
    position: relative;
    left: 5px;
    width: 90px;
    --el-slider-runway-bg-color: #e7eae8;
  }
}

.triangle-container {
  height: 25vh;
  position: relative;
}

.triangle {
  position: absolute;
  stroke-linejoin: round;
  fill: #e7eae8;
  stroke: gray;
  stroke-width: 1px;
}

.slider {
  stroke-linejoin: round;
  stroke-width: 3;
  stroke: #be1500;
  fill: transparent;
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.2));
  cursor: move;
  transform: translate(var(--slider-x), var(--slider-y));

  &:hover {
    stroke: #f32e00;
  }

  &:active {
    stroke: #f32e00;
    transition: 0s;
  }
}

.bottom-ends {
  display: flex;
  justify-content: space-between;
}

.top-ends {
  display: flex;
  justify-content: center;
}

.slider-ends {
  user-select: none;
  box-shadow: 0px 0px 0px 1px grey;
  display: flex;
  height: 3vh;
  width: 100px;
  border-radius: 5px;
  overflow: hidden;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  div {
    height: 3vh;
    background-color: var(--strip-color);
    width: var(--strip-width);

    position: relative;

    div {
      text-align: right;
      position: absolute;
      right: 0;
      z-index: 10px;
      font-size: 1.5vh;
      opacity: 0;
      color: white;
      transition: 0.3s;
      pointer-events: none;
      width: 80px;
      padding: 0.6vh 0px 0.4vh 0px;
      height: 2vh;
      border-radius: 5px;
    }

    &:hover {
      div {
        opacity: 1;
        padding: 0.6vh 10px 0.4vh 10px;
        text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.8);
      }
    }
  }
}

.global-weight-hinter {
  display: flex;
  margin-bottom: 0.9px;
  height: 1vh;
  width: 90px;

  :first-child {
    border-top-left-radius: 3px;
  }

  :last-child {
    border-top-right-radius: 3px;
  }

  .reserved {
    margin: 0;
    width: var(--strip-width);
    background-color: var(--strip-color);
    height: 1vh;
    cursor: grab;
    transition: 0.3s;
    transition-property: transform;
    transform: scale(1, 1);

    &:hover {
      transform: scale(1.5, 1.5) translate(0, -20%);
    }

    &:active {
      cursor: grabbing;
    }
  }

  .current {
    background-color: #ffffff;
    height: 0.5vh;
    position: relative;
    width: var(--strip-width);
    top: 0.5vh;
    bottom: 0;
    z-index: -1;
  }
}
</style>
