<template>
  <div class="line-up">
    <div class="table">
      <div
        class="table-content"
        v-for="record in props.ranking_records"
        :key="record._id"
      >
        {{
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
  </div>
</template>

<script setup>
const props = defineProps({
  ranking_records: {
    type: Array,
    default: [],
    required: false,
  },
});
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
