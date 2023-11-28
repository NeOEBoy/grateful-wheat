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

console.log('theId =' + theId);
console.log('theCategoryName =' + theCategoryName);

const file = fs.readFileSync('./' + theId + '-' + theCategoryName + '/0_products.json');
console.log('name = ' + './' + theId + '-' + theCategoryName + '/0_products.json');

let objAfter = {};
objAfter.products = [];

let obj = JSON.parse(file)
let products = obj.products;
products.forEach(product => {
    let productAfter = {};
    productAfter.name = product.name;
    productAfter.description = product.description;
    productAfter.category = product.category;
    productAfter.fillingRequired = product.fillingRequired;
    let image = product.images[0].replace('_logo', '');
    productAfter.thumbnail = image;
    productAfter.images = product.images;
    productAfter.specifications = product.specifications;

    objAfter.products.push(productAfter);
});

let afterAddStr = JSON.stringify(objAfter);

// console.log('afterAddStr =' + afterAddStr);

fs.writeFileSync('./' + theId + '-' + theCategoryName + '/0_products1.json', afterAddStr);
