/*
商品菜单
*/
import React from 'react';
import { RightSquareFilled, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Collapse, List, Image, Button, message, Modal } from 'antd';
import {
    allBreadInfos,
    wechatSign
} from '../api/api';

const { Panel } = Collapse;
const { confirm } = Modal;

const KImageRoot = '/面包';
const KOrderMiniPrice = 20;

class ProductMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // 主页
            breadRecommend: { name: '', products: [] },
            breadCategorys: [],
            breadProducts: [],

            // 预定
            orderList: [],
            orderListShow: false,
            orderListTotalPrice: 0,
            orderListTotalCount: 0,
            goOrderViewShow: false,
            orderText: '',
            remarkText: '',
        };
    }

    async componentDidMount() {
        const breadInfosObj = await allBreadInfos();
        // console.log('breadInfosObj = ' + JSON.stringify(breadInfosObj));
        this._weixin = breadInfosObj.weixin;

        this.makeRenderItemFunc4Product();
        this.initLocal();

        this.setState({
            breadRecommend: breadInfosObj.recommend,
            breadCategorys: breadInfosObj.categorys,
            breadProducts: breadInfosObj.products,
            orderList: [],
        });
        this.updateWeixinConfig();
    }

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

        const { breadCategorys } = this.state;

        // console.log(keysOpened);
        let categoryIdOpened = keysOpened.length === 1 ? keysOpened[0] : "";
        let categoryIdClosed = keysClosed.length === 1 ? keysClosed[0] : "";

        for (let i = 0; i < breadCategorys.length; ++i) {
            let category = breadCategorys[i];
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
                    'updateTimelineShareData'
                ] // 必填，需要使用的JS接口列表
            });

            let that = this;
            window.wx.ready(function () {
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

    handleIncreaseItemToCart = (item) => {
        item.buyNumber = item.buyNumber + 1;
        this.forceUpdate();

        // console.log(item)
        if (item.buyNumber >= 1) {
            const { orderList } = this.state;

            let newOrderList = [...orderList];
            let existItem;
            for (let i = 0; i < newOrderList.length; ++i) {
                if (newOrderList[i].name === item.name) {
                    existItem = newOrderList[i];
                    break;
                }
            }

            if (!existItem) {
                newOrderList.push(item);
            }

            this.setState({ orderList: newOrderList });
        }

        setTimeout(() => {
            const { orderList } = this.state;
            let totalPrice = 0;
            let totalCount = 0;
            for (let i = 0; i < orderList.length; ++i) {
                let item = orderList[i];
                let tp = item.specification.price * item.buyNumber;

                tp = this.fixTo2(tp);
                totalPrice += tp;

                totalCount += item.buyNumber;
            }

            totalPrice = this.fixTo2(totalPrice);
            this.setState({ orderListTotalPrice: totalPrice, orderListTotalCount: totalCount });
        }, 0);
    }

    handleDecreaseItemFromCart = (item) => {
        item.buyNumber = item.buyNumber - 1;
        this.forceUpdate();

        // console.log(item)
        if (item.buyNumber <= 0) {
            const { orderList } = this.state;

            let newOrderList = [...orderList];
            let existItem;
            for (let i = 0; i < newOrderList.length; ++i) {
                if (newOrderList[i].name === item.name) {
                    existItem = newOrderList[i];
                    break;
                }
            }

            if (existItem) {
                newOrderList.splice(newOrderList.indexOf(existItem), 1);
            }

            this.setState({ orderList: newOrderList });
        }

        setTimeout(() => {
            const { orderList } = this.state;
            let totalPrice = 0;
            let totalCount = 0;
            for (let i = 0; i < orderList.length; ++i) {
                let item = orderList[i];
                let tp = item.specification.price * item.buyNumber;

                tp = this.fixTo2(tp);
                totalPrice += tp;

                totalCount += item.buyNumber;
            }

            totalPrice = this.fixTo2(totalPrice);
            this.setState({ orderListTotalPrice: totalPrice, orderListTotalCount: totalCount });
        }, 0);
    }

    initLocal = () => {
        // 初始化local
        this._lastKeys = [];

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

    makeRenderItemFunc4Product = () => {
        this._renderItemFunc4Product = (product, index) => {
            return (
                <List.Item>
                    <div>
                        <Image style={{ border: '1px dotted #00A2A5', borderRadius: 8 }}
                            preview={true} src={`${product?.images?.[0]}`} />
                        <div style={{
                            paddingTop: 4,
                            paddingLeft: 4,
                            paddingRight: 4,
                            backgroundColor: 'transparent',
                        }}>
                            <div style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'black'
                            }}>
                                {product.name}
                            </div>
                            <div style={{
                                fontSize: 12,
                                color: 'black'
                            }}>
                                {`配料：${product.ingredient}`}
                            </div>
                            <div style={{
                                fontSize: 14,
                                color: 'gray'
                            }}>
                                {`保质期：${product.expirationDate}`}
                            </div>
                            <div style={{
                                fontSize: 10,
                                color: 'gray'
                            }}>
                                {`规格：${product.specification.name}`}
                            </div>
                            <div style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                color: 'black'
                            }}>
                                <span>
                                    {`¥${product.specification.price}/${product.specification.unit}`}
                                </span>
                                <span style={{ float: 'right', backgroundColor: 'transparent' }}>
                                    {
                                        product.buyNumber <= 0 ? (<span></span>) :
                                            (
                                                <span>
                                                    <Button size='small' shape='circle' icon={<MinusOutlined />}
                                                        onClick={() => { this.handleDecreaseItemFromCart(product) }} />
                                                </span>
                                            )
                                    }
                                    &nbsp;
                                    &nbsp;
                                    {
                                        product.buyNumber <= 0 ? (<span></span>) :
                                            (
                                                <span>
                                                    {product.buyNumber}
                                                </span>
                                            )
                                    }
                                    &nbsp;
                                    &nbsp;
                                    <span>
                                        <Button danger size='middle' shape='circle' icon={<PlusOutlined />}
                                            onClick={() => { this.handleIncreaseItemToCart(product) }} />
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </List.Item >
            )
        }
    }

    fixTo2 = (num) => {
        let a = 1; let e = 2;
        for (; e > 0; a *= 10, e--);
        for (; e < 0; a /= 10, e++);
        let newNum = Math.round(num * a) / a;
        return newNum;
    }

    //复制文本
    copyText = (text) => {
        var element = this.createElement(text);
        element.select();
        element.setSelectionRange(0, element.value.length);
        document.execCommand('copy');
        element.remove();
    }

    //创建临时的输入框元素
    createElement = (text) => {
        var isRTL = document.documentElement.getAttribute('dir') === 'rtl';
        var element = document.createElement('textarea');
        // 防止在ios中产生缩放效果
        element.style.fontSize = '12pt';
        // 重置盒模型
        element.style.border = '0';
        element.style.padding = '0';
        element.style.margin = '0';
        // 将元素移到屏幕外
        element.style.position = 'absolute';
        element.style[isRTL ? 'right' : 'left'] = '-9999px';
        // 移动元素到页面底部
        let yPosition = window.pageYOffset || document.documentElement.scrollTop;
        element.style.top = `${yPosition}px`;
        //设置元素只读
        element.setAttribute('readonly', '');
        element.value = text;
        document.body.appendChild(element);
        return element;
    }

    render() {
        const {
            breadRecommend,
            breadCategorys,
            orderList,
            orderListShow,
            orderListTotalPrice,
            orderListTotalCount,
            goOrderViewShow,
            orderText,
            remarkText
        } = this.state;

        let disableOrderButton = false;
        let orderButtonText = '去预定';
        if (orderListTotalPrice < KOrderMiniPrice) {
            disableOrderButton = true;
            let differ = KOrderMiniPrice - orderListTotalPrice;
            differ = this.fixTo2(differ);
            orderButtonText = '差¥' + differ + '起送';
        }

        return (
            <div>
                {/* 头部区域 */}
                <div style={{
                    textAlign: 'center', color: '#00A2A5',
                    fontSize: 16, fontWeight: 'normal', paddingTop: 7, paddingBottom: 5
                }}>
                    <span>
                        <span>联系弯麦总店</span>
                        <span style={{ textDecoration: 'underline' }}>
                            <a href="tel:13290768588">13290768588</a>
                        </span>
                        <span> (微信同号)</span>
                    </span>
                </div>

                {/* 推荐区域 */}
                <div style={{
                    textAlign: 'center', marginTop: 10, fontSize: 16,
                    backgroundColor: '#00A2A5', color: 'white',
                    borderRadius: 30, paddingTop: 8, paddingBottom: 8
                }}>
                    {`${breadRecommend.name}`}
                </div>
                <List style={{ marginLeft: 4, marginRight: 4, marginTop: 4 }}
                    grid={{ gutter: 4, column: this._columnNumber }}
                    dataSource={breadRecommend.products}
                    renderItem={this._renderItemFunc4Product}
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
                    expandIconPosition='right'
                    onChange={this.handleCollapseOnChange}>
                    {
                        breadCategorys.map((category) => {
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
                                                                <Image style={{ marginLeft: 6, width: 44, height: 44, borderRadius: 10 }}
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
                                    grid={{ gutter: 4, column: this._columnNumber }}
                                    dataSource={category.products}
                                    renderItem={this._renderItemFunc4Product} />
                            </Panel>)
                        })
                    }
                </Collapse>

                {/* 底部区域 */}
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
                <div style={{ height: 60 }} />

                {/* 购物车区域 */}
                <div style={{ height: 60, position: 'fixed', backgroundColor: 'white', width: '100%', bottom: 0 }}>
                    <div style={{ float: 'left', marginTop: 4, marginLeft: 8, width: 50, height: 50 }} onClick={() => {
                        this.setState({ orderListShow: !this.state.orderListShow })
                    }}>
                        <Image style={{ width: 50, height: 50 }} preview={false} src={require('../image/shoppingCart.png')} />
                    </div>
                    <div style={{
                        float: 'left', width: 20, height: 16,
                        backgroundColor: 'red', color: 'white',
                        fontSize: 8, textAlign: 'center', borderRadius: 6
                    }}>{orderListTotalCount}</div>
                    <div style={{ float: 'left', marginLeft: 20, marginTop: 15, fontSize: 20, fontWeight: 'bold' }}>
                        <span style={{ fontSize: 4 }}>¥ </span>
                        <span style={{ fontSize: 24 }}>{orderListTotalPrice}</span>
                    </div>

                    <div style={{ float: 'right', marginRight: 10, marginTop: 10 }}>
                        <Button disabled={disableOrderButton} type='primary'
                            shape='round' style={{ width: 120, height: 40 }} onClick={() => {
                                let newOrderText = '';

                                for (let i = 0; i < orderList.length; ++i) {
                                    let item = orderList[i];
                                    newOrderText += item.name;
                                    newOrderText += '  ';
                                    newOrderText += 'X';
                                    newOrderText += '  ';
                                    newOrderText += item.buyNumber;
                                    newOrderText += '\n';
                                }

                                newOrderText += '\n';
                                newOrderText += '共 ';
                                newOrderText += orderListTotalCount;
                                newOrderText += ' 个 | '
                                newOrderText += '计 '
                                newOrderText += orderListTotalPrice
                                newOrderText += ' 元';
                                newOrderText += '\n';

                                this.setState({ goOrderViewShow: true, orderText: newOrderText, remarkText: '' });
                            }}>
                            {orderButtonText}
                        </Button>
                    </div>
                </div>

                {/* 购物车简要商品区域 */}
                {
                    orderListShow ? (
                        <div style={{ height: '100%', width: '100%', position: 'fixed', backgroundColor: 'rgba(0, 0, 0, 0.5)', bottom: 60 }} >
                            <div style={{ maxHeight: '65%', overflow: 'scroll', width: '100%', position: 'absolute', backgroundColor: 'white', bottom: 0 }}>
                                <div style={{ marginLeft: 8, marginTop: 6 }}>
                                    <span style={{ fontSize: 8, color: 'black' }}>已选商品</span>
                                    <Button size='middle' style={{ float: 'right', right: 4 }} onClick={() => {
                                        this.setState({ orderListShow: false })
                                    }}>X</Button>
                                </div>
                                <List
                                    itemLayout='vertical'
                                    dataSource={orderList}
                                    renderItem={item => {
                                        let totalPrice = item.specification.price * item.buyNumber;
                                        totalPrice = this.fixTo2(totalPrice)

                                        return (
                                            <div style={{ margin: 10, height: 100, backgroundColor: 'white' }}>
                                                <div style={{ float: 'left', width: 70, height: 70, marginRight: 10 }}>
                                                    <Image style={{ width: 70, height: 70 }}
                                                        preview={false} src={item?.images?.[0]} />
                                                </div>
                                                <div style={{ marginTop: 0, height: 70 }}>
                                                    <div style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</div>
                                                    <div style={{ fontSize: 8 }}>{item.specification.name}</div>
                                                    <div style={{ marginTop: 4, fontSize: 15, fontWeight: "bold" }}>
                                                        <span>¥ </span>
                                                        <span>{totalPrice}</span>
                                                    </div>
                                                </div>

                                                <div style={{ float: 'right', marginTop: 0, backgroundColor: 'transparent', display: 'inline-block' }}>
                                                    <span>
                                                        <Button size='small' shape='circle' icon={<MinusOutlined />}
                                                            onClick={() => { this.handleDecreaseItemFromCart(item) }} />
                                                    </span>
                                                    &nbsp;
                                                    &nbsp;
                                                    <span style={{ fontSize: 15, fontWeight: "bold" }}>
                                                        {item.buyNumber}
                                                    </span>
                                                    &nbsp;
                                                    &nbsp;
                                                    <span>
                                                        <Button danger size='middle' shape='circle' icon={<PlusOutlined />}
                                                            onClick={() => { this.handleIncreaseItemToCart(item) }} />
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    ) : (<div></div>)
                }

                {/* 购物车详细商品区域 */}
                {
                    goOrderViewShow ? (
                        <div style={{ height: '100%', width: '100%', position: 'fixed', backgroundColor: 'rgba(0, 0, 0, 0.92)', top: 0 }}>
                            <div style={{ width: '100%', marginTop: 20 }}>
                                <div style={{ fontWeight: 'bold', color: 'white', marginLeft: '5%', marginRight: '5%' }}>1：订单信息</div>
                                <textarea placeholder='输入需要的商品和数量' onChange={(t) => {
                                    this.setState({ orderText: t.target.value });
                                }} value={orderText} rows={8} style={{
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    width: '90%', marginTop: 10,
                                    marginLeft: '5%', marginRight: '5%',
                                    paddingLeft: 16, paddingTop: 12,
                                    paddingRight: 16, paddingBottom: 12
                                }}>
                                </textarea>
                            </div>

                            <div style={{ width: '100%', marginTop: 2 }}>
                                <div style={{ fontWeight: 'bold', color: 'white', marginLeft: '5%', marginRight: '5%' }}>2：备注</div>
                                <textarea placeholder='输入备注（班级；姓名；会员电话等等）' onChange={(t) => {
                                    this.setState({ remarkText: t.target.value });
                                }} value={remarkText} rows={1} style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    width: '90%', marginTop: 10,
                                    marginLeft: '5%', marginRight: '5%',
                                    paddingLeft: 12, paddingTop: 8,
                                    paddingRight: 12, paddingBottom: 8
                                }}>
                                </textarea>
                            </div>

                            <div style={{ color: 'white', marginLeft: '5%', marginRight: '5%', marginTop: 12 }}>
                                点击《取消》，取消预定。
                            </div>

                            <div style={{ color: 'white', marginLeft: '5%', marginRight: '5%' }}>
                                点击《复制订单信息和备注》，将复制“订单信息和备注”到剪切板。
                            </div>

                            <div style={{ marginLeft: '5%', width: '100%', marginTop: 20 }}>
                                <span>
                                    <Button danger onClick={() => {
                                        this.setState({ goOrderViewShow: false });
                                    }}>取消</Button>
                                </span>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <span>
                                    <Button type='primary' size='large' onClick={() => {
                                        if (orderText.trim().length <= 0) {
                                            message.error('订单信息为空，请输入！');
                                            return;
                                        }

                                        let allText =
                                            '-----------\n' + orderText +
                                            '-----------\n';

                                        if (remarkText.length > 0) {
                                            allText += remarkText +
                                                '\n-----------\n';
                                        }

                                        this.copyText(allText);

                                        // console.log('orderText = ' + orderText);
                                        let orderTextArray = orderText.split('\n');

                                        confirm({
                                            title:
                                                <div style={{ textAlign: 'center' }}>
                                                    <div>-----------</div>
                                                    {orderTextArray.length > 0 ? orderTextArray.map((text) => {
                                                        return (<div key={Math.floor(Math.random() * 1000)}>{text}</div>);
                                                    }) : <div></div>}
                                                    <div>-----------</div>
                                                    {
                                                        remarkText.length > 0 ? <div>
                                                            <div>{remarkText}</div>
                                                            <div>-----------</div>
                                                        </div> : <div></div>
                                                    }
                                                </div>,
                                            content:
                                                <div style={{ textAlign: 'center' }}>
                                                    “订单信息和备注”已经复制到剪切板，点击《去登记预定》将关闭页面，请将“订单信息和备注”文本粘贴发送给#弯麦总店1号或2号#进行登记预定
                                                </div>,
                                            okText: '去登记预定',
                                            onOk() {
                                                // console.log('OK');
                                                window.wx.closeWindow();
                                            },
                                            onCancel() {
                                                // console.log('Cancel');
                                            },
                                        })
                                    }}>复制订单信息和备注</Button>
                                </span>
                            </div>
                        </div>
                    ) : (<div></div>)
                }
            </div>
        )
    }
}

export default ProductMenu;
