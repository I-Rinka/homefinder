<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import MapView from "./components/MapView.vue";
import { reactive } from "@vue/reactivity";
import MapView from "./components/MapView.vue";
import RankView from "./components/RankView.vue";
import TimeLine from "./components/TimeLine.vue";

const data = reactive({
  use_baseline: false,

  current_time: { year: 0, month: 0 },
  baseline_time: { year: 0, month: 0 },
  selection_time: [
    { year: 0, month: 0 },
    { year: 0, month: 0 },
  ],
  current_baseline_selection: [
    [
      { year: 0, month: 0 },
      { year: 0, month: 0 },
    ],
    [
      { year: 0, month: 0 },
      { year: 0, month: 0 },
    ],
  ],
});

function ChangeCurrentTime(t) {
  data.current_time = t;
  console.log("change current time");
}

function ChangeSelection(t) {
  data.selection_time = t;
}

function ChangeSubtractor(t) {
  data.current_time = t[0];
  data.baseline_time = t[1];
  console.log("change subtractor", t);
}

function ChangeSubtractorSelection(t) {
  data.current_baseline_selection = t;
  console.log("change subtractor selection", t);
}

function ChangeSubtracorMode(b) {
  data.use_baseline = b;
  if (!b) {
    data.baseline_time = { year: 0, month: 0 };
  }
}

function ChangeSelectMode(b) {
  data.price_view = !b;

  if (!b) {
    data.selection_time = [
      { year: 0, month: 0 },
      { year: 0, month: 0 },
    ];
    data.current_baseline_selection = [
      [
        { year: 0, month: 0 },
        { year: 0, month: 0 },
      ],
      [
        { year: 0, month: 0 },
        { year: 0, month: 0 },
      ],
    ];
  }
}
</script>

<template>
  <!-- <map-view></map-view> -->
  <div
    style="
      height: 98%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    "
  >
    <map-view :current_time="data.current_time"></map-view>
    <time-line
      @changeCurrentTime="ChangeCurrentTime"
      @changeSubtractor="ChangeSubtractor"
      @changeSelection="ChangeSelection"
      @changeSubtractorSelection="ChangeSubtractorSelection"
      @changeSubtractorMode="ChangeSubtracorMode"
      @changeSelectMode="ChangeSelectMode"
    >
    </time-line>
    <rank-view></rank-view>
  </div>
</template>

<style>
body {
  margin: 0.5vw;
  height: 98vh;
  width: 99vw;
  overflow: hidden;
}
#app {
  height: 100%;
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
  --el-popover-border-radius: 5px;
}

::-webkit-scrollbar {
  width: 10px;
  height: 5px;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(150, 150, 150, 0.4);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(150, 150, 150, 0.7);
}

::-webkit-scrollbar-corner {
  display: none;
}

.el-dialog {
  border-radius: 5px !important;
}
</style>
