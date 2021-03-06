<template>
  <div id="MapView">
    <!-- The Map -->
    <div class="map-frame">
      <div id="map" class="map" title="Double Click To Add Feature!"></div>
    </div>

    <div class="zoom-slider">
      <el-button
        @click="ResetPosition"
        :icon="LocationFilled"
        style="margin-bottom: 1vh"
        circle
      >
      </el-button>
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
    <div class="view-choice">
      <el-radio-group v-model="view_choice" size="">
        <el-radio-button label="Price View" />
        <el-radio-button label="Trend View" />
      </el-radio-group>
    </div>

    <div
      style="
        position: absolute;
        left: 1%;
        bottom: 2%;
        padding: 2px 10px;
        color: white;
        font-weight: 600;
        border-radius: 2px;
        font-size: 12px;
        filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.4));
        user-select: none;
      "
      :style="{ backgroundColor: current_mode_color }"
    >
      {{ current_mode }}
    </div>

    <SearchBox
      style="
        position: absolute;
        left: 0.5%;
        top: 2%;
        padding: 2px 10px;
        color: white;
        font-weight: 600;
        border-radius: 2px;
        font-size: 12px;
        filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.4));
        user-select: none;
      "
    >
    </SearchBox>

    <div class="select-pannel">
      <el-button
        style="position: relative; z-index: 2"
        @click="data.open_select_pannel = !data.open_select_pannel"
        :style="{
          backgroundColor: data.open_select_pannel
            ? 'transparent !important'
            : undefined,
          border: data.open_select_pannel ? 'solid transparent 1px' : undefined,
        }"
      >
        Selected House
        <div
          :style="{
            transform: data.open_select_pannel
              ? 'rotate(180deg) translateY(1px)'
              : 'rotate(0deg) translateY(1px)',
          }"
          style="margin: 0px 0px 0px 5px; transition: 0.5s"
        >
          <el-icon><fold /></el-icon>
        </div>
      </el-button>
      <select-pannel
        v-show="data.open_select_pannel"
        style="position: absolute; height: 46vh; z-index: 0"
      ></select-pannel>
    </div>

    <div>
      <vis-adaptor
        v-for="feature in data.features"
        :key="feature.properties.name"
        :map="map"
        :feature="feature"
        :markArray="enabled_user_mark"
        :price_mode="data.price_view"
        :current_time="props.current_time"
        :selection_time="props.selection_time"
        :open_corona="data.real_zoom <= 20"
        :use_baseline="props.use_baseline"
        :baseline_time="props.baseline_time"
        :current_baseline_selection="props.current_baseline_selection"
      ></vis-adaptor>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRaw } from "@vue/reactivity";
import { computed, onMounted } from "@vue/runtime-core";
import { LocationFilled, Fold } from "@element-plus/icons-vue";
import { ClickOutside as vClickOutside } from "element-plus";
import * as d3 from "d3";

import {
  GetBlocks,
  GetRegions,
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
} from "../database/query.js";
import { mapboxlayer } from "./Map/mapbox_layer";
import { beijingLayer } from "./Map/vector_layer";
// import {  } from "./Map/cluster";
import {
  GetNewMarkFeature,
  MarkSource,
  MarkLayer,
  UserMarkModify,
} from "./Map/user_mark";
import {
  block_data,
  GetBlockData,
  GetFeatures,
  GetRegionData,
} from "./Map/cluster";
import { emitter } from "./store/bus";
import { useStore as useWeightStore } from "./store/weight";
import { useSunStore } from "./store/sunchart";

import { config as global_config } from "../config";

import TimeLine from "./TimeLine.vue";
import VisAdaptor from "./Vis/VisAdaptor.vue";
import SunChart from "./Vis/SunChart.vue";
import SelectPannel from "./Map/SelectHouse.vue";
import SearchBox from "./Map/SearchBox.vue";

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
import VectorLayer from "ol/layer/Vector";
import Supercluster from "supercluster";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style } from "ol/style";

// the configuration
const config = {
  zoom: global_config.default_zoom,
  minZoom: global_config.minZoom,
  maxZoom: global_config.maxZoom,
  center: global_config.center,
  extend: global_config.extend,
};

const props = defineProps({
  use_baseline: {
    type: Boolean,
    default: false,
  },

  current_time: {
    type: Object,
    default: { year: 0, month: 0 },
  },

  baseline_time: {
    type: Object,
    default: { year: 0, month: 0 },
  },

  selection_time: {
    type: Array,
    default: [
      { year: 0, month: 0 },
      { year: 0, month: 0 },
    ],
  },

  current_baseline_selection: {
    type: Array,
    default: [
      [
        { year: 0, month: 0 },
        { year: 0, month: 0 },
      ],
      [
        { year: 0, month: 0 },
        { year: 0, month: 0 },
      ],
    ],
  },
});

emitter.on("change-view", (d) => (data.price_view = !d));
emitter.on("goto-block", (house_name) => {
  map.getView().animate({
    center: [
      block_data.details_map[house_name].lng,
      block_data.details_map[house_name].lat,
    ],
    zoom: 18,
    duration: 500,
  });

  sun_store.Hide();
  sun_store.SetHighlightBlock(house_name);
});
emitter.on("goto-coord", (coord) => {
  map.getView().animate({
    center: coord,
    zoom: 16.5,
    duration: 500,
  });
});

const weight_store = useWeightStore();
const sun_store = useSunStore();

const enabled_user_mark = computed(() => {
  let enabled_mark = weight_store
    .GetCriterias()
    .filter((d) => d.type == "userMark")
    .map((d) => d.ol_uid);
  return data.user_marks.filter((d) => enabled_mark.includes(d.ol_uid));
});

// the reactive data
const data = reactive({
  zoom: Math.floor(
    ((config.zoom - config.minZoom) * 100) / (config.maxZoom - config.minZoom)
  ),
  real_zoom: config.zoom,
  price_view: true,
  features: [],
  user_marks: [],

  open_select_pannel: false,
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

const current_mode = computed(() => {
  if (data.real_zoom < global_config.subRegionZoom) {
    return "Region";
  } else if (data.real_zoom >= global_config.blockZoom) {
    return "Blocks";
  } else {
    return "SubRegion";
  }
});

const current_mode_color = computed(() => {
  if (data.real_zoom < global_config.subRegionZoom) {
    return "rgb(209, 96, 94)";
  } else if (data.real_zoom >= global_config.blockZoom) {
    return "rgb(88, 120, 163)";
  } else {
    return "rgb(228, 147, 68)";
  }
});

// -------------------------- Useful functions ---------------------------

// The Openlayers
useGeographic();
const infoLayer = new VectorLayer();
const map = new Map({
  layers: [
    mapboxlayer,
    beijingLayer,
    block_data.featureLayer,
    MarkLayer,
    infoLayer,
  ],
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

let marks_count = 1;
onMounted(() => {
  map.setTarget("map");
  // AddPoint();

  GetRegionData().then(ChangeView);
  GetBlockData();
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
        feature.get("type") === "UserMark" ? "grab" : "pointer";
    }
  });

  map.on("pointerdrag", function () {
    map.getTargetElement().style.cursor = "-webkit-grabbing";

    // move map to cancel highlight
    sun_store.Show();
  });

  map.on("dblclick", (event) => {
    let features = map.getFeaturesAtPixel(event.pixel);
    let feature = features[0];
    let remove_mark = false;
    if (feature) {
      // user mark
      if (feature.get("type") === "UserMark") {
        weight_store.RemoveUserMark(feature.ol_uid);
        MarkSource.removeFeature(feature);
        remove_mark = true;
        // refresh
        ChangeUserMarks();
      }
    }
    if (!remove_mark && data.price_view) {
      let new_feature = GetNewMarkFeature(event.coordinate);

      // Add user mark
      let w = weight_store.AddUserMark(
        `Mark ${marks_count++}`,
        new_feature.get("color"),
        new_feature.getGeometry().flatCoordinates,
        new_feature.ol_uid
      );
      new_feature.set("weight", w);
      data.user_marks.push(new_feature);
      MarkSource.addFeature(new_feature);
    }
  });
});

function ChangeUserMarks() {
  let features = MarkSource.getFeatures();

  // user mark move
  features.forEach((f) => {
    let i = weight_store.criterias.findIndex(
      (d) => d.type === "userMark" && d.ol_uid === f.ol_uid
    );

    if (i !== -1) {
      weight_store.criterias[i].coord = f.getGeometry().flatCoordinates;

      emitter.emit("change-point", weight_store.criterias[i].name);
    }
  });

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

function ResetPosition() {
  map.getView().animate({
    center: config.center,
    zoom: config.zoom,
    duration: 500,
  });

  // move map to cancel highlight
  sun_store.Show();
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

function ChangeView() {
  let zoom = map.getView().getZoom();
  data.real_zoom = zoom;

  if (data.real_zoom > global_config.subRegionZoom) {
    sun_store.openCorona = true;
  } else {
    sun_store.openCorona = false;
  }

  let new_percentage_zoom = Math.floor(
    ((zoom - config.minZoom) * 100) / (config.maxZoom - config.minZoom)
  );
  if (
    data.zoom - new_percentage_zoom >= 1 ||
    data.zoom - new_percentage_zoom <= -1
  ) {
    data.zoom = new_percentage_zoom;
  }

  let cluster_zoom = zoom;
  cluster_zoom < 1 ? 1 : cluster_zoom;

  let view_port = [map.getSize()[0], map.getSize()[1]];

  let currentExtent = map.getView().calculateExtent(view_port);
  // currentExtent = [currentExtent[0] * 1.2, currentExtent[1] * 1.2];

  let features = GetFeatures(cluster_zoom, currentExtent);
  // console.log(features)
  data.features = features;
  block_data.featureLayer.setStyle(new Style());
  block_data.featureLayer.setSource(
    new VectorSource({
      features: new GeoJSON().readFeatures({
        type: "FeatureCollection",
        features: features,
      }),
    })
  );
}
</script>

<style lang="less">
#MapView {
  position: relative;
  // top: 0.5vh;
  height: 48vh;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
  overflow: hidden;
}

.view-choice {
  position: absolute;
  right: 1%;
  bottom: 2%;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.4));
}

.select-pannel {
  position: absolute;
  right: 1%;
  top: 2%;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.4));
  z-index: 2;
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
  height: 99.5%;
}

.zoom-slider {
  display: inline;
  position: absolute;
  top: 30%;
  height: 30%;
  left: 1%;
  z-index: 6;
  cursor: default;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.4));

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

.add-animation {
  position: absolute;
  background-color: grey;
  opacity: 0;
  border-radius: 25px;
  animation: addSelection 0.5s linear;

  height: 30px;
  width: 30px;
  top: 0;
  left: 0;
}

@keyframes addSelection {
  from {
    opacity: 0.2;

    transform: translateY(var(--y-start)) translateX(var(--x-start)) scale(1, 1);
  }

  50% {
    opacity: 0.8;
    transform: translateY(var(--y-mid)) translateX(var(--x-mid)) scale(1.5, 1.5);
  }
  to {
    opacity: 0;

    transform: translateY(var(--y-end)) translateX(var(--x-end)) scale(0.5, 0.5);
  }
}
</style>
