import Supercluster from "supercluster";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import {
  GetBlocks,
  GetRegions,
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
} from "../../database/query.js";

export const block_data = {
  data: null,
  featureLayer: new VectorLayer(),
  superCluster: null,
  details_map: {},
};

export async function GetBlockData() {
  if (block_data.data === null) {
    block_data.data = await GetBlocks();

    block_data.data.forEach((d) => (block_data[d.name] = d));
  }
}

class Geo {
  constructor(name, lat, lng) {
    this.type = "Feature";
    this.geometry = {
      type: "Point",
      coordinates: [lng, lat],
    };
    this.properties = {
      name: name,
    };
  }
}

export function GetClusterCoord(cluster_id) {}

export function GetFeatures(zoom, currentExtent) {
  if (block_data.data !== null) {
    // Make SuperCluster
    if (block_data.superCluster === null) {
      let geo = [];
      for (let i = 0; i < block_data.data.length; i++) {
        const element = block_data.data[i];
        geo.push(new Geo(element.block, element.lat, element.lng));
      }
      block_data.superCluster = new Supercluster({
        maxZoom: 16,
        minZoom: 7,
        radius: 30,
      });
      block_data.superCluster.load(geo);
    }

    let geo = block_data.superCluster.getClusters(currentExtent, zoom);
    let features = [];
    for (let i = 0; i < geo.length; i++) {
      const element = geo[i];
      if (element.properties.cluster) {
        let f = block_data.superCluster.getLeaves(
          element.properties.cluster_id
        );
        f[0].properties.real_coord = element.geometry.coordinates;
        f[0].properties.contained_features = block_data.superCluster.getLeaves(
          element.properties.cluster_id
        );
        features.push(f[0]);
      } else {
        let f = element;
        f.properties.real_coord = element.geometry.coordinates;
        f.properties.contained_features = [element];
        features.push(element);
      }
    }
    return features;
  }
  return [];
}
