<template>
  <div class="line-up">
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
        <div class="strip" :title="d.name">
          <!-- enable -->
          <div style="overflow: hidden; white-space: nowrap">
            <el-checkbox v-model="d.enabled"></el-checkbox>
            {{ d.name }}
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
              :width="160"
              trigger="hover"
              title="filter"
              effect="customized"
              popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; 
              padding: 20px; border: grey"
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

              <!-- quantitative -->
              <el-slider
                v-if="!nominal_attr_name.includes(d.name)"
                range
                v-model="data.quantitative_filter[d.name]"
                :min="
                  data.quantitative_attr_range[d.name] == null
                    ? 0
                    : data.quantitative_attr_range[d.name].min
                "
                :max="
                  data.quantitative_attr_range[d.name] == null
                    ? 0
                    : data.quantitative_attr_range[d.name].max
                "
                @change="HandleQuanFilterChange(d.name)"
              >
              </el-slider>

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

    <TransitionGroup tag="div" name="list-complete" class="table">
      <div
        class="table-content"
        v-for="item in ranking_score"
        :key="item.index"
      >
        <div class="table-content-block">
          <span> {{ item.origin.block }} </span>
        </div>
        <template v-for="d in enabled_strip" :key="d.name">
          <el-tooltip
            :content="item.origin[d.name].toString()"
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
                  100 *
                  0.9
                }%`,
              }"
            >
              {{ item.origin[d.name] }}
            </div>
          </el-tooltip>
        </template>
          {{ item.score.toFixed(2) }}
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
import { reactive, ref } from "@vue/reactivity";
import { useStore } from "../store/weight";
import { computed, onMounted, watch } from "@vue/runtime-core";
import * as d3 from "d3";
import MapNominal from "./MapNominal.vue";
import { Edit, TopRight, BottomRight, Filter } from "@element-plus/icons-vue";

const store = useStore();
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
});

const nominal_attr_name = ["direction", "decoration", "position", "type"];
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
let criteria = [];
criteria.push(store.CreateCriteria("area", "#8dd3c7", true));
criteria.push(store.CreateCriteria("direction", "#ffffb3"));
criteria.push(store.CreateCriteria("decoration", "#fb8072"));
criteria.push(store.CreateCriteria("deal_price", "#bebada", true));
criteria.push(store.CreateCriteria("unit_price", "#80b1d3", true));
criteria.push(store.CreateCriteria("position", "#fdb462"));
criteria.push(store.CreateCriteria("room", "#b3de69"));
criteria.push(store.CreateCriteria("hall", "#fccde5"));
criteria.push(store.CreateCriteria("block_height", "#ffed6f"));
criteria.push(store.CreateCriteria("built_year", "#bc80bd"));
criteria.push(store.CreateCriteria("type", "#ccebc5"));
store.criterias = criteria;

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

function PreProcess() {
  nominal_attr_name.forEach((attr) => {
    data.nominal_mapping_map[attr] = new Map();
    let res = GenDefaultNominalMap(attr);
    data.nominal_attr_set[attr] = res;
    data.nominal_filter[attr] = res;
  });
  quantitative_attr_name.forEach((attr) => {
    let res = CalculateQuanAttrRange(attr);
    data.quantitative_attr_range[attr] = res;
    data.quantitative_filter[attr] = [res.min, res.max];
    data.quantitative_mapping_type[attr] = [
      "deal_price",
      "unit_price",
    ].includes(attr)
      ? true
      : false;

    // data.quantitative_details[attr] = {}
    // data.quantitative_details[attr].origin_range = res
    // data.quantitative_details[attr].mapping_type = ["deal_price", "unit_price"].includes(attr) ? true : false
    // data.quantitative_details[attr].filter = [res.min, res.max]
  });

  let default_attr_list = enabled_strip.value.map((s) => s.name);
  default_attr_list.forEach((attr) => {
    HandleScale(attr);
    CalculateScaledRecords(attr);
  });
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

function GenDefaultNominalMap(name) {
  let value_list = props.origin_records.map((record) => record[name]);
  let value_set = new Set(value_list);
  value_list = Array.from(value_set);
  value_list.forEach((v) => {
    data.nominal_mapping_map[name].set(v, 0.5);
  }); // default value=0.5

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
            HandleScale(new_list[i]); // todo: need user interaction
            CalculateScaledRecords(new_list[i]);
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

// function HandleFilter(name) {
//   // data.filter_popover_visible[name] = true
//   if (nominal_attr_name.includes(name)) { // nominal

//   }
//   else {  // quantitative

//   }
// }

function HandleScale(name) {
  if (!nominal_attr_name.includes(name)) {
    // quantitative
    CalculateQuantitativeScale(name, data.quantitative_mapping_type[name]);
  } else {
    // nominal
    scale_list.set(name, data.nominal_mapping_map[name]);
  }
}

// watch( // 非常丑陋
//   data.quantitative_filter,
//   (new_val, old_val) => {
//     console.log("comp", new_val["area"][1], old_val["area"][1])
//     quantitative_attr_name.forEach((attr) => {
//       if (new_val[attr] != old_val[attr]) {
//         HandleScale(attr)
//         CalculateScaledRecords(attr)
//       }
//     })
//   },
//   {deep: true}
// )
function HandleQuanFilterChange(attr) {
  HandleScale(attr);
  CalculateScaledRecords(attr);
}

function CalculateQuantitativeScale(name, is_positive_correlation) {
  // let min = data.quantitative_attr_range[name].min
  // let max = data.quantitative_attr_range[name].max

  let min = data.quantitative_filter[name][0];
  let max = data.quantitative_filter[name][1];

  let scale = d3.scaleLinear().range([0, 1]);
  if (is_positive_correlation) {
    scale.domain([min, max]);
  } else {
    scale.domain([max, min]);
  }
  scale_list.set(name, scale);
}

// 将所有input重新计算了value
function CalculateScaledRecords(name) {
  let value_list = props.origin_records.map((record) => {
    if (name == "built_year") return Number(record[name]);
    else return record[name];
  });

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
      // quantitative: map
      for (let i = 0; i < value_list.length; i++) {
        data.scaled_records[i][name] = scale_list.get(name)(value_list[i]);
      }
    }
  }
}

function CheckFilter(index) {
  let record = props.origin_records[index];
  let flag = true;
  for (let i = 0; i < enabled_strip.value.length; i++) {
    let attr = enabled_strip.value[i].name;
    if (nominal_attr_name.includes(attr)) {
      // nominal
      if (!data.nominal_filter[attr].includes(record[attr])) {
        flag = false;
        break;
      }
    } else {
      // quantitative
      if (
        !(
          data.quantitative_filter[attr][0] <= record[attr] &&
          data.quantitative_filter[attr][1] >= record[attr]
        )
      ) {
        flag = false;
        break;
      }
    }
  }
  if (flag) return true;
  else return false;
}
const ranking_score = computed(() => {
  let scores = [];
  for (let i = 0; i < data.scaled_records.length; i++) {
    if (!CheckFilter(i)) continue; // filtering

    let record = data.scaled_records[i];
    let s = 0;
    for (let j = 0; j < enabled_strip.value.length; j++) {
      let d = enabled_strip.value[j];
      s += record[d.name] * d.weight;
    }
    let obj = { index: i, score: s };
    scores.push(obj);
  }
  console.log("computed_ranking_score", scores);

  scores.sort((a, b) => {
    return a.score - b.score;
  });

  // select Top100
  let num = scores.length < 100 ? scores.length : 100;
  let records = [];
  for (let i = 0; i < num; i++) {
    const element = scores[i];
    records.push({
      index: element.index,
      origin: props.origin_records[element.index],
      score: element.score,
    });
  }
  return records;
});

function HandleConfirmMapping(mapping_data, attr) {
  data.mapping_dialog_visible = false;
  console.log(mapping_data);

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
}
.table-content {
  transition-delay: 0.2s;
  transition: 0.5s;
  text-align: left;
  height: 35px;
  margin: 12px 7px 15px 6px;
  // padding: 1px;
  border-radius: 5px;

  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));

  // margin-bottom: 5px;
  // border-top: solid #eaeaea 2px;
  // margin: 5px;
  background-color: whitesmoke;

  transition: 0.5s;
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
  width: 15%;
  height: 100%;
  border-right: solid 2px #eaeaea;
  overflow: hidden;
  white-space: nowrap;
  // padding-top: 5px;
  padding-left: 5px;
  display: inline-block;
}
.table-content-weighted {
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  // padding-top: 5px;
  // padding-left: 5px;
  display: inline-block;
  // border-bottom: solid 2px #eaeaea;

  background-color: var(--strip-color);
  width: var(--strip-width);
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
    transition: 0.4s;
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

.list-complete-enter, .list-complete-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
.list-complete-leave-active {
  position: absolute;
}

@keyframes enter {
  from {
    transform: scale(0, 0);
  }
  to {
  }
}
</style>
