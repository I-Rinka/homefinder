import Supercluster from "supercluster";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import {
  GetBlocks,
  GetRegions,
  GetSubRegions,
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
} from "../../database/query.js";

export const block_data = {
  data: null,
  featureLayer: new VectorLayer(),
  superCluster: null,
  details_map: {},
};

export const region_data = {
  sub_region_data: null,
  region_data: null,
};

export async function GetRegionData() {
  if (region_data.region_data === null) {
    region_data.region_data = await GetRegions();
  }

  if (region_data.sub_region_data === null) {
    region_data.sub_region_data = await GetSubRegions();
  }
}

export async function GetBlockData() {
  if (block_data.data === null) {
    block_data.data = await GetBlocks();
    block_data.data.forEach(d => block_data.details_map[d.block] = d);
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

class Region extends Geo {
  constructor(name, lat, lng) {
    super(name, lat, lng);
    this.properties.type = "region";
  }
}

class SubRegion extends Geo {
  constructor(name, lat, lng) {
    super(name, lat, lng);
    this.properties.type = "sub_region";
  }
}

export function GetClusterCoord(cluster_id) { }

export function GetFeatures(zoom, currentExtent) {
  if (region_data.region_data !== null && zoom < 12.5) {
    let features = [];

    for (let i = 0; i < region_data.region_data.length; i++) {
      const d = region_data.region_data[i];
      features.push(new Region(d["region"], d["lat"], d["lng"]));
    }

    return features;
  }

  if (block_data.data !== null) {
    // Make SuperCluster
    if (block_data.superCluster === null) {
      let geo = [];
      for (let i = 0; i < block_data.data.length; i++) {
        const element = block_data.data[i];
        geo.push(new Geo(element.block, element.lat, element.lng));
      }
      block_data.superCluster = new Supercluster({
        maxZoom: 18,
        radius: 150,
        minZoom: 10,
      });
      block_data.superCluster.load(geo);
    }
    let ext_extend = [currentExtent[0] - 0.1, currentExtent[1] - 0.1, currentExtent[2] + 0.1, currentExtent[3] + 0.1]
    let geo = block_data.superCluster.getClusters(ext_extend, zoom - 1.2);
    let features = [];
    for (let i = 0; i < geo.length; i++) {
      const element = geo[i];
      if (element.properties.cluster) {

        if (zoom > 16) {
          let diff_region = {};
          let leaves = block_data.superCluster.getLeaves(
            element.id,
            Infinity
          ).map((d) => d);

          leaves.forEach(d => {
            let sub_region = block_data.details_map[d.properties.name].sub_region;
            if (!diff_region[sub_region]) {
              diff_region[sub_region] = [];
            }
            diff_region[sub_region].push(d);
          })

          for (const sub_region in diff_region) {
            if (Object.hasOwnProperty.call(diff_region, sub_region)) {
              const blocks = diff_region[sub_region];

              if (blocks[0].geometry.coordinates[0] >= currentExtent[0] && blocks[0].geometry.coordinates[1] >= currentExtent[1] && blocks[0].geometry.coordinates[0] <= currentExtent[2] && blocks[0].geometry.coordinates[1] <= currentExtent[3]) {
                let f = JSON.parse(JSON.stringify(blocks[0]));
                f.properties.real_coord = element.geometry.coordinates;

                f.properties.contained_features = blocks.map(d => d.properties.name);

                features.push(f);
              }
            }
          }
        }
        else {
          let leaves = block_data.superCluster.getLeaves(
            element.id,
            1
          );


          if (leaves[0].geometry.coordinates[0] >= currentExtent[0] && leaves[0].geometry.coordinates[1] >= currentExtent[1] && leaves[0].geometry.coordinates[0] <= currentExtent[2] && leaves[0].geometry.coordinates[1] <= currentExtent[3]) {
            let f = JSON.parse(JSON.stringify(leaves[0]));
            f.properties.real_coord = element.geometry.coordinates;

            f.properties.contained_features = block_data.superCluster.getLeaves(
              element.id,
              Infinity
            ).map((d) => d.properties.name);

            features.push(f);
          }
        }
      } else {
        let f = element;
        if (f.geometry.coordinates[0] >= currentExtent[0] && f.geometry.coordinates[1] >= currentExtent[1] && f.geometry.coordinates[0] <= currentExtent[2] && f.geometry.coordinates[1] <= currentExtent[3]) {
          f.properties.real_coord = element.geometry.coordinates;
          f.properties.contained_features = [element.properties.name];
          features.push(element);
        }
      }
    }
    return features;
  }
  return [];
}
