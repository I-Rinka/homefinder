import "ol/ol.css";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";

const vectorSource = new VectorSource({
  url: "https://raw.githubusercontent.com/d3cn/data/master/json/geo/china/province-city/beijing.geojson",
  format: new GeoJSON(),
});

const style = new Style({
  fill: new Fill({
    color: "#ffffff",
    opacity: 1,
  }),
  stroke: new Stroke({
    color: "#000000",
    width: 2,
  }),
});

export const Layer = new VectorLayer({
  source: vectorSource,
  background: "#000000ff",
  opacity: 0.2,
  style: style,
});
