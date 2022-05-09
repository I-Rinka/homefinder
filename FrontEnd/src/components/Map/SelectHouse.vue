<template>
  <div class="select-pannel"></div>
</template>

<script setup></script>

<style lang="less" scoped>
.select-pannel {
  width: 20vw;
  background-color: white;
  border-radius: 5px;

  animation: enter 0.3s;
}

@keyframes enter {
  from {
    transform: translateX(10px);
    opacity: 0;
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
