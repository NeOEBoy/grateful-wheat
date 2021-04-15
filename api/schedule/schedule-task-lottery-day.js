
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;
const moment = require('moment');
const {
  signIn,
  getMemberList
} = require('../third/pospal');

const fs = require('fs');
const images = require('images');
const TextToSVG = require('text-to-svg');
const { convert } = require('convert-svg-to-png');
const crypto = require('crypto');

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
  { index: 5, name: '假日店', userId: '4339546' }
];

const KReportWebhookUrl =
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=f296f0bf-13dd-447c-afc1-3f97c7196cd5';
const KReportWebhookUrl4Test =
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=2b090cd9-9770-4f5a-a4fa-bc4d0f5f5d51';
let beginDateMoment;
let endDateMoment;

/**--------------------配置信息--------------------*/
const startScheduleLottery = async () => {
  /// 秒、分、时、日、月、周几
  /// 每日0点5分0秒自动发送
  try {
    if (KForTest) {
      beginDateMoment = moment().startOf('day');
      endDateMoment = moment().endOf('day');
      await dostartScheduleLottery();
    } else {
      schedule.scheduleJob('0 5 0 * * *', async () => {
        beginDateMoment = moment().subtract(1, 'days').startOf('day');
        endDateMoment = moment().subtract(1, 'days').endOf('day');
        await dostartScheduleLottery();
      });
    }
  } catch (e) {
    console.log('startScheduleLottery e=' + e.toString());
  }
}

const dostartScheduleLottery = async () => {
  await buildPrepareString4WorkweixinAndSend();

  let ticketObj = {};

  /// 登录并获取验证信息
  const thePOSPALAUTH30220 = await signIn();
  /// 获取单据总数
  const totalTicketRecord = await getTicketSummaryAndParse(thePOSPALAUTH30220);
  if (totalTicketRecord < 100) {
    ticketObj.totalRecord = totalTicketRecord;
    ticketObj.message = '总订单量过少，无法抽奖...';
    await buildErrorString4WorkweixinAndSend(ticketObj);
    return;
  }

  /// 循环查询单据，查找会员消费的单据
  let count = 0;
  let random = -1;
  for (; ;) {
    count++;
    if (count > 100) break;

    /// 随机索引
    let min = 1; let max = totalTicketRecord;
    random = Math.floor(Math.random() * (max - min + 1)) + min;
    // console.log(random);
    ticketObj = await getTicketByPageAndParse(thePOSPALAUTH30220, random);
    // console.log(ticketObj);
    if (ticketObj.memberId !== '-' && ticketObj.productOrderType === '销售') break;
  }

  if (!ticketObj || ticketObj.memberId === '-') {
    ticketObj.totalRecord = totalTicketRecord;
    ticketObj.message = '总订单中没有会员订单，无法抽奖...';
    await buildErrorString4WorkweixinAndSend(ticketObj);
    return;
  }

  ticketObj.totalRecord = totalTicketRecord;
  ticketObj.luckyIndex = random;
  let memberList = await getMemberList(thePOSPALAUTH30220, ticketObj.memberId);
  memberList = memberList.list;
  if (memberList.length === 1) {
    let member = memberList[0];
    // console.log('member = ' + JSON.stringify(member));
    ticketObj.memberName = member.memberName;
    ticketObj.memberPhoneNum = member.phoneNum;
  }

  // console.log('ticketObj = ' + JSON.stringify(ticketObj));
  await buildLotteryString4WorkweixinAndSend(ticketObj);

  await composePicture(ticketObj.memberName, ticketObj.memberPhoneNum,
    ticketObj.productPriceReal, ticketObj.date);
}

const getTicketSummaryAndParse = async (thePOSPALAUTH30220) => {
  let ticketSummary = 'https://beta33.pospal.cn/Report/LoadTicketSummary';

  /// userIds%5B%5D=3995763&beginDateTime=2020.10.03+00%3A00%3A00&endDateTime=2020.10.03+23%3A59%3A59
  let ticketSummaryBodyStr = '';
  ticketSummaryBodyStr += 'orderSource=';
  ticketSummaryBodyStr += '&sn=';
  ticketSummaryBodyStr += '&reversed=0';
  ticketSummaryBodyStr += '&onlyCustomer=false';
  ticketSummaryBodyStr += '&onlyWholesale=false';
  ticketSummaryBodyStr += '&onlyReturn=false';
  ticketSummaryBodyStr += '&cashierUid=';
  ticketSummaryBodyStr += '&guiderUid=';
  ticketSummaryBodyStr += '&paymethod=';
  ticketSummaryBodyStr += '&beginTime=';
  ticketSummaryBodyStr += escape(beginDateMoment.format('YYYY.MM.DD+HH:mm:ss'));
  ticketSummaryBodyStr += '&endTime=';
  ticketSummaryBodyStr += escape(endDateMoment.format('YYYY.MM.DD+HH:mm:ss'));

  // orderSource=&sn=&reversed=0&onlyCustomer=false&onlyWholesale=false&onlyReturn=false&beginTime=2021.01.24+00%3A00%3A00&endTime=2021.01.24+23%3A59%3A59&cashierUid=&guiderUid=&paymethod=
  const ticketSummaryResponse = await fetch(ticketSummary, {
    method: 'POST', body: ticketSummaryBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const ticketSummaryResponseJson = await ticketSummaryResponse.json();

  let totalTicketRecord = 0;

  if (ticketSummaryResponseJson && ticketSummaryResponseJson.successed) {
    totalTicketRecord = ticketSummaryResponseJson.totalRecord;
  }

  return totalTicketRecord;
}

const getTicketByPageAndParse = async (thePOSPALAUTH30220, pageIndex) => {
  let ticketObj = {};

  let ticketByPage = 'https://beta33.pospal.cn/Report/LoadTicketsByPage';

  /// userIds%5B%5D=3995763&beginDateTime=2020.10.03+00%3A00%3A00&endDateTime=2020.10.03+23%3A59%3A59
  let ticketByPageBodyStr = '';
  ticketByPageBodyStr += 'orderSource=';
  ticketByPageBodyStr += '&sn=';
  ticketByPageBodyStr += '&reversed=0';
  ticketByPageBodyStr += '&onlyCustomer=false';
  ticketByPageBodyStr += '&onlyWholesale=false';
  ticketByPageBodyStr += '&onlyReturn=false';
  ticketByPageBodyStr += '&cashierUid=';
  ticketByPageBodyStr += '&guiderUid=';
  ticketByPageBodyStr += '&paymethod=';
  ticketByPageBodyStr += '&pageIndex='; ticketByPageBodyStr += pageIndex;
  ticketByPageBodyStr += '&pageSize=1';
  ticketByPageBodyStr += '&orderColumn=';
  ticketByPageBodyStr += '&asc=false';
  ticketByPageBodyStr += '&beginTime=';
  ticketByPageBodyStr += escape(beginDateMoment.format('YYYY.MM.DD+HH:mm:ss'));
  ticketByPageBodyStr += '&endTime=';
  ticketByPageBodyStr += escape(endDateMoment.format('YYYY.MM.DD+HH:mm:ss'));

  // orderSource=&sn=&reversed=0&onlyCustomer=false&onlyWholesale=false&onlyReturn=false&beginTime=2021.01.24+00%3A00%3A00&endTime=2021.01.24+23%3A59%3A59&cashierUid=&guiderUid=&paymethod=&pageIndex=1&pageSize=10&orderColumn=&asc=false
  const ticketByPageResponse = await fetch(ticketByPage, {
    method: 'POST', body: ticketByPageBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const ticketByPageResponseJson = await ticketByPageResponse.json();
  if (ticketByPageResponseJson && ticketByPageResponseJson.successed) {
    try {
      let view = ticketByPageResponseJson.contentView;
      // console.log(view);
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + view + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml, {
        strict: false, // 为true可能解析不正确
        normalizeTags: true
      });
      if (result) {
        let orderTrArray = result.root.tbody[0].tr;
        if (orderTrArray.length < 2) {
          throw new Error('没有找到对应订单！！！');
        }

        let columnSerialNumberIndex = -1; /// 流水号
        let columnDateIndex = -1; /// 日期
        let columnCashierIndex = -1; /// 收银员
        let columnMemberIndex = -1; /// 会员
        let columnProductNumberIndex = -1; ///商品数量
        let columnProductPriceOriginIndex = -1; ///商品原价
        let columnProductPriceRealIndex = -1; ///商品实收
        let columnProductPriceDiscountedIndex = -1; ///商品折让
        let columnProductOrderTypeIndex = -1; ///订单类型，销售/退货

        let orderTh = result.root.thead[0].tr[0].th;
        // console.log(orderTh);
        let orderThLength = orderTh.length;
        for (let index = 0; index < orderThLength; ++index) {
          if (orderTh[index]._ === '流水号') {
            columnSerialNumberIndex = index;
            continue;
          }
          if (orderTh[index]._ === '日期') {
            columnDateIndex = index;
            continue;
          }
          if (orderTh[index]._ === '收银员') {
            columnCashierIndex = index;
            continue;
          }
          if (orderTh[index]._ === '会员') {
            columnMemberIndex = index;
            continue;
          }
          if (orderTh[index]._ === '商品数量') {
            columnProductNumberIndex = index;
            continue;
          }
          if (orderTh[index]._ === '商品原价') {
            columnProductPriceOriginIndex = index;
            continue;
          }
          if (orderTh[index]._ === '实收金额') {
            columnProductPriceRealIndex = index;
            continue;
          }
          if (orderTh[index]._ === '折让金额') {
            columnProductPriceDiscountedIndex = index;
            continue;
          }
          if (orderTh[index]._ === '类型') {
            columnProductOrderTypeIndex = index;
            continue;
          }
        }
        // console.log('columnSerialNumberIndex = ' + columnSerialNumberIndex);
        // console.log('columnDateIndex = ' + columnDateIndex);
        // console.log('columnCashierIndex = ' + columnCashierIndex);
        // console.log('columnMemberIndex = ' + columnMemberIndex);
        // console.log('columnProductNumberIndex = ' + columnProductNumberIndex);
        // console.log('columnProductPriceOriginIndex = ' + columnProductPriceOriginIndex);
        // console.log('columnProductPriceRealIndex = ' + columnProductPriceRealIndex);
        // console.log('columnProductPriceDiscountedIndex = ' + columnProductPriceDiscountedIndex);
        // console.log('columnProductOrderTypeIndex = ' + columnProductOrderTypeIndex);

        let orderTdArray = orderTrArray[0].td;
        let serialNumber = orderTdArray[columnSerialNumberIndex]._;
        // console.log('serialNumber = ' + serialNumber);
        let date = orderTdArray[columnDateIndex]._;
        // console.log('date = ' + date);
        let shopId = orderTdArray[columnCashierIndex].a[0].$.DATA;
        // console.log('shopId = ' + shopId);

        let shopName = '未知';
        KShopArray.forEach(shop => {
          if (shop.userId === shopId) {
            shopName = shop.name;
          }
        });
        // console.log('shopName = ' + shopName);
        let memberId = orderTdArray[columnMemberIndex].a[0].$.DATA2;
        // console.log('memberId = ' + memberId);
        let productNumber = orderTdArray[columnProductNumberIndex]._;
        // console.log('productNumber = ' + productNumber);
        let productPriceOrigin = orderTdArray[columnProductPriceOriginIndex]._;
        // console.log('productPriceOrigin = ' + productPriceOrigin);
        let productPriceReal = orderTdArray[columnProductPriceRealIndex]._;
        // console.log('productPriceReal = ' + productPriceReal);
        let productPriceDiscounted = orderTdArray[columnProductPriceDiscountedIndex]._;
        // console.log('productPriceDiscounted = ' + productPriceDiscounted);
        let productOrderType = orderTdArray[columnProductOrderTypeIndex]._;
        // console.log('productOrderType = ' + productOrderType);

        ticketObj.serialNumber = serialNumber;
        ticketObj.date = date;
        ticketObj.shopId = shopId;
        ticketObj.shopName = shopName;
        ticketObj.memberId = memberId;
        ticketObj.productNumber = productNumber;
        ticketObj.productPriceOrigin = productPriceOrigin;
        ticketObj.productPriceReal = productPriceReal;
        ticketObj.productPriceDiscounted = productPriceDiscounted;
        ticketObj.productOrderType = productOrderType;
      }
    } catch (e) {
      console.log('查询ticketByPage出错 e = ' + e);
    }
  }

  return ticketObj;
}

const buildLotteryString4WorkweixinAndSend = async (ticketObj) => {
  let totalContent = '';

  let beginToEndDay = beginDateMoment.format('YYYY.MM.DD')
    + '~' + endDateMoment.format('YYYY.MM.DD');
  let title = '已成功开奖';
  let luckInAll = '恭喜第' + ticketObj.luckyIndex + '单会员中奖';
  totalContent += '**' + beginToEndDay + '**\n';
  totalContent += '**' + title + '**\n';
  totalContent += '**' + luckInAll + '**\n';

  totalContent += '> 订单编号:\n<font color=\"warning\">' + ticketObj.serialNumber + '</font>\n';
  totalContent += '> 订单时间:\n<font color=\"warning\">' + ticketObj.date + '</font>\n';
  totalContent += '> 商品数量:\n<font color=\"info\">' + ticketObj.productNumber + '(件)</font>\n';
  totalContent += '> 商品总计:\n<font color=\"info\">' + ticketObj.productPriceOrigin + '(元)</font>\n';
  totalContent += '> 商品实付:\n<font color=\"warning\">' + ticketObj.productPriceReal + '(元)</font>\n';
  totalContent += '> 交易门店:\n<font color=\"info\">' + ticketObj.shopName + '</font>\n';
  totalContent += '> 会员号:\n<font color=\"warning\">' + ticketObj.memberId + '</font>\n';
  totalContent += '> 会员姓名:\n<font color=\"warning\">' + ticketObj.memberName + '</font>\n';
  totalContent += '> 会员电话:\n<font color=\"warning\">' + ticketObj.memberPhoneNum + '</font>\n';

  if (KForTest) console.log(totalContent);
  await doSendToCompanyGroup('markdown', totalContent);
}

const buildPrepareString4WorkweixinAndSend = async () => {
  let totalContent = '**' + beginDateMoment.format('YYYY.MM.DD')
    + '~' + endDateMoment.format('YYYY.MM.DD') + '**\n';
  totalContent += '**准备开奖...**\n';
  if (KForTest) console.log(totalContent);
  await doSendToCompanyGroup('markdown', totalContent);
}

const buildErrorString4WorkweixinAndSend = async (ticketObj) => {
  let totalContent = '';

  let beginToEndDay = beginDateMoment.format('YYYY.MM.DD')
    + '~' + endDateMoment.format('YYYY.MM.DD');
  let title = '已成功开奖';
  totalContent += '**' + beginToEndDay + '**\n';
  totalContent += '**' + title + '**\n';
  totalContent += '> 抽奖信息:\n<font color=\"warning\">' + ticketObj.message + '</font>\n';

  if (KForTest) console.log(totalContent);
  await doSendToCompanyGroup('markdown', totalContent);
}

const composePicture = async (name, phoneNum, priceReal, orderDate) => {
  const imagePathPre = './schedule/lottery-template';

  TextToSVG.load(imagePathPre + '/庞门正道标题体.ttf', async (err, textToSVG) => {
    if (err || !textToSVG) return;

    const templateImage = images(imagePathPre + '/template.jpg');
    let imageAfterDraw = templateImage;

    let reg4Phone = /^1[0-9]{10}$/;
    let nameIsPhone = reg4Phone.test(name);
    if (nameIsPhone) {
      name = name.substring(0, 3) + '****' + name.substr(name.length - 4)
    }
    if (name) {
      const nameSVG = textToSVG.getSVG(name, {
        x: 0, y: 0, fontSize: 20, anchor: 'top',
        attributes: { fill: 'black', stroke: 'yellow' }
      });
      const namePNG = await convert(nameSVG, { puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } });
      const nameImage = images(namePNG);
      imageAfterDraw = templateImage.drawImage(nameImage, 138, 878);
    }

    let isPhone = reg4Phone.test(phoneNum);
    if (isPhone) {
      phoneNum = phoneNum.substring(0, 3) + '****' + phoneNum.substr(phoneNum.length - 4)
    }
    if (phoneNum) {
      const phoneNumSVG = textToSVG.getSVG(phoneNum, {
        x: 0, y: 0, fontSize: 20, anchor: 'top',
        attributes: { fill: 'black', stroke: 'yellow' }
      });
      const phoneNumPNG = await convert(phoneNumSVG, { puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } });
      const phoneNumImage = images(phoneNumPNG);
      imageAfterDraw = templateImage.drawImage(phoneNumImage, 138, 838);
    }

    if (priceReal) {
      priceReal += ' 元';
      const priceRealSVG = textToSVG.getSVG(priceReal, {
        x: 0, y: 0, fontSize: 20, anchor: 'top',
        attributes: { fill: 'black', stroke: 'yellow' }
      });
      const priceRealPNG = await convert(priceRealSVG, { puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } });
      const priceRealImage = images(priceRealPNG);
      imageAfterDraw = templateImage.drawImage(priceRealImage, 437, 838);
    }

    if (orderDate) {
      const orderDateSVG = textToSVG.getSVG(orderDate, {
        x: 0, y: 0, fontSize: 18, anchor: 'top',
        attributes: { fill: 'black', stroke: 'yellow' }
      });
      const orderDatePNG = await convert(orderDateSVG, { puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } });
      const orderDateImage = images(orderDatePNG);
      imageAfterDraw = templateImage.drawImage(orderDateImage, 437, 880);
    }

    imageAfterDraw.save(imagePathPre + '/composite.jpg', { quality: 100 });
    fs.readFile(imagePathPre + '/composite.jpg', (err, compositeImageBuffer) => {
      if (!err && compositeImageBuffer) {
        doSendToCompanyGroup('image', compositeImageBuffer);
      }

      fs.unlink(imagePathPre + '/composite.jpg', (err) => { });
    });
  });
}

const doSendToCompanyGroup = async (type, content) => {
  if (!KSendToWorkWeixin) return;

  let webhookUrl = KReportWebhookUrl;
  ///测试地址
  if (KForTest) webhookUrl = KReportWebhookUrl4Test;

  let message = {};
  if (type === 'markdown') {
    message = {
      "msgtype": "markdown",
      "markdown": {
        "content": content
      }
    }
  } else if (type === 'image') {
    let contentBase64 = Buffer.from(content).toString('base64');
    let contentMd5 = crypto.createHash('md5').update(content).digest('hex');

    message = {
      "msgtype": "image",
      "image": {
        "base64": contentBase64,
        "md5": contentMd5
      }
    }
  }

  if (KForTest) console.log(message);

  await fetch(webhookUrl, {
    method: 'POST', body: JSON.stringify(message),
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

module.exports = startScheduleLottery;
