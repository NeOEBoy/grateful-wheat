const fetch = require('node-fetch');

let theAccessToken = '';
let getAccessTokenMoment = {};

const getAccessToken = async (corpsecret) => {
  let needRefresh = false;
  if (theAccessToken === '') {
    needRefresh = true;
  } else {
    currentMoment = moment();
    let timeDiff = currentMoment.diff(getAccessTokenMoment, "seconds");
    // console.log(timeDiff);
    /// 30分钟内（估计的）不用重复登录
    if (timeDiff >= 30 * 60) {
      needRefresh = true;
    }
  }

  if (needRefresh) {
    let tokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww39a03eb2c110c3d6&corpsecret=' + corpsecret;
    const tokenResponse = await fetch(tokenUrl, { method: 'GET' });
    const tokenResponseJson = await tokenResponse.json();
    // console.log(tokenResponseJson);
    if (tokenResponseJson.errcode === 0) {
      theAccessToken = tokenResponseJson.access_token;
    }
  }

  return theAccessToken;
}

const getBillList = async (accessToken, startTime, endtime) => {
  let getBillListUrl = 'https://qyapi.weixin.qq.com/cgi-bin/externalpay/get_bill_list';
  getBillListUrl += '?access_token=';
  getBillListUrl += accessToken;

  let getBillListBody = {
    'begin_time': startTime,
    'end_time': endtime
  };
  const getBillListResponse = await fetch(getBillListUrl, {
    method: 'POST', body: JSON.stringify(getBillListBody),
    headers: { 'Content-Type': 'application/json' }
  });

  const getBillListResponseJson = await getBillListResponse.json();
  return getBillListResponseJson;
}

const parseBillList = (getBillListResponseJson) => {
  let inCome = 0;
  let outCome = 0;
  
  if (getBillListResponseJson.errcode === 0) {
    let billList = getBillListResponseJson.bill_list;
    billList.forEach(bill => {
      let totalFee = bill.total_fee;
      inCome += totalFee;

      let totalRefundFee = bill.total_refund_fee;
      outCome += totalRefundFee;
    });
  }

  return [inCome, outCome];
}

module.exports = {
  getAccessToken,
  getBillList,
  parseBillList
};
