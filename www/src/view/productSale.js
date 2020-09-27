import React from 'react';
import { List, message, Spin } from 'antd';
import { getProductSaleList } from '../api/api';
import InfiniteScroll from 'react-infinite-scroller';

const KPageSize = 20;

class ProductSale extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      listData: [],
      loading: false,
      hasMore: true,
      pageIndex: 1
    };
  }

  async componentDidMount() {
    await this.fetchNextPage();
  }

  async fetchNextPage() {
    let { hasMore, pageIndex, listData } = this.state;
    if (!hasMore) {
      message.warning('Infinite List loaded all');
      return;
    }

    this.setState({ loading: true });

    try {
      let saleList = [];
      const productSale = await getProductSaleList(this.props.query.get('id'), this.props.query.get('date'), pageIndex, KPageSize);
      if (productSale && productSale.errCode === 0) {
        saleList = productSale.list;
      }
      const newHasMore = saleList.length / KPageSize >= 1;
      let newPageIndex = pageIndex;
      if (newHasMore) newPageIndex++;
      listData = listData.concat(saleList);

      this.setState({
        listData: listData,
        hasMore: newHasMore,
        loading: false,
        pageIndex: newPageIndex
      });
    } catch (err) {
      this.setState({
        loading: false
      });
    }
  }

  handleInfiniteOnLoad = async () => {
    await this.fetchNextPage();
  };

  render() {
    return (
      <div style={{ height: window.innerHeight, overflow: "auto" }}>
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={this.handleInfiniteOnLoad}
          hasMore={!this.state.loading && this.state.hasMore}
          useWindow={false}
        >
          <List
            dataSource={this.state.listData}
            locale={{ emptyText: '暂时没有数据' }}
            header={
              <div style={{ textAlign: 'center', fontSize: 24, fontWeight: "bold" }}>
                热卖商品
                <span style={{ textAlign: 'center', fontSize: 13, fontWeight: "lighter" }}>
                  {`门店：${this.props.query.get('name')}，商品实收：¥ ${this.props.query.get('number')}`}
                </span>
              </div>
            }
            footer={
              <div style={{ height: 100, textAlign: 'center', fontSize: 14, fontWeight: "lighter" }}>
                弯麦--心里满满都是你
            </div>
            }
            renderItem={
              item => {
                let index = this.state.listData.indexOf(item);
                let indexDivBC = "gray";
                if (index === 0) {
                  indexDivBC = "orange";
                } else if (index === 1) {
                  indexDivBC = "green";
                } else if (index === 2) {
                  indexDivBC = "red";
                }

                return (<List.Item>
                  <div style={{
                    width: 30, height: 30, backgroundColor: indexDivBC, color: "white",
                    fontSize: 14, fontWeight: "bold", textAlign: 'center', marginRight: 15,
                    marginLeft: 15, borderRadius: 10
                  }}>
                    <div style={{ marginTop: 3 }}>{index + 1}</div>
                  </div>

                  <List.Item.Meta
                    title={(
                      <div>
                        <span style={{ fontSize: 16 }}>
                          {item.name}
                        </span>
                        {item.specification !== '-' &&
                          <span style={{ fontSize: 12 }}>
                            {item.specification}
                          </span>}
                      </div>
                    )}
                    description={`销量：${item.saleNumber} 库存：${item.currentNumber}`}
                  />
                  <span style={{
                    marginRight: 25, color: "coral", fontSize: 18
                  }}>
                    {`￥${item.realIncome}`}
                  </span>
                </List.Item>)
              }
            }
          >
            {this.state.loading && this.state.hasMore && (
              <div>
                <Spin style={{ position: "absolute", bottom: 15, width: '100%', textAlign: 'center' }} />
              </div>
            )}
          </List>
        </InfiniteScroll>
      </div>
    );
  }
}

export default ProductSale;
