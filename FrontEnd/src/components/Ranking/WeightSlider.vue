<template>
  <!-- <el-button @click="LoadHinter">Test</el-button> -->
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

      <vue-draggable-next
        class="slider-ends"
        style="position: relative; top: 25vh"
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

      <div class="slider-container">
        <div
          ref="SliderTrack"
          class="slider-track"
          @dblclick="TranslateSlider"
        ></div>
        <div
          class="slider-hinter"
          :style="{
            height: `${data.hinter.hinter_bottom.height}vh`,
            top: `${data.hinter.hinter_bottom.top + 1.2}vh`,
          }"
        ></div>
        <div
          class="slider-hinter"
          :style="{
            height: `${data.hinter.hinter_middle.height}vh`,
            top: `${data.hinter.hinter_middle.top + 1.2}vh`,
          }"
        ></div>
        <div
          class="slider-hinter"
          :style="{
            height: `${data.hinter.hinter_top.height}vh`,
            top: `${data.hinter.hinter_top.top + 1.2}vh`,
          }"
        ></div>
      </div>

      <div
        class="slider-cursor-frame"
        :style="{
          '--slider-y': `${slider_y + 1}vh`,
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
import { useRankStore } from "../store/rank";
import { VueDraggableNext } from "vue-draggable-next";

import SliderCursor from "../TimeLine/SliderCursor.vue";

const emits = defineEmits(["close"]);

const store = useStore();
const rank_store = useRankStore();
const props = defineProps({
  topCriterias: {
    type: Array,
  },
  bottomCriterias: {
    type: Array,
  },
});
const height = 23.4;
const data = reactive({
  top: store.GetCriterias(props.topCriterias),
  bottom: store.GetCriterias(props.bottomCriterias),
  slider: {
    // 0~23.4
    y: 11.7,
    pressed: false,
  },

  hinter: {
    hinter_top: { top: 0, height: 0 },
    hinter_middle: { top: 0, height: 0 },
    hinter_bottom: { top: 0, height: 0 },
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
    if (data.top.length <= 0 || data.bottom.length <= 0) {
      emits("close");
      console.log("close");
    }
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
  set(v) {
    let value = v >= 0.99 ? 0.99 : v;
    value = v <= 0.01 ? 0.01 : v;

    console.log("slider value:", value);
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
  n_time = Date.now();
  if (data.slider.pressed) {
    let rect = SliderTrack.value.getBoundingClientRect();
    let percentage = (e.clientY - rect.y) / rect.height;
    let y = 23.4 * percentage;
    slider_y.value = y;
  }
}

let weight_change_timeout = null;
let weight_v = 0;
const slider_y = computed({
  get() {
    if (data.slider.pressed) {
      return data.slider.y;
    } else {
      data.slider.y = 23.4 * bottom_slider_percentage.value;
      return data.slider.y;
    }
  },
  set(value) {
    let y = value < 0 ? 0 : value;
    y = y > 23.4 ? 23.4 : y;
    data.slider.y = y;

    weight_v = y / 23.4;

    if (weight_change_timeout === null) {
      weight_change_timeout = setTimeout(() => {
        if (weight_v >= 0.99) {
          bottom_slider_percentage.value = 0.99;
        } else if (weight_v <= 0.01) {
          bottom_slider_percentage.value = 0.01;
        } else {
          bottom_slider_percentage.value = weight_v;
        }
        weight_change_timeout = null;
      }, 200);
    }
  },
});

function TranslateSlider(e) {
  let rect = SliderTrack.value.getBoundingClientRect();
  let percentage = (e.clientY - rect.y) / rect.height;
  let y = 23.4 * percentage;
  slider_y.value = y;
}

watch(
  () => rank_store.current_solutions,
  () => LoadHinterTimeout()
);

let solution_trigger = null;
let n_time = 0;
function LoadHinterTimeout() {
  // n_time = Date.now();
  if (solution_trigger === null) {
    solution_trigger = setTimeout(() => {
      LoadHinter();
      solution_trigger = null;
    }, 1000);
  }
}

async function LoadHinter() {
  let start_time = Date.now();
  if (start_time - n_time < 20) {
    return;
  }
  let res = await rank_store.Compute2WayRange(
    data.top.map((d) => d.name),
    data.bottom.map((d) => d.name),
    store.GetCriterias()
  );
  data.hinter.hinter_top = {
    top: res.notChangeCurrent.at(0) * height,
    height: (res.notChangeCurrent.at(-1) - res.notChangeCurrent.at(0)) * height,
  };
  data.hinter.hinter_middle = {
    top: res.currentStillInTop.at(0) * height,
    height:
      (res.currentStillInTop.at(-1) - res.currentStillInTop.at(0)) * height,
  };
  data.hinter.hinter_bottom = {
    top: res.topStillHasSb.at(0) * height,
    height: (res.topStillHasSb.at(-1) - res.topStillHasSb.at(0)) * height,
  };
  console.log("slider compute spent time:", Date.now() - start_time);
}
</script>

<style lang="less" scoped>
.slider-block {
  align-items: center;
  margin-left: 30px;
  margin-right: 30px;
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.3));

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
  position: absolute;
  z-index: -1;
  top: 4vh;
  width: 100px;
}

.slider-hinter {
  pointer-events: none;
  position: absolute;
  background-color: rgb(84, 123, 192);
  opacity: 0.5;
  left: 23.5%;
  width: 50%;
}

.slider-track {
  background-color: #e7eae8;
  border: solid grey 1px;
  cursor: pointer;
  position: relative;
  left: 22.5px;
  height: 100%;
  width: 50%;
}

.slider-cursor-frame {
  position: absolute;
  display: inline-block;
  top: 2.5vh;
  left: 48px;
  height: 50px;
  width: 10px;
  transition: 0.5s;
  transform: translate(0, var(--slider-y));
  // transition-delay: 0.1s;
  cursor: grab;

  &:active {
    transition-delay: 0s;
    transition: 0s;
    cursor: grabbing;
  }
}
</style>
