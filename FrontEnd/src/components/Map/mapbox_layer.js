import "ol/ol.css";
import MVT from "ol/format/MVT";
import Map from "ol/Map";
import TileGrid from "ol/tilegrid/TileGrid";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import { get as getProjection } from "ol/proj";
import XYZ from "ol/source/XYZ";
import Tile from "ol/layer/Tile";
import MapboxVector from 'ol/layer/MapboxVector';
const key =
  "pk.eyJ1Ijoicmlua2F3YW5nIiwiYSI6ImNsMjRnZjJ2djF0dTgzZG1pZmRkaGZ4eXYifQ.Obj4N2Et5gyFnvQB-zp4cA";

export const mapboxlayer=new Tile({
    source: new XYZ({
        url: 'https://api.mapbox.com/styles/v1/rinkawang/cl24h30sl00cx14nukfc7s8ju/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicmlua2F3YW5nIiwiYSI6ImNsMjRnZjJ2djF0dTgzZG1pZmRkaGZ4eXYifQ.Obj4N2Et5gyFnvQB-zp4cA'
    })
})

// export const mapboxlayer = new MapboxVector({
//   styleUrl: "mapbox://styles/rinkawang/cl24h30sl00cx14nukfc7s8ju",
//   accessToken: key,
// });
