
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

export {
  getProductSaleList,
  getProductDiscardList
};