import axios from "axios";

export async function GetDistance(my_coord,target_coord) {
    let res= await axios.get(
        `https://api.map.baidu.com/direction/v2/transit?origin=${my_coord[0]},${my_coord[1]}&destination=${target_coord[0]},${target_coord[1]}&ak=p0FDK7XNOEmueR0f0Ojnu4IYOCTGBKlF&tactics_incity=0&coord_type=wgs84&page_size=1`
    )
    return res.data;
}