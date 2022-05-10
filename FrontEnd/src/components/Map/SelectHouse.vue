<template>
  <div class="select-pannel">
    <div class="select-table">
      <TransitionGroup tag="div" name="list-complete">
        <div
          class="select-item"
          v-for="house in house_store.selectedHouseArrary"
          :key="house.block"
        >
          <el-checkbox
            :checked="true"
            @change="ClickCheckBox(house.block)"
            size="small"
          >
            {{ house.block }}</el-checkbox
          >
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { useHouseStore } from "../store/selectedHouse";

const house_store = useHouseStore();

function ClickCheckBox(name) {
  house_store.RemoveHouse(name);
}
</script>

<style lang="less" scoped>
.list-complete-enter-from, .list-complete-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  transform: translateY(45vh);
  opacity: 0;
}
.list-complete-leave-active {
  position: absolute;
}

.select-pannel {
  width: 30vw;
  background-color: white;
  border-radius: 5px;
  animation: enter 0.2s;
  overflow: hidden;
}

.select-table {
  position: relative;
  margin: 30px 5px 25px 5px;
  height: 95%;
  overflow: scroll;
}

.select-item {
  background-color: whitesmoke;
  border-radius: 5px;
  display: flex;
  margin: 5px 5px 12px 12px;
  padding: 7px;
  font-size: 12px;
  transition: 0.5s;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
}

@keyframes enter {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
