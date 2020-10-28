
console.log('process.env.NODE_ENV = ' + process.env.NODE_ENV);

/**--------------------配置信息--------------------*/
const KApiHost = process.env.NODE_ENV === 'development' ?
  'http://localhost:9001' : 'http://gratefulwheat.ruyue.xyz/apis';

const getProductSaleList = async (userId, beginDateTime, endDateTime, pageIndex, pageSize, keyword) => {
  let productSaleUrl = KApiHost + '/product/saleList';
  productSaleUrl += '?pageIndex=';
  productSaleUrl += pageIndex;
  productSaleUrl += '&pageSize=';
  productSaleUrl += pageSize;
  productSaleUrl += '&userId=';
  productSaleUrl += userId;
  productSaleUrl += '&beginDateTime=';
  productSaleUrl += beginDateTime;
  productSaleUrl += '&endDateTime=';
  productSaleUrl += endDateTime;
  productSaleUrl += '&keyword=';
  productSaleUrl += keyword;

  const productSaleResponse = await fetch(productSaleUrl);
  const productSaleJson = await productSaleResponse.json();
  return productSaleJson;
}

const getProductDiscardList = async (userId, beginDateTime, endDateTime, keyword) => {
  // console.log('getProductDiscardList begin');
  let productDiscardUrl = KApiHost + '/product/discardList';
  productDiscardUrl += '?userId=';
  productDiscardUrl += userId;
  productDiscardUrl += '&beginDateTime=';
  productDiscardUrl += beginDateTime;
  productDiscardUrl += '&endDateTime=';
  productDiscardUrl += endDateTime;
  productDiscardUrl += '&keyword=';
  productDiscardUrl += keyword;

  console.log(productDiscardUrl);
  // userId=&categoryUids=%5B%5D&reasonName=&beginDateTime=2020.10.16+00%3A00%3A00&endDateTime=2020.10.16+23%3A59%3A59&keyword=

  const productDiscardResponse = await fetch(productDiscardUrl);
  const productDiscardJson = await productDiscardResponse.json();
  return productDiscardJson;
}

const getProductSaleAndDiscardList = async (userId, categoryId, beginDateTime, endDateTime, keyword) => {
  let productSaleAndDiscardUrl = KApiHost + '/product/saleAndDiscardList';

  productSaleAndDiscardUrl += '?userId='
  productSaleAndDiscardUrl += userId;
  productSaleAndDiscardUrl += '&categoryId=';
  productSaleAndDiscardUrl += categoryId;
  productSaleAndDiscardUrl += '&beginDateTime=';
  productSaleAndDiscardUrl += beginDateTime;
  productSaleAndDiscardUrl += '&endDateTime=';
  productSaleAndDiscardUrl += endDateTime;
  productSaleAndDiscardUrl += '&keyword=';
  productSaleAndDiscardUrl += keyword;

  // console.log(productSaleAndDiscardUrl);
  // keyword=&categorysJson=%5B%221593049816479739965%22%5D&beginDateTime=2020-10-21&endDateTime=2020-10-27&pageIndex=1&pageSize=50&orderColumn=&asc=false
  const productSaleAndDiscardResponse = await fetch(productSaleAndDiscardUrl);
  const productSaleAndDiscardJson = await productSaleAndDiscardResponse.json();
  return productSaleAndDiscardJson;
}

export {
  getProductSaleList,
  getProductDiscardList,
  getProductSaleAndDiscardList
};