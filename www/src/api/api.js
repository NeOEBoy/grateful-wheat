
console.log('process.env.NODE_ENV = ' + process.env.NODE_ENV);

/**--------------------配置信息--------------------*/
const getApiHost = () => {
  // console.log('document.domain = ' + document.domain);
  let host;
  if (process.env.NODE_ENV === 'development') {
    host = 'http://localhost:9001';
  } else {
    let rule = /^(([-\u4E00-\u9FA5a-z0-9]{1,63})\.)+([\u4E00-\u9FA5a-z]{2,63})\.?$/
    if (rule.test(document.domain)) {
      host = 'http://gratefulwheat.ruyue.xyz/apis';
    } else {
      host = 'http://123.207.119.232/apis';
    }
  }
  return host;
}

const getProductSaleList = async (userId, beginDateTime, endDateTime, pageIndex, pageSize, keyword) => {
  let productSaleUrl = getApiHost() + '/product/saleList';
  productSaleUrl += '?pageIndex=';
  productSaleUrl += pageIndex;
  productSaleUrl += '&pageSize=';
  productSaleUrl += pageSize;
  productSaleUrl += '&userId=';
  productSaleUrl += userId;
  productSaleUrl += '&beginDateTime=';
  productSaleUrl += beginDateTime;
  productSaleUrl += '&endDateTime=';
  productSaleUrl += endDateTime;
  productSaleUrl += '&keyword=';
  productSaleUrl += keyword;

  const productSaleResponse = await fetch(productSaleUrl);
  const productSaleJson = await productSaleResponse.json();
  return productSaleJson;
}

const getProductDiscardList = async (userId, beginDateTime, endDateTime, keyword) => {
  // console.log('getProductDiscardList begin');
  let productDiscardUrl = getApiHost() + '/product/discardList';
  productDiscardUrl += '?userId=';
  productDiscardUrl += userId;
  productDiscardUrl += '&beginDateTime=';
  productDiscardUrl += beginDateTime;
  productDiscardUrl += '&endDateTime=';
  productDiscardUrl += endDateTime;
  productDiscardUrl += '&keyword=';
  productDiscardUrl += keyword;

  console.log(productDiscardUrl);
  // userId=&categoryUids=%5B%5D&reasonName=&beginDateTime=2020.10.16+00%3A00%3A00&endDateTime=2020.10.16+23%3A59%3A59&keyword=

  const productDiscardResponse = await fetch(productDiscardUrl);
  const productDiscardJson = await productDiscardResponse.json();
  return productDiscardJson;
}

const getProductSaleAndDiscardList = async (userId, categoryId, beginDateTime, endDateTime, keyword) => {
  let productSaleAndDiscardUrl = getApiHost() + '/product/saleAndDiscardList';

  productSaleAndDiscardUrl += '?userId='
  productSaleAndDiscardUrl += userId;
  productSaleAndDiscardUrl += '&categoryId=';
  productSaleAndDiscardUrl += categoryId;
  productSaleAndDiscardUrl += '&beginDateTime=';
  productSaleAndDiscardUrl += beginDateTime;
  productSaleAndDiscardUrl += '&endDateTime=';
  productSaleAndDiscardUrl += endDateTime;
  productSaleAndDiscardUrl += '&keyword=';
  productSaleAndDiscardUrl += keyword;

  // console.log(productSaleAndDiscardUrl);
  // keyword=&categorysJson=%5B%221593049816479739965%22%5D&beginDateTime=2020-10-21&endDateTime=2020-10-27&pageIndex=1&pageSize=50&orderColumn=&asc=false
  const productSaleAndDiscardResponse = await fetch(productSaleAndDiscardUrl);
  const productSaleAndDiscardJson = await productSaleAndDiscardResponse.json();
  return productSaleAndDiscardJson;
}

const getCouponSummaryList = async (userId, beginDateTime, endDateTime) => {
  let couponSummaryListUrl = getApiHost() + '/coupon/couponSummaryList';

  couponSummaryListUrl += '?userId='
  couponSummaryListUrl += userId;
  couponSummaryListUrl += '&beginDateTime=';
  couponSummaryListUrl += beginDateTime;
  couponSummaryListUrl += '&endDateTime=';
  couponSummaryListUrl += endDateTime;

  // console.log(couponSummaryListUrl);
  // keyword=&categorysJson=%5B%221593049816479739965%22%5D&beginDateTime=2020-10-21&endDateTime=2020-10-27&pageIndex=1&pageSize=50&orderColumn=&asc=false
  const couponSummaryListResponse = await fetch(couponSummaryListUrl);
  const couponSummaryListJson = await couponSummaryListResponse.json();
  return couponSummaryListJson;
}

const getProductOrderList = async (userId, templateId, timeType, beginDateTime, endDateTime) => {
  let productOrderUrl = getApiHost() + '/product/orderList';
  productOrderUrl += '?userId=';
  productOrderUrl += userId;
  productOrderUrl += '&templateId=';
  productOrderUrl += templateId;
  productOrderUrl += '&timeType=';
  productOrderUrl += timeType;
  productOrderUrl += '&beginDateTime=';
  productOrderUrl += beginDateTime;
  productOrderUrl += '&endDateTime=';
  productOrderUrl += endDateTime;

  const productOrderResponse = await fetch(productOrderUrl);
  const productOrderJson = await productOrderResponse.json();
  return productOrderJson;
}

const getProductOrderItems = async (orderId) => {
  let productOrderItemUrl = getApiHost() + '/product/orderItems';
  productOrderItemUrl += '?orderId=';
  productOrderItemUrl += orderId;

  const productOrderItemsResponse = await fetch(productOrderItemUrl);
  const productOrderItemsJson = await productOrderItemsResponse.json();
  return productOrderItemsJson;
}

const findTemplate = async (templateUid) => {
  let findTemplateUrl = getApiHost() + '/product/findTemplate';
  findTemplateUrl += '?templateUid=';
  findTemplateUrl += templateUid;

  const findTemplateResponse = await fetch(findTemplateUrl);
  const findTemplateResponseJson = await findTemplateResponse.json();
  return findTemplateResponseJson;
}

const loadProductsByKeyword = async (keyword) => {
  let loadProductsByKeywordUrl = getApiHost() + '/product/loadProductsByKeyword';
  loadProductsByKeywordUrl += '?keyword=';
  loadProductsByKeywordUrl += keyword;

  const loadProductsByKeywordResponse = await fetch(loadProductsByKeywordUrl);
  const loadProductsByKeywordResponseJson = await loadProductsByKeywordResponse.json();
  return loadProductsByKeywordResponseJson;
}

const createStockFlowOut = async (toUserId, items) => {
  let createStockFlowOutUrl = getApiHost() + '/product/createStockFlowOut';
  let createStockFlowOutBody = {};
  createStockFlowOutBody.toUserId = toUserId;
  createStockFlowOutBody.items = items;

  const createStockFlowOutResponse = await fetch(createStockFlowOutUrl, {
    method: 'post', body: JSON.stringify(createStockFlowOutBody), headers: { 'Content-Type': 'application/json' }
  });
  const createStockFlowOutResponseJson = await createStockFlowOutResponse.json();
  return createStockFlowOutResponseJson;
}

const refuseStockFlow = async (flowId) => {
  let refuseStockFlowUrl = getApiHost() + '/product/refuseStockFlow';
  refuseStockFlowUrl += '?flowId='
  refuseStockFlowUrl += flowId;

  const refuseStockFlowResponse = await fetch(refuseStockFlowUrl);
  const refuseStockFlowResponseJson = await refuseStockFlowResponse.json();
  return refuseStockFlowResponseJson;
}

const confirmStockFlow = async (flowId) => {
  let confirmStockFlowUrl = getApiHost() + '/product/confirmStockFlow';
  confirmStockFlowUrl += '?flowId='
  confirmStockFlowUrl += flowId;

  const confirmStockFlowResponse = await fetch(confirmStockFlowUrl);
  const confirmStockFlowResponseJson = await confirmStockFlowResponse.json();
  return confirmStockFlowResponseJson;
}

const getProductFlowList = async (userId, flowTypeId, beginDateTime, endDateTime) => {
  // console.log('userId = ' + userId);
  // console.log('flowTypeId = ' + flowTypeId);
  // console.log('beginDateTime = ' + beginDateTime);
  // console.log('endDateTime = ' + endDateTime);

  let productFlowListUrl = getApiHost() + '/product/flowList';
  productFlowListUrl += '?userId=';
  productFlowListUrl += userId;
  productFlowListUrl += '&flowTypeId=';
  productFlowListUrl += flowTypeId;
  productFlowListUrl += '&beginDateTime=';
  productFlowListUrl += beginDateTime;
  productFlowListUrl += '&endDateTime=';
  productFlowListUrl += endDateTime;

  const productFlowListResponse = await fetch(productFlowListUrl);
  const productFlowListResponseJson = await productFlowListResponse.json();
  return productFlowListResponseJson;
}

const getFlowDetail = async (flowId) => {
  let productFlowDetailUrl = getApiHost() + '/product/flowDetail';
  productFlowDetailUrl += '?flowId=';
  productFlowDetailUrl += flowId;

  const productFlowDetailResponse = await fetch(productFlowDetailUrl);
  const productFlowDetailResponseJson = await productFlowDetailResponse.json();
  return productFlowDetailResponseJson;
}

const getDIYCouponList = async (pageIndex, pageSize, keyword) => {
  let diyCouponListUrl = getApiHost() + '/coupon/diyCouponList';

  diyCouponListUrl += '?pageIndex='
  diyCouponListUrl += pageIndex;
  diyCouponListUrl += '&pageSize='
  diyCouponListUrl += pageSize;
  diyCouponListUrl += '&keyword='
  diyCouponListUrl += keyword;

  // console.log(diyCouponListUrl);
  const diyCouponListResponse = await fetch(diyCouponListUrl);
  const diyCouponListResponseJson = await diyCouponListResponse.json();
  return diyCouponListResponseJson;
}

const getMemberListByKeyword = async (keyword) => {
  let memberListUrl = getApiHost() + '/member/memberList';

  memberListUrl += '?keyword='
  memberListUrl += keyword;

  // console.log(memberListUrl);
  const memberListResponse = await fetch(memberListUrl);
  const memberListResponseJson = await memberListResponse.json();
  return memberListResponseJson;
}

const saveRemarkToCoupon = async (couponId, remarkText) => {
  let saveRemarkUrl = getApiHost() + '/coupon/saveRemark';

  saveRemarkUrl += '?couponId='
  saveRemarkUrl += couponId;
  saveRemarkUrl += '&remark='
  saveRemarkUrl += remarkText;

  // console.log(saveRemarkUrl);
  const saveRemarkResponse = await fetch(saveRemarkUrl);
  const saveRemarkResponseJson = await saveRemarkResponse.json();
  return saveRemarkResponseJson;
}

const sendSMSToMember = async (phoneNumber, templateParam1) => {
  let sendSMSUrl = getApiHost() + '/coupon/sendSMS';

  sendSMSUrl += '?phoneNumber='
  sendSMSUrl += phoneNumber;
  sendSMSUrl += '&templateParam1=';
  sendSMSUrl += templateParam1;

  // console.log(sendSMSUrl);
  const sendSMSResponse = await fetch(sendSMSUrl);
  const sendSMSResponseJson = await sendSMSResponse.json();
  return sendSMSResponseJson;
}

const createDIYEvent = async (started) => {
  let createDIYEventUrl = getApiHost() + '/coupon/createDIYEvent';

  createDIYEventUrl += '?started='
  createDIYEventUrl += started;

  // console.log(createDIYEventUrl);
  const createDIYEventResponse = await fetch(createDIYEventUrl);
  const createDIYEventResponseJson = await createDIYEventResponse.json();
  return createDIYEventResponseJson;
}

const DIYEventList = async () => {
  let DIYEventListUrl = getApiHost() + '/coupon/DIYEventList';

  // console.log(DIYEventListUrl);
  const DIYEventListResponse = await fetch(DIYEventListUrl);
  const DIYEventListResponseJson = await DIYEventListResponse.json();
  return DIYEventListResponseJson;
}

const DeleteDIYEvent = async (_id) => {
  let deleteDIYEventUrl = getApiHost() + '/coupon/DeleteDIYEvent';
  deleteDIYEventUrl += '?_id='
  deleteDIYEventUrl += _id;

  // console.log(deleteDIYEventUrl);
  const DeleteDIYEventResponse = await fetch(deleteDIYEventUrl);
  const DeleteDIYEventResponseJson = await DeleteDIYEventResponse.json();
  return DeleteDIYEventResponseJson;
}

const JoinToEvent = async (couponId, memberName, eventId) => {
  let joinToEventUrl = getApiHost() + '/coupon/joinToEvent';
  joinToEventUrl += '?couponId='
  joinToEventUrl += couponId;
  joinToEventUrl += '&memberName='
  joinToEventUrl += memberName;
  joinToEventUrl += '&eventId='
  joinToEventUrl += eventId;

  // console.log(joinToEventUrl);
  const joinToEventUrlResponse = await fetch(joinToEventUrl);
  const joinToEventUrlResponseJson = await joinToEventUrlResponse.json();
  return joinToEventUrlResponseJson;
}

const sendSMSAndJoinToEvent = async (
  phoneNumber, templateParam1,
  couponId, memberName, eventId) => {
  let sendSMSAndJoinToEventUrl = getApiHost() + '/coupon/sendSMSAndJoinToEvent';

  sendSMSAndJoinToEventUrl += '?phoneNumber='
  sendSMSAndJoinToEventUrl += phoneNumber;
  sendSMSAndJoinToEventUrl += '&templateParam1=';
  sendSMSAndJoinToEventUrl += templateParam1;
  sendSMSAndJoinToEventUrl += '&couponId='
  sendSMSAndJoinToEventUrl += couponId;
  sendSMSAndJoinToEventUrl += '&memberName='
  sendSMSAndJoinToEventUrl += memberName;
  sendSMSAndJoinToEventUrl += '&eventId='
  sendSMSAndJoinToEventUrl += eventId;

  // console.log(sendSMSAndJoinToEventUrl);
  const sendSMSAndJoinToEventResponse = await fetch(sendSMSAndJoinToEventUrl);
  const sendSMSAndJoinToEventResponseJson = await sendSMSAndJoinToEventResponse.json();
  return sendSMSAndJoinToEventResponseJson;
}

const LeaveFromEvent = async (couponId, memberName, eventId) => {
  let LeaveFromEventUrl = getApiHost() + '/coupon/leaveFromEvent';
  LeaveFromEventUrl += '?couponId='
  LeaveFromEventUrl += couponId;
  LeaveFromEventUrl += '&memberName='
  LeaveFromEventUrl += memberName;
  LeaveFromEventUrl += '&eventId='
  LeaveFromEventUrl += eventId;

  // console.log(LeaveFromEventUrl);
  const leaveFromEventUrlResponse = await fetch(LeaveFromEventUrl);
  const leaveFromEventUrlResponseJson = await leaveFromEventUrlResponse.json();
  return leaveFromEventUrlResponseJson;
}

const saveLastPage = async (page) => {
  let saveLastPageUrl = getApiHost() + '/coupon/saveLastPage';
  saveLastPageUrl += '?page='
  saveLastPageUrl += page;

  // console.log(saveLastPageUrl);
  const saveLastPageResponse = await fetch(saveLastPageUrl);
  const saveLastPageResponseJson = await saveLastPageResponse.json();
  return saveLastPageResponseJson;
}

const getLastPage = async () => {
  let getLastPageUrl = getApiHost() + '/coupon/getLastPage';

  // console.log(getLastPageUrl);
  const getLastPageResponse = await fetch(getLastPageUrl);
  const getLastPageResponseJson = await getLastPageResponse.json();
  return getLastPageResponseJson;
}

const loadElemeProducts = async () => {
  let loadElemeProductsUrl = getApiHost() + '/product/loadElemeProducts';
  loadElemeProductsUrl += '?userId=';
  loadElemeProductsUrl += '3995767';
  loadElemeProductsUrl += '&categoryId=';
  loadElemeProductsUrl += '&status=';
  loadElemeProductsUrl += '&keyword=';


  // console.log(loadElemeProductsUrl);
  const loadElemeProductsResponse = await fetch(loadElemeProductsUrl);
  const loadElemeProductsResponseJson = await loadElemeProductsResponse.json();
  return loadElemeProductsResponseJson;
}

const loadProductsSale = async (categoryId, userIds, isSellWell, beginDateTime, endDateTime, orderColumn, asc) => {
  let loadProductsSaleUrl = getApiHost() + '/product/loadProductsSale';
  loadProductsSaleUrl += '?categoryId=';
  loadProductsSaleUrl += categoryId;

  loadProductsSaleUrl += '&userIds=';
  loadProductsSaleUrl += userIds;

  loadProductsSaleUrl += '&isSellWell=';
  loadProductsSaleUrl += isSellWell;
  loadProductsSaleUrl += '&beginDateTime=';
  loadProductsSaleUrl += beginDateTime;
  loadProductsSaleUrl += '&endDateTime=';
  loadProductsSaleUrl += endDateTime;
  loadProductsSaleUrl += '&orderColumn=';
  loadProductsSaleUrl += orderColumn;
  loadProductsSaleUrl += '&asc=';
  loadProductsSaleUrl += asc;

  // console.log(loadProductsSaleUrl);
  const loadProductsSaleResponse = await fetch(loadProductsSaleUrl);
  const loadProductsSaleResponseJson = await loadProductsSaleResponse.json();
  return loadProductsSaleResponseJson;
}

const loadBirthdayCakesRecommend = async () => {
  let loadBirthdayCakesUrl = '/image/生日蛋糕/蛋糕3.0/a-推荐蛋糕.json';
  loadBirthdayCakesUrl += '?random=';
  loadBirthdayCakesUrl += Math.floor(Math.random() * 1000);

  const loadBirthdayCakesResponse = await fetch(loadBirthdayCakesUrl, { mode: 'no-cors' });
  const loadBirthdayCakesResponseJson = await loadBirthdayCakesResponse.json();
  return loadBirthdayCakesResponseJson;
}

const loadBirthdayCakesAll = async () => {
  let loadBirthdayCakesUrl = '/image/生日蛋糕/蛋糕3.0/a-所有蛋糕.json';
  loadBirthdayCakesUrl += '?random=';
  loadBirthdayCakesUrl += Math.floor(Math.random() * 1000);

  const loadBirthdayCakesResponse = await fetch(loadBirthdayCakesUrl, { mode: 'no-cors' });
  const loadBirthdayCakesResponseJson = await loadBirthdayCakesResponse.json();
  return loadBirthdayCakesResponseJson;
}

const loadBirthdayCakesWXConfig = async () => {
  let loadBirthdayCakesUrl = '/image/生日蛋糕/蛋糕3.0/a-微信配置.json';
  loadBirthdayCakesUrl += '?random=';
  loadBirthdayCakesUrl += Math.floor(Math.random() * 1000);

  const loadBirthdayCakesResponse = await fetch(loadBirthdayCakesUrl, { mode: 'no-cors' });
  const loadBirthdayCakesResponseJson = await loadBirthdayCakesResponse.json();
  return loadBirthdayCakesResponseJson;
}

const loadFoodsRecommend = async () => {
  let loadFoodsRecommendUrl = '/image/面包牛奶/a-推荐面包牛奶.json';
  loadFoodsRecommendUrl += '?random=';
  loadFoodsRecommendUrl += Math.floor(Math.random() * 1000);

  const loadFoodsRecommendResponse = await fetch(loadFoodsRecommendUrl, { mode: 'no-cors' });
  const loadFoodsRecommendResponseJson = await loadFoodsRecommendResponse.json();
  return loadFoodsRecommendResponseJson;
}

const loadBreadAll = async () => {
  let loadBreadAllUrl = '/image/面包牛奶/a-所有面包牛奶.json';
  loadBreadAllUrl += '?random=';
  loadBreadAllUrl += Math.floor(Math.random() * 1000);

  const loadBreadAllResponse = await fetch(loadBreadAllUrl, { mode: 'no-cors' });
  const loadBreadAllResponseJson = await loadBreadAllResponse.json();
  return loadBreadAllResponseJson;
}

const wechatSign = async (url) => {
  let wechatSignUrl = getApiHost() + '/wechat/sign';
  wechatSignUrl += '?url=';
  wechatSignUrl += url;

  // console.log(wechatSignUrl);
  const wechatSignResponse = await fetch(wechatSignUrl);
  const wechatSignResponseJson = await wechatSignResponse.json();
  return wechatSignResponseJson;
}

const templateSendToSomePeople =
  async (_id, shop, orderTime,
    cakeName, nameWithPhone, deliverTime
  ) => {
    let templateSendUrl = getApiHost() + '/wechat/templateSendToSomePeople';

    let sendParamObj = {
      _id: _id,
      shop: shop,
      orderTime: orderTime,
      cakeName: cakeName,
      nameWithPhone: nameWithPhone,
      deliverTime: deliverTime
    };

    // console.log(templateSendUrl);
    const templateSendResponse = await fetch(templateSendUrl, {
      method: 'post',
      body: JSON.stringify(sendParamObj),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const templateSendResponseJson = await templateSendResponse.json();
    return templateSendResponseJson;
  }

const geocode = async (address, city) => {
  let geocodeUrl = getApiHost() + '/amap/geocode';
  geocodeUrl += '?address='
  geocodeUrl += address;
  geocodeUrl += '&city='
  geocodeUrl += city;

  // console.log(geocodeUrl);
  const geocodeResponse = await fetch(geocodeUrl);
  const geocodeResponseJson = await geocodeResponse.json();
  return geocodeResponseJson;
}

const createCakeOrder = async (
  name,
  description,
  cream,
  size,
  sizeExtra,
  price,
  fillings,
  candle,
  candleExtra,
  kindling,
  hat,
  plates,
  pickUpDay,
  pickUpTime,
  pickUpType,
  shop,
  address,
  pickUpName,
  phoneNumber,
  remarks
) => {
  let createCakeOrderUrl = getApiHost() + '/cake/createOrder';

  let creatParamObj = {
    name: name,
    description: description,
    cream: cream,
    size: size,
    sizeExtra: sizeExtra,
    price: price,
    fillings: fillings,
    candle: candle,
    candleExtra: candleExtra,
    kindling: kindling,
    hat: hat,
    plates: plates,
    pickUpDay: pickUpDay,
    pickUpTime: pickUpTime,
    pickUpType: pickUpType,
    shop: shop,
    address: address,
    pickUpName: pickUpName,
    phoneNumber: phoneNumber,
    remarks: remarks
  };

  // console.log(createCakeOrderUrl);
  const createCakeOrderResponse = await fetch(createCakeOrderUrl, {
    method: 'post',
    body: JSON.stringify(creatParamObj),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const createCakeOrderResponseJson = await createCakeOrderResponse.json();
  return createCakeOrderResponseJson;
}

const findCakeOrder = async (_id) => {
  let findCakeOrderUrl = getApiHost() + '/cake/findOrder';
  findCakeOrderUrl += '?_id='
  findCakeOrderUrl += _id;

  // console.log(findCakeOrderUrl);
  const findCakeOrderResponse = await fetch(findCakeOrderUrl);
  const findCakeOrderResponseJson = await findCakeOrderResponse.json();
  return findCakeOrderResponseJson;
}

const allCakeInfos = async () => {
  let allCakeInfosUrl = '/生日蛋糕/1a-蛋糕信息.json';
  allCakeInfosUrl += '?random=';
  allCakeInfosUrl += Math.floor(Math.random() * 1000);

  const allCakeInfosResponse = await fetch(allCakeInfosUrl);
  const allCakeInfosResponseJson = await allCakeInfosResponse.json();

  let cakeInfos = {};
  cakeInfos.creams = allCakeInfosResponseJson.creams;
  cakeInfos.sizes = allCakeInfosResponseJson.sizes;
  cakeInfos.fillings = allCakeInfosResponseJson.fillings;
  cakeInfos.candles = allCakeInfosResponseJson.candles;
  cakeInfos.kindlings = allCakeInfosResponseJson.kindlings;
  cakeInfos.hats = allCakeInfosResponseJson.hats;
  cakeInfos.pickUpTypes = allCakeInfosResponseJson.pickUpTypes;
  cakeInfos.shops = allCakeInfosResponseJson.shops;
  cakeInfos.private = allCakeInfosResponseJson.private;
  cakeInfos.categorys = allCakeInfosResponseJson.categorys;
  cakeInfos.products = allCakeInfosResponseJson.products;
  cakeInfos.recommend = allCakeInfosResponseJson.recommend;
  cakeInfos.weixin = allCakeInfosResponseJson.weixin;

  for (let i = 0; i < cakeInfos.products.length; ++i) {
    let product = cakeInfos.products[i];
    for (let j = 0; j < cakeInfos.recommend.productNames.length; ++j) {
      let productName = cakeInfos.recommend.productNames[j];
      if (productName === product.name) {
        /// 补上默认夹心数量
        if (product.fillingNumber === undefined) {
          product.fillingNumber = 2;
        }
        product.sortId = j;
        cakeInfos.recommend.products.push(product);
        break;
      }
    }

    for (let k = 0; k < cakeInfos.categorys.length; ++k) {
      let category = cakeInfos.categorys[k];
      if (product.categoryId === category.id) {
        category.products.push(product);
        break;
      }
    }
  }

  /// 根据sortId排序，sortId是位置索引
  cakeInfos.recommend.products =
    cakeInfos.recommend.products.sort((a, b) => a.sortId - b.sortId);

  return cakeInfos;
}

const allBreadInfos = async () => {
  let allBreadInfosUrl = '/面包/1a-面包信息.json';
  allBreadInfosUrl += '?random=';
  allBreadInfosUrl += Math.floor(Math.random() * 1000);

  const allBreadInfosResponse = await fetch(allBreadInfosUrl);
  const allBreadInfosResponseJson = await allBreadInfosResponse.json();

  let breadInfos = {};
  breadInfos.categorys = allBreadInfosResponseJson.categorys;
  breadInfos.products = allBreadInfosResponseJson.products;
  breadInfos.recommend = allBreadInfosResponseJson.recommend;
  breadInfos.weixin = allBreadInfosResponseJson.weixin;

  for (let i = 0; i < breadInfos.products.length; ++i) {
    let product = breadInfos.products[i];

    for (let j = 0; j < breadInfos.recommend.productNames.length; ++j) {
      let productName = breadInfos.recommend.productNames[j];
      if (productName === product.name) {
        let productNew = JSON.parse(JSON.stringify(product));
        productNew.sortId = j;
        productNew.buyNumber = 0;
        breadInfos.recommend.products.push(productNew);
        break;
      }
    }

    for (let k = 0; k < breadInfos.categorys.length; ++k) {
      let category = breadInfos.categorys[k];
      if (product.categoryId === category.id) {
        let productNew = JSON.parse(JSON.stringify(product));
        productNew.buyNumber = 0;
        category.products.push(productNew);
        break;
      }
    }
  }

  /// 根据sortId排序，sortId是位置索引
  breadInfos.recommend.products =
    breadInfos.recommend.products.sort((a, b) => a.sortId - b.sortId);

  return breadInfos;
}

export {
  getProductSaleList,
  getProductDiscardList,
  getProductSaleAndDiscardList,
  getCouponSummaryList,
  getProductOrderList,
  getProductFlowList,
  getFlowDetail,
  getProductOrderItems,
  findTemplate,
  loadProductsByKeyword,
  createStockFlowOut,
  refuseStockFlow,
  confirmStockFlow,
  getDIYCouponList,
  getMemberListByKeyword,
  saveRemarkToCoupon,
  sendSMSToMember,
  createDIYEvent,
  DIYEventList,
  DeleteDIYEvent,
  JoinToEvent,
  LeaveFromEvent,
  sendSMSAndJoinToEvent,
  saveLastPage,
  getLastPage,
  loadElemeProducts,
  loadProductsSale,
  loadBirthdayCakesRecommend,
  loadBirthdayCakesAll,
  loadBirthdayCakesWXConfig,
  loadFoodsRecommend,
  loadBreadAll,
  wechatSign,
  templateSendToSomePeople,
  geocode,
  createCakeOrder,
  findCakeOrder,
  allCakeInfos,
  allBreadInfos
};
