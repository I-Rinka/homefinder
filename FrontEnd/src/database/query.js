import axios from "axios";
let url = "http://localhost:27727/api/";

export async function SelectHouseByRegion(region_name, controller) {
  let query_url = url + "selecthouse/";
  let res = await axios.get(query_url, {
    params: {
      mode: "fromRegion",
      region: region_name,
    },
    signal: controller ? controller.signal : undefined,
  });
  let resObj = res.data;
  return resObj;
}

export async function GetBlocksAvgPrice(blocks, controller) {
  let query_url = url + "avgprice/";
  let res = await axios.post(query_url, blocks, {
    signal: controller ? controller.signal : undefined,
  });
  let resObj = res.data;
  return resObj[0];
}

export async function GetBlocksAvgPriceYearMonth(
  blocks,
  year,
  month,
  controller
) {
  let query_url = url + "avgprice/";
  let res = await axios.post(query_url, blocks, {
    params: {
      year,
      month,
    },
    signal: controller ? controller.signal : undefined,
  });
  let resObj = res.data;
  return resObj[0];
}

export async function GetBlocksAvgPriceAllTime(blocks, controller) {
  let query_url = url + "avgprice/";
  try {
    let res = await axios.post(query_url, blocks, {
      params: {
        year: "*",
      },
      signal: controller ? controller.signal : undefined,
    });
    let resObj = res.data;

    return resObj;
  } catch (error) {
    throw error;
  }
}

export async function GetRegionPrice(region_name, controller) {
  let query = url + "regionprice";
  try {
    let res = await axios.get(query, {
      params: {
        region: region_name,
      },
      signal: controller ? controller.signal : undefined,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function GetSubRegionAvgPriceYearMonth(sub_region, controller) {
  let query = url + "subregionprice";
  console.log("requet sub_region");
  try {
    let res = await axios.get(query, {
      params: {
        sub_region: sub_region,
      },
      signal: controller ? controller.signal : undefined,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function GetNewestRecords() {
  let res = await axios.get("http://localhost:3000/newest_records.json");
  return res.data;
}

export async function GetBlocks() {
  let res = await axios.get("http://localhost:3000/block_data.json");
  return res.data;
}

export async function GetRegions() {
  let res = await axios.get("http://localhost:3000/region_coord.json");
  return res.data;
}

export async function GetSubRegions() {
  let res = await axios.get("http://localhost:3000/sub_region_coord.json");
  return res.data;
}
