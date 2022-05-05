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
          x1="100"
          y1="8"
          :x2="`${data.slider.x - 3}px`"
          :y2="`${data.slider.y - 5}px`"
          style="
            stroke-width: 2;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.3));
            opacity: 0.8;
            pointer-events: none;
          "
          :style="{ stroke: data.tri[0].color }"
        />
        <line
          x1="6"
          :y1="`${Root3(100) - 3}`"
          :x2="`${data.slider.x - 8}px`"
          :y2="`${data.slider.y + 4}px`"
          style="
            stroke-width: 2;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.3));
            opacity: 0.8;
            pointer-events: none;
          "
          :style="{ stroke: data.tri[1].color }"
        />
        <line
          x1="194"
          :y1="`${Root3(100) - 3}`"
          :x2="`${data.slider.x + 2}px`"
          :y2="`${data.slider.y + 4}px`"
          style="
            stroke-width: 2;
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
      <!-- <div class="slider-stage" @click="PrintData"></div> -->
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

function PressSlider() {
  data.slider.pressed = true;
  window.addEventListener("pointerup", ReleaseSlider);
}

function ReleaseSlider() {
  data.slider.pressed = false;
  window.removeEventListener("pointerup", ReleaseSlider);
}

let triSlider = ref(null);
let triSvg = ref(null);

function MoveSlider(e) {
  if (data.slider.pressed) {
    let XRatio =
      triSlider.value.getBBox().width /
      triSlider.value.getBoundingClientRect().width;
    let YRatio =
      triSlider.value.getBBox().height /
      triSlider.value.getBoundingClientRect().height;
    console.log(data.slider);
    data.slider.x = e.offsetX * XRatio;
    data.slider.y = e.offsetY * YRatio;
    data.slider.y = data.slider.y > 165 ? 165 : data.slider.y;
  }
}
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
  stroke-width: 2;
  stroke: #be1500;
  fill: transparent;
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.2));
  cursor: move;
  transform: translate(var(--slider-x), var(--slider-y));
  transition: 0.5s;
  &:hover {
    stroke: #f32e00;
  }
  &:active {
    transition: 0s;
    stroke: #f32e00;
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
