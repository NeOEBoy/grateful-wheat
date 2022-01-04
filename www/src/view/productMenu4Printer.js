/*
商品菜单，用于打印

菜单提取教育局店3日之前有销量的商品
*/

import React from 'react';
import moment from 'moment';

import { Spin, Image, Button, Typography } from 'antd';
import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';
import {
    getPageName4A4Printer,
    getA4PrinterIndex,
} from '../api/util';
import {
    loadProductsSale
} from '../api/api';

const KCategorys = [
    { categoryId: '1593049816479739965', categoryName: '现烤面包', productItems: [] },
    { categoryId: '1592989355905414162', categoryName: '西点慕斯蛋糕', productItems: [] },
    { categoryId: '1593049881212199906', categoryName: '常温蛋糕', productItems: [] },
    { categoryId: '1593049854760654816', categoryName: '吐司面包', productItems: [] },
    { categoryId: '1626767161867698544', categoryName: '餐包面包', productItems: [] },
    { categoryId: '1593059349213583584', categoryName: '干点饼干', productItems: [] },
    { categoryId: '1604471906489441680', categoryName: '小蛋糕', productItems: [] },
    { categoryId: '1611200031064132560', categoryName: '小零食', productItems: [] },
    { categoryId: '1615972878471894425', categoryName: '长富常温牛奶', productItems: [] }
];

const KImageRoot = '/image';

class ProductMenu4Printer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            productSpinTipText: '',
            productSpinning: false,
            allData: [],
            debug: 0
        };
    }

    componentDidMount = async () => {
        let query = this.props.query;
        let debug = query && query.get('debug');

        this.setState({ debug: debug });
        this.refresh();
    };

    refresh = async () => {
        this.setState({ productSpinning: true, productSpinTipText: '获取商品信息...' }, async () => {
            let theData = [];
            for (let i = 0; i < KCategorys.length; ++i) {
                let category = KCategorys[i];
                let categoryId = category.categoryId;
                let categoryName = category.categoryName;

                /// 提取3天之前的数据
                let nowMoment = moment();
                let endDateTimeStr = nowMoment.endOf('day').format('YYYY.MM.DD HH:mm:ss');
                let beginDateTimeStr = nowMoment.subtract(3, 'days').startOf('day').format('YYYY.MM.DD HH:mm:ss');

                // console.log(beginDateTimeStr);
                // console.log(endDateTimeStr);

                /// 教育局店，有销量
                let loadResult = await loadProductsSale(categoryId, '3995767', '1', beginDateTimeStr, endDateTimeStr);
                // console.log(loadResult);

                if (loadResult.errCode === 0 && loadResult.list.length > 0) {
                    let resultList = loadResult.list;
                    for (let j = 0; j < resultList.length; ++j) {
                        let newItem = { ...resultList[j] };
                        if (j % 4 === 0) {
                            let newPage = { key: theData.length + 1, categoryName: categoryName, productItems: [] };
                            newPage.productItems.push(newItem);
                            theData.push(newPage);
                        } else {
                            let lastData = theData[theData.length - 1].productItems;
                            lastData.push(newItem);
                        }
                    }
                }
                // break;
            }

            // console.log(theData);

            let theDataAfterPage = [];
            for (let i = 0; i < theData.length; ++i) {
                let item = theData[i];
                if (i % 7 === 0) {
                    let newPage = { key: theDataAfterPage.length + 1, productPages: [] };
                    newPage.productPages.push(item);
                    theDataAfterPage.push(newPage);
                } else {
                    let lastPage = theDataAfterPage[theDataAfterPage.length - 1].productPages;
                    lastPage.push(item);
                }
            }

            // console.log(theDataAfterPage);

            this.setState({ allData: theDataAfterPage, productSpinning: false, productSpinTipText: '' });
        });

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

    render() {
        const { allData, productSpinTipText, productSpinning, debug } = this.state;

        return (
            <div>
                <Spin tip={productSpinTipText} spinning={productSpinning} size='large'>
                    <div>
                        <Button style={{
                            backgroundColor: 'transparent',
                            margin: 10,
                        }} onClick={() => this.productPrintPreprew()}>
                            微信菜单打印
                        </Button>

                        <div id='printDiv'>
                            {
                                allData.map((item) => {
                                    let productPage = item.productPages;
                                    return (
                                        <div key={item.key} style={{ backgroundColor: 'transparent', width: 1374, height: 964 }}>
                                            {
                                                productPage.map((item1) => {
                                                    let productItems = item1.productItems;
                                                    return (
                                                        <div key={item1.key} style={{ float: 'left', marginTop: 0 }}>
                                                            <div style={{
                                                                textAlign: 'center', backgroundColor: 'green', color: 'white',
                                                                marginLeft: 0, marginRight: 0, paddingTop: 5, paddingBottom: 5
                                                            }}>
                                                                {item1.categoryName}
                                                            </div>
                                                            <div style={{ height: 10 }}></div>
                                                            <div style={{ float: 'left', marginLeft: 0, width: 10, height: 850, backgroundColor: 'transparent' }} />
                                                            <div style={{ float: 'left', width: 160, height: 850 }}>
                                                                {
                                                                    productItems.map((item2) => {
                                                                        let imageSrc = KImageRoot;
                                                                        imageSrc += '/';
                                                                        imageSrc += item1.categoryName;
                                                                        imageSrc += '/';
                                                                        imageSrc += item2.productName;;
                                                                        imageSrc += '.jpg';
                                                                        // console.log(imageSrc)
                                                                        return (
                                                                            <div key={item2.key}>
                                                                                <div style={{ width: 160, height: 160 }}>
                                                                                    <Image style={{ width: 160, height: 160 }} preview={false} src={imageSrc} onError={(e) => {
                                                                                        /// 图片加载不成功时隐藏
                                                                                        // e.target.style.display = 'none';
                                                                                    }} />
                                                                                </div>
                                                                                <div style={{ fontSize: 14, color: 'black' }}>{item2.productName}</div>
                                                                                <div style={{ fontSize: 12, color: 'gray' }}>{item2.specification}</div>
                                                                                <div style={{ fontSize: 14, color: 'black' }}>
                                                                                    <span>
                                                                                        ¥
                                                                                    </span>
                                                                                    <span>
                                                                                        {item2.price}
                                                                                    </span>
                                                                                    <span>
                                                                                        /
                                                                                    </span>
                                                                                    <span>
                                                                                        {item2.unit}
                                                                                    </span>
                                                                                </div>
                                                                                <div style={{ height: 5 }}></div>
                                                                                {debug ? (
                                                                                    <div style={{ color: 'red', fontSize: 8 }}>
                                                                                        <span>三天内销售量：</span>
                                                                                        <span>{item2.saleNumber}</span>
                                                                                    </div>
                                                                                ) : (<div></div>)}
                                                                                {debug ? (
                                                                                    <div style={{ color: 'red', fontSize: 8 }}>
                                                                                        <span>{item2.barcode}</span>
                                                                                    </div>
                                                                                ) : (<div></div>)}
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                            <div style={{ float: 'left', marginLeft: 0, width: 10, height: 850, backgroundColor: 'transparent' }} />
                                                        </div>
                                                    )
                                                })
                                            }

                                            <div style={{ float: 'left', marginLeft: 5, marginTop: 0, fontSize: 15 }}>
                                                <div style={{
                                                    textAlign: 'center', backgroundColor: 'red', color: 'white',
                                                    marginLeft: 0, marginRight: 0, paddingTop: 5, paddingBottom: 5
                                                }}>
                                                    教育局店微信
                                                </div>
                                                <Image style={{ width: 105, height: 105, marginTop: 10 }} preview={false} src={require('../image/教育局店个人微信.jpg')} />
                                                <div style={{
                                                    textAlign: 'center', backgroundColor: 'red', color: 'white', marginTop: 10,
                                                    marginLeft: 0, marginRight: 0, paddingTop: 5, paddingBottom: 5
                                                }}>
                                                    教育局店电话
                                                </div>
                                                <div style={{
                                                    textAlign: 'center'
                                                }}>
                                                    13290768588
                                                </div>
                                                <div style={{
                                                    textAlign: 'center'
                                                }}>
                                                    （微信同号）
                                                </div>
                                                <div style={{
                                                    textAlign: 'center', backgroundColor: 'red', color: 'white', marginTop: 10,
                                                    marginLeft: 0, marginRight: 0, paddingTop: 5, paddingBottom: 5
                                                }}>
                                                    教育局店地址
                                                </div>
                                                <div style={{

                                                    textAlign: 'center'
                                                }}>
                                                    漳浦县绥安镇
                                                </div>

                                                <div style={{
                                                    textAlign: 'center'
                                                }}>
                                                    府前街西247号
                                                </div>

                                                <div style={{
                                                    textAlign: 'center'
                                                }}>
                                                    （教育局对面）
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </Spin>
            </div>
        );
    }
}

export default ProductMenu4Printer;
