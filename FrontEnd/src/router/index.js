import Vue from "vue";
import Router from "vue-router";
import Index from "@/components/Index";
import BaiduMap from "vue-baidu-map";

Vue.use(Router);
Vue.use(BaiduMap, {
  ak: "ODpi3pGmHfZFVpQTCEfb90yE1hcNMuWA"
});

export default new Router({
  routes: [
    {
      path: "/",
      name: "Index",
      component: Index
    }
  ]
});
