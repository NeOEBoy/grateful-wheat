const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const tencentcloud = require("tencentcloud-sdk-nodejs");
const SmsClient = tencentcloud.sms.v20190711.Client;

let thePOSPALAUTH30220 = '';
let signTimeMoment = {};

const signIn = async () => {
  try {
    let needRefresh = false;
    if (thePOSPALAUTH30220 === '') {
      needRefresh = true;
    } else {
      currentMoment = moment();
      let timeDiff = currentMoment.diff(signTimeMoment, "seconds");
      // console.log(timeDiff);
      /// 30分钟内（估计的）不用重复登录
      if (timeDiff >= 30 * 60) {
        needRefresh = true;
      }
    }

    if (needRefresh) {
      let signInUrl = 'https://beta33.pospal.cn/account/SignIn';
      let signInBody = { 'userName': 'wanmaizb', 'password': 'Rainsnow12' };
      const signInResponse = await fetch(signInUrl, {
        method: 'POST', body: JSON.stringify(signInBody),
        headers: { 'Content-Type': 'application/json' }
      });
      let setCookie = signInResponse.headers.get('set-cookie');
      let cookieArray = setCookie.split('; ');
      cookieArray.forEach(element => {
        let cookieSingle = element.split('=');
        if (cookieSingle[0] === 'HttpOnly, .POSPALAUTH30220') {
          // console.log(cookieSingle[1]);
          thePOSPALAUTH30220 = cookieSingle[1];
        }
      });
      signTimeMoment = moment();
      // console.log('登录银豹...');
    }
  } catch (e) {
    console.log('signIn e=' + e.toString());
  }

  return thePOSPALAUTH30220;
};

const getProductOrderList = async (
  thePOSPALAUTH30220,
  userId,
  templateId,
  beginDateTime,
  endDateTime
) => {
  // console.log('getProductOrderList begin');

  try {
    let orderListUrl = 'https://beta33.pospal.cn/StockFlow/LoadProductRequestByPage';

    let orderListBodyStr = '';
    orderListBodyStr += 'productrequesttemplateId=';
    orderListBodyStr += templateId;
    orderListBodyStr += '&orderNumber=';
    orderListBodyStr += '&remarks=';
    orderListBodyStr += '&customerKeyword=';
    orderListBodyStr += '&userId=';
    orderListBodyStr += userId;
    orderListBodyStr += '&categoryUids=%5B%5D';
    orderListBodyStr += '&supplierUid=';
    orderListBodyStr += '&status=100';
    orderListBodyStr += '&timeType=100';
    orderListBodyStr += '&beginTime=';
    orderListBodyStr += escape(beginDateTime);
    orderListBodyStr += '&endTime=';
    orderListBodyStr += escape(endDateTime);
    orderListBodyStr += '&isChainStoreSupplyOrder=';
    orderListBodyStr += '&chainStoreSupplyOrderNo=';
    orderListBodyStr += '&receiveName=';
    orderListBodyStr += '&pageIndex=1';
    orderListBodyStr += '&pageSize=50';
    orderListBodyStr += '&orderColumn=';
    orderListBodyStr += '&asc=false';

    const orderListResponse = await fetch(orderListUrl, {
      method: 'POST', body: orderListBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    const orderListResponseJson = await orderListResponse.json();

    let productOrderList = [];

    if (orderListResponseJson.successed) {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + orderListResponseJson.contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        let orderSerialNumberIndex = -1;
        let orderTimeIndex = -1;
        let expectTimeIndex = -1;
        let templateNameIndex = -1;
        let orderTypeIndex = -1;
        let orderCashierIndex = -1;
        let orderShopIndex = -1;
        let prepareShopIndex = -1;
        let statusIndex = -1;
        let remarkIndex = -1;

        let procuctOrderTitleTh = result.root.thead[0].tr[0].th;
        // console.log(procuctOrderTitleTh);
        let procuctOrderTitleThLength = procuctOrderTitleTh.length;
        for (let index = 0; index < procuctOrderTitleThLength; ++index) {
          let titleName = procuctOrderTitleTh[index]._;
          if (titleName) {
            titleName = titleName.replace(/\r\n/g, "").trim();
            if (titleName === '订货单号') {
              orderSerialNumberIndex = index;
              continue;
            }
            if (titleName === '订货时间') {
              orderTimeIndex = index;
              continue;
            }
            if (titleName === '期望到货时间') {
              expectTimeIndex = index;
              continue;
            }
            if (titleName === '模板名称') {
              templateNameIndex = index;
              continue;
            }
            if (titleName === '订货单类型') {
              orderTypeIndex = index;
              continue;
            }
            if (titleName === '订货员') {
              orderCashierIndex = index;
              continue;
            }
            if (titleName === '订货门店') {
              orderShopIndex = index;
              continue;
            }
            if (titleName === '配货门店') {
              prepareShopIndex = index;
              continue;
            }
            if (titleName === '状态') {
              statusIndex = index;
              continue;
            }
            if (titleName === '备注') {
              remarkIndex = index;
              continue;
            }
          }
        }

        // console.log(orderSerialNumberIndex);
        // console.log(orderTimeIndex);
        // console.log(expectTimeIndex);
        // console.log(templateNameIndex);
        // console.log(orderTypeIndex);
        // console.log(orderCashierIndex);
        // console.log(orderShopIndex);
        // console.log(statusIndex);
        // console.log(remarkIndex);

        let procuctOrderDataTh = result.root.tbody[0].tr;
        // console.log(procuctOrderDataTh);
        procuctOrderDataTh.forEach(element => {
          // console.log(element);

          let productOrderItem = {};

          // productOrderItem.key = procuctOrderDataTh.indexOf(element) + 1;

          let orderId = element.$.DATA;
          // console.log(orderId);
          productOrderItem.orderId = orderId;

          let orderSerialNumber = element.td[orderSerialNumberIndex]._;
          // console.log(orderSerialNumber);
          productOrderItem.orderSerialNumber = orderSerialNumber;

          let orderTime = element.td[orderTimeIndex]._;
          // console.log(orderTime);
          productOrderItem.orderTime = orderTime;

          let expectTime = element.td[expectTimeIndex]._;
          // console.log(expectTime);
          productOrderItem.expectTime = expectTime;

          let templateName = element.td[templateNameIndex]._;
          // console.log(templateName);
          productOrderItem.templateName = templateName;

          let orderType = element.td[orderTypeIndex];
          // console.log(orderType);
          productOrderItem.orderType = orderType;

          let orderCashier = element.td[orderCashierIndex]._;
          // console.log(orderCashier);
          productOrderItem.orderCashier = orderCashier;

          let orderShop = element.td[orderShopIndex].span[0]._;
          // console.log(orderShop);
          productOrderItem.orderShop = orderShop;

          let pre3OrderShop = orderShop.substring(0, 3);
          if (pre3OrderShop) {
            productOrderItem.orderShopIndex = parseInt(pre3OrderShop);
          }

          let prepareShop = element.td[prepareShopIndex];
          // console.log(prepareShop);
          productOrderItem.prepareShop = prepareShop;

          let status = element.td[statusIndex].span[0]._;
          // console.log(status);
          productOrderItem.status = status;

          let remark = element.td[remarkIndex]._;
          // console.log(remark);
          remark = remark.replace(/\r\n/g, "").trim();
          productOrderItem.remark = remark;

          productOrderList.push(productOrderItem);
        });
      }
    }

    return { errCode: 0, list: productOrderList };
  } catch (e) {
    return { errCode: -1 };
  }
  return { errCode: -1 };
};

const getProductOrderItem = async (thePOSPALAUTH30220, orderId) => {
  try {
    let orderItemsUrl = 'https://beta33.pospal.cn/StockFlow/LoadProductRequestWithItems';

    let orderItemsBodyStr = '';
    orderItemsBodyStr += 'productRequestId=';
    orderItemsBodyStr += orderId;
    orderItemsBodyStr += '&groupBySupplier=false';
    orderItemsBodyStr += '&groupStockPositionKey=';
    orderItemsBodyStr += '&withWeigh=false';
    // console.log(thePOSPALAUTH30220);
    // console.log(orderItemsBodyStr);

    const orderItemsResponse = await fetch(orderItemsUrl, {
      method: 'POST', body: orderItemsBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    const orderItemsResponseJson = await orderItemsResponse.json();

    // console.log(orderItemsResponseJson);

    let productItems = [];
    if (orderItemsResponseJson.successed) {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + orderItemsResponseJson.view + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        const orderItemTable = result.root.input[2].input[2].input[2].div[2].div[0].div[0].table[0];
        if (orderItemTable) {
          let orderProductNameIndex = -1;
          let barcodeIndex = -1;
          let orderNumberIndex = -1;
          let specificationIndex = -1;
          let transferPriceIndex = -1;
          let remarkIndex = -1;

          let thead = orderItemTable.thead;
          let procuctOrderItemsTh = thead[0].tr[0].th;
          // console.log(procuctOrderItemsTh);
          let procuctOrderItemsThLength = procuctOrderItemsTh.length;
          for (let index = 0; index < procuctOrderItemsThLength; ++index) {
            let titleName = procuctOrderItemsTh[index]._;
            if (titleName) {
              titleName = titleName.replace(/\r\n/g, "").trim();

              if (titleName === '商品名称') {
                orderProductNameIndex = index;
                continue;
              }

              if (titleName === '条码') {
                barcodeIndex = index;
                continue;
              }

              if (titleName === '请求量') {
                orderNumberIndex = index;
                continue;
              }

              if (titleName === '规格') {
                specificationIndex = index;
                continue;
              }

              if (titleName === '配货价') {
                transferPriceIndex = index;
                continue;
              }
            } else {
              titleName = procuctOrderItemsTh[index];
              if (titleName === '备注') {
                remarkIndex = index;
                continue;
              }
            }
          }

          // console.log(orderProductNameIndex);
          // console.log(barcodeIndex);
          // console.log(orderNumberIndex);
          // console.log(specificationIndex);
          // console.log(transferPriceIndex);
          // console.log(remarkIndex);

          let procuctOrderDataTh = orderItemTable.tbody[0].tr;
          // console.log(procuctOrderDataTh);
          procuctOrderDataTh.forEach(element => {
            // console.log(element);

            let productOrderItem = {};

            productOrderItem.key = procuctOrderDataTh.indexOf(element) + 1;

            let dataJson = element.$['DATA-JSON'];
            let dataJsonObj = JSON.parse(dataJson);
            // console.log(dataJsonObj.categoryName);
            productOrderItem.categoryName = dataJsonObj.categoryName;

            let orderProductName = element.td[orderProductNameIndex]._;
            // console.log(orderProductName);
            productOrderItem.orderProductName = orderProductName;

            let specification = element.td[specificationIndex]._;
            // console.log(specification);
            productOrderItem.specification = specification;

            let barcode = element.td[barcodeIndex]._;
            // console.log(barcode);
            productOrderItem.barcode = barcode;
            productOrderItem.barcodeSimple = barcode.substring(barcode.length - 4, barcode.length);
            productOrderItem.barcodeMiddle = barcode.substring(barcode.length - 6, barcode.length);

            let orderNumber = element.td[orderNumberIndex].span[0]._;
            // console.log(orderNumber);
            productOrderItem.orderNumber = parseInt(orderNumber);

            let transferPrice = element.td[transferPriceIndex].input[0].$.VALUE;
            // console.log(parseFloat(transferPrice));
            productOrderItem.transferPrice = parseFloat(transferPrice)

            let remark = element.td[remarkIndex];
            // console.log(remark);
            productOrderItem.remark = remark;

            productItems.push(productOrderItem);
          });
        }
      }
    }
    return { errCode: 0, items: productItems };
  } catch (err) {
    console.log('error');

    return { errCode: -1 };
  }
  return { errCode: -1 };
};

const findTemplate = async (thePOSPALAUTH30220, templateUid) => {
  // console.log('findTemplate start');

  try {
    let findTemplateUrl = 'https://beta33.pospal.cn/ProductRequest/FindTemplate';

    let findTemplateBodyStr = '';
    findTemplateBodyStr += 'userId=3995763';
    findTemplateBodyStr += '&templateUid=';
    findTemplateBodyStr += templateUid;

    const findTemplateResponse = await fetch(findTemplateUrl, {
      method: 'POST', body: findTemplateBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    const findTemplateResponseJson = await findTemplateResponse.json();
    // console.log(findTemplateResponseJson);

    let list = [];
    if (findTemplateResponseJson.successed && findTemplateResponseJson.template) {
      // console.log(findTemplateResponseJson.template.items);
      let items = findTemplateResponseJson.template.items;
      for (let i = 0; i < items.length; ++i) {
        let item = items[i];
        let product = item.product;
        if (product.categoryName === 'A弯麦订货参考') continue;
        let productItem = {};
        productItem.name = product.name;
        productItem.barcode = product.barcode;
        productItem.barcodeSimple = product.barcode.substring(product.barcode.length - 4, product.barcode.length);
        productItem.barcodeMiddle = product.barcode.substring(product.barcode.length - 6, product.barcode.length);
        productItem.categoryName = product.categoryName;

        list.push(productItem);
      }
    }
    return { errCode: 0, list: list };
  } catch (err) {
    return { errCode: -1 };
  }
};

const loadProductsByKeyword = async (thePOSPALAUTH30220, keyword) => {
  try {
    let LoadProductsByPageUrl = 'https://beta33.pospal.cn/Product/LoadProductsByPage';

    let LoadProductsByPageBodyStr = '';
    LoadProductsByPageBodyStr += 'userId=3995763';
    LoadProductsByPageBodyStr += '&keyword=';
    LoadProductsByPageBodyStr += keyword;
    LoadProductsByPageBodyStr += '&groupBySpu=false';
    LoadProductsByPageBodyStr += '&productbrand=';
    LoadProductsByPageBodyStr += '&categorysJson=%5B%5D';
    LoadProductsByPageBodyStr += '&enable=1';
    LoadProductsByPageBodyStr += '&supplierUid=';
    LoadProductsByPageBodyStr += '&productTagUidsJson=%5B%5D';
    LoadProductsByPageBodyStr += '&categoryType=';
    LoadProductsByPageBodyStr += '&pageIndex=1';
    LoadProductsByPageBodyStr += '&pageSize=50';
    LoadProductsByPageBodyStr += '&orderColumn=name';
    LoadProductsByPageBodyStr += '&asc=false';


    const LoadProductsByPageResponse = await fetch(LoadProductsByPageUrl, {
      method: 'POST', body: LoadProductsByPageBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    const LoadProductsByPageResponseJson = await LoadProductsByPageResponse.json();
    // console.log(LoadProductsByPageResponseJson);

    let productItems = [];
    if (LoadProductsByPageResponseJson.successed) {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + LoadProductsByPageResponseJson.contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        // console.log(result);

        let barcodeIndex = -1;
        let categoryNameIndex = -1;
        let productNameIndex = -1;
        let specificationIndex = -1;
        let priceIndex = -1;
        let memberPriceIndex = -1;
        let wholePriceIndex = -1;

        let procuctsTitleTh = result.root.thead[0].tr[0].th;
        // console.log(procuctsTitleTh);
        let procuctsTitleThLength = procuctsTitleTh.length;
        for (let index = 0; index < procuctsTitleThLength; ++index) {
          let titleName = procuctsTitleTh[index]._;
          if (titleName) {
            titleName = titleName.replace(/\r\n/g, "").trim();
            // console.log(titleName);
            if (titleName === '条码') {
              barcodeIndex = index;
              continue;
            }
            if (titleName === '分类') {
              categoryNameIndex = index;
              continue;
            }
            if (titleName === '商品名称') {
              productNameIndex = index;
              continue;
            }
            if (titleName === '规格') {
              specificationIndex = index;
              continue;
            }
            if (titleName === '销售价') {
              priceIndex = index;
              continue;
            }
            if (titleName === '会员价') {
              memberPriceIndex = index;
              continue;
            }
            if (titleName === '批发价') {
              wholePriceIndex = index;
              continue;
            }
          }
        }

        // console.log(barcodeIndex);
        // console.log(categoryNameIndex);
        // console.log(productNameIndex);
        // console.log(specificationIndex);
        // console.log(priceIndex);
        // console.log(memberPriceIndex);
        // console.log(wholePriceIndex);

        let procuctsDataTh = result.root.tbody[0].tr;
        // console.log(procuctOrderDataTh);
        procuctsDataTh.forEach(element => {
          // console.log(element);

          let productItem = {};

          productItem.key = procuctsDataTh.indexOf(element) + 1;

          let barcode = element.td[barcodeIndex];
          // console.log(barcode);
          productItem.barcode = barcode;

          let categoryName = element.td[categoryNameIndex];
          // console.log(barcode);
          productItem.categoryName = categoryName;

          let productName = element.td[productNameIndex];
          // console.log(productName);
          productItem.productName = productName;

          let specification = element.td[specificationIndex];
          // console.log(specification);
          productItem.specification = specification;

          let price = element.td[priceIndex]._;
          // console.log(price);
          productItem.price = parseFloat(price);

          let memberPrice = element.td[memberPriceIndex]._;
          memberPrice = memberPrice.replace(/\r\n/g, "").trim();
          // console.log(memberPrice);
          productItem.memberPrice = parseFloat(memberPrice);

          let wholePrice = element.td[wholePriceIndex]._;
          wholePrice = wholePrice.replace(/\r\n/g, "").trim();
          // console.log(wholePrice);
          productItem.wholePrice = parseFloat(wholePrice);

          productItems.push(productItem);
        });
      }
    }

    return { errCode: 0, items: productItems };
  } catch (e) {
    return { errCode: -1, items: [] };
  }
};

const createStockFlowOut = async (thePOSPALAUTH30220, toUserId, items) => {
  try {
    let createStockFlowOutUrl = 'https://beta33.pospal.cn/StockFlow/CreateStockFlowOut';

    let createStockFlowOutBodyStr = '';
    createStockFlowOutBodyStr += 'stockOrderJson=';
    let stockOrderJsonObj = {};
    stockOrderJsonObj.stockflowTypeNumber = "13";
    stockOrderJsonObj.fromUserId = "3995763";
    stockOrderJsonObj.toUserId = toUserId;
    stockOrderJsonObj.items = items;
    stockOrderJsonObj.rationPriceType = "3";
    stockOrderJsonObj.remarks = "";
    stockOrderJsonObj.needCorfirm = "0";

    let uid19 = moment().format('x');/// uid前13位为毫秒级时间戳，后6位为随机数字
    for (let ii = 0; ii < 6; ++ii) {
      let sigle = Math.floor(Math.random() * 10);
      uid19 += sigle.toString();
    }
    // console.log(uid19);

    stockOrderJsonObj.uid = uid19;

    let stockOrderJsonStr = JSON.stringify(stockOrderJsonObj);
    stockOrderJsonStr = escape(stockOrderJsonStr);
    createStockFlowOutBodyStr += stockOrderJsonStr;
    // console.log(createStockFlowOutBodyStr);
    // 'stockOrderJson=%7B%22stockflowTypeNumber%22%3A%2213%22%2C%22fromUserId%22%3A%223995763%22%2C%22toUserId%22%3A%223995767%22%2C%22items%22%3A%5B%7B%22barcode%22%3A%222007181638433%22%2C%22quantity%22%3A%221%22%7D%5D%7D'

    const createStockFlowOutResponse = await fetch(createStockFlowOutUrl, {
      method: 'POST', body: createStockFlowOutBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    const createStockFlowOutResponseJson = await createStockFlowOutResponse.json();
    // console.log(createStockFlowOutResponseJson);
    if (createStockFlowOutResponseJson.successed) {
      return { errCode: 0, sn: createStockFlowOutResponseJson.sn };
    }

    return { errCode: -1 };
  } catch (e) {
    console.log('createStockFlowOut e = ' + e)
    return { errCode: -1 };
  }
};

const refuseStockFlow = async (thePOSPALAUTH30220, flowId) => {
  try {
    let refuseStockFlowUrl = 'https://beta33.pospal.cn/StockFlow/RefuseStockFlow';

    let refuseStockFlowBodyStr = '';
    refuseStockFlowBodyStr += 'stockFlowId=';
    refuseStockFlowBodyStr += flowId;
    // console.log(refuseStockFlowBodyStr);
    const refuseStockFlowResponse = await fetch(refuseStockFlowUrl, {
      method: 'POST', body: refuseStockFlowBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    const refuseStockFlowResponseJson = await refuseStockFlowResponse.json();
    // console.log(refuseStockFlowResponseJson);
    if (refuseStockFlowResponseJson.successed) {
      return { errCode: 0 };
    }

    return { errCode: -1 };
  } catch (e) {
    console.log('refuseStockFlow e = ' + e)
    return { errCode: -1 };
  }
};

const confirmStockFlow = async (thePOSPALAUTH30220, flowId) => {
  try {
    let confirmStockFlowUrl = 'https://beta33.pospal.cn/StockFlow/ConfirmStockFlowIn';

    let confirmStockFlowBodyStr = '';
    confirmStockFlowBodyStr += 'stockFlowId=';
    confirmStockFlowBodyStr += (++flowId);

    const confirmStockFlowResponse = await fetch(confirmStockFlowUrl, {
      method: 'POST', body: confirmStockFlowBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    console.log(confirmStockFlowResponse);

    const confirmStockFlowResponseJson = await confirmStockFlowResponse.json();
    console.log(confirmStockFlowResponseJson);
    if (confirmStockFlowResponseJson.successed) {
      return { errCode: 0 };
    }

    return { errCode: -1 };
  } catch (e) {
    console.log('confirmStockFlow e = ' + e)
    return { errCode: -1 };
  }
};

const getProductFlowList = async (
  thePOSPALAUTH30220,
  userId,
  flowTypeId,
  beginDateTime,
  endDateTime) => {
  try {
    // console.log('thePOSPALAUTH30220 = ' + thePOSPALAUTH30220);
    // console.log('userId = ' + userId);
    // console.log('flowTypeId = ' + flowTypeId);
    // console.log('beginDateTime = ' + beginDateTime);
    // console.log('endDateTime = ' + endDateTime);
    let loadStockFlowByPageUrl = 'https://beta33.pospal.cn/StockFlow/LoadStockFlowByPage';

    let stockFlowListBodyStr = '';
    stockFlowListBodyStr += 'userId=';
    stockFlowListBodyStr += userId;
    stockFlowListBodyStr += '&stockFlowType=';
    stockFlowListBodyStr += flowTypeId;
    stockFlowListBodyStr += '&beginTime=';
    stockFlowListBodyStr += escape(beginDateTime);
    stockFlowListBodyStr += '&endTime=';
    stockFlowListBodyStr += escape(endDateTime);
    stockFlowListBodyStr += '&stockFlowState=';
    stockFlowListBodyStr += '&supplierUid=';
    stockFlowListBodyStr += '&cashierUid=';
    stockFlowListBodyStr += '&sn=';
    stockFlowListBodyStr += '&pageIndex=1';
    stockFlowListBodyStr += '&pageSize=1000'; // 假定1000
    stockFlowListBodyStr += '&orderColumn=';
    stockFlowListBodyStr += '&asc=false';

    const flowListResponse = await fetch(loadStockFlowByPageUrl, {
      method: 'POST', body: stockFlowListBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    const flowListResponseJson = await flowListResponse.json();
    // console.log(flowListResponseJson);
    let productFlowList = [];
    if (flowListResponseJson && flowListResponseJson.successed) {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + flowListResponseJson.contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        let flowIdIndex = -1;
        let flowSerialNumberIndex = -1;
        let flowNumberIndex = -1;
        let flowTimeIndex = -1;
        let flowTypeIndex = -1;
        let transferFromIndex = -1;
        let transferToIndex = -1;
        let transferStatusIndex = -1;

        let procuctFlowTitleTh = result.root.thead[0].tr[0].th;
        // console.log(procuctFlowTitleTh);
        let procuctFlowTitleThLength = procuctFlowTitleTh.length;
        for (let index = 0; index < procuctFlowTitleThLength; ++index) {
          let titleName = procuctFlowTitleTh[index]._;
          if (titleName) {
            titleName = titleName.replace(/\r\n/g, "").trim();
            if (titleName === '序号') {
              flowSerialNumberIndex = index;
              continue;
            }
            if (titleName === '货流单号') {
              flowNumberIndex = index;
              continue;
            }
            if (titleName === '下单时间') {
              flowTimeIndex = index;
              continue;
            }
            if (titleName === '货单类型') {
              flowTypeIndex = index;
              continue;
            }
            if (titleName === '出货方') {
              transferFromIndex = index;
              continue;
            }
            if (titleName === '进货方') {
              transferToIndex = index;
              continue;
            }
            if (titleName === '状态') {
              transferStatusIndex = index;
              continue;
            }
          }
        }

        // console.log(flowIdIndex);
        // console.log(flowSerialNumberIndex);
        // console.log(flowNumberIndex);
        // console.log(flowTimeIndex);
        // console.log(flowTypeIndex);
        // console.log(transferFromIndex);
        // console.log(transferToIndex);
        // console.log(transferStatusIndex);

        let procuctFlowDataTh = result.root.tbody[0].tr;
        // console.log(procuctOrderDataTh);
        procuctFlowDataTh.forEach(element => {
          // console.log(element);

          let productFlowItem = {};

          let flowId = element.$.DATA;
          // console.log(flowId);
          productFlowItem.flowId = flowId;

          let flowSerialNumber = element.td[flowSerialNumberIndex]._;
          // console.log(flowSerialNumber);
          productFlowItem.key = flowSerialNumber;

          let flowNumber = element.td[flowNumberIndex]._;
          // console.log(flowNumber);
          productFlowItem.flowNumber = flowNumber;

          let flowTime = element.td[flowTimeIndex]._;
          // console.log(flowTime);
          productFlowItem.flowTime = flowTime;

          let flowType = element.td[flowTypeIndex]._;
          flowType = flowType.replace(/\r\n/g, "").trim();
          // console.log(flowType);
          productFlowItem.flowType = flowType;

          let transferFrom = element.td[transferFromIndex];
          transferFrom = transferFrom.replace(/\r\n/g, "").trim();
          // console.log(transferFrom);
          productFlowItem.transferFrom = transferFrom;

          let transferTo = element.td[transferToIndex];
          transferTo = transferTo.replace(/\r\n/g, "").trim();
          // console.log(transferTo);
          productFlowItem.transferTo = transferTo;

          let transferStatusTd = element.td[transferStatusIndex];
          if (transferStatusTd) {
            let transferStatusSpan = transferStatusTd.span;
            if (transferStatusSpan) {
              let transferStatus1 = transferStatusSpan[0] && transferStatusSpan[0]._;
              let transferStatus2 = transferStatusSpan[1] && transferStatusSpan[1]._;
              productFlowItem.transferStatus = [];
              productFlowItem.transferStatus.push(transferStatus1 ? transferStatus1 : '');
              productFlowItem.transferStatus.push(transferStatus2 ? transferStatus2 : '');
              // console.log(productFlowItem.transferStatus);
            }
          }
          productFlowList.push(productFlowItem);
        });
      }
    }
    return { errCode: 0, list: productFlowList };
  } catch (e) {
    console.log(e);
    return { errCode: -1 };
  }

  return { errCode: -1 };
};

const getProductFlowDetail = async (thePOSPALAUTH30220, flowId) => {
  try {
    // console.log('thePOSPALAUTH30220 = ' + thePOSPALAUTH30220);
    // console.log('flowId = ' + flowId);
    let loadStockFlowUrl = 'https://beta33.pospal.cn/StockFlow/LoadStockFlow';

    let loadStockFlowBodyStr = '';
    loadStockFlowBodyStr += 'id=';
    loadStockFlowBodyStr += flowId;

    const flowDetailResponse = await fetch(loadStockFlowUrl, {
      method: 'POST', body: loadStockFlowBodyStr,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    const flowDetailResponseJson = await flowDetailResponse.json();
    // console.log(flowDetailResponseJson);

    let productList = [];
    if (flowDetailResponseJson && flowDetailResponseJson.successed) {
      let detailModel = flowDetailResponseJson.model;
      // console.log(detailModel);
      let detailStockFlowItems = detailModel.stockFlowItems;
      // console.log(detailStockFlowItems.length);
      detailStockFlowItems.forEach(element => {
        // console.log(element);
        let product = element.product;
        // console.log(product);

        let transferProduct = {};
        transferProduct.key = detailStockFlowItems.indexOf(element) + 1;
        transferProduct.name = product.name;
        transferProduct.barcode = product.barcode;
        transferProduct.categoryName = product.categoryName;
        transferProduct.transferNumber = element.updateStock;
        transferProduct.specification = product.attribute6;
        transferProduct.sellPrice = product.sellPrice;

        let updateStockUnit = element.updateStockUnit;
        if (updateStockUnit) {
          transferProduct.unitName = updateStockUnit.productUnitName;
        }

        productList.push(transferProduct);
      });
    }
    return { errCode: 0, list: productList };
  } catch (err) {
    return { errCode: -1 };
  }
  return { errCode: -1 };
};

const getProductSaleList = async (
  thePOSPALAUTH30220,
  beginDateTime,
  endDateTime,
  userId,
  pageIndex,
  pageSize,
  keyword) => {
  let productSaleUrl = 'https://beta33.pospal.cn/ReportV2/LoadProductSaleByPage';
  let productSaleBody = '';
  productSaleBody += 'keyword=';
  productSaleBody += keyword;

  if (userId) {
    productSaleBody += '&userIds%5B%5D=' + userId;
  }

  productSaleBody += '&isSellWell=1';
  productSaleBody += '&beginDateTime=' + escape(beginDateTime);
  productSaleBody += '&endDateTime=' + escape(endDateTime);
  productSaleBody += '&productbrand=';
  productSaleBody += '&supplierUid=';
  productSaleBody += '&productTagUidsJson=';
  productSaleBody += '&categorysJson=%5B%5D';
  productSaleBody += '&isCustomer=';
  productSaleBody += '&pageIndex=' + pageIndex;
  productSaleBody += '&pageSize=' + pageSize;
  productSaleBody += '&orderColumn=totoalProductNum';
  productSaleBody += '&asc=false';

  const productSaleResponse = await fetch(productSaleUrl, {
    method: 'POST', body: productSaleBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  let productSaleResponseJson = await productSaleResponse.json();

  let productSaleList = [];

  if (productSaleResponseJson.successed) {
    try {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + productSaleResponseJson.contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        let productNameIndex = -1;
        let productSaleNumberIndex = -1;
        let productCategoryIndex = -1;
        let productCurrentNumberIndex = -1;
        let productRealIncomeIndex = -1;
        let productSpecificationIndex = -1;

        let procuctSaleTitleTh = result.root.thead[0].tr[0].th;
        // console.log(procuctSaleTitleTh);
        let procuctSaleTitleThLength = procuctSaleTitleTh.length;
        for (let index = 0; index < procuctSaleTitleThLength; ++index) {
          let titleName = procuctSaleTitleTh[index]._;
          if (titleName) {
            titleName = titleName.replace(/\r\n/g, "").trim();

            if (titleName === '商品名称') {
              productNameIndex = index;
              continue;
            }
            if (titleName === '规格') {
              productSpecificationIndex = index;
              continue;
            }
            if (titleName === '商品分类') {
              productCategoryIndex = index;
              continue;
            }
            if (titleName === '销售数量') {
              productSaleNumberIndex = index;
              continue;
            }
            if (titleName === '现有库存') {
              productCurrentNumberIndex = index;
              continue;
            }
            if (titleName === '实收金额') {
              productRealIncomeIndex = index;
              continue;
            }
          }
        }

        // console.log(productNameIndex);
        // console.log(productSpecificationIndex);
        // console.log(productCategoryIndex);
        // console.log(productSaleNumberIndex);
        // console.log(productCurrentNumberIndex);
        // console.log(productRealIncomeIndex);

        let procuctSaleDataTh = result.root.tbody[0].tr;
        // console.log(procuctSaleDataTh);
        procuctSaleDataTh.forEach(element => {
          let productItem = {};

          let productName = element.td[productNameIndex]._;
          // console.log(productName);
          productItem.name = productName;

          let productSpecification = element.td[productSpecificationIndex];
          // console.log(productSpecification);
          productItem.specification = productSpecification;

          let productCategory = element.td[productCategoryIndex];
          // console.log(productCategory);
          productItem.category = productCategory;

          let productSaleNumber = element.td[productSaleNumberIndex].span[0]._;
          productSaleNumber = productSaleNumber.replace(/\r\n/g, "").trim();
          productSaleNumber = parseFloat(productSaleNumber).toFixed(0).toString();
          // console.log(productSaleNumber);
          productItem.saleNumber = productSaleNumber;

          let productCurrentNumber = element.td[productCurrentNumberIndex].span[0]._;
          productCurrentNumber = productCurrentNumber.replace(/\r\n/g, "").trim();
          // console.log(productCurrentNumber);
          productItem.currentNumber = productCurrentNumber;

          let productRealIncome = element.td[productRealIncomeIndex]._;
          // console.log(productRealIncome);
          productItem.realIncome = productRealIncome;

          productSaleList.push(productItem);
        });
      }
    } catch (e) {
      console.log('没有商品数据，解析出错');
    }
  }

  return { errCode: 0, list: productSaleList };
};

const getProductDiscardList = async (thePOSPALAUTH30220, userId, beginDateTime, endDateTime, keyword) => {
  let productDiscardUrl = 'https://beta33.pospal.cn/Inventory/LoadDiscardProductCountList';
  let productDiscardBody = '';
  productDiscardBody += 'userId=' + userId;
  productDiscardBody += '&categoryUids=%5B%5D';
  productDiscardBody += '&reasonName=';
  productDiscardBody += '&keyword=' + keyword;
  productDiscardBody += '&beginDateTime=' + escape(beginDateTime);
  productDiscardBody += '&endDateTime=' + escape(endDateTime);

  // console.log('getProductDiscardList productDiscardBody = ' + productDiscardBody);

  const productDiscardResponse = await fetch(productDiscardUrl, {
    method: 'POST', body: productDiscardBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  let productDiscardResponseJson = await productDiscardResponse.json();
  // console.log(productDiscardResponseJson);

  let productDiscardList = [];

  if (productDiscardResponseJson.successed) {
    try {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + productDiscardResponseJson.view + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        let productNameIndex = -1;
        let productCategoryIndex = -1;
        let productSpecificationIndex = -1;
        let productDiscardNumberIndex = -1;
        let productDiscardMoneyIndex = -1;

        let procuctDiscardTitleTh = result.root.thead[0].tr[0].th;
        // console.log(procuctDiscardTitleTh);
        let procuctDiscardTitleThLength = procuctDiscardTitleTh.length;
        for (let index = 0; index < procuctDiscardTitleThLength; ++index) {
          let titleName = procuctDiscardTitleTh[index]._;
          if (!titleName) {
            titleName = procuctDiscardTitleTh[index];
          }

          titleName = titleName.replace(/\r\n/g, "").trim();
          if (titleName === '商品名称') {
            productNameIndex = index;
            continue;
          }
          if (titleName === '商品分类') {
            productCategoryIndex = index;
            continue;
          }
          if (titleName === '规格') {
            productSpecificationIndex = index;
            continue;
          }
          if (titleName === '报损数量') {
            productDiscardNumberIndex = index;
            continue;
          }
          if (titleName === '报损金额') {
            productDiscardMoneyIndex = index;
            continue;
          }
        }

        // console.log(productNameIndex);
        // console.log(productCategoryIndex);
        // console.log(productSpecificationIndex);
        // console.log(productDiscardNumber);
        // console.log(productDiscardMoney);

        let procuctDiscardDataTh = result.root.tbody[0].tr;
        let procuctDiscardDataThLength = procuctDiscardDataTh.length;
        // console.log(procuctDiscardDataTh);
        for (let index = 0; index < procuctDiscardDataThLength; ++index) {
          let element = procuctDiscardDataTh[index];
          let productItem = {};

          let productName = element.td[productNameIndex];
          if (productName === '总计') continue; ///省略最后一项
          // console.log(productName);
          /// 官方会使用-拼接标题和规格，去除规格，后面自己拼接
          productNameArray = productName.split('-');
          productName = productNameArray && productNameArray.length > 0 ?
            productNameArray[0] : productName;
          productItem.name = productName;

          let productCategory = element.td[productCategoryIndex];
          // console.log(productCategory);
          productItem.category = productCategory;

          let productSpecification = element.td[productSpecificationIndex];
          // console.log(productSpecification);
          productItem.specification = productSpecification;

          let productDiscardNumber = element.td[productDiscardNumberIndex]._;
          productItem.discardNumber = productDiscardNumber;

          let productDiscardMoney = element.td[productDiscardMoneyIndex]._;
          // console.log(productDiscardMoney);
          productItem.diacardMoney = productDiscardMoney;

          productDiscardList.push(productItem);
        }
      }
    } catch (e) {
      console.log('没有商品数据，解析出错');
    }
  }

  /// 根据报损量降序排序
  productDiscardList =
    productDiscardList.sort((first, second) => {
      let firstDiscardNumber = parseInt(first.discardNumber);
      let secondDiscardNumber = parseInt(second.discardNumber)
      return secondDiscardNumber - firstDiscardNumber;
    });

  return { errCode: 0, list: productDiscardList };
};

const getProductSaleAndDiscardList = async (thePOSPALAUTH30220, userId, categoryId, beginDateTime, endDateTime, keyword) => {
  let productSaleAndDiscardUrl = 'https://beta33.pospal.cn/Advanced/LoadProductSaleAndDiscardByPage';
  let productSaleAndDiscardBody = '';
  productSaleAndDiscardBody += 'keyword=' + keyword;
  if (userId) {
    productSaleAndDiscardBody += '&userIds%5B%5D=' + userId;
  }
  productSaleAndDiscardBody += '&categorysJson=';
  let categorysJson = '%5B%5D';
  if (categoryId && categoryId.length > 0) {
    categorysJson = '%5B' + categoryId + '%5D';
  }

  productSaleAndDiscardBody += categorysJson;
  productSaleAndDiscardBody += '&beginDateTime=' + beginDateTime;
  productSaleAndDiscardBody += '&endDateTime=' + endDateTime;
  productSaleAndDiscardBody += '&pageIndex=1';
  productSaleAndDiscardBody += '&pageSize=1000'; ///获取1000个，一般种类没那么多，1000个足以获取全部
  productSaleAndDiscardBody += '&orderColumn=&asc=false';

  // console.log('productSaleAndDiscardBody = ' + productSaleAndDiscardBody);

  // keyword=&categorysJson=%5B%221593049816479739965%22%5D&beginDateTime=2020-10-21&endDateTime=2020-10-27&pageIndex=1&pageSize=50&orderColumn=&asc=false    
  // console.log('getProductDiscardList productSaleAndDiscardBody = ' + productSaleAndDiscardBody);
  const productSaleAndDiscardResponse = await fetch(productSaleAndDiscardUrl, {
    method: 'POST', body: productSaleAndDiscardBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  let productSaleAndDiscardResponseJson = await productSaleAndDiscardResponse.json();
  // console.log(productSaleAndDiscardResponseJson);

  let productSaleAndDiscardList = [];

  if (productSaleAndDiscardResponseJson.successed) {
    try {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + productSaleAndDiscardResponseJson.contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        let procuctSaleAndDiscardDataTh = result.root.tbody[0].tr;
        let procuctSaleAndDiscardDataThLength = procuctSaleAndDiscardDataTh.length;
        // console.log(procuctSaleAndDiscardDataTh);
        for (let index = 0; index < procuctSaleAndDiscardDataThLength; ++index) {
          let element = procuctSaleAndDiscardDataTh[index];
          let productItem = {};

          let productName = element.td[1]._;
          // console.log(productName);
          productItem.name = productName;

          let productCategory = element.td[13];
          // console.log(productCategory);
          productItem.category = productCategory;

          let productSpecification = element.td[3];
          // console.log(productSpecification);
          productItem.specification = productSpecification;

          let productDiscardNumber = element.td[7]._;
          // console.log(productDiscardNumber);
          productItem.discardNumber = productDiscardNumber;

          let productDiscardMoney = element.td[8]._;
          // console.log(productDiscardMoney);
          productItem.diacardMoney = productDiscardMoney;

          let productSaleNumber = element.td[5]._;
          // console.log(productSaleNumber);
          productItem.saleNumber = productSaleNumber;

          let productSaleMoney = element.td[6]._;
          // console.log(productSaleMoney);
          productItem.saleMoney = productSaleMoney;

          /// 报损率计算方式：报损量/(报损量+销售量)
          let discardProportion = '0';
          if (parseInt(productItem.discardNumber) + parseInt(productItem.saleNumber) > 0) {
            discardProportion = (parseInt(productItem.discardNumber) / (parseInt(productItem.discardNumber) + parseInt(productItem.saleNumber))).toFixed(2);
            discardProportion = (parseFloat(discardProportion) * 100).toFixed(0);
          }
          productItem.discardProportion = discardProportion;

          productSaleAndDiscardList.push(productItem);
        }
      }
    } catch (e) {
      console.log('没有商品数据，解析出错');
    }
  }

  /// 根据报损率降序排序
  productSaleAndDiscardList =
    productSaleAndDiscardList.sort((first, second) => {
      let firstDiscardProportion = parseInt(first.discardProportion);
      let secondDiscardProportion = parseInt(second.discardProportion)
      return secondDiscardProportion - firstDiscardProportion;
    });

  return { errCode: 0, list: productSaleAndDiscardList };
};

const getCouponSummaryList = async (thePOSPALAUTH30220, userId, beginDateTime, endDateTime) => {
  let couponSummaryListUrl = 'https://beta33.pospal.cn/Promotion/LoadCouponSummary';
  let couponSummaryListBody = '';
  couponSummaryListBody += 'queryType=1&promotionCouponType=&salable=';
  if (userId) {
    couponSummaryListBody += '&userIds%5B%5D=' + userId;
  }
  couponSummaryListBody += '&beginDateTime=' + beginDateTime;
  couponSummaryListBody += '&endDateTime=' + endDateTime;

  // console.log('couponSummaryListBody = ' + couponSummaryListBody);

  // beginDateTime=2020.11.06+00%3A00%3A00&endDateTime=2020.11.06+23%3A59%3A59&queryType=1&promotionCouponType=&salable=&userIds%5B%5D=3995767    
  const couponSummaryListResponse = await fetch(couponSummaryListUrl, {
    method: 'POST', body: couponSummaryListBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  let couponSummaryListResponseJson = await couponSummaryListResponse.json();
  // console.log(couponSummaryListResponseJson);

  let couponSummaryListList = [];

  if (couponSummaryListResponseJson.successed) {
    try {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + couponSummaryListResponseJson.contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        let couponSummaryListDataTh = result.root.tbody[0].tr;
        let couponSummaryListDataThLength = couponSummaryListDataTh.length;
        // console.log(couponSummaryListDataTh);
        for (let index = 0; index < couponSummaryListDataThLength; ++index) {
          let element = couponSummaryListDataTh[index];
          let couponItem = {};

          /// 优惠劵名字
          let couponName = element.td[1]._;
          // console.log(couponName);
          couponItem.name = couponName;

          /// 优惠劵销售价格
          let salePrice = element.td[2]._;
          // console.log(salePrice);
          couponItem.salePrice = salePrice;

          /// 优惠劵面值金额
          let faceValue = element.td[3]._;
          // console.log(faceValue);
          couponItem.faceValue = faceValue;

          /// 优惠劵赠送数量
          let presentNumber = '0';
          if (element.td[4]._) {
            presentNumber = element.td[4]._.trim();
          } else {
            presentNumber = element.td[4].a[0]._.trim();
          }
          // console.log(element.td[4]);
          couponItem.presentNumber = presentNumber;

          /// 优惠劵销售数量
          let saleNumber = element.td[5]._;
          // console.log(saleNumber);
          couponItem.saleNumber = saleNumber;

          /// 优惠劵销售金额
          let saleValue = element.td[6]._;
          // console.log(saleValue);
          couponItem.saleValue = saleValue;

          /// 优惠劵核销数量
          let writeOffNumber = element.td[8]._;
          // console.log(writeOffNumber);
          couponItem.writeOffNumber = writeOffNumber;

          /// 优惠劵优惠金额
          let writeOffValue = element.td[9]._;
          // console.log(writeOffValue);
          couponItem.writeOffValue = writeOffValue;

          /// 优惠劵支付金额
          let payValue = element.td[10]._;
          // console.log(payValue);
          couponItem.payValue = payValue;

          couponSummaryListList.push(couponItem);
        }
      }
    } catch (e) {
      console.log('没有商品数据，解析出错');
    }
  }

  /// 根据核销数量降序排序
  couponSummaryListList =
    couponSummaryListList.sort((first, second) => {
      let firstWriteOffNumber = parseInt(first.writeOffNumber);
      let secondWriteOffNumber = parseInt(second.writeOffNumber)
      return secondWriteOffNumber - firstWriteOffNumber;
    });

  return { errCode: 0, list: couponSummaryListList };
}

const getDIYCouponList = async (thePOSPALAUTH30220, pageIndex, pageSize, keyword) => {
  let loadPromotionCouponCodesUrl = 'https://beta33.pospal.cn/Promotion/LoadPromotionCouponCodes';
  let loadPromotionCouponCodesUrlBody = '';
  loadPromotionCouponCodesUrlBody += 'userId=3995763&promotionCouponUid=1604560747439474724&couponUserId=3995763';
  loadPromotionCouponCodesUrlBody += '&pageIndex=' + pageIndex;
  loadPromotionCouponCodesUrlBody += '&pageSize=' + pageSize;
  loadPromotionCouponCodesUrlBody += '&keyword=' + keyword;

  // console.log('loadPromotionCouponCodesUrlBody = ' + loadPromotionCouponCodesUrlBody);

  // userId=3995763&pageIndex=1&pageSize=10&promotionCouponUid=1604560747439474724&couponUserId=3995763    
  const loadPromotionCouponCodesResponse = await fetch(loadPromotionCouponCodesUrl, {
    method: 'POST', body: loadPromotionCouponCodesUrlBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  let loadPromotionCouponCodesResponseJson = await loadPromotionCouponCodesResponse.json();
  // console.log(loadPromotionCouponCodesResponseJson);

  let promotionCouponCodeList = [];
  let total = 0;
  if (loadPromotionCouponCodesResponseJson.successed) {
    try {
      total = loadPromotionCouponCodesResponseJson.total;

      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + loadPromotionCouponCodesResponseJson.contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        let serialNumberIndex = -1;
        let couponIdIndex = -1;
        let couponSourceIndex = -1;
        let memberIdIndex = -1;
        let memberNameIndex = -1;
        let couponCreateTimeIndex = -1;
        let couponWriteOffIndex = -1;
        let couponStatusIndex = -1;

        let couponCodeListDataTable = result.root.div[1].div[1].div[0].table[0];

        let couponCodeListDataTh = couponCodeListDataTable.thead[0].tr[0].th;
        // console.log(couponCodeListDataTh);

        let procuctDiscardTitleThLength = couponCodeListDataTh.length;
        for (let index = 0; index < procuctDiscardTitleThLength; ++index) {
          let titleName = couponCodeListDataTh[index]._;
          // console.log(titleName);
          if (!titleName) {
            let image = couponCodeListDataTh[index].img;
            if (image) {
              serialNumberIndex = index;
            }
            continue;
          }

          titleName = titleName.replace(/\r\n/g, "").trim();
          if (titleName === '优惠券编号') {
            couponIdIndex = index;
            continue;
          }
          if (titleName === '优惠券来源') {
            couponSourceIndex = index;
            continue;
          }
          if (titleName === '会员号') {
            memberIdIndex = index;
            continue;
          }
          if (titleName === '会员姓名') {
            memberNameIndex = index;
            continue;
          }
          if (titleName === '制券时间') {
            couponCreateTimeIndex = index;
            continue;
          }
          if (titleName === '使用时间') {
            couponWriteOffIndex = index;
            continue;
          }
          if (titleName === '状态') {
            couponStatusIndex = index;
            continue;
          }
        }

        let couponCodeListDataTbody = couponCodeListDataTable.tbody[0].tr;
        // console.log(couponCodeListDataTbody);
        let couponCodeListDataThLength = couponCodeListDataTbody.length;
        for (let index = 0; index < couponCodeListDataThLength; ++index) {
          let element = couponCodeListDataTbody[index];
          let couponItem = {};

          /// 序号
          let serialNumber = element.td[serialNumberIndex]._;
          // console.log(serialNumber);
          couponItem.serialNumber = serialNumber;

          /// 优惠劵id
          let couponId = element.td[couponIdIndex]._;
          // console.log(couponId);
          couponItem.couponId = couponId;

          /// 优惠劵来源
          let couponSource = element.td[couponSourceIndex]._;
          // console.log(couponSource);
          couponItem.couponSource = couponSource;

          /// 会员id
          let memberId = element.td[memberIdIndex]._;
          // console.log(memberId);
          couponItem.memberId = memberId;

          /// 会员名字
          let memberName = element.td[memberNameIndex]._;
          // console.log(memberName);
          couponItem.memberName = memberName;

          /// 制券时间
          let couponCreateTime = element.td[couponCreateTimeIndex]._;
          // console.log(couponCreateTime);
          couponItem.couponCreateTime = couponCreateTime;

          /// 核销时间
          let couponWriteOffTime = element.td[couponWriteOffIndex]._;
          // console.log(couponWriteOffTime);
          couponItem.couponWriteOffTime = couponWriteOffTime;

          /// 状态
          let couponStatus = element.td[couponStatusIndex]._;
          // console.log(couponStatus);
          couponItem.couponStatus = couponStatus;

          /// 备注信息，比如打电话预约后的预约情况
          let remark = '';
          let remarkFileName = path.resolve(__dirname, '..\\stores\\remark') + '\\' + couponId + '.txt';
          if (fs.existsSync(remarkFileName)) {
            if (couponWriteOffTime !== '-') { ///劵已经核销过，删除备注
              fs.unlinkSync(remarkFileName);
              remark = '该券已经于' + couponWriteOffTime + '被使用过';
            } else {
              remark = fs.readFileSync(remarkFileName, 'utf-8');
            }
          } else {
            if (couponWriteOffTime !== '-') { ///劵已经核销过，删除备注
              remark = '该券已经于' + couponWriteOffTime + '被使用过';
            }
          }
          couponItem.remark = remark;

          promotionCouponCodeList.push(couponItem);
        }
      }
    } catch (e) {
      console.log('没有商品数据，解析出错');
    }
  }

  // console.log(promotionCouponCodeList);
  // console.log(total);

  return { errCode: 0, list: promotionCouponCodeList, total };
}

const getMemberList = async (thePOSPALAUTH30220, keyword) => {
  let loadCustomerByPageUrl = 'https://beta33.pospal.cn/Customer/LoadCustomersByPage';
  let loadCustomerByPageUrlBody = '';
  loadCustomerByPageUrlBody += 'createUserId=&categoryUid=&tagUid=&type=1&guiderUid=&pageIndex=1&pageSize=50&orderColumn=&asc=false';
  loadCustomerByPageUrlBody += '&keyword=' + keyword;

  // console.log('loadPromotionCouponCodesUrlBody = ' + loadPromotionCouponCodesUrlBody);

  const loadCustomerByPageResponse = await fetch(loadCustomerByPageUrl, {
    method: 'POST', body: loadCustomerByPageUrlBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  let loadCustomerByPageResponseJson = await loadCustomerByPageResponse.json();
  // console.log(loadCustomerByPageResponseJson);
  let memberList = [];
  if (loadCustomerByPageResponseJson.successed) {
    try {
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
        + loadCustomerByPageResponseJson.contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml,
        {
          strict: false, // 为true可能解析不正确
          normalizeTags: true
        });
      if (result) {
        let memberIdIndex = -1;
        let phoneNumIndex = -1;
        let memberNameIndex = -1;

        let memberListDataTh = result.root.thead[0].tr[0].th;
        // console.log(memberListDataTh);

        let memberListDataThLength = memberListDataTh.length;
        for (let index = 0; index < memberListDataThLength; ++index) {
          let titleName = memberListDataTh[index]._;
          // console.log(titleName);
          if (!titleName) {
            continue;
          }

          titleName = titleName.replace(/\r\n/g, "").trim();
          if (titleName === '电话') {
            phoneNumIndex = index;
            continue;
          }
          if (titleName === '会员号') {
            memberIdIndex = index;
            continue;
          }
          if (titleName === '姓名') {
            memberNameIndex = index;
            continue;
          }
        }

        // console.log(phoneNumIndex);
        // console.log(memberIdIndex);
        // console.log(memberNameIndex);

        let memberListDataTbody = result.root.tbody[0].tr;
        // console.log(memberListDataTbody);
        let memberListDataTbodyLength = memberListDataTbody.length;
        for (let index = 0; index < memberListDataTbodyLength; ++index) {
          let element = memberListDataTbody[index];
          // console.log(element);
          let memberItem = {};

          /// 会员号
          let memberId = element.td[memberIdIndex];
          // console.log(memberId);
          memberItem.memberId = memberId;

          /// 会员名字
          let memberName = element.td[memberNameIndex]._;
          if (memberName) memberName = memberName.replace(/\r\n/g, "").trim();
          if (!memberName) {
            memberName = element.td[memberNameIndex];
            if (memberName) memberName = memberName.replace(/\r\n/g, "").trim();
          }
          // console.log(memberName);
          memberItem.memberName = memberName;

          /// 手机号
          let phoneNum = element.td[phoneNumIndex];
          // console.log(phoneNum);
          memberItem.phoneNum = phoneNum;

          memberList.push(memberItem);
        }
      }
    } catch (e) {
      console.log('没有会员数据，解析出错');
    }
  }

  return { errCode: 0, list: memberList };
}

const saveRemark = async (couponId, remarkText) => {
  // console.log('saveRemark couponId=' + couponId);
  // console.log('saveRemark remarkText=' + remarkText);

  /// 1删除
  let remarkFileName = path.resolve(__dirname, '..\\stores\\remark') + '\\' + couponId + '.txt';
  if (fs.existsSync(remarkFileName)) {
    fs.unlinkSync(remarkFileName);
  }
  /// 2重建
  if (remarkText) {
    fs.writeFileSync(remarkFileName, remarkText);
  }

  return { errCode: 0 };
}

const sendSMS = async (phoneNumber, templateParam1) => {
  // todo 测试，正式删除
  // return { errCode: 'Ok', errMessage: '' };

  try {
    const clientConfig = {
      credential: {
        secretId: "AKIDpj8eu5CLBkyCI8wyQmy1V6RVIekZprfF",
        secretKey: "dBSVQBpwb1BbniNBk224vc3FOtH66wqf",
      },
      region: "",
      profile: {
        httpProfile: {
          endpoint: "sms.tencentcloudapi.com",
        },
      },
    };

    const client = new SmsClient(clientConfig);
    const params = {
      SmsSdkAppid: '1400452256',
      PhoneNumberSet: ['+86' + phoneNumber],
      Sign: '弯麦烘焙',
      TemplateID: '784973',
      TemplateParamSet: [templateParam1]
    };
    let data = await client.SendSms(params);
    if (data &&
      data.SendStatusSet &&
      data.SendStatusSet.length === 1) {
      let status = data.SendStatusSet[0];
      return { errCode: status.Code, errMessage: status.Message };
    } else {
      return { errCode: 'Fail', errMessage: '数据返回错误' };
    }
  } catch (e) {
    console.log('sendSMS e = ' + e);
    return { errCode: 'Fail', errMessage: e.toString() };
  }
}

const loadElemeProducts = async (thePOSPALAUTH30220, userId, categoryId, status, keyword) => {
  console.log(thePOSPALAUTH30220);

  try {
    let loadElemeProductsUrl = 'https://beta33.pospal.cn/EShop/LoadElemeProducts';
    let loadElemeProductsBody = '';
    loadElemeProductsBody += 'userId=' + userId;
    loadElemeProductsBody += '&categoryId=';
    loadElemeProductsBody += categoryId;
    loadElemeProductsBody += '&status=';
    loadElemeProductsBody += status;
    loadElemeProductsBody += '&keyword=';
    loadElemeProductsBody += keyword;

    console.log('loadElemeProductsBody = ' + loadElemeProductsBody);
    loadElemeProductsBody = 'userId=3995767&categoryId=&status=&keyword=';

    loadElemeProductsBody = { 'userId': '3995767', 'categoryId': '', 'status': '', 'keyword': '' };
    // userId=3995767&categoryId=&status=&keyword=%E6%B0%B4%E6%9E%9C%E8%9B%8B%E7%B3%95
    const loadElemeProductsResponse = await fetch(loadElemeProductsUrl, {
      method: 'POST', body: JSON.stringify(loadElemeProductsBody),
      headers: {
        'Content-Type': 'application/Json',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    let loadElemeProductsResponseJson = await loadElemeProductsResponse.json();
    console.log(loadElemeProductsResponseJson);

    return { errCode: 0 };
  } catch (error) {
    console.log(error);
    return { errCode: -1 };
  }
}

const loadProductsSale = async (
  thePOSPALAUTH30220,
  categoryId,
  userId,
  isSellWell,
  beginDateTime,
  endDateTime) => {
  try {
    // console.log(categoryId);

    let loadProductsSaleUrl = 'https://beta33.pospal.cn/ReportV2/LoadProductSaleByPage';

    // console.log(beginDateTime);
    // console.log(endDateTime);
    // console.log(userId);

    let productSaleBody = '';
    productSaleBody += 'keyword=';
    if (userId) {
      productSaleBody += '&userIds%5B%5D=' + userId;
    }
    productSaleBody += '&isSellWell=';
    productSaleBody += isSellWell;
    productSaleBody += '&beginDateTime=';
    productSaleBody += beginDateTime;
    productSaleBody += '&endDateTime=';
    productSaleBody += endDateTime;
    productSaleBody += '&productbrand=';
    productSaleBody += '&supplierUid=';
    productSaleBody += '&productTagUidsJson=';
    productSaleBody += '&categorysJson=';
    productSaleBody += '%5B' + categoryId + '%5D';
    productSaleBody += '&isCustomer=';
    productSaleBody += '&isNewly=';
    productSaleBody += '&pageIndex=1';
    productSaleBody += '&pageSize=1000';
    productSaleBody += '&orderColumn=barcode';
    productSaleBody += '&asc=true';

    const loadProductsSaleResponse = await fetch(loadProductsSaleUrl, {
      method: 'POST', body: productSaleBody,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
      }
    });
    let loadProductsSaleResponseJson = await loadProductsSaleResponse.json();
    // console.log(loadProductsSaleResponseJson);

    let productList = [];
    if (loadProductsSaleResponseJson.successed) {
      try {
        var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>'
          + loadProductsSaleResponseJson.contentView + '</root>';
        // console.log(xml);
        let result = await parseStringPromise(xml,
          {
            strict: false, // 为true可能解析不正确
            normalizeTags: true
          });
        if (result) {
          let productNameIndex = -1;
          let saleNumberIndex = -1;
          let specificationIndex = -1;
          let totalPriceIndex = -1;
          let unitIndex = -1;
          let barcodeIndex = -1;

          let productListDataTh = result.root.thead[0].tr[0].th;
          // console.log(productListDataTh);
          for (let index = 0; index < productListDataTh.length; ++index) {
            let titleName = productListDataTh[index]._;
            if (!titleName) {
              titleName = productListDataTh[index].toString();
            }
            // console.log(titleName);

            if (!titleName) {
              continue;
            }

            if (titleName) {
              titleName = titleName.replace(/\r\n/g, "");
              if (titleName) {
                titleName = titleName.trim();
              }
            }

            // console.log(titleName);
            if (titleName === '商品名称') {
              productNameIndex = index;
              continue;
            }
            if (titleName === '销售数量') {
              saleNumberIndex = index;
              continue;
            }
            if (titleName === '规格') {
              specificationIndex = index;
              continue;
            }
            if (titleName === '商品总售价') {
              totalPriceIndex = index;
              continue;
            }
            if (titleName === '单位') {
              unitIndex = index;
              continue;
            }
            if (titleName === '商品条码') {
              barcodeIndex = index;
              continue;
            }
          }

          // console.log(productNameIndex);
          // console.log(saleNumberIndex);
          // console.log(specificationIndex);
          // console.log(totalPriceIndex);
          // console.log(unitIndex);
          // console.log(barcodeIndex);

          let productListDataTbody = result.root.tbody[0].tr;
          for (let index = 0; index < productListDataTbody.length; ++index) {
            let element = productListDataTbody[index];
            // console.log(element);
            let productItem = {};

            productItem.key = index + 1;

            /// 商品名字
            let productName = element.td[productNameIndex]._;
            // console.log(productName);
            productItem.productName = productName;

            /// 商品销售数量
            let saleNumber = element.td[saleNumberIndex].span[0]._;
            // console.log(saleNumber);
            saleNumber = parseFloat(saleNumber);
            productItem.saleNumber = saleNumber;

            /// 商品规格
            // console.log(element.td[specificationIndex]);
            let specification = element.td[specificationIndex];
            productItem.specification = specification;

            /// 商品总售价
            // console.log(element.td[totalPriceIndex]._);
            let totalPrice = element.td[totalPriceIndex]._;
            totalPrice = parseFloat(totalPrice);
            // console.log(totalPrice);

            let price = totalPrice / saleNumber;
            // console.log(price);

            let a = 1; let e = 2;
            for (; e > 0; a *= 10, e--);
            for (; e < 0; a /= 10, e++);
            price = Math.round(price * a) / a;

            // console.log(price);
            productItem.price = price;

            /// 商品单位
            // console.log(element.td[unitIndex]);
            let unit = element.td[unitIndex];
            productItem.unit = unit;

            /// 商品规格
            // console.log(element.td[barcodeIndex]);
            let barcode = element.td[barcodeIndex];
            productItem.barcode = barcode;

            productList.push(productItem);
          }

          // console.log(productListDataTbody.length);
        }
      }
      catch (error) {
        console.log(error);
      }
    }
    return { errCode: 0, list: productList };
  } catch (error) {
    return { errCode: -1 };
  }
}

module.exports = {
  signIn,
  getProductSaleList,
  getProductOrderList,
  getProductOrderItem,
  findTemplate,
  loadProductsByKeyword,
  createStockFlowOut,
  refuseStockFlow,
  confirmStockFlow,
  getProductFlowList,
  getProductFlowDetail,
  getProductDiscardList,
  getProductSaleAndDiscardList,
  getCouponSummaryList,
  getDIYCouponList,
  getMemberList,
  saveRemark,
  sendSMS,
  loadElemeProducts,
  loadProductsSale
};