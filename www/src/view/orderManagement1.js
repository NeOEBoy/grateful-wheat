/*
生产 VS 配货
*/
import React from 'react';
import {
    Button, Menu, Dropdown, Space,
    DatePicker, Table, message, Modal
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import {
    getProductOrderList,
    getProductOrderItems
} from '../api/api';
import {
    getWWWHost,
    getAllShop,
    getOrderTemplates,
    getOrderTypes,
    getOrderTimeType,
    getOrderCashiers
} from '../api/util';

const { RangePicker } = DatePicker;

/**--------------------配置信息--------------------*/
/// 门店信息
const KAllShops = getAllShop();
/// 模板信息
const KOrderTemplates = getOrderTemplates();
/// 类型信息
const KOrderTypes = getOrderTypes();
/// 收银员（联营店）
const KOrderCashiers = getOrderCashiers();
/// 订单时间类型
const KOrderTimeType = getOrderTimeType();

const KOrderDetailColumns4Table = [
    { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '条码', dataIndex: 'barcode', key: 'barcode', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '名称', dataIndex: 'orderProductName', key: 'orderProductName', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '规格', dataIndex: 'specification', key: 'specification', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '类别', dataIndex: 'categoryName', key: 'categoryName', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '订货量', dataIndex: 'orderNumber', key: 'orderNumber', width: 80, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '配货价', dataIndex: 'transferPrice', key: 'transferPrice', width: 80, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '总计(元)', dataIndex: 'amount', key: 'amount', width: 80, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
];

class OrderManagement extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            /// 订单列表
            alreadyOrderListData: [],
            alreadyOrderLoading: false,
            currentShop4OrderList: KAllShops[0],
            currentTemplate4OrderList: KOrderTemplates[0],
            currentOrderType4OrderList: KOrderTypes[0],
            currentOrderCashier: KOrderCashiers[0],
            currentOrderTimeType: KOrderTimeType[0],
            beginDateTime4OrderList: moment().startOf('day'),
            endDateTime4OrderList: moment().endOf('day'),
            timePickerOpen4OrderList: false,
            selectedRowKeys4OrderList: [],

            orderDetailData: [],
            orderDetailLoading: false,
            orderDetailModalVisible: false,
            orderDetailDataAmount: 0,
            currentOrderShopName: '',
            currentOrderTime: ''
        };
    }

    componentDidMount() {
        let query = this.props.query;
        let paramValueStr = query && query.get('param');
        this.initFilterByParam(paramValueStr);
        this.fetchOrderList();
    };

    initFilterByParam(param) {
        if (param) {
            param = unescape(param);
            let paramValueObj = JSON.parse(param);
            this.setState({
                currentTemplate4OrderList: paramValueObj.template,
                currentOrderType4OrderList: paramValueObj.orderType,
                currentOrderCashier: paramValueObj.orderCashier,
                currentOrderTimeType: paramValueObj.timeType,
                currentShop4OrderList: paramValueObj.shop,
                beginDateTime4OrderList: moment(paramValueObj.beginDateTime),
                endDateTime4OrderList: moment(paramValueObj.endDateTime)
            });
        }
    }

    makeParamByState() {
        let paramValueObj = {};

        const {
            alreadyOrderListData,
            currentShop4OrderList,
            currentTemplate4OrderList,
            currentOrderType4OrderList,
            currentOrderCashier,
            currentOrderTimeType,
            selectedRowKeys4OrderList,
            beginDateTime4OrderList,
            endDateTime4OrderList } = this.state;
        let alreadyOrderListDataAfterFilter = [];
        for (let ii = 0; ii < alreadyOrderListData.length; ++ii) {
            let orderItem = alreadyOrderListData[ii];
            if (selectedRowKeys4OrderList.indexOf(orderItem.key) === -1) continue;
            alreadyOrderListDataAfterFilter.push(orderItem);
        }

        paramValueObj.orderList = alreadyOrderListDataAfterFilter;
        paramValueObj.template = currentTemplate4OrderList;
        paramValueObj.orderType = currentOrderType4OrderList;
        paramValueObj.orderCashier = currentOrderCashier;
        paramValueObj.timeType = currentOrderTimeType;
        paramValueObj.shop = currentShop4OrderList;
        paramValueObj.beginDateTime = beginDateTime4OrderList;
        paramValueObj.endDateTime = endDateTime4OrderList;

        let paramValueStr = JSON.stringify(paramValueObj);
        let paramStr = 'param=' + escape(paramValueStr);

        return paramStr;
    }

    fetchOrderList = async () => {
        try {
            this.setState({
                alreadyOrderListData: [],
                alreadyOrderLoading: true,
                selectedRowKeys4OrderList: []
            }, async () => {
                const {
                    currentShop4OrderList,
                    currentTemplate4OrderList,
                    currentOrderType4OrderList,
                    currentOrderCashier,
                    currentOrderTimeType,
                    beginDateTime4OrderList,
                    endDateTime4OrderList
                } = this.state;
                let orderList = [];
                let selectedRowKeys = [];
                let beginDateTimeStr = beginDateTime4OrderList.format('YYYY.MM.DD%2BHH:mm:ss');
                let endDateTimeStr = endDateTime4OrderList.format('YYYY.MM.DD%2BHH:mm:ss');
                const productOrder = await getProductOrderList(currentShop4OrderList.userId,
                    currentTemplate4OrderList.templateId, currentOrderTimeType.timeType,
                    beginDateTimeStr, endDateTimeStr);
                // console.log(productOrder);

                if (productOrder && productOrder.errCode === 0) {
                    for (let i = 0; i < productOrder.list.length; ++i) {
                        // 根据订单类型和收银员筛选
                        if ((currentOrderType4OrderList.id === '' && currentOrderCashier.id === '') ||
                            (currentOrderType4OrderList.id === '' && currentOrderCashier.name === productOrder.list[i].orderCashier) ||
                            (currentOrderCashier.id === '' && currentOrderType4OrderList.name === productOrder.list[i].orderType) ||
                            (currentOrderCashier.name === productOrder.list[i].orderCashier && currentOrderType4OrderList.name === productOrder.list[i].orderType)) {
                            orderList.push(productOrder.list[i]);
                        }
                    }

                    orderList = orderList.sort((item1, item2) => {
                        return item1.orderShopIndex - item2.orderShopIndex;
                    });
                    orderList.forEach(order => {
                        order.key = orderList.indexOf(order) + 1;
                        selectedRowKeys.push(order.key);
                    });
                }
                // console.log(selectedRowKeys);

                this.setState({
                    alreadyOrderListData: orderList,
                    selectedRowKeys4OrderList: selectedRowKeys,
                    alreadyOrderLoading: false
                });
            });
        } catch (err) {
            this.setState({ alreadyOrderLoading: false });
        }
    };

    fetchOrderDetail = async (currentOrderId) => {
        try {
            this.setState({ orderDetailData: [], orderDetailLoading: true }, async () => {
                const orderItems = await getProductOrderItems(currentOrderId);
                let list = [];
                if (orderItems && orderItems.errCode === 0 && orderItems.items) {
                    list = orderItems.items;
                }
                let amount = list.reduce((pre, cur) => {
                    let amount = parseFloat(cur.amount)
                    return pre + amount;
                }, 0)
                // console.log('amount = ' + amount)
                this.setState({
                    orderDetailData: list,
                    orderDetailLoading: false,
                    orderDetailDataAmount: amount.toFixed(2)
                });
            });
        } catch (err) {
            this.setState({ orderDetailLoading: false });
        }
    };

    onOrderItemSelectChange = (selectedRowKeys) => {
        // console.log('onOrderItemSelectChange: ', selectedRowKeys);
        this.setState({ selectedRowKeys4OrderList: selectedRowKeys });
    };

    handleProductLabelPrint = async () => {
        window.location.replace(
            getWWWHost() +
            '/productLabelPrinter?' +
            this.makeParamByState());
    };

    // 生产单打印
    handleProductionPrint = () => {
        window.location.replace(
            getWWWHost() +
            '/productionPlanPrinter1?' +
            this.makeParamByState());
    };
    // 配货单打印
    handleDistributionPrint = () => {
        window.location.replace(
            getWWWHost() +
            '/productDistributePrinter1?' +
            this.makeParamByState());
    };

    // handleDistributionInput = () => {
    //     window.location.replace(
    //         getWWWHost() +
    //         '/productDistributeInputer?' +
    //         this.makeParamByState());
    // };

    getDayTip4BeginAndEnd = () => {
        const {
            beginDateTime4OrderList,
            endDateTime4OrderList
        } = this.state;

        let begin = beginDateTime4OrderList;
        let end = endDateTime4OrderList;

        let dayTip = '';

        let todayBegin = moment().startOf('day');
        let todayEnd = moment().endOf('day');

        let yesterdayBegin = moment().subtract(1, 'day').startOf('day');
        let yesterdayEnd = moment().subtract(1, 'day').endOf('day');

        let tomorrowBegin = moment().add(1, 'day').startOf('day');
        let tomorrowEnd = moment().add(1, 'day').endOf('day');

        if (begin.diff(todayBegin, 'milliseconds') === 0 && end.diff(todayEnd) === 0) {
            dayTip = '今天';
        } else if (begin.diff(yesterdayBegin, 'milliseconds') === 0 && end.diff(yesterdayEnd) === 0) {
            dayTip = '昨天';
        } else if (begin.diff(tomorrowBegin, 'milliseconds') === 0 && end.diff(tomorrowEnd) === 0) {
            dayTip = '明天';
        }

        return dayTip;
    };

    handleSetFilter4Production = () => {
        this.setState({
            currentShop4OrderList: KAllShops[0],
            currentOrderType4OrderList: KOrderTypes[0],
            currentOrderCashier: KOrderCashiers[0],
            currentTemplate4OrderList: KOrderTemplates[1],
            currentOrderTimeType: KOrderTimeType[0],
            beginDateTime4OrderList: moment().startOf('day'),
            endDateTime4OrderList: moment().endOf('day')
        }, async () => {
            await this.fetchOrderList();
        })
    }

    handleSetFilter4Distribution = () => {
        this.setState({
            currentShop4OrderList: KAllShops[1],
            currentOrderType4OrderList: KOrderTypes[0],
            currentOrderCashier: KOrderCashiers[0],
            currentTemplate4OrderList: KOrderTemplates[0],
            currentOrderTimeType: KOrderTimeType[0],
            beginDateTime4OrderList: moment().add(0, 'day').startOf('day'),
            endDateTime4OrderList: moment().add(0, 'day').endOf('day')
        }, async () => {
            await this.fetchOrderList();
        })
    }

    handleSetCurrentShopFilter = (info) => {
        this.setState({ currentShop4OrderList: KAllShops[info.key] }, async () => {
            await this.fetchOrderList();
        })
    }

    handleSetCurrentOrderTypeFilter = (info) => {
        this.setState({ currentOrderType4OrderList: KOrderTypes[info.key] }, async () => {
            await this.fetchOrderList();
        })
    }

    handleSetCurrentOrderCashierFilter = (info) => {
        this.setState({ currentOrderCashier: KOrderCashiers[info.key] }, async () => {
            await this.fetchOrderList();
        })
    }

    handleSetCurrentTemplateFilter = (info) => {
        this.setState({ currentTemplate4OrderList: KOrderTemplates[info.key] }, async () => {
            await this.fetchOrderList();
        })
    }

    handleSetCurrentOrderTimeTypeFilter = (info) => {
        this.setState({ currentOrderTimeType: KOrderTimeType[info.key] }, async () => {
            await this.fetchOrderList();
        });
    }

    handleTimePickerOpenChange = (open) => {
        this.setState({ timePickerOpen4OrderList: open })
    }

    handleTimePickerOnOk = (data) => {
        if (data.length >= 2 && data[0] && data[1]) {
            if (data[0] > data[1]) {
                message.info('请输入正确时间！');
                return;
            }

            this.setState({ beginDateTime4OrderList: data[0], endDateTime4OrderList: data[1] },
                () => this.fetchOrderList());
        }
    }

    refreshBeginAndEndDateTime = (begin, end) => {
        this.setState(
            { beginDateTime4OrderList: begin, endDateTime4OrderList: end, timePickerOpen4OrderList: false },
            () => this.fetchOrderList());
    }

    render() {
        const {
            alreadyOrderListData, currentShop4OrderList, currentTemplate4OrderList,
            currentOrderType4OrderList, currentOrderCashier, currentOrderTimeType,
            alreadyOrderLoading, beginDateTime4OrderList, endDateTime4OrderList,
            timePickerOpen4OrderList, selectedRowKeys4OrderList,
            orderDetailData, orderDetailLoading,
            orderDetailDataAmount, orderDetailModalVisible,
            currentOrderShopName, currentOrderTime
        } = this.state;

        const alreadyOrderRowSelection = {
            selectedRowKeys: selectedRowKeys4OrderList,
            onChange: this.onOrderItemSelectChange,
        };

        let disableProductionPrint =
            currentShop4OrderList.userId !== '' ||
            currentOrderType4OrderList.id !== '' ||
            currentOrderCashier.id !== '' ||
            currentTemplate4OrderList.templateId === '' ||
            selectedRowKeys4OrderList.length <= 0;

        let disableDistributionButtonPrint =
            currentShop4OrderList.userId === '' ||
            currentTemplate4OrderList.templateId !== '' ||
            selectedRowKeys4OrderList.length <= 0;

        /// 订单列表头配置
        const KOrderColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '订货门店', dataIndex: 'orderShop', key: 'orderShop', width: 150, render: (text) => { return <span style={{ fontSize: 10, color: 'red' }}>{text}</span>; } },
            { title: '类型 || 联营门店', dataIndex: 'orderType', key: 'orderType', width: 150, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '模板名称', dataIndex: 'templateName', key: 'templateName', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '订货单号', dataIndex: 'orderSerialNumber', key: 'orderSerialNumber', width: 180, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '订货时间', dataIndex: 'orderTime', key: 'orderTime', width: 150, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '期望到货', dataIndex: 'expectTime', key: 'expectTime', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '订货收银员', dataIndex: 'orderCashier', key: 'orderCashier', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '配货门店', dataIndex: 'prepareShop', key: 'prepareShop', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            {
                title: '操作', dataIndex: 'action', key: 'action', width: '80',
                render: (text, record) => {
                    return (
                        <Space size="middle">
                            <Button size='small' onClick={() => {
                                this.setState({
                                    orderDetailModalVisible: true,
                                    currentOrderShopName: record.orderShop,
                                    currentOrderTime: record.orderTime
                                }, () => {
                                    this.fetchOrderDetail(record.orderId);
                                })
                            }}>查看</Button>
                        </Space>
                    )
                }
            },
            { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } }
        ];

        return (
            <div>
                <Modal
                    width={1000}
                    centered
                    keyboard={true}
                    maskClosable={false}
                    title={(
                        <div>
                            <div style={{ color: 'gray', fontSize: 8 }}>{currentOrderShopName}</div>
                            <div style={{ color: 'gray', fontSize: 8 }}>{currentOrderTime}</div>
                        </div>
                    )}
                    visible={orderDetailModalVisible}
                    okText='知道了'
                    cancelButtonProps={{ hidden: true }}
                    onOk={() => {
                        this.setState({ orderDetailModalVisible: false });
                    }}
                    onCancel={() => {
                        this.setState({ orderDetailModalVisible: false });
                    }}>
                    <Table
                        style={{ marginTop: 10 }}
                        size='small'
                        loading={orderDetailLoading}
                        dataSource={orderDetailData}
                        columns={KOrderDetailColumns4Table}
                        pagination={false} bordered
                        scroll={{ y: 400, scrollToFirstRowOnChange: true }}
                        footer={() => {
                            return (
                                <div style={{ textAlign: 'center', height: 15, fontSize: 12 }}>
                                    {`总共 ${orderDetailData.length} 项，总计 ${orderDetailDataAmount} 元`}
                                </div>
                            )
                        }} />
                </Modal>
                {/* 标题 */}
                <div style={{ marginLeft: 30, marginTop: 8, fontSize: 18 }}>
                    <span>生产 VS 配货</span>
                    <span style={{ marginLeft: 30, marginRight: 30 }}>
                        <Button danger onClick={this.handleSetFilter4Production}>生产单</Button>
                        <Button style={{ marginLeft: 6 }} danger onClick={this.handleSetFilter4Distribution}>配货单</Button>
                        <Button disabled style={{ marginLeft: 18 }} onClick={this.handleProductLabelPrint}>标签打印</Button>
                    </span>
                </div>

                {/* 过滤选项 */}
                <div style={{ marginLeft: 30, marginTop: 4, marginRight: 30 }}>
                    <Dropdown
                        overlay={(<Menu onClick={this.handleSetCurrentShopFilter}>
                            {KAllShops.map((shop) => {
                                return (<Menu.Item
                                    key={KAllShops.indexOf(shop)}
                                    style={{ color: shop.name === currentShop4OrderList.name ? 'red' : 'black' }}>
                                    {shop.name}
                                </Menu.Item>);
                            })}
                        </Menu>)} arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 8, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentShop4OrderList.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={(<Menu onClick={this.handleSetCurrentOrderTypeFilter}>
                            {KOrderTypes.map((orderType) => {
                                return (<Menu.Item
                                    key={KOrderTypes.indexOf(orderType)}
                                    style={{ color: orderType.name === currentOrderType4OrderList.name ? 'red' : 'black' }}>
                                    {orderType.name}
                                </Menu.Item>);
                            })}
                        </Menu>)} arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 8, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentOrderType4OrderList.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={(<Menu onClick={this.handleSetCurrentOrderCashierFilter} >
                            {KOrderCashiers.map((cashier) => {
                                return (<Menu.Item
                                    key={KOrderCashiers.indexOf(cashier)}
                                    style={{ color: cashier.name === currentOrderCashier.name ? 'red' : 'black' }}>
                                    {cashier.name}
                                </Menu.Item>);
                            })}
                        </Menu>)} arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 8, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentOrderCashier.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={(<Menu onClick={this.handleSetCurrentTemplateFilter}>
                            {KOrderTemplates.map((template) => {
                                return (<Menu.Item
                                    key={KOrderTemplates.indexOf(template)}
                                    style={{ color: template.name === currentTemplate4OrderList.name ? 'red' : 'black' }}>
                                    {template.name}
                                </Menu.Item>);
                            })}
                        </Menu>)} arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 8, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentTemplate4OrderList.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={(<Menu onClick={this.handleSetCurrentOrderTimeTypeFilter} >
                            {KOrderTimeType.map((timeType) => {
                                return (<Menu.Item
                                    key={KOrderTimeType.indexOf(timeType)}
                                    style={{ color: timeType.name === currentOrderTimeType.name ? 'red' : 'black' }}>
                                    {timeType.name}
                                </Menu.Item>);
                            })}
                        </Menu>)} arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 120, marginLeft: 10, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentOrderTimeType.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <span>{`=>`}</span>
                    <RangePicker
                        open={timePickerOpen4OrderList}
                        onOpenChange={this.handleTimePickerOpenChange}
                        size='small'
                        locale={locale}
                        bordered={true}
                        placeholder={['开始时间', '结束时间']}
                        inputReadOnly={true}
                        disabled={alreadyOrderLoading}
                        value={[
                            moment(beginDateTime4OrderList, 'YYYY-MM-DD+HH:mm:ss'),
                            moment(endDateTime4OrderList, 'YYYY-MM-DD+HH:mm:ss')]}
                        defaultValue={[
                            moment(beginDateTime4OrderList, 'YYYY-MM-DD+HH:mm:ss'),
                            moment(endDateTime4OrderList, 'YYYY-MM-DD+HH:mm:ss')]}
                        showTime={{
                            hideDisabledOptions: true,
                            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                            showTime: true,
                            showHour: true,
                            showMinute: true,
                            showSecond: true
                        }}
                        onOk={this.handleTimePickerOnOk}
                        renderExtraFooter={() => (
                            <div>
                                <Button size="small" type="primary" onClick={() => {
                                    this.refreshBeginAndEndDateTime(
                                        moment().subtract(1, 'day').startOf('day'),
                                        moment().subtract(1, 'day').endOf('day'))
                                }}>昨天</Button>
                                <Button style={{ marginLeft: 10 }} size="small" type="primary" onClick={() => {
                                    this.refreshBeginAndEndDateTime(
                                        moment().startOf('day'),
                                        moment().endOf('day'))
                                }}>今天</Button>
                                <Button style={{ marginLeft: 10 }} size="small" type="primary" onClick={(e) => {
                                    this.refreshBeginAndEndDateTime(
                                        moment().add(1, 'day').startOf('day'),
                                        moment().add(1, 'day').endOf('day'))
                                }}>明天</Button>
                            </div>
                        )}
                    />
                    <span style={{ marginLeft: 5, marginRight: 5, color: 'red', fontSize: 15 }}>
                        {this.getDayTip4BeginAndEnd()}
                    </span>
                    <Button
                        style={{ width: 180, marginLeft: 8, marginTop: 4 }} type='primary'
                        disabled={alreadyOrderLoading}
                        onClick={() => { this.fetchOrderList(); }}>
                        查询订货单
                    </Button>

                    <Table style={{ marginTop: 10 }}
                        size='small'
                        loading={alreadyOrderLoading}
                        dataSource={alreadyOrderListData}
                        columns={KOrderColumns4Table}
                        rowSelection={alreadyOrderRowSelection}
                        pagination={false}
                        bordered
                        scroll={{ scrollToFirstRowOnChange: true }}
                        title={() => {
                            return (
                                <div style={{ height: 50, fontSize: 16 }}>
                                    <span>{`总共 `}</span>
                                    <span style={{ fontSize: 24, color: 'green' }}>{`${alreadyOrderListData.length}`}</span>
                                    <span>{` 项，已选 `}</span>
                                    <span style={{ fontSize: 24, color: 'red' }}>{`${selectedRowKeys4OrderList.length}`}</span>
                                    <span>{` 项`}</span>
                                    <Button danger disabled={disableProductionPrint} type='primary'
                                        onClick={this.handleProductionPrint}
                                        style={{ width: 160, height: 30, marginLeft: 20, marginTop: 2 }}>
                                        打印生产单
                                    </Button>
                                    <Button danger disabled={disableDistributionButtonPrint} type='primary'
                                        onClick={this.handleDistributionPrint}
                                        style={{ width: 160, height: 30, marginLeft: 20, marginTop: 10 }}>
                                        打印配货单&标签
                                    </Button>
                                </div>
                            )
                        }} />
                </div>
            </div >
        );
    }
}

export default OrderManagement;
