import { defineStore } from "pinia";
import { config } from "../../config";

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
            current_solutions_scale: [],
        };
    },
    actions: {
        ChangeCurrentSolutions(top_solutions) {
            this.current_solutions = top_solutions;
        },
        ChangeCurrentScale(current_scale) {
            this.current_solutions_scale = current_scale.slice(0, 100)
        },
        async ComputeGlobalRankFrequency(involved_criterias) {

        },
        // current_criterias {name,weight}
        async Compute2WayRange(involved_criterias_top, involved_criterias_bottom, current_criterias) {

        },

        // current_criterias {name,weight}
        async Compute3WayRange(involved_criterias, current_criterias) {
            // 
            let change = {
                notChangeCurrent: [],
                currentStillInTop: [],
                topStillHasSb: []
            }
            let step = 1 / 30;
            let end = 1;

            // time complexity: 30*30 * 100 * n; 90000
            let static_criterias = current_criterias.filter(d => !involved_criterias.includes(d.name));

            let record_scores = [];

            if (this.current_solutions.length > 1) {

                this.current_solutions.forEach((d, i) => {
                    let score = 0;

                    static_criterias.forEach(c => score += this.current_solutions_scale[i][c.name] * c.weight)

                    record_scores.push({ index: i, score, new_score: 0 })
                })


                for (let c1 = step; c1 <= end - step; c1 += step) {
                    for (let c2 = step; c2 + c1 <= end - step; c2 += step) {
                        let c3 = 1 - (c1 + c2);

                        record_scores.forEach((d, i) => {
                            let ic1 = this.current_solutions_scale[i][involved_criterias[0]] * c1;
                            let ic2 = this.current_solutions_scale[i][involved_criterias[1]] * c2;
                            let ic3 = this.current_solutions_scale[i][involved_criterias[2]] * c3;

                            record_scores[i].new_score = record_scores[i].score + ic1 + ic2 + ic3;
                        })

                        let n_record_scores = record_scores.map(d => d);
                        n_record_scores.sort((a, b) => a.new_score - b.new_score);

                        if (n_record_scores[0].index === 0) {
                            change.notChangeCurrent.push([c1, c2, c3]);
                        }

                        let flag = false;
                        for (let i = 0; i < n_record_scores.length; i++) {
                            const d = n_record_scores[i];
                            if (i < 5) {
                                if (d.index < 5) {
                                    flag = true;
                                }
                                if (d.index === 0) {
                                    change.currentStillInTop.push([c1, c2, c3]);
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }

                        if (flag) {
                            change.topStillHasSb.push([c1, c2, c3]);
                        }
                    }
                }

            }

            return change;
        }
    },
});
