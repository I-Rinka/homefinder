<template>
  <g v-for="i in 8" :key="'corona' + i">
    <circle
      fill="rgba(128,128,128,0.5)"
      :cx="GetXY(i * 45, props.innerRadius)[0]"
      :cy="GetXY(i * 45, props.innerRadius)[1]"
      :r="6"
    ></circle>
    <circle
      fill="rgba(128,128,128,0.5)"
      :cx="GetXY(i * 45, props.innerRadius + 14)[0]"
      :cy="GetXY(i * 45, props.innerRadius + 14)[1]"
      :r="5"
    ></circle>
    <circle
      fill="rgba(128,128,128,0.5)"
      :cx="GetXY(i * 45, props.innerRadius + 25)[0]"
      :cy="GetXY(i * 45, props.innerRadius + 25)[1]"
      :r="4"
    ></circle>
  </g>
</template>

<script lang="ts" setup>
import { reactive, toRaw } from "@vue/reactivity";
import { onMounted, onBeforeUnmount } from "@vue/runtime-core";
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
  corona: [],
});
let request_controller = new AbortController();

async function GenCorona(coord: [number, number]) {
  for (const key in data.categories) {
    if (Object.prototype.hasOwnProperty.call(data.categories, key)) {
      const pois = data.categories[key];
      let res = await GetPOIs(coord, request_controller, 1, EnabledPOI(pois));
      data.corona.push(res.pois);
    }

    request_controller = new AbortController();
  }

  console.log(data.corona);
}

function GetXY(rotate: number, offset: number) {
  let deg = (Math.PI * rotate) / 180;
  return [Math.cos(deg) * offset, Math.sin(deg) * offset];
}

onMounted(() => {
  //   GenCorona(coordtransform.wgs84togcj02(props.coord[0], props.coord[1]));
});

onBeforeUnmount(() => {
  request_controller.abort();
});
</script>
