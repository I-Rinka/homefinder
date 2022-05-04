import { defineStore } from "pinia";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application

class Criteria {
  name: string;
  color: string;
  weight?: number;
  constructor(name: string, color: string, weight?: number) {
    this.name = name;
    this.color = color;
    if (weight) {
      this.weight = weight;
    } else {
      this.weight = 0;
    }
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
    AddCriteria(name: string, color: string) {
      let reduce_proportion = this.weights.length / (this.weights.length + 1);
      let sum_weights = 0;

      for (let i = 0; i < this.weights.length; i++) {
        this.weights[i].weight *= reduce_proportion;
        sum_weights += this.weights[i].weight;
      }
      const new_criteria = new Criteria(name, color, 1 - sum_weights);
      this.weights.push(new_criteria);
    },
  },
});
