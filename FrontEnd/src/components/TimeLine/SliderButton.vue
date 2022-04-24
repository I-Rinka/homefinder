<template>
    <div class="button-frame">
        <div class="button" :style="{ backgroundColor: props.color }">
        </div>
    </div>
</template>

<script setup>
import { ref } from "@vue/reactivity";
const props = defineProps({
    color: {
        type: String,
        default: "rgb(200, 26, 10)",
        required: false
    }
})
</script>

<style lang="less" scoped>
.button-frame {
    filter: drop-shadow(0.5px 0.5px 2px rgba(0, 0, 0, 0.5));
    cursor: -webkit-grabbing;
    position: inherit;
    top: -25%;
    height: 125%;
    width: 12px;

    &:hover {
        filter: drop-shadow(0.5px 0.5px 3px rgba(0, 0, 0, 0.5));

        .button {
            transform: scale(1.1, 1.1);
        }
    }
}

.button {
    height: 100%;
    width: 100%;
    clip-path: polygon(0 0, 100% 0, 70% 30%, 70% 100%, 30% 100%, 30% 30%, 0 0);
    transition-duration: 0.2s;
}
</style>