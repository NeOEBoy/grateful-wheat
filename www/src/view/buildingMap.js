/*
建筑物地图：查看和搜索漳浦小区建筑物地图
*/
import React from 'react';
import {
    Input, Button, Image
} from 'antd';
import {
    wechatSign
} from '../api/api';

const { Search } = Input;
const KBuildMapNames = [
    '碧桂园御江府', '漳浦碧桂园', '常德商贸城', '大亭花园', '东平小区', '府前唐街&万新广场', '富丽山庄', '港城国际豪庭', '花开富贵',
    '花开富贵1', '华府二期', '华府三期', '华府五期', '华府一期', '吉祥福邸', '假日新天国际', '江滨花园二期', '江滨花园一期',
    '金利花园&金浦花园', '金绿欧洲城', '聚源东岸', '兰溪御墅', '龙城尊庭', '龙门花园', '美伦清华园', '欧洲阳光小区', '钱隆首府',
    '润景金座', '盛唐花园', '石斋花园', '书香门第&东苑花园', '汤泉世纪', '西湖花园&西湖金典&锦绣西湖', '新都广场', '学府一号',
    '阳光龙泉', '怡景园', '印石花园', '印石花园B区', '盈丰花园一期&盈丰花园二期', '御景山庄', '漳浦宾馆', '阳光城汤泉世纪3期', '金凯嘉花园',
    '富源新城', '西湖苑', '益民家园', '惠民家园', '立欣东方新城', '夏商水岸名都'
];

/**--------------------配置信息--------------------*/
class BuildingMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: '',
            buildMapNamesFilter: []
        };
    };

    componentDidMount = async () => {
        this.loadMapByKeyword();
        this.updateWeixinConfig();
    };

    loadMapByKeyword = () => {
        const { keyword } = this.state;
        // console.log(keyword);

        let buildMapNamesFilter = [];

        if (keyword && keyword !== '') {
            for (let i = 0; i < KBuildMapNames.length; ++i) {
                let buildMap = KBuildMapNames[i];

                if (buildMap.indexOf(keyword) !== -1) {
                    buildMapNamesFilter.push(buildMap);
                }
            }
        }

        this.setState({ buildMapNamesFilter: buildMapNamesFilter });
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

            window.wx.ready(function () {
                /**
                 * config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
                 * config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
                 * 则须把相关接口放在ready函数中调用来确保正确执行。
                 * 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                 * */
                // console.log('window.wx ready');

                let title = '漳浦小区楼栋图';
                let desc = '查看漳浦各个小区的楼栋号';
                let imgUrl = 'http://gratefulwheat.ruyue.xyz/image/漳浦小区楼栋图/漳浦西湖.jpg';

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
        let buildMapNamesFilter = [];
        for (let i = 0; i < KBuildMapNames.length; ++i) {
            let buildMap = KBuildMapNames[i];
            buildMapNamesFilter.push(buildMap);
        }
        this.setState({ buildMapNamesFilter: buildMapNamesFilter });
    };

    render() {
        const {
            keyword,
            buildMapNamesFilter
        } = this.state;


        // console.log(buildMapNamesFilter);

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
                            this.loadMapByKeyword();
                        }}
                        value={keyword}
                        onChange={(e) => {
                            const { value } = e.target;
                            this.setState({ keyword: value }, () => {
                                this.loadMapByKeyword();
                            });
                        }} />
                </span>
                <span>
                    <Button type='primary' style={{ marginLeft: 6, marginTop: 4 }} onClick={this.handleAll}>全部小区</Button>
                </span>

                <div>
                    {
                        buildMapNamesFilter.map((name) => {
                            let src = "/image/漳浦小区楼栋图/" + name + '.jpg';

                            return (
                                <div key={name}>
                                    <div>
                                        <span style={{ color: 'red' }}>《{name}》</span>
                                    </div>
                                    <img alt='请添加图片' style={{ width: '100%' }} src={src} />
                                    <div style={{ height: 20 }}></div>
                                </div>
                            );
                        })
                    }
                </div>

                <div style={{ height: 30 }}>---没有更多了请联系管理员添加---</div>

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

export default BuildingMap;
