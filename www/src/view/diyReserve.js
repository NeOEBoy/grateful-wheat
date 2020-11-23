import React from 'react';
import {
  List,
  Button,
  Modal,
  Input,
  message
} from 'antd';

import { getDIYCouponList, getMemberListByKeyword } from '../api/api';
import { PhoneOutlined, SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const KPageSize = 10;

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
        <span style={{
          position: "absolute", marginLeft: 32, marginTop: 2,
          fontSize: 14, fontWeight: "bold"
        }}>
          DIY预约
        </span>
        <List
          locale={{ emptyText: '暂时没有数据' }}
          loading={loading}
          footer={
            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: "lighter" }}>
              弯麦--心里满满都是你
            </div>
          }
          pagination={{
            responsive: true,
            style: { marginTop:-16, marginRight: 18, marginBottom: 8 },
            showSizeChanger: false,
            position: "top",
            showQuickJumper: true,
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
                      <span style={{ color: "black", fontSize: 14 }}>券编号：</span>
                      <span style={{ color: "black", fontSize: 12 }}>{item.couponId}</span>
                    </div>
                  )}
                  description={(
                    <div>
                      <div style={{marginTop:-10}}>
                        <span style={{ color: "gray", fontSize: 12 }}>制券时间：</span>
                        <span style={{ color: "gray", fontSize: 10 }}>{`${item.couponCreateTime}`}</span>
                      </div>
                      <div style={{marginTop:-8}}>
                        <span style={{ color: "gray", fontSize: 12 }}>使用时间：</span>
                        <span style={{ color: "crimson", fontSize: 11 }}>{`${item.couponWriteOffTime}`}</span>
                      </div>
                      <div style={{marginTop:-8}}>
                        <span style={{ color: "gray", fontSize: 12 }}>会员名字：</span>
                        <span style={{ color: "crimson", fontSize: 11 }}>{`${item.memberName}`}</span>                        
                      </div>
                      <div style={{marginTop:-8}}>
                        <span style={{ color: "gray", fontSize: 12 }}>状态：</span>
                        <span style={{ color: "crimson", fontSize: 11 }}>{`${item.couponStatus}`}</span>
                      </div>
                      <Button type="primary" icon={<PhoneOutlined />}
                          onClick={() => {
                            this.showCallModal(item.memberId);
                          }}
                          disabled={alreadyUse}>
                          拨打
                        </Button>
                    </div>
                  )}
                />
                <div style={{ marginRight: 10 }}>
                  <div>备注：</div>
                  <TextArea
                    disabled={alreadyUse}
                    style={{ width: 180 }}
                    placeholder="这里输入备注"
                    autoSize={{ minRows: 2 }} />
                  <br />
                  <Button type="dashed" icon={<SaveOutlined />}
                    disabled={alreadyUse}
                    onClick={() => {
                      message.success('已经保存');
                    }}
                    style={{ background: "skyblue", border: 'skyblue', marginTop: 2 }}>
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
