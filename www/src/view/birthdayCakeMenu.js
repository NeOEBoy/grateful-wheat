/*
* 蛋糕图册链接
* http://gratefulwheat.ruyue.xyz/birthdayCakeMenu
*/

import React from 'react';
import moment from 'moment';
import html2Canvas from 'html2canvas';
import dpLocale from 'antd/es/date-picker/locale/zh_CN';
import QueueAnim from 'rc-queue-anim';
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import QRCode from 'qrcode'

import Icon, {
    RightSquareFilled,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined,
    EditOutlined,
    PlusOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    LoadingOutlined,
    PayCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import {
    Collapse, Image, Spin,
    DatePicker, Radio, List,
    Select, Input, Checkbox, Divider,
    message, Timeline, Button, Space,
    BackTop
} from 'antd';
import {
    loadProductsSale,
    loadBirthdayCakesRecommend,
    loadBirthdayCakesAll,
    loadBirthdayCakesWXConfig,
    wechatSign,
    templateSendToSomePeople,
    createBirthdaycakeOrder,
    allCakeInfos
} from '../api/api';
import {
    getWWWHost,
} from '../api/util';

const { Panel } = Collapse;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

const KBrithdayCakeRootWith3 = '/生日蛋糕';


const KPickUpTypeOptions = [
    { label: '自己提货', value: '自己提货' },
    { label: '商家配送', value: '商家配送' }
];

const KResponseShopOptions = [
    { label: '教育局店', value: '教育局店' },
    { label: '江滨店', value: '江滨店' },
    { label: '汤泉世纪店', value: '汤泉世纪店' },
    { label: '旧镇店', value: '旧镇店' },
    { label: '狮头店', value: '狮头店' },
    { label: '盘陀店', value: '盘陀店' }
];

const KCandleTypeOptions = [
    { label: '爱心蜡烛', value: '爱心蜡烛' },
    { label: '五星蜡烛', value: '五星蜡烛' },
    { label: '数字蜡烛', value: '数字蜡烛' },
    { label: '曲线蜡烛', value: '曲线蜡烛' },
    { label: '荷花●音乐蜡烛', value: '荷花●音乐蜡烛' }
];

/// 点火器
const KIgnitorTypeOptions = [
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/蜡烛/无需火柴.jpg" />
            <div style={{ width: 70, textAlign: 'center' }}>不需要火柴</div>
        </div>), value: '不需要火柴'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/蜡烛/火柴盒.jpg" />
            <div style={{ width: 70, textAlign: 'center' }}>需要火柴</div>
            <div style={{ width: 70, textAlign: 'center' }}>一盒</div>
        </div>), value: '需要火柴'
    }
];

/// 帽子
const KHatTypeOptions = [
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/帽子/无需生日帽.jpg" />
            <div style={{ width: 70, textAlign: 'center' }}>无需生日帽</div>
        </div>), value: '无需生日帽'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/帽子/金卡皇冠帽.jpg" />
            <div style={{ width: 70, textAlign: 'center' }}>金卡皇冠帽</div>
            <div style={{ width: 70, textAlign: 'center' }}>一顶</div>
        </div>), value: '金卡皇冠帽'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/帽子/红卡皇冠帽.jpg" />
            <div style={{ width: 70, textAlign: 'center' }}>红卡皇冠帽</div>
            <div style={{ width: 70, textAlign: 'center' }}>一顶</div>
        </div>), value: '红卡皇冠帽'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/帽子/金卡磨砂圆锥帽.jpg" />
            <div style={{ width: 70, textAlign: 'center' }}>金卡磨砂圆锥帽</div>
            <div style={{ width: 70, textAlign: 'center' }}>一顶</div>
        </div>), value: '金卡磨砂圆锥帽'
    },
];

const KCakeRecommendPeople = {
    '5寸': '直径12.5厘米 | 1-2人',
    '6寸': '直径15厘米 | 3-5人',
    '8寸': '直径20厘米 | 6-9人',
    '10寸': '直径25厘米 | 10-15人',
    '12寸': '直径30厘米 | 16-20人',
    '14寸': '直径46厘米 | 21-30人'
};

class birthdayCakeMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // 主页
            cakeRecommend: {},
            cakeCategorys: [],
            cakeProducts: [],
            /// 搜索
            searchName: '',
            cake4Search: [],

            /// 蛋糕信息
            cakeOrderInfoModalVisiable: false,
            cakeOrderInfo: {
                product: undefined,
                making: { fillings: [] },
                deliver: {}
            },
            cakeSizes: [],
            cakeCreams: [],
            cakeFillings: [],
            cakeCandles: [],
            cakeKindlings: [],
            cakeHats: [],

            cakeImage: '',
            orderCakePrices: {},
            creamType: '',
            cakeSize: '',
            cakeSizeExtra: '',
            cakePrice: '--',
            canSelectCakeFilling: true,
            candleType: KCandleTypeOptions[0].value,
            ignitorType: KIgnitorTypeOptions[0].value,
            hatType: KHatTypeOptions[1].value,
            number4candle: '',
            cakePlateNumber: '--',
            /// 配送信息
            pickUpDay: '',
            pickUpDayPopupOpen: false,
            pickUpTime: '',
            pickUpTimePopupOpen: false,
            pickUpType: '',
            responseShop: '',
            deliverAddress: '',
            pickUpName: '',
            phoneNumber: '',
            remarks: '',

            /// 制单时间
            makingTime: '',

            orderImageModalVisiable: false,
            orderImageSrc: undefined,
            imageCapturing: false,
            imageBeforeCrop: '',
            imageCropperModalVisiable: false,
            localImgDataLoading: false,
            divImageLoading: false,
            image4QRCode: ''
        };

        this._lastKeys = [];
        this._birthdayCakeAll = [];
    }

    componentDidMount = async () => {
        const cakeInfosObj = await allCakeInfos();
        // console.log('cakeInfosObj.recommend = ' + JSON.stringify(cakeInfosObj.recommend));
        // console.log('cakeInfosObj.categorys = ' + JSON.stringify(cakeInfosObj.categorys));
        // console.log('cakeInfosObj.creams = ' + JSON.stringify(cakeInfosObj.creams));
        this.setState({
            cakeRecommend: cakeInfosObj.recommend,
            cakeCategorys: cakeInfosObj.categorys,
            cakeProducts: cakeInfosObj.products,
            cakeSizes: cakeInfosObj.sizes,
            cakeCreams: cakeInfosObj.creams,
            cakeFillings: cakeInfosObj.fillings,
            cakeCandles: cakeInfosObj.candles,
            cakeKindlings: cakeInfosObj.kindlings,
            cakeHats: cakeInfosObj.hats
        });
        this.updateWeixinConfig();
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

            window.wx.ready(async function () {
                /**
                 * config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
                 * config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
                 * 则须把相关接口放在ready函数中调用来确保正确执行。
                 * 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                 * */
                // console.log('window.wx ready');

                let wXConfig = await loadBirthdayCakesWXConfig();

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
    }

    handleOrderNowClick = (current, type, name, description, prices, can) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.product = current;

        this.setState({
            cakeOrderInfoModalVisiable: true,
            cakeOrderInfo: cakeOrderInfo
            // orderCakePrices: prices,
            // cakeImage: type === 0 ? KBrithdayCakeRootWith3 + '/' + name + '-方图.jpg' : '私人订制蛋糕',
            // creamType: '',
            // cakeSize: '',
            // cakeSizeExtra: '',
            // cakePrice: '--',
            // canSelectCakeFilling: can,
            // cakeFillings: [],
            // candleType: KCandleTypeOptions[0].value,
            // number4candle: '',
            // cakePlateNumber: '--',

            // /// 配送信息
            // pickUpDay: '',
            // pickUpTime: '',
            // pickUpType: '',
            // responseShop: '',
            // deliverAddress: '',
            // pickUpName: '',
            // phoneNumber: '',
            // remarks: '',

            // makingTime: '',
        });

        document.documentElement.style.overflow = 'hidden';
    }

    handleOrderCakeInfoModalOk = () => {
        const {
            cakeOrderInfo,
            creamType,
            cakeImage,
            cakeSize,
            cakeSizeExtra,
            cakePrice,
            canSelectCakeFilling,
            cakeFillings,
            candleType,
            ignitorType,
            hatType,
            number4candle,
            cakePlateNumber,
            pickUpDay,
            pickUpTime,
            pickUpType,
            responseShop,
            deliverAddress,
            pickUpName,
            phoneNumber,
            remarks
        } = this.state;

        if (cakeImage === '私人订制蛋糕') {
            message.warning('请先选择蛋糕图片！')
            return;
        }

        if (creamType === '' ||
            cakeSize === '' ||
            (cakeFillings.length === 0 && canSelectCakeFilling) ||
            candleType === '' ||
            cakePlateNumber === '' ||
            pickUpDay === '' ||
            pickUpTime === '' ||
            pickUpType === '' ||
            pickUpName === '' ||
            phoneNumber === '') {
            message.warning('请填写必填项！')
            return;
        }

        if (cakeSize === '组合') {
            if (cakeSizeExtra === '') {
                message.warning('请填写必填项！')
                return;
            }
        }

        if (pickUpType) {
            if (responseShop === '') {
                message.warning('请填写必填项！')
                return;
            } else if (pickUpType === KPickUpTypeOptions[1].value &&
                deliverAddress === '') {
                message.warning('请填写必填项！')
                return;
            }
            if (candleType === KCandleTypeOptions[2].value &&
                number4candle === '') {
                message.warning('请填写必填项！')
                return;
            }
        }

        this.setState({
            cakeOrderInfoModalVisiable: false,
            makingTime: moment().format('YYYY.MM.DD ddd a HH:mm'),
            image4QRCode: ''
        }, () => {
            setTimeout(() => {
                this.setState({
                    imageCapturing: true
                }, async () => {
                    if (!this._theDiv4Capture) return;

                    /// 保存蛋糕订单，返回_id
                    // let createResult = { _id: '123' };
                    let createResult = await createBirthdaycakeOrder(
                        cakeOrderInfo.product.name,
                        cakeOrderInfo.product.description,
                        creamType,
                        cakeSize,
                        cakeSizeExtra,
                        cakePrice,
                        cakeFillings,
                        candleType,
                        ignitorType,
                        hatType,
                        number4candle,
                        cakePlateNumber,
                        pickUpDay ? pickUpDay.format('YYYY-MM-DD ddd') : '',
                        pickUpTime ? pickUpTime.format(' a HH:mm') : '',
                        pickUpType,
                        responseShop,
                        deliverAddress,
                        pickUpName,
                        phoneNumber,
                        remarks);
                    console.log(createResult);
                    if (createResult.errCode !== 0) {
                        message.error('订单保存失败');
                        return;
                    }

                    let birthdayCakeOrderUrl = getWWWHost() + `/birthdayCakeOrder?_id=${createResult._id}`;
                    let opts = {
                        errorCorrectionLevel: 'L',
                        type: 'image/png',
                        quality: 0.5,
                        margin: 1,
                        color: {
                            dark: "#E5E4E2",
                            light: "#00A2A5"
                        }
                    }
                    let qrCode = await QRCode.toDataURL(birthdayCakeOrderUrl, opts);

                    this.setState({ image4QRCode: qrCode },
                        async () => {
                            let canvas = await html2Canvas(this._theDiv4Capture);
                            let imageSrc = canvas.toDataURL('image/png');

                            this.setState({
                                orderImageSrc: imageSrc,
                                imageCapturing: false
                            }, () => {
                                this.setState({ orderImageModalVisiable: true }, async () => {
                                    document.documentElement.style.overflow = 'hidden';

                                    /// 模板通知指定人员有人生成订购单了，避免漏单
                                    let title = '有顾客生成蛋糕订购单了';
                                    let style = '《' + cakeOrderInfo.product.name + '》';
                                    let time = pickUpDay.format('YYYY-MM-DD ddd') + pickUpTime.format(' a HH:mm');
                                    let sendResult = await templateSendToSomePeople(createResult._id, title, responseShop, style, time, pickUpName, phoneNumber);
                                    console.log(sendResult);
                                    // message.info(JSON.stringify(sendResult));
                                });
                            });
                        });
                })
            }, 0);
        });

        document.documentElement.style.overflow = 'visible';
    }

    handleOrderCakeInfoModalCancel = () => {
        this.setState({ cakeOrderInfoModalVisiable: false });
        document.documentElement.style.overflow = 'visible';
    }

    handleCreamChange = e => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.creamId = e.target.value;
        cakeOrderInfo.making.sizeId = '';
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleSizeChange = (value) => {
        const { cakeOrderInfo, cakeSizes } = this.state;
        cakeOrderInfo.making.sizeId = value;

        cakeOrderInfo.making.price = '--';
        for (let i = 0; i < cakeOrderInfo.product.specifications.length; ++i) {
            let specification = cakeOrderInfo.product.specifications[i];
            if (specification.creamId === cakeOrderInfo.making.creamId &&
                specification.sizeId === cakeOrderInfo.making.sizeId) {
                cakeOrderInfo.making.price = specification.price;
                break;
            }
        }
        cakeOrderInfo.making.plates = '--';
        for (let i = 0; i < cakeSizes.length; ++i) {
            let size = cakeSizes[i];
            if (size.id === cakeOrderInfo.making.sizeId) {
                cakeOrderInfo.making.plates = size.plates;
                break;
            }
        }

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
            if (cakeOrderInfo.making.creamId === '' ||
                cakeOrderInfo.making.creamId === undefined) {
                message.warning('请先选择奶油~');
            }
        }
    }

    handleCakeFillingChange = (value, fillingNumber) => {
        if (value.length > fillingNumber) {
            message.warning(`只能选择 ${fillingNumber} 两种夹心，请反选不需要的夹心后，重新选择！`);
            return;
        }

        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.fillingIds = value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleCandleChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.candleId = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleKindlingChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.kindlingId = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleHatChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.hatId = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handleCandleExtraChange = (e) => {
        const { cakeOrderInfo } = this.state;
        cakeOrderInfo.making.candleExtra = e.target.value;
        this.setState({ cakeOrderInfo: cakeOrderInfo });
    }

    handlePickUpDayChange = (data) => {
        // console.log('handlePickUpDayChange');
        // console.log(data);
        this.setState({ pickUpDay: data });
    }

    handlePickUpDayOnFocus = (e) => {
        // console.log('handlePickUpDayOnFocus');
        // console.log(e.target);
        this.setState({ pickUpDayPopupOpen: true });
    }

    handlePickUpDayOnBlur = (e) => {
        // console.log('handlePickUpDayOnBlur');
        // console.log(e.target);
        this.setState({ pickUpDayPopupOpen: false });
    }

    handlePickUpTimeChange = data => {
        this.setState({ pickUpTime: data });
    }

    handlePickUpTimeOnFocus = (e) => {
        // console.log('handlePickUpTimeOnFocus');
        // console.log(e.target);
        this.setState({ pickUpTimePopupOpen: true });
    }

    handlePickUpTimeOnBlur = (e) => {
        // console.log('handlePickUpTimeOnBlur');
        // console.log(e.target);
        this.setState({ pickUpTimePopupOpen: false });
    }

    handlePickUpTimeOnOk = (e) => {
        // console.log('handlePickUpTimeOnOk');
        // console.log(e.target);
        this.setState({ pickUpTimePopupOpen: false }, () => {
            setTimeout(() => {
                this._datePicker4PickUpTime && this._datePicker4PickUpTime.blur();
            }, 300);
        });
    }

    onPickUpTypeChange = e => {
        this.setState({ pickUpType: e.target.value });
    }

    handleResponseShopChange = (value) => {
        this.setState({ responseShop: value });
    }

    handleDeliverAddressChange = (e) => {
        this.setState({ deliverAddress: e.target.value });
    }

    handlePickUpPeopleChange = (e) => {
        this.setState({ pickUpName: e.target.value });
    }

    handlePhoneNumberChange = (e) => {
        this.setState({ phoneNumber: e.target.value });
    }

    handleRemarksChange = (e) => {
        this.setState({ remarks: e.target.value });
    }

    handleSearchInputOnChange = (e) => {
        this.setState({ searchName: e.target.value });
        if (!e.target.value || e.target.value === '') return;

        const { cakeProducts } = this.state;

        let products4Search = [];
        for (let i = 0; i < cakeProducts.length; ++i) {
            let product = cakeProducts[i];
            if (product.name.indexOf(e.target.value) !== -1 ||
                product.description.indexOf(e.target.value) !== -1) {
                products4Search.push(product);
            }
        }

        this.setState({ cake4Search: products4Search });
    }

    render() {
        const {
            searchName,
            cake4Search,
            cakeRecommend,
            cakeCategorys,
            cakeOrderInfo,
            cakeCreams,
            cakeSizes,
            cakeFillings,
            cakeCandles,
            cakeKindlings,
            cakeHats,

            pickUpType,
            cakeOrderInfoModalVisiable,
            orderCakePrices,
            cakeImage,
            creamType,
            cakeSize,
            cakeSizeExtra,
            cakePrice,
            canSelectCakeFilling,

            candleType,
            ignitorType,
            hatType,
            number4candle,
            cakePlateNumber,
            pickUpDay,
            pickUpDayPopupOpen,
            pickUpTime,
            pickUpTimePopupOpen,
            responseShop,
            deliverAddress,
            pickUpName,
            phoneNumber,
            remarks,
            makingTime,
            orderImageModalVisiable,
            orderImageSrc,
            imageCapturing,
            imageCropperModalVisiable,
            imageBeforeCrop,
            localImgDataLoading,
            divImageLoading,
            image4QRCode
        } = this.state;

        let theDiv4CaptureWidth = 750;

        let theDiv4CaptureHeight = theDiv4CaptureWidth * 148 / 210;
        let theDiv4CaptureStyle = {
            width: theDiv4CaptureWidth,
            height: theDiv4CaptureHeight,
            background: 'white'
        };
        let theLeftDivInTheDiv4CaptureStyle = {
            width: theDiv4CaptureHeight - 180,
            height: theDiv4CaptureHeight - 180 + 40,
            float: 'left', marginLeft: 8,
            borderRadius: 8, border: '2px dotted #00A2A5'
        };
        let theRightDivInTheDiv4CaptureStyle = {
            float: 'right',
            width: theDiv4CaptureWidth - theDiv4CaptureHeight + 160
        };

        let cakeSizeOptions = [];
        {
            const KCakeAllSizeOptions = {
                '5寸': { label: '5寸', value: '5寸' },
                '6寸': { label: '6寸', value: '6寸' },
                '8寸': { label: '8寸', value: '8寸' },
                '10寸': { label: '10寸', value: '10寸' },
                '12寸': { label: '12寸', value: '12寸' },
                '14寸': { label: '14寸', value: '14寸' },
                '组合': { label: '组合', value: '组合' }
            };

            if (orderCakePrices) {
                let price4CreamType = orderCakePrices[creamType];
                if (price4CreamType) {
                    let sizes = Object.keys(price4CreamType);
                    for (let i = 0; i < sizes.length; ++i) {
                        let size = sizes[i];
                        let cakeSizeOption = KCakeAllSizeOptions[size];
                        cakeSizeOptions.push(cakeSizeOption);
                    }
                    if (sizes.length >= 2) {
                        cakeSizeOptions.push(KCakeAllSizeOptions['组合']);
                    }
                }
            }
        }

        let creamOptions = [];
        if (cakeCreams) {
            for (let i = 0; i < cakeCreams.length; ++i) {
                let birthdayCakeCream = cakeCreams[i];
                if (cakeOrderInfo.product) {
                    for (let j = 0; j < cakeOrderInfo.product.specifications.length; ++j) {
                        let specification = cakeOrderInfo.product.specifications[j];
                        if (specification.creamId === birthdayCakeCream.id) {
                            creamOptions.push({ label: birthdayCakeCream.name, value: birthdayCakeCream.id });
                            break;
                        }
                    }
                }
            }
        }
        // console.log('creamOptions = ' + JSON.stringify(creamOptions));

        let sizeOptions = [];
        if (cakeSizes) {
            for (let i = 0; i < cakeSizes.length; ++i) {
                let birthdayCakeSize = cakeSizes[i];
                if (cakeOrderInfo.product) {
                    for (let j = 0; j < cakeOrderInfo.product.specifications.length; ++j) {
                        let specification = cakeOrderInfo.product.specifications[j];
                        if (specification.creamId === cakeOrderInfo.making.creamId &&
                            specification.sizeId === birthdayCakeSize.id) {
                            sizeOptions.push({ label: birthdayCakeSize.name, value: birthdayCakeSize.id });
                            break;
                        }
                    }
                }
            }
        }
        if (sizeOptions.length > 1) {
            sizeOptions.push({ label: '组合', value: -500 });
        }
        // console.log('sizeOptions = ' + JSON.stringify(sizeOptions));

        let fillingOptions = [];
        for (let i = 0; i < cakeFillings.length; ++i) {
            let filling = cakeFillings[i];
            fillingOptions.push({
                label:
                    <div style={{ marginBottom: 6 }}>
                        <Image style={{ width: 54, height: 54, borderRadius: 27, border: '1px dotted #00A2A5' }} preview={false} src={filling.image} />
                        <div style={{ width: 54, textAlign: 'center' }}>{filling.name}</div>
                    </div>,
                value: filling.id
            });
        }
        // console.log('fillingOptions = ' + JSON.stringify(fillingOptions));

        let candleOptions = [];
        for (let i = 0; i < cakeCandles.length; ++i) {
            let candle = cakeCandles[i];
            candleOptions.push({
                label:
                    <div style={{ marginBottom: 6 }}>
                        <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src={candle.image} />
                        <div style={{ width: 70, textAlign: 'center' }}>
                            {candle.name}
                            {
                                candle.id === 3 ?
                                    <Input style={{ width: 70, height: 30 }}
                                        placeholder='数字'
                                        prefix={<EditOutlined />}
                                        value={cakeOrderInfo.making.candleExtra}
                                        onChange={this.handleCandleExtraChange} />
                                    : <div></div>
                            }
                        </div>
                    </div>,
                value: candle.id
            });
        }
        // console.log('candleOptions = ' + JSON.stringify(candleOptions));

        let kindlingOptions = [];
        for (let i = 0; i < cakeKindlings.length; ++i) {
            let kindling = cakeKindlings[i];
            kindlingOptions.push({
                label:
                    <div style={{ marginBottom: 6 }}>
                        <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src={kindling.image} />
                        <div style={{ width: 70, textAlign: 'center' }}>{kindling.name}</div>
                    </div>,
                value: kindling.id
            })
        }
        // console.log('kindlingOptions = ' + JSON.stringify(kindlingOptions));

        let hatOptions = [];
        for (let i = 0; i < cakeHats.length; ++i) {
            let hat = cakeHats[i];
            hatOptions.push({
                label:
                    <div style={{ marginBottom: 6 }}>
                        <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src={hat.image} />
                        <div style={{ width: 70, textAlign: 'center' }}>{hat.name}</div>
                    </div>,
                value: hat.id
            })
        }


        let orderImageWidth = window.innerWidth;
        if (orderImageWidth > 640) orderImageWidth = 640;
        let orderImageHeight = orderImageWidth * 148 / 210;
        let titleAndFooterHeight = 190;
        let KOrderImageDivStyle = {
            width: orderImageWidth,
            height: orderImageHeight + titleAndFooterHeight,
            marginTop: (window.innerHeight - (orderImageHeight + titleAndFooterHeight)) / 2,
            marginLeft: (window.innerWidth - orderImageWidth) / 2
        };

        let KOrderImageStyle = {
            width: orderImageWidth,
            height: orderImageHeight,
            border: '2px dashed #00A2A5'
        };

        let KOrderImageInStyle = {
            width: orderImageWidth - 4,
            height: orderImageHeight - 4
        };

        const KCandleTypeOptions = [
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/蜡烛/爱心蜡烛.jpg" />
                    <div style={{ width: 70, textAlign: 'center' }}>爱心蜡烛</div>
                    <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一根</div>
                </div>), value: '爱心蜡烛'
            },
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/蜡烛/五星蜡烛.jpg" />
                    <div style={{ width: 70, textAlign: 'center' }}>五星蜡烛</div>
                    <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一根</div>
                </div>), value: '五星蜡烛'
            },
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/蜡烛/数字蜡烛.jpg" />

                    <div style={{ width: 70, textAlign: 'center' }}>
                        数字蜡烛
                        <Input style={{ width: 70, height: 30 }}
                            placeholder='数字'
                            prefix={<EditOutlined />}
                            value={number4candle}
                            onChange={this.handleCandleExtraChange}></Input>
                    </div>
                </div>), value: '数字蜡烛'
            },
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/蜡烛/曲线蜡烛.jpg" />
                    <div style={{ width: 70, textAlign: 'center' }}>曲线蜡烛</div>
                    <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一根</div>
                </div>), value: '曲线蜡烛'
            },
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70, borderRadius: 10, border: '1px dotted #00A2A5' }} preview={false} src="/image/生日蛋糕/蜡烛/荷花●音乐蜡烛.jpg" />
                    <div style={{ width: 70, textAlign: 'center' }}>荷花●音乐蜡烛</div>
                    <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一套</div>
                </div>), value: '荷花●音乐蜡烛'
            }
        ];

        let columnNumber = 2;
        const interWidth = window.innerWidth;
        // console.log('interWidth = ' + interWidth);
        if (interWidth > 900) {
            columnNumber = 4;
        } else if (interWidth > 600) {
            columnNumber = 3;
        }

        let renderItemFunc4Product = (product) => {
            let rank = cakeRecommend.products.indexOf(product) + 1;
            let theMinimumSize = {};
            let theMinimumPrice = 0;
            if (product.specifications.length > 0) {
                let firstSpec = product.specifications[0];
                theMinimumPrice = firstSpec.price;
                for (let i = 0; i < cakeSizes.length; ++i) {
                    let size = cakeSizes[i];
                    if (size.id === firstSpec.sizeId) {
                        theMinimumSize = size;
                        break;
                    }
                }
            }
            return (
                <List.Item>
                    <div key={product.name}>
                        {
                            (rank === 1 || rank === 2 || rank === 3) ? (
                                <div style={{
                                    borderRadius: 20,
                                    position: 'absolute', zIndex: 10
                                }}>
                                    <Image style={{
                                        width: 40, height: 40,
                                    }} preview={false} src={`/image/生日蛋糕/排行/排名${rank}.png`} />
                                </div>
                            ) : (<div></div>)
                        }

                        <Image style={{ border: '1px dotted #00A2A5', borderRadius: 8 }}
                            fallback='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=='
                            preview={true} src={`${KBrithdayCakeRootWith3}/${product.name}-方图.jpg`} />
                        <div>
                            <div style={{ marginTop: 4 }}>
                                <Image style={{ width: 30, height: 30 }} preview={false} src={`/image/弯麦logo方-黑白.png`} />
                                <span style={{ fontSize: 16, fontWeight: 'bold' }}>{`《${product.name}》`}</span>
                                <span style={{
                                    fontSize: 14, marginTop: 4,
                                    float: 'right', paddingTop: 4, paddingBottom: 4,
                                    paddingLeft: 8, paddingRight: 8, borderRadius: 10,
                                    textAlign: 'center', backgroundColor: '#00A2A5', color: 'white',
                                }} onClick={() => {
                                    this.handleOrderNowClick(product);
                                }}>
                                    {`预定`}
                                </span>
                            </div>
                            <div style={{ fontSize: 14 }}>
                                <span>{product.description}</span>
                            </div>
                            <div style={{ fontSize: 13 }}>
                                <InfoCircleOutlined style={{ color: '#00A2A5' }} />
                                <span>{` ${theMinimumSize.number}${theMinimumSize.unit} `}</span>
                                <span>起</span>

                                <PayCircleOutlined style={{ color: '#00A2A5', marginLeft: 8 }} />
                                <span>{` ${theMinimumPrice}元 `}</span>
                                <span>起</span>
                            </div>
                        </div>
                    </div>
                </List.Item>
            )
        }

        return (
            <Spin spinning={imageCapturing} size='large' tip='正在生成订购单...' >
                <div>
                    {
                        imageCropperModalVisiable ? (
                            <div style={{
                                opacity: 1, background: 'black', position: 'fixed',
                                zIndex: '105', width: 'calc(100%)', height: 'calc(100%)',
                                overflowY: 'hidden', overflowX: 'hidden', textAlign: 'center'
                            }}>
                                <Spin spinning={localImgDataLoading} size='large' style={{ marginTop: 100 }} tip='正在获取图片' />

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

                                <div style={{
                                    width: 'calc(100%)', height: 64, backgroundColor: 'black', opacity: 0.8,
                                    position: 'fixed', top: 0, textAlign: 'center', zIndex: '100'
                                }}>
                                </div>

                                {
                                    !localImgDataLoading ? (
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
                                    ) : (<div></div>)
                                }

                                <div style={{
                                    width: 'calc(100%)', height: 64, backgroundColor: 'black', opacity: 0.8,
                                    position: 'fixed', bottom: 0, textAlign: 'center', zIndex: '100'
                                }}>
                                </div>

                                {
                                    !localImgDataLoading ? (
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
                                                    this.setState({ imageCropperModalVisiable: false, divImageLoading: true }, () => {
                                                        setTimeout(() => {
                                                            this.setState({ cakeImage: dataUrlAfterCroped, divImageLoading: false })
                                                        }, 500);
                                                    });
                                                }}>确定裁剪</Button>
                                            </Space>
                                        </div>
                                    ) : (<div></div>)
                                }
                            </div>
                        ) : (<div></div>)
                    }

                    {
                        cakeOrderInfoModalVisiable ? (
                            <div style={{
                                opacity: 0.99, background: 'white', position: 'fixed',
                                zIndex: '100', width: 'calc(100%)', height: 'calc(100%)',
                                overflowY: 'auto', overflowX: 'hidden'
                            }}>
                                <div style={{ textAlign: 'center', fontSize: 14, marginTop: 8, fontWeight: 'bold' }}>
                                    {`《${cakeOrderInfo.product.name}》`}
                                </div>
                                <div style={{ textAlign: 'center', fontSize: 14, paddingLeft: 8, paddingRight: 8 }}>
                                    {cakeOrderInfo.product.description}
                                </div>
                                <div style={{ textAlign: 'center', width: '100%' }}>
                                    <Image style={{ width: 120, height: 120, border: '1px dotted #00A2A5', borderRadius: 8 }}
                                        src={cakeOrderInfo.product.images[0]} />
                                    <Image style={{
                                        position: 'absolute', width: 54, height: 54, marginLeft: 4, borderRadius: 4
                                    }} src={`/image/生日蛋糕/尺寸/蛋糕尺寸展示板.jpg`} />
                                </div>
                                <QueueAnim type={['bottom', 'top']}>
                                    <div key='a' style={{ textAlign: 'center', width: '100%', marginBottom: 18 }}>
                                        <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>规格</Divider>
                                        {
                                            cakeCreams.map(cream => {
                                                let creamExist = false;
                                                for (let i = 0; i < cakeOrderInfo.product.specifications.length; ++i) {
                                                    let specification = cakeOrderInfo.product.specifications[i];
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
                                                                    cakeSizes.map(size => {
                                                                        let price = -1;
                                                                        for (let i = 0; i < cakeOrderInfo.product.specifications.length; ++i) {
                                                                            let specification = cakeOrderInfo.product.specifications[i];
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
                                                                                            <span style={{ color: '#00A2A5' }}>{size.name}</span>
                                                                                            <span style={{ color: 'gray', fontSize: 12 }}>{`（${size.description}）`}</span>
                                                                                            <span style={{ color: '#00A2A5' }}>{`${price}元`}</span>
                                                                                            <span></span>
                                                                                        </div> : <div></div>
                                                                                }
                                                                            </div>
                                                                        )
                                                                    })
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
                                                    options={creamOptions}
                                                    onChange={this.handleCreamChange}
                                                    value={cakeOrderInfo.making.creamId}
                                                    optionType='default'
                                                />
                                                {
                                                    cakeOrderInfo.making.creamId === undefined ? (
                                                        <div style={{ color: 'red' }}>“奶油”是必填项</div>
                                                    ) : (<div></div>)
                                                }
                                            </Input.Group>
                                        </div>
                                        <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                            <div>
                                                <span style={{ fontWeight: 'bold' }}>尺寸：</span>
                                                <Select value={cakeOrderInfo.making.sizeId}
                                                    style={{ width: 80, marginRight: 8 }}
                                                    onChange={this.handleSizeChange}
                                                    onDropdownVisibleChange={this.handleSizeSelectDropdownVisibleChange}
                                                    options={sizeOptions}>
                                                </Select>
                                                {
                                                    cakeOrderInfo.making.sizeId === -500 ? (
                                                        <span>
                                                            <Input placeholder='叠加或悬浮|几寸+几寸'
                                                                prefix={<EditOutlined />}
                                                                style={{ width: 190 }}
                                                                value={cakeOrderInfo.making.sizeExtra}
                                                                onChange={this.handleSizeExtraChange}></Input>
                                                        </span>) : (<div></div>)
                                                }
                                                {
                                                    cakeOrderInfo.making.sizeId === '' ||
                                                        (cakeOrderInfo.making.sizeId === -500 &&
                                                            (cakeOrderInfo.making.sizeExtra === undefined ||
                                                                cakeOrderInfo.making.sizeExtra === '')) ? (
                                                        <div style={{ color: 'red' }}>“尺寸”是必填项</div>
                                                    ) : (<span></span>)
                                                }
                                            </div>
                                        </div>
                                        <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                            <span style={{ fontWeight: 'bold' }}>价格：</span>
                                            <span>{cakeOrderInfo.making.price}</span>
                                            <span> 元</span>
                                        </div>
                                        <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {`夹心（任选${cakeOrderInfo.product.fillingNumber}种）`}
                                            </div>
                                            <CheckboxGroup
                                                disabled={cakeOrderInfo.product.fillingNumber > 0 ? false : true}
                                                style={{ marginTop: 8 }}
                                                options={fillingOptions}
                                                value={cakeOrderInfo.making.fillingIds}
                                                onChange={(value) => this.handleCakeFillingChange(value, cakeOrderInfo.product.fillingNumber)} />
                                            {
                                                cakeOrderInfo.making.fillingIds?.length === 0 && cakeOrderInfo.product.fillingNumber > 0 ? (
                                                    <div style={{ color: 'red' }}>“夹心”是必填项</div>
                                                ) : (<span></span>)
                                            }
                                        </div>
                                        <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                            <div style={{ fontWeight: 'bold' }}>蜡烛（任选一种，默认为爱心蜡烛一根，若蛋糕自带蜡烛则不送蜡烛）：</div>

                                            <Radio.Group style={{ marginTop: 8 }}
                                                options={candleOptions}
                                                value={cakeOrderInfo.making.candleId}
                                                onChange={this.handleCandleChange}>
                                            </Radio.Group>
                                            {
                                                cakeOrderInfo.making.candleId === undefined ||
                                                    (cakeOrderInfo.making.candleId === 3 &&
                                                        (cakeOrderInfo.making.candleExtra === undefined ||
                                                            cakeOrderInfo.making.candleExtra === '')) ? (
                                                    <div style={{ color: 'red', marginLeft: 0 }}>“蜡烛”是必填项</div>
                                                ) : (<span></span>)
                                            }
                                        </div>
                                        <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                            <div style={{ fontWeight: 'bold' }}>火柴（如需要请选择，默认没有火柴）：</div>

                                            <Radio.Group style={{ marginTop: 8 }}
                                                options={kindlingOptions}
                                                value={cakeOrderInfo.making.kindlingId}
                                                onChange={this.handleKindlingChange}>
                                            </Radio.Group>
                                        </div>

                                        <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                            <div style={{ fontWeight: 'bold' }}>帽子（任选一种，默认为金卡皇冠帽）：</div>

                                            <Radio.Group style={{ marginTop: 8 }}
                                                options={hatOptions}
                                                value={cakeOrderInfo.making.hatId}
                                                onChange={this.handleHatChange}>
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
                                                    value={pickUpDay}
                                                    open={pickUpDayPopupOpen}
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
                                                                        this._datePicker4PickUpDay && this._datePicker4PickUpDay.blur();
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
                                                            this.setState({ pickUpDay: moment(), pickUpDayPopupOpen: false }, () => {
                                                                setTimeout(() => {
                                                                    this._datePicker4PickUpDay && this._datePicker4PickUpDay.blur();
                                                                }, 300);
                                                            });
                                                        }}>今天</Button>
                                                        <span>   </span>
                                                        <Button type='primary' size='small' onClick={() => {
                                                            this.setState({ pickUpDay: moment().add(1, 'day'), pickUpDayPopupOpen: false }, () => {
                                                                setTimeout(() => {
                                                                    this._datePicker4PickUpDay && this._datePicker4PickUpDay.blur();
                                                                }, 300);
                                                            });
                                                        }}>明天</Button>
                                                        <span>   </span>
                                                        <Button type='primary' size='small' onClick={() => {
                                                            this.setState({ pickUpDay: moment().add(2, 'day'), pickUpDayPopupOpen: false }, () => {
                                                                setTimeout(() => {
                                                                    this._datePicker4PickUpDay && this._datePicker4PickUpDay.blur();
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
                                                    value={pickUpTime}
                                                    open={pickUpTimePopupOpen}
                                                    onFocus={this.handlePickUpTimeOnFocus}
                                                    onBlur={this.handlePickUpTimeOnBlur}
                                                    onOk={this.handlePickUpTimeOnOk}
                                                    inputReadOnly={true}
                                                    onChange={this.handlePickUpTimeChange}
                                                    renderExtraFooter={() => (
                                                        <span>
                                                            <Button type='primary' size='small' onClick={() => {
                                                                this.setState({ pickUpTime: moment('12:30', 'HH:mm'), pickUpTimePopupOpen: false }, () => {
                                                                    setTimeout(() => {
                                                                        this._datePicker4PickUpTime && this._datePicker4PickUpTime.blur();
                                                                    }, 300);
                                                                });
                                                            }}>中午 12点30分</Button>
                                                            <span>   </span>
                                                            <Button type='primary' size='small' onClick={() => {
                                                                this.setState({ pickUpTime: moment('18:30', 'HH:mm'), pickUpTimePopupOpen: false }, () => {
                                                                    setTimeout(() => {
                                                                        this._datePicker4PickUpTime && this._datePicker4PickUpTime.blur();
                                                                    }, 300);
                                                                });
                                                            }}>晚上 18点30分</Button>
                                                        </span>
                                                    )} />
                                            </div>
                                            {
                                                (pickUpDay === '' || pickUpDay === null) || (pickUpTime === '' || pickUpTime === null) ? (
                                                    <div style={{ color: 'red' }}>“时间”是必填项</div>
                                                ) : (<div></div>)
                                            }
                                        </div>
                                        <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                            <span style={{ fontWeight: 'bold' }}>方式：</span>
                                            <Radio.Group
                                                size='large'
                                                options={KPickUpTypeOptions}
                                                onChange={this.onPickUpTypeChange}
                                                value={pickUpType}
                                                optionType='default'
                                            />
                                            {
                                                pickUpType === '' ? (
                                                    <div style={{ color: 'red' }}>“方式”是必填项</div>
                                                ) : (<div></div>)
                                            }
                                        </div>
                                        <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                            <span style={{ fontWeight: 'bold' }}>门店：</span>
                                            <Select value={responseShop} style={{ width: 160 }}
                                                onChange={this.handleResponseShopChange}
                                                options={KResponseShopOptions}>
                                            </Select>
                                            {
                                                responseShop === '' ? (
                                                    <div style={{ color: 'red' }}>“门店”是必填项</div>
                                                ) : (<div></div>)
                                            }
                                        </div>
                                        {
                                            pickUpType === KPickUpTypeOptions[1].value ? (
                                                <div style={{ marginTop: 8, marginBottom: 18, marginLeft: 12, marginRight: 12, textAlign: 'center' }}>
                                                    <Input.Group>
                                                        <span style={{ fontWeight: 'bold' }}>地址：</span>
                                                        <Input style={{ width: 'calc(100% - 100px)', textAlign: 'left' }}
                                                            placeholder='填写地址' prefix={<HomeOutlined />}
                                                            value={deliverAddress}
                                                            onChange={this.handleDeliverAddressChange} />
                                                        {
                                                            deliverAddress === '' ? (
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
                                                    value={pickUpName}
                                                    onChange={this.handlePickUpPeopleChange} />
                                                {
                                                    pickUpName === '' ? (
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
                                                    value={phoneNumber}
                                                    onChange={this.handlePhoneNumberChange} />
                                                {
                                                    phoneNumber === '' ? (
                                                        <div style={{ color: 'red' }}>“手机”是必填项</div>
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
                                                    placeholder='有特殊要求，请备注在这里' value={remarks}
                                                    onChange={this.handleRemarksChange} />
                                            </Input.Group>
                                        </div>
                                        <div style={{ height: 80 }}></div>
                                    </div>
                                </QueueAnim>

                                <div style={{
                                    width: 'calc(100%)', height: 64, backgroundColor: '#E5E4E2',
                                    position: 'fixed', bottom: 0, textAlign: 'center', zIndex: '100'
                                }}>
                                    <Space style={{ marginTop: 16, marginBottom: 16 }}>
                                        <Button type='default' onClick={this.handleOrderCakeInfoModalCancel}>取消</Button>
                                        <Button type='primary' onClick={this.handleOrderCakeInfoModalOk}>生成订购单</Button>
                                    </Space>
                                </div>
                            </div>
                        ) : (<div></div>)
                    }

                    {
                        orderImageModalVisiable ? (
                            <div style={{
                                background: 'rgba(0,0,0,0.9)', position: 'fixed',
                                zIndex: '100', width: 'calc(100%)', height: 'calc(100%)',
                                overflowY: 'hidden', overflowX: 'hidden'
                            }}>
                                <div style={KOrderImageDivStyle}>
                                    <div key='a' style={{ height: 110 }}>
                                        <Timeline style={{ paddingTop: 30, paddingLeft: 24, paddingRight: 24 }}>
                                            <Timeline.Item color='white' style={{ color: 'white' }}>{`长按虚线框内的订购单图片并转发给客服`}</Timeline.Item>
                                            <Timeline.Item color='white' style={{ color: 'white' }}>{`注意：不要识别二维码，也不要截屏`}</Timeline.Item>
                                        </Timeline>
                                    </div>

                                    <QueueAnim type={['bottom', 'top']}>
                                        <div key='a' style={KOrderImageStyle}>
                                            <Image style={KOrderImageInStyle} preview={false} src={orderImageSrc} />
                                        </div>
                                    </QueueAnim>

                                    <div style={{ height: 80, textAlign: 'center' }}>
                                        <Space style={{ marginTop: 24 }}>
                                            <Button key='back' type='primary' danger onClick={() => {
                                                this.setState({ orderImageModalVisiable: false });
                                                document.documentElement.style.overflow = 'visible';
                                            }}>X</Button>
                                            {/* <Button key='edit' type='dashed' onClick={() => {
                                                this.setState({
                                                    orderImageModalVisiable: false,
                                                    cakeOrderInfoModalVisiable: true
                                                });
                                                document.documentElement.style.overflow = 'hidden';
                                            }}>返回修改</Button> */}
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        ) : (<div></div>)
                    }

                    {/* 联系方式 */}
                    <div style={{
                        textAlign: 'center', color: '#00A2A5',
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
                            placeholder="请输入蛋糕名称"
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
                                        let customizedProduct = {};
                                        customizedProduct.name = '私人订制';
                                        customizedProduct.description = '通过下方+号上传蛋糕图片，订制自己喜欢的蛋糕';
                                        // customizedProduct.images
                                        this.handleOrderNowClick(customizedProduct);
                                    }}>
                                        <span>私人订制蛋糕</span>
                                        <span style={{ color: 'whitesmoke', fontSize: 14, marginLeft: 8 }}>点击后上传蛋糕照片</span>
                                    </div>
                                    {/* 推荐区域 */}
                                    <div style={{
                                        textAlign: 'center', marginTop: 10, fontSize: 16,
                                        backgroundColor: '#00A2A5', color: 'white',
                                        borderRadius: 30, paddingTop: 8, paddingBottom: 8
                                    }}>
                                        {`${cakeRecommend.name}`}
                                    </div>
                                    <List style={{ marginLeft: 4, marginRight: 4, marginTop: 4 }}
                                        grid={{ gutter: 4, column: columnNumber }}
                                        dataSource={cakeRecommend.products}
                                        renderItem={renderItemFunc4Product}
                                    />
                                    <div style={{
                                        textAlign: 'center', color: '#00A2A5',
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
                                        expandIconPosition='end'
                                        onChange={this.handleCollapseOnChange}>
                                        {
                                            cakeCategorys.map((category) => {
                                                return (<Panel
                                                    header={
                                                        (
                                                            <div style={{ color: 'white', fontSize: 20 }}>
                                                                <div style={{ marginLeft: 12 }}>
                                                                    <div>
                                                                        {`${category.name}`}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: 'whitesmoke' }}>
                                                                        {`${category.description}`}
                                                                    </div>
                                                                </div>
                                                                <div style={{ marginLeft: 4, marginTop: 8 }}>
                                                                    {
                                                                        category.images.map((image) => {
                                                                            let index = category.images.indexOf(image);
                                                                            let lastIndex = category.images.length - 1;
                                                                            return (
                                                                                <span key={index}>
                                                                                    <Image style={{ marginLeft: 6, width: 44, height: 44, borderRadius: 22 }}
                                                                                        preview={false} src={image} />
                                                                                    {index === lastIndex ? <span style={{ marginLeft: 6 }}>......</span> : <span></span>}
                                                                                </span>
                                                                            );
                                                                        })
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    style={{ backgroundColor: '#00A2A5', borderRadius: 40 }}
                                                    key={category.id}
                                                    extra={
                                                        <span style={{ fontSize: 16, color: 'whitesmoke' }}>
                                                            {category.opened ? '点击收起' : '点击查看更多'}
                                                        </span>
                                                    }>

                                                    <List style={{ marginLeft: -12, marginRight: -12, marginTop: -12 }}
                                                        grid={{ gutter: 4, column: columnNumber }}
                                                        dataSource={category.products}
                                                        renderItem={renderItemFunc4Product} />
                                                </Panel>)
                                            })
                                        }
                                    </Collapse>
                                </div>
                            ) :
                            (
                                <List style={{ marginLeft: 4, marginRight: 4, marginTop: 4 }}
                                    grid={{ gutter: 4, column: columnNumber }}
                                    dataSource={cake4Search}
                                    renderItem={renderItemFunc4Product} />
                            )
                    }

                    {
                        imageCapturing ? (
                            <div ref={(current) => { this._theDiv4Capture = current; }}
                                style={theDiv4CaptureStyle}>
                                <div id="qrcode" style={{
                                    textAlign: 'right', position: 'absolute',
                                    paddingRight: 20, paddingTop: 10,
                                    width: theDiv4CaptureWidth, height: 150
                                }}>
                                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>电子订购单二维码：</div>
                                    <Image style={{ width: 150, height: 150 }}
                                        preview={false}
                                        src={image4QRCode}
                                    />
                                </div>

                                <div style={{
                                    textAlign: 'left', position: 'absolute', paddingLeft: 20,
                                    width: theDiv4CaptureWidth, fontSize: 14, paddingTop: 10,
                                }}>{`订购时间：${makingTime}`}</div>

                                <div style={{
                                    fontSize: 22,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    paddingTop: 6,
                                    paddingBottom: 6
                                }}> 蛋糕订购单</div>
                                <div>
                                    <div style={theLeftDivInTheDiv4CaptureStyle}>
                                        <div style={{
                                            fontSize: 20,
                                            textAlign: 'center',
                                            paddingTop: 4,
                                            paddingBottom: 4,
                                            fontWeight: 'bold',
                                            background: '#D8D8D8',
                                            borderBottom: '1px dashed black'
                                        }}>
                                            <span>{`《${cakeOrderInfo.product.name}》`}</span>
                                        </div>
                                        <div>
                                            <div style={{ position: 'relative' }}>
                                                <Image preview={false} src={cakeImage} />
                                                <Image style={{ width: 60, height: 60, position: 'absolute', top: -212, right: 2 }} preview={false} src={`/image/弯麦logo方-黑白.png`} />
                                            </div>
                                            <Image style={{ marginTop: 16 }} preview={false} src="/image/弯麦logo长.png" />
                                        </div>
                                    </div>
                                    <div style={theRightDivInTheDiv4CaptureStyle}>
                                        <Divider orientation='left' dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>制作</Divider>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>奶油：</span>
                                            <span style={{ fontSize: 14 }}>{creamType}</span>
                                        </div>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>尺寸：</span>
                                            <span style={{ fontSize: 14 }}>{cakeSize}</span>
                                            {
                                                cakeSize === '组合' ? (
                                                    <span style={{ fontSize: 14 }}>
                                                        {cakeSizeExtra}
                                                    </span>) : (<span></span>)
                                            }
                                        </div>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>价格：</span>
                                            <span style={{ fontSize: 14 }}>{cakePrice}</span>
                                            <span style={{ fontSize: 14 }}>元</span>
                                        </div>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>夹心：</span>
                                            <span style={{ fontSize: 14 }}>{
                                                canSelectCakeFilling ?
                                                    cakeFillings.join('+') :
                                                    '无需夹心'
                                            }</span>
                                        </div>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>蜡烛：</span>
                                            <span style={{ fontSize: 14 }}>{candleType}</span>
                                            {
                                                candleType === KCandleTypeOptions[2].value ? (
                                                    <span style={{ fontSize: 14 }}>
                                                        {`${number4candle}`}
                                                    </span>) : (
                                                    <span>
                                                    </span>
                                                )
                                            }
                                            {
                                                ignitorType === '需要火柴' ? (
                                                    <span style={{ fontSize: 14 }}>
                                                        {`+火柴盒`}
                                                    </span>
                                                ) : (<span></span>)
                                            }
                                        </div>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>帽子：</span>
                                            <span style={{ fontSize: 14 }}>{hatType}</span>
                                        </div>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>餐具：</span>
                                            <span style={{ fontSize: 14 }}>{cakePlateNumber}</span>
                                            <span style={{ fontSize: 14 }}>套</span>
                                        </div>
                                        <Divider orientation='left' style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>取货</Divider>
                                        <div>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>时间：</span>
                                            <span style={{ fontSize: 18, color: 'red' }}>{pickUpDay ? pickUpDay.format('YYYY-MM-DD ddd') : ''}</span>
                                            <span style={{ fontSize: 18, color: 'red' }}>{pickUpTime ? pickUpTime.format(' a HH:mm') : ''}</span>
                                        </div>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>方式：</span>
                                            <span style={{ fontSize: 14 }}>{pickUpType}</span>
                                        </div>
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>门店：</span>
                                            <span style={{ fontSize: 14 }}>{responseShop}</span>
                                        </div>
                                        {
                                            pickUpType === KPickUpTypeOptions[1].value ? (
                                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>地址：</span>
                                                    <span style={{ fontSize: 14 }}>{deliverAddress}</span>
                                                </div>
                                            ) : (<div></div>)
                                        }

                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>姓名：</span>
                                            <span style={{ fontSize: 18, color: 'red' }}>
                                                {`${pickUpName}（${phoneNumber}）`}
                                            </span>
                                        </div>
                                        <Divider orientation='left' style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                                        <div style={{ marginTop: 4, marginBottom: 4, marginRight: 8 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>备注：</span>
                                            <span style={{ fontSize: 18, color: 'red', wordWrap: 'break-word' }}>
                                                {remarks}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>) : (<div></div>)
                    }

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
                </div >
                <BackTop />
            </Spin >
        )
    }
}

export default birthdayCakeMenu;
