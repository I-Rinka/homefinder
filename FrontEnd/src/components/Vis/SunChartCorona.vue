<template>
  <g>
    <Corona v-if="data.corona.length === 8"></Corona>
    <animateTransform
      ref="corona1"
      attributeName="transform"
      type="scale"
      from="0 0"
      calcMode="spline"
      keyTimes="0;.5;1"
      keySplines=".5 0 .5 1; 0 0 1 1"
      to="1 1"
      dur="1s"
      repeatCount="1"
      begin="indefinite"
    />
    <animate
      ref="corona2"
      attributeName="opacity"
      values="0;1"
      dur="0.5s"
      repeatCount="1"
      begin="indefinite"
    />
  </g>
</template>

<script lang="ts" setup>
import { reactive, ref, toRaw } from "@vue/reactivity";
import { onMounted, onBeforeUnmount, h } from "@vue/runtime-core";
import { EnabledPOI, GetPOIs, poi_type } from "../../database/onlineQuery";
import coordtransform from "coordtransform";

const props = withDefaults(
  defineProps<{
    coord: [number, number];
    innerRadius?: number;
  }>(),
  { innerRadius: 60 }
);

const data = reactive({
  categories: {
    科教文化服务: new Array<poi_type>("博物馆", "图书馆"),
    风景名胜: new Array<poi_type>(
      "世界遗产",
      "国家级景点",
      "省级景点",
      "公园广场"
    ),
    交通设施服务: new Array<poi_type>("地铁站", "火车站"),
    生活服务: new Array<poi_type>("中国电信营业厅", "中国移动营业厅"),
    餐饮服务: new Array<poi_type>("快餐厅"),
    购物服务: new Array<poi_type>("超级市场", "购物中心"),
    体育休闲服务: new Array<poi_type>("运动场馆"),
    医疗保健服务: new Array<poi_type>("三级甲等医院"),
  },
  corona: Array<Array<any>>(),
});
let request_controller = new AbortController();

const corona1 = ref();
const corona2 = ref();
async function GenCorona(coord: [number, number]) {
  for (const key in data.categories) {
    if (Object.prototype.hasOwnProperty.call(data.categories, key)) {
      const pois = data.categories[key];
      let res = await GetPOIs(coord, request_controller, 1, EnabledPOI(pois));
      data.corona.push(res.pois);
    }

    request_controller = new AbortController();
  }
  corona1.value.beginElement();
  corona2.value.beginElement();
}

function GetXY(rotate: number, offset: number) {
  let deg = (Math.PI * rotate) / 180;
  return [Math.cos(deg) * offset, Math.sin(deg) * offset];
}

function GetPoints(index: number) {
  let XY0 = GetXY(index * 45, props.innerRadius);
  let XY1 = GetXY(index * 45, props.innerRadius + 14);
  let XY2 = GetXY(index * 45, props.innerRadius + 25);
  let ans = [];
  if (!data.corona[index]) {
    return ans;
  }
  let inner1 = data.corona[index].filter(
    (d) => Number.parseInt(d.distance as string) < 5000
  );
  let inner2 = data.corona[index].filter(
    (d) => Number.parseInt(d.distance as string) < 1000
  );
  let inner3 = data.corona[index].filter(
    (d) => Number.parseInt(d.distance as string) < 100
  );

  if (inner1.length > 0) {
    ans.push(
      h("circle", {
        fill: "rgba(128,128,128,0.5)",
        cx: XY0[0],
        cy: XY0[1],
        r: 6,
      })
    );
  }

  if (inner2.length > 0) {
    ans.push(
      h("circle", {
        fill: "rgba(128,128,128,0.5)",
        cx: XY1[0],
        cy: XY1[1],
        r: 5,
      })
    );
  }

  if (inner3.length > 0) {
    ans.push(
      h("circle", {
        fill: "rgba(128,128,128,0.5)",
        cx: XY2[0],
        cy: XY2[1],
        r: 4,
      })
    );
  }
  return ans;
}

function Corona() {
  return Array.from({ length: 8 }).map((d, i) => {
    return h("g", { key: "corona" + i }, GetPoints(i));
  });
}

onMounted(() => {
  GenCorona(coordtransform.wgs84togcj02(props.coord[0], props.coord[1]));
});

onBeforeUnmount(() => {
  request_controller.abort();
});
</script>
