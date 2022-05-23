<template>
  <!-- <el-button @click="Test">Test</el-button> -->
  <div class="triangle-block">
    <div class="top-ends">
      <vue-draggable-next
        class="global-weight-hinter"
        :group="{ name: 'tri' }"
        :list="exclude_criterias"
      >
        <div
          v-for="c in exclude_criterias"
          :key="c"
          class="reserved"
          :style="{
            '--strip-color': c.color,
            '--strip-width': `${(100 * c.weight) / enabled_weight_overall}%`,
          }"
        >
          <el-tooltip
            :content="c.label"
            :popper-options="{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 15],
                  },
                },
              ],
            }"
            placement="top"
            effect="customized"
            :hide-after="0"
            popper-class="popper"
          >
            <!-- Make the tooltip show -->
            <div style="height: 100%; width: 100%"></div>
          </el-tooltip>
        </div>
        <div
          class="current"
          :style="{
            '--strip-width': `${
              (100 * current_weight_overall) / enabled_weight_overall
            }%`,
          }"
        ></div>
      </vue-draggable-next>
    </div>

    <!-- slider top end -->
    <div class="top-ends">
      <vue-draggable-next
        class="slider-ends"
        :list="data.tri"
        :group="{ name: 'tri', pull: false }"
        @add="ReplaceTopCriteria"
      >
        <!-- :move="PrintData" -->
        <div
          v-if="data.tri[0]"
          :style="{
            '--strip-width': `${100}%`,
            '--strip-color': data.tri[0].color,
          }"
        >
          <div :style="{ '--text-length': data.tri[0].length }">
            {{ data.tri[0].label }}
          </div>
        </div>
      </vue-draggable-next>
    </div>

    <div class="triangle-container">
      <svg
        ref="triSvg"
        style="height: 25vh"
        viewBox="-3 0 206 174"
        xmlns="http://www.w3.org/2000/svg"
        :style="{
          cursor: !data.slider.pressed ? 'default' : 'move',
        }"
      >
        <polygon
          class="triangle"
          :points="`0,${Root3(100)} 100,0 200,${Root3(100)} 0,${Root3(100)}`"
          vector-effect="non-scaling-stroke"
          @dblclick="TranslateSlider"
          @mousemove="MoveSlider"
          @click="PrintData"
        />

        <polygon class="hinter" :points="data.top_has_sb.current">
          <animate
            ref="topHasSb"
            attributeType="XML"
            attributeName="points"
            :from="data.top_has_sb.old"
            :to="data.top_has_sb.current"
            dur="0.5s"
            repeatCount="1"
            restart="always"
          />
        </polygon>

        <polygon class="hinter" :points="data.current_in_top.current">
          <animate
            ref="currentInTop"
            attributeType="XML"
            attributeName="points"
            :from="data.current_in_top.old"
            :to="data.current_in_top.current"
            dur="0.5s"
            repeatCount="1"
            restart="always"
          />
        </polygon>

        <polygon class="hinter" :points="data.current_at_top.current">
          <animate
            ref="currentAtTop"
            attributeType="XML"
            attributeName="points"
            :from="data.current_at_top.old"
            :to="data.current_at_top.current"
            dur="0.5s"
            repeatCount="1"
            restart="always"
          />
        </polygon>

        <line
          class="slider-height-line"
          :x1="`${data.position.x - 3}px`"
          :y1="`${Root3(100) - 1.5}`"
          :x2="`${data.position.x - 3}px`"
          :y2="`${data.position.y + 7}px`"
          style="
            stroke-width: 3;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.3));
            opacity: 0.8;
            pointer-events: none;
          "
          :style="{ stroke: data.tri[0].color }"
        />
        <line
          class="slider-height-line"
          :x1="`${
            (data.position.x - 0.5 + Root3(1) * (data.position.y + 3) + 300) /
              4 -
            3
          }`"
          :y1="`${
            (Root3(1) * (data.position.x - 0.5) +
              3 * (data.position.y + 3) -
              Root3(100)) /
              4 -
            3
          }`"
          :x2="`${data.position.x + 3}px`"
          :y2="`${data.position.y - 3}px`"
          style="
            stroke-width: 3;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.3));
            opacity: 0.8;
            pointer-events: none;
          "
          :style="{ stroke: data.tri[1].color }"
        />
        <line
          v-if="data.tri[2]"
          class="slider-height-line"
          :x1="`${
            (data.position.x - 0.5 - Root3(1) * (data.position.y + 3) + 300) /
              4 +
            3
          }`"
          :y1="`${
            (-Root3(1) * (data.position.x - 0.5) +
              3 * (data.position.y + 3) +
              Root3(100)) /
              4 -
            3
          }`"
          :x2="`${data.position.x - 9}px`"
          :y2="`${data.position.y - 3}px`"
          style="
            stroke-width: 3;
            stroke-linecap: round;
            filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.3));
            opacity: 0.8;
            pointer-events: none;
          "
          :style="{ stroke: data.tri[2].color }"
        />

        <circle
          class="slider"
          ref="triSlider"
          @pointerdown="PressSlider"
          :style="{
            '--slider-x': `${data.position.x - 0.5}px`,
            '--slider-y': `${data.position.y + 3}px`,
            pointerEvents: !data.slider.pressed ? 'all' : 'none',
          }"
          cx="-2.5"
          cy="-2.5"
          r="5"
        />
      </svg>
    </div>

    <div class="bottom-ends">
      <vue-draggable-next
        :list="data.tri"
        class="slider-ends"
        :group="{ name: 'tri', pull: false }"
        @add="ReplaceBottomCriteria0"
      >
        <div
          v-if="data.tri[1]"
          :style="{
            '--strip-width': `${100}%`,
            '--strip-color': data.tri[1].color,
          }"
        >
          <div :style="{ '--text-length': data.tri[1].length }">
            {{ data.tri[1].label }}
          </div>
        </div>
      </vue-draggable-next>

      <vue-draggable-next
        :list="data.tri"
        class="slider-ends"
        :group="{ name: 'tri', pull: false }"
        @add="ReplaceBottomCriteria1"
      >
        <div
          v-if="data.tri[2]"
          :style="{
            '--strip-width': `${100}%`,
            '--strip-color': data.tri[2].color,
          }"
        >
          <div :style="{ '--text-length': data.tri[2].length }">
            {{ data.tri[2].label }}
          </div>
        </div>
      </vue-draggable-next>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, toRaw, ref } from "@vue/reactivity";
import { useStore } from "../store/weight";
import { useRankStore } from "../store/rank";
import { VueDraggableNext } from "vue-draggable-next";
import { onMounted, watch } from "@vue/runtime-core";
import gsap from "gsap";
import monotoneChainConvexHull from "monotone-chain-convex-hull";

const emits = defineEmits(["close"]);

const props = defineProps({
  criterias: {
    type: Array,
  },
});

const store = useStore();
const rank_store = useRankStore();

function Root3(number) {
  return Math.sqrt(3) * number;
}

const data = reactive({
  tri: [],
  slider: {
    pressed: false,
    x: 100,
    y: Root3((100 * 2) / 3),
  },
  position: {
    x: 100,
    y: Root3((100 * 2) / 3),
  },

  current_at_top: {
    old_points: [[100, Root3((100 * 2) / 3)]],
    old: "",
    current: "",
  },
  current_in_top: {
    old_points: [[100, Root3((100 * 2) / 3)]],
    old: "",
    current: "",
  },
  top_has_sb: {
    old_points: [[100, Root3((100 * 2) / 3)]],
    old: "",
    current: "",
  },
});

watch(
  () => data.slider.x,
  (n) => {
    if (data.slider.pressed) {
      data.position.x = n;
    } else {
      gsap.to(data.position, { delay: 0.3, duration: 0.5, x: Number(n) || 0 });
    }
  }
);

watch(
  () => data.slider.y,
  (n) => {
    if (data.slider.pressed) {
      data.position.y = n;
    } else {
      gsap.to(data.position, { delay: 0.3, duration: 0.5, y: Number(n) || 0 });
    }
  }
);

data.tri = store.GetCriterias(props.criterias);

const include_names = computed(() => data.tri.map((d) => d.name));

const exclude_criterias = computed(() =>
  store.GetCriterias(store.GetCriteriaNames(include_names.value))
);

const current_weight_overall = computed(() => {
  let sum = 0;
  data.tri.forEach((x) => (sum += x.weight));
  return sum;
});

const enabled_weight_overall = computed(() => {
  let sum = current_weight_overall.value;
  exclude_criterias.value.forEach((d) => (sum += d.weight));
  return sum;
});

function ReplaceTopCriteria(d) {
  if (data.tri.length == 3) {
  } else {
    if (d.newIndex === 0) {
      data.tri.splice(1, 1);
    } else {
      data.tri.splice(0, 1);
    }
  }
}

function ReplaceBottomCriteria0(d) {
  if (data.tri.length == 3) {
    console.log(d);
  } else {
    if (d.newIndex === 0) {
      data.tri[2] = data.tri[0];
      data.tri.splice(0, 1);
    } else {
      data.tri[2] = data.tri[1];
      data.tri.splice(1, 1);
    }
  }
}

function ReplaceBottomCriteria1(d) {
  if (data.tri.length == 3) {
    console.log(d);
  } else {
    if (d.newIndex === 0) {
      data.tri[3] = data.tri[0];
      data.tri.splice(0, 1);
    } else {
      data.tri[3] = data.tri[1];
      data.tri.splice(1, 1);
    }
  }
}

watch(
  () => data.tri.filter((d) => d.enabled),
  () => {
    if (data.tri.filter((d) => d.enabled).length < 3) {
      emits("close");
    }
  }
);

watch(
  () => data.tri[0].weight,
  () => {
    if (!data.slider.pressed) {
      point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
      data.slider.x = point.x;
      data.slider.y = point.y;
    }
  }
);

watch(
  () => data.tri[1].weight,
  () => {
    if (!data.slider.pressed) {
      point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
      data.slider.x = point.x;
      data.slider.y = point.y;
    }
  }
);

watch(
  () => (data.tri[2] ? data.tri[2].weight : undefined),
  () => {
    if (!data.slider.pressed) {
      point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
      data.slider.x = point.x;
      data.slider.y = point.y;
    }
  }
);

function PressSlider() {
  data.slider.pressed = true;
  window.addEventListener("pointerup", ReleaseSlider);
}

function ReleaseSlider() {
  data.slider.pressed = false;
  window.removeEventListener("pointerup", ReleaseSlider);
}

let triSlider = ref(null);

const tri_point = [
  { x: 0, y: Root3(100) },
  { x: 100, y: 0 },
  { x: 200, y: Root3(100) },
];

const overall_weight = computed(() => {
  if (data.tri[2]) {
    return data.tri[0].weight + data.tri[1].weight + data.tri[2].weight;
  } else return 1;
});

const wp0 = computed({
  get() {
    return data.tri[0].weight / overall_weight.value;
  },
  set(value) {
    let overall = overall_weight.value;
    let old_12 = data.tri[1].weight + data.tri[2].weight;
    let v = value < 0.01 ? 0.01 : value;
    v = value > 0.99 ? 0.99 : v;
    data.tri[0].weight = overall * v;
    data.tri[1].weight *= ((1 - v) / old_12) * overall;
    data.tri[2].weight *= ((1 - v) / old_12) * overall;
  },
});

const wp1 = computed({
  get() {
    return data.tri[1].weight / overall_weight.value;
  },
  set(value) {
    let overall = overall_weight.value;
    let old_12 = data.tri[0].weight + data.tri[2].weight;
    let v = value < 0.01 ? 0.01 : value;
    v = value > 0.99 ? 0.99 : v;
    data.tri[1].weight = overall * v;
    data.tri[0].weight *= ((1 - v) / old_12) * overall;
    data.tri[2].weight *= ((1 - v) / old_12) * overall;
  },
});

const wp2 = computed({
  get() {
    if (data.tri[2]) {
      return data.tri[2].weight / overall_weight.value;
    }
    return 0.01;
  },
  set(value) {
    let overall = overall_weight.value;
    let old_12 = data.tri[0].weight + data.tri[1].weight;
    let v = value < 0.01 ? 0.01 : value;
    v = value > 0.99 ? 0.99 : v;
    data.tri[2].weight = overall * v;
    data.tri[1].weight *= ((1 - v) / old_12) * overall;
    data.tri[0].weight *= ((1 - v) / old_12) * overall;
  },
});

function GetABC(point1, point2) {
  return [
    point1.y - point2.y,
    point2.x - point1.x,
    point1.y * (point1.x - point2.x) - point1.x * (point1.y - point2.y),
  ];
}

function GetDistance(line_point1, line_point2, point) {
  let [A, B, C] = GetABC(line_point1, line_point2);
  return (A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
}

function WeightToPoint(weights) {
  let [w1, w2, w3] = weights;
  let y = (1 - w1) * Root3(100);
  let x = 100 * w1 + (200 * (1 - w1) * w3) / (w2 + w3);
  return { x, y };
}

let wv1,
  wv2,
  wv3 = 0;
let weighchange_timeout = null;
async function ChangeWeight(v1, v2, v3) {
  wv1 = v1;
  wv2 = v2;
  wv3 = v3;

  let handler = () => {
    if (!data.slider.pressed || Date.now() - n_time > 400) {
      weighchange_timeout = null;
      wp0.value = wv1;
      wp1.value = wv2;
      wp2.value = wv3;
    } else {
      weighchange_timeout = setTimeout(handler, 50);
      // handler();
    }
  };

  if (weighchange_timeout == null) {
    weighchange_timeout = setTimeout(handler, 50);
  }
}

let moveslider_timeout = null;
let point = null;
function MoveSlider(e) {
  n_time = Date.now();

  if (data.slider.pressed) {
    TranslateSlider(e);
  }
}

function TranslateSlider(e) {
  let XRatio =
    triSlider.value.getBBox().width /
    triSlider.value.getBoundingClientRect().width;
  let YRatio =
    triSlider.value.getBBox().height /
    triSlider.value.getBoundingClientRect().height;
  let x = e.offsetX * XRatio;
  let y = e.offsetY * YRatio;
  point = { x: x - 3, y: y + 0.5 };

  if (moveslider_timeout === null) {
    moveslider_timeout = setTimeout(() => {
      let d1 = GetDistance(tri_point[2], tri_point[0], point);
      let d2 = GetDistance(tri_point[1], tri_point[2], point);
      let d3 = GetDistance(tri_point[0], tri_point[1], point);

      let overall = d1 + d2 + d3;
      let v1 = d1 / overall;
      let v2 = d2 / overall;
      let v3 = d3 / overall;

      ChangeWeight(v1, v2, v3);

      // point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
      if (data.slider.x - point.x < 5 && data.slider.y - point.y < 5) {
        LoadHinterTimeout();
      }

      data.slider.x = point.x;
      data.slider.y = point.y;

      moveslider_timeout = null;
    }, 10);
  }
}

watch(
  () => rank_store.current_solutions,
  () => LoadHinterTimeout()
);

let solution_trigger = null;
let n_time = 0;
function LoadHinterTimeout() {
  // n_time = Date.now();
  if (solution_trigger === null && Date.now() - n_time > 20) {
    solution_trigger = setTimeout(() => {
      LoadHinterMT();
      solution_trigger = null;
    }, 200);
  }
}

let currentAtTop = ref();
let currentInTop = ref();
let topHasSb = ref();

let new_old_str = function (old_points, new_points) {
  let n_points = new_points.concat([]);
  let o_points = old_points.concat([]);

  while (o_points.length < n_points.length) {
    let choose_index = Math.floor(Math.random() * o_points.length);
    let l_point = o_points.at(choose_index);
    let r_index = choose_index + 1 >= o_points.length ? 0 : choose_index + 1;

    let r_point = o_points.at(r_index);

    let n_point = [
      (l_point[0] + r_point[0]) / 2,
      (l_point[1] + r_point[1]) / 2,
    ];

    o_points.splice(r_index, 0, n_point);
  }
  while (n_points.length < o_points.length) {
    let choose_index = Math.floor(Math.random() * n_points.length);
    let l_point = n_points.at(choose_index);
    let r_index = choose_index + 1 >= n_points.length ? 0 : choose_index + 1;
    let r_point = n_points.at(r_index);
    let n_point = [
      (l_point[0] + r_point[0]) / 2,
      (l_point[1] + r_point[1]) / 2,
    ];

    n_points.splice(r_index, 0, n_point);
  }

  let old_str = "";
  o_points.forEach((d) => (old_str += ` ${d[0]},${d[1]} `));

  let new_str = "";
  n_points.forEach((d) => (new_str += ` ${d[0]},${d[1]} `));

  return [new_str, old_str];
};

async function LoadHinter() {
  // if (Date.now() - n_time < 20) {
  //   return;
  // }
  let start_time = Date.now();
  // console.log("start hinter calculation");
  let res = await rank_store.Compute3WayRange(
    data.tri.map((d) => d.name),
    store.GetCriterias().map((d) => toRaw(d))
  );

  let at_top_points = res.notChangeCurrent.map((d) => {
    let coord = WeightToPoint(d);
    return [coord.x, coord.y];
  });

  if (at_top_points.length == 0) {
    return;
  }

  let in_top_points = res.currentStillInTop.map((d) => {
    let coord = WeightToPoint(d);
    return [coord.x, coord.y];
  });

  if (in_top_points.length == 0) {
    return;
  }

  let top_points = res.topStillHasSb.map((d) => {
    let coord = WeightToPoint(d);
    return [coord.x, coord.y];
  });

  if (top_points.length == 0) {
    return;
  }

  setTimeout(() => {
    at_top_points = monotoneChainConvexHull(at_top_points);
    [data.current_at_top.current, data.current_at_top.old] = new_old_str(
      toRaw(data.current_at_top.old_points),
      at_top_points
    );
    data.current_at_top.old_points = at_top_points;

    in_top_points = monotoneChainConvexHull(in_top_points);
    [data.current_in_top.current, data.current_in_top.old] = new_old_str(
      toRaw(data.current_in_top.old_points),
      in_top_points
    );
    data.current_in_top.old_points = in_top_points;

    top_points = monotoneChainConvexHull(top_points);
    [data.top_has_sb.current, data.top_has_sb.old] = new_old_str(
      toRaw(data.top_has_sb.old_points),
      top_points
    );
    data.top_has_sb.old_points = top_points;

    currentAtTop.value.beginElement();
    currentInTop.value.beginElement();
    topHasSb.value.beginElement();
  }, 800);
}


function LoadHinterMT() {
  // if (Date.now() - n_time < 20) {
  //   return;
  // }
  // let start_time = Date.now();
  // // console.log("start hinter calculation");
  // let res = await rank_store.Compute3WayRange(
  //   data.tri.map((d) => d.name),
  //   store.GetCriterias().map((d) => toRaw(d))
  // );

  let load_hinter = (res)=>{

  let at_top_points = res.notChangeCurrent.map((d) => {
    let coord = WeightToPoint(d);
    return [coord.x, coord.y];
  });

  if (at_top_points.length == 0) {
    return;
  }

  let in_top_points = res.currentStillInTop.map((d) => {
    let coord = WeightToPoint(d);
    return [coord.x, coord.y];
  });

  if (in_top_points.length == 0) {
    return;
  }

  let top_points = res.topStillHasSb.map((d) => {
    let coord = WeightToPoint(d);
    return [coord.x, coord.y];
  });

  if (top_points.length == 0) {
    return;
  }

    at_top_points = monotoneChainConvexHull(at_top_points);
    [data.current_at_top.current, data.current_at_top.old] = new_old_str(
      toRaw(data.current_at_top.old_points),
      at_top_points
    );
    data.current_at_top.old_points = at_top_points;

    in_top_points = monotoneChainConvexHull(in_top_points);
    [data.current_in_top.current, data.current_in_top.old] = new_old_str(
      toRaw(data.current_in_top.old_points),
      in_top_points
    );
    data.current_in_top.old_points = in_top_points;

    top_points = monotoneChainConvexHull(top_points);
    [data.top_has_sb.current, data.top_has_sb.old] = new_old_str(
      toRaw(data.top_has_sb.old_points),
      top_points
    );
    data.top_has_sb.old_points = top_points;

    currentAtTop.value.beginElement();
    currentInTop.value.beginElement();
    topHasSb.value.beginElement();
}

  rank_store.Compute3WayRangeMT(    data.tri.map((d) => d.name),
    store.GetCriterias().map((d) => toRaw(d)),load_hinter)
}


onMounted(() => {
  point = WeightToPoint([wp0.value, wp1.value, wp2.value]);
  data.slider.x = point.x;
  data.slider.y = point.y;

  LoadHinterTimeout();
});
</script>

<style lang="less" scoped>
.triangle-block {
  align-items: center;
  margin-left: 30px;
  margin-right: 30px;
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.3));

  .el-slider {
    position: relative;
    left: 5px;
    width: 90px;
    --el-slider-runway-bg-color: #e7eae8;
  }
}

.triangle-container {
  height: 25vh;
  position: relative;
}

.triangle {
  position: absolute;
  stroke-linejoin: round;
  fill: #e7eae8;
  stroke: gray;
  stroke-width: 1px;
  cursor: pointer;
  user-select: none;
}

.hinter {
  pointer-events: none;
  position: absolute;
  stroke-linejoin: round;
  fill: rgb(84, 123, 192);
  opacity: 0.5;
  // stroke: gray;
  // stroke-width: 1px;
}

.slider {
  stroke-linejoin: round;
  stroke-width: 3;
  stroke: #be1500;
  fill: transparent;
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.2));
  cursor: move;
  transform: translate(var(--slider-x), var(--slider-y));

  &:hover {
    stroke: #f32e00;
  }

  &:active {
    stroke: #f32e00;
    transition: 0s;
  }
}

.bottom-ends {
  display: flex;
  justify-content: space-between;
}

.top-ends {
  display: flex;
  justify-content: center;
}

.slider-ends {
  user-select: none;
  box-shadow: 0px 0px 0px 1px grey;
  display: flex;
  height: 3vh;
  width: 100px;
  border-radius: 5px;
  overflow: hidden;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  div {
    height: 3vh;
    background-color: var(--strip-color);
    width: var(--strip-width);

    position: relative;

    div {
      text-align: right;
      position: absolute;
      right: 0;
      z-index: 10px;
      font-size: 1.5vh;
      opacity: 0;
      color: white;
      transition: 0.3s;
      pointer-events: none;
      width: 80px;
      padding: 0.6vh 0px 0.4vh 0px;
      height: 2vh;
      border-radius: 5px;
    }

    &:hover {
      div {
        opacity: 1;
        padding: 0.6vh 10px 0.4vh 10px;
        text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.8);
      }
    }
  }
}

.global-weight-hinter {
  display: flex;
  margin-bottom: 0.9px;
  height: 1vh;
  width: 90px;

  :first-child {
    border-top-left-radius: 3px;
  }

  :last-child {
    border-top-right-radius: 3px;
  }

  .reserved {
    margin: 0;
    width: var(--strip-width);
    background-color: var(--strip-color);
    height: 1vh;
    cursor: grab;
    transition: 0.3s;
    transition-property: transform;
    transform: scale(1, 1);

    &:hover {
      transform: scale(1.5, 1.5) translate(0, -20%);
    }

    &:active {
      cursor: grabbing;
    }
  }

  .current {
    background-color: #ffffff;
    height: 0.5vh;
    position: relative;
    width: var(--strip-width);
    top: 0.5vh;
    bottom: 0;
    z-index: -1;
  }
}
</style>
