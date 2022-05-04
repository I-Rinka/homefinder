<template>
  <div class="slider-block">
    <div>
      <!-- other -->
      <vue-draggable-next
        class="top"
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
        ></div>
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
              data.topCriterias.length <= 1
                ? 100
                : (100 * store.GetCriteria(c).weight) /
                  (1 - bottom_slider_percentage.toFixed(2))
            }%`,
          }"
          :key="store.GetCriteria(c).name"
        ></div>
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
              data.bottomCriterias.length <= 1
                ? 100
                : (100 * store.GetCriteria(c).weight) /
                  bottom_slider_percentage.toFixed(2)
            }%`,
          }"
          :key="store.GetCriteria(c).name"
        ></div>
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
</script>

<style lang="less" scoped>
.slider-block {
  align-items: center;
  margin: 10px;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
  .el-slider {
    position: relative;
    left: 5px;
    width: 70px;
    --el-slider-runway-bg-color: whitesmoke;
  }
}

.slider-ends {
  display: flex;
  width: 80px;
  border-radius: 5px;
  overflow: hidden;
  justify-content: center;
  div {
    margin: 0;
    width: 100%;
    height: 2.5vh;
  }
}
.top {
  display: flex;
  margin-left: 5px;
  height: 1vh;
  width: 70px;
  .reserved {
    margin: 0;
    width: var(--strip-width);
    height: 1vh;
    cursor: -webkit-grab;
    transition: 0.3s;
    transition-property: transform, padding-left, padding-right;
    &:hover {
      padding-left: calc(var(--strip-width) / 3);
      padding-right: calc(var(--strip-width) / 3);
      transform: scale(1, 1.5) translateY(-0.15vh);
    }
    &:active {
      cursor: -webkit-grabbing;
    }
  }
  .current {
    background-color: #ffffff;
    height: 0.5vh;
    position: relative;
    top: 5px;
    width: var(--strip-width);
  }
}
</style>
