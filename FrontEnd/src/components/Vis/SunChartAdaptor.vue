<template>
  <div>
    <!-- 向子传递必须要proxy -->
    <div :id="props.feature.getGeometry().getCoordinates().toString()">
      <sun-chart :myCoordinates="props.feature.getGeometry().getCoordinates()" :marks="props.markArray" :color="'red'"
        :text="'+86.8w'"></sun-chart>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  toRaw,
  watch,
} from "@vue/runtime-core";
import SunChart from "./SunChart.vue";
import Overlay from "ol/Overlay";

const props = defineProps({
  map: Object,
  feature: Object,
  markArray: Array,
});

let contained_feature = [];
let overlay = null;
onMounted(() => {
  if (props.map && props.feature) {
    overlay = new Overlay({
      element: document.getElementById(
        props.feature.getGeometry().getCoordinates().toString()
      ),
      position: props.feature.getGeometry().getCoordinates(),
      positioning: "center-center",
    });
    props.map.addOverlay(overlay);
    contained_feature = toRaw(props.feature.get("features")).map(feature => { return { block: feature.get('block'), sub_region: feature.get('sub_region'), region: feature.get('region') } })
    console.log(contained_feature)
  }
});

onBeforeUnmount(() => {
  if (props.map && props.feature) {
    props.map.removeOverlay(overlay);
  }
});
</script>

<style>
.ol-overlay-container {
  pointer-events: none !important;
}
</style>