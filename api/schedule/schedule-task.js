
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const { urlencoded } = require('express');

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
  let today = dateFormat("YYYY.mm.dd", new Date());
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

const sendSalesDateToCompanyGroup = async (salesData) => {
  let webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=9c5e59e5-7a39-4f6a-a545-d39f9e543c35';

  // console.log(salesData);

  let today = dateFormat("YYYY.mm.dd", new Date());
  let list = salesData.list;

  let content =
    today + '（今日）销售数据，请查看。\n' +
    '> 漳浦店:<font color=\"comment\"> ' + list[1].totalAmount + ' 元</font>\n' +
    '> 旧镇店:<font color=\"comment\"> ' + list[2].totalAmount + ' 元</font>\n>';

  let message =
  {
    "msgtype": "markdown",
    "markdown": {
      "content": content
    }
  }

  const webhookResponse = await fetch(webhookUrl, {
    method: 'POST', body: JSON.stringify(message),
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const webhookResponseJson = await webhookResponse.json();
  return webhookResponseJson;
}

const startSchedule = async () => {
  //每分钟的第30秒定时执行一次:
  // 秒、分、时、日、月、周几
  // 每日23点45分00秒自动发送
  schedule.scheduleJob('00 45 23 * * *', async () => {

    // 登录并获取验证信息
    const thePOSPALAUTH30220 = await siginAndGetPOSPALAUTH30220();
    // console.log(thePOSPALAUTH30220);

    const salesData = await getCommoditySales(thePOSPALAUTH30220);
    // console.log(salesData);

    if (salesData && salesData.successed) {
      // console.log(salesData.list[1].totalAmount);

      await sendSalesDateToCompanyGroup(salesData);
      // https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=9c5e59e5-7a39-4f6a-a545-d39f9e543c35
      // console.log(salesData.list[1].paymethodAmounts[0]);
    }

    // console.log('startSchedule:' + new Date());
  });
}

module.exports = startSchedule;
