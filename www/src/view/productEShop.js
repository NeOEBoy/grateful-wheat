import React from 'react';
import { loadElemeProducts } from '../api/api';

/**--------------------配置信息--------------------*/
// const KForTest = true;

class ProductEShop extends React.Component {
    constructor(props) {
        super(props);
        this._a = 1;
    };

    componentDidMount = async () => {
        await loadElemeProducts();
    };

    render() {
        return (
            <div>
                外卖平台
            </div>
        );
    }
}

export default ProductEShop;
