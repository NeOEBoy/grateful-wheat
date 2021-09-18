
import React, { useContext, useRef } from 'react';
import {
    Button, Table, Spin, Popconfirm,
    message, Form, Input, Modal
} from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';
import moment from 'moment';

import { getProductOrderItems, loadProductsByKeyword, createStockFlowOut } from '../api/api';
import { findTemplateWithCache } from '../api/cache';
import {
    getTest,
    getPageName4NeedlePrinter,
    getNeedlePrinterIndex,
    getOrderTemplates,
    getProductSortIdArray
} from '../api/util';

import diAudioSrc from '../api/di.wav';

const { Search } = Input;

/**--------------------配置信息--------------------*/
const KForTest = getTest();

/// 模板信息
const KOrderTemplates = getOrderTemplates();
/// 排序优先级（格式为templateId-barcode）
const KProductSortIdArray = getProductSortIdArray();

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
    handleEditableCellCurrentEnter,
    ...restProps
}) => {
    let childNode = children;

    const inputRef = useRef(null);
    const form = useContext(EditableContext4Transfer);

    if (record) {
        // console.log(record);

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
                let newData = parseInt(values[dataIndex]);
                record[dataIndex] = newData;
            } catch (errInfo) {
                console.log('Save failed:', errInfo);
            }
        };

        /// Enter按下时处理光标
        const handleOnPressEnter = () => {
            handleEditableCellNextFocus();
            handleEditableCellCurrentEnter(record, dataIndex);
        };

        /// 获得焦点时整理焦点
        const handleOnFocus = async () => {
            handleEditableCellCurrentFocus(record);
        }

        if (editable) {
            let initialValue = record[dataIndex];
            // console.log('EditableCell4Transfer initialValue=' + initialValue);
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
                    initialValue={initialValue}>
                    <Input id={record && record['key']}
                        ref={inputRef}
                        autoComplete='off'
                        onChange={handleOnChange}
                        onPressEnter={handleOnPressEnter}
                        onFocus={handleOnFocus} />
                </Form.Item>
            );
        }
    }

    return <td {...restProps}>{childNode}</td>;
};

/// 带编辑功能的行
const EditableContext4AddProduct = React.createContext(null);
/// 带编辑功能的行
const EditableRow4AddProduct = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext4AddProduct.Provider value={form}>
                <tr {...props} />
            </EditableContext4AddProduct.Provider>
        </Form>
    );
};
/// 带编辑功能的单元格
const EditableCell4AddProduct = ({
    title, editable, children, dataIndex, record,
    handleEditableCellNextFocus,
    handleEditableCellCurrentFocus,
    handleEditableCellOnChangeAddOrRemove,
    ...restProps
}) => {
    let childNode = children;
    const inputRef = useRef(null);
    const form = useContext(EditableContext4AddProduct);

    if (record) {
        // console.log(record);

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
                let newData = parseInt(values[dataIndex]);
                record[dataIndex] = newData;
            } catch (errInfo) {
                console.log('Save failed:', errInfo);

                let lastStr = errInfo.values[dataIndex].substring(errInfo.values[dataIndex].length - 1);
                let addOrRemove;
                if (lastStr === '+') {
                    addOrRemove = 'add';
                } else if (lastStr === '-') {
                    addOrRemove = 'remove';
                }
                handleEditableCellOnChangeAddOrRemove(addOrRemove, record);
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

        let initialValue = record[dataIndex];
        // console.log('EditableCell4AddProduct initialValue=' + initialValue);
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
                    initialValue={initialValue}>
                    <Input id={record && record['key']}
                        ref={inputRef}
                        autoComplete='off'
                        onChange={handleOnChange}
                        onPressEnter={handleOnPressEnter}
                        onFocus={handleOnFocus} />
                </Form.Item>
            );
        }
    }

    return <td {...restProps}>{childNode}</td>;
};

class ProductDistributeInputer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allProductionDataToBeTransfer: [],
            allProductionDataRealToBeTransfer: [],
            searchProductDataToBeAdd: [],
            searchingProductData: false,
            isAddProductionModalVisible: false,
            addProductionSelectedRowKeys: [],
            currentShop: {},
            productSpinTipText: '',
            productSpinning: false,
            transferItems4NextFocus: [],
            filterDropdownVisible4Transfer: true,
            productTransferPrintShow: false,
            productTransferConfirmText: '---确定出货---'
        };
        this._searchInput = null;
        this._searchInput4AddProduct = null;
        this._searchText4Transfer = '';
        this._lastSearchText4Transfer = '';
        this._lastSearchText4AddProduct = '';

        this._searchText4AddProduct4onChange = '';
        this._lastSearchText4AddProduct4onChange = '';

        this._template = undefined;
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
            let shop = paramValueObj.shop;
            this.setState({ currentShop: shop });
            this._template = paramValueObj.template;
            this._beginDateTime = paramValueObj.beginDateTime;
            this._endDateTime = paramValueObj.endDateTime;
            this._orderList = paramValueObj.orderList;

            this.refresh();
        }
    };

    refresh = async () => {
        this.setState({ productSpinning: true, productSpinTipText: '准备录入...' }, async () => {
            let allData = [];

            /// 1.获取每家店的订货信息，整合成allData
            this.setState({ productSpinTipText: '准备获取...' });
            for (let index = 0; index < this._orderList.length; ++index) {
                let orderItem = this._orderList[index];
                if (orderItem) {
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
                                    newItemObject.transferPrice = toBeDealItem.transferPrice;
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
            // console.log(allData);
            /// 2.根据allData按照模板排序，加入订货为0的数据
            this.setState({ productSpinTipText: '按照模板排序...' });
            let allDataAfterTemplate = []
            for (let index = 0; index < allData.length; ++index) {
                let allDataItem = allData[index];
                let allDataItemItems = allDataItem.items;

                let allDataItemAfterTemplate = {};
                allDataItemAfterTemplate.orderShop = allDataItem.orderShop;
                allDataItemAfterTemplate.templateName = allDataItem.templateName;
                allDataItemAfterTemplate.expectTime = allDataItem.expectTime;
                allDataItemAfterTemplate.templateUid = allDataItem.templateUid;

                this.setState({ productSpinTipText: `查找-${allDataItem.templateName}-模板...` });
                let findResult = await findTemplateWithCache(allDataItem.templateUid);
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
                            newItemObject.transferPrice = allDataItemItems[pos].transferPrice;
                        } else {
                            newItemObject.categoryName = findResultList[i].categoryName;
                            newItemObject.orderProductName = findResultList[i].name;
                            newItemObject.specification = findResultList[i].specification;
                            newItemObject.barcode = findResultList[i].barcode;
                            newItemObject.barcodeSimple = findResultList[i].barcodeSimple;
                            newItemObject.transferPrice = findResultList[i].transferPrice;

                            let templateAndBarcode = this._template.templateId + '-' + newItemObject.barcode;
                            let sortInfo = KProductSortIdArray[templateAndBarcode];
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

            this.setState({ productSpinTipText: '整理商品...' });
            let transferData = []; let key = 0;
            for (let index = 0; index < allDataAfterTemplate.length; ++index) {
                let allDataAfterTemplateItem = allDataAfterTemplate[index];
                let allDataAfterTemplateItemItems = allDataAfterTemplateItem.items;
                for (let jj = 0; jj < allDataAfterTemplateItemItems.length; ++jj) {
                    let allDataAfterTemplateItemItemsItem = allDataAfterTemplateItemItems[jj];
                    // if (allDataAfterTemplateItemItemsItem.orderNumber > 0) {
                    allDataAfterTemplateItemItemsItem.key = ++key;
                    transferData.push(allDataAfterTemplateItemItemsItem);
                    // }
                }
            }
            // console.log(transferData);

            this.setState({
                productSpinning: false, productSpinTipText: '',
                allProductionDataToBeTransfer: transferData
            });
        });
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdownVisible: this.state.filterDropdownVisible4Transfer,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8, width: 130 }}>
                <Input
                    ref={node => {
                        if (!this._searchInput && node) {
                            this._searchInput = node;
                            this._searchInput.focus();
                        }
                    }}
                    autoComplete='off'
                    size='large'
                    placeholder={`+添加商品`}
                    value={this._searchText4Transfer}
                    onChange={(e) => {
                        // console.log('输入简码 onChange e.target=' + e.target);

                        let z_reg = /^[0-9]+$/;
                        let isInter = z_reg.test(e.target.value);
                        if (e.target.value !== '' && !isInter) {
                            if (e.target.value.substring(e.target.value.length - 1) === '+') {
                                this.handleAddProduct();
                            } else {
                                new Audio(diAudioSrc).play();
                            }
                            this._searchText4Transfer = this._lastSearchText4Transfer;
                            return;
                        }
                        // console.log('isInter=' + isInter);


                        setSelectedKeys(e.target.value ? [e.target.value] : []);
                        confirm();

                        this._searchText4Transfer = e.target.value;
                        this._lastSearchText4Transfer = e.target.value;

                        this.setState({ transferItems4NextFocus: [] }, () => {
                            let transferItems4NextFocusTemp = [];
                            this.state.allProductionDataToBeTransfer.forEach(element => {
                                if (element.barcodeSimple.indexOf(this._searchText4Transfer) !== -1) {
                                    element.editing = false;
                                    transferItems4NextFocusTemp.push(element);
                                }
                            });

                            if (transferItems4NextFocusTemp.length > 0) {
                                this.setState({ transferItems4NextFocus: transferItems4NextFocusTemp });
                            }
                        });
                    }}
                    onFocus={(e) => {
                        // console.log('输入简码 onFocus e = ' + e);
                        this.setState({ transferItems4NextFocus: [] }, () => {
                            let transferItems4NextFocusTemp = [];
                            this.state.allProductionDataToBeTransfer.forEach(element => {
                                if (element.barcodeSimple.indexOf(this._searchText4Transfer) !== -1) {
                                    element.editing = false;
                                    transferItems4NextFocusTemp.push(element);
                                }
                            });

                            if (transferItems4NextFocusTemp.length > 0) {
                                this.setState({ transferItems4NextFocus: transferItems4NextFocusTemp });
                            }
                        });
                    }}
                    onPressEnter={(e) => {
                        // console.log('搜索简码 onPressEnter e = ' + e);

                        /// 将符合条件的条目放到items4NextFocus
                        this.setState({ transferItems4NextFocus: [] }, () => {
                            let transferItems4NextFocusTemp = [];
                            this.state.allProductionDataToBeTransfer.forEach(element => {
                                if (element.barcodeSimple.indexOf(this._searchText4Transfer) !== -1) {
                                    element.editing = false;
                                    transferItems4NextFocusTemp.push(element);
                                }
                            });

                            if (transferItems4NextFocusTemp.length > 0) {
                                transferItems4NextFocusTemp[0].editing = true;
                                this.setState({ transferItems4NextFocus: transferItems4NextFocusTemp });
                            } else {
                                new Audio(diAudioSrc).play();
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
                setTimeout(() => this._searchInput && this._searchInput.select(), 300);
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
        // console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ addProductionSelectedRowKeys: selectedRowKeys });
    };

    onAddProductSelect = (record, selected) => {
        // console.log('onAddProductSelect record: ', record);
        // console.log('onAddProductSelect selected: ', selected);
        // console.log('onAddProductSelect selectedRows: ', selectedRows);
        // console.log('onAddProductSelect nativeEvent: ', nativeEvent);

        /// 放弃焦点
        record.editing = false;
        if (this._searchInput4AddProduct) {
            this._searchInput4AddProduct.select();
        }

        let allProductionDataRealToBeTransferTemp = this.state.allProductionDataRealToBeTransfer;
        if (selected) {
            let newItem4Transfer = {};
            newItem4Transfer.barcode = record.barcode;
            newItem4Transfer.barcodeSimple = record.barcode.substring(record.barcode.length - 4, record.barcode.length);
            newItem4Transfer.categoryName = record.categoryName;
            newItem4Transfer.editing = false;
            newItem4Transfer.transferPrice = record.price;
            newItem4Transfer.orderProductName = record.productName;
            newItem4Transfer.specification = record.specification;
            newItem4Transfer.orderNumber = parseInt(record.orderNumber);
            newItem4Transfer.transferNumber = parseInt(record.transferNumber);
            newItem4Transfer.sortId = 200;
            newItem4Transfer.remark = '新增';
            let key = 0;
            newItem4Transfer.key = ++key;

            let allProductionDataAfterAdd = [];
            allProductionDataAfterAdd.push(newItem4Transfer);
            for (let ii = 0; ii < allProductionDataRealToBeTransferTemp.length; ++ii) {
                let item = allProductionDataRealToBeTransferTemp[ii];
                if (item.barcode !== newItem4Transfer.barcode) {
                    item.key = ++key;
                    allProductionDataAfterAdd.push(item);
                }
            }

            this.setState({
                allProductionDataRealToBeTransfer: allProductionDataAfterAdd
            });
        } else {
            let allProductionDataAfterRemove = [];
            let key = 0;
            for (let ii = 0; ii < allProductionDataRealToBeTransferTemp.length; ++ii) {
                let item = allProductionDataRealToBeTransferTemp[ii];
                if (item.barcode !== record.barcode) {
                    item.key = ++key;
                    allProductionDataAfterRemove.push(item);
                }
            }

            this.setState({
                allProductionDataRealToBeTransfer: allProductionDataAfterRemove
            });
        }
    };

    handleAddProductOnSearch = async (text, e) => {
        // console.log('handleAddProductOnSearch text = ' + text + '; e=' + e.key);

        if (!text || text.length <= 0) {
            message.error('请输入正确的商品名称或条码');
            return;
        }

        const { searchProductDataToBeAdd } = this.state;
        let searchOrJump = 'search';
        if (e.key === 'Enter') {
            if (this._lastSearchText4AddProduct !== text) {
                searchOrJump = 'search';
            } else if (searchProductDataToBeAdd.length > 0) {
                searchOrJump = 'setAndJump';
            }
        }

        if (searchOrJump === 'search') {
            this.setState({ searchingProductData: true, searchProductDataToBeAdd: [] });
            this._lastSearchText4AddProduct = text;
            let loadProductResult = await loadProductsByKeyword(text);
            if (loadProductResult.errCode === 0 && loadProductResult.items && loadProductResult.items.length > 0) {
                let allProductionDataRealToBeTransferTemp = this.state.allProductionDataRealToBeTransfer;

                let selectKeys = [];

                loadProductResult.items.forEach(item => {
                    item.transferNumber = 0;
                    item.editing = false;
                    item.orderNumber = 0;

                    allProductionDataRealToBeTransferTemp.forEach(product => {
                        if (item.barcode === product.barcode) {
                            if (selectKeys.indexOf(item.key) === -1) {
                                selectKeys.push(item.key);
                            }
                        }
                    });
                });

                this.setState({ searchProductDataToBeAdd: loadProductResult.items, addProductionSelectedRowKeys: selectKeys });
            }
            this.setState({ searchingProductData: false });
        } else if (searchOrJump === 'setAndJump') {
            const { searchProductDataToBeAdd } = this.state;

            for (let ii = 0; ii < searchProductDataToBeAdd.length; ++ii) {
                let product = searchProductDataToBeAdd[ii];
                if (product) {
                    product.editing = true;
                }
            }
            this.forceUpdate();
            // console.log(this.state.searchProductDataToBeAdd)
        }
    };

    handleAddProductionModalonOk = () => {
        this.setState({ isAddProductionModalVisible: false, filterDropdownVisible4Transfer: true }, () => {
            setTimeout(() => {
                this._searchInput && this._searchInput.select();
            }, 400);
        });
    };

    handleProductTransferConfirm = async () => {
        // console.log('handleProductTransferConfirm begin');

        this.setState({ productTransferConfirmText: '配货信息发送中....' });

        let allProductionDataRealToBeTransfer = this.state.allProductionDataRealToBeTransfer;
        // console.log(allProductionDataRealToBeTransfer);

        let toUserId = this.state.currentShop.userId;
        let items = [];
        allProductionDataRealToBeTransfer.forEach(product => {
            let item = {};
            item.barcode = product.barcode;
            item.quantity = product.transferNumber;
            item.buyPrice = product.transferPrice;
            items.push(item);
        });

        // console.log(items);

        let result = await createStockFlowOut(toUserId, items);
        // console.log(result);
        if (result && result.errCode === 0) {
            message.success('配货成功，商品已发送至<<' + this.state.currentShop.name + '>>收银机~');
            setTimeout(() => {
                this.setState({ productTransferConfirmText: '---确定出货---' });
                this.handleBack();
            }, 1000);
        } else {
            this.setState({ productTransferConfirmText: '---确定出货---' });
            message.error('配货失败，请查看失败原因~');
        }
    }

    handleEditableCellNextFocus = () => {
        // console.log('handleEditableCellNextFocus');

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
            if (item.barcode === record.barcode) {
                item.editing = true;
            }
        }
        this.forceUpdate();
    };

    handleEditableCellCurrentEnter = (record, dataIndex) => {
        let number = record[dataIndex];
        // console.log('handleEditableCellCurrentEnter begin');
        if (number > 0) {
            // console.log(number);
            let newRecord = { ...record };
            let allProductionDataRealToBeTransferTemp = [];
            let key = 0; newRecord.key = ++key;
            allProductionDataRealToBeTransferTemp.splice(0, 0, newRecord);
            for (let ii = 0; ii < this.state.allProductionDataRealToBeTransfer.length; ++ii) {
                let item = { ...this.state.allProductionDataRealToBeTransfer[ii] };
                if (item.barcode !== newRecord.barcode) {
                    item.key = ++key;
                    allProductionDataRealToBeTransferTemp.push(item);
                }
            }

            this.setState({ allProductionDataRealToBeTransfer: allProductionDataRealToBeTransferTemp })
        } else {
            new Audio(diAudioSrc).play();
        }
    };

    handleDeleteProduct4Preview = (record) => {
        // console.log('handleDeleteProduct4Preview begin');
        let allProductionDataRealToBeTransferTemp = [];
        let key = 0;
        for (let ii = 0; ii < this.state.allProductionDataRealToBeTransfer.length; ++ii) {
            let item = { ...this.state.allProductionDataRealToBeTransfer[ii] };
            if (item.barcode !== record.barcode) {
                item.key = ++key;
                allProductionDataRealToBeTransferTemp.push(item);
            }
        }

        this.setState({ allProductionDataRealToBeTransfer: allProductionDataRealToBeTransferTemp })
    };

    handleEditableCell4AddProductNextFocus = () => {
        // console.log('handleEditableCell4AddProductNextFocus');

        let searchProductDataToBeAddTemp = this.state.searchProductDataToBeAdd;

        let lastFocusIndex = -1;
        for (let i = 0; i < searchProductDataToBeAddTemp.length; ++i) {
            let element = searchProductDataToBeAddTemp[i];
            if (element.editing) {
                lastFocusIndex = i;
                break;
            }
        }

        let newFocusIndex = lastFocusIndex;

        while (true) {
            newFocusIndex++;

            if (newFocusIndex >= searchProductDataToBeAddTemp.length) {
                if (this._searchInput4AddProduct) {
                    this._searchInput4AddProduct.select();
                }
                break;
            }

            let item = searchProductDataToBeAddTemp[newFocusIndex];
            item.editing = true;
            break;
        }

        if (lastFocusIndex >= 0 && lastFocusIndex < searchProductDataToBeAddTemp.length) {
            searchProductDataToBeAddTemp[lastFocusIndex].editing = false;
        }

        this.forceUpdate();
    };

    handleEditableCell4AddProductCurrentFocus = (record) => {
        // console.log('handleEditableCell4AddProductCurrentFocus record=' + record);
        let searchProductDataToBeAddTemp = this.state.searchProductDataToBeAdd;
        for (let i = 0; i < searchProductDataToBeAddTemp.length; ++i) {
            let item = searchProductDataToBeAddTemp[i];
            item.editing = false;
            // if (item.barcode === record.barcode) {
            //     item.editing = true;
            // }
        }
        record.editing = true;

        this.forceUpdate();
        // console.log(searchProductDataToBeAddTemp);
    };

    handleEditableCellAddProductOnChangeAddOrRemove = (addOrRemove, record) => {
        if (addOrRemove === 'add') {
            this.onAddProductSelect(record, true);

            let selectKeys = [...this.state.addProductionSelectedRowKeys];
            if (selectKeys.indexOf(record.key) === -1) {
                selectKeys.push(record.key);
            }
            this.setState({ addProductionSelectedRowKeys: selectKeys });
        } else if (addOrRemove === 'remove') {
            this.onAddProductSelect(record, false);

            let selectKeys = [...this.state.addProductionSelectedRowKeys];
            if (selectKeys.indexOf(record.key) !== -1) {
                selectKeys.splice(selectKeys.indexOf(record.key), 1);
            }
            this.setState({ addProductionSelectedRowKeys: selectKeys });
        }
    };

    getLodopAfterInit = () => {
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            let strStyle =
                `<style>
                </style> `;
            LODOP.SET_PRINTER_INDEX(getNeedlePrinterIndex());
            LODOP.SET_PRINT_PAGESIZE(1, 0, 0, getPageName4NeedlePrinter());
            LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 800, 600, '');
            LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);//打印后自动关闭预览窗口
            LODOP.ADD_PRINT_HTM(10, 0, "100%", '95%', strStyle + document.getElementById("printDiv").innerHTML);
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
        this.setState({
            productTransferPrintShow: false,
            filterDropdownVisible4Transfer: true
        })
    };

    handleBack = () => {
        let paramValueObj = {};
        paramValueObj.template = this._template;
        paramValueObj.shop = this.state.currentShop;
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

    handleAddProduct = () => {
        // this._searchInput = null;
        this.setState({
            addProductionSelectedRowKeys: [], isAddProductionModalVisible: true,
            filterDropdownVisible4Transfer: false, searchProductDataToBeAdd: []
        });
        setTimeout(() => {
            if (this._searchInput4AddProduct) {
                this._searchInput4AddProduct.select();
                this._searchInput4AddProduct.setState({ value: '' });
            }
        }, 0);
    };

    render() {
        const {
            allProductionDataToBeTransfer,
            allProductionDataRealToBeTransfer,
            searchProductDataToBeAdd,
            searchingProductData,
            isAddProductionModalVisible,
            addProductionSelectedRowKeys,
            currentShop,
            productSpinTipText,
            productSpinning,
            productTransferPrintShow,
            productTransferConfirmText
        } = this.state;

        let disableTransferPreviewOrPrint =
            (allProductionDataRealToBeTransfer &&
                allProductionDataRealToBeTransfer.length <= 0) ||
            productTransferConfirmText !== '---确定出货---';

        /// 调货列表头配置
        const KTransferColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 60, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            {
                title: '简码', dataIndex: 'barcodeSimple', key: 'barcodeSimple', width: 200, editingIndex: 'editing',
                ...this.getColumnSearchProps('barcodeSimple'),
            },
            { title: '品名', dataIndex: 'orderProductName', key: 'orderProductName', width: 160, render: (text) => { return <span style={{ fontSize: 14, color: 'red' }}>{text}</span>; } },
            { title: '订货量', dataIndex: 'orderNumber', key: 'orderNumber', width: 80, render: (text) => { return <span style={{ fontSize: 14 }}>{text}</span>; } },
            { title: '配货量', dataIndex: 'transferNumber', key: 'transferNumber', width: 160, editable: true, render: (text) => { return <span style={{ fontSize: 16 }}>{text}</span>; } },
            { title: '配货价', dataIndex: 'transferPrice', key: 'transferPrice', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '规格', dataIndex: 'specification', key: 'specification', width: 100, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            {
                title: '备注', dataIndex: 'remark', key: 'remark', width: '*',
                render: (text) => {
                    return text === '新增' ? (<span style={{
                        fontSize: 14, color: 'skyblue',
                        backgroundColor: 'yellow', fontWeight: 'bold'
                    }}>{text}</span>) :
                        <span style={{ fontSize: 10 }}>{text}</span>;
                }
            }
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
                    handleEditableCellCurrentFocus: this.handleEditableCellCurrentFocus,
                    handleEditableCellCurrentEnter: this.handleEditableCellCurrentEnter
                }),
            };
        });

        /// 增加商品列表头配置
        const KAddProductionColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '条形码', dataIndex: 'barcode', key: 'barcode', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '品名', dataIndex: 'productName', key: 'productName', width: 120, render: (text) => { return <span style={{ fontSize: 14, color: 'red' }}>{text}</span>; } },
            { title: '订货量', dataIndex: 'orderNumber', key: 'orderNumber', width: 80, render: (text) => { return <span style={{ fontSize: 14 }}>{text}</span>; } },
            { title: '配货量', dataIndex: 'transferNumber', key: 'transferNumber', width: 80, editable: true, render: (text) => { return <span style={{ fontSize: 16 }}>{text}</span>; } },
            { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 120, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '规格', dataIndex: 'specification', key: 'specification', width: 120, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '销售价', dataIndex: 'price', key: 'price', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
        ];
        const components4AddProduct = {
            body: {
                row: EditableRow4AddProduct,
                cell: EditableCell4AddProduct,
            },
        };
        const addProductColumns4TableEditable = KAddProductionColumns4Table.map((col) => {
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
                    handleEditableCellNextFocus: this.handleEditableCell4AddProductNextFocus,
                    handleEditableCellCurrentFocus: this.handleEditableCell4AddProductCurrentFocus,
                    handleEditableCellOnChangeAddOrRemove: this.handleEditableCellAddProductOnChangeAddOrRemove
                }),
            };
        });

        const addProductRowSelection = {
            hideSelectAll: true,
            selectedRowKeys: addProductionSelectedRowKeys,
            onChange: this.onAddProductionSelectChange,
            onSelect: this.onAddProductSelect
        };

        let currentTimeStr = moment().format('YYYY-MM-DD HH:mm a');

        const KProductTransferPreviewColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '条形码', dataIndex: 'barcode', key: 'barcode', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '品名', dataIndex: 'orderProductName', key: 'orderProductName', width: 160, render: (text) => { return <span style={{ fontSize: 14, color: 'red' }}>{text}</span>; } },
            { title: '订货量', dataIndex: 'orderNumber', key: 'orderNumber', width: 80, render: (text) => { return <span style={{ fontSize: 14 }}>{text}</span>; } },
            {
                title: '配货量', dataIndex: 'transferNumber', key: 'transferNumber', width: 80, editable: true,
                render:
                    (text, record) => {
                        let orderN = parseInt(record['orderNumber']);
                        let transferN = parseInt(text);
                        let color = orderN !== 0 && orderN === transferN ? 'transparent' : 'yellow';
                        return <span style={{ fontSize: 16, backgroundColor: color, padding: 4 }}>{text}</span>;
                    }
            },
            { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 120, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '规格', dataIndex: 'specification', key: 'specification', width: 120, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '配货价', dataIndex: 'transferPrice', key: 'transferPrice', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => (
                    <Button type='primary' danger onClick={(e) => {
                        this.handleDeleteProduct4Preview(record);
                    }}>删除</Button>
                )
            }
        ];

        return (
            <div>
                <Spin tip={productSpinTipText} spinning={productSpinning} size='large'>
                    <div>
                        <div style={{
                            zIndex: 2, bottom: 0, left: 0, right: 0, position: 'fixed',
                            width: '100%', height: 60, backgroundColor: 'lightgray'
                        }}>
                            <div>
                                <Button danger type='primary'
                                    disabled={disableTransferPreviewOrPrint}
                                    onClick={(e) => {
                                        this.setState({ productTransferPrintShow: true, filterDropdownVisible4Transfer: false });
                                    }}
                                    style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                                    ---打印出货单---
                                </Button>

                                <Popconfirm title={`是否确定出货？`}
                                    onConfirm={this.handleProductTransferConfirm}
                                    disabled={disableTransferPreviewOrPrint}>
                                    <Button danger type='primary'
                                        disabled={disableTransferPreviewOrPrint}
                                        style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                                        {productTransferConfirmText}
                                    </Button>
                                </Popconfirm>
                            </div>
                        </div>

                        <div style={{ marginLeft: 10, marginTop: 10 }}>
                            <Button type="primary"
                                style={{ width: 80, height: 40 }}
                                onClick={(e) => this.handleBack()}>
                                <div style={{ fontSize: 16 }}>
                                    后退
                                </div>
                            </Button>
                            <span style={{ marginLeft: 10 }}>{`弯麦(总部)->`}</span>
                            <span style={{ marginLeft: 0, marginRight: 10, color: 'red' }}>{currentShop.name}</span>

                            <Button type="primary" danger
                                style={{ width: 60, height: 30 }}
                                onClick={() => {
                                    this.handleAddProduct();
                                }}>
                                <div style={{ fontSize: 8 }}>
                                    +商品
                                </div>
                            </Button>
                        </div>

                        <Table style={{ marginTop: 10, marginLeft: 10, marginRight: 10 }}
                            size='small'
                            components={components4Transfer}
                            rowClassName={() => 'editable-row'}
                            dataSource={allProductionDataToBeTransfer}
                            columns={transferColumns4TableEditable}
                            pagination={false} bordered
                            scroll={{ y: 230, scrollToFirstRowOnChange: true }}
                            footer={() => (
                                <div style={{ textAlign: 'center', height: 5, backgroundColor: 'gray', fontSize: 12 }}>
                                </div>
                            )}
                        />
                    </div>
                </Spin>

                <div>
                    <Table
                        style={{
                            height: 480, backgroundColor: 'transparent',
                            marginLeft: 10, marginRight: 10
                        }}
                        size='small'
                        dataSource={allProductionDataRealToBeTransfer}
                        columns={KProductTransferPreviewColumns4Table}
                        bordered pagination={false}
                        scroll={{ y: 240, scrollToFirstRowOnChange: true }}
                        footer={() => (
                            <div style={{ textAlign: 'center', height: 5, backgroundColor: 'gray', fontSize: 12 }}>
                            </div>
                        )}
                    />
                </div>

                <div>
                    <Modal
                        width={1000}
                        centered
                        keyboard={true}
                        maskClosable={false}
                        closable={false}
                        title={
                            (<div>
                                <span>
                                    添加商品
                                </span>
                                <Search
                                    style={{ width: 240, marginLeft: 20 }}
                                    ref={(node) => {
                                        if (!this._searchInput4AddProduct && node) {
                                            node && node.focus();
                                            this._searchInput4AddProduct = node;
                                        }
                                    }}
                                    enterButton
                                    placeholder='-返回'
                                    onSearch={(text, e) => this.handleAddProductOnSearch(text, e)}
                                    onChange={(e) => {
                                        // console.log('onChange start');

                                        if (e.target.value !== '') {
                                            let lastStr = e.target.value.substring(e.target.value.length - 1);
                                            if (lastStr === '-') {
                                                this.handleAddProductionModalonOk();
                                                return;
                                            } else if (lastStr === '+' ||
                                                lastStr === '*' || lastStr === '/' || lastStr === '.') {
                                                new Audio(diAudioSrc).play();
                                                return;
                                            }
                                            // console.log(e.target.value);
                                        }

                                        this._searchText4AddProduct4onChange = e.target.value;
                                        this._lastSearchText4AddProduct4onChange = e.target.value;
                                    }}>
                                </Search>
                            </div>)}
                        visible={isAddProductionModalVisible}
                        onOk={this.handleAddProductionModalonOk}
                        okText='完毕'
                        cancelButtonProps={{ hidden: true }}>
                        <Table
                            size='small'
                            rowSelection={addProductRowSelection}
                            loading={searchingProductData}
                            dataSource={searchProductDataToBeAdd}
                            components={components4AddProduct}
                            columns={addProductColumns4TableEditable}
                            bordered pagination={false}
                            scroll={{ y: 400, scrollToFirstRowOnChange: true }}
                        />
                    </Modal>
                </div>

                <div>
                    <Modal
                        width={1000}
                        centered
                        keyboard
                        maskClosable={false}
                        maskStyle={{ backgroundColor: 'white' }}
                        title={(<div style={{ height: 0 }}></div>)}
                        closable={false}
                        visible={productTransferPrintShow}
                        footer={
                            (<div style={{ marginRight: 120, marginBottom: 20, marginTop: 20 }}>
                                <Button key="back" onClick={(e) =>
                                    this.setState({
                                        productTransferPrintShow: false,
                                        filterDropdownVisible4Transfer: true
                                    })}>
                                    取消
                                </Button>,
                                <Button key="submit" type="primary" danger onClick={(e) => this.productPrintDirectAndBack()}>
                                    直接打印
                                </Button>,
                                <Button
                                    key="link"
                                    type="primary"
                                    onClick={(e) => this.productPrintPreprew()}
                                >
                                    打印预览
                                </Button>
                            </div>)
                        }>
                        <div id="printDiv" style={{ width: '100%', height: 500, borderStyle: 'dotted' }}>
                            <div style={{
                                marginLeft: 10, marginTop: 10, marginRight: 10,
                                backgroundColor: 'transparent'
                            }}>
                                <div>
                                    <span style={{ fontSize: 30 }}>门店出货单</span>
                                </div>
                                <div>
                                    <span>收货门店：</span>
                                    <span>{currentShop.name}</span>

                                    <span style={{ marginLeft: 100 }}>出单时间：</span>
                                    <span>{currentTimeStr}</span>
                                </div>
                                <div>
                                    {
                                        <table border='1' cellSpacing='0' cellPadding='2' style={{ float: 'left' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>序</th>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>条码</th>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>品名</th>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>订货量</th>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>配货量</th>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>分类</th>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>规格</th>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>备注</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    allProductionDataRealToBeTransfer.map((productItem) => {
                                                        // console.log(productItem)
                                                        let serialNum = allProductionDataRealToBeTransfer.indexOf(productItem) + 1;
                                                        let transferNumberBGcolor = productItem.transferNumber !== 0 &&
                                                            productItem.transferNumber === productItem.orderNumber
                                                            ? 'transparent' : 'yellow';
                                                        return (
                                                            <tr key={serialNum}>
                                                                <th key='1' style={{ height: 20, width: 20, textAlign: 'center', fontSize: 16 }}>{serialNum}</th>
                                                                <th key='2' style={{ height: 20, width: 120, textAlign: 'center', fontSize: 16 }}>{productItem.barcode}</th>
                                                                <th key='3' style={{ height: 20, width: 200, textAlign: 'center', fontSize: 16 }}>{productItem.orderProductName}</th>
                                                                <th key='4' style={{ height: 20, width: 40, textAlign: 'center', fontSize: 16 }}>{productItem.orderNumber}</th>
                                                                <th key='5' style={{ backgroundColor: transferNumberBGcolor, height: 20, width: 40, textAlign: 'center', fontSize: 16 }}>{productItem.transferNumber}</th>
                                                                <th key='6' style={{ height: 20, width: 140, textAlign: 'center', fontSize: 16 }}>{productItem.categoryName}</th>
                                                                <th key='7' style={{ height: 20, width: 200, textAlign: 'center', fontSize: 16 }}>{productItem.specification}</th>
                                                                <th key='8' style={{ height: 20, width: 80, textAlign: 'center', fontSize: 16 }}></th>
                                                            </tr>)
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    }
                                </div>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div >
        );
    };
};

export default ProductDistributeInputer;
