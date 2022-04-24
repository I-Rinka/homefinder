<template>
    <div class="timeline">
        <div class="runway">
            <div class="time-scale">
                <div class="year" v-for="year in data.time_series" :key="year.year">
                    <div class="first-month">
                        <span class="year-text">
                            {{ year.year }}
                        </span>
                    </div>
                    <template v-for="month, index in year.month" :key="month.toString() + year.toString()">
                        <div v-if="index != 0" class="month"></div>
                    </template>
                </div>
            </div>

            <slider-button :style="{ right: `${slider_pos}px` }">
            </slider-button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "@vue/runtime-core";
import SliderButton from "./TimeLine/SliderButton.vue";


let pressed = false;
let slider_pos = ref(0);

const data = reactive({
    time_series: []
})

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

    for (let i = 2012; i <= 2020; i++) {
        let month = []
        for (let j = 1; j <= 12; j++) {
            month.push(j);
        }
        data.time_series.push({ year: i, month: month });
    }
})

</script>

<style lang="less" scoped>
.timeline {
    height: 7vh;
    width: 100%;
    margin-bottom: 0px;
    position: relative;
}

.runway {
    position: absolute;
    height: 50%;
    top: 40%;
    width: 100%;
    background-color: rgb(234, 234, 234);
    overflow-y: visible;
    border: solid gray 2px;
    border-radius: 15px;
}

.month {
    display: inline-block;
    width: 2px;
    height: 50%;
    margin-left: 27px;
    position: relative;
    bottom: -22%;
    background-color: rgb(128, 128, 128);
    transition: 0.3s;

    &:hover {
        width: 5px;
        margin-left: 24px;
        height: 80%;
    }
}

.first-month {
    position: relative;
    display: inline-block;
    width: 3px;
    height: 85%;
    bottom: -17%;
    margin-left: 27px;
    background-color: rgb(128, 128, 128);
}

.year {
    position: relative;
    display: inline;
    height: 100%;
    width: 240px;

}

.year-text {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: rgb(128, 128, 128);
    font-weight: 500;
    font-size: 1px;
}

.time-scale {
    height: 100%;
    width: 100%;
    white-space: nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
    border-radius: 15px;
}
</style>