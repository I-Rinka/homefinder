<template>
    <div :id="props.feature.getGeometry().getCoordinates().toString()">
        <div style="font-size:1px">
            {{ props.feature.getGeometry().getCoordinates()[0].toFixed(3) }} {{' , '}}
            {{ props.feature.getGeometry().getCoordinates()[1].toFixed(3) }}
        </div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from "@vue/runtime-core";
import Overlay from "ol/Overlay";

const props = defineProps({
    map: Object,
    feature: Object
})

let overlay = null;
onMounted(() => {
    overlay = new Overlay({
        element: document.getElementById(props.feature.getGeometry().getCoordinates().toString()),
        position: props.feature.getGeometry().getCoordinates()
    });
    props.map.addOverlay(overlay);
})

onBeforeUnmount(() => {
    props.map.removeOverlay(overlay);
})
</script>

<style>
</style>