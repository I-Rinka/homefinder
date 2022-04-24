<template>
    <div class="timeline">
        <div class="runway">
            <div class="button" :style="{ left: `${xOffset}px` }"></div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, ref } from "@vue/runtime-core";

let xOffset = ref(0)

let pressed = false;

// pressed => move (element left) => 

onMounted(() => {
    let runway = document.getElementsByClassName("timeline");
    for (let i = 0; i < runway.length; i++) {
        const element = runway[i];

        element.addEventListener('mousemove', (e) => {
            if (pressed) {
                xOffset.value = e.clientX - 12
            }
        })
    }

    let button = document.getElementsByClassName("timeline");
    for (let i = 0; i < button.length; i++) {
        const element = button[i];

        element.addEventListener('pointerdown', (e) => {
            pressed = true;
        })
        element.addEventListener('pointerup', (e) => {
            pressed = false;
        })

        element.addEventListener('pointerleave', (e) => {
            pressed = false;
        })
    }
})
</script>

<style lang="less" scoped>
.timeline {
    height: 7vh;
    width: 100%;
    margin-bottom: 0px;
    position: relative;
    background-color: rgb(125, 125, 125);
}

.runway {
    position: absolute;
    height: 60%;
    top: 30%;
    width: 100%;
    background-color: ghostwhite;
}

.button {
    position: inherit;
    cursor: -webkit-grabbing;
    height: 100%;
    width: 6px;
    background-color: red;
}
</style>