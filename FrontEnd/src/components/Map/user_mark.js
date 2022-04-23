import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import Cluster from "ol/source/Cluster";
import CircleStyle from "ol/style/Circle";
import Point from "ol/geom/Point";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import * as d3 from "d3";
import { Modify } from "ol/interaction";
// add marks
let color_array = d3.schemeSet1;
let color_nu = 0;

export function GetNewMarkFeature(coordinate) {
    let color = color_array[color_nu];
    let svg = `<svg t="1650527293382" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"  width="40" height="40" fill="${color}"><path d="M553.0112 991.06133333a51.2 51.2 0 0 1-82.0224 0C259.3792 707.77173333 153.6 503.94453333 153.6 379.73333333a358.4 358.4 0 1 1 716.8 0c0 124.16-105.7792 327.9872-317.3888 611.328zM512 533.33333333a153.6 153.6 0 1 0 0-307.2 153.6 153.6 0 0 0 0 307.2z" p-id="11077"></path></svg>`;

    let mysvg = new Image();
    color_nu = (color_nu + 1) % color_array.length;
    mysvg.src = "data:image/svg+xml," + encodeURIComponent(svg);
    let style = new Style({
        image: new Icon({
            anchor: [0.5, 0.8],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            img: mysvg,
            imgSize: [40, 40],
        }),
        stroke: new Stroke({ width: 20 }),
    });

    let new_feature = new Feature({
        type: 'UserMark',
        geometry: new Point(coordinate),
        color: color,
        weight: 10 - color_nu
    });
    new_feature.setStyle(style);

    return new_feature;
}
export const MarkSource = new VectorSource();
export const MarkLayer = new VectorLayer({ source: MarkSource });
export const UserMarkModify = new Modify({
    source: MarkSource,
    snapToPointer: true,
    pixelTolerance: 30,
    style: new Style(),
});
UserMarkModify.on(["modifystart"], function (evt) {
    document.getElementById("map").style.cursor =
        evt.type === "modifystart" ? "grabbing" : "pointer";
});
UserMarkModify.on(["modifyend"], function (evt) {
    data.marks = MarkSource.getFeatures()
    document.getElementById("map").style.cursor =
        evt.type === "modifystart" ? "grabbing" : "pointer";
});
const overlaySource = UserMarkModify.getOverlay().getSource();
overlaySource.on(["addfeature", "removefeature"], function (evt) {
    document.getElementById("map").style.cursor =
        evt.type === "addfeature" ? "pointer" : "";
});

