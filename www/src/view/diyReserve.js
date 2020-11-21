import React from 'react';
import {
  List,
  Button,
  Modal,
  Input
} from 'antd';

import { getDIYCouponList, getMemberListByKeyword } from '../api/api';
import { PhoneOutlined, SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const KPageSize = 5;

class diyReserve extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageIndex: 1,
      total: 1,
      listData: [],
      loading: false,
      callModalVisible: false,
      phoneNumToBeCall: ''
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

  showCallModal = async (phoneNum) => {
    this.setState({
      callModalVisible: true,
      phoneNumToBeCall: '-----------'
    });

    let memberListResponseJson = await getMemberListByKeyword(phoneNum);
    // console.log(memberListResponseJson);
    if (memberListResponseJson.errCode === 0 &&
      memberListResponseJson.list.length === 1) {
      let phoneNum = memberListResponseJson.list[0].phoneNum;
      // console.log(phoneNum);

      this.setState({
        phoneNumToBeCall: phoneNum
      });
    }
  };

  handleCallModalOnOk = () => {
    this.setState({
      callModalVisible: false,
    });

    window.location.href = "tel:" + this.state.phoneNumToBeCall;
  }

  handleCallModalOnCancel = () => {
    this.setState({
      callModalVisible: false,
    });
  }

  render() {
    const { listData, pageIndex, total, loading, phoneNumToBeCall } = this.state;

    let callModalDisable = phoneNumToBeCall === '-----------';

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
            position: "both",
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
              let alreadyUse = item.couponWriteOffTime !== '-';
              return (<List.Item>
                <div style={{
                  width: 20, height: 20, backgroundColor: "crimson", color: "white",
                  fontSize: 12, fontWeight: "bold", textAlign: 'center', marginRight: 6,
                  marginLeft: 6, borderRadius: 4
                }}>
                  <div style={{ marginTop: 1 }}>
                    <span>{item.serialNumber}</span>
                  </div>
                </div>

                <List.Item.Meta
                  title={(
                    <div>
                      <span style={{ color: "black", fontSize: 14 }}>DIY券编号：</span>
                      <span style={{ color: "black", fontSize: 12 }}>{item.couponId}</span>
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
                        <span style={{ color: "crimson", fontSize: 12 }}>{`${item.couponWriteOffTime}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>会员号：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`${item.memberId}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>会员名字：</span>
                        <span style={{ color: "crimson", fontSize: 12 }}>{`${item.memberName}`}</span>
                        <br />
                        <Button type="primary" icon={<PhoneOutlined />}
                          onClick={() => {
                            this.showCallModal(item.memberId);
                          }}
                          disabled={alreadyUse}>
                          拨打会员电话
                        </Button>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>状态：</span>
                        <span style={{ color: "crimson", fontSize: 12 }}>{`${item.couponStatus}`}</span>
                      </div>
                    </div>
                  )}
                />
                <div style={{ marginRight: 10 }}>
                  <div>备注：</div>
                  <TextArea
                    style={{ width: 200 }}
                    placeholder="这里输入备注"
                    autoSize={{ minRows: 3 }} />
                  <br />
                  <Button type="dashed" icon={<SaveOutlined />} 
                    style={{background: "skyblue", border: 'skyblue', marginTop:6}}>
                    保存备注
                  </Button>
                </div>
              </List.Item>)
            }
          }
        >
        </List>

        <Modal
          title="拨打电话"
          visible={this.state.callModalVisible}
          onOk={this.handleCallModalOnOk}
          onCancel={this.handleCallModalOnCancel}
          okText="确认拨打"
          cancelText="取消"
          closable
          okButtonProps={{ disabled: callModalDisable }}
          cancelButtonProps={{ disabled: callModalDisable }}
        >
          <div>
            <span>会员电话为：</span>
            <span style={{ color: "red" }}>{phoneNumToBeCall}</span>
            <span>，请确认是否拨打？</span>
          </div>
        </Modal>
      </div>
    );
  }
}

export default diyReserve;
