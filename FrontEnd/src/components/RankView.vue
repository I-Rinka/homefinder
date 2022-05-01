<template>
  <div id="weight-view">
    <div class="weight-view-frame">
      <line-up :ranking_records="data.newest_records"></line-up>
      <weight-lifter></weight-lifter>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { onMounted } from "@vue/runtime-core";
import { GetNewestRecords } from "../database/query";
import LineUp from "./Ranking/Lineup.vue";
import WeightLifter from "./Ranking/WeightLifter.vue";

const data = reactive({
  newest_records: [],
});

onMounted(() => {
  GetNewestRecords().then((res) => {
    data.newest_records = res;
  });
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#weight-view {
  position: relative;
  top: -1vh;
  height: 39vh;
  background-color: rgb(234, 234, 234);
}

.weight-view-frame {
  display: flex;
  padding: auto;
  height: 100%;
}
</style>
