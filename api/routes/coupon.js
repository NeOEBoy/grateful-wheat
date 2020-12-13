var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const models = require('../stores/models');
const moment = require('moment');
moment.locale('zh-cn');

const {
  signIn,
  getCouponSummaryList,
  getDIYCouponList,
  saveRemark,
  sendSMS
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
    let keyword = req.query.keyword;

    if (!pageIndex || !pageSize) {
      next(createError(500));
      return;
    }

    let thePOSPALAUTH30220 = await signIn();
    let diyCouponListResponseJson = await getDIYCouponList(
      thePOSPALAUTH30220,
      pageIndex, pageSize, keyword);
    res.send(diyCouponListResponseJson);
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/saveRemark', async function (req, res, next) {
  try {
    let couponId = req.query.couponId;
    let remark = req.query.remark;

    let result = await saveRemark(couponId, remark);
    // console.log(result);
    res.send(result);
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/sendSMS', async function (req, res, next) {
  try {
    let phoneNumber = req.query.phoneNumber;
    let templateParam1 = req.query.templateParam1;

    let result = await sendSMS(phoneNumber, templateParam1);
    // console.log(result);
    res.send(result);
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/createDIYEvent', async function (req, res, next) {
  try {
    let started = req.query.started;

    let DIYEvents = models.DIYEvents;
    const diyEventByStarted = await DIYEvents.findOne({
      started: started
    });
    if (diyEventByStarted) {
      res.send({ errCode: -5, errMessage: 'DIY活动已存在，请更换时间创建！' });
      return;
    }
    let newDIYEvent = new DIYEvents({
      started: started,
      created: moment(),
      participants: []
    });

    await newDIYEvent.save();
    res.send({ errCode: 0 });
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/DIYEventList', async function (req, res, next) {
  try {
    let DIYEvents = models.DIYEvents;
    const diyEvents = await DIYEvents.find();
    if (diyEvents) {
      for (let index = 0; index < diyEvents.length; ++index) {
        let Participants = models.Participants;
        let eventId = diyEvents[index]._id;
        const participants = await Participants.find({ eventId: eventId });
        if (participants) {
          diyEvents[index].participants = participants;
        }
      }
    }
    res.send({ errCode: 0, list: diyEvents });
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/DeleteDIYEvent', async function (req, res, next) {
  try {
    let _id = req.query._id;

    let DIYEvents = models.DIYEvents;
    await DIYEvents.findByIdAndDelete(_id);
    let Participants = models.Participants;
    await Participants.deleteMany({ eventId: _id });

    res.send({ errCode: 0 });
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/joinToEvent', async function (req, res, next) {
  try {
    let couponId = req.query.couponId;
    let memberName = req.query.memberName;
    let eventId = req.query.eventId;

    let Participants = models.Participants;
    const participantsById = await Participants.findOne({
      couponId: couponId,
      memberName: memberName
    });
    if (participantsById) {
      res.send({ errCode: -5, errMessage: '该顾客已经添加过，请选择另一个顾客！' });
      return;
    }

    let newParticipants = new Participants({
      couponId: couponId,
      memberName: memberName,
      eventId: eventId
    });

    await newParticipants.save();

    let remark = '';
    let DIYEvents = models.DIYEvents;
    const diyEventItem = await DIYEvents.findOne({ _id: eventId });
    if (diyEventItem) {
      let eventTime = moment(diyEventItem.started).utcOffset(8);
      remark = `已加入${eventTime.format('MM-DD dddd HH:mm')}的DIY活动`
      await saveRemark(couponId, remark);
    }
    res.send({ errCode: 0, remark: remark });
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/sendSMSAndJoinToEvent', async function (req, res, next) {
  try {
    let phoneNumber = req.query.phoneNumber;
    let templateParam1 = req.query.templateParam1;
    let couponId = req.query.couponId;
    let memberName = req.query.memberName;
    let eventId = req.query.eventId;

    /// 1,添加名单
    let Participants = models.Participants;
    const participantsById = await Participants.findOne({
      couponId: couponId,
      memberName: memberName
    });
    if (participantsById) {
      res.send({ errCode: -5, errMessage: '该顾客已经添加过，请选择另一个顾客！' });
      return;
    }
    let newParticipants = new Participants({
      couponId: couponId,
      memberName: memberName,
      eventId: eventId
    });
    await newParticipants.save();

    /// 2,发送短信
    let result = await sendSMS(phoneNumber, templateParam1);
    if (result.errCode !== 'Ok') {
      res.send({ errCode: -2, errMessage: result.errMessage });
      return;
    }

    /// 2,保存备注
    let remark = '';
    let DIYEvents = models.DIYEvents;
    const diyEventItem = await DIYEvents.findOne({ _id: eventId });
    if (diyEventItem) {
      let eventTime = moment(diyEventItem.started).utcOffset(8);
      remark = `已短信预约并加入${eventTime.format('MM-DD dddd HH:mm')}的DIY活动`;
      await saveRemark(couponId, remark);
    }

    res.send({ errCode: 0, remark: remark });
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

router.get('/leaveFromEvent', async function (req, res, next) {
  try {
    let couponId = req.query.couponId;
    let memberName = req.query.memberName;
    let eventId = req.query.eventId;

    let Participants = models.Participants;
    await Participants.findOneAndDelete({
      couponId: couponId,
      memberName: memberName,
      eventId: eventId
    });

    await saveRemark(couponId, '');
    res.send({ errCode: 0 });
  } catch (err) {
    console.log('err = ' + err);
    next(err)
  }
});

module.exports = router;
