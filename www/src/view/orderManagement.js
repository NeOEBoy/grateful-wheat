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
    getProductFlowList,
    getFlowDetail,
    refuseStockFlow,
    confirmStockFlow,
    getProductOrderItems
} from '../api/api';
import {
    getTest,
    getAllShop,
    getAllOrderShopName,
    getOrderTemplates,
    getOrderTypes,
    getOrderTimeType,
    getAllOrderTemplateName,
    getFlowType,
    getOrderCashiers
} from '../api/util';

const { RangePicker } = DatePicker;

/**--------------------配置信息--------------------*/
const KForTest = getTest();

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
/// 报货门店名字
const KAllOrderShopName = getAllOrderShopName();
/// 报货模板名字
const KAllOrderTemplateName = getAllOrderTemplateName();
/// 货单类型
const KFlowType = getFlowType();

class OrderManagement extends React.Component {
    constructor(props) {
        super(props);

        let beginDateTime4OrderList4init = moment().startOf('day');
        let endDateTime4OrderList4init = moment().endOf('day');
        if (KForTest) {
            beginDateTime4OrderList4init = moment().subtract(1, 'day').startOf('day');
            endDateTime4OrderList4init = moment().subtract(1, 'day').endOf('day');
        }

        let beginDateTime4FlowList4init = moment().startOf('day');
        let endDateTime4FlowList4init = moment().endOf('day');

        this.state = {
            /// 订单列表
            alreadyOrderListData: [],
            alreadyOrderLoading: false,
            currentShop4OrderList: KAllShops[7],
            currentTemplate4OrderList: KOrderTemplates[0],
            currentOrderType4OrderList: KOrderTypes[0],
            currentOrderCashier: KOrderCashiers[0],
            currentOrderTimeType: KOrderTimeType[0],
            beginDateTime4OrderList: beginDateTime4OrderList4init,
            endDateTime4OrderList: endDateTime4OrderList4init,
            timePickerOpen4OrderList: false,
            selectedRowKeys4OrderList: [],
            noyetOrderShops: [],
            noyetOrderTemplates: [],

            orderDetailData: [],
            orderDetailLoading: false,
            orderDetailModalVisible: false,

            /// 货流管理
            currentShop4FlowList: KAllShops[0],
            currentFlowType: KFlowType[0],
            beginDateTime4FlowList: beginDateTime4FlowList4init,
            endDateTime4FlowList: endDateTime4FlowList4init,
            timePickerOpen4FlowList: false,
            flowListData: [],
            flowListLoading: false,

            /// 货流详情
            flowDetailData: [],
            flowDetailLoading: false,
            flowDetailModalVisible: false,

            refuseFlowLoading: false,
            confirmFlowLoading: false,
            baseShopUnHandleFlowSNs: [],
            allShopUnHandleFlowSNs: []
        };

        this._currentFlowId = '';
        this._currentFlowDetailStatus = [];
        this._currentFlowConfirmText = '';
        this._currentFlowRefuseText = '';
        this._currentTransferFrom = '';
        this._currentTransferTo = '';
        this._currentFlowType = '';
    }

    async componentDidMount() {
        let query = this.props.query;
        let paramValueStr = query && query.get('param');
        // console.log(paramValueStr);
        if (paramValueStr) {
            paramValueStr = unescape(paramValueStr);
            // console.log(paramValueStr);
            let paramValueObj = JSON.parse(paramValueStr);

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

        await this.fetchOrderList();
        await this.fetchFlowList();
    };

    fetchOrderList = async () => {
        try {
            this.setState({
                alreadyOrderListData: [], alreadyOrderLoading: true, selectedRowKeys4OrderList: []
            }, async () => {
                const { currentShop4OrderList, currentTemplate4OrderList,
                    currentOrderType4OrderList, currentOrderCashier, currentOrderTimeType,
                    beginDateTime4OrderList, endDateTime4OrderList } = this.state;
                let orderList = [];
                let keys = [];
                let noyetOrderShops = KAllOrderShopName;
                let noyetOrderTemplates = KAllOrderTemplateName;
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
                    let alreadyOrderShops = [];
                    let alreadyOrderTemplates = [];
                    orderList.forEach(order => {
                        order.key = orderList.indexOf(order) + 1;
                        keys.push(order.key);

                        if (alreadyOrderShops.indexOf(order.orderShop) === -1) {
                            alreadyOrderShops.push(order.orderShop);
                        }
                        if (alreadyOrderTemplates.indexOf(order.templateName) === -1) {
                            alreadyOrderTemplates.push(order.templateName);
                        }
                    });

                    noyetOrderShops = [];
                    KAllOrderShopName.forEach(orderItem => {
                        if (alreadyOrderShops.indexOf(orderItem) === -1) {
                            noyetOrderShops.push(orderItem);
                        }
                    });
                    noyetOrderTemplates = [];
                    KAllOrderTemplateName.forEach(orderItem => {
                        if (alreadyOrderTemplates.indexOf(orderItem) === -1) {
                            noyetOrderTemplates.push(orderItem);
                        }
                    });
                }
                // console.log(keys);

                this.setState({
                    alreadyOrderListData: orderList,
                    selectedRowKeys4OrderList: keys,
                    alreadyOrderLoading: false,
                    noyetOrderShops: noyetOrderShops,
                    noyetOrderTemplates: noyetOrderTemplates
                });
            });
        } catch (err) {
            this.setState({
                alreadyOrderLoading: false
            });
        }
    };

    fetchFlowList = async () => {
        try {
            this.setState({ flowListLoading: true }, async () => {
                const { currentShop4FlowList, currentFlowType,
                    beginDateTime4FlowList, endDateTime4FlowList } = this.state;

                let flowList = [];
                let beginDateTimeStr = beginDateTime4FlowList.format('YYYY.MM.DD%2BHH:mm:ss');
                let endDateTimeStr = endDateTime4FlowList.format('YYYY.MM.DD%2BHH:mm:ss');
                const flowListResult = await getProductFlowList(currentShop4FlowList.userId, currentFlowType.flowTypeId, beginDateTimeStr, endDateTimeStr);
                // console.log(flowListResult);

                let baseShopUnHandleFlowSNsTemp = [];
                let allShopUnHandleFlowSNsTemp = [];
                if (flowListResult && flowListResult.errCode === 0) {
                    flowList = flowListResult.list;

                    flowList.forEach(element => {
                        let transferStatus = element.transferStatus;
                        let flowType = element.flowType;
                        if (flowType === '调货单' || flowType === '调拨退货单') {
                            if (transferStatus[1].length <= 0 &&
                                transferStatus[0].indexOf('已拒绝出货') === -1) {
                                allShopUnHandleFlowSNsTemp.push(element.key);
                                if (element.transferTo === '弯麦(总部)') {
                                    baseShopUnHandleFlowSNsTemp.push(element.key);
                                }
                            }
                        }
                    });
                }

                this.setState({
                    flowListData: flowList,
                    flowListLoading: false,
                    baseShopUnHandleFlowSNs: baseShopUnHandleFlowSNsTemp,
                    allShopUnHandleFlowSNs: allShopUnHandleFlowSNsTemp
                });
            });
        } catch (err) {
            this.setState({
                flowListLoading: false
            });
        }
    };

    fetchFlowDetail = async () => {
        try {
            this.setState({ flowDetailData: [], flowDetailLoading: true }, async () => {
                let flowDetailResult = await getFlowDetail(this._currentFlowId);
                let list = [];
                if (flowDetailResult && flowDetailResult.errCode === 0) {
                    list = flowDetailResult.list;
                    // console.log(list);
                }

                this.setState({ flowDetailData: list, flowDetailLoading: false });
            });
        } catch (err) {
            this.setState({ flowDetailLoading: false });
        }
    };

    fetchOrderDetail = async () => {
        try {
            this.setState({ orderDetailData: [], orderDetailLoading: true }, async () => {
                const orderItems = await getProductOrderItems(this._currentOrderId);
                let list = [];
                if (orderItems && orderItems.errCode === 0 && orderItems.items) {
                    list = orderItems.items;
                }

                this.setState({ orderDetailData: list, orderDetailLoading: false });
            });
        } catch (err) {
            this.setState({ orderDetailLoading: false });
        }
    };

    onOrderItemSelectChange = (selectedRowKeys) => {
        // console.log('onOrderItemSelectChange: ', selectedRowKeys);
        this.setState({ selectedRowKeys4OrderList: selectedRowKeys });
    };

    handleProductionPrint = async (e) => {
        // console.log('handleProductionPrint e' + e);

        let paramValueObj = {};

        const { alreadyOrderListData, currentShop4OrderList, currentTemplate4OrderList, currentOrderType4OrderList, currentOrderCashier,
            currentOrderTimeType, selectedRowKeys4OrderList, beginDateTime4OrderList, endDateTime4OrderList } = this.state;
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
        // console.log('paramValueStr = ' + paramValueStr);

        let paramStr = 'param=' + escape(paramValueStr);
        // console.log(paramStr);

        let productionPlanPrinterUrl = 'http://localhost:4000/productionPlanPrinter';
        if (!KForTest) productionPlanPrinterUrl = 'http://gratefulwheat.ruyue.xyz/productionPlanPrinter';

        productionPlanPrinterUrl += '?';
        productionPlanPrinterUrl += paramStr;
        /// 采用覆盖方式跳转新页面，不产生历史记录
        window.location.replace(productionPlanPrinterUrl);
    };

    handleDistributionPrint = async (e) => {
        // console.log('handleDistributionPrint e' + e);

        let paramValueObj = {};

        const { alreadyOrderListData, currentTemplate4OrderList, currentOrderType4OrderList, currentOrderCashier,
            currentOrderTimeType, currentShop4OrderList, beginDateTime4OrderList, endDateTime4OrderList,
            selectedRowKeys4OrderList } = this.state;
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
        // console.log('paramValueStr = ' + paramValueStr);

        let paramStr = 'param=' + escape(paramValueStr);
        // console.log(paramStr);

        let productDistributePrinterUrl = 'http://localhost:4000/productDistributePrinter';
        if (!KForTest) productDistributePrinterUrl = 'http://gratefulwheat.ruyue.xyz/productDistributePrinter';

        productDistributePrinterUrl += '?';
        productDistributePrinterUrl += paramStr;
        window.location.replace(productDistributePrinterUrl);
    };

    handleDistributionInput = async (e) => {
        // console.log('handleDistributionInput e' + e);

        let paramValueObj = {};

        const { alreadyOrderListData, currentTemplate4OrderList, currentOrderType4OrderList, currentOrderCashier,
            currentShop4OrderList, currentOrderTimeType, beginDateTime4OrderList,
            endDateTime4OrderList, selectedRowKeys4OrderList } = this.state;
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
        // console.log('paramValueStr = ' + paramValueStr);

        let paramStr = 'param=' + escape(paramValueStr);
        // console.log(paramStr);

        let productionPlanInputerUrl = 'http://localhost:4000/productDistributeInputer';
        if (!KForTest) productionPlanInputerUrl = 'http://gratefulwheat.ruyue.xyz/productDistributeInputer';

        productionPlanInputerUrl += '?';
        productionPlanInputerUrl += paramStr;
        window.location.replace(productionPlanInputerUrl);
    };

    getDayTip = (begin, end) => {
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

    render() {
        const {
            alreadyOrderListData, currentShop4OrderList, currentTemplate4OrderList,
            currentOrderType4OrderList, currentOrderCashier, currentOrderTimeType,
            alreadyOrderLoading, beginDateTime4OrderList, endDateTime4OrderList,
            timePickerOpen4OrderList, selectedRowKeys4OrderList, noyetOrderShops,
            noyetOrderTemplates, currentShop4FlowList, flowListData, flowListLoading,
            currentFlowType, beginDateTime4FlowList, endDateTime4FlowList,
            timePickerOpen4FlowList, flowDetailModalVisible, flowDetailData, flowDetailLoading,
            refuseFlowLoading, confirmFlowLoading, baseShopUnHandleFlowSNs, allShopUnHandleFlowSNs,
            orderDetailData, orderDetailLoading, orderDetailModalVisible
        } = this.state;

        const alreadyOrderRowSelection = {
            selectedRowKeys: selectedRowKeys4OrderList,
            onChange: this.onOrderItemSelectChange,
        };

        let noYetOrderShopNames = '无';
        if (noyetOrderShops && noyetOrderShops.length > 0) {
            noYetOrderShopNames = noyetOrderShops.join(' | ');
        }
        let disableProductionPrint =
            currentShop4OrderList.userId !== '' ||
            currentOrderType4OrderList.id !== '' ||
            currentOrderCashier.id !== '' ||
            currentTemplate4OrderList.templateId === '' ||
            selectedRowKeys4OrderList.length <= 0;

        let notyetOrderShopInfoShow = currentShop4OrderList.userId === '';

        let noYetOrderTemplateNames = '无';
        if (noyetOrderTemplates && noyetOrderTemplates.length > 0) {
            noYetOrderTemplateNames = noyetOrderTemplates.join(' | ');
        }
        let disableDistributionButtonPrint =
            currentShop4OrderList.userId === '' ||
            currentTemplate4OrderList.templateId !== '' ||
            selectedRowKeys4OrderList.length <= 0;
        let notyetOrderTemplateInfoShow = currentTemplate4OrderList.templateId === '';

        let disableSubmitButton =
            currentShop4OrderList.userId === '' ||
            currentTemplate4OrderList.templateId !== '' ||
            alreadyOrderLoading;

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
                            <Button size='small' onClick={(e) => {
                                this._currentOrderId = record.orderId;
                                this._currentOrderShopName = record.orderShop;
                                this._currentOrderTime = record.orderTime;
                                this.setState({ orderDetailModalVisible: true }, () => {
                                    this.fetchOrderDetail();
                                })
                            }}>查看</Button>
                        </Space>
                    )
                }
            },
            { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } }
        ];

        /// 货流管理列表头配置
        const KFlowListColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '货流单号', dataIndex: 'flowNumber', key: 'flowNumber', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '下单时间', dataIndex: 'flowTime', key: 'flowTime', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '货单类型', dataIndex: 'flowType', key: 'flowType', width: 80, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '出货方', dataIndex: 'transferFrom', key: 'transferFrom', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            {
                title: '进货方', dataIndex: 'transferTo', key: 'transferTo', width: 100,
                render: (text) => {
                    let fg = text === '弯麦(总部)' ? 'red' : 'black';
                    return <span style={{ fontSize: 10, color: fg }}>{text}</span>;
                }
            },
            {
                title: '状态', dataIndex: 'transferStatus', key: 'transferStatus', width: 320,
                render: (text, record) => {
                    let bg = 'transparent';
                    let bg0 = 'transparent';
                    let fg0 = 'gray';
                    let bg1 = 'transparent';
                    let fg1 = 'gray';
                    if (record.flowType === '调货单' ||
                        record.flowType === '调拨退货单') {
                        bg0 = (text[1] || text[0].indexOf('已拒绝出货') !== -1) ? 'transparent' : 'yellow';
                        fg0 = (text[1] || text[0].indexOf('已拒绝出货') !== -1) ? 'gray' : 'black';
                        bg1 = text[1].indexOf('已拒绝收货') === -1 ? 'transparent' : 'red';
                        fg1 = text[1].indexOf('已拒绝收货') === -1 ? 'gray' : 'white';
                    }

                    return (
                        <div style={{ backgroundColor: bg }}>
                            <div style={{ fontSize: 6, color: fg0, backgroundColor: bg0 }}>{text[0]}</div>
                            <div style={{ fontSize: 6, color: fg1, backgroundColor: bg1 }}>{text[1]}</div>
                        </div>
                    )
                }
            },
            {
                title: '操作', dataIndex: 'action', key: 'action', width: 80,
                render: (text, record) => {
                    return (
                        <Space size="middle">
                            <Button size='small' onClick={(e) => {
                                this._currentFlowId = record.flowId;
                                this._currentFlowDetailStatus = record.transferStatus;
                                this._currentTransferFrom = record.transferFrom;
                                this._currentTransferTo = record.transferTo;
                                this._currentFlowType = record.flowType;
                                this.setState({ flowDetailModalVisible: true }, () => {
                                    this.fetchFlowDetail();
                                })
                            }}>查看</Button>
                        </Space>
                    )
                }
            },
            { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } }
        ];

        const KFlowDetailColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '条码', dataIndex: 'barcode', key: 'barcode', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '名称', dataIndex: 'name', key: 'name', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '类别', dataIndex: 'categoryName', key: 'categoryName', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '出货量', dataIndex: 'transferNumber', key: 'transferNumber', width: 80, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '单位', dataIndex: 'unitName', key: 'unitName', width: 60, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '规格', dataIndex: 'specification', key: 'specification', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '销售价', dataIndex: 'sellPrice', key: 'sellPrice', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
        ];

        const KOrderDetailColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '条码', dataIndex: 'barcode', key: 'barcode', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '名称', dataIndex: 'orderProductName', key: 'orderProductName', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '规格', dataIndex: 'specification', key: 'specification', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '类别', dataIndex: 'categoryName', key: 'categoryName', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '订货量', dataIndex: 'orderNumber', key: 'orderNumber', width: 80, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
        ];

        let showAction = false;
        if (this._currentFlowType === '调货单' ||
            this._currentFlowType === '调拨退货单') {
            if (this._currentFlowDetailStatus[0].length > 0 &&
                this._currentFlowDetailStatus[1].length <= 0) {
                if (this._currentFlowDetailStatus[0].indexOf('待确认出货') !== -1) {
                    this._currentFlowConfirmText = '确认出货';
                    this._currentFlowRefuseText = '拒绝出货';
                    showAction = true;
                } else if (this._currentFlowDetailStatus[0].indexOf('已完成出货') !== -1) {
                    this._currentFlowConfirmText = '确认收货';
                    this._currentFlowRefuseText = '拒绝收货';
                    showAction = true;
                }
            }
        }

        return (
            <div>
                <div style={{ marginLeft: 30, marginTop: 8, fontSize: 18 }}>
                    <span>生产 VS 配货</span>
                    <span style={{ marginLeft: 30, marginTop: 0, marginRight: 30, marginBottom: 0 }}>
                        <Button danger onClick={() => {
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
                        }}>生产单</Button>
                        <Button style={{ marginLeft: 6 }} danger onClick={() => {
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
                        }}>配货单</Button>
                        <Button style={{ marginLeft: 6 }} danger onClick={() => {
                            this.setState({
                                currentShop4OrderList: KAllShops[3],
                                currentOrderType4OrderList: KOrderTypes[0],
                                currentOrderCashier: KOrderCashiers[0],
                                currentTemplate4OrderList: KOrderTemplates[0],
                                currentOrderTimeType: KOrderTimeType[1],
                                beginDateTime4OrderList: moment().startOf('day'),
                                endDateTime4OrderList: moment().endOf('day')
                            }, async () => {
                                await this.fetchOrderList();
                            })
                        }}>配货</Button>
                    </span>
                </div>
                <div style={{ zIndex: 2, bottom: 0, left: 0, right: 0, position: 'fixed', width: '100%', height: 140, backgroundColor: 'lightgray' }}>
                    <div>
                        <Button danger disabled={disableProductionPrint} type='primary'
                            onClick={this.handleProductionPrint}
                            style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                            打印生产单
                        </Button>
                        {
                            notyetOrderShopInfoShow ? (<span>
                                <span style={{ marginLeft: 10, color: 'tomato', fontSize: 8 }}>未报货门店:</span>
                                <span style={{ marginLeft: 5, color: 'red', fontSize: 14, fontWeight: 'bold' }}>{noYetOrderShopNames}</span>
                            </span>) : (<span></span>)
                        }
                    </div>
                    <div>
                        <Button danger disabled={disableDistributionButtonPrint} type='primary'
                            onClick={this.handleDistributionPrint}
                            style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                            打印配货单
                        </Button>
                        {
                            notyetOrderTemplateInfoShow ? (<span>
                                <span style={{ marginLeft: 10, color: 'tomato', fontSize: 8 }}>未报货模板:</span>
                                <span style={{ marginLeft: 5, color: 'red', fontSize: 14, fontWeight: 'bold' }}>{noYetOrderTemplateNames}</span>
                            </span>) : (<span></span>)
                        }
                    </div>
                    <div>
                        <Button danger disabled={disableSubmitButton} type='primary'
                            onClick={this.handleDistributionInput}
                            style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                            开始配货
                        </Button>
                    </div>
                </div>
                <div style={{ marginLeft: 30, marginTop: 4, marginRight: 30, marginBottom: 0 }}>
                    <Dropdown
                        overlay={
                            () => {
                                return (<Menu onClick={async ({ key }) => {
                                    this.setState({ currentShop4OrderList: KAllShops[key] }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }} >
                                    {
                                        KAllShops.map((shop) => {
                                            let fg = 'black';
                                            if (shop.name === currentShop4OrderList.name) fg = 'red';
                                            return (<Menu.Item key={shop.index} style={{ color: fg }}>
                                                {shop.name}
                                            </Menu.Item>);
                                        })
                                    }
                                </Menu>)
                            }
                        } arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 8, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentShop4OrderList.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={
                            () => {
                                return (<Menu onClick={async ({ key }) => {
                                    this.setState({ currentOrderType4OrderList: KOrderTypes[key] }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }} >
                                    {
                                        KOrderTypes.map((shop) => {
                                            let fg = 'black';
                                            if (shop.name === currentOrderType4OrderList.name) fg = 'red';
                                            return (<Menu.Item key={shop.index} style={{ color: fg }}>
                                                {shop.name}
                                            </Menu.Item>);
                                        })
                                    }
                                </Menu>)
                            }
                        } arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 8, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentOrderType4OrderList.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={
                            () => {
                                return (<Menu onClick={async ({ key }) => {
                                    this.setState({ currentOrderCashier: KOrderCashiers[key] }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }} >
                                    {
                                        KOrderCashiers.map((cashier) => {
                                            let fg = 'black';
                                            if (cashier.name === currentOrderCashier.name) fg = 'red';
                                            return (<Menu.Item key={cashier.index} style={{ color: fg }}>
                                                {cashier.name}
                                            </Menu.Item>);
                                        })
                                    }
                                </Menu>)
                            }
                        } arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 8, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentOrderCashier.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={
                            () => {
                                return (<Menu onClick={async ({ key }) => {
                                    this.setState({ currentTemplate4OrderList: KOrderTemplates[key] }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }} >
                                    {
                                        KOrderTemplates.map((template) => {
                                            let fg = 'black';
                                            if (template.name === currentTemplate4OrderList.name) fg = 'red';
                                            return (<Menu.Item key={template.index} style={{ color: fg }}>
                                                {template.name}
                                            </Menu.Item>);
                                        })
                                    }
                                </Menu>)
                            }
                        } arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 8, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentTemplate4OrderList.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={
                            () => {
                                return (<Menu onClick={async ({ key }) => {
                                    this.setState({ currentOrderTimeType: KOrderTimeType[key] }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }} >
                                    {
                                        KOrderTimeType.map((timeType) => {
                                            let fg = 'black';
                                            if (timeType.name === currentOrderTimeType.name) fg = 'red';
                                            return (<Menu.Item key={timeType.index} style={{ color: fg }}>
                                                {timeType.name}
                                            </Menu.Item>);
                                        })
                                    }
                                </Menu>)
                            }
                        } arrow trigger={['click']} disabled={alreadyOrderLoading}>
                        <Button size="small" style={{ width: 120, marginLeft: 10, marginTop: 4 }} onClick={e => e.preventDefault()}>
                            {currentOrderTimeType.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <span>{`=>`}</span>
                    <RangePicker
                        open={timePickerOpen4OrderList}
                        onOpenChange={(open) => {
                            this.setState({ timePickerOpen4OrderList: open });
                        }}
                        style={{ marginTop: 4 }}
                        size='small'
                        locale={locale}
                        bordered={true}
                        placeholder={['开始时间', '结束时间']}
                        inputReadOnly={true}
                        disabled={alreadyOrderLoading}
                        value={[moment(beginDateTime4OrderList, 'YYYY-MM-DD+HH:mm:ss'),
                        moment(endDateTime4OrderList, 'YYYY-MM-DD+HH:mm:ss')]}
                        defaultValue={[moment(beginDateTime4OrderList, 'YYYY-MM-DD+HH:mm:ss'),
                        moment(endDateTime4OrderList, 'YYYY-MM-DD+HH:mm:ss')]}
                        showTime={{
                            hideDisabledOptions: true,
                            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                            showTime: true,
                            showHour: true,
                            showMinute: true,
                            showSecond: true
                        }}
                        onOk={async (data) => {
                            if (data.length >= 2 && data[0] && data[1]) {
                                if (data[0] > data[1]) {
                                    message.info('请输入正确时间');
                                    return;
                                }
                                this.setState({ beginDateTime4OrderList: data[0], endDateTime4OrderList: data[1] }, async () => {
                                    await this.fetchOrderList();
                                });
                            }
                        }}
                        renderExtraFooter={() => (
                            <span>
                                <Button size="small" type="primary" onClick={(e) => {
                                    let yesterdayBegin = moment().subtract(1, 'day').startOf('day');
                                    let yesterdayEnd = moment().subtract(1, 'day').endOf('day');
                                    // console.log(yesterdayBegin);
                                    // console.log(yesterdayEnd);

                                    this.setState({ beginDateTime4OrderList: yesterdayBegin, endDateTime4OrderList: yesterdayEnd, timePickerOpen4OrderList: false }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }}>
                                    昨天
                                </Button>
                                <Button style={{ marginLeft: 10 }} size="small" type="primary" onClick={(e) => {
                                    let yesterdayBegin = moment().startOf('day');
                                    let yesterdayEnd = moment().endOf('day');
                                    // console.log(yesterdayBegin);
                                    // console.log(yesterdayEnd);

                                    this.setState({ beginDateTime4OrderList: yesterdayBegin, endDateTime4OrderList: yesterdayEnd, timePickerOpen4OrderList: false }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }}>
                                    今天
                                </Button>
                                <Button style={{ marginLeft: 10 }} size="small" type="primary" onClick={(e) => {
                                    let yesterdayBegin = moment().add(1, 'day').startOf('day');
                                    let yesterdayEnd = moment().add(1, 'day').endOf('day');
                                    // console.log(yesterdayBegin);
                                    // console.log(yesterdayEnd);

                                    this.setState({ beginDateTime4OrderList: yesterdayBegin, endDateTime4OrderList: yesterdayEnd, timePickerOpen4OrderList: false }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }}>
                                    明天
                                </Button>
                            </span>
                        )}
                    />
                    <span style={{ marginLeft: 5, marginRight: 5, color: 'red', fontSize: 15 }}>
                        {this.getDayTip(beginDateTime4OrderList, endDateTime4OrderList)}
                    </span>
                    <Button
                        style={{ width: 180, marginLeft: 8, marginTop: 4 }} type='primary'
                        disabled={alreadyOrderLoading}
                        onClick={async (e) => { await this.fetchOrderList(); }}>
                        查询订货单
                    </Button>
                    <Table
                        style={{ marginTop: 10 }}
                        size='small'
                        loading={alreadyOrderLoading}
                        dataSource={alreadyOrderListData}
                        columns={KOrderColumns4Table}
                        rowSelection={alreadyOrderRowSelection}
                        pagination={false} bordered
                        scroll={{ y: 150, scrollToFirstRowOnChange: true }}
                        footer={() => {
                            return (
                                <div style={{ textAlign: 'center', height: 15, fontSize: 12 }}>
                                    {`总共${alreadyOrderListData.length}项`}
                                </div>
                            )
                        }} />
                </div>
                <div style={{ marginLeft: 30, marginTop: 10, marginRight: 30, marginBottom: 30 }}>
                    <Dropdown
                        style={{ marginLeft: 0 }}
                        overlay={
                            () => {
                                return (<Menu onClick={async ({ key }) => {
                                    this.setState({ currentShop4FlowList: KAllShops[key] }, async () => {
                                        await this.fetchFlowList();
                                    });
                                }} >
                                    {
                                        KAllShops.map((shop) => {
                                            let fg = 'black';
                                            if (shop.name === currentShop4FlowList.name) fg = 'red';
                                            return (<Menu.Item key={shop.index} style={{ color: fg }}>
                                                {shop.name}
                                            </Menu.Item>);
                                        })
                                    }
                                </Menu>)
                            }
                        } arrow trigger={['click']} disabled={flowListLoading}>
                        <Button size="small" style={{ width: 160 }} onClick={e => e.preventDefault()}>
                            {currentShop4FlowList.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <Dropdown
                        overlay={
                            () => {
                                return (<Menu onClick={async ({ key }) => {
                                    this.setState({ currentFlowType: KFlowType[key] }, async () => {
                                        await this.fetchFlowList();
                                    });
                                }} >
                                    {
                                        KFlowType.map((flow) => {
                                            let fg = 'black';
                                            if (flow.name === currentFlowType.name) fg = 'red';
                                            return (<Menu.Item key={flow.index} style={{ color: fg }}>
                                                {flow.name}
                                            </Menu.Item>);
                                        })
                                    }
                                </Menu>)
                            }
                        } arrow trigger={['click']} disabled={flowListLoading}>
                        <Button size="small" style={{ width: 160, marginLeft: 10 }} onClick={e => e.preventDefault()}>
                            {currentFlowType.name}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                    <RangePicker
                        open={timePickerOpen4FlowList}
                        onOpenChange={(open) => {
                            this.setState({ timePickerOpen4FlowList: open });
                        }}
                        style={{ marginLeft: 10 }}
                        size='small'
                        locale={locale}
                        bordered={true}
                        placeholder={['开始时间', '结束时间']}
                        inputReadOnly={true}
                        disabled={flowListLoading}
                        value={[moment(beginDateTime4FlowList, 'YYYY-MM-DD+HH:mm:ss'),
                        moment(endDateTime4FlowList, 'YYYY-MM-DD+HH:mm:ss')]}
                        defaultValue={[moment(beginDateTime4FlowList, 'YYYY-MM-DD+HH:mm:ss'),
                        moment(endDateTime4FlowList, 'YYYY-MM-DD+HH:mm:ss')]}
                        showTime={{
                            hideDisabledOptions: true,
                            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                            showTime: true,
                            showHour: true,
                            showMinute: true,
                            showSecond: true
                        }}
                        onOk={async (data) => {
                            if (data.length >= 2 && data[0] && data[1]) {
                                if (data[0] > data[1]) {
                                    message.info('请输入正确时间');
                                    return;
                                }
                                this.setState({ beginDateTime4FlowList: data[0], endDateTime4FlowList: data[1] }, async () => {
                                    await this.fetchFlowList();
                                });
                            }
                        }}
                        renderExtraFooter={() => (
                            <div>
                                <span>
                                    <Button size="small" type="primary" onClick={(e) => {
                                        let yesterdayBegin = moment().subtract(1, 'day').startOf('day');
                                        let yesterdayEnd = moment().subtract(1, 'day').endOf('day');
                                        // console.log(yesterdayBegin);
                                        // console.log(yesterdayEnd);

                                        this.setState({
                                            beginDateTime4FlowList: yesterdayBegin,
                                            endDateTime4FlowList: yesterdayEnd,
                                            timePickerOpen4FlowList: false
                                        }, async () => {
                                            await this.fetchFlowList();
                                        });
                                    }}>
                                        昨天
                                    </Button>
                                    <Button style={{ marginLeft: 10 }} size="small" type="primary" onClick={(e) => {
                                        let yesterdayBegin = moment().startOf('day');
                                        let yesterdayEnd = moment().endOf('day');
                                        // console.log(yesterdayBegin);
                                        // console.log(yesterdayEnd);

                                        this.setState({
                                            beginDateTime4FlowList: yesterdayBegin,
                                            endDateTime4FlowList: yesterdayEnd,
                                            timePickerOpen4FlowList: false
                                        }, async () => {
                                            await this.fetchFlowList();
                                        });
                                    }}>
                                        今天
                                    </Button>
                                    <Button style={{ marginLeft: 10 }} size="small" type="primary" onClick={(e) => {
                                        let yesterdayBegin = moment().month(moment().month() - 1).startOf('month');
                                        let yesterdayEnd = moment().month(moment().month() - 1).endOf('month');
                                        // console.log(yesterdayBegin);
                                        // console.log(yesterdayEnd);

                                        this.setState({
                                            beginDateTime4FlowList: yesterdayBegin,
                                            endDateTime4FlowList: yesterdayEnd,
                                            timePickerOpen4FlowList: false
                                        }, async () => {
                                            await this.fetchFlowList();
                                        });
                                    }}>
                                        上月
                                    </Button>
                                </span>

                                <div>
                                    <div>
                                        <span>本月</span>
                                        <Button style={{ marginLeft: 5 }}
                                            size="small" type="primary" onClick={(e) => {
                                                let yesterdayBegin = moment().startOf('month');
                                                let yesterdayEnd = moment().startOf('month').add(9, 'days').endOf('day');
                                                // console.log(yesterdayBegin);
                                                // console.log(yesterdayEnd);

                                                this.setState({
                                                    beginDateTime4FlowList: yesterdayBegin,
                                                    endDateTime4FlowList: yesterdayEnd,
                                                    timePickerOpen4FlowList: false
                                                }, async () => {
                                                    await this.fetchFlowList();
                                                });
                                            }}>1~10</Button>
                                        <Button style={{ marginLeft: 5 }}
                                            size="small" type="primary" onClick={(e) => {
                                                let yesterdayBegin = moment().startOf('month').add(10, 'days');
                                                let yesterdayEnd = moment().startOf('month').add(19, 'days').endOf('day');
                                                // console.log(yesterdayBegin);
                                                // console.log(yesterdayEnd);

                                                this.setState({
                                                    beginDateTime4FlowList: yesterdayBegin,
                                                    endDateTime4FlowList: yesterdayEnd,
                                                    timePickerOpen4FlowList: false
                                                }, async () => {
                                                    await this.fetchFlowList();
                                                });
                                            }}>11~20</Button>
                                        <Button style={{ marginLeft: 5 }}
                                            size="small" type="primary" onClick={(e) => {
                                                let yesterdayBegin = moment().startOf('month').add(20, 'days');
                                                let yesterdayEnd = moment().endOf('month');
                                                // console.log(yesterdayBegin);
                                                // console.log(yesterdayEnd);

                                                this.setState({
                                                    beginDateTime4FlowList: yesterdayBegin,
                                                    endDateTime4FlowList: yesterdayEnd,
                                                    timePickerOpen4FlowList: false
                                                }, async () => {
                                                    await this.fetchFlowList();
                                                });
                                            }}>21~月底</Button>
                                    </div>
                                    <div>
                                        <span>上月</span>
                                        <Button style={{ marginLeft: 5 }}
                                            size="small" type="primary" onClick={(e) => {
                                                let yesterdayBegin = moment().subtract(1, 'months').startOf('month');
                                                let yesterdayEnd = moment().subtract(1, 'months').startOf('month').add(9, 'days').endOf('day');
                                                // console.log(yesterdayBegin);
                                                // console.log(yesterdayEnd);

                                                this.setState({
                                                    beginDateTime4FlowList: yesterdayBegin,
                                                    endDateTime4FlowList: yesterdayEnd,
                                                    timePickerOpen4FlowList: false
                                                }, async () => {
                                                    await this.fetchFlowList();
                                                });
                                            }}>1~10</Button>
                                        <Button style={{ marginLeft: 5 }}
                                            size="small" type="primary" onClick={(e) => {
                                                let yesterdayBegin = moment().subtract(1, 'months').startOf('month').add(10, 'days');
                                                let yesterdayEnd = moment().subtract(1, 'months').startOf('month').add(19, 'days').endOf('day');
                                                // console.log(yesterdayBegin);
                                                // console.log(yesterdayEnd);

                                                this.setState({
                                                    beginDateTime4FlowList: yesterdayBegin,
                                                    endDateTime4FlowList: yesterdayEnd,
                                                    timePickerOpen4FlowList: false
                                                }, async () => {
                                                    await this.fetchFlowList();
                                                });
                                            }}>11~20</Button>
                                        <Button style={{ marginLeft: 5 }}
                                            size="small" type="primary" onClick={(e) => {
                                                let yesterdayBegin = moment().subtract(1, 'months').startOf('month').add(20, 'days');
                                                let yesterdayEnd = moment().subtract(1, 'months').endOf('month');
                                                // console.log(yesterdayBegin);
                                                // console.log(yesterdayEnd);

                                                this.setState({
                                                    beginDateTime4FlowList: yesterdayBegin,
                                                    endDateTime4FlowList: yesterdayEnd,
                                                    timePickerOpen4FlowList: false
                                                }, async () => {
                                                    await this.fetchFlowList();
                                                });
                                            }}>21~月底</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                    <span style={{ marginLeft: 5, marginRight: 5, color: 'red', fontSize: 15 }}>
                        {this.getDayTip(beginDateTime4FlowList, endDateTime4FlowList)}
                    </span>
                    <Button
                        style={{ width: 180, marginLeft: 10 }} type='primary'
                        disabled={flowListLoading}
                        onClick={async (e) => { await this.fetchFlowList(); }}>
                        查询货流单
                    </Button>
                    {baseShopUnHandleFlowSNs.length > 0 ? (<Button style={{ marginLeft: 10 }} danger>{`弯麦(总部)：序号【${baseShopUnHandleFlowSNs}】调货单要处理`}</Button>) : <div></div>}
                    <Table
                        style={{ marginTop: 10 }}
                        size='small'
                        loading={flowListLoading}
                        dataSource={flowListData}
                        columns={KFlowListColumns4Table}
                        pagination={false} bordered
                        scroll={{ y: 160, scrollToFirstRowOnChange: true }}
                        footer={() => {
                            return (
                                <div style={{ textAlign: 'center', height: 15, fontSize: 12 }}>
                                    <span>{`总共 ${flowListData.length} 项`}</span>
                                    {allShopUnHandleFlowSNs.length > 0 ? <Button size='small' danger style={{ marginLeft: 10, fontSize: 13, color: 'red' }}>
                                        {`序号【${allShopUnHandleFlowSNs}】调货单未处理`
                                        }</Button> : <span></span>}
                                </div>
                            )
                        }} />
                </div>

                <Modal
                    width={1000}
                    centered
                    keyboard={true}
                    maskClosable={false}
                    title={(
                        <div>
                            <div style={{ color: 'gray', fontSize: 8 }}>{this._currentOrderShopName}</div>
                            <div style={{ color: 'gray', fontSize: 8 }}>{this._currentOrderTime}</div>
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
                                    {`总共 ${orderDetailData.length} 项`}
                                </div>
                            )
                        }} />
                </Modal>
                <Modal
                    width={1000}
                    centered
                    keyboard={true}
                    maskClosable={false}
                    title={(
                        <div>
                            <div style={{ color: 'green', fontSize: 10 }}>
                                {this._currentTransferFrom !== '-' ?
                                    `${this._currentTransferFrom}=>${this._currentTransferTo}` : `${this._currentTransferTo}`}
                            </div>

                            <div style={{ color: 'gray', fontSize: 8 }}>{this._currentFlowDetailStatus[0]}</div>
                            <div style={{ color: 'gray', fontSize: 8 }}>{this._currentFlowDetailStatus[1]}</div>
                        </div>
                    )}
                    visible={flowDetailModalVisible}
                    onCancel={() => {
                        this.setState({ flowDetailModalVisible: false });
                    }}
                    footer={
                        (
                            showAction ? (<div style={{ marginRight: 10, marginBottom: 20, marginTop: 20 }}>
                                <Space>
                                    <Button key="refuse" type="primary" danger disabled={refuseFlowLoading} onClick={async (e) => {
                                        let originText = this._currentFlowRefuseText;
                                        this._currentFlowRefuseText = '发送中';
                                        this.setState({ refuseFlowLoading: true });
                                        let result = await refuseStockFlow(this._currentFlowId);
                                        if (result && result.errCode === 0) {
                                            this._currentFlowRefuseText = '';
                                            this._currentFlowDetailStatus[1] = '已拒绝收货';
                                            message.success('拒绝收货成功~');
                                            await this.fetchFlowList();
                                        } else {
                                            this._currentFlowRefuseText = originText;
                                            message.error('拒绝收货失败~');
                                        }
                                        this.setState({ refuseFlowLoading: false });
                                    }}>
                                        {this._currentFlowRefuseText}
                                    </Button>
                                    <Button key="confirm" type="primary" danger disabled={confirmFlowLoading} onClick={async (e) => {
                                        let originText = this._currentFlowConfirmText;
                                        this._currentFlowConfirmText = '发送中';
                                        this.setState({ confirmFlowLoading: true });
                                        let result = await confirmStockFlow(this._currentFlowId);
                                        if (result && result.errCode === 0) {
                                            this._currentFlowConfirmText = '';
                                            this._currentFlowDetailStatus[1] = '已完成收货';
                                            message.success('确认收货成功~');
                                            await this.fetchFlowList();
                                        } else {
                                            this._currentFlowConfirmText = originText;
                                            message.error('确认收货失败~');
                                        }
                                        this.setState({ confirmFlowLoading: false });
                                    }}>
                                        {this._currentFlowConfirmText}
                                    </Button>
                                </Space>
                            </div>) : <div></div>
                        )
                    }>
                    <Table
                        style={{ marginTop: 10 }}
                        size='small'
                        loading={flowDetailLoading}
                        dataSource={flowDetailData}
                        columns={KFlowDetailColumns4Table}
                        pagination={false} bordered
                        scroll={{ y: 400, scrollToFirstRowOnChange: true }}
                        footer={() => {
                            return (
                                <div style={{ textAlign: 'center', height: 15, fontSize: 12 }}>
                                    {`总共 ${flowDetailData.length} 项`}
                                </div>
                            )
                        }} />
                </Modal>
            </div >
        );
    }
}

export default OrderManagement;
