/*
打印配货单
*/
import React from 'react';
import {
    Button,
    Spin,
    Modal,
    Table,
    DatePicker,
    Radio
} from 'antd';
import moment from 'moment';
import JsBarcode from 'jsbarcode';
import { getProductOrderItems } from '../api/api';
import {
    getWWWHost,
    getPageName4A4Printer,
    getA4PrinterIndex,
    getLabelPrinterIndex,
    getCategory4ProductDistributePrint
} from '../api/util';
import {
    getLodop
} from './Lodop6.226_Clodop4.127/LodopFuncs';

/**--------------------配置信息--------------------*/
const KCategory4ProductDistributePrint = getCategory4ProductDistributePrint();

/// 标签打印状态
const KLabelPrintState = {
    none: '',
    prepare: '准备中',
    running: '运行中',
    pause: '暂停中',
    complete: '已完成',
    cancel: '取消',
    error: '出错'
}

const KAmOrPmTypeOptions = [
    { label: '早上', value: 'z' },
    { label: '下午', value: 'zz' }
];

class ProductDistributePrinter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            paramObj: {},

            allDistributionDataToBePrint: [],
            productSpinTipText: '',
            productSpinning: false,

            productLabelPrintModalVisible: false,
            productLabelPrintState: KLabelPrintState.prepare,

            productLabelPrintTemplateList: [],
            selectedRowKeys4LabelPrintTemplateList: [],
            selectedRows4LabelPrintTemplateList: [],

            productLabelPrintProductionDate: moment(),
            amOrPmType: KAmOrPmTypeOptions[1].value,
            productLabelPrintExpirationDate: moment().add(3, 'days').endOf('day'),
            productLabelPrintProductionTemplate4Preview: {},
            productLabelPrintProductionTitle: '',

            productLabelPrintTemplateProductModalVisible: false,
            productLabelPrintTemplateProductList: []
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
            let category4ProductDistribute = [];
            for (let i = 0; i < KCategory4ProductDistributePrint.length; ++i) {
                let categoryGroupItems = KCategory4ProductDistributePrint[i];

                let newCategoryGroupItems = {};
                newCategoryGroupItems.key = category4ProductDistribute.length;
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
                category4ProductDistribute.push(newCategoryGroupItems);
            }
            console.log('category4ProductDistribute = ' + JSON.stringify(category4ProductDistribute));

            this.setState({
                productSpinning: false,
                productSpinTipText: '',
                allDistributionDataToBePrint: category4ProductDistribute
            });
        });
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
        const { allDistributionDataToBePrint, productLabelPrintProductionTitle } = this.state;
        for (let i = 0; i < allDistributionDataToBePrint.length; ++i) {
            let templateName = allDistributionDataToBePrint[i].templateName;
            let items = allDistributionDataToBePrint[i].items;
            let orderShop = allDistributionDataToBePrint[i].orderShop;
            let orderType = allDistributionDataToBePrint[i].orderType;
            let orderCashier = allDistributionDataToBePrint[i].orderCashier;

            if (templateName && items.length > 0) {
                let item = {};
                item.key = i + 1;
                item.templateName = templateName;
                item.items = [];
                for (let j = 0; j < items.length; ++j) {
                    let product = items[j];
                    item.items.push({ ...product });
                }
                item.printStatus = KLabelPrintState.none;
                item.printProgress = '';
                productLabelPrintTemplateList.push(item);
            }
            if (productLabelPrintProductionTitle === '') {
                this.setState({
                    productLabelPrintProductionTitle:
                        orderShop + '=>' + orderType + '=>' + orderCashier
                });
            }
        }

        // console.log('productLabelPrintTemplateList =' + JSON.stringify(productLabelPrintTemplateList));

        const {
            productLabelPrintProductionDate,
            productLabelPrintExpirationDate
        } = this.state;
        this.setState({
            productLabelPrintTemplateList: productLabelPrintTemplateList,
            productLabelPrintModalVisible: true,
            selectedRowKeys4LabelPrintTemplateList: [],
            selectedRows4LabelPrintTemplateList: [],
            productLabelPrintState: KLabelPrintState.prepare,
            amOrPmType: KAmOrPmTypeOptions[1].value,
            productLabelPrintProductionTemplate4Preview: {
                name: '弯麦-<产品名称>',
                barcode: '<12位条码>',
                ingredients: '配料表：<配料1 配料2 配料3>',
                productLabelPrintProductionDateAndTime:
                    '生产日期：' + productLabelPrintProductionDate.format('MM/DD') + ' zz',
                qualityDay: '保质期：<3天>',
                expirationDate: '保质期至：' + productLabelPrintExpirationDate.format('MM/DD HH:mm'),
                price: '¥<12.0>'
            }
        });
        setTimeout(() => {
            JsBarcode('#image4barcode', '123456789', { displayValue: false });
        }, 0);
    };

    startOrContinueLabelPrint = async (templateIndex, itemIndex, orderNumberIndex) => {
        this.setState({ productLabelPrintState: KLabelPrintState.running });

        const {
            selectedRows4LabelPrintTemplateList,
            productLabelPrintProductionDate,
            amOrPmType,
            productLabelPrintProductionTitle
        } = this.state;

        if (productLabelPrintProductionTitle) {
            let titleArr = productLabelPrintProductionTitle.split('=>');
            if (titleArr.length >= 3) {
                this.titleLabelPrintDirect(titleArr[0], titleArr[1], titleArr[2]);
            }
        }

        for (let i = templateIndex; i < selectedRows4LabelPrintTemplateList.length; ++i) {
            let itemsToPrint = selectedRows4LabelPrintTemplateList[i].items;
            for (let j = itemIndex; j < itemsToPrint.length; ++j) {
                if (j === itemIndex) {
                    selectedRows4LabelPrintTemplateList[i].printStatus = KLabelPrintState.running;
                }

                let product = itemsToPrint[j];
                let orderProductName = product.orderProductName;
                let orderNumber = product.orderNumber;
                let barcode = product.barcode;
                let transferPrice = product.transferPrice;
                let qualityDay = product.qualityDay;
                let qualityDayInt = 3;
                try {
                    qualityDayInt = parseInt(qualityDay);
                } catch {
                    qualityDayInt = 3;
                }
                let expirationDate = new moment(productLabelPrintProductionDate).add(qualityDayInt, 'days').endOf('day');
                let ingredients = product.ingredients;

                for (let z = orderNumberIndex; z < orderNumber; ++z) {
                    await new Promise(resolve => setTimeout(resolve, 400));

                    if (this.state.productLabelPrintState === KLabelPrintState.cancel) {
                        this.setState({
                            productLabelPrintModalVisible: false,
                            productLabelPrintState: KLabelPrintState.prepare
                        });
                        return;
                    } else if (this.state.productLabelPrintState === KLabelPrintState.pause) {
                        this._templateIndex = i;
                        this._itemIndex = j;
                        this._orderNumberIndex = z;
                        selectedRows4LabelPrintTemplateList[i].printStatus = KLabelPrintState.pause;
                        this.forceUpdate();
                        return;
                    }

                    /// 更新打印进度
                    selectedRows4LabelPrintTemplateList[i].printProgress =
                        ' ' + (z + 1) + '/' + orderNumber + ' ' + orderProductName;

                    let template = {
                        name: '弯麦-' + orderProductName,
                        barcode: barcode,
                        price: '¥' + Number(transferPrice).toFixed(1),
                        ingredients: '配料表：' + ingredients,
                        productLabelPrintProductionDateAndTime:
                            '生产日期：' + productLabelPrintProductionDate.format('MM/DD') + ' ' + amOrPmType,
                        expirationDate: '保质期至：' + expirationDate.format('MM/DD HH:mm')
                    };
                    JsBarcode('#image4barcode', template.barcode, { displayValue: false });
                    this.setState({ productLabelPrintProductionTemplate4Preview: template });

                    /// 输出打印
                    this.productLabelPrintDirect(
                        template.name,
                        template.barcode,
                        template.price,
                        template.ingredients,
                        template.productLabelPrintProductionDateAndTime,
                        template.expirationDate
                    );
                    // return;
                }

                if (j === itemsToPrint.length - 1) {
                    selectedRows4LabelPrintTemplateList[i].printStatus = KLabelPrintState.complete;
                }
                orderNumberIndex = 0;
            }
            itemIndex = 0;
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

    getTitleHtml = (text, fontSize) => {
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
            text +
            "</div>";

        return str;
    }

    titleLabelPrintDirect = (
        orderShop,
        orderType,
        orderCashier
    ) => {
        let LODOP = this.getLodopAfterInit4Label();

        if (LODOP) {
            let orderShopStr = this.getTitleHtml(orderShop, '18px');
            LODOP.ADD_PRINT_HTM(12, 0, '40mm', 15, orderShopStr);
            let orderTypeStr = this.getTitleHtml(orderType, '18px');
            LODOP.ADD_PRINT_HTM(42, 0, '40mm', 15, orderTypeStr);
            let orderCashierStr = this.getTitleHtml(orderCashier, '18px');
            LODOP.ADD_PRINT_HTM(74, 0, '40mm', 15, orderCashierStr);

            LODOP.PRINT();
        }
    }

    productLabelPrintDirect = (
        orderProductName,
        barcode,
        transferPrice,
        ingredients,
        productLabelPrintProductionDateAndTime,
        expirationDate) => {
        let LODOP = this.getLodopAfterInit4Label();

        if (LODOP) {
            let fontSize = '14px';
            if (orderProductName.length > 14) fontSize = '11px';
            else if (orderProductName.length > 12) fontSize = '12px';
            else if (orderProductName.length > 10) fontSize = '13px';
            LODOP.ADD_PRINT_HTM(3, 0, '40mm', 15, this.getTitleHtml(orderProductName, fontSize));

            LODOP.ADD_PRINT_TEXT(16, 42, 150, 15, barcode);
            LODOP.SET_PRINT_STYLEA(2, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(2, "FontSize", 7);

            LODOP.ADD_PRINT_BARCODE(28, 16, 174, 18, "128Auto", barcode);
            LODOP.SET_PRINT_STYLEA(3, "ShowBarText", 0);

            LODOP.ADD_PRINT_TEXT(46, 6, 150, 15, ingredients);
            LODOP.SET_PRINT_STYLEA(4, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(4, "FontSize", 7);

            LODOP.ADD_PRINT_TEXT(58, 6, 150, 15, productLabelPrintProductionDateAndTime);
            LODOP.SET_PRINT_STYLEA(5, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(5, "FontSize", 7);

            LODOP.ADD_PRINT_TEXT(70, 6, 150, 15, expirationDate);
            LODOP.SET_PRINT_STYLEA(6, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(6, "FontSize", 7);

            LODOP.ADD_PRINT_TEXT(82, 6, 150, 15, '生产商：漳州古西优作食品有限公司漳浦分公司');
            LODOP.SET_PRINT_STYLEA(7, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(7, "FontSize", 5);

            LODOP.ADD_PRINT_TEXT(90, 6, 150, 15, '地址：漳浦县府前街西247号');
            LODOP.SET_PRINT_STYLEA(8, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(8, "FontSize", 5);

            LODOP.ADD_PRINT_TEXT(98, 6, 150, 15, '电话：13290768588');
            LODOP.SET_PRINT_STYLEA(9, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(9, "FontSize", 5);

            LODOP.ADD_PRINT_TEXT(90, 100, 150, 15, transferPrice);
            LODOP.SET_PRINT_STYLEA(10, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(10, "FontSize", 12);

            LODOP.PRINT();
            // LODOP.PREVIEW();
        }
    }

    onTemplateItemSelectChange = (selectedRowKeys, selectedRows) => {
        // console.log('onTemplateItemSelectChange: ', selectedRowKeys);
        this.setState({
            selectedRowKeys4LabelPrintTemplateList: selectedRowKeys,
            selectedRows4LabelPrintTemplateList: selectedRows
        });
    };

    handleProductLabelPrintProductionDateChange = (date) => {
        this.setState({ productLabelPrintProductionDate: date }, () => {
            this.updateProductLabelPrintProductionTemplateDayAndTime();
        });
    }

    handleAmOrPmTypeChange = (e) => {
        const { productLabelPrintProductionDate } = this.state;
        let template = { ...this.state.productLabelPrintProductionTemplate4Preview };
        template.productLabelPrintProductionDateAndTime =
            '生产日期：' + productLabelPrintProductionDate.format('MM/DD') + ' ' + e.target.value;
        this.setState({
            amOrPmType: e.target.value,
            productLabelPrintProductionTemplate4Preview: template
        });
    }

    updateProductLabelPrintProductionTemplateDayAndTime = () => {
        const { productLabelPrintProductionDate } = this.state;
        let template = { ...this.state.productLabelPrintProductionTemplate4Preview };
        template.productLabelPrintProductionDateAndTime =
            '生产日期：' + productLabelPrintProductionDate.format('MM/DD') + ' zz';
        template.expirationDate = '保质期至：' + new moment(productLabelPrintProductionDate).add(3, 'days').endOf('day').format('MM/DD HH:mm');
        this.setState({ productLabelPrintProductionTemplate4Preview: template });
    };

    render() {
        const {
            paramObj,
            allDistributionDataToBePrint,
            productSpinTipText,
            productSpinning,
            productLabelPrintModalVisible,
            productLabelPrintState,
            selectedRowKeys4LabelPrintTemplateList,
            selectedRows4LabelPrintTemplateList,
            productLabelPrintTemplateList,
            productLabelPrintProductionDate,
            amOrPmType,
            productLabelPrintProductionTemplate4Preview,
            productLabelPrintProductionTitle,
            productLabelPrintTemplateProductModalVisible,
            productLabelPrintTemplateProductList
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
            {
                title: '序', dataIndex: 'key', key: 'key', width: 20, render: (text) => {
                    return <div style={{ fontSize: 10, textAlign: 'center' }}>{text}</div>;
                }
            },
            {
                title: '模板分类', dataIndex: 'templateName', key: 'templateName', width: 100, render: (text) => {
                    return <div style={{ fontSize: 12, textAlign: 'center' }}>{text}</div>;
                }
            },
            {
                title: '分类商品', dataIndex: 'templateName', key: 'templateName', width: '*', render: (text) => {
                    return <Button style={{ fontSize: 14, textAlign: 'center', color: 'red' }} onClick={() => {
                        this.setState({
                            productLabelPrintTemplateProductModalVisible: true,
                            productLabelPrintTemplateProductList: []
                        }, () => {
                            const { productLabelPrintTemplateList } = this.state;
                            for (let index = 0; index < productLabelPrintTemplateList.length; ++index) {
                                let name = productLabelPrintTemplateList.templateName;
                                if (name === text) {
                                    let items = productLabelPrintTemplateList.items;
                                    this.setState({ productLabelPrintTemplateProductList: items });
                                }
                            }
                            /// todo 洗洗睡了，有空再码
                        });
                    }}>点击打开商品</Button>;
                }
            },
            {
                title: '打印进度', dataIndex: 'printProgress', key: 'printProgress', width: '*', render: (text) => {
                    return <div style={{ fontSize: 14, textAlign: 'center', color: 'red' }}>{text}</div>;
                }
            },
            {
                title: '打印状态', dataIndex: 'printStatus', key: 'printStatus', width: 100, render:
                    (text) => {
                        let spinning = text === KLabelPrintState.running;
                        return (
                            <div style={{ textAlign: 'center' }}>
                                <Spin size='small' spinning={spinning} style={{ fontSize: 12 }}>{text}</Spin>
                            </div>
                        );
                    }
            }
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
                        <span style={{ marginLeft: 10, fontSize: 12, color: 'green' }}>{`时间类型：${paramObj && paramObj.timeType && paramObj.timeType.name}`}</span>
                        <span style={{ marginLeft: 20, fontSize: 12, color: 'green' }}>{`开始时间：${paramObj && moment(paramObj.beginDateTime).format('YYYY.MM.DD HH:mm:ss')}`}</span>
                        <span style={{ marginLeft: 20, fontSize: 12, color: 'green' }}>{`结束时间：${paramObj && moment(paramObj.endDateTime).format('YYYY.MM.DD HH:mm:ss')}`}</span>
                        <Spin tip={productSpinTipText} spinning={productSpinning} size='large'>
                            <div id="printDiv" style={{ marginLeft: 10, borderStyle: 'dotted', width: 1379, height: 968 }}>
                                <div id="printTable" style={{ marginTop: 0, marginLeft: 28, width: 1375, height: 964, backgroundColor: 'transparent' }}>
                                    <div style={{ height: 12 }}></div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                                        <span>{`${paramObj.shop && paramObj.shop.name}=>
                                          ${paramObj.orderType && paramObj.orderType.name}=>
                                          ${paramObj.orderCashier && paramObj.orderCashier.name}`}
                                        </span>
                                        <span> || </span>
                                        <span>
                                            {`${paramObj && paramObj.timeType && paramObj.timeType.name}`}
                                        </span>
                                        <span> : </span>
                                        <span>
                                            {`${paramObj && moment(paramObj.beginDateTime).format('YYYY.MM.DD HH:mm:ss')}`}
                                        </span>
                                        <span> ~ </span>
                                        <span>
                                            {`${paramObj && moment(paramObj.endDateTime).format('YYYY.MM.DD HH:mm:ss')}`}
                                        </span>
                                    </div>
                                    {
                                        allDistributionDataToBePrint.map((columnData) => {
                                            return columnData.items.length > 0 ? (
                                                <div key={columnData.key} style={{ float: 'left', zIndex: 10, backgroundColor: 'transparent', marginTop: 10, height: 920 }}>
                                                    <div style={{ float: 'left', marginLeft: 0, width: 2, height: 920 }} />
                                                    <table border='0' cellSpacing='0' style={{ float: 'left', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr>
                                                                <th colSpan='5' style={{
                                                                    width: 175, textAlign: 'center',
                                                                    fontSize: 16, backgroundColor: 'lightblue', color: 'black',
                                                                    paddingLeft: 8, paddingRight: 8,
                                                                    paddingTop: 4, paddingBottom: 4
                                                                }}>
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
                                                                                <table border='1' cellSpacing='0' style={{ float: 'left', borderCollapse: 'collapse' }}>
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th colSpan='5' style={{ fontSize: 18, width: 318, textAlign: 'center', backgroundColor: 'lightyellow' }}>
                                                                                                {categoryGroupItem.categoryName}
                                                                                            </th>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <th style={{ textAlign: 'center', fontSize: 14 }}>简码</th>
                                                                                            <th style={{ textAlign: 'center', fontSize: 14 }}>品名</th>
                                                                                            <th style={{ textAlign: 'center', fontSize: 14 }}>订</th>
                                                                                            <th style={{ textAlign: 'center', fontSize: 12 }}>一</th>
                                                                                            <th style={{ textAlign: 'center', fontSize: 12 }}>二</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {
                                                                                            categoryGroupItem.categoryItems.map((productItem) => {
                                                                                                return (
                                                                                                    <tr key={productItem.key} style={{ height: 24 }}>
                                                                                                        {paramObj.shop.name === '001 - 弯麦(教育局店)' ?
                                                                                                            (<th key='1' style={{ textAlign: 'center', fontSize: 16, width: 16, paddingTop: 4, paddingBottom: 4 }}>{productItem.barcodeMiddle}</th>) :
                                                                                                            (<th key='1' style={{ textAlign: 'center', fontSize: 16, width: 16, paddingTop: 4, paddingBottom: 4 }}>{productItem.barcodeSimple}</th>)}
                                                                                                        <th key='2' style={{ textAlign: 'center', fontSize: 16, width: 125, paddingTop: 4, paddingBottom: 4 }}>{productItem.orderProductName}</th>
                                                                                                        <th key='3' style={{ textAlign: 'center', fontSize: 16, width: 8, paddingTop: 4, paddingBottom: 4 }}>{productItem.orderNumber}</th>
                                                                                                        <th key='4' style={{ textAlign: 'center', fontSize: 16, width: 8, paddingTop: 4, paddingBottom: 4 }}></th>
                                                                                                        <th key='5' style={{ textAlign: 'center', fontSize: 16, width: 8, paddingTop: 4, paddingBottom: 4 }}></th>
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
                                                    </table>
                                                    <div style={{ float: 'left', marginLeft: 0, width: 2, height: 920 }} />
                                                </div>
                                            ) : (<div key={columnData.key}></div>)
                                        })
                                    }
                                </div>
                            </div>
                        </Spin >
                        <div style={{ height: 30 }}></div>
                    </div >
                </div >

                <Modal
                    width={600}
                    style={{ top: 0 }}
                    keyboard={true}
                    maskClosable={false}
                    title={(
                        <div>
                            {productLabelPrintProductionTitle}
                        </div>
                    )}
                    visible={productLabelPrintModalVisible}
                    okText={labelPrintModalOkText}
                    okButtonProps={{ disabled: labelPrintModalOkButtonDisable }}
                    cancelText='取消批量打印'
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
                        style={{ marginTop: -12 }}
                        disabled={true}
                        size='small'
                        dataSource={productLabelPrintTemplateList}
                        columns={KTemplateColumns4Table}
                        rowSelection={KTemplateRowSelection}
                        pagination={false} bordered />
                    <div style={{ marginTop: 12 }}>
                        <DatePicker picker='day'
                            size='small'
                            style={{ width: 170, marginLeft: 100 }}
                            placeholder='选择生产日期'
                            format='YYYY-MM-DD dddd'
                            value={productLabelPrintProductionDate}
                            onChange={this.handleProductLabelPrintProductionDateChange} />
                        <span>
                            <Radio.Group style={{ marginTop: 8, margeLeft: 8 }}
                                options={KAmOrPmTypeOptions}
                                value={amOrPmType}
                                onChange={this.handleAmOrPmTypeChange}>
                            </Radio.Group>
                        </span>
                        <div style={{ border: 1, borderStyle: 'solid', color: 'lightgray', marginTop: 6, marginBottom: 2 }} />
                        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginTop: 0, marginBottom: 2 }}>标签预览</div>
                        <div style={{ borderStyle: 'dotted', width: 320, height: 240, marginLeft: 110 }}>
                            <div style={{ textAlign: 'center', fontSize: 16, marginTop: 2 }}>
                                {productLabelPrintProductionTemplate4Preview.name}
                            </div>
                            <div style={{ textAlign: 'center', fontSize: 14, marginTop: 0 }}>
                                {productLabelPrintProductionTemplate4Preview.barcode}
                            </div>
                            <img alt='none' id='image4barcode' style={{
                                height: 55, width: 284,
                                marginLeft: 16, backgroundColor: 'lightgray'
                            }} />
                            <div style={{ textAlign: 'left', fontSize: 14, marginTop: 0, marginLeft: 14 }}>
                                {productLabelPrintProductionTemplate4Preview.ingredients}
                            </div>
                            <div style={{ textAlign: 'left', fontSize: 14, marginTop: 0, marginLeft: 14 }}>
                                {productLabelPrintProductionTemplate4Preview.productLabelPrintProductionDateAndTime}
                            </div>
                            <div style={{ textAlign: 'left', fontSize: 14, marginTop: 0, marginLeft: 14 }}>
                                <span>{productLabelPrintProductionTemplate4Preview.expirationDate}</span>
                            </div>
                            <div style={{ textAlign: 'left', fontSize: 12, marginTop: 0, marginLeft: 14 }}>
                                生产商：漳州市古西优作食品有限公司漳浦分公司
                            </div>
                            <div style={{ textAlign: 'left', fontSize: 12, marginTop: 0, marginLeft: 14 }}>
                                地址：漳浦县府前街西247号
                            </div>
                            <div style={{ textAlign: 'left', fontSize: 12, marginTop: 0, marginLeft: 14 }}>
                                <span>电话：13290768588</span>
                                <span style={{ marginLeft: 100 }}>{productLabelPrintProductionTemplate4Preview.price}</span>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    width={600}
                    style={{ top: 0 }}
                    keyboard={true}
                    maskClosable={false}
                    title={(
                        <div>
                            分类商品
                        </div>
                    )}
                    visible={productLabelPrintTemplateProductModalVisible}
                    okText='确认'
                    cancelButtonProps={{ hidden: true }}
                    onOk={() => {
                        this.setState({ productLabelPrintTemplateProductModalVisible: false });
                    }}>
                    <Table
                        style={{ marginTop: -12 }}
                        disabled={true}
                        size='small'
                        dataSource={productLabelPrintTemplateList}
                        columns={KTemplateColumns4Table}
                        rowSelection={KTemplateRowSelection}
                        pagination={false} bordered />
                </Modal>
            </div >
        );
    };
};

export default ProductDistributePrinter;
