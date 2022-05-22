/*
蛋糕图册链接
http://gratefulwheat.ruyue.xyz/birthdayCakeSale?debug=1
debug
1 调试版
0 正式版
*/

import React from 'react';
import moment from 'moment';

import { RightSquareFilled, UserOutlined } from '@ant-design/icons';
import {
    Modal, Collapse, Image, Spin,
    Typography, DatePicker, Radio,
    Select, Input, Checkbox
} from 'antd';
import {
    loadProductsSale,
    loadBirthdayCakesRecommend,
    wechatSign
} from '../api/api';

const { Title } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

const KBrithdayCakeRoot = '/image/弯麦生日蛋糕';

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
            value3: '自提',
            orderCakeInfoModalVisable: false
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

    handleOk = () => {
        this.setState({ orderCakeInfoModalVisable: false });
    }

    handleCancel = () => {
        this.setState({ orderCakeInfoModalVisable: false });
    }

    onChange3 = e => {
        this.setState({
            value3: e.target.value,
        });
    }

    handleChange = (value) => {
        console.log(`selected ${value}`);
    }

    handleOrderTitleClick = () => {
        this.setState({ orderCakeInfoModalVisable: true });
    }

    onChange = list => {
        // setCheckedList(list);
        // setIndeterminate(!!list.length && list.length < plainOptions.length);
        // setCheckAll(list.length === plainOptions.length);
    }

    render() {
        const { birthdayCakeCategorys,
            birthdayCakesRecommend,
            debug,
            value3,
            orderCakeInfoModalVisable,
            checkedList } = this.state;
        const options = [
            { label: 'Apple', value: 'Apple' },
            { label: 'Pear', value: 'Pear' },
            { label: 'Orange', value: 'Orange' },
        ];
        const plainOptions = ['Apple', 'Pear', 'Orange'];

        return (
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
                                {/* <Title level={5} style={{
                                    textAlign: 'center', marginTop: 0,
                                    marginLeft: 30, marginRight: 30,
                                    backgroundColor: 'red', color: 'white',
                                    borderRadius: 12, paddingTop: 4, paddingBottom: 4
                                }} onClick={this.handleOrderTitleClick}>
                                    {`预定《${item.name}》`}
                                </Title> */}
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

                <Modal title="蛋糕订购信息" visible={orderCakeInfoModalVisable}
                    onOk={this.handleOk} onCancel={this.handleCancel}
                    closable={false} maskClosable={false}>
                    <div>
                        <span>取货时间: * </span>
                        <DatePicker picker='date'></DatePicker>
                        <DatePicker picker='time' showTime={{ showMinute: false }}></DatePicker>
                    </div>
                    <div>
                        <span>取货方式: * </span>
                        <Radio.Group
                            options={options}
                            onChange={this.onChange3}
                            value={value3}
                            optionType="button"
                            buttonStyle="solid"
                        />
                    </div>
                    <div>
                        <span>自提门店: * </span>
                        <Select defaultValue="lucy" style={{ width: 120 }} onChange={this.handleChange}>
                            <Option value="jack">Jack</Option>
                            <Option value="lucy">Lucy</Option>
                            <Option value="disabled" disabled>
                                Disabled
                            </Option>
                            <Option value="Yiminghe">yiminghe</Option>
                        </Select>
                    </div>
                    <div>
                        <Input.Group>
                            <span>订购人 : * </span>
                            <Input style={{ width: 'calc(100% - 100px)' }} placeholder='订购人姓名' prefix={<UserOutlined />}></Input>
                        </Input.Group>
                    </div>
                    <div>
                        <Input.Group>
                            <span>联系方式: * </span>
                            <Input style={{ width: 'calc(100% - 100px)' }} placeholder='手机号' prefix={<UserOutlined />}></Input>
                        </Input.Group>
                    </div>
                    <div>
                        <Input.Group>
                            <span>尺寸: * </span>
                            <Input style={{ width: 'calc(100% - 100px)' }} placeholder='尺寸' prefix={<UserOutlined />}></Input>
                        </Input.Group>
                    </div>
                    <div>
                        <span>夹心: * </span>
                        <CheckboxGroup options={plainOptions} value={checkedList} onChange={this.onChange} />
                    </div>
                    <div>
                        <Input.Group>
                            <span>收款金额: * </span>
                            <Input style={{ width: 'calc(100% - 100px)' }} placeholder='收款金额' prefix={<UserOutlined />}></Input>
                        </Input.Group>
                    </div>
                    <div>
                        <span>支付方式: * </span>
                        <Select defaultValue="weixin" style={{ width: 120 }}>
                            <Option value="weixin">微信支付</Option>
                            <Option value="alipay">支付宝支付</Option>
                            <Option value="crash">现金支付</Option>
                        </Select>
                    </div>
                    <div>
                        <span>生日蜡烛: * </span>
                        <Select defaultValue="normal" style={{ width: 120 }}>
                            <Option value="normal">螺纹蜡烛</Option>
                            <Option value="number">数字蜡烛</Option>
                            <Option value="love">爱心蜡烛</Option>
                            <Option value="star">五星蜡烛</Option>
                        </Select>
                    </div>
                    <div>
                        <span>餐具数量: * </span>
                        <Select defaultValue="10" style={{ width: 120 }}>
                            <Option value="5">5</Option>
                            <Option value="10">10</Option>
                            <Option value="15">15</Option>
                            <Option value="20">20</Option>
                            <Option value="25">25</Option>
                            <Option value="30">30</Option>
                        </Select>
                    </div>
                    <div>
                        <Input.Group>
                            <span>其它备注: * </span>
                            <Input style={{ width: 'calc(100% - 100px)' }} placeholder='其它备注' prefix={<UserOutlined />}></Input>
                        </Input.Group>
                    </div>
                </Modal>
            </div>
        )
    }
}

export default birthdayCakeSale;
