<template>
  <div id="MapView">
    <div class="zoom-slider">
      <el-button circle style="margin-bottom: 1vh" size="big" @click="ResetPos"><i class="el-icon-map-location"></i>
      </el-button>
      <el-slider v-model="zoom" :step="0.1" :max="20" :min="10" vertical>
      </el-slider>
    </div>
    <div :id="MapEsstential.el" style="width: 100%; height: 100%"></div>

    <div style="height: 8vh;">
      <el-button @click="GetData">GetData</el-button>
      <el-button @click="AddPoint">Add RandomPoint</el-button>
      <time-line></time-line>
    </div>
  </div>
</template>

<script setup>
import { theme } from "./Map/style";
import TimeLine from './TimeLine.vue';
import { GetCurrentRecord } from "../database/query.js";
import { ref, reactive, onMounted } from "vue";

const df_lng = 116.404;
const df_lat = 39.915;
const df_zoom = 15;

const data = reactive({
  center: {
    lng: df_lng,
    lat: df_lat
  },
  zoom: df_zoom
})
let MapEsstential = {
  ak: "ODpi3pGmHfZFVpQTCEfb90yE1hcNMuWA",
  el: "BaiduMap",
  BMapGL: null
}


onMounted(() => {
  getMapScript().then(initMap)
})

function initMap(BMapGL) {
  MapEsstential.BMapGL = BMapGL
  init(BMapGL)
}

function init(BMapGL) {
  const map = new BMapGL.Map(MapEsstential.el, {})
  map.reset()
  map.centerAndZoom(data.center, data.zoom)
}
if (global === undefined) {
  var global = window;
}
function getMapScript() {
  if (!global.BMapGL) {
    const ak = MapEsstential.ak
    global.BMapGL = {}
    global.BMapGL._preloader = new Promise((resolve, reject) => {
      global._initBaiduMap = function () {
        resolve(global.BMapGL)
        global.document.body.removeChild($script)
        global.BMapGL._preloader = null
        global._initBaiduMap = null
      }
      const $script = document.createElement('script')
      global.document.body.appendChild($script)
      $script.src = `https://api.map.baidu.com/api?type=webgl&v=1.0&ak=${ak}&callback=_initBaiduMap`
    })
    return global.BMapGL._preloader
  } else if (!global.BMapGL._preloader) {
    return Promise.resolve(global.BMapGL)
  } else {
    return global.BMapGL._preloader
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
#MapView {
  height: 58vh;
}

#bm-view {
  width: 98%;
  height: 50vh;
  margin: 1%;
}

.zoom-slider {
  display: inline;
  position: absolute;
  top: 15vh;
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.5));
  left: 3vw;
  z-index: 6;
  cursor: default;

  >div {
    height: 20vh;

    .el-slider__runway {
      background-color: white !important;
    }
  }
}
</style>

