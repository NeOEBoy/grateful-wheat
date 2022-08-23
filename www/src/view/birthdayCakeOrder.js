import React from 'react';
import {
    Image, Divider
} from 'antd';
import {
    wechatSign,
    geocode,
    findBirthdaycakeOrder
} from '../api/api';

const KPickUpTypeOptions = [
    { label: '自己提货', value: '自己提货' },
    { label: '商家配送', value: '商家配送' }
];

const KCandleTypeOptions = [
    { label: '螺纹蜡烛', value: '螺纹蜡烛' },
    { label: '数字蜡烛', value: '数字蜡烛' },
    { label: '爱心蜡烛', value: '爱心蜡烛' },
    { label: '曲线蜡烛', value: '曲线蜡烛' },
    // { label: '五星蜡烛', value: '五星蜡烛' },
    { label: '荷花●音乐蜡烛', value: '荷花●音乐蜡烛' }
];

class BirthdayCakeOrder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cakeName: '',
            cakeImage: '',
            creamType: '',
            cakeSize: '',
            cakeSizeExtra: '',
            cakePrice: '',
            pickUpDay: '',
            pickUpTime: '',
            pickUpType: '',
            responseShop: '',
            deliverCity: '漳州',
            deliverCounty: '漳浦',
            deliverAddress: '',
            pickUpName: '',
            phoneNumber: '',
            remarks: ''
        };
    };

    componentDidMount = async () => {
        let query = this.props.query;
        let _id = query && query.get('_id');
        if (_id) {
            let findResult = await findBirthdaycakeOrder(_id);
            if (findResult && findResult.errCode === 0) {
                let order = findResult.order;
                this.setState({
                    cakeName: order.cakeName,
                    cakeImage: `/image/生日蛋糕/蛋糕3.0/${order.cakeName}-方图.jpg`,
                    creamType: order.creamType,
                    cakeSize: order.cakeSize,
                    cakeSizeExtra: order.cakeSizeExtra,
                    cakePrice: order.cakePrice,
                    cakeFillings: order.cakeFillings,
                    candleType: order.candleType,
                    ignitorType: order.ignitorType,
                    number4candle: order.number4candle,
                    cakePlateNumber: order.cakePlateNumber,
                    pickUpDay: order.pickUpDay,
                    pickUpTime: order.pickUpTime,
                    pickUpType: order.pickUpType,
                    responseShop: order.responseShop,
                    deliverAddress: order.deliverAddress,
                    pickUpName: order.pickUpName,
                    phoneNumber: order.phoneNumber,
                    remarks: order.remarks
                })
            }
        }

        this.updateWeixinConfig();
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
                    'updateTimelineShareData',
                    'openLocation'
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

                let title = '蛋糕订购单';
                let desc = '查看弯麦蛋糕订购单信息';
                let imgUrl = 'http://gratefulwheat.ruyue.xyz/image/生日蛋糕/蛋糕3.0/叮当王子-方图.jpg';

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

    render() {
        const {
            cakeName,
            cakeImage,
            creamType,
            cakeSize,
            cakeSizeExtra,
            cakePrice,
            cakeFillings,
            candleType,
            ignitorType,
            number4candle,
            cakePlateNumber,
            pickUpDay,
            pickUpTime,
            pickUpType,
            responseShop,
            deliverCity,
            deliverCounty,
            deliverAddress,
            pickUpName,
            phoneNumber,
            remarks
        } = this.state;

        let tel = 'tel:' + phoneNumber
        return (
            <div>
                <div style={{
                    fontSize: 12,
                    textAlign: 'center',
                    paddingTop: 6,
                    paddingBottom: 0
                }}>蛋糕订购单</div>
                <div style={{
                    fontSize: 18,
                    textAlign: 'center',
                    paddingTop: 4,
                    paddingBottom: 4,
                    fontWeight: 'bold'
                }}>{cakeName}</div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <Image style={{ width: 180 }} preview={false} src={cakeImage} />
                </div>
                <div style={{ marginLeft: 24, marginRight: 24 }}>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>制作</Divider>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>奶油：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{creamType}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>尺寸：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{cakeSize}</span>
                        {
                            cakeSize === '组合' ? (
                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                                    {cakeSizeExtra}
                                </span>) : (<span></span>)
                        }
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>价格：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{cakePrice}</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>元</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>夹心：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{cakeFillings}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>蜡烛：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{candleType}</span>
                        {
                            candleType === KCandleTypeOptions[1].value ? (
                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                                    {`${number4candle}`}
                                </span>) : (
                                <span>
                                </span>
                            )
                        }
                        {
                            ignitorType !== '' ? (
                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                                    {`+${ignitorType}`}
                                </span>
                            ) : (<span></span>)
                        }
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>帽子：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>金卡皇冠帽</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>餐具：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{cakePlateNumber}</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>套</span>
                    </div>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>取货</Divider>
                    <div>
                        <span style={{ fontSize: 14 }}>时间：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpDay}</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}> {pickUpTime}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>方式：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpType}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>门店：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{responseShop}</span>
                    </div>
                    {
                        pickUpType === KPickUpTypeOptions[1].value ? (
                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                <span style={{ fontSize: 14 }}>地址：</span>
                                <span style={{ textDecoration: 'underline', fontSize: 20, fontWeight: 'bold', color: 'green' }}
                                    onClick={async () => {
                                        let locationResult = await geocode(deliverCounty + deliverAddress, deliverCity);
                                        if (locationResult.errCode === 0) {
                                            let locationStr = locationResult.location;
                                            let locationArray = locationStr.split(',');
                                            if (locationArray.length === 2) {
                                                window.wx.openLocation({
                                                    // 经度，浮点数，范围为180 ~ -180。
                                                    longitude: locationArray[0],
                                                    // 纬度，浮点数，范围为90 ~ -90                                            
                                                    latitude: locationArray[1],
                                                    // 位置名
                                                    name: deliverAddress,
                                                    // 地址详情说明
                                                    address: deliverCounty + deliverAddress,
                                                    // 地图缩放级别,整型值,范围从1~28。默认为最大
                                                    scale: 15,
                                                    // 在查看位置界面底部显示的超链接,可点击跳转
                                                    infoUrl: 'https://www.baidu.com/'
                                                });
                                            }
                                        }
                                    }}>
                                    {deliverCounty + deliverAddress}
                                </span>
                            </div>
                        ) : (<span></span>)
                    }

                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>姓名：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpName}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>手机：</span>
                        <span style={{ textDecoration: 'underline', fontSize: 20, fontWeight: 'bold' }}>
                            <a href={tel}>{phoneNumber}</a>
                        </span>
                    </div>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>备注：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold', wordWrap: 'break-word' }}>{remarks}</span>
                    </div>

                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ textDecoration: 'underline', fontSize: 20, fontWeight: 'bold' }}>
                            <a href={"http://gratefulwheat.ruyue.xyz/buildingMap"}>漳浦小区楼栋图</a>
                        </span>
                    </div>
                </div>

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
            </div>)
    };
}

export default BirthdayCakeOrder;
