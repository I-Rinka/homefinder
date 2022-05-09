import { defineStore } from "pinia";
import { block_data, GetBlockData } from "../Map/cluster";
import {
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
  GetBlocksAvgPriceAllTime,
  GetRegionPrice,
  SelectHouseByRegion,
} from "../../database/query";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application

let block_data_map = null;

export const useHouseStore = defineStore("selectedHouse", {
  state: () => {
    return {
      selectedHouse: {},
    };
  },
  getters: {
    selectedHouseArrary() {
      let arr = [];
      for (const key in this.selectedHouse) {
        if (Object.hasOwnProperty.call(this.selectedHouse, key)) {
          const element = this.selectedHouse[key];
          arr.push(element);
        }
      }
      return arr;
    },
  },
  actions: {
    AddHouseByRegionName: async function (region_name) {
      try {
        let res = await SelectHouseByRegion(region_name);
        res.forEach((d) => this.AddHouse(d.block));
      } catch (error) {
        console.log("error!", error);
      }
    },
    ConstructBlockDataMap: async function () {
      if (block_data.data === null) {
        block_data.data = await GetBlocks();
      }
      if (block_data_map === null) {
        block_data_map = {};
        block_data.data.forEach((d) => {
          block_data_map[d.block] = d;
        });
      }
    },
    AddHouse: async function (house_name) {
      await this.ConstructBlockDataMap();
      this.selectedHouse[house_name] = block_data_map[house_name];
    },
    RemoveHouse: async function (house_name) {
      delete this.selectedHouse[house_name];
    },
  },
});
