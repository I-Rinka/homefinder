<template>
    <div>

        <svg viewBox="-50 -50 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
            <circle class="arc" cx="0" cy="0" r="30" fill="none" :stroke="color_array[1]" stroke-width="15"
                stroke-linecap="round" stroke-dasharray="188.5"
                :style="{ strokeDashoffset: arclen, transform: 'rotate(-90deg)' }" />
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
    angle: 270
})
if (data.angle < 0) data.angle = 0;
if (data.angle > 360) data.angle = 360;
const arclen = GetDash(data.angle, 30);
function GetDash(angle: number, stroke_width: number): number {
    return Math.PI * stroke_width * (360 - angle) / 180.0
}

console.log(GetDash(0, 30))

/* Convert to path length using formula r * θ (radians) */
/* Set stroke-dashoffset attribute to new arc length */

</script>

<style lang="less" scoped>
.arc {
    transition: 0.5s;
}
</style>