import { block_data, region_data } from "./cluster";
import { config } from "../../config";

// km
export function GetBlockToPointDistance(
  block_name: string,
  coord_lng_lat: [number, number]
) {
  if (block_data.data === null) {
    return 0;
  }
  return GetDistanceInKM(GetBlockCoord(block_name), coord_lng_lat);
}

function GetDistanceInKM(
  coord1: [number, number],
  coord2: [number, number]
): number {
  return 0;
}

export function GetBlockCoord(block_name: string): [number, number] {
  let block_detail = block_data.details_map[block_name];
  if (block_data.data === null || !block_detail) {
    return config.center as [number, number];
  }
  return [block_detail.lng, block_detail.lat];
}
