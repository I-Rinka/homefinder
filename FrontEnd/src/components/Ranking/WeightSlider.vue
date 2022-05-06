<template>
  <div class="slider-block">
    <div>
      <vue-draggable-next
        class="global-weight-hinter"
        :list="exclude_criterias"
        :group="{ name: 'all' }"
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

      <!-- slider top end -->
      <vue-draggable-next
        class="slider-ends"
        :list="data.top"
        :group="{ name: 'all', pull: !(data.top.length == 1), put: true }"
      >
        <div
          v-for="c in data.top"
          :key="c"
          :style="{
            '--strip-width': `${(c.weight / top_percentage_sum) * 100}%`,
            '--strip-color': c.color,
          }"
        >
          <div :style="{ '--text-length': c.name.length }">{{ c.name }}</div>
        </div>
      </vue-draggable-next>

      <!-- <el-slider
        v-model="bottom_slider_percentage"
        vertical
        height="25vh"
        :min="0.01"
        :max="0.99"
        :step="0.01"
      /> -->

      <div class="slider-container">
        <svg
          ref="triSvg"
          style="height: 25vh; width: 100%"
          viewBox="0 0 50 200"
          xmlns="http://www.w3.org/2000/svg"
          :style="{}"
        >
          <rect
            ref="SliderTrack"
            class="slider-track"
            width="50"
            height="200"
            vector-effect="non-scaling-stroke"
          ></rect>
        </svg>
        <!-- cursor: !data.slider.pressed ? 'default' : 'move', -->
        <!-- <div class="slider-stage" @click="PrintData"></div> -->
      </div>

      <vue-draggable-next
        class="slider-ends"
        :list="data.bottom"
        :group="{ name: 'all', pull: !(data.bottom.length == 1), put: true }"
      >
        <div
          v-for="c in data.bottom"
          :key="c"
          :style="{
            '--strip-width': `${(c.weight / bottom_percentage_sum) * 100}%`,
            '--strip-color': c.color,
          }"
        >
          <div :style="{ '--text-length': c.name.length }">
            {{ c.name }}
          </div>
        </div>
      </vue-draggable-next>

      <div
        class="slider-cursor-frame"
        :style="{
          '--slider-y': `${data.slider.y}vh`,
        }"
      >
        <slider-cursor
          @pointerdown="PressSlider"
          :closable="false"
          :pressed="data.slider.pressed"
          :color="data.slider.pressed ? 'rgb(255, 50, 20)' : 'rgb(200, 26, 10)'"
          style="transform: rotate(90deg)"
        ></slider-cursor>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRaw,
  watch,
} from "@vue/runtime-core";
import { useStore } from "../store/weight";
import { VueDraggableNext } from "vue-draggable-next";

import SliderCursor from "../TimeLine/SliderCursor.vue";

function PrintData() {
  console.log(include_names.value);
}

const store = useStore();
const props = defineProps({
  topCriterias: {
    type: Array,
  },
  bottomCriterias: {
    type: Array,
  },
});

const data = reactive({
  top: store.GetCriterias(props.topCriterias),
  bottom: store.GetCriterias(props.bottomCriterias),
  slider: {
    // 0~23.4
    y: 11.7,
    pressed: false,
  },
});

const include_names = computed(() => {
  let val = data.bottom.map((d) => d.name).concat(data.top.map((d) => d.name));
  return val;
});

const exclude_criterias = computed(() =>
  store.GetCriterias(store.GetCriteriaNames(include_names.value))
);

watch(
  () => store.GetCriterias([]),
  () => {
    data.top = data.top.filter((d) => d.enabled);
    data.bottom = data.bottom.filter((d) => d.enabled);
  }
);

const current_weight_overall = computed(() => {
  let sum = 0;
  data.top.forEach((x) => (sum += x.weight));
  data.bottom.forEach((x) => (sum += x.weight));
  return sum;
});

const bottom_slider_percentage = computed({
  get() {
    let sum = 0;
    data.bottom.forEach((x) => (sum += x.weight));
    return sum / current_weight_overall.value;
  },
  set(value) {
    let old_value = bottom_slider_percentage.value;
    let change = value / old_value;

    for (let i = 0; i < data.bottom.length; i++) {
      data.bottom[i].weight *= change;
    }

    for (let i = 0; i < data.top.length; i++) {
      data.top[i].weight *= (1 - value) / (1 - old_value);
    }
  },
});

const bottom_percentage_sum = computed(() => {
  let sum = 0;
  data.bottom.forEach((d) => (sum += d.weight));
  return sum;
});

const top_percentage_sum = computed(() => {
  let sum = 0;
  data.top.forEach((d) => (sum += d.weight));
  return sum;
});

// slider stuff

function PressSlider() {
  data.slider.pressed = true;
  window.addEventListener("mouseup", ReleaseSlider);
  window.addEventListener("mousemove", MoveSlider);
}

function ReleaseSlider() {
  data.slider.pressed = false;
  window.removeEventListener("mouseup", ReleaseSlider);
  window.removeEventListener("mousemove", MoveSlider);
}

let SliderTrack = ref(null);
function MoveSlider(e) {
  if (data.slider.pressed) {
    let rect = SliderTrack.value.getBoundingClientRect();
    let percentage = (e.clientY - rect.y) / rect.height;
    let y = 23.4 * percentage;
    y = y < 0 ? 0 : y;
    y = y > 23.4 ? 23.4 : y;
    data.slider.y = y;
  }
}

const percentage = computed({
  get() {
    let p = data.slider.y / 23.4;
    p = p <= 0.01 ? 0.01 : p;
    p = p >= 0.99 ? 0.99 : p;

    console.log(p);
    return p;
  },
  set(p) {
    let y = p * 23.4;
    y = y < 0 ? 0 : y;
    y = y > 23.4 ? 23.4 : y;
    data.slider.y = y;
  },
});

onMounted(() => {
  percentage.value = 1 - bottom_slider_percentage.value;
});

let weight_change_timeout = null;
let weight_v = percentage.value;
watch(
  () => percentage.value,
  (v) => {
    weight_v = v;
    // weight_v= bottom_slider_percentage.value = 1 - v;
    if (weight_change_timeout === null) {
      weight_change_timeout = setTimeout(() => {
        bottom_slider_percentage.value = 1 - weight_v;
        weight_change_timeout = null;
      }, 100);
    }
  }
);
</script>

<style lang="less" scoped>
.slider-block {
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

.global-weight-hinter {
  display: flex;
  margin-left: 5px;
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

.slider-container {
  height: 25vh;
  position: relative;
}

.slider-track {
  fill: #e7eae8;
  stroke-width: 1px;
  stroke: grey;
}

.slider-cursor-frame {
  position: absolute;
  display: inline-block;
  top: 2.5vh;
  left: 50px;
  height: 55px;
  width: 10px;
  transition: 0.1s;
  transform: translate(0, var(--slider-y));
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}
</style>
