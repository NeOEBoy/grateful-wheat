/**
 * 提供微信相关API
 */
const express = require('express');
const router = express.Router();
const httpErrors = require('http-errors')
const fetch = require('node-fetch')
const crypto = require('crypto');
const urlParams = require('../util/url-params');

/**
 * 配置数据-弯麦烘焙
 */
const KConfig4Bread = {
    // 测试地址
    // appid: 'wx7442006a24f09334',
    // appsecret: '07cc776cdb5d55168e0b8718b3f5e8a9',
    // 正式地址
    appid: 'wxb2070ea52da2dfc7',
    appsecret: 'dc6d5cdbf4850672dd344f59bfb47d8d',
}

/**
 * 配置数据-弯麦科技
 */
const KConfig4Tech = {
    // 测试地址
    // appid: 'wx7442006a24f09334',
    // appsecret: '07cc776cdb5d55168e0b8718b3f5e8a9',
    // 正式地址
    appid: 'wx67eec99994012f29',
    appsecret: 'c3a7f6bc8cfaf3645664bf6f8db3ff7a',
}

const KGetAccessTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token';
const KGetTicketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';

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

        let accessToken = await getAccessToken(KConfig4Bread);
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

router.get('/templateSendToTech', async function (req, res, next) {
    try {
        let title = req.query.title;
        let orderNum = req.query.orderNum;
        let style = req.query.style;
        let deliverTime = req.query.deliverTime;
        let name = req.query.name;
        let phone = req.query.phone;

        let accessToken = await getAccessToken(KConfig4Bread);
        if (accessToken && accessToken.access_token) {
            let templateBody = makeCakeOrderTemplateBody('oBO-bs9qqq-ZtaKzvQHhR1zNOK4E',
                title, orderNum, style, deliverTime, name, phone);
            makeTemplateSend(accessToken.access_token, templateBody);
        }

        res.send({});
    } catch (err) {
        next(err);
    }
});

const makeCakeOrderTemplateBody = (toUser, title, orderNum, style, deliverTime, name, phone, remark) => {
    let templateBody = {};
    // 测试openid
    // templateBody.touser = 'o7-RGwtoM8co7KEXMwBggYb_oQbI';
    // 正式openid
    templateBody.touser = toUser;
    /// 测试模板id
    // templateBody.template_id = 'b1MVp0K09kYViUxkVo5qm4Oiub5L4F4kS1oRlUjbONM';
    /// 正式模板id从公众号的'功能'=>'模板消息'=>'我的模板'里获取
    templateBody.template_id = 'dB9yNsbM9ivoGouAkQGEvCSeIPr-liSUQ18PTlpWvvs';
    let templateData = {};
    templateData.first = { value: title, color: "#FFAB19" };
    templateData.keyword1 = { value: orderNum, color: "#FFAB19" }
    templateData.keyword2 = { value: style, color: "#FFAB19" }
    templateData.keyword3 = { value: deliverTime, color: "#FFAB19" }
    templateData.keyword4 = { value: name, color: "#FFAB19" }
    templateData.keyword5 = { value: phone, color: "#FFAB19" }
    templateBody.data = templateData;

    /// 设置跳转Url
    // let clickUrl = 'http://gratefulwheat.ruyue.xyz/birthdayCakeSale';
    // templateBody.url = clickUrl;

    return templateBody;
}

const makeTemplateSend = async (accessToken, templateBody) => {
    let templateParamObject = {};
    templateParamObject.access_token = accessToken;
    const templateParamString = urlParams(templateParamObject);
    let templateUrl = 'https://api.weixin.qq.com/cgi-bin/message/template/send?' + templateParamString;

    let templateBodyStr = JSON.stringify(templateBody);
    const templateResponse = await fetch(templateUrl, { method: 'POST', body: templateBodyStr });
    const templateJson = await templateResponse.json();
    console.log(JSON.stringify(templateJson));
}


getAccessToken = async (config) => {
    const cacheKey = 'jsapi_access_token' + config.appid;
    let cacheValue = cache.getCache(cacheKey);
    if (cacheValue) {
        const result = {
            access_token: cacheValue,
            from: 'cache'
        };
        return result;
    } else {
        const fetchUrl = `${KGetAccessTokenUrl}?grant_type=client_credential&appid=${config.appid}&secret=${config.appsecret}`;
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
        const fetchUrl = `${KGetTicketUrl}?access_token=${access_token}&type=jsapi`;
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
    ret.appId = KConfig4Bread.appid;
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
