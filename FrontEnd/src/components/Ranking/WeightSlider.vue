<template>
  <div class="slider-demo-block">
    <div>
      <div class="top">
        <div
          v-for="c in top"
          :style="{ backgroundColor: c.color }"
          :key="c.name"
        >
          {{ c.weight.toFixed(2) }}
        </div>
      </div>
      <el-slider
        v-model="bottom_slider_percentage"
        vertical
        height="200px"
        :min="0.01"
        :max="0.99"
        :step="0.01"
      />

      <div class="bottom">
        <div
          v-for="c in bottom"
          :style="{ backgroundColor: c.color }"
          :key="c.name"
        >
          {{ c.weight.toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "@vue/runtime-core";
import { useStore } from "../store/weight";

const store = useStore();
const props = withDefaults(
  defineProps<{
    topCriterias: string[];
    bottomCriterias: string[];
  }>(),
  {}
);

const top = computed(() => store.GetCriterias(props.topCriterias));
const bottom = computed(() => store.GetCriterias(props.bottomCriterias));

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
.slider-demo-block {
  display: flex;
  align-items: center;
  margin: 20px;
}

.slider-demo-block .el-slider {
  margin-top: 0;
  margin-left: 12px;
}

.criteria-mixin {
  margin: 0;
  color: rgb(136, 136, 136);
}

.top {
  display: flex;
  div {
    .criteria-mixin();
  }
}
.bottom {
  display: flex;
  div {
    .criteria-mixin();
  }
}
</style>
