/*
打印生产单
*/
import React from 'react';
import {
    Button,
    Spin
} from 'antd';
import { getProductOrderItems } from '../api/api';
import {
    getWWWHost,
    getNeedlePrinterIndex,
    getPageName4NeedlePrinter,
    getCategory4ProductPlanPrint
} from '../api/util';
import {
    getLodop
} from './Lodop6.226_Clodop4.127/LodopFuncs';
import moment from 'moment';
/**--------------------配置信息--------------------*/
const KCategory4ProductPlanPrint = getCategory4ProductPlanPrint();

class ProductionPlanPrinter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allProductionDataToBePrint: [],
            productSpinTipText: '打印生产单1',
            productSpinning: false,
            paramObj: {}
        }
    };

    componentDidMount = async () => {
        let query = this.props.query;
        let paramValueStr = query && query.get('param');
        if (paramValueStr) {
            paramValueStr = unescape(paramValueStr);
            let paramValueObj = JSON.parse(paramValueStr);
            this.setState({ paramObj: paramValueObj }, () => {
                this.refresh();
            });
        }
    };

    refresh = async () => {
        const { paramObj } = this.state;
        this.setState({
            productSpinning: true,
            productSpinTipText: '准备打印...'
        }, async () => {
            let productItems = [];

            /// 1.获取各个门店订货信息并合并订货数量
            for (let i = 0; i < paramObj.orderList.length; ++i) {
                let orderItem = paramObj.orderList[i];
                if (orderItem) {
                    this.setState({
                        productSpinTipText: `获取<<${orderItem.orderShop}>>-${orderItem.orderId}...`
                    });
                    const productOrderResult = await getProductOrderItems(orderItem.orderId);
                    // console.log('orderItem = ' + JSON.stringify(orderItem))
                    if (productOrderResult.errCode === 0 && productOrderResult.items) {
                        for (let j = 0; j < productOrderResult.items.length; ++j) {
                            let product = productOrderResult.items[j];
                            let existIndex = -1;
                            for (let k = 0; k < productItems.length; ++k) {
                                let productInItems = productItems[k];
                                if (productInItems.barcode === product.barcode) {
                                    existIndex = k;
                                    break;
                                }
                            }
                            if (existIndex !== -1) {
                                productItems[existIndex].orderNumber += product.orderNumber;
                            } else {
                                product.key = productItems.length;
                                productItems.push(product);
                            }
                        }
                    }
                }
            }
            // console.log('productItems = ' + JSON.stringify(productItems));

            /// 2.根据商品类型进行分组
            let categoryItems = [];
            for (let i = 0; i < productItems.length; ++i) {
                let product = productItems[i];
                let existJ = -1;
                for (let j = 0; j < categoryItems.length; ++j) {
                    let category = categoryItems[j];
                    if (category.name === product.categoryName) {
                        existJ = j;
                        break;
                    }
                }
                if (existJ !== -1) {
                    product.key = categoryItems[existJ].items.length;
                    categoryItems[existJ].items.push(product);
                } else {
                    product.key = 0;
                    let newCategory = {};
                    newCategory.name = product.categoryName;
                    newCategory.key = categoryItems.length;
                    newCategory.items = [product];
                    categoryItems.push(newCategory);
                }
            }
            // console.log('categoryItems = ' + JSON.stringify(categoryItems));

            /// 3.根据配置信息再次进行合并分组，比如:西点慕斯和小蛋糕类别合并为裱花间分组
            let category4ProductPlan = [];
            for (let i = 0; i < KCategory4ProductPlanPrint.length; ++i) {
                let categoryGroupItems = KCategory4ProductPlanPrint[i];

                let newCategoryGroupItems = {};
                newCategoryGroupItems.key = category4ProductPlan.length;
                newCategoryGroupItems.pDepartment = categoryGroupItems.pDepartment;
                newCategoryGroupItems.items = [];

                for (let j = 0; j < categoryGroupItems.pCategory.length; ++j) {
                    let categoryGroupItem = categoryGroupItems.pCategory[j];
                    for (let k = 0; k < categoryItems.length; ++k) {
                        let categoryItem = categoryItems[k];
                        if (categoryItem.name === categoryGroupItem) {
                            let newCategoryItem = {};
                            newCategoryItem.key = newCategoryGroupItems.items.length;
                            newCategoryItem.categoryName = categoryGroupItem;
                            newCategoryItem.categoryItems = categoryItem.items;
                            newCategoryGroupItems.items.push(newCategoryItem);
                            break;
                        }
                    }
                }
                category4ProductPlan.push(newCategoryGroupItems);
            }
            // console.log('category4ProductPlan = ' + JSON.stringify(category4ProductPlan));

            this.setState({
                productSpinning: false,
                productSpinTipText: '',
                allProductionDataToBePrint: category4ProductPlan
            });
        });
    };

    getLodopAfterInit = () => {
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            let strStyle =
                `<style>
                </style> `;
            LODOP.SET_PRINTER_INDEX(getNeedlePrinterIndex(LODOP));
            LODOP.SET_PRINT_PAGESIZE(2, 0, 0, getPageName4NeedlePrinter());
            LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 800, 600, '');
            LODOP.SET_PRINT_COPIES(1);
            LODOP.SET_SHOW_MODE("LANDSCAPE_DEFROTATED", 1);//横向时的正向显示
            LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);//打印后自动关闭预览窗口
            LODOP.ADD_PRINT_HTM(0, 0, "100%", '100%', strStyle + document.getElementById("printDiv").innerHTML);
        }

        return LODOP;
    };

    productPrintPreprew = () => {
        let LODOP = this.getLodopAfterInit();

        if (LODOP) {
            LODOP.PREVIEW();
        }
    };

    productPrintDirect = () => {
        let LODOP = this.getLodopAfterInit();

        if (LODOP) {
            LODOP.PRINT();
        }
    };

    productPrintDirectAndBack = () => {
        this.productPrintDirect();
        this.handleBack();
    };

    handleBack = () => {
        const { paramObj } = this.state;
        let paramValueObj = paramObj;
        let paramValueStr = JSON.stringify(paramValueObj);
        let paramStr = 'param=' + escape(paramValueStr);
        let orderManagementUrl = getWWWHost() + '/orderManagement1';
        orderManagementUrl += '?';
        orderManagementUrl += paramStr;
        window.location.replace(orderManagementUrl);
    };

    render() {
        const {
            paramObj,
            allProductionDataToBePrint,
            productSpinTipText,
            productSpinning
        } = this.state;

        return (
            <div style={{ marginLeft: 10, marginTop: 10 }}>
                <div id="printConfig"
                    style={{ float: 'left', borderStyle: 'none', width: 90 }}>
                    <div>
                        <Button type="primary"
                            style={{ width: 90, height: 80 }}
                            onClick={(e) => this.handleBack(e)}>
                            <div style={{ fontSize: 16 }}>
                                后退
                            </div>
                        </Button>
                    </div>
                    <Button type="primary"
                        style={{ marginTop: 10, width: 90, height: 80 }}
                        onClick={this.productPrintPreprew}>
                        <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                            打印预览
                        </div>
                    </Button>
                    <Button type="primary" danger
                        style={{ marginTop: 10, width: 90, height: 80 }}
                        onClick={this.productPrintDirectAndBack}>
                        <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                            直接打印
                        </div>
                    </Button>
                </div>

                <div style={{ float: 'left' }}>
                    <span style={{ marginLeft: 10, fontSize: 12, color: 'green' }}>{`时间类型：${paramObj && paramObj.timeType && paramObj.timeType.name}`}</span>
                    <span style={{ marginLeft: 20, fontSize: 12, color: 'green' }}>{`开始时间：${paramObj && moment(paramObj.beginDateTime).format('YYYY.MM.DD HH:mm:ss')}`}</span>
                    <span style={{ marginLeft: 20, fontSize: 12, color: 'green' }}>{`结束时间：${paramObj && moment(paramObj.endDateTime).format('YYYY.MM.DD HH:mm:ss')}`}</span>
                    <Spin tip={productSpinTipText} spinning={productSpinning} size='large'>
                        <div id="printDiv" style={{ marginLeft: 10, borderStyle: 'dotted', width: 420, height: 980 }}>
                            <div id="printTable" style={{ marginTop: 0, marginLeft: 0, width: 410, height: 949, backgroundColor: 'transparent' }}>
                                {
                                    allProductionDataToBePrint.map((columnData) => {
                                        return columnData.items.length > 0 ? (
                                            <div key={columnData.key} style={{ float: 'left', zIndex: 10, backgroundColor: 'transparent', marginTop: 10, height: 949 }}>
                                                <div style={{ float: 'left', marginLeft: 0, width: 38, height: 949, backgroundColor: 'transparent' }} />
                                                <table border='1' cellSpacing='0' style={{ float: 'left', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th colSpan='2' style={{ fontSize: 24, width: 318, textAlign: 'center', backgroundColor: 'lightyellow' }}>
                                                                {`${columnData.pDepartment}`}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    {
                                                        columnData.items.map((categoryGroupItem) => {
                                                            return (
                                                                <tbody key={categoryGroupItem.key}>
                                                                    <tr>
                                                                        <th>
                                                                            <table border='0' cellSpacing='0' style={{ float: 'left', borderCollapse: 'collapse' }}>
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th colSpan='2' style={{ fontSize: 20, width: 318, textAlign: 'center', backgroundColor: 'lightyellow' }}>
                                                                                            {categoryGroupItem.categoryName}
                                                                                        </th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>品名</th>
                                                                                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>订货量</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {
                                                                                        categoryGroupItem.categoryItems.map((productItem) => {
                                                                                            return (
                                                                                                <tr key={productItem.key}>
                                                                                                    <th key='1' style={{ textAlign: 'center', fontWeight: 'lighter', fontSize: 20 }}>{productItem.orderProductName}</th>
                                                                                                    <th key='2' style={{ textAlign: 'center', fontWeight: 'lighter', fontSize: 22, }}>{productItem.orderNumber}</th>
                                                                                                </tr>)
                                                                                        })
                                                                                    }
                                                                                </tbody>
                                                                            </table>
                                                                        </th>

                                                                    </tr>
                                                                </tbody>
                                                            );
                                                        })
                                                    }

                                                    <tfoot>
                                                        <tr>
                                                            <th colSpan='2' style={{ fontSize: 18 }}>{`时间类型：${paramObj && paramObj.timeType && paramObj.timeType.name}`}</th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan='2' style={{ fontSize: 18 }}>{`开始时间：${paramObj && moment(paramObj.beginDateTime).format('YYYY.MM.DD HH:mm:ss')}`}</th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan='2' style={{ fontSize: 18 }}>{`结束时间：${paramObj && moment(paramObj.endDateTime).format('YYYY.MM.DD HH:mm:ss')}`}</th>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                                <div style={{ float: 'left', marginLeft: 0, width: 38, height: 949, backgroundColor: 'transparent' }} />
                                            </div>
                                        ) : (<div key={columnData.key}></div>)
                                    })
                                }
                            </div>
                        </div>
                    </Spin>
                    <div style={{ height: 30 }}></div>
                </div>
            </div>
        );
    }
}

export default ProductionPlanPrinter;
