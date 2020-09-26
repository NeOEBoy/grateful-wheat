var express = require('express');
var router = express.Router();
const { signIn } = require('../pospal/pospal');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', async function (req, res, next) {
  try {
    let thePOSPALAUTH30220 = await signIn();
    res.send(thePOSPALAUTH30220);
  } catch (err) {
    next(err)
  }
});

module.exports = router;
