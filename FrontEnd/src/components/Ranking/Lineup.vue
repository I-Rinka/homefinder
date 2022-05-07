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
          <!-- mapping -->

          <!-- enable -->
          <div style="overflow: hidden; white-space: nowrap">
            <el-checkbox v-model="d.enabled"></el-checkbox>
            {{ d.name }}
          </div>
          <div style="padding-left: 5px; padding-top: 7px">
            <Edit
              color="grey"
              style="
                height: 16px;
                margin-top: 1.5px;
                cursor: pointer;
                padding: 2px;
                border-radius: 5px;
              "
              @click="HandleMapData(d.name)"
            ></Edit>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="table"> -->
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
    <!-- </div> -->

    <el-dialog v-model="data.mapping_dialog_visible" title="Data Mapping">
      <!-- <el-form :model="form">
        <el-form-item label="Promotion name" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Zones" :label-width="formLabelWidth">
          <el-select v-model="form.region" placeholder="Please select a zone">
            <el-option label="Zone No.1" value="shanghai" />
            <el-option label="Zone No.2" value="beijing" />
          </el-select>
        </el-form-item>
      </el-form> -->

      <map-nominal
        @cancel="data.mapping_dialog_visible = false"
        @confirm="HandleConfirmMapping"
        :nominal_data="data.current_nominal_to_map"
      ></map-nominal>
      <!-- <el-button @click="data.mapping_dialog_visible = false"
            >Cancel</el-button
          >
          <el-button type="primary" @click="HandleConfirmMapping"
            >Confirm</el-button -->
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from "@vue/reactivity";
import { useStore } from "../store/weight";
import { computed, onMounted, watch } from "@vue/runtime-core";
import * as d3 from "d3";
import MapNominal from "./MapNominal.vue";
import { Edit } from "@element-plus/icons-vue";

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

  mapping_dialog_visible: false,
  scaled_records: [], // the scaled value of each origin record

  // true: positive; false: negative
  quantitative_mapping_type:
    // todo: user interaction
    {
      area: false,
      deal_price: true,
      unit_price: true,
      room: false,
      hall: false,
      block_height: false,
      built_year: false,
    },

  // todo: user interaction
  nominal_mapping_function: {
    direction: function (input) {
      if (input.includes("南")) return 0.3;
      else return 1;
    },
    decoration: function (input) {
      if (input.includes("精装")) return 0.3;
      else return 1;
    },
    position: function (input) {
      if (input.includes("中楼层")) return 0.3;
      else return 1;
    },
    type: function (input) {
      if (input.includes("板楼")) return 0.3;
      else return 1;
    },
  },
});

const nominal_attr_name = ["direction", "decoration", "position", "type"];
const scale_list = new Map(); // the scale of each attr

// Add default criteria, this should be name of records criteria. Like price, area etc.
// name, color, enabled(default is disabled)
let criteria = [];
criteria.push(store.CreateCriteria("area", "#a6cee3", true));
criteria.push(store.CreateCriteria("direction", "#ffff99"));
criteria.push(store.CreateCriteria("decoration", "#1f78b4"));
criteria.push(store.CreateCriteria("deal_price", "#b2df8a", true));
criteria.push(store.CreateCriteria("unit_price", "#33a02c", true));
criteria.push(store.CreateCriteria("position", "#fb9a99"));
criteria.push(store.CreateCriteria("room", "#e31a1c"));
criteria.push(store.CreateCriteria("hall", "#fdbf6f"));
criteria.push(store.CreateCriteria("block_height", "#ff7f00"));
criteria.push(store.CreateCriteria("built_year", "#cab2d6"));
criteria.push(store.CreateCriteria("type", "#6a3d9a"));
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
    scale_list.set(name, data.nominal_mapping_function[name]);
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

// function CalculateScale(name) {
//   if (nominal_attr_name.indexOf(name) == -1) {
//     // quantitative
//     let value_list = props.origin_records.map((record) => record[name]);
//     let min = Math.min(...value_list);
//     let max = Math.max(...value_list);

//     // todo: user choose between negative and positive correlation

//     let scale = d3.scaleLinear().range([0, 1]).domain([min, max]);
//     scale_list.set(name, scale);
//   }
//   else {
//     // todo: nominal
//     if (name == "direction") { // todo: just test!!!!!!!!!!
//       let scale = function (input) {
//         if (input.includes("南")) return 0.3
//         else return 1
//       }
//       scale_list.set(name, scale);
//     }
//   }
// }

function CalculateScaledRecords(name) {
  let value_list = props.origin_records.map((record) => record[name]);
  if (data.scaled_records.length == 0) {
    // the first time to calculate, create
    for (let i = 0; i < value_list.length; i++) {
      let obj = new Object();
      obj[name] = scale_list.get(name)(value_list[i]);
      data.scaled_records.push(obj);
    }
  } else {
    for (let i = 0; i < value_list.length; i++) {
      data.scaled_records[i][name] = scale_list.get(name)(value_list[i]);
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

function HandleConfirmMapping() {
  data.mapping_dialog_visible = false;
}

/* Nominal Data mapping related */

class Nominal {
  constructor(name, default_value, enabled) {
    this.name = name;
    this.value = default_value;
    this.enabled = enabled;
  }
}
function HandleMapData(name) {
  if (nominal_attr_name.includes(name)) {
    MapNominalData(name);
  } else {
    MapQuantitativeData(name);
  }
}

function MapNominalData(attr) {
  data.mapping_dialog_visible = true;

  let arr = [];

  // for (let i = 0; i < 5; i++) {
  //   arr.push(new Nominal(i.toString() + i.toString(), 0.2 * i));
  // }

  let value_list = props.origin_records.map((record) => record[attr]);
  let value_set = new Set(value_list);
  value_list = Array.from(value_set);

  data.current_nominal_to_map = arr;
  // show_map_widget = true;
}

function MapQuantitativeData(attr) {
  data.mapping_dialog_visible = true;

  // let arr = [];

  // for (let i = 0; i < 5; i++) {
  //   arr.push(new Nominal(i.toString() + i.toString(), 0.2 * i));
  // }

  // data.current_nominal_to_map = arr;
  // show_map_widget = true;
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
  display: flex;
  width: 100%;
  height: 40px;
  overflow: hidden;
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
