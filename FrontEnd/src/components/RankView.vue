<template>
  <div id="weight-view">
    <div class="weight-view-frame">
      <!-- <line-up
        :origin_records="data.newest_records.filter((d) => d.area < 30)"
      ></line-up> -->
      <!-- <line-up :origin_records="data.newest_records"></line-up> -->
      <line-up :origin_records="newest_records"></line-up>
      <weight-lifter></weight-lifter>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRaw } from "@vue/reactivity";
import { computed, onMounted } from "@vue/runtime-core";
import { GetNewestRecords } from "../database/query";
import LineUp from "./Ranking/Lineup.vue";
import WeightLifter from "./Ranking/WeightLifter.vue";

import { useHouseStore } from "./store/selectedHouse.js";

const data = reactive({
  newest_records: [],
});

const houseStore = useHouseStore();

const newest_records = computed(() => {
  if (houseStore.selectedHouseArrary.length <= 0) {
    return data.newest_records.filter(
      (d) =>
        !houseStore.bannedHouse[d.block] && !houseStore.IsInBannedRules(d.block)
    );
  } else {
    return data.newest_records.filter(
      (d) =>
        houseStore.IsSelectedHouse(d.block) &&
        !houseStore.IsInBannedRules(d.block)
    );
  }
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
  /* top: 0px; */
  height: 39vh;
}

.weight-view-frame {
  display: flex;
  padding: auto;
  height: 100%;
}
</style>
