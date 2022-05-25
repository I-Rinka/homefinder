import { defineStore } from "pinia";
import { toRaw } from "vue";

export const useSunStore = defineStore("sunchart", {
  state: () => {
    return {
      onScreenPrice: { min: 0, max: 0 },
      opacity: 1,
      currentBlock: "",
      currentOnScreenBlocks: {},
      openCorona: false,
    };
  },
  getters: {
    minPrice() {
      let min = Number.MAX_VALUE;
      if (Object.keys(this.currentOnScreenBlocks).length <= 0) {
        return 10000;
      }
      for (const key in this.currentOnScreenBlocks) {
        if (
          Object.prototype.hasOwnProperty.call(this.currentOnScreenBlocks, key)
        ) {
          const element = this.currentOnScreenBlocks[key];
          if (element.unit_price < min) {
            min = element.unit_price;
          }
        }
      }
      return min;
    },
    maxPrice() {
      let max = 0;
      if (Object.keys(this.currentOnScreenBlocks).length <= 0) {
        return 50000;
      }
      for (const key in this.currentOnScreenBlocks) {
        if (
          Object.prototype.hasOwnProperty.call(this.currentOnScreenBlocks, key)
        ) {
          const element = this.currentOnScreenBlocks[key];
          if (element.unit_price > max) {
            max = element.unit_price;
          }
        }
      }
      return max;
    },
  },
  actions: {
    Hide() {
      this.opacity = 0.2;
    },
    Show() {
      this.opacity = 1;
      this.currentBlock = "";
    },
    SetHighlightBlock(block_name: string) {
      this.currentBlock = block_name;
    },
  },
});
