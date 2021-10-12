
const fetch = require('node-fetch');
md5 = require('js-md5');
const moment = require('moment');

/**--------------------配置信息--------------------*/
const KForTest = false;

//shopId=商店id；ksid=接口secretId
const KMelodyShopArrays = [
    /// 教育局店
    { shopName: '教育局店', shopId: 2095929401, ksid: 'YTDIMJMTA1Mjc4NDM1NDkxMjAxT0V0SlVtNTFQ' },
    /// 江滨店
    { shopName: '江滨店', shopId: 502469095, ksid: 'YMQ1MDMTA1Mjc4MjA3MDI3MDAxT0V3anVEKzRQ' },
    /// 汤泉店
    { shopName: '汤泉店', shopId: 2086221402, ksid: 'OTGWNZMTA1Mjc4MjA3Mjc1NTAxT0V3a1EzajVQ' },
    /// 假日店
    { shopName: '假日店', shopId: 2084932329, ksid: 'ZMM4MTMTA1Mjc4MjA2NzIzNTAxT0V3a3c3MTVQ' },
];

///生成唯一id
const makeParamId4MelodyApi = () => {
    let unix = moment().format('x');
    let md54Unix = md5(unix).toUpperCase();
    let id = md54Unix + '|' + unix;
    // console.log(id);
    return id;
}

const melodySetFoodsOnShelf = async (shop, foods) => {
    let melodyGoodsUrl = 'https://app-api.shop.ele.me/nevermore.goods/invoke/?method=FoodService.setFoodsOnShelf';
    let melodyGoodsBody = {
        "id": makeParamId4MelodyApi(),
        "metas": {
            "appName": "melody",
            "appVersion": "4.4.0",
            "ksid": shop.ksid
        },
        "service": "FoodService",
        "method": "setFoodsOnShelf",
        "params": {
            "foodsWithSpecId": foods
        },
        "ncp": "2.0.0"
    };
    const melodyGoodsResponse = await fetch(melodyGoodsUrl, {
        method: 'POST', body: JSON.stringify(melodyGoodsBody),
        headers: { 'Content-Type': 'application/json' }
    });
    const melodyGoodsResponseJson = await melodyGoodsResponse.json();
    console.log(melodyGoodsResponseJson);
    return melodyGoodsResponseJson;
}

const melodyQueryCategoryWithFoodFilter = async (shop) => {
    let melodyGoodsUrl = 'https://app-api.shop.ele.me/nevermore.goods/invoke/?method=FoodService.queryCategoryWithFoodFilter';
    let melodyGoodsBody = {
        "id": makeParamId4MelodyApi(),
        "metas": {
            "appName": "melody",
            "appVersion": "4.4.0",
            "ksid": shop.ksid
        },
        "service": "FoodService",
        "method": "queryCategoryWithFoodFilter",
        "params": {
            "shopId": shop.shopId,/// 教育局店id
            "foodFilter": 1, /// 0=全部商品；1=已下架；2=库存不足
            "XHR_TIMEOUT": 30000
        },
        "ncp": "2.0.0"
    };
    const melodyGoodsResponse = await fetch(melodyGoodsUrl, {
        method: 'POST', body: JSON.stringify(melodyGoodsBody),
        headers: { 'Content-Type': 'application/json' }
    });
    const melodyGoodsResponseJson = await melodyGoodsResponse.json();
    console.log(melodyGoodsResponseJson);

    let categorys = [];
    if (melodyGoodsResponseJson && !(melodyGoodsResponseJson.error)) {
        let result4melodyGoodsResponseJson = melodyGoodsResponseJson.result;
        for (let ii = 0; ii < result4melodyGoodsResponseJson.length; ++ii) {
            let categoryItem = result4melodyGoodsResponseJson[ii];
            let newCategoryItem = {};
            newCategoryItem.name = categoryItem.name;
            newCategoryItem.id = categoryItem.id;
            categorys.push(newCategoryItem);
        }
    }

    return categorys;
}

const melodyQueryFoodsByCategoryIdWithFoodFilter = async (shop, categoryId) => {
    let melodyGoodsUrl = 'https://app-api.shop.ele.me/nevermore.goods/invoke/?method=FoodService.queryFoodsByCategoryIdWithFoodFilter';
    let melodyGoodsBody = {
        "id": makeParamId4MelodyApi(),
        "metas": {
            "appName": "melody",
            "appVersion": "4.4.0",
            "ksid": shop.ksid
        },
        "service": "FoodService",
        "method": "queryFoodsByCategoryIdWithFoodFilter",
        "params": {
            "shopId": shop.shopId,
            "foodFilter": 1,
            "foodQueryPage": {
                "categoryId": categoryId,
                "offset": 0,
                "limit": 500
            },
            "shopType": 1
        },
        "ncp": "2.0.0"
    };
    const melodyGoodsResponse = await fetch(melodyGoodsUrl, {
        method: 'POST', body: JSON.stringify(melodyGoodsBody),
        headers: { 'Content-Type': 'application/json' }
    });
    const melodyGoodsResponseJson = await melodyGoodsResponse.json();
    let foods = [];
    if (melodyGoodsResponseJson && !(melodyGoodsResponseJson.error)) {
        let result = melodyGoodsResponseJson.result;
        for (let ii = 0; ii < result.length; ++ii) {
            let foodItem = result[ii];
            let food = {};
            food['foodName'] = foodItem.name;
            food['foodId'] = foodItem.id;
            food['foodSpecIds'] = [];

            let specs = foodItem.specs;
            if (specs.length > 0) {
                /// 默认规格库存（第一项规格），由于多数为单规格商品，默认规格库存可当做商品库存
                food['defaultSpecStock'] = specs[0].stock;
                for (let jj = 0; jj < specs.length; ++jj) {
                    let specItem = specs[jj];
                    let specId = specItem.id;
                    food.foodSpecIds.push(specId);
                }
            }

            /// 库存大于0，表示有进货，才需要上架
            // if (food['defaultSpecStock'] > 0) {
                foods.push(food);
            // }
        }
    }
    return foods;
}

const doStartScheduleMelodyUpdatefoodstatus = async () => {
    for (let ii = 0; ii < KMelodyShopArrays.length; ++ii) {
        let shop = KMelodyShopArrays[ii];
        console.log('查询<<' + shop.shopName + '>>的类别...');
        let categorys = await melodyQueryCategoryWithFoodFilter(shop);
        console.log(categorys);
        let totalFoods = [];
        for (let jj = 0; jj < categorys.length; ++jj) {
            let category = categorys[jj];
            console.log('查询<<' + category['name'] + '>>下的商品...');
            let foods = await melodyQueryFoodsByCategoryIdWithFoodFilter(shop, category.id);
            if (foods && foods.length > 0) {
                totalFoods = totalFoods.concat(foods);
            }
        }
        console.log(totalFoods);
        if (totalFoods && totalFoods.length > 0) {
            console.log('正在上架有库存的商品...');
            // await melodySetFoodsOnShelf(shop, totalFoods);
        }
    }
}

const startScheduleMelodyUpdatefoodstatus = async () => {
    // 秒、分、时、日、月、周几
    try {
        if (KForTest) {
            console.log('开始自动上架...');
            await doStartScheduleMelodyUpdatefoodstatus();
            console.log('结束自动上架...');
        } else {
            // This runs at minute 5 past every 2 hours
            schedule.scheduleJob('5 */2 * * *', async () => {
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
