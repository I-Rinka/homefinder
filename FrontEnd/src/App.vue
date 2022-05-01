<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import MapView from "./components/MapView.vue";
import MapView from "./components/MapView.vue";
import RankView from "./components/RankView.vue";
</script>

<template>
  <!-- <map-view></map-view> -->
  <div>
    <map-view></map-view>
    <rank-view></rank-view>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

:root {
  --el-color-primary: #487cc6;
  --el-border-color: grey;
  --el-border-color-light: grey;
}
</style>
