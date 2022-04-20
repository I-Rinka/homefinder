import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import Cluster from "ol/source/Cluster";
import CircleStyle from "ol/style/Circle";
import Point from "ol/geom/Point";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";

const config = {
  sub_region_distance: 100,
};

let BlockCluster = null;
let RegionCluster = null;

export function GetBlockClusterArray(blocks) {
  if (BlockCluster !== null) {
    return BlockCluster;
  } else {
    BlockCluster = [];
    let block_dic = {};

    for (let i = 0; i < blocks.length; i++) {
      const element = blocks[i];

      let point_feature = new Feature({
        name: element.block,
        region: element.region,
        sub_region: element.sub_region,
      });

      let point_geom = new Point([element.lng, element.lat]);
      point_feature.setGeometry(point_geom);
      if (!block_dic.hasOwnProperty(element.sub_region)) {
        block_dic[element.sub_region] = new VectorSource();
      }
      block_dic[element.sub_region].addFeature(point_feature);
    }

    for (const sub_region in block_dic) {
      if (Object.hasOwnProperty.call(block_dic, sub_region)) {
        const element = block_dic[sub_region];
        let cluster = new Cluster({
          source: block_dic[sub_region],
          distance: config.sub_region_distance,
        });

        BlockCluster.push(
          new VectorLayer({
            source: cluster,
            style: blockClusterStyle,
          })
        );
      }
    }
    return BlockCluster;
  }
}

function GetRegionClusterArray() {}

function blockClusterStyle(feature) {
  const size = feature.get("features").length;
  if (size > 1) {
    return [
      // outer style
      new Style({
        image: new CircleStyle({
          radius: Math.sqrt(Math.log(size + 3) * 250),
          fill: outerCircleFill,
        }),
      }),

      // inner
      new Style({
        image: new CircleStyle({
          radius: Math.sqrt(Math.log(size + 3) * 250) - 5,
          fill: innerCircleFill,
        }),
        text: new Text({
          text: size.toString(),
          fill: textFill,
          stroke: textStroke,
        }),
      }),
    ];
  } else {
    const originalFeature = feature.get("features")[0];
    return clusterMemberStyle(originalFeature);
  }
}

function clusterMemberStyle(clusterMember) {
  return new Style({
    geometry: clusterMember.getGeometry(),
    image: new CircleStyle({
      fill: fill,
      stroke: stroke,
      radius: 8,
      // image: clusterMember.get('LEISTUNG') > 5 ? darkIcon : lightIcon,
    }),
    fill: fill,
    stroke: stroke,
  });
}

const fill = new Fill({
  color: [180, 0, 0, 0.3],
});

const stroke = new Stroke({
  color: [180, 0, 0, 1],
  width: 1,
});

const outerCircleFill = new Fill({
  color: "rgba(255, 153, 102, 0.3)",
});
const innerCircleFill = new Fill({
  color: "rgba(255, 165, 0, 0.7)",
});
const textFill = new Fill({
  color: "#fff",
});
const textStroke = new Stroke({
  color: "rgba(0, 0, 0, 0.6)",
  width: 3,
});
