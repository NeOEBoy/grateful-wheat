/*
库存管理：查看各门店库存，盘点门店库存，门店互相调货。
*/
import React from 'react';
import moment from 'moment';
import {
    Button, Menu, Dropdown, Table
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import {
    // getTest,
    getAllShopExceptAll,
    getAllCategorysExceptAll
} from '../api/util';
import {
    loadProductsSale,
    wechatSign
} from '../api/api';
/**--------------------配置信息--------------------*/
// const KForTest = getTest();
/// 门店信息
const KAllShopsExceptAll = getAllShopExceptAll();
/// 分类信息
const KAllCategorysExceptAll = getAllCategorysExceptAll();

class ProductStockManagement extends React.Component {
    constructor(props) {
        super(props);
        this._a = 1;

        this.state = {
            stockLoading: false,
            currentShop4StockList: KAllShopsExceptAll[0],
            currentCategory4StockList: KAllCategorysExceptAll[0],
            stockListData: []
        };
    };

    componentDidMount = async () => {
        // await loadElemeProducts();
        await this.fetchStockList();
        this.updateWeixinConfig();
    };

    fetchStockList = async () => {
        try {
            this.setState({
                stockListData: [], stockLoading: true
            }, async () => {
                const { currentShop4StockList, currentCategory4StockList } = this.state;
                let nowMoment = moment();
                let endDateTimeStr = nowMoment.endOf('day').format('YYYY.MM.DD HH:mm:ss');
                let beginDateTimeStr = nowMoment.subtract(3, 'days').startOf('day').format('YYYY.MM.DD HH:mm:ss');
                let loadResult = await loadProductsSale(currentCategory4StockList.categoryId, currentShop4StockList.userId, '1', beginDateTimeStr, endDateTimeStr, 'stock', 'true');
                // console.log(loadResult);
                if (loadResult.errCode === 0) {
                    let list = loadResult.list;
                    this.setState({ stockListData: list, stockLoading: false })
                }
            });
        } catch (err) {
            this.setState({
                stockLoading: false
            });
        }
    };

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

                let title = '弯麦库存管理（内部）';
                let desc = '用于连锁门店库存查看、盘点、调度';
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

    render() {
        const {
            stockLoading,
            currentShop4StockList,
            currentCategory4StockList,
            stockListData
        } = this.state;

        /// 订单列表头配置
        const KStockColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 20, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '条码', dataIndex: 'barcode', productName: 'barcode', width: 60, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '名称', dataIndex: 'productName', productName: 'productName', width: 80, render: (text) => { return <span style={{ fontSize: 12 }}>{text}</span>; } },
            {
                title: '库存', dataIndex: 'stock', productName: 'stock', width: 30, render:
                    (text) => {
                        let fg = 'black';
                        if (text === '0' || text.substring(0, 1) === '-') {
                            fg = 'red';
                        }
                        return <span style={{ fontSize: 16, color: fg }}>{text}</span>;
                    }
            },
        ];

        return (
            <div style={{ marginLeft: 20, marginTop: 5, marginRight: 20 }}>
                <div style={{ fontSize: 15, marginBottom: 5 }}>库存管理</div>
                <Dropdown
                    style={{ marginLeft: 0 }}
                    overlay={
                        () => {
                            return (<Menu onClick={async ({ key }) => {
                                this.setState({ currentShop4StockList: KAllShopsExceptAll[key] }, async () => {
                                    await this.fetchStockList();
                                });
                            }} >
                                {
                                    KAllShopsExceptAll.map((shop) => {
                                        let fg = 'black';
                                        if (shop.name === currentShop4StockList.name) fg = 'red';
                                        return (<Menu.Item key={shop.index} style={{ color: fg }}>
                                            {shop.name}
                                        </Menu.Item>);
                                    })
                                }
                            </Menu>)
                        }
                    } arrow trigger={['click']} disabled={stockLoading}>
                    <Button size="small" style={{ width: 160 }} onClick={e => e.preventDefault()}>
                        {currentShop4StockList.name}
                        <DownOutlined />
                    </Button>
                </Dropdown>

                <Dropdown
                    style={{ marginLeft: 0 }}
                    overlay={
                        () => {
                            return (<Menu onClick={async ({ key }) => {
                                this.setState({ currentCategory4StockList: KAllCategorysExceptAll[key] }, async () => {
                                    await this.fetchStockList();
                                });
                            }} >
                                {
                                    KAllCategorysExceptAll.map((shop) => {
                                        let fg = 'black';
                                        if (shop.name === currentCategory4StockList.name) fg = 'red';
                                        return (<Menu.Item key={shop.index} style={{ color: fg }}>
                                            {shop.name}
                                        </Menu.Item>);
                                    })
                                }
                            </Menu>)
                        }
                    } arrow trigger={['click']} disabled={stockLoading}>
                    <Button size="small" style={{ width: 100 }} onClick={e => e.preventDefault()}>
                        {currentCategory4StockList.name}
                        <DownOutlined />
                    </Button>
                </Dropdown>

                <Table
                    style={{ marginTop: 10 }}
                    size='small'
                    loading={stockLoading}
                    dataSource={stockListData}
                    columns={KStockColumns4Table}
                    pagination={false} bordered
                    footer={() => {
                        return (
                            <div style={{ textAlign: 'center', height: 15, fontSize: 12 }}>
                                {`总共${stockListData.length}项`}
                            </div>
                        )
                    }} />
            </div>
        );
    }
}

export default ProductStockManagement;
