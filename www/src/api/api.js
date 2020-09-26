

/**--------------------配置信息--------------------*/
const KForTest = false;
const KApiHost = KForTest ? 'http://localhost:9001' : 'http://gratefulwheat.ruyue.xyz/apis';

const getProductSaleList = async (userId, date, pageIndex, pageSize) => {
  let productSaleUrl = KApiHost + '/product/saleList';
  productSaleUrl += '?pageIndex=';
  productSaleUrl += pageIndex;
  productSaleUrl += '&pageSize=';
  productSaleUrl += pageSize;
  productSaleUrl+='&userId=';
  productSaleUrl+=userId;
  productSaleUrl+='&date=';
  productSaleUrl+=date;

  const productSaleResponse = await fetch(productSaleUrl);
  const productSaleJson = await productSaleResponse.json();
  return productSaleJson;
}

export {
  getProductSaleList
};