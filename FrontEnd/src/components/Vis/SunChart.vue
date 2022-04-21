<template>
    <div>

        <svg viewBox="-50 -50 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
            <circle class="arc" cx="0" cy="0" fill="none" :stroke="color_array[1]" stroke-width="15"
                stroke-linecap="round" :style="{
                    r: radius, strokeDashoffset: `${GetDash(end, radius)}`, strokeDasharray: `${GetDash(0, radius)}`,
                    transform: `rotate(${GetRotation(end, GetOrientation([116.06000975863789, 39.73071710290948], [116.49163115248814, 40.173677867295204]))}deg)`
                }" />
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

let end = 280;
let radius = 20;

function GetDash(angle: number, radius: number): number {
    return Math.PI * radius * (360 - angle) / 180.0
}

function GetRotation(end: number, orientation: number): number {
    return -orientation - end / 2
}

function GetOrientation(my_coordinates: [number, number], target_coordinates: [number, number]): number {
    let normalized_coord = [target_coordinates[0] - my_coordinates[0], target_coordinates[1] - my_coordinates[1]]
    // first quartile
    if (normalized_coord[0] >= 0 && normalized_coord[1] >= 0) {
        return Math.atan2(normalized_coord[1], normalized_coord[0]) * 180 / Math.PI;
    }
    // second quartile
    else if (normalized_coord[0] < 0 && normalized_coord[1] >= 0) {
        return 180 - (Math.atan2(normalized_coord[1], -normalized_coord[0]) * 180 / Math.PI);
    }
    // third quartile
    else if (normalized_coord[0] < 0 && normalized_coord[1] < 0) {
        return 180 + (Math.atan2(-normalized_coord[1], -normalized_coord[0]) * 180 / Math.PI);
    }
    // forth quartile
    else if (normalized_coord[0] >= 0 && normalized_coord[1] < 0) {
        return 360 - (Math.atan2(-normalized_coord[1], normalized_coord[0]) * 180 / Math.PI);
    }
    return 0;
}

</script>

<style lang="less" scoped>
.arc {
    transition: 0.5s;
}
</style>