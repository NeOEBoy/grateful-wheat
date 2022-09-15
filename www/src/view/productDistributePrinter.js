/*
打印配货单
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
    getPageName4A4Printer,
    getA4PrinterIndex,
    getOrderTemplates,
    getProductSortIdArray,
    getTemplateSortIdArray
} from '../api/util';

/**--------------------配置信息--------------------*/
const KForTest = getTest();

/// 模板信息
const KOrderTemplates = getOrderTemplates();
/// 排序优先级（格式为templateId-barcode）
const KProductSortIdArray = getProductSortIdArray();
const KTemplateSortIdArray = getTemplateSortIdArray();

class ProductDistributePrinter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allDistributionDataToBePrint: [],
            productSpinTipText: '',
            productSpinning: false
        }
        this._template = undefined;
        this._timeType = undefined;
        this._shop = undefined;
        this._beginDateTime = undefined;
        this._endDateTime = undefined;
    };

    componentDidMount = async () => {
        // console.log('componentDidMount begin');
        let query = this.props.query;
        let paramValueStr = query && query.get('param');
        // console.log(paramValueStr);
        if (paramValueStr) {
            paramValueStr = unescape(paramValueStr);
            // console.log(paramValueStr);
            let paramValueObj = JSON.parse(paramValueStr);
            this._template = paramValueObj.template;
            this._timeType = paramValueObj.timeType;
            this._shop = paramValueObj.shop;
            this._beginDateTime = paramValueObj.beginDateTime;
            this._endDateTime = paramValueObj.endDateTime;
            this._orderList = paramValueObj.orderList;
            // console.log(this._orderList);
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

                    this.setState({ productSpinTipText: '获取' + orderItem.templateName + '...' });
                    const orderItems = await getProductOrderItems(orderItem.orderId);
                    if (orderItems.errCode === 0 && orderItems.items) {
                        let templatePos = -1;
                        for (let kk = 0; kk < KOrderTemplates.length; ++kk) {
                            if (KOrderTemplates[kk].name === orderItem.templateName) {
                                templatePos = kk;
                                break;
                            }
                        }
                        if (templatePos === -1) return;

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
                                    let newItemObject = {};
                                    newItemObject.categoryName = toBeDealItem.categoryName;
                                    newItemObject.orderProductName = toBeDealItem.orderProductName;
                                    newItemObject.barcode = toBeDealItem.barcode;
                                    newItemObject.barcodeSimple = toBeDealItem.barcodeSimple;
                                    newItemObject.barcodeMiddle = toBeDealItem.barcodeMiddle;
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
                            item.orderTime = orderItem.orderTime;
                            item.items = orderItems.items;
                            for (let i = 0; i < orderItems.items.length; ++i) {
                                let templateAndBarcode = KOrderTemplates[templatePos].templateId + '-' + orderItems.items[i].barcode;
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

            /// 2.使用模板对应商品
            this.setState({ productSpinTipText: '整理模板中...' });
            let newAllData = [];
            for (let i = 0; i < allData.length; ++i) {
                let allDataItems = allData[i].items;
                let totalItemsAfterFixTemplate = allDataItems;

                let templatePos = -1;
                for (let kk = 0; kk < KOrderTemplates.length; ++kk) {
                    if (KOrderTemplates[kk].name === allData[i].templateName) {
                        templatePos = kk;
                        break;
                    }
                }
                if (templatePos === -1) return;

                let findResult = await findTemplateWithCache(KOrderTemplates[templatePos].templateUid);
                // console.log(findResult);
                if (findResult.errCode === 0 && findResult.list.length > 0) {
                    let findResultList = findResult.list;
                    totalItemsAfterFixTemplate = [];
                    for (let j = 0; j < findResultList.length; ++j) {
                        let pos = -1;
                        for (let mm = 0; mm < allDataItems.length; ++mm) {
                            if (findResultList[j].barcode === allDataItems[mm].barcode) {
                                pos = mm;
                                break;
                            }
                        }

                        let newItemObject = {};
                        if (pos !== -1) {
                            newItemObject.categoryName = allDataItems[pos].categoryName;
                            newItemObject.orderProductName = allDataItems[pos].orderProductName;
                            newItemObject.barcode = allDataItems[pos].barcode;
                            newItemObject.barcodeSimple = allDataItems[pos].barcodeSimple;
                            newItemObject.barcodeMiddle = allDataItems[pos].barcodeMiddle;
                            newItemObject.sortId = allDataItems[pos].sortId;
                            newItemObject.orderNumber = allDataItems[pos].orderNumber;
                        } else {
                            newItemObject.categoryName = findResultList[j].categoryName;
                            newItemObject.orderProductName = findResultList[j].name;
                            newItemObject.barcode = findResultList[j].barcode;
                            newItemObject.barcodeSimple = findResultList[j].barcodeSimple;
                            newItemObject.barcodeMiddle = findResultList[j].barcodeMiddle;
                            let templateAndBarcode = KOrderTemplates[templatePos].templateId + '-' + findResultList[j].barcode;
                            let sortInfo = KProductSortIdArray[templateAndBarcode];
                            newItemObject.sortId = sortInfo ? sortInfo : 200;

                            newItemObject.orderNumber = 0;
                        }

                        totalItemsAfterFixTemplate.push(newItemObject);
                    }
                    // console.log(totalItemsAfterFixTemplate);
                    /// 排序使得同一分类的放在一起
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
                    // console.log(totalItemsAfterFixCategory);
                    /// 根据设定排序号再次排序
                    totalItemsAfterFixCategory = totalItemsAfterFixCategory.sort((item1, item2) => {
                        return item1.sortId - item2.sortId;
                    });
                    // console.log(totalItemsAfterFixCategory);

                    let oneDataObj = {};
                    oneDataObj.orderShop = allData[i].orderShop;
                    oneDataObj.templateName = allData[i].templateName;
                    oneDataObj.expectTime = allData[i].expectTime;
                    oneDataObj.orderTime = allData[i].orderTime;
                    oneDataObj.items = totalItemsAfterFixCategory;

                    newAllData.push(oneDataObj);
                }
            }

            /// 3.排序订货信息
            // console.log(newAllData);
            this.setState({ productSpinTipText: '排序中...' });
            let allDataAfterSort = [];
            for (let i = 0; i < newAllData.length; ++i) {
                let allDataOneItem = newAllData[i];
                allDataOneItem.sortId = KTemplateSortIdArray[allDataOneItem.templateName];
                allDataAfterSort.push(allDataOneItem);
            }

            allDataAfterSort = allDataAfterSort.sort((item1, item2) => {
                return item1.sortId - item2.sortId;
            });

            /// 4.整理订货信息使得适合A4打印
            this.setState({ productSpinTipText: '整理A4中...' });
            let allDataAfterA4 = [];
            for (let i = 0; i < allDataAfterSort.length; ++i) {
                let allDataItem = allDataAfterSort[i].items;
                for (let j = 0; j < allDataItem.length; ++j) {
                    if (j % 29 === 0) {///29
                        let allDataAfterItem = {};
                        allDataAfterItem.orderShop = allDataAfterSort[i].orderShop;
                        allDataAfterItem.templateName = allDataAfterSort[i].templateName;
                        allDataAfterItem.expectTime = allDataAfterSort[i].expectTime;
                        allDataAfterItem.orderTime = allDataAfterSort[i].orderTime;
                        allDataAfterItem.items = [];

                        allDataAfterA4.push(allDataAfterItem);
                    }
                    allDataAfterA4[allDataAfterA4.length - 1].items.push(allDataItem[j]);
                }
            }
            // console.log(allDataAfterA4);
            this.setState({ productSpinning: false, productSpinTipText: '', allDistributionDataToBePrint: allDataAfterA4 });
        });
    };

    getLodopAfterInit = async () => {
        /// 动态引入组件
        let {
            getLodop
        } = await import('./Lodop6.226_Clodop4.127/LodopFuncs');
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            let strStyle =
                `<style>
                </style> `;

            LODOP.SET_PRINTER_INDEX(getA4PrinterIndex(LODOP));
            LODOP.SET_PRINT_PAGESIZE(2, 0, 0, getPageName4A4Printer());
            LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 800, 600, '');
            LODOP.SET_SHOW_MODE("LANDSCAPE_DEFROTATED", 1);//横向时的正向显示
            LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);//打印后自动关闭预览窗口
            LODOP.ADD_PRINT_HTM(0, 0, "100%", '100%', strStyle + document.getElementById("printDiv").innerHTML);
        }

        return LODOP;
    };

    productPrintPreprew = async () => {
        let LODOP = await this.getLodopAfterInit();

        if (LODOP) {
            LODOP.PREVIEW();
        }
    };

    productPrintDirect = async () => {
        let LODOP = await this.getLodopAfterInit();

        if (LODOP) {
            LODOP.PRINT();
        }
    };

    productPrintDirectAndBack = async () => {
        await this.productPrintDirect();
        this.handleBack();
    };

    handleBack = (e) => {
        let paramValueObj = {};
        paramValueObj.template = this._template;
        paramValueObj.timeType = this._timeType;
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
        const { allDistributionDataToBePrint,
            productSpinTipText,
            productSpinning } = this.state;

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
                            <span style={{ marginLeft: 10, fontSize: 12, color: 'green' }}>{`订货时间：${allDistributionDataToBePrint && allDistributionDataToBePrint.length > 0 && allDistributionDataToBePrint[0].orderTime}`}</span>
                            <span style={{ marginLeft: 20, fontSize: 12, color: 'green' }}>{`期望到货：${allDistributionDataToBePrint && allDistributionDataToBePrint.length > 0 && allDistributionDataToBePrint[0].expectTime}`}</span>
                            <div id="printDiv" style={{ marginLeft: 10, borderStyle: 'dotted', width: 1379, height: 968 }}>
                                <div id="printTable" style={{ marginTop: 0, marginLeft: 28, width: 1375, height: 964, backgroundColor: 'transparent' }}>
                                    {
                                        allDistributionDataToBePrint.map((columnData) => {
                                            let productArray = columnData.items;
                                            let index = allDistributionDataToBePrint.indexOf(columnData);
                                            return (
                                                <div key={index} style={{ float: 'left', zIndex: 10, backgroundColor: 'transparent', marginTop: 44, height: 920 }}>
                                                    <div style={{ float: 'left', marginLeft: 0, width: 2, height: 920 }} />
                                                    <table border='1' cellSpacing='0' style={{ float: 'left', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr>
                                                                <th colSpan='7' style={{ width: 175, textAlign: 'center', backgroundColor: 'lightgrey' }}>
                                                                    {columnData.orderShop}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan='7' style={{ width: 175, textAlign: 'center' }}>
                                                                    {columnData.templateName}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th style={{ textAlign: 'center', fontSize: 14 }}>简码</th>
                                                                <th style={{ textAlign: 'center' }}>品名</th>
                                                                <th style={{ textAlign: 'center', fontSize: 10 }}>订货量</th>
                                                                <th style={{ textAlign: 'center' }}>一</th>
                                                                <th style={{ textAlign: 'center' }}>二</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                productArray.map((productItem) => {
                                                                    let serialNum = productArray.indexOf(productItem) + 1;
                                                                    let orderNumberBGcolor = productItem.orderNumber > 1000 ? 'red' : 'transparent';
                                                                    return (
                                                                        <tr key={serialNum} style={{ height: 24 }}>
                                                                            {columnData.orderShop === '001 - 弯麦(教育局店)' ?
                                                                                (<th key='1' style={{ textAlign: 'center', fontSize: 16, width: 16 }}>{productItem.barcodeMiddle}</th>)
                                                                                :
                                                                                (<th key='1' style={{ textAlign: 'center', fontSize: 16, width: 16 }}>{productItem.barcodeSimple}</th>)}
                                                                            <th key='2' style={{ textAlign: 'center', fontSize: 15, width: 125 }}>{productItem.orderProductName}</th>
                                                                            <th key='3' style={{ textAlign: 'center', fontSize: 16, width: 8, backgroundColor: orderNumberBGcolor }}>{productItem.orderNumber !== 0 ? productItem.orderNumber : ''}</th>
                                                                            <th key='4' style={{ textAlign: 'center', fontSize: 16, width: 8 }}></th>
                                                                            <th key='5' style={{ textAlign: 'center', fontSize: 16, width: 8 }}></th>
                                                                        </tr>)
                                                                })
                                                            }
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <th colSpan='7' style={{ fontSize: 14 }}>{`订货时间：${columnData.orderTime}`}</th>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan='7' style={{ fontSize: 14 }}>{`期望到货：${columnData.expectTime}`}</th>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                    <div style={{ float: 'left', marginLeft: 0, width: 2, height: 920 }} />
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
    };
};

export default ProductDistributePrinter;
