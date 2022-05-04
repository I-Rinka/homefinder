<template>
  <div class="weight-lifter">
    <div>
      <span
        style="margin: 10px; color: white; padding: 3px"
        v-for="c in store.weights"
        :style="{ backgroundColor: c.color }"
        :key="c.name"
        >{{ c.weight.toFixed(2) }}</span
      >
    </div>
    <div class="sliders-container">
      <weight-slider
        :top-criterias="['red']"
        :bottom-criterias="['blue']"
      ></weight-slider>
      <weight-slider
        :top-criterias="['green', 'yellow']"
        :bottom-criterias="['blue', 'red']"
      ></weight-slider>
      <weight-slider
        :top-criterias="['blue', 'green', 'yellow']"
        :bottom-criterias="['red']"
      ></weight-slider>
    </div>
  </div>
</template>

<script setup>
import WeightSlider from "./WeightSlider.vue";
import { useStore } from "../store/weight";

const store = useStore();

store.AddCriteria("red", "red");
store.AddCriteria("blue", "blue");
store.AddCriteria("yellow", "yellow");
store.AddCriteria("green", "green");
</script>

<style lang="less" scoped>
.weight-lifter {
  height: 100%;
  width: 40%;
  background-color: rgb(220, 220, 220);
  // background-image: url("http://localhost:3000/weighlifter.jpg");
  // background-size: contain;
}

.sliders-container {
  display: flex;
}
</style>
