<template>
    <div class="timeline">
        <div class="runway">
            <div class="button-frame" :style="{ left: `${xOffset}px` }">
                <div class="button">
                </div>
            </div>
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
    // background-color: rgb(125, 125, 125);
}

.runway {
    position: absolute;
    height: 50%;
    top: 40%;
    width: 100%;
    background-color: ghostwhite;
}

.button-frame {
    filter: drop-shadow(0.5px 0.5px 2px rgba(0, 0, 0, 0.5));
    cursor: -webkit-grabbing;
    position: inherit;
    top: -25%;
    height: 125%;
    width: 12px;
}

.button {
    height: 100%;
    width: 100%;
    clip-path: polygon(0 0, 100% 0, 70% 30%, 70% 100%, 30% 100%, 30% 30%, 0 0);
    background-color: rgb(200, 26, 10);
}
</style>