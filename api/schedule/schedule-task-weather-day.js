const schedule = require('node-schedule');
const fetch = require('node-fetch');
const { dateFormat } = require('../util/date-util');
const {
  signIn
} = require('../third/pospal');
const { Solar } = require('lunar-javascript')


/**--------------------配置信息--------------------*/
const KForTest = false;
let lastUpdateTime;

const getTomorrowDateAndWeather = async () => {
  let dateAndWeather = [];
  // 和风天气API
  let weatherDailyUrl = 'https://devapi.qweather.com/v7/weather/3d';

  let paramerStr = '';
  paramerStr += 'key=0bbba5b319bb41fc9cedbc02729f48b2';
  paramerStr += '&location=101230606';// 漳浦

  weatherDailyUrl += '?';
  weatherDailyUrl += paramerStr;

  const weatherDailyResponse = await fetch(weatherDailyUrl);
  const weatherDailyResponseJson = await weatherDailyResponse.json();

  // console.log(weatherDailyResponseJson);

  // A明天日期：2021-03-06 | 周六 | 农历十二
  // A天气情况：白天 小雨 最高21度 东北风3-4级 | 夜间 小雨 最低21度 北风1-2级
  if (weatherDailyResponseJson.code === '200') {
    let updateTime = weatherDailyResponseJson.updateTime;

    if (lastUpdateTime !== updateTime) {
      lastUpdateTime = updateTime;
      let daily = weatherDailyResponseJson.daily;
      if (daily && daily.length === 3) {
        let tomorrowDaily = daily[1];
        // console.log(tomorrowDaily);
        if (tomorrowDaily) {
          var dt = new Date(); // 注意第二个参数月的范围是 [0, 11]
          dt.setTime(dt.getTime() + 24 * 60 * 60 * 1000);
          let dateStr = 'A明天日期：阳历';
          dateStr += dateFormat("YYYY-mm-dd", dt);
          dateStr += ' | ';
          var a = new Array("日", "一", "二", "三", "四", "五", "六");
          var week = dt.getDay();
          dateStr += '周' + a[week];
          dateStr += ' | 阴历';
          let solar = Solar.fromDate(dt);
          const lunar = solar.getLunar();
          dateStr += lunar.getYearInChinese() + "年" + lunar.getMonthInChinese() + "月" + lunar.getDayInChinese();
          dateAndWeather.push(dateStr);

          let weatherStr = '';
          weatherStr += 'A漳浦天气：';
          weatherStr += '白天';
          weatherStr += ' ';
          weatherStr += tomorrowDaily.textDay;
          weatherStr += ' ';
          weatherStr += '最高';
          weatherStr += tomorrowDaily.tempMax;
          weatherStr += '度';
          weatherStr += ' ';
          weatherStr += tomorrowDaily.windDirDay;
          weatherStr += tomorrowDaily.windScaleDay;
          weatherStr += '级';
          weatherStr += ' ';
          weatherStr += '|';
          weatherStr += ' ';
          weatherStr += '夜间';
          weatherStr += ' ';
          weatherStr += tomorrowDaily.textNight;
          weatherStr += ' ';
          weatherStr += '最低';
          weatherStr += tomorrowDaily.tempMin;
          weatherStr += '度';
          weatherStr += ' ';
          weatherStr += tomorrowDaily.windDirNight;
          weatherStr += tomorrowDaily.windScaleNight;
          weatherStr += '级';
          dateAndWeather.push(weatherStr);
        }
      }
    }
  }

  return dateAndWeather;
}

const saveProductAndSync = async (thePOSPALAUTH30220, name, specification) => {
  let saveProductUrl = 'https://beta33.pospal.cn/Product/SaveProduct';
  let saveProductBodyStr =
    '{"id":1131533988,"enable":"1","userId":3995763,"barcode":"2103050958029","name":"' +
    name +
    '","categoryUid":"1614909428792312795","categoryName":"订货参考","sellPrice":"0","buyPrice":"0","isCustomerDiscount":"1","customerPrice":"0","sellPrice2":"0","pinyin":"","supplierUid":null,"supplierName":"无","supplierRangeList":[],"productionDate":"","shelfLife":"","maxStock":"","minStock":"","description":"","noStock":1,"stock":0,"attribute6":"' +
    specification +
    '","attribute9":null,"productCommonAttribute":null,"baseUnitName":"无","customerPrices":[],"productUnitExchangeList":[],"attribute1":"n","cateAttribute":{"printerUids":"","labelPrinterUids":""},"attribute4":"","attribute2":"","attribute3":"","productTags":[],"productExtBarcodes":[]}';
  // console.log(saveProductBodyStr);
  let saveProductBodyStrAfterEscape = 'productJson=' + escape(saveProductBodyStr);
  // console.log(saveProductBodyStrAfterEscape);
  const saveProductResponse = await fetch(saveProductUrl, {
    method: 'POST', body: saveProductBodyStrAfterEscape,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const saveProductResponseJson = await saveProductResponse.json();
  // console.log(saveProductResponseJson);

  if (saveProductResponseJson && saveProductResponseJson.successed) {
    if (saveProductResponseJson.syncStores) {
      let syncProductFunc = async function (saveProductBodyStr, userId) {
        let syncProductUrl = 'https://beta33.pospal.cn/Product/SyncUpdateProductToStores';
        let syncProductBodyStr = 'productJson=';
        syncProductBodyStr += escape(saveProductBodyStr);
        syncProductBodyStr += '&fromUserId=3995763';
        syncProductBodyStr += '&userId=' + userId;
        syncProductBodyStr += '&attributesJson=%5B%22productName%22%2C%22attribute6%22%2C%22attribute5%22%2C%22attribute7%22%5D';
        const syncProductResponse = await fetch(syncProductUrl, {
          method: 'POST', body: syncProductBodyStr,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
          }
        });
        const syncProductResponseJson = await syncProductResponse.json();
        // console.log(syncProductResponseJson);
      };

      for (let i = 0; i < saveProductResponseJson.syncStores.length; ++i) {
        let store = saveProductResponseJson.syncStores[i];
        let userId = store.value;
        // console.log(userId);
        if (userId) {
          await syncProductFunc(saveProductBodyStr, userId);
        }
      }
    }
  }
}

const dostartScheduleWeather = async () => {
  let dateAndWeather = await getTomorrowDateAndWeather();
  if (dateAndWeather && dateAndWeather.length === 2) {
    console.log(dateAndWeather);

    /// 登录并获取验证信息
    const thePOSPALAUTH30220 = await signIn();
    // console.log(thePOSPALAUTH30220);
    await saveProductAndSync(thePOSPALAUTH30220, dateAndWeather[0], dateAndWeather[1]);
  }
}

const startScheduleWeather = async () => {
  // 秒、分、时、日、月、周几
  // 每时0分1秒自动更新
  try {
    if (KForTest) {
      console.log('开始同步...');
      await dostartScheduleWeather();
      console.log('同步结束...');
    } else {
      schedule.scheduleJob('1 0 * * * *', async () => {
        console.log('开始同步...');
        await dostartScheduleWeather();
        console.log('同步结束...');
      });
    }
  } catch (e) {
    console.log('startScheduleWeather e=' + e.toString());
  }
}

module.exports = startScheduleWeather;
