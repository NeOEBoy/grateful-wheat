import React from 'react';
import {
  List,
  message,
  Dropdown,
  Menu,
  Button,
  DatePicker
} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import { getCouponSummaryList } from '../api/api';
import { DownOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;

const KShopArray = [
  { index: 0, name: '全部', userId: '' },
  { index: 1, name: '教育局店', userId: '3995767' },
  { index: 2, name: '旧镇店', userId: '3995771' },
  { index: 3, name: '江滨店', userId: '4061089' },
  { index: 4, name: '汤泉世纪店', userId: '4061092' }
];

class CouponSummary extends React.Component {
  constructor(props) {
    super(props);

    let query = this.props.query;
    let beginDateTime = moment().format('YYYY.MM.DD') + '+00:00:00';
    let endDateTime = moment().format('YYYY.MM.DD') + '+23:59:59';
    if (query) {
      beginDateTime = query.get('beginDateTime') ? query.get('beginDateTime') : beginDateTime;
      endDateTime = query.get('endDateTime') ? query.get('endDateTime') : endDateTime;
    }

    this.state = {
      userId: '',
      shopIndex: 1,
      listData: [],
      loading: false,
      beginDateTime: beginDateTime,
      endDateTime: endDateTime
    };
  }

  async componentDidMount() {
    let query = this.props.query;
    let userId = '';
    if (query && query.get('id')) {
      userId = query.get('id');
    }

    await this.initFirstPage(userId);
  }

  async initFirstPage(userId, beginDateTime, endDateTime) {
    for (let index = 0; index < KShopArray.length; index++) {
      if (KShopArray[index].userId === userId) {
        this.setState({ shopIndex: index })
        break;
      }
    }

    this.setState({
      userId: userId !== undefined ? userId : this.state.userId,
      listData: [],
      loading: false,
      beginDateTime: beginDateTime !== undefined ? beginDateTime : this.state.beginDateTime,
      endDateTime: endDateTime !== undefined ? endDateTime : this.state.endDateTime
    }, async () => {
      await this.fetchListData();
    });
  }

  async fetchListData() {
    try {
      const { listData, userId, beginDateTime, endDateTime } = this.state;
      let couponSummaryList = [];
      this.setState({ loading: true });
      const couponSummary = await getCouponSummaryList(
        userId,
        beginDateTime,
        endDateTime);
      if (couponSummary && couponSummary.errCode === 0) {
        couponSummaryList = couponSummary.list;
      }
      let newListData = listData.concat(couponSummaryList);

      this.setState({
        listData: newListData,
        loading: false,
      });
    } catch (err) {
      this.setState({
        loading: false
      });
    }
  }

  render() {
    const { shopIndex, beginDateTime, endDateTime } = this.state;
    let shopName = KShopArray[shopIndex].name;
    return (
      <div>
        <List
          dataSource={this.state.listData}
          loading={this.state.loading}
          locale={{ emptyText: '暂时没有数据' }}
          header={
            <div style={{ textAlign: 'center', fontSize: 24, fontWeight: "bold" }}>
              优惠劵统计
              <br />
              <Dropdown
                overlay={
                  () => {
                    let shop0 = KShopArray[0];
                    let shop1 = KShopArray[1];
                    let shop2 = KShopArray[2];
                    let shop3 = KShopArray[3];
                    let shop4 = KShopArray[4];

                    return (
                      <Menu onClick={async ({ key }) => {
                        let userId = KShopArray[key].userId;
                        await this.initFirstPage(userId);
                      }} >
                        <Menu.Item key={shop0.index}>{shop0.name}</Menu.Item>
                        <Menu.Item key={shop1.index}>{shop1.name}</Menu.Item>
                        <Menu.Item key={shop2.index}>{shop2.name}</Menu.Item>
                        <Menu.Item key={shop3.index}>{shop3.name}</Menu.Item>
                        <Menu.Item key={shop4.index}>{shop4.name}</Menu.Item>
                      </Menu>)
                  }
                } trigger={['click']}>
                <Button size="small" style={{ width: 240 }} onClick={e => e.preventDefault()}>
                  {shopName}
                  <DownOutlined />
                </Button>
              </Dropdown>
              <br />
              <RangePicker size='small' locale={locale}
                bordered={true}
                style={{ width: 320, marginTop: 15 }}
                placeholder={['开始时间', '结束时间']}
                inputReadOnly={true}
                defaultValue={[moment(beginDateTime, 'YYYY.MM.DD+HH:mm:ss'),
                moment(endDateTime, 'YYYY.MM.DD+HH:mm:ss')]}
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  showTime: true,
                  showHour: false,
                  showMinute: false,
                  showSecond: false
                }}
                onChange={(data) => {
                  if (!data) {
                    message.warning('请选择正确的日期!');
                    return;
                  };
                }} onOk={async (data) => {
                  console.log(data[0].format('YYYY.MM.DD+HH:mm:ss'));
                  console.log(data[1].format('YYYY.MM.DD+HH:mm:ss'));

                  await this.initFirstPage(undefined,
                    data[0] ? data[0].format('YYYY.MM.DD+HH:mm:ss') : undefined,
                    data[1] ? data[1].format('YYYY.MM.DD+HH:mm:ss') : undefined);
                }} />
              <br />
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
                    </div>
                  )}
                  description={(
                    <div>
                    <div>
                        <span style={{ color: "darkred", fontSize: 14 }}>属性：</span>
                        <span style={{ color: "darkred", fontSize: 12 }}>{`面值金额：${item.faceValue} , 销售价格：￥${item.salePrice}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "darkred", fontSize: 14 }}>核销：</span>
                        <span style={{ color: "darkred", fontSize: 12 }}>{`数量：${item.writeOffNumber} , 优惠金额：￥${item.writeOffValue}, 交易金额：￥${item.payValue}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>销售：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`数量：${item.saleNumber} , 销售金额：￥${item.saleValue}`}</span>
                      </div>
                      <div>
                        <span style={{ color: "gray", fontSize: 14 }}>非销售(赠送)：</span>
                        <span style={{ color: "gray", fontSize: 12 }}>{`数量：${item.presentNumber}`}</span>
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

export default CouponSummary;
