import React from 'react';
import {
    Image, Divider
} from 'antd';
import {
    wechatSign,
    geocode,
    findCakeOrder
} from '../api/api';


class CakeOrder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            order: {}
        };
    };

    componentDidMount = async () => {
        let query = this.props.query;
        let _id = query && query.get('_id');
        if (_id) {
            let findResult = await findCakeOrder(_id);
            console.log('findResult = ' + JSON.stringify(findResult));
            if (findResult.errCode === 0) {
                let order = findResult.order;
                this.setState({ order: order });
                this.updateWeixinConfig(
                    '蛋糕订购单',
                    `${order.name} | ${order.cream} | 
                    ${order.size} | ${order.pickUpDay} | 
                    ${order.pickUpTime} | ${order.pickUpName} 
                    |${order.phoneNumber}`,
                    `http://gratefulwheat.ruyue.xyz/生日蛋糕/${order.name}-方图.jpg`
                );
            }
        }
    };

    updateWeixinConfig = async (title, desc, imageUrl) => {
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

                // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
                window.wx.updateAppMessageShareData({
                    title: title, // 分享标题
                    desc: desc, // 分享描述
                    link: document.URL, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: imageUrl, // 分享图标
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
                    imgUrl: imageUrl, // 分享图标
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
        const { order } = this.state;
        return (
            <div>
                <div style={{
                    fontSize: 16,
                    textAlign: 'center',
                    paddingTop: 4,
                    paddingBottom: 4,
                    fontWeight: 'bold',
                    background: '#D8D8D8',
                    borderBottom: '1px dashed black'
                }}>{`《${order?.name}》`}</div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <Image style={{ width: 150 }} preview={false}
                        src={`http://gratefulwheat.ruyue.xyz/生日蛋糕/${order?.name}-方图.jpg`} />
                </div>
                <div style={{ marginLeft: 24, marginRight: 24 }}>
                    <Divider style={{ marginTop: 8, marginBottom: 0, fontSize: 8 }}>制作</Divider>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>奶油：</span>
                        <span style={{ fontSize: 18 }}>{order?.cream}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>尺寸：</span>
                        <span style={{ fontSize: 18, color: 'green' }}>{order?.size}</span>
                        {
                            order?.size === '组合' ? (
                                <span style={{ fontSize: 18, color: 'green' }}>
                                    {order?.sizeExtra}
                                </span>) : (<span></span>)
                        }
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>价格：</span>
                        <span style={{ fontSize: 14 }}>{order?.price}</span>
                        <span style={{ fontSize: 14 }}>元</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>夹心：</span>
                        <span style={{ fontSize: 14 }}>
                            {order?.fillings?.length > 0 ? order?.fillings?.join('+') : '没有夹心'}
                        </span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>蜡烛：</span>
                        <span style={{ fontSize: 16, color: 'blue' }}>{order.candle}</span>
                        {
                            order?.candle === '数字蜡烛' ? (
                                <span style={{ fontSize: 16, color: 'blue' }}>
                                    {`(${order?.candleExtra})`}
                                </span>) : (<span></span>)
                        }
                        {
                            order?.kindling === '火柴盒' ? (
                                <span style={{ fontSize: 16, color: 'blue' }}>
                                    {`+火柴盒`}
                                </span>
                            ) : (<span></span>)
                        }
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>帽子：</span>
                        <span style={{ fontSize: 16, color: 'blue' }}>{order.hat}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>餐具：</span>
                        <span style={{ fontSize: 16, color: 'blue' }}>{order?.plates}</span>
                        <span style={{ fontSize: 16, color: 'blue' }}>套</span>
                    </div>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>取货</Divider>
                    <div>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>时间：</span>
                        <span style={{ fontSize: 18, color: 'red' }}>{order?.pickUpDay}</span>
                        <span style={{ fontSize: 18, color: 'red' }}>{order?.pickUpTime}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>方式：</span>
                        <span style={{ fontSize: 14 }}>{order.pickUpType}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>门店：</span>
                        <span style={{ fontSize: 14 }}>{order?.shop}</span>
                    </div>
                    {
                        order?.pickUpType === '商家配送' ? (
                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>地址：</span>
                                <span style={{ fontSize: 18, color: 'red', textDecoration: 'underline' }}
                                    onClick={async () => {
                                        let locationResult = await geocode('漳浦' + order?.address, '漳州');
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
                                                    name: order?.address,
                                                    // 地址详情说明
                                                    address: '漳浦' + order?.address,
                                                    // 地图缩放级别,整型值,范围从1~28。默认为最大
                                                    scale: 15,
                                                    // 在查看位置界面底部显示的超链接,可点击跳转
                                                    infoUrl: 'https://www.baidu.com/'
                                                });
                                            }
                                        }
                                    }}>{order?.address}</span>
                            </div>
                        ) : (<div></div>)
                    }

                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>姓名：</span>
                        <span style={{ fontSize: 18, color: 'red' }}>
                            {`${order?.pickUpName}`}
                        </span>
                        <span style={{ textDecoration: 'underline', fontSize: 20, fontWeight: 'bold', color: 'red' }}>
                            <a href={`tel:${order?.phoneNumber}`}>{`（${order?.phoneNumber}）`}</a>
                        </span>
                    </div>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                    <div style={{ marginTop: 4, marginBottom: 4, marginRight: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>备注：</span>
                        <span style={{ fontSize: 18, color: 'red', wordWrap: 'break-word' }}>
                            {order?.remarks}
                        </span>
                    </div>

                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ textDecoration: 'underline', fontSize: 20, fontWeight: 'bold' }}>
                            <a href={"http://gratefulwheat.ruyue.xyz/buildingMap"}>漳浦小区楼栋图</a>
                        </span>
                    </div>
                </div>

                {/* 地址，ICP备案，公安备案 */}
                <div style={{ textAlign: 'center', background: '#D8D8D8', height: 100 }}>
                    <div style={{ paddingTop: 12, marginTop: 10 }}>
                        地址：漳州市漳浦县府前街西247号(教育局对面)
                    </div>
                    <div style={{ color: 'green', fontSize: 14 }}>
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
            </div >)
    };
}

export default CakeOrder;
