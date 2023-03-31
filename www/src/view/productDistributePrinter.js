/*
打印配货单
*/
import React from 'react';
import {
    Button,
    message,
    Spin,
    Modal,
    Table,
    DatePicker
} from 'antd';
import moment from 'moment';
import { getProductOrderItems } from '../api/api';
import { findTemplateWithCache } from '../api/cache';
import {
    getWWWHost,
    getPageName4A4Printer,
    getA4PrinterIndex,
    getLabelPrinterIndex,
    getOrderTemplates,
    getProductSortIdArray,
    getTemplateSortIdArray
} from '../api/util';
import {
    getLodop
} from './Lodop6.226_Clodop4.127/LodopFuncs';

/**--------------------配置信息--------------------*/
/// 模板信息
const KOrderTemplates = getOrderTemplates();
/// 排序优先级（格式为templateId-barcode）
const KProductSortIdArray = getProductSortIdArray();
const KTemplateSortIdArray = getTemplateSortIdArray();

/// 标签打印状态
const KLabelPrintState = {
    prepare: '准备中',
    running: '运行中',
    pause: '暂停中',
    complete: '已完成',
    cancel: '取消',
    error: '出错'
}

class ProductDistributePrinter extends React.Component {
    constructor(props) {
        super(props);



        this.state = {
            allDistributionDataToBePrint: [],
            productSpinTipText: '',
            productSpinning: false,

            productLabelPrintModalVisible: false,
            productLabelPrintState: KLabelPrintState.prepare,

            productLabelPrintTemplateList: [],
            selectedRowKeys4LabelPrintTemplateList: [],
            selectedRows4LabelPrintTemplateList: [],

            productLabelPrintProductionDate: moment(),
            productLabelPrintProductionTime: moment(),
            productLabelPrintProductionTimePopupOpen: false,
            productLabelPrintProductionTemplate: {},
        }
        this._template = undefined;
        this._orderType = undefined;
        this._orderCashier = undefined;
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
            this._orderType = paramValueObj.orderType;
            this._orderCashier = paramValueObj.orderCashier;
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
                    /// 不是通过模板订货的
                    if (orderItem.templateName === '-') {
                        this.setState({ productSpinning: false, productSpinTipText: '存在未通过模板报货的订单' });
                        message.error('存在未通过模板报货的订单，请返回重新选择！！！');
                        return;
                    }

                    this.setState({ productSpinTipText: '获取' + orderItem.templateName + '-' + orderItem.orderId + '...' });
                    const orderItems = await getProductOrderItems(orderItem.orderId);
                    // console.log('orderItems = ' + JSON.stringify(orderItems));
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
                            /// 联营店，使用orderShop，templateName，orderType区分联营门店
                            /// 非联营店，使用orderShop，templateName，区分门店
                            if (orderItem.orderShop === '007 - 弯麦(联营店)') {
                                if (allData[i].orderShop === orderItem.orderShop &&
                                    allData[i].templateName === orderItem.templateName &&
                                    allData[i].orderType === orderItem.orderType &&
                                    allData[i].orderCashier === orderItem.orderCashier) {
                                    existInAllData = true;
                                    break;
                                }
                            } else {
                                if (allData[i].orderShop === orderItem.orderShop &&
                                    allData[i].templateName === orderItem.templateName) {
                                    existInAllData = true;
                                    break;
                                }
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
                                    newItemObject.transferPrice = toBeDealItem.transferPrice;
                                    newItemObject.qualityDay = toBeDealItem.qualityDay;
                                    newItemObject.ingredients = toBeDealItem.ingredients;

                                    theExistDataItems.push(newItemObject);
                                }
                            }
                        } else {
                            let item = {};
                            item.orderShop = orderItem.orderShop;
                            item.templateName = orderItem.templateName;
                            item.expectTime = orderItem.expectTime;
                            item.orderTime = orderItem.orderTime;
                            item.orderType = orderItem.orderType;
                            item.orderCashier = orderItem.orderCashier;
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
                            newItemObject.transferPrice = allDataItems[pos].transferPrice;
                            newItemObject.qualityDay = allDataItems[pos].qualityDay;
                            newItemObject.ingredients = allDataItems[pos].ingredients;
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
                    oneDataObj.orderType = allData[i].orderType;
                    oneDataObj.orderCashier = allData[i].orderCashier;
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
                        allDataAfterItem.orderType = allDataAfterSort[i].orderType;
                        allDataAfterItem.orderCashier = allDataAfterSort[i].orderCashier;
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

    handleBack = (e) => {
        let paramValueObj = {};
        paramValueObj.template = this._template;
        paramValueObj.orderType = this._orderType;
        paramValueObj.orderCashier = this._orderCashier;
        paramValueObj.timeType = this._timeType;
        paramValueObj.shop = this._shop;
        paramValueObj.beginDateTime = this._beginDateTime;
        paramValueObj.endDateTime = this._endDateTime;

        let paramValueStr = JSON.stringify(paramValueObj);
        // console.log('paramValueStr = ' + paramValueStr);

        let paramStr = 'param=' + escape(paramValueStr);

        let orderManagementUrl = getWWWHost() + '/orderManagement';

        orderManagementUrl += '?';
        orderManagementUrl += paramStr;
        window.location.replace(orderManagementUrl);
    };

    getLodopAfterInit = () => {
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            let strStyle =
                `<style>
                </style> `;

            LODOP.SET_PRINTER_INDEX(getA4PrinterIndex(LODOP));
            LODOP.SET_PRINT_PAGESIZE(2, 0, 0, getPageName4A4Printer());
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

    productLabelPrintStart = async () => {
        let productLabelPrintTemplateList = [];
        const { allDistributionDataToBePrint } = this.state;
        for (let i = 0; i < allDistributionDataToBePrint.length; ++i) {
            let templateName = allDistributionDataToBePrint[i].templateName;
            if (templateName) {
                let item = {};
                item.key = i + 1;
                item.templateName = templateName;
                item.printProgress = '';
                productLabelPrintTemplateList.push(item);
            }
        }
        const {
            productLabelPrintProductionDate,
            productLabelPrintProductionTime
        } = this.state;
        this.setState({
            productLabelPrintTemplateList: productLabelPrintTemplateList,
            productLabelPrintModalVisible: true,
            selectedRowKeys4LabelPrintTemplateList: [],
            selectedRows4LabelPrintTemplateList: [],
            productLabelPrintState: KLabelPrintState.prepare,
            productLabelPrintProductionTemplate: {
                name: '<弯麦-产品名称>',
                barcode: '<123456789111>',
                ingredients: '配料表：<配料1 配料2 配料3>',
                productLabelPrintProductionDateAndTime:
                    '生产日期：' + productLabelPrintProductionDate.format('MM/DD') +
                    productLabelPrintProductionTime.format(' HH:mm'),
                qualityDay: '保质期：<3天>',
                price: '¥<12.0>'
            }
        });
    };

    startOrContinueLabelPrint = async (templateIndex, itemIndex, orderNumberIndex) => {
        this.setState({
            productLabelPrintState: KLabelPrintState.running
        });

        const { allDistributionDataToBePrint,
            selectedRows4LabelPrintTemplateList,
            productLabelPrintProductionDate,
            productLabelPrintProductionTime } = this.state;
        for (let i = templateIndex; i < allDistributionDataToBePrint.length; ++i) {
            let templateName = allDistributionDataToBePrint[i].templateName;

            let pos = -1;
            for (let pos1 = 0; pos1 < selectedRows4LabelPrintTemplateList.length; ++pos1) {
                let name = selectedRows4LabelPrintTemplateList[pos1].templateName;
                if (templateName === name) {
                    pos = pos1;
                    break;
                }
            }
            if (pos !== -1) {
                let items = allDistributionDataToBePrint[i].items;
                for (let j = itemIndex; j < items.length; ++j) {
                    let product = items[j];
                    let orderProductName = product.orderProductName;
                    let orderNumber = product.orderNumber;
                    let barcode = product.barcode;
                    let transferPrice = product.transferPrice;
                    let qualityDay = product.qualityDay;
                    let ingredients = product.ingredients;

                    if (orderNumber > 0) {
                        for (let z = orderNumberIndex; z < orderNumber; ++z) {
                            selectedRows4LabelPrintTemplateList[pos].printProgress = ' ' + (z + 1) + '/' + orderNumber + ' ' + orderProductName;
                            this.forceUpdate();

                            let template = {
                                name: '弯麦-' + orderProductName,
                                barcode: barcode,
                                price: '¥' + Number(transferPrice).toFixed(1),
                                ingredients: '配料表：' + ingredients,
                                productLabelPrintProductionDateAndTime:
                                    '生产日期：' + productLabelPrintProductionDate.format('MM/DD') +
                                    productLabelPrintProductionTime.format(' HH:mm'),
                                qualityDay: '保质期：' + qualityDay + '天'
                            };
                            this.setState({ productLabelPrintProductionTemplate: template });

                            /// 输出打印
                            this.labelPrintDirect(
                                template.name,
                                template.barcode,
                                template.price,
                                template.ingredients,
                                template.productLabelPrintProductionDateAndTime,
                                template.qualityDay
                            );
                            // this.setState({ productLabelPrintState: KLabelPrintState.complete });
                            // return;

                            await new Promise(resolve => setTimeout(resolve, 1000));
                            if (this.state.productLabelPrintState === KLabelPrintState.cancel) {
                                selectedRows4LabelPrintTemplateList[pos].printProgress = '取消打印中...';
                                this.forceUpdate();
                                await new Promise(resolve => setTimeout(resolve, 300));
                                this.setState({ productLabelPrintModalVisible: false, productLabelPrintState: KLabelPrintState.prepare });
                                return;
                            } else if (this.state.productLabelPrintState === KLabelPrintState.pause) {
                                this._templateIndex = i;
                                this._itemIndex = j;
                                this._orderNumberIndex = z;
                                return;
                            }
                        }
                        orderNumberIndex = 0;
                    }
                }
                itemIndex = 0;
            }
        }

        this.setState({ productLabelPrintState: KLabelPrintState.complete });
    }

    getLodopAfterInit4Label = () => {
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            LODOP.SET_PRINTER_INDEX(getLabelPrinterIndex(LODOP));
            LODOP.SET_PRINT_PAGESIZE(1, 400, 300, '');
            LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 600, 450, '');
            LODOP.SET_PRINT_COPIES(1);
            LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);//打印后自动关闭预览窗口
        }

        return LODOP;
    };

    labelPrintDirect = (
        orderProductName,
        barcode,
        transferPrice,
        ingredients,
        productLabelPrintProductionDateAndTime,
        qualityDay) => {
        let LODOP = this.getLodopAfterInit4Label();

        if (LODOP) {
            let fontSize = '17px';
            if (orderProductName.length > 14) fontSize = '12px';
            else if (orderProductName.length > 12) fontSize = '13px';
            else if (orderProductName.length > 10) fontSize = '15px';
            let str = "<!doctype html>" +
                "<style>" +
                "#title" +
                "{" +
                "text-align:center;" +
                "font-family:'微软雅黑';" +
                "font-size:" +
                fontSize + ";" +
                "}" +
                "</style>" +
                "<div id='title'>" +
                orderProductName +
                "</div>";
            LODOP.ADD_PRINT_HTM(4, 0, '40mm', 15, str);

            LODOP.ADD_PRINT_TEXT(21, 42, 150, 15, barcode);
            LODOP.SET_PRINT_STYLEA(2, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(2, "FontSize", 7);

            LODOP.ADD_PRINT_BARCODE(33, 16, 174, 24, "128Auto", barcode);
            LODOP.SET_PRINT_STYLEA(3, "ShowBarText", 0);

            LODOP.ADD_PRINT_TEXT(60, 8, 150, 15, ingredients);
            LODOP.SET_PRINT_STYLEA(4, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(4, "FontSize", 8);

            LODOP.ADD_PRINT_TEXT(76, 8, 150, 15, productLabelPrintProductionDateAndTime);
            LODOP.SET_PRINT_STYLEA(5, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(5, "FontSize", 8);

            LODOP.ADD_PRINT_TEXT(92, 8, 150, 15, qualityDay);
            LODOP.SET_PRINT_STYLEA(6, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(6, "FontSize", 8);

            LODOP.ADD_PRINT_TEXT(90, 95, 150, 15, transferPrice);
            LODOP.SET_PRINT_STYLEA(7, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(7, "FontSize", 12);

            LODOP.PRINT();
        }
    }

    onTemplateItemSelectChange = (selectedRowKeys, selectedRows) => {
        // console.log('onTemplateItemSelectChange: ', selectedRowKeys);
        this.setState({ selectedRowKeys4LabelPrintTemplateList: selectedRowKeys, selectedRows4LabelPrintTemplateList: selectedRows });
    };

    handleProductLabelPrintProductionDateChange = (date) => {
        this.setState({ productLabelPrintProductionDate: date }, () => {
            this.updateProductLabelPrintProductionTemplateDayAndTime();
        });
    }

    handleProductLabelPrintProductionTimeChange = (time) => {
        this.setState({ productLabelPrintProductionTime: time });
    }

    handleProductLabelPrintProductionTimeOnFocus = () => {
        this.setState({ productLabelPrintProductionTimePopupOpen: true });
    }

    handleProductLabelPrintProductionTimeOnBlur = () => {
        this.setState({ productLabelPrintProductionTimePopupOpen: false });
    }

    handleProductLabelPrintProductionTimeOnOk = () => {
        setTimeout(() => {
            this.updateProductLabelPrintProductionTemplateDayAndTime();

            this.setState({ productLabelPrintProductionTimePopupOpen: false }, () => {
                setTimeout(() => {
                    this._productLabelPrintProductionTime && this._productLabelPrintProductionTime.blur();
                }, 300);
            });
        }, 0);
    }

    updateProductLabelPrintProductionTemplateDayAndTime = () => {
        const { productLabelPrintProductionDate, productLabelPrintProductionTime } = this.state;
        let template = { ...this.state.productLabelPrintProductionTemplate };
        template.productLabelPrintProductionDateAndTime =
            '生产日期：' + productLabelPrintProductionDate.format('MM/DD') +
            productLabelPrintProductionTime.format(' HH:mm');
        this.setState({ productLabelPrintProductionTemplate: template });
    };

    render() {
        const {
            allDistributionDataToBePrint,
            productSpinTipText,
            productSpinning,
            productLabelPrintModalVisible,
            productLabelPrintState,
            selectedRowKeys4LabelPrintTemplateList,
            selectedRows4LabelPrintTemplateList,
            productLabelPrintTemplateList,
            productLabelPrintProductionDate,
            productLabelPrintProductionTime,
            productLabelPrintProductionTimePopupOpen,
            productLabelPrintProductionTemplate
        } = this.state;

        let labelPrintModalOkText = '';
        if (productLabelPrintState === KLabelPrintState.prepare) {
            labelPrintModalOkText = '选择分类后，点击开始打印';
        } else if (productLabelPrintState === KLabelPrintState.running) {
            labelPrintModalOkText = '运行中，点击暂停';
        } else if (productLabelPrintState === KLabelPrintState.pause) {
            labelPrintModalOkText = '暂停中，点击继续';
        } else if (productLabelPrintState === KLabelPrintState.cancel) {
            labelPrintModalOkText = '取消中...';
        } else if (productLabelPrintState === KLabelPrintState.error) {
            labelPrintModalOkText = '打印机出错，修复后点击继续';
        } else if (productLabelPrintState === KLabelPrintState.complete) {
            labelPrintModalOkText = '打印完成，点击关闭';
        }

        let labelPrintModalOkButtonDisable = productLabelPrintState === KLabelPrintState.prepare && selectedRows4LabelPrintTemplateList.length <= 0;

        const KTemplateColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 20, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '模板分类', dataIndex: 'templateName', key: 'templateName', width: 120, render: (text) => { return <span style={{ fontSize: 10, color: 'red' }}>{text}</span>; } },
            { title: '打印进度', dataIndex: 'printProgress', key: 'printProgress', width: '*', render: (text) => { return <span style={{ fontSize: 10, color: 'red' }}>{text}</span>; } },
        ];
        const KTemplateRowSelection = {
            selectedRowKeys: selectedRowKeys4LabelPrintTemplateList,
            selectedRows: selectedRows4LabelPrintTemplateList,
            onChange: this.onTemplateItemSelectChange,
            getCheckboxProps: (record) => ({
                disabled: productLabelPrintState !== KLabelPrintState.prepare,
                // Column configuration not to be checked
                name: record.name,
            }),
        };

        return (
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
                            disabled={productSpinning}
                            style={{ marginTop: 10, width: 90, height: 80 }}
                            onClick={this.productPrintPreprew}>
                            <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                                打印预览
                            </div>
                        </Button>
                        <Button type="primary" danger
                            disabled={productSpinning}
                            style={{ marginTop: 10, width: 90, height: 80 }}
                            onClick={this.productPrintDirectAndBack}>
                            <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                                直接打印
                            </div>
                        </Button>
                        <Button type="primary" danger
                            disabled={productSpinning}
                            style={{ marginTop: 10, width: 90, height: 80 }}
                            onClick={this.productLabelPrintStart}>
                            <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                                打印标签
                            </div>
                        </Button>
                    </div>

                    <div style={{ float: 'left' }}>
                        <span style={{ marginLeft: 10, fontSize: 12, color: 'green' }}>{`订货时间：${allDistributionDataToBePrint && allDistributionDataToBePrint.length > 0 && allDistributionDataToBePrint[0].orderTime}`}</span>
                        <span style={{ marginLeft: 20, fontSize: 12, color: 'green' }}>{`期望到货：${allDistributionDataToBePrint && allDistributionDataToBePrint.length > 0 && allDistributionDataToBePrint[0].expectTime}`}</span>
                        <Spin tip={productSpinTipText} spinning={productSpinning} size='large'>
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
                                                                    {`${columnData.orderShop}=>${columnData.orderType}=>${columnData.orderCashier}`}
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
                        </Spin>
                        <div style={{ height: 30 }}></div>
                    </div>
                </div>

                <Modal
                    width={600}
                    style={{ top: 10 }}
                    keyboard={true}
                    maskClosable={false}
                    title={(<div>批量打印标签</div>)}
                    visible={productLabelPrintModalVisible}
                    okText={(
                        <div>
                            {labelPrintModalOkText}
                        </div>
                    )}
                    okButtonProps={{ disabled: labelPrintModalOkButtonDisable }}
                    cancelButtonProps={{ hidden: false }}
                    onOk={() => {
                        if (productLabelPrintState === KLabelPrintState.prepare) {
                            this._templateIndex = 0;
                            this._itemIndex = 0;
                            this._orderNumberIndex = 0;
                            this.startOrContinueLabelPrint(this._templateIndex, this._itemIndex, this._orderNumberIndex);
                        } else if (productLabelPrintState === KLabelPrintState.running) {
                            this.setState({ productLabelPrintState: KLabelPrintState.pause });
                        } else if (productLabelPrintState === KLabelPrintState.pause) {
                            this.startOrContinueLabelPrint(this._templateIndex, this._itemIndex, this._orderNumberIndex);
                        } else if (productLabelPrintState === KLabelPrintState.complete) {
                            this.setState({
                                productLabelPrintState: KLabelPrintState.prepare,
                                productLabelPrintModalVisible: false
                            });
                        }
                    }}
                    onCancel={() => {
                        if (productLabelPrintState === KLabelPrintState.running) {
                            this.setState({
                                productLabelPrintState: KLabelPrintState.cancel
                            });
                        } else {
                            this.setState({
                                productLabelPrintState: KLabelPrintState.prepare,
                                productLabelPrintModalVisible: false
                            });
                        }
                    }}>
                    <Table
                        style={{ marginTop: 0 }}
                        disabled={true}
                        size='small'
                        dataSource={productLabelPrintTemplateList}
                        columns={KTemplateColumns4Table}
                        rowSelection={KTemplateRowSelection}
                        pagination={false} bordered />
                    <div style={{ marginTop: 12 }}>
                        <DatePicker picker='day'
                            style={{ width: 170 }}
                            placeholder='选择生产日期'
                            format='YYYY-MM-DD dddd'
                            value={productLabelPrintProductionDate}
                            onChange={this.handleProductLabelPrintProductionDateChange} />
                        <DatePicker picker='time'
                            ref={(dp) => this._productLabelPrintProductionTime = dp}
                            style={{ width: 170, marginLeft: 12 }}
                            placeholder='选择生产时间'
                            format='a HH:mm'
                            showTime={{
                                use12Hours: false,
                                showNow: false,
                                format: 'a HH:mm'
                            }}
                            value={productLabelPrintProductionTime}
                            open={productLabelPrintProductionTimePopupOpen}
                            onFocus={this.handleProductLabelPrintProductionTimeOnFocus}
                            onBlur={this.handleProductLabelPrintProductionTimeOnBlur}
                            onOk={this.handleProductLabelPrintProductionTimeOnOk}
                            onChange={this.handleProductLabelPrintProductionTimeChange}
                            renderExtraFooter={() => (
                                <span>
                                    <Button type='primary' size='small' onClick={() => {
                                        this.setState({
                                            productLabelPrintProductionTime: moment('09:00', 'HH:mm'),
                                            productLabelPrintProductionTimePopupOpen: false
                                        }, () => {
                                            this.updateProductLabelPrintProductionTemplateDayAndTime();

                                            setTimeout(() => {
                                                this._productLabelPrintProductionTime && this._productLabelPrintProductionTime.blur();
                                            }, 300);
                                        });
                                    }}>早上 09点00分</Button>
                                    <span>   </span>
                                    <Button type='primary' size='small' onClick={() => {
                                        this.setState({
                                            productLabelPrintProductionTime: moment('12:00', 'HH:mm'),
                                            productLabelPrintProductionTimePopupOpen: false
                                        }, () => {
                                            this.updateProductLabelPrintProductionTemplateDayAndTime();

                                            setTimeout(() => {
                                                this._productLabelPrintProductionTime && this._productLabelPrintProductionTime.blur();
                                            }, 300);
                                        });
                                    }}>中午 12点00分</Button>
                                    <Button type='primary' size='small' onClick={() => {
                                        this.setState({
                                            productLabelPrintProductionTime: moment('15:00', 'HH:mm'), productLabelPrintProductionTimePopupOpen: false
                                        }, () => {
                                            this.updateProductLabelPrintProductionTemplateDayAndTime();

                                            setTimeout(() => {
                                                this._productLabelPrintProductionTime && this._productLabelPrintProductionTime.blur();
                                            }, 300);
                                        });
                                    }}>下午 15点00分</Button>
                                </span>
                            )} />
                        <div style={{ border: 1, borderStyle: 'solid', color: 'lightgray', marginTop: 12, marginBottom: 12 }}>
                        </div>

                        <div style={{ borderStyle: 'dotted', width: 320, height: 240 }}>
                            <div style={{ textAlign: 'center', fontSize: 24, marginTop: 6 }}>
                                {productLabelPrintProductionTemplate.name}
                            </div>
                            <div style={{ textAlign: 'center', fontSize: 16, marginTop: 4 }}>
                                {productLabelPrintProductionTemplate.barcode}
                            </div>
                            <div style={{
                                textAlign: 'center', height: 50, width: 284,
                                marginLeft: 16, backgroundColor: 'lightgray'
                            }}>

                            </div>
                            <div style={{ textAlign: 'left', fontSize: 18, marginTop: 4, marginLeft: 16 }}>
                                {productLabelPrintProductionTemplate.ingredients}
                            </div>
                            <div style={{ textAlign: 'left', fontSize: 18, marginTop: 2, marginLeft: 16 }}>
                                {productLabelPrintProductionTemplate.productLabelPrintProductionDateAndTime}
                            </div>
                            <div style={{ textAlign: 'left', fontSize: 18, marginTop: 2, marginLeft: 16 }}>
                                <span>{productLabelPrintProductionTemplate.qualityDay}</span>
                                <span style={{ marginLeft: 60 }}>{productLabelPrintProductionTemplate.price}</span>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    };
};

export default ProductDistributePrinter;
