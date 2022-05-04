<template>
  <div class="line-up">
    <div class="table">
      <div class="table-header"> 
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
import { computed, onMounted } from "@vue/runtime-core";
const props = defineProps({
  origin_records: {
    type: Array,
    default: [],
    required: false,
  },
});

// the reactive data
const data = reactive({
  mapping_dialog_visible: true,
  ranking_score: [],
})

const scaled_records = [{a:1, b:2}, {a:2, b:3}, {a:5, b:1}]

const 

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
</style>
