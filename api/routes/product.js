var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { signIn, getProductSaleList, getProductDiscardList } = require('../pospal/pospal');

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

router.get('/discardList', async function (req, res, next) {
  try {
    let userId = req.query.userId;
    let date = req.query.date;
    if (!date) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let productDiscardResponseJson = await getProductDiscardList(
      thePOSPALAUTH30220,
      date,
      userId);
    res.send(productDiscardResponseJson);
  } catch (err) {
    next(err)
  }
});

module.exports = router;
