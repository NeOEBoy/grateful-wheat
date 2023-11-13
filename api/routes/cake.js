var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const models = require('../stores/models');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/createOrder', async function (req, res, next) {
    try {
        console.log('post createOrder');

        let body = req.body;
        if (!body.name) {
            next(createError(500));
            return;
        }

        let CakeOrders = models.CakeOrders;

        /// 删除较老的数据，保证条目不超过固定条数，
        /// 防止数据库过大
        for (; ;) {
            let count = await CakeOrders.countDocuments();
            // console.log('count = ' + count);

            if (count < 50) {
                break;
            }

            let firstOrder = await CakeOrders.find(
                {}).limit(1).exec();
            if (firstOrder && firstOrder.length >= 1) {
                let deleteOneResult = await CakeOrders.deleteOne(
                    { "_id": firstOrder[0]._id }).exec();
                console.log(deleteOneResult);
            }
        }

        let newOrder = new CakeOrders({
            name: body.name,
            description: body.description,
            images: body.images,
            cream: body.cream,
            size: body.size,
            sizeExtra: body.sizeExtra,
            price: body.price,
            fillings: body.fillings,
            candle: body.candle,
            candleExtra: body.candleExtra,
            kindling: body.kindling,
            hat: body.hat,
            plates: body.plates,
            pickUpDay: body.pickUpDay,
            pickUpTime: body.pickUpTime,
            pickUpType: body.pickUpType,
            shop: body.shop,
            height: body.height,
            address: body.address,
            pickUpName: body.pickUpName,
            phoneNumber: body.phoneNumber,
            remarks: body.remarks
        });
        await newOrder.save();
        res.send({ errCode: 0, _id: newOrder._id });
    } catch (err) {
        console.log('err = ' + err);
        next(err)
    }
});

router.get('/findOrder', async function (req, res, next) {
    try {
        let _id = req.query._id;
        if (!_id) {
            next(createError(500));
            return;
        }

        let CakeOrders = models.CakeOrders;
        let order = await CakeOrders.findOne({ _id: _id });
        if (!order) {
            res.send({ errCode: -1 });
            return;
        }
        res.send({ errCode: 0, order: order });
    } catch (err) {
        next(err)
    }
});

module.exports = router;
