/**
 * 饿了吗商家开放平台
 * 营业期间每间隔半个小时，
 * 自动上架有库存商品
 */

/// 引入sdk
let eleme = require('eleme-openapi-sdk');
const schedule = require('node-schedule');
// const moment = require('moment');

/**--------------------配置信息--------------------*/
const KForTest = false;

const KElemeShops = [
    /// 总账号0
    { shopName: '总账号', shopId: '95839918' },
    /// 教育局店1
    { shopName: '教育局店', shopId: '2095929401' },
    /// 旧镇店2
    { shopName: '旧镇店', shopId: '2043804905' },
    /// 江滨店3
    { shopName: '江滨店', shopId: '502469095' },
    /// 汤泉店4
    { shopName: '汤泉店', shopId: '2086221402' }
];

const getElemeConfig = () => {
    /// 实例化一个配置对象
    let config;
    // if (KForTest) {
    //     /// 沙箱环境
    //     config = new eleme.Config({
    //         key: 'pAUpCr42Us',
    //         secret: '31cb76bb0479adf7f56d6461c2b3209b7e65e5bc',
    //         sandbox: true // 是否沙箱环境
    //     });
    // } else {
    /// 正式环境
    config = new eleme.Config({
        key: 'ACJC3zxyIp',
        secret: '71520e2ad5bc23095ad8db91e306083540bfd52f',
        sandbox: false // 是否沙箱环境
    });
    // }

    return config;
};

const doStartScheduleMelodyUpdatefoodstatus = async () => {
    try {
        /// 实例化一个配置对象
        let config = getElemeConfig();
        /// 实例化一个oauth2.0客户端授权模式的授权对象
        let oAuthClient = new eleme.OAuthClient(config);

        /// 获取token
        let result = await oAuthClient.getToken()
        resultObj = JSON.parse(result);
        let token = resultObj.access_token;
        /// 实例化远程调用的rpcClient对象
        let rpcClient = new eleme.RpcClient(token, config);
        /// 实例化一个服务对象
        let ProductService = new eleme.ProductService(rpcClient)

        /// 裱花间是否在上班（9:00 ~ 17:59）
        // let decoratingRoomWorking = false;
        // let hour = moment().hour();
        // if (hour >= 9 && hour <= 17) {
        //     decoratingRoomWorking = true;
        // }
        // console.log(hour);
        for (let xx = 0; xx < KElemeShops.length; ++xx) {
            let elemeShop = KElemeShops[xx];
            let shopId = elemeShop.shopId;
            if (shopId === '95839918' || shopId === '2043804905') continue;

            let shopName = elemeShop.shopName;
            let itemsNeedToOnShelf = [];
            let itemsNeedToClearStock = [];
            let itemsNeedToFillOrClearStock = [];
            console.log('查询《' + shopName + '》的类别...')
            let shopCategories = await ProductService.getShopCategories(shopId);
            // console.log(shopCategories);
            for (let ii = 0; ii < shopCategories.length; ++ii) {
                let categoryId = shopCategories[ii].id;
                let categoryName = shopCategories[ii].name;
                console.log('查询《' + categoryName + '》的商品...')
                let items = await ProductService.getItemsByCategoryId(categoryId);
                if (!items) continue;

                let keys = Object.keys(items);
                for (let jj = 0; jj < keys.length; ++jj) {
                    let key = keys[jj];
                    let value = items[key];
                    // console.log(value);
                    let specs = value.specs;
                    let itemSpecIds = [];
                    for (let zz = 0; zz < specs.length; ++zz) {
                        let spec = specs[zz];
                        if (spec.stock > 0 && spec.onShelf === 0) {
                            itemSpecIds.push(spec.specId);
                        }
                    }
                    if (itemSpecIds.length > 0) {
                        let itemNeedToOnShelf = {};
                        itemNeedToOnShelf.itemId = value.id;
                        itemNeedToOnShelf.name = value.name;
                        itemNeedToOnShelf.itemSpecIds = itemSpecIds;

                        itemsNeedToOnShelf.push(itemNeedToOnShelf);
                    }

                    let itemSpecIds1 = [];
                    for (let zz = 0; zz < specs.length; ++zz) {
                        let spec = specs[zz];
                        /// 银豹库存为-1时，饿了吗平台会变为9999，这里修正为0
                        if (spec.stock > 5000) {
                            itemSpecIds1.push(spec.specId);
                        }
                    }
                    if (itemSpecIds1.length > 0) {
                        let itemNeedToClearStock = {};
                        itemNeedToClearStock.itemId = value.id;
                        itemNeedToClearStock.name = value.name;
                        itemNeedToClearStock.itemSpecIds = itemSpecIds1;

                        itemsNeedToClearStock.push(itemNeedToClearStock);
                    }

                    // if (categoryName === '弯麦女孩蛋糕' ||
                    //     categoryName === '弯麦男孩蛋糕' ||
                    //     categoryName === '弯麦女神蛋糕' ||
                    //     categoryName === '弯麦男神蛋糕' ||
                    //     categoryName === '弯麦常规蛋糕' ||
                    //     categoryName === '弯麦情侣蛋糕' ||
                    //     categoryName === '弯麦祝寿蛋糕' ||
                    //     categoryName === '弯麦庆典派对蛋糕') {
                    //     let itemSpecIds2 = [];
                    //     for (let zz = 0; zz < specs.length; ++zz) {
                    //         let spec = specs[zz];
                    //         itemSpecIds2.push(spec.specId);
                    //     }
                    //     if (itemSpecIds2.length > 0) {
                    //         let itemNeedToFillOrClearStock = {};
                    //         itemNeedToFillOrClearStock.itemId = value.id;
                    //         itemNeedToFillOrClearStock.name = value.name;
                    //         itemNeedToFillOrClearStock.itemSpecIds = itemSpecIds2;

                    //         itemsNeedToFillOrClearStock.push(itemNeedToFillOrClearStock);
                    //     }
                    // }
                }
            }
            console.log(itemsNeedToOnShelf);
            if (itemsNeedToOnShelf.length > 0) {
                console.log('批量上架有库存的商品...')
                try {
                    await ProductService.batchOnShelf(itemsNeedToOnShelf);
                } catch (err) {
                    console.log(err);
                }
            }
            console.log(itemsNeedToClearStock);
            if (itemsNeedToClearStock.length > 0) {
                console.log('批量修正库存不正的商品...')
                try {
                    await ProductService.batchClearStock(itemsNeedToClearStock);
                } catch (err) {
                    console.log(err);
                }
            }

            // console.log(itemsNeedToFillOrClearStock);
            // if (itemsNeedToFillOrClearStock.length > 0) {
            //     if (decoratingRoomWorking) {
            //         console.log('批量上架蛋糕...')
            //         try {
            //             await ProductService.batchFillStock(itemsNeedToFillOrClearStock);
            //         } catch (err) {
            //             console.log(err);
            //         }
            //     } else {
            //         try {
            //             console.log('批量下架蛋糕...')
            //             await ProductService.batchClearStock(itemsNeedToFillOrClearStock);
            //         } catch (err) {
            //             console.log(err);
            //         }
            //     }
            // }
        }
    } catch (error) {
        console.log(error);
    }
};

const startScheduleMelodyUpdatefoodstatus = async () => {
    // 秒、分、时、日、月、周几
    try {
        if (KForTest) {
            console.log('开始自动上架...');
            await doStartScheduleMelodyUpdatefoodstatus();
            console.log('结束自动上架...');
        } else {
            //在每小时的30分运行定时任务
            let rule = new schedule.RecurrenceRule();
            rule.hour = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
            /**
            *如果仅仅设置了hour，定时任务并不会如期望的一样在每小时的0分时运行，而是每分钟都会运行！！！
            因此，如果你希望在每小时的固定分钟运行，就一定要设置minute！！！
            */
            rule.minute = 30;
            schedule.scheduleJob(rule, async () => {
                console.log('开始自动上架...');
                await doStartScheduleMelodyUpdatefoodstatus();
                console.log('结束自动上架...');
            });
        }
    } catch (e) {
        console.log('startScheduleMelodyUpdatefoodstatus e=' + e.toString());
    }
}

module.exports = startScheduleMelodyUpdatefoodstatus;
