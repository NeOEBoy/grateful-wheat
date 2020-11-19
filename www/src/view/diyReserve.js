import React from 'react';
import {
  List,
} from 'antd';
import { getDIYCouponList } from '../api/api';

const KPageSize = 5;

class diyReserve extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageIndex: 1,
      total: 1,
      listData: [],
      loading: false
    }
  }

  componentDidMount() {
    this.fetchListDataByPage(1);
  }

  async fetchListDataByPage(pageIndex) {
    try {
      this.setState({
        listData: [],
        pageIndex: pageIndex
      }, async () => {
        let nextDIYCouponList = [];
        let totalFromCloud = 1;
        this.setState({ loading: true });
        const diyCouponListResult = await getDIYCouponList(pageIndex, KPageSize);
        if (diyCouponListResult && diyCouponListResult.errCode === 0) {
          nextDIYCouponList = diyCouponListResult.list;
          totalFromCloud = diyCouponListResult.total;
        }

        this.setState({
          listData: nextDIYCouponList,
          loading: false,
          total: totalFromCloud
        });
      });
    } catch (err) {
      this.setState({
        loading: false
      });
    }
  }

  render() {
    const { listData, pageIndex, total, loading } = this.state;

    return (
      <div>
        <List
          locale={{ emptyText: '暂时没有数据' }}
          loading={loading}
          footer={
            <div style={{ height: 100, textAlign: 'center', fontSize: 14, fontWeight: "lighter" }}>
              弯麦--心里满满都是你
            </div>
          }
          pagination={{
            showSizeChanger: false,
            position: "top",
            onChange: (pageIndex) => {
              this.fetchListDataByPage(pageIndex);
            },
            defaultCurrent: 1,
            current: pageIndex,
            pageSize: KPageSize,
            total: total
          }}
          dataSource={listData}
          renderItem={
            item => {
              return (<List.Item>
                <div style={{
                  width: 40, height: 40, backgroundColor: "darkgreen", color: "white",
                  fontSize: 12, fontWeight: "bold", textAlign: 'center', marginRight: 15,
                  marginLeft: 15, borderRadius: 5
                }}>
                  <div style={{ marginTop: 3 }}>DIY</div>
                </div>

                <List.Item.Meta
                  title={(
                    <div>
                      <span style={{ fontSize: 16 }}>
                        {item.couponId}
                      </span>
                    </div>
                  )}
                  description={(
                    <div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>制券时间：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`${item.couponCreateTime}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>使用时间：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`${item.couponWriteOff}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>来源：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`${item.couponSource}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>会员号：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`${item.memberId}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>会员名字：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`${item.memberName}`}</span>
                        <span> </span>
                        <a href="tel:10086">一键拨打电话</a>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>状态：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`${item.couponStatus}`}</span>
                      </div>
                    </div>
                  )}
                />
              </List.Item>)
            }
          }
        >

        </List>
      </div>
    );
  }
}

export default diyReserve;
