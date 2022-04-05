var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/product');
var couponRouter = require('./routes/coupon');
var memberRouter = require('./routes/member');
var wechatRouter = require('./routes/wechat');

const mongoManager = require('./stores/mongo-manager')

// 启动时连接下数据库
mongoManager.connectDB();

var app = express();

/// 设置跨域访问---
const KTestHostLocal = 'http://localhost'
const KWWWTestHostLocal = KTestHostLocal + ':4000';
const KAllowHosts = [KWWWTestHostLocal];
app.all('*', function (req, res, next) {
  let origin = req.get('origin');
  console.log('app.all origin = ' + origin);
  if (KAllowHosts.indexOf(origin) !== -1) {
    console.log('允许跨域访问');
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, accept, origin, content-type, x-csrftoken, x-token");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  next();
});
/// 设置跨域访问---

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/product', productRouter);
app.use('/coupon', couponRouter);
app.use('/member', memberRouter);
app.use('/wechat', wechatRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/// 启动定时任务，每日汇报营业数据
const startScheduleBusinessDay = require('./schedule/schedule-task-business-day');
startScheduleBusinessDay();
/// 启动定时任务，每周汇报营业数据
const startScheduleBusinessWeek = require('./schedule/schedule-task-business-week');
startScheduleBusinessWeek();
/// 启动定时任务，每月汇报营业数据
const startScheduleBusinessMonth = require('./schedule/schedule-task-business-month');
startScheduleBusinessMonth();
/// 启动定时任务，每日汇报打卡数据
const startScheduleCheckinDay = require('./schedule/schedule-task-checkin-day');
startScheduleCheckinDay();
/// 启动定时任务，每日上报抽奖数据
// const startScheduleLotteryDay = require('./schedule/schedule-task-lottery-day');
// startScheduleLotteryDay();

/// 启动定时任务，每日上报天气数据
const startScheduleWeatherDay = require('./schedule/schedule-task-weather-day');
startScheduleWeatherDay();

/// 启动定时任务，每日检查报货情况
const startScheduleOrderReminder = require('./schedule/schedule-task-order-reminder-day');
// startScheduleOrderReminder(); // TODO 打开提醒

/// 启动定时任务，自动上架饿了吗商品
const startScheduleMelody = require('./schedule/scheduler-task-melody');
startScheduleMelody();

module.exports = app;
