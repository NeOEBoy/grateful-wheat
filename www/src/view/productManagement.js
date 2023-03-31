/*
普通商品
1：确定商品照片原图，商品名称，商品价格；
2：银豹后台录入商品信息；
3：商品绑定外卖平台。
4：更新外卖平台对应商品属性信息等。

生日蛋糕
除上面步骤外，额外
1：商品图片放入坚果云《生日蛋糕》目录；
2：商品图片放入自定义网站《生日蛋糕》目录；
3：如需要在银豹副屏幕上推广则放入坚果云《银豹副屏图片》目录；
*/

import React from 'react';
// import { loadElemeProducts } from '../api/api';
import {
    Button
} from 'antd';

/**--------------------配置信息--------------------*/
class ProductManagement extends React.Component {
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

export default ProductManagement;
