/*
商品菜单，用于打印
*/
import React from 'react';
import { Image, Button } from 'antd';
import {
    allBreadInfos
} from '../api/api';
import {
    getPageName4A4Printer,
    getA4PrinterIndex,
} from '../api/util';
import {
    getLodop
} from './Lodop6.226_Clodop4.127/LodopFuncs';

class ProductMenu4Printer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allData: []
        };
    }

    componentDidMount = async () => {
        this.refresh();
    };

    refresh = async () => {
        const breadInfosObj = await allBreadInfos();
        // console.log('breadInfosObj = ' + JSON.stringify(breadInfosObj));
        let categorys = breadInfosObj.categorys;
        let theData = [];
        for (let i = 0; i < categorys.length; ++i) {
            let category = categorys[i];
            let categoryName = category.name;
            let products = category.products;
            for (let j = 0; j < products.length; ++j) {
                let newItem = products[j];
                if (j % 4 === 0) {
                    let newPage = { key: theData.length + 1, categoryName: categoryName, productItems: [] };
                    newPage.productItems.push(newItem);
                    theData.push(newPage);
                } else {
                    let lastData = theData[theData.length - 1].productItems;
                    lastData.push(newItem);
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
            // LODOP.SET_PRINT_COPIES(1);
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
        const { allData }
            = this.state;

        return (
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
                            let totalPage = allData.length;
                            let currentPage = allData.indexOf(item) + 1;
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
                                                                return (
                                                                    <div key={productItems.indexOf(item2)}>
                                                                        <div style={{ width: 160, height: 160 }}>
                                                                            <Image style={{ width: 160, height: 160 }} preview={false}
                                                                                src={item2?.images[0]} />
                                                                        </div>
                                                                        <div style={{ fontSize: 14, color: 'black' }}>{item2.name}</div>
                                                                        <div style={{ fontSize: 12, color: 'gray' }}>{`规格：${item2.specification.name}`}</div>
                                                                        <div style={{ fontSize: 14, color: 'black' }}>
                                                                            {`¥${item2?.specification?.price}/${item2?.specification?.unit}`}
                                                                        </div>
                                                                        <div style={{ height: 5 }}></div>
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
                                            textAlign: 'center',
                                            marginTop: 4,
                                            marginBottom: 12
                                        }}>
                                            <Image style={{ width: 100, height: 100 }} preview={false} src={require('../image/弯麦logo方-黑白.png')} />
                                        </div>

                                        <div style={{
                                            textAlign: 'center', backgroundColor: 'red', color: 'white',
                                            marginLeft: 0, marginRight: 0, paddingTop: 5, paddingBottom: 5
                                        }}>
                                            总店2号微信
                                        </div>
                                        <Image style={{ width: 105, height: 105, marginTop: 10 }} preview={false} src={require('../image/教育局总店2号微信.jpg')} />
                                        <div style={{
                                            textAlign: 'center', fontSize: 6
                                        }}>
                                            添加时备注"立人"
                                        </div>
                                        <div style={{
                                            textAlign: 'center', backgroundColor: 'red', color: 'white', marginTop: 10,
                                            marginLeft: 0, marginRight: 0, paddingTop: 5, paddingBottom: 5
                                        }}>
                                            总店2号电话
                                        </div>
                                        <div style={{
                                            textAlign: 'center'
                                        }}>
                                            18599568588
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
                                            总店地址
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

                                        <div style={{
                                            textAlign: 'center',
                                            marginTop: 40
                                        }}>
                                            页码
                                        </div>

                                        <div style={{
                                            textAlign: 'center'
                                        }}>
                                            <span>{currentPage}</span>
                                            <span>/</span>
                                            <span>{totalPage}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

export default ProductMenu4Printer;
