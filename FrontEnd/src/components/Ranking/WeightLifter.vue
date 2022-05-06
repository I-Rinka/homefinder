<template>
  <div class="weight-lifter">
    <div class="reserved-criteria">
      <div
        style="
          font-size: 10px;
          padding: 2px 10px 2px 10px;
          color: grey;
          font-weight: bold;
        "
      >
        Disabled Criterias
      </div>
      <div class="disabled" v-for="d in disabled" :key="d.name">
        <el-checkbox style="z-index: -0" v-model="d.enabled"></el-checkbox>
        <span class="disabled-name">
          {{ d.name }}
        </span>
      </div>
    </div>
    <div class="sliders-container">
      <!-- <weight-slider
        :top-criterias="['area']"
        :bottom-criterias="['unit_price', 'direction']"
      ></weight-slider> -->
      <weight-slider
        :top-criterias="['area']"
        :bottom-criterias="['unit_price', 'direction']"
      ></weight-slider>
      <weight-triangle
        :criterias="['area', 'unit_price', 'deal_price']"
      ></weight-triangle>
      <weight-triangle
        :criterias="['area', 'unit_price', 'deal_price']"
      ></weight-triangle>
      <!-- <weight-slider
        :top-criterias="['room', 'hall']"
        :bottom-criterias="['position', 'block_height']"
      ></weight-slider>
      <weight-slider
        :top-criterias="['type', 'decoration', 'area']"
        :bottom-criterias="['built_year']"
      ></weight-slider> -->
      <div class="add-button">
        <div class="preview-top"></div>
        <div class="preview-bottom"></div>
        <div class="icon-frame">
          <circle-plus style="width: 50px; position: relative; color: grey" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import WeightSlider from "./WeightSlider.vue";
import WeightTriangle from "./WeightTriangle.vue";
import { useStore } from "../store/weight";
import { reactive } from "@vue/reactivity";
import { computed, onMounted } from "@vue/runtime-core";
import { CirclePlus } from "@element-plus/icons-vue";

const disabled = computed(() => store.criterias.filter((d) => !d.enabled));

const store = useStore();
</script>

<style lang="less" scoped>
.weight-lifter {
  height: 100%;
  width: 40%;
  background-color: rgb(255, 255, 255);

  // background-image: url("http://localhost:3000/weighlifter.jpg");
  // background-size: contain;
}

.sliders-container {
  position: relative;
  padding-top: 20px;
  padding-bottom: 20px;
  width: 100%;
  overflow: scroll;
  display: flex;
}
.reserved-criteria {
  display: flex;
  width: 100%;
  overflow: scroll;
  background-color: rgb(255, 255, 255);

  .disabled {
    display: flex;
    justify-content: space-around;
    padding: 2px 10px 0px 10px;
    transition: 0.5s;
    margin: 0px 5px 5px 5px;
    border-radius: 5px;
    color: white;
    background: linear-gradient(0deg, rgb(220, 220, 220), rgb(240, 240, 240));
    border: solid gray 1px;
    animation: enter 0.5s;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
    .el-checkbox {
      margin-top: -3px;
    }
    .disabled-name {
      margin-left: 5px;
      padding: 5px 3px 0px 3px;
      font-weight: 500;
      font-size: 10px;
      color: grey;
      filter: drop-shadow(0px 0px 0.5px rgba(0, 0, 0, 0.5));
    }
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

.add-button {
  position: relative;
  padding: 0 20px 0 20px;
  margin-left: 20px;
  margin-right: 20px;
  display: inline-block;
  border-radius: 10px;
  height: 32vh;
  opacity: 0.8;
  background: linear-gradient(-2deg, rgb(220, 220, 220), rgb(240, 240, 240));
  border: dashed #808080 2px;
  cursor: pointer;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.8));

  .preview-top {
    top: 0%;
    left: 0;
    position: absolute;
    background-color: aqua;
    width: 100%;
    height: 50%;
    z-index: 10;

    transition: 0.5s;
    transition-delay: 0.2s;
    opacity: 0;
  }
  .preview-bottom {
    top: 50%;
    left: 0;
    position: absolute;
    background-color: aquamarine;
    width: 100%;
    height: 50%;
    z-index: 10;

    transition: 0.5s;
    transition-delay: 0.2s;
    opacity: 0;
  }

  .icon-frame {
    position: relative;
    top: 13vh;
    transition: 0.5s;
    width: 80px;
  }

  &:hover {
    .icon-frame {
      transform: scale(1.2, 1.2);
    }

    .preview-top {
      opacity: 1;
    }

    .preview-bottom {
      opacity: 1;
    }
  }
}
</style>
