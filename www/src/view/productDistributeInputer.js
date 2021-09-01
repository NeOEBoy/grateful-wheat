
import React, { useContext, useRef } from 'react';
import {
    Button, Table, Spin,
    message, Form, Input, Modal
} from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';

import { getProductOrderItems, loadProductsByKeyword, createStockFlowOut } from '../api/api';
import { findTemplateWithCache } from '../api/cache';
const { Search } = Input;

/// 模板信息
const KOrderTemplates = [
    { index: 0, name: '全部模板', templateId: '', templateUid: '' },
    { index: 1, name: '现烤类', templateId: '187', templateUid: '1595310806940367327' },
    { index: 2, name: '西点类', templateId: '189', templateUid: '1595397637628133418' },
    { index: 3, name: '常温类', templateId: '183', templateUid: '1595077654714716554' },
    { index: 4, name: '吐司餐包类', templateId: '182', templateUid: '1595077405589137749' }
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
const KProductTransferPreviewColumns4Table = [
    { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '条形码', dataIndex: 'barcode', key: 'barcode', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '品名', dataIndex: 'orderProductName', key: 'orderProductName', width: 120, render: (text) => { return <span style={{ fontSize: 14, color: 'red' }}>{text}</span>; } },
    { title: '配货量', dataIndex: 'transferNumber', key: 'transferNumber', width: 80, editable: true, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 120, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '规格', dataIndex: 'specification', key: 'specification', width: 120, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
    { title: '配货价', dataIndex: 'transferPrice', key: 'transferPrice', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
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
                        disabled={record.disabledInput}
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
            productTransferPreviewShow: false,
            searchProductDataToBeAdd: [],
            searchingProductData: false,
            isAddProductionModalVisible: false,
            addProductionSelectedRowKeys: [],
            currentShop: {},
            productSpinTipText: '',
            productSpinning: false,
            transferItems4NextFocus: [],
            filterDropdownVisible4Transfer: true,
        };
        this._searchInput = null;
        this._searchInput4AddProduct = null;
        this._searchText4Transfer = '';
        this._lastSearchText4AddProduct = '';
    };

    componentDidMount = async () => {
        console.log('componentDidMount begin');

        let query = this.props.query;
        if (query) {
            let paramValueStr = query.get('param');
            // console.log(paramValueStr);
            paramValueStr = unescape(paramValueStr);
            // console.log(paramValueStr);
            let paramValueObj = JSON.parse(paramValueStr);
            let shop = paramValueObj.shop;
            let template = paramValueObj.template;
            let orderList = paramValueObj.orderList;
            this.setState({ currentShop: shop });
            // console.log(shop);
            // console.log(template);
            // console.log(orderList);
            this.refresh(template, orderList);
        }
    };

    refresh = async (template, orderList) => {
        this.setState({ productSpinning: true, productSpinTipText: '准备录入...' }, async () => {
            let allData = [];

            /// 1.获取每家店的订货信息，整合成allData
            this.setState({ productSpinTipText: '准备获取...' });
            for (let index = 0; index < orderList.length; ++index) {
                let orderItem = orderList[index];
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
                                let templateAndBarcode = template.templateId + '-' + orderItems.items[i].barcode;
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

                            let templateAndBarcode = template.templateId + '-' + newItemObject.barcode;
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

            this.setState({ productSpinTipText: '整理商品...' });
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

            this.setState({ productSpinning: false, productSpinTipText: '', allProductionDataToBeTransfer: transferData });
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
                    placeholder={`输入简码`}
                    value={this._searchText4Transfer}
                    onChange={(e) => {
                        // console.log('输入简码 onChange');

                        setSelectedKeys(e.target.value ? [e.target.value] : []);
                        confirm();

                        this._searchText4Transfer = e.target.value;

                        if (this._addProductButton) {
                            this._addProductButton.disabled = this._searchText4Transfer.length > 0;
                        }
                    }}
                    onFocus={(e) => {
                        // console.log('输入简码 onFocus e = ' + e);
                    }}
                    onPressEnter={(e) => {
                        // console.log('搜索简码 onPressEnter e = ' + e);

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
        // console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ addProductionSelectedRowKeys: selectedRowKeys });
    };

    onAddProductSelect = (record, selected, selectedRows, nativeEvent) => {
        // console.log('onAddProductSelect record: ', record);
        // console.log('onAddProductSelect selected: ', selected);
        // console.log('onAddProductSelect selectedRows: ', selectedRows);
        // console.log('onAddProductSelect nativeEvent: ', nativeEvent);

        /// 放弃焦点
        record.editing = false;
        if (this._searchInput4AddProduct) {
            this._searchInput4AddProduct.select();
        }

        let allProductionDataToBeTransferTemp = this.state.allProductionDataToBeTransfer;
        let position = -1;
        for (let i = 0; i < allProductionDataToBeTransferTemp.length; ++i) {
            let currentItem = allProductionDataToBeTransferTemp[i];
            if (currentItem.barcode === record.barcode) {
                position = i;
                break;
            }
        }

        if (selected) {
            record.disabledInput = true;
            if (position === -1) {
                let newItem4Transfer = {};
                newItem4Transfer.barcode = record.barcode;
                newItem4Transfer.barcodeSimple = record.barcode.substring(record.barcode.length - 4, record.barcode.length);
                newItem4Transfer.categoryName = record.categoryName;
                newItem4Transfer.editing = false;
                newItem4Transfer.transferPrice = record.price;
                newItem4Transfer.orderProductName = record.productName;
                newItem4Transfer.specification = record.specification;
                newItem4Transfer.orderNumber = record.transferNumber;
                newItem4Transfer.transferNumber = record.transferNumber;
                newItem4Transfer.sortId = 200;
                newItem4Transfer.remark = '新增';
                newItem4Transfer.key = allProductionDataToBeTransferTemp.length + 1;

                let allProductionDataAfterAdd = []; let transferItems4NextFocusTemp = [];
                allProductionDataToBeTransferTemp.forEach(product => {
                    product.editing = false;
                    let newProduct = { ...product };
                    allProductionDataAfterAdd.push(newProduct);
                    transferItems4NextFocusTemp.push(product);
                });
                allProductionDataAfterAdd.push(newItem4Transfer);
                transferItems4NextFocusTemp.push(newItem4Transfer);

                this.setState({
                    allProductionDataToBeTransfer: allProductionDataAfterAdd,
                    transferItems4NextFocus: transferItems4NextFocusTemp
                });
                // console.log(allProductionDataAfterAdd);
            }
        } else {
            record.disabledInput = false;
            if (position !== -1) {
                let existItem = allProductionDataToBeTransferTemp[position];

                let allProductionDataAfterRemove = [];
                let transferItems4NextFocusTemp = [];
                let keyIndex = 0;

                for (let jj = 0; jj < allProductionDataToBeTransferTemp.length; ++jj) {
                    let product = allProductionDataToBeTransferTemp[jj];
                    if (product.barcode === existItem.barcode) continue;

                    ++keyIndex; product.key = keyIndex;
                    let pro = { ...product };
                    allProductionDataAfterRemove.push(pro);
                    transferItems4NextFocusTemp.push(pro);
                }

                this.setState({
                    allProductionDataToBeTransfer: allProductionDataAfterRemove,
                    transferItems4NextFocus: transferItems4NextFocusTemp
                });
            }
        }
    };

    handleProductionTransferPreview = async () => {
        // console.log('handleProductionTransferPreview begin');

        const allDataToBeTransfer = this.state.allProductionDataToBeTransfer;
        let allProductionDataRealToBeTransferTemp = [];
        let key = 0;
        allDataToBeTransfer.forEach(oneItem => {
            oneItem.editing = false;

            if (oneItem.transferNumber > 0) {
                ++key;
                let newItem = { ...oneItem };
                newItem.key = key;
                allProductionDataRealToBeTransferTemp.push(newItem);
            }
        });
        this.setState({
            allProductionDataRealToBeTransfer: allProductionDataRealToBeTransferTemp,
            productTransferPreviewShow: true, filterDropdownVisible4Transfer: false
        });
    };

    onAddProductSearch = async (text, e) => {
        // console.log('onAddProductSearch text = ' + text + '; e=' + e.key);

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
                let allProductionDataToBeTransferTemp = this.state.allProductionDataToBeTransfer;

                let selectKeys = [];

                loadProductResult.items.forEach(item => {
                    item.transferNumber = 0;
                    item.editing = false;

                    allProductionDataToBeTransferTemp.forEach(product => {
                        if (item.barcode === product.barcode) {
                            if (selectKeys.indexOf(item.key) === -1) {
                                item.disabledInput = true;
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
                if (product && !(product.disabledInput)) {
                    product.editing = true;
                }
            }
            this.forceUpdate();
            // console.log(this.state.searchProductDataToBeAdd)
        }
    };

    handleAddProductionModalOk = () => {
        this.setState({ isAddProductionModalVisible: false });
        this.setState({ filterDropdownVisible4Transfer: true });

        setTimeout(() => {
            this._searchInput.select();
        }, 100);
    };

    handleAddProductionModalCancel = () => {
        this.handleAddProductionModalOk();
    };

    handleProductTransferPreviewCancel = async () => {
        this.setState({
            productTransferPreviewShow: false,
        }, () => {
            this.setState({
                allProductionDataRealToBeTransfer: [],
                filterDropdownVisible4Transfer: true
            })
        });
    }

    handleProductTransferPreviewOK = async () => {
        console.log('handleProductTransferPreviewOK begin');

        let allProductionDataRealToBeTransfer = this.state.allProductionDataRealToBeTransfer;
        console.log(allProductionDataRealToBeTransfer);

        let toUserId = this.state.currentShop.userId;
        let items = [];
        allProductionDataRealToBeTransfer.forEach(product => {
            let item = {};
            item.barcode = product.barcode;
            item.quantity = product.transferNumber;
            item.buyPrice = product.transferPrice;
            items.push(item);
        });

        let result = await createStockFlowOut(toUserId, items);
        // console.log(result);
        if (result && result.errCode === 0) {
            message.success('配货成功，商品已发送至<<' + this.state.currentShop.name + '>>收银机~')
        } else {
            message.error('配货失败~');
        }

        this.handleProductTransferPreviewCancel();
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
            if (!item.disabledInput) {
                item.editing = true;
                break;
            }
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
            if (item.barcode === record.barcode) {
                item.editing = true;
            }
        }
        this.forceUpdate();
        // console.log(searchProductDataToBeAddTemp);
    };

    render() {
        const {
            allProductionDataToBeTransfer,
            allProductionDataRealToBeTransfer,
            productTransferPreviewShow,
            searchProductDataToBeAdd,
            searchingProductData,
            isAddProductionModalVisible,
            addProductionSelectedRowKeys,
            currentShop,
            productSpinTipText,
            productSpinning,
        } = this.state;

        let disableTransferPreviewOk = allProductionDataRealToBeTransfer &&
            allProductionDataRealToBeTransfer.length <= 0;

        /// 调货列表头配置
        const KTransferColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 60, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            {
                title: '简码', dataIndex: 'barcodeSimple', key: 'barcodeSimple', width: 200, editingIndex: 'editing',
                ...this.getColumnSearchProps('barcodeSimple'),
            },
            { title: '品名', dataIndex: 'orderProductName', key: 'orderProductName', width: 160, render: (text) => { return <span style={{ fontSize: 14, color: 'red' }}>{text}</span>; } },
            { title: '订货量', dataIndex: 'orderNumber', key: 'orderNumber', width: 80, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '配货量', dataIndex: 'transferNumber', key: 'transferNumber', width: 160, editable: true, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
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
                    handleEditableCellCurrentFocus: this.handleEditableCellCurrentFocus
                }),
            };
        });

        const addProductRowSelection = {
            hideSelectAll: true,
            selectedRowKeys: addProductionSelectedRowKeys,
            onChange: this.onAddProductionSelectChange,
            onSelect: this.onAddProductSelect
        };

        /// 增加商品列表头配置
        const KAddProductionColumns4Table = [
            { title: '序', dataIndex: 'key', key: 'key', width: 40, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '条形码', dataIndex: 'barcode', key: 'barcode', width: 140, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
            { title: '品名', dataIndex: 'productName', key: 'productName', width: 120, render: (text) => { return <span style={{ fontSize: 14, color: 'red' }}>{text}</span>; } },
            { title: '配货量', dataIndex: 'transferNumber', key: 'transferNumber', width: 80, editable: true, render: (text) => { return <span style={{ fontSize: 10 }}>{text}</span>; } },
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
                    handleEditableCellCurrentFocus: this.handleEditableCell4AddProductCurrentFocus
                }),
            };
        });

        return (
            <Spin tip={productSpinTipText} spinning={productSpinning} size='large'>
                <div>
                    <div style={{
                        zIndex: 2, bottom: 0, left: 0, right: 0, position: 'fixed',
                        width: '100%', height: 60, backgroundColor: 'lightgray'
                    }}>
                        <div>
                            <Button danger type='primary'
                                onClick={this.handleProductionTransferPreview}
                                style={{ width: 210, height: 30, marginLeft: 50, marginTop: 10 }}>
                                配货预览
                            </Button>
                        </div>
                    </div>

                    <div style={{ marginLeft: 10, marginTop: 10 }}>
                        <Button type="primary"
                            style={{ width: 80, height: 40 }}
                            onClick={() => {
                                window.history.go(-1)
                                setTimeout(() => {
                                    window.location.reload();
                                }, 500);
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
                            ref={(node) => {
                                if (!this._addProductButton && node) {
                                    this._addProductButton = node;
                                }
                            }}
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
                            centered
                            keyboard
                            maskClosable={false}
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
                                        placeholder='输入商品名称'
                                        onSearch={(text, e) => this.onAddProductSearch(text, e)}>
                                    </Search>
                                </div>)}
                            visible={isAddProductionModalVisible}
                            onOk={this.handleAddProductionModalOk}
                            onCancel={this.handleAddProductionModalCancel}
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
                                scroll={{ y: 360, scrollToFirstRowOnChange: true }}
                            />
                        </Modal>
                        <Table style={{ marginTop: 10, marginLeft: 10, marginRight: 10 }}
                            size='small'
                            components={components4Transfer}
                            rowClassName={() => 'editable-row'}
                            dataSource={allProductionDataToBeTransfer}
                            columns={transferColumns4TableEditable}
                            pagination={false} bordered
                            scroll={{ y: 550, scrollToFirstRowOnChange: true }}
                            footer={() => (
                                <div>
                                    <div style={{ textAlign: 'center', height: 20 }}>
                                        ---心里满满都是你---
                                    </div>
                                    <div style={{ height: 20 }}>
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    <div>
                        <Modal
                            width={1000}
                            centered
                            keyboard
                            maskClosable={false}
                            title='配货预览'
                            visible={productTransferPreviewShow}
                            onCancel={() => { this.handleProductTransferPreviewCancel() }}
                            onOk={() => this.handleProductTransferPreviewOK()}
                            okText='---确定出货---'
                            okButtonProps={{ disabled: disableTransferPreviewOk }}
                        >
                            <Table
                                size='small'
                                dataSource={allProductionDataRealToBeTransfer}
                                columns={KProductTransferPreviewColumns4Table}
                                bordered pagination={false}
                                scroll={{ y: 360, scrollToFirstRowOnChange: true }}
                            />
                        </Modal>
                    </div>
                </div>
            </Spin>
        );
    };
};

export default ProductDistributeInputer;
