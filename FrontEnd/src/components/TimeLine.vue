<template>
  <div class="timeline">
    <el-row class="timeline-label" justify="space-between">
      <el-col :span="4">
        <div style="position: relative; left: 10px">Time Line</div>
      </el-col>
      <el-col
        :span="6"
        style="
          position: relative;
          font-size: 1.2vh;
          bottom: 0.5vh;
          right: 1vh;
          text-align: right;
        "
      >
        <div
          style="
            display: inline;
            padding-right: 5vh;
            cursor: pointer;
            pointer-events: all;
          "
          @click="AddSubtractor"
        >
          <div style="display: inline-block; position: relative; top: 0.5vh">
            Baseline
          </div>
          <div
            style="
              position: relative;
              z-index: 10;
              left: 0.5vh;
              top: 0.6vh;
              display: inline-block;
              background-color: rgb(82, 124, 197);
              height: 1.2vh;
              width: 1.2vh;
              border-radius: 1vh;
            "
          ></div>
        </div>
        <div style="display: inline; position: relative; padding-right: 2vh">
          <div style="display: inline-block; position: relative; top: 0.5vh">
            Current
          </div>
          <div
            style="
              position: relative;
              left: 0.5vh;
              top: 0.6vh;
              display: inline-block;
              background-color: rgb(191, 32, 25);
              height: 1.2vh;
              width: 1.2vh;
              border-radius: 1vh;
            "
          ></div>
        </div>
      </el-col>
    </el-row>
    <div class="timeline-runway">
      <div
        class="time-scale"
        @dblclick="TranslateRedSlider"
        @pointerleave="UnRegShiftKey"
      >
        <div
          class="year"
          @pointerdown="PressTimeScale"
          v-for="year in data.time_series"
          :key="year.year"
        >
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
              :disabled="!data.timescale_tooltip_visibility"
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
        <div class="sliders-frame">
          <slider-cursor
            @pointerdown="PressCursor"
            @pointerover="
              () => {
                RegShiftKey();
                ChangeCursor(data.slider1);
              }
            "
            :style="{
              left: `${data.slider1.position}px`,
              cursor: data.multicursor.pressing_shiftkey
                ? 'col-resize'
                : '-webkit-grabbing',
            }"
            style="pointer-events: all; position: absolute"
            :pressed="data.slider1.pressed"
            :color="data.slider1.color"
            :closable="false"
          >
          </slider-cursor>
          <slider-cursor
            v-if="data.multicursor.select_mode"
            @pointerdown="PressCursor"
            @pointerover="
              () => {
                RegShiftKey();
                ChangeCursor(data.slider1_l);
              }
            "
            :style="{
              left: `${data.slider1_l.position}px`,
              cursor: data.multicursor.pressing_shiftkey
                ? 'col-resize'
                : '-webkit-grabbing',
            }"
            style="pointer-events: all; position: absolute"
            :pressed="data.slider1_l.pressed"
            :color="data.slider1_l.color"
            @close="data.multicursor.select_mode = false"
          >
          </slider-cursor>
          <!-- red frame -->
          <div
            v-if="data.multicursor.select_mode"
            style="
              position: absolute;
              pointer-events: all;
              top: 0px;
              opacity: 0.2;
              cursor: -webkit-grabbing;
            "
            :style="{
              backgroundColor: slider_stuff.GetColor(
                data.slider1,
                data.slider1_l
              ),
              width: `${slider_stuff.GetWidth(data.slider1, data.slider1_l)}px`,
              height: '100%',
              left: `${
                slider_stuff.GetLeft(data.slider1, data.slider1_l) + 6
              }px`,
            }"
            @pointerdown="(e) => PressSliders(e, data.slider1, data.slider1_l)"
          ></div>

          <!-- Subtractor cursor -->
          <slider-cursor
            v-if="data.multicursor.subtractor_mode"
            @pointerdown="PressCursor"
            @pointerover="
              () => {
                RegShiftKey();
                ChangeCursor(data.slider2);
              }
            "
            :style="{
              left: `${data.slider2.position}px`,
              cursor: data.multicursor.pressing_shiftkey
                ? 'col-resize'
                : '-webkit-grabbing',
            }"
            style="pointer-events: all; position: absolute"
            :pressed="data.slider2.pressed"
            :closable="!data.multicursor.select_mode"
            :color="data.slider2.color"
            @close="RemoveSubtractor"
          >
          </slider-cursor>
          <slider-cursor
            v-if="
              data.multicursor.select_mode && data.multicursor.subtractor_mode
            "
            @pointerdown="PressCursor"
            @pointerover="
              () => {
                RegShiftKey();
                ChangeCursor(data.slider2_l);
              }
            "
            :style="{
              left: `${data.slider2_l.position}px`,
              cursor: data.multicursor.pressing_shiftkey
                ? 'col-resize'
                : '-webkit-grabbing',
            }"
            style="pointer-events: all; position: absolute"
            :pressed="data.slider2_l.pressed"
            :color="data.slider2_l.color"
            @close="RemoveSubtractor"
          >
          </slider-cursor>
          <!-- blue frame -->
          <div
            v-if="
              data.multicursor.select_mode && data.multicursor.subtractor_mode
            "
            style="
              position: absolute;
              top: 0px;
              opacity: 0.2;
              pointer-events: all;
              cursor: -webkit-grabbing;
            "
            :style="{
              backgroundColor: slider_stuff.GetColor(
                data.slider2,
                data.slider2_l
              ),
              width: `${slider_stuff.GetWidth(data.slider2, data.slider2_l)}px`,
              height: '100%',
              left: `${
                slider_stuff.GetLeft(data.slider2, data.slider2_l) + 6
              }px`,
            }"
            @pointerdown="(e) => PressSliders(e, data.slider2, data.slider2_l)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Tooltip when moving the slider cursor -->
    <el-tooltip
      :content="MapMonth(TimeLineMonth()) + TimeLineYear()"
      placement="top"
      effect="customized"
      popper-class="popper-instant"
      :visible="data.curor_tooltip_visibility"
      :virtual-ref="data.tooltip_ref"
      virtual-triggering
    >
    </el-tooltip>
  </div>
</template>

<script setup>
// todo: corner auto scroll

import {
  computed,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  toRaw,
  watch,
} from "@vue/runtime-core";
import SliderCursor from "./TimeLine/SliderCursor.vue";
import { MapMonth } from "./TimeLine/date";
import { config } from "../config";

const emits = defineEmits([
  "changeCurrentTime", // single cursor move
  "changeSubtractor", // two cursor move
  "changeSelection", // selection move
  "changeSubtractorSelection", // 4 cursors move
  "changeSubtractorMode",
  "changeSelectMode",
]);

const slider_pointer_left_offset = 15;
function GetRightLimit() {
  let dom = document.getElementsByClassName("year");
  return (
    dom[0].getBoundingClientRect().width * dom.length -
    slider_pointer_left_offset
  );
}

class Slider {
  constructor(color, pressed_color) {
    this.pressed = ref(false);
    this.color = computed(() => (!this.pressed.value ? color : pressed_color));
    this.position = ref(0);
    this.SetPosition = (clientX, is_relative) => {
      let pos =
        clientX +
        (!is_relative
          ? TIME_SCALE_DOM.scrollLeft - slider_pointer_left_offset
          : 0);

      let r_limit = GetRightLimit();

      pos = pos > r_limit ? r_limit : pos;
      pos = pos < 0 ? 0 : pos;

      if (data.multicursor.select_mode && data.multicursor.subtractor_mode) {
        // not move situation:
        // 1. move left while some left cursor reach left limit
        // 2. move right while some right cusor reach right limit
        let vary = pos - this.position.value; // positive is moving left
        let l_1, r_1;
        if (data.slider1.position < data.slider1_l.position) {
          l_1 = data.slider1;
          r_1 = data.slider1_l;
        } else {
          l_1 = data.slider1_l;
          r_1 = data.slider1;
        }

        let l_2, r_2;
        if (data.slider2.position < data.slider2_l.position) {
          l_2 = data.slider2;
          r_2 = data.slider2_l;
        } else {
          l_2 = data.slider2_l;
          r_2 = data.slider2;
        }

        if (this === toRaw(data.slider1) || this === toRaw(data.slider1_l)) {
          // right
          if (vary > 0 && this === toRaw(r_1)) {
            let new_width = pos - l_1.position;
            if (l_2.position + new_width < r_limit) {
              this.position.value = pos;
            } else {
              this.position.value = l_1.position + r_limit - l_2.position;
            }
            // left
          } else if (vary < 0 && this === toRaw(l_1)) {
            let new_width = r_1.position - pos;
            if (r_2.position - new_width > 0) {
              this.position.value = pos;
            } else {
              this.position.value = r_1.position - r_2.position;
            }
          } else {
            this.position.value = pos;
          }
        } else if (
          this === toRaw(data.slider2) ||
          this === toRaw(data.slider2_l)
        ) {
          // right
          if (vary > 0 && this === toRaw(r_2)) {
            let new_width = pos - l_2.position;
            if (l_1.position + new_width < r_limit) {
              this.position.value = pos;
            } else {
              this.position.value = l_2.position + r_limit - l_1.position;
            }
            // left
          } else if (vary < 0 && this === toRaw(l_2)) {
            let new_width = r_2.position - pos;
            if (r_1.position - new_width > 0) {
              this.position.value = pos;
            } else {
              this.position.value = r_2.position - r_1.position;
            }
          } else {
            this.position.value = pos;
          }
        }
      } else {
        this.position.value = pos;
      }
    };
    this.GetMonth = () => {
      try {
        let scale_length = this.position.value;
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
    };
    this.GetYear = () => {
      try {
        let scale_length = this.position.value;
        let year_width = document
          .getElementsByClassName("year")
          .item(0).clientWidth;
        let year_index = Math.floor(scale_length / year_width);

        return data.time_series[year_index].year;
      } catch (error) {
        return NaN;
      }
    };
  }
}

function GetLRSliders() {
  let l_1, r_1;
  if (data.slider1.position < data.slider1_l.position) {
    l_1 = data.slider1;
    r_1 = data.slider1_l;
  } else {
    l_1 = data.slider1_l;
    r_1 = data.slider1;
  }

  let l_2, r_2;
  if (data.slider2.position < data.slider2_l.position) {
    l_2 = data.slider2;
    r_2 = data.slider2_l;
  } else {
    l_2 = data.slider2_l;
    r_2 = data.slider2;
  }

  return [l_1, r_1, l_2, r_2];
}

function HandlerTimeEvents_realtime() {
  if (!data.multicursor.select_mode && !data.multicursor.subtractor_mode) {
    emits("changeCurrentTime", {
      year: data.slider1.GetYear(),
      month: data.slider1.GetMonth(),
    });
  } else if (data.multicursor.subtractor_mode) {
    emits("changeSubtractor", [
      { year: data.slider1.GetYear(), month: data.slider1.GetMonth() },
      { year: data.slider2.GetYear(), month: data.slider2.GetMonth() },
    ]);
  }
}

function HandlerTimeEvents_slow() {
  let [l_1, r_1, l_2, r_2] = GetLRSliders();
  if (data.multicursor.select_mode && data.multicursor.subtractor_mode) {
    emits("changeSubtractorSelection", [
      [
        { year: l_1.GetYear(), month: l_1.GetMonth() },
        { year: r_1.GetYear(), month: r_1.GetMonth() },
      ],
      [
        { year: l_2.GetYear(), month: l_2.GetMonth() },
        { year: r_2.GetYear(), month: r_2.GetMonth() },
      ],
    ]);
  } else if (data.multicursor.select_mode) {
    emits("changeSelection", [
      { year: l_1.GetYear(), month: l_1.GetMonth() },
      { year: r_1.GetYear(), month: r_1.GetMonth() },
    ]);
  }
}

function SyncSliders() {
  if (data.multicursor.select_mode && data.multicursor.subtractor_mode) {
    // not move situation:
    // 1. move left while some left cursor reach left limit
    // 2. move right while some right cusor reach right limit

    let [l_1, r_1, l_2, r_2] = GetLRSliders();

    if (data.current_slider === r_1) {
      r_2.SetPosition(l_2.position + slider_stuff.GetWidth(l_1, r_1), true);
    } else if (data.current_slider === r_2) {
      r_1.SetPosition(l_1.position + slider_stuff.GetWidth(l_2, r_2), true);
    } else if (data.current_slider === l_1) {
      l_2.SetPosition(r_2.position - slider_stuff.GetWidth(l_1, r_1), true);
    } else if (data.current_slider === l_2) {
      l_1.SetPosition(r_1.position - slider_stuff.GetWidth(l_2, r_2), true);
    }
  }
}

const slider_stuff = {
  GetColor: (slider1, slider2) => {
    if (slider1.pressed || slider2.pressed) {
      if (slider1.pressed) {
        return slider1.color;
      } else {
        return slider2.color;
      }
    } else {
      return slider1.color;
    }
  },
  GetLeft: (slider1, slider2) =>
    slider1.position > slider2.position ? slider2.position : slider1.position,
  GetWidth: (slider1, slider2) => Math.abs(slider1.position - slider2.position),

  SliderPos2ClientX: (pos) => {
    return pos + slider_pointer_left_offset;
  },
};

const tooltip_position = ref({
  top: 0,
  bottom: 0,
  right: 0,
});

const data = reactive({
  time_series: [],
  runway_limit: [0, 1000],
  previous_year_month: null,
  curor_tooltip_visibility: false,
  timescale_tooltip_visibility: true,
  tooltip_ref: {
    getBoundingClientRect() {
      return tooltip_position.value;
    },
  },

  multicursor: {
    pressing_shiftkey: false,
    select_mode: false,
    subtractor_mode: false,
  },

  slider1: new Slider("rgb(200, 26, 10)", "rgb(255, 50, 20)"),
  slider1_l: new Slider("rgb(200, 26, 10)", "rgb(255, 50, 20)"),

  slider2: new Slider("rgb(84, 123, 192)", "rgb(90, 156, 248)"),
  slider2_l: new Slider("rgb(84, 123, 192)", "rgb(90, 156, 248)"),
  current_slider: null,
});
data.current_slider = data.slider1;

function TimeLineYear() {
  return data.current_slider.GetYear();
}

function TimeLineMonth() {
  return data.current_slider.GetMonth();
}

watch(
  () =>
    data.slider1.GetMonth() +
    data.slider1_l.GetMonth() +
    data.slider2.GetMonth() +
    data.slider2_l.GetMonth(),
  () => {
    HandlerTimeEvents_realtime();
  }
);

// only previous is not select mode the multi cursor would emit event
let previeous_select_mode = false;
// change select: after select OK / select mode === false
watch(
  () => data.multicursor.select_mode,
  (new_val) => {
    if (new_val === false) {
      HandlerTimeEvents_realtime();
      emits("changeSelectMode", new_val);
      previeous_select_mode = false;
    }
  }
);

watch(
  () => data.multicursor.subtractor_mode,
  (new_val) => {
    HandlerTimeEvents_realtime();
    emits("changeSubtractorMode", new_val);
  }
);

// Add Time Series before mounted
onBeforeMount(() => {
  for (let i = 2012; i <= config.timeRange[1].year; i++) {
    let month = [];
    for (let j = 1; j <= 12; j++) {
      month.push(j);
    }
    data.time_series.push({ year: i, month: month });
  }
});

// some default configuration
let TIME_SCALE_DOM = null;
onMounted(() => {
  TIME_SCALE_DOM = document.getElementsByClassName("time-scale").item(0);

  // modify slider right limit
  data.runway_limit[1] =
    TIME_SCALE_DOM.clientWidth - slider_pointer_left_offset;

  tooltip_position.value = document
    .getElementsByClassName("button-frame")[0]
    .getBoundingClientRect();

  window.addEventListener("resize", function (e) {
    data.runway_limit[1] =
      TIME_SCALE_DOM.clientWidth - slider_pointer_left_offset;

    tooltip_position.value = document
      .getElementsByClassName("button-frame")[0]
      .getBoundingClientRect();
  });

  // scroll timeline to right most
  TIME_SCALE_DOM.scrollTo(1000000, 0);

  // move slider to right most
  data.current_slider.SetPosition(1000000);
});

let slider_move_timeout = null;
function MoveSlider(e) {
  if (data.current_slider.pressed) {
    if (slider_move_timeout == null) {
      slider_move_timeout = setTimeout(() => {
        // Enter select mode
        if (
          data.multicursor.pressing_shiftkey &&
          !data.multicursor.select_mode
        ) {
          data.slider1_l.position = data.slider1.position;
          data.slider2_l.position = data.slider2.position;
          data.multicursor.select_mode = true;
        }

        slider_move_timeout = null;

        data.current_slider.SetPosition(e.clientX);

        SyncSliderTooltip();
        SyncSliders();
        // HandlerTimeEvents();
      }, 20);
    }
  }
}

async function SyncSliderTooltip() {
  tooltip_position.value = DOMRect.fromRect({
    width: 0,
    height: 0,
    x: data.current_slider.position - TIME_SCALE_DOM.scrollLeft + 15,
    y: tooltip_position.value.y,
  });
}

function ChangeCursor(cursor) {
  if (data.current_slider != cursor && !data.current_slider.pressed) {
    data.current_slider.pressed = false;
    data.current_slider = cursor;
  }
}

function PressCursor() {
  data.current_slider.pressed = true;
  window.addEventListener("mousemove", MoveSlider);
  window.addEventListener("mouseup", ReleaseCursor);
  data.timescale_tooltip_visibility = false;
  data.curor_tooltip_visibility = true;
}

function ReleaseCursor() {
  data.current_slider.pressed = false;
  window.removeEventListener("mousemove", MoveSlider);
  window.removeEventListener("mouseup", ReleaseCursor);
  data.timescale_tooltip_visibility = true;
  data.curor_tooltip_visibility = false;

  HandlerTimeEvents_slow();

  // only after select a range and previous mode is not select will it emit
  if (data.multicursor.select_mode && !previeous_select_mode) {
    emits("changeSelectMode", true);
    previeous_select_mode = true;
  }
}

function TranslateRedSlider(e) {
  if (!data.multicursor.select_mode) {
    data.slider1.SetPosition(e.clientX);
  }
}

// Drag to move timescale
let previous_clientX = 0;

function PressTimeScale(e) {
  previous_clientX = TIME_SCALE_DOM.scrollLeft + e.clientX;
  window.addEventListener("mousemove", MoveTimeScale);
  window.addEventListener("mouseup", ReleaseTimeScale);
  data.timescale_tooltip_visibility = false;
}

function ReleaseTimeScale() {
  window.removeEventListener("mousemove", MoveTimeScale);
  window.removeEventListener("mouseup", ReleaseTimeScale);
  data.timescale_tooltip_visibility = true;
}

let timescale_move_timeout = null;

function MoveTimeScale(e) {
  if (timescale_move_timeout == null) {
    timescale_move_timeout = setTimeout(() => {
      TIME_SCALE_DOM.scrollTo(previous_clientX - e.clientX, 0);
      timescale_move_timeout = null;
    }, 20);
  }
}

// Move selection
let current_sliders = [];
let previous_sliders_clientX = 0;
let previous_sliders_positions = [];

function PressSliders(e, slider, sliderl) {
  if (slider.position < sliderl.position) {
    current_sliders = [slider, sliderl];
  } else {
    current_sliders = [sliderl, slider];
  }
  previous_sliders_positions = [
    current_sliders[0].position,
    current_sliders[1].position,
  ];
  previous_sliders_clientX = e.clientX;

  current_sliders[0].pressed = true;
  current_sliders[1].pressed = true;
  window.addEventListener("mousemove", MoveSliders);
  window.addEventListener("mouseup", ReleaseSliders);
  data.timescale_tooltip_visibility = false;
}

function ReleaseSliders() {
  current_sliders[0].pressed = false;
  current_sliders[1].pressed = false;
  window.removeEventListener("mousemove", MoveSliders);
  window.removeEventListener("mouseup", ReleaseSliders);
  data.timescale_tooltip_visibility = true;
  HandlerTimeEvents_slow();
}

let sliders_move_timeout = null;

function MoveSliders(e) {
  if (sliders_move_timeout == null) {
    let move_offset = e.clientX - previous_sliders_clientX;
    let width = current_sliders[1].position - current_sliders[0].position;
    sliders_move_timeout = setTimeout(() => {
      // positive is moving right
      if (move_offset > 0) {
        let to_position = previous_sliders_positions[1] + move_offset;
        if (to_position < GetRightLimit()) {
          current_sliders[1].position = to_position;
        } else {
          current_sliders[1].position = GetRightLimit();
        }

        current_sliders[0].SetPosition(
          current_sliders[1].position - width,
          true
        );
      } else {
        let to_position = previous_sliders_positions[0] + move_offset;
        if (to_position > 0) {
          current_sliders[0].position = to_position;
        } else {
          current_sliders[0].position = 0;
        }

        current_sliders[1].SetPosition(
          current_sliders[0].position + width,
          true
        );
      }

      sliders_move_timeout = null;

      // HandlerTimeEvents();
    }, 20);
  }
}

function RemoveSubtractor() {
  if (data.multicursor.select_mode) {
    data.multicursor.select_mode = false;
  } else {
    data.multicursor.subtractor_mode = false;
  }
}

function AddSubtractor() {
  if (!data.multicursor.subtractor_mode) {
    data.multicursor.subtractor_mode = true;

    if (data.multicursor.select_mode === true) {
      data.slider2_l.SetPosition(TIME_SCALE_DOM.scrollLeft, true);
      data.slider2.SetPosition(
        TIME_SCALE_DOM.scrollLeft +
          slider_stuff.GetWidth(data.slider1, data.slider1_l),
        true
      );
    } else {
      data.slider2.SetPosition(TIME_SCALE_DOM.scrollLeft, true);
    }
  }
}

// Press shift key to enter select mode
function PressShiftKey(e) {
  if (e.key === "Shift") {
    data.multicursor.pressing_shiftkey = true;
  }
}

function ReleaseShiftKey(e) {
  if (e.key === "Shift") {
    data.multicursor.pressing_shiftkey = false;
  }
}

function RegShiftKey() {
  window.addEventListener("keydown", PressShiftKey);
  window.addEventListener("keyup", ReleaseShiftKey);
}

function UnRegShiftKey() {
  window.removeEventListener("keydown", PressShiftKey);
  window.removeEventListener("keyup", ReleaseShiftKey);
  data.multicursor.pressing_shiftkey = false;
}
</script>

<style lang="less">
.timeline {
  height: 70px;
  width: 100%;
  margin-bottom: 0px;
  position: relative;
  user-select: none;
}

.timeline-runway {
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
  position: absolute;
  height: 35px;
  top: 25px;
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
  // cursor: pointer;

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
  height: 50%;
  width: 2.5px;
  left: 2px;
  bottom: -2px;
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
  left: 2px;
  bottom: -2px;
  transition: 0.3s;
  background-color: rgb(128, 128, 128);
  border: solid 0.5px rgb(255, 255, 255);
  border-top-left-radius: 1.5px;
  border-top-right-radius: 1.5px;
  filter: drop-shadow(0px 0px 0.5px rgba(0, 0, 0, 0.5));
}

.year {
  pointer-events: all;
  position: relative;
  display: inline-block;
  height: 33px;
  top: 40px;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    background-color: rgba(245, 245, 245, 0.6);
    .first-month-scale {
      transform: scale(1.2, 1.2) translateY(-8%);
    }
  }
  &:active {
    cursor: -webkit-grabbing;
  }
}

.year-text {
  position: relative;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgba(70, 70, 70, 0.5);
  font-weight: bolder;
  transform: scale(0.8, 0.8);
  font-size: 10px;
  left: 2px;
  top: 1px;
  user-select: none;
}

.time-scale {
  position: relative;
  padding: 0px 2px 0px 2px;
  top: -108%;
  width: 99.8%;
  height: 220%;
  white-space: nowrap;
  overflow-x: scroll;
  z-index: 0;
  // pointer-events: none;
}

.sliders-frame {
  position: absolute;
  top: 37.5px;
  height: 35px;
  width: 100%;
  pointer-events: none;
  z-index: 2;
}

.popper {
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.3));
  transition-duration: 0.1s;
}

.popper-instant {
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.3));
}

.el-popper.is-customized {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  // pointer-events: none;
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
  // pointer-events: none;
  position: absolute;
  width: 100%;
  // top: 10%;
  bottom: 50px;
  color: gray;
  font-weight: bolder;
  font-size: 1.5vh;
  text-align: left;
}
</style>
