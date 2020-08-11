
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;

const KForTest = false;

const dateFormat = (fmt, date) => {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

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

  let paymethodsJson = [
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
  commoditySalesBodyStr += '&paymethodsJson=';
  commoditySalesBodyStr += escape(JSON.stringify(paymethodsJson));

  commoditySalesBodyStr += '&userIds' + escape('[]') + '=';
  commoditySalesBodyStr += '3995763'; // 总部

  commoditySalesBodyStr += '&userIds' + escape('[]') + '=';
  commoditySalesBodyStr += '3995767'; // 漳浦教育局店

  commoditySalesBodyStr += '&userIds' + escape('[]') + '=';
  commoditySalesBodyStr += '3995771'; // 旧镇店

  commoditySalesBodyStr += '&userIds' + escape('[]') + '=';
  commoditySalesBodyStr += '4061089'; // 漳浦江滨店

  commoditySalesBodyStr += '&userIds' + escape('[]') + '=';
  commoditySalesBodyStr += '4061092'; // 漳州店

  // console.log(commoditySalesBodyStr);

  // let commoditySalesBody = 'beginDateTime=2020.07.28+00%3A00%3A00&endDateTime=2020.07.28+23%3A59%3A59&paymethodsJson=%5B%7B%22showName%22%3A%22%E7%8E%B0%E9%87%91%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%22%E9%93%B6%E8%81%94%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%22%E6%94%AF%E4%BB%98%E5%AE%9D%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%22%E5%BE%AE%E4%BF%A1%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%22%E5%8D%A1%E5%AF%B9%E5%8D%A1%E5%85%85%E5%80%BC%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%22%E5%82%A8%E5%80%BC%E5%8D%A1%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%2210%E9%80%9A%E7%94%A8%E5%8A%B5%22%2C%22isCustom%22%3Atrue%7D%2C%7B%22showName%22%3A%2220%E9%80%9A%E7%94%A8%E5%8A%B5%22%2C%22isCustom%22%3Atrue%7D%2C%7B%22showName%22%3A%22%E9%A2%84%E5%AE%9A%E9%87%91%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%22%E6%AC%A1%E5%8D%A1%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%22%E8%B4%AD%E7%89%A9%E5%8D%A1%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%2C%7B%22showName%22%3A%22%E9%A2%84%E4%BB%98%E5%8D%A1%E6%94%AF%E4%BB%98%22%2C%22isCustom%22%3Afalse%7D%5D&userIds%5B%5D=3995763&userIds%5B%5D=3995767&userIds%5B%5D=3995771&userIds%5B%5D=4061089&userIds%5B%5D=4061092';

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
  let shop0 = await doGetDiscardInventory('3995763', thePOSPALAUTH30220);
  let shop1 = await doGetDiscardInventory('3995767', thePOSPALAUTH30220);
  let shop2 = await doGetDiscardInventory('3995771', thePOSPALAUTH30220);
  let shop3 = await doGetDiscardInventory('4061089', thePOSPALAUTH30220);
  return [shop0, shop1, shop2, shop3];
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

  let totalCount = 0; // 0为无报损

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
  const rechargeNumber0 = await doGetRechargeNumber(thePOSPALAUTH30220, '3995763');
  const rechargeNumber1 = await doGetRechargeNumber(thePOSPALAUTH30220, '3995767');
  const rechargeNumber2 = await doGetRechargeNumber(thePOSPALAUTH30220, '3995771');
  const rechargeNumber3 = await doGetRechargeNumber(thePOSPALAUTH30220, '4061089');

  let rechargeNumber = [rechargeNumber0, rechargeNumber1, rechargeNumber2, rechargeNumber3];
  return rechargeNumber;
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

const sendSalesDateToCompanyGroup = async (salesData) => {
  // console.log(salesData);
  if (salesData.successed) {
    let today = dateFormat("YYYY-mm-dd", whichDate());
    let list = salesData.list;
    let content = '';

    let shop1sd = list[1].totalAmount.toFixed(2);
    let shop2sd = list[2].totalAmount.toFixed(2);
    let shop3sd = list[3].totalAmount.toFixed(2);

    let totalSd = (parseFloat(shop1sd) + parseFloat(shop2sd) + parseFloat(shop3sd)).toFixed(2);

    content += '**' + today + '(今日)商品销售**\n' +
      '> 漳浦店:<font color=\"info\"> ' + shop1sd + ' 元</font>\n' +
      '> 旧镇店:<font color=\"info\"> ' + shop2sd + ' 元</font>\n' +
      '> 江滨店:<font color=\"info\"> ' + shop3sd + ' 元</font>\n\n' +
      '> 总计:<font color=\"warning\"> ' + totalSd + ' 元</font>\n';
    if (KForTest) console.log(content);

    await doSendToCompanyGroup(content);
  }
}
const sendDiscardInventoryDateToCompanyGroup = async (discardInventoryArray) => {
  if (discardInventoryArray.length >= 4) {
    let today = dateFormat("YYYY-mm-dd", whichDate());

    let Shop0 = discardInventoryArray[0];
    let Shop1 = discardInventoryArray[1];
    let Shop2 = discardInventoryArray[2];
    let Shop3 = discardInventoryArray[3];

    let total = (parseFloat(Shop0) + parseFloat(Shop1) +
      parseFloat(Shop2) + parseFloat(Shop3)).toFixed(2);

    let content = '';
    content += '**' + today + '(今日)商品报损**\n' +
      '> 漳浦店:<font color=\"info\"> ' + Shop1 + ' 元</font>\n' +
      '> 旧镇店:<font color=\"info\"> ' + Shop2 + ' 元</font>\n' +
      '> 江滨店:<font color=\"info\"> ' + Shop3 + ' 元</font>\n\n' +
      '> 总计:<font color=\"warning\"> ' + total + ' 元</font>\n';
    if (KForTest) console.log(content);

    await doSendToCompanyGroup(content);
  }
}

const sendmemberConsumToCompanyGroup = async (salesData) => {
  // console.log(salesData);
  if (salesData.successed) {
    let today = dateFormat("YYYY-mm-dd", whichDate());
    let list = salesData.list;
    let content = '';

    let shop1mc = list[1].paymethodAmounts[5].toFixed(2);
    let shop2mc = list[2].paymethodAmounts[5].toFixed(2);
    let shop3mc = list[3].paymethodAmounts[5].toFixed(2);

    let totalMc = (parseFloat(shop1mc) + parseFloat(shop2mc) + parseFloat(shop3mc)).toFixed(2);

    content += '**' + today + '(今日)会员消费**\n' +
      '> 漳浦店:<font color=\"info\"> ' + shop1mc + ' 元</font>\n' +
      '> 旧镇店:<font color=\"info\"> ' + shop2mc + ' 元</font>\n' +
      '> 江滨店:<font color=\"info\"> ' + shop3mc + ' 元</font>\n\n' +
      '> 总计:<font color=\"warning\"> ' + totalMc + ' 元</font>\n';;
    if (KForTest) console.log(content);

    await doSendToCompanyGroup(content);
  }
}

const sendNewMemberDateToCompanyGroup = async (newMemberData) => {
  // console.log(newMemberData);
  if (newMemberData.successed) {
    let today = dateFormat("YYYY-mm-dd", whichDate());

    let list = newMemberData.list;
    let Shop0 = list[0][today] ? list[0][today]['NewCustomerCount'] : 0;
    let Shop1 = list[1][today] ? list[1][today]['NewCustomerCount'] : 0;
    let Shop2 = list[2][today] ? list[2][today]['NewCustomerCount'] : 0;
    let Shop3 = list[3][today] ? list[3][today]['NewCustomerCount'] : 0;

    let total = Shop0 + Shop1 + Shop2 + Shop3;

    let content = '';
    content += '**' + today + '(今日)新增会员**\n' +
      '> 公众号:<font color=\"info\"> ' + Shop0 + ' 人</font>\n' +
      '> 漳浦店:<font color=\"info\"> ' + Shop1 + ' 人</font>\n' +
      '> 旧镇店:<font color=\"info\"> ' + Shop2 + ' 人</font>\n' +
      '> 江滨店:<font color=\"info\"> ' + Shop3 + ' 人</font>\n\n' +
      '> 总计:<font color=\"warning\"> ' + total + ' 人</font>\n';
    if (KForTest) console.log(content);

    await doSendToCompanyGroup(content);
  }
}

const sendRechargeNumberDateToCompanyGroup = async (rechargeNumber) => {
  // console.log(newMemberData);
  if (rechargeNumber.length >= 4) {
    let today = dateFormat("YYYY-mm-dd", whichDate());

    let Shop0 = rechargeNumber[0].successed ? rechargeNumber[0].countValue : 0;
    let Shop1 = rechargeNumber[1].successed ? rechargeNumber[1].countValue : 0;
    let Shop2 = rechargeNumber[2].successed ? rechargeNumber[2].countValue : 0;
    let Shop3 = rechargeNumber[3].successed ? rechargeNumber[3].countValue : 0;

    let total = (parseFloat(Shop0) + parseFloat(Shop1) +
      parseFloat(Shop2) + parseFloat(Shop3)).toFixed(2);

    let content = '';
    content += '**' + today + '(今日)会员充值**\n' +
      '> 公众号:<font color=\"info\"> ' + Shop0 + ' 元</font>\n' +
      '> 漳浦店:<font color=\"info\"> ' + Shop1 + ' 元</font>\n' +
      '> 旧镇店:<font color=\"info\"> ' + Shop2 + ' 元</font>\n' +
      '> 江滨店:<font color=\"info\"> ' + Shop3 + ' 元</font>\n\n' +
      '> 总计:<font color=\"warning\"> ' + total + ' 元</font>\n';
    if (KForTest) console.log(content);

    await doSendToCompanyGroup(content);
  }
}

const sendActualIncomeToCompanyGroup = async (salesData, rechargeNumber) => {
  // console.log(salesData);
  if (salesData.successed && rechargeNumber.length >= 4) {
    let today = dateFormat("YYYY-mm-dd", whichDate());
    let list = salesData.list;
    let content = '';

    /// 营业实收 = 销售总金额 - 会员卡消费 + 充值金额
    let shop0ai = (parseFloat(list[0].totalAmount) -
      parseFloat(list[0].paymethodAmounts[5]) +
      parseFloat(rechargeNumber[0].countValue)).toFixed(2);
    let shop1ai = (parseFloat(list[1].totalAmount) -
      parseFloat(list[1].paymethodAmounts[5]) +
      parseFloat(rechargeNumber[1].countValue)).toFixed(2);
    let shop2ai = (parseFloat(list[2].totalAmount) -
      parseFloat(list[2].paymethodAmounts[5]) +
      parseFloat(rechargeNumber[2].countValue)).toFixed(2);
    let shop3ai = (parseFloat(list[3].totalAmount) -
      parseFloat(list[3].paymethodAmounts[5]) +
      parseFloat(rechargeNumber[3].countValue)).toFixed(2);

    let totalAi = (parseFloat(shop0ai) + parseFloat(shop1ai) +
      parseFloat(shop2ai) + parseFloat(shop3ai)).toFixed(2);

    content += '**' + today + '(今日)营业实收**\n' +
      '> 公众号:<font color=\"info\"> ' + shop0ai + ' 元</font>\n' +
      '> 漳浦店:<font color=\"info\"> ' + shop1ai + ' 元</font>\n' +
      '> 旧镇店:<font color=\"info\"> ' + shop2ai + ' 元</font>\n' +
      '> 江滨店:<font color=\"info\"> ' + shop3ai + ' 元</font>\n\n' +
      '> 总计:<font color=\"warning\"> ' + totalAi + ' 元</font>\n';
    if (KForTest) console.log(content);

    await doSendToCompanyGroup(content);
  }
}

const doSendToCompanyGroup = async (content) => {
  if (KForTest) return;

  let webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=9c5e59e5-7a39-4f6a-a545-d39f9e543c35';

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

const dostartSchedule = async () => {
  /// 1.登录并获取验证信息
  const thePOSPALAUTH30220 = await siginAndGetPOSPALAUTH30220();

  /// 2.发送今日销售额
  const salesData = await getCommoditySales(thePOSPALAUTH30220);
  await sendSalesDateToCompanyGroup(salesData);

  /// 3.发送商品报损
  const discardInventory = await getDiscardInventory(thePOSPALAUTH30220);
  await sendDiscardInventoryDateToCompanyGroup(discardInventory);

  /// 4.发送会员消费
  await sendmemberConsumToCompanyGroup(salesData);

  /// 5.发送今日新增会员数
  const newMemberData = await getNewMemberCount(thePOSPALAUTH30220);
  await sendNewMemberDateToCompanyGroup(newMemberData);

  /// 6.发送今日会员充值
  const rechargeNumber = await getRechargeNumber(thePOSPALAUTH30220);
  await sendRechargeNumberDateToCompanyGroup(rechargeNumber);

  /// 6.发送今日营业实收
  await sendActualIncomeToCompanyGroup(salesData, rechargeNumber);
}

const startSchedule = async () => {
  //每分钟的第30秒定时执行一次:
  // 秒、分、时、日、月、周几
  // 每日23点55分00秒自动发送
  try {
    if (KForTest) {
      await dostartSchedule();
    } else {
      schedule.scheduleJob('00 59 23 * * *', async () => {
        await dostartSchedule();
      });
    }
  } catch (e) {
    console.log('startSchedule e=' + e.toString());
  }
}

module.exports = startSchedule;
