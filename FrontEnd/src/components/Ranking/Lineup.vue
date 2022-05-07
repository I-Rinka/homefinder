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
        <div class="strip">
          <!-- enable -->
          <div style="overflow: hidden; white-space: nowrap">
            <el-checkbox v-model="d.enabled"></el-checkbox>
            {{ d.name }}
          </div>

          <!-- mapping -->
          <div v-if="nominal_attr_name.includes(d.name)"
            style="padding-left: 5px; padding-top: 7px; cursor: pointer;">
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

          <div v-if="!nominal_attr_name.includes(d.name) && data.quantitative_mapping_type[d.name]"
            style="padding-left: 5px; padding-top: 7px; cursor: pointer;">
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
          <div v-if="!nominal_attr_name.includes(d.name) && !data.quantitative_mapping_type[d.name]"
            style="padding-left: 5px; padding-top: 7px; cursor: pointer;">
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
          <span> {{ props.origin_records[item.index].block }} </span>
        </div>

        <div
          class="table-content-weighted"
          v-for="d in enabled_strip"
          :key="d.name"
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
          {{ props.origin_records[item.index][d.name] }}
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
import { reactive, ref } from "@vue/reactivity";
import { useStore } from "../store/weight";
import { computed, onMounted, watch } from "@vue/runtime-core";
import * as d3 from "d3";
import MapNominal from "./MapNominal.vue";
import { Edit, TopRight, BottomRight } from "@element-plus/icons-vue";

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

  quantitative_mapping_type: // true: positive; false: negative
    {
      area: false,
      deal_price: true,
      unit_price: true,
      room: false,
      hall: false,
      block_height: false,
      built_year: false,
    },

  nominal_mapping_map: {
    direction: new Map,
    decoration: new Map,
    position: new Map,
    type: new Map,
  },
});

function GenDefaultNominalMap(name) {
  let value_list = props.origin_records.map((record) => record[name]);
  let value_set = new Set(value_list)
  value_list = Array.from(value_set)
  value_list.forEach((v) => {data.nominal_mapping_map[name].set(v, 0.5)}) // default value=0.5
}

const nominal_attr_name = ["direction", "decoration", "position", "type"];
const scale_list = new Map(); // the scale of each attr

// Add default criteria, this should be name of records criteria. Like price, area etc.
// name, color, enabled(default is disabled)
let criteria = [];
criteria.push(store.CreateCriteria("area", "#8dd3c7", true));
criteria.push(store.CreateCriteria("direction", "#ffffb3", true));
criteria.push(store.CreateCriteria("decoration", "#bebada", true));
criteria.push(store.CreateCriteria("deal_price", "#fb8072", ));
criteria.push(store.CreateCriteria("unit_price", "#80b1d3", true));
criteria.push(store.CreateCriteria("position", "#fdb462", true));
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
    nominal_attr_name.forEach((attr) => GenDefaultNominalMap(attr))
    let default_attr_list = enabled_strip.value.map((s) => s.name);
    default_attr_list.forEach((attr) => {
      HandleScale(attr);
      CalculateScaledRecords(attr);
    });
  }
);

watch(
  () => enabled_strip.value,
  (new_val, old_val) => {
    let new_list = new_val.map((val) => val.name);
    let old_list = old_val.map((val) => val.name);
    if (new_list.length > old_list.length) {
      // add a new attr, calculate scaled value
      for (let i = 0; i < new_list.length; i++) {
        if (old_list.indexOf(new_list[i]) != i) {
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

function HandleScale(name) {
  if (nominal_attr_name.indexOf(name) == -1) {
    // quantitative
    CalculateQuantitativeScale(name, data.quantitative_mapping_type[name]);
  } else {
    // nominal
    scale_list.set(name, data.nominal_mapping_map[name]);
  }
}

function CalculateQuantitativeScale(name, is_positive_correlation) {
  let value_list = props.origin_records.map((record) => record[name]);
  let min = Math.min(...value_list);
  let max = Math.max(...value_list);

  let scale = d3.scaleLinear().range([0, 1]);
  if (is_positive_correlation) {
    scale.domain([min, max]);
  } else {
    scale.domain([max, min]);
  }
  scale_list.set(name, scale);
}

function CalculateScaledRecords(name) {
  let value_list = props.origin_records.map((record) => record[name]);
  if (data.scaled_records.length == 0) {
    // the first time to calculate, create
    for (let i = 0; i < value_list.length; i++) {
      let obj = new Object();
      if (nominal_attr_name.includes(name)) { // nominal:map
        obj[name] = scale_list.get(name).get(value_list[i]);
      }
      else {  // quantitative: scale
        obj[name] = scale_list.get(name)(value_list[i]);
      }
      data.scaled_records.push(obj);
    }
  } else {
    if (nominal_attr_name.includes(name)) { // nominal:map
      for (let i = 0; i < value_list.length; i++) {
        data.scaled_records[i][name] = scale_list.get(name).get(value_list[i]);
      }
    }
    else {  // quantitative: map
      for (let i = 0; i < value_list.length; i++) {
        data.scaled_records[i][name] = scale_list.get(name)(value_list[i]);
      }
    }
    
  }
}

const ranking_score = computed(() => {
  let scores = [];
  for (let i = 0; i < data.scaled_records.length; i++) {
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
  return scores;
});

function HandleConfirmMapping(mapping_data, attr) {
  data.mapping_dialog_visible = false;
  console.log(mapping_data)

  data.nominal_mapping_map[attr] = mapping_data
  
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
  value_list = Array.from(value_set);

  let cur_scale = data.nominal_mapping_map[attr]

  value_list.forEach((v) => {
    let cur_value = cur_scale.get(v)
    arr.push(new Nominal(v, cur_value))
  })

  data.current_nominal_to_map = arr;
  data.current_nominal_attr_name = attr;

  data.mapping_dialog_visible = true;
}

function MapQuantitativeData(attr) {
  data.quantitative_mapping_type[attr] = !data.quantitative_mapping_type[attr]

  HandleScale(attr);
  CalculateScaledRecords(attr);
}
</script>

<style lang="less" scoped>
.line-up {
  position: relative;
  height: 100%;
  width: 60%;
  background-color: rgb(234, 234, 234);
}
.table {
  position: relative;
  margin: 20px;
  height: 90%;
  width: 98%;
  overflow: scroll;
}
.table-content {
  transition-delay: 0.2s;
  transition: 0.5s;
  text-align: left;
  height: 30px;
  border-bottom: solid #eaeaea 2px;
  // margin: 5px;

  background-color: rgb(255, 255, 255);
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
  // display: flex;
  display: inline-flex;
  width: 100%;
  height: 40px;
  // overflow: hidden;
  overflow: scroll;
  white-space: nowrap;
  background-color: rgb(255, 255, 255);
  .enabled {
    height: 23px;
    border-radius: 5px;
    margin: 0px 5px 2px 5px;
    padding: 0px 20px 5px 20px;
    background-color: rgb(207, 100, 100);
    animation: enter 0.5s;
    transition: 0.4s;
    color: white;
    font-size: 15px;
    font-weight: 600;
    background-color: var(--strip-color);
    width: var(--strip-width);
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
    // border: solid gray 1px;
  }
  .el-checkbox {
    position: relative;
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
