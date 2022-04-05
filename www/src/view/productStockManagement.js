/*
库存管理：查看各门店库存，盘点门店库存，门店互相调货。
*/

import React from 'react';
// import { loadElemeProducts } from '../api/api';
import {
    Button
} from 'antd';

/**--------------------配置信息--------------------*/
// const KForTest = true;

class ProductStockManagement extends React.Component {
    constructor(props) {
        super(props);
        this._a = 1;
    };

    componentDidMount = async () => {
        // await loadElemeProducts();
    };

    render() {
        return (
            <div style={{ marginLeft: 20, marginTop: 20 }}>
                <div>
                    商品资料
                </div>

                <div>
                    <Button>新增商品</Button>
                    <Button>新增生日蛋糕</Button>
                </div>
            </div>
        );
    }
}

export default ProductStockManagement;
