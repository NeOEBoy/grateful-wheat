/*
商品菜单

菜单提取教育局店7日之前有销量的商品
*/

import React from 'react';
import moment from 'moment';
import { RightSquareFilled, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Collapse, Spin, List, Image, Button, Typography, message } from 'antd';
import {
    loadProductsSale,
    wechatSign
} from '../api/api';
import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';
import {
    getPageName4A4Printer,
    getA4PrinterIndex,
} from '../api/util';

const { Title } = Typography;
const { Panel } = Collapse;
const KImageRoot = '/image';

class ProductMenu extends React.Component {
    constructor(props) {
        super(props);

        const KCategorys = [
            { categoryId: '1593049816479739965', categoryName: '现烤面包', productItems: [] },
            { categoryId: '1592989355905414162', categoryName: '西点慕斯蛋糕', productItems: [] },
            { categoryId: '1593049881212199906', categoryName: '常温蛋糕', productItems: [] },
            { categoryId: '1593049854760654816', categoryName: '吐司面包', productItems: [] },
            { categoryId: '1626767161867698544', categoryName: '餐包面包', productItems: [] },
            { categoryId: '1593059349213583584', categoryName: '干点饼干', productItems: [] },
            { categoryId: '1604471906489441680', categoryName: '小蛋糕', productItems: [] },
            { categoryId: '1611200031064132560', categoryName: '小零食', productItems: [] },
            { categoryId: '1615972878471894425', categoryName: '长富常温牛奶', productItems: [] }
        ];

        this.state = {
            foodCategorys: KCategorys,
            orderList: [],
            orderListShow: false,
            orderListTotalPrice: 0,
            orderListTotalCount: 0,
            goOrderViewShow: false,
            orderText: '',
            debug: 0
        };

        this._lastKeys = [];
        this._orderTextArea = undefined;
        this._inputRef = null;
    }

    async componentDidMount() {
        let query = this.props.query;
        let debug = query && query.get('debug');

        this.setState({ debug: debug });
        this.updateWeixinConfig();
    }

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

        const { foodCategorys } = this.state;
        let foodCategorysNew = [...foodCategorys];

        // console.log(keysOpened);
        if (keysOpened.length === 1) {
            try {
                let categoryId = keysOpened[0];
                let birthdayCakeCategoryToAdd;
                for (let ii = 0; ii < foodCategorysNew.length; ++ii) {
                    let birthdayCakeCategory = foodCategorysNew[ii];
                    if (birthdayCakeCategory.categoryId === categoryId) {
                        birthdayCakeCategoryToAdd = birthdayCakeCategory;
                        break;
                    }
                }
                if (birthdayCakeCategoryToAdd) {
                    birthdayCakeCategoryToAdd.opened = true;
                    this.setState({ foodCategorys: foodCategorysNew });
                    if (birthdayCakeCategoryToAdd.productItems.length <= 0 &&
                        !birthdayCakeCategoryToAdd.spinning) {
                        birthdayCakeCategoryToAdd.spinning = true;

                        /// 提取7天之前的数据
                        let nowMoment = moment();
                        let endDateTimeStr = nowMoment.endOf('day').format('YYYY.MM.DD HH:mm:ss');
                        let beginDateTimeStr = nowMoment.subtract(3, 'days').startOf('day').format('YYYY.MM.DD HH:mm:ss');

                        // console.log(beginDateTimeStr);
                        // console.log(endDateTimeStr);

                        /// 教育局店，有销量
                        let loadResult = await loadProductsSale(categoryId, '3995767', '1', beginDateTimeStr, endDateTimeStr);
                        // console.log(loadResult);

                        if (loadResult.errCode === 0 &&
                            loadResult.list.length > 0) {
                            let list = loadResult.list;
                            let newList = [];
                            for (let i = 0; i < list.length; ++i) {
                                let item = { ...list[i] };
                                item.buyNumber = 0;
                                newList.push(item);
                            }

                            newList = newList.sort((a, b) => {
                                return b.saleNumber - a.saleNumber;
                            })

                            birthdayCakeCategoryToAdd.productItems = newList;
                            birthdayCakeCategoryToAdd.spinning = false;
                        }

                        this.setState({ foodCategorys: foodCategorysNew });
                        // console.log(foodCategorysNew);
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
            for (let ii = 0; ii < foodCategorysNew.length; ++ii) {
                let birthdayCakeCategory = foodCategorysNew[ii];
                if (birthdayCakeCategory.categoryId === categoryId) {
                    birthdayCakeCategoryClose = birthdayCakeCategory;
                    break;
                }
            }
            if (birthdayCakeCategoryClose) {
                birthdayCakeCategoryClose.opened = false;
                this.setState({ foodCategorys: foodCategorysNew });
            }
        }

        // console.log('handleCollapseOnChange end');    
    }

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

                let title = '弯麦美食菜单';
                let desc = '有现烤面包，西点慕斯，吐司餐包，小蛋糕，小零食，牛奶等各种美食哦';
                let imgUrl = 'http://gratefulwheat.ruyue.xyz/image/现烤面包/鸡排三明治.jpg';

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

    handleIncreaseItemToCart = (item, categoryName) => {
        item.buyNumber = item.buyNumber + 1;
        this.forceUpdate();

        // console.log(item)
        if (item.buyNumber >= 1) {
            const { orderList } = this.state;

            let newOrderList = [...orderList];
            let existItem;
            for (let i = 0; i < newOrderList.length; ++i) {
                if (newOrderList[i].barcode === item.barcode) {
                    existItem = newOrderList[i];
                    break;
                }
            }

            if (!existItem) {
                let imageSrc = KImageRoot;
                imageSrc += '/';
                imageSrc += categoryName;
                imageSrc += '/';
                imageSrc += item.productName;
                imageSrc += '.jpg';
                item.imageUrl = imageSrc;
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
                let tp = item.price * item.buyNumber;

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
                if (newOrderList[i].barcode === item.barcode) {
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
                let tp = item.price * item.buyNumber;

                tp = this.fixTo2(tp);
                totalPrice += tp;

                totalCount += item.buyNumber;
            }

            totalPrice = this.fixTo2(totalPrice);
            this.setState({ orderListTotalPrice: totalPrice, orderListTotalCount: totalCount });
        }, 0);
    }

    fixTo2 = (num) => {
        let a = 1; let e = 2;
        for (; e > 0; a *= 10, e--);
        for (; e < 0; a /= 10, e++);
        let newNum = Math.round(num * a) / a;
        return newNum;
    }

    getLodopAfterInit = () => {
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            let strStyle =
                `<style>
                </style> `;

            LODOP.SET_PRINTER_INDEX(getA4PrinterIndex(LODOP));
            LODOP.SET_PRINT_PAGESIZE(2, 0, 0, getPageName4A4Printer());
            LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 800, 600, '');
            LODOP.SET_SHOW_MODE("LANDSCAPE_DEFROTATED", 1);//横向时的正向显示
            LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);//打印后自动关闭预览窗口
            LODOP.ADD_PRINT_HTM(0, 0, "100%", '100%', strStyle + document.getElementById("printDiv").innerHTML);
        }

        return LODOP;
    };

    productPrintPreprew = () => {
        let LODOP = this.getLodopAfterInit();

        if (LODOP) {
            LODOP.PREVIEW();
        }
    };

    render() {
        const {
            foodCategorys,
            orderList,
            orderListShow,
            orderListTotalPrice,
            orderListTotalCount,
            goOrderViewShow,
            orderText,
            debug } = this.state;

        let disableOrderButton = false;
        let orderButtonText = '去预定';
        if (orderListTotalPrice < 15) {
            disableOrderButton = true;
            let differ = 15 - orderListTotalPrice;
            differ = this.fixTo2(differ);
            orderButtonText = '差¥' + differ + '起送';
        }

        return (
            <div>
                <div>
                    <Title level={5} style={{
                        backgroundColor: 'transparent',
                        textAlign: 'center', marginTop: 4,
                        color: 'black', paddingTop: 4, paddingBottom: 0
                    }}>
                        微信菜单
                        <button hidden size='small' style={{ float: 'right' }}
                            onClick={this.productPrintPreprew}>
                            打印
                        </button>
                    </Title>
                </div>

                <div id='printDiv'>
                    <Collapse
                        bordered={true}
                        expandIcon={({ isActive }) => <RightSquareFilled rotate={isActive ? 90 : 0} />}
                        expandIconPosition='right'
                        onChange={this.handleCollapseOnChange}>
                        {
                            foodCategorys.map((item) => {
                                return (
                                    <Panel header=
                                        {
                                            (
                                                <span style={{ color: 'white', fontSize: 16 }}>
                                                    {`${item.categoryName}`}
                                                </span>
                                            )
                                        }
                                        style={{ backgroundColor: '#DAA520', borderRadius: 20 }}
                                        key={item.categoryId}
                                        extra={(<span style={{ fontSize: 13, color: 'black' }}>{item.opened ? '点击关闭' : '点击打开'}</span>)}>
                                        <Spin spinning={item.spinning}>
                                            <List
                                                grid={{ gutter: 2, column: 2 }}
                                                dataSource={item.productItems}
                                                renderItem={item1 => {
                                                    let imageSrc = KImageRoot;
                                                    imageSrc += '/';
                                                    imageSrc += item.categoryName;
                                                    imageSrc += '/';
                                                    imageSrc += item1.productName;
                                                    imageSrc += '.jpg';

                                                    // console.log(imageSrc);

                                                    let disableButton = item1.buyNumber <= 0;
                                                    return (
                                                        <List.Item>
                                                            <div>
                                                                <Image preview={true} src={imageSrc} onError={(e) => {
                                                                    /// 图片加载不成功时隐藏
                                                                    e.target.style.display = 'none';
                                                                }} />
                                                                <div style={{
                                                                    paddingLeft: 4,
                                                                    paddingRight: 4,
                                                                    backgroundColor: 'transparent',
                                                                }}>
                                                                    <div style={{
                                                                        fontSize: 14,
                                                                        color: 'black'
                                                                    }}>
                                                                        {item1.productName}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: 8,
                                                                        color: 'gray'
                                                                    }}>
                                                                        {item1.specification}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: 14,
                                                                        color: 'black'
                                                                    }}>
                                                                        <span>
                                                                            ¥
                                                                        </span>
                                                                        <span>
                                                                            {item1.price}
                                                                        </span>
                                                                        <span>
                                                                            /
                                                                        </span>
                                                                        <span>
                                                                            {item1.unit}
                                                                        </span>

                                                                        <span style={{ float: 'right', backgroundColor: 'transparent' }}>
                                                                            {
                                                                                disableButton ? (<span></span>) :
                                                                                    (
                                                                                        <span>
                                                                                            <Button size='small' shape='circle' icon={<MinusOutlined />}
                                                                                                onClick={() => { this.handleDecreaseItemFromCart(item1) }} />
                                                                                        </span>
                                                                                    )
                                                                            }
                                                                            &nbsp;
                                                                            &nbsp;
                                                                            {
                                                                                disableButton ? (<span></span>) :
                                                                                    (
                                                                                        <span>
                                                                                            {item1.buyNumber}
                                                                                        </span>
                                                                                    )
                                                                            }
                                                                            &nbsp;
                                                                            &nbsp;
                                                                            <span>
                                                                                <Button danger size='small' shape='circle' icon={<PlusOutlined />}
                                                                                    onClick={() => { this.handleIncreaseItemToCart(item1, item.categoryName) }} />
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {debug ? (
                                                                    <div style={{ color: 'red', fontSize: 8 }}>
                                                                        <span>三天内销售量：</span>
                                                                        <span>{item1.saleNumber}</span>
                                                                    </div>
                                                                ) : (<div></div>)}
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
                </div>

                <div style={{ height: 60 }}></div>
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
                                    newOrderText += item.productName;
                                    newOrderText += '-';
                                    newOrderText += item.specification;
                                    newOrderText += '  ';
                                    newOrderText += 'x';
                                    newOrderText += '  ';
                                    newOrderText += item.buyNumber;
                                    newOrderText += '\n';
                                }

                                this.setState({ goOrderViewShow: true, orderText: newOrderText });
                            }}>
                            {orderButtonText}
                        </Button>
                    </div>
                </div>
                {
                    orderListShow ? (
                        <div style={{ height: '100%', width: '100%', position: 'fixed', backgroundColor: 'rgba(0, 0, 0, 0.5)', bottom: 60 }} >
                            <div style={{ maxHeight: '65%', overflow: 'scroll', width: '100%', position: 'absolute', backgroundColor: 'white', bottom: 0 }}>
                                <div style={{ marginLeft: 8, marginTop: 6 }}>
                                    <span style={{ fontSize: 8, color: 'black' }}>已选商品</span>
                                    <Button size='small' style={{ float: 'right', right: 4 }} onClick={() => {
                                        this.setState({ orderListShow: false })
                                    }}>收起</Button>
                                </div>
                                <List
                                    itemLayout='vertical'
                                    dataSource={orderList}
                                    renderItem={item => {
                                        // console.log(imageSrc);
                                        let totalPrice = item.price * item.buyNumber;

                                        totalPrice = this.fixTo2(totalPrice)

                                        return (
                                            <div>
                                                <div style={{ margin: 10, height: 70, backgroundColor: 'white' }}>
                                                    <div style={{ float: 'left', width: 70, height: 70 }}>
                                                        <Image style={{ width: 70, height: 70 }}
                                                            preview={false} src={item.imageUrl} />
                                                    </div>

                                                    <div style={{ float: 'left', marginLeft: 10, marginTop: 4 }}>
                                                        <div style={{ fontSize: 12 }}>{item.productName}</div>
                                                        <div style={{ fontSize: 8 }}>{item.specification}</div>

                                                        <div style={{ marginTop: 4 }}>
                                                            <span style={{ fontSize: 4 }}>¥ </span>
                                                            <span style={{ fontSize: 12 }}>{totalPrice}</span>
                                                        </div>
                                                    </div>

                                                    <span style={{ float: 'right', marginTop: 25, backgroundColor: 'transparent' }}>
                                                        {
                                                            (
                                                                <span>
                                                                    <Button size='small' shape='circle' icon={<MinusOutlined />}
                                                                        onClick={() => { this.handleDecreaseItemFromCart(item) }} />
                                                                </span>
                                                            )
                                                        }
                                                        &nbsp;
                                                        &nbsp;
                                                        {
                                                            (
                                                                <span>
                                                                    {item.buyNumber}
                                                                </span>
                                                            )
                                                        }
                                                        &nbsp;
                                                        &nbsp;
                                                        <span>
                                                            <Button danger size='small' shape='circle' icon={<PlusOutlined />}
                                                                onClick={() => { this.handleIncreaseItemToCart(item) }} />
                                                        </span>
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
                {
                    goOrderViewShow ? (
                        <div style={{ height: '100%', width: '100%', position: 'fixed', backgroundColor: 'rgba(0, 0, 0, 0.95)', top: 0 }}>
                            <div style={{ width: '100%', marginTop: 100 }}>
                                <div style={{ fontWeight: 'bold', color: 'white', marginLeft: '5%', marginRight: '5%' }}>订单文字：</div>
                                <textarea onChange={(t) => {
                                    this.setState({ orderText: t.value });
                                }} ref={(node) => {
                                    this._inputRef = node;
                                }} value={orderText} style={{ height: 180, width: '90%', marginTop: 10, marginLeft: '5%', marginRight: '5%' }}>
                                </textarea>
                            </div>

                            <div style={{ color: 'white', marginLeft: '5%', marginRight: '5%', marginTop: 20 }}>
                                1：点击上方输入框，可以修改订单文字，如增加会员电话。
                            </div>

                            <div style={{ color: 'white', marginLeft: '5%', marginRight: '5%' }}>
                                2：点击下方《取消》按钮，可以关闭当前页面。
                            </div>

                            <div style={{ color: 'white', marginLeft: '5%', marginRight: '5%' }}>
                                <span>
                                    3：点击下方《复制订单文字》按钮，会复制上述订单文字，复制完毕后，请返回微信并粘贴订单文字到输入框，发送给
                                </span>
                                <span style={{ textDecoration: 'underline' }}>
                                    <a href="tel:13290768588">13290768588</a>
                                </span>
                                <span>弯麦烘焙（教育局店）微信预定。</span>
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
                                        // console.log(this._inputRef);

                                        this._inputRef.select();
                                        document.execCommand('Copy');
                                        this._inputRef.blur();

                                        message.info('已经复制，请返回微信并粘贴到输入框，发送给弯麦烘焙（教育局店）预定', 10);
                                    }}>复制订单文字</Button>
                                </span>
                            </div>
                        </div>
                    ) : (<div></div>)
                }
            </div>
        );
    }
}

export default ProductMenu;
