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
    <sun-chart></sun-chart>
    <!-- <div>
      <sun-chart-adaptor v-for="feature in data.features" :key="feature.getGeometry().getCoordinates().toString()"
        :map="map" :feature="feature"></sun-chart-adaptor>
    </div> -->

  </div>
</template>

<script setup>
import { reactive, toRaw } from "@vue/reactivity";
import monotoneChainConvexHull from "monotone-chain-convex-hull";
import { GetCurrentRecord, GetBlocks, GetRegions } from "../database/query.js";
import { LocationFilled } from "@element-plus/icons-vue";
import TimeLine from "./TimeLine.vue";
import Map from "ol/Map";
import View from "ol/View";
import { beijingLayer } from "./Map/vectorlayer";
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
import SunChartAdaptor from "./Vis/SunChartAdaptor.vue"
import SunChart from "./Vis/SunChart.vue"

import {
  createEmpty,
  extend,
  getWidth,
  containsXY,
  containsExtent,
  containsCoordinate,
} from "ol/extent";
import { DragRotateAndZoom, PinchZoom, DragBox, defaults, DragRotate, DragZoom, KeyboardPan, PinchRotate, KeyboardZoom, DragPan, MouseWheelZoom, Translate, Select, Modify } from "ol/interaction";
import { shiftKeyOnly } from "ol/events/condition";
import PointerInteraction from "ol/interaction/Pointer";
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
  popOverCoord: '',
  features: []
});


const MarkSource = new VectorSource();
const MarkLayer = new VectorLayer({ source: MarkSource })

const modify = new Modify({
  hitDetection: MarkLayer,
  source: MarkSource,
});
modify.on(['modifystart', 'modifyend'], function (evt) {
  document.getElementById('map').style.cursor = evt.type === 'modifystart' ? 'grabbing' : 'pointer';
});
const overlaySource = modify.getOverlay().getSource();
overlaySource.on(['addfeature', 'removefeature'], function (evt) {
  document.getElementById('map').style.cursor = evt.type === 'addfeature' ? 'pointer' : '';
});


// -------------------------- Useful functions ---------------------------

// The Openlayers
useGeographic();
const map = new Map({
  layers: [mapboxlayer, beijingLayer, MarkLayer],
  view: new View({
    center: config.center,
    zoom: config.zoom,
    extent: config.extend,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
  }),
  controls: [],
  interactions: [new DragRotate(), new DragBox({ condition: shiftKeyOnly }), new DragPan(), new PinchRotate(), new PinchZoom(), new KeyboardPan(), new KeyboardZoom(), new MouseWheelZoom(), modify]
});
map.getView().on("change", ChangeView);

onMounted(() => {
  map.setTarget("map");
  AddPoint();

  // hover
  map.on("pointermove", (event) => {
    let features = map.getFeaturesAtPixel(event.pixel)[0];

    if (features) {
      map.getTargetElement().style.cursor = features.get('features') ? "pointer" : "";
    }
  });

  map.on("dblclick", (event) => {
    console.log(event.coordinate);
    let new_feature = new Feature(new Point(event.coordinate));
    MarkSource.addFeature(new_feature);
  })

});

function AddPoint() {
  GetBlocks().then((res) => {
    GetBlockClusterArray(res).forEach((layer) => map.addLayer(layer));
    GetRegionClusterArray(res).forEach((layer) => map.addLayer(layer));

    // Make It refresh the dom on screen
    GetRegionClusterArray().forEach((layer) => layer.on('change', AllRegionClusterLoadOK));
    GetBlockClusterArray().forEach((layer) => layer.on('change', AllBlockClusterLoadOK));

    ChangeClusterView(data.zoom);
  });
}

// Because we have multiple layers, so we should use these function to minimize the fire times.
let region_start = 0;
function AllRegionClusterLoadOK() {
  region_start++;
  if (region_start === GetRegionClusterArray().length - 1) {
    region_start = 0;
    GetOnScreenFeatures();
  }
}
let block_start = 0;
function AllBlockClusterLoadOK() {
  block_start++;
  if (block_start === GetRegionClusterArray().length - 1) {
    block_start = 0;
    GetOnScreenFeatures();
  }
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
  GetOnScreenFeatures();
}

function GetOnScreenFeatures() {
  let currentExtent = map.getView().calculateExtent(map.getSize());

  let features_dic = {};

  GetRegionClusterArray().forEach((layer) => {
    if (layer.getVisible()) {
      layer.getSource().forEachFeatureInExtent(currentExtent, (feature) => {
        features_dic[feature.getGeometry().getCoordinates().toString()] = feature
        // features.push(feature);
      })
    }
  });
  GetBlockClusterArray().forEach((layer) => {
    if (layer.getVisible()) {
      layer.getSource().forEachFeatureInExtent(currentExtent, (feature) => {
        features_dic[feature.getGeometry().getCoordinates().toString()] = feature
      })
    }
  });

  let discard_feature = []
  for (let i = data.features.length - 1; i >= 0; i--) {
    const feature = data.features[i];
    if (features_dic.hasOwnProperty(feature.getGeometry().getCoordinates().toString())) {
      delete features_dic[feature.getGeometry().getCoordinates().toString()];
    }
    else {
      data.features.splice(i, 1);
      discard_feature.push(toRaw(feature));
    }
  }
  for (const key in features_dic) {
    if (Object.hasOwnProperty.call(features_dic, key)) {
      const feature = features_dic[key];
      data.features.push(feature);
    }
  }
  // console.log(discard_feature)
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

  ::-webkit-scrollbar {
    width: 15px;
  }
}
</style>