<template>
  <div>
    <baidu-map :center="center" :zoom="zoom" id="bm-view"> </baidu-map>
  </div>
</template>

<script>
export default {
  name: "MapView",
  data() {
    return { center: { lng: 0, lat: 0 }, zoom: 3 };
  },
  mounted() {
    this.center.lng = 116.404;
    this.center.lat = 39.915;
    this.zoom = 15;

    document.getElementById("bm-view").childNodes[0].style.borderRadius =
      "50px";
    document.getElementById("bm-view").childNodes[0].style.border =
      "rgb(200,200,200) 10px solid";
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#bm-view {
  width: 98%;
  height: 50vh;
  margin: 1%;
}
</style>

