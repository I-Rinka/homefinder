var MapEsstential = {
    ak: "ODpi3pGmHfZFVpQTCEfb90yE1hcNMuWA",
    el: "BaiduMap",
    BMapGL: null,
    options: {},
    mapInstance: null
}

if (global === undefined) {
    var global = window;
}

export async function initBaiduMap(el, ak, options) {
    MapEsstential.ak = ak;
    MapEsstential.el = el;
    MapEsstential.options = options;
    MapEsstential.Instance = await getMapScript().then(initMap)
    return {
        BMapGL: MapEsstential.BMapGL,
        Instance: MapEsstential.Instance
    }
}


function initMap(BMapGL) {
    MapEsstential.BMapGL = BMapGL
    const map = new BMapGL.Map(MapEsstential.el, MapEsstential.options)
    window.mmmp=map;
    return map;
}

function getMapScript() {
    if (!global.BMapGL) {
        const ak = MapEsstential.ak
        global.BMapGL = {}
        global.BMapGL._preloader = new Promise((resolve, reject) => {
            global._initBaiduMap = function () {
                resolve(global.BMapGL)
                global.document.body.removeChild($script)
                global.BMapGL._preloader = null
                global._initBaiduMap = null
            }
            const $script = document.createElement('script')
            global.document.body.appendChild($script)
            $script.src = `https://api.map.baidu.com/api?type=webgl&v=1.0&ak=${ak}&callback=_initBaiduMap`
        })
        return global.BMapGL._preloader
    } else if (!global.BMapGL._preloader) {
        return Promise.resolve(global.BMapGL)
    } else {
        return global.BMapGL._preloader
    }
}