//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    inputValue: '王荣慧'
  },

  onLoad: function () {
    let self4this = this;

    // self4this.setData({inputValue: 'wangronghui'})

  },

  bindName(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  insertData() {
    console.log('insert data')

  },

  readData() {
    console.log('read data')
  }
})