<template>
  <div class="line-up">
    <!-- {{store.overall}} -->
    <div class="weight-strip">
      <div
        class="enabled"
        v-for="d in enabled_strip"
        :key="d.name"
        :style="{
          '--strip-color': d.color,
          '--strip-width': `${(100 * d.weight) / strip_percentage_sum}%`,
        }"
      >
        <div class="strip" :title="d.label">
          <!-- enable -->
          <div style="overflow: hidden; white-space: nowrap">
            <el-checkbox v-model="d.enabled"></el-checkbox>
            <el-icon
              v-if="d.type === 'userMark'"
              style="position: relative; top: 1.5px; margin: 2px"
              ><LocationFilled
            /></el-icon>
            <span
              v-if="d.type === 'userMark'"
              contenteditable="true"
              style="margin: 2px"
              @focusout="(e) => (d.label = e.target.innerText)"
            >
              {{ d.label }}
            </span>
            <span v-else>
              {{ d.label }}
            </span>
          </div>

          <!-- mapping -->
          <div
            v-if="nominal_attr_name.includes(d.name)"
            style="padding-left: 5px; padding-top: 7px; cursor: pointer"
          >
            <Edit
              color="grey"
              style="
                height: 16px;
                margin-top: 1.5px;
                cursor: pointer;
                padding: 2px;
                border-radius: 5px;
              "
              @click="MapNominalData(d.name)"
            ></Edit>
          </div>

          <div
            v-if="
              !nominal_attr_name.includes(d.name) &&
              data.quantitative_mapping_type[d.name]
            "
            style="padding-left: 5px; padding-top: 7px; cursor: pointer"
          >
            <TopRight
              color="grey"
              style="
                height: 16px;
                margin-top: 1.5px;
                cursor: pointer;
                padding: 2px;
                border-radius: 5px;
              "
              @click="MapQuantitativeData(d.name)"
            ></TopRight>
          </div>
          <div
            v-if="
              !nominal_attr_name.includes(d.name) &&
              !data.quantitative_mapping_type[d.name]
            "
            style="padding-left: 5px; padding-top: 7px; cursor: pointer"
          >
            <BottomRight
              color="grey"
              style="
                height: 16px;
                margin-top: 1.5px;
                cursor: pointer;
                padding: 2px;
                border-radius: 5px;
              "
              @click="MapQuantitativeData(d.name)"
            ></BottomRight>
          </div>

          <!-- filter -->
          <div style="padding-left: 5px; padding-top: 7px; cursor: pointer">
            <el-popover
              placement="top"
              :width="180"
              trigger="hover"
              title="filter"
              effect="customized"
              popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; 
              padding: 10px; border: grey"
            >
              <template #reference>
                <Filter
                  color="grey"
                  style="
                    height: 16px;
                    margin-top: 1.5px;
                    cursor: pointer;
                    padding: 2px;
                    border-radius: 5px;
                  "
                ></Filter>
              </template>

              <div
                style="
                  font-size: 10px;
                  margin-left: 40px;
                  margin-bottom: 10px;
                  margin-top: -27px;
                "
              >
                {{ ScaleAndStep(d.name)[0] }} / unit
              </div>
              <div
                style="
                  width: 100%;
                  display: flex;
                  justify-content: space-around;
                "
              >
                <el-input-number
                  class="number-input"
                  v-if="
                    !nominal_attr_name.includes(d.name) &&
                    data.quantitative_filter[d.name]
                  "
                  v-model="data.quantitative_filter[d.name][0]"
                  :min="data.quantitative_attr_range[d.name].min"
                  :max="data.quantitative_filter[d.name][1]"
                  size="small"
                  controls-position="right"
                  @change="HandleQuanFilterChange(d.name)"
                  :step="ScaleAndStep(d.name)[1]"
                />
                <span style="margin: 2px 5px 2px 5px">~</span>
                <el-input-number
                  class="number-input"
                  v-if="
                    !nominal_attr_name.includes(d.name) &&
                    data.quantitative_filter[d.name]
                  "
                  v-model="data.quantitative_filter[d.name][1]"
                  :min="data.quantitative_filter[d.name][0]"
                  :max="data.quantitative_attr_range[d.name].max"
                  @change="HandleQuanFilterChange(d.name)"
                  :step="ScaleAndStep(d.name)[1]"
                  size="small"
                  controls-position="right"
                />
              </div>

              <!-- nominal -->
              <el-checkbox-group
                v-if="nominal_attr_name.includes(d.name)"
                v-model="data.nominal_filter[d.name]"
              >
                <el-checkbox
                  v-for="item in data.nominal_attr_set[d.name]"
                  :key="item.index"
                  :label="item"
                >
                </el-checkbox>
              </el-checkbox-group>
            </el-popover>
          </div>
        </div>
      </div>
    </div>

    <TransitionGroup
      tag="div"
      name="list"
      class="table"
      v-infinite-scroll="LoadMoreScore"
    >
      <div
        class="table-content"
        v-for="item in data.ranking_score"
        :key="item.index"
        @dblclick="GotoBlock(item.origin.block)"
        title="Double Click to see where it is!"
      >
        <div class="table-content-block">
          <div class="table-content-block-text">{{ item.origin.block }}</div>
          <div
            class="function-button"
            @click="AddToFavorite(item.origin.block)"
          >
            <el-icon v-if="house_store.favoriteHouse[item.origin.block]"
              ><star-filled
                color="#dd9449"
                style="transform: scale(1.2, 1.2)"
              />
            </el-icon>
            <el-icon v-else>
              <star />
            </el-icon>
          </div>
          <div
            class="function-button"
            @click="AddToBlackList(item.origin.block)"
          >
            <el-icon><hide /></el-icon>
          </div>
        </div>

        <div class="table-content-weights">
          <template v-for="d in enabled_strip" :key="d.name">
            <el-tooltip
              v-if="item.origin[d.name] && data.scaled_records[item.index]"
              :content="
                item.origin[d.name].toString() + ' ' + ScaleAndStep(d.name)[0]
              "
              :hide-after="0"
              placement="top"
              popper-class="popper"
              effect="customized"
            >
              <div
                class="table-content-weighted"
                :style="{
                  '--strip-color': d.color,
                  '--strip-width': `${
                    (d.weight / strip_percentage_sum) *
                    data.scaled_records[item.index][d.name] *
                    100
                  }%`,
                }"
              >
                <div>
                  {{ item.origin[d.name] }}
                </div>
              </div>
            </el-tooltip>
          </template>
          <div class="table-content-score">
            {{ (item.score * 100).toFixed(2) }}
          </div>

          <!-- todo: Distance Criteria reference -->
          <!-- <span
            v-for="coord in user_mark_criterias"
            :key="coord.toString() + item.index"
          >
            {{ GetBlockToPointDistance(item.origin.block, coord) }}
            km
          </span> -->
        </div>

        <!-- rank frequency -->
        <div class="table-rank-frequency">
          <div
            style="
              position: absolute;
              height: 100%;
              left: 0;
              transition: 0.5s;
              background-color: rgb(84, 123, 192);
            "
            :style="{
              opacity: `${
                rank_store.GetRankFrequency(item.id).in_top === 0 ? 0 : 0.5
              }`,
              width: `${80 * rank_store.GetRankFrequency(item.id).in_top}%`,
            }"
          ></div>
          <div
            style="
              position: absolute;
              height: 100%;
              left: 0;
              transition: 0.5s;
              background-color: rgb(84, 123, 192);
            "
            :style="{
              opacity: `${
                rank_store.GetRankFrequency(item.id).in_top === 0 ? 0 : 0.75
              }`,
              width: `${80 * rank_store.GetRankFrequency(item.id).at_top}%`,
            }"
          ></div>
        </div>
      </div>
    </TransitionGroup>

    <el-dialog v-model="data.mapping_dialog_visible" title="Data Mapping">
      <map-nominal
        @cancel="data.mapping_dialog_visible = false"
        @confirm="HandleConfirmMapping"
        :nominal_data="data.current_nominal_to_map"
        :attr="data.current_nominal_attr_name"
      ></map-nominal>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, toRaw } from "@vue/reactivity";
import { useStore } from "../store/weight";
import { useRankStore } from "../store/rank";
import { useHouseStore } from "../store/selectedHouse";
import { emitter } from "../store/bus";
import { computed, onMounted, watch } from "@vue/runtime-core";
import * as d3 from "d3";
import MapNominal from "./MapNominal.vue";

import { GetBlockToPointDistance } from "../Map/geoUtil";

import {
  Edit,
  TopRight,
  BottomRight,
  Filter,
  Star,
  StarFilled,
  Hide,
  LocationFilled,
} from "@element-plus/icons-vue";

const store = useStore();
const rank_store = useRankStore();
const house_store = useHouseStore();
const props = defineProps({
  origin_records: {
    type: Array,
    default: [],
    required: false,
  },
});

// the reactive data
const data = reactive({
  current_nominal_to_map: [],
  current_nominal_attr_name: null,

  mapping_dialog_visible: false,
  scaled_records: [], // the scaled value of each origin record

  quantitative_attr_range: {},
  quantitative_filter: {},
  quantitative_mapping_type: {}, // true: positive; false: negative

  nominal_attr_set: {},
  nominal_mapping_map: {},
  nominal_filter: {
    direction: [],
    decoration: [],
    position: [],
    type: [],
  },

  weight_strip_scaled_data: [],

  ranking_score: [],
});

function ScaleAndStep(name) {
  switch (name) {
    case "deal_price":
      return ["万rmb", 10];
    case "unit_price":
      return ["rmb", 1000];
    case "area":
      return ["m²", 5];

    default:
      return ["", 1];
  }
}

const nominal_attr_name = [
  "direction",
  "decoration",
  "position",
  "type",
  "region",
  "sub_region",
];
const quantitative_attr_name = [
  "area",
  "deal_price",
  "unit_price",
  "room",
  "hall",
  "block_height",
  "built_year",
];
const scale_list = new Map(); // the scale of each attr

// Add default criteria, this should be name of records criteria. Like price, area etc.
// name, color, enabled(default is disabled)
// let criteria = [];
store.criterias.push(store.CreateCriteria("area", "#8dd3c7", true));
store.criterias.push(store.CreateCriteria("direction", "#ffffb3"));
store.criterias.push(store.CreateCriteria("decoration", "#fb8072"));
store.criterias.push(store.CreateCriteria("deal_price", "#bebada", true));
store.criterias.push(store.CreateCriteria("unit_price", "#80b1d3", true));
store.criterias.push(store.CreateCriteria("region", "#e05e63"));
store.criterias.push(store.CreateCriteria("sub_region", "#e5cee6"));
store.criterias.push(store.CreateCriteria("position", "#fdb462"));
store.criterias.push(store.CreateCriteria("room", "#b3de69"));
store.criterias.push(store.CreateCriteria("hall", "#fccde5"));
store.criterias.push(store.CreateCriteria("block_height", "#ffed6f"));
store.criterias.push(store.CreateCriteria("built_year", "#bc80bd"));
store.criterias.push(store.CreateCriteria("type", "#ccebc5"));
// store.criterias = criteria;

const enabled_strip = computed(() => store.criterias.filter((d) => d.enabled));

const strip_percentage_sum = computed(() => {
  let sum = 0;
  enabled_strip.value.forEach((d) => (sum += d.weight));
  return sum;
});

watch(
  () => props.origin_records, // calculate the scaled value of the default attr list, can't use onMounted because props is slower
  () => {
    data.scaled_records = [];
    PreProcess();
  }
);

let initial = 0;

function PreProcess() {
  nominal_attr_name.forEach((attr) => {
    data.nominal_mapping_map[attr] = new Map();
    let res = GenDefaultNominalMap(attr);
    data.nominal_attr_set[attr] = res;

    if (initial == 0) {
      data.nominal_filter[attr] = res;
    }
  });
  quantitative_attr_name.forEach((attr) => {
    let res = null;
    if (store.GetCriteria(attr, true).type == "criteria") {
      res = CalculateQuanAttrRange(attr);
      data.quantitative_mapping_type[attr] = [
        "deal_price",
        "unit_price",
      ].includes(attr)
        ? true
        : false;
    } else {
      res = CalculateUserMark(attr);
      data.quantitative_mapping_type[attr] = true;
    }
    data.quantitative_attr_range[attr] = res;

    if (initial == 0) {
      data.quantitative_filter[attr] = [res.min, res.max];
    }
  });

  let default_attr_list = enabled_strip.value.map((s) => s.name);
  default_attr_list.forEach((attr) => {
    HandleScale(attr);
    CalculateScaledRecords(attr);
  });

  if (props.origin_records.length > 0) {
    initial = 1;
  }
}

function CalculateQuanAttrRange(attr) {
  let value_list = props.origin_records.map((record) => {
    return Number(record[attr]);
  });
  let min = Math.min(...value_list);
  let max = Math.max(...value_list);
  // data.quantitative_attr_range[attr] = {min:min, max:max}
  // console.log(data.quantitative_attr_range[attr])
  return { min: min, max: max };
}

const user_mark_records = {}; // record the origin user mark data(e.g. distance). the index is consistent with origin_records
function CalculateUserMark(attr) {
  let value_list = [];
  let coord = store.GetCriteria(attr, true).coord;
  props.origin_records.forEach((record) => {
    // console.log(record.block)
    let dis = GetBlockToPointDistance(record.block, coord);
    value_list.push(dis);
  });
  user_mark_records[attr] = value_list;
  // console.log("value_list", value_list)

  let min = Math.min(...value_list);
  let max = Math.max(...value_list);
  return { min: min, max: max };
}

function GenDefaultNominalMap(name) {
  let value_list = props.origin_records.map((record) => record[name]);
  let value_set = new Set(value_list);
  value_list = Array.from(value_set);
  value_list.forEach((v) => {
    data.nominal_mapping_map[name].set(v, 0.5);
  }); // default value=0.5HandleConfirmMapping

  return value_list;
}

watch(
  () => enabled_strip.value,
  (new_val, old_val) => {
    let new_list = new_val.map((val) => val.name);
    let old_list = old_val.map((val) => val.name);
    if (new_list.length > old_list.length) {
      // add a new attr, calculate scaled value
      for (let i = 0; i < new_list.length; i++) {
        if (old_list.indexOf(new_list[i]) != i) {
          // data.filter_popover_visible[new_list[i]] = false
          if (scale_list.has(new_list[i])) {
          } // already have scale, don't calculate again
          else {
            let attr = new_list[i];

            if (
              !nominal_attr_name.includes(attr) &&
              !quantitative_attr_name.includes(attr)
            ) {
              // new user mark
              let res = CalculateUserMark(attr);
              data.quantitative_attr_range[attr] = res;
              data.quantitative_filter[attr] = [res.min, res.max];
              data.quantitative_mapping_type[attr] = true;

              quantitative_attr_name.push(attr);
            }

            HandleScale(attr);
            CalculateScaledRecords(attr);
          }
          break;
        }
      }
    } else {
      // delete an attr but try to keep the calculated values, so do nothing
    }
  },
  { deep: true }
);

function HandleScale(name) {
  if (!nominal_attr_name.includes(name)) {
    // quantitative
    CalculateQuantitativeScale(name, data.quantitative_mapping_type[name]);
  } else {
    // nominal
    scale_list.set(name, data.nominal_mapping_map[name]);
  }
}

function HandleQuanFilterChange(attr) {
  // ChangeOtherFilter(attr)
  HandleScale(attr);
  CalculateScaledRecords(attr);
}

function CalculateQuantitativeScale(name, is_positive_correlation) {
  let min = data.quantitative_filter[name][0];
  let max = data.quantitative_filter[name][1];

  let scale = d3.scaleLinear().range([0.1, 1]);
  if (is_positive_correlation) {
    scale.domain([min, max]);
  } else {
    scale.domain([max, min]);
  }
  scale_list.set(name, scale);
}

// 将所有input重新计算了value
function CalculateScaledRecords(name) {
  let value_list = null;
  if (store.GetCriteria(name, true).type == "criteria") {
    value_list = props.origin_records.map((record) => {
      if (name == "built_year") return Number(record[name]);
      else return record[name];
    });
  } else {
    value_list = user_mark_records[name];
  }

  if (data.scaled_records.length == 0) {
    // the first time to calculate, create
    for (let i = 0; i < value_list.length; i++) {
      let obj = new Object();
      if (nominal_attr_name.includes(name)) {
        // nominal:map
        obj[name] = scale_list.get(name).get(value_list[i]);
      } else {
        // quantitative: scale
        obj[name] = scale_list.get(name)(value_list[i]);
      }
      data.scaled_records.push(obj);
    }
  } else {
    if (nominal_attr_name.includes(name)) {
      // nominal:map
      for (let i = 0; i < value_list.length; i++) {
        data.scaled_records[i][name] = scale_list.get(name).get(value_list[i]);
      }
    } else {
      // quantitative: scale
      for (let i = 0; i < value_list.length; i++) {
        data.scaled_records[i][name] = scale_list.get(name)(value_list[i]);
      }
    }
  }
}

// ranking change: weight change / enable change
watch(
  () => [
    enabled_strip.value,
    strip_percentage_sum.value,
    props.origin_records,
    data.nominal_filter,
    data.quantitative_filter,
    data.nominal_mapping_map,
    data.quantitative_mapping_type,
  ],
  () => {
    MT_RankingScore();
    // data.ranking_score = RankingScore();
  },
  {
    deep: true,
  }
);

function MT_UpdateData() {
  ranking_worker.postMessage({
    op: "uploadDATA",
    DATA: {
      origin_records: JSON.parse(JSON.stringify(toRaw(props.origin_records))),
      enabled_strip: JSON.parse(JSON.stringify(enabled_strip.value)),
      quantitative_filter: JSON.parse(
        JSON.stringify(toRaw(data.quantitative_filter))
      ),
      nominal_filter: JSON.parse(JSON.stringify(toRaw(data.nominal_filter))),
      scaled_records: JSON.parse(JSON.stringify(toRaw(data.scaled_records))),
      strip_percentage_sum: JSON.parse(
        JSON.stringify(toRaw(strip_percentage_sum.value))
      ),
    },
  });
}

let start = 0;
function MT_RankingScore() {
  // MT_UpdateData();
  start = Date.now();
  ranking_worker.postMessage({
    op: "ranking",
    DATA: {
      origin_records: JSON.parse(JSON.stringify(toRaw(props.origin_records))),
      enabled_strip: JSON.parse(JSON.stringify(enabled_strip.value)),
      quantitative_filter: JSON.parse(
        JSON.stringify(toRaw(data.quantitative_filter))
      ),
      nominal_filter: JSON.parse(JSON.stringify(toRaw(data.nominal_filter))),
      nominal_attr_name: JSON.parse(JSON.stringify(nominal_attr_name)),
      scaled_records: JSON.parse(JSON.stringify(toRaw(data.scaled_records))),
      strip_percentage_sum: JSON.parse(
        JSON.stringify(toRaw(strip_percentage_sum.value))
      ),
      user_mark_records: JSON.parse(JSON.stringify(user_mark_records)),
    },
    time_stamp: start,
  });
  console.log("post data used time:", Date.now() - start);
}

function MT_ReceiveCalculatedScore(scores, time_stamp) {
  if (time_stamp && time_stamp < start) {
    console.log("not update");
    return;
  }

  let num = scores.length < 1000 ? scores.length : 1000;
  // let num = scores.length;
  let records = [];
  for (let i = 0; i < num; i++) {
    const element = scores[i];
    // add user mark record to origin
    let ori = props.origin_records[element.index];
    for (let key in user_mark_records) {
      ori[key] = user_mark_records[key][element.index];
    }

    records.push({
      index: element.index,
      origin: ori,
      id: props.origin_records[element.index]._id,
      score: element.score,
    });
  }

  rank_store.ChangeCurrentSolutions(records.slice(0, 200).map((d) => d.origin));
  let scaled_records = [];
  records.forEach((d) => scaled_records.push(data.scaled_records[d.index]));
  rank_store.ChangeCurrentScale(scaled_records.slice(0, 200));

  record_update = records.slice(0, 15);

  if (record_timeout === null) {
    record_timeout = setTimeout(() => {
      if (time_stamp) {
        if (time_stamp >= start) {
          console.log(time_stamp, start);
          data.ranking_score = record_update;
        } else {
          console.log("no update");
        }
      } else {
        console.log("no time stamp");
        data.ranking_score = record_update;
      }
      record_timeout = null;
    }, 500);
  }

  console.log("update used time:", Date.now() - start);
}

let record_timeout = null;
let record_update = [];

// watch(
//   () => ranking_score.value,
//   () => {
//     console.log("ranking_score", ranking_score.value);
//     console.log("weight_strip", data.weight_strip_scaled_data);
//   }
// );

function HandleConfirmMapping(mapping_data, attr) {
  data.mapping_dialog_visible = false;
  // console.log(mapping_data);

  for (let [key, value] of mapping_data) {
    data.nominal_mapping_map[attr].set(key, value);
  }
  // data.nominal_mapping_map[attr] = mapping_data

  // recalculate scaled data
  HandleScale(attr);
  CalculateScaledRecords(attr);
}

/* Nominal Data mapping related */

class Nominal {
  constructor(name, default_value, enabled) {
    this.name = name;
    this.value = default_value;
    this.enabled = enabled;
  }
}

function MapNominalData(attr) {
  let arr = [];

  let value_list = props.origin_records.map((record) => record[attr]);
  let value_set = new Set(value_list);
  value_list = Array.from(value_set).filter((d) =>
    data.nominal_filter[attr].includes(d)
  );

  let cur_scale = data.nominal_mapping_map[attr];

  value_list.forEach((v) => {
    let cur_value = cur_scale.get(v);
    arr.push(new Nominal(v, cur_value));
  });

  data.current_nominal_to_map = arr;
  data.current_nominal_attr_name = attr;

  data.mapping_dialog_visible = true;
}

function MapQuantitativeData(attr) {
  data.quantitative_mapping_type[attr] = !data.quantitative_mapping_type[attr];

  HandleScale(attr);
  CalculateScaledRecords(attr);
}

function AddToFavorite(name) {
  if (house_store.IsFavoriteHouse(name)) {
    house_store.RemoveFavoriteHouse(name);
  } else {
    house_store.AddFavoriteHouse(name);
  }
}

function AddToBlackList(name) {
  house_store.AddToBlackList(name);
}

function GotoBlock(name) {
  emitter.emit("goto-block", name);
}

// for position change of user mark
function HandleUserMarkChange(attr) {
  // attr is the changed mark's name
  let res = CalculateUserMark(attr);
  data.quantitative_attr_range[attr] = res;
  data.quantitative_filter[attr] = [res.min, res.max];
  data.quantitative_mapping_type[attr] = true;

  HandleScale(attr);
  CalculateScaledRecords(attr);

  MT_RankingScore();
}
emitter.on("change-point", HandleUserMarkChange);

// multi thread
let ranking_worker = new Worker("lineup_webworker.js");
ranking_worker.onmessage = (e) => {
  switch (e.data.op) {
    case "ranking":
      MT_ReceiveCalculatedScore(e.data.scores, e.data.time_stamp);
      break;
    case "moreRanking":
      AddRanking(e.data.scores);
      break;
    default:
      break;
  }
};

function AddRanking(scores) {
  let records = [];
  for (let i = 0; i < scores.length; i++) {
    const element = scores[i];
    // add user mark record to origin
    let ori = props.origin_records[element.index];
    for (let key in user_mark_records) {
      ori[key] = user_mark_records[key][element.index];
    }

    records.push({
      index: element.index,
      origin: ori,
      id: props.origin_records[element.index]._id,
      score: element.score,
    });
  }
  data.ranking_score = data.ranking_score.concat(records);
}

function LoadMoreScore() {
  if (data.ranking_score.length > 0) {
    ranking_worker.postMessage({
      op: "moreRanking",
      offset: data.ranking_score.length + 1,
    });
  }
}
</script>

<style lang="less" scoped>
.popper {
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.3));
}
.line-up {
  position: relative;
  height: 100%;
  width: 60%;
}
.table {
  position: relative;
  // margin: 20px;
  height: 98%;
  width: 100%;
  overflow: scroll;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
}
.table-content {
  cursor: pointer;
  position: relative;
  transition-delay: 0.2s;
  transition: 0.5s;
  text-align: left;
  height: 35px;
  margin: 12px 7px 15px 6px;
  // padding: 1px;
  border-radius: 5px;

  display: flex;
  justify-content: flex-start;
  // filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));

  // margin-bottom: 5px;
  // border-top: solid #eaeaea 2px;
  // margin: 5px;
  background-color: whitesmoke;

  transition: 1s;
  &:hover {
    background-color: white;
  }

  span {
    position: relative;
    top: 5px;
    padding: 10px 0px 0px 2px;
  }
}
.table-content-block {
  width: 20%;
  position: relative;
  top: 0.5px;
  // height: 100%;
  border-right: solid 2px #eaeaea;
  overflow-x: scroll;
  // overflow-y: hidden;
  white-space: nowrap;
  // padding-top: 5px;
  padding-left: 5px;

  display: inline-block;
}

.table-content-weights {
  // white-space: nowrap;
  width: 80%;
}
.table-content-weighted {
  height: 100%;
  overflow: hidden;
  padding: 0 2% 0 1%;
  white-space: nowrap;
  // padding-top: 5px;
  // padding-left: 5px;
  display: inline-block;
  // border-bottom: solid 2px #eaeaea;

  background-color: var(--strip-color);
  width: var(--strip-width);
  transition-delay: 1s !important;
  transition-property: width;
  transition: 0.5s !important;
  position: relative;

  &:hover {
    padding: 0 5% 0 2%;
  }
  div {
    position: absolute;
    bottom: 10%;
  }
}
.table-rank-frequency {
  position: relative;
  height: 100%;
  width: 25%;
  overflow: hidden;
  top: 0;
  right: 0;
  // background-color: rgba(84, 124, 192, 0.5);
  // background-color: grey;
}

.table-content-score {
  display: inline-block;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: grey;
  user-select: none;
  font-size: 10px;
  font-weight: 600;
  transform: scale(0.8, 1) translateY(-10%);
}

.weight-strip {
  display: flex;
  // display: inline-flex;
  width: 100%;
  user-select: none;
  height: 35px;
  overflow: hidden;
  // overflow: scroll;
  white-space: nowrap;
  background-color: rgb(255, 255, 255);

  .enabled {
    height: 24px;
    border-radius: 5px;
    margin: 0px 5px 2px 5px;
    padding: 0px 20px 5px 20px;
    background-color: rgb(207, 100, 100);
    animation: enter 0.5s;
    transition: 0.25s;
    // transition-delay: 0.5s;
    color: white;
    font-size: 13px;
    font-weight: 600;
    background-color: var(--strip-color);
    width: var(--strip-width);
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
  }
  .el-checkbox {
    position: relative;
    margin-right: 3px;
    top: 3px;
  }

  .strip {
    position: relative;
    top: -4px;
    display: flex;
    flex-wrap: nowrap;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.3));
  }
}

@keyframes enter {
  from {
    transform: scale(0, 0);
  }
  to {
  }
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  // opacity: 0;
  transform: translateY(40vh);
}

.function-button {
  // width: 5px;
  margin: 4px 0px 0px 0px;
  padding: 4px 7px 2px 7px;
  // height: 30px;
  // width: 30px;
  transition: 0.5s;
  border-radius: 3px;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  &:hover {
    background-color: whitesmoke;
  }
  display: inline-block;
}

.table-content-block-text {
  margin-left: 5px;
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
// .list-leave-active {
//   // position: absolute;
// }
</style>
