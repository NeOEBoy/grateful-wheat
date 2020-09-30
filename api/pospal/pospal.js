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

const getProductSaleList = async (thePOSPALAUTH30220, whichDate, userId, pageIndex, pageSize) => {
  let productSaleUrl = 'https://beta33.pospal.cn/ReportV2/LoadProductSaleByPage';
  let productSaleBody = '';
  productSaleBody += 'keyword=&';
  if (userId) {
    productSaleBody += 'userIds%5B%5D=' + userId + '&';
  }
  productSaleBody += 'isSellWell=1&';
  productSaleBody += 'beginDateTime=' + whichDate + '+00%3A00%3A00&';
  productSaleBody += 'endDateTime=' + whichDate + '+23%3A59%3A59&';
  productSaleBody += 'productbrand=&';
  productSaleBody += 'supplierUid=&';
  productSaleBody += 'productTagUidsJson=&';
  productSaleBody += 'categorysJson=%5B%5D&';
  productSaleBody += 'isCustomer=&';
  productSaleBody += 'pageIndex=' + pageIndex + '&';
  productSaleBody += 'pageSize=' + pageSize + '&';
  productSaleBody += 'orderColumn=totoalProductNum&';
  productSaleBody += 'asc=false';

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

const getProductDiscardList = async (thePOSPALAUTH30220, whichDate, userId) => {
  let productDiscardUrl = 'https://beta33.pospal.cn/Inventory/LoadDiscardProductCountList';
  let productDiscardBody = '';
  productDiscardBody += 'userId=' + userId + '&';
  productDiscardBody += 'categoryUids=%5B%5D&';
  productDiscardBody += 'reasonName=&';
  productDiscardBody += 'keyword=&';
  productDiscardBody += 'beginDateTime=' + whichDate + '+00%3A00%3A00&';
  productDiscardBody += 'endDateTime=' + whichDate + '+23%3A59%3A59';

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

module.exports = {
  signIn,
  getProductSaleList,
  getProductDiscardList
};