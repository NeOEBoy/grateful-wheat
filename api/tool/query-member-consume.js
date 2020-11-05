const fetch = require('node-fetch');
const fs = require('fs');
const parseStringPromise = require('xml2js').parseStringPromise;
var xlsx = require('node-xlsx');

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

  return thePOSPALAUTH30220;
}

const getMembersByPage = async (thePOSPALAUTH30220, pageIndex) => {
  let customersByPageUrl = 'https://beta33.pospal.cn/Customer/LoadCustomersByPage';

  let customersByPageBodyStr = '';
  customersByPageBodyStr += 'createUserId=';
  customersByPageBodyStr += '&categoryUid=';
  customersByPageBodyStr += '&tagUid=';
  customersByPageBodyStr += '&type=1';
  customersByPageBodyStr += '&guiderUid=';
  customersByPageBodyStr += '&keyword=';
  customersByPageBodyStr += '&pageIndex=' + pageIndex;
  customersByPageBodyStr += '&pageSize=50';
  customersByPageBodyStr += '&orderColumn=';
  customersByPageBodyStr += '&asc=false';

  // createUserId=&categoryUid=&tagUid=&type=1&guiderUid=&keyword=&pageIndex=1&pageSize=50&orderColumn=&asc=false
  const customersByPageResponse = await fetch(customersByPageUrl, {
    method: 'POST', body: customersByPageBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const customersByPageResponseJson = await customersByPageResponse.json();
  return customersByPageResponseJson;
}

const parseMembers = async (customersByPageResponseJson) => {
  let memeberIds = [];
  if (customersByPageResponseJson.successed) {
    let contentView = customersByPageResponseJson.contentView;
    contentView = contentView.replace(/\r\n/g, "");
    contentView = contentView.replace(/\n/g, "");

    try {
      // console.log(contentView);
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml, {
        strict: false, // 为true可能解析不正确
        normalizeTags: true
      });

      if (result) {
        let trArray = result.root.tbody[0].tr;
        let count = trArray.length;
        for (let index = 0; index < count; ++index) {
          memeberId = trArray[index].td[2];
          memeberIds.push(memeberId);
          // writeToFile(memeberId + '\n');
        }
        // console.log('count = ' + count);
      }

      // if (xml) {
      //   writeToFile(xml)
      // }
    } catch (error) {
      console.log('error = ' + error);
    }
  }

  return memeberIds;
}

const getMemberMoneyChangeLog = async (thePOSPALAUTH30220, memeberId) => {
  let memberMoneyChangeLogUrl = 'https://beta33.pospal.cn/Customer/LoadCustomerMoneyChangeLogs';

  let memberMoneyChangeLogBodyStr = '';
  memberMoneyChangeLogBodyStr += 'customerNumber=';
  memberMoneyChangeLogBodyStr += memeberId;
  memberMoneyChangeLogBodyStr += '&beginTime=2020.10.10+00%3A00%3A00&endTime=2020.10.31+23%3A59%3A59&refund=';

  // createUserId=&categoryUid=&tagUid=&type=1&guiderUid=&keyword=&pageIndex=1&pageSize=50&orderColumn=&asc=false
  const memberMoneyChangeLogResponse = await fetch(memberMoneyChangeLogUrl, {
    method: 'POST', body: memberMoneyChangeLogBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const memberMoneyChangeLogResponseJson = await memberMoneyChangeLogResponse.json();
  return memberMoneyChangeLogResponseJson;
}

const parseMemberMoneyChangeLog = async (memberMoneyChangeLogResponseJson) => {
  let moneyConsume = 0;
  if (memberMoneyChangeLogResponseJson.successed) {
    let mainTableView = memberMoneyChangeLogResponseJson.mainTableView;
    mainTableView = mainTableView.replace(/\r\n/g, "");
    mainTableView = mainTableView.replace(/\n/g, "");

    try {
      // console.log(view);
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + mainTableView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml, {
        strict: false, // 为true可能解析不正确
        normalizeTags: true
      });
      if (result) {
        let trArray = result.root.tbody[0].tr;
        let count = trArray.length;
        for (let index = 0; index < count; ++index) {
          if (trArray[index].td[3]) {
            let operateType = trArray[index].td[2]._.trim();
            // console.log('xxxxx = ' + operateType);

            if (operateType === '余额消费') {
              let moneyChange = trArray[index].td[3]._.trim();
              let moneyChangeFloat = parseFloat(moneyChange);
              if (moneyChangeFloat < 0) {
                moneyConsume += moneyChangeFloat;
              }
            }
          }
        }
      }
      // unlinkFile();
      // writeToFile(mainTableView);
    } catch (error) {
      console.log('error = ' + error);
    }
  }

  return moneyConsume;
}

const unlinkFile = () => {
  let filePate = './try4.html';
  if (fs.existsSync(filePate)) {
    fs.unlinkSync(filePate);
  }
}

const writeToFile = (text) => {
  fs.writeFileSync('./try4.html', text, { 'flag': 'a' });
}

const unlinkXls = () => {
  let filePate = './member-consume.xlsx';
  if (fs.existsSync(filePate)) {
    fs.unlinkSync(filePate);
  }
}

const writeToXls = (data) => {
  var buffer = xlsx.build(data);

  // 写入文件
  fs.writeFile('member-consume.xlsx', buffer, function (err) {
    if (err) {
      console.log("Write failed: " + err);
      return;
    }

    console.log("Write completed.");
  });
}

const startQuery = async () => {
  /// 登录并获取验证信息
  const thePOSPALAUTH30220 = await siginAndGetPOSPALAUTH30220();
  // console.log(thePOSPALAUTH30220);
  unlinkFile();
  unlinkXls();

  var data = [
    {
      name: '1000以上',
      data: [
        ['ID', 'Consume']
      ]
    },
    {
      name: '500以上',
      data: [
        ['ID', 'Consume']
      ]
    },
    {
      name: '400以上',
      data: [
        ['ID', 'Consume']
      ]
    },
    {
      name: '300以上',
      data: [
        ['ID', 'Consume']
      ]
    },
    {
      name: '200以上',
      data: [
        ['ID', 'Consume']
      ]
    },
    {
      name: '100以上',
      data: [
        ['ID', 'Consume']
      ]
    },
    {
      name: '50以上',
      data: [
        ['ID', 'Consume']
      ]
    }
  ];

  let pageIndex = 0;
  for (; ;) {
    ++pageIndex;
    const customersByPageResponseJson = await getMembersByPage(thePOSPALAUTH30220, pageIndex);
    // console.log(customersByPageResponseJson);
    let memeberIds = await parseMembers(customersByPageResponseJson);

    for (let index = 0; index < memeberIds.length; ++index) {
      let id = memeberIds[index];
      // writeToFile(id + '\n');
      console.log('获取 ' + id + ' 消费记录......')
      const memberMoneyChangeLogResponseJson = await getMemberMoneyChangeLog(thePOSPALAUTH30220, id);
      let moneyConsume = await parseMemberMoneyChangeLog(memberMoneyChangeLogResponseJson);
      // writeToFile(moneyConsume + '\n');

      if (moneyConsume <= -1000) {
        let moneyConsumes = [id, moneyConsume];
        data[0].data.push(moneyConsumes);
        continue;
      }

      if (moneyConsume <= -500) {
        let moneyConsumes = [id, moneyConsume];
        data[1].data.push(moneyConsumes);
        continue;
      }

      if (moneyConsume <= -400) {
        let moneyConsumes = [id, moneyConsume];
        data[2].data.push(moneyConsumes);
        continue;
      }

      if (moneyConsume <= -300) {
        let moneyConsumes = [id, moneyConsume];
        data[3].data.push(moneyConsumes);
        continue;
      }

      if (moneyConsume <= -200) {
        let moneyConsumes = [id, moneyConsume];
        data[4].data.push(moneyConsumes);
        continue;
      }

      if (moneyConsume <= -100) {
        let moneyConsumes = [id, moneyConsume];
        data[5].data.push(moneyConsumes);
        continue;
      }

      if (moneyConsume <= -50) {
        let moneyConsumes = [id, moneyConsume];
        data[6].data.push(moneyConsumes);
        continue;
      }
    }

    // if(pageIndex > 5) {
    //   break;
    // }
    if (memeberIds.length < 50) {
      break;
    }
  }

  writeToXls(data);
}

startQuery();
