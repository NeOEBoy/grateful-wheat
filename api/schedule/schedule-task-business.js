
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;
const dateFormat = require('../util/date-util').dateFormat;

/**--------------------配置信息--------------------*/
const KForTest = false;

/// 增加门店这里添加一下
const KShopArray = [
  { index: 0, name: '公众号', userId: '3995763' },
  { index: 1, name: '教育局', userId: '3995767' },
  { index: 2, name: '旧镇', userId: '3995771' },
  { index: 3, name: '江滨', userId: '4061089' },
  { index: 4, name: '汤泉世纪', userId: '4061092' }
];
/// 注意，如果后台增加支付方式，务必这里添加一下，否则金额会不正确
let KPaymethodsJson = [
  { "showName": "现金支付", "isCustom": false },
  { "showName": "银联支付", "isCustom": false },
  { "showName": "支付宝支付", "isCustom": false },
  { "showName": "微信支付", "isCustom": false },
  { "showName": "卡对卡充值", "isCustom": false },
  { "showName": "储值卡支付", "isCustom": false },
  { "showName": "10通用劵", "isCustom": true },
  { "showName": "20通用劵", "isCustom": true },
  { "showName": "88DIY", "isCustom": true },
  { "showName": "38蛋糕抵用", "isCustom": true },
  { "showName": "168蛋糕劵", "isCustom": true },
  { "showName": "208蛋糕劵", "isCustom": true },
  { "showName": "258蛋糕劵", "isCustom": true },
  { "showName": "企微收款", "isCustom": true },
  { "showName": "支付收款", "isCustom": true },
  { "showName": "预定金支付", "isCustom": false },
  { "showName": "次卡支付", "isCustom": false },
  { "showName": "购物卡支付", "isCustom": false },
  { "showName": "预付卡支付", "isCustom": false }
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

const getCommoditySales = async (thePOSPALAUTH30220) => {
  let commoditySalesUrl = 'https://beta33.pospal.cn/Report/LoadStoreTicketReportV2';

  let commoditySalesBodyStr = '';
  let today = dateFormat("YYYY.mm.dd", whichDate());
  commoditySalesBodyStr += 'beginDateTime=';
  commoditySalesBodyStr += escape(today + '+00:00:00');
  commoditySalesBodyStr += '&endDateTime=';
  commoditySalesBodyStr += escape(today + '+23:59:59');
  commoditySalesBodyStr += '&paymethodsJson=';
  commoditySalesBodyStr += escape(JSON.stringify(KPaymethodsJson));

  /// 所有门店
  KShopArray.forEach((shop) => {
    commoditySalesBodyStr += '&userIds' + escape('[]') + '=';
    commoditySalesBodyStr += shop.userId;
  });

  const commoditySalesResponse = await fetch(commoditySalesUrl, {
    method: 'POST', body: commoditySalesBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const commoditySalesResponseJson = await commoditySalesResponse.json();
  return commoditySalesResponseJson;
}

const getDiscardInventory = async (thePOSPALAUTH30220) => {
  let discardArray = [];
  for (const shop of KShopArray) {
    let discard = await doGetDiscardInventory(shop.userId, thePOSPALAUTH30220);
    discardArray.push(discard);
  }
  return discardArray;
}

const doGetDiscardInventory = async (userId, thePOSPALAUTH30220) => {
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

  let totalCount = '0.00'; // 0为无报损

  const commoditySalesResponseJson = await commoditySalesResponse.json();
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

  return totalCount;
}

const getNewMemberCount = async (thePOSPALAUTH30220) => {
  let newCustomerSummaryUrl = 'https://beta33.pospal.cn/CustomerReport/LoadNewCustomerSummary';
  // groupBy=day&beginDateTime=2020-07-28&endDateTime=2020-07-28
  let newCustomerSummaryBodyStr = 'groupBy=day';
  let today = dateFormat("YYYY-mm-dd", whichDate());
  // today = '2020-07-28'
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

const getRechargeNumber = async (thePOSPALAUTH30220) => {
  let rechargeNumberArr = [];
  for (shop of KShopArray) {
    const rechargeNumber = await doGetRechargeNumber(thePOSPALAUTH30220, shop.userId);
    rechargeNumberArr.push(rechargeNumber);
  }
  return rechargeNumberArr;
}

const doGetRechargeNumber = async (thePOSPALAUTH30220, userId) => {
  let rechargeNumberUrl = 'https://beta33.pospal.cn/Report/LoadStoreCountDataV2';
  // groupBy=day&beginDateTime=2020-07-28&endDateTime=2020-07-28
  let rechargeNumberBodyStr = '';
  rechargeNumberBodyStr += 'countItem=memberCard';
  rechargeNumberBodyStr += '&countOption=totalRechargeMoney';
  rechargeNumberBodyStr += '&isCustom=';
  rechargeNumberBodyStr += '&userId=';

  rechargeNumberBodyStr += userId;

  let today = dateFormat("YYYY-mm-dd", whichDate());
  // today = '2020-07-28'
  rechargeNumberBodyStr += '&beginDateTime=';
  rechargeNumberBodyStr += escape(today + '+00:00:00');
  rechargeNumberBodyStr += '&endDateTime=';
  rechargeNumberBodyStr += escape(today + '+23:59:59');

  const rechargeNumberResponse = await fetch(rechargeNumberUrl, {
    method: 'POST', body: rechargeNumberBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });

  const rechargeNumberResponseJson = await rechargeNumberResponse.json();
  return rechargeNumberResponseJson;
}

const getAllPay = async (thePOSPALAUTH30220) => {
  let allPay = [];
  let cashs = [];
  let weixinIncomes = [];
  let alipayIncomes = [];
  for (shop of KShopArray) {
    const allPay = await doGetAllPay(thePOSPALAUTH30220, shop.userId);
    cashs.push(allPay[0]);
    weixinIncomes.push(allPay[1]);
    alipayIncomes.push(allPay[2]);
  }
  allPay.push(cashs);
  allPay.push(weixinIncomes);
  allPay.push(alipayIncomes);
  // console.log(allPay);
  return allPay;
}

const doGetAllPay = async (thePOSPALAUTH30220, userId) => {
  let totalAllPay = [];
  let totalCash = 0;
  let totalWexinPay = 0;
  let totalAliPay = 0;
  const businessSummaryResponseJson = await doGetBusinessSummary(thePOSPALAUTH30220, userId);
  // console.log(businessSummaryResponseJson);

  if (businessSummaryResponseJson.successed) {
    let view = businessSummaryResponseJson.view;
    // console.log(view);

    var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + view + '</root>';
    // console.log(xml);

    try {
      let result = await parseStringPromise(xml, {
        strict: false, // 为true可能解析不正确
        normalizeTags: true
      });
      // console.log(result);

      if (result) {
        let cashIndex = -1;
        let weixinpayIndex = -1;
        let alipayIndex = -1;

        let payWay = result.root.thead[0].tr[0].th;
        // console.log(payWay);
        let payWayLength = payWay.length;
        for (let index = 0; index < payWayLength; ++index) {
          if (payWay[index]._ === '现金支付') {
            cashIndex = index;
          }
          if (payWay[index]._ === '微信支付') {
            weixinpayIndex = index;
          }
          if (payWay[index]._ === '支付宝支付') {
            alipayIndex = index;
          }
        }

        // console.log(cashIndex);
        // console.log(weixinpayIndex);
        // console.log(alipayIndex);

        let trArray = result.root.tbody[0].tr;
        // console.log(trArray);
        let lastIndex = trArray.length - 1;
        let lastItem = trArray[lastIndex];
        // console.log(lastItem);

        // 索引2必然是现金，一定存在。
        if (cashIndex !== -1) {
          totalCash = lastItem.td[cashIndex]._.trim();
        }
        if (weixinpayIndex !== -1) {
          totalWexinPay = lastItem.td[weixinpayIndex]._.trim();
        }
        if (alipayIndex !== -1) {
          totalAliPay = lastItem.td[alipayIndex]._.trim();
        }

        // console.log(totalCash);
        // console.log(totalWexinPay);
        // console.log(totalAliPay);

        totalAllPay.push(totalCash);
        totalAllPay.push(totalWexinPay);
        totalAllPay.push(totalAliPay);

        // console.log(totalAllPay);
      }
    } catch (e) {
      console.log('解析出错 e=' + e.toString());
    }
  }

  return totalAllPay;
}

const doGetBusinessSummary = async (thePOSPALAUTH30220, userId) => {
  let businessSummary = 'https://beta33.pospal.cn/Report/LoadBusinessSummaryV2';
  // userIds%5B%5D=3995763&beginDateTime=2020.08.27+00%3A00%3A00&endDateTime=2020.08.27+23%3A59%3A59
  let businessSummaryBodyStr = '';
  businessSummaryBodyStr += 'userIds' + escape('[]') + '=';
  businessSummaryBodyStr += userId;
  let today = dateFormat("YYYY.mm.dd", whichDate());
  // today = '2020-07-28'
  businessSummaryBodyStr += '&beginDateTime=';
  businessSummaryBodyStr += escape(today + '+00:00:00');
  businessSummaryBodyStr += '&endDateTime=';
  businessSummaryBodyStr += escape(today + '+23:59:59');
  // console.log(businessSummaryBodyStr);

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

const getSalesDateTitle = () => {
  let today = dateFormat("YYYY.mm.dd", whichDate());
  let content = '**' + today + ' 商品销售情况**\n';
  return content;
}

const getSalesDateContent = (salesData) => {
  // console.log(salesData);
  if (salesData.successed) {
    let list = salesData.list;
    let content = '';

    let totalSd = 0;
    content += '> **商品销售额**\n';

    KShopArray.forEach(shop => {
      let name = shop.name;
      let index = shop.index;
      let userId = shop.userId;
      if (index !== 0) {
        let sd = list[index].totalAmount.toFixed(2);
        content += '> ' + name + ':<font color=\"info\"> ' + sd + ' 元</font>\n';
        content += makeProductSaleMark(userId, name, sd, dateFormat("YYYY.mm.dd", whichDate()));
        content += '\n';

        totalSd += parseFloat(sd);
      }
    });

    content += '\n';
    content += '> 总计:<font color=\"warning\"> ' + totalSd.toFixed(2) + ' 元</font>\n';
    content += makeProductSaleMark('', '所有门店', totalSd.toFixed(2), dateFormat("YYYY.mm.dd", whichDate()));
    content += '\n';
    content += '\n';

    return content;
  }
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

const getMemberTitleDataContent = () => {
  let today = dateFormat("YYYY.mm.dd", whichDate());
  let content = '**' + today + ' 会员充值情况**\n';
  return content;
}

const getDiscardInventoryDateContent = (discardInventoryArray) => {
  let content = '';
  if (discardInventoryArray.length >= KShopArray.length) {
    let totalDi = 0;
    content += '> **商品报损额**\n';

    KShopArray.forEach((shop) => {
      let name = shop.name;
      let index = shop.index;
      let userId = shop.userId;
      if (index !== 0) {
        let di = discardInventoryArray[index];
        content += '> ' + name + ':<font color=\"info\"> ' + di + ' 元</font>\n';
        content += makeProductDiscardMark(userId, name, di, dateFormat("YYYY.mm.dd", whichDate()));
        content += '\n';
        totalDi += parseFloat(di);
      }
    });

    content += '\n';
    content += '> 总计:<font color=\"warning\"> ' + totalDi.toFixed(2) + ' 元</font>\n';
    content += makeProductDiscardMark('', '所有门店', totalDi.toFixed(2), dateFormat("YYYY.mm.dd", whichDate()));
    content += '\n';
    content += '\n';
  }

  return content;
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

const getMemberConsumDataContent = (salesData) => {
  // console.log(salesData);
  let content = '';

  if (salesData.successed) {
    let list = salesData.list;

    let totalMc = 0;
    content += '> **会员消费额**\n';

    KShopArray.forEach((shop) => {
      let name = shop.name;
      let index = shop.index;
      if (index !== 0) {
        let mc = list[index].paymethodAmounts[5].toFixed(2);
        content += '> ' + name + ':<font color=\"info\"> ' + mc + ' 元</font>\n';
        totalMc += parseFloat(mc);
      }
    });

    content += '\n';
    content += '> 总计:<font color=\"warning\"> ' + totalMc.toFixed(2) + ' 元</font>\n';
    content += '\n'
  }

  return content;
}

const getNewMemberDateContent = (newMemberData) => {
  let content = '';

  if (newMemberData.successed) {
    let today4json = dateFormat("YYYY-mm-dd", whichDate());
    let list = newMemberData.list;

    let totalNm = 0;
    content += '> **新增会员数**\n';

    KShopArray.forEach((shop) => {
      let name = shop.name;
      let index = shop.index;
      let nm = list[index][today4json] ? list[index][today4json]['NewCustomerCount'] : 0;
      content += '> ' + name + ':<font color=\"info\"> ' + nm + ' 人</font>\n';
      totalNm += parseFloat(nm);
    });

    content += '\n';
    content += '> 总计:<font color=\"warning\"> ' + totalNm + ' 人</font>\n';
    content += '\n';
  }

  return content;
}

const getActualIncomeTitleDataContent = () => {
  let today = dateFormat("YYYY.mm.dd", whichDate());
  let content = '**' + today + ' 营业实收情况**\n';
  return content;
}

const getRechargeNumberDateContent = (rechargeNumber) => {
  // console.log(newMemberData);
  let content = '';
  if (rechargeNumber.length >= KShopArray.length) {
    let totalRm = 0;
    content += '> **会员充值额**\n';

    KShopArray.forEach((shop) => {
      let name = shop.name;
      let index = shop.index;
      let rm = rechargeNumber[index].successed ? rechargeNumber[index].countValue : 0;
      content += '> ' + name + ':<font color=\"info\"> ' + rm + ' 元</font>\n';
      totalRm += parseFloat(rm);
    });

    content += '\n';
    content += '> 总计:<font color=\"warning\"> ' + totalRm.toFixed(2) + ' 元</font>\n';
    content += '\n';
  }
  return content;
}

const getCashsDataContent = (cashs) => {
  // console.log(cashs);

  let content = '';
  let totalCash = 0;
  content += '> **现金实收额**\n';

  KShopArray.forEach((shop) => {
    let name = shop.name;
    let index = shop.index;
    let cash = (parseFloat(cashs[index])).toFixed(2);
    content += '> ' + name + ':<font color=\"info\"> ' + cash + ' 元</font>\n';
    totalCash += parseFloat(cash);
  });

  content += '\n';
  content += '> 总计:<font color=\"warning\"> ' + totalCash.toFixed(2) + ' 元</font>\n';
  content += '> 费率:<font color=\"warning\"> ' + '0%' + ' </font>\n';
  content += '> 入账:<font color=\"warning\"> ' + totalCash.toFixed(2) + ' 元</font>\n';
  content += '\n';

  return content;
}

const getWeixinIncomeDataContent = (weixinIncome) => {
  // console.log(weixinIncome);

  let content = '';
  let totalCash = 0;
  content += '> **微信支付实收额**\n';

  KShopArray.forEach((shop) => {
    let name = shop.name;
    let index = shop.index;
    let cash = (parseFloat(weixinIncome[index])).toFixed(2);
    content += '> ' + name + ':<font color=\"info\"> ' + cash + ' 元</font>\n';
    totalCash += parseFloat(cash);
  });

  content += '\n';
  content += '> 总计:<font color=\"warning\"> ' + totalCash.toFixed(2) + ' 元</font>\n';
  content += '> 费率:<font color=\"warning\"> ' + '0.3%' + ' </font>\n';
  content += '> 入账:<font color=\"warning\"> ' + (totalCash * (1 - 0.003)).toFixed(2) + ' 元</font>\n';
  content += '\n';
  return content;
}

const getAlipayIncomeDataContent = (alipayIncome) => {
  // console.log(alipayIncome);

  let content = '';
  let totalCash = 0;
  content += '> **支付宝实收额**\n';

  KShopArray.forEach((shop) => {
    let name = shop.name;
    let index = shop.index;
    let cash = (parseFloat(alipayIncome[index])).toFixed(2);
    content += '> ' + name + ':<font color=\"info\"> ' + cash + ' 元</font>\n';
    totalCash += parseFloat(cash);
  });

  content += '\n';
  content += '> 总计:<font color=\"warning\"> ' + totalCash.toFixed(2) + ' 元</font>\n';
  content += '> 费率:<font color=\"warning\"> ' + '0.38%' + ' </font>\n';
  content += '> 入账:<font color=\"warning\"> ' + (totalCash * (1 - 0.0038)).toFixed(2) + ' 元</font>\n';
  content += '\n';
  return content;
}

const getActualIncomeDataContent = (salesData, rechargeNumber) => {
  // console.log(salesData);
  let content = '';

  if (salesData.successed) {
    let list = salesData.list;

    let totalAi = 0;
    content += '> **总营业实收额**\n';

    KShopArray.forEach((shop) => {
      let name = shop.name;
      let index = shop.index;
      let ai = (parseFloat(list[index].totalAmount) -
        parseFloat(list[index].paymethodAmounts[5]) +
        parseFloat(rechargeNumber[index].countValue)).toFixed(2);
      content += '> ' + name + ':<font color=\"info\"> ' + ai + ' 元</font>\n';
      totalAi += parseFloat(ai);
    });

    content += '\n';
    content += '> 总计:<font color=\"warning\"> ' + totalAi.toFixed(2) + ' 元</font>\n';
    content += '\n';
  }

  return content;
}

const doSendToCompanyGroup = async (content) => {
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

  /** -------------------商品销售情况-------------------*/
  /// 商品销售标题
  let saleDataContent = getSalesDateTitle();
  /// 今日销售额
  const salesData = await getCommoditySales(thePOSPALAUTH30220);
  saleDataContent += getSalesDateContent(salesData);
  /// 商品报损
  const discardInventory = await getDiscardInventory(thePOSPALAUTH30220);
  saleDataContent += getDiscardInventoryDateContent(discardInventory);
  if (KForTest) console.log(saleDataContent);
  await doSendToCompanyGroup(saleDataContent);

  /** -------------------会员充值情况-------------------*/
  /// 会员标题
  let memberData = getMemberTitleDataContent();
  /// 发送今日会员充值
  const rechargeNumber = await getRechargeNumber(thePOSPALAUTH30220);
  memberData += getRechargeNumberDateContent(rechargeNumber);
  /// 发送会员消费
  memberData += getMemberConsumDataContent(salesData);
  /// 发送今日新增会员数
  const newMemberData = await getNewMemberCount(thePOSPALAUTH30220);
  memberData += getNewMemberDateContent(newMemberData);
  if (KForTest) console.log(memberData);
  await doSendToCompanyGroup(memberData);

  /** -------------------营业实收情况-------------------*/
  /// 发送营业实收标题
  let actualIncomeDataContent = getActualIncomeTitleDataContent();
  /// 发送今日现金实收
  const allPay = await getAllPay(thePOSPALAUTH30220);
  const cashs = allPay[0];
  actualIncomeDataContent += getCashsDataContent(cashs);
  /// 发送今日微信实收
  const weixinIncome = allPay[1];
  actualIncomeDataContent += getWeixinIncomeDataContent(weixinIncome);
  /// 发送今日支付宝实收
  const alipayIncome = allPay[2];
  actualIncomeDataContent += getAlipayIncomeDataContent(alipayIncome);
  /// 发送今日营业实收（实收=总销售-会员消费+会员充值）
  actualIncomeDataContent += getActualIncomeDataContent(salesData, rechargeNumber);
  if (KForTest) console.log(actualIncomeDataContent);
  await doSendToCompanyGroup(actualIncomeDataContent);
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
