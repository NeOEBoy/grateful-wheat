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

import {
    RightSquareFilled,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import {
    Modal, Collapse, Image, Spin,
    Typography, DatePicker, Radio,
    Select, Input, Checkbox, Divider,
    message, Timeline, Button
} from 'antd';
import {
    loadProductsSale,
    loadBirthdayCakesRecommend,
    wechatSign
} from '../api/api';

const { Title } = Typography;
const { Panel } = Collapse;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

const KBrithdayCakeRoot = '/image/弯麦生日蛋糕';

const KCreamTypeOptions = [
    { label: '牛奶奶油', value: '牛奶奶油' },
    { label: '动物奶油', value: '动物奶油' }
];

const KPickUpTypeOptions = [
    { label: '自己提货', value: '自己提货' },
    { label: '商家配送', value: '商家配送' }
];

const KSelfPickUpShopOptions = [
    { label: '教育局店', value: '教育局店' },
    { label: '江滨店', value: '江滨店' },
    { label: '汤泉世纪店', value: '汤泉世纪店' },
    { label: '旧镇店', value: '旧镇店' },
    { label: '狮头店', value: '狮头店' },
    { label: '盘陀店', value: '盘陀店' }
];

const KCakeSizeOptions = [
    { label: '6英寸', value: '6英寸' },
    { label: '8英寸', value: '8英寸' },
    { label: '10英寸', value: '10英寸' },
    { label: '12英寸', value: '12英寸' }
];

const KCakeFillingOptions = ['芒果', '布丁', '燕麦'];

const KCandleTypeOptions = [
    { label: '螺纹蜡烛', value: '螺纹蜡烛' },
    { label: '数字蜡烛', value: '数字蜡烛' },
    { label: '爱心蜡烛', value: '爱心蜡烛' },
    { label: '五星蜡烛', value: '五星蜡烛' }
];

const KCakePlateNumberOptions = [
    { label: '5套', value: '5套' },
    { label: '10套', value: '10套' },
    { label: '15套', value: '15套' },
    { label: '20套', value: '20套' },
    { label: '25套', value: '25套' },
    { label: '30套', value: '30套' },
    { label: '35套', value: '35套' },
    { label: '40套', value: '40套' }
];

class birthdayCakeSale extends React.Component {
    constructor(props) {
        super(props);

        const KCategorys = [
            { categoryId: '1634302334442115588', categoryName: '1-女孩蛋糕', productItems: [] },
            { categoryId: '1649820515687346997', categoryName: '2-男孩蛋糕', productItems: [] },
            { categoryId: '1634302367129657476', categoryName: '3-女神蛋糕', productItems: [] },
            { categoryId: '1634302388959605558', categoryName: '4-男神蛋糕', productItems: [] },
            { categoryId: '1634302403310226908', categoryName: '5-家庭蛋糕', productItems: [] },
            { categoryId: '1634302419875701981', categoryName: '6-情侣蛋糕', productItems: [] },
            { categoryId: '1634302432122635916', categoryName: '7-祝寿蛋糕', productItems: [] },
            { categoryId: '1634302446119593980', categoryName: '8-庆典派对蛋糕', productItems: [] },
        ];

        this.state = {
            birthdayCakeCategorys: KCategorys,
            birthdayCakesRecommend: [],
            debug: 0,
            orderCakeInfoModalVisiable: false,

            /// 蛋糕信息
            cakeName: '',
            creamType: KCreamTypeOptions[0].value,
            cakeSize: KCakeSizeOptions[0].value,
            cakeFillings: [KCakeFillingOptions[0], KCakeFillingOptions[1]],
            candleType: KCandleTypeOptions[0].value,
            cakePlateNumber: KCakePlateNumberOptions[0].value,

            /// 配送信息
            pickUpTime: undefined,
            pickUpType: KPickUpTypeOptions[0].value,
            selfPickUpShop: KSelfPickUpShopOptions[0].value,
            deliverAddress: '',
            pickUpName: '',
            phoneNumber: '',
            remarks: '',

            orderImageModalVisiable: false,
            orderImageSrc: undefined,
            imageCapturing: false
        };

        this._lastKeys = [];
    }

    componentDidMount = async () => {
        let query = this.props.query;
        let debug = query && query.get('debug');

        let birthdayCakesRecommendNew = [];
        let birthdayCakesRecommend = await loadBirthdayCakesRecommend();
        if (birthdayCakesRecommend && birthdayCakesRecommend.length > 0) {
            for (let ii = 0; ii < birthdayCakesRecommend.length; ++ii) {
                let item = birthdayCakesRecommend[ii];
                let itemNew = { ...item };
                itemNew.key = ii + 1;
                birthdayCakesRecommendNew.push(itemNew);
            }
        }
        this.setState({ birthdayCakesRecommend: birthdayCakesRecommendNew, debug: debug });
        // this.updateWeixinConfig();
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
                        console.log(loadResult);

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

                let title = '弯麦蛋糕 | 今年最新蛋糕图册，送给热爱仪式感的你~';
                let desc = '有美味，有颜值，更有内涵，儿童款，女神款，男神款等各种款式等你来挑选哦~';
                let imgUrl = 'http://gratefulwheat.ruyue.xyz/image/弯麦生日蛋糕/image4wechat.jpg';

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

    handleOrderNowTitleClick = () => {
        this.setState({ orderCakeInfoModalVisiable: true });
    }

    handleOrderCakeInfoModalOk = () => {
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
                    });
                })
            }, 0);
        });

        const {
            creamType,
            cakeSize,
            cakeFillings,
            candleType,
            cakePlateNumber,
            pickUpTime,
            pickUpType,
            selfPickUpShop,
            deliverAddress,
            pickUpName,
            phoneNumber,
            remarks
        } = this.state;

        console.log('奶油类型：' + creamType);
        console.log('蛋糕大小：' + cakeSize);
        console.log('蛋糕夹心：' + cakeFillings);
        console.log('蜡烛类型：' + candleType);
        console.log('餐盘数量：' + cakePlateNumber);
        console.log('取货时间：' + pickUpTime);
        console.log('取货方式：' + pickUpType);
        console.log('自取门店：' + selfPickUpShop);
        console.log('配送地址：' + deliverAddress);
        console.log('提货人：' + pickUpName);
        console.log('联系方式：' + phoneNumber);
        console.log('备注：' + remarks);
    }


    handleOrderCakeInfoModalCancel = () => {
        this.setState({ orderCakeInfoModalVisiable: false });
    }

    handleCreamTypeChange = e => {
        this.setState({ creamType: e.target.value });
    }

    handleCakeSizeChange = (value) => {
        this.setState({ cakeSize: value });
    }

    handleCakeFillingChange = (value) => {
        if (value.length >= 3) {
            message.info('只能选择两种夹心!');
            return;
        }

        this.setState({ cakeFillings: value });
    }

    handleCandleTypeChange = (value) => {
        this.setState({ candleType: value });
    }

    handleCakePlateNumberChange = (value) => {
        this.setState({ cakePlateNumber: value });
    }

    handlePickUpTimeChange = data => {
        this.setState({ pickUpTime: data });
    }

    onPickUpTypeChange = e => {
        this.setState({ pickUpType: e.target.value });
    }

    handleSelfPickUpShopChange = (value) => {
        this.setState({ selfPickUpShop: value });
    }

    onChange = list => {
        // setCheckedList(list);
        // setIndeterminate(!!list.length && list.length < KCakeFillingOptions.length);
        // setCheckAll(list.length === KCakeFillingOptions.length);
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
            birthdayCakesRecommend,
            debug,
            pickUpType,
            orderCakeInfoModalVisiable,
            creamType,
            cakeSize,
            cakeFillings,
            candleType,
            cakePlateNumber,
            pickUpTime,
            selfPickUpShop,
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

        return (
            <Spin spinning={imageCapturing} size='large' tip='正在生成订购单...' >
                <div>
                    <Title level={5} style={{
                        textAlign: 'center', marginTop: 0,
                        backgroundColor: '#DAA520', color: 'white',
                        borderRadius: 15, paddingTop: 8, paddingBottom: 8
                    }}>
                        {debug ? `0-新款蛋糕（${birthdayCakesRecommend.length}）` : `0-新款蛋糕`}
                    </Title>
                    {
                        birthdayCakesRecommend.map((item) => {
                            let src = "/image/弯麦生日蛋糕/0-新款蛋糕/" + item.name + '.jpg';
                            return (
                                <div key={item.key} >
                                    <Image preview={false} src={src} />

                                    {debug ? (<Title level={5} style={{
                                        textAlign: 'center', marginTop: 0,
                                        marginLeft: 30, marginRight: 30,
                                        backgroundColor: 'red', color: 'white',
                                        borderRadius: 12, paddingTop: 4, paddingBottom: 4
                                    }} onClick={this.handleOrderNowTitleClick}>
                                        {`立即预定《${item.name}》`}
                                    </Title>) : (<div></div>)}
                                </div>
                            );
                        })
                    }

                    <Collapse
                        bordered={true}
                        expandIcon={({ isActive }) => <RightSquareFilled rotate={isActive ? 90 : 0} />}
                        expandIconPosition='right'
                        onChange={this.handleCollapseOnChange}>
                        {
                            birthdayCakeCategorys.map((item) => {
                                return (
                                    <Panel header=
                                        {
                                            (
                                                <span style={{ color: 'white', fontSize: 16 }}>
                                                    {debug ? `${item.categoryName}（${item.productItems.length}）` : `${item.categoryName}`}
                                                </span>
                                            )
                                        }
                                        style={{ backgroundColor: '#DAA520', borderRadius: 20 }}
                                        key={item.categoryId}
                                        extra={(<span style={{ fontSize: 13, color: 'black' }}>{item.opened ? '点击关闭' : '点击打开'}</span>)}>
                                        <Spin spinning={item.spinning}>
                                            {
                                                item.productItems.map((item1) => {
                                                    let imageSrc = KBrithdayCakeRoot;
                                                    imageSrc += '/';
                                                    imageSrc += item.categoryName;
                                                    imageSrc += '/';
                                                    imageSrc += item1.productName;
                                                    imageSrc += '.jpg';
                                                    return (
                                                        <span key={item1.key} >
                                                            {debug ? (
                                                                <span>
                                                                    <div style={{ color: 'red', fontSize: 14 }}>{item1.productName}</div>
                                                                    <div style={{ color: 'green', fontSize: 12 }}>{`半年内销售数量：${item1.saleNumber}`}</div>
                                                                    <Image preview={false} src={imageSrc} onError={(e) => {
                                                                        /// 图片加载不成功时隐藏
                                                                        e.target.style.display = 'none';
                                                                    }} />
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    <Image preview={false} src={imageSrc} onError={(e) => {
                                                                        /// 图片加载不成功时隐藏
                                                                        e.target.style.display = 'none';
                                                                    }} />
                                                                </span>
                                                            )}
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
                        height: 40, textAlign: 'center', color: 'green',
                        fontSize: 14, fontWeight: "bold", paddingTop: 7
                    }}>
                        <span>添加教育局总店</span>
                        <span style={{ textDecoration: 'underline' }}>
                            <a href="tel:13290768588">13290768588</a>
                        </span>
                        <span> (点击)预定</span>
                    </div>

                    <Modal title="蛋糕订购信息" style={{ top: 0 }}
                        visible={orderCakeInfoModalVisiable}
                        onOk={this.handleOrderCakeInfoModalOk}
                        onCancel={this.handleOrderCakeInfoModalCancel}
                        closable={false} maskClosable={false}>
                        <div style={{ textAlign: 'center', fontSize: 14, marginTop: -15 }}>
                            {`《白雪公主》`}
                        </div>
                        <Divider dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 12 }}>制作</Divider>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <Input.Group>
                                <span>奶油类型：* </span>
                                <Radio.Group
                                    size='large'
                                    options={KCreamTypeOptions}
                                    onChange={this.handleCreamTypeChange}
                                    value={creamType}
                                    optionType='default'
                                />
                            </Input.Group>
                        </div>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <Input.Group>
                                <span>尺寸大小：* </span>
                                <Select defaultValue={cakeSize} style={{ width: 100 }}
                                    onChange={this.handleCakeSizeChange}
                                    options={KCakeSizeOptions}>
                                </Select>
                            </Input.Group>
                        </div>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <span>内部夹心：* </span>
                            <CheckboxGroup options={KCakeFillingOptions} value={cakeFillings} onChange={this.handleCakeFillingChange} />
                        </div>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <span>蜡烛类型：* </span>
                            <Select defaultValue={candleType}
                                style={{ width: 100 }}
                                options={KCandleTypeOptions}
                                onChange={this.handleCandleTypeChange}>
                            </Select>
                        </div>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <span>餐具数量：* </span>
                            <Select defaultValue={cakePlateNumber}
                                style={{ width: 100 }}
                                options={KCakePlateNumberOptions}
                                onChange={this.handleCakePlateNumberChange}>
                            </Select>
                        </div>
                        <Divider dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 12 }}>配送</Divider>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <span>取货时间：* </span>
                            <DatePicker
                                style={{ width: 200 }}
                                showTime={{ format: 'HH:mm' }}
                                value={pickUpTime}
                                onChange={this.handlePickUpTimeChange} />
                        </div>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <span>取货方式：* </span>
                            <Radio.Group
                                size='large'
                                options={KPickUpTypeOptions}
                                onChange={this.onPickUpTypeChange}
                                value={pickUpType}
                                optionType='default'
                            />
                        </div>
                        {
                            pickUpType === KPickUpTypeOptions[0].value ? (
                                <div style={{ marginTop: 8, marginBottom: 8 }}>
                                    <span>自提门店：* </span>
                                    <Select defaultValue={selfPickUpShop} style={{ width: 200 }}
                                        onChange={this.handleSelfPickUpShopChange}
                                        options={KSelfPickUpShopOptions}>
                                    </Select>
                                </div>
                            ) : (
                                <div style={{ marginTop: 8, marginBottom: 8 }}>
                                    <Input.Group>
                                        <span>配送地址：* </span>
                                        <Input style={{ width: 'calc(100% - 80px)' }}
                                            placeholder='请填写配送地址' prefix={<HomeOutlined />}
                                            value={deliverAddress}
                                            onChange={this.handleDeliverAddressChange} />
                                    </Input.Group>
                                </div>
                            )
                        }
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <Input.Group>
                                <span>提货人：* &emsp;</span>
                                <Input style={{ width: 'calc(100% - 80px)' }}
                                    placeholder='请填写提货人姓名'
                                    prefix={<UserOutlined />}
                                    value={pickUpName}
                                    onChange={this.handlePickUpPeopleChange} />
                            </Input.Group>
                        </div>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <Input.Group>
                                <span>联系方式：* </span>
                                <Input style={{ width: 'calc(100% - 80px)' }}
                                    placeholder='请填写提货人手机号'
                                    prefix={<PhoneOutlined />}
                                    value={phoneNumber}
                                    onChange={this.handlePhoneNumberChange} />
                            </Input.Group>
                        </div>
                        <Divider dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 12 }}>其它</Divider>
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <Input.Group>
                                <span>备注：</span>
                                <TextArea style={{ width: 'calc(100% - 0px)' }} rows={3}
                                    placeholder='有特殊要求，请备注' value={remarks}
                                    onChange={this.handleRemarksChange} />
                            </Input.Group>
                        </div>
                    </Modal>

                    <Modal title={
                        <Timeline style={{ marginBottom: -60 }}>
                            <Timeline.Item color='red'>仔细核对图片中订购信息</Timeline.Item>
                            <Timeline.Item color='red'>长按蛋糕订购单图片发送给客服登记</Timeline.Item>
                        </Timeline>
                    } closable={false} maskClosable={false} visible={orderImageModalVisiable} footer={[
                        <Button key='back' onClick={() => {
                            this.setState({ orderImageModalVisiable: false });
                        }}>返回</Button>
                    ]}>
                        <Image preview={false} src={orderImageSrc} />
                    </Modal>

                    {debug && imageCapturing ? (<div ref={(current) => {
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
                                }}>{`《白雪公主》`}</div>
                                <div>
                                    <Image preview={false} src='/image/弯麦生日蛋糕/image4wechat.jpg' />
                                </div>
                            </div>
                            <div style={theRightDivInTheDiv4CaptureStyle}>
                                <Divider dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 12 }}>制作</Divider>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>奶油类型：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{creamType}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>尺寸大小：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{cakeSize}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>内部夹心：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{cakeFillings}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>蜡烛类型：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{candleType}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>餐具数量：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{cakePlateNumber}</span>
                                </div>
                                <Divider dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 12 }}>配送</Divider>
                                <div>
                                    <span style={{ fontSize: 16 }}>取货时间：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{pickUpTime}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>取货方式：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{pickUpType}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>配送地址：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>漳浦县绥安镇府前街西绥安安镇府前街西绥安安镇府前街西绥安安镇府前街西绥安</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>提货人：</span>
                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{pickUpName}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16 }}>联系方式：</span>
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
                </div >
            </Spin>
        )
    }
}

export default birthdayCakeSale;
