<template>
  <div class="timeline">
    <div class="timeline-runway">
      <div class="time-scale">
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

      <slider-button :style="{ left: `${data.slider_position}px` }">
      </slider-button>
    </div>
    <div class="timeline-label">Time Line</div>
    {{ GetYearMonth() }}
  </div>
</template>

<script setup>
import {
  computed,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  onUpdated,
  reactive,
  ref,
  watch,
} from "@vue/runtime-core";
import SliderButton from "./TimeLine/SliderButton.vue";

let pressed = false;

const data = reactive({
  time_series: [],
  slider_position: 0,
  scroll_position: 0,
});

function MapMonth(month) {
  switch (month) {
    case 1:
      return "Jan.";
    case 2:
      return "Feb.";
    case 3:
      return "Mar.";
    case 4:
      return "Apr.";
    case 5:
      return "May.";
    case 6:
      return "Jun.";
    case 7:
      return "Jul.";
    case 8:
      return "Aug.";
    case 9:
      return "Sep.";
    case 10:
      return "Oct.";
    case 11:
      return "Nov.";
    case 12:
      return "Dec.";
    default:
      return "Month";
  }
}
let timeoutTrottler = null;
let pos_value = 0;

let left_offset = 15;

onBeforeMount(() => {
  for (let i = 2012; i <= 2020; i++) {
    let month = [];
    for (let j = 1; j <= 12; j++) {
      month.push(j);
    }
    data.time_series.push({ year: i, month: month });
  }
});

onMounted(() => {
  let runway = document.getElementsByClassName("timeline-runway");
  for (let i = 0; i < runway.length; i++) {
    const element = runway[i];
    console.log(element.clientWidth);
    element.addEventListener("mousemove", (e) => {
      pos_value = e.clientX - left_offset;

      pos_value = pos_value < 0 ? -5 : pos_value;
      let right_most =
        document.getElementsByClassName("time-scale")[0].clientWidth -
        left_offset +
        8;
      pos_value = pos_value > right_most ? right_most : pos_value;

      if (pressed) {
        if (timeoutTrottler == null) {
          timeoutTrottler = setTimeout(() => {
            timeoutTrottler = null;
            data.slider_position = pos_value;
          }, 5);
        }
      }
    });
    element.addEventListener("pointerdown", (e) => {
      pressed = true;
    });
    element.addEventListener("pointerup", (e) => {
      pressed = false;
    });
    element.addEventListener("dblclick", (e) => {
      pos_value = e.clientX - left_offset;
      data.slider_position = pos_value;
    });
  }

  data.slider_position =
    document.getElementsByClassName("time-scale")[0].clientWidth -
    left_offset +
    8;
  document.getElementsByClassName("time-scale")[0].scrollTo(1000000, 0);

  document
    .getElementsByClassName("time-scale")[0]
    .addEventListener("scroll", (e) => {
      data.scroll_position = document
        .getElementsByClassName("time-scale")
        .item(0).scrollLeft;
    });
});

function GetYearMonth() {
  try {
    let unit_width = document
      .getElementsByClassName("year")
      .item(0).clientWidth;
    let length = data.scroll_position + data.slider_position;

    let ind = Math.floor(length / unit_width);
    let month_width = document
      .getElementsByClassName("month")
      .item(0).clientWidth;
    let l_month = Math.floor((length % unit_width) / month_width);
    return {
      year: data.time_series[ind].year,
      month: data.time_series[ind].month[l_month],
    };
  } catch (error) {
    return { year: null, month: null };
  }
}
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
  background: linear-gradient(90deg, rgb(230, 230, 230), rgb(255, 255, 255));
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