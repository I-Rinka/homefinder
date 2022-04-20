<template>
    <div>hello</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, onUnmounted } from "@vue/runtime-core";

onMounted(() => {
    console.log("mounted")
})

onUnmounted(() => {
    console.log("un mounted")
})
</script>

<style>
</style>