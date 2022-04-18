import TileGrid from "ol/tilegrid/TileGrid";
import { Tile } from "ol/layer";
import { XYZ } from "ol/source";

// 自定义分辨率和瓦片坐标系
var resolutions = [];
var maxZoom = 18;

// 计算百度使用的分辨率
for (var i = 0; i <= maxZoom; i++) {
  resolutions[i] = Math.pow(2, maxZoom - i);
}
var tilegrid = new TileGrid({
  origin: [0, 0], // 将原点设置成和百度瓦片坐标系一致
  resolutions: resolutions, // 设置分辨率
});

// 百度地图图层
export let baiduMapLayer = new Tile({
  source: new XYZ({
    tilePixelRatio: 2,
    tileGrid: tilegrid,
    tileUrlFunction: function (tileCoord) {
      let z = tileCoord[0];
      let x = tileCoord[1];
      let y = -tileCoord[2]-1;

      // 百度瓦片服务url将负数使用M前缀来标识
      if (x < 0) {
        x = "M" + -x;
      }
      if (y < 0) {
        y = "M" + -y;
      }

      // 返回经过转换后，对应于百度在线瓦片的url
      return (
        "http://online2.map.bdimg.com/onlinelabel/?qt=tile&x=" +
        x +
        "&y=" +
        y +
        "&z=" +
        z +
        "&styles=pl&udt=20160321&scaler=2&p=0"
      );
    },
  }),
});
