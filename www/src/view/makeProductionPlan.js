import React from 'react';
import {
    Button,
    Menu,
    Dropdown,
    DatePicker,
    Table,
    message,
    Popconfirm
} from 'antd';

import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import { getProductOrderList } from '../api/api';
const { RangePicker } = DatePicker;

const KShopArray = [
    { index: 0, name: '全部门店', userId: '' },
    { index: 1, name: '001-教育局店', userId: '3995767' },
    { index: 2, name: '002-旧镇店', userId: '3995771' },
    { index: 3, name: '003-江滨店', userId: '4061089' },
    { index: 4, name: '004-汤泉世纪店', userId: '4061092' },
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
        width: 200,
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

class MakeProductionPlan extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listData: [],
            loading: false,
            shop: KShopArray[0],
            template: KTemplateArray[0],
            beginDateTime: moment().startOf('day'),
            endDateTime: moment().endOf('day'),
            selectedRowKeys: [],
            noYetOrderList: []
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
                console.log(productOrder);

                if (productOrder && productOrder.errCode === 0) {
                    orderList = productOrder.list;

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
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    handleMakePlan(e) {
        console.log('handleMakePlan');
    };

    render() {
        const { listData, shop, template, loading,
            beginDateTime, endDateTime, selectedRowKeys,
            noYetOrderList } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        let noYetOrderText = noYetOrderList.join(' | ');
        let disablePrint = selectedRowKeys.length <= 0;
        return (
            <div>
                <div style={{ zIndex: 2, bottom: 0, left: 0, right: 0, position: 'fixed', width: '100%', height: 50, backgroundColor: 'lightgray' }}>
                    <Popconfirm
                        disabled={disablePrint}
                        title="确定生成并打印生产单？"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        onConfirm={this.handleMakePlan}>
                        <Button danger disabled={disablePrint} type='primary' style={{ width: 180, height: 30, marginLeft: 50, marginTop: 10 }}>生成并打印生产单</Button>
                    </Popconfirm>

                    <span style={{ marginLeft: 20, color: 'red', fontSize: 18, fontWeight: 'bold' }}>
                        {noYetOrderText}
                    </span>
                    <span style={{ marginLeft: 20, color: 'darkmagenta' }}>未报货</span>
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
            </div>
        );
    }
}

export default MakeProductionPlan;
