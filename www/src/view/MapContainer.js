import React, { Component } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import './MapContainer.css';

class MapComponent extends Component {
    constructor() {
        super();
        this.map = {};
    }
    // 2.dom渲染成功后进行map对象的创建
    componentDidMount() {
        AMapLoader.load({
            // 申请好的Web端开发者Key，首次调用 load 时必填
            key: "621905dca524a5af648104ca2858f78f",
            // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            version: "2.0",
            // 需要使用的的插件列表，如比例尺'AMap.Scale'等
            plugins: ['AMap.ToolBar', 'AMap.Driving', 'AMap.Geolocation'],
            AMapUI: {
                version: "1.1",
                plugins: ['overlay/SimpleMarker'],
            },
            Loca: {
                version: "2.0"
            },
        }).then((AMap) => {
            this.map = new AMap.Map("mapcontainer", {
                // 地图模式
                viewMode: "3D",
                zoom: 10
            });


            AMap.plugin('AMap.Geolocation', function () {
                var geolocation = new AMap.Geolocation({
                    // 是否使用高精度定位，默认：true
                    enableHighAccuracy: true,
                    // 设置定位超时时间，默认：无穷大
                    timeout: 10000,
                    // 定位按钮的停靠位置的偏移量
                    offset: [10, 20],
                    //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    zoomToAccuracy: true,
                    //  定位按钮的排放位置,  RB表示右下
                    position: 'RB'
                })

                geolocation.getCurrentPosition(function (status, result) {
                    if (status === 'complete') {
                        onComplete(result)
                    } else {
                        onError(result)
                    }
                });

                function onComplete(data) {
                    // data是具体的定位信息
                }

                function onError(data) {
                    // 定位出错
                }
            })

            // var toolbar = new AMap.ToolBar();
            // this.map.addControl(toolbar);
        }).catch(e => {
            console.log(e);
        })
    }
    render() {
        // 1.初始化创建地图容器,div标签作为地图容器，同时为该div指定id属性；
        return (
            <div id="mapcontainer" className="map" style={{ height: '800px' }} >
            </div>
        );
    }
}
//导出地图组建类
export default MapComponent;
