import { defineStore } from "pinia";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application

class Criteria {
  name: string;
  color: string;
  weight?: number;
  enabled?: boolean;
  type: string;
  label: string;
  constructor(name: string, color: string, enabled?: boolean, weight?: number) {
    this.name = name;
    this.color = color;
    this.weight = weight ? weight : 0;
    this.enabled = enabled;
    this.type = "criteria";
    this.label = name;
    if (this.label.includes("_")) {
      let arr = this.label.split("_");
      this.label = arr.join(" ");
    }
  }
}

class UserMark extends Criteria {
  ol_uid: string;
  // lng lat
  coord: [number, number];
  constructor(
    name: string,
    color: string,
    coord: [number, number],
    ol_uid: string,
    weight?: number
  ) {
    super(name, color, false, weight);

    this.ol_uid = ol_uid;
    this.coord = coord;
    this.type = "userMark";
  }
}

export const useStore = defineStore("weight", {
  state: () => {
    let criterias: Criteria[] = [];
    return {
      count: 0,
      criterias: criterias,
      criterias_map: new Map(),
    };
  },
  getters: {
    overall() {
      let sum = 0;
      this.criterias.forEach((d) => {
        sum += d.weight;
      });
      return sum;
    },
  },
  actions: {
    GetCriterias(expected_names?: Array<string>, is_all?: boolean): Criteria[] {
      if (!expected_names) {
        return this.criterias.filter((x: Criteria) =>
          is_all ? true : x.enabled
        );
      }

      let name_s = new Set(expected_names);
      return this.criterias
        .filter((x: Criteria) => (is_all ? true : x.enabled))
        .filter((x: Criteria) => name_s.has(x.name));
    },
    GetCriteria(expected_name: string, is_all?: boolean): Criteria {
      // added cache
      if (!this.criterias_map.get(expected_name)) {
        const found = this.criterias
          .filter((x: Criteria) => (is_all ? true : x.enabled))
          .find((element) => element.name == expected_name);

        if (found) {
          this.criterias_map.set(expected_name, found);
        }
        return found;
      }
      return this.criterias_map.get(expected_name);
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
      this.criterias.push(this.CreateCriteria(name, color, enabled, weight));
    },
    AddUserMark(
      name: string,
      color: string,
      coord: [number, number],
      ol_uid: string
    ) {
      let w = this.GetDefaultWeight();
      console.log("weight", w);
      let user_mark = new UserMark(name, color, coord, ol_uid, w);

      // console.log(user_mark instanceof UserMark);
      this.criterias.push(user_mark);
      return w;
    },
    RemoveUserMark(ol_uid: string) {
      const findIndex = this.criterias.findIndex(
        (d: Criteria) =>
          d.type == "userMark" && (d as UserMark).ol_uid == ol_uid
      );

      if (findIndex === -1) {
        return;
      }

      let enlarge = 1 / (1 - this.criterias[findIndex].weight);
      this.criterias_map.delete(this.criterias[findIndex].name);
      this.criterias.splice(findIndex, 1);

      for (let index = 0; index < this.criterias.length; index++) {
        this.criterias[index].weight *= enlarge;
      }
      // make overall equals 1, and delete map
    },
    CreateCriteria(
      name: string,
      color?: string,
      enabled?: boolean,
      weight?: number
    ): Criteria {
      let w =
        weight != undefined && 0 < weight && weight < 1
          ? weight
          : this.GetDefaultWeight();

      console.log("get w", w);

      let c = color ? color : "grey";
      let e = enabled ? enabled : false;

      return new Criteria(name, c, e, w);
    },
    GetDefaultWeight() {
      let reduce_proportion =
        this.criterias.length / (this.criterias.length + 1);

      let sum_weights = 0;
      for (let i = 0; i < this.criterias.length; i++) {
        this.criterias[i].weight *= reduce_proportion;
        console.log("reduced:", this.criterias[i].weight);
        sum_weights += this.criterias[i].weight;
      }
      return 1 - sum_weights;
    },
  },
});
