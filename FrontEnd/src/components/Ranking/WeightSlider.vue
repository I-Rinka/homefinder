<template>
    <div class="slider-demo-block">
        <el-slider v-model="store.count" vertical height="200px" />
    </div>
</template>

<script setup>

import { useStore } from "../store/weight";

const store = useStore();

</script>

<style>
.slider-demo-block {
    display: flex;
    align-items: center;
}

.slider-demo-block .el-slider {
    margin-top: 0;
    margin-left: 12px;
}
</style>