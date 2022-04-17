<template>
  <div id="MapView">

    <!-- The Map -->
    <div class="map-frame">
      <div id="BaiduMap"></div>
    </div>

    <div class="zoom-slider">
      <el-button :icon="LocationFilled" style="margin-bottom: 1vh" @click="ResetPosition" circle>
      </el-button>
      <el-slider v-model="data.zoom" @input="SetZoom" :step="0.1" :max="20" :min="10" vertical>
      </el-slider>
    </div>

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
import { ref, reactive, onMounted, watch } from "vue";
import { LocationFilled } from "@element-plus/icons-vue";
import { initBaiduMap } from "./Map/baidumap.js";

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


let ak = "ODpi3pGmHfZFVpQTCEfb90yE1hcNMuWA"
let BMapGL = null
let mapInstance = null


onMounted(() => {
  initBaiduMap("BaiduMap", ak, { minZoom: 10, maxZoom: 20 }).then(map => {
    map.Instance.centerAndZoom(data.center, data.zoom);
    BMapGL = map.BMapGL;
    mapInstance = map.Instance;
    mapInstance.enableScrollWheelZoom();
    mapInstance.setMapStyleV2({ styleJson: theme });
  });
});

let zoomThrottle = null
let zoomScale = df_zoom;
function SetZoom(newVal) {
  zoomScale = newVal;
  if (zoomThrottle == null) {
    zoomThrottle = setTimeout(() => {
      mapInstance.setZoom(zoomScale);
      zoomThrottle = null;
    }, 60)
  }
}

function ResetPosition() {
  mapInstance.centerAndZoom({ lng: df_lng, lat: df_lat }, df_zoom);
  data.center = { lng: df_lng, lat: df_lat };
  data.zoom = df_zoom;
}

function GetData() {

}
function AddPoint() {

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
#MapView {
  height: 58vh;
}

#BaiduMap {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

.map-frame {
  width: 98%;
  height: 90%;
  margin: 1%;
}

.anchorBL {
  opacity: 100%;
  display: none;
}

.zoom-slider {
  display: inline;
  position: absolute;
  top: 15vh;
  height: 15vh;
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

