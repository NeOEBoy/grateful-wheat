let eleme = require('eleme-openapi-sdk');

let BIRTHDAYCAKE_NAME;

const getElemeConfig = () => {
    /// 实例化一个配置对象
    let config = new eleme.Config({
        key: 'ACJC3zxyIp',
        secret: '71520e2ad5bc23095ad8db91e306083540bfd52f',
        sandbox: false // 是否沙箱环境
    });

    return config;
};

startUpdate = async () => {
    try {
        /// 实例化一个配置对象
        let config = getElemeConfig();
        /// 实例化一个oauth2.0客户端授权模式的授权对象
        let oAuthClient = new eleme.OAuthClient(config);

        /// 获取token
        let result = await oAuthClient.getToken();
        resultObj = JSON.parse(result);
        let token = resultObj.access_token;
        /// 实例化远程调用的rpcClient对象
        let rpcClient = new eleme.RpcClient(token, config);
        /// 实例化一个服务对象
        let ProductService = new eleme.ProductService(rpcClient);

        let shopCategories = await ProductService.getShopCategories('2095929401');/// 教育局店shopid
        for (let ii = 0; ii < shopCategories.length; ++ii) {
            let categoryId = shopCategories[ii].id;
            let categoryName = shopCategories[ii].name;
            if (categoryName !== '弯麦儿童蛋糕' &&
                categoryName !== '弯麦女神蛋糕' &&
                categoryName !== '弯麦男神蛋糕' &&
                categoryName !== '弯麦家庭蛋糕' &&
                categoryName !== '弯麦情侣蛋糕' &&
                categoryName !== '弯麦祝寿蛋糕' &&
                categoryName !== '弯麦庆典派对蛋糕'
            ) continue;

            console.log('查询《' + categoryName + '》的商品...');
            let items = await ProductService.getItemsByCategoryId(categoryId);
            if (!items) continue;
            let keys = Object.keys(items);
            for (let jj = 0; jj < keys.length; ++jj) {
                let key = keys[jj];
                let value = items[key];

                if (BIRTHDAYCAKE_NAME) {
                    if (BIRTHDAYCAKE_NAME != value.name) {
                        continue;
                    }
                }

                console.log(value.name);

                let item = { ...value };
                item.description = '新鲜制作，如直接下单请提前1个小时预定，口感味道佳；如需要私人定制，可以联系13290768588(教育局店)。';
                item.materials = [
                    { id: 26010, name: '淡奶油' },
                    { id: 19554, name: '鸡蛋' },
                    { id: 10250, name: '面粉' },
                    { id: 19266, name: '牛奶' },
                    { id: 22682, name: '白砂糖' },
                    { id: 23930, name: '巧克力' }
                ];
                item.specs = [];
                for (let i = 0; i < value.specs.length; ++i) {
                    let spec = value.specs[i];
                    spec.specAttribute.unit = '人份';
                    let specName = spec.name;
                    let weight = '0';
                    let specNameArray = specName.split('+');
                    if (specNameArray.length === 2) {
                        if (specNameArray[1] === '6寸') {
                            weight = '4';
                        } else if (specNameArray[1] === '8寸') {
                            weight = '8';
                        } else if (specNameArray[1] === '10寸') {
                            weight = '10';
                        } else if (specNameArray[1] === '12寸') {
                            weight = '10';
                        } else if (specNameArray[1] === '14寸') {
                            weight = '10';
                        } else if (specNameArray[1] === '16寸') {
                            weight = '10';
                        }
                    }
                    spec.specAttribute.weight = weight;
                    spec.maxStock = 1000;
                    spec.stock = 1000;
                    spec.stockStatus = 1;
                    item.specs.push(spec);
                }
                await ProductService.updateItem(value.id, value.categoryId, item);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const excute = () => {
    var args = process.argv.splice(2);
    BIRTHDAYCAKE_NAME = args[0];

    // console.log(BIRTHDAYCAKE_NAME);
    startUpdate();
}

excute();
