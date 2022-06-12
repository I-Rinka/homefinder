<template>
  <div class="select-pannel">
    <div class="select-pannel-switch">
      <el-radio-group v-model="data.current_view" size="small">
        <el-radio-button label="select" border
          ><el-icon><Select /></el-icon
        ></el-radio-button>
        <el-radio-button label="favorite" border
          ><el-icon><StarFilled /></el-icon
        ></el-radio-button>
        <el-radio-button label="hidden" border
          ><el-icon><Hide /></el-icon
        ></el-radio-button>
      </el-radio-group>
      <el-button
        style="position: relative; left: 10px; top: 5px"
        type="danger"
        :icon="Delete"
        plain
        size="small"
        @click="RemoveAll"
        >Remove All</el-button
      >
      <el-button
        v-if="data.current_view === 'favorite'"
        style="position: relative; left: 5px; top: 5px"
        type="info"
        :icon="Select"
        plain
        size="small"
        @click="AddToSelect"
        >Add to Select list</el-button
      ><el-button
        v-if="data.current_view === 'select'"
        style="position: relative; left: 5px; top: 5px"
        type="info"
        :icon="Hide"
        plain
        size="small"
        @click="AddToHidden"
        >Hidde All</el-button
      >
    </div>
    <div class="select-table">
      <select-house-list
        v-if="data.current_view === 'select'"
        :houses="house_store.selectedHouseArrary"
        @delete="
          (name) => {
            house_store.RemoveHouse(name);
          }
        "
      ></select-house-list>
      <select-house-list
        v-else-if="data.current_view === 'favorite'"
        :houses="house_store.favoriteHouseArray"
        @delete="
          (name) => {
            house_store.RemoveFavoriteHouse(name);
          }
        "
      ></select-house-list>
      <select-house-list
        v-else-if="data.current_view === 'hidden'"
        :houses="house_store.bannedHouseArray"
        @delete="
          (name) => {
            house_store.RemoveBannedHouse(name);
          }
        "
      ></select-house-list>
    </div>
  </div>
</template>

<script setup>
import { useHouseStore } from "../store/selectedHouse";
import { reactive } from "@vue/reactivity";
import SelectHouseList from "./SelectHouseList.vue";
import {
  Select,
  StarFilled,
  Hide,
  CircleCloseFilled,
  Delete,
} from "@element-plus/icons-vue";
import { computed } from "@vue/runtime-core";

const data = reactive({
  current_view: "select",
});

const house_store = useHouseStore();

house_store.ConstructBlockDataMap();

function RemoveAll() {
  if (data.current_view === "select") {
    house_store.selectedHouse = {};
  } else if (data.current_view === "favorite") {
    house_store.favoriteHouse = {};
  } else if (data.current_view === "hidden") {
    house_store.bannedHouse = {};
  }
}

function AddToSelect() {
  for (const key in house_store.favoriteHouse) {
    if (Object.hasOwnProperty.call(house_store.favoriteHouse, key)) {
      const element = house_store.favoriteHouse[key];
      house_store.selectedHouse[key] = element;
    }
  }
}
function AddToHidden() {
  house_store.selectedHouse = {};

  for (const key in house_store.selectedHouse) {
    if (Object.hasOwnProperty.call(house_store.selectedHouse, key)) {
      const element = house_store.selectedHouse[key];
      house_store.bannedHouse[key] = element;
    }
  }
}
</script>

<style lang="less" scoped>
.select-pannel {
  width: 30vw;
  background-color: white;
  border-radius: 5px;
  animation: enter 0.2s;
  overflow: hidden;
}

.select-table {
  position: relative;
  margin: 38px 5px 25px 5px;
  height: 95%;
  overflow: scroll;
}

.select-pannel-switch {
  position: absolute;
  left: 15px;
  top: 7px;
}

@keyframes voidTextEnter {
  from {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
