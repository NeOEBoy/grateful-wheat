
const schedule = require('node-schedule');
const fetch = require('node-fetch');

/**--------------------配置信息--------------------*/
const KForTest = true;

/**--------------------配置信息--------------------*/

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

const getAccessToken = async () => {  
  let tokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
  let tokenBody = { 
    'corpid': 'ww39a03eb2c110c3d6', 
    'corpsecret': '_KD8z7HcxBaoi0KFF-kFX8JkuNuvERur7W8V-IoOfwI' 
  };
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST', body: JSON.stringify(tokenBody),
    headers: { 'Content-Type': 'application/json' }
  });
  const tokenResponseJson = await tokenResponse.json();
  return tokenResponseJson;
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

const dostartScheduleCheckin = async () => {
  /// 登录并获取验证信息
  const tokenResponseJson = await getAccessToken();
  console.log(tokenResponseJson);
}

const startScheduleCheckin = async () => {
  // 秒、分、时、日、月、周几
  // 每日23点59分00秒自动发送
  try {
    if (KForTest) {
      await dostartScheduleCheckin();
    } else {
      schedule.scheduleJob('00 59 23 * * *', async () => {
        await dostartScheduleCheckin();
      });
    }
  } catch (e) {
    console.log('startScheduleCheckin e=' + e.toString());
  }
}

module.exports = startScheduleCheckin;
