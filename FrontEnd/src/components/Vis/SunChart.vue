<template>
    <div class="sun-chart" style="pointer-events: none">
        <svg :viewBox="view_box" width="600" height="600" xmlns="http://www.w3.org/2000/svg">
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
import { GetDistance as QueryDistance } from "../../database/baiduquery";
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

let view_box = computed(() => {
    if (props.marks.length <= 5) {
        return "-500 -500 1000 1000"
    }
    else {
        let p = (props.marks.length - 5) * 100 + 1000
        let n = -((props.marks.length - 5) * 50 + 500)
        return `${n} ${n} ${p} ${p}`
    }
})

const user_marks = computed(() =>
    props.marks.sort((a: any, b: any) => a.get('weight') - b.get('weight')).map(
        (feature: any, index: number) => {
            let angle = GetAngle(feature);
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

function GetDash(angle: number, radius: number): number {
    return (Math.PI * radius * (360 - angle)) / 180.0;
}

function GetRotation(end: number, orientation: number): number {
    return -orientation - end / 2;
}


function GetDistance(feature: any) {
    return Math.sqrt(
        Math.pow(props.myCoordinates[0] * 100 - feature.getGeometry().getCoordinates()[0] * 100, 2) +
        Math.pow(props.myCoordinates[1] * 100 - feature.getGeometry().getCoordinates()[1] * 100, 2)
    );
}

function GetAngle(feature: any) {
    let angle = 5 / GetDistance(feature) * 360;
    angle = angle > 360 ? 360 : angle;
    return angle;
}

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
        return (
            (Math.atan2(normalized_coord[1], normalized_coord[0]) * 180) / Math.PI
        );
    }
    // second quartile
    else if (normalized_coord[0] < 0 && normalized_coord[1] >= 0) {
        return (
            180 -
            (Math.atan2(normalized_coord[1], -normalized_coord[0]) * 180) / Math.PI
        );
    }
    // third quartile
    else if (normalized_coord[0] < 0 && normalized_coord[1] < 0) {
        return (
            180 +
            (Math.atan2(-normalized_coord[1], -normalized_coord[0]) * 180) / Math.PI
        );
    }
    // forth quartile
    else if (normalized_coord[0] >= 0 && normalized_coord[1] < 0) {
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

.sun-chart {
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
}
</style>