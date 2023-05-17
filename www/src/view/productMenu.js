/*
商品菜单

菜单提取教育局店5日之前有销量的商品
*/

import React from 'react';
import moment from 'moment';
import { RightSquareFilled, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Collapse, Spin, List, Image, Button, message, Modal } from 'antd';
import TextLoop from "react-text-loop";
import {
    loadFoodsRecommend,
    loadProductsSale,
    loadBreadAll,
    wechatSign
} from '../api/api';

const { Panel } = Collapse;
const { confirm } = Modal;

const KImageRoot = '/image/面包牛奶';

const KCategorys = [{
    categoryId: '1656244666392267569', categoryName: '小饮料', description: '特选特饮，夏季必备',
    thumbnail: `${KImageRoot}/小饮料/杨枝甘露特饮.jpg`, productItems: []
}, {
    categoryId: '1593049881212199906', categoryName: '常温蛋糕', description: '鸡蛋糕点、回味无穷',
    thumbnail: `${KImageRoot}/常温蛋糕/轻乳酪芝士蛋糕.jpg`, productItems: []
}, {
    categoryId: '1604471906489441680', categoryName: '小蛋糕', description: '小小仪式、快乐永远',
    thumbnail: `${KImageRoot}/小蛋糕/水果蛋糕(5寸).jpg`, productItems: []
}, {
    categoryId: '1593049816479739965', categoryName: '现烤面包', description: '新鲜现烤、美味无限',
    thumbnail: `${KImageRoot}/现烤面包/芝士鸡排三明治.jpg`, productItems: []
}, {
    categoryId: '1592989355905414162', categoryName: '西点慕斯', description: '甜点慕斯、烦恼拜拜',
    thumbnail: `${KImageRoot}/西点慕斯/雪媚娘(芒果+草莓).jpg`, productItems: []
}, {
    categoryId: '1593049854760654816', categoryName: '吐司面包', description: '切片吐司、片片留香',
    thumbnail: `${KImageRoot}/吐司面包/纯奶拉丝小吐司.jpg`, productItems: []
}, {
    categoryId: '1626767161867698544', categoryName: '餐包面包', description: '圆圆餐包、生活美满',
    thumbnail: `${KImageRoot}/餐包面包/椰奶餐包.jpg`, productItems: []
}, {
    categoryId: '1593059349213583584', categoryName: '干点饼干', description: '饼干茶点、惬意午后',
    thumbnail: `${KImageRoot}/干点饼干/牛油曲奇饼干.jpg`, productItems: []
}, {
    categoryId: '1652965113501744892', categoryName: '中式糕点', description: '传统糕点，经典传承',
    thumbnail: `${KImageRoot}/中式糕点/牛舌Q饼（香芋味）.jpg`, productItems: []
}, {
    categoryId: '1615972878471894425', categoryName: '长富常温牛奶', description: '精品牛奶、强壮身体',
    thumbnail: `${KImageRoot}/长富常温牛奶/长富高钙牛奶.jpg`, productItems: []
}];

class ProductMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            foodsRecommendTitle: '最新商品',
            foodsRecommendItems: {},
            foodsRecommendLoading: true,
            foodCategorys: KCategorys,
            orderList: [],
            orderListShow: false,
            orderListTotalPrice: 0,
            orderListTotalCount: 0,
            goOrderViewShow: false,
            orderText: '',
            remarkText: '',
            debug: 0
        };

        this._lastKeys = [];
        this._breadAll = [];
    }

    async componentDidMount() {
        let query = this.props.query;
        let debug = query && query.get('debug');

        if (this._breadAll.length <= 0) {
            this._breadAll = await loadBreadAll();
        }

        // console.log(this._breadAll);
        let foodsRecommend = await loadFoodsRecommend();

        let recommendTitle = foodsRecommend.recommendTitle;
        let foodsRecommendItems = foodsRecommend.recommendItems;
        let foodsRecommendItemsNew = {};
        for (let ii = 0; ii < foodsRecommendItems.length; ++ii) {
            let recommendItem = foodsRecommendItems[ii];

            let keys = Object.keys(this._breadAll);
            for (let jj = 0; jj < keys.length; ++jj) {
                let name4allItem = keys[jj];
                if (recommendItem === name4allItem) {
                    foodsRecommendItemsNew[name4allItem] = this._breadAll[name4allItem];
                    foodsRecommendItemsNew[name4allItem].buyNumber = 0;
                    foodsRecommendItemsNew[name4allItem].disable = false;
                }
            }
        }

        // console.log('recommendTitle = ' + recommendTitle);
        // console.log('foodsRecommendItemsNew = ' + JSON.stringify(foodsRecommendItemsNew));

        this.setState({
            foodsRecommendTitle: recommendTitle,
            foodsRecommendItems: foodsRecommendItemsNew,
            foodsRecommendLoading: false,
            debug: debug
        });

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

        const { foodCategorys, foodsRecommendItems } = this.state;
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

                        /// 提取5天之前的数据
                        let nowMoment = moment();
                        let endDateTimeStr = nowMoment.endOf('day').format('YYYY.MM.DD HH:mm:ss');
                        let beginDateTimeStr = nowMoment.subtract(5, 'days').startOf('day').format('YYYY.MM.DD HH:mm:ss');

                        // console.log(beginDateTimeStr);
                        // console.log(endDateTimeStr);

                        /// 教育局店，有销量
                        let loadResult = await loadProductsSale(categoryId, ['3995767', '4382444'], '1', beginDateTimeStr, endDateTimeStr, 'barcode', 'true');
                        // console.log(loadResult);

                        if (loadResult.errCode === 0) {
                            let list = loadResult.list;
                            let newList = [];
                            for (let i = 0; i < list.length; ++i) {
                                let item = { ...list[i] };

                                let foodsRecommendKeys = Object.keys(foodsRecommendItems);
                                // console.log('foodsRecommendKeys = ' + JSON.stringify(foodsRecommendKeys));
                                let ignore = false;
                                for (let j = 0; j < foodsRecommendKeys.length; ++j) {
                                    if (item.productName === foodsRecommendKeys[j]) {
                                        ignore = true;
                                        break;
                                    }
                                }

                                if (ignore) {
                                    continue;
                                }

                                item.buyNumber = 0;
                                item.disable = false;
                                item['配料'] = '-';
                                item['规格'] = '-';
                                item['价格'] = 0;
                                if (this._breadAll[item.productName]) {
                                    item['配料'] = this._breadAll[item.productName]['配料'] ? this._breadAll[item.productName]['配料'] : '-';
                                    item['规格'] = this._breadAll[item.productName]['规格'] ? this._breadAll[item.productName]['规格'] : '-';
                                    item['价格'] = this._breadAll[item.productName]['价格'] ? this._breadAll[item.productName]['价格'] : 0;
                                }
                                newList.push(item);
                            }

                            newList = newList.sort((a, b) => {
                                return b.saleNumber - a.saleNumber;
                            })

                            birthdayCakeCategoryToAdd.productItems = newList;
                        }
                        birthdayCakeCategoryToAdd.spinning = false;

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

                let title = '弯麦面包牛奶饮料电子菜单，不定期更新，点击预定';
                let desc = '现烤面包，西点慕斯，常温蛋糕，吐司餐包，小蛋糕，小饮料，牛奶等美食~';
                let imgUrl = 'http://gratefulwheat.ruyue.xyz/image/面包牛奶/现烤面包/芝士鸡排三明治.jpg';

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
                let tp = item["价格"] * item.buyNumber;

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
                let tp = item["价格"] * item.buyNumber;

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
            foodsRecommendTitle,
            foodsRecommendItems,
            foodsRecommendLoading,
            foodCategorys,
            orderList,
            orderListShow,
            orderListTotalPrice,
            orderListTotalCount,
            goOrderViewShow,
            orderText,
            remarkText,
            debug } = this.state;

        let disableOrderButton = false;
        let orderButtonText = '去预定';
        if (orderListTotalPrice < 20) {
            disableOrderButton = true;
            let differ = 20 - orderListTotalPrice;
            differ = this.fixTo2(differ);
            orderButtonText = '差¥' + differ + '起送';
        }

        return (
            <div>
                <div style={{
                    textAlign: 'center', color: '#B9B973',
                    fontSize: 16, fontWeight: 'normal', paddingTop: 7, paddingBottom: 5
                }}>
                    <TextLoop springConfig={{ stiffness: 70, damping: 31 }}
                        adjustingSpeed={500}>
                        <span>
                            <span>联系弯麦总店</span>
                            <span style={{ textDecoration: 'underline' }}>
                                <a href="tel:13290768588">13290768588</a>
                            </span>
                            <span> (微信同号)</span>
                        </span>
                        <span>为避免商品缺货，最好提前1天预定...</span>
                    </TextLoop>
                </div>

                <div style={{
                    textAlign: 'center', marginTop: 0, fontSize: 20,
                    backgroundColor: '#DAA520', color: 'white',
                    borderRadius: 30, paddingTop: 8, paddingBottom: 8
                }}>
                    {debug ? `${foodsRecommendTitle}（${Object.keys(foodsRecommendItems).length}）`
                        : `${foodsRecommendTitle}`}
                </div>
                <Spin spinning={foodsRecommendLoading} size='large'>
                    <List
                        style={{ marginLeft: 6, marginRight: 6, marginTop: 6 }}
                        grid={{ gutter: 2, column: 2 }}
                        dataSource={Object.keys(foodsRecommendItems)}
                        renderItem={item => {
                            let item1 = foodsRecommendItems[item];
                            let imageSrc = KImageRoot;
                            imageSrc += '/';
                            imageSrc += item1["分类"];
                            imageSrc += '/';
                            imageSrc += item;
                            imageSrc += '.jpg';

                            let disableButton = item1.buyNumber <= 0;
                            return (
                                <List.Item>
                                    <div>
                                        <Image preview={true} src={imageSrc}
                                            fallback={`${KImageRoot}/暂时缺货.jpg`}
                                            onError={(e) => {
                                                /// 图片加载不成功时隐藏
                                                // e.target.style.display = 'none';
                                                item1.disable = true;
                                                this.forceUpdate();
                                            }} />
                                        <div style={{
                                            paddingTop: 4,
                                            paddingLeft: 4,
                                            paddingRight: 4,
                                            backgroundColor: 'transparent',
                                        }}>
                                            <div style={{
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                                color: 'black',
                                            }}>
                                                {item}
                                            </div>
                                            <div style={{
                                                fontSize: 12,
                                                color: 'black'
                                            }}>
                                                {`配料：${item1['配料']}`}
                                            </div>
                                            <div style={{
                                                fontSize: 8,
                                                color: 'gray'
                                            }}>
                                                {`规格：${item1['规格']}`}
                                            </div>
                                            <div style={{
                                                fontSize: 15,
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}>
                                                <span>
                                                    ¥
                                                </span>
                                                <span>
                                                    {item1["价格"]}
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
                                                        <Button disabled={item1.disable} danger size='middle' shape='circle' icon={<PlusOutlined />}
                                                            onClick={() => { this.handleIncreaseItemToCart(item1, item1["分类"]) }} />
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
                                        {debug ? (
                                            <div style={{ color: 'red', fontSize: 8 }}>
                                                <span>{item1.barcode}</span>
                                            </div>
                                        ) : (<div></div>)}
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
                    更多商品请点击下方分类查看
                </div>

                <Collapse
                    bordered={true}
                    expandIcon={({ isActive }) => <RightSquareFilled style={{ color: 'whitesmoke' }} rotate={isActive ? 90 : 0} />}
                    expandIconPosition='right'
                    onChange={this.handleCollapseOnChange}>
                    {
                        foodCategorys.map((item) => {
                            return (
                                <Panel header=
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
                                    style={{ backgroundColor: '#DAA520', borderRadius: 40 }}
                                    key={item.categoryId}
                                    extra={(<span style={{ fontSize: 13, color: 'whitesmoke' }}>{item.opened ? '点击关闭' : '点击打开'}</span>)}>
                                    <Spin spinning={item.spinning}>
                                        <List
                                            style={{ marginLeft: -8, marginRight: -8, marginTop: -8 }}
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
                                                            <Image preview={true} src={imageSrc}
                                                                fallback={`${KImageRoot}/暂时缺货.jpg`}
                                                                onError={(e) => {
                                                                    /// 图片加载不成功时隐藏
                                                                    // e.target.style.display = 'none';
                                                                    item1.disable = true;
                                                                    this.forceUpdate();
                                                                }} />
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
                                                                    {item1.productName}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: 12,
                                                                    color: 'black'
                                                                }}>
                                                                    {`配料：${item1['配料']}`}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: 8,
                                                                    color: 'gray'
                                                                }}>
                                                                    {`规格：${item1['规格']}`}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: 15,
                                                                    fontWeight: 'bold',
                                                                    color: 'black'
                                                                }}>
                                                                    <span>
                                                                        ¥
                                                                    </span>
                                                                    <span>
                                                                        {item1["价格"]}
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
                                                                            <Button disabled={item1.disable} danger size='middle' shape='circle' icon={<PlusOutlined />}
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
                                                            {debug ? (
                                                                <div style={{ color: 'red', fontSize: 8 }}>
                                                                    <span>{item1.barcode}</span>
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
                                        let totalPrice = item["价格"] * item.buyNumber;

                                        totalPrice = this.fixTo2(totalPrice)

                                        return (
                                            <div>
                                                <div style={{ margin: 10, height: 70, backgroundColor: 'white' }}>
                                                    <div style={{ float: 'left', width: 70, height: 70 }}>
                                                        <Image style={{ width: 70, height: 70 }}
                                                            preview={false} src={item.imageUrl} />
                                                    </div>

                                                    <div style={{ float: 'left', marginLeft: 10, marginTop: 4 }}>
                                                        <div style={{ fontSize: 16, fontWeight: "bold" }}>{item.productName}</div>
                                                        <div style={{ fontSize: 8 }}>{item.specification}</div>

                                                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: "bold" }}>
                                                            <span>¥ </span>
                                                            <span>{totalPrice}</span>
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
                                                                <span style={{ fontSize: 15, fontWeight: "bold" }}>
                                                                    {item.buyNumber}
                                                                </span>
                                                            )
                                                        }
                                                        &nbsp;
                                                        &nbsp;
                                                        <span>
                                                            <Button danger size='middle' shape='circle' icon={<PlusOutlined />}
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
                                                        return (<div key={text}>{text}</div>);
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
        );
    }
}

export default ProductMenu;
