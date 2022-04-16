<template>
  <div>
    <map-view></map-view>
    <weight-view></weight-view>
  </div>
</template>

<script>
import MapView from "./MapView.vue";
import WeightView from "./WeightView.vue";
export default {
  components: { MapView, WeightView },
  name: "Index",
  data() {
    return {};
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.anchorBL {
  opacity: 100%;
  display: none;
}
</style>
