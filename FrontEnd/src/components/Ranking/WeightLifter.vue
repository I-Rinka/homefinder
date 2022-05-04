<template>
  <div class="weight-lifter">
    {{ store.count }}
    <weight-slider></weight-slider>
  </div>
</template>

<script setup>
import WeightSlider from "./WeightSlider.vue";
import { useStore } from "../store/weight";

const store = useStore();

</script>

<style lang="less" scoped>
.weight-lifter {
  height: 100%;
  width: 40%;
  background-color: rgb(80, 130, 179);
  background-image: url("http://localhost:3000/weighlifter.jpg");
  background-size: contain;
}
</style>
