
console.log('process.env.NODE_ENV = ' + process.env.NODE_ENV);

/**--------------------配置信息--------------------*/
const KApiHost = process.env.NODE_ENV === 'development' ?
  'http://localhost:9001' : 'http://gratefulwheat.ruyue.xyz/apis';

const getProductSaleList = async (userId, beginDateTime, endDateTime, pageIndex, pageSize) => {
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

  const productSaleResponse = await fetch(productSaleUrl);
  const productSaleJson = await productSaleResponse.json();
  return productSaleJson;
}

const getProductDiscardList = async (userId, date) => {
  // console.log('getProductDiscardList begin');
  let productDiscardUrl = KApiHost + '/product/discardList';
  productDiscardUrl += '?userId=';
  productDiscardUrl += userId;
  productDiscardUrl += '&date=';
  productDiscardUrl += date;
  console.log(productDiscardUrl);

  const productDiscardResponse = await fetch(productDiscardUrl);
  const productDiscardJson = await productDiscardResponse.json();
  return productDiscardJson;
}

export {
  getProductSaleList,
  getProductDiscardList
};