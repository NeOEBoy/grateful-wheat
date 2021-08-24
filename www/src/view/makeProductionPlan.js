import React, { useContext, useRef } from 'react';
import {
    Button, Menu, Dropdown, DatePicker, Table,
    message, Form, Input, Modal
} from 'antd';
import Highlighter from 'react-highlight-words';
import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import { getProductOrderList, getProductOrderItems, findTemplate, loadProductsByKeyword } from '../api/api';
const { Search } = Input;
const { RangePicker } = DatePicker;

/**--------------------配置信息--------------------*/
const KForTest = false;

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
/// 模板cache
const KTemplateData = {
    '1595310806940367327': [],
    '1595397637628133418': [],
    '1595077654714716554': [],
    '1595077405589137749': []
};

/// 增加商品列表头配置
const KAddProductionColumns4Table = [
    { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '条形码', dataIndex: 'barcode', key: 'barcode', width: 150, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '品名', dataIndex: 'productName', key: 'productName', width: 160, render: (text) => { return <span style={{ fontSize: 14, color: 'red' }}>{text}</span>; } },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '规格', dataIndex: 'specification', key: 'specification', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '销售价', dataIndex: 'price', key: 'price', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } }
];
/// 带编辑功能的行
const EditableContext4Transfer = React.createContext(null);
/// 带编辑功能的行
const EditableRow4Transfer = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext4Transfer.Provider value={form}>
                <tr {...props} />
            </EditableContext4Transfer.Provider>
        </Form>
    );
};
/// 带编辑功能的单元格
const EditableCell4Transfer = ({
    title, editable, children, dataIndex, record,
    handleEditableCellNextFocus,
    handleEditableCellCurrentFocus,
    ...restProps
}) => {
    // console.log(record);
    const inputRef = useRef(null);
    const form = useContext(EditableContext4Transfer);

    /// 根据是否编辑状态设置焦点
    if (inputRef && inputRef.current) {
        setTimeout(() => {
            if (record && record['editing']) {
                inputRef.current && inputRef.current.select();
            }
        }, (0));
    }

    /// 变化时自动保存数据
    const handleOnChange = async () => {
        try {
            const values = await form.validateFields();
            record[dataIndex] = values[dataIndex];
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    /// Enter按下时处理光标
    const handleOnPressEnter = () => {
        handleEditableCellNextFocus();
    };

    /// 获得焦点时整理焦点
    const handleOnFocus = async () => {
        handleEditableCellCurrentFocus(record);
    }

    let childNode = children;

    if (editable) {
        childNode = (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} 请输入整数.`,
                        pattern: /^[0-9]+$/
                    },
                ]}
                initialValue={record[dataIndex]}>
                <Input id={record['key']} ref={inputRef}
                    onChange={handleOnChange}
                    onPressEnter={handleOnPressEnter}
                    onFocus={handleOnFocus} />
            </Form.Item>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

class MakeProductionPlan extends React.Component {
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
            currentShop: KAllShops[1],
            currentTemplate: KOrderTemplates[0],
            beginDateTime: beginDateTime,
            endDateTime: endDateTime,
            timePickerOpen: false,
            selectedRowKeys: [],
            noyetOrderShops: [],
            noyetOrderTemplates: [],
            allProductionDataToBePrint: [],
            productionButtonText: '打印生产单',
            allDistributionDataToBePrint: [],
            distributionButtonText: '打印配货单',
            allProductionDataToBeTransfer: [],
            transferButtonText: '录入配货单',
            transferItems4NextFocus: [],
            currentFocusItem: {},
            filterDropdownVisible4Transfer: true,
            isAddProductionModalVisible: false,
            searchProductDataToBeAdd: [],
            searchingProductData: false,
            addProductionSelectedRowKeys: []
        };

        this._searchInput = null;
        this._searchInput4AddProduct = null;
        this._searchText4Transfer = '';
    }

    async componentDidMount() {
        await this.fetchOrderList();
    }

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
        // console.log('handleProductionPrint e' = e);

        this.setState({ productionButtonText: '准备打印...' }, async () => {
            let allData = [];
            const { alreadyOrderListData, currentTemplate, selectedRowKeys } = this.state;

            /// 1.获取每家店的订货信息
            this.setState({ productionButtonText: '准备获取...' });
            for (let index = 0; index < alreadyOrderListData.length; ++index) {
                let orderItem = alreadyOrderListData[index];
                if (orderItem) {
                    /// 未打钩的过滤掉
                    if (selectedRowKeys.indexOf(orderItem.key) === -1) continue;

                    this.setState({ productionButtonText: '获取' + orderItem.orderShop + '...' });
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
                                    let newItemObject = {};
                                    newItemObject.categoryName = toBeDealItem.categoryName;
                                    newItemObject.orderProductName = toBeDealItem.orderProductName;
                                    newItemObject.barcode = toBeDealItem.barcode;
                                    newItemObject.barcodeSimple = toBeDealItem.barcodeSimple;
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
                                let templateAndBarcode = currentTemplate.templateId + '-' + orderItems.items[i].barcode;
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
            this.setState({ productionButtonText: '合并至生产车间...' })
            let totalOrderItem = {};
            totalOrderItem.orderShop = '000 - 弯麦(生产车间)';
            totalOrderItem.templateName = currentTemplate.name;
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
                        newItemObject.barcodeSimple = itemObj.barcodeSimple;
                        newItemObject.orderNumber = itemObj.orderNumber;
                        newItemObject.sortId = itemObj.sortId;

                        totalItems.push(newItemObject);
                    }
                }
            }

            /// 3.使用模板对应商品
            let totalItemsAfterFixTemplate = totalItems;
            let findResult = await this.findTemplateCache(currentTemplate.templateUid);
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

                        let templateAndBarcode = currentTemplate.templateId + '-' + newItemObject.barcode;
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
            this.setState({ productionButtonText: '打印生产单', allProductionDataToBePrint: allDataAfterA4 });

            // console.log(allDataAfterA4);
        });
    };

    handleDistributionPrint = async (e) => {
        // console.log('handleProductionPrint e' = e);

        this.setState({ distributionButtonText: '准备打印...' }, async () => {
            let allData = [];
            const { alreadyOrderListData, selectedRowKeys } = this.state;

            /// 1.获取每家店的订货信息
            this.setState({ distributionButtonText: '准备获取...' });
            for (let index = 0; index < alreadyOrderListData.length; ++index) {
                let orderItem = alreadyOrderListData[index];
                if (orderItem) {
                    /// 未打钩的过滤掉
                    if (selectedRowKeys.indexOf(orderItem.key) === -1) continue;

                    this.setState({ distributionButtonText: '获取' + orderItem.templateName + '...' });
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
                                let templateAndBarcode = KOrderTemplates[templatePos].templateId + '-' + orderItems.items[i].barcode;
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

            /// 2.使用模板对应商品
            this.setState({ distributionButtonText: '整理模板中...' });
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

                let findResult = await this.findTemplateCache(KOrderTemplates[templatePos].templateUid);
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
                            newItemObject.sortId = allDataItems[pos].sortId;
                            newItemObject.orderNumber = allDataItems[pos].orderNumber;
                        } else {
                            newItemObject.categoryName = findResultList[j].categoryName;
                            newItemObject.orderProductName = findResultList[j].name;
                            newItemObject.barcode = findResultList[j].barcode;
                            newItemObject.barcodeSimple = findResultList[j].barcodeSimple;

                            let templateAndBarcode = KOrderTemplates[templatePos].templateId + '-' + findResultList[j].barcode;
                            let sortInfo = KSortIdArray[templateAndBarcode];
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
                    oneDataObj.items = totalItemsAfterFixCategory;

                    newAllData.push(oneDataObj);
                }
            }

            /// 3.整理订货信息使得适合A4打印
            // console.log(newAllData);
            this.setState({ distributionButtonText: '整理A4中...' });
            let allDataAfterA4 = [];
            for (let i = 0; i < newAllData.length; ++i) {
                let allDataItem = newAllData[i].items;
                for (let j = 0; j < allDataItem.length; ++j) {
                    if (j % 29 === 0) {///29
                        let allDataAfterItem = {};
                        allDataAfterItem.orderShop = newAllData[i].orderShop;
                        allDataAfterItem.templateName = newAllData[i].templateName;
                        allDataAfterItem.expectTime = newAllData[i].expectTime;
                        allDataAfterItem.items = [];

                        allDataAfterA4.push(allDataAfterItem);
                    }
                    allDataAfterA4[allDataAfterA4.length - 1].items.push(allDataItem[j]);
                }
            }
            // console.log(allDataAfterA4);
            this.setState({ distributionButtonText: '打印配货单', allDistributionDataToBePrint: allDataAfterA4 });
        });
    };

    findTemplateCache = async (templateUid) => {
        let templateList = KTemplateData[templateUid];
        if (templateList.length > 0) {
            return { errCode: 0, list: templateList };
        }

        let findResult = await findTemplate(templateUid);
        if (findResult.errCode === 0 && findResult.list.length > 0) {
            KTemplateData[templateUid] = findResult.list;
            return findResult;
        }

        return { errCode: -1 };
    };

    /// 录入配货单
    handleTransfer = async (e) => {
        this.setState({ transferButtonText: '准备录入...' }, async () => {
            let allData = [];
            const { alreadyOrderListData, currentTemplate, selectedRowKeys } = this.state;

            /// 1.获取每家店的订货信息，整合成allData
            this.setState({ transferButtonText: '准备获取...' });
            for (let index = 0; index < alreadyOrderListData.length; ++index) {
                let orderItem = alreadyOrderListData[index];
                if (orderItem) {
                    /// 未打钩的过滤掉
                    if (selectedRowKeys.indexOf(orderItem.key) === -1) continue;

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
                                    let newItemObject = {};
                                    newItemObject.categoryName = toBeDealItem.categoryName;
                                    newItemObject.orderProductName = toBeDealItem.orderProductName;
                                    newItemObject.specification = toBeDealItem.specification;
                                    newItemObject.barcode = toBeDealItem.barcode;
                                    newItemObject.barcodeSimple = toBeDealItem.barcodeSimple;
                                    newItemObject.orderNumber = toBeDealItem.orderNumber;
                                    newItemObject.sortId = toBeDealItem.sortId;

                                    theExistDataItems.push(newItemObject);
                                }
                            }
                        } else {
                            let item = {};
                            item.orderShop = orderItem.orderShop;
                            item.templateName = orderItem.templateName;

                            /// 设置模板Uid
                            for (let i = 0; i < KOrderTemplates.length; ++i) {
                                if (KOrderTemplates[i].name === orderItem.templateName) {
                                    item.templateUid = KOrderTemplates[i].templateUid;
                                    break;
                                }
                            }
                            item.expectTime = orderItem.expectTime;
                            item.items = orderItems.items;
                            for (let i = 0; i < orderItems.items.length; ++i) {
                                let templateAndBarcode = currentTemplate.templateId + '-' + orderItems.items[i].barcode;
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
            // console.log(allData);
            /// 2.根据allData按照模板排序，加入订货为0的数据
            this.setState({ transferButtonText: '按照模板排序...' });
            let allDataAfterTemplate = []
            for (let index = 0; index < allData.length; ++index) {
                let allDataItem = allData[index];
                let allDataItemItems = allDataItem.items;

                let allDataItemAfterTemplate = {};
                allDataItemAfterTemplate.orderShop = allDataItem.orderShop;
                allDataItemAfterTemplate.templateName = allDataItem.templateName;
                allDataItemAfterTemplate.expectTime = allDataItem.expectTime;
                allDataItemAfterTemplate.templateUid = allDataItem.templateUid;

                this.setState({ transferButtonText: `查找-${allDataItem.templateName}-模板...` });
                let findResult = await this.findTemplateCache(allDataItem.templateUid);
                if (findResult.errCode === 0 && findResult.list.length > 0) {
                    // console.log(findResult.list);
                    let findResultList = findResult.list;
                    let totalItemsAfterFixTemplate = [];
                    for (let i = 0; i < findResultList.length; ++i) {
                        let pos = -1;
                        for (let j = 0; j < allDataItemItems.length; ++j) {
                            if (findResultList[i].barcode === allDataItemItems[j].barcode) {
                                pos = j;
                                break;
                            }
                        }

                        let newItemObject = {};
                        if (pos !== -1) {
                            newItemObject.categoryName = allDataItemItems[pos].categoryName;
                            newItemObject.orderProductName = allDataItemItems[pos].orderProductName;
                            newItemObject.specification = allDataItemItems[pos].specification;
                            newItemObject.barcode = allDataItemItems[pos].barcode;
                            newItemObject.barcodeSimple = allDataItemItems[pos].barcodeSimple;
                            newItemObject.sortId = allDataItemItems[pos].sortId;
                            newItemObject.orderNumber = allDataItemItems[pos].orderNumber;
                            newItemObject.transferNumber = 0;
                        } else {
                            newItemObject.categoryName = findResultList[i].categoryName;
                            newItemObject.orderProductName = findResultList[i].name;
                            newItemObject.specification = findResultList[i].specification;
                            newItemObject.barcode = findResultList[i].barcode;
                            newItemObject.barcodeSimple = findResultList[i].barcodeSimple;

                            let templateAndBarcode = currentTemplate.templateId + '-' + newItemObject.barcode;
                            let sortInfo = KSortIdArray[templateAndBarcode];
                            newItemObject.sortId = sortInfo ? sortInfo : 200;

                            newItemObject.orderNumber = 0;
                            newItemObject.transferNumber = 0;
                        }

                        totalItemsAfterFixTemplate.push(newItemObject);
                    }

                    allDataItemAfterTemplate.items = totalItemsAfterFixTemplate;
                }

                allDataAfterTemplate.push(allDataItemAfterTemplate);
            }
            // console.log(allDataAfterTemplate);

            this.setState({ transferButtonText: '整理商品...' });
            let transferData = []; let key = 0;
            for (let index = 0; index < allDataAfterTemplate.length; ++index) {
                let allDataAfterTemplateItem = allDataAfterTemplate[index];
                let allDataAfterTemplateItemItems = allDataAfterTemplateItem.items;
                for (let jj = 0; jj < allDataAfterTemplateItemItems.length; ++jj) {
                    let allDataAfterTemplateItemItemsItem = allDataAfterTemplateItemItems[jj];
                    if (allDataAfterTemplateItemItemsItem.orderNumber > 0) {
                        allDataAfterTemplateItemItemsItem.key = ++key;
                        transferData.push(allDataAfterTemplateItemItemsItem);
                    }
                }
            }
            // console.log(transferData);

            this.setState({ transferButtonText: '录入配货单', allProductionDataToBeTransfer: transferData });
        });
    }

    handleEditableCellNextFocus = () => {
        console.log('handleEditableCellNextFocus');

        let transferItems4NextFocusTemp = this.state.transferItems4NextFocus;

        let lastFocusIndex = -1;
        for (let i = 0; i < transferItems4NextFocusTemp.length; ++i) {
            let element = transferItems4NextFocusTemp[i];
            if (element.editing) {
                lastFocusIndex = i;
                break;
            }
        }

        let newFocusIndex = lastFocusIndex + 1;
        if (newFocusIndex >= 0 && newFocusIndex < transferItems4NextFocusTemp.length) {
            transferItems4NextFocusTemp[newFocusIndex].editing = true;
        } else {
            if (this._searchInput) {
                this._searchInput.select();
            }
        }

        if (lastFocusIndex >= 0 && lastFocusIndex < transferItems4NextFocusTemp.length) {
            transferItems4NextFocusTemp[lastFocusIndex].editing = false;
        }

        this.setState({ transferItems4NextFocus: transferItems4NextFocusTemp });
    };

    handleEditableCellCurrentFocus = (record) => {
        let transferItems4NextFocusTemp = this.state.transferItems4NextFocus;

        for (let i = 0; i < transferItems4NextFocusTemp.length; ++i) {
            let item = transferItems4NextFocusTemp[i];
            item.editing = false;
            if (item === record) {
                item.editing = true;
            }
        }
        this.forceUpdate();
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdownVisible: this.state.filterDropdownVisible4Transfer,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8, width: 160 }}>
                <Input
                    ref={node => {
                        if (!this._searchInput && node) {
                            this._searchInput = node;
                            this._searchInput.focus();
                        }
                    }}
                    placeholder={`输入简码（后四位）`}
                    value={this._searchText4Transfer}
                    onChange={(e) => {
                        console.log('输入简码 onChange');

                        setSelectedKeys(e.target.value ? [e.target.value] : []);
                        confirm();

                        this._searchText4Transfer = e.target.value;
                    }}
                    onFocus={(e) => {
                        console.log('输入简码 onFocus e = ' + e);
                    }}
                    onPressEnter={(e) => {
                        console.log('搜索简码 onPressEnter e = ' + e);

                        /// 将符合条件的条目放到items4NextFocus
                        this.setState({ transferItems4NextFocus: [] }, () => {
                            let transferItems4NextFocusTemp = [];
                            this.state.allProductionDataToBeTransfer.forEach(element => {
                                if (element.barcodeSimple.indexOf(this._searchText4Transfer) !== -1) {
                                    transferItems4NextFocusTemp.push(element);
                                }
                            });

                            if (transferItems4NextFocusTemp.length > 0) {
                                transferItems4NextFocusTemp[0].editing = true;
                                this.setState({ transferItems4NextFocus: transferItems4NextFocusTemp });
                            }
                        });
                    }}
                    style={{ marginBottom: 8, display: 'block' }}
                />
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => {
            let simple = record[dataIndex].toString();
            return simple ? simple.includes(value) : '';
        },
        onFilterDropdownVisibleChange: visible => {
            if (visible && this._searchInput) {
                setTimeout(() => this._searchInput && this._searchInput.select(), 100);
            }
        },
        render: text =>
        (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[this._searchText4Transfer]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
            />
        )
    });

    onAddProductionSelectChange = (selectedRowKeys) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ addProductionSelectedRowKeys: selectedRowKeys });
    };

    handleAddProductionModalOk = () => {
        this.setState({ isAddProductionModalVisible: false });
        this.setState({ filterDropdownVisible4Transfer: true });

        setTimeout(() => {
            this._searchInput.select();
        }, 500);
    };

    handleAddProductionModalCancel = () => {
        this.setState({ isAddProductionModalVisible: false });
        this.setState({ filterDropdownVisible4Transfer: true });

        setTimeout(() => {
            this._searchInput.select();
        }, 500);

    };

    onAddProductSearch = async () => {
        let addProductSearchText = this._searchInput4AddProduct &&
            this._searchInput4AddProduct.state.value;
        if (!addProductSearchText || addProductSearchText.length <= 0) {
            message.error('请输入正确的商品名称或条码');
            return;
        }

        this.setState({ searchingProductData: true, searchProductDataToBeAdd: [] });
        let loadProductResult = await loadProductsByKeyword(addProductSearchText);
        if (loadProductResult.errCode === 0 && loadProductResult.items && loadProductResult.items.length > 0) {
            this.setState({ searchProductDataToBeAdd: loadProductResult.items });
        }
        this.setState({ searchingProductData: false });
    }

    render() {
        const {
            alreadyOrderListData, currentShop, currentTemplate, isAddProductionModalVisible,
            alreadyOrderLoading, beginDateTime, endDateTime, timePickerOpen, selectedRowKeys,
            noyetOrderShops, noyetOrderTemplates, productionButtonText, transferButtonText,
            distributionButtonText, allProductionDataToBePrint, allProductionDataToBeTransfer,
            allDistributionDataToBePrint, searchProductDataToBeAdd, searchingProductData,
            addProductionSelectedRowKeys
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
            selectedRowKeys.length <= 0 ||
            productionButtonText !== '打印生产单';
        let productionPrintShow = allProductionDataToBePrint && allProductionDataToBePrint.length > 0;
        let notyetOrderShopInfoShow = currentShop.userId === '';

        let noYetOrderTemplateNames = '无';
        if (noyetOrderTemplates && noyetOrderTemplates.length > 0) {
            noYetOrderTemplateNames = noyetOrderTemplates.join(' | ');
        }
        let disableDistributionButtonPrint =
            currentShop.userId === '' ||
            currentTemplate.templateId !== '' ||
            selectedRowKeys.length <= 0 ||
            distributionButtonText !== '打印配货单';
        let distributionPrintShow = allDistributionDataToBePrint && allDistributionDataToBePrint.length > 0;
        let notyetOrderTemplateInfoShow = currentTemplate.templateId === '';

        let disableSubmitButton =
            currentShop.userId === '' ||
            currentTemplate.templateId !== '' ||
            selectedRowKeys.length <= 0 ||
            transferButtonText !== '录入配货单';

        let transferButtonShow = allProductionDataToBeTransfer && allProductionDataToBeTransfer.length > 0;

        /// 调货列表头配置
        const KTransferColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 60, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            {
                title: '简码', dataIndex: 'barcodeSimple', key: 'barcodeSimple', width: 300, editingIndex: 'editing',
                ...this.getColumnSearchProps('barcodeSimple'),
            },
            { title: '品名', dataIndex: 'orderProductName', key: 'orderProductName', width: 160, render: (text) => { return <span style={{ fontSize: 14, color: 'red' }}>{text}</span>; } },
            { title: '订货量', dataIndex: 'orderNumber', key: 'orderNumber', width: 80, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '配货量', dataIndex: 'transferNumber', key: 'transferNumber', width: 160, editable: true, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '规格', dataIndex: 'specification', key: 'specification', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '备注', dataIndex: 'remark', key: 'remark', width: '*', render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } }
        ];

        const components4Transfer = {
            body: {
                row: EditableRow4Transfer,
                cell: EditableCell4Transfer,
            },
        };
        const transferColumns4TableEditable = KTransferColumns4Table.map((col) => {
            if (!col.editable) {
                return col;
            }

            return {
                ...col,
                onCell: (record) => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleEditableCellNextFocus: this.handleEditableCellNextFocus,
                    handleEditableCellCurrentFocus: this.handleEditableCellCurrentFocus
                }),
            };
        });

        const addProductRowSelection = {
            selectedRowKeys: addProductionSelectedRowKeys,
            onChange: this.onAddProductionSelectChange,
        };

        return (
            <div>
                {
                    transferButtonShow ?
                        (
                            <div>
                                <div style={{ marginLeft: 10, marginTop: 10 }}>
                                    <Button type="primary"
                                        style={{ width: 80, height: 40 }}
                                        onClick={() => {
                                            this._searchInput = null;
                                            this._searchText4Transfer = '';
                                            this.setState({ allProductionDataToBeTransfer: [] });
                                        }}>
                                        <div style={{ fontSize: 16 }}>
                                            后退
                                        </div>
                                    </Button>
                                    <span style={{ marginLeft: 10 }}>总部==</span>
                                    <span style={{ marginLeft: 0 }}>{`调往=>`}</span>
                                    <span style={{ marginLeft: 0, marginRight: 10, color: 'red' }}>{currentShop.name}</span>

                                    <Button type="primary" danger
                                        style={{ width: 60, height: 30 }}
                                        onClick={() => {
                                            this._searchInput = null;
                                            this.setState({
                                                addProductionSelectedRowKeys: [], isAddProductionModalVisible: true,
                                                filterDropdownVisible4Transfer: false, searchProductDataToBeAdd: []
                                            });
                                        }}>
                                        <div style={{ fontSize: 8 }}>
                                            +商品
                                        </div>
                                    </Button>
                                </div>

                                <div>
                                    <Modal
                                        width={1000}
                                        style={{ top: 20 }}
                                        title={
                                            (<div>
                                                <span>
                                                    添加商品
                                                </span>
                                                <Search
                                                    style={{ width: 240, marginLeft: 20 }}
                                                    ref={(search) => {
                                                        search && search.focus();

                                                        this._searchInput4AddProduct = search;
                                                    }}
                                                    enterButton
                                                    placeholder='输入商品名称'
                                                    onSearch={() => this.onAddProductSearch()}>
                                                </Search>
                                            </div>)}
                                        visible={isAddProductionModalVisible}
                                        onOk={this.handleAddProductionModalOk}
                                        onCancel={this.handleAddProductionModalCancel}>
                                        <Table
                                            rowSelection={addProductRowSelection}
                                            loading={searchingProductData}
                                            dataSource={searchProductDataToBeAdd}
                                            columns={KAddProductionColumns4Table}
                                            bordered pagination={false}
                                            scroll={{ y: 360, scrollToFirstRowOnChange: true }}
                                        />
                                    </Modal>
                                    <Table style={{ marginTop: 10, marginLeft: 10, marginRight: 10 }}
                                        components={components4Transfer}
                                        rowClassName={() => 'editable-row'}
                                        dataSource={allProductionDataToBeTransfer}
                                        columns={transferColumns4TableEditable}
                                        pagination={false} bordered
                                        scroll={{ y: 500, scrollToFirstRowOnChange: true }}
                                        footer={() => (
                                            <div>
                                                <div style={{ textAlign: 'center', height: 50 }}>
                                                    ---心里满满都是你---
                                                </div>
                                                <div style={{ height: 50 }}>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        )
                        :
                        distributionPrintShow ?
                            (
                                <div style={{ marginLeft: 10, marginTop: 10 }}>
                                    <div id="printConfig"
                                        style={{ float: 'left', borderStyle: 'none', width: 90 }}>
                                        <div>
                                            <Button type="primary"
                                                style={{ width: 90, height: 80 }}
                                                onClick={() => {
                                                    this.setState({ allDistributionDataToBePrint: [] });
                                                }}>
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
                                                allDistributionDataToBePrint.map((columnData) => {
                                                    let productArray = columnData.items;
                                                    let index = allDistributionDataToBePrint.indexOf(columnData);
                                                    return (
                                                        <div key={index} style={{ float: 'left', zIndex: 10, backgroundColor: 'transparent', marginTop: 44, height: 920 }}>
                                                            <div style={{ float: 'left', marginLeft: 0, width: 6, height: 920 }} />
                                                            <table border='1' cellSpacing='0' cellPadding='2' style={{ float: 'left' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th colSpan='7' style={{ width: 323, textAlign: 'center' }}>
                                                                            {columnData.orderShop}
                                                                        </th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th colSpan='7' style={{ width: 323, textAlign: 'center' }}>
                                                                            {columnData.templateName}
                                                                        </th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th style={{ textAlign: 'center', fontSize: 14 }}>简码</th>
                                                                        <th style={{ textAlign: 'center' }}>品名</th>
                                                                        <th style={{ textAlign: 'center', fontSize: 10 }}>订货量</th>
                                                                        <th style={{ textAlign: 'center' }}>早</th>
                                                                        <th style={{ textAlign: 'center' }}>中</th>
                                                                        <th style={{ textAlign: 'center' }}>晚</th>
                                                                        <th style={{ textAlign: 'center', fontSize: 12 }}>备注</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {
                                                                        productArray.map((productItem) => {
                                                                            let serialNum = productArray.indexOf(productItem) + 1;
                                                                            return (
                                                                                <tr key={serialNum} style={{ height: 24 }}>
                                                                                    <th key='1' style={{ textAlign: 'center', fontSize: 16, width: 16 }}>{productItem.barcodeSimple}</th>
                                                                                    <th key='2' style={{ textAlign: 'center', fontSize: 15, width: 130 }}>{productItem.orderProductName}</th>
                                                                                    <th key='3' style={{ textAlign: 'center', fontSize: 16, width: 8 }}>{productItem.orderNumber !== 0 ? productItem.orderNumber : ''}</th>
                                                                                    <th key='4' style={{ textAlign: 'center', fontSize: 16, width: 8 }}></th>
                                                                                    <th key='5' style={{ textAlign: 'center', fontSize: 16, width: 8 }}></th>
                                                                                    <th key='6' style={{ textAlign: 'center', fontSize: 16, width: 8 }}></th>
                                                                                    <th key='7' style={{ textAlign: 'center', fontSize: 16, width: 8 }}></th>
                                                                                </tr>)
                                                                        })
                                                                    }
                                                                </tbody>
                                                                <tfoot>
                                                                    <tr>
                                                                        <th colSpan='7'>{columnData.expectTime}</th>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                            <div style={{ float: 'left', marginLeft: 0, width: 6, height: 920 }} />
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                            :
                            !productionPrintShow ?
                                (
                                    <div>
                                        <div style={{ marginLeft: 30, marginTop: 10, fontSize: 20 }}>生产单 | 配货单 打印模块</div>
                                        <div style={{ zIndex: 2, bottom: 0, left: 0, right: 0, position: 'fixed', width: '100%', height: 140, backgroundColor: 'lightgray' }}>
                                            <div>
                                                <Button danger disabled={disableProductionPrint} type='primary'
                                                    onClick={this.handleProductionPrint}
                                                    style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                                                    {productionButtonText}
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
                                                    {distributionButtonText}
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
                                                    onClick={this.handleTransfer}
                                                    style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                                                    {transferButtonText}
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
                                                } arrow trigger={['click']} disabled={alreadyOrderLoading}>
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
                                                } arrow trigger={['click']} disabled={alreadyOrderLoading}>
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
                                            <Table style={{ marginTop: 10 }}
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
                                )
                                :
                                (
                                    <div style={{ marginLeft: 10, marginTop: 10 }}>
                                        <div id="printConfig"
                                            style={{ float: 'left', borderStyle: 'none', width: 90 }}>
                                            <div>
                                                <Button type="primary"
                                                    style={{ width: 90, height: 80 }}
                                                    onClick={() => {
                                                        this.setState({ allProductionDataToBePrint: [] });
                                                    }}>
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
                                )
                }
            </div>
        );
    }
}

export default MakeProductionPlan;
