<template>
  <div>
    <map-view></map-view>
  </div>
</template>

<script>
import MapView from "./MapView.vue";
export default {
  components: { MapView },
  name: "Index",
  data() {
    return {};
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.anchorBL{
  opacity: 100%;
  display: none;
}
</style>
