<template>
  <div class="void-selection" v-if="props.houses.length === 0">
    No Selected House
  </div>
  <TransitionGroup tag="div" name="list-complete" v-infinite-scroll="load">
    <div
      class="select-item"
      v-for="i in list_count"
      :key="props.houses[i].block"
      title="Double Click to see where it is!"
      @dblclick="GotoBlock(props.houses[i].block)"
    >
      <!-- <el-button type="danger" :icon="Close" circle size="small" /> -->
      <div class="delete-button" @click="CloseItem(props.houses[i].block)">
        <el-icon><CircleCloseFilled /></el-icon>
      </div>
      {{ props.houses[i].block }}

      <div class="compared-frame">
        <span
          class="compared-price"
          style="background-color: rgb(216, 151, 83); right: 15px"
          >{{ props.houses[i].sub_region }}</span
        >
        <span
          class="compared-price"
          style="background-color: rgb(195, 102, 98); right: 80px"
          >{{ props.houses[i].region }}</span
        >
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { emitter } from "../store/bus";
import { CircleCloseFilled } from "@element-plus/icons-vue";
import { reactive, ref } from "@vue/reactivity";
import { computed, watch } from "@vue/runtime-core";

const props = defineProps({
  houses: {
    type: Array,
    default: [],
  },
});

const data = reactive({
  count: 20,
});

function load() {
  if (props.houses.length - 1 > data.count) {
    data.count += 5;
  }
}

watch(
  () => props.houses.length,
  () => (data.count = 20)
);

const list_count = computed({
  set() {},
  get() {
    if (props.houses.length - 1 <= 0) {
      return 0;
    }
    return props.houses.length < data.count + 1
      ? props.houses.length - 1
      : data.count;
  },
});

const emits = defineEmits(["delete"]);

function GotoBlock(name) {
  emitter.emit("goto-block", name);
}
function CloseItem(name) {
  emits("delete", name);
}
</script>

<style lang="less" scoped>
.void-selection {
  font-size: 20px;
  font-weight: bold;
  color: grey;
  position: relative;
  top: 40%;
  animation: voidTextEnter 1s;
}

.compared-frame {
  display: flex;
  justify-content: space-between;
  position: absolute;
  // width: 100px;
  right: 10px;
}

.compared-price {
  // position: absolute;
  border-radius: 3px;
  padding: 2px 10px 2px 10px;
  height: 16px;
  margin-left: 4px;
  margin-right: 4px;
  color: white;
  font-weight: 600;
}

.select-item {
  position: relative;
  background-color: whitesmoke;
  border-radius: 5px;
  display: flex;
  margin: 10px 5px 12px 12px;
  padding: 7.5px 5px 7.5px 5px;
  font-size: 12px;
  transition: 0.5s;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
  cursor: pointer;

  &:hover {
    background-color: white;
  }
}

.list-complete-enter-from, .list-complete-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  transform: translateY(100%);
  opacity: 0;
}

.list-complete-leave-from {
  transform: translateY(0);
}

.list-complete-leave-active {
  position: relative;
}

.delete-button {
  padding: 2px;
  margin: 0px 5px 0px 5px;
  color: #eb6e6f;
  transition: 0.5s;
  border-radius: 3px;
  transform: scale(1.2, 1.2);

  &:hover {
    color: #f0999a;
    transform: scale(1.5, 1.5);
  }
}
</style>
