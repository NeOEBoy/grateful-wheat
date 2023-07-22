import React from 'react';
import moment from 'moment';
import QRCode from 'qrcode';
import html2Canvas from 'html2canvas';
import QueueAnim from 'rc-queue-anim';
import {
    Image, Divider, Button, Spin,
    Timeline, Space
} from 'antd';
import {
    wechatSign,
    geocode,
    findCakeOrder
} from '../api/api';
import { getWWWHost } from '../api/util';

class CakeOrder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            order: {},
            /// 生成预定单图片
            orderingTime: '',
            orderImageModalVisiable: false,
            orderImageSrc: undefined,
            orderImageCapturing: false,
            localImgDataLoading: false,
            image4QRCode: ''
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
                    `${order?.name}-${order?.cream}-${order?.size}-${order?.pickUpDay}-${order?.pickUpTime}-${order?.pickUpName}-${order?.phoneNumber}`,
                    `http://gratefulwheat.ruyue.xyz/生日蛋糕/${order?.name}-方图.jpg`
                );
            }
        }

        this.initLocal();
    };

    initLocal = () => {
        // 初始化local
        this._lastKeys = [];

        // 订单模板
        this._theDiv4CaptureWidth = 760;
        let theDiv4CaptureHeight = this._theDiv4CaptureWidth * 148 / 210;
        this._theDiv4CaptureStyle = {
            width: this._theDiv4CaptureWidth,
            height: theDiv4CaptureHeight,
            background: 'white'
        };
        this._theLeftDivInTheDiv4CaptureStyle = {
            width: theDiv4CaptureHeight - 180,
            height: theDiv4CaptureHeight - 180 + 40,
            float: 'left', marginLeft: 8,
            borderRadius: 8, border: '2px dotted #00A2A5'
        };
        this._theRightDivInTheDiv4CaptureStyle = {
            float: 'right',
            width: this._theDiv4CaptureWidth - theDiv4CaptureHeight + 160
        };

        // 订单图片
        let orderImageWidth = window.innerWidth;
        if (orderImageWidth > 680) orderImageWidth = 680;
        let orderImageHeight = orderImageWidth * 148 / 210;
        let titleAndFooterHeight = 190;
        this._orderImageDivStyle = {
            width: orderImageWidth,
            height: orderImageHeight + titleAndFooterHeight,
            marginTop: (window.innerHeight - (orderImageHeight + titleAndFooterHeight)) / 2,
            marginLeft: (window.innerWidth - orderImageWidth) / 2
        };

        this._orderImageStyle = {
            width: orderImageWidth,
            height: orderImageHeight,
            border: '2px dashed #00A2A5'
        };

        this._orderImageInStyle = {
            width: orderImageWidth - 4,
            height: orderImageHeight - 4
        };
    }

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

    handleOrderCakeInfoModalOk = () => {
        const { order } = this.state;

        this.setState({
            orderImageCapturing: true,
            orderingTime: moment().format('YYYY.MM.DD ddd a HH:mm'),
            image4QRCode: ''
        }, () => {
            setTimeout(async () => {
                let cakeOrderUrl = getWWWHost() + `/cakeOrder?_id=${order?._id}`;
                let qrOpts = {
                    errorCorrectionLevel: 'L',
                    type: 'image/jpeg',
                    quality: 0.8,
                    margin: 2,
                    color: {
                        dark: "#000000ff",
                        light: "#ffffffff"
                    }
                }
                let qrCode = await QRCode.toDataURL(cakeOrderUrl, qrOpts);

                this.setState({ image4QRCode: qrCode },
                    async () => {
                        let canvas = await html2Canvas(this._theDiv4Capture);
                        let imageSrc = canvas.toDataURL('image/png');
                        this.setState({
                            orderImageSrc: imageSrc,
                            orderImageCapturing: false,
                            orderImageModalVisiable: true
                        });
                        document.documentElement.style.overflow = 'hidden';
                    });
            }, 0);
        });
    };

    render() {
        const {
            order,
            orderingTime,
            orderImageCapturing,
            image4QRCode,
            orderImageModalVisiable,
            orderImageSrc
        } = this.state;
        return (
            <div>
                {
                    // 订单图片
                    orderImageModalVisiable ? (
                        <div style={{
                            background: 'rgba(0,0,0,0.9)', position: 'fixed',
                            zIndex: '101', width: 'calc(100%)', height: 'calc(100%)',
                            overflowY: 'hidden', overflowX: 'hidden'
                        }}>
                            <div style={this._orderImageDivStyle}>
                                <div key='a' style={{ height: 110 }}>
                                    <Timeline style={{ paddingTop: 30, paddingLeft: 24, paddingRight: 24 }}>
                                        <Timeline.Item color='white' style={{ color: 'white' }}>{`长按虚线框内的订购单图片并转发给客服`}</Timeline.Item>
                                        <Timeline.Item color='white' style={{ color: 'white' }}>{`注意：不要识别二维码，也不要截屏`}</Timeline.Item>
                                    </Timeline>
                                </div>

                                <QueueAnim type={['bottom', 'top']}>
                                    <div key='a' style={this._orderImageStyle}>
                                        <Image style={this._orderImageInStyle} preview={false} src={orderImageSrc} />
                                    </div>
                                </QueueAnim>

                                <div style={{ height: 80, textAlign: 'center' }}>
                                    <Space style={{ marginTop: 24 }}>
                                        <Button key='back' type='primary' danger onClick={() => {
                                            this.setState({ orderImageModalVisiable: false });
                                            document.documentElement.style.overflow = 'visible';
                                        }}>X</Button>
                                    </Space>
                                </div>
                            </div>
                        </div>
                    ) : (<div></div>)
                }

                {
                    // 截图模板
                    orderImageCapturing ? (
                        <div style={{
                            opacity: 0.99, background: 'white', position: 'fixed',
                            zIndex: '200', width: 'calc(100%)', height: 'calc(100%)',
                            overflowY: 'hidden', overflowX: 'hidden'
                        }}>
                            <Spin spinning={orderImageCapturing} size='large' tip='生成蛋糕订购单中...' >
                                <div ref={(current) => { this._theDiv4Capture = current; }}
                                    style={this._theDiv4CaptureStyle}>
                                    <div id="qrcode" style={{
                                        textAlign: 'right', position: 'absolute',
                                        paddingRight: 18, paddingTop: 10,
                                        width: this._theDiv4CaptureWidth, height: 150
                                    }}>
                                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>电子订购单二维码</div>
                                        <Image style={{ width: 150, height: 150 }}
                                            preview={false}
                                            src={image4QRCode}
                                        />
                                    </div>

                                    <div style={{
                                        textAlign: 'left', position: 'absolute', paddingLeft: 20,
                                        width: this._theDiv4CaptureWidth, fontSize: 14, paddingTop: 10,
                                    }}>{`订购时间：${orderingTime}`}</div>

                                    <div style={{
                                        fontSize: 22,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        paddingTop: 6,
                                        paddingBottom: 6
                                    }}>蛋糕订购单</div>
                                    <div>
                                        <div style={this._theLeftDivInTheDiv4CaptureStyle}>
                                            <div style={{
                                                fontSize: 20,
                                                textAlign: 'center',
                                                paddingTop: 4,
                                                paddingBottom: 4,
                                                fontWeight: 'bold',
                                                background: '#D8D8D8',
                                                borderBottom: '1px dashed black'
                                            }}>
                                                <span>{`《${order?.name}》`}</span>
                                            </div>
                                            <div>
                                                <div style={{ position: 'relative' }}>
                                                    <Image preview={false} src={`/生日蛋糕/${order?.name}-方图.jpg`} />
                                                    <Image style={{ width: 60, height: 60, position: 'absolute', top: -212, right: 2 }} preview={false} src={`/image/弯麦logo方-黑白.png`} />
                                                </div>
                                                <Image style={{ marginTop: 16 }} preview={false} src="/image/弯麦logo长.png" />
                                            </div>
                                        </div>
                                        <div style={this._theRightDivInTheDiv4CaptureStyle}>
                                            <Divider orientation='left' dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>制作</Divider>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>奶油：</span>
                                                <span style={{ fontSize: 18, color: 'green' }}>{order?.cream}</span>
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
                                                <span style={{ fontSize: 16, color: 'green' }}>{
                                                    order?.fillings.length > 0 ?
                                                        order?.fillings.join('+') :
                                                        '没有夹心'
                                                }</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>蜡烛：</span>
                                                <span style={{ fontSize: 16, color: 'blue' }}>{order?.candle}</span>
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
                                                <span style={{ fontSize: 16, color: 'blue' }}>{order?.hat}</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>餐具：</span>
                                                <span style={{ fontSize: 16, color: 'blue' }}>{order?.plates}</span>
                                                <span style={{ fontSize: 16, color: 'blue' }}>套</span>
                                            </div>
                                            <Divider orientation='left' style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>取货</Divider>
                                            <div>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>时间：</span>
                                                <span style={{ fontSize: 18, color: 'red' }}>{order?.pickUpDay}</span>
                                                <span style={{ fontSize: 18, color: 'red' }}>{order?.pickUpTime}</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>方式：</span>
                                                <span style={{ fontSize: 14 }}>{order?.pickUpType}</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>门店：</span>
                                                <span style={{ fontSize: 14 }}>{order?.shop}</span>
                                            </div>
                                            {
                                                order?.pickUpType === '商家配送' ? (
                                                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>地址：</span>
                                                        <span style={{ fontSize: 18, color: 'red' }}>{order?.address}</span>
                                                    </div>
                                                ) : (<div></div>)
                                            }

                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>姓名：</span>
                                                <span style={{ fontSize: 18, color: 'red' }}>
                                                    {`${order?.pickUpName}（${order?.phoneNumber}）`}
                                                </span>
                                            </div>
                                            <Divider orientation='left' style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                                            <div style={{ marginTop: 4, marginBottom: 4, marginRight: 8 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>备注：</span>
                                                <span style={{ fontSize: 18, color: 'red', wordWrap: 'break-word' }}>
                                                    {order?.remarks}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Spin>
                        </div>) : (<div></div>)
                }

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
                        <Image style={{ width: '100%' }} preview={false}
                            src={`/生日蛋糕/${order?.name}-方图.jpg`} />
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
                            <span style={{ fontSize: 16, color: 'blue' }}>{order?.candle}</span>
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
                            <span style={{ fontSize: 16, color: 'blue' }}>{order?.hat}</span>
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
                            <span style={{ fontSize: 14 }}>{order?.pickUpType}</span>
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

                    <div style={{ height: 80 }}></div>
                    <div style={{
                        width: 'calc(100%)', height: 64, backgroundColor: '#E5E4E2',
                        position: 'fixed', bottom: 0, textAlign: 'center', zIndex: '100'
                    }}>
                        <Button type='primary' style={{ top: 16 }} onClick={this.handleOrderCakeInfoModalOk}>生成蛋糕订购单</Button>
                    </div>
                </div>
            </div>
        )
    };
}

export default CakeOrder;
