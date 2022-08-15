/**
 * 定义所有mongodb的数据Scheme
 */
var mongo = require('mongoose');
var Schema = mongo.Schema;

/*
  活动Scheme
*/
var DIYEventSchema = new Schema({
  // 活动开始时间
  started: Date,
  // 活动创建时间
  created: Date,
  // 参与人员
  participants: [],
});
exports.DIYEvents = mongo.model('diyevents', DIYEventSchema);

/*
  参加者Scheme
*/
var ParticipantSchema = new Schema({
  // DIY券id
  couponId: String,
  // 会员名称
  memberName: String,
  // 会员参与的活动对应id
  eventId: String,
});
exports.Participants = mongo.model('participants', ParticipantSchema);

/*
  页面索引Scheme
*/
var PageSchema = new Schema({
  // id=001
  id: String,
  // 页码
  page: Number
});
exports.Pages = mongo.model('pages', PageSchema);


/*
  蛋糕订购单Scheme
*/
var BirthdayCakeOrderSchema = new Schema({
  /// 蛋糕信息
  cakeName: String,
  cakeDescription: String,
  creamType: String,
  cakeSize: String,
  cakeSizeExtra: String,
  cakePrice: String,
  cakeFillings: String,
  candleType: String,
  ignitorType: String,
  number4candle: String,
  cakePlateNumber: String,
  /// 配送信息
  pickUpDay: String,
  pickUpTime: String,
  pickUpType: String,
  responseShop: String,
  deliverAddress: String,
  pickUpName: String,
  phoneNumber: String,
  remarks: String,
});
exports.BirthdayCakeOrders = mongo.model('birthdayCakeOrder', BirthdayCakeOrderSchema);
