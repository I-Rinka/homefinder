<template>
  <div
    class="slider-block"
    v-if="data.top.length > 0 && data.bottom.length > 0"
  >
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
        <template v-for="c in data.top" :key="c">
          <div
            :style="{
              '--strip-width': `${(c.weight / top_percentage_sum) * 100}%`,
              '--strip-color': c.color,
            }"
          ></div>
        </template>
      </vue-draggable-next>

      <el-slider
        v-model="bottom_slider_percentage"
        vertical
        height="25vh"
        :min="0.01"
        :max="0.99"
        :step="0.01"
      />

      <vue-draggable-next
        class="slider-ends"
        :list="data.bottom"
        :group="{ name: 'all', pull: !(data.bottom.length == 1), put: true }"
      >
        <template v-for="c in data.bottom" :key="c">
          <div
            :style="{
              '--strip-width': `${(c.weight / bottom_percentage_sum) * 100}%`,
              '--strip-color': c.color,
            }"
          ></div>
        </template>
      </vue-draggable-next>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, toRaw, watch } from "@vue/runtime-core";
import { useStore } from "../store/weight";
import { VueDraggableNext } from "vue-draggable-next";

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
});

const include_names = computed(() => {
  let val = data.bottom.map((d) => d.name).concat(data.top.map((d) => d.name));
  return val;
});

const exclude_criterias = computed(() => {
  console.log(include_names.value);
  console.log(store.GetCriterias(store.GetCriteriaNames(include_names.value)));
  return store.GetCriterias(store.GetCriteriaNames(include_names.value));
});

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
</script>

<style lang="less" scoped>
.slider-block {
  align-items: center;
  margin-left: 30px;
  margin-right: 30px;
  position: relative;
  z-index: 0;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  .el-slider {
    position: relative;
    left: 5px;
    width: 90px;
    --el-slider-runway-bg-color: #e7eae8;
  }
}

.slider-ends {
  box-shadow: 0px 0px 0px 1px grey;
  display: flex;
  width: 100px;
  border-radius: 5px;
  overflow: hidden;
  // position: relative;
  z-index: 0;
  div {
    height: 3vh;
    background-color: var(--strip-color);
    width: var(--strip-width);

    div {
      font-size: 1.5vh;
      opacity: 0;
      // position: absolute;
      color: white;
      transition: 0.4s;
      pointer-events: none;
      transform: translate(0%, 25%);
      border-radius: 3px;
      height: 2vh;
      padding-left: 0.5vh;
      padding-right: 0.5vh;
    }
    &:hover {
      div {
        padding: 0.5vh;
        opacity: 1;
        transform: translate(0%, 0%);
      }
    }
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
    transition: 0.5s;
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
