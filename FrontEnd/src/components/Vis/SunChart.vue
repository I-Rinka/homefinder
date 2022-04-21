<template>
    <div>

        <svg viewBox="0 0 100 100" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <circle class="arc" cx="50%" cy="50%" r="50" fill="none" :stroke="color_array[1]" stroke-width="15"
                stroke-linecap="round" stroke-dasharray="314.16" 
                :style="{ strokeDashoffset: arclen }" />
            <!-- <circle cx="50%" cy="50%" r="100" fill="none" stroke="blue" stroke-width="15" stroke-dashoffset="200" -->
            <!-- stroke-dasharray="300" transform="rotate(-90 60 60)" stroke-linecap="round" /> -->
        </svg>

    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "@vue/reactivity";
import { computed, watch } from "@vue/runtime-core";
import * as d3 from "d3";

let color_array = d3.schemeSet1;
const data = reactive({
    angle: 180
})
if (data.angle < 0) data.angle = 0;
if (data.angle > 360) data.angle = 360;
const arclen = computed(() => Math.PI * 50 * (360 - data.angle) / 180.0)

/* Convert to path length using formula r * θ (radians) */
/* Set stroke-dashoffset attribute to new arc length */

</script>

<style lang="less" scoped>
.arc {
    transition: 0.5s;
}
</style>