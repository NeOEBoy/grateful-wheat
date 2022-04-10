var express = require('express');
var router = express.Router();
var createError = require('http-errors');

const {
  signIn,
  getProductSaleList,
  getProductOrderItem,
  getProductDiscardList,
  getProductSaleAndDiscardList,
  getProductOrderList,
  findTemplate,
  loadProductsByKeyword,
  createStockFlowOut,
  refuseStockFlow,
  confirmStockFlow,
  getProductFlowList,
  getProductFlowDetail,
  loadElemeProducts,
  loadProductsSale
} = require('../third/pospal');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/saleList', async function (req, res, next) {
  try {
    let pageIndex = req.query.pageIndex;
    let pageSize = req.query.pageSize;
    let userId = req.query.userId;
    let beginDateTime = req.query.beginDateTime;
    let endDateTime = req.query.endDateTime;
    let keyword = req.query.keyword;

    if (!beginDateTime || !endDateTime || !pageIndex || !pageSize) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let productSaleResponseJson = await getProductSaleList(
      thePOSPALAUTH30220,
      beginDateTime,
      endDateTime,
      userId,
      pageIndex,
      pageSize,
      keyword);
    res.send(productSaleResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/orderList', async function (req, res, next) {
  try {
    let userId = req.query.userId;
    let templateId = req.query.templateId;
    let timeType = req.query.timeType;
    let beginDateTime = req.query.beginDateTime;
    let endDateTime = req.query.endDateTime;

    if (!beginDateTime || !endDateTime) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let productOrderResponseJson = await getProductOrderList(
      thePOSPALAUTH30220,
      userId,
      templateId,
      timeType,
      beginDateTime,
      endDateTime);
    res.send(productOrderResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/orderItems', async function (req, res, next) {
  try {
    let orderId = req.query.orderId;

    if (!orderId) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let productOrderItemResponseJson = await getProductOrderItem(thePOSPALAUTH30220, orderId);
    res.send(productOrderItemResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/findTemplate', async function (req, res, next) {
  try {
    // console.log('router findTemplate start');

    let templateUid = req.query.templateUid;

    if (!templateUid) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let findTemplateResponseJson = await findTemplate(thePOSPALAUTH30220, templateUid);
    res.send(findTemplateResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/loadProductsByKeyword', async function (req, res, next) {
  try {
    // console.log('router loadProductsByKeyword start');

    let keyword = req.query.keyword;

    if (!keyword) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let loadProductsByKeywordResponseJson = await loadProductsByKeyword(thePOSPALAUTH30220, keyword);
    res.send(loadProductsByKeywordResponseJson);
  } catch (err) {
    next(err)
  }
});

router.post('/createStockFlowOut', async function (req, res, next) {
  try {
    console.log('router createStockFlowOut start');

    let toUserId = req.body.toUserId;
    // console.log('toUserId = ' + toUserId);
    let items = req.body.items;
    // console.log('items = ' + items);

    if (!toUserId) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let createStockFlowOutResponseJson = await createStockFlowOut(thePOSPALAUTH30220, toUserId, items);
    res.send(createStockFlowOutResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/refuseStockFlow', async function (req, res, next) {
  try {
    console.log('router refuseStockFlow start');

    let flowId = req.query.flowId;
    if (!flowId) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let refuseStockFlowResponseJson = await refuseStockFlow(thePOSPALAUTH30220, flowId);
    res.send(refuseStockFlowResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/confirmStockFlow', async function (req, res, next) {
  try {
    console.log('router confirmStockFlow start');

    let flowId = req.query.flowId;
    if (!flowId) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let confirmStockFlowResponseJson = await confirmStockFlow(thePOSPALAUTH30220, flowId);
    res.send(confirmStockFlowResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/flowList', async function (req, res, next) {
  try {
    let userId = req.query.userId;
    let flowTypeId = req.query.flowTypeId;
    let beginDateTime = req.query.beginDateTime;
    let endDateTime = req.query.endDateTime;

    if (!beginDateTime || !endDateTime) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let productFlowListResponseJson = await getProductFlowList(
      thePOSPALAUTH30220,
      userId,
      flowTypeId,
      beginDateTime,
      endDateTime);
    res.send(productFlowListResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/flowDetail', async function (req, res, next) {
  try {
    let flowId = req.query.flowId;
    if (!flowId) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let productFlowDetailResponseJson = await getProductFlowDetail(
      thePOSPALAUTH30220,
      flowId);
    res.send(productFlowDetailResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/discardList', async function (req, res, next) {
  try {
    let userId = req.query.userId;
    let beginDateTime = req.query.beginDateTime;
    let endDateTime = req.query.endDateTime;
    let keyword = req.query.keyword;

    if (!beginDateTime || !endDateTime) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let productDiscardResponseJson = await getProductDiscardList(
      thePOSPALAUTH30220,
      userId,
      beginDateTime,
      endDateTime,
      keyword);
    res.send(productDiscardResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/saleAndDiscardList', async function (req, res, next) {
  try {
    let userId = req.query.userId;
    let categoryId = req.query.categoryId;
    let beginDateTime = req.query.beginDateTime;
    let endDateTime = req.query.endDateTime;
    let keyword = req.query.keyword;

    if (!beginDateTime || !endDateTime) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let productSaleAndDiscardResponseJson = await getProductSaleAndDiscardList(
      thePOSPALAUTH30220,
      userId,
      categoryId,
      beginDateTime,
      endDateTime,
      keyword);
    res.send(productSaleAndDiscardResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/loadElemeProducts', async function (req, res, next) {
  try {
    let userId = req.query.userId;
    let categoryId = req.query.categoryId;
    let status = req.query.status;
    let keyword = req.query.keyword;

    if (!userId) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let loadElemeProductsResponseJson = await loadElemeProducts(
      thePOSPALAUTH30220,
      userId,
      categoryId,
      status,
      keyword);
    res.send(loadElemeProductsResponseJson);
  } catch (err) {
    next(err)
  }
});

router.get('/loadProductsSale', async function (req, res, next) {
  try {
    let categoryId = req.query.categoryId;
    let userId = req.query.userId;
    let isSellWell = req.query.isSellWell;
    let beginDateTime = req.query.beginDateTime;
    let endDateTime = req.query.endDateTime;
    let orderColumn = req.query.orderColumn;
    let asc = req.query.asc;

    if (!categoryId) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let loadProductsSaleResponseJson = await loadProductsSale(
      thePOSPALAUTH30220,
      categoryId,
      userId,
      isSellWell,
      beginDateTime,
      endDateTime,
      orderColumn,
      asc);
    res.send(loadProductsSaleResponseJson);
  } catch (err) {
    next(err)
  }
});

module.exports = router;
