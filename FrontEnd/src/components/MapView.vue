<template>
  <div id="MapView">
    <!-- The Map -->
    <div class="map-frame">
      <div id="map" class="map"></div>
    </div>

    <div class="zoom-slider">
      <el-button
        @click="ResetPosition"
        :icon="LocationFilled"
        style="margin-bottom: 1vh"
        circle
      >
      </el-button>
      <!-- @click="ResetPosition"
        @input="SetZoom" -->
      <el-slider
        v-model="data.zoom"
        :step="1"
        :max="100"
        :min="0"
        @input="ChangeZoom"
        vertical
      >
      </el-slider>
    </div>
    <div style="height: 8vh">
      <!-- <el-button @click="GetData">GetData</el-button> -->
      <el-button @click="AddOverlay">Add Ticks</el-button>
      <el-button @click="RemoveOverlay">Remove Ticks</el-button>
      <el-button @click="GetViewPort">Get View Port</el-button>
      <time-line></time-line>
    </div>

    <el-card
      id="popUp"
      style="background-color: white; height: 30vh; overflow: scroll; overflow-x:hidden"
    >
      <template #header>
        <span>Selected Blocks</span>
      </template>
      <div v-for="block in data.popOver" :key="block">
        <el-checkbox>
          {{ block }}
        </el-checkbox>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import monotoneChainConvexHull from "monotone-chain-convex-hull";
import { theme } from "./Map/style";
import { GetCurrentRecord, GetBlocks, GetRegions } from "../database/query.js";
import { LocationFilled } from "@element-plus/icons-vue";
import TimeLine from "./TimeLine.vue";
import Map from "ol/Map";
import View from "ol/View";
import { Layer } from "./Map/vectorlayer";
import { fromLonLat, useGeographic } from "ol/proj";
import { onMounted } from "@vue/runtime-core";
import { mapboxlayer } from "./Map/mapboxlayer";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import Cluster from "ol/source/Cluster";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Overlay from "ol/Overlay";
import { GetBlockClusterArray, GetRegionClusterArray } from "./Map/cluster";
import { LineString, Polygon } from "ol/geom";

import {
  createEmpty,
  extend,
  getWidth,
  containsXY,
  containsExtent,
  containsCoordinate,
} from "ol/extent";
// the configuration
const config = {
  zoom: 10,
  minZoom: 8,
  // minZoom: 3,
  maxZoom: 18,
  center: [116.39142503729663, 39.90484407050692],
  extend: [
    112.91586151114309, 39.13767962555457, 119.71639862051808,
    41.264546138018204,
  ],
};

// the reactive data
const data = reactive({
  zoom: Math.floor(
    ((config.zoom - config.minZoom) * 100) / (config.maxZoom - config.minZoom)
  ),
  blocks: [],
  popOver: [],
});

// for test

function AddOverlay() {
  // let currentExtent = map.getView().calculateExtent(map.getSize());
  // for (let i = 0; i < data.blocks.length; i++) {
  //   const element = data.blocks[i];
  //   if (containsXY(currentExtent, element["lng"], element["lat"])) {
  //     const overlay = new Overlay({
  //       id: element["block"],
  //       position: [element["lng"], element["lat"]],
  //       element: document.getElementById(element["block"]),
  //       insertFirst: true,
  //     });
  //     map.addOverlay(overlay);
  //   }
  // }
}

function RemoveOverlay() {
  // 不能边遍历变删，需要缓存到数组一下
}

function GetViewPort() {
  console.log(map.getView().calculateExtent(map.getSize()));
}

// -------------------------- Useful functions ---------------------------

// The Openlayers
useGeographic();
const map = new Map({
  layers: [mapboxlayer],
  view: new View({
    center: config.center,
    zoom: config.zoom,
    extent: config.extend,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
  }),
  controls: [],
});
map.getView().on("change", ChangeView);

let overLay = null;
onMounted(() => {
  map.setTarget("map");
  AddPoint();

  map.on("click", (event) => {
    let features = map.getFeaturesAtPixel(event.pixel);
    let clickFeature = features[0];

    if (overLay != null) {
      overLay.getElement().style.visibility = "hidden";
    }

    if (clickFeature) {
      features = clickFeature.get("features");
      let new_popOver = features.map((feature) => feature.get("block"));
      data.popOver = new_popOver;

      let rm = null;
      if (overLay != null) {
        rm = overLay.getElement().parentElement;
        overLay = null;
      }
      overLay = new Overlay({
        element: document.getElementById("popUp"),
      });
      console.log(overLay.getElement());
      overLay.getElement().style.visibility = "visible";
      overLay.setPosition(event.coordinate);
      if (rm != null) {
        rm.remove();
      }
      map.addOverlay(overLay);
      // rm.remove();
    }
  });

  // hover
  map.on("pointermove", (event) => {
    let features = map.getFeaturesAtPixel(event.pixel);
    map.getTargetElement().style.cursor = features[0] ? "pointer" : "";
  });
});
function AddPoint() {
  GetBlocks().then((res) => {
    GetBlockClusterArray(res).forEach((layer) => map.addLayer(layer));
    // GetRegionClusterArray(GetBlockClusterArray());
    GetRegionClusterArray(res).forEach((layer) => map.addLayer(layer));

    ChangeClusterView(data.zoom);
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
    zoomThrottle = setTimeout(() => {
      zoomThrottle = null;
      let new_zoom =
        config.minZoom +
        ((config.maxZoom - config.minZoom) * zoom_percentage) / 100;
      map.getView().animate({
        zoom: new_zoom,
        duration: 100,
      });
    }, 100);
  }
}

function ChangeClusterView(zoom) {
  if (zoom > 60) {
    GetRegionClusterArray().forEach((layer) => layer.setVisible(false));
    GetBlockClusterArray().forEach((layer) => layer.setVisible(true));
  } else {
    GetRegionClusterArray().forEach((layer) => layer.setVisible(true));
    GetBlockClusterArray().forEach((layer) => layer.setVisible(false));
  }
}

function ChangeView() {
  let zoom = map.getView().getZoom();
  let new_percentage_zoom = Math.floor(
    ((zoom - config.minZoom) * 100) / (config.maxZoom - config.minZoom)
  );
  if (
    data.zoom - new_percentage_zoom >= 1 ||
    data.zoom - new_percentage_zoom <= -1
  ) {
    data.zoom = new_percentage_zoom;
  }
  ChangeClusterView(data.zoom);
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

.ol-viewport {
  border-radius: 10px;
}

.map-frame {
  width: 98%;
  height: 90%;
  margin: 1%;
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

  ::-webkit-scrollbar {
    width: 15px;
  }
}
</style>