<template>
    <div class="timeline">
        <div class="runway">
            <slider-button
                :style="{ right: `${slider_pos}px`}">
            </slider-button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "@vue/runtime-core";
import SliderButton from "./TimeLine/SliderButton.vue";


let pressed = false;
let slider_pos = ref(0);
let slider_scale = ref(1);

onMounted(() => {
    let runway = document.getElementsByClassName("runway");
    for (let i = 0; i < runway.length; i++) {
        const element = runway[i];

        element.addEventListener('mousemove', (e) => {
            if (pressed) {
                slider_pos.value =
                    element.clientWidth - e.clientX;
            }
        })
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
</style>