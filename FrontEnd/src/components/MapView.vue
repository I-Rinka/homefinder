<template>
  <div id="MapView">
    <!-- The Map -->
    <div class="map-frame">
      <div id="map" class="map"></div>
    </div>

    <div class="zoom-slider">
      <el-button :icon="LocationFilled" style="margin-bottom: 1vh" circle>
      </el-button>
      <!-- @click="ResetPosition"
        @input="SetZoom" -->
      <el-slider v-model="data.zoom" :step="0.1" :max="20" :min="10" vertical>
      </el-slider>
    </div>

    <div style="height: 8vh">
      <!-- <el-button @click="GetData">GetData</el-button> -->
      <el-button @click="AddPoint">Add Point</el-button>
      <time-line></time-line>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { theme } from "./Map/style";
import TimeLine from "./TimeLine.vue";
import { GetCurrentRecord, GetBlocks } from "../database/query.js";
import { LocationFilled } from "@element-plus/icons-vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Layer } from "./Map/vectorlayer";
import { useGeographic } from "ol/proj";
import { onMounted } from "@vue/runtime-core";
import { baiduMapLayer } from "./Map/baidumap";
import { mapboxlayer } from "./Map/mapboxlayer";
import {stylefunction} from 'ol-mapbox-style';

const data = reactive({ zoom: 15 });
// 116.39142503729663, 39.90484407050692
let map = null;
onMounted(() => {
  useGeographic();

  map = new Map({
    target: "map",
    layers: [
      // baiduMapLayer,
      mapboxlayer,
      Layer,
    ],
    view: new View({
      center: [116.39142503729663, 39.90484407050692],
      zoom: 10,
    }),
    controls: [],
  });
});

function AddPoint() {
  GetBlocks().then((res) => {
    console.log(res);
  });
}
</script>

<style lang="less">
#MapView {
  height: 58vh;
}

.map {
  width: 100%;
  height: 100%;
  border: solid gray 2px;
  border-radius: 15px;
}

.ol-layer {
  > canvas {
    border-radius: 14px;
  }
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

  > div {
    height: 20vh;

    .el-slider__runway {
      background-color: white !important;
    }
  }
}
</style>