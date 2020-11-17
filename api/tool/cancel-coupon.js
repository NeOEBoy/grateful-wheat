const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;

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

const getPromotionCouponIdByName = async (thePOSPALAUTH30220, name) => {
  const loadPromotionCouponsByPageResponseJson = await loadPromotionCoupon(thePOSPALAUTH30220, name);
  const promotionCouponId = await parsePromotionCoupon(loadPromotionCouponsByPageResponseJson);
  return promotionCouponId;
}

const loadPromotionCoupon = async (thePOSPALAUTH30220, keyword) => {
  let loadPromotionCouponsByPageUrl = 'https://beta33.pospal.cn/Promotion/LoadPromotionCouponsByPage';

  let loadPromotionCouponsByPageBodyStr = '';
  loadPromotionCouponsByPageBodyStr += 'userId=3995763';
  loadPromotionCouponsByPageBodyStr += '&promotionCouponType=';
  loadPromotionCouponsByPageBodyStr += '&status=';
  loadPromotionCouponsByPageBodyStr += '&pageIndex=1';
  loadPromotionCouponsByPageBodyStr += '&pageSize=50';
  loadPromotionCouponsByPageBodyStr += '&orderColumn=';
  loadPromotionCouponsByPageBodyStr += '&asc=false';
  loadPromotionCouponsByPageBodyStr += '&keyword=';
  loadPromotionCouponsByPageBodyStr += keyword;

  // userId=3995763&promotionCouponType=&status=&keyword=%E5%93%81%E7%B1%BB%E4%BC%98%E6%83%A0%E6%B5%8B%E8%AF%95%E5%88%B8&pageIndex=1&pageSize=50&orderColumn=&asc=false
  const loadPromotionCouponsByPageResponse = await fetch(loadPromotionCouponsByPageUrl, {
    method: 'POST', body: loadPromotionCouponsByPageBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const loadPromotionCouponsByPageResponseJson = await loadPromotionCouponsByPageResponse.json();
  return loadPromotionCouponsByPageResponseJson;
}

const parsePromotionCoupon = async (loadPromotionCouponsByPageResponseJson) => {
  let promotionCouponId = '';

  if (loadPromotionCouponsByPageResponseJson.successed) {
    let contentView = loadPromotionCouponsByPageResponseJson.contentView;
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
        let trLength = trArray.length;

        if (trLength === 0) {
          throw new Error('查找不到对应优惠券!!!');
        }

        /// 严格上，精准查找不允许出现超过2项，所以超过1项的时候报错。
        if (trLength > 1) {
          throw new Error('当前关键字存在多个优惠劵!!!');
        }

        let tr0Property = trArray[0].$;
        if (tr0Property.CLASS === 'noRecord') {
          throw new Error('查找不到对应优惠券!!!');
        }
        promotionCouponId = tr0Property['DATA-UID'];
      }
    } catch (error) {
      console.log('运行出错===>' + error);
    }
  }

  return promotionCouponId;
}

const cancelCouponByIdAndParse = async (thePOSPALAUTH30220, couponId, couponUserId) => {
  const cancelCouponResponseJson = await cancelCouponById(thePOSPALAUTH30220, couponId, couponUserId);
  return parseCancelCoupon(cancelCouponResponseJson);
}

const cancelCouponById = async (thePOSPALAUTH30220, couponId, couponUserId) => {
  let cancelCouponUrl = 'https://beta33.pospal.cn/Promotion/CancelCouponCodes';

  let cancelCouponBodyStr = '';
  cancelCouponBodyStr += 'userId=3995763';//3995763 总部uid
  cancelCouponBodyStr += '&codes%5B%5D=';
  cancelCouponBodyStr += couponId;
  cancelCouponBodyStr += '&promotionCouponUid=';
  cancelCouponBodyStr += couponUserId;
  cancelCouponBodyStr += '&couponUserId=3995763';

  // console.log(cancelCouponBodyStr);
  // userId=3995763&codes%5B%5D=425657132&promotionCouponUid=1605582777961855458&couponUserId=3995763

  const cancelCouponResponse = await fetch(cancelCouponUrl, {
    method: 'POST', body: cancelCouponBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const cancelCouponResponseJson = await cancelCouponResponse.json();
  return cancelCouponResponseJson;
}

const parseCancelCoupon = async (cancelCouponResponseJson) => {
  let cancelText = '接口调用不成功！！！';
  // console.log(cancelCouponResponseJson);

  if(cancelCouponResponseJson.successed) {
    cancelText = '已经成功作废优惠券。';
  }

  return cancelText;
}

const startCancel = async (couponId, couponName) => {
  /// 登录并获取验证信息
  const thePOSPALAUTH30220 = await siginAndGetPOSPALAUTH30220();
  // console.log(thePOSPALAUTH30220);

  /// 根据名字获取优惠券的id
  const promotionCouponId = await getPromotionCouponIdByName(thePOSPALAUTH30220, couponName);
  // console.log(promotionCouponId);

  /// 作废优惠券
  if(promotionCouponId) {
    let cancelText = await cancelCouponByIdAndParse(thePOSPALAUTH30220, couponId, promotionCouponId);
    console.log(cancelText);
  }
}

var args = process.argv.splice(2);
// args[0]='877461508' args[1]='品类优惠测试券'
if(args.length !== 2) {
  console.log('参数错误，第一个参数为优惠券id，第二个参数为优惠劵种类id');
} else {
  startCancel(args[0], args[1]);
}
