const fs = require('fs');
const path = require('path');

// let currentPath = path.resolve('./');
// let dirName = path.basename(currentPath);
const dirNameStr = process.argv.splice(2);
const dirNames = dirNameStr[0].split('\\');
let dirName = '';
if (dirNames.length >= 2) {
    dirName = dirNames[1];
} else if (dirNames.length >= 1) {
    dirName = dirNames[0];
}

const fileNames = dirName.split('-');

const theId = fileNames[0];
const theCategoryName = fileNames[1];

// 98元起
const KSpecifications = [
    {
        "creamId": 1,
        "sizeId": 2,
        "price": 98
    },
    {
        "creamId": 1,
        "sizeId": 3,
        "price": 128
    },
    {
        "creamId": 1,
        "sizeId": 4,
        "price": 168
    },
    {
        "creamId": 1,
        "sizeId": 5,
        "price": 208
    },
    {
        "creamId": 2,
        "sizeId": 2,
        "price": 128
    },
    {
        "creamId": 2,
        "sizeId": 3,
        "price": 168
    },
    {
        "creamId": 2,
        "sizeId": 4,
        "price": 208
    },
    {
        "creamId": 2,
        "sizeId": 5,
        "price": 258
    }
];
// 108元起
const KSpecifications10 = [
    {
        "creamId": 1,
        "sizeId": 2,
        "price": 108
    },
    {
        "creamId": 1,
        "sizeId": 3,
        "price": 138
    },
    {
        "creamId": 1,
        "sizeId": 4,
        "price": 178
    },
    {
        "creamId": 1,
        "sizeId": 5,
        "price": 218
    },
    {
        "creamId": 2,
        "sizeId": 2,
        "price": 138
    },
    {
        "creamId": 2,
        "sizeId": 3,
        "price": 178
    },
    {
        "creamId": 2,
        "sizeId": 4,
        "price": 218
    },
    {
        "creamId": 2,
        "sizeId": 5,
        "price": 268
    }
];
// 118元起
const KSpecifications20 = [
    {
        "creamId": 1,
        "sizeId": 2,
        "price": 118
    },
    {
        "creamId": 1,
        "sizeId": 3,
        "price": 148
    },
    {
        "creamId": 1,
        "sizeId": 4,
        "price": 188
    },
    {
        "creamId": 1,
        "sizeId": 5,
        "price": 228
    },
    {
        "creamId": 2,
        "sizeId": 2,
        "price": 148
    },
    {
        "creamId": 2,
        "sizeId": 3,
        "price": 188
    },
    {
        "creamId": 2,
        "sizeId": 4,
        "price": 228
    },
    {
        "creamId": 2,
        "sizeId": 5,
        "price": 278
    }
];
// 128元起
const KSpecifications30 = [
    {
        "creamId": 1,
        "sizeId": 2,
        "price": 128
    },
    {
        "creamId": 1,
        "sizeId": 3,
        "price": 158
    },
    {
        "creamId": 1,
        "sizeId": 4,
        "price": 198
    },
    {
        "creamId": 1,
        "sizeId": 5,
        "price": 238
    },
    {
        "creamId": 2,
        "sizeId": 2,
        "price": 158
    },
    {
        "creamId": 2,
        "sizeId": 3,
        "price": 198
    },
    {
        "creamId": 2,
        "sizeId": 4,
        "price": 238
    },
    {
        "creamId": 2,
        "sizeId": 5,
        "price": 288
    }
];
// 138元起
const KSpecifications40 = [
    {
        "creamId": 1,
        "sizeId": 2,
        "price": 138
    },
    {
        "creamId": 1,
        "sizeId": 3,
        "price": 168
    },
    {
        "creamId": 1,
        "sizeId": 4,
        "price": 208
    },
    {
        "creamId": 1,
        "sizeId": 5,
        "price": 248
    },
    {
        "creamId": 2,
        "sizeId": 2,
        "price": 168
    },
    {
        "creamId": 2,
        "sizeId": 3,
        "price": 208
    },
    {
        "creamId": 2,
        "sizeId": 4,
        "price": 248
    },
    {
        "creamId": 2,
        "sizeId": 5,
        "price": 298
    }
];
// 148元起
const KSpecifications50 = [
    {
        "creamId": 1,
        "sizeId": 2,
        "price": 148
    },
    {
        "creamId": 1,
        "sizeId": 3,
        "price": 178
    },
    {
        "creamId": 1,
        "sizeId": 4,
        "price": 218
    },
    {
        "creamId": 1,
        "sizeId": 5,
        "price": 258
    },
    {
        "creamId": 2,
        "sizeId": 2,
        "price": 178
    },
    {
        "creamId": 2,
        "sizeId": 3,
        "price": 218
    },
    {
        "creamId": 2,
        "sizeId": 4,
        "price": 258
    },
    {
        "creamId": 2,
        "sizeId": 5,
        "price": 308
    }
];
// 158元起
const KSpecifications60 = [
    {
        "creamId": 1,
        "sizeId": 2,
        "price": 158
    },
    {
        "creamId": 1,
        "sizeId": 3,
        "price": 188
    },
    {
        "creamId": 1,
        "sizeId": 4,
        "price": 228
    },
    {
        "creamId": 1,
        "sizeId": 5,
        "price": 268
    },
    {
        "creamId": 2,
        "sizeId": 2,
        "price": 188
    },
    {
        "creamId": 2,
        "sizeId": 3,
        "price": 228
    },
    {
        "creamId": 2,
        "sizeId": 4,
        "price": 268
    },
    {
        "creamId": 2,
        "sizeId": 5,
        "price": 318
    }
];

let obj = { "products": [] };

const files = fs.readdirSync('./' + theId + '-' + theCategoryName);
for (let i = 0; i < files.length; ++i) {
    const file = files[i];
    if (path.extname(file) === '.jpg') {
        let fileNameWithExt = path.basename(file);
        var fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));
        const fileNames = fileName.split('_');

        let name = fileNames[0];
        let description = name;
        let price = fileNames[1];
        price = price ? price : '';
        let logo = fileNames[2];
        if (logo) continue;

        let product = {};
        product.name = name;
        product.description = description;
        product.category = {
            "id": theId,
            "name": theCategoryName
        };
        product.fillingRequired = true;
        let withPrice = price ? "_" + price : '';
        product.images = ["/生日蛋糕/图册/" + theId + "-" + theCategoryName + "/" +
            name + withPrice + ".jpg"];
        product.specifications = eval("KSpecifications" + price.toString());

        obj.products.push(product);
    }
}

let objText = JSON.stringify(obj);

let fileNameToBeMake = '0_products.json';
fs.writeFile('./' + theId + '-' + theCategoryName + '/' + fileNameToBeMake, objText, (err) => {
    if (err) throw err;
    console.log(fileNameToBeMake + '已生成');
})
