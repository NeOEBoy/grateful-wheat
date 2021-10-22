import React from 'react';
// import BrithdayCakeRecommend from '../../public/image/弯麦-生日蛋糕-压缩版/弯麦热销蛋糕/0recommend';

import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Image } from 'antd';
import { loadProductsSale, loadBirthdayCakesRecommend } from '../api/api';

const { Panel } = Collapse;
const KBrithdayCakeRoot = '/image/弯麦-生日蛋糕-压缩版';
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
            birthdayCakeCategorys: KCategorys,
            birthdayCakesRecommend: []
        };
    }

    componentDidMount = async () => {
        let item1 = {};
        item1.src = '/image/%E5%BC%AF%E9%BA%A6-%E7%94%9F%E6%97%A5%E8%9B%8B%E7%B3%95-%E5%8E%8B%E7%BC%A9%E7%89%88/%E5%BC%AF%E9%BA%A6%E5%84%BF%E7%AB%A5%E8%9B%8B%E7%B3%95/%E7%99%BD%E9%9B%AA%E5%85%AC%E4%B8%BB.jpg';
        item1.key = 1;

        let item2 = {};
        item2.src = '/image/%E5%BC%AF%E9%BA%A6-%E7%94%9F%E6%97%A5%E8%9B%8B%E7%B3%95-%E5%8E%8B%E7%BC%A9%E7%89%88/%E5%BC%AF%E9%BA%A6%E5%84%BF%E7%AB%A5%E8%9B%8B%E7%B3%95/%E7%B4%A2%E8%8F%B2%E4%BA%9A.jpg';
        item2.key = 2;

        this.setState({ birthdayCakesRecommend: [item1, item2] });

        let result =await loadBirthdayCakesRecommend();
        console.log(result);
        // let dir = KBrithdayCakeRoot + '/弯麦热销蛋糕';

        // console.log(BrithdayCakeRecommend)

        // fs.readdir('');
    }

    handleCollapseOnChange = async (key) => {
        if (!key) return;

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
        const { birthdayCakeCategorys, birthdayCakesRecommend } = this.state;

        return (
            <div>
                <div style={{ marginLeft: 20, marginTop: 10 }}>
                    弯麦热销蛋糕
                </div>
                {
                    birthdayCakesRecommend.map((item) => {
                        return (
                            <div key={item.key}>
                                <Image src={item.src} />
                            </div>)
                    })
                }

                <Collapse
                    accordion ghost defaultActiveKey={['1000']}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    onChange={this.handleCollapseOnChange}>

                    {
                        birthdayCakeCategorys.map((item) => {
                            return (
                                <Panel header={item.categoryName} key={item.categoryId}>
                                    {
                                        item.productItems.map((item1) => {
                                            let imageSrc = KBrithdayCakeRoot;
                                            imageSrc += '/';
                                            imageSrc += item.categoryName;
                                            imageSrc += '/';
                                            imageSrc += item1.productName;
                                            imageSrc += '.jpg';
                                            return (
                                                <div key={item1.key}>
                                                    <Image src={imageSrc} />
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
