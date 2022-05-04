import { defineStore } from "pinia";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application

class Criteria {
  name: string;
  color: string;
  weight?: number;
  enabled?: boolean;
  constructor(name: string, color: string, enabled?: boolean, weight?: number) {
    this.name = name;
    this.color = color;
    this.weight = weight ? weight : 0;
    this.enabled = enabled;
  }
}

export const useStore = defineStore("weight", {
  state: () => {
    let weights: Criteria[] = [];
    return {
      count: 0,
      weights: weights,
    };
  },
  actions: {
    GetCriterias(expected_names: Array<string>): Criteria[] {
      let name_s = new Set(expected_names);
      return this.weights.filter((x: Criteria) => name_s.has(x.name));
    },
    GetCriteria(expected_name: string): Criteria {
      const found = this.weights.find(
        (element) => element.name == expected_name
      );
      return found as Criteria;
    },
    GetCriterisNames(exclude_names?: string[]) {
      let name_s = new Set(exclude_names);
      return this.weights
        .filter((x: Criteria) => !name_s.has(x.name))
        .map((x) => x.name);
    },
    AddCriteria(
      name: string,
      color?: string,
      enabled?: boolean,
      weight?: number
    ) {
      let reduce_proportion = this.weights.length / (this.weights.length + 1);

      let w = weight;
      if (w != undefined && 0 < weight && weight < 1) {
        w = weight;
      } else {
        let sum_weights = 0;
        for (let i = 0; i < this.weights.length; i++) {
          this.weights[i].weight *= reduce_proportion;
          sum_weights += this.weights[i].weight;
        }
        w = 1 - sum_weights;
      }

      let c = color ? color : "grey";
      let e = enabled ? enabled : false;

      const new_criteria = new Criteria(name, c, e, w);
      this.weights.push(new_criteria);
    },
  },
});
