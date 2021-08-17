import React from 'react';
import {
    Button
} from 'antd';
import { getLodop } from './Lodop6.226_Clodop4.127/LodopFuncs';

class PrintProductionPlan extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataSource: []
        }
    }

    async componentDidMount() {
        let dataSource = [];

        let columnItem = {};
        columnItem.shopNameTitle = '-生产车间-';
        columnItem.productionPlanTitle = '|15号弯麦现烤|';
        columnItem.productNameTitle = '品名';
        columnItem.productNumber = '数量';
        let productArray = [];
        for (let index = 0; index < 25; index++) {
            let product = [];
            product.push(index + '名');
            product.push(index + '数');
            productArray.push(product);
        }
        columnItem.productArray = productArray;
        dataSource.push(columnItem);


        let columnItem1 = {};
        columnItem1.shopNameTitle = '-生产车间-';
        columnItem1.productionPlanTitle = '|15号弯麦现烤|';
        columnItem1.productNameTitle = '品名';
        columnItem1.productNumber = '数量';
        let productArray1 = [];
        for (let index = 0; index < 4; index++) {
            let product = [];
            product.push(index + '名');
            product.push(index + '数');
            productArray1.push(product);
        }
        columnItem1.productArray = productArray1;
        dataSource.push(columnItem1);

        let columnItem2 = {};
        columnItem2.shopNameTitle = '-生产车间-';
        columnItem2.productionPlanTitle = '|15号弯麦现烤|';
        columnItem2.productNameTitle = '品名';
        columnItem2.productNumber = '数量';
        let productArray2 = [];
        for (let index = 0; index < 10; index++) {
            let product = [];
            product.push(index + '名');
            product.push(index + '数');
            productArray2.push(product);
        }
        columnItem2.productArray = productArray2;
        dataSource.push(columnItem2);

        this.setState({ dataSource: dataSource });
    }

    printPreprew = () => {
        let LODOP = getLodop();

        if (LODOP) {
            LODOP.PRINT_INIT("react使用打印插件CLodop");  //打印初始化
            let strStyle =
                `<style>
                </style> `;
            LODOP.SET_PRINT_PAGESIZE(2, 0, 0, "");
            LODOP.SET_PREVIEW_WINDOW(0, 0, 0, 1000, 800, '');
            LODOP.SET_SHOW_MODE("LANDSCAPE_DEFROTATED", 1);//横向时的正向显示
            LODOP.ADD_PRINT_HTM(50, 0, "90%", 700, strStyle + document.getElementById("printDiv").innerHTML);
            LODOP.PREVIEW();
        }
    };

    render() {
        let { dataSource } = this.state;

        return (
            <div style={{ marginLeft: 10, marginTop: 10 }}>
                <div id="printConfig"
                    style={{ float: 'left', borderStyle: 'none', width: 90 }}>
                    <div style={{ background: 'lightgray', padding: 10, fontWeight: 'bold' }}>
                        点击下方按钮打印右侧内容
                    </div>
                    <div>
                        <Button type="primary"
                            style={{ width: 90, height: 80 }}
                            onClick={this.printPreprew}>
                            <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                                打印预览
                            </div>
                        </Button>
                    </div>

                    <div>
                        <Button
                            style={{ width: 90, height: 80 }}
                            onClick={this.printPreprew}>
                            <div style={{ fontWeight: 'bold', fontSize: 16, textDecoration: 'underline' }}>
                                直接打印
                            </div>
                        </Button>
                    </div>
                </div>

                <div id="printDiv" style={{ float: 'left', marginLeft: 10, borderStyle: 'dashed', width: 1380 }}>
                    <div style={{ width: 1330, marginTop: 50, marginLeft: 20 }}>
                        <div style={{ fontSize: 15, textAlign: 'center' }}>
                            生产计划单
                        </div>
                    </div>

                    <div id="printTable" style={{ marginLeft: 20, width: 1330 }}>
                        <div style={{ float: 'left', marginLeft: 0, marginRight: 0, height: 750, borderStyle: 'dotted' }} />
                        {
                            dataSource.map((columnData) => {
                                let productArray = columnData.productArray;
                                return (<div style={{ float: 'left', height: 800 }}>
                                    <table border='1' borderCollapse='collapse' cellSpacing='1' cellPadding='2' style={{ float: 'left' }}>
                                        <thead>
                                            <tr>
                                                <th colSpan='2' style={{ width: 200, textAlign: 'center' }}>
                                                    {columnData.productionPlanTitle}
                                                    <tr>
                                                        <th colSpan='2' style={{ width: 200, textAlign: 'center' }}>{columnData.shopNameTitle}</th>
                                                    </tr>
                                                    <tr>
                                                        <th style={{ width: 140, textAlign: 'center', fontWeight: 'bold' }}>{columnData.productNameTitle}</th>
                                                        <th style={{ width: 60, textAlign: 'center', fontWeight: 'bold' }}>{columnData.productNumber}</th>
                                                    </tr>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                productArray.map((productItem) => {
                                                    return (<tr>
                                                        {
                                                            productItem.map((item) => {
                                                                let itemWidth = productItem.indexOf(item) === 0 ? 140 : 60;
                                                                return <th style={{ width: { itemWidth }, height: 20, textAlign: 'center' }}>{item}</th>
                                                            })
                                                        }
                                                    </tr>)
                                                })
                                            }
                                        </tbody>
                                    </table>
                                    <div style={{ float: 'left', marginLeft: 0, marginRight: 0, height: 750, borderStyle: 'dotted' }} />
                                </div>)
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default PrintProductionPlan;
