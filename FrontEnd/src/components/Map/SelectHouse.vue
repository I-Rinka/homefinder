<template>
  <div class="select-pannel">
    <div
      class="select-item"
      v-for="house in house_store.selectedHouseArrary"
      :key="house.block"
    >
      {{ house.block }}
    </div>
  </div>
</template>

<script setup>
import { useHouseStore } from "../store/selectedHouse";

const house_store = useHouseStore();
</script>

<style lang="less" scoped>
.select-pannel {
  width: 20vw;
  background-color: white;
  border-radius: 5px;
  height: 100%;
  overflow: scroll;
  animation: enter 0.3s;
}

.select-item {
  background-color: whitesmoke;
  border-radius: 5px;
  display: flex;
  margin: 10px;
  padding: 5px;
  font-size: 12px;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
}

@keyframes enter {
  from {
    transform: translateX(10px);
    opacity: 0;
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
