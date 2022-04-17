<template>
  <div id="MapView">

    <!-- The Map -->
    <div class="map-frame">
      <div id="BaiduMap"></div>
    </div>

    <div class="zoom-slider">
      <el-button :icon="LocationFilled" style="margin-bottom: 1vh" @click="ResetPosition" circle>
      </el-button>
      <el-slider v-model="data.zoom" @input="SetZoom" :step="0.1" :max="20" :min="10" vertical>
      </el-slider>
    </div>

    <div style="height: 8vh;">
      <el-button @click="GetData">GetData</el-button>
      <el-button @click="AddPoint">Add RandomPoint</el-button>
      <time-line></time-line>
    </div>
  </div>
</template>

<script setup>
import { theme } from "./Map/style";
import TimeLine from './TimeLine.vue';
import { GetCurrentRecord } from "../database/query.js";
import { ref, reactive, onMounted, watch } from "vue";
import { LocationFilled } from "@element-plus/icons-vue";
import { initBaiduMap } from "./Map/baidumap.js";

const df_lng = 116.404;
const df_lat = 39.915;
const df_zoom = 15;

const data = reactive({
  center: {
    lng: df_lng,
    lat: df_lat
  },
  zoom: df_zoom,
})

let marks = []

let ak = "ODpi3pGmHfZFVpQTCEfb90yE1hcNMuWA"
let BMapGL = null
let mapInstance = null


onMounted(() => {
  initBaiduMap("BaiduMap", ak, { minZoom: 10, maxZoom: 20 }).then(map => {
    map.Instance.centerAndZoom(data.center, data.zoom);
    BMapGL = map.BMapGL;
    mapInstance = map.Instance;
    mapInstance.enableScrollWheelZoom();
    mapInstance.setMapStyleV2({ styleJson: theme });
    mapInstance.addEventListener('zooming', () => {
      if (zoomThrottle != null) {
      }
      else {
        data.zoom = mapInstance.getZoom()
      }
    }
    );


    console.log(mapvgl);
    var mapvgl = window.mapvgl;
    var view = new mapvgl.View({
      map: mapInstance
    });


    var clusterLayer = new mapvgl.ClusterLayer({
      minSize: 30, // 聚合点显示的最小直径
      maxSize: 50, // 聚合点显示的最大直径
      clusterRadius: 150, // 聚合范围半径
      gradient: { 0: 'blue', 0.5: 'white', 1.0: 'red' }, // 聚合点颜色梯度
      maxZoom: 15, // 聚合的最大级别，当地图放大级别高于此值将不再聚合
      minZoom: 5, // 聚合的最小级别，当地图放大级别低于此值将不再聚合
      // 是否显示文字
      showText: true,
      // 开始聚合的最少点数，点数多于此值才会被聚合
      minPoints: 5,
      // 设置文字样式
      textOptions: {
        fontSize: 12,
        color: 'white',
        // 格式化数字显示
        format: function (count) {
          return count >= 10000 ? Math.round(count / 1000) + 'k'
            : count >= 1000 ? Math.round(count / 100) / 10 + 'k' : count;
        }
      },

      enablePicked: true,
      onClick(e) {
        if (e.dataItem) {
          // 可通过dataItem下面的children属性拿到被聚合的所有点
          console.log(e.dataItem);
        }
      }
    });

    var randomCount = 7000;

    // 构造数据
    while (randomCount--) {
      marks.push({
        geometry: {
          type: 'Point',
          coordinates: [df_lng - 0.5 + Math.random(), df_lat - 0.5 + Math.random()]
        },
        properties: {
          width: randomCount % 2 === 0 ? 100 / 4 : 30,
          height: randomCount % 2 === 0 ? 153 / 4 : 30
        }
      });
    }
    view.addLayer(clusterLayer);
    clusterLayer.setData(marks);
  });
});

let zoomThrottle = null
let zoomScale = df_zoom;
function SetZoom(newVal) {
  zoomScale = newVal;
  if (zoomThrottle == null) {
    zoomThrottle = setTimeout(() => {
      mapInstance.setZoom(zoomScale);
      zoomThrottle = null;
    }, 100)
  }
}

function ResetPosition() {
  mapInstance.centerAndZoom({ lng: df_lng, lat: df_lat }, df_zoom);
  data.center = { lng: df_lng, lat: df_lat };
  data.zoom = df_zoom;
}

function GetData() {

}
function AddPoint() {

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
#MapView {
  height: 58vh;
}

#BaiduMap {
  width: 100%;
  height: 100%;
  border: solid gray 2px;
  border-radius: 15px;
}

.map-frame {
  width: 98%;
  height: 90%;
  margin: 1%;
}

.anchorBL {
  opacity: 100%;
  display: none;
}

.zoom-slider {
  display: inline;
  position: absolute;
  top: 15vh;
  height: 15vh;
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.5));
  left: 3vw;
  z-index: 6;
  cursor: default;

  >div {
    height: 20vh;

    .el-slider__runway {
      background-color: white !important;
    }
  }
}
</style>

