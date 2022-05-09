<template>
  <div class="map-nominal">
    <transition-group name="flip-list" tag="div">
      <div
        class="slider-block"
        v-for="(d, index) in data.mapping_data"
        :key="d.name"
      >
        <span class="nominal-rank">{{ index + 1 }}</span>
        <span class="nominal-name">{{ d.name }}</span>
        <span class="good">Good</span>
        <el-slider
          :min="0"
          :max="1"
          :step="0.01"
          v-model="d.value"
          @change="ReSort"
        />
        <span class="bad">Bad</span>
        <!-- </div> -->
      </div>
    </transition-group>

    <div style="display: flex; justify-content: end">
      <el-button @click="Cancel">Cancel</el-button>
      <el-button @click="Confirm" type="primary">Apply</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";

const props = defineProps({
  nominal_data: {
    type: Array,
    require: true,
  },
  attr: {
    type: String,
    require: true,
  }
});

watch(
  () => props.nominal_data,
  (val) => {
    data.mapping_data = val
    ReSort()
  }
)
watch(
  () => props.attr,
  (val) => {
    data.mapping_attr = val
  }
)

const data = reactive({
  mapping_attr: props.attr,
  mapping_data: props.nominal_data,
});

function ReSort() {
  data.mapping_data = data.mapping_data.sort((a, b) => a.value - b.value);
}

const emits = defineEmits(["cancel", "confirm"]);

function Cancel() {
  emits("cancel");
}

function Confirm() {
  let transmit_data = new Map
  data.mapping_data.forEach((d) => {
    transmit_data.set(d.name, d.value)
  })
  emits("confirm", transmit_data, data.mapping_attr);
}
</script>

<style lang="less" scoped>
.slider-block {
  background-color: whitesmoke;
  display: flex;
  margin-bottom: 20px;
  margin-right: 5px;
  margin-left: 5px;
  padding: 10px;
  border-radius: 5px;
  position: relative;
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.4));
  .el-slider {
    margin-top: 0;
    margin-left: 20px;
  }
}

.nominal-name {
  width: 5%;
  user-select: none;
  font-size: 14px;
  line-height: 44px;
  margin-left: 10px;
  margin-right: 10px;
  white-space: nowrap;
}

.flip-list-move {
  transition: transform 0.5s;
}

.map-nominal {
  div {
    :first-child {
      // color: aqua;
      .nominal-rank {
        background-color: rgb(175, 49, 37);
        color: white;
        font-weight: 900;
      }
    }

    :nth-child(2) {
      .nominal-rank {
        background-color: rgb(228, 147, 68);
        color: white;
        font-weight: 700;
      }
    }

    :nth-child(3) {
      .nominal-rank {
        background-color: rgb(84, 123, 192);
        color: white;
      }
    }
  }
}
.good {
  position: absolute;
  top: 60%;
  left: 15%;
}
.bad {
  position: absolute;
  top: 60%;
  right: 15px;
}
.nominal-rank {
  user-select: none;
  font-size: 14px;
  background-color: grey;
  border-radius: 5px;
  margin: 2px;
  width: 20px;
  height: 20px;
  padding: 10px;
}
</style>