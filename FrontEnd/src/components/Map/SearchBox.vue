<template>
  <div class="geo-search" v-click-outside="LoseFocus">
    <el-input
      :style="{ '--input-width': `${data.inputWidth}px` }"
      v-model="data.input"
      placeholder="Search Location"
      @pointerenter="data.inputWidth = 200"
      @change="UserSearch"
      @input="data.searchResult = []"
    >
      <template #prefix>
        <el-icon class="el-input__icon"
          ><search color="rgb(96, 98, 102)"
        /></el-icon>
      </template>
    </el-input>
    <div
      class="location-list"
      v-if="data.searchResult.length > 0 && data.inputWidth === 200"
    >
      <div
        v-for="res in data.searchResult"
        :key="res.addr_name"
        class="location-list-item"
        :title="`Click to Go to ${res.addr_name}`"
        @click="ClickLocation(res.coord)"
      >
        <span>
          <el-icon style="position: relative; top: 2px"><Position /></el-icon>
          {{ res.addr_name }}
        </span>
        <span
          v-if="typeof res.district === 'string'"
          style="
            background-color: rgb(195, 102, 98);
            margin-left: 20px;
            border-radius: 3px;
            padding: 1px 5px 1px 5px;
            color: white;
            font-size: 1px;
            transform: scale(0.9, 0.9);
          "
          >{{ res.district }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, Position } from "@element-plus/icons-vue";
import { reactive } from "@vue/reactivity";
import { ClickOutside as vClickOutside } from "element-plus";
import { SearchLocation } from "../../database/onlineQuery";
import coordtransform from "coordtransform";
import { emitter } from "../store/bus";

const data = reactive({
  input: "",
  inputWidth: 15,
  searchResult: [],
});

function LoseFocus() {
  data.inputWidth = 15;
}

function UserSearch() {
  data.searchResult = [];
  SearchLocation(data.input).then((res) => {
    if (res.info === "OK") {
      data.searchResult = res.pois.map((d) => ({
        addr_name: d.name,
        district: d.adname,
        coord: d.location,
      }));
    }
  });
}

function ClickLocation(coord) {
  let lng_lat = coord.split(",");
  let wgs84_coord = coordtransform.gcj02towgs84(
    Number.parseFloat(lng_lat[0]),
    Number.parseFloat(lng_lat[1])
  );
  emitter.emit("goto-coord", wgs84_coord);
}
</script>

<style lang="less">
.geo-search {
  position: absolute;
  z-index: 100;
  .el-input {
    input {
      width: var(--input-width) !important;
      border-radius: 15px;
      padding-left: 30px !important;
      padding-right: 10px !important;
      transition: 0.3s;
    }
  }
}

.location-list {
  border-radius: 10px;
  color: #8b8c8f;
  margin-top: 10px;
  background-color: white;
  padding: 5px 0;
}

.location-list-item {
  display: flex;
  justify-content: space-between;
  border-radius: 3px;
  margin: 5px 10px;
  padding: 7.5px;
  transition: 0.3s;

  &:hover {
    background-color: whitesmoke;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
    cursor: pointer;
    color: #527cc5;
  }
}
</style>
