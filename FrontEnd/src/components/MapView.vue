<template>
  <div id="MapView">
    <!-- The Map -->
    <div class="map-frame">
      <div id="map" class="map"></div>
    </div>

    <div class="zoom-slider">
      <el-button @click="ResetPosition" :icon="LocationFilled" style="margin-bottom: 1vh" circle>
      </el-button>
      <!-- @click="ResetPosition"
        @input="SetZoom" -->
      <el-slider v-model="data.zoom" :step="1" :max="100" :min="0" @input="ChangeZoom" vertical>
      </el-slider>
    </div>
    <div style="height: 8vh">
      <!-- <el-button @click="GetData">GetData</el-button> -->
      <el-button @click="AddOverlay">Add Point</el-button>
      <time-line></time-line>
    </div>
    <div>
      <div style="transition-duration: 0.2s;" :id="block['block']" v-for="block in data.blocks" :key="block['block']">{{ block['block'] }}</div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { theme } from "./Map/style";
import { GetCurrentRecord, GetBlocks } from "../database/query.js";
import { LocationFilled } from "@element-plus/icons-vue";
import TimeLine from "./TimeLine.vue";
import Map from "ol/Map";
import View from "ol/View";
import { Layer } from "./Map/vectorlayer";
import { fromLonLat, useGeographic } from "ol/proj";
import { onMounted } from "@vue/runtime-core";
import { mapboxlayer } from "./Map/mapboxlayer";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import { Fill, Icon, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Overlay from "ol/Overlay";

const config = {
  zoom: 10,
  // minZoom: 8,
  minZoom: 3,
  maxZoom: 18,
  center: [116.39142503729663, 39.90484407050692]
}
const data = reactive({
  zoom: Math.floor((config.zoom - config.minZoom) * 100 / (config.maxZoom - config.minZoom)),
  blocks: []
});
let map = null;

onMounted(() => {
  useGeographic();

  map = new Map({
    target: "map",
    layers: [
      mapboxlayer,
      Layer,
    ],
    view: new View({
      center: config.center,
      zoom: config.zoom,
    }),
    controls: [],
  });

  map.getView().setMaxZoom(config.maxZoom);
  map.getView().setMinZoom(config.minZoom);

  map.getView().on('change', ChangeView);
  AddPoint();
});
function AddOverlay() {
  for (let i = 0; i < data.blocks.length; i++) {
    const element = data.blocks[i];
    const overlay = new Overlay({
      position: [element['lng'], element['lat']],
      element: document.getElementById(element['block'])
    })
    map.addOverlay(overlay);

  }
}
function AddPoint() {
  GetBlocks().then((res) => {
    data.blocks = res;
    let features = [];
    console.log(res);
    for (let i = 0; i < res.length; i++) {
      const element = res[i];
      let point_feature = new Feature({});

      if (element['block']==='环城南路') {
        console.log(element)
      }

      let point_geom = new Point([element.lng, element.lat]);
      point_feature.setGeometry(point_geom);
      features.push(point_feature);

    }

    let vector_layer = new VectorLayer({
      source: new VectorSource({
        features: features,
      }),
    });
    map.addLayer(vector_layer);

    let fill = new Fill({
      color: [180, 0, 0, 0.3],
    });

    let stroke = new Stroke({
      color: [180, 0, 0, 1],
      width: 1,
    });
    var style = new Style({
      image: new CircleStyle({
        fill: fill,
        stroke: stroke,
        radius: 8,
      }),
      fill: fill,
      stroke: stroke,
    });
    vector_layer.setStyle(style);

  });
}

function ResetPosition() {
  map.getView().animate({
    center: config.center,
    zoom: config.zoom,
    duration: 500,
  });
}

let zoomThrottle = null;
let zoom_percentage = 50;
function ChangeZoom(value) {
  zoom_percentage = value;
  if (zoomThrottle == null) {
    zoomThrottle = setTimeout(
      () => {
        zoomThrottle = null;
        let new_zoom = config.minZoom + (config.maxZoom - config.minZoom) * zoom_percentage / 100;
        map.getView().animate({
          zoom: new_zoom,
          duration: 100,
        });
      }, 100
    )
  }
}

function ChangeView() {
  let zoom = map.getView().getZoom();
  let new_percentage_zoom = Math.floor((zoom - config.minZoom) * 100 / (config.maxZoom - config.minZoom));
  if (data.zoom - new_percentage_zoom >= 1 || data.zoom - new_percentage_zoom <= -1) {
    data.zoom = new_percentage_zoom;
  }
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
  >canvas {
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

  >div {
    height: 20vh;

    .el-slider__runway {
      background-color: white !important;

      .el-slider__bar {
        transition-duration: 0.2s;
        transition-timing-function: ease-out;
      }

      .el-slider__button-wrapper {
        transition-duration: 0.2s;
        transition-timing-function: ease-out;
      }
    }
  }
}
</style>