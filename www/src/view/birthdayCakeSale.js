import React from 'react';

import { RightSquareFilled } from '@ant-design/icons';
import { Collapse, Image, Spin, Typography } from 'antd';
import {
    loadProductsSale,
    loadBirthdayCakesRecommend,
    wechatSign
} from '../api/api';

const { Title } = Typography;
const { Panel } = Collapse;
const KBrithdayCakeRoot = '/image/弯麦-生日蛋糕-压缩版';

class birthdayCakeSale extends React.Component {
    constructor(props) {
        super(props);

        const KCategorys = [
            { categoryId: '1634302334442115588', categoryName: '弯麦儿童蛋糕', productItems: [] },
            { categoryId: '1634302367129657476', categoryName: '弯麦女神蛋糕', productItems: [] },
            { categoryId: '1634302388959605558', categoryName: '弯麦男神蛋糕', productItems: [] },
            { categoryId: '1634302403310226908', categoryName: '弯麦家庭蛋糕', productItems: [] },
            { categoryId: '1634302419875701981', categoryName: '弯麦情侣蛋糕', productItems: [] },
            { categoryId: '1634302432122635916', categoryName: '弯麦祝寿蛋糕', productItems: [] },
            { categoryId: '1634302446119593980', categoryName: '弯麦庆典派对蛋糕', productItems: [] },
        ];

        this.state = {
            birthdayCakeCategorys: KCategorys,
            birthdayCakesRecommend: [],
            debug: 0
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

                        let loadResult = await loadProductsSale(categoryId);
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
                let imgUrl = 'http://gratefulwheat.ruyue.xyz/image/弯麦-生日蛋糕-压缩版/image4wechat.jpg';

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
        const { birthdayCakeCategorys, birthdayCakesRecommend, debug } = this.state;

        return (
            <div>
                <Title level={5} style={{
                    textAlign: 'center', marginTop: 0,
                    backgroundColor: '#DAA520', color: 'white',
                    borderRadius: 15, paddingTop: 8, paddingBottom: 8
                }}>
                    {debug ? `弯麦热销蛋糕（${birthdayCakesRecommend.length}）` : `弯麦热销蛋糕`}
                </Title>
                {
                    birthdayCakesRecommend.map((item) => {
                        let src = "/image/弯麦-生日蛋糕-压缩版/弯麦热销蛋糕/" + item.name + '.jpg';
                        return (<Image src={src} key={item.key} />);
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
                                                                <Image src={imageSrc} onError={(e) => {
                                                                    /// 图片加载不成功时隐藏
                                                                    e.target.style.display = 'none';
                                                                }} />
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                <Image src={imageSrc} onError={(e) => {
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
                    fontSize: 14, fontWeight: "lighter", paddingTop: 7
                }}>
                    <span>添加教育局总店</span>
                    <span style={{ textDecoration: 'underline' }}>
                        <a href="tel:13290768588">13290768588</a>
                    </span>
                    <span> (点击)预定</span>
                </div>
            </div>
        )
    }
}

export default birthdayCakeSale;
