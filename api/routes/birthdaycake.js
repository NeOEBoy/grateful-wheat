var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const models = require('../stores/models');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/createOrder', async function (req, res, next) {
    try {
        let cakeName = req.query.cakeName;
        if (!cakeName) {
            next(createError(500));
            return;
        }

        let BirthdayCakeOrders = models.BirthdayCakeOrders;
        let count = await BirthdayCakeOrders.countDocuments();
        if (count >= 1) {
            let firstOrder = await BirthdayCakeOrders.find(
                {}).limit(1).exec();
            if (firstOrder && firstOrder.length >= 1) {
                let deleteOneResult = await BirthdayCakeOrders.deleteOne(
                    { "_id": firstOrder[0]._id }).exec();
                console.log(deleteOneResult);
            }
        }

        let newOrder = new BirthdayCakeOrders({
            cakeName: cakeName
        });
        await newOrder.save();
        res.send({ errCode: 0, _id: newOrder._id });
    } catch (err) {
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

        let BirthdayCakeOrders = models.BirthdayCakeOrders;
        let order = await BirthdayCakeOrders.findOne({ _id: _id });
        if (order) {
            res.send({ errCode: 0, order: order });
            return;
        }
        res.send({ errCode: -1 });
    } catch (err) {
        next(err)
    }
});

module.exports = router;
