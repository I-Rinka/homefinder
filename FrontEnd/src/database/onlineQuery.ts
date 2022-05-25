import axios from "axios";

export async function GetDistance(
  my_coord: [number, number],
  target_coord: [number, number]
) {
  let res = await axios.get(
    `https://api.map.baidu.com/direction/v2/transit?origin=${my_coord[0]},${my_coord[1]}&destination=${target_coord[0]},${target_coord[1]}&ak=p0FDK7XNOEmueR0f0Ojnu4IYOCTGBKlF&tactics_incity=0&coord_type=wgs84&page_size=1`
  );
  return res.data;
}

const gaode_key = "7adde82815b3509bf5fda0408def55a5";
export async function SearchLocation(location_name: string) {
  let res = await axios.get("https://restapi.amap.com/v3/place/text?", {
    params: {
      key: gaode_key,
      keywords: location_name,
      city: "北京",
      offset: 10,
    },
  });
  return res.data;
}

export type poi_type =
  | "科教文化服务"
  | "风景名胜"
  | "交通设施服务"
  | "生活服务"
  | "餐饮服务"
  | "购物服务"
  | "体育休闲服务"
  | "医疗保健服务"
  // 👆 大类
  | "博物馆"
  | "图书馆"
  | "美术馆"
  | "科技馆"
  | "天文馆"
  | "文化宫"
  // ↑ 科教文化服务
  | "公园广场"
  | "世界遗产"
  | "国家级景点"
  | "省级景点"
  // ↑ 风景名胜
  | "地铁站"
  | "火车站"
  // ↑ 交通设施服务
  | "超级市场"
  | "综合市场"
  | "便民商店/便利店"
  | "购物中心"
  // ↑ 购物服务
  | "运动场馆"
  // ↑ 体育休闲服务
  | "物流速递"
  | "邮局"
  | "电讯营业厅"
  | "中国移动营业厅"
  | "中国电信营业厅"
  | "律师事务所"
  // ↑ 生活服务
  | "快餐厅"
  | "咖啡厅"
  | "肯德基"
  | "麦当劳"
  // ↑ 餐饮服务
  | "三级甲等医院"
  | "综合医院";
// ↑ 医疗保健服务
// 👆 中类
export function EnabledPOI(poi_array: poi_type[]) {
  return poi_array.join("|");
}
export async function GetPOIs(
  coord: [number, number],
  controller?: AbortController,
  page?:number,
  types?:string
) {
  let res = await axios.get("https://restapi.amap.com/v3/place/around?", {
    params: {
      key: gaode_key,
      location: coord[0] + "," + coord[1],
      city: "北京",
      radius: 10000,
      types,
      offset:50,
      page
    },
    signal: controller ? controller.signal : undefined,
  });
  return res.data;
}
