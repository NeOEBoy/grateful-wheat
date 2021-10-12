/**
 * 饿了吗商家开放平台
 * 营业期间每间隔半个小时，
 * 自动上架有库存商品
 */

/// 引入sdk
let eleme = require('eleme-openapi-sdk');
const schedule = require('node-schedule');

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
    { shopName: '汤泉店', shopId: '2086221402' },
    /// 假日店5
    { shopName: '假日店', shopId: '2084932329' },
];

const getElemeConfig = () => {
    /// 实例化一个配置对象
    let config;
    if (KForTest) {
        /// 沙箱环境
        config = new eleme.Config({
            key: 'pAUpCr42Us',
            secret: '31cb76bb0479adf7f56d6461c2b3209b7e65e5bc',
            sandbox: true // 是否沙箱环境
        });
    } else {
        /// 正式环境
        config = new eleme.Config({
            key: 'ACJC3zxyIp',
            secret: '71520e2ad5bc23095ad8db91e306083540bfd52f',
            sandbox: false // 是否沙箱环境
        });
    }

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

        for (let xx = 0; xx < KElemeShops.length; ++xx) {
            let elemeShop = KElemeShops[xx];
            let shopId = elemeShop.shopId;
            if (shopId === '95839918') continue;

            let shopName = elemeShop.shopName;
            let itemsNeedToOnShelf = [];
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
                }
            }
            console.log(itemsNeedToOnShelf);
            if (itemsNeedToOnShelf.length > 0) {
                console.log('上架有库存的商品...')
                await ProductService.batchOnShelf(itemsNeedToOnShelf);
            }
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
            // This runs at minute 5 past every 2 hours
            let rule = new schedule.RecurrenceRule();
            // 6点--23点
            rule.hour = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
            // 每隔30分钟检查一次
            rule.minute = [0, 30];
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
