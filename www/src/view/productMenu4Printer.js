/*
商品菜单，用于打印

菜单提取教育局店3日之前有销量的商品
*/

import React from 'react';
import { Collapse, Spin, List, Image, Button, Typography, message } from 'antd';
import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';
import {
    getPageName4A4Printer,
    getA4PrinterIndex,
} from '../api/util';

const { Title } = Typography;

class ProductMenu4Printer extends React.Component {
    constructor(props) {
        super(props);
    }

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
        return (
            <div>
                <div>
                    <Button style={{
                        backgroundColor: 'transparent',
                        margin: 10,
                    }} onClick={() => this.productPrintPreprew()}>
                        微信菜单打印
                    </Button>

                    <div id='printDiv'>
                        <div style={{ backgroundColor: 'yellow', width: 1374, height: 964 }}>
                            <div style={{
                                textAlign: 'center', backgroundColor: 'green',
                                marginLeft: 20, marginRight: 20, paddingTop: 10, paddingBottom: 10
                            }}>
                                现烤面包
                            </div>
                            <div>

                            </div>
                        </div>

                        <div style={{ backgroundColor: 'red', width: 1374, height: 964 }}>
                            <div style={{
                                textAlign: 'center', backgroundColor: 'green',
                                marginLeft: 20, marginRight: 20, paddingTop: 10, paddingBottom: 10
                            }}>
                                西点慕斯蛋糕
                            </div>
                            <div>

                            </div>
                        </div>

                        <div style={{ backgroundColor: 'yellow', width: 1374, height: 964 }}>
                            <div style={{ backgroundColor: 'green', marginLeft: 20, marginRight: 20, paddingTop: 20 }}>

                                <span>内容5</span>
                                <span>内容6</span>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'red', width: 1374, height: 964 }}>
                            <div style={{ backgroundColor: 'green', marginLeft: 20, marginRight: 20, paddingTop: 20 }}>

                                <span>内容7</span>
                                <span>内容8</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProductMenu4Printer;
