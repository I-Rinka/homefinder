<template>
    <div style="pointer-events: none">
        <svg viewBox="-500 -500 1000 1000" width="800" height="800" xmlns="http://www.w3.org/2000/svg">
            <circle v-for="mark in user_marks" :key="mark.id" class="arc" cx="0" cy="0" fill="none" :stroke="mark.color"
                :r="mark.radius" stroke-linecap="round" :style="{
                    strokeWidth: `${mark.stroke_width}`,
                    strokeDashoffset: `${GetDash(mark.angle, mark.radius)}`,
                    strokeDasharray: `${GetDash(0, mark.radius)}`,
                    transform: `rotate(${mark.orientation}deg)`,
                }" />
        </svg>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "@vue/reactivity";
import { computed, onMounted, watch } from "@vue/runtime-core";
import * as d3 from "d3";

const props = defineProps<{
    myCoordinates: [number, number];
    marks: Array<any>;
}>();

let end = 280;
let angle = end;
/* 
    radius
    color
    stroke_width
    orientation
    angle
*/

const user_marks = computed(() =>
    props.marks.sort((a: any, b: any) => a.get('weight') - b.get('weight')).map(
        (feature: any, index: number) => {
            return {
                id: index,
                radius: (index + 2) * 14,
                color: feature.get("color"),
                stroke_width: 15,
                orientation: GetRotation(angle, GetOrientation(props.myCoordinates, feature.getGeometry().getCoordinates())),
                angle: angle, // todo: calculate distance
            }
        }
    )

)

onMounted(() => {
    console.log(props.marks);
});

function PrintData() {
    console.log(props.marks);
}

function GetDash(angle: number, radius: number): number {
    return (Math.PI * radius * (360 - angle)) / 180.0;
}

function GetRotation(end: number, orientation: number): number {
    return -orientation - end / 2;
}


// function GetDistance(feature: any) {
//     return Math.sqrt(
//         Math.pow(props.myCoordinates[0] - MarksAdaptor(feature).coordinates[0], 2) +
//         Math.pow(props.myCoordinates[1] - MarksAdaptor(feature).coordinates[1], 2)
//     );
// }

function GetOrientation(
    my_coordinates: [number, number],
    target_coordinates: [number, number]
): number {
    let normalized_coord = [
        target_coordinates[0] * 1000 - my_coordinates[0] * 1000,
        target_coordinates[1] * 1000 - my_coordinates[1] * 1000,
    ];
    // first quartile
    if (normalized_coord[0] >= 0 && normalized_coord[1] >= 0) {
        console.log("first");
        return (
            (Math.atan2(normalized_coord[1], normalized_coord[0]) * 180) / Math.PI
        );
    }
    // second quartile
    else if (normalized_coord[0] < 0 && normalized_coord[1] >= 0) {
        console.log("second");
        return (
            180 -
            (Math.atan2(normalized_coord[1], -normalized_coord[0]) * 180) / Math.PI
        );
    }
    // third quartile
    else if (normalized_coord[0] < 0 && normalized_coord[1] < 0) {
        console.log("third");
        return (
            180 +
            (Math.atan2(-normalized_coord[1], -normalized_coord[0]) * 180) / Math.PI
        );
    }
    // forth quartile
    else if (normalized_coord[0] >= 0 && normalized_coord[1] < 0) {
        console.log("forth");
        return (
            360 -
            (Math.atan2(-normalized_coord[1], normalized_coord[0]) * 180) / Math.PI
        );
    }
    return 0;
}
</script>

<style lang="less" scoped>
.arc {
    transition: 0.5s;
}
</style>