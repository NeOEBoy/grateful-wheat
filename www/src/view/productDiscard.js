import React from 'react';
import {
  List,
  message,
  Dropdown,
  Menu,
  Button,
  DatePicker,
  Input
} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import { getProductDiscardList } from '../api/api';
import { DownOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;
const { Search } = Input;

const KShopArray = [
  { index: 0, name: '全部', userId: '' },
  { index: 1, name: '教育局店', userId: '3995767' },
  { index: 2, name: '旧镇店', userId: '3995771' },
  { index: 3, name: '江滨店', userId: '4061089' },
  { index: 4, name: '汤泉世纪店', userId: '4061092' },
  { index: 5, name: '假日店', userId: '4339546' },
  { index: 6, name: '狮头店', userId: '4359267' },
  { index: 7, name: '盘陀店', userId: '4382444' }
];

class ProductDiscard extends React.Component {
  constructor(props) {
    super(props);

    let query = this.props.query;
    let beginDateTime = '';
    let endDateTime = '';
    if (query) {
      beginDateTime = query.get('beginDateTime');
      beginDateTime = beginDateTime.replace(' ', '+');// +号会变成空格，替换回来

      endDateTime = query.get('endDateTime');
      endDateTime = endDateTime.replace(' ', '+');// +号会变成空格，替换回来
    }

    this.state = {
      userId: '',
      shopIndex: 1,
      listData: [],
      loading: false,
      beginDateTime: beginDateTime,
      endDateTime: endDateTime,
      keyword: ''
    };
  }

  async componentDidMount() {
    let query = this.props.query;
    let userId = '';
    if (query) {
      userId = query.get('id');
    }

    await this.initFirstPage(userId);
  }

  async initFirstPage(userId, beginDateTime, endDateTime, keyword) {
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
      endDateTime: endDateTime !== undefined ? endDateTime : this.state.endDateTime,
      keyword: keyword !== undefined ? keyword : this.state.keyword,
    }, async () => {
      await this.fetchListData();
    });
  }

  async fetchListData() {
    try {
      const { listData, userId, beginDateTime, endDateTime, keyword } = this.state;
      let discardList = [];
      this.setState({ loading: true });
      const productDiscard = await getProductDiscardList(
        userId,
        beginDateTime,
        endDateTime,
        keyword);
      if (productDiscard && productDiscard.errCode === 0) {
        discardList = productDiscard.list;
      }
      let newListData = listData.concat(discardList);

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
              报损
              <br />
              <Dropdown
                overlay={
                  () => {
                    let shop0 = KShopArray[0];
                    let shop1 = KShopArray[1];
                    let shop2 = KShopArray[2];
                    let shop3 = KShopArray[3];
                    let shop4 = KShopArray[4];
                    let shop5 = KShopArray[5];
                    let shop6 = KShopArray[6];
                    let shop7 = KShopArray[7];

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
                        <Menu.Item key={shop5.index}>{shop5.name}</Menu.Item>
                        <Menu.Item key={shop6.index}>{shop6.name}</Menu.Item>
                        <Menu.Item key={shop7.index}>{shop7.name}</Menu.Item>
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
              <Search style={{ width: 280, marginTop: 15 }} size="small" placeholder="输入商品名称后查询" enterButton="查询"
                onSearch={async value => {
                  await this.initFirstPage(undefined, undefined, undefined, value);
                }
                } />
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

              let specification = item.specification !== '-' ? ' | ' + item.specification : '';
              let category = item.category !== '' ? ' | ' + item.category : '';
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
                      <span style={{ fontSize: 12 }}>
                        {specification}
                      </span>
                      <span style={{ fontSize: 10 }}>
                        {category}
                      </span>
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
