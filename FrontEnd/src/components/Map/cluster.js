import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import Cluster from "ol/source/Cluster";
import CircleStyle from "ol/style/Circle";
import Point from "ol/geom/Point";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";

const config = {
  sub_region_distance: 200,
  region_distance: 200,
  normal_distance: 300,
};

let BlockCluster = null;
let RegionCluster = null;
let NormalCluster = null;
let point_features = null;

export function GetPointFeatures(blocks) {
  if (point_features !== null) {
    return point_features;
  } else {
    point_features = [];
    for (let i = 0; i < blocks.length; i++) {
      const element = blocks[i];
      let point_feature = new Feature({
        block: element.block,
        region: element.region,
        sub_region: element.sub_region,
      });
      let point_geom = new Point([element.lng, element.lat]);
      point_feature.setGeometry(point_geom);
      point_features.push(point_feature);
    }
    return point_features;
  }
}

export function GetBlockClusterArray(blocks) {
  if (BlockCluster !== null) {
    return BlockCluster;
  } else {
    BlockCluster = [];
    let block_dic = {};

    GetPointFeatures(blocks).forEach((feature) => {
      if (!block_dic.hasOwnProperty(feature.get("sub_region"))) {
        block_dic[feature.get("sub_region")] = new VectorSource();
      }
      block_dic[feature.get("sub_region")].addFeature(feature);
    });

    for (const sub_region in block_dic) {
      if (Object.hasOwnProperty.call(block_dic, sub_region)) {
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
export function GetRegionClusterArray(blocks) {
  if (RegionCluster !== null) {
    return RegionCluster;
  } else {
    RegionCluster = [];
    let block_dic = {};

    GetPointFeatures(blocks).forEach((feature) => {
      if (!block_dic.hasOwnProperty(feature.get("region"))) {
        block_dic[feature.get("region")] = new VectorSource();
      }
      block_dic[feature.get("region")].addFeature(feature);
    });

    for (const region in block_dic) {
      if (Object.hasOwnProperty.call(block_dic, region)) {
        let cluster = new Cluster({
          source: block_dic[region],
          distance: config.region_distance,
        });

        RegionCluster.push(
          new VectorLayer({
            source: cluster,
            style: regionClusterStyle,
          })
        );
      }
    }
    return RegionCluster;
  }
}

export function GetCluster(blocks) {
  if (NormalCluster !== null) {
    return NormalCluster;
  } else {
    let source = new VectorSource();
    source.addFeatures(GetPointFeatures(blocks));
    let cluster = new Cluster({
      source: source,
      distance: config.normal_distance,
    });

    NormalCluster = new VectorLayer({
      source: cluster,
      style: new Style()
    });
    return NormalCluster;
  }
}
function regionClusterStyle(feature) {
  const size = feature.get("features").length;
  const block_name = feature.get("features")[0].get("region");
  if (size > 1) {
    return [
      // outer style
      new Style({
        image: new CircleStyle({
          radius: Math.sqrt(Math.log(size + 3) * 150),
          fill: outerCircleFill,
        }),
      }),

      // inner
      new Style({
        image: new CircleStyle({
          radius: Math.sqrt(Math.log(size + 3) * 150) - 5,
          fill: innerCircleFill,
        }),
        text: new Text({
          text: block_name,
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

function blockClusterStyle(feature) {
  const size = feature.get("features").length;
  const block_name = feature.get("features")[0].get("sub_region");
  if (size > 1) {
    return [
      // outer style
      new Style({
        image: new CircleStyle({
          radius: Math.sqrt(Math.log(size + 3) * 250),
          fill: outerBlueFill,
        }),
      }),

      // inner
      new Style({
        image: new CircleStyle({
          radius: Math.sqrt(Math.log(size + 3) * 250) - 5,
          fill: innerBlueFill,
        }),
        text: new Text({
          text: block_name,
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
  color: "rgba(255, 153, 102, 0.0)",
});
const innerCircleFill = new Fill({
  color: "rgba(255, 165, 0, 0.0)",
});
const outerBlueFill = new Fill({
  color: "rgba(131, 188, 255, 0.0)",
});
const innerBlueFill = new Fill({
  color: "rgba(84, 160, 255, 0.0)",
});
const textFill = new Fill({
  color: "#fff",
});
const textStroke = new Stroke({
  color: "rgba(0, 0, 0, 0.6)",
  width: 3,
});
