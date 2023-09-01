/*
建筑物示意图：查看和搜索漳浦小区楼栋地图
*/
import React from 'react';
import {
    Input, Button, Image
} from 'antd';
import {
    wechatSign,
    allBuildingInfos
} from '../api/api';
const { Search } = Input;

class Building extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: '',
            buildingAfterFilter: []
        };
    };

    componentDidMount = async () => {
        let buildingInfos = await allBuildingInfos();
        this._weixin = buildingInfos.weixin;
        this._buildings = buildingInfos.buildings;

        this.showBuildingByKeyword();
        this.updateWeixinConfig();
    };

    showBuildingByKeyword = async () => {
        const { keyword } = this.state;
        // console.log(keyword);

        let buildingAfterFilter = [];

        if (keyword && keyword !== '') {
            for (let i = 0; i < this._buildings.length; ++i) {
                let building = this._buildings[i];

                if (building?.name?.indexOf(keyword) !== -1) {
                    buildingAfterFilter.push(building);
                }
            }
        }

        this.setState({ buildingAfterFilter: buildingAfterFilter });
    };

    updateWeixinConfig = async () => {
        /// 微信环境判断
        let is_weixin = window.navigator.userAgent.toLowerCase().indexOf("micromessenger") !== -1;
        if (!is_weixin) return;

        /**
          * 微信配置
          */
        let res = await wechatSign(document.URL.split('#')[0]);
        if (res) {
            /// 如果没有传递过来appid，则微信接口出错，前端不处理后续流程
            if (!res.appId) return;

            /**
             * 微信JSSDK注入配置信息
             */
            window.wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: res.appId, // 必填，公众号的唯一标识
                timestamp: res.timestamp, // 必填，生成签名的时间戳
                nonceStr: res.nonceStr, // 必填，生成签名的随机串
                signature: res.signature,// 必填，签名
                jsApiList: [
                    'updateAppMessageShareData',
                    'updateTimelineShareData'
                ] // 必填，需要使用的JS接口列表
            });

            let that = this;
            window.wx.ready(function () {
                /**
                 * config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
                 * config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
                 * 则须把相关接口放在ready函数中调用来确保正确执行。
                 * 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                 * */
                // console.log('window.wx ready');
                let wXConfig = that._weixin;
                let title = wXConfig.title;
                let desc = wXConfig.desc;
                let imgUrl = wXConfig.imgUrl;

                // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
                window.wx.updateAppMessageShareData({
                    title: title, // 分享标题
                    desc: desc, // 分享描述
                    link: document.URL, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: imgUrl, // 分享图标
                    success: function () {
                        // 设置成功
                        // console.log('window.wx.updateAppMessageShareData success');
                    },
                    fail: function (res) {
                        // 设置失败
                        // console.log('window.wx.updateAppMessageShareData fail res=' + res);
                    }
                });

                // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容
                window.wx.updateTimelineShareData({
                    title: title, // 分享标题
                    link: document.URL, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: imgUrl, // 分享图标
                    success: function () {
                        // 设置成功
                        // console.log('window.wx.updateTimelineShareData success');
                    },
                    fail: function () {
                        // 设置失败
                        // console.log('window.wx.updateTimelineShareData fail');
                    }
                });
            });

            window.wx.error(function (res) {
                /**
                 * config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，
                 * 也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                 */
                console.log('window.wx error res = ' + JSON.stringify(res));
            });
        }
    };

    handleAll = () => {
        this.setState({ buildingAfterFilter: [...this._buildings] });
    };

    render() {
        const {
            keyword,
            buildingAfterFilter
        } = this.state;
        // console.log(buildingAfterFilter);
        return (
            <div style={{ marginLeft: 20, marginTop: 5, marginRight: 20 }}>
                <div style={{
                    textAlign: 'center', color: '#B9B973',
                    fontSize: 14, fontWeight: "bold", paddingTop: 7, paddingBottom: 5
                }}>
                    <span>预定蛋糕请先添加教育局总店2号</span>
                    <span style={{ textDecoration: 'underline' }}>
                        <a href="tel:18599568588">18599568588</a>
                    </span>
                    <span> (微信同号)</span>
                </div>

                <span>
                    <Search style={{ width: 180, marginTop: 4, marginLeft: 6, marginBottom: 4 }} size="middle"
                        placeholder="小区名"
                        onSearch={async () => {
                            this.showBuildingByKeyword();
                        }}
                        value={keyword}
                        onChange={(e) => {
                            const { value } = e.target;
                            this.setState({ keyword: value }, () => {
                                this.showBuildingByKeyword();
                            });
                        }} />
                </span>
                <span>
                    <Button type='primary' style={{ marginLeft: 6, marginTop: 4 }} onClick={this.handleAll}>全部小区</Button>
                </span>
                <div style={{ color: 'green', fontSize: 14 }}>{`共 ${buildingAfterFilter.length} 条记录`}</div>
                {
                    buildingAfterFilter.map((building) => {
                        return (
                            <div key={building.name}>
                                <div>
                                    <span style={{ fontWeight: 'bold', fontSize: 18 }}>{building.name}</span>
                                </div>
                                <img alt='请添加图片' style={{ width: '100%', border: '1px dotted green', borderRadius: 8 }} src={building.image} />
                                <div style={{ height: 20 }}></div>
                            </div>
                        );
                    })
                }

                <div style={{ height: 30 }}>没有更多楼栋信息，请联系管理员添加</div>

                <div style={{ textAlign: 'center', background: '#D8D8D8', height: 100 }}>
                    <div style={{ paddingTop: 12, marginTop: 10 }}>
                        总部：漳州市漳浦县府前街西247号(教育局对面)
                    </div>
                    <div style={{ color: 'blue', fontSize: 14 }}>
                        <span style={{ color: 'black' }}>©弯麦</span>

                        <a href='http://beian.miit.gov.cn'>
                            <span style={{ marginLeft: 8 }}>闽ICP备2022007668号-1</span>
                        </a>

                        <div>
                            <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=35062302000230">
                                <span>
                                    <Image preview={false} src="/image/公安备案图标.png" style={{ float: 'left' }} />
                                </span>
                                <span style={{ marginLeft: 8 }}>
                                    闽公网安备 35062302000230号
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Building;
