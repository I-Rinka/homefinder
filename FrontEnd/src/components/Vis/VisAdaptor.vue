<template>
  <div>
    <!-- 向子传递必须要proxy -->
    <div :id="props.feature.getGeometry().getCoordinates().toString()">
      <sun-chart
        v-show="props.price_mode"
        :myCoordinates="props.feature.getGeometry().getCoordinates()"
        :marks="props.markArray"
        :color="sun_chart_color"
        :text="computed_price"
      ></sun-chart>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRaw,
  watch,
} from "@vue/runtime-core";
import SunChart from "./SunChart.vue";
import Overlay from "ol/Overlay";
import {
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
} from "../../database/query";
import * as d3 from "d3";

const props = defineProps({
  map: Object,
  feature: Object,
  markArray: Array,
  basePrice: Number,
  open_corona: {
    type: Boolean,
    default: true,
    required: false,
  },
  price_mode: {
    type: Boolean,
    default: true,
    required: false,
  },
  current_time: {
    type: Object,
    default: null,
    required: false,
  },
});

const unit_price = ref(-1);

const data = {
  history_cache: {},
};

const ol_data = {
  contained_blocks: [],
  overlay: null,
};

watch(
  () => props.price_mode,
  (new_val) => {
    if (new_val) {
    } else {
    }
  }
);

watch(
  () => props.current_time,
  (new_val) => {
    if (props.price_mode) {
      GetTimeAvgPrice(new_val.year, new_val.month);
    }
  }
);

let computed_price = computed(() => {
  if (unit_price.value > 0) {
    if (props.basePrice && props.basePrice > 0) {
      let price = ProcessUnitPrice(unit_price.value - props.basePrice);
      if (price[0] === "-") {
        return price;
      } else {
        return "+" + price;
      }
    } else {
      return ProcessUnitPrice(unit_price.value);
    }
  } else {
    return "";
  }
});

onMounted(() => {
  if (props.map && props.feature) {
    ol_data.overlay = new Overlay({
      element: document.getElementById(
        props.feature.getGeometry().getCoordinates().toString()
      ),
      position: props.feature.getGeometry().getCoordinates(),
      positioning: "center-center",
    });
    props.map.addOverlay(ol_data.overlay);
    ol_data.contained_blocks = toRaw(props.feature.get("features")).map(
      (feature) => {
        return {
          block: feature.get("block"),
          sub_region: feature.get("sub_region"),
          region: feature.get("region"),
        };
      }
    );
    GetTimeAvgPrice(2020, 12);
  }
});

onBeforeUnmount(() => {
  if (props.map && props.feature) {
    props.map.removeOverlay(ol_data.overlay);
  }
});

async function RequestPrice(year, month) {
  let token = year + "," + month;
  console.log("request", token);

  // the newest price
  if (year == 2020 && month == 12) {
    return await GetBlocksAvgPrice(
      ol_data.contained_blocks.map((record) => record.block)
    );
  } else {
    return await GetBlocksAvgPriceYearMonth(
      ol_data.contained_blocks.map((record) => record.block),
      year,
      month
    );
  }
}

async function GetTimeAvgPrice(year, month) {
  let token = year + "," + month;
  if (!data.history_cache.hasOwnProperty(token)) {
    data.history_cache[token] = -1;
    let res = await RequestPrice(year, month);
    if (res) {
      data.history_cache[token] = res.unit_price;
      if (
        props.current_time.year === year &&
        props.current_time.month === month
      ) {
        unit_price.value = res.unit_price;
      }
    }
  } else {
    if (data.history_cache[token] != -1) {
      unit_price.value = data.history_cache[token];
    }
  }
  CachePrice(year, month, 12);
}

async function CachePrice(year, month, offset) {
  for (let i = -offset; i <= offset; i++) {
    let [n_year, n_month] = CaculateTimeOffset(year, month, -i);
    if (n_year >= 2012 && n_year < 2021) {
      let token = n_year + "," + n_month;
      if (!data.history_cache.hasOwnProperty(token)) {
        data.history_cache[token] = -1;
        RequestPrice(n_year, n_month).then((res) => {
          if (res) {
            data.history_cache[token] = res.unit_price;
          }
        });
      }
    }
  }
}

function CaculateTimeOffset(year, month, offset) {
  let n_month = month + offset;
  let n_year = year + Math.floor((n_month - 1) / 12);
  n_month = ((n_month - 1) % 12) + 1;
  if (n_month <= 0) {
    n_month += 12;
  }
  return [n_year, n_month];
}

function ProcessUnitPrice(unit_price) {
  if (props.open_corona == true && props.markArray.length > 0) {
    return (unit_price / 10000).toFixed(2) + "w";
  }
  return (unit_price / 10000).toFixed(3) + "w";
}

let interlop_function = d3.interpolateRgbBasis([
  "#d73027",
  "#f46d43",
  "#fdae61",
  "#fee08b",
  "#d9ef8b",
  "#a6d96a",
  "#66bd63",
  "#1a9850",
]);
let sun_chart_color = computed(() => {
  if (props.basePrice && props.basePrice > 0) {
    if (unit_price.value <= 0) {
      return "rgba(200,200,200,0.5)";
    }
    return interlop_function(
      1 - ((unit_price.value - props.basePrice) / 10000 + 0.5)
    );
  } else {
    if (unit_price.value <= 0) {
      return "rgba(200,200,200,0.5)";
    }
    return interlop_function(1 - unit_price.value / 50000);
  }
});
</script>

<style>
.ol-overlay-container {
  pointer-events: none !important;
}
</style>