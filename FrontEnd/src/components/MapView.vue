<template>
  <div id="MapView">
    <baidu-map id="bm-view" :center="center" :zoom="zoom" :scroll-wheel-zoom="true" :continuous-zoom="true"
      :max-zoom="20" :mapStyle="theme" @moving="SyncCenterAndZoom" @moveend="SyncCenterAndZoom"
      @zoomend="SyncCenterAndZoom">
      <div class="zoom-slider">
        <el-button circle style="margin-bottom: 1vh" size="big" @click="ResetPos"><i class="el-icon-map-location"></i>
        </el-button>
        <el-slider v-model="zoom" :step="0.1" :max="20" :min="10" vertical>
        </el-slider>
      </div>

      <bm-control> </bm-control>
    </baidu-map>
    <div style="height: 8vh;">
      <time-line></time-line>
    </div>
  </div>
</template>

<script>
import { theme } from "./Map/style";
import TimeLine from './TimeLine.vue';
const df_lng = 116.404;
const df_lat = 39.915;
const df_zoom = 15;

export default {
  name: "MapView",
  components: { TimeLine },
  data() {
    return { center: { lng: 0, lat: 0 }, zoom: 3, theme: { styleJson: theme } };
  },
  mounted() {
    this.ResetPos();

    document.getElementById("bm-view").childNodes[0].style.borderRadius =
      "20px";
    document.getElementById("bm-view").childNodes[0].style.border =
      "rgb(200,200,200) 3px solid";
    // document.getElementById("MapView").onmousewheel = this.ScrollMap;
  },
  methods: {
    ResetPos() {
      this.center.lng = df_lng;
      this.center.lat = df_lat;
      this.zoom = df_zoom;
      //   console.log("ff", center.lng, center.lat, df_zoom);
    },
    SyncCenterAndZoom(e) {
      const { lng, lat } = e.target.getCenter();
      this.center.lng = lng;
      this.center.lat = lat;
      this.zoom = e.target.getZoom();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
#MapView {
  height: 58vh;
}

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
  left: 2vw;
  z-index: 2;

  >div {
    height: 20vh;

    .el-slider__runway {
      background-color: white !important;
    }
  }
}
</style>

