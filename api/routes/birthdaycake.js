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
        let cakeDescription = req.query.cakeDescription;
        let creamType = req.query.creamType;
        let cakeSize = req.query.cakeSize;
        let cakeSizeExtra = req.query.cakeSizeExtra;
        let cakePrice = req.query.cakePrice;
        let cakeFillings = req.query.cakeFillings;
        let candleType = req.query.candleType;
        let ignitorType = req.query.ignitorType;
        let hatType = req.query.hatType;
        let number4candle = req.query.number4candle;
        let cakePlateNumber = req.query.cakePlateNumber;
        let pickUpDay = req.query.pickUpDay;
        let pickUpTime = req.query.pickUpTime;
        let pickUpType = req.query.pickUpType;
        let responseShop = req.query.responseShop;
        let deliverAddress = req.query.deliverAddress;
        let pickUpName = req.query.pickUpName;
        let phoneNumber = req.query.phoneNumber;
        let remarks = req.query.remarks;

        if (!cakeName) {
            next(createError(500));
            return;
        }

        let BirthdayCakeOrders = models.BirthdayCakeOrders;
        let count = await BirthdayCakeOrders.countDocuments();
        if (count >= 50) {
            let firstOrder = await BirthdayCakeOrders.find(
                {}).limit(1).exec();
            if (firstOrder && firstOrder.length >= 1) {
                let deleteOneResult = await BirthdayCakeOrders.deleteOne(
                    { "_id": firstOrder[0]._id }).exec();
                console.log(deleteOneResult);
            }
        }

        let newOrder = new BirthdayCakeOrders({
            cakeName: cakeName,
            cakeDescription: cakeDescription,
            creamType: creamType,
            cakeSize: cakeSize,
            cakeSizeExtra: cakeSizeExtra,
            cakePrice: cakePrice,
            cakeFillings: cakeFillings,
            candleType: candleType,
            ignitorType: ignitorType,
            hatType: hatType,
            number4candle: number4candle,
            cakePlateNumber: cakePlateNumber,
            pickUpDay: pickUpDay,
            pickUpTime: pickUpTime,
            pickUpType: pickUpType,
            responseShop: responseShop,
            deliverAddress: deliverAddress,
            pickUpName: pickUpName,
            phoneNumber: phoneNumber,
            remarks: remarks
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
