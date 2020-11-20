var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const {
  signIn,
  getMemberList
} = require('../pospal/pospal');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/memberList', async function (req, res, next) {
  try {
    let keyword = req.query.keyword;

    if (!keyword) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let memberListResponseJson = await getMemberList(
      thePOSPALAUTH30220, keyword);
    res.send(memberListResponseJson);
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

module.exports = router;