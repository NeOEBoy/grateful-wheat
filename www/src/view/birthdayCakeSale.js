import React from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Image } from 'antd';

import { loadProductsSale } from '../api/api';

const { Panel } = Collapse;

class birthdayCakeSale extends React.Component {
    constructor(props) {
        super(props);

        const KCategorys = [
            { categoryId: '1634302334442115588', categoryName: '弯麦儿童蛋糕', productItems: [] },
            { categoryId: '1634302367129657476', categoryName: '弯麦女神蛋糕', productItems: [] },
            { categoryId: '1634302388959605558', categoryName: '弯麦男神蛋糕', productItems: [] },
            { categoryId: '1634302403310226908', categoryName: '弯麦家庭蛋糕', productItems: [] },
            { categoryId: '1634302419875701981', categoryName: '弯麦情侣蛋糕', productItems: [] },
            { categoryId: '1634302432122635916', categoryName: '弯麦祝寿蛋糕', productItems: [] },
            { categoryId: '1634302446119593980', categoryName: '弯麦庆典派对蛋糕', productItems: [] },
        ];

        this.state = {
            birthdayCakeCategorys: KCategorys
        };
    }

    componentDidMount() {

    }

    handleCollapseOnChange = async (key) => {
        if (!key) return;
        // console.log(key);

        try {
            let categoryId = key;
            const { birthdayCakeCategorys } = this.state;
            let birthdayCakeCategoryToAdd;
            let birthdayCakeCategorysNew = [...birthdayCakeCategorys];
            for (let ii = 0; ii < birthdayCakeCategorysNew.length; ++ii) {
                let birthdayCakeCategory = birthdayCakeCategorysNew[ii];
                if (birthdayCakeCategory.categoryId === categoryId) {
                    birthdayCakeCategoryToAdd = birthdayCakeCategory;
                    break;
                }
            }
            if (birthdayCakeCategoryToAdd && birthdayCakeCategoryToAdd.productItems.length > 0) return;

            let loadResult = await loadProductsSale(categoryId);
            // console.log(loadResult);

            if (loadResult.errCode === 0 && loadResult.list.length > 0) {
                let list = loadResult.list;

                let listAfterMerge = [];
                for (let jj = 0; jj < list.length; ++jj) {
                    let one = list[jj];
                    let productName = one.productName;
                    let saleNumber = one.saleNumber;

                    let index4ListAfterMerge = -1;
                    for (let mm = 0; mm < listAfterMerge.length; ++mm) {
                        let one1 = listAfterMerge[mm];
                        if (one1.productName === productName) {
                            index4ListAfterMerge = mm;
                            break;
                        }
                    }

                    if (index4ListAfterMerge === -1) {
                        let oneNew = {};
                        oneNew.productName = productName;
                        oneNew.saleNumber = saleNumber;
                        oneNew.key = listAfterMerge.length + 1;
                        listAfterMerge.push(oneNew);
                    } else {
                        let one = listAfterMerge[index4ListAfterMerge];
                        one.saleNumber = one.saleNumber + saleNumber;
                    }
                }

                listAfterMerge = listAfterMerge.sort((a, b) => {
                    return b.saleNumber - a.saleNumber;
                })

                birthdayCakeCategoryToAdd.productItems = listAfterMerge;
            }

            this.setState({ birthdayCakeCategorys: birthdayCakeCategorysNew });
            // console.log(birthdayCakeCategorysNew);
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        const { birthdayCakeCategorys } = this.state;

        return (
            <div>
                <Collapse accordion ghost
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    onChange={this.handleCollapseOnChange}>
                    {
                        birthdayCakeCategorys.map((item) => {
                            return (
                                <Panel header={item.categoryName} key={item.categoryId}>
                                    {
                                        item.productItems.map((item1) => {
                                            return (
                                                <div key={item1.key}>
                                                    <Image width={200} src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png' />
                                                    <span>{item1.productName}</span>
                                                    <span>{item1.saleNumber}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </Panel>
                            );
                        })
                    }
                </Collapse>
            </div>
        )
    }
}

export default birthdayCakeSale;
