<template>
  <div class="weight-lifter">
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

store.AddCriteria("red", "#bf2019");
store.AddCriteria("blue", "#527cc5");
store.AddCriteria("yellow", "#ea8f35");
store.AddCriteria("green", "#62a04f");
store.AddCriteria("bluegreen", "#7fb7b1");
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
  position: absolute;
  margin: 30px;
  display: flex;
}
</style>
