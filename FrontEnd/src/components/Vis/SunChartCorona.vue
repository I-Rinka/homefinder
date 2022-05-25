<template>


</template>

<script lang="ts" setup>
import { reactive, toRaw } from "@vue/reactivity";
import { onMounted, onBeforeUnmount } from "@vue/runtime-core";
import { EnabledPOI, GetPOIs, poi_type } from "../../database/onlineQuery";
import coordtransform from "coordtransform";

const props = defineProps<{
  coord: [number, number];
}>();

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

  console.log(data.corona)
}

onMounted(() => {
  GenCorona(coordtransform.wgs84togcj02(props.coord[0], props.coord[1]));
});

onBeforeUnmount(() => {
  request_controller.abort();
});
</script>
