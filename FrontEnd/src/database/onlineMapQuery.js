import axios from "axios";

export async function GetDistance(my_coord, target_coord) {
  let res = await axios.get(
    `https://api.map.baidu.com/direction/v2/transit?origin=${my_coord[0]},${my_coord[1]}&destination=${target_coord[0]},${target_coord[1]}&ak=p0FDK7XNOEmueR0f0Ojnu4IYOCTGBKlF&tactics_incity=0&coord_type=wgs84&page_size=1`
  );
  return res.data;
}

let gaode_key = "7adde82815b3509bf5fda0408def55a5";
export async function SearchLocation(location_name) {
  let res = await axios.get("https://restapi.amap.com/v3/geocode/geo?", {
    params: {
      key: gaode_key,
      address: location_name,
      city: "北京",
      batch: true,
    },
  });
  return res.data;
}
