<template>
  <div>
    <baidu-map :center="center" :zoom="zoom" id="bm-view" >
      <div class="zoom-slider">
        <el-slider v-model="zoom" :step="0.5" :max="20" vertical> </el-slider>
      </div>
    </baidu-map>
  </div>
</template>

<script>
const center = {
  lng: 116.404,
  lat: 39.915,
};
const df_zoom = 12;

export default {
  name: "MapView",
  data() {
    return { center: { lng: 0, lat: 0 }, zoom: 3 };
  },
  mounted() {
    this.$set(this, "center", center);
    this.zoom = df_zoom;

    document.getElementById("bm-view").childNodes[0].style.borderRadius =
      "20px";
    document.getElementById("bm-view").childNodes[0].style.border =
      "rgb(200,200,200) 3px solid";
  },
  methods: {
    ScrollMap(ev) {
      console.log(ev);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
#bm-view {
  width: 98%;
  height: 50vh;
  margin: 1%;
}
.zoom-slider {
  display: inline;
  position: absolute;
  top: 15vh;
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.5));
  right: 2vw;
  z-index: 2;
  > div {
    height: 20vh;
    .el-slider__runway {
      background-color: white !important;
    }
  }
}
</style>

