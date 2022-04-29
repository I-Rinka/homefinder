<template>
  <div class="button-frame">
    <div
      v-if="closable"
      v-show="!props.press"
      class="close-button"
      @click="CloseButton"
    >
      <el-icon class="close-icon"><circle-close-filled /></el-icon>
    </div>
    <div
      class="button"
      :style="{ backgroundColor: props.color, transform: pressed }"
    ></div>
  </div>
</template>

<script setup>
import { ref } from "@vue/reactivity";
import { computed } from "@vue/runtime-core";
import { CircleCloseFilled } from "@element-plus/icons-vue";

const emits = defineEmits(["close"]);

const pressed = computed(() =>
  props.pressed ? "scale(1.1, 1.1)" : "scale(1, 1)"
);

const props = defineProps({
  color: {
    type: String,
    default: "rgb(200, 26, 10)",
    required: false,
  },
  pressed: {
    type: Boolean,
    default: false,
    required: false,
  },
  closable: {
    type: Boolean,
    default: true,
    required: false,
  },
});

function CloseButton() {
  emits("close");
}
</script>

<style lang="less" scoped>
.button-frame {
  filter: drop-shadow(0.5px 0.5px 2px rgba(0, 0, 0, 0.5));
  position: inherit;
  top: -25%;
  height: 125%;
  width: 12px;
  transition: 0.1s;

  &:hover {
    filter: drop-shadow(0.5px 0.5px 3px rgba(0, 0, 0, 0.5));

    .button {
      transform: scale(1.1, 1.1) !important;
    }

    .close-button {
      top: -25px;
      transform: scale(1, 1);
    }
  }
}

.button {
  height: 100%;
  width: 100%;
  clip-path: polygon(0 0, 100% 0, 70% 30%, 70% 100%, 30% 100%, 30% 30%, 0 0);
  transition-duration: 0.2s;
}

.close-button {
  height: 20px;
  width: 20px;
  position: absolute;
  cursor: pointer;
  background-color: white;
  transition-delay: 0.5s;
  transition-duration: 0.5s;
  border-radius: 5px;
  top: 0px;
  left: -4px;
  transform: scale(0, 0);

  &:hover {
    .close-icon {
      color: rgb(184, 48, 31);
    }
  }
}

.close-icon {
  position: relative;
  top: 2px;
  transition-duration: 0.2s;
  color: rgb(96, 98, 102);
}
</style>