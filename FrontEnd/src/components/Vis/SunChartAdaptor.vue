<template>
  <div>
    <!-- 向子传递必须要proxy -->
    <div :id="props.feature.getGeometry().getCoordinates().toString()">
      <sun-chart :myCoordinates="props.feature.getGeometry().getCoordinates()" :marks="props.markArray"
        :color="sun_chart_color" :text="computed_price" :open_corona="open_corona"></sun-chart>
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
import * as d3 from "d3";

const props = defineProps({
  map: Object,
  feature: Object,
  markArray: Array,
  basePrice: Number,
  open_corona: {
    type: Boolean,
    default: true,
    required: false
  },
})

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

let interlop_function = d3.interpolateRgbBasis(['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'])
let sun_chart_color = computed(() => {
  if (props.basePrice && props.basePrice > 0) {
    if (unit_price.value <= 0) {
      return 'rgba(200,200,200,0.5)'
    }
    return interlop_function(1 - ((unit_price.value - props.basePrice) / 10000 + 0.5))
  }
  else {
    if (unit_price.value <= 0) {
      return 'rgba(200,200,200,0.5)'
    }
    return interlop_function(1 - unit_price.value / 50000)
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
    contained_blocks = toRaw(props.feature.get("features")).map(feature => { return { block: feature.get('block'), sub_region: feature.get('sub_region'), region: feature.get('region') } })
    GetAvgPrice();
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
  if (props.open_corona == true && props.markArray.length > 0) {
    return (unit_price / 10000).toFixed(2) + 'w'
  }
  return (unit_price / 10000).toFixed(3) + 'w'
}

</script>

<style>
.ol-overlay-container {
  pointer-events: none !important;
}
</style>