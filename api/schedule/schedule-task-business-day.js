
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;
const moment = require('moment');
const {
  signIn
} = require('../third/pospal');
const {
  getAccessToken,
  getBillList,
  parseBillList
} = require('../third/weixin');

/**--------------------配置信息--------------------*/
const KForTest = false;
const KSendToWorkWeixin = true;
/// 增加门店这里添加一下
KShopHeadUserId = '3995763'; // 总部账号
const KShopArray = [
  { index: 0, name: '总部', userId: KShopHeadUserId },
  { index: 1, name: '教育局店', userId: '3995767' },
  { index: 2, name: '旧镇店', userId: '3995771' },
  { index: 3, name: '江滨店', userId: '4061089' },
  { index: 4, name: '汤泉世纪店', userId: '4061092' },
  { index: 5, name: '假日店', userId: '4339546' },
  { index: 6, name: '狮头店', userId: '4359267' },
  { index: 7, name: '盘陀店', userId: '4382444' }
];
const KReportWebhookUrl =
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=24751d96-c739-4860-b8d1-6fe3da1a71f9';
const KReportWebhookUrl4Test =
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=2b090cd9-9770-4f5a-a4fa-bc4d0f5f5d51';
let beginDateMoment;
let endDateMoment;

/**--------------------配置信息--------------------*/
const startScheduleBusiness = async () => {
  // 秒、分、时、日、月、周几
  // 每日0点1分0秒自动发送
  try {
    if (KForTest) {
      beginDateMoment = moment().startOf('day');
      endDateMoment = moment().endOf('day');
      await dostartScheduleBusiness();
    } else {
      schedule.scheduleJob('0 1 0 * * *', async () => {
        beginDateMoment = moment().subtract(1, 'days').startOf('day');
        endDateMoment = moment().subtract(1, 'days').endOf('day');
        await dostartScheduleBusiness();
      });
    }
  } catch (e) {
    console.log('startScheduleBusiness e=' + e.toString());
  }
}

const dostartScheduleBusiness = async () => {
  let businessSummaryObj4workweixin = {};

  /// 登录并获取验证信息
  const thePOSPALAUTH30220 = await signIn();
  /// 获取营业概况并解析
  businessSummaryObj4workweixin = await getBusinessSummaryObj4workweixin(thePOSPALAUTH30220);
  await buildProductSaleString4WorkweixinAndSend(businessSummaryObj4workweixin);
  await buildCouponString4WorkweixinAndSend(businessSummaryObj4workweixin);
  await buildMemberString4WorkweixinAndSend(businessSummaryObj4workweixin);
  await buildActualIncomeString4WorkweixinAndSend(businessSummaryObj4workweixin);

  /// 对外收款：企业微信对外收款
  // await appendWeixinPaymentInItem(businessSummaryObj4workweixin);
  // await buildExternalIncomeString4WorkweixinAndSend(businessSummaryObj4workweixin);
}

const getBusinessSummaryObj4workweixin = async (thePOSPALAUTH30220) => {
  const businessSummaryObjArray = [];
  for (shop of KShopArray) {
    const businessSummaryObj = await getBusinessSummaryByUserIdAndParse(thePOSPALAUTH30220, shop.userId);

    let discardObj = await getDiscardInventoryAndParse(thePOSPALAUTH30220, shop.userId);
    businessSummaryObj.productDiscardObj = discardObj;

    let newMemberObj = await getNewMemberCountByUserIdAndParse(thePOSPALAUTH30220, shop.userId);
    businessSummaryObj.newMemberObj = newMemberObj;

    let couponObj = await getCouponByUserIdAndParse(thePOSPALAUTH30220, shop.userId);
    businessSummaryObj.couponObj = couponObj;

    businessSummaryObj.shop = shop;
    businessSummaryObjArray.push(businessSummaryObj);
  }
  // console.log(businessSummaryObjArray);

  const businessSummaryObj4workweixin = parseBusinessSummaryArray(businessSummaryObjArray);
  return businessSummaryObj4workweixin;
}

const appendWeixinPaymentInItem = async (businessSummaryObj4workweixin) => {
  let beginToEndDay = beginDateMoment.format('YYYY.MM.DD')
    + '~' + endDateMoment.format('YYYY.MM.DD');
  businessSummaryObj4workweixin.ExternalReceivePaymentItem = {};
  businessSummaryObj4workweixin.ExternalReceivePaymentItem.title = beginToEndDay + '\n对外收款情况';
  businessSummaryObj4workweixin.ExternalReceivePaymentItem.weixinPayment = {};
  businessSummaryObj4workweixin.ExternalReceivePaymentItem.weixinPayment.title = '微信对外收款'
  businessSummaryObj4workweixin.ExternalReceivePaymentItem.weixinPayment.stores = [];

  const accessToken = await getAccessToken('0SWXfor_2ht9LxJ4Bl_vPc3avt__V58cllO3vHEsPHY');
  const getBillListResponseJson = await getBillList(accessToken, beginDateMoment.unix(), endDateMoment.unix());
  const inAndOutComeFromWorkWX = await parseBillList(getBillListResponseJson);
  // console.log('inAndOutComeFromWorkWX = ' + inAndOutComeFromWorkWX);

  let weixinPaymentInItem = {};
  weixinPaymentInItem.name = '收款';
  weixinPaymentInItem.fee = inAndOutComeFromWorkWX[0];
  weixinPaymentInItem.feeFinal = inAndOutComeFromWorkWX[0] * (1 - 0.003);
  businessSummaryObj4workweixin.ExternalReceivePaymentItem.weixinPayment.stores.push(weixinPaymentInItem);
  let weixinPaymentOutItem = {};
  weixinPaymentOutItem.name = '退款';
  weixinPaymentOutItem.fee = -(inAndOutComeFromWorkWX[1]);
  weixinPaymentOutItem.feeFinal = -(inAndOutComeFromWorkWX[1] * (1 - 0.003));
  businessSummaryObj4workweixin.ExternalReceivePaymentItem.weixinPayment.stores.push(weixinPaymentOutItem);
}

const buildProductSaleString4WorkweixinAndSend = async (businessSummaryObj4workweixin) => {
  let totalContent = '';
  let beginDateTime = escape(beginDateMoment.format('YYYY.MM.DD+HH:mm:ss'));
  let endDateTime = escape(endDateMoment.format('YYYY.MM.DD+HH:mm:ss'));

  /*-------------------------*/
  /// 商品销售情况
  totalContent += '**' + businessSummaryObj4workweixin.productSaleItem.title + '**\n';
  /// 商品销售额
  totalContent += '> **' + businessSummaryObj4workweixin.productSaleItem.productSaleMoney.title + '(元)**\n';
  /// 商品销售额-门店
  let productSaleMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.productSaleItem.productSaleMoney.stores.forEach(store => {
    if (store.userId === KShopHeadUserId) return;

    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + '</font>\n';
    // totalContent += makeProductSaleMark(store.userId, beginDateTime, endDateTime);
    // totalContent += '\n';

    let storeMoney = parseFloat(store.money);
    productSaleMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"warning\"> ' + productSaleMoneyTotalMoney.toFixed(2) + '</font>\n';
  totalContent += makeProductSaleMark('', beginDateTime, endDateTime);
  totalContent += '\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 礼品包销售额
  let totalContent4giftpackageSaleMoney = '';
  totalContent4giftpackageSaleMoney += '> **' + businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.title + '(元)**\n';
  /// 礼品包销售额-门店
  let giftpackageSaleMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.stores.forEach(store => {
    totalContent4giftpackageSaleMoney += '> ' + store.name + ':<font color=\"info\"> ' + parseFloat(store.money).toFixed(2) + '</font>\n';

    let storeMoney = parseFloat(store.money);
    giftpackageSaleMoneyTotalMoney += storeMoney;
  });
  totalContent4giftpackageSaleMoney += '> ' + '总计' + ':<font color=\"warning\"> ' + giftpackageSaleMoneyTotalMoney.toFixed(2) + '</font>\n';
  totalContent4giftpackageSaleMoney += '\n';

  /// 只有总计有金额才显示，否则不显示礼品包条目
  if (giftpackageSaleMoneyTotalMoney > 0) {
    totalContent += totalContent4giftpackageSaleMoney;
  }
  /*-------------------------*/

  /*-------------------------*/
  /// 预定金
  let totalContent4earnestMoney = '';
  totalContent4earnestMoney += '> **' + businessSummaryObj4workweixin.productSaleItem.earnestMoney.title + '(元)**\n';
  /// 预定金-门店
  let earnestMoneyTotalMoney = 0;
  let earnestOrderTotalNumber = 0;
  businessSummaryObj4workweixin.productSaleItem.earnestMoney.stores.forEach(store => {
    totalContent4earnestMoney += '> ' + store.name +
      ':<font color=\"info\"> ' +
      parseFloat(store.money).toFixed(2) +
      '</font>' +
      ' <font color=\"comment\"> ' +
      parseFloat(store.numberOfOrder).toFixed(0) +
      '单</font>\n';

    let storeMoney = parseFloat(store.money);
    earnestMoneyTotalMoney += storeMoney;
    let numberOfOrder = parseFloat(store.numberOfOrder);
    earnestOrderTotalNumber += numberOfOrder;
  });
  totalContent4earnestMoney += '> ' + '总计' +
    ':<font color=\"warning\"> ' +
    earnestMoneyTotalMoney.toFixed(2) +
    '</font>' +
    ' <font color=\"comment\"> ' +
    earnestOrderTotalNumber.toFixed(0) +
    '单</font>\n';
  totalContent4earnestMoney += '\n';

  /// 只有总计有金额才显示，否则不显示预定金条目
  if (earnestMoneyTotalMoney > 0) {
    totalContent += totalContent4earnestMoney;
  }
  /*-------------------------*/

  /*-------------------------*/
  /// 商品报损额
  totalContent += '> **' + businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.title + '(元)**\n';
  /// 商品报损额-门店
  let productDiscardMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.stores.forEach(store => {
    if (store.userId === KShopHeadUserId) return;

    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + '</font>\n';
    // totalContent += makeProductDiscardMark(store.userId, beginDateTime, endDateTime);
    // totalContent += makeProductSaleAndDiscardMark(store.userId, beginDateTime, endDateTime);
    // totalContent += '\n';

    let storeMoney = parseFloat(store.money);
    productDiscardMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"warning\"> ' + productDiscardMoneyTotalMoney.toFixed(2) + '</font>\n';
  totalContent += makeProductDiscardMark('', beginDateTime, endDateTime);
  totalContent += makeProductSaleAndDiscardMark('', beginDateTime, endDateTime);
  totalContent += '\n';
  totalContent += '\n';
  /*-------------------------*/
  if (KForTest) console.log(totalContent);
  await doSendToCompanyGroup(totalContent);
}

const buildCouponString4WorkweixinAndSend = async (businessSummaryObj4workweixin) => {
  let totalContent = '';
  let beginDateTime = escape(beginDateMoment.format('YYYY.MM.DD+HH:mm:ss'));
  let endDateTime = escape(endDateMoment.format('YYYY.MM.DD+HH:mm:ss'));

  /*-------------------------*/
  /// 商品销售情况
  totalContent += '**' + businessSummaryObj4workweixin.couponItem.title + '**\n';
  /// 商品销售额
  totalContent += '> **' + businessSummaryObj4workweixin.couponItem.couponMoney.title + '(元)**\n';
  /// 商品销售额-门店
  let couponMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.couponItem.couponMoney.stores.forEach(store => {
    if (store.userId === KShopHeadUserId) return;

    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + '</font>\n';
    // totalContent += makeCouponSummaryMark(store.userId, beginDateTime, endDateTime);
    // totalContent += '\n';

    let storeMoney = parseFloat(store.money);
    couponMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"warning\"> ' + couponMoneyTotalMoney.toFixed(2) + '</font>\n';
  totalContent += makeCouponSummaryMark('', beginDateTime, endDateTime);
  totalContent += '\n';
  totalContent += '\n';
  /*-------------------------*/

  if (KForTest) console.log(totalContent);
  await doSendToCompanyGroup(totalContent);
}

const buildMemberString4WorkweixinAndSend = async (businessSummaryObj4workweixin) => {
  let totalContent = '';
  /*-------------------------*/
  /// 会员充值情况
  totalContent += '**' + businessSummaryObj4workweixin.memberItem.title + '**\n';
  /// 会员充值额
  totalContent += '> **' + businessSummaryObj4workweixin.memberItem.rechargeMoney.title + '(元)**\n';
  /// 商品销售额-门店
  let memberRechargeActualMoneyTotalMoney = 0;
  let memberRechargePresentMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.memberItem.rechargeMoney.stores.forEach(store => {
    totalContent += '> ' + store.name +
      ':\n<font color=\"info\">' +
      '充:' + store.actualmoney +
      '+赠:' + store.presentmoney +
      '</font>\n';

    let storeActualMoney = parseFloat(store.actualmoney);
    let storePresentMoney = parseFloat(store.presentmoney);
    memberRechargeActualMoneyTotalMoney += storeActualMoney;
    memberRechargePresentMoneyTotalMoney += storePresentMoney;
  });
  totalContent += '> ' + '总计' +
    ':\n<font color=\"warning\">' +
    '充:' + memberRechargeActualMoneyTotalMoney.toFixed(2) +
    '+赠:' + memberRechargePresentMoneyTotalMoney.toFixed(2) +
    '</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 会员消费额
  totalContent += '> **' + businessSummaryObj4workweixin.memberItem.consumeMoney.title + '(元)**\n';
  /// 会员消费额-门店
  let memberConsumeMoneyTotalMoney = 0;
  businessSummaryObj4workweixin.memberItem.consumeMoney.stores.forEach(store => {
    if (store.userId === KShopHeadUserId) return;

    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.money + '</font>\n';

    let storeMoney = parseFloat(store.money);
    memberConsumeMoneyTotalMoney += storeMoney;
  });
  totalContent += '> ' + '总计' + ':<font color=\"warning\"> ' + memberConsumeMoneyTotalMoney.toFixed(2) + '</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 新增会员数
  totalContent += '> **' + businessSummaryObj4workweixin.memberItem.newMember.title + '(人)**\n';
  /// 新增会员数-门店
  let newMemberTotalCount = 0;
  businessSummaryObj4workweixin.memberItem.newMember.stores.forEach(store => {
    totalContent += '> ' + store.name + ':<font color=\"info\"> ' + store.newMemberCount + '</font>\n';

    let newMemberCount = parseFloat(store.newMemberCount);
    newMemberTotalCount += newMemberCount;
  });
  totalContent += '> ' + '总计' + ':<font color=\"warning\"> ' + newMemberTotalCount.toFixed(0) + '</font>\n';
  totalContent += '\n';
  /*-------------------------*/
  if (KForTest) console.log(totalContent);
  await doSendToCompanyGroup(totalContent);
}

const buildActualIncomeString4WorkweixinAndSend = async (businessSummaryObj4workweixin) => {
  let totalContent = '';
  /*-------------------------*/
  /// 实收情况
  totalContent += '**' + businessSummaryObj4workweixin.actualIncomeItem.title + '**\n';
  /// 现金实收
  totalContent += '> **' + businessSummaryObj4workweixin.actualIncomeItem.cashpayMoney.title + '(元|费率:无)**\n';
  /// 现金实收-门店
  let cashpayMoneyTotal = 0;
  businessSummaryObj4workweixin.actualIncomeItem.cashpayMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':\n<font color=\"info\">' + '实:' + store.cashpay + '</font>\n';

    let cashpayMoney = parseFloat(store.cashpay);
    cashpayMoneyTotal += cashpayMoney;
  });
  totalContent += '> ' + '总计' + ':\n<font color=\"warning\">' + '实:' + cashpayMoneyTotal.toFixed(2) + '</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 微信实收
  totalContent += '> **' + businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney.title + '(元|费率:0.3%)**\n';
  /// 微信实收-门店
  let weixinpayMoneyTotal = 0;
  let weixinpayMoneyTotalFinal = 0;
  businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':\n<font color=\"info\">' +
      '虚:' + store.weixinpay + ' ' +
      '实:' + store.weixinpayFinal +
      '</font>\n';
    let weixinpayMoney = parseFloat(store.weixinpay);
    weixinpayMoneyTotal += weixinpayMoney;
    let weixinpayMoneyFinal = parseFloat(store.weixinpayFinal);
    weixinpayMoneyTotalFinal += weixinpayMoneyFinal;
  });
  totalContent += '> ' + '总计' + ':\n<font color=\"warning\">' +
    '虚:' + weixinpayMoneyTotal.toFixed(2) + ' ' +
    '实:' + weixinpayMoneyTotalFinal.toFixed(2) +
    '</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 支付宝实收
  totalContent += '> **' + businessSummaryObj4workweixin.actualIncomeItem.alipayMoney.title + '(元|费率:0.38%)**\n';
  /// 支付宝实收-门店
  let alipayMoneyTotal = 0;
  let alipayMoneyTotalFinal = 0;
  businessSummaryObj4workweixin.actualIncomeItem.alipayMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':\n<font color=\"info\">' +
      '虚:' + store.alipay + ' ' +
      '实:' + store.alipayFinal +
      '</font>\n';
    let alipayMoney = parseFloat(store.alipay);
    alipayMoneyTotal += alipayMoney;
    let alipayMoneyFinal = parseFloat(store.alipayFinal);
    alipayMoneyTotalFinal += alipayMoneyFinal;
  });
  totalContent += '> ' + '总计' + ':\n<font color=\"warning\">' +
    '虚:' + alipayMoneyTotal.toFixed(2) + ' ' +
    '实:' + alipayMoneyTotalFinal.toFixed(2) +
    '</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  /*-------------------------*/
  /// 总实收
  totalContent += '> **' + businessSummaryObj4workweixin.actualIncomeItem.overviewMoney.title + '(元)**\n';
  /// 总实收-门店
  let overviewMoneyTotal = 0;
  let overviewMoneyTotalFinal = 0;
  businessSummaryObj4workweixin.actualIncomeItem.overviewMoney.stores.forEach(store => {
    totalContent += '> ' + store.name + ':\n<font color=\"info\">' +
      '虚:' + store.overview + ' ' +
      '实:' + store.overviewFinal +
      '</font>\n';

    let overviewMoney = parseFloat(store.overview);
    overviewMoneyTotal += overviewMoney;

    let overviewMoneyFinal = parseFloat(store.overviewFinal);
    overviewMoneyTotalFinal += overviewMoneyFinal;
  });
  totalContent += '> ' + '总计' + ':\n<font color=\"warning\">' +
    '虚:' + overviewMoneyTotal.toFixed(2) + ' ' +
    '实:' + overviewMoneyTotalFinal.toFixed(2) +
    '</font>\n';
  totalContent += '\n';
  /*-------------------------*/
  if (KForTest) console.log(totalContent);
  await doSendToCompanyGroup(totalContent);
}

const buildExternalIncomeString4WorkweixinAndSend = async (businessSummaryObj4workweixin) => {
  let totalContent = '';
  /*-------------------------*/
  /// 对外收款情况
  totalContent += '**' + businessSummaryObj4workweixin.ExternalReceivePaymentItem.title + '**\n';
  /// 微信对外收款
  totalContent += '> **' + businessSummaryObj4workweixin.ExternalReceivePaymentItem.weixinPayment.title + '(元|费率:0.3%)**\n';
  let externalReceivePaymentTotal = 0;
  let externalReceivePaymentTotalFinal = 0;
  businessSummaryObj4workweixin.ExternalReceivePaymentItem.weixinPayment.stores.forEach(store => {
    let floatFee = store.fee / 100;
    let floatFeeFinal = store.feeFinal / 100;
    totalContent += '> ' + store.name + ':\n<font color=\"info\">' +
      '虚:' + floatFee.toFixed(2) + ' ' +
      '实' + floatFeeFinal.toFixed(2) +
      '</font>\n';

    let weixinFee = parseFloat(floatFee);
    externalReceivePaymentTotal += weixinFee;
    let weixinFeeFinal = parseFloat(floatFeeFinal);
    externalReceivePaymentTotalFinal += weixinFeeFinal;
  });
  totalContent += '> ' + '总计' + ':\n<font color=\"warning\">' +
    '虚:' + externalReceivePaymentTotal.toFixed(2) + ' ' +
    '实:' + externalReceivePaymentTotalFinal.toFixed(2) +
    '</font>\n';
  totalContent += '\n';
  /*-------------------------*/

  if (KForTest) console.log(totalContent);
  await doSendToCompanyGroup(totalContent);
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
  discardInventoryBodyStr += '&beginDateTime=';
  discardInventoryBodyStr += escape(beginDateMoment.format('YYYY.MM.DD+HH:mm:ss'));
  discardInventoryBodyStr += '&endDateTime=';
  discardInventoryBodyStr += escape(endDateMoment.format('YYYY.MM.DD+HH:mm:ss'));

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
  newCustomerSummaryBodyStr += '&beginDateTime=';
  newCustomerSummaryBodyStr += beginDateMoment.format('YYYY-MM-DD');
  newCustomerSummaryBodyStr += '&endDateTime=';
  newCustomerSummaryBodyStr += endDateMoment.format('YYYY-MM-DD');

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

const getCouponByUserIdAndParse = async (thePOSPALAUTH30220, userId) => {
  let couponResponseJson = await getCouponByUserId(thePOSPALAUTH30220, userId);
  let couponObj = await parseCoupon(couponResponseJson);
  return couponObj;
}

const getCouponByUserId = async (thePOSPALAUTH30220, userId) => {
  let getCouponUrl = 'https://beta33.pospal.cn/Promotion/LoadCouponSummary';

  let getCouponBodyStr = 'userIds%5B%5D=' + userId;
  getCouponBodyStr += '&beginDateTime=';
  getCouponBodyStr += escape(beginDateMoment.format('YYYY.MM.DD+HH:mm:ss'));
  getCouponBodyStr += '&endDateTime=';
  getCouponBodyStr += escape(endDateMoment.format('YYYY.MM.DD+HH:mm:ss'));
  getCouponBodyStr += '&queryType=1';
  getCouponBodyStr += '&promotionCouponType=';
  getCouponBodyStr += '&salable=';

  const couponResponse = await fetch(getCouponUrl, {
    method: 'POST', body: getCouponBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });

  const couponResponseJson = await couponResponse.json();
  return couponResponseJson;
}

const parseCoupon = async (couponResponseJson) => {
  let couponObj = {};
  let totalCount = 0; // 0为无核销

  if (couponResponseJson.successed) {
    let view = couponResponseJson.contentView;
    // console.log(view);

    var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + view + '</root>';
    try {
      let result = await parseStringPromise(xml);
      if (result) {
        let trArray = result.root.tbody[0].tr;
        for (let index = 0; index < trArray.length; ++index) {
          let writeOffMoney = trArray[index].td[9]._;
          totalCount += parseFloat(writeOffMoney);
        }
        totalCount = totalCount.toFixed(2);
        // console.log(totalCount);
      }
    } catch (e) {
      // console.log('没有报损数据，解析出错');
    }
  }

  /// 总计
  couponObj.overview = totalCount;
  return couponObj;
};

const getBusinessSummaryByUserId = async (thePOSPALAUTH30220, userId) => {
  let businessSummary = 'https://beta33.pospal.cn/Report/LoadBusinessSummaryV2';

  /// userIds%5B%5D=3995763&beginDateTime=2020.10.03+00%3A00%3A00&endDateTime=2020.10.03+23%3A59%3A59
  let businessSummaryBodyStr = '';
  businessSummaryBodyStr += 'userIds%5B%5D=';
  businessSummaryBodyStr += userId;
  businessSummaryBodyStr += '&beginDateTime=';
  businessSummaryBodyStr += escape(beginDateMoment.format('YYYY.MM.DD+HH:mm:ss'));
  businessSummaryBodyStr += '&endDateTime=';
  businessSummaryBodyStr += escape(endDateMoment.format('YYYY.MM.DD+HH:mm:ss'));

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

  businessSummaryObj.earnestObj = {};
  businessSummaryObj.earnestObj.overview = '';
  businessSummaryObj.earnestObj.cashpay = '';
  businessSummaryObj.earnestObj.alipay = '';
  businessSummaryObj.earnestObj.weixinpay = '';
  businessSummaryObj.earnestObj.cardpay = '';

  businessSummaryObj.memberRechargeObj = {};
  businessSummaryObj.memberRechargeObj.overview = {};
  businessSummaryObj.memberRechargeObj.overview.actual = '';// 充值实际金额
  businessSummaryObj.memberRechargeObj.overview.present = '';// 充值赠送金额
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
      let earnestItem = trArray[columnEarnestIndex];
      // console.log(earnestItem);
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
        let earnestItemOverview = earnestItem.td[rowOverviewIndex].span[0]._.trim();
        businessSummaryObj.earnestObj.overview = earnestItemOverview;
        // console.log(earnestItemOverview);
        let earnestItemNumberOfOrder = earnestItem.td[rowOverviewIndex].span[1];
        businessSummaryObj.earnestObj.numberOfOrder = earnestItemNumberOfOrder;
        // console.log(earnestItemNumberOfOrder);
        let memberRechargeOverviewActual = memberRechargeItem.td[rowOverviewIndex].span[0]._.trim();
        businessSummaryObj.memberRechargeObj.overview.actual = memberRechargeOverviewActual;
        let memberRechargeOverviewPresent = memberRechargeItem.td[rowOverviewIndex].span[1]._.trim();
        businessSummaryObj.memberRechargeObj.overview.present = memberRechargeOverviewPresent;
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
        let actualIncomeWeixinpay = actualIncomeItem.td[rowWeixinpayIndex]._.trim();
        businessSummaryObj.actualIncomeObj.weixinpay = actualIncomeWeixinpay;
        // console.log(actualIncomeWeixinpay);
      }

      if (rowCardpayIndex !== -1) {
        let productSaleCardpay = productSaleItem.td[rowCardpayIndex].span[0]._.trim();
        businessSummaryObj.productSaleObj.cardpay = productSaleCardpay;
        // console.log(productSaleCardpay);
        let memberRechargeCardpay = '0';
        if (memberRechargeItem.td[rowCardpayIndex].span) {
          memberRechargeCardpay = memberRechargeItem.td[rowCardpayIndex].span[0]._.trim();
        }

        businessSummaryObj.memberRechargeObj.cardpay = memberRechargeCardpay;
        // console.log(memberRechargeCardpay);
      }


      /**
       *  总营业实收如果直接获取表格的营业实收字段，
       *  会包含券的支付方式，这里修正为：现金 + 微信 + 支付宝
       */
      let actualIncomeCashpay = 0;
      if (businessSummaryObj.actualIncomeObj.cashpay !== '') {
        actualIncomeCashpay = parseFloat(businessSummaryObj.actualIncomeObj.cashpay);
      }
      let actualIncomeAlipay = 0;
      let actualIncomeAlipayFinal = 0;
      if (businessSummaryObj.actualIncomeObj.alipay !== '') {
        actualIncomeAlipay = parseFloat(businessSummaryObj.actualIncomeObj.alipay);
        actualIncomeAlipayFinal = actualIncomeAlipay * (1 - 0.0038);
        businessSummaryObj.actualIncomeObj.alipayFinal = actualIncomeAlipayFinal.toFixed(2);
      }
      let actualIncomeWeixinpay = 0;
      let actualIncomeWeixinpayFinal = 0;
      if (businessSummaryObj.actualIncomeObj.weixinpay !== '') {
        actualIncomeWeixinpay = parseFloat(businessSummaryObj.actualIncomeObj.weixinpay);
        actualIncomeWeixinpayFinal = actualIncomeWeixinpay * (1 - 0.003);
        businessSummaryObj.actualIncomeObj.weixinpayFinal = actualIncomeWeixinpayFinal.toFixed(2);
      }
      let actualIncomeOverview = actualIncomeCashpay + actualIncomeAlipay + actualIncomeWeixinpay;
      businessSummaryObj.actualIncomeObj.overview = actualIncomeOverview.toFixed(2);
      let actualIncomeOverviewFinal = actualIncomeCashpay +
        actualIncomeAlipayFinal + actualIncomeWeixinpayFinal;
      businessSummaryObj.actualIncomeObj.overviewFinal = actualIncomeOverviewFinal.toFixed(2);
    }
  } catch (e) {
    console.log('解析businessSummary出错 e = ' + e);
  }

  return businessSummaryObj;
};

const parseBusinessSummaryArray = (businessSummaryObjArray) => {
  let beginToEndDay = beginDateMoment.format('YYYY.MM.DD')
    + '~' + endDateMoment.format('YYYY.MM.DD')

  let businessSummaryObj4workweixin = {};

  businessSummaryObj4workweixin.productSaleItem = {};
  businessSummaryObj4workweixin.productSaleItem.title = beginToEndDay + '\n商品销售情况';

  businessSummaryObj4workweixin.productSaleItem.productSaleMoney = {};
  businessSummaryObj4workweixin.productSaleItem.productSaleMoney.title = '商品销售额';
  businessSummaryObj4workweixin.productSaleItem.productSaleMoney.stores = [];

  businessSummaryObj4workweixin.productSaleItem.productDiscardMoney = {};
  businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.title = '商品报损额';
  businessSummaryObj4workweixin.productSaleItem.productDiscardMoney.stores = [];

  businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney = {};
  businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.title = '礼品包销售额';
  businessSummaryObj4workweixin.productSaleItem.giftpackageSaleMoney.stores = [];

  businessSummaryObj4workweixin.productSaleItem.earnestMoney = {};
  businessSummaryObj4workweixin.productSaleItem.earnestMoney.title = '预定金';
  businessSummaryObj4workweixin.productSaleItem.earnestMoney.stores = [];

  businessSummaryObj4workweixin.couponItem = {};
  businessSummaryObj4workweixin.couponItem.title = beginToEndDay + '\n优惠劵情况';

  businessSummaryObj4workweixin.couponItem.couponMoney = {};
  businessSummaryObj4workweixin.couponItem.couponMoney.title = '优惠劵核销额';
  businessSummaryObj4workweixin.couponItem.couponMoney.stores = [];

  businessSummaryObj4workweixin.memberItem = {};
  businessSummaryObj4workweixin.memberItem.title = beginToEndDay + '\n会员动态情况';

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
  businessSummaryObj4workweixin.actualIncomeItem.title = beginToEndDay + '\n营业实收情况';

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

    let earnestObj = businessSummaryObj.earnestObj;
    let earnestObjOverview = earnestObj.overview;
    let earnestObjNumberOfOrder = earnestObj.numberOfOrder;
    let store4Earnest = {};
    store4Earnest.name = businessSummaryObj.shop.name;
    store4Earnest.userId = businessSummaryObj.shop.userId;
    store4Earnest.money = earnestObjOverview ? earnestObjOverview : '0.00';
    store4Earnest.numberOfOrder = earnestObjNumberOfOrder ? earnestObjNumberOfOrder : '0.00';
    businessSummaryObj4workweixin.productSaleItem.earnestMoney.stores.push(store4Earnest);

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

    let couponObj = businessSummaryObj.couponObj;
    let couponOverview = couponObj.overview;
    let store4coupon = {};
    store4coupon.name = businessSummaryObj.shop.name;
    store4coupon.userId = businessSummaryObj.shop.userId;
    store4coupon.money = couponOverview ? couponOverview : '0.00';
    businessSummaryObj4workweixin.couponItem.couponMoney.stores.push(store4coupon);

    let memberRechargeObj = businessSummaryObj.memberRechargeObj;
    let memberRechargeOverviewActual = memberRechargeObj.overview.actual;
    let memberRechargeOverviewPresent = memberRechargeObj.overview.present;
    let store4MemberRecharge = {};
    store4MemberRecharge.name = businessSummaryObj.shop.name;
    store4MemberRecharge.userId = businessSummaryObj.shop.userId;
    store4MemberRecharge.actualmoney = memberRechargeOverviewActual ? memberRechargeOverviewActual : '0.00';
    store4MemberRecharge.presentmoney = memberRechargeOverviewPresent ? memberRechargeOverviewPresent : '0.00';
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
    let actualIncomeWeixinpayFinal = actualIncomeObj.weixinpayFinal;
    let store4ActualIncomeWeixinpay = {};
    store4ActualIncomeWeixinpay.name = businessSummaryObj.shop.name;
    store4ActualIncomeWeixinpay.userId = businessSummaryObj.shop.userId;
    store4ActualIncomeWeixinpay.weixinpay = actualIncomeWeixinpay ? actualIncomeWeixinpay : '0.00';
    store4ActualIncomeWeixinpay.weixinpayFinal = actualIncomeWeixinpayFinal ? actualIncomeWeixinpayFinal : '0.00';
    businessSummaryObj4workweixin.actualIncomeItem.weixinpayMoney.stores.push(store4ActualIncomeWeixinpay);

    let actualIncomeAlipay = actualIncomeObj.alipay;
    let actualIncomeAlipayFinal = actualIncomeObj.alipayFinal;
    let store4ActualIncomeAlipay = {};
    store4ActualIncomeAlipay.name = businessSummaryObj.shop.name;
    store4ActualIncomeAlipay.userId = businessSummaryObj.shop.userId;
    store4ActualIncomeAlipay.alipay = actualIncomeAlipay ? actualIncomeAlipay : '0.00';
    store4ActualIncomeAlipay.alipayFinal = actualIncomeAlipayFinal ? actualIncomeAlipayFinal : '0.00';
    businessSummaryObj4workweixin.actualIncomeItem.alipayMoney.stores.push(store4ActualIncomeAlipay);

    let actualIncomeOverview = actualIncomeObj.overview;
    let actualIncomeOverviewFinal = actualIncomeObj.overviewFinal;
    let store4ActualIncomeOverview = {};
    store4ActualIncomeOverview.name = businessSummaryObj.shop.name;
    store4ActualIncomeOverview.userId = businessSummaryObj.shop.userId;
    store4ActualIncomeOverview.overview = actualIncomeOverview ? actualIncomeOverview : '0.00';
    store4ActualIncomeOverview.overviewFinal = actualIncomeOverviewFinal ? actualIncomeOverviewFinal : '0.00';
    businessSummaryObj4workweixin.actualIncomeItem.overviewMoney.stores.push(store4ActualIncomeOverview);
  });

  // console.log(JSON.stringify(businessSummaryObj4workweixin));
  return businessSummaryObj4workweixin;
}

const makeProductSaleMark = (id, beginDateTime, endDateTime) => {
  let productsaleurl = 'http://gratefulwheat.ruyue.xyz/productsale';
  if (KForTest) productsaleurl = 'http://localhost:4000/productsale';
  productsaleurl += '?id=';
  productsaleurl += id;
  productsaleurl += '&beginDateTime=';
  productsaleurl += beginDateTime;
  productsaleurl += '&endDateTime=';
  productsaleurl += endDateTime;
  return '> ' + '[热卖商品](' + productsaleurl + ')';
}

const makeProductDiscardMark = (id, beginDateTime, endDateTime) => {
  let productdiscardurl = 'http://gratefulwheat.ruyue.xyz/discardsale';
  if (KForTest) productdiscardurl = 'http://localhost:4000/discardsale';
  productdiscardurl += '?id=';
  productdiscardurl += id;
  productdiscardurl += '&beginDateTime=';
  productdiscardurl += beginDateTime;
  productdiscardurl += '&endDateTime=';
  productdiscardurl += endDateTime;
  return '> ' + '[报损](' + productdiscardurl + ')';
}

const makeProductSaleAndDiscardMark = (id, beginDateTime, endDateTime) => {
  let productsaleanddiscardurl = 'http://gratefulwheat.ruyue.xyz/productsaleanddiscard';
  if (KForTest) productsaleanddiscardurl = 'http://localhost:4000/productsaleanddiscard';
  productsaleanddiscardurl += '?id=';
  productsaleanddiscardurl += id;
  productsaleanddiscardurl += '&beginDateTime=';
  productsaleanddiscardurl += beginDateTime;
  productsaleanddiscardurl += '&endDateTime=';
  productsaleanddiscardurl += endDateTime;
  return '  |  ' + '[报损率](' + productsaleanddiscardurl + ')';
}

const makeCouponSummaryMark = (id, beginDateTime, endDateTime) => {
  let couponsummaryurl = 'http://gratefulwheat.ruyue.xyz/couponsummary';
  if (KForTest) couponsummaryurl = 'http://localhost:4000/couponsummary';
  couponsummaryurl += '?id=';
  couponsummaryurl += id;
  couponsummaryurl += '&beginDateTime=';
  couponsummaryurl += beginDateTime;
  couponsummaryurl += '&endDateTime=';
  couponsummaryurl += endDateTime;
  return '> ' + '[优惠劵核销](' + couponsummaryurl + ')';
}

const doSendToCompanyGroup = async (content) => {
  if (!KSendToWorkWeixin) return;

  let webhookUrl = KReportWebhookUrl;
  ///测试地址
  if (KForTest) webhookUrl = KReportWebhookUrl4Test;

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

module.exports = startScheduleBusiness;
