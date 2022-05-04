<template>
  <div class="line-up">    
    <div class="weight-strip">
      <div class="enabled"
        v-for="d in enabled_strip"
        :key="d.name"
        :style="{
          '--strip-color': d.color,
          '--strip-width': `${(100 * d.weight) / strip_percentage_sum}%`,
        }"
      >
        <!-- backgroundColor: d.color, -->
        <div>
          <el-checkbox v-model="d.enabled"></el-checkbox>
          {{ d.name }}
        </div>
      </div>
    </div>

    <div class="table">
      <div
        class="table-content"
        v-for="record in props.origin_records"
        :key="record._id"
      >
        {{
          record._id + " , " +  
          record.block +
          " , " +
          record.area +
          " , " +
          record.direction +
          " , " +
          record.decoration +
          " , " +
          record.deal_price
        }}
      </div>
    </div>

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

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.mapping_dialog_visible = false">Cancel</el-button>
          <el-button type="primary" @click="HandleConfirmMapping"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { useStore } from "../store/weight";
import { computed, onMounted, watch } from "@vue/runtime-core";
import * as d3 from "d3";

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
  mapping_dialog_visible: false,
  // ranking_score: [],
})

const nominal_attr_name = ['direction', 'decoration', 'position', 'type']
const scale_list = new Map  // the scale of each attr

// Add default criteria, this should be name of records criteria. Like price, area etc.
// name, color, enabled(default is disabled)
store.AddCriteria("area", "#a6cee3", true);
store.AddCriteria("direction", "#ffff99", true);
store.AddCriteria("decoration", "#1f78b4");
store.AddCriteria("deal_price", "#b2df8a");
store.AddCriteria("unit_price", "#33a02c", true);
store.AddCriteria("position", "#fb9a99");
store.AddCriteria("room", "#e31a1c");
store.AddCriteria("hall", "#fdbf6f");
store.AddCriteria("block_height", "#ff7f00");
store.AddCriteria("built_year", "#cab2d6");
store.AddCriteria("type", "#6a3d9a");

const enabled_strip = computed(() => store.weights.filter((d) => d.enabled));

const strip_percentage_sum = computed(() => {
  let sum = 0;
  enabled_strip.value.forEach((d) => (sum += d.weight));
  return sum;
});

watch(
  () => props.origin_records,   // calculate the scaled value of the default attr list, can't use onMounted because props is slower
  () => {
  let default_attr_list = enabled_strip.value.map(s => s.name)
  default_attr_list.forEach((attr) => {
    CalculateScale(attr)
    CalculateScaledRecords(attr)
  })
})

watch(
  () => enabled_strip.value,
  (new_val, old_val) => {
    let new_list = new_val.map(val => val.name)
    let old_list = old_val.map(val => val.name)
    if (new_list.length > old_list.length) {  // add a new attr, calculate scaled value
      for (let i=0; i<new_list.length; i++) {
        if (old_list.indexOf(new_list[i]) != i) {
          if (scale_list.has(new_list[i]))  {} // already have scale, don't calculate again
          else {
            CalculateScale(new_list[i])  // todo: need user interaction
            CalculateScaledRecords(new_list[i])
          }
          break
        }
      }
    }
    else {
      // delete an attr but try to keep the calculated values, so do nothing
    }
  }
);

const scaled_records = []  // the scaled value of each origin record

function CalculateScale(name) {
  if (nominal_attr_name.indexOf(name) == -1) {  // quantitative 
    let value_list = props.origin_records.map(record => record[name])
    let min = Math.min(...value_list)
    let max = Math.max(...value_list)

    // todo: user choose between negative and positive correlation 

    let scale = d3.scaleLinear().range([0, 1]).domain([min, max])
    scale_list.set(name, scale)
  }
  else {  // todo: nominal 

  }
}

function CalculateScaledRecords(name) {
  if (nominal_attr_name.indexOf(name) != -1) return  //todo: nominal

  let value_list = props.origin_records.map(record => record[name])
  if (scaled_records.length == 0) { // the first time to calculate, create
    for (let i=0; i<value_list.length; i++) {   
      let obj = new Object
      obj[name] = scale_list.get(name)(value_list[i])
      scaled_records.push(obj)
    }
  }
  else {
    for (let i=0; i<value_list.length; i++) {
      scaled_records[i][name] = scale_list.get(name)(value_list[i])
    }
  }
  
  console.log("scale_records", scaled_records)
}

function HandleConfirmMapping() {
  data.mapping_dialog_visible = false
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
  height: 95%;
  width: 98%;
  overflow: scroll;
}
.table-content {
  text-align: left;
  height: fit-content;
  margin: 5px;
  padding: 5px;
  background-color: rgb(255, 255, 255);
}
.weight-strip {
  display: flex;
  width: 100%;
  overflow: hidden;
  background-color: aliceblue;
  .enabled {
    border-radius: 5px;
    margin: 2px 5px 2px 5px;
    padding: 2px 20px 2px 20px;
    background-color: rgb(158, 158, 158);
    animation: enter 0.5s;
    transition: 0.5s;
    color: white;

    background-color: var(--strip-color);
    width: var(--strip-width);
  }
}

@keyframes enter {
  from {
    transform: scale(0, 0);
  }
  to {
    transform: scale(1, 1);
  }
}
</style>
