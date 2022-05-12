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
      <template
        v-for="(tweaker, index) in data.tweakers"
        :key="tweaker + index"
      >
        <div class="tweaker">
          <el-button
            type="danger"
            :icon="Close"
            circle
            size="small"
            @click="CloseTweaker(tweaker)"
          />

          <weight-triangle
            v-if="tweaker.type === 'tri'"
            :criterias="tweaker.data"
            @close="CloseTweaker(tweaker)"
          ></weight-triangle>
          <weight-slider
            v-if="tweaker.type === 'sli'"
            :top-criterias="tweaker.data.top"
            :bottom-criterias="tweaker.data.bottom"
            @close="CloseTweaker(tweaker)"
          ></weight-slider>
        </div>
      </template>

      <div class="add-button">
        <div class="icon-frame">
          <circle-plus style="width: 50px; position: relative; color: grey" />
        </div>

        <div class="preview-frame">
          <el-popover
            placement="left"
            effect="customized"
            :width="320"
            :hide-after="50"
            popper-class="popper"
            trigger="hover"
          >
            <template #reference>
              <div class="preview-top">
                <div>
                  <el-image src="/empty_slider.png" fit="contain" />
                </div>
              </div>
            </template>

            <div class="choice-text">Select Criterias at Top:</div>
            <div class="choice-group">
              <el-checkbox-group
                :min="1"
                class="enabled"
                v-model="data.using_top"
                text-color="black"
                fill="white"
              >
                <div
                  v-for="d in top_enabled"
                  :key="d.name"
                  class="enabled-name"
                  :style="{ '--strip-color': d.color }"
                >
                  <el-checkbox :label="d.name"> </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>

            <div class="choice-text">Select Criterias at Bottom:</div>
            <div class="choice-group">
              <el-checkbox-group
                :min="1"
                class="enabled"
                v-model="data.using_bottom"
                text-color="black"
                fill="white"
              >
                <div
                  v-for="d in bottom_enabled"
                  :key="d.name"
                  class="enabled-name"
                  :style="{ '--strip-color': d.color }"
                >
                  <el-checkbox :label="d.name"> </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>

            <el-row justify="end">
              <el-button
                type="primary"
                :disabled="data.using_bottom < 1 || data.using_top < 1"
                @click="ApplySlider"
                >Apply</el-button
              >
            </el-row>
          </el-popover>

          <el-popover
            placement="left"
            :width="320"
            :hide-after="100"
            trigger="hover"
            popper-class="popper"
            effect="customized"
          >
            <template #reference>
              <div class="preview-bottom">
                <div>
                  <el-image src="/empty_triangle.png" fit="contain" />
                </div>
              </div>
            </template>

            <div class="choice-text">Select 3 Criterias:</div>
            <div class="choice-group">
              <el-checkbox-group
                :max="3"
                class="enabled"
                v-model="data.using_tri"
                text-color="black"
                fill="white"
              >
                <div
                  v-for="d in enabled"
                  :key="d.name"
                  class="enabled-name"
                  :style="{ '--strip-color': d.color }"
                >
                  <el-checkbox :label="d.name"> </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>

            <el-row justify="end">
              <el-button
                type="primary"
                :disabled="data.using_tri.length < 3"
                @click="ApplyTriangle"
                >Apply</el-button
              >
            </el-row>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import WeightSlider from "./WeightSlider.vue";
import WeightTriangle from "./WeightTriangle.vue";
import { useStore } from "../store/weight";
import { reactive, toRaw } from "@vue/reactivity";
import { computed, onMounted, watch } from "@vue/runtime-core";
import { CirclePlus, Close } from "@element-plus/icons-vue";
import { useRankStore } from "../store/rank";

const disabled = computed(() => store.criterias.filter((d) => !d.enabled));
const enabled = computed(() => {
  data.using_tri = [];
  data.using_top = [];
  data.using_bottom = [];
  return store.criterias.filter((d) => d.enabled);
});
const rank_store = useRankStore();

function CloseTweaker(tweaker) {
  data.tweakers = data.tweakers.filter((d) => d != tweaker);
  // data.tweakers.splice(index, 1);
}

function ApplySlider() {
  data.tweakers.push({
    type: "sli",
    data: { top: data.using_top, bottom: data.using_bottom },
  });
  data.using_top = [];
  data.using_bottom = [];
}

function ApplyTriangle() {
  data.tweakers.push({ type: "tri", data: data.using_tri });
  data.using_tri = [];
}

const top_enabled = computed(() =>
  enabled.value.filter(
    (d) => data.using_bottom.find((d2) => d2 === d.name) === undefined
  )
);

const bottom_enabled = computed(() =>
  enabled.value.filter(
    (d) => data.using_top.find((d2) => d2 === d.name) === undefined
  )
);

const store = useStore();

const data = reactive({
  using_tri: [],

  using_top: [],
  using_bottom: [],

  tweakers: [
    {
      type: "sli",
      data: {
        top: ["area"],
        bottom: ["unit_price", "direction"],
      },
    },
    {
      type: "tri",
      data: ["area", "unit_price", "deal_price"],
    },
  ],
});

function Root3(number) {
  return Math.sqrt(3) * number;
}
</script>

<style lang="less" scoped>
.weight-lifter {
  height: 100%;
  width: 40%;
  background-color: rgb(255, 255, 255);
}

.sliders-container {
  position: relative;
  padding-left: 20px;
  width: 100%;
  overflow: scroll;
  display: flex;
}
.reserved-criteria {
  display: flex;
  width: 102%;
  overflow: scroll;
  background-color: rgb(255, 255, 255);

  .disabled {
    display: flex;
    justify-content: space-around;
    transition: 0.5s;
    user-select: none;
    height: 25px;
    padding-left: 10px;
    padding-right: 10px;
    margin: 0px 5px 5px 5px;
    border-radius: 5px;
    color: white;
    // background: linear-gradient(0deg, rgb(220, 220, 220), rgb(240, 240, 240));
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
.choice-text {
  margin: 15px 5px 8px 5px;
}
.choice-group {
  pointer-events: all;
  margin-top: 5px;
  margin-bottom: 10px;
  .enabled {
    display: flex;
    flex-wrap: wrap;
    // justify-content: end;
    filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
    .enabled-name {
      border-radius: 5px;
      padding: 0px 10px 0px 5px;
      margin: 5px;
      font-size: 4px;
      background-color: var(--strip-color);
    }
    .el-button {
      margin-top: 10px;
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
  top: 2vh;
  padding: 0 20px 0 20px;
  margin-left: 40px;
  margin-right: 40px;
  border-radius: 10px;
  margin-bottom: 3vh;
  height: 31.8vh;
  width: 100px;
  opacity: 0.8;
  // background-color: whitesmoke;
  background: linear-gradient(-2deg, rgb(230, 230, 230), rgb(255, 255, 255));
  border: dashed #808080 2px;
  cursor: pointer;
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.8));
  .preview-frame {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 7px;
  }

  .preview-top {
    top: 0%;
    left: 0;
    position: absolute;
    width: 100%;
    height: 50%;
    z-index: 12;

    transition: 0.5s;
    transition-delay: 0.2s;
    opacity: 0;

    border-radius: 7px;
    div {
      opacity: 0;
      position: relative;
      pointer-events: none;
      height: 16vh;
      top: 0;
      transition: 0.5s;
    }
    .el-image {
      width: 100%;
    }

    &:hover {
      div {
        opacity: 1;
        height: 33vh;
        background-color: white;
      }
    }
  }
  .preview-bottom {
    top: 50%;
    position: relative;
    width: 100%;
    height: 50%;
    z-index: 10;
    transition: 0.5s;
    transition-delay: 0.2s;
    opacity: 0;
    .el-image {
      margin-top: 16vh;
      width: 100%;
    }
    div {
      opacity: 0;
      height: 16vh;
      position: relative;
      top: 0;
      transition: 0.5s;
    }

    &:hover {
      div {
        opacity: 1;
        height: 33vh;
        top: -16vh;
        background-color: white;
      }
    }
  }

  .icon-frame {
    position: relative;
    top: 13vh;
    transition: 0.5s;
    width: 100px;
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
.tweaker {
  height: 32vh;
  padding: 1vh;
  margin: 10px;
  position: relative;

  .el-button {
    position: absolute;
    opacity: 0;
    filter: drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.3));
    top: 5px;
    right: 5px;
    transition-duration: 0.5s;
  }
  &:hover {
    .el-button {
      opacity: 1;
    }
  }

  filter: drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.3));
  transition: 0.5s;
  border-radius: 7px;
  background-color: whitesmoke;
  transform: scale(0.95, 0.95);
  &:hover {
    background-color: rgb(255, 255, 255);
    transform: scale(1, 1);
  }
}
</style>
