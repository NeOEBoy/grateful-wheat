
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;
const dateFormat = require('../util/date-util').dateFormat;

/**--------------------配置信息--------------------*/
const KForTest = false;
const KSendToWorkWeixin = true;

/// 增加门店这里添加一下
const KShopArray = [
  { index: 0, name: '公众号', userId: '3995763' },
  { index: 1, name: '教育局', userId: '3995767' },
  { index: 2, name: '旧镇', userId: '3995771' },
  { index: 3, name: '江滨', userId: '4061089' },
  { index: 4, name: '汤泉世纪', userId: '4061092' }
];

/**--------------------配置信息--------------------*/

const whichDate = () => {
  let theDate = new Date();
  // 换算成昨天，测试用
  // theDate.setTime(theDate.getTime() - 24 * 60 * 60 * 1000);
  return theDate;
}

const siginAndGetPOSPALAUTH30220 = async () => {
  let signInUrl = 'https://beta33.pospal.cn/account/SignIn';
  let signInBody = { 'userName': 'wanmaizb', 'password': 'Rainsnow12' };
  const signInResponse = await fetch(signInUrl, {
    method: 'POST', body: JSON.stringify(signInBody),
    headers: { 'Content-Type': 'application/json' }
  });
  let setCookie = signInResponse.headers.get('set-cookie');
  let thePOSPALAUTH30220 = '';
  let cookieArray = setCookie.split('; ');
  cookieArray.forEach(element => {
    let cookieSingle = element.split('=');
    if (cookieSingle[0] === 'HttpOnly, .POSPALAUTH30220') {
      // console.log(cookieSingle[1]);
      thePOSPALAUTH30220 = cookieSingle[1];
    }
  });
  // console.log(setCookie);
  // const signInResponseJson = await signInResponse.json();
  // console.log(signInResponseJson);
  // if (signInResponseJson.success) {
  //   console.log(thePOSPALAUTH30220);
  // }

  return thePOSPALAUTH30220;
}

const getBusinessSummaryContent4WorkWeixin = async (thePOSPALAUTH30220) => {
  const businessSummaryObjArray = [];
  for (shop of KShopArray) {
    const businessSummaryObj = await getBusinessSummaryByUserIdAndParse(thePOSPALAUTH30220, shop.userId);

    let discardObj = await getDiscardInventoryAndParse(thePOSPALAUTH30220, shop.userId);
    businessSummaryObj.productDiscardObj = discardObj;

    let newMemberObj = await getNewMemberCountByUserIdAndParse(thePOSPALAUTH30220, shop.userId);
    businessSummaryObj.newMemberObj = newMemberObj;

    businessSummaryObj.shop = shop;
    businessSummaryObjArray.push(businessSummaryObj);
  }
  // console.log(businessSummaryObjArray);

  const businessSummaryObj4workweixin = parseBusinessSummaryArray(businessSummaryObjArray);
  const content = buildString4Workweixin(businessSummaryObj4workweixin);
  if (KForTest) console.log(content);
  return content;
}

const getBusinessSummaryByUserIdAndParse = async (thePOSPALAUTH30220, userId) => {
  const businessSummaryResponseJson = await getBusinessSummaryByUserId(thePOSPALAUTH30220, userId);
  const businessSummaryObj = await parseBusinessSummary(businessSummaryResponseJson);
  return businessSummaryObj;
}

const getDiscardInventoryAndParse = async (thePOSPALAUTH30220, userId) => {
  const commoditySalesResponseJson = await getDiscardInventoryByUserId(thePOSPALAUTH30220, userId);
  let discardObj = await parseDiscardInventory(commoditySalesResponseJson);
  return discardObj;
}

const getDiscardInventoryByUserId = async (thePOSPALAUTH30220, userId) => {
  let discardInventoryUrl = 'https://beta33.pospal.cn/Inventory/LoadDiscardInventoryHistory';

  let discardInventoryBodyStr = 'userId=' + userId;
  let today = dateFormat("YYYY.mm.dd", whichDate());
  discardInventoryBodyStr += '&beginDateTime=';
  discardInventoryBodyStr += escape(today + '+00:00:00');
  discardInventoryBodyStr += '&endDateTime=';
  discardInventoryBodyStr += escape(today + '+23:59:59');

  const commoditySalesResponse = await fetch(discardInventoryUrl, {
    method: 'POST', body: discardInventoryBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });

  const commoditySalesResponseJson = await commoditySalesResponse.json();
  return commoditySalesResponseJson;
}

const parseDiscardInventory = async (commoditySalesResponseJson) => {
  let discardObj = {};
  let totalCount = '0.00'; // 0为无报损

  if (commoditySalesResponseJson.successed) {
    let view = commoditySalesResponseJson.view;
    // console.log(view);

    var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + view + '</root>';
    try {
      let result = await parseStringPromise(xml);
      if (result) {
        let trArray = result.root.tbody[0].tr;
        let lastIndex = trArray.length - 1;
        totalCount = trArray[lastIndex].td[4]._;
        // console.log(totalCount);
      }
    } catch (e) {
      // console.log('没有报损数据，解析出错');
    }
  }

  /// 总计
  discardObj.overview = totalCount;
  return discardObj;
}

const getNewMemberCountByUserIdAndParse = async (thePOSPALAUTH30220, userId) => {
  let newCustomerSummaryResponseJson = await getNewMemberCountByUserId(thePOSPALAUTH30220, userId);
  let newMemberObj = await parseNewMemberCount(newCustomerSummaryResponseJson);
  return newMemberObj;
}

const getNewMemberCountByUserId = async (thePOSPALAUTH30220, userId) => {
  let newCustomerSummaryUrl = 'https://beta33.pospal.cn/CustomerReport/LoadNewCustomerSummary';
  // groupBy=day&beginDateTime=2020-07-28&endDateTime=2020-07-28
  let newCustomerSummaryBodyStr = '';
  newCustomerSummaryBodyStr += 'userIds%5B%5D=';
  newCustomerSummaryBodyStr += userId;
  newCustomerSummaryBodyStr += '&groupBy=day';
  let today = dateFormat("YYYY-mm-dd", whichDate());
  newCustomerSummaryBodyStr += '&beginDateTime=';
  newCustomerSummaryBodyStr += today;
  newCustomerSummaryBodyStr += '&endDateTime=';
  newCustomerSummaryBodyStr += today;

  const newCustomerSummaryResponse = await fetch(newCustomerSummaryUrl, {
    method: 'POST', body: newCustomerSummaryBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });

  const newCustomerSummaryResponseJson = await newCustomerSummaryResponse.json();
  return newCustomerSummaryResponseJson;
}

const parseNewMemberCount = (newCustomerSummaryResponseJson) => {
  if (!newCustomerSummaryResponseJson.successed) return;

  let newMemberObj = {};

  let list = newCustomerSummaryResponseJson.list;
  let newMemberCount = list[0].NewCustomerCount;
  newMemberObj.newMemberCount = newMemberCount;

  return newMemberObj;
}

const getBusinessSummaryByUserId = async (thePOSPALAUTH30220, userId) => {
  let businessSummary = 'https://beta33.pospal.cn/Report/LoadBusinessSummaryV2';

  /// userIds%5B%5D=3995763&beginDateTime=2020.10.03+00%3A00%3A00&endDateTime=2020.10.03+23%3A59%3A59
  let businessSummaryBodyStr = '';
  businessSummaryBodyStr += 'userIds%5B%5D=';
  businessSummaryBodyStr += userId;
  let today = dateFormat("YYYY.mm.dd", whichDate());
  businessSummaryBodyStr += '&beginDateTime=';
  businessSummaryBodyStr += escape(today + '+00:00:00');
  businessSummaryBodyStr += '&endDateTime=';
  businessSummaryBodyStr += escape(today + '+23:59:59');

  const businessSummaryResponse = await fetch(businessSummary, {
    method: 'POST', body: businessSummaryBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const businessSummaryResponseJson = await businessSummaryResponse.json();
  return businessSummaryResponseJson;
}

const parseBusinessSummary = async (businessSummaryResponseJson) => {
  if (!businessSummaryResponseJson.successed) return;

  let businessSummaryObj = {};
  businessSummaryObj.productSaleObj = {};
  businessSummaryObj.productSaleObj.overview = '';
  businessSummaryObj.productSaleObj.cashpay = '';
  businessSummaryObj.productSaleObj.alipay = '';
  businessSummaryObj.productSaleObj.weixinpay = '';
  businessSummaryObj.productSaleObj.cardpay = '';

  businessSummaryObj.memberRechargeObj = {};
  businessSummaryObj.memberRechargeObj.overview = '';
  businessSummaryObj.memberRechargeObj.cashpay = '';
  businessSummaryObj.memberRechargeObj.alipay = '';
  businessSummaryObj.memberRechargeObj.weixinpay = '';

  businessSummaryObj.giftpackageSaleObj = {};
  businessSummaryObj.giftpackageSaleObj.overview = '';

  businessSummaryObj.actualIncomeObj = {};
  businessSummaryObj.actualIncomeObj.overview = '';
  businessSummaryObj.actualIncomeObj.cashpay = '';
  businessSummaryObj.actualIncomeObj.alipay = '';
  businessSummaryObj.actualIncomeObj.weixinpay = '';

  try {
    let view = businessSummaryResponseJson.view;
    // console.log(view);
    var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + view + '</root>';
    // console.log(xml);
    let result = await parseStringPromise(xml, {
      strict: false, // 为true可能解析不正确
      normalizeTags: true
    });
    if (result) {
      // console.log(result);

      let columnProductSaleIndex = 0; /// 商品销售
      let columnEarnestIndex = 1; /// 预定金收入
      let columnMemberRechargeIndex = 2; /// 储值卡充值
      let columnSecondCardSaleIndex = 3; /// 次卡销售
      let columnShoppingCardRechargeIndex = 4; /// 购物卡充值
      let columnPrepayCardSaleIndex = 5; /// 预付卡销售
      let columnCouponSaleIndex = 6; /// 优惠券销售
      let columnGiftpackageSaleIndex = 7; /// 礼品包销售
      let columnMemberUpgradeSaleIndex = 8; /// 会员付费升级
      let columnCashIncomeAndpayIndex = 9; /// 现金收支
      let columnTotalIncomeIndex = 10; /// 总计
      let columnActualIncomeIndex = 11; /// 营业实收

      let rowOverviewIndex = -1;
      let rowCashPayIndex = -1;
      let rowWeixinpayIndex = -1;
      let rowAlipayIndex = -1;
      let rowCardpayIndex = -1;

      let payWay = result.root.thead[0].tr[0].th;
      // console.log(payWay);
      let payWayLength = payWay.length;
      for (let index = 0; index < payWayLength; ++index) {
        if (payWay[index]._ === '概况') {
          rowOverviewIndex = index;
          continue;
        }
        if (payWay[index]._ === '现金支付') {
          rowCashPayIndex = index;
          continue;
        }
        if (payWay[index]._ === '支付宝支付') {
          rowAlipayIndex = index;
          continue;
        }
        if (payWay[index]._ === '微信支付') {
          rowWeixinpayIndex = index;
          continue;
        }
        if (payWay[index]._ === '储值卡支付') {
          rowCardpayIndex = index;
          continue;
        }
      }

      // console.log(rowCashPayIndex);
      // console.log(rowWeixinpayIndex);
      // console.log(rowAlipayIndex);
      let trArray = result.root.tbody[0].tr;
      // console.log(trArray);
      let productSaleItem = trArray[columnProductSaleIndex];
      // console.log(productSaleItem);
      let memberRechargeItem = trArray[columnMemberRechargeIndex];
      // console.log(memberRechargeItem);
      let giftpackageSaleItem = trArray[columnGiftpackageSaleIndex];
      // console.log(giftpackageSaleItem);
      let actualIncomeItem = trArray[columnActualIncomeIndex];
      // console.log(giftpackageSaleItem);

      if (rowOverviewIndex !== -1) {
        let productSaleOverview = productSaleItem.td[rowOverviewIndex].div[0].span[0]._.trim();
        businessSummaryObj.productSaleObj.overview = productSaleOverview;
        // console.log(productSaleOverview);
        let memberRechargeOverview = memberRechargeItem.td[rowOverviewIndex].span[0]._.trim();
        businessSummaryObj.memberRechargeObj.overview = memberRechargeOverview;
        // console.log(memberRechargeOverview);
        let giftpackageSaleOverview = giftpackageSaleItem.td[rowOverviewIndex].span[0].trim();
        businessSummaryObj.giftpackageSaleObj.overview = giftpackageSaleOverview;
        // console.log(giftpackageSaleOverview);
        let actualIncomeOverview = actualIncomeItem.td[rowOverviewIndex].span[0].trim();
        businessSummaryObj.actualIncomeObj.overview = actualIncomeOverview;
        // console.log(actualIncomeOverview);
      }
      if (rowCashPayIndex !== -1) {
        let productSaleCashPay = productSaleItem.td[rowCashPayIndex].span[0]._.trim();
        businessSummaryObj.productSaleObj.cashpay = productSaleCashPay;
        // console.log(productSaleCashPay);
        let memberRechargeCashpay = memberRechargeItem.td[rowCashPayIndex].span[0]._.trim();
        businessSummaryObj.memberRechargeObj.cashpay = memberRechargeCashpay;
        // console.log(memberRechargeCashpay);
        let actualIncomeCashpay = actualIncomeItem.td[rowCashPayIndex]._.trim();
        businessSummaryObj.actualIncomeObj.cashpay = actualIncomeCashpay;
      }
      if (rowAlipayIndex !== -1) {
        let productSaleAlipay = productSaleItem.td[rowAlipayIndex].span[0]._.trim();
        businessSummaryObj.productSaleObj.alipay = productSaleAlipay;
        // console.log(productSaleAlipay);
        let memberRechargeAlipay = memberRechargeItem.td[rowAlipayIndex].span[0]._.trim();
        businessSummaryObj.memberRechargeObj.alipay = memberRechargeAlipay;
        // console.log(memberRechargeAlipay);
        let actualIncomeAlipay = actualIncomeItem.td[rowAlipayIndex]._.trim();
        businessSummaryObj.actualIncomeObj.alipay = actualIncomeAlipay;
        // console.log(actualIncomeAlipay);
      }
      if (rowWeixinpayIndex !== -1) {
        let productSaleWeixinpay = productSaleItem.td[rowWeixinpayIndex].span[0]._.trim();
        businessSummaryObj.productSaleObj.weixinpay = productSaleWeixinpay;
        // console.log(productSaleWeixinpay);
        let memberRechargeWeixinpay = memberRechargeItem.td[rowWeixinpayIndex].span[0]._.trim();
        businessSummaryObj.memberRechargeObj.weixinpay = memberRechargeWeixinpay;
        // console.log(memberRechargeWeixinpay);
        let actualIncomeWeixinpay = actualIncomeItem.td[rowAlipayIndex]._.trim();
        businessSummaryObj.actualIncomeObj.weixinpay = actualIncomeWeixinpay;
        // console.log(actualIncomeWeixinpay);
      }
      if (rowCardpayIndex !== -1) {
        let productSaleCardpay = productSaleItem.td[rowCardpayIndex].span[0]._.trim();
        businessSummaryObj.productSaleObj.cardpay = productSaleCardpay;
        // console.log(productSaleCardpay);
        let memberRechargeCardpay = memberRechargeItem.td[rowCardpayIndex].span[0]._.trim();
        businessSummaryObj.memberRechargeObj.cardpay = memberRechargeCardpay;
        // console.log(memberRechargeCardpay);
      }
    }
  } catch (e) {
    // console.log('解析businessSummary出错');
  }

  return businessSummaryObj;
};

const parseBusinessSummaryArray = (businessSummaryObjArray) => {
  let today = dateFormat("YYYY.mm.dd", whichDate());

  let businessSummaryObj4workweixin = {};

  businessSummaryObj4workweixin.productSaleItem = {};
  businessSummaryObj4workweixin.productSaleItem.title = today + ' 商品销售情况';

  businessSummaryObj4workweixin.productSaleItem.productSaleMoney = {};
  businessSummaryObj4workweixin.productSaleItem.productSaleMoney.title = '商品销售额';
  businessSummaryObj4workweixin.productSaleItem.productSaleMoney.stores = [];

  businessSummaryObj4workweixin.productSaleItem.productDiscardMoney = {};
  businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.title = '商品报损额';
  businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.stores = [];

  businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney = {};
  businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.title = '礼品包销售额';
  businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.stores = [];

  businessSummaryObj4workweixin.memberItem = {};
  businessSummaryObj4workweixin.memberItem.title = today + ' 会员情况';

  businessSummaryObj4workweixin.memberItem.rechargeMoney = {};
  businessSummaryObj4workweixin.memberItem.rechargeMoney.title = '会员充值额';
  businessSummaryObj4workweixin.memberItem.rechargeMoney.stores = [];

  businessSummaryObj4workweixin.memberItem.consumeMoney = {};
  businessSummaryObj4workweixin.memberItem.consumeMoney.title = '会员消费额';
  businessSummaryObj4workweixin.memberItem.consumeMoney.stores = [];

  businessSummaryObj4workweixin.memberItem.newMember = {};
  businessSummaryObj4workweixin.memberItem.newMember.title = '新增会员数';
  businessSummaryObj4workweixin.memberItem.newMember.stores = [];

  businessSummaryObj4workweixin.actualIncomeItem = {};
  businessSummaryObj4workweixin.actualIncomeItem.title = today + ' 营业实收情况';

  businessSummaryObj4workweixin.actualIncomeItem.cashpayMoney = {};
  businessSummaryObj4workweixin.actualIncomeItem.cashpayMoney.title = '现金实收额';
  businessSummaryObj4workweixin.actualIncomeItem.cashpayMoney.stores = [];

  businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney = {};
  businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney.title = '微信实收额';
  businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney.stores = [];

  businessSummaryObj4workweixin.actualIncomeItem.alipayMoney = {};
  businessSummaryObj4workweixin.actualIncomeItem.alipayMoney.title = '支付宝实收额';
  businessSummaryObj4workweixin.actualIncomeItem.alipayMoney.stores = [];

  businessSummaryObj4workweixin.actualIncomeItem.overviewMoney = {};
  businessSummaryObj4workweixin.actualIncomeItem.overviewMoney.title = '总实收额';
  businessSummaryObj4workweixin.actualIncomeItem.overviewMoney.stores = [];

  businessSummaryObjArray.forEach(businessSummaryObj => {
    let productSaleObj = businessSummaryObj.productSaleObj;
    let productSaleOverview = productSaleObj.overview;
    let store4ProductSale = {};
    store4ProductSale.name = businessSummaryObj.shop.name;
    store4ProductSale.userId = businessSummaryObj.shop.userId;
    store4ProductSale.money = productSaleOverview ? productSaleOverview : '0.00';
    businessSummaryObj4workweixin.productSaleItem.productSaleMoney.stores.push(store4ProductSale);

    let giftpackageSaleObj = businessSummaryObj.giftpackageSaleObj;
    let giftpackageSaleOverview = giftpackageSaleObj.overview;
    let store4GiftpackageSale = {};
    store4GiftpackageSale.name = businessSummaryObj.shop.name;
    store4GiftpackageSale.userId = businessSummaryObj.shop.userId;
    store4GiftpackageSale.money = giftpackageSaleOverview ? giftpackageSaleOverview : '0.00';
    businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.stores.push(store4GiftpackageSale);

    let productDiscardObj = businessSummaryObj.productDiscardObj;
    let productDiscardOverview = productDiscardObj.overview;
    let store4ProductDiscard = {};
    store4ProductDiscard.name = businessSummaryObj.shop.name;
    store4ProductDiscard.userId = businessSummaryObj.shop.userId;
    store4ProductDiscard.money = productDiscardOverview ? productDiscardOverview : '0.00';
    businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.stores.push(store4ProductDiscard);

    let memberRechargeObj = businessSummaryObj.memberRechargeObj;
    let memberRechargeOverview = memberRechargeObj.overview;
    let store4MemberRecharge = {};
    store4MemberRecharge.name = businessSummaryObj.shop.name;
    store4MemberRecharge.userId = businessSummaryObj.shop.userId;
    store4MemberRecharge.money = memberRechargeOverview ? memberRechargeOverview : '0.00';
    businessSummaryObj4workweixin.memberItem.rechargeMoney.stores.push(store4MemberRecharge);

    let store4MemberConsume = {};
    let productSaleCardpay = productSaleObj.cardpay;
    store4MemberConsume.name = businessSummaryObj.shop.name;
    store4MemberConsume.userId = businessSummaryObj.shop.userId;
    store4MemberConsume.money = productSaleCardpay ? productSaleCardpay : '0.00';
    businessSummaryObj4workweixin.memberItem.consumeMoney.stores.push(store4MemberConsume);

    let newMemberObj = businessSummaryObj.newMemberObj;
    let newMemberCount = newMemberObj.newMemberCount;
    let store4NewMember = {};
    store4NewMember.name = businessSummaryObj.shop.name;
    store4NewMember.userId = businessSummaryObj.shop.userId;
    store4NewMember.newMemberCount = newMemberCount;
    businessSummaryObj4workweixin.memberItem.newMember.stores.push(store4NewMember);

    let actualIncomeObj = businessSummaryObj.actualIncomeObj;
    let actualIncomeCashpay = actualIncomeObj.cashpay;
    let store4ActualIncomeCashpay = {};
    store4ActualIncomeCashpay.name = businessSummaryObj.shop.name;
    store4ActualIncomeCashpay.userId = businessSummaryObj.shop.userId;
    store4ActualIncomeCashpay.cashpay = actualIncomeCashpay ? actualIncomeCashpay : '0.00';
    businessSummaryObj4workweixin.actualIncomeItem.cashpayMoney.stores.push(store4ActualIncomeCashpay);

    let actualIncomeWeixinpay = actualIncomeObj.weixinpay;
    let store4ActualIncomeWeixinpay = {};
    store4ActualIncomeWeixinpay.name = businessSummaryObj.shop.name;
    store4ActualIncomeWeixinpay.userId = businessSummaryObj.shop.userId;
    store4ActualIncomeWeixinpay.weixinpay = actualIncomeWeixinpay ? actualIncomeWeixinpay : '0.00';
    businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney.stores.push(store4ActualIncomeWeixinpay);

    let actualIncomeAlipay = actualIncomeObj.alipay;
    let store4ActualIncomeAlipay = {};
    store4ActualIncomeAlipay.name = businessSummaryObj.shop.name;
    store4ActualIncomeAlipay.userId = businessSummaryObj.shop.userId;
    store4ActualIncomeAlipay.alipay = actualIncomeAlipay ? actualIncomeAlipay : '0.00';
    businessSummaryObj4workweixin.actualIncomeItem.alipayMoney.stores.push(store4ActualIncomeAlipay);

    let actualIncomeOverview = actualIncomeObj.overview;
    let store4ActualIncomeOverview = {};
    store4ActualIncomeOverview.name = businessSummaryObj.shop.name;
    store4ActualIncomeOverview.userId = businessSummaryObj.shop.userId;
    store4ActualIncomeOverview.overview = actualIncomeOverview ? actualIncomeOverview : '0.00';
    businessSummaryObj4workweixin.actualIncomeItem.overviewMoney.stores.push(store4ActualIncomeOverview);
  });

  // console.log(JSON.stringify(businessSummaryObj4workweixin));
  return businessSummaryObj4workweixin;
}

const buildString4Workweixin = (businessSummaryObj4workweixin) => {
  // console.log(JSON.stringify(businessSummaryObj4workweixin));

  let totalContent = '';
  /*-------------------------*/
  /// 商品销售情况
  totalContent += '**' + businessSummaryObj4workweixin.productSaleItem.title + '**\n';
  /// 商品销售额
  totalContent += '> **' + businessSummaryObj4workweixin.productSaleItem.productSaleMoney.title + '**\n';
  /// 商品销售额-门店
  let productSaleMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.productSaleItem.productSaleMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + ' 元</font>\n';
    totalContent += makeProductSaleMark(store.userId, store.name, store.money, dateFormat("YYYY.mm.dd", whichDate()));
    totalContent += '\n';

    let storeMoney = parseFloat(store.money);
    productSaleMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + productSaleMoneyTotalMoney.toFixed(2) + ' 元</font>\n';
  totalContent += makeProductSaleMark('', '所有门店', productSaleMoneyTotalMoney.toFixed(2), dateFormat("YYYY.mm.dd", whichDate()));
  totalContent += '\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 礼品包销售额
  totalContent += '> **' + businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.title + '**\n';
  /// 礼品包销售额-门店
  let giftpackageSaleMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + ' 元</font>\n';

    let storeMoney = parseFloat(store.money);
    giftpackageSaleMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + giftpackageSaleMoneyTotalMoney.toFixed(2) + ' 元</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 商品报损额
  totalContent += '> **' + businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.title + '**\n';
  /// 商品报损额-门店
  let productDiscardMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + ' 元</font>\n';
    totalContent += makeProductDiscardMark(store.userId, store.name, store.money, dateFormat("YYYY.mm.dd", whichDate()));
    totalContent += '\n';

    let storeMoney = parseFloat(store.money);
    productDiscardMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + productDiscardMoneyTotalMoney.toFixed(2) + ' 元</font>\n';
  totalContent += makeProductDiscardMark('', '所有门店', productDiscardMoneyTotalMoney.toFixed(2), dateFormat("YYYY.mm.dd", whichDate()));
  totalContent += '\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 会员充值情况
  totalContent += '**' + businessSummaryObj4workweixin.memberItem.title + '**\n';
  /// 会员充值额
  totalContent += '> **' + businessSummaryObj4workweixin.memberItem.rechargeMoney.title + '**\n';
  /// 商品销售额-门店
  let memberRechargeMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.memberItem.rechargeMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + ' 元</font>\n';

    let storeMoney = parseFloat(store.money);
    memberRechargeMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + memberRechargeMoneyTotalMoney.toFixed(2) + ' 元</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 会员消费额
  totalContent += '> **' + businessSummaryObj4workweixin.memberItem.consumeMoney.title + '**\n';
  /// 商品销售额-门店
  let memberConsumeMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.memberItem.consumeMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + ' 元</font>\n';

    let storeMoney = parseFloat(store.money);
    memberConsumeMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + memberConsumeMoneyTotalMoney.toFixed(2) + ' 元</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 新增会员数
  totalContent += '> **' + businessSummaryObj4workweixin.memberItem.newMember.title + '**\n';
  /// 新增会员数-门店
  let newMemberTotalCount = 0;
  businessSummaryObj4workweixin.memberItem.newMember.stores.forEach(store => {
    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.newMemberCount + ' 人</font>\n';

    let newMemberCount = parseFloat(store.newMemberCount);
    newMemberTotalCount += newMemberCount;
  });
  totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + newMemberTotalCount.toFixed(0) + ' 人</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 实收情况
  totalContent += '**' + businessSummaryObj4workweixin.actualIncomeItem.title + '**\n';
  // /// 现金实收
  // totalContent += '> **' + businessSummaryObj4workweixin.actualIncomeItem.cashpayMoney.title + '**\n';
  // /// 现金实收-门店
  // let cashpayMoneyTotal = 0;
  // businessSummaryObj4workweixin.actualIncomeItem.cashpayMoney.stores.forEach(store => {
  //   totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.cashpay + ' 元</font>\n';

  //   let cashpayMoney = parseFloat(store.cashpay);
  //   cashpayMoneyTotal += cashpayMoney;
  // });
  // totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + cashpayMoneyTotal.toFixed(2) + ' 元</font>\n';
  // totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  // /// 支付宝实收
  // totalContent += '> **' + businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney.title + '**\n';
  // /// 支付宝实收-门店
  // let weixinpayMoneyTotal = 0;
  // businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney.stores.forEach(store => {
  //   totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.weixinpay + ' 元</font>\n';

  //   let weixinpayMoney = parseFloat(store.weixinpay);
  //   weixinpayMoneyTotal += weixinpayMoney;
  // });
  // totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + weixinpayMoneyTotal.toFixed(2) + ' 元</font>\n';
  // totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  // /// 支付宝实收
  // totalContent += '> **' + businessSummaryObj4workweixin.actualIncomeItem.alipayMoney.title + '**\n';
  // /// 支付宝实收-门店
  // let alipayMoneyTotal = 0;
  // businessSummaryObj4workweixin.actualIncomeItem.alipayMoney.stores.forEach(store => {
  //   totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.alipay + ' 元</font>\n';

  //   let alipayMoney = parseFloat(store.alipay);
  //   alipayMoneyTotal += alipayMoney;
  // });
  // totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + alipayMoneyTotal.toFixed(2) + ' 元</font>\n';
  // totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 总实收
  totalContent += '> **' + businessSummaryObj4workweixin.actualIncomeItem.overviewMoney.title + '**\n';
  /// 总实收-门店
  let overviewMoneyTotal = 0;
  businessSummaryObj4workweixin.actualIncomeItem.overviewMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.overview + ' 元</font>\n';

    let overviewMoney = parseFloat(store.overview);
    overviewMoneyTotal += overviewMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"info\"> ' + overviewMoneyTotal.toFixed(2) + ' 元</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  return totalContent;
}

const makeProductSaleMark = (id, name, number, date) => {
  let productsaleurl = 'http://gratefulwheat.ruyue.xyz/productsale';
  productsaleurl += '?id=';
  productsaleurl += id;
  productsaleurl += '&name=';
  productsaleurl += name;
  productsaleurl += '&number=';
  productsaleurl += number;
  productsaleurl += '&date=';
  productsaleurl += date;
  return '> ' + '[热卖商品](' + productsaleurl + ')';
}

const makeProductDiscardMark = (id, name, number, date) => {
  let productdiscardurl = 'http://gratefulwheat.ruyue.xyz/discardsale';
  productdiscardurl += '?id=';
  productdiscardurl += id;
  productdiscardurl += '&name=';
  productdiscardurl += name;
  productdiscardurl += '&number=';
  productdiscardurl += number;
  productdiscardurl += '&date=';
  productdiscardurl += date;
  return '> ' + '[报损商品](' + productdiscardurl + ')';
}

const doSendToCompanyGroup = async (content) => {
  if (!KSendToWorkWeixin) return;

  let webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=24751d96-c739-4860-b8d1-6fe3da1a71f9'

  ///测试地址
  if (KForTest) webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=2b090cd9-9770-4f5a-a4fa-bc4d0f5f5d51';

  let message =
  {
    "msgtype": "markdown",
    "markdown": {
      "content": content
    }
  }

  await fetch(webhookUrl, {
    method: 'POST', body: JSON.stringify(message),
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

const dostartScheduleBusiness = async () => {
  /// 登录并获取验证信息
  const thePOSPALAUTH30220 = await siginAndGetPOSPALAUTH30220();
  /// 获取营业概况并解析
  const content = await getBusinessSummaryContent4WorkWeixin(thePOSPALAUTH30220);
  await doSendToCompanyGroup(content);
}

const startScheduleBusiness = async () => {
  // 秒、分、时、日、月、周几
  // 每日23点59分00秒自动发送
  try {
    if (KForTest) {
      await dostartScheduleBusiness();
    } else {
      schedule.scheduleJob('00 59 23 * * *', async () => {
        await dostartScheduleBusiness();
      });
    }
  } catch (e) {
    console.log('startScheduleBusiness e=' + e.toString());
  }
}

module.exports = startScheduleBusiness;
