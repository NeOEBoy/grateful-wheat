import React from 'react';
import {
    Image, Divider, Button
} from 'antd';
import {
    wechatSign
} from '../api/api';

const KPickUpTypeOptions = [
    { label: '自己提货', value: '自己提货' },
    { label: '商家配送', value: '商家配送' }
];

class BirthdayCakeOrder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cakeName: '奥特曼打怪兽',
            cakeImage: '/image/生日蛋糕/蛋糕3.0/奥特曼打怪兽-方图.jpg',
            creamType: '动物奶油',
            cakeSize: '8寸',
            cakeSizeExtra: '',
            cakePrice: '188',
            pickUpDay: '2022-8-13',
            pickUpTime: '18:00',
            pickUpType: '商家配送',
            responseShop: '教育局店',
            deliverAddress: '漳浦县绥安镇府前街西2号楼1202',
            pickUpName: '王先生',
            phoneNumber: '18698036807',
            remarks: '需要两个生日帽'
        };
    };

    componentDidMount = async () => {
        // let query = this.props.query;
        // let paramValueStr = query && query.get('param');
        // // console.log(paramValueStr);
        // if (paramValueStr) {
        //     paramValueStr = unescape(paramValueStr);
        //     // console.log(paramValueStr);
        //     let paramValueObj = JSON.parse(paramValueStr);
        // }

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
            pickUpDay,
            pickUpTime,
            pickUpType,
            responseShop,
            deliverAddress,
            pickUpName,
            phoneNumber,
            remarks
        } = this.state;

        let tel = 'tel:' + phoneNumber
        return (
            <div>
                <div style={{
                    fontSize: 16,
                    textAlign: 'center',
                    paddingTop: 6,
                    paddingBottom: 6
                }}>蛋糕订购单</div>
                <div style={{
                    fontSize: 18,
                    textAlign: 'center',
                    paddingTop: 4,
                    paddingBottom: 4,
                    fontWeight: 'bold'
                }}>{cakeName}</div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <Image style={{ width: 240 }} preview={false} src={cakeImage} />
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
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>取货</Divider>
                    <div>
                        <span style={{ fontSize: 14 }}>取货：</span>
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
                                <Button style={{ textDecoration: 'underline', fontSize: 14, fontWeight: 'bold' }}
                                    onClick={() => {
                                        window.wx.openLocation({
                                            longitude: 117.612837, // 经度，浮点数，范围为180 ~ -180。
                                            latitude: 24.113938, // 纬度，浮点数，范围为90 ~ -90                                            
                                            name: '王荣慧', // 位置名
                                            address: '漳浦县绥安镇府前唐街2号楼', // 地址详情说明
                                            scale: 12, // 地图缩放级别,整型值,范围从1~28。默认为最大
                                            infoUrl: 'https://www.baidu.com/' // 在查看位置界面底部显示的超链接,可点击跳转
                                        });
                                    }}>
                                    {deliverAddress}
                                </Button>
                            </div>
                        ) : (<div></div>)
                    }

                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>姓名：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpName}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>手机：</span>
                        <span style={{ textDecoration: 'underline', fontSize: 14, fontWeight: 'bold' }}>
                            <a href={tel}>{phoneNumber}</a>
                        </span>
                    </div>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>备注：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold', wordWrap: 'break-word' }}>{remarks}</span>
                    </div>
                </div>
            </div>)
    };
}

export default BirthdayCakeOrder;
