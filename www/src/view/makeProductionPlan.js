import React from 'react';
import {
    Button,
    Menu,
    Dropdown,
    DatePicker,
    Table,
    message
} from 'antd';

import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';
import { DownOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import { getProductOrderList, getProductOrderItems } from '../api/api';
const { RangePicker } = DatePicker;

const KShopArray = [
    { index: 0, name: '全部门店', userId: '' },
    { index: 1, name: '001-教育局店', userId: '3995767' },
    { index: 2, name: '002-旧镇店', userId: '3995771' },
    { index: 3, name: '003-江滨店', userId: '4061089' },
    { index: 4, name: '004-汤泉店', userId: '4061092' },
    { index: 5, name: '005-假日店', userId: '4339546' },
    { index: 6, name: '006-狮头店', userId: '4359267' },
    { index: 7, name: '007-盘陀店', userId: '4382444' }
];
const KTemplateArray = [
    { index: 0, name: '全部模板', templateId: '' },
    { index: 1, name: '现烤类', templateId: '187' },
    { index: 2, name: '西点类', templateId: '189' },
    { index: 3, name: '常温类', templateId: '183' },
    { index: 4, name: '吐司餐包类', templateId: '182' }
];
const orderColumns = [
    {
        title: '序',
        dataIndex: 'key',
        key: 'key',
        width: 40,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '订货单号',
        dataIndex: 'orderSerialNumber',
        key: 'orderSerialNumber',
        width: 180,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '订货时间',
        dataIndex: 'orderTime',
        key: 'orderTime',
        width: 150,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '期望到货时间	',
        dataIndex: 'expectTime',
        key: 'expectTime',
        width: 100,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '订货单类型',
        dataIndex: 'orderType',
        key: 'orderType',
        width: 140,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '订货收银员',
        dataIndex: 'orderCashier',
        key: 'orderCashier',
        width: 120,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '模板名称',
        dataIndex: 'templateName',
        key: 'templateName',
        width: 120,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '订货门店',
        dataIndex: 'orderShop',
        key: 'orderShop',
        width: 180,
        render: (text) => {
            return <span style={{ fontSize: 10, color: 'red' }}>{text}</span>;
        }
    },
    {
        title: '配货门店',
        dataIndex: 'prepareShop',
        key: 'prepareShop',
        width: 100,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
    {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: '*',
        render: (text) => {
            return <span style={{ fontSize: 10 }}>{text}</span>;
        }
    },
];
const KAllOrderShopName = [
    '001 - 弯麦(教育局店)',
    '002 - 弯麦(旧镇店)',
    '003 - 弯麦(江滨店)',
    '004 - 弯麦(汤泉店)',
    '005 - 弯麦(假日店)',
    '006 - 弯麦(狮头店)',
    '007 - 弯麦(盘陀店)'
];
// templateId-barcode
const KSortIdArray = {
    /// 现烤
    '187-2006251756022': 1, //高钙片
    '187-2006291720144': 2, //焗烤三明治
    '187-2007261431428': 3, //奶酪杯
    '187-2006261548488': 4, //鸡排三明治
    '187-2006251720443': 5, //手工蛋挞
    '187-2007171555580': 6, //全麦熏鸡三明治
    /// 吐司餐包
    '182-2106241432414': 1, //枫糖小吐司
    '182-2106281603003': 2, //红豆小吐司		
    '182-2106281600071': 3, //坚果小吐司			
    '182-2106281603355': 4, //南瓜小吐司				
    '182-2106241433091': 5, //松松小吐司					
    '182-2106281601535': 6, //椰蓉小吐司				
    '182-2010291510063': 7, //纯奶拉丝大吐司					
};
class MakeProductionPlan extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listData: [],
            loading: false,
            shop: KShopArray[0],
            template: KTemplateArray[1],
            beginDateTime: moment().startOf('day'),
            endDateTime: moment().endOf('day'),
            selectedRowKeys: [],
            noYetOrderList: [],
            printData: [],
            makeButtonText: '打印生产单'
        };
    }

    async componentDidMount() {
        await this.fetchOrderList();
    }

    async fetchOrderList() {
        try {
            this.setState({
                listData: [], loading: true,
                selectedRowKeys: []
            }, async () => {
                const { shop, template, beginDateTime, endDateTime } = this.state;
                let orderList = []; let keys = []; let noYetOrder = KAllOrderShopName;
                let beginDateTimeStr = beginDateTime.format('YYYY.MM.DD%2BHH:mm:ss');
                let endDateTimeStr = endDateTime.format('YYYY.MM.DD%2BHH:mm:ss');;
                const productOrder = await getProductOrderList(shop.userId, template.templateId, beginDateTimeStr, endDateTimeStr);
                // console.log(productOrder);

                if (productOrder && productOrder.errCode === 0) {
                    orderList = productOrder.list;

                    orderList = orderList.sort((item1, item2) => {
                        return item1.orderShopIndex - item2.orderShopIndex;
                    });
                    let alreadyOrderList = [];
                    orderList.forEach(order => {
                        order.key = orderList.indexOf(order) + 1;
                        keys.push(order.key);
                        alreadyOrderList.push(order.orderShop);
                    });

                    noYetOrder = [];
                    KAllOrderShopName.forEach(orderItem => {
                        if (alreadyOrderList.indexOf(orderItem) === -1) {
                            noYetOrder.push(orderItem);
                        }
                    });
                }
                // console.log(productOrder);

                this.setState({
                    listData: orderList,
                    selectedRowKeys: keys,
                    loading: false,
                    noYetOrderList: noYetOrder
                });
            });
        } catch (err) {
            this.setState({
                loading: false
            });
        }
    }

    onSelectChange = selectedRowKeys => {
        // console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    handleMakePlan = async (e) => {
        // console.log('handleMakePlan');

        this.setState({ makeButtonText: '准备打印...' }, async () => {
            let allData = [];
            const { listData, template } = this.state;
            for (let index = 0; index < listData.length; ++index) {
                let orderItem = listData[index];
                if (orderItem) {
                    /// 1.获取每家店的订货信息
                    this.setState({ makeButtonText: '获取' + orderItem.orderShop + '...' })
                    const orderItems = await getProductOrderItems(orderItem.orderId);
                    if (orderItems.errCode === 0 && orderItems.items) {
                        let existInAllData = false;
                        let i;
                        for (i = 0; i < allData.length; ++i) {
                            if (allData[i].orderShop === orderItem.orderShop &&
                                allData[i].templateName === orderItem.templateName) {
                                existInAllData = true;
                                break;
                            }
                        }
                        /// 2.合并同一订货门店同一模板订单的商品信息
                        if (existInAllData) {
                            let theExistDataItems = allData[i].items;
                            let toBeDealItems = orderItems.items;
                            for (let i = 0; i < toBeDealItems.length; ++i) {
                                let toBeDealItem = toBeDealItems[i];
                                let posInTheExistDataItems = -1;
                                for (let j = 0; j < theExistDataItems.length; ++j) {
                                    let productItem = theExistDataItems[j];
                                    if (productItem.barcode === toBeDealItem.barcode) {
                                        posInTheExistDataItems = j;
                                        break;
                                    }
                                }

                                if (posInTheExistDataItems !== -1) {
                                    let newNumber = theExistDataItems[posInTheExistDataItems].orderNumber + toBeDealItem.orderNumber;
                                    theExistDataItems[posInTheExistDataItems].orderNumber = newNumber;
                                } else {
                                    let newItemObject = {};
                                    newItemObject.categoryName = toBeDealItem.categoryName;
                                    newItemObject.orderProductName = toBeDealItem.orderProductName;
                                    newItemObject.barcode = toBeDealItem.barcode;
                                    newItemObject.barcodeSimple5 = toBeDealItem.barcodeSimple5;
                                    newItemObject.orderNumber = toBeDealItem.orderNumber;
                                    newItemObject.sortId = toBeDealItem.sortId;

                                    theExistDataItems.push(newItemObject);
                                }
                            }
                        } else {
                            let item = {};
                            item.orderShop = orderItem.orderShop;
                            item.templateName = orderItem.templateName;
                            item.expectTime = orderItem.expectTime;
                            item.items = orderItems.items;
                            for (let i = 0; i < orderItems.items.length; ++i) {
                                let templateAndBarcode = template.templateId + '-' + orderItems.items[i].barcode;
                                let sortInfo = KSortIdArray[templateAndBarcode];
                                orderItems.items[i].sortId = sortInfo ? sortInfo : 200;
                            }
                            allData.push(item);
                        }
                    } else {
                        allData = [];
                        message.error('获取<' + orderItem.orderShop + '>订货产品出错，请检查！');
                        break;
                    }
                }
            }
            /// 3.合并所有店的订货信息至生产车间
            this.setState({ makeButtonText: '合并至生产车间...' })
            let totalOrderItem = {};
            totalOrderItem.orderShop = '000 - 弯麦(生产车间)';
            totalOrderItem.templateName = this.state.template.name;
            if (allData && allData.length > 0) {
                totalOrderItem.expectTime = allData[0].expectTime;
            }
            let totalItems = [];
            for (let i = 0; i < allData.length; ++i) {
                let items = allData[i].items;
                for (let j = 0; j < items.length; ++j) {
                    let itemObj = items[j];

                    let itemBarcode = itemObj.barcode;
                    let posInTotalItems = -1;
                    for (let ii = 0; ii < totalItems.length; ++ii) {
                        if (totalItems[ii].barcode === itemBarcode) {
                            posInTotalItems = ii;
                            break;
                        }
                    }
                    if (posInTotalItems !== -1) {
                        let newNumber = totalItems[posInTotalItems].orderNumber + itemObj.orderNumber;
                        totalItems[posInTotalItems].orderNumber = newNumber;
                    } else {
                        let newItemObject = {};
                        newItemObject.categoryName = itemObj.categoryName;
                        newItemObject.orderProductName = itemObj.orderProductName;
                        newItemObject.barcode = itemObj.barcode;
                        newItemObject.barcodeSimple5 = itemObj.barcodeSimple5;
                        newItemObject.orderNumber = itemObj.orderNumber;
                        newItemObject.sortId = itemObj.sortId;

                        totalItems.push(newItemObject);
                    }
                }
            }

            /// 同一分类的放在一起
            let totalItemsAfterFixCategory = [];
            for (let i = 0; i < totalItems.length; ++i) {
                let oneItem = totalItems[i];

                let pos = -1;
                for (let j = totalItemsAfterFixCategory.length - 1; j >= 0; --j) {
                    if (totalItemsAfterFixCategory[j].categoryName === oneItem.categoryName) {
                        pos = j;
                        break;
                    }
                }

                if (pos !== -1) {
                    totalItemsAfterFixCategory.splice(pos + 1, 0, oneItem);
                } else {
                    totalItemsAfterFixCategory.push(oneItem);
                }
            }
            /// 根据设定排序号排序
            totalItemsAfterFixCategory = totalItemsAfterFixCategory.sort((item1, item2) => {
                return item1.sortId - item2.sortId;
            });

            totalOrderItem.items = totalItemsAfterFixCategory;
            allData.unshift(totalOrderItem);

            /// 4.整理订货信息补上订货量是0的商品
            let allDataAfterFix0 = [];
            for (let i = 0; i < allData.length; ++i) {
                let allDataColumn = allData[i];
                if (allDataColumn.orderShop === '000 - 弯麦(生产车间)') {
                    allDataAfterFix0.push(allDataColumn);
                    continue;
                }

                let oneDataObj = {};
                oneDataObj.orderShop = allDataColumn.orderShop;
                oneDataObj.templateName = allDataColumn.templateName;
                oneDataObj.expectTime = allDataColumn.expectTime;
                oneDataObj.items = [];
                for (let j = 0; j < totalOrderItem.items.length; ++j) {
                    let oneItem = totalOrderItem.items[j];
                    if (oneItem) {
                        let newItemObject = {};
                        newItemObject.categoryName = oneItem.categoryName;
                        newItemObject.orderProductName = oneItem.orderProductName;
                        newItemObject.barcode = oneItem.barcode;
                        newItemObject.barcodeSimple5 = oneItem.barcodeSimple5;
                        newItemObject.sortId = oneItem.sortId;
                        newItemObject.orderNumber = 0;
                        for (let k = 0; k < allDataColumn.items.length; ++k) {
                            let antherOneItem = allDataColumn.items[k];
                            if (newItemObject.barcode === antherOneItem.barcode) {
                                newItemObject.orderNumber = antherOneItem.orderNumber;
                                break;
                            }
                        }

                        oneDataObj.items.push(newItemObject);
                    }
                }
                allDataAfterFix0.push(oneDataObj);
            }

            /// 5.整理订货信息使得适合A4打印
            let allDataAfterA4 = [];
            for (let i = 0; i < allDataAfterFix0.length; ++i) {
                let allDataItem = allDataAfterFix0[i].items;
                for (let j = 0; j < allDataItem.length; ++j) {
                    if (j % 29 === 0) {///29
                        let allDataAfterItem = {};
                        allDataAfterItem.orderShop = allDataAfterFix0[i].orderShop;
                        allDataAfterItem.templateName = allDataAfterFix0[i].templateName;
                        allDataAfterItem.expectTime = allDataAfterFix0[i].expectTime;
                        allDataAfterItem.items = [];

                        allDataAfterA4.push(allDataAfterItem);
                    }
                    allDataAfterA4[allDataAfterA4.length - 1].items.push(allDataItem[j]);
                }
            }
            this.setState({ makeButtonText: '打印生产单', printData: allDataAfterA4 });

            // console.log(allDataAfterA4);
        });
    };

    printPreprew = () => {
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            let strStyle =
                `<style>
                </style> `;
            LODOP.SET_PRINT_PAGESIZE(2, 0, 0, "");
            LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 1000, 800, '');
            LODOP.SET_SHOW_MODE("LANDSCAPE_DEFROTATED", 1);//横向时的正向显示
            LODOP.ADD_PRINT_HTM(0, 0, "100%", '100%', strStyle + document.getElementById("printDiv").innerHTML);
            LODOP.PREVIEW();
        }
    };

    printDirect = () => {
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            let strStyle =
                `<style>
                </style> `;
            LODOP.SET_PRINT_PAGESIZE(2, 0, 0, "");
            LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 1000, 800, '');
            LODOP.SET_SHOW_MODE("LANDSCAPE_DEFROTATED", 1);//横向时的正向显示
            LODOP.ADD_PRINT_HTM(0, 0, "100%", "100%", strStyle + document.getElementById("printDiv").innerHTML);
            LODOP.PRINT();
        }
    };

    render() {
        const { listData, shop, template, loading,
            beginDateTime, endDateTime, selectedRowKeys,
            noYetOrderList, makeButtonText, printData } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        let noYetOrderText = '无';
        if (noYetOrderList && noYetOrderList.length > 0) {
            noYetOrderText = noYetOrderList.join(' | ');
        }
        let disablePrint = shop.userId !== '' || selectedRowKeys.length <= 0 || makeButtonText !== '打印生产单';

        let printShow = printData && printData.length > 0;

        return (
            <div>
                {!printShow ? (<div>
                    <div style={{ marginLeft: 30, marginTop: 10, fontSize: 20 }}>生产单 | 配货单 打印模块</div>
                    <div style={{ zIndex: 2, bottom: 0, left: 0, right: 0, position: 'fixed', width: '100%', height: 100, backgroundColor: 'lightgray' }}>
                        <div>
                            <Button danger disabled={disablePrint} type='primary'
                                onClick={this.handleMakePlan}
                                style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                                {makeButtonText}
                            </Button>

                            <span>
                                <span style={{ marginLeft: 10, color: 'tomato', fontSize: 8 }}>未报货门店:</span>
                                <span style={{ marginLeft: 5, color: 'red', fontSize: 14, fontWeight: 'bold' }}>{noYetOrderText}</span>
                            </span>
                        </div>
                        <div>
                            <Button danger disabled type='primary'
                                style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                                打印配货单
                            </Button>
                        </div>
                    </div>
                    <div style={{ marginLeft: 30, marginTop: 10, marginRight: 30, marginBottom: 30 }}>
                        <Dropdown
                            style={{ marginLeft: 0 }}
                            overlay={
                                () => {
                                    return (<Menu onClick={async ({ key }) => {
                                        this.setState({ shop: KShopArray[key] }, async () => {
                                            await this.fetchOrderList();
                                        });
                                    }} >
                                        {
                                            KShopArray.map((shop) => {
                                                return (<Menu.Item key={shop.index}>
                                                    {shop.name}
                                                </Menu.Item>);
                                            })
                                        }
                                    </Menu>)
                                }
                            } arrow trigger={['click']} disabled={loading}>
                            <Button size="small" style={{ width: 160 }} onClick={e => e.preventDefault()}>
                                {shop.name}
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                        <Dropdown
                            overlay={
                                () => {
                                    return (<Menu onClick={async ({ key }) => {
                                        this.setState({ template: KTemplateArray[key] }, async () => {
                                            await this.fetchOrderList();
                                        });
                                    }} >
                                        {
                                            KTemplateArray.map((template) => {
                                                return (<Menu.Item key={template.index}>
                                                    {template.name}
                                                </Menu.Item>);
                                            })
                                        }
                                    </Menu>)
                                }
                            } arrow trigger={['click']} disabled={loading}>
                            <Button size="small" style={{ width: 160, marginLeft: 10 }} onClick={e => e.preventDefault()}>
                                {template.name}
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                        <RangePicker
                            style={{ marginLeft: 10 }}
                            size='small'
                            locale={locale}
                            bordered={true}
                            placeholder={['开始时间', '结束时间']}
                            inputReadOnly={true}
                            disabled={loading}
                            defaultValue={[moment(beginDateTime, 'YYYY-MM-DD+HH:mm:ss'), moment(endDateTime, 'YYYY-MM-DD+HH:mm:ss')]}
                            showTime={{
                                hideDisabledOptions: true,
                                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                                showTime: true,
                                showHour: true,
                                showMinute: true,
                                showSecond: true
                            }}
                            onChange={(data) => {
                                // console.log(data);
                            }}
                            onOk={async (data) => {
                                if (data.length >= 2 && data[0] && data[1]) {
                                    if (data[0] > data[1]) {
                                        message.info('请输入正确时间');
                                        return;
                                    }
                                    this.setState({ beginDateTime: data[0], endDateTime: data[1] }, async () => {
                                        await this.fetchOrderList();
                                    });
                                }
                            }}
                        />
                        <Button
                            style={{ width: 180, marginLeft: 10 }} type='primary'
                            onClick={async (e) => { await this.fetchOrderList(); }}>
                            查询
                        </Button>
                        <Table style={{ marginTop: 10 }}
                            loading={loading}
                            dataSource={listData}
                            columns={orderColumns}
                            rowSelection={rowSelection}
                            pagination={false} bordered
                            footer={() => {
                                return (
                                    <div>
                                        <div style={{ textAlign: 'center', height: 50 }}>
                                            ---心里满满都是你---
                                        </div>
                                        <div style={{ height: 50 }}>
                                        </div>
                                    </div>
                                )
                            }} />
                    </div>
                </div>) :
                    (
                        <div style={{ marginLeft: 10, marginTop: 10 }}>
                            <div id="printConfig"
                                style={{ float: 'left', borderStyle: 'none', width: 90 }}>
                                <div>
                                    <Button type="primary"
                                        style={{ width: 90, height: 80 }}
                                        onClick={() => {
                                            this.setState({ printData: [], printShow: false });
                                        }}>
                                        <div style={{ fontSize: 16 }}>
                                            后退
                                        </div>
                                    </Button>
                                </div>
                                <Button type="primary"
                                    style={{ marginTop: 10, width: 90, height: 80 }}
                                    onClick={this.printPreprew}>
                                    <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                                        打印预览
                                    </div>
                                </Button>
                                <Button type="primary"
                                    danger
                                    style={{ marginTop: 10, width: 90, height: 80 }}
                                    onClick={this.printDirect}>
                                    <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                                        直接打印
                                    </div>
                                </Button>
                            </div>

                            <div id="printDiv" style={{ float: 'left', marginLeft: 10, borderStyle: 'dotted', width: 1379, height: 968 }}>
                                <div id="printTable" style={{ marginTop: 0, marginLeft: 0, width: 1375, height: 964, backgroundColor: 'transparent' }}>
                                    {
                                        printData.map((columnData) => {
                                            let productArray = columnData.items;
                                            let index = printData.indexOf(columnData);
                                            return (
                                                <div key={index} style={{ float: 'left', zIndex: 10, backgroundColor: 'transparent', marginTop: 44, height: 920 }}>
                                                    <div style={{ float: 'left', marginLeft: 0, width: 18, height: 920 }} />
                                                    <table border='1' cellSpacing='0' cellPadding='2' style={{ float: 'left' }}>
                                                        <thead>
                                                            <tr>
                                                                <th colSpan='4' style={{ width: 280, textAlign: 'center' }}>
                                                                    {columnData.templateName}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan='4' style={{ width: 280, textAlign: 'center' }}>
                                                                    {columnData.orderShop}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th style={{ width: 20, textAlign: 'center', fontWeight: 'bold' }}>序</th>
                                                                <th style={{ width: 60, textAlign: 'center', fontWeight: 'bold' }}>简码</th>
                                                                <th style={{ width: 170, textAlign: 'center', fontWeight: 'bold' }}>品名</th>
                                                                <th style={{ width: 30, textAlign: 'center', fontWeight: 'bold' }}>数</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                productArray.map((productItem) => {
                                                                    let serialNum = productArray.indexOf(productItem) + 1;
                                                                    return (
                                                                        <tr key={serialNum}>
                                                                            <th key='1' style={{ width: 20, height: 20, textAlign: 'center', fontSize: 14 }}>{serialNum}</th>
                                                                            <th key='2' style={{ width: 60, height: 20, textAlign: 'center', fontSize: 16 }}>{productItem.barcodeSimple5}</th>
                                                                            <th key='3' style={{ width: 170, height: 20, textAlign: 'center', fontSize: 18 }}>{productItem.orderProductName}</th>
                                                                            <th key='4' style={{ width: 30, height: 20, textAlign: 'center', fontSize: 18 }}>{productItem.orderNumber !== 0 ? productItem.orderNumber : ''}</th>
                                                                        </tr>)
                                                                })
                                                            }
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <th colSpan='4'>{columnData.expectTime}</th>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                    <div style={{ float: 'left', marginLeft: 0, width: 18, height: 920 }} />
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
}

export default MakeProductionPlan;
