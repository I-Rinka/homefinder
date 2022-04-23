<template>
  <div>
    <!-- 向子传递必须要proxy -->
    <div :id="props.feature.getGeometry().getCoordinates().toString()">
      <sun-chart :myCoordinates="props.feature.getGeometry().getCoordinates()" :marks="props.markArray" :color="'red'"
        :text="computed_price"></sun-chart>
      <!-- <el-button style="pointer-events: all;" @click="GetAvgPrice">Get Avg Price</el-button> -->
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  watch,
} from "@vue/runtime-core";
import SunChart from "./SunChart.vue";
import Overlay from "ol/Overlay";
import { GetBlocksAvgPrice } from "../../database/query";

const props = defineProps({
  map: Object,
  feature: Object,
  markArray: Array,
  basePrice: Number,
});
const unit_price = ref(-1);

let contained_blocks = [];
let overlay = null;

let computed_price = computed(() => {
  if (unit_price.value > 0) {
    if (props.basePrice && props.basePrice > 0) {
      let price = ProcessUnitPrice(unit_price.value - props.basePrice);
      if (price[0] === '-') {
        return price;
      }
      else {
        return '+' + price;
      }
    }
    else {
      return ProcessUnitPrice(unit_price.value);
    }
  }
  else {
    return '';
  }
})

onBeforeMount(() => {
  if (props.map && props.feature) {
    contained_blocks = toRaw(props.feature.get("features")).map(feature => { return { block: feature.get('block'), sub_region: feature.get('sub_region'), region: feature.get('region') } })
    GetAvgPrice();
  }
})

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
    // console.log(contained_blocks)
  }
});

onBeforeUnmount(() => {
  if (props.map && props.feature) {
    props.map.removeOverlay(overlay);
  }
});

function GetAvgPrice() {
  GetBlocksAvgPrice(contained_blocks.map(record => record.block)).then(res => {
    unit_price.value = res.unit_price;
  });
}

function ProcessUnitPrice(unit_price) {
  return (unit_price / 10000).toFixed(3) + 'w'
}

</script>

<style>
.ol-overlay-container {
  pointer-events: none !important;
}
</style>