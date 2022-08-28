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
    LoadingOutlined
} from '@ant-design/icons';
import {
    Collapse, Image, Spin,
    DatePicker, Radio, List,
    Select, Input, Checkbox, Divider,
    message, Timeline, Button, Space
} from 'antd';
import {
    loadProductsSale,
    loadBirthdayCakesRecommend,
    loadBirthdayCakesAll,
    loadBirthdayCakesWXConfig,
    wechatSign,
    templateSendToSomePeople,
    createBirthdaycakeOrder
} from '../api/api';

const { Panel } = Collapse;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

const KBrithdayCakeRoot = '/image/生日蛋糕';

const KCategorys = [{
    categoryId: '1634302403310226908', categoryName: '常规款蛋糕', description: '平凡人生、快乐生活',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/陪伴-方图.jpg', productItems: {}
}, {
    categoryId: '1634302334442115588', categoryName: '女孩款蛋糕', description: '小小公主、永远开心',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/白雪公主-方图.jpg', productItems: {}
}, {
    categoryId: '1649820515687346997', categoryName: '男孩款蛋糕', description: '小男子汉、顶天立地',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/叮当王子-方图.jpg', productItems: {}
}, {
    categoryId: '1634302367129657476', categoryName: '女神款蛋糕', description: '我的女神、爱你永远',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/萌宠派对-方图.jpg', productItems: {}
}, {
    categoryId: '1634302388959605558', categoryName: '男神款蛋糕', description: '公里之内、属你最帅',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/暴富大G-方图.jpg', productItems: {}
}, {
    categoryId: '1634302419875701981', categoryName: '情侣款蛋糕', description: '两颗红心、相知相伴',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/小熊LOVE-方图.jpg', productItems: {}
}, {
    categoryId: '1634302432122635916', categoryName: '祝寿款蛋糕', description: '福寿绵绵、如海滔滔',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/福寿绵绵-方图.jpg', productItems: {}
}, {
    categoryId: '1634302446119593980', categoryName: '庆典派对款蛋糕', description: '共同举杯、共敬未来',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/招财进宝-方图.jpg', productItems: {}
}, {
    categoryId: '1657848010512718759', categoryName: '结婚订婚纪念蛋糕', description: '先生/女士、周年快乐',
    thumbnail: '/image/生日蛋糕/蛋糕3.0/爱心纪念-方图.jpg', productItems: {}
}];

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
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 55, height: 55 }} preview={false} src="/image/生日蛋糕/夹心/芒果.jpg" />
            <div style={{ width: 55, textAlign: 'center' }}>芒果</div>
        </div>), value: '芒果'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 55, height: 55 }} preview={false} src="/image/生日蛋糕/夹心/布丁.jpg" />
            <div style={{ width: 55, textAlign: 'center' }}>布丁</div>
        </div>), value: '布丁'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 55, height: 55 }} preview={false} src="/image/生日蛋糕/夹心/芋泥.jpg" />
            <div style={{ width: 55, textAlign: 'center' }}>芋泥</div>
        </div>), value: '芋泥'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 55, height: 55 }} preview={false} src="/image/生日蛋糕/夹心/奥利奥饼干碎.jpg" />
            <div style={{ width: 55, textAlign: 'center' }}>奥利奥</div>
        </div>), value: '奥利奥'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 55, height: 55 }} preview={false} src="/image/生日蛋糕/夹心/火龙果.jpg" />
            <div style={{ width: 55, textAlign: 'center' }}>火龙果</div>
        </div>), value: '火龙果'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 55, height: 55 }} preview={false} src="/image/生日蛋糕/夹心/黑糖晶球.jpg" />
            <div style={{ width: 55, textAlign: 'center' }}>黑糖晶球</div>
        </div>), value: '黑糖晶球'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 55, height: 55 }} preview={false} src="/image/生日蛋糕/夹心/巧克力燕麦.jpg" />
            <div style={{ width: 55, textAlign: 'center' }}>巧克力燕麦</div>
        </div>), value: '巧克力燕麦'
    }
];

const KCandleTypeOptions = [
    { label: '螺纹蜡烛', value: '螺纹蜡烛' },
    { label: '数字蜡烛', value: '数字蜡烛' },
    { label: '爱心蜡烛', value: '爱心蜡烛' },
    { label: '曲线蜡烛', value: '曲线蜡烛' },
    // { label: '五星蜡烛', value: '五星蜡烛' },
    { label: '荷花●音乐蜡烛', value: '荷花●音乐蜡烛' }
];

/// 导火器
const KIgnitorTypeOptions = [
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 70, height: 70 }} preview={false} src="/image/生日蛋糕/蜡烛/小心防火.jpg" />
            <div style={{ width: 70, textAlign: 'center' }}>不需要火柴</div>
        </div>), value: '不需要火柴'
    },
    {
        label: (<div style={{ marginBottom: 6 }}>
            <Image style={{ width: 70, height: 70 }} preview={false} src="/image/生日蛋糕/蜡烛/火柴盒.jpg" />
            <div style={{ width: 70, textAlign: 'center' }}>需要火柴</div>
        </div>), value: '需要火柴'
    }
];

const KCakePlateNumberBySize = {
    '5寸': '5',
    '6寸': '10',
    '8寸': '15',
    '10寸': '20',
    '12寸': '25',
    '14寸': '30'
};

const KCakeRecommendPeople = {
    '5寸': '直径12.5厘米 | 1-2人',
    '6寸': '直径15厘米 | 3-5人',
    '8寸': '直径20厘米 | 6-9人',
    '10寸': '直径25厘米 | 10-15人',
    '12寸': '直径30厘米 | 16-20人',
    '14寸': '直径46厘米 | 21-30人'
};

class birthdayCakeSale extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            birthdayCakeCategorys: KCategorys,
            birthdayCakesRecommendTitle: '最新蛋糕',
            birthdayCakesRecommendItems: {},
            birthdayCakesRecommendLoading: true,
            debug: 0,
            orderCakeInfoModalVisiable: false,

            /// 蛋糕信息
            cakeName: '',
            cakeDescription: '',
            cakeImage: '',
            orderCakePrices: {},
            creamType: '',
            cakeSize: '',
            cakeSizeExtra: '',
            cakePrice: '--',
            cakeFillings: [KCakeFillingOptions[0].value, KCakeFillingOptions[1].value],
            candleType: KCandleTypeOptions[0].value,
            ignitorType: KIgnitorTypeOptions[0].value,
            number4candle: '',
            cakePlateNumber: '--',
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
        this._birthdayCakesAll = [];
    }

    componentDidMount = async () => {
        let query = this.props.query;
        let debug = query && query.get('debug');

        if (this._birthdayCakesAll.length <= 0) {
            this._birthdayCakesAll = await loadBirthdayCakesAll();
        }

        let birthdayCakesRecommend = await loadBirthdayCakesRecommend();

        let recommendTitle = birthdayCakesRecommend.recommendTitle;
        let birthdayCakesRecommendItems = birthdayCakesRecommend.recommendItems;
        let birthdayCakesRecommendItemsNew = {};
        for (let ii = 0; ii < birthdayCakesRecommendItems.length; ++ii) {
            let latestItem = birthdayCakesRecommendItems[ii];

            let keys = Object.keys(this._birthdayCakesAll);
            for (let jj = 0; jj < keys.length; ++jj) {
                let name4allItem = keys[jj];
                if (latestItem === name4allItem) {
                    birthdayCakesRecommendItemsNew[name4allItem] = this._birthdayCakesAll[name4allItem];
                }
            }
        }
        this.setState({
            birthdayCakesRecommendTitle: recommendTitle,
            birthdayCakesRecommendItems: birthdayCakesRecommendItemsNew,
            birthdayCakesRecommendLoading: false,
            debug: debug
        });
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
                    if (Object.keys(birthdayCakeCategoryToAdd.productItems).length <= 0 &&
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

                            /// 转化为统一格式（对象）
                            let productItemsObj = {};
                            listAfterMerge.forEach(element => {
                                let obj = {};
                                obj.saleNumber = element.saleNumber;
                                obj['价格'] = {};
                                obj['描述'] = '';
                                if (this._birthdayCakesAll[element.productName]) {
                                    if (this._birthdayCakesAll[element.productName]['价格']) {
                                        obj['价格'] = this._birthdayCakesAll[element.productName]['价格'];
                                    }

                                    if (this._birthdayCakesAll[element.productName]['描述']) {
                                        obj['描述'] = this._birthdayCakesAll[element.productName]['描述'];
                                    }

                                    productItemsObj[element.productName] = obj;
                                }
                            });

                            // console.log(productItemsObj);

                            birthdayCakeCategoryToAdd.productItems = productItemsObj;
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

    handleOrderNowClick = (type, name, description, prices) => {
        this.setState({
            orderCakeInfoModalVisiable: true,
            orderCakePrices: prices,
            cakeName: name,
            cakeDescription: description,
            cakeImage: type === 0 ? KBrithdayCakeRoot + '/蛋糕3.0/' + name + '-方图.jpg' : '私人订制蛋糕',
            creamType: '',
            cakeSize: '',
            cakeSizeExtra: '',
            cakePrice: '--',
            cakeFillings: [KCakeFillingOptions[0].value, KCakeFillingOptions[1].value],
            candleType: KCandleTypeOptions[0].value,
            number4candle: '',
            cakePlateNumber: '--',

            /// 配送信息
            pickUpDay: '',
            pickUpTime: '',
            pickUpType: '',
            responseShop: '',
            deliverAddress: '',
            pickUpName: '',
            phoneNumber: '',
            remarks: '',

            makingTime: '',
        });

        document.documentElement.style.overflow = 'hidden';
    }

    handleOrderCakeInfoModalOk = () => {
        const {
            cakeName,
            cakeDescription,
            creamType,
            cakeImage,
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
            deliverAddress,
            pickUpName,
            phoneNumber,
            remarks
        } = this.state;

        console.log('名字：' + cakeName);
        console.log('描述：' + cakeDescription);
        console.log('图片：' + cakeImage);
        console.log('奶油：' + creamType);
        console.log('尺寸：' + cakeSize);
        console.log('组合：' + cakeSizeExtra);
        console.log('价格：' + cakePrice);
        console.log('夹心：' + cakeFillings);
        console.log('蜡烛：' + candleType);
        console.log('火柴：' + ignitorType);
        console.log('数字：' + number4candle);
        console.log('餐盘：' + cakePlateNumber);
        console.log('日期：' + pickUpDay);
        console.log('时间：' + pickUpTime);
        console.log('方式：' + pickUpType);
        console.log('门店：' + responseShop);
        console.log('地址：' + deliverAddress);
        console.log('姓名：' + pickUpName);
        console.log('手机：' + phoneNumber);
        console.log('备注：' + remarks);

        if (cakeImage === '私人订制蛋糕') {
            message.warning('请先选择蛋糕图片！')
            return;
        }

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
            if (candleType === KCandleTypeOptions[1].value &&
                number4candle === '') {
                message.warning('请填写必填项！')
                return;
            }
        }

        this.setState({
            orderCakeInfoModalVisiable: false,
            makingTime: moment().format('YYYY.MM.DD ddd a HH:mm'),
            image4QRCode: ''
        }, () => {
            setTimeout(() => {
                this.setState({
                    imageCapturing: true
                }, async () => {
                    if (!this._theDiv4Capture) return;

                    /// 保存蛋糕订单，返回_id
                    let createResult = await createBirthdaycakeOrder(
                        cakeName,
                        cakeDescription,
                        creamType,
                        cakeSize,
                        cakeSizeExtra,
                        cakePrice,
                        cakeFillings,
                        candleType,
                        ignitorType,
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

                    let birthdayCakeOrderUrl = `http://gratefulwheat.ruyue.xyz/birthdayCakeOrder?_id=${createResult._id}`;
                    let opts = {
                        errorCorrectionLevel: 'L',
                        type: 'image/png',
                        quality: 0.5,
                        margin: 1,
                        color: {
                            dark: "#E5E4E2",
                            light: "#C58917"
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
                                    let style = '《' + cakeName + '》';
                                    let time = pickUpDay.format('YYYY-MM-DD ddd') + pickUpTime.format(' a HH:mm');
                                    let sendResult = await templateSendToSomePeople(createResult._id, title, responseShop, style, time, pickUpName, phoneNumber);
                                    // console.log(sendResult);
                                    message.info(JSON.stringify(sendResult));
                                });
                            });
                        });
                })
            }, 0);
        });

        document.documentElement.style.overflow = 'visible';
    }

    handleOrderCakeInfoModalCancel = () => {
        this.setState({ orderCakeInfoModalVisiable: false });
        document.documentElement.style.overflow = 'visible';
    }

    handleCreamTypeChange = e => {
        let creamType = e.target.value;

        const { orderCakePrices, cakeSize } = this.state;

        let cakePrice = '--';
        if (orderCakePrices) {
            let price4CreamType = orderCakePrices[creamType];
            if (price4CreamType && price4CreamType[cakeSize]) {
                cakePrice = price4CreamType[cakeSize];
            }
        }

        this.setState({ creamType: creamType, cakePrice: cakePrice });
    }

    handleCakeSizeChange = (value) => {
        const { orderCakePrices, creamType } = this.state;

        let cakePrice = '--';
        if (orderCakePrices) {
            let price4CreamType = orderCakePrices[creamType];
            if (price4CreamType && price4CreamType[value]) {
                cakePrice = price4CreamType[value];
            }
        }

        let cakePlateNumber = KCakePlateNumberBySize[value] ? KCakePlateNumberBySize[value] : '--';
        this.setState({
            cakeSize: value,
            cakePrice: cakePrice,
            cakePlateNumber: cakePlateNumber
        });
    }

    handleCakeSizeExtraChange = (e) => {
        this.setState({
            cakeSizeExtra: e.target.value
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

    handleCandleTypeChange = (e) => {
        this.setState({ candleType: e.target.value });
    }

    handleIgnitorTypeChange = (e) => {
        this.setState({ ignitorType: e.target.value });
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
            birthdayCakesRecommendTitle,
            birthdayCakesRecommendItems,
            birthdayCakesRecommendLoading,
            debug,
            pickUpType,
            orderCakeInfoModalVisiable,
            orderCakePrices,
            cakeName,
            cakeDescription,
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
            pickUpDayPopupOpen,
            pickUpTime,
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
            float: 'left', marginLeft: 8
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

        let creamTypeOptions = [];
        {
            const KCreamTypeOptions = {
                "牛奶奶油": { label: '牛奶奶油', value: '牛奶奶油' },
                "动物奶油": { label: '动物奶油', value: '动物奶油' }
            };
            if (orderCakePrices) {
                let prices = Object.keys(orderCakePrices);
                for (let i = 0; i < prices.length; ++i) {
                    let price = prices[i];
                    let creamTypeOption = KCreamTypeOptions[price];
                    creamTypeOptions.push(creamTypeOption);
                }
            }
        }

        let orderImageWidth = window.innerWidth;
        let orderImageHeight = orderImageWidth * 148 / 210;
        let titleAndFooterHeight = 190;
        let KOrderImageDivStyle = {
            background: 'white',
            width: orderImageWidth,
            height: orderImageHeight + titleAndFooterHeight,
            marginTop: (window.innerHeight - (orderImageHeight + titleAndFooterHeight)) / 2
        };

        let KOrderImageStyle = {
            width: orderImageWidth,
            height: orderImageHeight,
            border: '2px dashed #C58917'
        };

        let KOrderImageInStyle = {
            width: orderImageWidth - 4,
            height: orderImageHeight - 4
        };

        const KCandleTypeOptions = [
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70 }} preview={false} src="/image/生日蛋糕/蜡烛/螺纹蜡烛.jpg" />
                    <div style={{ width: 70, textAlign: 'center' }}>螺纹蜡烛</div>
                    <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一根</div>
                </div>), value: '螺纹蜡烛'
            },
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70 }} preview={false} src="/image/生日蛋糕/蜡烛/数字蜡烛.jpg" />

                    <div style={{ width: 70, textAlign: 'center' }}>
                        数字蜡烛
                        <Input style={{ width: 70, height: 30 }}
                            placeholder='数字'
                            prefix={<EditOutlined />}
                            value={number4candle}
                            onChange={this.handleNumber4candleChange}></Input>
                    </div>
                </div>), value: '数字蜡烛'
            },
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70 }} preview={false} src="/image/生日蛋糕/蜡烛/爱心蜡烛.jpg" />
                    <div style={{ width: 70, textAlign: 'center' }}>爱心蜡烛</div>
                    <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一根</div>
                </div>), value: '爱心蜡烛'
            },
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70 }} preview={false} src="/image/生日蛋糕/蜡烛/曲线蜡烛.jpg" />
                    <div style={{ width: 70, textAlign: 'center' }}>曲线蜡烛</div>
                    <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一根</div>
                </div>), value: '曲线蜡烛'
            },
            {
                label: (<div style={{ marginBottom: 6 }}>
                    <Image style={{ width: 70, height: 70 }} preview={false} src="/image/生日蛋糕/蜡烛/荷花●音乐蜡烛.jpg" />
                    <div style={{ width: 70, textAlign: 'center' }}>荷花●音乐蜡烛</div>
                    <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一根</div>
                </div>), value: '荷花●音乐蜡烛'
            }
        ];

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
                        orderCakeInfoModalVisiable ? (
                            <div style={{
                                opacity: 0.99, background: 'white', position: 'fixed',
                                zIndex: '100', width: 'calc(100%)', height: 'calc(100%)',
                                overflowY: 'auto', overflowX: 'hidden'
                            }}>
                                <div style={{ textAlign: 'center', fontSize: 14, marginTop: 8, fontWeight: 'bold' }}>
                                    {`《${cakeName}》`}
                                </div>
                                <div style={{ textAlign: 'center', fontSize: 14 }}>
                                    {cakeDescription}
                                </div>
                                <div style={{ textAlign: 'center', width: '100%' }}>
                                    {
                                        (cakeImage !== '私人订制蛋糕') ? (
                                            <div>
                                                <Image style={{ width: 120, height: 120, border: '1px dashed #C58917' }}
                                                    src={cakeImage} />
                                                <Image style={{
                                                    position: 'absolute', width: 55, height: 55, marginLeft: 4
                                                }} src={`/image/生日蛋糕/尺寸/蛋糕尺寸展示板.jpg`} />
                                            </div>
                                        ) : (
                                            <Icon style={{ width: 120, height: 120, border: '1px dashed #C58917' }}
                                                component={() => divImageLoading ?
                                                    <LoadingOutlined style={{ fontSize: 50, color: '#C58917', marginTop: 30 }} /> :
                                                    <PlusOutlined style={{ fontSize: 50, color: '#C58917', marginTop: 30 }} />}

                                                onClick={() => {
                                                    let that = this;
                                                    window.wx.chooseImage({
                                                        count: 1, // 默认9
                                                        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                                                        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                                                        success: function (res) {
                                                            that.setState({
                                                                imageCropperModalVisiable: true,
                                                                localImgDataLoading: true
                                                            }, () => {
                                                                let localIds = res.localIds; // 返回选定照片的本地 ID 列表，localId可以作为 img 标签的 src 属性显示图片
                                                                window.wx.getLocalImgData({
                                                                    localId: localIds[0], // 图片的localID
                                                                    success: function (res) {
                                                                        console.log('4')
                                                                        let localData = res.localData; // localData是图片的base64数据，可以用 img 标签显示
                                                                        /// 如果缺少base64头部补充上
                                                                        if (!(localData.startsWith('data:image/jpg;base64,'))) {
                                                                            localData = 'data:image/jpg;base64,' + localData;
                                                                        }
                                                                        that.setState({ localImgDataLoading: false, imageBeforeCrop: localData });
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    });
                                                }} />
                                        )
                                    }
                                </div>
                                {
                                    cakeImage !== '私人订制蛋糕' ? (
                                        <div>
                                            <QueueAnim type={['bottom', 'top']}>
                                                <div key='a' style={{ textAlign: 'center', width: '100%' }}>
                                                    <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>规格</Divider>
                                                    {
                                                        Object.keys(orderCakePrices).map((item => {
                                                            let thePrices = orderCakePrices[item];
                                                            let sizes = Object.keys(thePrices);
                                                            return (
                                                                <div key={item} >
                                                                    <div style={{ fontWeight: 'bold' }}>{item}</div>
                                                                    {
                                                                        sizes.map((item1) => {
                                                                            return (
                                                                                <div key={item1}>
                                                                                    <span>{item1}</span>
                                                                                    <span>（</span>
                                                                                    <span>{KCakeRecommendPeople[item1]}</span>
                                                                                    <span>）</span>
                                                                                    <span>{thePrices[item1]}</span>
                                                                                    <span>元</span>
                                                                                </div>)
                                                                        })
                                                                    }
                                                                    {
                                                                        sizes.length >= 2 ? (
                                                                            <div style={{ fontSize: 12, fontWeight: 'bold' }}>
                                                                                <div>叠加组合，价格为对应尺寸之和</div>
                                                                                <div>悬浮组合，价格为对应尺寸之和+20元</div>
                                                                            </div>) : (<div></div>)
                                                                    }
                                                                </div>
                                                            )
                                                        }))
                                                    }
                                                </div>

                                                <div key='b'>
                                                    <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>制作</Divider>
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
                                                                    <div style={{ color: 'red' }}>“奶油”是必填项</div>
                                                                ) : (<div></div>)
                                                            }
                                                        </Input.Group>
                                                    </div>
                                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                                        <div>
                                                            <span style={{ fontWeight: 'bold' }}>尺寸：</span>
                                                            <Select value={cakeSize} style={{ width: 80, marginRight: 8 }}
                                                                onChange={this.handleCakeSizeChange}
                                                                onDropdownVisibleChange={this.handleDropdownVisibleChange}
                                                                options={cakeSizeOptions}>
                                                            </Select>

                                                            {
                                                                cakeSize === '组合' ? (
                                                                    <span>
                                                                        <Input placeholder='叠加或悬浮|几寸+几寸'
                                                                            prefix={<EditOutlined />}
                                                                            style={{ width: 190 }}
                                                                            value={cakeSizeExtra}
                                                                            onChange={this.handleCakeSizeExtraChange}></Input>
                                                                    </span>) : (<div></div>)
                                                            }

                                                            {
                                                                cakeSize === '' || (cakeSize === '组合' && cakeSizeExtra === '') ? (
                                                                    <div style={{ color: 'red' }}>“尺寸”是必填项</div>
                                                                ) : (<span></span>)
                                                            }
                                                        </div>
                                                    </div>
                                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                                        <span style={{ fontWeight: 'bold' }}>价格：</span>
                                                        <span>{cakePrice}</span>
                                                        <span> 元</span>
                                                    </div>
                                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                                        <span style={{ fontWeight: 'bold' }}>夹心（任选两种，默认为芒果和布丁）：</span>
                                                        <CheckboxGroup
                                                            style={{ marginTop: 8 }}
                                                            options={KCakeFillingOptions}
                                                            value={cakeFillings}
                                                            onChange={this.handleCakeFillingChange} />
                                                        {
                                                            cakeFillings.length === 0 ? (
                                                                <div style={{ color: 'red' }}>“夹心”是必填项</div>
                                                            ) : (<span></span>)
                                                        }
                                                    </div>
                                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                                        <div style={{ fontWeight: 'bold' }}>蜡烛（任选一种，默认为螺纹蜡烛一根）：</div>

                                                        <Radio.Group style={{ marginTop: 8 }}
                                                            options={KCandleTypeOptions}
                                                            value={candleType}
                                                            onChange={this.handleCandleTypeChange}>
                                                        </Radio.Group>
                                                        {
                                                            candleType === '' ||
                                                                (candleType === KCandleTypeOptions[1].value &&
                                                                    number4candle === '') ? (
                                                                <div style={{ color: 'red', marginLeft: 0 }}>“数字”是必填项</div>
                                                            ) : (<span></span>)
                                                        }
                                                    </div>
                                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                                        <div style={{ fontWeight: 'bold' }}>火柴（如需要请选择，默认没有火柴）：</div>

                                                        <Radio.Group style={{ marginTop: 8 }}
                                                            options={KIgnitorTypeOptions}
                                                            value={ignitorType}
                                                            onChange={this.handleIgnitorTypeChange}>
                                                        </Radio.Group>
                                                    </div>

                                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                                        <div style={{ fontWeight: 'bold' }}>帽子（默认为金卡皇冠帽）：</div>
                                                        <Image style={{ width: 70, height: 70, marginTop: 8 }} preview={false} src="/image/生日蛋糕/帽子/金卡皇冠帽.jpg" />
                                                        <div style={{ width: 70, textAlign: 'center' }}>金卡皇冠帽</div>
                                                        <div style={{ width: 70, height: 30, textAlign: 'center', paddingTop: 6 }}>一顶</div>
                                                    </div>

                                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                                        <span style={{ fontWeight: 'bold' }}>餐具：</span>
                                                        <span>{cakePlateNumber}</span>
                                                        <span> 套</span>
                                                    </div>
                                                </div>

                                                <div key='c'>
                                                    <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>取货</Divider>
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
                                                                    format: 'a HH:mm'
                                                                }}
                                                                panelRender={(originPicker) => {
                                                                    return (
                                                                        <div style={{ marginLeft: 20, marginRight: 20 }}>
                                                                            {originPicker}
                                                                        </div>)
                                                                }}
                                                                format='a HH:mm'
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
                                                                <div style={{ color: 'red' }}>“取货”是必填项</div>
                                                            ) : (<div></div>)
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
                                                                <div style={{ color: 'red' }}>“方式”是必填项</div>
                                                            ) : (<div></div>)
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
                                                                <div style={{ color: 'red' }}>“门店”是必填项</div>
                                                            ) : (<div></div>)
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
                                                                    <div style={{ color: 'red' }}>“姓名”是必填项</div>
                                                                ) : (<div></div>)
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
                                                                    <div style={{ color: 'red' }}>“手机”是必填项</div>
                                                                ) : (<div></div>)
                                                            }
                                                        </Input.Group>
                                                    </div>
                                                </div>

                                                <div key='d'>
                                                    <Divider style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>其它</Divider>
                                                    <div style={{ marginTop: 8, marginBottom: 8, marginLeft: 12, marginRight: 12 }}>
                                                        <Input.Group>
                                                            <span style={{ fontWeight: 'bold' }}>备注：</span>
                                                            <TextArea style={{ width: 'calc(100% - 0px)' }} rows={2}
                                                                placeholder='有特殊要求，请备注' value={remarks}
                                                                onChange={this.handleRemarksChange} />
                                                        </Input.Group>
                                                    </div>
                                                    <div style={{ height: 80 }}></div>
                                                </div>
                                            </QueueAnim>
                                        </div>
                                    ) : (<div></div>)
                                }

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
                                background: 'rgba(0,0,0,0.8)', position: 'fixed',
                                zIndex: '100', width: 'calc(100%)', height: 'calc(100%)',
                                overflowY: 'hidden', overflowX: 'hidden'
                            }}>
                                <div style={KOrderImageDivStyle}>
                                    <div key='a' style={{ height: 110 }}>
                                        <Timeline style={{ paddingTop: 30, paddingLeft: 24, paddingRight: 24 }}>
                                            <Timeline.Item color='red'>{`1：请仔细核对订购单信息`}</Timeline.Item>
                                            <Timeline.Item color='red'>{`2：长按虚框内订购单图片并发送给客服登记`}</Timeline.Item>
                                        </Timeline>
                                    </div>

                                    <QueueAnim type={['bottom', 'top']}>
                                        <div key='a' style={KOrderImageStyle}>
                                            <Image style={KOrderImageInStyle} preview={false} src={orderImageSrc} />
                                        </div>
                                    </QueueAnim>

                                    <div style={{ height: 80, textAlign: 'center', backgroundColor: '#E5E4E2' }}>
                                        <Space style={{ marginTop: 24 }}>
                                            <Button key='back' onClick={() => {
                                                this.setState({ orderImageModalVisiable: false });
                                                document.documentElement.style.overflow = 'visible';
                                            }}>关闭</Button>
                                            <Button key='edit' type='primary' onClick={() => {
                                                this.setState({
                                                    orderImageModalVisiable: false,
                                                    orderCakeInfoModalVisiable: true
                                                });
                                                document.documentElement.style.overflow = 'hidden';
                                            }}>返回修改</Button>
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        ) : (<div></div>)
                    }

                    <div style={{
                        textAlign: 'center', color: '#B9B973',
                        fontSize: 14, fontWeight: "bold", paddingTop: 7, paddingBottom: 5
                    }}>
                        <span>预定前请先添加教育局总店2号</span>
                        <span style={{ textDecoration: 'underline' }}>
                            <a href="tel:18599568588">18599568588</a>
                        </span>
                        <span> (微信同号)</span>
                    </div>

                    <div style={{
                        textAlign: 'center', marginTop: 0, fontSize: 20,
                        backgroundColor: '#DAA520', color: 'white',
                        borderRadius: 15, paddingTop: 10, paddingBottom: 10
                    }}>
                        {debug ? `${birthdayCakesRecommendTitle}（${Object.keys(birthdayCakesRecommendItems).length}）`
                            : `${birthdayCakesRecommendTitle}`}
                    </div>
                    <Spin spinning={birthdayCakesRecommendLoading} size='large'>
                        <List
                            style={{ marginLeft: 4, marginRight: 4, marginTop: 4 }}
                            grid={{ gutter: 4, column: 2 }}
                            dataSource={Object.keys(birthdayCakesRecommendItems)}
                            renderItem={item => {
                                let pricesObj = birthdayCakesRecommendItems[item]['价格'];
                                let description = birthdayCakesRecommendItems[item]['描述'];
                                let pricesKeys = Object.keys(pricesObj);

                                let theMinimumPrice = '0';

                                if (pricesKeys.length > 0) {
                                    let type = pricesKeys[0];

                                    let thePrices = pricesObj[type];
                                    let theThePrices = Object.keys(thePrices);
                                    if (theThePrices.length > 0) {
                                        let firstPrice = theThePrices[0];
                                        theMinimumPrice = thePrices[firstPrice];
                                    }
                                }

                                let index = Object.keys(birthdayCakesRecommendItems).indexOf(item);
                                let rank = index + 1;

                                return (
                                    <List.Item>
                                        <div key={item}>
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

                                            <Image style={{ border: '1px dashed #C58917' }}
                                                fallback='data:image/png;base64,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'
                                                preview={true} src={`/image/生日蛋糕/蛋糕3.0/${item}-方图.jpg`} />

                                            <div>
                                                <div>
                                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>{`《${item}》`}</span>
                                                    <span style={{
                                                        fontSize: 14, marginTop: 8,
                                                        float: 'right', paddingTop: 4, paddingBottom: 4,
                                                        paddingLeft: 8, paddingRight: 8, borderRadius: 15,
                                                        textAlign: 'center', backgroundColor: '#C58917', color: 'white',
                                                    }} onClick={() => {
                                                        this.handleOrderNowClick(0, item, description, pricesObj);
                                                    }}>
                                                        {`预定`}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 14 }}>
                                                    <span>{description}</span>
                                                </div>
                                                <div style={{ fontSize: 13 }}>
                                                    <span>¥</span>
                                                    <span>{theMinimumPrice}</span>
                                                    <span>起</span>
                                                </div>
                                            </div>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    </Spin>
                    <div style={{
                        textAlign: 'center', color: '#C6A300',
                        fontSize: 18, paddingTop: 10, paddingBottom: 20
                    }}>
                        更多款式请点击下方分类查看
                    </div>

                    <Collapse
                        bordered={true}
                        expandIcon={({ isActive }) => <RightSquareFilled rotate={isActive ? 90 : 0} />}
                        expandIconPosition='right'
                        onChange={this.handleCollapseOnChange}>
                        {
                            birthdayCakeCategorys.map((categoryItem) => {
                                return (
                                    <Panel
                                        header=
                                        {
                                            (
                                                <div style={{ color: 'white', fontSize: 20 }}>
                                                    <Image style={{ width: 50, height: 50, borderRadius: 25 }} preview={false} src={categoryItem.thumbnail} />

                                                    <div style={{ float: 'right', marginLeft: 12 }}>
                                                        <div>
                                                            {debug ? `${categoryItem.categoryName}（${Object.keys(categoryItem.productItems).length}）` : `${categoryItem.categoryName}`}
                                                        </div>
                                                        <div style={{ fontSize: 14, color: '#FEFCFF' }}>
                                                            {`${categoryItem.description}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        style={{ backgroundColor: '#DAA520', borderRadius: 20 }}
                                        key={categoryItem.categoryId}
                                        extra={(<span style={{ fontSize: 16, color: 'black' }}>{categoryItem.opened ? '点击关闭' : '点击打开'}</span>)}>
                                        <Spin spinning={categoryItem.spinning}>
                                            <List
                                                style={{ marginLeft: -12, marginRight: -12, marginTop: -12 }}
                                                grid={{ gutter: 4, column: 2 }}
                                                dataSource={Object.keys(categoryItem.productItems)}
                                                renderItem={item => {
                                                    let pricesObj = categoryItem.productItems[item]['价格'];
                                                    let description = categoryItem.productItems[item]['描述'];
                                                    let pricesKeys = Object.keys(pricesObj);
                                                    let theMinimumPrice = '0';

                                                    let index = Object.keys(categoryItem.productItems).indexOf(item);
                                                    let rank = index + 1;

                                                    if (pricesKeys.length > 0) {
                                                        let type = pricesKeys[0];

                                                        let thePrices = pricesObj[type];
                                                        let theThePrices = Object.keys(thePrices);
                                                        if (theThePrices.length > 0) {
                                                            let firstPrice = theThePrices[0];
                                                            theMinimumPrice = thePrices[firstPrice];
                                                        }
                                                    }
                                                    return (
                                                        <List.Item>
                                                            <div key={item}>
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

                                                                <Image style={{ border: '1px dashed #C58917' }}
                                                                    fallback='data:image/png;base64,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'
                                                                    preview={true} src={`/image/生日蛋糕/蛋糕3.0/${item}-方图.jpg`} />

                                                                <div>
                                                                    <div>
                                                                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{`《${item}》`}</span>
                                                                        <span style={{
                                                                            fontSize: 14, marginTop: 8,
                                                                            float: 'right', paddingTop: 4, paddingBottom: 4,
                                                                            paddingLeft: 8, paddingRight: 8, borderRadius: 12,
                                                                            textAlign: 'center', backgroundColor: '#C58917', color: 'white',
                                                                        }} onClick={() => {
                                                                            this.handleOrderNowClick(0, item, description, pricesObj);
                                                                        }}>
                                                                            {`预定`}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ fontSize: 14 }}>
                                                                        <span>{description}</span>
                                                                    </div>
                                                                    <div style={{ fontSize: 13 }}>
                                                                        <span>¥</span>
                                                                        <span>{theMinimumPrice}</span>
                                                                        <span>起</span>
                                                                    </div>
                                                                    {debug ? (
                                                                        <div style={{ color: 'green', fontSize: 12 }}>
                                                                            {`半年内销售数量：${categoryItem.productItems[item].saleNumber}`}
                                                                        </div>
                                                                    ) : (<div></div>)}
                                                                </div>
                                                            </div>
                                                        </List.Item>
                                                    );
                                                }}
                                            />
                                        </Spin>
                                    </Panel>
                                );
                            })
                        }
                    </Collapse>

                    <div style={{
                        textAlign: 'center', marginTop: 0, fontSize: 24,
                        backgroundColor: '#DAA520', color: 'white',
                        borderRadius: 0, paddingTop: 30, paddingBottom: 30
                    }} onClick={() => {
                        let price4customized = {
                            "牛奶奶油": {
                                "6寸": "--",
                                "8寸": "--",
                                "10寸": "--",
                                "12寸": "--"
                            },
                            "动物奶油": {
                                "6寸": "--",
                                "8寸": "--",
                                "10寸": "--",
                                "12寸": "--"
                            }
                        }
                        this.handleOrderNowClick(1, '私人定制', '点击+选择私人订制蛋糕图片', price4customized);
                    }}>
                        <span>私人订制蛋糕</span>
                        <span style={{ color: 'black', fontSize: 18, marginLeft: 8 }}>点击预定</span>
                    </div>

                    {imageCapturing ? (
                        <div ref={(current) => { this._theDiv4Capture = current; }}
                            style={theDiv4CaptureStyle}>
                            <div id="qrcode" style={{
                                textAlign: 'right', position: 'absolute',
                                paddingRight: 10, paddingTop: 10,
                                width: theDiv4CaptureWidth, height: 150
                            }}>
                                <Image style={{ width: 150, height: 150 }}
                                    preview={false}
                                    src={image4QRCode}
                                />
                                <div style={{ fontSize: 10 }}>顾客请不要识别二维码</div>
                            </div>

                            <div style={{
                                textAlign: 'left', position: 'absolute', paddingLeft: 20,
                                width: theDiv4CaptureWidth, fontSize: 14, paddingTop: 10,
                            }}>{`订购时间：${makingTime}`}</div>

                            <div style={{
                                fontSize: 22,
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
                                        background: '#D8D8D8'
                                    }}>{`《${cakeName}》`}</div>
                                    <div>
                                        <Image preview={false} src={cakeImage} />
                                        <Image style={{ marginTop: 16 }} preview={false} src="/image/弯麦logo长.png" />
                                    </div>
                                </div>
                                <div style={theRightDivInTheDiv4CaptureStyle}>
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
                                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{cakeFillings.join('+')}</span>
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
                                            ignitorType === '需要火柴' ? (
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                                                    {`+火柴盒`}
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
                                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpDay ? pickUpDay.format('YYYY-MM-DD ddd') : ''}</span>
                                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpTime ? pickUpTime.format(' a HH:mm') : ''}</span>
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
                                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>{deliverAddress}</span>
                                            </div>
                                        ) : (<div></div>)
                                    }

                                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                                        <span style={{ fontSize: 14 }}>姓名：</span>
                                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpName}</span>
                                    </div>
                                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                                        <span style={{ fontSize: 14 }}>手机：</span>
                                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{phoneNumber}</span>
                                    </div>
                                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                                    <div style={{ marginTop: 4, marginBottom: 4, marginRight: 8 }}>
                                        <span style={{ fontSize: 14 }}>备注：</span>
                                        <span style={{ fontSize: 14, fontWeight: 'bold', wordWrap: 'break-word' }}>
                                            {remarks}
                                        </span>
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
            </Spin>
        )
    }
}

export default birthdayCakeSale;
