import "ol/ol.css";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";

const vectorSource = new VectorSource({
  url: "https://raw.githubusercontent.com/mikedeng/city_geojson/master/geojsons/%E5%8C%97%E4%BA%AC%E5%B8%82.json",
  format: new GeoJSON(),
});

const style = new Style({
  fill: new Fill({
    color: "#eeeeee",
  }),
});

export const Layer = new VectorLayer({
  source: vectorSource,
  background: "#1a2b39",
//   style: function (feature) {
//     const color = feature.get("COLOR_BIO") || "#eeeeee";
//     style.getFill().setColor(color);
//     return style;
//   },
});
