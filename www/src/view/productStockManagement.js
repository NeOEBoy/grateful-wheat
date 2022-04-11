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
                if (loadResult.errCode === 0 &&
                    loadResult.list.length > 0) {
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
            <div style={{ marginLeft: 20, marginTop: 20, marginRight: 20 }}>
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
                    <Button size="small" style={{ width: 160 }} onClick={e => e.preventDefault()}>
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
