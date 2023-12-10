var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const models = require('../stores/models');
const { makeSuccessResJson } = require('../tool/res-json-maker');
var that = this;

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/orders', async function (req, res, next) {
    try {
        console.log('get orders');
        console.log('req.query = ' + JSON.stringify(req.query));
        const current = parseInt(req.query.current);
        const pageSize = parseInt(req.query.pageSize);

        if (current < 1 || pageSize < 1)
            return next(createError(500));

        const filterData = {};

        const skip = (current - 1) * pageSize;
        const limit = pageSize;
        let CakeOrders = models.CakeOrders;
        const total = await CakeOrders.countDocuments();

        let orderFinded = await CakeOrders.find().sort({ _id: -1 }).skip(skip).limit(limit).exec();

        const resJson = makeSuccessResJson(orderFinded, total);
        // console.log('resJson = ' + JSON.stringify(resJson));
        res.status(200).send(resJson);
    } catch (err) {
        console.log('err = ' + err);
        next(err)
    }
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
        const KMaxCount4Order = 100;
        for (; ;) {
            let count = await CakeOrders.countDocuments();
            console.log('数量为：' + count);

            if (count < KMaxCount4Order) {
                break;
            }

            let firstOrder = await CakeOrders.find(
                {}).limit(1).exec();
            if (firstOrder && firstOrder.length >= 1) {
                let deleteOneResult = await CakeOrders.deleteOne(
                    { "_id": firstOrder[0]._id }).exec();
                console.log('超过 ' + KMaxCount4Order + ' 条，删除最早一条: ');
                console.log(deleteOneResult);
            }
        }

        let newOrder = new CakeOrders({
            createdAt: new Date(),
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
        let order = await newOrder.save();
        console.log(order);
        console.log('that.theWebSocket = ' + that.theWebSocket);
        that.theWebSocket?.send(`订单已创建~`);
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

/**
 * route.ws('/url',(ws, req)=>{  })
 * 建立WebSocket服务，并指定对应接口url，及相应回调
 * ws为实例化的对象，req即为请求
 * 
 * ws.send方法用来向客户端发送信息
 * ws.on方法用于监听事件（如监听message事件，或监听close事件）
 * */

router.ws('/ws4Order', (ws, req) => {
    try {
        console.log('ws ws4Order');
        console.log('that = ' + that);
        that.theWebSocket = ws;
        ws.send('已连接');

        // ws.on('message', function (msg) {
        //     ws.send(`ws收到客户端的消息为：${msg}，再返回去`);
        // });

        // 使用定时器不停的向客户端推动消息
        // let timer = setInterval(() => {
        //     ws.send(`ws服务端定时推送消息: ` + Math.random());
        // }, 1000);

        // ws.on('close', function (e) {
        //     console.log('ws连接关闭');
        //     clearInterval(timer);
        //     timer = null;
        // })
    } catch (err) {
        console.log('err = ' + err);
        next(err)
    }

})

module.exports = router;
