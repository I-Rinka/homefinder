<template>
    <div class="button-frame" :style="{ left: `${xOffset}px` }">
        <div class="button">
        </div>
    </div>
</template>

<script setup>
import { ref } from "@vue/reactivity";

let xOffset = ref(0);

</script>

<style>
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