import React from 'react';

import {
  List,
  Button,
  Modal,
  Input,
  message,
  DatePicker,
  Pagination,
  Radio,
  Typography
} from 'antd';

import {
  getDIYCouponList,
  getMemberListByKeyword,
  saveRemarkToCoupon,
  createDIYEvent,
  DIYEventList,
  DeleteDIYEvent,
  JoinToEvent,
  LeaveFromEvent,
  sendSMSAndJoinToEvent
} from '../api/api';

import {
  PhoneOutlined, SaveOutlined,
  MessageOutlined, FileAddTwoTone,
  DeleteOutlined, CloseOutlined,
  AppstoreTwoTone, ExclamationCircleOutlined,
  UserAddOutlined, MinusCircleOutlined
} from '@ant-design/icons';
import './diyReserve.css';
import moment from 'moment';

const { TextArea, Search } = Input;
const { Text } = Typography;

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
      lastCallItem: undefined,
      lastMessageItem: undefined,
      lastSaveItem: undefined,
      lastJoinToEventItem: undefined,
      keyword: '',
      createDIYEventModalVisible: false,
      eventTime4createDIY: moment().set('second', 0).set('millisecond', 0),
      DIYEventList: [],
      DIYEventShowMode: 'large',// 'small'|'large'
      whichEventIndexToChoose: 0,
      joinToEventModalVisible: false
    }
  }

  componentDidMount() {
    this.fetchListDataByPage(1);
    this.fetchDIYEventList(true);
  }

  async fetchDIYEventList(first) {
    let nextEventList = [];
    const eventList = await DIYEventList();
    if (eventList && eventList.errCode === 0) {
      nextEventList = eventList.list;
    }
    this.setState({ DIYEventList: nextEventList });

    // if (first) {
    //   setTimeout(() => {
    //     this.setState({ DIYEventShowMode: 'small' });
    //   }, 1000);
    // }
  }

  async fetchListDataByPage(pageIndex) {
    try {
      const { keyword } = this.state;

      this.setState({
        listData: [],
        pageIndex: pageIndex
      }, async () => {
        let nextDIYCouponList = [];
        let totalFromCloud = 1;
        this.setState({ loading: true });
        const diyCouponListResult = await getDIYCouponList(pageIndex, KPageSize, keyword);
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

    const { DIYEventList, whichEventIndexToChoose, lastMessageItem } = this.state;

    let eventItem = DIYEventList[whichEventIndexToChoose];
    if (eventItem) {
      /// 修正下北京时间，+8，换成东八区
      let eventTime4Message = moment(eventItem.started).utcOffset(8);
      let couponId = lastMessageItem.couponId;
      let memberName = lastMessageItem.memberName;
      let eventId = eventItem._id;
      let result = await sendSMSAndJoinToEvent(this.state.phoneNumToBeCall,
        eventTime4Message.format('MM-DD HH:mm'), couponId, memberName, eventId);

      if (result && result.errCode === 0) {
        message.info('加入DIY活动名单并成功发送短信');
        lastMessageItem.remark = result.remark;

        this.fetchDIYEventList();

        let lastMode = this.state.DIYEventShowMode;
        if (lastMode === 'small') {
          this.setState({ DIYEventShowMode: 'large' });
          this.setState({ DIYEventShowMode: 'small' });
        }
        this.forceUpdate();
      } else {
        if (result) {
          message.info(result.errMessage);
        } else {
          message.info('添加失败');
        }
      }
    }
  }

  handleMessageModalOnCancel = () => {
    this.setState({
      messageModalVisible: false,
    });
  }

  showCreateDIYEventModal = () => {
    this.setState({
      createDIYEventModalVisible: true
    });
  }

  showJoinToEventModal = () => {
    this.setState({
      joinToEventModalVisible: true
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

  handleCreateDIYEventModalOnOk = async () => {
    this.setState({
      createDIYEventModalVisible: false,
    });

    let eventTime4createDIY = this.state.eventTime4createDIY;
    let result = await createDIYEvent(eventTime4createDIY);
    console.log(result);
    if (result.errCode !== 0) {
      message.error(result.errMessage);
    } else {
      message.info('创建DIY活动成功！');
      this.fetchDIYEventList(false);
    }
  }

  handleCreateDIYEventModalOnCancel = () => {
    this.setState({
      createDIYEventModalVisible: false,
    });
  }

  handleCreateDIYEventDayOnOk = (value) => {
    // console.log('handleCreateDIYEventDayOnOk: ', value);
    this.setState({ eventTime4createDIY: value });
  }

  handleDeleteDIY = async (_id) => {
    let result = await DeleteDIYEvent(_id);
    if (result && result.errCode === 0) {
      await this.fetchDIYEventList(false);
    }
  }

  handleJoinToEventModalOnOk = async () => {
    this.setState({
      joinToEventModalVisible: false,
    });
    const { lastJoinToEventItem, whichEventIndexToChoose, DIYEventList } = this.state;
    let couponId = lastJoinToEventItem.couponId;
    let memberName = lastJoinToEventItem.memberName;
    let eventItem = DIYEventList[whichEventIndexToChoose];
    let eventId = eventItem._id;

    // console.log(couponId);
    // console.log(memberName);
    // console.log(eventId);
    const joinResult = await JoinToEvent(couponId, memberName, eventId);
    if (joinResult && joinResult.errCode === 0) {
      message.info('活动加入成功');
      this.fetchDIYEventList();

      /// 更新下remark UI
      lastJoinToEventItem.remark = joinResult.remark;

      let lastMode = this.state.DIYEventShowMode;
      if (lastMode === 'small') {
        this.setState({ DIYEventShowMode: 'large' });
        this.setState({ DIYEventShowMode: 'small' });
      }

      /// 强制更新一下
      this.forceUpdate();
    } else {
      if (joinResult) {
        message.info(joinResult.errMessage);
      } else {
        message.info('添加失败');
      }
    }
  }

  handleJoinToEventModalOnCancel = () => {
    this.setState({
      joinToEventModalVisible: false,
    });
  }
  render() {
    const {
      listData,
      pageIndex,
      total,
      loading,
      phoneNumToBeCall,
      lastCallItem,
      lastMessageItem,
      lastSaveItem,
      lastJoinToEventItem,
      DIYEventList,
      DIYEventShowMode,
      whichEventIndexToChoose
    } = this.state;

    let callModalDisable = phoneNumToBeCall === KDefaultPhoneNum;
    let sendSMSModalDisable = phoneNumToBeCall === KDefaultPhoneNum || DIYEventList.length <= 0;
    let joinToEventModalDisable = DIYEventList.length <= 0;

    let eventTime4Message = moment();
    if (DIYEventList.length > 0 &&
      whichEventIndexToChoose >= 0 &&
      whichEventIndexToChoose < DIYEventList.length) {
      let eventItem = DIYEventList[whichEventIndexToChoose];
      if (eventItem) {
        /// 修正下北京时间，+8，换成东八区
        eventTime4Message = moment(eventItem.started).utcOffset(8);
      }
    }

    let allParticipantsNumber = 0;
    DIYEventList.forEach(element => {
      if (element.participants) {
        allParticipantsNumber += element.participants.length;
      }
    });
    return (
      <div>
        <div style={{
          position: "fixed", zIndex: 5, fontSize: 12,
          fontWeight: "bold", width: '100%', background: 'rgba(136,136,136,0.95)'
        }}>
          <div style={{ marginTop: 4, marginLeft: 6, fontSize: 24 }}>
            DIY活动预约
          </div>
          <Search style={{ width: 280, marginTop: 4, marginLeft: 6, marginBottom: 4 }} size="middle"
            placeholder="券号/会员号/会员姓名" enterButton="查询"
            onSearch={async () => {
              this.fetchListDataByPage(1);
            }}
            value={this.state.keyword}
            onChange={(e) => {
              const { value } = e.target;
              this.setState({ keyword: value });
            }} />
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

        {DIYEventShowMode === 'small' ? (
          <div style={{
            position: "fixed", zIndex: 5, fontSize: 12, bottom: 0,
            right: 0, background: 'rgba(136,136,136,0.9)', borderRadius: 10
          }}>
            <Button size='small' shape='round' style={{
              marginLeft: 4,
              marginTop: 4,
              marginRight: 4,
              marginBottom: 4
            }} icon={<AppstoreTwoTone />} onClick={
              () => {
                this.setState({ DIYEventShowMode: 'large' })
              }
            }>
              <span>查看DIY活动</span>
              <span style={{
                marginLeft: 4,
                width: 22, height: 22,
                backgroundColor: 'orange',
                borderRadius: 11
              }} className='animaToBig'>{allParticipantsNumber}</span>
            </Button>
          </div>
        ) : (
            <div style={{
              position: "fixed", zIndex: 5, fontSize: 12, bottom: 0,
              right: 0, background: 'rgba(136,136,136,0.98)', borderRadius: 10
            }}>
              <List
                size='small'
                locale={{ emptyText: '没有DIY活动，请创建' }}
                dataSource={DIYEventList}
                renderItem={
                  item => {
                    /// 修正下北京时间，+8，换成东八区
                    let moment1 = moment(item.started).utcOffset(8);
                    let start = moment1.format('YYYY-MM-DD dddd HH:mm');
                    let participantsNumber = item.participants.length;
                    return (
                      <List.Item>
                        <div style={{ marginLeft: -10, marginRight: 0 }} className='animaToBig'>
                          <Button size='small' onClick={() => {
                            if (item.fold !== undefined) {
                              item.fold = !(item.fold);
                            } else {
                              item.fold = true;
                            }

                            this.forceUpdate();
                          }}
                          >
                            <span>{start}</span>
                            <span style={{
                              marginLeft: 4,
                              width: 22, height: 22,
                              backgroundColor: 'orange',
                              borderRadius: 11
                            }}>{participantsNumber}</span>
                          </Button>

                          {item.fold ? (
                            <div style={{ textAlign: 'center', color: 'green', fontSize: 12 }}>
                              点击上方标题展开名单
                            </div>
                          ) : <List
                            split={false}
                            size='small'
                            style={{ width: 196, marginTop: 2 }}
                            grid={{ column: 2, gutter: 0 }}
                            locale={{ emptyText: '没有参加者，请邀请' }}
                            dataSource={item.participants}
                            renderItem={
                              item1 => {
                                let item1Index = item.participants.indexOf(item1);
                                return (
                                  (<List.Item style={{ background: 'gray', margin: 2 }}
                                    extra={
                                      (
                                        <div>
                                          <Button shape='circle' danger style={{ marginLeft: -16 }} size='small'
                                            disabled>
                                            {item1Index + 1}
                                          </Button>
                                          <Button danger style={{ marginLeft: 20 }} size='small' icon={<CloseOutlined />}
                                            onClick={async () => {
                                              Modal.confirm({
                                                title: '是否删除',
                                                content: '删除会从DIY活动名单中移除该会员',
                                                okText: '确认删除',
                                                cancelText: '取消',
                                                onOk: async () => {
                                                  let couponId = item1.couponId;
                                                  let memberName = item1.memberName;
                                                  let eventId = item1.eventId;
                                                  await LeaveFromEvent(couponId, memberName, eventId);
                                                  await this.fetchDIYEventList(false);
                                                }
                                              })
                                            }}>
                                          </Button>
                                        </div>
                                      )
                                    } className='animaToBig'>
                                    <List.Item.Meta
                                      title={(
                                        <div style={{ marginTop: -4, marginBottom: -4 }}>
                                          <Text style={{ color: 'white', fontSize: 12, width: 94, marginLeft: -12 }} ellipsis>
                                            {item1.memberName}
                                          </Text>
                                        </div>
                                      )}
                                    >
                                    </List.Item.Meta>
                                  </List.Item>)
                                )
                              }
                            }>
                            </List>}

                        </div>

                        <div>
                          <Button size='small' danger icon={<DeleteOutlined />}
                            style={{ marginLeft: 2, marginRight: 10 }}
                            onClick={
                              () => {
                                Modal.confirm({
                                  icon: <ExclamationCircleOutlined />,
                                  title: '是否删除',
                                  content: (
                                    <div>
                                      删除会相应解散
                                      <span style={{ color: 'red' }}>
                                        {start}
                                      </span>
                                      的DIY活动?
                                    </div>),
                                  okText: '确认删除',
                                  cancelText: '取消',
                                  onOk: () => {
                                    this.handleDeleteDIY(item._id)
                                  }
                                })
                              }
                            }>
                          </Button>
                        </div>
                      </List.Item>)
                  }
                }
                header={
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'white', height: 10 }}>
                    DIY活动列表
                    <Button
                      style={{ position: 'absolute', right: 4, top: 6 }}
                      type='dashed'
                      shape='circle'
                      size='small'
                      icon={<MinusCircleOutlined />}
                      onClick={
                        () => {
                          this.setState({ DIYEventShowMode: 'small' })
                        }
                      } />
                  </div>
                }
                footer={
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      icon={<FileAddTwoTone />}
                      shape='round'
                      style={{
                        marginBottom: 0
                      }}
                      size='small'
                      onClick={() => {
                        this.showCreateDIYEventModal();
                      }}>
                      创建DIY活动
                      </Button>
                  </div>
                }
              >
              </List>
            </div>
          )
        }

        <List
          size='small'
          locale={{ emptyText: '暂时没有数据' }}
          loading={loading}
          header={
            <div style={{ height: 110 }}>
            </div>
          }
          footer={
            <div style={{ height: 40, textAlign: 'center', fontSize: 14, fontWeight: "lighter" }}>
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
              let JoinToEventButtonDanger = lastJoinToEventItem === item;

              return (<List.Item key={item.serialNumber}>
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
                        shape='circle' danger={callButtonDanger}
                        onClick={() => {
                          this.setState({ lastCallItem: item });
                          this.showCallModal(item.memberId);
                        }}
                        disabled={alreadyUse}>
                      </Button>
                      <span> </span>
                      <Button type='primary' icon={<UserAddOutlined />}
                        shape="circle" danger={JoinToEventButtonDanger}
                        onClick={() => {
                          this.setState({ lastJoinToEventItem: item });
                          this.showJoinToEventModal();
                        }}
                        disabled={alreadyUse}>
                      </Button>
                      <span> </span>
                      <Button type='primary' icon={<MessageOutlined />}
                        shape="circle" danger={messageButtonDanger}
                        onClick={() => {
                          this.setState({ lastMessageItem: item });
                          this.showMessageModal(item.memberId);
                        }}
                        disabled={alreadyUse}>
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
                    保存备注
                  </Button>
                </div>
              </List.Item>)
            }
          }
        >
        </List>

        <Modal
          style={{ top: 12 }}
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
          style={{ top: 12 }}
          title="发送短信"
          visible={this.state.messageModalVisible}
          onOk={this.handleMessageModalOnOk}
          onCancel={this.handleMessageModalOnCancel}
          okText="确认发送并添加到名单中"
          cancelText="取消"
          closable
          okButtonProps={{ disabled: sendSMSModalDisable }}
          cancelButtonProps={{ disabled: sendSMSModalDisable }}
        >
          {DIYEventList.length > 0 ? (<div>
            <span style={{ fontSize: 16 }}>会员电话为：</span>
            <span style={{ color: "red" }}>{phoneNumToBeCall}</span>
            <br />
            <span style={{ fontSize: 16 }}>短信模板为：</span>
            <span>【弯麦烘焙】您已成功预约DIY活动，活动时间：</span>
            <span style={{ color: "green", textDecoration: 'underline' }}>{`${eventTime4Message.format('MM-DD HH:mm')}`}</span>
            <span>，请提前10分钟到达，如变更请提前一天拨打13290768588。</span>
            <br />
            <span style={{ fontSize: 16 }}>活动时间为：</span>

            <Radio.Group name="radiogroup" defaultValue={0}
              value={whichEventIndexToChoose} onChange={
                (e) => {
                  const { value } = e.target;
                  this.setState({ whichEventIndexToChoose: value });
                }
              }>
              {
                DIYEventList.map(event => {
                  /// 修正下北京时间，+8，换成东八区
                  let moment1 = moment(event.started).utcOffset(8);
                  let start = moment1.format('YYYY-MM-DD dddd HH:mm');
                  let index = DIYEventList.indexOf(event);
                  return <Radio key={index} value={index}>{start}</Radio>;
                })
              }
            </Radio.Group>

            <br /><br />
            <span>发送正文短消息给会员，是否发送？</span>
          </div>) : (
              <div>
                还未创建DIY活动，请先右下角创建DIY活动再发送短信。
              </div>
            )}
        </Modal>

        <Modal
          style={{ top: 12 }}
          title="创建DIY活动"
          visible={this.state.createDIYEventModalVisible}
          onOk={this.handleCreateDIYEventModalOnOk}
          onCancel={this.handleCreateDIYEventModalOnCancel}
          okText="确认创建"
          cancelText="取消"
          closable>
          <div>
            <span>
              活动时间：
            </span>
            <DatePicker format={'MM-DD dddd HH:mm'}
              showTime={{ format: 'HH:mm' }}
              value={this.state.eventTime4createDIY}
              onOk={this.handleCreateDIYEventDayOnOk} />
            <div style={{ marginTop: 10 }}>
              <span>
                快捷设置：
              </span>
              <span>
                <Button style={{ marginLeft: 8, marginTop: 8 }} type='dashed' danger onClick={() => {
                  let thisWeekSix = moment()
                    .endOf('week')
                    .subtract(1, 'days')
                    .set('hour', 15)
                    .set('minute', 30)
                    .set('second', 0)
                    .set('millisecond', 0);
                  this.setState({ eventTime4createDIY: thisWeekSix });
                }}>
                  本周六15:30
                </Button>
                <Button style={{ marginLeft: 8, marginTop: 8 }} type='dashed' danger onClick={() => {
                  let thisWeekSix = moment()
                    .endOf('week')
                    .set('hour', 15)
                    .set('minute', 30)
                    .set('second', 0)
                    .set('millisecond', 0);
                  this.setState({ eventTime4createDIY: thisWeekSix });
                }}>
                  本周日15:30
                </Button>
                <Button style={{ marginLeft: 8, marginTop: 8 }} type='dashed' danger onClick={() => {
                  let thisWeekSix = moment()
                    .add(7, 'days')
                    .endOf('week')
                    .subtract(1, 'days')
                    .set('hour', 15)
                    .set('minute', 30)
                    .set('second', 0)
                    .set('millisecond', 0);
                  this.setState({ eventTime4createDIY: thisWeekSix });
                }}>
                  下周六15:30
                </Button>
                <Button style={{ marginLeft: 8, marginTop: 8 }} type='dashed' danger onClick={() => {
                  let thisWeekSix = moment()
                    .add(7, 'days')
                    .endOf('week')
                    .set('hour', 15)
                    .set('minute', 30)
                    .set('second', 0)
                    .set('millisecond', 0);
                  this.setState({ eventTime4createDIY: thisWeekSix });
                }}>
                  下周日15:30
                </Button>
              </span>
            </div>
          </div>
        </Modal>

        <Modal
          style={{ top: 12 }}
          title="选择参加DIY活动"
          visible={this.state.joinToEventModalVisible}
          onOk={this.handleJoinToEventModalOnOk}
          onCancel={this.handleJoinToEventModalOnCancel}
          okText="确认加入"
          cancelText="取消"
          closable
          okButtonProps={{ disabled: joinToEventModalDisable }}
          cancelButtonProps={{ disabled: joinToEventModalDisable }}>
          {
            DIYEventList.length > 0 ? (
              <div>
                <Radio.Group name="radiogroup" defaultValue={0}
                  value={whichEventIndexToChoose} onChange={
                    (e) => {
                      const { value } = e.target;
                      this.setState({ whichEventIndexToChoose: value });
                    }
                  }>
                  {
                    DIYEventList.map(event => {
                      /// 修正下北京时间，+8，换成东八区
                      let moment1 = moment(event.started).utcOffset(8);
                      let start = moment1.format('YYYY-MM-DD dddd HH:mm');
                      let index = DIYEventList.indexOf(event);
                      return <Radio key={index} value={index}>{start}</Radio>;
                    })
                  }
                </Radio.Group>
              </div>
            ) : (
                <div>
                  还未创建DIY活动，请先右下角创建DIY活动再选择。
                </div>
              )
          }
        </Modal>
      </div >
    );
  }
}

export default diyReserve;
