/*
打印商品标签
*/
import React from 'react';
import {
    Input, message, List,
    Card, Button, InputNumber,
    DatePicker, Radio
} from 'antd';
import moment from 'moment';

import {
    loadProductsByKeyword
} from '../api/api';

import {
    getLabelPrinterIndex
} from '../api/util';

import {
    getLodop
} from './Lodop6.226_Clodop4.127/LodopFuncs';

const { Search } = Input;

const KAmOrPmTypeOptions = [
    { label: '早上 z', value: 'z' },
    { label: '下午 zz', value: 'zz' }
];

class ProductLabelPrinter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            productList: [],
            amOrPmType: KAmOrPmTypeOptions[0].value,
            productLabelPrintProductionDate: moment()
        };
    }

    componentDidMount = async () => {
    };

    // 搜索
    handleOnSearch = async (value) => {
        if (value.trim() === '' || value === undefined) return;

        let result = await loadProductsByKeyword(value);
        if (!result || result.errCode !== 0) {
            message.warning('查找商品信息失败~');
            return;
        }

        // console.log('result.items = ' + result.items);

        this.setState({ productList: result.items });
    }

    handleAmOrPmTypeChange = (e) => {
        this.setState({ amOrPmType: e.target.value });
    }

    handleProductLabelPrintProductionDateChange = (date) => {
        this.setState({ productLabelPrintProductionDate: date });
    }

    handleNumberChange = (value) => {
        this.setState({ printNum: value });
    }

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

            LODOP.ADD_PRINT_BARCODE(28, 16, 174, 14, "128Auto", barcode);
            LODOP.SET_PRINT_STYLEA(3, "ShowBarText", 0);

            LODOP.ADD_PRINT_TEXT(42, 6, 150, 15, ingredients);
            LODOP.SET_PRINT_STYLEA(4, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(4, "FontSize", 7);

            LODOP.ADD_PRINT_TEXT(54, 6, 150, 15, productLabelPrintProductionDateAndTime);
            LODOP.SET_PRINT_STYLEA(5, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(5, "FontSize", 7);

            LODOP.ADD_PRINT_TEXT(66, 6, 150, 15, expirationDate);
            LODOP.SET_PRINT_STYLEA(6, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(6, "FontSize", 7);

            LODOP.ADD_PRINT_TEXT(78, 6, 150, 15, '生产商：漳州古西优作食品有限公司漳浦分公司');
            LODOP.SET_PRINT_STYLEA(7, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(7, "FontSize", 5);

            LODOP.ADD_PRINT_TEXT(86, 6, 150, 15, '经营许可证编号：JY23506230105266');
            LODOP.SET_PRINT_STYLEA(8, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(8, "FontSize", 5);

            LODOP.ADD_PRINT_TEXT(94, 6, 150, 15, '地址：漳浦县府前街西247号');
            LODOP.SET_PRINT_STYLEA(9, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(9, "FontSize", 5);

            LODOP.ADD_PRINT_TEXT(102, 6, 150, 15, '电话：13290768588');
            LODOP.SET_PRINT_STYLEA(10, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(10, "FontSize", 5);

            LODOP.ADD_PRINT_TEXT(94, 100, 150, 15, transferPrice);
            LODOP.SET_PRINT_STYLEA(11, "FontName", "微软雅黑");
            LODOP.SET_PRINT_STYLEA(11, "FontSize", 12);

            LODOP.PRINT();
            // LODOP.PREVIEW();
        }
    }

    render() {
        const {
            productList,
            amOrPmType,
            productLabelPrintProductionDate,
            printNum
        } = this.state;

        return (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 25, marginTop: 32, marginBottom: 32 }}>
                    标签打印
                </div>
                <div>
                    <DatePicker picker='day'
                        size='small'
                        style={{ width: 170, marginLeft: 100 }}
                        placeholder='选择生产日期'
                        format='YYYY-MM-DD dddd'
                        value={productLabelPrintProductionDate}
                        onChange={this.handleProductLabelPrintProductionDateChange} />
                    <span style={{ marginLeft: 18 }}>
                        <Radio.Group style={{ marginTop: 8, margeLeft: 8 }}
                            options={KAmOrPmTypeOptions}
                            value={amOrPmType}
                            onChange={this.handleAmOrPmTypeChange}>
                        </Radio.Group>
                    </span>
                </div>
                <div style={{ marginTop: 20 }}>
                    <Search
                        style={{ width: 280 }}
                        placeholder="输入条形码或者名称"
                        allowClear
                        size='large'
                        onSearch={this.handleOnSearch}
                    />
                </div>


                <List
                    style={{
                        marginTop: 20, marginBottom: 20,
                        marginLeft: 10, marginRight: 10
                    }}
                    grid={{
                        gutter: 0,
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 4,
                        xl: 5,
                        xxl: 6,
                    }}
                    bordered
                    dataSource={productList}
                    renderItem={item => (
                        <List.Item key={item.key} style={{ marginTop: 20 }}>
                            <Card title={item.productName}>
                                <div style={{ border: '1px dotted #5F9EA0' }}>
                                    <div style={{ textAlign: 'center', fontSize: 16, marginTop: 2 }}>
                                        {`弯麦-${item.productName}`}
                                    </div>
                                    <div style={{ fontSize: 14 }}>
                                        {item.barcode}
                                    </div>
                                    <div style={{ textAlign: 'left', fontSize: 14, marginLeft: 8 }}>
                                        {`分类：${item.categoryName}`}
                                    </div>
                                    <div style={{ textAlign: 'left', fontSize: 14, marginLeft: 8 }}>
                                        {`配料表: ${item.ingredients}`}
                                    </div>
                                    <div style={{ textAlign: 'left', fontSize: 12, marginLeft: 8 }}>
                                        生产商：漳州市古西优作食品有限公司漳浦分公司
                                    </div>
                                    <div style={{ textAlign: 'left', fontSize: 12, marginLeft: 8 }}>
                                        地址：漳浦县府前街西247号
                                    </div>
                                    <div style={{ textAlign: 'left', fontSize: 12, marginLeft: 8 }}>
                                        电话：13290768588
                                        <span style={{ fontSize: 14, marginLeft: 40 }}>{`${item.price}元`}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 8 }}>
                                    <span style={{ textAlign: 'left' }}>
                                        <InputNumber min={1} max={100} defaultValue={1} value={printNum}
                                            onChange={(value) => {
                                                item._printCount = value;
                                            }}></InputNumber>
                                    </span>
                                    <span style={{ textAlign: 'right', marginLeft: 8 }}>
                                        <Button onClick={() => {
                                            let qualityDay = item.qualityDay;
                                            let qualityDayInt = 3;
                                            try {
                                                qualityDayInt = parseInt(qualityDay);
                                            } catch {
                                                qualityDayInt = 3;
                                            }
                                            let expirationDate = new moment(productLabelPrintProductionDate).add(qualityDayInt, 'days').endOf('day');

                                            let template = {
                                                name: '弯麦-' + item.productName,
                                                barcode: item.barcode,
                                                price: '¥' + Number(item.price).toFixed(1),
                                                ingredients: '配料表：' + item.ingredients,
                                                productLabelPrintProductionDateAndTime:
                                                    '生产日期：' + productLabelPrintProductionDate.format('MM/DD') + ' ' + amOrPmType,
                                                expirationDate: '保质期至：' + expirationDate.format('MM/DD HH:mm')
                                            };
                                            // console.log('template = ' + JSON.stringify(template));

                                            /// 打印个数
                                            let loopCount = 1;
                                            if (item._printCount) {
                                                loopCount = item._printCount;
                                            }
                                            for (let i = 0; i < loopCount; ++i) {
                                                /// 输出打印
                                                this.productLabelPrintDirect(
                                                    template.name,
                                                    template.barcode,
                                                    template.price,
                                                    template.ingredients,
                                                    template.productLabelPrintProductionDateAndTime,
                                                    template.expirationDate
                                                );
                                            }
                                        }}>发送</Button>
                                    </span>
                                </div>
                            </Card>
                        </List.Item>
                    )
                    }
                />

            </div >
        )
    };
};

export default ProductLabelPrinter;
