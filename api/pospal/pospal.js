const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;

const signIn = async () => {
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
  console.log(productSaleBody);

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

          /// 优惠劵面值金额
          let faceValue = element.td[3]._;
          // console.log(faceValue);
          couponItem.faceValue = faceValue;

          /// 优惠劵赠送数量
          let presentNumber = '0';
          if(element.td[4]._) {
            presentNumber = element.td[4]._.trim();
          } else {
            presentNumber = element.td[4].a[0]._.trim();
          }
          // console.log(element.td[4]);
          couponItem.presentNumber = presentNumber;
          couponItem.presentValue = (parseInt(presentNumber) * parseFloat(faceValue)).toFixed(2);

          /// 优惠劵销售数量
          let saleNumber = element.td[5]._;
          // console.log(saleNumber);
          couponItem.saleNumber = saleNumber;
          couponItem.saleValue = (parseInt(saleNumber) * parseFloat(faceValue)).toFixed(2);

          /// 优惠劵核销数量
          let writeOffNumber = element.td[8]._;
          // console.log(writeOffNumber);
          couponItem.writeOffNumber = writeOffNumber;
          couponItem.writeOffValue = (parseInt(writeOffNumber) * parseFloat(faceValue)).toFixed(2);

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

module.exports = {
  signIn,
  getProductSaleList,
  getProductDiscardList,
  getProductSaleAndDiscardList,
  getCouponSummaryList
};