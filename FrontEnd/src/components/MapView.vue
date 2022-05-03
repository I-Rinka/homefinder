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
    <div id="view-choice">
      <el-radio-group v-model="view_choice" size="">
        <el-radio-button label="Price View" />
        <el-radio-button label="Trend View" />
      </el-radio-group>
    </div>
    <div>
      <vis-adaptor
        v-for="feature in data.features"
        :key="feature.getGeometry().getCoordinates().toString()"
        :map="map"
        :feature="feature"
        :markArray="data.user_marks"
        :price_mode="data.price_view"
        :current_time="data.current_time"
        :selection_time="data.selection_time"
      ></vis-adaptor>
    </div>
  </div>
  <time-line
    @changeCurrentTime="ChangeCurrentTime"
    @changeSubtractor="ChangeSubtractor"
    @changeSelection="ChangeSelection"
    @changeSubtractorSelection="ChangeSubtractorSelection"
    @changeSubtractorMode="ChangeSubtracorMode"
    @changeSelectMode="ChangeSelectMode"
  >
  </time-line>
</template>

<script setup>
import { reactive, toRaw } from "@vue/reactivity";
import { computed, onMounted } from "@vue/runtime-core";
import { LocationFilled } from "@element-plus/icons-vue";
import * as d3 from "d3";

import {
  GetBlocks,
  GetRegions,
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
} from "../database/query.js";
import { mapboxlayer } from "./Map/mapbox_layer";
import { beijingLayer } from "./Map/vector_layer";
import { GetCluster } from "./Map/cluster";
import {
  GetNewMarkFeature,
  MarkSource,
  MarkLayer,
  UserMarkModify,
} from "./Map/user_mark";

import TimeLine from "./TimeLine.vue";
import VisAdaptor from "./Vis/VisAdaptor.vue";
import SunChart from "./Vis/SunChart.vue";

import Map from "ol/Map";
import View from "ol/View";
import { useGeographic } from "ol/proj";
import {
  PinchZoom,
  DragBox,
  DragRotate,
  KeyboardPan,
  PinchRotate,
  KeyboardZoom,
  DragPan,
  MouseWheelZoom,
  Select,
} from "ol/interaction";
import { shiftKeyOnly } from "ol/events/condition";
import PointerInteraction from "ol/interaction/Pointer";
import { viewport } from "@popperjs/core";

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
  price_view: true,
  features: [],
  user_marks: [],
  user_marks_strip: [],

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

const view_choice = computed({
  get() {
    return data.price_view ? "Price View" : "Trend View";
  },
  set(value) {
    if (value === "Trend View") {
      data.price_view = false;
    } else {
      data.price_view = true;
    }
    ChangeView();
  },
});

function GetBasePrice() {
  GetBlocksAvgPrice(["*"]).then((res) => (data.base_price = res.unit_price));
}

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
  interactions: [
    new DragRotate(),
    new DragBox({ condition: shiftKeyOnly }),
    new DragPan(),
    new PinchRotate(),
    new PinchZoom(),
    new KeyboardPan(),
    new KeyboardZoom(),
    new MouseWheelZoom(),
    UserMarkModify,
  ],
});
map.getView().on("change", ChangeView);

onMounted(() => {
  map.setTarget("map");
  AddPoint();

  // hover
  map.on("pointermove", (event) => {
    let features = map.getFeaturesAtPixel(event.pixel);
    let feature = features[0];
    if (feature) {
      // cluster point
      map.getTargetElement().style.cursor = feature.get("features")
        ? "pointer"
        : "";

      // user mark
      map.getTargetElement().style.cursor =
        feature.get("type") === "UserMark" ? "pointer" : "";
    }
  });

  map.on("dblclick", (event) => {
    let features = map.getFeaturesAtPixel(event.pixel);
    let feature = features[0];
    let remove_mark = false;
    if (feature) {
      // user mark
      if (feature.get("type") === "UserMark") {
        MarkSource.removeFeature(feature);
        remove_mark = true;
        // refresh
        ChangeUserMarks();
      }
    }
    if (!remove_mark && data.price_view) {
      let new_feature = GetNewMarkFeature(event.coordinate);
      data.user_marks.push(new_feature);
      data.user_marks_strip.push(new UserStrip(new_feature));
      MarkSource.addFeature(new_feature);
    }
  });
});

function UserStrip(feature) {
  this.ol_uid = feature.ol_uid;
  this.color = feature.get("color");
  this.weight = feature.get("weight");
}

function ChangeUserMarks() {
  let features = MarkSource.getFeatures();

  if (features.length < data.user_marks_strip.length) {
    // remove
    let dic = {};
    for (let i = 0; i < features.length; i++) {
      dic[features[i].ol_uid] = i;
    }
    for (let i = 0; i < data.user_marks_strip.length; i++) {
      const element = toRaw(data.user_marks_strip[i]);
      if (!dic.hasOwnProperty(element.ol_uid)) {
        data.user_marks_strip.splice(i, 1);
      }
    }
  }
  data.user_marks = features;
}

UserMarkModify.on(["modifystart"], function (evt) {
  document.getElementById("map").style.cursor =
    evt.type === "modifystart" ? "grabbing" : "pointer";
});
UserMarkModify.on(["modifyend"], function (evt) {
  ChangeUserMarks();
  document.getElementById("map").style.cursor =
    evt.type === "modifystart" ? "grabbing" : "pointer";
});
const overlaySource = UserMarkModify.getOverlay().getSource();
overlaySource.on(["addfeature", "removefeature"], function (evt) {
  document.getElementById("map").style.cursor =
    evt.type === "addfeature" ? "pointer" : "";
});

function AddPoint() {
  GetBlocks().then((res) => {
    map.addLayer(GetCluster(res));
    GetCluster().on("change", () => GetOnScreenFeatures());

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
  if (data.price_view) {
    MarkLayer.setVisible(true);
  } else {
    MarkLayer.setVisible(false);
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
  let view_port = [map.getSize()[0], map.getSize()[1]];
  // view_port[0] *= 2;
  // view_port[1] *= 2;

  let currentExtent = map.getView().calculateExtent(view_port);

  let features_dic = {};

  if (GetCluster().getVisible()) {
    GetCluster()
      .getSource()
      .forEachFeatureInExtent(currentExtent, (feature) => {
        features_dic[feature.getGeometry().getCoordinates().toString()] =
          feature;
      });
  }

  let discard_feature = [];
  for (let i = data.features.length - 1; i >= 0; i--) {
    const feature = data.features[i];
    if (
      features_dic.hasOwnProperty(
        feature.getGeometry().getCoordinates().toString()
      )
    ) {
      delete features_dic[feature.getGeometry().getCoordinates().toString()];
    } else {
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
}
</script>

<style lang="less">
#MapView {
  position: relative;
  height: 50vh;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
}

#view-choice {
  position: absolute;
  right: 1%;
  bottom: 2%;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
}

.map {
  width: 100%;
  height: 100%;
  border: solid gray 1px;
  border-radius: 10px;
}

.user-mark {
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
}

.user-marks-order {
  height: 7vh;
  width: 99%;
  position: absolute;
  top: 52vh;
  background-color: rgb(255, 255, 255);
  display: flex;
  transition-duration: 0.5s;
}

.user-mark-label {
  position: absolute;
  top: -8%;
  color: gray;
  font-weight: bolder;
  font-size: 1.5vh;
  left: 1vw;
}

.user-mark-guidance {
  user-select: none;
  position: relative;
  top: 2vh;
  color: gray;
  font-weight: normal;
  font-size: 1.5vh;
  left: 0vw;
  padding: 2px;
  width: 100%;
  height: 2vh;
  background-color: rgb(203, 203, 203);
  border-radius: 5px;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
}

.user-mark-color-strip {
  cursor: pointer;
  position: relative;
  top: 2vh;
  bottom: 0;
  height: 1.5vh;
  transition-duration: 0.5s;
  width: 100%;
  animation: enter 0.5s;
  animation-iteration-count: 1;
  margin: 2px;
  border-radius: 5px;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));

  &:hover {
    height: 3vh;
    top: 1vh;
    width: 150%;
  }
}

@keyframes enter {
  from {
    // opacity: 0;
    width: 0;
  }

  to {
    // opacity: 100%;
    width: 100%;
  }
}

.ol-layer {
  > canvas {
    border-radius: 11px;
  }
}

.ol-viewport {
  border-radius: 5px;
}

.map-frame {
  width: 99.8%;
  height: 99.8%;
}

.zoom-slider {
  display: inline;
  position: absolute;
  top: 30%;
  height: 30%;
  left: 1%;
  z-index: 6;
  cursor: default;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));

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
