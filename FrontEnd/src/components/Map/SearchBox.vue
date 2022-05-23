<template>
  <div class="geo-search" v-click-outside="LoseFocus">
    <el-input
      :style="{ '--input-width': `${data.inputWidth}px` }"
      v-model="data.input"
      placeholder="Search Location"
      @pointerenter="data.inputWidth = 200"
    >
      <template #prefix>
        <el-icon class="el-input__icon"
          ><search color="rgb(96, 98, 102)"
        /></el-icon>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { Search } from "@element-plus/icons-vue";
import { reactive } from "@vue/reactivity";
import { ClickOutside as vClickOutside } from "element-plus";

const data = reactive({
  input: "",
  inputWidth: 20,
});

function LoseFocus() {
  data.inputWidth = 20;
}
</script>

<style lang="less">
.geo-search {
  .el-input {
    input {
      width: var(--input-width) !important;
      border-radius: 15px;
      padding-left: 30px !important;
      padding-right: 10px !important;
      transition: 0.3s;
    }
  }
}
</style>
