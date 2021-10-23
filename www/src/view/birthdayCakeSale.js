import React from 'react';

import { RightCircleTwoTone } from '@ant-design/icons';
import { Collapse, Image, Spin, Typography } from 'antd';
import { loadProductsSale, loadBirthdayCakesRecommend } from '../api/api';

const { Title } = Typography;
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

        this._lastKeys = [];
    }

    componentDidMount = async () => {
        let birthdayCakesRecommendNew = [];
        let birthdayCakesRecommend = await loadBirthdayCakesRecommend();
        if (birthdayCakesRecommend && birthdayCakesRecommend.length > 0) {
            for (let ii = 0; ii < birthdayCakesRecommend.length; ++ii) {
                let item = birthdayCakesRecommend[ii];
                let itemNew = { ...item };
                itemNew.key = ii + 1;
                birthdayCakesRecommendNew.push(itemNew);
            }
        }

        this.setState({ birthdayCakesRecommend: birthdayCakesRecommendNew });
    }

    handleCollapseOnChange = async (keys) => {
        if (!keys) return;

        // console.log(keys);
        let keysNew = [...keys];
        for (let ii = 0; ii < this._lastKeys.length; ++ii) {
            let key = this._lastKeys[ii];
            let pos = keysNew.indexOf(key);
            if (pos !== -1) {
                keysNew.splice(pos, 1);
            }
        }

        this._lastKeys = [...keys];
        // console.log(keysNew);
        if (keysNew.length !== 1) return;/// 只有一个展开

        try {
            let categoryId = keysNew[0];
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
            if (!birthdayCakeCategoryToAdd) return;
            if (birthdayCakeCategoryToAdd.productItems.length > 0) return;
            if (birthdayCakeCategoryToAdd.spinning) return;///正在加载中...

            birthdayCakeCategoryToAdd.spinning = true;

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
                birthdayCakeCategoryToAdd.spinning = false;
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
                
                <Title level={5} style={{
                    textAlign: 'center', marginTop: 0,
                    backgroundColor: '#DAA520',
                    color: 'white',
                    paddingTop: 5, paddingBottom: 5
                }}>
                    {`弯麦热销蛋糕（${birthdayCakesRecommend.length}）`}
                </Title>
                {
                    birthdayCakesRecommend.map((item) => {
                        let src = "/image/弯麦-生日蛋糕-压缩版/弯麦热销蛋糕/" + item.name + '.jpg';
                        return (<Image src={src} key={item.key} />);
                    })
                }

                <Collapse
                    expandIcon={({ isActive }) => <RightCircleTwoTone rotate={isActive ? 90 : 0} />}
                    onChange={this.handleCollapseOnChange}>
                    {
                        birthdayCakeCategorys.map((item) => {
                            return (
                                <Panel header=
                                    {
                                        (<span style={{ color: '#DAA520' }}>
                                            {`${item.categoryName}（${item.productItems.length}）`}
                                        </span>)
                                    }
                                    key={item.categoryId} extra={(<span style={{ fontSize: 10 }}>点击展开或关闭</span>)}>
                                    <Spin spinning={item.spinning}>
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
                                    </Spin>
                                </Panel>
                            );
                        })
                    }
                </Collapse>
                <div style={{
                    height: 30, textAlign: 'center', color: 'red',
                    fontSize: 12, fontWeight: "lighter", paddingTop: 5
                }}>
                    添加13290768588（教育局总店微信）预定...
                </div>
            </div>
        )
    }
}

export default birthdayCakeSale;
