var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const {
  signIn,
  getCouponSummaryList,
  getDIYCouponList
} = require('../pospal/pospal');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/couponSummaryList', async function (req, res, next) {
  try {
    let userId = req.query.userId;
    let beginDateTime = req.query.beginDateTime;
    let endDateTime = req.query.endDateTime;

    if (!beginDateTime || !endDateTime) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let couponSummaryListResponseJson = await getCouponSummaryList(
      thePOSPALAUTH30220,
      userId,
      beginDateTime,
      endDateTime);
    res.send(couponSummaryListResponseJson);
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/diyCouponList', async function (req, res, next) {
  try {
    let pageIndex = req.query.pageIndex;
    let pageSize = req.query.pageSize;

    if (!pageIndex || !pageSize) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let diyCouponListResponseJson = await getDIYCouponList(
      thePOSPALAUTH30220,
      pageIndex, pageSize);
    res.send(diyCouponListResponseJson);
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

module.exports = router;
