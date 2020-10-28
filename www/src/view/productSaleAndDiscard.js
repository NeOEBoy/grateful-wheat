
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
import { getProductSaleAndDiscardList } from '../api/api';
import { DownOutlined } from '@ant-design/icons';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
const { Search } = Input;
const { RangePicker } = DatePicker;
const KShopArray = [
  { index: 0, name: '全部门店', userId: '' },
  { index: 1, name: '教育局店', userId: '3995767' },
  { index: 2, name: '旧镇店', userId: '3995771' },
  { index: 3, name: '江滨店', userId: '4061089' },
  { index: 4, name: '汤泉世纪店', userId: '4061092' }
];
/**
 * categoryId为数组格式 %22id1%22,%22id2%22,%22id3%22
 * id1,id2,id3为准确的分类id
 */
/// 现烤
const KFreshlyBakedCategoryID = '%221593049816479739965%22';
/// 吐司
const KToastCategoryID = '%221593049854760654816%22';
/// 西点
const KWestCategoryID = '%221592989355905414162%22';
/// 常温
const KHomoeothermyCategoryID = '%221593049881212199906%22';
/// 干点
const KDryCategoryID = '%221593059349213583584%22';
/// 全部
const KAllCategoryID =
  KFreshlyBakedCategoryID + ',' +
  KToastCategoryID + ',' +
  KWestCategoryID + ',' +
  KHomoeothermyCategoryID + ',' +
  KDryCategoryID;
const KCategoryArray = [
  { index: 0, name: '全部面包', categoryId: KAllCategoryID },
  { index: 1, name: '现烤', categoryId: KFreshlyBakedCategoryID },
  { index: 2, name: '吐司餐包', categoryId: KToastCategoryID },
  { index: 3, name: '西点蛋糕', categoryId: KWestCategoryID },
  { index: 4, name: '常温蛋糕', categoryId: KHomoeothermyCategoryID },
  { index: 5, name: '干点', categoryId: KDryCategoryID }
];

class productSaleAndDiscard extends React.Component {
  constructor(props) {
    super(props);

    let query = this.props.query;
    let beginDateTime = moment().format('YYYY-MM-DD') + '+00:00:00';
    let endDateTime = moment().format('YYYY-MM-DD') + '+23:59:59';
    if (query) {
      beginDateTime = query.get('beginDateTime') ? query.get('beginDateTime') : beginDateTime;
      endDateTime = query.get('endDateTime') ? query.get('endDateTime') : endDateTime;
    }

    this.state = {
      userId: '',
      shopIndex: 1,
      categoryId: KAllCategoryID, /// 全部分类
      categoryIndex: 0, /// 全部分类
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
    if (query && query.get('id')) {
      userId = query.get('id');
    }

    await this.initFirstPage(userId);
  }

  async initFirstPage(userId, categoryId, beginDateTime, endDateTime, keyword) {
    for (let index = 0; index < KShopArray.length; index++) {
      if (KShopArray[index].userId === userId) {
        this.setState({ shopIndex: index })
        break;
      }
    }

    for (let index = 0; index < KCategoryArray.length; index++) {
      if (KCategoryArray[index].categoryId === categoryId) {
        this.setState({ categoryIndex: index })
        break;
      }
    }

    this.setState({
      userId: userId !== undefined ? userId : this.state.userId,
      categoryId: categoryId !== undefined ? categoryId : this.state.categoryId,
      listData: [],
      loading: false,
      beginDateTime: beginDateTime !== undefined ? beginDateTime : this.state.beginDateTime,
      endDateTime: endDateTime !== undefined ? endDateTime : this.state.endDateTime,
      keyword: keyword !== undefined ? keyword : ''
    }, async () => {
      await this.fetchListData();
    });
  }

  async fetchListData() {
    try {
      const { listData, userId, categoryId, beginDateTime, endDateTime, keyword } = this.state;
      let saleAndDiscardList = [];
      this.setState({ loading: true });

      let beginDateTime1 = beginDateTime;
      let beginPlusIndex = beginDateTime1.indexOf('+');
      if (beginPlusIndex >= 0) {
        beginDateTime1 = beginDateTime1.substring(0, beginPlusIndex);
      }
      let endDateTime1 = endDateTime;
      let endPlusIndex = endDateTime1.indexOf('+');
      if (endPlusIndex >= 0) {
        endDateTime1 = endDateTime1.substring(0, endPlusIndex);
      }
      const productSaleAndDiscard = await getProductSaleAndDiscardList(
        userId,
        categoryId,
        beginDateTime1,
        endDateTime1,
        keyword);
      if (productSaleAndDiscard && productSaleAndDiscard.errCode === 0) {
        saleAndDiscardList = productSaleAndDiscard.list;
      }
      let newListData = listData.concat(saleAndDiscardList);

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
    const { shopIndex, beginDateTime, endDateTime, categoryIndex } = this.state;
    let shopName = KShopArray[shopIndex].name;
    let categoryName = KCategoryArray[categoryIndex].name;
    return (
      <div>
        <List
          dataSource={this.state.listData}
          loading={this.state.loading}
          locale={{ emptyText: '暂时没有数据' }}
          header={
            <div style={{ textAlign: 'center', fontSize: 24, fontWeight: "bold" }}>
              商品报损与销售分析
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
              <Dropdown
                overlay={
                  () => {
                    let category0 = KCategoryArray[0];
                    let category1 = KCategoryArray[1];
                    let category2 = KCategoryArray[2];
                    let category3 = KCategoryArray[3];
                    let category4 = KCategoryArray[4];
                    let category5 = KCategoryArray[5];

                    return (
                      <Menu onClick={async ({ key }) => {
                        let categoryId = KCategoryArray[key].categoryId;
                        await this.initFirstPage(undefined, categoryId);
                      }} >
                        <Menu.Item key={category0.index}>{category0.name}</Menu.Item>
                        <Menu.Item key={category1.index}>{category1.name}</Menu.Item>
                        <Menu.Item key={category2.index}>{category2.name}</Menu.Item>
                        <Menu.Item key={category3.index}>{category3.name}</Menu.Item>
                        <Menu.Item key={category4.index}>{category4.name}</Menu.Item>
                        <Menu.Item key={category5.index}>{category5.name}</Menu.Item>
                      </Menu>)
                  }
                } trigger={['click']}>
                <Button size="small" style={{ width: 240 }} onClick={e => e.preventDefault()}>
                  {categoryName}
                  <DownOutlined />
                </Button>
              </Dropdown>
              <br />
              <RangePicker size='small' locale={locale}
                bordered={true}
                style={{ width: 320, marginTop: 15 }}
                placeholder={['开始时间', '结束时间']}
                inputReadOnly={true}
                defaultValue={[moment(beginDateTime, 'YYYY-MM-DD+HH:mm:ss'), moment(endDateTime, 'YYYY-MM-DD+HH:mm:ss')]}
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  showTime: false,
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
                  if (data.length >= 2) {
                    await this.initFirstPage(undefined, undefined,
                      data[0] ? data[0].format('YYYY-MM-DD') : undefined,
                      data[1] ? data[1].format('YYYY-MM-DD') : undefined);
                  }
                }} />
              <br />
              <Search style={{ width: 280, marginTop: 15 }} size="small" placeholder="输入商品名称后查询" enterButton="查询"
                onSearch={async value => {
                  await this.initFirstPage(undefined, undefined, undefined, undefined, value);
                }}
                value={this.state.keyword}
                onChange={(e) => {
                  const { value } = e.target;
                  this.setState({ keyword: value });
                }} />
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
                  description={(
                    <div>
                      <div style={{ color: "coral", fontSize: 12 }}>
                        {`报损数量：${item.discardNumber}  报损金额：￥${item.diacardMoney}`}
                      </div>
                      <div style={{ color: "coral", fontSize: 12 }}>
                        {`销售数量：${item.saleNumber}  销售金额：￥${item.saleMoney}`}
                      </div>
                      <div style={{ color: "darkred", fontSize: 16 }}>
                        {`报损率：${item.discardProportion} %`}
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

export default productSaleAndDiscard;
