<template>
    <div :id="props.feature.getGeometry().getCoordinates().toString()">hello</div>
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount, onMounted, onUnmounted } from "@vue/runtime-core";
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
    console.log("unmount")
    props.map.removeOverlay(overlay);
})
</script>

<style>
</style>