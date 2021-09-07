import React from 'react';
import {
    Button, Menu, Dropdown,
    DatePicker, Table, message
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import {
    getProductOrderList
} from '../api/api';
import { getTest } from '../api/util';

const { RangePicker } = DatePicker;

/**--------------------配置信息--------------------*/
const KForTest = getTest();

/// 门店信息
const KAllShops = [
    { index: 0, name: '全部门店', userId: '' },
    { index: 1, name: '001 - 弯麦(教育局店)', userId: '3995767' },
    { index: 2, name: '002 - 弯麦(旧镇店)', userId: '3995771' },
    { index: 3, name: '003 - 弯麦(江滨店)', userId: '4061089' },
    { index: 4, name: '004 - 弯麦(汤泉店)', userId: '4061092' },
    { index: 5, name: '005 - 弯麦(假日店)', userId: '4339546' },
    { index: 6, name: '006 - 弯麦(狮头店)', userId: '4359267' },
    { index: 7, name: '007 - 弯麦(盘陀店)', userId: '4382444' }
];
/// 模板信息
const KOrderTemplates = [
    { index: 0, name: '全部模板', templateId: '', templateUid: '' },
    { index: 1, name: '现烤类', templateId: '187', templateUid: '1595310806940367327' },
    { index: 2, name: '西点类', templateId: '189', templateUid: '1595397637628133418' },
    { index: 3, name: '常温类', templateId: '183', templateUid: '1595077654714716554' },
    { index: 4, name: '吐司餐包类', templateId: '182', templateUid: '1595077405589137749' }
];
/// 订单列表头配置
const KOrderColumns4Table = [
    { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '订货单号', dataIndex: 'orderSerialNumber', key: 'orderSerialNumber', width: 180, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '订货时间', dataIndex: 'orderTime', key: 'orderTime', width: 150, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '期望到货', dataIndex: 'expectTime', key: 'expectTime', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '订货单类型', dataIndex: 'orderType', key: 'orderType', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '订货收银员', dataIndex: 'orderCashier', key: 'orderCashier', width: 120, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '模板名称', dataIndex: 'templateName', key: 'templateName', width: 120, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '订货门店', dataIndex: 'orderShop', key: 'orderShop', width: 180, render: (text) => { return <span style={{ fontSize: 10, color: 'red' }}>{text}</span>; } },
    { title: '配货门店', dataIndex: 'prepareShop', key: 'prepareShop', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } }
];
/// 报货门店名字
const KAllOrderShopName = [
    KAllShops[1].name,
    KAllShops[2].name,
    KAllShops[3].name,
    KAllShops[4].name,
    KAllShops[5].name,
    KAllShops[6].name,
    KAllShops[7].name,
];
/// 报货模板名字
const KAllOrderTemplateName = [
    KOrderTemplates[1].name,
    KOrderTemplates[2].name,
    KOrderTemplates[3].name,
    KOrderTemplates[4].name,
];

class OrderManagement extends React.Component {
    constructor(props) {
        super(props);

        let beginDateTime = moment().startOf('day');
        let endDateTime = moment().endOf('day');

        if (KForTest) {
            beginDateTime = moment().subtract(1, 'day').startOf('day');
            endDateTime = moment().subtract(1, 'day').endOf('day');
        }
        this.state = {
            alreadyOrderListData: [],
            alreadyOrderLoading: false,
            currentShop: KAllShops[0],
            currentTemplate: KOrderTemplates[1],
            beginDateTime: beginDateTime,
            endDateTime: endDateTime,
            timePickerOpen: false,
            selectedRowKeys: [],
            noyetOrderShops: [],
            noyetOrderTemplates: []
        };
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
                currentTemplate: paramValueObj.template,
                currentShop: paramValueObj.shop,
                beginDateTime: moment(paramValueObj.beginDateTime),
                endDateTime: moment(paramValueObj.endDateTime)
            });
        }

        await this.fetchOrderList();
    }

    fetchOrderList = async () => {
        try {
            this.setState({
                alreadyOrderListData: [], alreadyOrderLoading: true, selectedRowKeys: []
            }, async () => {
                const { currentShop, currentTemplate, beginDateTime, endDateTime } = this.state;
                let orderList = [];
                let keys = [];
                let noyetOrderShops = KAllOrderShopName;
                let noyetOrderTemplates = KAllOrderTemplateName;
                let beginDateTimeStr = beginDateTime.format('YYYY.MM.DD%2BHH:mm:ss');
                let endDateTimeStr = endDateTime.format('YYYY.MM.DD%2BHH:mm:ss');;
                const productOrder = await getProductOrderList(currentShop.userId, currentTemplate.templateId, beginDateTimeStr, endDateTimeStr);
                // console.log(productOrder);

                if (productOrder && productOrder.errCode === 0) {
                    orderList = productOrder.list;

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
                    selectedRowKeys: keys,
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
    }

    onOrderItemSelectChange = (selectedRowKeys) => {
        // console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    handleProductionPrint = async (e) => {
        // console.log('handleProductionPrint e' + e);

        let paramValueObj = {};

        const { alreadyOrderListData, currentShop, currentTemplate,
            selectedRowKeys, beginDateTime, endDateTime } = this.state;
        let alreadyOrderListDataAfterFilter = [];
        for (let ii = 0; ii < alreadyOrderListData.length; ++ii) {
            let orderItem = alreadyOrderListData[ii];
            if (selectedRowKeys.indexOf(orderItem.key) === -1) continue;
            alreadyOrderListDataAfterFilter.push(orderItem);
        }

        paramValueObj.orderList = alreadyOrderListDataAfterFilter;
        paramValueObj.template = currentTemplate;
        paramValueObj.shop = currentShop;
        paramValueObj.beginDateTime = beginDateTime;
        paramValueObj.endDateTime = endDateTime;

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

        const { alreadyOrderListData, currentTemplate,
            currentShop, beginDateTime, endDateTime,
            selectedRowKeys } = this.state;
        let alreadyOrderListDataAfterFilter = [];
        for (let ii = 0; ii < alreadyOrderListData.length; ++ii) {
            let orderItem = alreadyOrderListData[ii];
            if (selectedRowKeys.indexOf(orderItem.key) === -1) continue;
            alreadyOrderListDataAfterFilter.push(orderItem);
        }

        paramValueObj.orderList = alreadyOrderListDataAfterFilter;
        paramValueObj.template = currentTemplate;
        paramValueObj.shop = currentShop;
        paramValueObj.beginDateTime = beginDateTime;
        paramValueObj.endDateTime = endDateTime;

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

        const { alreadyOrderListData, currentTemplate, currentShop,
            beginDateTime, endDateTime, selectedRowKeys } = this.state;
        let alreadyOrderListDataAfterFilter = [];
        for (let ii = 0; ii < alreadyOrderListData.length; ++ii) {
            let orderItem = alreadyOrderListData[ii];
            if (selectedRowKeys.indexOf(orderItem.key) === -1) continue;
            alreadyOrderListDataAfterFilter.push(orderItem);
        }

        paramValueObj.orderList = alreadyOrderListDataAfterFilter;
        paramValueObj.template = currentTemplate;
        paramValueObj.shop = currentShop;
        paramValueObj.beginDateTime = beginDateTime;
        paramValueObj.endDateTime = endDateTime;

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

    render() {
        const {
            alreadyOrderListData, currentShop, currentTemplate,
            alreadyOrderLoading, beginDateTime, endDateTime,
            timePickerOpen, selectedRowKeys,
            noyetOrderShops, noyetOrderTemplates,
        } = this.state;

        const alreadyOrderRowSelection = {
            selectedRowKeys,
            onChange: this.onOrderItemSelectChange,
        };

        let noYetOrderShopNames = '无';
        if (noyetOrderShops && noyetOrderShops.length > 0) {
            noYetOrderShopNames = noyetOrderShops.join(' | ');
        }
        let disableProductionPrint =
            currentShop.userId !== '' ||
            currentTemplate.templateId === '' ||
            selectedRowKeys.length <= 0;

        let notyetOrderShopInfoShow = currentShop.userId === '';

        let noYetOrderTemplateNames = '无';
        if (noyetOrderTemplates && noyetOrderTemplates.length > 0) {
            noYetOrderTemplateNames = noyetOrderTemplates.join(' | ');
        }
        let disableDistributionButtonPrint =
            currentShop.userId === '' ||
            currentTemplate.templateId !== '' ||
            selectedRowKeys.length <= 0;
        let notyetOrderTemplateInfoShow = currentTemplate.templateId === '';

        let disableSubmitButton =
            currentShop.userId === '' ||
            currentTemplate.templateId !== '' ||
            selectedRowKeys.length <= 0;

        return (
            <div>
                <div>
                    <div style={{ marginLeft: 30, marginTop: 10, fontSize: 20 }}>生产 VS 配货</div>
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
                    <div style={{ marginLeft: 30, marginTop: 10, marginRight: 30, marginBottom: 30 }}>
                        <Dropdown
                            style={{ marginLeft: 0 }}
                            overlay={
                                () => {
                                    return (<Menu onClick={async ({ key }) => {
                                        this.setState({ currentShop: KAllShops[key] }, async () => {
                                            await this.fetchOrderList();
                                        });
                                    }} >
                                        {
                                            KAllShops.map((shop) => {
                                                return (<Menu.Item key={shop.index}>
                                                    {shop.name}
                                                </Menu.Item>);
                                            })
                                        }
                                    </Menu>)
                                }
                            } arrow trigger={['hover']} disabled={alreadyOrderLoading}>
                            <Button size="small" style={{ width: 160 }} onClick={e => e.preventDefault()}>
                                {currentShop.name}
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                        <Dropdown
                            overlay={
                                () => {
                                    return (<Menu onClick={async ({ key }) => {
                                        this.setState({ currentTemplate: KOrderTemplates[key] }, async () => {
                                            await this.fetchOrderList();
                                        });
                                    }} >
                                        {
                                            KOrderTemplates.map((template) => {
                                                return (<Menu.Item key={template.index}>
                                                    {template.name}
                                                </Menu.Item>);
                                            })
                                        }
                                    </Menu>)
                                }
                            } arrow trigger={['hover']} disabled={alreadyOrderLoading}>
                            <Button size="small" style={{ width: 160, marginLeft: 10 }} onClick={e => e.preventDefault()}>
                                {currentTemplate.name}
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                        <RangePicker
                            open={timePickerOpen}
                            onOpenChange={(open) => {
                                this.setState({ timePickerOpen: open });
                            }}
                            style={{ marginLeft: 10 }}
                            size='small'
                            locale={locale}
                            bordered={true}
                            placeholder={['开始时间', '结束时间']}
                            inputReadOnly={true}
                            disabled={alreadyOrderLoading}
                            value={[moment(beginDateTime, 'YYYY-MM-DD+HH:mm:ss'),
                            moment(endDateTime, 'YYYY-MM-DD+HH:mm:ss')]}
                            defaultValue={[moment(beginDateTime, 'YYYY-MM-DD+HH:mm:ss'),
                            moment(endDateTime, 'YYYY-MM-DD+HH:mm:ss')]}
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
                                    this.setState({ beginDateTime: data[0], endDateTime: data[1] }, async () => {
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

                                        this.setState({ beginDateTime: yesterdayBegin, endDateTime: yesterdayEnd, timePickerOpen: false }, async () => {
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

                                        this.setState({ beginDateTime: yesterdayBegin, endDateTime: yesterdayEnd, timePickerOpen: false }, async () => {
                                            await this.fetchOrderList();
                                        });
                                    }}>
                                        今天
                                    </Button>
                                </span>
                            )}
                        />
                        <Button
                            style={{ width: 180, marginLeft: 10 }} type='primary'
                            onClick={async (e) => { await this.fetchOrderList(); }}>
                            查询门店订货单
                        </Button>
                        <Table
                            style={{ marginTop: 10 }}
                            size='small'
                            loading={alreadyOrderLoading}
                            dataSource={alreadyOrderListData}
                            columns={KOrderColumns4Table}
                            rowSelection={alreadyOrderRowSelection}
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
                </div>
            </div>
        );
    }
}

export default OrderManagement;
