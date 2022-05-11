import { defineStore } from "pinia";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application

export const useRankStore = defineStore("rankstore", {
    state: () => {
        return {
            current_solutions: []
        };
    },
    actions: {
        ChangeCurrentSolutions(top3_solutions) {
            this.current_solutions = top3_solutions;
        }
    },
});
