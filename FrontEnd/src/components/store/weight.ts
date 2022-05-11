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
    let criterias: Criteria[] = [];
    return {
      count: 0,
      criterias: criterias,
    };
  },
  actions: {
    GetCriterias(expected_names?: Array<string>, is_all?: boolean): Criteria[] {
      if (!expected_names) {
        return this.criterias
          .filter((x: Criteria) => (is_all ? true : x.enabled))
      }

      let name_s = new Set(expected_names);
      return this.criterias
        .filter((x: Criteria) => (is_all ? true : x.enabled))
        .filter((x: Criteria) => name_s.has(x.name));
    },
    GetCriteria(expected_name: string, is_all?: boolean): Criteria {
      const found = this.criterias
        .filter((x: Criteria) => (is_all ? true : x.enabled))
        .find((element) => element.name == expected_name);
      return found;
    },
    GetCriteriaNames(exclude_names?: string[], is_all?: boolean) {
      let name_s = new Set(exclude_names);
      return this.criterias
        .filter((x: Criteria) => (is_all ? true : x.enabled))
        .filter((x: Criteria) => !name_s.has(x.name))
        .map((x) => x.name);
    },
    AddCriteria(
      name: string,
      color?: string,
      enabled?: boolean,
      weight?: number
    ) {
      this.weights.push(this.CreateCriteria(name, color, enabled, weight));
    },
    CreateCriteria(
      name: string,
      color?: string,
      enabled?: boolean,
      weight?: number
    ): Criteria {
      let reduce_proportion =
        this.criterias.length / (this.criterias.length + 1);

      let w = weight;
      if (w != undefined && 0 < weight && weight < 1) {
        w = weight;
      } else {
        let sum_weights = 0;
        for (let i = 0; i < this.criterias.length; i++) {
          this.criterias[i].weight *= reduce_proportion;
          sum_weights += this.criterias[i].weight;
        }
        w = 1 - sum_weights;
      }

      let c = color ? color : "grey";
      let e = enabled ? enabled : false;

      return new Criteria(name, c, e, w);
    },
  },
});
