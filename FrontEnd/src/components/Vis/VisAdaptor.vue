<template>
  <div>
    <!-- 向子传递必须要proxy -->
    <div
      ref="visRef"
      class="adaptor"
      :id="props.feature.geometry.coordinates.toString()"
      @click="ClickVis"
      v-click-outside="onClickOutside"
      title="Click to Select Houses"
      :style="{
        opacity: hide_opacity,
      }"
    >
      <sun-chart
        class="adaptor-sun-chart"
        v-if="props.price_mode"
        :myCoordinates="
          props.feature.properties.real_coord
            ? props.feature.properties.real_coord
            : props.feature.geometry.coordinates
        "
        :marks="props.markArray"
        :color="sun_chart_color"
        :text="computed_price"
        :open_corona="props.open_corona && sunchart_store.openCorona"
      ></sun-chart>
      <trend-vis
        class="adaptor-trend-vis"
        v-else-if="!props.price_mode"
        :history_records="react_data.history_records"
        :subregion_records="GetSubRegionData()"
        :selection_time="
          using_baseline_selection
            ? props.current_baseline_selection[0]
            : props.selection_time
        "
        :subregion_name="react_data.sub_region_name"
        :feature_type="react_data.type"
      ></trend-vis>
      <trend-vis
        class="adaptor-trend-vis"
        style="top: -204px;opacity: 0.7;"
        v-if="using_baseline_selection"
        :history_records="react_data.history_records"
        :selection_time="props.current_baseline_selection[1]"
        :feature_type="react_data.type"
        :color="'#487cc6'"
      ></trend-vis>
      <div
        class="adaptor-title"
        v-if="react_data.type === 'region' && props.price_mode"
      >
        {{ react_data.name }}
      </div>
      <div
        class="adaptor-title2"
        v-else-if="react_data.type === 'region' && !props.price_mode"
      >
        <!-- {{ react_data.name }} -->
      </div>
    </div>

    <el-popover
      ref="popoverRef"
      :virtual-ref="visRef"
      :hide-after="0"
      :visible="react_data.tooltip_visibility"
      trigger="click"
      width="170px"
      :popper-options="{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: props.price_mode ? [0, -270] : [0, -60],
            },
          },
        ],
      }"
      virtual-triggering
      popper-class="popper"
      effect="customized"
    >
      <template v-if="react_data.type !== 'region'">
        <template v-if="react_data.contained_blocks.length > 1">
          <div>Select Houses?</div>
          <div style="text-align: left; font-size: 10px">
            ( {{ react_data.contained_blocks.length }} houses )
          </div>
        </template>

        <template v-else-if="react_data.contained_blocks.length === 1">
          <div>Select House?</div>
          <div style="text-align: left; font-size: 10px">
            ( {{ react_data.contained_blocks[0] }} )
          </div>
        </template>
      </template>

      <template v-else-if="react_data.type === 'region'">
        <div>Select Houses in {{ react_data.name }}?</div>
      </template>

      <div class="function-button-row">
        <div class="function-button" @click="AddToFavorite()">
          <el-icon v-if="react_data.is_stared"
            ><star-filled color="#dd9449" style="transform: scale(1.2, 1.2)" />
          </el-icon>
          <el-icon v-else>
            <star />
          </el-icon>
        </div>
        <div class="function-button" @click="AddToBlackList()">
          <el-icon><hide /></el-icon>
        </div>
      </div>

      <div class="popover-content">
        <el-button type="danger" size="small" plain @click="RemoveHouse"
          ><el-icon><delete /></el-icon>
          <span class="popover-text">Remove</span>
        </el-button>
        <el-button type="primary" size="small" plain @click="SelectHouse"
          ><el-icon><circle-plus /></el-icon
          ><span class="popover-text">Add All</span>
        </el-button>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
// todo: add to black list
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  reactive,
  ref,
  unref,
  toRaw,
  watch,
} from "@vue/runtime-core";
import {
  Edit,
  TopRight,
  BottomRight,
  Filter,
  Star,
  StarFilled,
  Hide,
  Delete,
  CirclePlus,
} from "@element-plus/icons-vue";

import { ClickOutside as vClickOutside } from "element-plus";

import SunChart from "./SunChart.vue";
import TrendVis from "./TrendVis.vue";

import Overlay from "ol/Overlay";
import {
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
  GetBlocksAvgPriceAllTime,
  GetRegionPrice,
  SelectHouseByRegion,
  GetSubRegionAvgPriceYearMonth,
} from "../../database/query";

import { BlocksTimeCache } from "./valueCache";

import { useHouseStore } from "../store/selectedHouse";

import { config } from "../../config";
import * as d3 from "d3";

import { useSunStore } from "../store/sunchart";

const sunchart_store = useSunStore();

const popoverRef = ref();
const visRef = ref();

const onClickOutside = () => {
  react_data.tooltip_visibility = false;
  // unref(popoverRef).visRef?.delayHide?.();
};

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
  use_baseline: {
    type: Boolean,
    default: false,
    required: false,
  },
  baseline_time: { year: 0, month: 0 },
  current_baseline_selection: {
    type: Array,
    required: false,
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

const unit_price = computed({
  get() {
    if (props.use_baseline) {
      return react_data.current_price - react_data.baseline_price;
    }
    return react_data.current_price;
  },
  set(v) {
    react_data.current_price = v;
  },
});

const house_store = useHouseStore();

const data = {
  history_cache: {},
  isCached: false,
};

const hide_opacity = computed(() => {
  // emit signal to add addition feature on map
  if (
    sunchart_store.currentBlock === "" ||
    react_data.contained_blocks[0] === sunchart_store.currentBlock ||
    react_data.contained_blocks.includes(sunchart_store.currentBlock)
  ) {
    return 1;
  }
  return sunchart_store.opacity;
});

const using_baseline_selection = computed(() => {
  if (
    props.current_baseline_selection[0] &&
    props.current_baseline_selection[0][1] &&
    props.current_baseline_selection[0][1].year != 0
  ) {
    return true;
  }

  return false;
});

const react_data = reactive({
  contained_blocks: [],
  history_records: [],
  type: "blocks",
  name: "",
  sub_region_name: "",
  tooltip_visibility: false,
  is_stared: false,
  current_price: 0,
  baseline_price: 0,
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
    GetTimeAvgPrice(new_val.year, new_val.month);
  }
);

let computed_price = computed(() => {
  if (props.use_baseline) {
    if (unit_price.value < 0) {
      return "- " + ProcessUnitPrice(unit_price.value).slice(1);
    } else if (unit_price.value > 0) {
      return "+ " + ProcessUnitPrice(unit_price.value);
    } else {
      return "0";
    }
  }

  if (unit_price.value >= 0) {
    return ProcessUnitPrice(unit_price.value);
  } else {
    return "";
  }
});

// Change Price When zoom changes
watch(
  () => props.feature.properties,
  () => {
    UpdatePrice();
  }
);

// for baseline
watch(
  () => props.baseline_time,
  (new_val) => {
    console.log("baseline update", new_val);
    UpdateBaselinePrice(new_val.year, new_val.month);
  }
);

function UpdateBaselinePrice(year, month) {
  let token = year + "," + month;
  if (!data.history_cache.hasOwnProperty(token)) {
    data.history_cache[token] = -1;
    if (!data.isCached) {
      RequestPrice_baseline(year, month);
    }
  } else {
    if (data.history_cache[token] != -1) {
      react_data.baseline_price = data.history_cache[token];
      sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
        unit_price: unit_price.value,
      };
    }
  }
}

async function RequestPrice_baseline(year, month) {
  let token = year + "," + month;

  if (react_data.type === "region") {
    if (BlocksTimeCache[react_data.name]) {
      if (!data.isCached) {
        data.history_cache = BlocksTimeCache[react_data.name];
      }
      react_data.baseline_price = data.history_cache[token];
      sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
        unit_price: unit_price.value,
      };
    }
  } else {
    if (BlocksTimeCache[react_data.contained_blocks]) {
      if (!data.isCached) {
        data.history_cache =
          BlocksTimeCache[toRaw(react_data.contained_blocks)];
      }
      react_data.baseline_price = data.history_cache[token];
      sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
        unit_price: unit_price.value,
      };
    } else {
      if (year == 2020 && month == 12) {
        try {
          let res = await GetBlocksAvgPrice(
            react_data.contained_blocks,
            request_controller
          );
          if (res) {
            data.history_cache[token] = res.unit_price;
            if (
              props.current_time.year === year &&
              props.current_time.month === month
            ) {
              react_data.baseline_price = res.unit_price;
              sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
                unit_price: unit_price.value,
              };
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
            react_data.contained_blocks,
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
              react_data.baseline_price = res.unit_price;
              sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
                unit_price: unit_price.value,
              };
            }
          }
        } catch (error) {
          if (error.message !== "canceled") {
            throw error;
          }
        }
      }
    }
  }
}

function GetContainedBlock() {
  react_data.contained_blocks = props.feature.properties.contained_features;
}

function SelectHouse() {
  // console.log(toRaw(props.feature));
  if (react_data.type === "region") {
    // SelectHouseByRegion(react_data.name).then((res) => console.log(res));
    house_store.AddHouseByRegionName(react_data.name);
  } else {
    for (let i = 0; i < react_data.contained_blocks.length; i++) {
      const house_name = react_data.contained_blocks[i];
      house_store.AddHouse(house_name);
    }
  }
  house_store.AddAnimation(visRef.value);
  react_data.tooltip_visibility = false;
}

function RemoveHouse() {
  // console.log(toRaw(props.feature));
  if (react_data.type === "region") {
    house_store.RemoveHouseByRegionName(react_data.name);
  } else {
    for (let i = 0; i < react_data.contained_blocks.length; i++) {
      const house_name = react_data.contained_blocks[i];
      house_store.RemoveHouse(house_name);
    }
  }
  react_data.tooltip_visibility = false;
}

function UpdatePrice() {
  if (react_data.type === "region") {
    GetAndCacheRegionPrice().then(() => {
      GetTimeAvgPrice(props.current_time.year, props.current_time.month);

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
  } else {
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
}

let request_controller = new AbortController();

let sunchart_store_key = "";

String.prototype.hashCode = function () {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

onMounted(() => {
  if (props.map && props.feature) {
    ol_data.overlay = new Overlay({
      element: document.getElementById(
        props.feature.geometry.coordinates.toString()
      ),
      position: props.feature.geometry.coordinates,
      positioning: "center-center",
    });

    if (props.feature.properties.type) {
      react_data.type = props.feature.properties.type;

      if (react_data.type === "blocks") {
        // todo: 2020,12 can be null

        let sub_region = props.feature.properties.sub_region;
        react_data.sub_region_name = sub_region;
        if (!BlocksTimeCache[sub_region]) {
          BlocksTimeCache[sub_region] = {};

          GetSubRegionAvgPriceYearMonth(sub_region)
            .then((res) => {
              BlocksTimeCache[sub_region] = res;
            })
            .catch((err) => console.log(sub_region, "error"));
        }
      }

      if (react_data.type === "region") {
        react_data.name = props.feature.properties.name;
      } else if (react_data.type === "blocks") {
        react_data.name = props.feature.properties.contained_features
          .toString()
          .hashCode();
      } else {
        react_data.name = props.feature.properties.contained_features
          .toString()
          .hashCode();
      }
    }
    props.map.addOverlay(ol_data.overlay);
    UpdatePrice();

    sunchart_store_key = react_data.name;
  }
});

onBeforeUnmount(() => {
  request_controller.abort();
  if (props.map && props.feature) {
    props.map.removeOverlay(ol_data.overlay);
  }

  delete sunchart_store.currentOnScreenBlocks[sunchart_store_key];
});

function GetSubRegionData() {
  if (react_data.type === "blocks") {
    let sub_region = props.feature.properties.sub_region;

    if (BlocksTimeCache[sub_region]) {
      let history_records = [];
      for (const key in BlocksTimeCache[sub_region]) {
        if (Object.hasOwnProperty.call(BlocksTimeCache[sub_region], key)) {
          const element = BlocksTimeCache[sub_region][key];
          history_records.push({
            time: Date.UTC(element.year, element.month),
            price: element.unit_price,
          });
        }
      }
      history_records.sort((a, b) => a.time - b.time);
      return history_records;
    }
  }

  return [];
}

async function GetAndCacheRegionPrice() {
  try {
    if (BlocksTimeCache[props.feature.properties.name]) {
      data.history_cache = BlocksTimeCache[props.feature.properties.name];
    } else {
      let res = await GetRegionPrice(props.feature.properties.name);

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

      // todo: for region 2020,12 can be null
      patch_cache();
      BlocksTimeCache[props.feature.properties.name] = data.history_cache;
    }
  } catch (error) {
    if (error.message !== "canceled") {
      throw error;
    }
  }
}

async function RequestPrice(year, month) {
  let token = year + "," + month;

  if (react_data.type === "region") {
    if (BlocksTimeCache[react_data.name]) {
      if (!data.isCached) {
        data.history_cache = BlocksTimeCache[react_data.name];
      }
      unit_price.value = data.history_cache[token];
      sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
        unit_price: unit_price.value,
      };
    }
  } else {
    if (BlocksTimeCache[react_data.contained_blocks]) {
      if (!data.isCached) {
        data.history_cache =
          BlocksTimeCache[toRaw(react_data.contained_blocks)];
      }
      unit_price.value = data.history_cache[token];
      sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
        unit_price: unit_price.value,
      };
    } else {
      if (year == 2020 && month == 12) {
        try {
          let res = await GetBlocksAvgPrice(
            react_data.contained_blocks,
            request_controller
          );
          if (res) {
            data.history_cache[token] = res.unit_price;
            if (
              props.current_time.year === year &&
              props.current_time.month === month
            ) {
              unit_price.value = res.unit_price;
              sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
                unit_price: unit_price.value,
              };
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
            react_data.contained_blocks,
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
              sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
                unit_price: unit_price.value,
              };
            }
          }
        } catch (error) {
          if (error.message !== "canceled") {
            throw error;
          }
        }
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
      sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
        unit_price: unit_price.value,
      };
    }
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
      sunchart_store.currentOnScreenBlocks[sunchart_store_key] = {
        unit_price: unit_price.value,
      };
    }
  } while (
    n_year > config.timeRange[0].year ||
    n_month > config.timeRange[0].month
  );
};

async function CachePrice() {
  try {
    if (BlocksTimeCache[toRaw(react_data.contained_blocks)]) {
      data.history_cache = BlocksTimeCache[toRaw(react_data.contained_blocks)];
    } else {
      let res = await GetBlocksAvgPriceAllTime(
        react_data.contained_blocks,
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

      if (!data.history_cache["2020,12"]) {
        await RequestPrice(2020, 12);
        patch_cache();
      } else {
        patch_cache();
      }
      BlocksTimeCache[toRaw(react_data.contained_blocks)] = data.history_cache;
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
    return (unit_price / 10000).toFixed(2) + " 万";
  }
  return (unit_price / 10000).toFixed(3) + " 万";
}

let interlop_function = d3.interpolateRgbBasis([
  "#d73027",
  "#f46d43",
  "#fdae61",
  "#fee08b",
  "#d9ef8b",
  "#a6d96a",
  "#66bd63",
  // "#1a9850",
]);
let sun_chart_color = computed(() => {
  if (unit_price.value === 0) {
    return "rgba(0,0,0,0.2)";
  }
  if (unit_price.value < 0) {
    let value_mapping = d3
      .scaleLinear()
      .range([0.5, 1])
      .domain([0, sunchart_store.minPrice]);
    return d3.interpolateBlues(value_mapping(unit_price.value));
  }
  let value_mapping = d3
    .scaleLinear()
    .range([0, 1])
    .domain([sunchart_store.maxPrice, sunchart_store.minPrice]);
  return interlop_function(value_mapping(unit_price.value));

  // if (props.basePrice && props.basePrice > 0) {
  //   if (unit_price.value <= 0) {
  //     return "rgba(200,200,200,0.5)";
  //   }
  //   return interlop_function(
  //     1 - ((unit_price.value - props.basePrice) / 10000 + 0.5)
  //   );
  // } else {
  //   if (unit_price.value <= 0) {
  //     return "rgba(200,200,200,0.5)";
  //   }
  //   return interlop_function(1 - unit_price.value / 50000);
  // }
});

function ClickVis() {
  react_data.tooltip_visibility = true;
  console.log(props.feature.geometry.coordinates);
}

function AddToBlackList() {
  // console.log(toRaw(props.feature));
  if (react_data.type === "region") {
    // SelectHouseByRegion(react_data.name).then((res) => console.log(res));
    house_store.AddHouse2BlackListByRegionName(react_data.name);
  } else {
    for (let i = 0; i < react_data.contained_blocks.length; i++) {
      const house_name = react_data.contained_blocks[i];
      house_store.AddToBlackList(house_name);
    }
  }
  react_data.tooltip_visibility = false;
  house_store.AddAnimation(visRef.value);
}
function AddToFavorite() {
  // console.log(toRaw(props.feature));
  if (react_data.is_stared) {
    if (react_data.type === "region") {
      house_store.RemoveFavoriteHouseByRegionName(react_data.name);
    } else {
      for (let i = 0; i < react_data.contained_blocks.length; i++) {
        const house_name = react_data.contained_blocks[i];
        house_store.RemoveFavoriteHouse(house_name);
      }
    }
  } else {
    if (react_data.type === "region") {
      house_store.AddHouse2FavoriteByRegionName(react_data.name);
    } else {
      for (let i = 0; i < react_data.contained_blocks.length; i++) {
        const house_name = react_data.contained_blocks[i];
        house_store.AddFavoriteHouse(house_name);
      }
    }
    house_store.AddAnimation(visRef.value);
  }
  react_data.is_stared = !react_data.is_stared;
  react_data.tooltip_visibility = false;
}
</script>

<style lang="less">
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
.adaptor-title {
  user-select: none;
  color: white;
  font-size: 5px;
  font-weight: 500;
  position: absolute;
  top: 306px;
  left: 0px;
  text-align: center;
  width: 100%;
  transform: scale(0.8, 0.8);
  filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.8));
}
.adaptor-title2 {
  user-select: none;
  color: white;
  font-size: 5px;
  font-weight: 500;
  position: relative;
  top: -45px;
  text-align: center;
  width: 100%;
  transform: scale(0.8, 0.8);
  filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.8));
}
.popover-content {
  display: flex;
  justify-content: space-around;
  margin: 10px 5px 5px 5px;
  .popover-text {
    padding-left: 1px;
  }
}

.function-button-row {
  margin: 0px 0px -2px 0px;
  padding-left: 100px;
}

.function-button {
  margin: 0 2px -5px 2px;
  padding: 4px 7px 2px 7px;
  transition: 0.5s;
  border-radius: 3px;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  &:hover {
    background-color: rgb(216, 216, 216);
  }
  display: inline-block;
}
</style>
