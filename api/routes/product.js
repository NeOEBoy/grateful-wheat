var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const {
  signIn,
  getProductSaleList,
  getProductDiscardList,
  getProductSaleAndDiscardList,
  getProductOrderList
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
      beginDateTime,
      endDateTime);
    res.send(productOrderResponseJson);
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

module.exports = router;
