<template>
  <div class="weight-lifter">
    <div class="test">
      <div class="disabled" v-for="d in disabled" :key="d.name">
        <el-checkbox style="z-index: -0" v-model="d.enabled"></el-checkbox>
        {{ d.name }}
      </div>
    </div>
    <div class="sliders-container">
      <weight-slider
        :top-criterias="['area']"
        :bottom-criterias="['unit_price', 'direction']"
      ></weight-slider>
      <weight-triangle
        :criterias="['area', 'unit_price', 'deal_price']"
      ></weight-triangle>
      <!-- <weight-slider
        :top-criterias="['room', 'hall']"
        :bottom-criterias="['position', 'block_height']"
      ></weight-slider>
      <weight-slider
        :top-criterias="['type', 'decoration', 'area']"
        :bottom-criterias="['built_year']"
      ></weight-slider> -->
    </div>
  </div>
</template>

<script setup>
import WeightSlider from "./WeightSlider.vue";
import WeightTriangle from "./WeightTriangle.vue";
import { useStore } from "../store/weight";
import { reactive } from "@vue/reactivity";
import { computed, onMounted } from "@vue/runtime-core";

const disabled = computed(() => store.criterias.filter((d) => !d.enabled));

const store = useStore();
</script>

<style lang="less" scoped>
.weight-lifter {
  height: 100%;
  width: 40%;
  background-color: rgb(255, 255, 255);

  // background-image: url("http://localhost:3000/weighlifter.jpg");
  // background-size: contain;
}

.sliders-container {
  position: absolute;
  margin: 10px;
  display: flex;
}
.test {
  display: flex;
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
  background-color: aliceblue;

  .disabled {
    transition: 0.5s;
    margin: 2px 5px 2px 5px;
    color: white;
    background-color: rgb(53, 53, 53);
    animation: enter 0.5s;
  }
}

@keyframes enter {
  from {
    transform: scale(0, 0);
  }
  to {
    transform: scale(1, 1);
  }
}
</style>
