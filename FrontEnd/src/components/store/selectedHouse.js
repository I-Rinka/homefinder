import { defineStore } from "pinia";
import { block_data, GetBlockData } from "../Map/cluster";
import {
  GetBlocksAvgPrice,
  GetBlocksAvgPriceYearMonth,
  GetBlocksAvgPriceAllTime,
  GetRegionPrice,
  SelectHouseByRegion,
  GetBlocks,
} from "../../database/query";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application

let block_data_map = null;
let newDiv = null;

export const useHouseStore = defineStore("selectedHouse", {
  state: () => {
    return {
      selectedHouse: {},
      favoriteHouse: {},
      bannedHouse: {
        王府井大街: {},
        天创科技大厦: {},
        绿城百合公寓霁雪苑: {},
        凤凰城三期: {},
        珠江峰景: {},
      },
    };
  },
  getters: {
    selectedHouseArrary() {
      let arr = [];
      for (const key in this.selectedHouse) {
        if (
          Object.hasOwnProperty.call(this.selectedHouse, key) &&
          !Object.hasOwnProperty.call(this.bannedHouse, key)
        ) {
          const element = this.selectedHouse[key];
          arr.push(element);
        }
      }
      return arr;
    },
    bannedHouseArray() {
      let arr = [];
      for (const key in this.bannedHouse) {
        if (
          this.bannedHouse[key] &&
          block_data_map != null &&
          block_data_map[key]
        ) {
          arr.push(block_data_map[key]);
        }
      }
      return arr;
    },
    favoriteHouseArray() {
      let arr = [];
      for (const key in this.favoriteHouse) {
        if (
          this.favoriteHouse[key] &&
          block_data_map != null &&
          block_data_map[key]
        ) {
          const element = block_data_map[key];
          arr.push(element);
        }
      }
      return arr;
    },
  },
  actions: {
    IsSelectedHouse: function (name) {
      if (
        this.selectedHouse.hasOwnProperty(name) &&
        !this.bannedHouse.hasOwnProperty(name)
      ) {
        return true;
      }
      return false;
    },
    IsFavoriteHouse: function (name) {
      if (this.favoriteHouse[name]) {
        return true;
      }
      return false;
    },
    AddHouseByRegionName: async function (region_name) {
      try {
        let res = await SelectHouseByRegion(region_name);
        res.forEach((d) => this.AddHouse(d.block));
      } catch (error) {
        console.log("error!", error);
      }
    },
    AddHouse2BlackListByRegionName: async function (region_name) {
      try {
        let res = await SelectHouseByRegion(region_name);
        res.forEach((d) => this.AddToBlackList(d.block));
      } catch (error) {
        console.log("error!", error);
      }
    },
    AddHouse2FavoriteByRegionName: async function (region_name) {
      try {
        let res = await SelectHouseByRegion(region_name);
        res.forEach((d) => this.AddFavoriteHouse(d.block));
      } catch (error) {
        console.log("error!", error);
      }
    },
    RemoveHouseByRegionName: async function (region_name) {
      try {
        let res = await SelectHouseByRegion(region_name);
        res.forEach((d) => this.RemoveHouse(d.block));
      } catch (error) {
        console.log("error!", error);
      }
    },
    RemoveFavoriteHouseByRegionName: async function (region_name) {
      try {
        let res = await SelectHouseByRegion(region_name);
        res.forEach((d) => this.RemoveFavoriteHouse(d.block));
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
    AddFavoriteHouse: async function (house_name) {
      await this.ConstructBlockDataMap();
      this.favoriteHouse[house_name] = block_data_map[house_name];
    },
    AddToBlackList: async function (house_name) {
      await this.ConstructBlockDataMap();
      this.bannedHouse[house_name] = block_data_map[house_name];
    },
    RemoveHouse: async function (house_name) {
      delete this.selectedHouse[house_name];
    },
    RemoveFavoriteHouse: async function (house_name) {
      delete this.favoriteHouse[house_name];
    },
    RemoveBannedHouse: async function (house_name) {
      delete this.bannedHouse[house_name];
    },
    AddAnimation: function (start_ref) {
      let rect = start_ref.getBoundingClientRect();

      let previous = document.getElementsByClassName("add-animation");

      for (let i = 0; i < previous.length; i++) {
        previous[i].remove();
      }

      newDiv = document.createElement("div");
      const currentDiv = document.getElementById("app");
      currentDiv.append(newDiv);

      let x = document.getElementById("app").clientWidth;

      let x0 = rect.x + rect.width / 2;
      let x1 = x * 0.95;
      let y0 = rect.y + rect.height / 2;
      let y1 = 10;

      newDiv.style = `--x-start: ${x0}px; --y-start: ${y0}px; --x-mid: ${
        ((x1 - x0) * 2) / 3 + x0
      }px; --y-mid:${y1 - 15}px; --x-end: ${x1}px; --y-end:${y1}px`;
      newDiv.classList.add("add-animation");
    },
  },
});
