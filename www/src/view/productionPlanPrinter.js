import React from 'react';
import {
    Button,
    message,
    Spin
} from 'antd';
import { getProductOrderItems } from '../api/api';
import { findTemplateWithCache } from '../api/cache';
import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';

/**--------------------配置信息--------------------*/
const KForTest = false;

/// 排序优先级（格式为templateId-barcode）
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
                            item.items = orderItems.items;
                            for (let i = 0; i < orderItems.items.length; ++i) {
                                let templateAndBarcode = this._template.templateId + '-' + orderItems.items[i].barcode;
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

            /// 2.合并所有店的订货信息至生产车间
            this.setState({ productSpinTipText: '合并至生产车间...' })
            let totalOrderItem = {};
            totalOrderItem.orderShop = '000 - 弯麦(生产车间)';
            totalOrderItem.templateName = this._template.name;
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
                        let sortInfo = KSortIdArray[templateAndBarcode];
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

                /// 不加入每个门店，只保留合并后的车间 todo
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

    productPrintPreprew = () => {
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

    productPrintDirect = () => {
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
        const { allProductionDataToBePrint,
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
                                onClick={this.productPrintDirect}>
                                <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                                    直接打印
                                </div>
                            </Button>
                        </div>

                        <div id="printDiv" style={{ float: 'left', marginLeft: 10, borderStyle: 'dotted', width: 1379, height: 968 }}>
                            <div id="printTable" style={{ marginTop: 0, marginLeft: 0, width: 1375, height: 964, backgroundColor: 'transparent' }}>
                                {
                                    allProductionDataToBePrint.map((columnData) => {
                                        let productArray = columnData.items;
                                        let index = allProductionDataToBePrint.indexOf(columnData);
                                        return (
                                            <div key={index} style={{ float: 'left', zIndex: 10, backgroundColor: 'transparent', marginTop: 44, height: 920 }}>
                                                <div style={{ float: 'left', marginLeft: 0, width: 8, height: 920 }} />
                                                <table border='1' cellSpacing='0' cellPadding='2' style={{ float: 'left' }}>
                                                    <thead>
                                                        <tr>
                                                            <th colSpan='2' style={{ width: 318, textAlign: 'center' }}>
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
                                                            <th style={{ textAlign: 'center', fontWeight: 'bold' }}>数</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            productArray.map((productItem) => {
                                                                let serialNum = productArray.indexOf(productItem) + 1;
                                                                return (
                                                                    <tr key={serialNum}>
                                                                        <th key='1' style={{ height: 20, textAlign: 'center', fontSize: 16 }}>{productItem.orderProductName}</th>
                                                                        <th key='2' style={{ height: 20, textAlign: 'center', fontSize: 16 }}>{productItem.orderNumber !== 0 ? productItem.orderNumber : ''}</th>
                                                                    </tr>)
                                                            })
                                                        }
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <th colSpan='2'>{columnData.expectTime}</th>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                                <div style={{ float: 'left', marginLeft: 0, width: 8, height: 920 }} />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        );
    }
}

export default ProductionPlanPrinter;
