
const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;
const moment = require('moment');
const schedule = require('node-schedule');

const {
    signIn
} = require('../third/pospal');

/**--------------------配置信息--------------------*/
const KForTest = false;

const KTemplateXiankaoId = '187';
const KTemplateTusiCanbaoId = '182';
const KTemplateChangwenId = '183';
const KTemplateXidianId = '189';
const KTemplateArray = [
    { index: 0, text: '吐司餐包类', id: KTemplateTusiCanbaoId },
    { index: 1, text: '常温类', id: KTemplateChangwenId },
    { index: 2, text: '现烤类', id: KTemplateXiankaoId },
    { index: 3, text: '西点类', id: KTemplateXidianId }
];

const KShopShitouUserId = '4359267'; // 狮头账号id
const KShopArray = [
    { index: 1, name: '教育局店', userId: '3995767' },
    { index: 2, name: '旧镇店', userId: '3995771' },
    { index: 3, name: '江滨店', userId: '4061089' },
    { index: 4, name: '汤泉世纪店', userId: '4061092' },
    { index: 5, name: '假日店', userId: '4339546' },
    { index: 6, name: '狮头店', userId: KShopShitouUserId },
    { index: 7, name: '盘陀店', userId: '4382444' }
];

const startScheduleOrderReminder = async () => {
    // 秒、分、时、日、月、周几
    // 自动检查是否报货
    try {
        if (KForTest) {
            console.log('中午-开始检查...');
            await startOrderReminderAtNoon();
            console.log('中午-检查结束...');

            console.log('午夜-开始检查...');
            await startOrderReminderAtMidNight();
            console.log('午夜-检查结束...');
        } else {
            /// 中午报货第一次检查 每天13时00分00秒
            schedule.scheduleJob('00 00 13 * * *', async () => {
                console.log('中午-开始检查...');
                await startOrderReminderAtNoon();
                console.log('中午-检查结束...');
            });
            /// 中午报货第二次检查 每天13时30分00秒
            schedule.scheduleJob('00 30 13 * * *', async () => {
                console.log('中午-开始检查...');
                await startOrderReminderAtNoon();
                console.log('中午-检查结束...');
            });

            /// 午夜报货第一次检查 每天22时40分00秒
            schedule.scheduleJob('00 40 22 * * *', async () => {
                console.log('中午-开始检查...');
                await startOrderReminderAtMidNight();
                console.log('中午-检查结束...');
            });
            /// 午夜报货第二次检查 每天23时00分00秒
            schedule.scheduleJob('00 00 23 * * *', async () => {
                console.log('中午-开始检查...');
                await startOrderReminderAtMidNight();
                console.log('中午-检查结束...');
            });
        }
    } catch (e) {
        console.log('startScheduleOrderReminder e=' + e.toString());
    }
}

const startOrderReminderAtNoon = async () => {
    /// 1.登录并获取验证信息
    const thePOSPALAUTH30220 = await signIn();

    for (let index = 0; index < KShopArray.length; index++) {
        let shop = KShopArray[index];
        if (shop.userId === KShopShitouUserId) continue; ///狮头店不用报现烤

        // console.log(shop.userId);
        // console.log(shop.name);

        /// 2.检查是否已经订货
        const alreadyOrder = await checkAlreadyOrder(thePOSPALAUTH30220, shop.userId, KTemplateXiankaoId);
        if (!alreadyOrder) {
            /// 2.1.通知收银端订货
            let saveNotificationResponseJson = await saveNotification(thePOSPALAUTH30220, shop.userId, [KTemplateXiankaoId]);
            if (saveNotificationResponseJson.successed) console.log('新建通知成功');
            if (saveNotificationResponseJson && saveNotificationResponseJson.successed) {
                const notificationId = await getLatestNotificationId(thePOSPALAUTH30220);
                const deleteResult = await deleteNotification(thePOSPALAUTH30220, notificationId);
                if (deleteResult.successed) console.log('删除通知成功');
            }
        }

        // 仅教育局店
        break;
    }
}

const startOrderReminderAtMidNight = async () => {
    /// 1.登录并获取验证信息
    const thePOSPALAUTH30220 = await signIn();

    for (let index = 0; index < KShopArray.length; index++) {
        let shop = KShopArray[index];

        // console.log(shop.userId);
        // console.log(shop.name);

        /// 2.检查是否已经订货
        const alreadyOrder4TusiCanbao = await checkAlreadyOrder(thePOSPALAUTH30220, shop.userId, KTemplateTusiCanbaoId);
        const alreadyOrder4Changwen = await checkAlreadyOrder(thePOSPALAUTH30220, shop.userId, KTemplateChangwenId);
        const alreadyOrder4Xidian = await checkAlreadyOrder(thePOSPALAUTH30220, shop.userId, KTemplateXidianId);

        if (!alreadyOrder4TusiCanbao || !alreadyOrder4Changwen && !alreadyOrder4Xidian) {
            /// 2.1.通知收银端订货
            let templateIdArray = [];
            if (!alreadyOrder4TusiCanbao) templateIdArray.push(KTemplateTusiCanbaoId);
            if (!alreadyOrder4Changwen) templateIdArray.push(KTemplateChangwenId);
            if (!alreadyOrder4Xidian) templateIdArray.push(KTemplateXidianId);

            let saveNotificationResponseJson = await saveNotification(thePOSPALAUTH30220, shop.userId, templateIdArray);
            if (saveNotificationResponseJson.successed) console.log('新建通知成功');
            if (saveNotificationResponseJson && saveNotificationResponseJson.successed) {
                const notificationId = await getLatestNotificationId(thePOSPALAUTH30220);
                const deleteResult = await deleteNotification(thePOSPALAUTH30220, notificationId);
                if (deleteResult.successed) console.log('删除通知成功');
            }
        }
        // 仅教育局店
        break;
    }
}

const checkAlreadyOrder = async (thePOSPALAUTH30220, userId, templateId) => {
    const orderListJson = await getOrderList(thePOSPALAUTH30220, userId, templateId);
    const alreadyOrder = await parseOrderList(orderListJson);
    return alreadyOrder;
}

const getOrderList = async (thePOSPALAUTH30220, userId, templateId) => {
    let orderListUrl = 'https://beta33.pospal.cn/StockFlow/LoadProductRequestByPage';

    /// userIds%5B%5D=3995763&beginDateTime=2020.10.03+00%3A00%3A00&endDateTime=2020.10.03+23%3A59%3A59
    let orderListBodyStr = '';
    orderListBodyStr += 'productrequesttemplateId=';
    orderListBodyStr += templateId;
    orderListBodyStr += '&orderNumber=';
    orderListBodyStr += '&remarks=';
    orderListBodyStr += '&customerKeyword=';
    orderListBodyStr += '&userId=';
    orderListBodyStr += userId;
    orderListBodyStr += '&categoryUids=%5B%5D';
    orderListBodyStr += '&supplierUid=';
    orderListBodyStr += '&status=100';
    orderListBodyStr += '&timeType=0';
    orderListBodyStr += '&beginTime=';
    orderListBodyStr += moment().format('YYYY.MM.DD') + '+00%3A00%3A00';//2021.08.10+00%3A00%3A00
    orderListBodyStr += '&endTime=';
    orderListBodyStr += moment().format('YYYY.MM.DD') + '+23%3A59%3A59';//2021.08.10+23%3A59%3A59
    orderListBodyStr += '&isChainStoreSupplyOrder=';
    orderListBodyStr += '&chainStoreSupplyOrderNo=';
    orderListBodyStr += '&receiveName=';
    orderListBodyStr += '&pageIndex=1';
    orderListBodyStr += '&pageSize=50';
    orderListBodyStr += '&orderColumn=';
    orderListBodyStr += '&asc=false';

    const orderListResponse = await fetch(orderListUrl, {
        method: 'POST', body: orderListBodyStr,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
        }
    });
    const orderListResponseJson = await orderListResponse.json();
    return orderListResponseJson;
}

const parseOrderList = async (orderListJson) => {
    if (!orderListJson.successed) return;

    let alreadyOrder = false;

    try {
        let view = orderListJson.contentView;
        // console.log(view);
        var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + view + '</root>';
        // console.log(xml);
        let result = await parseStringPromise(xml, {
            strict: false, // 为true可能解析不正确
            normalizeTags: true
        });
        if (result) {
            // console.log(result);
            let tbodyTRArray = result.root.tbody[0].tr;
            // console.log(tbodyTRArray);
            let tbodyTRLength = tbodyTRArray.length;
            if (tbodyTRLength === 1) {
                let tr0Property = tbodyTRArray[0].$;
                if (tr0Property && tr0Property.CLASS === 'noRecord') {
                    alreadyOrder = false;
                } else {
                    alreadyOrder = true;
                }
            } else if (tbodyTRLength === 0) {
                alreadyOrder = false;
            } else {
                alreadyOrder = true;
            }
        }
    } catch (e) {
        console.log('解析parseOrderList出错 e = ' + e);
        alreadyOrder = false;
    }

    return alreadyOrder;
}

const saveNotification = async (thePOSPALAUTH30220, userId, templateIdArray) => {
    let saveNotificationUrl = 'https://beta33.pospal.cn/Setting/SaveNotification';

    let saveNotificationBodyStr = '';
    saveNotificationBodyStr += 'assignUserIdsJson=';
    saveNotificationBodyStr += '%5B' + userId + '%5D';
    saveNotificationBodyStr += '&notificationJson=';
    let notifyInfoO = {};
    notifyInfoO.id = 0;
    notifyInfoO.title = '【总部报货提醒】';

    let templateTextArray = '';
    templateIdArray.forEach(templateId => {
        let postion = templateIdArray.indexOf(templateId);
        if (postion === 0) {
            templateTextArray += '[';
        }

        if (postion >= 1) {
            templateTextArray += ' | ';
        }

        let templateText = '';
        KTemplateArray.forEach(template => {
            if (template.id === templateId) {
                templateText = template.text;
            }
        });
        templateTextArray += templateText;

        if (postion === templateIdArray.length - 1) {
            templateTextArray += ']'
        }
    });

    notifyInfoO.message = templateTextArray + '~未报货~请尽快报货~';
    notifyInfoO.endDatetime = moment().format('YYYY-MM-DD');
    notifyInfoO.clientPrintNotify = 0;
    let notifyInfoStr = JSON.stringify(notifyInfoO);
    notifyInfoStr = escape(notifyInfoStr);

    saveNotificationBodyStr += notifyInfoStr;
    const saveNotificationResponse = await fetch(saveNotificationUrl, {
        method: 'POST', body: saveNotificationBodyStr,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
        }
    });
    const saveNotificationResponseJson = await saveNotificationResponse.json();
    return saveNotificationResponseJson;
}

const getLatestNotificationId = async (thePOSPALAUTH30220) => {
    const loadNotificationResponseJson = await loadNotification(thePOSPALAUTH30220);
    const notificationId = await parseLoadNotification(loadNotificationResponseJson);
    return notificationId;
}

const loadNotification = async (thePOSPALAUTH30220) => {
    let loadNotificationUrl = 'https://beta33.pospal.cn/Setting/LoadNotificationsByPage';

    /// userIds%5B%5D=3995763&beginDateTime=2020.10.03+00%3A00%3A00&endDateTime=2020.10.03+23%3A59%3A59
    let loadNotificationBodyStr = '';
    loadNotificationBodyStr += 'statu=';
    loadNotificationBodyStr += '&pageIndex=1';
    loadNotificationBodyStr += '&pageSize=50';
    loadNotificationBodyStr += '&orderColumn=';
    loadNotificationBodyStr += '&asc=false';

    const loadNotificationResponse = await fetch(loadNotificationUrl, {
        method: 'POST', body: loadNotificationBodyStr,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
        }
    });
    const loadNotificationResponseJson = await loadNotificationResponse.json();
    return loadNotificationResponseJson;
}

const parseLoadNotification = async (loadNotificationResponseJson) => {
    if (!loadNotificationResponseJson.successed) return;

    let notificationId = '';

    let view = loadNotificationResponseJson.contentView;
    // console.log(view);
    var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + view + '</root>';
    // console.log(xml);
    let result = await parseStringPromise(xml, {
        strict: false, // 为true可能解析不正确
        normalizeTags: true
    });
    if (result) {
        // console.log(result);
        let tbodyTRArray = result.root.tbody[0].tr;
        // console.log(tbodyTRArray);
        let tbodyTRLength = tbodyTRArray.length;
        if (tbodyTRLength > 0) {
            let lastTR = tbodyTRArray[tbodyTRLength - 1];
            // console.log(lastTR.$.DATA);
            notificationId = lastTR.$.DATA;
        }
        // console.log(tbodyTRLength);
    }

    return notificationId;
}

const deleteNotification = async (thePOSPALAUTH30220, notificationId) => {
    let deleteNotificationUrl = 'https://beta33.pospal.cn/Setting/DelNotification';

    let deleteNotificationBodyStr = '';
    deleteNotificationBodyStr += 'id=';
    deleteNotificationBodyStr += notificationId;
    const deleteNotificationResponse = await fetch(deleteNotificationUrl, {
        method: 'POST', body: deleteNotificationBodyStr,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
        }
    });
    const deleteNotificationResponseJson = await deleteNotificationResponse.json();
    return deleteNotificationResponseJson;
}

// startScheduleOrderReminder();
module.exports = startScheduleOrderReminder;
