<template>
  <div class="weight-lifter">
    <div class="test">
      <div class="enabled" v-for="d in enabled" :key="d.name">
        <el-checkbox v-model="d.checked"></el-checkbox>
        {{ d.name }}
      </div>

      <div class="disabled" v-for="d in disabled" :key="d.name">
        <el-checkbox v-model="d.checked"></el-checkbox>
        {{ d.name }}
      </div>
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
import { reactive } from "@vue/reactivity";
import { computed, onMounted } from "@vue/runtime-core";

// ------------------------

function lst_item(name, checked) {
  this.name = name;
  this.checked = checked ? checked : false;
}

const react_data = reactive({
  lst: [],
});

const enabled = computed(() => react_data.lst.filter((d) => d.checked));
const disabled = computed(() => react_data.lst.filter((d) => !d.checked));

onMounted(() => {
  for (let i = 0; i < 10; i++) {
    if (i < 5) {
      react_data.lst.push(new lst_item(i.toString() + "hello", true));
    } else {
      react_data.lst.push(new lst_item(i.toString() + "hello", false));
    }
  }
});

// ------------------------

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
  height: 3vh;
  border-radius: 5px;
  overflow: hidden;
  background-color: aliceblue;

  .enabled {
    margin: 2px 5px 2px 5px;
    padding: 5px 20px 5px 20px;
    background-color: rgb(158, 158, 158);
    animation: enter 0.5s;
    transition: 0.5s;
  }
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
