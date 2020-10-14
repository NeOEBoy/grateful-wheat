import React from 'react';
import {
  List,
  message,
  Spin,
  Dropdown,
  Menu,
  Button,
  DatePicker,
  Input
} from 'antd';
import { getProductSaleList } from '../api/api';
import InfiniteScroll from 'react-infinite-scroller';
import { DownOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
const { Search } = Input;
const { RangePicker } = DatePicker;
const KPageSize = 20;
const KShopArray = [
  { index: 0, name: '全部', userId: '' },
  { index: 1, name: '教育局', userId: '3995767' },
  { index: 2, name: '旧镇', userId: '3995771' },
  { index: 3, name: '江滨', userId: '4061089' },
  { index: 4, name: '汤泉', userId: '4061092' }
];

class ProductSale extends React.Component {
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
      listData: [],
      loading: false,
      hasMore: true,
      pageIndex: 1,
      shopIndex: 1,
      userId: '',
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
      hasMore: true,
      pageIndex: 1,
      beginDateTime: beginDateTime !== undefined ? beginDateTime : this.state.beginDateTime,
      endDateTime: endDateTime !== undefined ? endDateTime : this.state.endDateTime,
      keyword: keyword !== undefined ? keyword : this.state.keyword,
    }, async () => {
      await this.fetchNextPage();
    });
  }

  async fetchNextPage() {
    let { hasMore, pageIndex, listData } = this.state;
    if (!hasMore) {
      message.warning('没有更多数据了');
      return;
    }

    this.setState({ loading: true });

    try {
      const { userId, beginDateTime, endDateTime, keyword } = this.state;
      let saleList = [];
      const productSale = await getProductSaleList(userId, beginDateTime, endDateTime, pageIndex, KPageSize, keyword);
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
    const { shopIndex, beginDateTime, endDateTime } = this.state;

    let shopName = KShopArray[shopIndex].name;
    return (
      <div style={{ height: window.innerHeight, overflow: "auto" }}>
        <div style={{ textAlign: 'center', fontSize: 24, fontWeight: "bold" }}>
          热卖商品
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
            style={{ width: 320 }}
            placeholder={['开始时间', '结束时间']}
            inputReadOnly={true}
            defaultValue={[moment(beginDateTime, 'YYYY.MM.DD+HH:mm:ss'),
            moment(endDateTime, 'YYYY.MM.DD+HH:mm:ss')]}
            showTime={{
              hideDisabledOptions: true,
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
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
              await this.initFirstPage(undefined,
                data[0] ? data[0].format('YYYY.MM.DD+HH:mm:ss') : undefined,
                data[1] ? data[1].format('YYYY.MM.DD+HH:mm:ss') : undefined);
            }} />
          <br />
          <Search style={{ width: 280 }} size="small" placeholder="输入商品名称后查询" enterButton="查询"
            onSearch={async value => {
              await this.initFirstPage(undefined, undefined, undefined, value);
            }
            } />
        </div>
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
                    description={`销售数量：${item.saleNumber} 现有库存：${item.currentNumber}`}
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
