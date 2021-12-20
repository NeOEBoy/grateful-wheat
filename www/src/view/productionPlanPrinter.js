/*
打印生产单
*/

import React from 'react';
import {
    Button,
    message,
    Spin
} from 'antd';
import { getProductOrderItems } from '../api/api';
import { findTemplateWithCache } from '../api/cache';
import {
    getTest,
    getNeedlePrinterIndex,
    getPageName4NeedlePrinter,
    getProductSortIdArray,
    getJustPrintWorkshopTemplates
} from '../api/util';

import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';

/**--------------------配置信息--------------------*/
const KForTest = getTest();

/// 排序优先级（格式为templateId-barcode）
const KProductSortIdArray = getProductSortIdArray();

const KJustPrintWorkshopTemplates = getJustPrintWorkshopTemplates();

class ProductionPlanPrinter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            productSpinTipText: '打印生产单',
            productSpinning: false,
            allProductionDataToBePrint: [],
        }

        this._orderList = undefined;
        this._template = undefined;
        this._shop = undefined;
        this._beginDateTime = undefined;
        this._endDateTime = undefined;
    };

    componentDidMount = async () => {
        // console.log('componentDidMount begin');
        let query = this.props.query;
        let paramValueStr = query && query.get('param');
        if (paramValueStr) {
            // console.log(paramValueStr);
            paramValueStr = unescape(paramValueStr);
            // console.log(paramValueStr);
            let paramValueObj = JSON.parse(paramValueStr);
            this._template = paramValueObj.template;
            this._shop = paramValueObj.shop;
            this._beginDateTime = paramValueObj.beginDateTime;
            this._endDateTime = paramValueObj.endDateTime;
            this._orderList = paramValueObj.orderList;

            this.refresh();
        }
    };

    refresh = async () => {
        this.setState({ productSpinning: true, productSpinTipText: '准备打印...' }, async () => {
            let allData = [];

            /// 1.获取每家店的订货信息
            this.setState({ productSpinTipText: '准备获取...' });
            for (let index = 0; index < this._orderList.length; ++index) {
                let orderItem = this._orderList[index];
                if (orderItem) {
                    this.setState({ productSpinTipText: '获取' + orderItem.orderShop + '...' });
                    const orderItems = await getProductOrderItems(orderItem.orderId);
                    if (orderItems.errCode === 0 && orderItems.items) {
                        /// 1.1 合并同一订货门店同一模板订单的商品信息
                        let existInAllData = false; let i;
                        for (i = 0; i < allData.length; ++i) {
                            if (allData[i].orderShop === orderItem.orderShop &&
                                allData[i].templateName === orderItem.templateName) {
                                existInAllData = true;
                                break;
                            }
                        }
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
                                    let newItemObject = { ...toBeDealItem };

                                    theExistDataItems.push(newItemObject);
                                }
                            }
                        } else {
                            let item = {};
                            item.orderShop = orderItem.orderShop;
                            item.templateName = orderItem.templateName;
                            item.expectTime = orderItem.expectTime;
                            item.orderTime = orderItem.orderTime;
                            item.items = orderItems.items;
                            for (let i = 0; i < orderItems.items.length; ++i) {
                                let templateAndBarcode = this._template.templateId + '-' + orderItems.items[i].barcode;
                                let sortInfo = KProductSortIdArray[templateAndBarcode];
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

            /// 2.合并所有店的订货信息至生产车间
            this.setState({ productSpinTipText: '合并至生产车间...' })
            let totalOrderItem = {};
            totalOrderItem.orderShop = '000 - 弯麦(生产车间)';
            totalOrderItem.templateName = this._template.name;
            if (allData && allData.length > 0) {
                totalOrderItem.expectTime = allData[0].expectTime;
                totalOrderItem.orderTime = allData[0].orderTime;
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
                        let newItemObject = { ...itemObj };

                        totalItems.push(newItemObject);
                    }
                }
            }

            /// 3.使用模板对应商品
            let totalItemsAfterFixTemplate = totalItems;
            let findResult = await findTemplateWithCache(this._template.templateUid);
            if (findResult.errCode === 0 && findResult.list.length > 0) {
                // console.log(findResult.list);
                let findResultList = findResult.list;
                totalItemsAfterFixTemplate = [];
                for (let i = 0; i < findResultList.length; ++i) {
                    let pos = -1;
                    for (let j = 0; j < totalItems.length; ++j) {
                        if (findResultList[i].barcode === totalItems[j].barcode) {
                            pos = j;
                            break;
                        }
                    }

                    let newItemObject = {};
                    if (pos !== -1) {
                        newItemObject.categoryName = totalItems[pos].categoryName;
                        newItemObject.orderProductName = totalItems[pos].orderProductName;
                        newItemObject.barcode = totalItems[pos].barcode;
                        newItemObject.barcodeSimple = totalItems[pos].barcodeSimple;
                        newItemObject.sortId = totalItems[pos].sortId;
                        newItemObject.orderNumber = totalItems[pos].orderNumber;
                    } else {
                        newItemObject.categoryName = findResultList[i].categoryName;
                        newItemObject.orderProductName = findResultList[i].name;
                        newItemObject.barcode = findResultList[i].barcode;
                        newItemObject.barcodeSimple = findResultList[i].barcodeSimple;

                        let templateAndBarcode = this._template.templateId + '-' + newItemObject.barcode;
                        let sortInfo = KProductSortIdArray[templateAndBarcode];
                        newItemObject.sortId = sortInfo ? sortInfo : 200;

                        newItemObject.orderNumber = 0;
                    }

                    totalItemsAfterFixTemplate.push(newItemObject);
                }
            }

            /// 4.排序使得同一分类的放在一起
            let totalItemsAfterFixCategory = [];
            for (let i = 0; i < totalItemsAfterFixTemplate.length; ++i) {
                let oneItem = totalItemsAfterFixTemplate[i];

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
            /// 5.根据设定排序号再次排序
            totalItemsAfterFixCategory = totalItemsAfterFixCategory.sort((item1, item2) => {
                return item1.sortId - item2.sortId;
            });

            totalOrderItem.items = totalItemsAfterFixCategory;
            allData.unshift(totalOrderItem);

            /// 6.整理所有门店订货信息补上订货量是0的商品
            let allDataAfterFix0 = [];
            for (let i = 0; i < allData.length; ++i) {
                let allDataColumn = allData[i];
                if (allDataColumn.orderShop === '000 - 弯麦(生产车间)') {
                    allDataAfterFix0.push(allDataColumn);
                    continue;
                }

                /// 不加入每个门店，只保留合并后的车间
                if (KJustPrintWorkshopTemplates.indexOf(allDataColumn.templateName) !== -1) {
                    continue;
                }

                let oneDataObj = {};
                oneDataObj.orderShop = allDataColumn.orderShop;
                oneDataObj.templateName = allDataColumn.templateName;
                oneDataObj.expectTime = allDataColumn.expectTime;
                oneDataObj.orderTime = allDataColumn.orderTime;
                oneDataObj.items = [];
                for (let j = 0; j < totalOrderItem.items.length; ++j) {
                    let oneItem = totalOrderItem.items[j];
                    if (oneItem) {
                        let newItemObject = {};
                        newItemObject.categoryName = oneItem.categoryName;
                        newItemObject.orderProductName = oneItem.orderProductName;
                        newItemObject.barcode = oneItem.barcode;
                        newItemObject.barcodeSimple = oneItem.barcodeSimple;
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

            /// 7.整理订货信息使得适合A4打印
            let allDataAfterA4 = [];
            for (let i = 0; i < allDataAfterFix0.length; ++i) {
                let allDataItem = allDataAfterFix0[i].items;
                for (let j = 0; j < allDataItem.length; ++j) {
                    if (j % 29 === 0) {
                        let allDataAfterItem = {};
                        allDataAfterItem.orderShop = allDataAfterFix0[i].orderShop;
                        allDataAfterItem.templateName = allDataAfterFix0[i].templateName;
                        allDataAfterItem.expectTime = allDataAfterFix0[i].expectTime;
                        allDataAfterItem.orderTime = allDataAfterFix0[i].orderTime;
                        allDataAfterItem.items = [];

                        allDataAfterA4.push(allDataAfterItem);
                    }
                    allDataAfterA4[allDataAfterA4.length - 1].items.push(allDataItem[j]);
                }
            }
            this.setState({ productSpinning: false, productSpinTipText: '', allProductionDataToBePrint: allDataAfterA4 });

            // console.log(allDataAfterA4);
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

    handleBack = (e) => {
        let paramValueObj = {};
        paramValueObj.template = this._template;
        paramValueObj.shop = this._shop;
        paramValueObj.beginDateTime = this._beginDateTime;
        paramValueObj.endDateTime = this._endDateTime;

        let paramValueStr = JSON.stringify(paramValueObj);
        // console.log('paramValueStr = ' + paramValueStr);

        let paramStr = 'param=' + escape(paramValueStr);

        let orderManagementUrl = 'http://localhost:4000/orderManagement';
        if (!KForTest) orderManagementUrl = 'http://gratefulwheat.ruyue.xyz/orderManagement';

        orderManagementUrl += '?';
        orderManagementUrl += paramStr;
        window.location.replace(orderManagementUrl);
    };

    render() {
        const {
            allProductionDataToBePrint,
            productSpinTipText,
            productSpinning
        } = this.state;

        return (
            <Spin tip={productSpinTipText} spinning={productSpinning} size='large'>
                <div>
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
                            <span style={{ marginLeft: 10, fontSize: 12, color: 'green' }}>{`订货时间：${allProductionDataToBePrint && allProductionDataToBePrint.length > 0 && allProductionDataToBePrint[0].orderTime}`}</span>
                            <span style={{ marginLeft: 20, fontSize: 12, color: 'green' }}>{`期望到货：${allProductionDataToBePrint && allProductionDataToBePrint.length > 0 && allProductionDataToBePrint[0].expectTime}`}</span>
                            <div id="printDiv" style={{ marginLeft: 10, borderStyle: 'dotted', width: 420, height: 980 }}>
                                <div id="printTable" style={{ marginTop: 0, marginLeft: 0, width: 410, height: 949, backgroundColor: 'transparent' }}>
                                    {
                                        allProductionDataToBePrint.map((columnData) => {
                                            let productArray = columnData.items;
                                            let index = allProductionDataToBePrint.indexOf(columnData);
                                            return (
                                                <div key={index} style={{ float: 'left', zIndex: 10, backgroundColor: 'transparent', marginTop: 10, height: 949 }}>
                                                    <div style={{ float: 'left', marginLeft: 0, width: 38, height: 949, backgroundColor: 'transparent' }} />
                                                    <table border='1' cellSpacing='0' style={{ float: 'left', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr>
                                                                <th colSpan='2' style={{ width: 318, textAlign: 'center', backgroundColor: 'lightyellow' }}>
                                                                    {columnData.orderShop}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan='2' style={{ textAlign: 'center' }}>
                                                                    {columnData.templateName}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th style={{ textAlign: 'center', fontWeight: 'bold' }}>品名</th>
                                                                <th style={{ textAlign: 'center', fontWeight: 'bold' }}>订货量</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                productArray.map((productItem) => {
                                                                    let serialNum = productArray.indexOf(productItem) + 1;
                                                                    let orderNumberBGcolor = productItem.orderNumber > 1000 ? 'red' : 'transparent';
                                                                    return (
                                                                        <tr key={serialNum}>
                                                                            <th key='1' style={{ height: 20, textAlign: 'center', fontSize: 16 }}>{productItem.orderProductName}</th>
                                                                            <th key='2' style={{ height: 20, textAlign: 'center', fontWeight: 'lighter', fontSize: 20, backgroundColor: orderNumberBGcolor }}>{productItem.orderNumber !== 0 ? productItem.orderNumber : ''}</th>
                                                                        </tr>)
                                                                })
                                                            }
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <th colSpan='2'>{`订货时间：${columnData.orderTime}`}</th>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan='2'>{`期望到货：${columnData.expectTime}`}</th>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                    <div style={{ float: 'left', marginLeft: 0, width: 38, height: 949, backgroundColor: 'transparent' }} />
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        );
    }
}

export default ProductionPlanPrinter;
