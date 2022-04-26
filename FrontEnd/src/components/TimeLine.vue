<template>
  <div class="timeline">
    <div class="timeline-runway">
      <div
        class="time-scale"
        @scroll="MoveTimeScale"
        @dblclick="TranslateSlider"
      >
        <div class="year" v-for="year in data.time_series" :key="year.year">
          <template
            v-for="(month, index) in year.month"
            :key="month.toString() + year.toString()"
          >
            <el-tooltip
              :content="MapMonth(month)"
              :popper-options="{
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 0],
                    },
                  },
                ],
              }"
              placement="top"
              effect="customized"
              :hide-after="0"
              popper-class="popper"
              :disabled="data.curor_tooltip_visibility"
            >
              <div v-if="index != 0" class="month">
                <div class="month-scale"></div>
              </div>
              <div v-else class="month">
                <div class="first-month-scale">
                  <span class="year-text">
                    {{ year.year }}
                  </span>
                </div>
              </div>
            </el-tooltip>
          </template>
        </div>
      </div>
      <slider-cursor
        @pointerdown="PressCursor"
        :style="{ left: `${slider}px` }"
        :press="data.slider_pressed"
        :color="data.slider_color"
      >
      </slider-cursor>

      <!-- Tooltip when moving the slider cursor -->
      <el-tooltip
        :content="MapMonth(TimeLineMonth) + TimeLineYear"
        placement="top"
        effect="customized"
        popper-class="popper"
        :visible="data.curor_tooltip_visibility"
        :virtual-ref="data.tooltip_ref"
        virtual-triggering
      >
      </el-tooltip>
    </div>
    <div class="timeline-label">Time Line</div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  watch,
} from "@vue/runtime-core";
import SliderCursor from "./TimeLine/SliderCursor.vue";
import { MapMonth } from "./TimeLine/date";

/*
    todo:
        1. drag time line
        2. multiple cursor support
*/

const emits = defineEmits(["changeCurrent"]);
const data = reactive({
  time_series: [],
  scroll_position: 0,
  slider_position: 0,
  slider_pressed: false,
  slider_color: "rgb(200, 26, 10)",
  position: 0,
  runway_limit: [0, 1000],
  previous_year_month: null,
  curor_tooltip_visibility: false,
  tooltip_ref: null,
});

let slider_pointer_left_offset = 15;
let slider = computed({
  get() {
    let pos = data.position;
    pos = pos > data.runway_limit[1] ? data.runway_limit[1] : pos;
    pos = pos < data.runway_limit[0] ? data.runway_limit[0] : pos;
    data.position = pos;
    return data.position;
  },
  set(clientX) {
    let pos = clientX - slider_pointer_left_offset;
    pos = pos > data.runway_limit[1] ? data.runway_limit[1] : pos;
    pos = pos < data.runway_limit[0] ? data.runway_limit[0] : pos;
    data.position = pos;
  },
});

// Add Time Series before mounted
onBeforeMount(() => {
  for (let i = 2012; i <= 2020; i++) {
    let month = [];
    for (let j = 1; j <= 12; j++) {
      month.push(j);
    }
    data.time_series.push({ year: i, month: month });
  }
});

// some default configuration
onMounted(() => {
  // modify slider right limit
  data.runway_limit[1] = slider.value =
    document.getElementsByClassName("time-scale")[0].clientWidth -
    slider_pointer_left_offset;
  window.addEventListener("resize", function (e) {
    data.runway_limit[1] = slider.value =
      document.getElementsByClassName("time-scale")[0].clientWidth -
      slider_pointer_left_offset;
  });

  // move slider to right most
  slider.value = 100000000;
  // scroll timeline to right most
  document.getElementsByClassName("time-scale")[0].scrollTo(1000000, 0);
});

let slider_move_timeout = null;
function MoveSlider(e) {
  if (data.slider_pressed) {
    if (slider_move_timeout == null) {
      slider_move_timeout = setTimeout(() => {
        slider_move_timeout = null;
        slider.value = e.clientX;
        // really wried, since the tooltip only moves when select a new getBoundingClientRect
        data.tooltip_ref = {
          getBoundingClientRect() {
            return document
              .getElementsByClassName("button-frame")[0]
              .getBoundingClientRect();
          },
        };
      }, 10);
    }
  }
}

function TranslateSlider(e) {
  slider.value = e.clientX;
}

function MoveTimeScale(e) {
  data.scroll_position = document
    .getElementsByClassName("time-scale")
    .item(0).scrollLeft;
}

function PressCursor() {
  data.slider_pressed = true;
  data.slider_color = "rgb(255, 50, 20)";
  window.addEventListener("mousemove", MoveSlider);
  window.addEventListener("mouseup", ReleaseCursor);
  data.curor_tooltip_visibility = true;
}
function ReleaseCursor() {
  data.slider_pressed = false;
  data.slider_color = "rgb(200, 26, 10)";
  window.removeEventListener("mousemove", MoveSlider);
  window.removeEventListener("mouseup", ReleaseCursor);
  data.curor_tooltip_visibility = false;
}

const TimeLineMonth = computed(() => {
  try {
    let scale_length = data.scroll_position + slider.value;
    let year_width = document
      .getElementsByClassName("year")
      .item(0).clientWidth;
    let year_index = Math.floor(scale_length / year_width);

    let month_width = document
      .getElementsByClassName("month")
      .item(0).clientWidth;
    let month_index = Math.floor((scale_length % year_width) / month_width);

    return data.time_series[year_index].month[month_index];
  } catch (error) {
    return NaN;
  }
});

const TimeLineYear = computed(() => {
  try {
    let scale_length = data.scroll_position + slider.value;
    let year_width = document
      .getElementsByClassName("year")
      .item(0).clientWidth;
    let year_index = Math.floor(scale_length / year_width);

    return data.time_series[year_index].year;
  } catch (error) {
    return NaN;
  }
});

// emit change events to parent
watch(
  () => TimeLineMonth.value,
  (new_val) => {
    emits("changeCurrent", { year: TimeLineYear.value, month: new_val });
  }
);
</script>

<style lang="less">
.timeline {
  height: 7vh;
  width: 100%;
  margin-bottom: 0px;
  position: relative;
  user-select: none;
}

.timeline-runway {
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
  position: absolute;
  height: 50%;
  min-height: 32px;
  top: 40%;
  width: 99.8%;
  background: linear-gradient(0deg, rgb(230, 230, 230), whitesmoke);
  overflow-y: visible;
  border: solid gray 1px;
  border-radius: 10px;

  ::-webkit-scrollbar {
    display: none;
  }
}

.month {
  display: inline-block;
  height: 100%;
  position: relative;
  width: 23px;
  cursor: pointer;

  &:hover {
    .month-scale {
      height: 70%;
      width: 4px;
    }
  }
}

.month-scale {
  position: absolute;
  display: inline-block;
  height: 40%;
  width: 2.5px;
  left: 0;
  bottom: -3%;
  background-color: rgb(128, 128, 128);
  transition: 0.3s;
  border: solid 0.5px rgb(255, 255, 255);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  filter: drop-shadow(0px 0px 0.5px rgba(0, 0, 0, 0.5));
}

.first-month-scale {
  position: absolute;
  display: inline-block;
  height: 83%;
  width: 3px;
  left: 0;
  bottom: -3%;
  transition: 0.3s;
  background-color: rgb(128, 128, 128);
  border: solid 0.5px rgb(255, 255, 255);
  border-top-left-radius: 1.5px;
  border-top-right-radius: 1.5px;
  filter: drop-shadow(0px 0px 0.5px rgba(0, 0, 0, 0.5));
}

.year {
  position: relative;
  display: inline-block;
  height: 100%;

  &:hover {
    background-color: whitesmoke;

    .first-month-scale {
      transform: scale(1.2, 1.2) translateY(-5%);
    }
  }
}

.year-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgba(70, 70, 70, 0.5);
  font-weight: bolder;
  transform: scale(0.8, 0.8);
  font-size: 10px;
  user-select: none;
  margin-top: -1px;
}

.time-scale {
  height: 100%;
  width: 100%;
  white-space: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  border-radius: 10px;
}

.popper {
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.3));
}

.el-popper.is-customized {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  pointer-events: none;
  background: linear-gradient(90deg, rgb(230, 230, 230), rgb(255, 255, 255));

  span {
    user-select: none;
  }
}

.el-popper.is-customized .el-popper__arrow::before {
  background: linear-gradient(45deg, rgb(240, 240, 240), #ffffff);
  right: 0;
}

.timeline-label {
  position: absolute;
  top: 8%;
  color: gray;
  font-weight: bolder;
  font-size: 1.5vh;
  left: 1vw;
}
</style>