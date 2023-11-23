/*
* 弯麦●蛋糕 图册链接
* http://gratefulwheat.ruyue.xyz/cakeMenu
*/

import React from 'react';
import moment from 'moment';
import html2Canvas from 'html2canvas';
import dpLocale from 'antd/es/date-picker/locale/zh_CN';
import QueueAnim from 'rc-queue-anim';
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import QRCode from 'qrcode'

import {
    RightSquareFilled,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined,
    EditOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    PayCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import {
    Collapse, Image, Spin,
    DatePicker, Radio, List, Carousel,
    Select, Input, Checkbox, Divider,
    message, Timeline, Button, Space
} from 'antd';
import {
    wechatSign,
    // templateSendToSomePeople,
    createCakeOrder,
    allCakeInfos
} from '../api/api';
import { getWWWHost } from '../api/util';

const { Panel } = Collapse;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

const orderInfoInit = () => {
    let init = {};
    init.product = { name: '', description: '' };
    init.making = {};
    init.making.cream = undefined;
    init.making.size = undefined;
    init.making.sizeExtra = undefined;
    init.making.price = '--';
    init.making.fillings = [];
    init.making.candle = undefined;
    init.making.candleExtra = undefined;
    init.making.kindling = undefined;
    init.making.hat = undefined;
    init.making.plates = undefined;
    init.delivery = {};
    init.delivery.pickUpDay = undefined;
    init.delivery.pickUpDayPopupOpen = false;
    init.delivery.pickUpTime = undefined;
    init.delivery.pickUpTimePopupOpen = false;
    init.delivery.pickUpType = undefined;
    init.delivery.shop = undefined;
    init.making.height = undefined;
    init.delivery.address = undefined;
    init.delivery.pickUpName = undefined;
    init.delivery.phoneNumber = undefined;
    init.delivery.pickUpTypes = undefined;
    init.other = {};
    init.other.remarks = "";

    return init;
};

class cakeMenu extends React.Component {
    constructor(props) {
        super(props);
        // 初始化state
        this.state = {
            // 主页
            cakeRecommend: { name: '', products: [] },
            allCakeInfosLoading: false,
            cakeCategorys: [],
            cakeProducts: [],
            /// 搜索
            searchName: '',
            cake4Search: [],
            /// 预定蛋糕信息
            orderInfoModalVisiable: false,
            cakeOrderInfo: orderInfoInit(),

            /// 生成预定单图片
            orderingTime: '',
            orderImageModalVisiable: false,
            orderImageSrc: undefined,
            orderImageCapturing: false,
            imageBeforeCrop: '',
            imageCropperModalVisiable: false,
            localImgDataLoading: false,
            image4QRCode: ''
        };
    }

    componentDidMount = async () => {
        this.setState({ allCakeInfosLoading: true });
        const cakeInfosObj = await allCakeInfos();
        this.setState({ allCakeInfosLoading: false });
        // console.log('cakeInfosObj = ' + JSON.stringify(cakeInfosObj));
        this._cakeSizes = cakeInfosObj.sizes;
        this._cakeCreams = cakeInfosObj.creams;
        this._cakeFillings = cakeInfosObj.fillings;
        this._cakeCandles = cakeInfosObj.candles;
        this._cakeKindlings = cakeInfosObj.kindlings;
        this._cakeHats = cakeInfosObj.hats;
        this._cakePickUpTypes = cakeInfosObj.pickUpTypes;
        this._cakeShops = cakeInfosObj.shops;
        this._cakeShopsDescription = cakeInfosObj.shopsDescription;
        this._cakeHeights = cakeInfosObj.heights;
        this._cakeHeightsDescription = cakeInfosObj.heightsDescription;
        this._private = cakeInfosObj.private;
        this._weixin = cakeInfosObj.weixin;

        this.makeRenderItemFunc4Product();
        this.initLocal();

        this.setState({
            cakeRecommend: cakeInfosObj.recommend,
            cakeCategorys: cakeInfosObj.categorys,
            cakeProducts: cakeInfosObj.products,
        });

        this.updateWeixinConfig();
    }

    /// 配置微信分享图标和文案
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
                    'chooseImage',
                    'getLocalImgData'
                ] // 必填，需要使用的JS接口列表
            });

            let that = this;
            window.wx.ready(async function () {
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
                        // console.log('window.wx.updateAppMessageShareData fail res=' + JSON.stringify(res));
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
                    fail: function (res) {
                        // 设置失败
                        // console.log('window.wx.updateTimelineShareData fail res = ' + JSON.stringify(res));
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
    }

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
            borderRadius: 8, border: '2px dotted #5F9EA0'
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
            border: '2px dashed #5F9EA0'
        };

        this._orderImageInStyle = {
            width: orderImageWidth - 4,
            height: orderImageHeight - 4
        };

        // 首页列数
        this._columnNumber = 2;
        const interWidth = window.innerWidth;
        // console.log('interWidth = ' + interWidth);
        if (interWidth > 900) {
            this._columnNumber = 4;
        } else if (interWidth > 600) {
            this._columnNumber = 3;
        }
    }

    // 搜索
    handleSearchInputOnChange = (e) => {
        let newSearchName = e.target.value;
        this.setState({ searchName: newSearchName });
        if (!e.target.value || e.target.value === '') return;

        const { cakeProducts } = this.state;
        let products4Search = [];
        for (let i = 0; i < cakeProducts.length; ++i) {
            let product = cakeProducts[i];
            if (product?.name.indexOf(newSearchName) !== -1 ||
                product?.description.indexOf(newSearchName) !== -1) {
                products4Search.push(product);
            }
        }

        this.setState({ cake4Search: products4Search });
    }

    /// 蛋糕分类 展开|收起 
    handleCollapseOnChange = async (keys) => {
        if (!keys) return;
        // console.log(keys);
        let keysOpened = [...keys];
        for (let ii = 0; ii < this._lastKeys.length; ++ii) {
            let key = this._lastKeys[ii];
            let pos = keysOpened.indexOf(key);
            if (pos !== -1) {
                keysOpened.splice(pos, 1);
            }
        }

        let keysClosed = [...this._lastKeys];
        for (let jj = 0; jj < keys.length; ++jj) {
            let key = keys[jj];
            let pos = keysClosed.indexOf(key);
            if (pos !== -1) {
                keysClosed.splice(pos, 1);
            }
        }
        this._lastKeys = [...keys];

        const { cakeCategorys } = this.state;

        // console.log(keysOpened);
        let categoryIdOpened = keysOpened.length === 1 ? keysOpened[0] : "";
        let categoryIdClosed = keysClosed.length === 1 ? keysClosed[0] : "";

        for (let i = 0; i < cakeCategorys.length; ++i) {
            let category = cakeCategorys[i];
            // categoryId是字符串类型，category.id是数字类型
            if (category.id.toString() === categoryIdOpened.toString()) {
                category.opened = true;
                this.forceUpdate();
                break;
            }
            if (category.id.toString() === categoryIdClosed.toString()) {
                category.opened = false;
                this.forceUpdate();
                break;
            }
        }
    }

    // 立即预定按钮
    handleOrderNowClick = (product) => {
        this.setState({
            orderInfoModalVisiable: true,
            cakeOrderInfo: orderInfoInit()
        }, () => {
            /// 压入当前页面，拦截后退按键事件
            window.history.pushState(null, '', document.URL);
            window.onpopstate = () => {
                this.handleOrderCakeInfoModalBack();
            }
            setTimeout(() => {
                const { cakeOrderInfo } = this.state;
                cakeOrderInfo.product = product;
                product.fillingNumber = 0;
                this.makeCakeConfig(cakeOrderInfo);
                this.setState({
                    cakeOrderInfo: cakeOrderInfo
                });
            }, 0);
        })

        document.documentElement.style.overflow = 'hidden';
    }

    handleOrderCakeInfoModalOk = () => {
        const { cakeOrderInfo } = this.state;

        // 测试数据
        // {
        //     cakeOrderInfo.product.name = "变形金刚"
        //     cakeOrderInfo.product.description = "汽车人，集合，出发，目的是地球"
        //     cakeOrderInfo.product.images = ["/生日蛋糕/变形金刚-方图.jpg"]
        //     cakeOrderInfo.making.cream = {
        //         "id": 2,
        //         "name": "动物奶油",
        //         "description": "动物奶油"
        //     };
        //     cakeOrderInfo.making.size = {
        //         "id": 3,
        //         "name": "8寸",
        //         "unit": "寸",
        //         "number": 8,
        //         "description": "直径20厘米 | 6-9人",
        //         "plates": 15
        //     }
        //     cakeOrderInfo.making.sizeExtra = undefined
        //     cakeOrderInfo.making.price = 188
        //     cakeOrderInfo.product.fillingNumber = 2
        //     cakeOrderInfo.making.fillings = [
        //         {
        //             "id": 1,
        //             "name": "布蕾布丁",
        //             "description": "布蕾布丁",
        //             "image": "生日蛋糕/夹心/布蕾布丁.jpg"
        //         },
        //         {
        //             "id": 2,
        //             "name": "新鲜芒果",
        //             "description": "新鲜芒果",
        //             "image": "生日蛋糕/夹心/新鲜芒果.jpg"
        //         },
        //     ]
        //     cakeOrderInfo.making.candle = {
        //         "id": 1,
        //         "name": "爱心蜡烛",
        //         "description": "爱心蜡烛",
        //         "image": "生日蛋糕/蜡烛/爱心蜡烛.jpg"
        //     }
        //     cakeOrderInfo.making.candleExtra = undefined
        //     cakeOrderInfo.making.kindling = {
        //         "id": 2,
        //         "name": "火柴盒",
        //         "description": "火柴盒",
        //         "image": "生日蛋糕/蜡烛/火柴盒.jpg"
        //     }
        //     cakeOrderInfo.making.hat = {
        //         "id": 4,
        //         "name": "金卡磨砂圆锥帽",
        //         "description": "金卡磨砂圆锥帽",
        //         "image": "生日蛋糕/帽子/金卡磨砂圆锥帽.jpg"
        //     }
        //     cakeOrderInfo.making.plates = 15
        //     cakeOrderInfo.delivery.pickUpDay = moment().add(1, 'day')
        //     cakeOrderInfo.delivery.pickUpTime = moment().add(1, 'day')
        //     cakeOrderInfo.delivery.pickUpType = {
        //         "id": 2,
        //         "name": "商家配送",
        //         "description": "商家配送"
        //     }
        //     cakeOrderInfo.delivery.shop = {
        //         "id": 2,
        //         "name": "汤泉世纪店",
        //         "description": "汤泉世纪店"
        //     }
        // cakeOrderInfo.making.height = {
        //     "id": 1,
        //     "name": "通用款",
        //     "description": "通用款式，使用3层蛋糕胚，双层夹心",
        //     "extraMoneys": [
        //         {
        //             "sizeId": 1,
        //             "money": 0
        //         },
        //         {
        //             "sizeId": 2,
        //             "money": 0
        //         },
        //         {
        //             "sizeId": 3,
        //             "money": 0
        //         },
        //         {
        //             "sizeId": 4,
        //             "money": 0
        //         },
        //         {
        //             "sizeId": 5,
        //             "money": 0
        //         },
        //         {
        //             "sizeId": 6,
        //             "money": 0
        //         }
        //     ]
        // }
        //     cakeOrderInfo.delivery.address = '钱隆首府2期9栋1301'
        //     cakeOrderInfo.delivery.pickUpName = '王荣慧'
        //     cakeOrderInfo.delivery.phoneNumber = '18698036807'
        //     cakeOrderInfo.other.remarks = '多一顶帽子'
        // }
        // log
        // {
        //     console.log('名字：' + cakeOrderInfo.product?.name);
        //     console.log('描述：' + cakeOrderInfo.product?.description);
        //     console.log('图片：' + cakeOrderInfo.product?.images[0]);
        //     console.log('奶油：' + cakeOrderInfo.making.cream?.name);
        //     console.log('尺寸：' + cakeOrderInfo.making.size?.name);
        //     console.log('高度：' + this.evalWith(cakeOrderInfo.making.height)?.name);        
        //     console.log('组合：' + cakeOrderInfo.making?.sizeExtra);
        //     console.log('价格：' + cakeOrderInfo.making?.price);
        //     console.log('夹心数量：' + cakeOrderInfo.product?.fillingNumber);
        //     console.log('夹心：' + cakeOrderInfo.making.fillings.map(item => this.evalWith(item).name));
        //     console.log('蜡烛：' + this.evalWith(cakeOrderInfo.making.candle)?.name);
        //     console.log('蜡烛Extra：' + cakeOrderInfo.making?.candleExtra);
        //     console.log('火柴：' + this.evalWith(cakeOrderInfo.making.kindling)?.name);
        //     console.log('帽子：' + this.evalWith(cakeOrderInfo.making.hat)?.name);
        //     console.log('餐盘：' + cakeOrderInfo.making.plates);
        //     console.log('日期：' + cakeOrderInfo.delivery.pickUpDay?.format('YYYY-MM-DD ddd'));
        //     console.log('时间：' + cakeOrderInfo.delivery.pickUpTime?.format('a HH:mm'));
        //     console.log('方式：' + this.evalWith(cakeOrderInfo.delivery.pickUpType)?.name);
        //     console.log('门店：' + this.evalWith(cakeOrderInfo.delivery.shop)?.name);        
        //     console.log('地址：' + cakeOrderInfo.delivery.address);
        //     console.log('姓名：' + cakeOrderInfo.delivery.pickUpName);
        //     console.log('手机：' + cakeOrderInfo.delivery.phoneNumber);
        //     console.log('备注：' + cakeOrderInfo.other.remarks);
        // }
        // valid check
        if (cakeOrderInfo.making.cream === undefined) {
            message.warning('请选择奶油类型！');
            return;
        }
        if (cakeOrderInfo.making.size === undefined) {
            message.warning('请选择尺寸大小！');
            return;
        }
        if (cakeOrderInfo.making.height === undefined) {
            message.warning('请选择高度款式！');
            return;
        }
        if (cakeOrderInfo.making.size.id === -500 &&
            (cakeOrderInfo.making.sizeExtra === undefined ||
                cakeOrderInfo.making.sizeExtra === '')) {
            message.warning('请输入组合类型和组合尺寸！');
            return;
        }
        if (cakeOrderInfo.making?.fillings?.length <= 0 &&
            cakeOrderInfo.product?.fillingNumber > 0) {
            message.warning('请选择夹心！');
            return;
        }
        if (cakeOrderInfo.making.candle === undefined) {
            message.warning('请选择蜡烛！');
            return;
        }
        if (this.evalWith(cakeOrderInfo.making.candle)?.id === 3 &&
            (cakeOrderInfo.making.candleExtra === undefined ||
                cakeOrderInfo.making.candleExtra === '')) {
            message.warning('请输入数字蜡烛的数字！');
            return;
        }
        if (cakeOrderInfo.making.kindling === undefined) {
            message.warning('请选择是否需要火柴！');
            return;
        }
        if (cakeOrderInfo.making.hat === undefined) {
            message.warning('请选择生日帽！');
            return;
        }
        if (cakeOrderInfo.delivery.pickUpDay === undefined ||
            cakeOrderInfo.delivery.pickUpDay === null) {
            message.warning('请选择取货日期！');
            return;
        }
        if (cakeOrderInfo.delivery.pickUpTime === undefined ||
            cakeOrderInfo.delivery.pickUpTime === null) {
            message.warning('请选择取货时间！');
            return;
        }
        if (cakeOrderInfo.delivery.pickUpType === undefined) {
            message.warning('请选择取货方式！');
            return;
        }
        if (cakeOrderInfo.delivery.shop === undefined) {
            message.warning('请选择预定门店！');
            return;
        }
        if (this.evalWith(cakeOrderInfo.delivery.pickUpType)?.id === 2 &&
            (cakeOrderInfo.delivery.address === undefined ||
                cakeOrderInfo.delivery.address === null ||
                cakeOrderInfo.delivery.address === '')) {
            message.warning('请输入配送地址！');
            return;
        }
        if (cakeOrderInfo.delivery.pickUpName === undefined ||
            cakeOrderInfo.delivery.pickUpName === null ||
            cakeOrderInfo.delivery.pickUpName === '') {
            message.warning('请输入姓名！');
            return;
        }
        if (!/^\d{11}$/.test(cakeOrderInfo.delivery.phoneNumber)) {
            message.warning('请输入正确的11位电话号码！');
            return;
        }

        this.setState({
            orderImageCapturing: true,
            orderingTime: moment().format('YYYY.MM.DD ddd a HH:mm'),
            image4QRCode: ''
        }, () => {
            /// 压入当前页面，拦截后退按键事件
            window.history.pushState(null, '', document.URL);
            window.onpopstate = () => {
                this.handleOrderImageModalBack();
            }
            setTimeout(async () => {
                /// 保存蛋糕订单，返回_id
                let createResult = { _id: '' };
                try {
                    createResult = await createCakeOrder(
                        cakeOrderInfo.product?.name,
                        cakeOrderInfo.product?.description,
                        cakeOrderInfo.product?.images,
                        cakeOrderInfo.making.cream?.name,
                        cakeOrderInfo.making.size?.name,
                        cakeOrderInfo.making?.sizeExtra,
                        cakeOrderInfo.making?.price,
                        cakeOrderInfo.making.fillings.map(item => this.evalWith(item).name),
                        this.evalWith(cakeOrderInfo.making.candle)?.name,
                        cakeOrderInfo.making?.candleExtra,
                        this.evalWith(cakeOrderInfo.making.kindling)?.name,
                        this.evalWith(cakeOrderInfo.making.hat)?.name,
                        cakeOrderInfo.making.plates,
                        cakeOrderInfo.delivery.pickUpDay?.format('YYYY-MM-DD ddd'),
                        cakeOrderInfo.delivery.pickUpTime?.format('a HH:mm'),
                        this.evalWith(cakeOrderInfo.delivery.pickUpType)?.name,
                        this.evalWith(cakeOrderInfo.delivery.shop)?.name,
                        this.evalWith(cakeOrderInfo.making.height)?.name,
                        cakeOrderInfo.delivery.address,
                        cakeOrderInfo.delivery.pickUpName,
                        cakeOrderInfo.delivery.phoneNumber,
                        cakeOrderInfo.other.remarks);
                    // console.log(createResult);
                    if (!this.state.orderImageCapturing) return;
                    if (createResult.errCode !== 0) {
                        message.error('生成订购单不成功，请检查网络');
                        this.setState({ orderImageCapturing: false });
                        return;
                    }
                } catch {
                    message.error('生成订购单不成功，请检查网络');
                    this.setState({ orderImageCapturing: false });
                    return;
                }

                let cakeOrderUrl = getWWWHost() + `/cakeOrder?_id=${createResult._id}`;
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
                if (!this.state.orderImageCapturing) return;
                this.setState({ image4QRCode: qrCode },
                    async () => {
                        let canvas = await html2Canvas(this._theDiv4Capture);
                        if (!this.state.orderImageCapturing) return;
                        let imageSrc = canvas.toDataURL('image/png');
                        this.setState({
                            orderImageSrc: imageSrc,
                            orderImageCapturing: false,
                            orderImageModalVisiable: true
                        });
                        document.documentElement.style.overflow = 'hidden';

                        /// 模板通知指定人员有人生成订购单了，避免漏单
                        // let sendResult = await templateSendToSomePeople(
                        //     createResult._id,
                        //     this.evalWith(cakeOrderInfo.delivery.shop)?.name,
                        //     this.state.orderingTime,
                        //     `《${cakeOrderInfo.product?.name}》`,
                        //     `${cakeOrderInfo.delivery.pickUpName}（${cakeOrderInfo.delivery.phoneNumber}）`,
                        //     cakeOrderInfo.delivery.pickUpDay?.format('YYYY-MM-DD ddd') +
                        //     cakeOrderInfo.delivery.pickUpTime?.format('a HH:mm'));
                        // message.info(JSON.stringify(sendResult));
                    });
            }, 0);
        });

        document.documentElement.style.overflow = 'visible';
    }

    handleOrderCakeInfoModalCancel = () => {
        // console.log('handleOrderCakeInfoModalCancel begin');

        this.setState({ orderInfoModalVisiable: false });
        document.documentElement.style.overflow = 'visible';

        /// 后退且不再拦截后退按键事件
        window.history.back();
        window.onpopstate = null;
    }

    handleOrderCakeInfoModalBack = () => {
        console.log('handleOrderCakeInfoModalBack begin');

        this.setState({ orderInfoModalVisiable: false });
        document.documentElement.style.overflow = 'visible';
        /// 不再拦截后退按键事件
        window.onpopstate = null;
    }

    handleOrderImageModalCancel = () => {
        console.log('handleOrderImageModalCancel begin');

        this.setState({ orderImageModalVisiable: false });
        document.documentElement.style.overflow = 'visible';
        /// 后退且不再拦截后退按键事件
        this._programBack = true;
        window.history.back();
        window.onpopstate = () => {
            if (this._programBack) {
                this._programBack = false;
                return;
            }

            this.handleOrderCakeInfoModalBack();
        };
    }

    handleOrderImageModalBack = () => {
        console.log('handleOrderImageModalBack begin');

        this.setState({ orderImageModalVisiable: false, orderImageCapturing: false });
        document.documentElement.style.overflow = 'visible';
        /// 不再拦截后退按键事件
        window.onpopstate = () => {
            this.handleOrderCakeInfoModalBack();
        };
    }

    handleCreamChange = e => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.cream = JSON.parse(e.target.value);
        cakeOrderInfo.making.size = undefined;
        cakeOrderInfo.making.price = '--';
        // cakeOrderInfo.making.height = JSON.stringify(this._cakeHeights[0]);
        cakeOrderInfo.making.height = undefined;
        this.updateSizeOptions(cakeOrderInfo);
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleSizeChange = (value) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.size = JSON.parse(value);

        this.updatePrice(cakeOrderInfo);
        this.updatePlate(cakeOrderInfo);

        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleSizeExtraChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.sizeExtra = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleSizeSelectDropdownVisibleChange = (open) => {
        if (open) {
            const { cakeOrderInfo } = this.state;
            if (cakeOrderInfo.making.cream === undefined) {
                message.warning('请先选择奶油类型~');
            }
        }
    }

    handleHeightChange = (value) => {
        // console.log('handleHeightChange value = ' + value);
        const { cakeOrderInfo } = this.state;

        cakeOrderInfo.making.height = value;

        this.updateFillingNumber(cakeOrderInfo);
        this.updatePrice(cakeOrderInfo);

        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleCakeFillingChange = (value, fillingNumber) => {
        // console.log('value = ' + value);
        if (value.length > fillingNumber) {
            message.warning(`只能选择 ${fillingNumber} 种夹心，请反选不需要的夹心后，重新选择！`);
            return;
        }

        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.fillings = value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleCandleChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.candle = e.target.value;
        this.updateCandleOptions(cakeOrderInfo);
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleKindlingChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.kindling = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleHatChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.hat = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleCandleExtraChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.candleExtra = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpDayChange = (data) => {
        console.log(data);
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpDay = data;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpDayOnFocus = () => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpDayPopupOpen = true;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpDayOnBlur = () => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpDayPopupOpen = false;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpTimeChange = (data) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpTime = data;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpTimeOnFocus = () => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpTimePopupOpen = true;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpTimeOnBlur = () => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpTimePopupOpen = false;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpTimeOnOk = () => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpTimePopupOpen = false;
        this.setState({ cakeOrderInfo: cakeOrderInfo }, () => {
            setTimeout(() => {
                this._datePicker4PickUpTime.blur();
            }, 300);
        });
    }

    handlePickUpTypeChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpType = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleShopChange = (value) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.shop = value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleAddressChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.address = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpNameChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.pickUpName = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePhoneNumberChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.delivery.phoneNumber = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleRemarksChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.other.remarks = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    makeCakeConfig = (cakeOrderInfo) => {
        this.updateCreamOptions(cakeOrderInfo);
        this.updateHeightOptions();
        this.updateFillingOptions();
        this.updateCandleOptions(cakeOrderInfo);
        this.updateKindlingOptions();
        this.updateHatOptions();
        this.updatePickUpTypesOptions();
        this.updateShopOptions();
    }

    updateFillingNumber = (cakeOrderInfo) => {
        let heightObj = JSON.parse(cakeOrderInfo.making.height);
        if (cakeOrderInfo.product.fillingRequired) {
            cakeOrderInfo.product.fillingNumber = heightObj.fillingNumber;
        }
    }

    updatePrice = (cakeOrderInfo) => {
        // 同步下price
        if (cakeOrderInfo.making.size) {
            cakeOrderInfo.making.price = '--';
            for (let i = 0; i < cakeOrderInfo.product?.specifications.length; ++i) {
                let specification = cakeOrderInfo.product?.specifications[i];
                if (specification.creamId === cakeOrderInfo.making.cream.id &&
                    specification.sizeId === cakeOrderInfo.making.size.id) {
                    cakeOrderInfo.making.price = specification.price;
                    break;
                }
            }

            if (cakeOrderInfo.making.height && cakeOrderInfo.making.price !== '--') {
                let money = 0;
                let heightObj = JSON.parse(cakeOrderInfo.making.height);
                for (let i = 0; i < heightObj.extraMoneys.length; ++i) {
                    let extraMoney = heightObj.extraMoneys[i];
                    if (extraMoney.sizeId === cakeOrderInfo.making.size.id) {
                        money = extraMoney.money;
                        break;
                    }
                }

                cakeOrderInfo.making.price += money;
            }
        }
    }

    updatePlate = (cakeOrderInfo) => {
        cakeOrderInfo.making.plates = '--';
        for (let i = 0; i < this._cakeSizes.length; ++i) {
            let size = this._cakeSizes[i];
            if (size.id === cakeOrderInfo.making.size.id) {
                cakeOrderInfo.making.plates = size.plates;
                break;
            }
        }
    }

    updateCreamOptions = (cakeOrderInfo) => {
        this._creamOptions = [];
        if (this._cakeCreams) {
            for (let i = 0; i < this._cakeCreams.length; ++i) {
                let cakeCream = this._cakeCreams[i];
                if (cakeOrderInfo.product) {
                    for (let j = 0; j < cakeOrderInfo.product?.specifications?.length; ++j) {
                        let specification = cakeOrderInfo.product?.specifications[j];
                        if (specification.creamId === cakeCream.id) {
                            this._creamOptions.push({ label: cakeCream.name, value: JSON.stringify(cakeCream) });
                            break;
                        }
                    }
                }
            }
        }
        // console.log('this._creamOptions = ' + JSON.stringify(this._creamOptions));
    }

    updateSizeOptions = (cakeOrderInfo) => {
        this._sizeOptions = [];
        if (this._cakeSizes) {
            for (let i = 0; i < this._cakeSizes.length; ++i) {
                let cakeSize = this._cakeSizes[i];
                if (cakeOrderInfo.product) {
                    for (let j = 0; j < cakeOrderInfo.product?.specifications.length; ++j) {
                        let specification = cakeOrderInfo.product?.specifications[j];
                        if (specification.creamId === cakeOrderInfo.making.cream.id &&
                            specification.sizeId === cakeSize.id) {
                            this._sizeOptions.push({ label: cakeSize.name, value: JSON.stringify(cakeSize) });
                            break;
                        }
                    }
                }
            }
        }
        if (this._sizeOptions.length > 1) {
            this._sizeOptions.push({ label: '组合', value: JSON.stringify({ "id": -500, "name": '组合' }) });
        }
        // console.log('this._sizeOptions = ' + JSON.stringify(this._sizeOptions));
    }

    updateHeightOptions = () => {
        this._heightOptions = [];
        if (this._cakeHeights) {
            for (let i = 0; i < this._cakeHeights.length; ++i) {
                let height = this._cakeHeights[i];
                this._heightOptions.push({
                    label: height.name,
                    value: JSON.stringify(height)
                })
            }
        }
        // console.log('this._heightOptions = ' + JSON.stringify(this._heightOptions));
    }

    updateFillingOptions = () => {
        this._fillingOptions = [];
        if (this._cakeFillings) {
            for (let i = 0; i < this._cakeFillings.length; ++i) {
                let filling = this._cakeFillings[i];
                this._fillingOptions.push({
                    label:
                        <div style={{ marginBottom: 6 }}>
                            <Image style={{ width: 54, height: 54, borderRadius: 27, border: '1px dotted #5F9EA0' }} preview={false} src={filling.image} />
                            <div style={{ width: 54, textAlign: 'center' }}>{filling.name}</div>
                        </div>,
                    value: JSON.stringify(filling)
                });
            }
        }
        // console.log('this._fillingOptions = ' + JSON.stringify(this._fillingOptions));
    }

    updateCandleOptions = (cakeOrderInfo) => {
        this._candleOptions = [];
        if (this._cakeCandles) {
            for (let i = 0; i < this._cakeCandles.length; ++i) {
                let candle = this._cakeCandles[i];
                this._candleOptions.push({
                    label:
                        <div style={{ marginBottom: 6 }}>
                            <Image style={{ width: 64, height: 64, borderRadius: 10, border: '1px dotted #5F9EA0' }} preview={false} src={candle.image} />
                            <div style={{ width: 64, textAlign: 'center' }}>
                                {candle.name}
                                {
                                    candle.id === 3 ?
                                        <Input style={{ width: 64, height: 30 }}
                                            disabled={this.evalWith(cakeOrderInfo.making.candle)?.id !== 3}
                                            placeholder='数字'
                                            prefix={<EditOutlined />}
                                            value={cakeOrderInfo.making.candleExtra}
                                            onChange={this.handleCandleExtraChange} />
                                        : <div></div>
                                }
                            </div>
                        </div>,
                    value: JSON.stringify(candle)
                });
            }
        }
        // console.log('this._candleOptions = ' + JSON.stringify(this._candleOptions));
    }

    updateKindlingOptions = () => {
        this._kindlingOptions = [];
        if (this._cakeKindlings) {
            for (let i = 0; i < this._cakeKindlings.length; ++i) {
                let kindling = this._cakeKindlings[i];
                this._kindlingOptions.push({
                    label:
                        <div style={{ marginBottom: 6 }}>
                            <Image style={{ width: 64, height: 64, borderRadius: 10, border: '1px dotted #5F9EA0' }} preview={false} src={kindling.image} />
                            <div style={{ width: 64, textAlign: 'center' }}>{kindling.name}</div>
                        </div>,
                    value: JSON.stringify(kindling)
                })
            }
        }
        // console.log('this._kindlingOptions = ' + JSON.stringify(this._kindlingOptions));
    }

    updateHatOptions = () => {
        this._hatOptions = [];
        if (this._cakeHats) {
            for (let i = 0; i < this._cakeHats.length; ++i) {
                let hat = this._cakeHats[i];
                this._hatOptions.push({
                    label:
                        <div style={{ marginBottom: 6 }}>
                            <Image style={{ width: 64, height: 64, borderRadius: 10, border: '1px dotted #5F9EA0' }} preview={false} src={hat.image} />
                            <div style={{ width: 64, textAlign: 'center' }}>{hat.name}</div>
                        </div>,
                    value: JSON.stringify(hat)
                })
            }
        }
        // console.log('this._hatOptions = ' + JSON.stringify(this._hatOptions));
    }

    updatePickUpTypesOptions = () => {
        this._pickUpTypesOptions = [];
        if (this._cakePickUpTypes) {
            for (let i = 0; i < this._cakePickUpTypes.length; ++i) {
                let pickUpType = this._cakePickUpTypes[i];
                this._pickUpTypesOptions.push({
                    label: pickUpType.name,
                    value: JSON.stringify(pickUpType)
                })
            }
        }
        // console.log('this._pickUpTypesOptions = ' + JSON.stringify(this._pickUpTypesOptions));
    }

    updateShopOptions = () => {
        this._shopOptions = [];
        if (this._cakeShops) {
            for (let i = 0; i < this._cakeShops.length; ++i) {
                let shop = this._cakeShops[i];
                this._shopOptions.push({
                    label: shop.name,
                    value: JSON.stringify(shop)
                })
            }
        }
        // console.log('this._shopOptions = ' + JSON.stringify(this._shopOptions));
    }

    makeRenderItemFunc4Product = () => {
        this._renderItemFunc4Product = (product, index) => {
            // console.log('product=' + JSON.stringify(product))
            let theMinimumSize = {};
            let theMinimumPrice = 0;
            if (product?.specifications.length > 0) {
                let firstSpec = product?.specifications[0];
                theMinimumPrice = firstSpec.price;
                for (let i = 0; i < this._cakeSizes.length; ++i) {
                    let size = this._cakeSizes[i];
                    if (size.id === firstSpec.sizeId) {
                        theMinimumSize = size;
                        break;
                    }
                }
            }
            return (
                <List.Item>
                    <div key={product?.name} style={{ background: '#E8EBE4', borderRadius: 8 }} onClick={() => {
                        this.handleOrderNowClick(product);
                    }}>
                        <Image style={{ border: '1px dotted #5F9EA0', borderRadius: 8 }}
                            preview={false} src={`${product?.images?.[0]}`} />
                        <div style={{ paddingLeft: 6, paddingRight: 4, paddingTop: 4, paddingBottom: 4 }}>
                            <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                                {`${product?.name}`}
                            </div>
                            <div style={{ fontSize: 13 }}>
                                {product?.description}
                            </div>
                            <div style={{ fontSize: 12 }}>
                                {`分类：${product?.category?.id}-${product?.category?.name}`}
                            </div>
                            <div style={{ fontSize: 14 }}>
                                <InfoCircleOutlined style={{ color: '#5F9EA0' }} />
                                <span>{` ${theMinimumSize.number}${theMinimumSize.unit} `}</span>
                                <span>起</span>

                                <PayCircleOutlined style={{ color: '#5F9EA0', marginLeft: 8 }} />
                                <span>{` ${theMinimumPrice}元 `}</span>
                                <span>起</span>
                            </div>
                        </div>
                    </div>
                </List.Item>
            )
        }
    }

    evalWith = (obj) => {
        // console.log('evalWith obj = ' + obj);
        // 有时候转义对象后无法获取属性，eval处理一下
        // if (obj === undefined ||
        //     obj === null ||
        //     Object.keys(obj) !== null) return obj;
        return eval("(" + obj + ")");
    }
    render() {
        const {
            searchName,
            cake4Search,
            cakeRecommend,
            allCakeInfosLoading,
            cakeCategorys,
            cakeOrderInfo,
            orderInfoModalVisiable,
            orderingTime,
            orderImageModalVisiable,
            orderImageSrc,
            orderImageCapturing,
            imageCropperModalVisiable,
            imageBeforeCrop,
            localImgDataLoading,
            image4QRCode
        } = this.state;

        return (
            <div>
                {
                    // 私人订制，图片裁剪
                    imageCropperModalVisiable ? (
                        <div style={{
                            opacity: 1, background: 'white', position: 'fixed',
                            zIndex: '105', width: 'calc(100%)', height: 'calc(100%)',
                            overflowY: 'hidden', overflowX: 'hidden', textAlign: 'center'
                        }}>
                            <Spin spinning={localImgDataLoading}
                                size='large'
                                style={{ marginTop: 160 }}
                                tip='正在获取图片...' />

                            <Cropper
                                src={imageBeforeCrop}
                                onInitialized={(cropper) => {
                                    this._imageCropper = cropper;
                                }}
                                style={{ height: '100%', width: "100%", zIndex: '80' }}
                                aspectRatio={1}
                                guides={true}
                                autoCropArea={0.85}
                            />

                            {
                                !localImgDataLoading ? (
                                    <div>
                                        <div style={{
                                            width: 'calc(100%)', height: 64,
                                            position: 'fixed', top: 0, textAlign: 'center', zIndex: '100'
                                        }}>
                                            <Space size='large' style={{ marginTop: 16, marginBottom: 16 }}>
                                                <RotateLeftOutlined style={{ color: 'white', fontSize: 24 }} onClick={() => {
                                                    this._imageCropper.rotate(-90);
                                                }} />
                                                <RotateRightOutlined style={{ color: 'white', fontSize: 24 }} onClick={() => {
                                                    this._imageCropper.rotate(90);
                                                }} />
                                            </Space>
                                        </div>

                                        <div style={{
                                            width: 'calc(100%)', height: 64,
                                            position: 'fixed', bottom: 0, textAlign: 'center', zIndex: '100'
                                        }}>
                                            <Space style={{ marginTop: 16, marginBottom: 16 }}>
                                                <Button type='default' onClick={() => {
                                                    this.setState({ imageCropperModalVisiable: false });
                                                }}>取消</Button>
                                                <Button type='primary' onClick={() => {
                                                    let dataUrlAfterCroped = this._imageCropper.getCroppedCanvas().toDataURL();
                                                    let customizedProduct = this._private;
                                                    customizedProduct.images = [dataUrlAfterCroped];
                                                    this.setState({ imageCropperModalVisiable: false }, () => {
                                                        setTimeout(() => {
                                                            this.handleOrderNowClick(customizedProduct);
                                                        }, 0);
                                                    });
                                                }}>确定裁剪</Button>
                                            </Space>
                                        </div>
                                    </div>
                                ) : (<div></div>)
                            }
                        </div>
                    ) : (<div></div>)
                }

                {
                    // 订单信息
                    orderInfoModalVisiable ? (
                        <div style={{
                            opacity: 0.99, background: 'white', position: 'fixed',
                            zIndex: '100', width: 'calc(100%)', height: 'calc(100%)',
                            overflowY: 'auto', overflowX: 'hidden'
                        }}>
                            <div style={{ textAlign: 'center', fontSize: 14, marginTop: 8, fontWeight: 'bold' }}>
                                {`《${cakeOrderInfo.product?.name}》`}
                            </div>
                            <div style={{ textAlign: 'center', fontSize: 14, paddingLeft: 8, paddingRight: 8 }}>
                                {cakeOrderInfo.product?.description}
                            </div>
                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <Carousel effect='scrollx' autoplay>
                                    {
                                        cakeOrderInfo.product?.images?.map((i) => {
                                            return (
                                                <Image key={cakeOrderInfo.product?.images.indexOf(i)}
                                                    preview={true} style={{ width: '99%', border: '1px dotted #5F9EA0', borderRadius: 8 }}
                                                    src={i} />
                                            );
                                        })
                                    }
                                </Carousel>
                            </div>
                            <QueueAnim type={['bottom', 'top']}>
                                <div key='a' style={{ textAlign: 'center', width: '100%', marginBottom: 18 }}>
                                    <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>规格</Divider>
                                    {
                                        this._cakeCreams.map(cream => {
                                            let creamExist = false;
                                            for (let i = 0; i < cakeOrderInfo.product?.specifications?.length; ++i) {
                                                let specification = cakeOrderInfo.product?.specifications[i];
                                                if (specification.creamId === cream.id) {
                                                    creamExist = true;
                                                    break;
                                                }
                                            }
                                            return (
                                                <div key={cream.id} >
                                                    {creamExist ?
                                                        <div style={{ display: 'inline-block', marginLeft: 25, marginRight: 25 }}>
                                                            <div style={{ fontWeight: 'bold' }}>{cream.name}</div>
                                                            {
                                                                this._cakeSizes.map(size => {
                                                                    let price = -1;
                                                                    for (let i = 0; i < cakeOrderInfo.product?.specifications.length; ++i) {
                                                                        let specification = cakeOrderInfo.product?.specifications[i];
                                                                        if (specification.creamId === cream.id &&
                                                                            specification.sizeId === size.id) {
                                                                            price = specification.price;
                                                                            break;
                                                                        }
                                                                    }
                                                                    return (
                                                                        <div key={size.id}>
                                                                            {
                                                                                price !== -1 ?
                                                                                    <div>
                                                                                        <span style={{ color: '#5F9EA0' }}>{size.name}</span>
                                                                                        <span style={{ color: 'gray', fontSize: 12 }}>{`${size.description} `}</span>
                                                                                        <span style={{ color: '#5F9EA0' }}>{`${price}元`}</span>
                                                                                        <span></span>
                                                                                    </div> : <div></div>
                                                                            }
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                            {
                                                                this._cakeSizes.length >= 2 ? (
                                                                    <div style={{ fontSize: 10, fontWeight: 'bold', color: 'gray' }}>
                                                                        <div>注1：加高款，价格比通用款增加10~50元不等</div>
                                                                        <div>注2：组合蛋糕，价格为对应尺寸蛋糕价格之和</div>
                                                                    </div>) : (<div></div>)
                                                            }
                                                        </div> : <div></div>}
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <div key='b'>
                                    <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>制作</Divider>
                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <Input.Group style={{ marginBottom: 20 }}>
                                            <span style={{ fontWeight: 'bold' }}>奶油：</span>
                                            <Radio.Group
                                                size='large'
                                                options={this._creamOptions}
                                                onChange={this.handleCreamChange}
                                                value={JSON.stringify(cakeOrderInfo.making.cream)}
                                                optionType='default'
                                            />
                                            {
                                                cakeOrderInfo.making.cream === undefined ? (
                                                    <div style={{ color: 'red' }}>“奶油”是必填项</div>
                                                ) : (<div></div>)
                                            }
                                        </Input.Group>
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>尺寸：</span>
                                        <Select
                                            disabled={!cakeOrderInfo.making.cream}
                                            style={{ width: 110, marginRight: 8 }}
                                            onChange={this.handleSizeChange}
                                            onDropdownVisibleChange={this.handleSizeSelectDropdownVisibleChange}
                                            options={this._sizeOptions}
                                            value={JSON.stringify(cakeOrderInfo.making.size)} />
                                        {
                                            cakeOrderInfo.making.size?.id === -500 ? (
                                                <span>
                                                    <Input placeholder='几寸+几寸'
                                                        prefix={<EditOutlined />}
                                                        style={{ width: 180 }}
                                                        value={cakeOrderInfo.making.sizeExtra}
                                                        onChange={this.handleSizeExtraChange} />
                                                </span>) : (<div></div>)
                                        }
                                        {
                                            cakeOrderInfo.making.size === undefined ||
                                                (cakeOrderInfo.making.size.id === -500 &&
                                                    (cakeOrderInfo.making.sizeExtra === undefined ||
                                                        cakeOrderInfo.making.sizeExtra === '')) ? (
                                                <div style={{ color: 'red' }}>“尺寸”是必填项</div>
                                            ) : (<span></span>)
                                        }
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>高度：</span>
                                        <Select
                                            disabled={!cakeOrderInfo.making.cream || !cakeOrderInfo.making.size}
                                            style={{ width: 100 }}
                                            onChange={this.handleHeightChange}
                                            value={cakeOrderInfo.making.height}
                                            options={this._heightOptions}>
                                        </Select>
                                        <div style={{ fontSize: 14, color: 'gray' }}>{this._cakeHeightsDescription}</div>
                                        {
                                            this.evalWith(cakeOrderInfo.making.height)?.id === undefined ||
                                                this.evalWith(cakeOrderInfo.making.height)?.id === null ? (
                                                <div style={{ color: 'red' }}>“高度”是必填项</div>
                                            ) : (<div></div>)
                                        }
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>价格：</span>
                                        <span>{cakeOrderInfo.making.price}</span>
                                        <span> 元</span>
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 'bold' }}>
                                            <span>夹心</span>
                                            {
                                                this.evalWith(cakeOrderInfo.making.height)?.name ? <span>
                                                    {`（${this.evalWith(cakeOrderInfo.making.height)?.name}，任选 ${cakeOrderInfo.product?.fillingNumber} 种）：`}
                                                </span> : <span>：</span>
                                            }
                                        </div>
                                        <CheckboxGroup
                                            disabled={cakeOrderInfo.product?.fillingNumber > 0 ? false : true}
                                            style={{ marginTop: 8 }}
                                            options={this._fillingOptions}
                                            value={cakeOrderInfo.making.fillings}
                                            onChange={(value) => this.handleCakeFillingChange(value, cakeOrderInfo.product?.fillingNumber)} />
                                        {
                                            cakeOrderInfo.making.fillings?.length === 0 && cakeOrderInfo.product?.fillingNumber > 0 ? (
                                                <div style={{ color: 'red' }}>“夹心”是必填项</div>
                                            ) : (<span></span>)
                                        }
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 'bold' }}>蜡烛（任选一种，若蛋糕自带蜡烛则不额外赠送蜡烛）：</div>

                                        <Radio.Group style={{ marginTop: 8 }}
                                            options={this._candleOptions}
                                            value={cakeOrderInfo.making.candle}
                                            onChange={this.handleCandleChange}>
                                        </Radio.Group>
                                        {
                                            cakeOrderInfo.making.candle === undefined ||
                                                (this.evalWith(cakeOrderInfo.making.candle)?.id === 3 &&
                                                    (cakeOrderInfo.making.candleExtra === undefined ||
                                                        cakeOrderInfo.making.candleExtra === '')) ? (
                                                <div style={{ color: 'red', marginLeft: 0 }}>“蜡烛”是必填项</div>
                                            ) : (<span></span>)
                                        }
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 'bold' }}>火柴（如需要请选择，默认没有火柴）：</div>

                                        <Radio.Group style={{ marginTop: 8 }}
                                            options={this._kindlingOptions}
                                            value={cakeOrderInfo.making.kindling}
                                            onChange={this.handleKindlingChange}>
                                        </Radio.Group>
                                    </div>

                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 'bold' }}>帽子（任选一种，默认为金卡皇冠帽）：</div>

                                        <Radio.Group style={{ marginTop: 8 }}
                                            options={this._hatOptions}
                                            onChange={this.handleHatChange}>
                                            value={cakeOrderInfo.making.hat}
                                        </Radio.Group>
                                    </div>

                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>餐具：</span>
                                        <span>{cakeOrderInfo.making.plates}</span>
                                        <span> 套</span>
                                    </div>
                                </div>
                                <div key='c'>
                                    <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>取货</Divider>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 'bold' }}>时间：</div>
                                        <div>
                                            <DatePicker
                                                ref={(dp) => this._datePicker4PickUpDay = dp}
                                                style={{ width: 180 }}
                                                size='large'
                                                placeholder='日期'
                                                format='YYYY-MM-DD dddd'
                                                value={cakeOrderInfo.delivery.pickUpDay}
                                                open={cakeOrderInfo.delivery.pickUpDayPopupOpen}
                                                showToday={false}
                                                inputReadOnly={true}
                                                onChange={this.handlePickUpDayChange}
                                                onFocus={this.handlePickUpDayOnFocus}
                                                onBlur={this.handlePickUpDayOnBlur}
                                                dateRender={(current) => {
                                                    const style = {};

                                                    if (current.date() === 1) {
                                                        style.border = '1px solid #1890ff';
                                                        style.borderRadius = '50%';
                                                    }

                                                    return (
                                                        <div className="ant-picker-cell-inner" style={style} onClick={() => {
                                                            this.setState({ pickUpDayPopupOpen: false }, () => {
                                                                setTimeout(() => {
                                                                    this._datePicker4PickUpDay.blur();
                                                                }, 300);
                                                            });
                                                        }}>
                                                            {current.date()}
                                                        </div>
                                                    );
                                                }}
                                                renderExtraFooter={() =>
                                                (<span>
                                                    <Button type='primary' size='small' onClick={() => {
                                                        const { cakeOrderInfo } = this.state;
                                                        cakeOrderInfo.delivery.pickUpDayPopupOpen = false;
                                                        cakeOrderInfo.delivery.pickUpDay = moment();
                                                        this.setState({ cakeOrderInfo: cakeOrderInfo }, () => {
                                                            setTimeout(() => {
                                                                this._datePicker4PickUpDay.blur();
                                                            }, 300);
                                                        });
                                                    }}>今天</Button>
                                                    <span>   </span>
                                                    <Button type='primary' size='small' onClick={() => {
                                                        const { cakeOrderInfo } = this.state;
                                                        cakeOrderInfo.delivery.pickUpDayPopupOpen = false;
                                                        cakeOrderInfo.delivery.pickUpDay = moment().add(1, 'day');
                                                        this.setState({ cakeOrderInfo: cakeOrderInfo }, () => {
                                                            setTimeout(() => {
                                                                this._datePicker4PickUpDay.blur();
                                                            }, 300);
                                                        });
                                                    }}>明天</Button>
                                                    <span>   </span>
                                                    <Button type='primary' size='small' onClick={() => {
                                                        const { cakeOrderInfo } = this.state;
                                                        cakeOrderInfo.delivery.pickUpDayPopupOpen = false;
                                                        cakeOrderInfo.delivery.pickUpDay = moment().add(2, 'day');
                                                        this.setState({ cakeOrderInfo: cakeOrderInfo }, () => {
                                                            setTimeout(() => {
                                                                this._datePicker4PickUpDay.blur();
                                                            }, 300);
                                                        });
                                                    }}>后天</Button>
                                                </span>)
                                                } />
                                        </div>
                                        <div style={{ marginTop: 4 }}>
                                            <DatePicker
                                                ref={(dp) => this._datePicker4PickUpTime = dp}
                                                picker='time'
                                                size='large'
                                                style={{ width: 150 }}
                                                placeholder='时间'
                                                locale={dpLocale}
                                                showTime={{
                                                    use12Hours: false,
                                                    showNow: false,
                                                    format: 'a HH:mm'
                                                }}
                                                panelRender={(originPicker) => {
                                                    return (
                                                        <div style={{ marginLeft: 10, marginRight: 10 }}>
                                                            {originPicker}
                                                        </div>)
                                                }}
                                                format='a HH:mm'
                                                value={cakeOrderInfo.delivery.pickUpTime}
                                                open={cakeOrderInfo.delivery.pickUpTimePopupOpen}
                                                onFocus={this.handlePickUpTimeOnFocus}
                                                onBlur={this.handlePickUpTimeOnBlur}
                                                onOk={this.handlePickUpTimeOnOk}
                                                inputReadOnly={true}
                                                onChange={this.handlePickUpTimeChange}
                                                renderExtraFooter={() => (
                                                    <span>
                                                        <Button type='primary' size='small' onClick={() => {
                                                            const { cakeOrderInfo } = this.state;
                                                            cakeOrderInfo.delivery.pickUpTimePopupOpen = false;
                                                            cakeOrderInfo.delivery.pickUpTime = moment('12:30', 'HH:mm')
                                                            this.setState({ cakeOrderInfo: cakeOrderInfo }, () => {
                                                                setTimeout(() => {
                                                                    this._datePicker4PickUpTime.blur();
                                                                }, 300);
                                                            });
                                                        }}>中午 12点30分</Button>
                                                        <span>   </span>
                                                        <Button type='primary' size='small' onClick={() => {
                                                            const { cakeOrderInfo } = this.state;
                                                            cakeOrderInfo.delivery.pickUpTimePopupOpen = false;
                                                            cakeOrderInfo.delivery.pickUpTime = moment('18:30', 'HH:mm')
                                                            this.setState({ cakeOrderInfo: cakeOrderInfo }, () => {
                                                                setTimeout(() => {
                                                                    this._datePicker4PickUpTime.blur();
                                                                }, 300);
                                                            });
                                                        }}>晚上 18点30分</Button>
                                                    </span>
                                                )} />
                                        </div>
                                        {
                                            (cakeOrderInfo.delivery.pickUpDay === undefined ||
                                                cakeOrderInfo.delivery.pickUpDay === null ||
                                                cakeOrderInfo.delivery.pickUpDay === '') ||
                                                (cakeOrderInfo.delivery.pickUpTime === undefined ||
                                                    cakeOrderInfo.delivery.pickUpTime === null ||
                                                    cakeOrderInfo.delivery.pickUpTime === '') ? (
                                                <div style={{ color: 'red' }}>“时间”是必填项</div>
                                            ) : (<div></div>)
                                        }
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>方式：</span>
                                        <Radio.Group
                                            size='large'
                                            options={this._pickUpTypesOptions}
                                            onChange={this.handlePickUpTypeChange}
                                            value={cakeOrderInfo.delivery.pickUpType}
                                            optionType='default'
                                        />
                                        {
                                            cakeOrderInfo.delivery.pickUpType === undefined ? (
                                                <div style={{ color: 'red' }}>“方式”是必填项</div>
                                            ) : (<div></div>)
                                        }
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>门店：</span>
                                        <Select style={{ width: 160 }}
                                            onChange={this.handleShopChange}
                                            value={cakeOrderInfo.delivery.shop}
                                            options={this._shopOptions}>
                                        </Select>
                                        <div style={{ fontSize: 14, color: 'gray' }}>{this._cakeShopsDescription}</div>
                                        {
                                            this.evalWith(cakeOrderInfo.delivery.shop)?.id === undefined ||
                                                this.evalWith(cakeOrderInfo.delivery.shop)?.id === null ? (
                                                <div style={{ color: 'red' }}>“门店”是必填项</div>
                                            ) : (<div></div>)
                                        }
                                    </div>
                                    {
                                        this.evalWith(cakeOrderInfo.delivery.pickUpType)?.id === 2 ? (
                                            <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                                <Input.Group>
                                                    <span style={{ fontWeight: 'bold' }}>地址：</span>
                                                    <Input style={{ width: 'calc(100% - 100px)', textAlign: 'left' }}
                                                        placeholder='填写地址（详细到门牌号）' prefix={<HomeOutlined />}
                                                        value={cakeOrderInfo.delivery.address}
                                                        onChange={this.handleAddressChange} />
                                                    {
                                                        cakeOrderInfo.delivery.address === undefined ||
                                                            cakeOrderInfo.delivery.address === '' ? (
                                                            <div style={{ color: 'red' }}>“地址”是必填项</div>
                                                        ) : (<div></div>)
                                                    }
                                                </Input.Group>
                                            </div>
                                        ) : (
                                            <div>
                                            </div>
                                        )
                                    }
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <Input.Group>
                                            <span style={{ fontWeight: 'bold' }}>姓名：</span>
                                            <Input style={{ width: 'calc(100% - 100px)', textAlign: 'left' }}
                                                placeholder='填写姓名'
                                                prefix={<UserOutlined />}
                                                value={cakeOrderInfo.delivery.pickUpName}
                                                onChange={this.handlePickUpNameChange} />
                                            {
                                                cakeOrderInfo.delivery.pickUpName === '' ||
                                                    cakeOrderInfo.delivery.pickUpName === undefined ? (
                                                    <div style={{ color: 'red' }}>“姓名”是必填项</div>
                                                ) : (<div></div>)
                                            }
                                        </Input.Group>
                                    </div>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                        <Input.Group>
                                            <span style={{ fontWeight: 'bold' }}>手机：</span>
                                            <Input style={{ width: 'calc(100% - 100px)', textAlign: 'left' }}
                                                placeholder='填写手机号'
                                                prefix={<PhoneOutlined />}
                                                value={cakeOrderInfo.delivery.phoneNumber}
                                                onChange={this.handlePhoneNumberChange} />
                                            {
                                                /^\d{11}$/.test(cakeOrderInfo.delivery.phoneNumber) === false ? (
                                                    <div style={{ color: 'red' }}>“手机号”必须是11位</div>
                                                ) : (<div></div>)
                                            }
                                        </Input.Group>
                                    </div>
                                </div>
                                <div key='d'>
                                    <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>其它</Divider>
                                    <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 24, marginRight: 24, textAlign: 'center' }}>
                                        <Input.Group>
                                            <span style={{ fontWeight: 'bold' }}>备注：</span>
                                            <TextArea style={{ width: 'calc(100% - 0px)', textAlign: 'left' }} rows={5}
                                                placeholder={`1：如果蛋糕上有文字或者数字，请务必备注是否修改；${'\n'}2：有其它特殊要求，请务必备注说明；`} value={cakeOrderInfo.other.remarks}
                                                onChange={this.handleRemarksChange} />
                                        </Input.Group>
                                    </div>
                                    <div style={{ height: 80 }}></div>
                                </div>
                            </QueueAnim>

                            <div style={{
                                width: 'calc(100%)', height: 64, backgroundColor: '#E8EBE4',
                                position: 'fixed', bottom: 0, textAlign: 'center', zIndex: '100'
                            }}>
                                <Space style={{ marginTop: 16, marginBottom: 16 }}>
                                    <Button type='default' onClick={() => this.handleOrderCakeInfoModalCancel()}>取消</Button>
                                    <Button danger type='primary' onClick={() => this.handleOrderCakeInfoModalOk()}>生成订购单</Button>
                                </Space>
                            </div>
                        </div>) : (<div></div>)
                }

                {
                    // 订单图片
                    orderImageModalVisiable ? (
                        <div style={{
                            background: 'rgba(0,0,0,0.9)', position: 'fixed',
                            zIndex: '100', width: 'calc(100%)', height: 'calc(100%)',
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
                                        <Button key='back' type='primary' danger onClick={() => this.handleOrderImageModalCancel()}>X</Button>
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
                            <Spin spinning={orderImageCapturing} size='large' tip='生成订购单中...' >
                                <div ref={(current) => { this._theDiv4Capture = current; }}
                                    style={this._theDiv4CaptureStyle}>
                                    <div id="qrcode" style={{
                                        textAlign: 'right', position: 'absolute',
                                        paddingRight: 18, paddingTop: 10,
                                        width: this._theDiv4CaptureWidth, height: 150
                                    }}>
                                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>电子订购单二维码</div>
                                        <Image style={{ width: 135, height: 135 }}
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
                                                <span>{`《${cakeOrderInfo.product?.name}》`}</span>
                                            </div>
                                            <div>
                                                <div style={{ position: 'relative' }}>
                                                    <Image preview={false} src={cakeOrderInfo.product?.images?.[0]} />
                                                </div>
                                                <Image style={{ marginTop: 16 }} preview={false} src="/image/弯麦logo长.png" />
                                            </div>
                                        </div>
                                        <div style={this._theRightDivInTheDiv4CaptureStyle}>
                                            <Divider orientation='left' dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>制作</Divider>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>奶油：</span>
                                                <span style={{ fontSize: 18, color: 'green' }}>{cakeOrderInfo.making.cream.name}</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>尺寸：</span>
                                                <span style={{ fontSize: 18, color: 'green' }}>{cakeOrderInfo.making.size.name}</span>
                                                {
                                                    cakeOrderInfo.making.size.id === -500 ? (
                                                        <span style={{ fontSize: 18, color: 'green' }}>
                                                            {` | ${cakeOrderInfo.making.sizeExtra}`}
                                                        </span>) : (<span></span>)
                                                }
                                                <span style={{ fontSize: 18, color: 'green' }}>
                                                    {` | ${this.evalWith(cakeOrderInfo.making.height)?.name}`}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>价格：</span>
                                                <span style={{ fontSize: 14 }}>{cakeOrderInfo.making.price}</span>
                                                <span style={{ fontSize: 14 }}>元</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>夹心：</span>
                                                <span style={{ fontSize: 16, color: 'green' }}>{
                                                    cakeOrderInfo.making.fillings.length > 0 ?
                                                        cakeOrderInfo.making.fillings.map(item => this.evalWith(item)?.name).join('+') :
                                                        '没有夹心'
                                                }</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>蜡烛：</span>
                                                <span style={{ fontSize: 16, color: 'blue' }}>{this.evalWith(cakeOrderInfo.making.candle).name}</span>
                                                {
                                                    this.evalWith(cakeOrderInfo.making.candle).id === 3 ? (
                                                        <span style={{ fontSize: 16, color: 'blue' }}>
                                                            {`(${cakeOrderInfo.making.candleExtra})`}
                                                        </span>) : (<span></span>)
                                                }
                                                {
                                                    this.evalWith(cakeOrderInfo.making.kindling)?.id === 2 ? (
                                                        <span style={{ fontSize: 16, color: 'blue' }}>
                                                            {`+火柴盒`}
                                                        </span>
                                                    ) : (<span></span>)
                                                }
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>帽子：</span>
                                                <span style={{ fontSize: 16, color: 'blue' }}>{this.evalWith(cakeOrderInfo.making.hat).name}</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>餐具：</span>
                                                <span style={{ fontSize: 16, color: 'blue' }}>{cakeOrderInfo.making.plates}</span>
                                                <span style={{ fontSize: 16, color: 'blue' }}>套</span>
                                            </div>
                                            <Divider orientation='left' style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>取货</Divider>
                                            <div>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>时间：</span>
                                                <span style={{ fontSize: 18, color: 'red' }}>{cakeOrderInfo.delivery.pickUpDay?.format('YYYY-MM-DD ddd')}</span>
                                                <span style={{ fontSize: 18, color: 'red' }}>{cakeOrderInfo.delivery.pickUpTime?.format(' a HH:mm')}</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>方式：</span>
                                                <span style={{ fontSize: 14 }}>{this.evalWith(cakeOrderInfo.delivery.pickUpType)?.name}</span>
                                            </div>
                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>门店：</span>
                                                <span style={{ fontSize: 14 }}>{this.evalWith(cakeOrderInfo.delivery.shop)?.name}</span>
                                            </div>
                                            {
                                                this.evalWith(cakeOrderInfo.delivery.pickUpType)?.id === 2 ? (
                                                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>地址：</span>
                                                        <span style={{ fontSize: 18, color: 'red' }}>{cakeOrderInfo.delivery.address}</span>
                                                    </div>
                                                ) : (<div></div>)
                                            }

                                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>姓名：</span>
                                                <span style={{ fontSize: 18, color: 'red' }}>
                                                    {`${cakeOrderInfo.delivery.pickUpName}（${cakeOrderInfo.delivery.phoneNumber}）`}
                                                </span>
                                            </div>
                                            <Divider orientation='left' style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                                            <div style={{ marginTop: 4, marginBottom: 4, marginRight: 8 }}>
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>备注：</span>
                                                <span style={{ fontSize: 18, color: 'red', wordWrap: 'break-word' }}>
                                                    {cakeOrderInfo.other.remarks}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Spin>
                        </div>) : (<div></div>)
                }

                <div>
                    {/* 联系方式 */}
                    <div style={{
                        textAlign: 'center', color: '#5F9EA0',
                        fontSize: 16, fontWeight: 'normal', paddingTop: 7, paddingBottom: 5
                    }}>
                        <span>联系弯麦总店2号</span>
                        <span style={{ textDecoration: 'underline' }}>
                            <a href="tel:18599568588">18599568588</a>
                        </span>
                        <span> (微信同号)</span>
                    </div>

                    {/* 搜索框 */}
                    <div style={{ padding: 12 }}>
                        <Input
                            disabled={allCakeInfosLoading}
                            placeholder="输入关键词搜索蛋糕"
                            allowClear
                            size='middle'
                            value={searchName}
                            onChange={this.handleSearchInputOnChange}
                        />
                    </div>

                    {/* 展示区 */}
                    {
                        (!searchName || searchName === '') ?
                            (
                                <div>
                                    {/* 私人订制 */}
                                    <div style={{
                                        textAlign: 'center', marginTop: 0, fontSize: 24,
                                        backgroundColor: 'red', color: 'white',
                                        borderRadius: 8, paddingTop: 8, paddingBottom: 8
                                    }} onClick={() => {
                                        let that = this;
                                        window.wx.chooseImage({
                                            count: 1, // 默认9
                                            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                                            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                                            success: function (res) {
                                                that.setState({
                                                    imageCropperModalVisiable: true,
                                                    localImgDataLoading: true,
                                                    imageBeforeCrop: ''
                                                });

                                                let localIds = res.localIds; // 返回选定照片的本地 ID 列表，localId可以作为 img 标签的 src 属性显示图片
                                                window.wx.getLocalImgData({
                                                    localId: localIds[0], // 图片的localID
                                                    success: function (res) {
                                                        // console.log('4')
                                                        let localData = res.localData; // localData是图片的base64数据，可以用 img 标签显示
                                                        /// 如果缺少base64头部补充上
                                                        if (!(localData.startsWith('data:image/jpg;base64,'))) {
                                                            localData = 'data:image/jpg;base64,' + localData;
                                                        }
                                                        that.setState({ localImgDataLoading: false, imageBeforeCrop: localData });
                                                    }
                                                });
                                            }
                                        });
                                    }}>
                                        <span>私人订制蛋糕</span>
                                        <span style={{ color: 'whitesmoke', fontSize: 13, marginLeft: 8 }}>点击选择蛋糕照片</span>
                                    </div>
                                    {/* 推荐区域 */}
                                    <div style={{
                                        textAlign: 'center', marginTop: 10, fontSize: 16,
                                        backgroundColor: '#5F9EA0', color: 'white',
                                        borderRadius: 30, paddingTop: 8, paddingBottom: 8
                                    }}>
                                        {`${cakeRecommend.name}`}
                                    </div>
                                    <List loading={allCakeInfosLoading}
                                        style={{ marginLeft: 4, marginRight: 4, marginTop: 4 }}
                                        grid={{ gutter: 4, column: this._columnNumber }}
                                        dataSource={cakeRecommend.products}
                                        renderItem={this._renderItemFunc4Product}
                                    />
                                    <div style={{
                                        textAlign: 'center', color: '#5F9EA0',
                                        fontSize: 18, paddingTop: 10, paddingBottom: 20
                                    }}>
                                        更多款式请点击下方分类查看
                                    </div>

                                    {/* 分类区域 */}
                                    <Collapse
                                        bordered={true}
                                        expandIcon={({ isActive }) =>
                                            <RightSquareFilled
                                                style={{ fontSize: 24, color: 'whitesmoke' }}
                                                rotate={isActive ? 90 : 0} />
                                        }
                                        expandIconPosition='right'
                                        onChange={this.handleCollapseOnChange}>
                                        {
                                            cakeCategorys.map((category) => {
                                                return (<Panel
                                                    header={
                                                        (
                                                            <div style={{ marginLeft: 0, marginRight: 4, color: 'white', fontSize: 20 }}>
                                                                <div>
                                                                    <div>
                                                                        <span>{`${category.id}：${category.name}`}</span>
                                                                        <span style={{ fontSize: 14 }}>{`-${category.products.length}`}</span>
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: 'whitesmoke' }}>
                                                                        {`${category.description}`}
                                                                    </div>
                                                                </div>
                                                                <div style={{ marginLeft: 4, marginTop: 8 }}>
                                                                    {
                                                                        category.images.map((image) => {
                                                                            let index = category.images.indexOf(image);
                                                                            return (
                                                                                <span key={index}>
                                                                                    <Image style={{ marginRight: 6, width: 64, height: 64, borderRadius: 6 }}
                                                                                        preview={false} src={image} />
                                                                                </span>
                                                                            );
                                                                        })
                                                                    }
                                                                    <div style={{ fontSize: 16, marginLeft: 4, marginTop: 4 }}>{category.opened ? '' : '查看更多......'}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    style={{ backgroundColor: '#5F9EA0', borderRadius: 24 }}
                                                    key={category.id}>
                                                    <List style={{ marginLeft: -12, marginRight: -12, marginTop: -12 }}
                                                        grid={{ gutter: 4, column: this._columnNumber }}
                                                        dataSource={category.products}
                                                        renderItem={this._renderItemFunc4Product} />
                                                </Panel>)
                                            })
                                        }
                                    </Collapse>
                                </div>
                            ) :
                            (
                                <List style={{ marginLeft: 4, marginRight: 4, marginTop: 4 }}
                                    grid={{ gutter: 4, column: this._columnNumber }}
                                    dataSource={cake4Search}
                                    renderItem={this._renderItemFunc4Product} />
                            )
                    }

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
                </div>
            </div >

        )
    }
}

export default cakeMenu;
