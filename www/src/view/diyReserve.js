import React from 'react';
import {
  List,
  Button,
  Modal,
  Input,
  message,
  DatePicker,
  Pagination
} from 'antd';

import { getDIYCouponList, getMemberListByKeyword, saveRemarkToCoupon, sendSMSToMember } from '../api/api';
import { PhoneOutlined, SaveOutlined, MessageOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;
const KPageSize = 10;
const KDefaultPhoneNum = '-----------';

class diyReserve extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageIndex: 1,
      total: 1,
      listData: [],
      loading: false,
      callModalVisible: false,
      phoneNumToBeCall: '',
      messageModalVisible: false,
      eventTime4Message: moment(),
      lastCallItem: undefined,
      lastMessageItem: undefined,
      lastSaveItem: undefined
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

  showCallModal = async (keyword) => {
    this.setState({
      callModalVisible: true,
      phoneNumToBeCall: KDefaultPhoneNum
    });

    let phoneNumber = await this.getPhoneNumberBy(keyword);
    if (phoneNumber) {
      this.setState({
        phoneNumToBeCall: phoneNumber
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

  showMessageModal = async (keyword) => {
    this.setState({
      messageModalVisible: true,
      phoneNumToBeCall: KDefaultPhoneNum
    });

    let phoneNumber = await this.getPhoneNumberBy(keyword);
    if (phoneNumber) {
      this.setState({
        phoneNumToBeCall: phoneNumber
      });
    }
  }

  handleMessageModalOnOk = async () => {
    this.setState({
      messageModalVisible: false,
    });

    let result = await sendSMSToMember(this.state.phoneNumToBeCall);
    if (result && result.errCode === 0) {
      message.info('发送成功');
    } else {
      message.error(result.errMessage);
    }
  }

  handleMessageModalOnCancel = () => {
    this.setState({
      messageModalVisible: false,
    });
  }

  getPhoneNumberBy = async (keyword) => {
    let phoneNumber = '';
    let memberListResponseJson = await getMemberListByKeyword(keyword);
    // console.log(memberListResponseJson);
    if (memberListResponseJson.errCode === 0 &&
      memberListResponseJson.list.length === 1) {
      let phoneNum = memberListResponseJson.list[0].phoneNum;
      // console.log(phoneNum);

      phoneNumber = phoneNum;
    }

    return phoneNumber;
  }

  handleDayOnOk = (value) => {
    // console.log('onOk: ', value);
    this.setState({ eventTime4Message: value });
  }

  render() {
    const { listData,
      pageIndex,
      total,
      loading,
      phoneNumToBeCall,
      lastCallItem,
      lastMessageItem,
      lastSaveItem,
      eventTime4Message } = this.state;

    let callModalDisable = phoneNumToBeCall === KDefaultPhoneNum;

    return (
      <div>
        <div style={{
          position: "fixed", zIndex: 5, fontSize: 12,
          fontWeight: "bold", width: '100%', background: 'rgba(136,136,136,0.8)'
        }}>
          <div style={{ marginTop: 4, marginLeft: 6, fontSize: 24 }}>
            DIY活动预约
          </div>
          <Pagination
            style={{ marginTop: 4, marginLeft: 6, marginBottom: 12 }}
            onChange={(pageIndex) => {
              this.fetchListDataByPage(pageIndex);
            }}
            showQuickJumper={true}
            showSizeChanger={false}
            defaultCurrent={1}
            current={pageIndex}
            pageSize={KPageSize}
            total={total} />
        </div>

        <List
          locale={{ emptyText: '暂时没有数据' }}
          loading={loading}
          header={
            <div style={{ height: 66 }}>
            </div>
          }
          footer={
            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: "lighter" }}>
              弯麦--心里满满都是你
            </div>
          }

          dataSource={listData}
          renderItem={
            item => {
              let alreadyUse = item.couponWriteOffTime !== '-';
              let callButtonDanger = lastCallItem === item;
              let saveButtonDanger = lastSaveItem === item;
              let messageButtonDanger = lastMessageItem === item;

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
                      <div style={{ marginTop: -10 }}>
                        <span style={{ color: "gray", fontSize: 12 }}>制券时间：</span>
                        <span style={{ color: "gray", fontSize: 10 }}>{`${item.couponCreateTime}`}</span>
                      </div>
                      <div style={{ marginTop: -8 }}>
                        <span style={{ color: "gray", fontSize: 12 }}>使用时间：</span>
                        <span style={{ color: "crimson", fontSize: 11 }}>{`${item.couponWriteOffTime}`}</span>
                      </div>
                      <div style={{ marginTop: -8 }}>
                        <span style={{ color: "gray", fontSize: 12 }}>会员名字：</span>
                        <span style={{ color: "crimson", fontSize: 11 }}>{`${item.memberName}`}</span>
                      </div>
                      <div style={{ marginTop: -8 }}>
                        <span style={{ color: "gray", fontSize: 12 }}>状态：</span>
                        <span style={{ color: "crimson", fontSize: 11 }}>{`${item.couponStatus}`}</span>
                      </div>
                      <Button type='primary' icon={<PhoneOutlined />}
                        shape="round" danger={callButtonDanger}
                        onClick={() => {
                          this.setState({ lastCallItem: item });
                          this.showCallModal(item.memberId);
                        }}
                        disabled={alreadyUse}>
                        拨打
                        </Button>
                      <span> </span>
                      <Button type='primary' icon={<MessageOutlined />}
                        shape="round" danger={messageButtonDanger}
                        onClick={() => {
                          this.setState({ lastMessageItem: item });
                          this.showMessageModal(item.memberId);
                        }}
                        disabled={alreadyUse}>
                        发送
                        </Button>
                    </div>
                  )}
                />
                <div style={{ marginRight: 10 }}>
                  <div>备注：</div>
                  <TextArea
                    value={item.remark}
                    onChange={(e) => {
                      const { value } = e.target;
                      item.remark = value;
                      /// 强制更新一下
                      this.forceUpdate();
                    }}
                    disabled={alreadyUse}
                    style={{ width: 180 }}
                    placeholder="这里输入备注"
                    autoSize={{ minRows: 2 }} />
                  <br />
                  <Button type='primary' icon={<SaveOutlined />}
                    disabled={alreadyUse} danger={saveButtonDanger}
                    onClick={async () => {
                      this.setState({ lastSaveItem: item });

                      let result = await saveRemarkToCoupon(item.couponId, item.remark);
                      if (result.errCode === 0) {
                        message.success('已经保存');
                      } else {
                        message.warning('保存失败');
                      }
                    }}
                    style={{ marginTop: 2 }}>
                    保存
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

        <Modal
          title="发送短信"
          visible={this.state.messageModalVisible}
          onOk={this.handleMessageModalOnOk}
          onCancel={this.handleMessageModalOnCancel}
          okText="确认发送"
          cancelText="取消"
          closable
          okButtonProps={{ disabled: callModalDisable }}
          cancelButtonProps={{ disabled: callModalDisable }}
        >
          <div>
            <span style={{ fontSize: 16 }}>会员电话为：</span>
            <span style={{ color: "red" }}>{phoneNumToBeCall}</span>
            <br />
            <span style={{ fontSize: 16 }}>短信模板为：</span>
            <span>【弯麦烘焙】您已成功预约DIY活动，活动时间：</span>
            <span style={{ color: "green", textDecoration: 'underline' }}>{`${eventTime4Message.format('YYYY-MM-DD, HH:mm:ss a')}`}</span>
            <span>，请提前10分钟到达，如变更请提前一天拨打13290768588。</span>
            <br />
            <span style={{ fontSize: 16 }}>活动时间为：</span>
            <DatePicker showTime value={eventTime4Message} onOk={this.handleDayOnOk} />
            <br /><br />
            <span>请确认是否发送？</span>
          </div>
        </Modal>
      </div>
    );
  }
}

export default diyReserve;
