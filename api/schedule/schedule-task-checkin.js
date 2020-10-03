
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const dateFormat = require('../util/date-util').dateFormat;

/**--------------------配置信息--------------------*/
const KForTest = false;

/**--------------------配置信息--------------------*/

const whichDate = () => {
  let theDate = new Date();
  // 换算成昨天，测试用
  // theDate.setTime(theDate.getTime() - 24 * 60 * 60 * 1000);
  return theDate;
}

const getAccessToken = async () => {
  let tokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww39a03eb2c110c3d6&corpsecret=_KD8z7HcxBaoi0KFF-kFX8JkuNuvERur7W8V-IoOfwI';
  const tokenResponse = await fetch(tokenUrl, {
    method: 'GET'
  });
  const tokenResponseJson = await tokenResponse.json();
  return tokenResponseJson;
}

const getDepartmentList = async (accessToken) => {
  let departmentListUrl = 'https://qyapi.weixin.qq.com/cgi-bin/department/list?id=1&';
  departmentListUrl += 'access_token=';
  departmentListUrl += accessToken;
  const departmentListResponse = await fetch(departmentListUrl, {
    method: 'GET'
  });
  const departmentListResponseJson = await departmentListResponse.json();
  return departmentListResponseJson;
}

const getUserSimplelist = async (accessToken, departmentId) => {
  let userSimplelistUrl = 'https://qyapi.weixin.qq.com/cgi-bin/user/simplelist?';
  userSimplelistUrl += 'access_token=';
  userSimplelistUrl += accessToken;
  userSimplelistUrl += '&department_id=';
  userSimplelistUrl += departmentId;

  const userSimplelistResponse = await fetch(userSimplelistUrl, {
    method: 'GET'
  });
  const userSimplelistResponseJson = await userSimplelistResponse.json();
  return userSimplelistResponseJson;
}

const getCheckInData = async (accessToken, userIdList) => {
  let checkInDataUrl = 'https://qyapi.weixin.qq.com/cgi-bin/checkin/getcheckindata?';
  checkInDataUrl += 'access_token=';
  checkInDataUrl += accessToken;

  const date = whichDate();
  let startTime = new Date(new Date(date.toLocaleDateString()).getTime());
  startTime = Math.round(startTime / 1000);

  // console.log('startTime = ' + startTime);
  let endtime = new Date(new Date(date.toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
  endtime = Math.round(endtime / 1000);

  // console.log('endtime = ' + endtime);
  let checkInBody = {
    'opencheckindatatype': 3,
    'useridlist': userIdList,
    'starttime': startTime,
    'endtime': endtime
  };
  const checkInResponse = await fetch(checkInDataUrl, {
    method: 'POST', body: JSON.stringify(checkInBody),
    headers: { 'Content-Type': 'application/json' }
  });

  const checkInResponseJson = await checkInResponse.json();
  return checkInResponseJson;
}

const doSendToCompanyGroup = async (content) => {
  let webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=b9faf185-22db-402b-a35f-e19aad92e8da';
  
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

const dostartScheduleCheckin = async () => {
  /// 登录并获取token
  const tokenResponseJson = await getAccessToken();
  // console.log(tokenResponseJson);
  if (tokenResponseJson.errcode !== 0) return;
  const accessToken = tokenResponseJson.access_token;

  /// 获取部门列表
  const departmentListResponseJson = await getDepartmentList(accessToken);
  // console.log(departmentListResponseJson);
  if (departmentListResponseJson.errcode !== 0) return;

  for (let i = 0; i < departmentListResponseJson.department.length; ++i) {
    let element = departmentListResponseJson.department[i];
    if (element.parentid === 1) { /// 弯麦食品店
      if (element.id !== 2) { /// 总部
        /// 获取部门成员列表（除了总部，总部人员不用打卡）
        const userSimplelistResponseJson = await getUserSimplelist(accessToken, element.id);
        // console.log(userSimplelistResponseJson);
        if (userSimplelistResponseJson.errcode === 0 &&
          userSimplelistResponseJson.userlist.length > 0) {

          let content = '';
          content += '**' + dateFormat("YYYY.mm.dd", whichDate()) + ' ' + element.name + '打卡情况**\n';

          const userIdList = [];
          const userObjArray = [];
          userSimplelistResponseJson.userlist.forEach(element => {
            userIdList.push(element.userid);
            let userObj = {};
            userObj.userid = element.userid;
            userObj.name = element.name;
            userObjArray.push(userObj);
          });
          // console.log(userObjArray);
          // console.log(userIdList);
          /// 获取成员的打卡记录
          const checkInResponse = await getCheckInData(accessToken, userIdList);
          // console.log(checkInResponse);
          if (checkInResponse && checkInResponse.errcode === 0) {
            let checkInList = checkInResponse.checkindata;

            userObjArray.forEach(element => {
              let checkInArray = [];
              checkInList.forEach(checkinElement => {
                if (checkinElement.userid == element.userid) {
                  checkInArray.push(checkinElement);
                }
              });
              element.checkins = checkInArray;
            });
            // console.log(userObjArray);
          }

          /// 组合成md消息格式
          for (let i = 0; i < userObjArray.length; ++i) {
            let userElement = userObjArray[i];
            content += '> **' + userElement.name + '**\n';

            if (userElement.checkins.length <= 0) {
              content += '> ' +
                ' <font color=\"warning\">' +
                '无打卡记录!' +
                '</font>\n';
            } else {
              userElement.checkins.forEach(checkInElement => {
                const checkinTime = dateFormat("HH:MM", new Date(checkInElement.checkin_time * 1000));
                const checkinLocation = checkInElement.location_title;
                let checkinInfo = checkinTime + ' ' + checkinLocation;;
                let checkinType = checkInElement.checkin_type;

                content +=
                  '> ' +
                  checkinType +
                  ': <font color=\"info\">' +
                  checkinInfo +
                  '</font>\n';
              });
            }

            content += '\n';
          }

          if (KForTest) {
            console.log(content);
          }

          await doSendToCompanyGroup(content);
        }
      }
    }
  }
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
