import { defineStore } from "pinia";

export const useSunStore = defineStore("sunchart", {
  state: () => {
    return {
      onScreenPrice: { min: 0, max: 0 },
      opacity: 1,
      currentBlock: "",
    };
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
