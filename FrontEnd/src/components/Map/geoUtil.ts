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
  return getDistanceFromLatLonInKm(coord1[1], coord1[0], coord2[1], coord2[0]);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function GetBlockCoord(block_name: string): [number, number] {
  let block_detail = block_data.details_map[block_name];
  if (block_data.data === null || !block_detail) {
    return config.center as [number, number];
  }
  return [block_detail.lng, block_detail.lat];
}