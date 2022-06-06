/*
蛋糕图册链接
http://gratefulwheat.ruyue.xyz/birthdayCakeSale?debug=1
debug
1 调试版
0 正式版
*/

import React from 'react';
import moment from 'moment';
import html2Canvas from 'html2canvas';
import dpLocale from 'antd/es/date-picker/locale/zh_CN';

import {
    RightSquareFilled,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined,
    EditOutlined
} from '@ant-design/icons';
import {
    Collapse, Image, Spin,
    DatePicker, Radio,
    Select, Input, Checkbox, Divider,
    message, Timeline, Button, Space
} from 'antd';
import {
    loadProductsSale,
    loadBirthdayCakesLatest,
    loadBirthdayCakesAll,
    wechatSign
} from '../api/api';

const { Panel } = Collapse;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

const KBrithdayCakeRoot = '/image/生日蛋糕';

const KCategorys = [{
    categoryId: '1634302403310226908', categoryName: '常规款蛋糕', description: '平凡人生、快乐生活',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/陪伴-方图.jpg', productItems: []
}, {
    categoryId: '1634302334442115588', categoryName: '女孩款蛋糕', description: '小小公主、永远开心',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/白雪公主-方图.jpg', productItems: []
}, {
    categoryId: '1649820515687346997', categoryName: '男孩款蛋糕', description: '小男子汉、顶天立地',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/叮当王子-方图.jpg', productItems: []
}, {
    categoryId: '1634302367129657476', categoryName: '女神款蛋糕', description: '我的女神、爱你永远',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/萌宠派对-方图.jpg', productItems: []
}, {
    categoryId: '1634302388959605558', categoryName: '男神款蛋糕', description: '公里之内、属你最帅',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/暴富大G-方图.jpg', productItems: []
}, {
    categoryId: '1634302419875701981', categoryName: '情侣款蛋糕', description: '两颗红心、相知相伴',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/小熊LOVE-方图.jpg', productItems: []
}, {
    categoryId: '1634302432122635916', categoryName: '祝寿款蛋糕', description: '福寿绵绵、如海滔滔',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/福寿绵绵-方图.jpg', productItems: []
}, {
    categoryId: '1634302446119593980', categoryName: '庆典派对款蛋糕', description: '共同举杯、共敬未来',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/招财进宝-方图.jpg', productItems: []
},];

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

const KCakeFillingOptions = [
    '芒果', '布丁', '芋泥', '奥利奥',
    '波波珠', '火龙果', '巧克力燕麦'];

const KCandleTypeOptions = [
    { label: '螺纹蜡烛', value: '螺纹蜡烛' },
    { label: '数字蜡烛', value: '数字蜡烛' },
    { label: '爱心蜡烛', value: '爱心蜡烛' },
    { label: '五星蜡烛', value: '五星蜡烛' }
];

const KCakePlateNumberBySize = {
    '6寸': '10',
    '8寸': '15',
    '10寸': '20',
    '12寸': '25'
};

class birthdayCakeSale extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            birthdayCakeCategorys: KCategorys,
            birthdayCakesLatest: [],
            debug: 0,
            orderCakeInfoModalVisiable: false,

            /// 蛋糕信息
            orderCakeMeta: {},
            cakeName: '',
            creamType: '',
            cakeSize: '',
            cakePrice: '',
            cakeFillings: [KCakeFillingOptions[0], KCakeFillingOptions[1]],
            candleType: KCandleTypeOptions[0].value,
            number4candle: '',
            cakePlateNumber: '',

            /// 配送信息
            pickUpDay: '',
            pickUpDayPopupOpen: false,
            pickUpTime: '',
            pickUpType: '',
            responseShop: '',
            deliverAddress: '',
            pickUpName: '',
            phoneNumber: '',
            remarks: '',

            orderImageModalVisiable: false,
            orderImageSrc: undefined,
            imageCapturing: false
        };

        this._lastKeys = [];
        this._birthdayCakesAll = [];
    }

    componentDidMount = async () => {
        let query = this.props.query;
        let debug = query && query.get('debug');

        if (this._birthdayCakesAll.length <= 0) {
            this._birthdayCakesAll = await loadBirthdayCakesAll();
            if (this._birthdayCakesAll && this._birthdayCakesAll.length > 0) {
                let birthdayCakesLatestNew = [];
                let birthdayCakesLatest = await loadBirthdayCakesLatest();
                for (let ii = 0; ii < birthdayCakesLatest.length; ++ii) {
                    let latestItem = birthdayCakesLatest[ii];
                    for (let jj = 0; jj < this._birthdayCakesAll.length; ++jj) {
                        let allItem = this._birthdayCakesAll[jj];
                        if (latestItem === allItem.name) {
                            let itemNew = { ...allItem };
                            itemNew.key = birthdayCakesLatestNew.length + 1;
                            birthdayCakesLatestNew.push(itemNew);
                        }
                    }
                }
                this.setState({ birthdayCakesLatest: birthdayCakesLatestNew, debug: debug });
            }
        }

        this.updateWeixinConfig();
    }
    /// 蛋糕分类 展开|收起 
    handleCollapseOnChange = async (keys) => {
        if (!keys) return;
        // console.log('handleCollapseOnChange begin');

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

        const { birthdayCakeCategorys } = this.state;
        let birthdayCakeCategorysNew = [...birthdayCakeCategorys];

        // console.log(keysOpened);
        if (keysOpened.length === 1) {
            try {
                let categoryId = keysOpened[0];
                let birthdayCakeCategoryToAdd;
                for (let ii = 0; ii < birthdayCakeCategorysNew.length; ++ii) {
                    let birthdayCakeCategory = birthdayCakeCategorysNew[ii];
                    if (birthdayCakeCategory.categoryId === categoryId) {
                        birthdayCakeCategoryToAdd = birthdayCakeCategory;
                        break;
                    }
                }
                if (birthdayCakeCategoryToAdd) {
                    birthdayCakeCategoryToAdd.opened = true;
                    this.setState({ birthdayCakeCategorys: birthdayCakeCategorysNew });
                    if (birthdayCakeCategoryToAdd.productItems.length <= 0 &&
                        !birthdayCakeCategoryToAdd.spinning) {
                        birthdayCakeCategoryToAdd.spinning = true;

                        /// 提取半年之前的数据
                        let nowMoment = moment();
                        let endDateTimeStr = nowMoment.endOf('day').format('YYYY.MM.DD HH:mm:ss');
                        let beginDateTimeStr = nowMoment.subtract(180, 'days').startOf('day').format('YYYY.MM.DD HH:mm:ss');

                        // console.log(beginDateTimeStr);
                        // console.log(endDateTimeStr);

                        let loadResult = await loadProductsSale(categoryId, '', '', beginDateTimeStr, endDateTimeStr, 'barcode', 'true');
                        // console.log(loadResult);

                        if (loadResult.errCode === 0 && loadResult.list.length > 0) {
                            let list = loadResult.list;

                            let listAfterMerge = [];
                            for (let jj = 0; jj < list.length; ++jj) {
                                let one = list[jj];
                                let productName = one.productName;
                                let saleNumber = one.saleNumber;

                                let index4ListAfterMerge = -1;
                                for (let mm = 0; mm < listAfterMerge.length; ++mm) {
                                    let one1 = listAfterMerge[mm];
                                    if (one1.productName === productName) {
                                        index4ListAfterMerge = mm;
                                        break;
                                    }
                                }

                                if (index4ListAfterMerge === -1) {
                                    let oneNew = {};
                                    oneNew.productName = productName;
                                    oneNew.saleNumber = saleNumber;
                                    oneNew.key = listAfterMerge.length + 1;
                                    listAfterMerge.push(oneNew);
                                } else {
                                    let one = listAfterMerge[index4ListAfterMerge];
                                    one.saleNumber = one.saleNumber + saleNumber;
                                }
                            }

                            listAfterMerge = listAfterMerge.sort((a, b) => {
                                return b.saleNumber - a.saleNumber;
                            })

                            birthdayCakeCategoryToAdd.productItems = listAfterMerge;
                            birthdayCakeCategoryToAdd.spinning = false;
                        }

                        this.setState({ birthdayCakeCategorys: birthdayCakeCategorysNew });
                        // console.log(birthdayCakeCategorysNew);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        // console.log(keysClosed);
        if (keysClosed.length === 1) {
            let categoryId = keysClosed[0];
            let birthdayCakeCategoryClose;
            for (let ii = 0; ii < birthdayCakeCategorysNew.length; ++ii) {
                let birthdayCakeCategory = birthdayCakeCategorysNew[ii];
                if (birthdayCakeCategory.categoryId === categoryId) {
                    birthdayCakeCategoryClose = birthdayCakeCategory;
                    break;
                }
            }
            if (birthdayCakeCategoryClose) {
                birthdayCakeCategoryClose.opened = false;
                this.setState({ birthdayCakeCategorys: birthdayCakeCategorysNew });
            }
        }

        // console.log('handleCollapseOnChange end');
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

                let title = '弯麦蛋糕图册菜单，送给热爱仪式感的你，点击预定';
                let desc = '男孩款，女孩款，女神款，男神款，情侣款等各种款式~';
                let imgUrl = 'http://gratefulwheat.ruyue.xyz/image/生日蛋糕/image4wechat.jpg';

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

    handleOrderNowTitleClick = (item) => {
        this.setState({
            orderCakeInfoModalVisiable: true,
            orderCakeMeta: item,
            cakeName: item.name,
            creamType: '',
            cakeSize: '',
            cakePrice: '',
            cakeFillings: [KCakeFillingOptions[0], KCakeFillingOptions[1]],
            candleType: KCandleTypeOptions[0].value,
            number4candle: '',
            cakePlateNumber: '',

            /// 配送信息
            pickUpDay: '',
            pickUpTime: '',
            pickUpType: '',
            responseShop: '',
            deliverAddress: '',
            pickUpName: '',
            phoneNumber: '',
            remarks: '',
        });

        document.documentElement.style.overflow = 'hidden';
    }

    handleOrderCakeInfoModalOk = () => {
        const {
            creamType,
            cakeSize,
            cakePrice,
            cakeFillings,
            candleType,
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

        console.log('奶油：' + creamType);
        console.log('大小：' + cakeSize);
        console.log('价格：' + cakePrice);
        console.log('夹心：' + cakeFillings);
        console.log('蜡烛：' + candleType);
        console.log('蜡烛：' + number4candle);
        console.log('餐盘：' + cakePlateNumber);
        console.log('日期：' + pickUpDay);
        console.log('时间：' + pickUpTime);
        console.log('方式：' + pickUpType);
        console.log('门店：' + responseShop);
        console.log('地址：' + deliverAddress);
        console.log('姓名：' + pickUpName);
        console.log('手机：' + phoneNumber);
        console.log('备注：' + remarks);

        if (creamType === '' ||
            cakeSize === '' ||
            cakeFillings.length === 0 ||
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

        if (pickUpType) {
            if (responseShop === '') {
                message.warning('请填写必填项！')
                return;
            } else if (pickUpType === KPickUpTypeOptions[1].value &&
                deliverAddress === '') {
                message.warning('请填写必填项！')
                return;
            }
            if (candleType === KCandleTypeOptions[1].value &&
                number4candle === '') {
                message.warning('请填写必填项！')
                return;
            }
        }

        this.setState({
            orderCakeInfoModalVisiable: false
        }, () => {
            setTimeout(() => {
                this.setState({
                    imageCapturing: true
                }, async () => {
                    if (!this._theDiv4Capture) return;

                    let canvas = await html2Canvas(this._theDiv4Capture);
                    let imageSrc = canvas.toDataURL('image/png');

                    this.setState({
                        orderImageSrc: imageSrc,
                        imageCapturing: false
                    }, () => {
                        this.setState({
                            orderImageModalVisiable: true
                        });
                        document.documentElement.style.overflow = 'hidden';
                    });
                })
            }, 0);
        });

        document.documentElement.style.overflow = 'auto';
    }

    handleOrderCakeInfoModalCancel = () => {
        this.setState({ orderCakeInfoModalVisiable: false });
        document.documentElement.style.overflow = 'auto';
    }

    handleCreamTypeChange = e => {
        let creamType = e.target.value;

        const { orderCakeMeta, cakeSize } = this.state;

        let cakePrice = '';
        let price = orderCakeMeta.price;
        if (price) {
            let price4CreamType = price[creamType];
            if (price4CreamType) {
                cakePrice = price4CreamType[cakeSize];
            }
        }

        this.setState({ creamType: creamType, cakePrice: cakePrice });
    }

    handleCakeSizeChange = (value) => {
        const { orderCakeMeta, creamType } = this.state;

        let cakePrice = '';
        let price = orderCakeMeta.price;
        if (price) {
            let price4CreamType = price[creamType];
            if (price4CreamType) {
                cakePrice = price4CreamType[value];
            }
        }

        let cakePlateNumber = KCakePlateNumberBySize[value];
        this.setState({
            cakeSize: value,
            cakePrice: cakePrice,
            cakePlateNumber: cakePlateNumber
        });
    }

    handleDropdownVisibleChange = (open) => {
        if (open) {
            const { creamType } = this.state;
            if (creamType === '' ||
                creamType === undefined) {
                message.warning('请先选择奶油~');
            }
        }
    }

    handleCakeFillingChange = (value) => {
        if (value.length >= 3) {
            message.warning('只能选择两种夹心!');
            return;
        }

        this.setState({ cakeFillings: value });
    }

    handleCandleTypeChange = (value) => {
        this.setState({ candleType: value });
    }

    handleNumber4candleChange = (e) => {
        this.setState({ number4candle: e.target.value });
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

    render() {
        const {
            birthdayCakeCategorys,
            birthdayCakesLatest,
            debug,
            pickUpType,
            orderCakeInfoModalVisiable,
            orderCakeMeta,
            cakeName,
            creamType,
            cakeSize,
            cakePrice,
            cakeFillings,
            candleType,
            number4candle,
            cakePlateNumber,
            pickUpDay,
            pickUpDayPopupOpen,
            pickUpTime,
            responseShop,
            deliverAddress,
            pickUpName,
            phoneNumber,
            remarks,
            orderImageModalVisiable,
            orderImageSrc,
            imageCapturing
        } = this.state;

        let theDiv4CaptureWidth = 750;

        let theDiv4CaptureHeight = theDiv4CaptureWidth * 148 / 210;
        let theDiv4CaptureStyle = {
            width: theDiv4CaptureWidth,
            height: theDiv4CaptureHeight,
            background: '#F0F0F0'
        };
        let theLeftDivInTheDiv4CaptureStyle = {
            width: theDiv4CaptureHeight - 180,
            height: theDiv4CaptureHeight - 180 + 40,
            float: 'left', marginLeft: 8
        };
        let theRightDivInTheDiv4CaptureStyle = {
            float: 'right',
            width: theDiv4CaptureWidth - theDiv4CaptureHeight + 160
        };

        let cakeSizeOptions = [];
        {
            const KCakeAllSizeOptions = {
                '6寸': { label: '6寸', value: '6寸' },
                '8寸': { label: '8寸', value: '8寸' },
                '10寸': { label: '10寸', value: '10寸' },
                '12寸': { label: '12寸', value: '12寸' }
            };
            let price = orderCakeMeta.price;
            if (price) {
                let price4CreamType = price[creamType];
                if (price4CreamType) {
                    let sizes = Object.keys(price4CreamType);
                    for (let i = 0; i < sizes.length; ++i) {
                        let size = sizes[i];
                        let cakeSizeOption = KCakeAllSizeOptions[size];
                        cakeSizeOptions.push(cakeSizeOption);
                    }
                }
            }
        }

        let creamTypeOptions = [];
        {
            const KCreamTypeOptions = {
                "牛奶奶油": { label: '牛奶奶油', value: '牛奶奶油' },
                "动物奶油": { label: '动物奶油', value: '动物奶油' }
            };
            let price = orderCakeMeta.price;
            if (price) {
                let prices = Object.keys(price);
                for (let i = 0; i < prices.length; ++i) {
                    let price = prices[i];
                    let creamTypeOption = KCreamTypeOptions[price];
                    creamTypeOptions.push(creamTypeOption);
                }
            }
        }

        let orderImageWidth = window.innerWidth;
        let orderImageHeight = orderImageWidth * 148 / 210;
        let KOrderImageDivStyle = {
            background: 'white',
            width: orderImageWidth,
            height: orderImageHeight + 200,
            marginTop: 100
        };

        let KOrderImageStyle = {
            width: orderImageWidth,
            height: orderImageHeight
        };

        return (
            <Spin spinning={imageCapturing} size='large' tip='正在生成订购单...' >
                <div>
                    {
                        orderCakeInfoModalVisiable ? (
                            <div style={{
                                opacity: 0.96, background: 'white', position: 'fixed',
                                zIndex: '100', width: 'calc(100%)', height: 'calc(100%)',
                                overflowY: 'auto', overflowX: 'hidden'
                            }}>
                                <div style={{ textAlign: 'center', fontSize: 14, marginTop: 0 }}>
                                    {`《${cakeName}》`}
                                </div>
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <Image style={{ width: 100, height: 100 }} preview={false}
                                        src={`${KBrithdayCakeRoot}/蛋糕3.0/${cakeName}-方图.jpg`} />
                                </div>
                                <Divider dashed style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>制作</Divider>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <Input.Group>
                                        <span style={{ fontWeight: 'bold' }}>奶油：</span>
                                        <Radio.Group
                                            size='large'
                                            options={creamTypeOptions}
                                            onChange={this.handleCreamTypeChange}
                                            value={creamType}
                                            optionType='default'
                                        />
                                        {
                                            creamType === '' ? (
                                                <span style={{ color: 'red' }}>必填项</span>
                                            ) : (<span></span>)
                                        }
                                    </Input.Group>
                                </div>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <Input.Group>
                                        <span style={{ fontWeight: 'bold' }}>大小：</span>
                                        <Select value={cakeSize} style={{ width: 100 }}
                                            onChange={this.handleCakeSizeChange}
                                            onDropdownVisibleChange={this.handleDropdownVisibleChange}
                                            options={cakeSizeOptions}>
                                        </Select>
                                        {
                                            cakeSize === '' ? (
                                                <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                            ) : (<span></span>)
                                        }
                                    </Input.Group>
                                </div>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <span style={{ fontWeight: 'bold' }}>价格：</span>
                                    <span>{cakePrice}</span>
                                    <span> 元</span>
                                </div>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <span style={{ fontWeight: 'bold' }}>夹心（任选两种）：</span>
                                    <CheckboxGroup
                                        options={KCakeFillingOptions}
                                        value={cakeFillings}
                                        onChange={this.handleCakeFillingChange} />
                                    {
                                        cakeFillings.length === 0 ? (
                                            <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                        ) : (<span></span>)
                                    }
                                </div>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <span style={{ fontWeight: 'bold' }}>蜡烛：</span>
                                    <Select value={candleType}
                                        style={{ width: 100 }}
                                        options={KCandleTypeOptions}
                                        onChange={this.handleCandleTypeChange}>
                                    </Select>
                                    {
                                        candleType === KCandleTypeOptions[1].value ? (<Input style={{ marginLeft: 8, width: 70 }}
                                            placeholder='数字' prefix={<EditOutlined />}
                                            value={number4candle}
                                            onChange={this.handleNumber4candleChange} />) : (<span></span>)
                                    }
                                    {
                                        candleType === '' ||
                                            (candleType === KCandleTypeOptions[1].value &&
                                                number4candle === '') ? (
                                            <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                        ) : (<span></span>)
                                    }
                                </div>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <span style={{ fontWeight: 'bold' }}>餐具：</span>
                                    <span>{cakePlateNumber}</span>
                                    <span> 套</span>
                                </div>
                                <Divider dashed style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>配送</Divider>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <div style={{ fontWeight: 'bold' }}>时间：</div>
                                    <div>
                                        <DatePicker
                                            ref={(dp) => this._datePicker4PickUpDay = dp}
                                            style={{ width: 170 }}
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
                                                        this._datePicker4PickUpDay && this._datePicker4PickUpDay.blur();
                                                        this.setState({ pickUpDayPopupOpen: false });
                                                    }}>
                                                        {current.date()}
                                                    </div>
                                                );
                                            }}
                                            renderExtraFooter={() =>
                                            (<span>
                                                <Button type='primary' size='small' onClick={() => {
                                                    this._datePicker4PickUpDay && this._datePicker4PickUpDay.blur();
                                                    this.setState({ pickUpDay: moment(), pickUpDayPopupOpen: false });
                                                }}>今天</Button>
                                                <span>   </span>
                                                <Button type='primary' size='small' onClick={() => {
                                                    this._datePicker4PickUpDay && this._datePicker4PickUpDay.blur();
                                                    this.setState({ pickUpDay: moment().add(1, 'day'), pickUpDayPopupOpen: false });
                                                }}>明天</Button>
                                                <span>   </span>
                                                <Button type='primary' size='small' onClick={() => {
                                                    this._datePicker4PickUpDay && this._datePicker4PickUpDay.blur();
                                                    this.setState({ pickUpDay: moment().add(2, 'day'), pickUpDayPopupOpen: false });
                                                }}>后天</Button>
                                            </span>)
                                            } />
                                    </div>
                                    <div style={{ marginTop: 4 }}>
                                        <DatePicker
                                            picker='time'
                                            style={{ width: 120 }}
                                            placeholder='时间'
                                            locale={dpLocale}
                                            showTime={{
                                                use12Hours: false,
                                                showNow: true,
                                                format: 'aHH:mm'
                                            }}
                                            panelRender={(originPicker) => {
                                                return (
                                                    <div style={{ marginLeft: 20, marginRight: 20 }}>
                                                        {originPicker}
                                                    </div>)
                                            }}
                                            format='aHH:mm'
                                            value={pickUpTime}
                                            inputReadOnly={true}
                                            onChange={this.handlePickUpTimeChange}
                                            renderExtraFooter={() => (
                                                <span>
                                                    <Button type='primary' size='small' onClick={() => {
                                                        this.setState({ pickUpTime: moment('12:00', 'HH:mm') });
                                                    }}>中午12点</Button>
                                                    <span>   </span>
                                                    <Button type='primary' size='small' onClick={() => {
                                                        this.setState({ pickUpTime: moment('18:00', 'HH:mm') });
                                                    }}>晚上18点</Button>
                                                </span>
                                            )} />
                                    </div>
                                    {
                                        (pickUpDay === '' || pickUpDay === null) || (pickUpTime === '' || pickUpTime === null) ? (
                                            <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                        ) : (<span></span>)
                                    }
                                </div>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
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
                                            <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                        ) : (<span></span>)
                                    }
                                </div>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <span style={{ fontWeight: 'bold' }}>门店：</span>
                                    <Select value={responseShop} style={{ width: 120 }}
                                        onChange={this.handleResponseShopChange}
                                        options={KResponseShopOptions}>
                                    </Select>
                                    {
                                        responseShop === '' ? (
                                            <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                        ) : (<span></span>)
                                    }
                                </div>
                                {
                                    pickUpType === KPickUpTypeOptions[1].value ? (
                                        <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                            <Input.Group>
                                                <span style={{ fontWeight: 'bold' }}>地址：</span>
                                                <Input style={{ width: 'calc(100% - 100px)' }}
                                                    placeholder='填写地址' prefix={<HomeOutlined />}
                                                    value={deliverAddress}
                                                    onChange={this.handleDeliverAddressChange} />
                                                {
                                                    deliverAddress === '' ? (
                                                        <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                                    ) : (<span></span>)
                                                }
                                            </Input.Group>
                                        </div>
                                    ) : (
                                        <div>
                                        </div>
                                    )
                                }
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <Input.Group>
                                        <span style={{ fontWeight: 'bold' }}>姓名：</span>
                                        <Input style={{ width: 'calc(100% - 100px)' }}
                                            placeholder='填写姓名'
                                            prefix={<UserOutlined />}
                                            value={pickUpName}
                                            onChange={this.handlePickUpPeopleChange} />
                                        {
                                            pickUpName === '' ? (
                                                <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                            ) : (<span></span>)
                                        }
                                    </Input.Group>
                                </div>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <Input.Group>
                                        <span style={{ fontWeight: 'bold' }}>手机：</span>
                                        <Input style={{ width: 'calc(100% - 100px)' }}
                                            placeholder='填写手机号'
                                            prefix={<PhoneOutlined />}
                                            value={phoneNumber}
                                            onChange={this.handlePhoneNumberChange} />
                                        {
                                            phoneNumber === '' ? (
                                                <span style={{ color: 'red', marginLeft: 8 }}>必填项</span>
                                            ) : (<span></span>)
                                        }
                                    </Input.Group>
                                </div>
                                <Divider dashed style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>其它</Divider>
                                <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                    <Input.Group>
                                        <span style={{ fontWeight: 'bold' }}>备注：</span>
                                        <TextArea style={{ width: 'calc(100% - 0px)' }} rows={2}
                                            placeholder='有特殊要求，请备注' value={remarks}
                                            onChange={this.handleRemarksChange} />
                                    </Input.Group>
                                </div>
                                <div style={{ marginTop: 16, marginBottom: 80, textAlign: 'center' }}>
                                    <Space>
                                        <Button type='default' onClick={this.handleOrderCakeInfoModalCancel}>取消</Button>
                                        <Button type='primary' onClick={this.handleOrderCakeInfoModalOk}>生成订购单</Button>
                                    </Space>
                                </div>
                            </div>) : (<div></div>)
                    }

                    {
                        orderImageModalVisiable ? (
                            <div style={{
                                background: 'rgba(0,0,0,0.5)', position: 'fixed',
                                zIndex: '100', width: 'calc(100%)', height: 'calc(100%)',
                                overflowY: 'hidden', overflowX: 'hidden'
                            }}>
                                <div style={KOrderImageDivStyle}>
                                    <div style={{ height: 120 }}>
                                        <Timeline style={{ paddingTop: 30, paddingLeft: 24, paddingRight: 24 }}>
                                            <Timeline.Item color='red'>{`仔细核对订购单信息`}</Timeline.Item>
                                            <Timeline.Item color='red'>{`长按图片=>"转发给朋友"=>发送给客服登记`}</Timeline.Item>
                                        </Timeline>
                                    </div>

                                    <div style={KOrderImageStyle}>
                                        <Image preview={false} src={orderImageSrc} />
                                    </div>

                                    <div style={{ height: 80, textAlign: 'center' }}>
                                        <Space style={{ marginTop: 24 }}>
                                            <Button key='edit' type='primary' onClick={() => {
                                                this.setState({
                                                    orderImageModalVisiable: false,
                                                    orderCakeInfoModalVisiable: true
                                                });
                                                document.documentElement.style.overflow = 'hidden';
                                            }}>返回修改</Button>
                                            <Button key='back' onClick={() => {
                                                this.setState({ orderImageModalVisiable: false });
                                                document.documentElement.style.overflow = 'auto';
                                            }}>关闭</Button>
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        ) : (<div></div>)
                    }

                    <div style={{
                        textAlign: 'center', marginTop: 0, fontSize: 20,
                        backgroundColor: '#DAA520', color: 'white',
                        borderRadius: 15, paddingTop: 10, paddingBottom: 10
                    }}>
                        {debug ? `新款蛋糕（${birthdayCakesLatest.length}）` : `新款蛋糕`}
                    </div>
                    {
                        birthdayCakesLatest.map((item) => {
                            return (
                                <div key={item.key}>
                                    <Image preview={false} src={`/image/生日蛋糕/蛋糕3.0/${item.name}-横图.jpg`} />

                                    <div style={{
                                        fontSize: 18,
                                        textAlign: 'center', marginTop: 0,
                                        marginLeft: 30, marginRight: 30,
                                        backgroundColor: 'red', color: 'white',
                                        borderRadius: 12, paddingTop: 4, paddingBottom: 4,
                                        marginBottom: 12
                                    }} onClick={() => {
                                        this.handleOrderNowTitleClick(item);
                                    }}>
                                        {`立即预定《${item.name}》`}
                                    </div>
                                </div>
                            );
                        })
                    }

                    <div style={{
                        textAlign: 'center', color: '#C6A300',
                        fontSize: 18, paddingTop: 10, paddingBottom: 10
                    }}>
                        更多款式请点击下方分类查看
                    </div>

                    <Collapse
                        bordered={true}
                        expandIcon={({ isActive }) => <RightSquareFilled rotate={isActive ? 90 : 0} />}
                        expandIconPosition='right'
                        onChange={this.handleCollapseOnChange}>
                        {
                            birthdayCakeCategorys.map((item) => {
                                return (
                                    <Panel
                                        header=
                                        {
                                            (
                                                <div style={{ color: 'white', fontSize: 20 }}>
                                                    <Image style={{ width: 50, height: 50, borderRadius: 25 }} preview={false} src={item.thumbnail} />

                                                    <div style={{ float: 'right', marginLeft: 12 }}>
                                                        <div>
                                                            {debug ? `${item.categoryName}（${item.productItems.length}）` : `${item.categoryName}`}
                                                        </div>
                                                        <div style={{ fontSize: 14, color: '#FEFCFF' }}>
                                                            {`${item.description}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        style={{ backgroundColor: '#DAA520', borderRadius: 20 }}
                                        key={item.categoryId}
                                        extra={(<span style={{ fontSize: 16, color: 'black' }}>{item.opened ? '点击关闭' : '点击打开'}</span>)}>
                                        <Spin spinning={item.spinning}>
                                            {
                                                item.productItems.map((item1) => {
                                                    let imageSrc = KBrithdayCakeRoot;
                                                    imageSrc += '/蛋糕3.0';
                                                    imageSrc += '/';
                                                    imageSrc += item1.productName;
                                                    imageSrc += '-横图.jpg';
                                                    return (
                                                        <span key={item1.key} >
                                                            {debug ? (<span>
                                                                <div style={{ color: 'red', fontSize: 14 }}>{item1.productName}</div>
                                                                <div style={{ color: 'green', fontSize: 12 }}>{`半年内销售数量：${item1.saleNumber}`}</div>
                                                            </span>) : (<span></span>)}

                                                            {item1.hideTheItem ? (<div></div>) : (
                                                                <Image preview={false} src={imageSrc} onError={(e) => {
                                                                    /// 图片加载不成功时隐藏
                                                                    item1.hideTheItem = true;
                                                                    this.forceUpdate();
                                                                }} />)}

                                                            {item1.hideTheItem ? (<div></div>) : (
                                                                <div style={{
                                                                    fontSize: 18,
                                                                    textAlign: 'center', marginTop: 0,
                                                                    marginLeft: 30, marginRight: 30,
                                                                    backgroundColor: 'red', color: 'white',
                                                                    borderRadius: 12, paddingTop: 4, paddingBottom: 4,
                                                                    marginBottom: 12
                                                                }} onClick={() => {
                                                                    let name = item1.productName;
                                                                    for (let i = 0; i < this._birthdayCakesAll.length; ++i) {
                                                                        if (this._birthdayCakesAll[i].name === name) {
                                                                            this.handleOrderNowTitleClick(this._birthdayCakesAll[i]);
                                                                            break;
                                                                        }
                                                                    }
                                                                }}>
                                                                    {`立即预定《${item1.productName}》`}
                                                                </div>)}
                                                        </span>
                                                    )
                                                })
                                            }
                                        </Spin>
                                    </Panel>
                                );
                            })
                        }
                    </Collapse>
                    <div style={{
                        textAlign: 'center', color: '#B9B973',
                        fontSize: 14, fontWeight: "bold", paddingTop: 7
                    }}>
                        <span>请添加教育局总店</span>
                        <span style={{ textDecoration: 'underline' }}>
                            <a href="tel:13290768588">13290768588</a>
                        </span>
                        <span> (微信同号)预定</span>
                    </div>

                    {imageCapturing ? (<div ref={(current) => {
                        this._theDiv4Capture = current;
                    }} style={theDiv4CaptureStyle}>
                        <div style={{
                            fontSize: 22,
                            textAlign: 'center',
                            paddingTop: 12,
                            paddingBottom: 12
                        }}> 弯麦蛋糕订购单</div>
                        <div>
                            <div style={theLeftDivInTheDiv4CaptureStyle}>
                                <div style={{
                                    fontSize: 20,
                                    textAlign: 'center',
                                    paddingTop: 4,
                                    paddingBottom: 4,
                                    fontWeight: 'bold',
                                    background: '#D8D8D8'
                                }}>{`《${cakeName}》`}</div>
                                <div>
                                    <Image preview={false} src={`${KBrithdayCakeRoot}/蛋糕3.0/${cakeName}-方图.jpg`} />
                                </div>
                            </div>
                            <div style={theRightDivInTheDiv4CaptureStyle}>
                                <Divider dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 12 }}>制作</Divider>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>奶油：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{creamType}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>大小：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{cakeSize}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>价格：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{cakePrice}</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>元</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>夹心：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{cakeFillings.join('+')}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>蜡烛：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{candleType}</span>
                                    {
                                        candleType === KCandleTypeOptions[1].value ? (
                                            <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                                                {`${number4candle}`}
                                            </span>) : (
                                            <span>
                                            </span>
                                        )
                                    }
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>餐具：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{cakePlateNumber}</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>套</span>
                                </div>
                                <Divider dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 12 }}>交付</Divider>
                                <div>
                                    <span style={{ fontSize: 16 }}>时间：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{pickUpDay.format('YYYY-MM-DD ddd')}</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{pickUpTime.format(' aHH:mm')}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>方式：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{pickUpType}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>门店：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{responseShop}</span>
                                </div>
                                {
                                    pickUpType === KPickUpTypeOptions[1].value ? (
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 16 }}>地址：</span>
                                            <span style={{ fontSize: 16, fontWeight: 'bold' }}>{deliverAddress}</span>
                                        </div>
                                    ) : (<div></div>)
                                }

                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>姓名：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{pickUpName}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>手机：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{phoneNumber}</span>
                                </div>
                                <Divider dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 12 }}>其它</Divider>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>备注：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{remarks}</span>
                                </div>
                            </div>
                        </div>
                    </div>) : (<div></div>)}

                    <div style={{ textAlign: 'center', background: '#D8D8D8', height: 100 }}>
                        <div style={{ paddingTop: 12, marginTop: 10 }}>
                            总部：漳州市漳浦县府前街西247号(教育局对面)
                        </div>
                        <div style={{ color: 'blue', fontSize: 14 }}>
                            <span style={{ color: 'black' }}>©弯麦</span>
                            <span style={{ color: 'blue', marginLeft: 8 }}>闽ICP备2022007668号-1</span>

                            <div>
                                <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=35062302000230">
                                    <span>
                                        <Image preview={false} src="/image/备案图标.png" style={{ float: 'left' }} />
                                    </span>
                                    <span style={{ marginLeft: 8 }}>
                                        闽公网安备 35062302000230号
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div >
            </Spin>
        )
    }
}

export default birthdayCakeSale;
