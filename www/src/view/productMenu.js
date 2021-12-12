/*
商品菜单

菜单提取教育局店7日之前有销量的商品
*/

import React from 'react';
import moment from 'moment';
import { RightSquareFilled } from '@ant-design/icons';
import { Collapse, Spin, List, Image } from 'antd';
import {
    loadProductsSale
} from '../api/api';
// const { Title } = Typography;
const { Panel } = Collapse;
const KImageRoot = '/image';

class ProductMenu extends React.Component {
    constructor(props) {
        super(props);

        const KCategorys = [
            { categoryId: '1593049816479739965', categoryName: '现烤面包', productItems: [] },
            { categoryId: '1592989355905414162', categoryName: '西点慕斯蛋糕', productItems: [] },
            { categoryId: '1593049881212199906', categoryName: '常温蛋糕', productItems: [] },
            { categoryId: '1593049854760654816', categoryName: '吐司面包', productItems: [] },
            { categoryId: '1626767161867698544', categoryName: '餐包面包', productItems: [] },
            { categoryId: '1593059349213583584', categoryName: '干点饼干', productItems: [] },
            { categoryId: '1604471906489441680', categoryName: '小蛋糕', productItems: [] },
            { categoryId: '1611200031064132560', categoryName: '小零食', productItems: [] },
        ];

        this.state = {
            birthdayCakeCategorys: KCategorys
        };

        this._lastKeys = [];
    }

    async componentDidMount() {
        await this.initFirstPage();
    }

    async initFirstPage() {
    }

    handleCollapseOnChange = async (keys) => {
        if (!keys) return;
        // console.log('handleCollapseOnChange begin');

        // console.log(keys);
        let keysOpened = [...keys];
        for (let ii = 0; ii < this._lastKeys.length; ++ii) {
            let key = this._lastKeys[ii];
            let pos = keysOpened.indexOf(key);
            if (pos !== -1) {
                keysOpened.splice(pos, 1);
            }
        }

        let keysClosed = [...this._lastKeys];
        for (let jj = 0; jj < keys.length; ++jj) {
            let key = keys[jj];
            let pos = keysClosed.indexOf(key);
            if (pos !== -1) {
                keysClosed.splice(pos, 1);
            }
        }
        this._lastKeys = [...keys];

        const { birthdayCakeCategorys } = this.state;
        let birthdayCakeCategorysNew = [...birthdayCakeCategorys];

        // console.log(keysOpened);
        if (keysOpened.length === 1) {
            try {
                let categoryId = keysOpened[0];
                let birthdayCakeCategoryToAdd;
                for (let ii = 0; ii < birthdayCakeCategorysNew.length; ++ii) {
                    let birthdayCakeCategory = birthdayCakeCategorysNew[ii];
                    if (birthdayCakeCategory.categoryId === categoryId) {
                        birthdayCakeCategoryToAdd = birthdayCakeCategory;
                        break;
                    }
                }
                if (birthdayCakeCategoryToAdd) {
                    birthdayCakeCategoryToAdd.opened = true;
                    this.setState({ birthdayCakeCategorys: birthdayCakeCategorysNew });
                    if (birthdayCakeCategoryToAdd.productItems.length <= 0 &&
                        !birthdayCakeCategoryToAdd.spinning) {
                        birthdayCakeCategoryToAdd.spinning = true;

                        /// 提取7天之前的数据
                        let nowMoment = moment();
                        let endDateTimeStr = nowMoment.endOf('day').format('YYYY.MM.DD HH:mm:ss');
                        let beginDateTimeStr = nowMoment.subtract(7, 'days').startOf('day').format('YYYY.MM.DD HH:mm:ss');

                        // console.log(beginDateTimeStr);
                        // console.log(endDateTimeStr);

                        /// 教育局店，有销量
                        let loadResult = await loadProductsSale(categoryId, '3995767', '1', beginDateTimeStr, endDateTimeStr);
                        // console.log(loadResult);

                        if (loadResult.errCode === 0 && loadResult.list.length > 0) {
                            let list = loadResult.list;
                            list = list.sort((a, b) => {
                                return b.saleNumber - a.saleNumber;
                            })

                            birthdayCakeCategoryToAdd.productItems = list;
                            birthdayCakeCategoryToAdd.spinning = false;
                        }

                        this.setState({ birthdayCakeCategorys: birthdayCakeCategorysNew });
                        // console.log(birthdayCakeCategorysNew);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        // console.log(keysClosed);
        if (keysClosed.length === 1) {
            let categoryId = keysClosed[0];
            let birthdayCakeCategoryClose;
            for (let ii = 0; ii < birthdayCakeCategorysNew.length; ++ii) {
                let birthdayCakeCategory = birthdayCakeCategorysNew[ii];
                if (birthdayCakeCategory.categoryId === categoryId) {
                    birthdayCakeCategoryClose = birthdayCakeCategory;
                    break;
                }
            }
            if (birthdayCakeCategoryClose) {
                birthdayCakeCategoryClose.opened = false;
                this.setState({ birthdayCakeCategorys: birthdayCakeCategorysNew });
            }
        }

        // console.log('handleCollapseOnChange end');    
    }

    render() {
        const { birthdayCakeCategorys } = this.state;

        return (
            <div>
                <Collapse
                    bordered={true}
                    expandIcon={({ isActive }) => <RightSquareFilled rotate={isActive ? 90 : 0} />}
                    expandIconPosition='right'
                    onChange={this.handleCollapseOnChange}>
                    {
                        birthdayCakeCategorys.map((item) => {
                            return (
                                <Panel header=
                                    {
                                        (
                                            <span style={{ color: 'white', fontSize: 16 }}>
                                                {`${item.categoryName}`}
                                            </span>
                                        )
                                    }
                                    style={{ backgroundColor: '#DAA520', borderRadius: 20 }}
                                    key={item.categoryId}
                                    extra={(<span style={{ fontSize: 13, color: 'black' }}>{item.opened ? '点击关闭' : '点击打开'}</span>)}>
                                    <Spin spinning={item.spinning}>
                                        <List
                                            grid={{ gutter: 2, column: 3 }}
                                            dataSource={item.productItems}
                                            renderItem={item1 => {
                                                let imageSrc = KImageRoot;
                                                imageSrc += '/';
                                                imageSrc += item.categoryName;
                                                imageSrc += '/';
                                                imageSrc += item1.productName;
                                                imageSrc += '.jpg';

                                                // console.log(imageSrc);
                                                return (
                                                    <List.Item>
                                                        <div>
                                                            <Image preview={true} src={imageSrc} onError={(e) => {
                                                                /// 图片加载不成功时隐藏
                                                                // e.target.style.display = 'none';
                                                            }} />
                                                            <div>{item1.productName}</div>
                                                        </div>
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    </Spin>
                                </Panel>
                            );
                        })
                    }
                </Collapse>
            </div>
        );
    }
}

export default ProductMenu;
