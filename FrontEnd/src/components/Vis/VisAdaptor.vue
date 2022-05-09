<template>
  <div>
    <!-- 向子传递必须要proxy -->
    <div class="adaptor" :id="props.feature.geometry.coordinates.toString()">
      <sun-chart
        class="adaptor-sun-chart"
        v-if="props.price_mode"
        :myCoordinates="props.feature.properties.real_coord"
        :marks="props.markArray"
        :color="sun_chart_color"
        :text="computed_price"
        :open_corona="props.open_corona"
        @click="ClickSunchart"
      ></sun-chart>
      <trend-vis
        class="adaptor-trend-vis"
        v-show="!props.price_mode"
        :history_records="react_data.history_records"
        :selection_time="props.selection_time"
      ></trend-vis>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  reactive,
  ref,
  toRaw,
  watch,
} from "@vue/runtime-core";
import SunChart from "./SunChart.vue";
import TrendVis from "./TrendVis.vue";
import Overlay from "ol/Overlay";
import {
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
  GetBlocksAvgPriceAllTime,
} from "../../database/query";

import { config } from "../../config";
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
  selection_time: {
    type: Array,
    default: null,
    required: false,
  },
});

const unit_price = ref(-1);

const data = {
  history_cache: {},
  isCached: false,
  contained_blocks: [],
};

const react_data = reactive({
  history_records: [],
});

const ol_data = {
  // contained_blocks: [],
  feature_position: [],
  cluster_position: [],
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

function GetContainedBlock() {
  // data.contained_blocks = props.feature.properties.contained_features.map(
  //   (d) => d.properties.name
  // );
  data.contained_blocks = props.feature.properties.contained_features;
}

function ClickSunchart() {
  console.log(toRaw(props.feature));
}

function UpdatePrice() {
  GetContainedBlock();

  GetTimeAvgPrice(props.current_time.year, props.current_time.month).then(
    () => {
      CachePrice().then(() => {
        // send trend view price
        let history_records = [];
        for (const key in data.history_cache) {
          if (Object.hasOwnProperty.call(data.history_cache, key)) {
            const element = data.history_cache[key];
            let t = key.split(",");
            history_records.push({
              time: Date.UTC(t[0], t[1] - 1),
              price: element,
            });
          }
        }
        history_records.sort((a, b) => a.time - b.time);
        react_data.history_records = history_records;
      });
    }
  );
}

let request_controller = new AbortController();

watch(
  () => props.feature.properties,
  () => {
    UpdatePrice();
  }
);

onMounted(() => {
  if (props.map && props.feature) {
    ol_data.overlay = new Overlay({
      element: document.getElementById(
        props.feature.geometry.coordinates.toString()
      ),
      position: props.feature.geometry.coordinates,
      positioning: "center-center",
    });
    props.map.addOverlay(ol_data.overlay);
    UpdatePrice();
  }
});

onBeforeUnmount(() => {
  request_controller.abort();
  if (props.map && props.feature) {
    props.map.removeOverlay(ol_data.overlay);
  }
});

async function RequestPrice(year, month) {
  let token = year + "," + month;
  if (year == 2020 && month == 12) {
    try {
      let res = await GetBlocksAvgPrice(
        data.contained_blocks,
        request_controller
      );
      if (res) {
        data.history_cache[token] = res.unit_price;
        if (
          props.current_time.year === year &&
          props.current_time.month === month
        ) {
          unit_price.value = res.unit_price;
        }
      }
    } catch (error) {
      if (error.message !== "canceled") {
        throw error;
      }
    }
  } else {
    try {
      let res = await GetBlocksAvgPriceYearMonth(
        data.contained_blocks,
        year,
        month,
        request_controller
      );
      if (res) {
        data.history_cache[token] = res.unit_price;
        if (
          props.current_time.year === year &&
          props.current_time.month === month
        ) {
          unit_price.value = res.unit_price;
        }
      }
    } catch (error) {
      if (error.message !== "canceled") {
        throw error;
      }
    }
  }
}

async function GetTimeAvgPrice(year, month) {
  let token = year + "," + month;
  if (!data.history_cache.hasOwnProperty(token)) {
    data.history_cache[token] = -1;
    if (!data.isCached) {
      RequestPrice(year, month);
    }
  } else {
    if (data.history_cache[token] != -1) {
      unit_price.value = data.history_cache[token];
    }
  }
}

async function CachePrice() {
  try {
    let res = await GetBlocksAvgPriceAllTime(
      data.contained_blocks,
      request_controller
    );
    data.isCached = true;
    for (let i = 0; i < res.length; i++) {
      const element = res[i];
      let year = element.year;
      let month = element.month;
      let token = year + "," + month;

      if (
        year <= config.timeRange[1].year &&
        month <= config.timeRange[1].month
      ) {
        data.history_cache[token] = element.unit_price;
      }
    }

    let patch_cache = function () {
      let i = -1;
      let n_year, n_month;
      let n_price = data.history_cache["2020,12"];
      do {
        [n_year, n_month] = CaculateTimeOffset(
          config.timeRange[1].year,
          config.timeRange[1].month,
          i
        );
        i--;
        let token = n_year + "," + n_month;
        if (data.history_cache[token] && data.history_cache[token] != -1) {
          n_price = data.history_cache[token];
        } else {
          data.history_cache[token] = n_price;
        }

        if (
          props.current_time.year === n_year &&
          props.current_time.month === n_month
        ) {
          unit_price.value = data.history_cache[token];
        }
      } while (
        n_year > config.timeRange[0].year ||
        n_month > config.timeRange[0].month
      );
    };

    if (!data.history_cache["2020,12"]) {
      await RequestPrice(2020, 12);
      patch_cache();
    } else {
      patch_cache();
    }
  } catch (error) {
    if (error.message !== "canceled") {
      throw error;
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
.adaptor {
  position: relative;
}
.adaptor-sun-chart {
  position: relative;
}
.adaptor-trend-vis {
  position: relative;
}
</style>
