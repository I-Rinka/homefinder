import { defineStore } from "pinia";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application

// for (let i = 0; i < data.scaled_records.length; i++) {
//     if (!CheckFilter(i)) continue; // filtering

//     let record = data.scaled_records[i];
//     let s = 0;
//     for (let j = 0; j < enabled_strip.value.length; j++) {
//       let d = enabled_strip.value[j];
//       s += record[d.name] * d.weight;
//     }
//     let obj = { index: i, score: s };
//     scores.push(obj);
//   }
//   console.log("computed_ranking_score", scores);

//   scores.sort((a, b) => {
//     return a.score - b.score;
//   });

export const useRankStore = defineStore("rankstore", {
    state: () => {
        return {
            current_solutions: [],
            nominal_mapping: null,
            quantitative_mapping: null
        };
    },
    actions: {
        ChangeCurrentSolutions(top_solutions) {
            this.current_solutions = top_solutions;
        },
        ChangeNominalMapping(nominal_mapping) {
            this.nominal_mapping = nominal_mapping
        },
        // true 就是越低越好
        ChangeQuantitativeMapping(quantitative_mapping) {
            this.quantitative_mapping = quantitative_mapping
        },
    },
});
