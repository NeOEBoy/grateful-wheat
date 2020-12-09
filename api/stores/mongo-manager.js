
const {
  KDB_URL
} = require('../const');

const KConnectState = {
  disconnected: 0,
  disconnecting: 1,
  connected: 2,
  connecting: 3,
}

class MongoManager {
  constructor() {
    this.connectState = KConnectState.disconnected;
    this.mongoose = require('mongoose');
    this.connection = this.mongoose.connection;
    // console.log('this.connection = ' + this.connection);
    this.connection.on('connecting', () => {
      console.log(`Mongoose ${KDB_URL} 正在连接...`);
    });
    this.connection.on('error', (error) => {
      console.error('Mongoose 连接错误 error = ' + error);
      this.connectState = KConnectState.disconnected;
    });
    this.connection.on('connected', () => {
      console.log('Mongoose 连接成功');
      this.connectState = KConnectState.connected;
    });
    // this.connection.on('open', () => {
    //   console.log('Mongoose 打开成功');
    // });
    this.connection.on('reconnected', () => {
      console.log('Mongoose 重新连接成功');
      this.connectState = KConnectState.connected;
    });
    this.connection.on('disconnected', () => {
      console.log('Mongoose 断开成功');
      this.connectState = KConnectState.disconnected;

      /// 自动重连
      setTimeout(() => {
        this.connectDB();
      }, 5000);
    });
  }

  isConnect() {
    return this.connectState === KConnectState.connected;
  }

  async connectDB() {
    try {
      // console.log('MongoManager connectDB');

      if (this.connectState === KConnectState.connected) {
        return;
      } else if (this.connectState === KConnectState.connecting) {
        // todo 正在连接中，保存下resolve，连接成功再统一发射resolve
        return;
      }

      this.connectState = KConnectState.connecting;
      var connectOptions = {
        /// 自己控制重连，默认重连设置为false
        auto_reconnect: false,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      }

      await this.mongoose.connect(KDB_URL, connectOptions);
      this.connectState = KConnectState.connected;
    } catch (err) {
      // err = MongoNetworkError: failed to connect to server [localhost:2701] on first connect [MongoNetworkError: connect ECONNREFUSED 127.0.0.1:2701]
      // console.log('Mongoose 连接错误 err = ' + err);
      // this.disConnectDB();
    }
  }

  async disConnectDB() {
    // console.log('MongoManager disConnectDB');
    if (this.connectState === KConnectState.disconnecting ||
      this.connectState === KConnectState.disconnected) {
      return;
    }

    this.connectState = KConnectState.disconnecting;
    await this.mongoose.disconnect();
    this.mongoose = null;
  }
}

module.exports = (new MongoManager())
