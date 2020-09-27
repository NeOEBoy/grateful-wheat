import React from 'react';
import { List } from 'antd';
import { getProductDiscardList } from '../api/api';

class ProductDiscard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      listData: [],
      loading: false
    };
  }

  async componentDidMount() {
    await this.fetchListData();
  }

  async fetchListData() {
    let { listData } = this.state;

    this.setState({ loading: true });

    try {
      let discardList = [];
      const productDiscard = await getProductDiscardList(
        this.props.query.get('id'),
        this.props.query.get('date'));
      if (productDiscard && productDiscard.errCode === 0) {
        discardList = productDiscard.list;
      }
      listData = listData.concat(discardList);

      this.setState({
        listData: listData,
        loading: false,
      });
    } catch (err) {
      this.setState({
        loading: false
      });
    }
  }

  render() {
    return (
      <div>
        <List
          dataSource={this.state.listData}
          loading={this.state.loading}
          locale={{ emptyText: '暂时没有数据' }}
          header={
            <div style={{ textAlign: 'center', fontSize: 24, fontWeight: "bold" }}>
              报损商品
                <span style={{ textAlign: 'center', fontSize: 13, fontWeight: "lighter" }}>
                {`门店：${this.props.query.get('name')}，报损金额：¥ ${this.props.query.get('number')}`}
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
                  description={`报损数量：${item.discardNumber}`}
                />
                <span style={{
                  marginRight: 25, color: "coral", fontSize: 18
                }}>
                  {`￥${item.diacardMoney}`}
                </span>
              </List.Item>)
            }
          }
        >
        </List>
      </div>
    );
  }
}

export default ProductDiscard;
