<template>
  <div class="line-up">
    <div class="weight-strip">
      <div
        class="enabled"
        v-for="d in enabled_strip"
        :key="d.name"
        :style="{
          '--strip-color': d.color,
          '--strip-width': `${(100 * d.weight) / strip_percentage_sum}%`,
        }"
      >
        <!-- backgroundColor: d.color, -->
        <div>
          <el-checkbox v-model="d.enabled"></el-checkbox>
          {{ d.name }}
        </div>
      </div>
    </div>

    <div class="table">
      <div
        class="table-content"
        v-for="record in props.ranking_records"
        :key="record._id"
      >
        {{
          record.block +
          " , " +
          record.area +
          " , " +
          record.direction +
          " , " +
          record.decoration +
          " , " +
          record.deal_price
        }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "../store/weight";
import { computed, onMounted } from "@vue/runtime-core";

const store = useStore();
const props = defineProps({
  ranking_records: {
    type: Array,
    default: [],
    required: false,
  },
});

// Add defualt criteria, this should be name of records criteria. Like price, area etc.
// name, color, enabled(default is disabled)
store.AddCriteria("red", "#bf2019", true);
store.AddCriteria("blue", "#527cc5");
store.AddCriteria("yellow", "#ea8f35");
store.AddCriteria("green", "#62a04f");
store.AddCriteria("bluegreen", "#7fb7b1", true);

const enabled_strip = computed(() => store.weights.filter((d) => d.enabled));

const strip_percentage_sum = computed(() => {
  let sum = 0;
  enabled_strip.value.forEach((d) => (sum += d.weight));
  return sum;
});
</script>

<style lang="less" scoped>
.line-up {
  position: relative;
  height: 100%;
  width: 60%;
  background-color: rgb(234, 234, 234);
}
.table {
  position: relative;
  margin: 20px;
  height: 95%;
  width: 98%;
  overflow: scroll;
}
.table-content {
  text-align: left;
  height: fit-content;
  margin: 5px;
  padding: 5px;
  background-color: rgb(255, 255, 255);
}
.weight-strip {
  display: flex;
  width: 100%;
  overflow: hidden;
  background-color: aliceblue;
  .enabled {
    border-radius: 5px;
    margin: 2px 5px 2px 5px;
    padding: 2px 20px 2px 20px;
    background-color: rgb(158, 158, 158);
    animation: enter 0.5s;
    transition: 0.5s;
    color: white;

    background-color: var(--strip-color);
    width: var(--strip-width);
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
