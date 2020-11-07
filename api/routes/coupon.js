var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const {
  signIn,
  getCouponSummaryList
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

module.exports = router;
