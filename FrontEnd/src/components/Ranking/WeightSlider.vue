<template>
  <div class="slider-block">
    <div>
      <!-- other -->
      <vue-draggable-next
        class="global-weight-hinter"
        :list="store.GetCriterisNames(include_props)"
        :group="{ name: 'all' }"
      >
        <div
          class="reserved"
          v-for="c in store.GetCriterisNames(include_props)"
          :style="{
            backgroundColor: store.GetCriteria(c).color,
            '--strip-width': `${100 * store.GetCriteria(c).weight}%`,
          }"
          :key="store.GetCriteria(c).name"
        >
          <div>
            {{ store.GetCriteria(c).name }}
          </div>
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
        :list="data.topCriterias"
        :group="{ name: 'all' }"
      >
        <div
          v-for="c in data.topCriterias"
          :style="{
            backgroundColor: store.GetCriteria(c).color,
            width: `${
              (store.GetCriteria(c).weight / top_percentage_sum) * 100
            }%`,
          }"
          :key="store.GetCriteria(c).name"
        >
          <div>
            {{ store.GetCriteria(c).name }}
          </div>
        </div>
      </vue-draggable-next>

      <el-slider
        v-model="bottom_slider_percentage"
        vertical
        height="25vh"
        :min="0.01"
        :max="0.99"
        :step="0.01"
      />

      <!-- slider bottom end -->
      <vue-draggable-next
        class="slider-ends"
        :list="data.bottomCriterias"
        :group="{ name: 'all' }"
      >
        <div
          v-for="c in data.bottomCriterias"
          :style="{
            backgroundColor: store.GetCriteria(c).color,
            width: `${
              (store.GetCriteria(c).weight / bottom_percentage_sum) * 100
            }%`,
          }"
          :key="store.GetCriteria(c).name"
        >
          <div>
            {{ store.GetCriteria(c).name }}
          </div>
        </div>
      </vue-draggable-next>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from "@vue/runtime-core";
import { useStore } from "../store/weight";
import { VueDraggableNext } from "vue-draggable-next";

const store = useStore();
const props = withDefaults(
  defineProps<{
    topCriterias: string[];
    bottomCriterias: string[];
  }>(),
  {}
);

const data = reactive({
  topCriterias: props.topCriterias,
  bottomCriterias: props.bottomCriterias,
});

const include_props = computed(() =>
  data.topCriterias.concat(data.bottomCriterias)
);

const top = computed(() => store.GetCriterias(data.topCriterias));
const bottom = computed(() => store.GetCriterias(data.bottomCriterias));

const current_weight_overall = computed(() => {
  let sum = 0;
  top.value.forEach((x) => (sum += x.weight));
  bottom.value.forEach((x) => (sum += x.weight));
  return sum;
});

const bottom_slider_percentage = computed({
  get() {
    let sum = 0;
    bottom.value.forEach((x) => (sum += x.weight));
    return sum / current_weight_overall.value;
  },
  set(value: number) {
    let old_value = bottom_slider_percentage.value;
    let change = value / old_value;

    for (let i = 0; i < bottom.value.length; i++) {
      bottom.value[i].weight *= change;
    }

    for (let i = 0; i < top.value.length; i++) {
      top.value[i].weight *= (1 - value) / (1 - old_value);
    }
  },
});

const bottom_percentage_sum = computed(() => {
  let sum = 0;
  for (let i = 0; i < data.bottomCriterias.length; i++) {
    const c = data.bottomCriterias[i];
    sum += store.GetCriteria(c).weight;
  }
  return sum;
});

const top_percentage_sum = computed(() => {
  let sum = 0;
  for (let i = 0; i < data.topCriterias.length; i++) {
    const c = data.topCriterias[i];
    sum += store.GetCriteria(c).weight;
  }
  return sum;
});
</script>

<style lang="less" scoped>
.slider-block {
  align-items: center;
  margin-left: 20px;
  margin-right: 20px;
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
  div {
    height: 3vh;

    div {
      opacity: 0;
      position: absolute;
      color: white;
      filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.8));
      transition: 0.5s;
      pointer-events: none;
      transform: scale(0, 0) translate(20%, 20%);
    }
    &:hover {
      div {
        opacity: 1;
        transform: scale(1, 1) translate(20%, 20%);
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
    height: 1vh;
    cursor: grab;
    transition: 0.3s;
    transition-property: transform, padding-left, padding-right;

    div {
      opacity: 0;
      position: absolute;
      color: white;
      filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.8));
      transition: 0.5s;
      pointer-events: none;
      transform: scale(0, 0) translate(20%, 20%);
    }
    &:hover {
      padding-left: calc(var(--strip-width) / 3);
      padding-right: calc(var(--strip-width) / 3);
      transform: scale(1, 1.5) translateY(-0.15vh);
      div {
        opacity: 1;
        transform: scale(1.5, 1) translate(20%, 20%);
      }
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
  }
}
</style>
