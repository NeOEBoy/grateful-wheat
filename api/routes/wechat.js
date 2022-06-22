/**
 * 提供微信相关API
 */
const express = require('express');
const router = express.Router();
const httpErrors = require('http-errors')
const fetch = require('node-fetch')
const crypto = require('crypto');

/**
 * 配置数据
 */
const config = {
    // 测试地址
    // appid: 'wx7442006a24f09334',
    // appsecret: '07cc776cdb5d55168e0b8718b3f5e8a9',
    // 正式地址
    appid: 'wxb2070ea52da2dfc7',
    appsecret: 'dc6d5cdbf4850672dd344f59bfb47d8d',
    getAccessToken: 'https://api.weixin.qq.com/cgi-bin/token',
    getTicket: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'
}
/**
 * 缓存
 */
const cache = require('../util/cache');

router.get('/', function (req, res, next) {
    next(httpErrors(403, 'Forbidden'));
});

router.get('/sign', async function (req, res, next) {
    try {
        const params = {};
        params.url = req.query.url;

        let accessToken = await getAccessToken();
        if (accessToken && accessToken.access_token) {
            let ticket = await getTicket(accessToken.access_token);
            if (ticket && ticket.ticket) {
                params.ticket = ticket.ticket;
                getSign(params, res);
            } else {
                res.send(ticket);
            }
        } else {
            res.send(accessToken);
        }
    } catch (err) {
        next(err);
    }
});

getAccessToken = async () => {
    const cacheKey = 'jsapi_access_token';
    let cacheValue = cache.getCache(cacheKey);
    if (cacheValue) {
        const result = {
            access_token: cacheValue,
            from: 'cache'
        };
        return result;
    } else {
        const fetchUrl = `${config.getAccessToken}?grant_type=client_credential&appid=${config.appid}&secret=${config.appsecret}`;
        const response = await fetch(fetchUrl);
        const json = await response.json();
        json.from = 'wechat'
        if (json.access_token) {
            cache.setCache(cacheKey, json.access_token)
        }
        return json;
    }
};

getTicket = async (access_token) => {
    const cacheKey = "jsapi_ticket";
    let cacheValue = cache.getCache(cacheKey);
    if (cacheValue) {
        const result = {
            ticket: cacheValue,
            from: 'cache'
        };
        return result;
    } else {
        const fetchUrl = `${config.getTicket}?access_token=${access_token}&type=jsapi`;
        const response = await fetch(fetchUrl);
        const json = await response.json();
        json.from = 'wechat'

        if (json.ticket) {
            cache.setCache(cacheKey, json.ticket)
        }
        return json;
    }
}

getSign = (params, res) => {
    /**
     * 签名算法
     * 签名生成规则如下：
     * 参与签名的字段包括noncestr（ 随机字符串）,
     * 有效的jsapi_ticket, timestamp（ 时间戳）,
     * url（ 当前网页的URL， 不包含# 及其后面部分）。
     * 对所有待签名参数按照字段名的ASCII 码从小到大排序（ 字典序） 后，
     * 使用URL键值对的格式（ 即key1 = value1 & key2 = value2…） 拼接成字符串string1。
     * 这里需要注意的是所有参数名均为小写字符。 对string1作sha1加密， 字段名和字段值都采用原始值， 不进行URL 转义。
     */
    let ret = {
        jsapi_ticket: params.ticket,
        nonceStr: createNonceStr(),
        timestamp: createTimestamp(),
        url: params.url
    };
    // console.log(params, ret);
    let string = raw(ret)
    ret.signature = sha1(string)
    ret.appId = config.appid;
    // console.log('ret', ret)
    res.send(ret);
}

// sha1加密 
sha1 = (str) => {
    let shasum = crypto.createHash("sha1")
    shasum.update(str)
    str = shasum.digest("hex")
    return str
}

/**
 * 生成签名的时间戳
 * @return {字符串}
 */
createTimestamp = () => {
    return parseInt(new Date().getTime() / 1000) + ''
}

/**
 * 生成签名的随机串
 * @return {字符串}
 */
createNonceStr = () => {
    return Math.random().toString(36).substr(2, 15)
}

/**
 * 对参数对象进行字典排序
 * @param  {对象} args 签名所需参数对象
 * @return {字符串}    排序后生成字符串
 */
raw = (args) => {
    let keys = Object.keys(args)
    keys = keys.sort()
    let newArgs = {}
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key]
    })

    let string = ''
    for (let k in newArgs) {
        string += '&' + k + '=' + newArgs[k]
    }
    string = string.substr(1)
    return string
}

module.exports = router;
