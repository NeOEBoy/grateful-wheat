
const getProductSaleList = async (userId, date, pageIndex, pageSize) => {
  let productSaleUrl = 'http://localhost:9001/product/saleList';
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