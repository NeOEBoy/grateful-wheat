const fetch = require('node-fetch');
const parseStringPromise = require('xml2js').parseStringPromise;
const ExcelJS = require('exceljs');
const moment = require('moment');

let THEInfo1NameCell; let THEInfo2NameCell; let THEInfo3NameCell;
let THEInfo1TotalCell; let THEInfo2TotalCell; let THEInfo3TotalCell;
let SHOP_NAME; let SHOP_USERID; let QUERYMONTH;

/// 增加门店这里添加一下
KShopHeadUserId = '3995763'; // 总部账号
const KShopArray = [
  { index: 0, name: '总部', userId: KShopHeadUserId },
  { index: 1, name: '教育局店', userId: '3995767' },
  { index: 2, name: '旧镇店', userId: '3995771' },
  { index: 3, name: '江滨店', userId: '4061089' },
  { index: 4, name: '汤泉世纪店', userId: '4061092' }
];

const makeExcelTitle = (worksheet) => {
  let lastRow = 1;
  /// 第一行空行
  {
    const placeholderCol = worksheet.getColumn(1);
    placeholderCol.width = 4;
    const placeholderRow = worksheet.getRow(lastRow);
    placeholderRow.height = 12;
    worksheet.mergeCells('B1:P1');
  }
  /// 第二行数字序号行
  lastRow++;
  {
    const seriNumRow = worksheet.getRow(lastRow);
    seriNumRow.height = 40;
    worksheet.mergeCells('B2:P2');
    let seriNumCell = worksheet.getCell('B2');
    seriNumCell.value = '③';
    seriNumCell.font = { size: 16, bold: true, name: '等线' };
    seriNumCell.alignment = { horizontal: 'center', vertical: 'middle' }
    seriNumCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    seriNumCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  return lastRow;
}

const makeExcelInfo1Meta = (worksheet, lastRow) => {
  lastRow++;
  /// 空行
  {
    const emptyRow = worksheet.getRow(lastRow);
    emptyRow.height = 14;
    worksheet.mergeCells('B' + lastRow + ':P' + lastRow);
    let emptyCell = worksheet.getCell('B' + lastRow);
    emptyCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  /// 标题行
  lastRow++;
  {
    const titleRow = worksheet.getRow(lastRow);
    titleRow.height = 14;
    worksheet.mergeCells('B' + lastRow + ':P' + lastRow);
    THEInfo1NameCell = 'B' + lastRow;
    let titleCell = worksheet.getCell('B' + lastRow);
    titleCell.value = '进货统计';
    titleCell.font = { size: 10, bold: true, name: '等线' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    titleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  /// 副标题栏
  lastRow++;
  {
    worksheet.getRow(lastRow).height = 14;
    worksheet.getColumn(2).width = 4;
    let serialNumSubTitleCell = worksheet.getCell('B' + lastRow);
    serialNumSubTitleCell.value = '序';
    serialNumSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    serialNumSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    serialNumSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    serialNumSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('C' + lastRow + ':F' + lastRow);
    let productSubTitleCell = worksheet.getCell('C' + lastRow);
    productSubTitleCell.value = '商品';
    productSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    productSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    productSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    productSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('G' + lastRow + ':J' + lastRow);
    let priceSubTitleCell = worksheet.getCell('G' + lastRow);
    priceSubTitleCell.value = '价格';
    priceSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    priceSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    priceSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    priceSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('K' + lastRow + ':N' + lastRow);
    let numSubTitleCell = worksheet.getCell('K' + lastRow);
    numSubTitleCell.value = '数量';
    numSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    numSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    numSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    numSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let totalPriceSubTitleCell = worksheet.getCell('O' + lastRow);
    totalPriceSubTitleCell.value = '总价';
    totalPriceSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    totalPriceSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    totalPriceSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    totalPriceSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let otherSubTitleCell = worksheet.getCell('P' + lastRow);
    otherSubTitleCell.value = '其它';
    otherSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    otherSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    otherSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    otherSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  /// 项目栏
  lastRow++;
  {
    worksheet.getRow(6).height = 14;

    let serialNumItemTitleCell = worksheet.getCell('B' + lastRow);
    serialNumItemTitleCell.value = '序号';
    serialNumItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    serialNumItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    serialNumItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBFBFBF' }
    };
    serialNumItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(3).width = 18;
    let productNameItemTitleCell = worksheet.getCell('C' + lastRow);
    productNameItemTitleCell.value = '商品名称';
    productNameItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productNameItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productNameItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productNameItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(4).width = 12;
    let productCategoryItemTitleCell = worksheet.getCell('D' + lastRow);
    productCategoryItemTitleCell.value = '商品分类';
    productCategoryItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productCategoryItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productCategoryItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productCategoryItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(5).width = 10;
    let productSpecificationItemTitleCell = worksheet.getCell('E' + lastRow);
    productSpecificationItemTitleCell.value = '商品规格';
    productSpecificationItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productSpecificationItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productSpecificationItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productSpecificationItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(6).width = 4;
    let productUnitItemTitleCell = worksheet.getCell('F' + lastRow);
    productUnitItemTitleCell.value = '单位';
    productUnitItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productUnitItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productUnitItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productUnitItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(7).width = 8;
    let salePriceItemTitleCell = worksheet.getCell('G' + lastRow);
    salePriceItemTitleCell.value = '销售价';
    salePriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    salePriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    salePriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    salePriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(8).width = 8;
    let memberPriceItemTitleCell = worksheet.getCell('H' + lastRow);
    memberPriceItemTitleCell.value = '会员价';
    memberPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    memberPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    memberPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    memberPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(9).width = 8;
    let wholeSalePriceItemTitleCell = worksheet.getCell('I' + lastRow);
    wholeSalePriceItemTitleCell.value = '批发价';
    wholeSalePriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    wholeSalePriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wholeSalePriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    wholeSalePriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(10).width = 8;
    let partnerPriceItemTitleCell = worksheet.getCell('J' + lastRow);
    partnerPriceItemTitleCell.value = '加盟价';
    partnerPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    partnerPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    partnerPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    partnerPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(11).width = 8;
    let enterNumberItemTitleCell = worksheet.getCell('K' + lastRow);
    enterNumberItemTitleCell.value = '进货数';
    enterNumberItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    enterNumberItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    enterNumberItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE699' }
    };
    enterNumberItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(12).width = 8;
    let returnNumberItemTitleCell = worksheet.getCell('L' + lastRow);
    returnNumberItemTitleCell.value = '退货数';
    returnNumberItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    returnNumberItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    returnNumberItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE699' }
    };
    returnNumberItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(13).width = 8;
    let transferNumberItemTitleCell = worksheet.getCell('M' + lastRow);
    transferNumberItemTitleCell.value = '调出数';
    transferNumberItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    transferNumberItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    transferNumberItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE699' }
    };
    transferNumberItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(14).width = 8;
    let promotionsNumberItemTitleCell = worksheet.getCell('N' + lastRow);
    promotionsNumberItemTitleCell.value = '最终数';
    promotionsNumberItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    promotionsNumberItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    promotionsNumberItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE699' }
    };
    promotionsNumberItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(15).width = 8;
    let partnerTotalPriceItemTitleCell = worksheet.getCell('O' + lastRow);
    partnerTotalPriceItemTitleCell.value = '进货总价';
    partnerTotalPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    partnerTotalPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    partnerTotalPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA9D08E' }
    };
    partnerTotalPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.getColumn(16).width = 20;
    let promotionsTotalPriceItemTitleCell = worksheet.getCell('P' + lastRow);
    promotionsTotalPriceItemTitleCell.value = '备注';
    promotionsTotalPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    promotionsTotalPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    promotionsTotalPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF4B084' }
    };
    promotionsTotalPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }

  return lastRow;
}

const makeExcelInfo1Data = async (worksheet, thePOSPALAUTH30220, lastRow) => {
  // console.log(thePOSPALAUTH30220);
  const enterNumberInfoArray = await getProductTransferNumberInfo(thePOSPALAUTH30220, 15);
  // console.log(enterNumberInfoArray);
  const returnNumberInfoArray = await getProductTransferNumberInfo(thePOSPALAUTH30220, 16);
  // console.log(returnNumberInfoArray);
  const normalOutNumberInfoArray = await getProductTransferNumberInfo(thePOSPALAUTH30220, 13);
  // console.log(normalOutNumberInfoArray);

  const totalNumberInfoArray = mergeEnterReturnOutInfo(
    enterNumberInfoArray, returnNumberInfoArray, normalOutNumberInfoArray);

  console.log('准备查询对应商品详细信息！');
  let excelRowInformation = [];
  let firstRow = lastRow + 1;
  for (let index = 0; index < totalNumberInfoArray.length; ++index) {
    let totalNumberInfo = totalNumberInfoArray[index];
    totalNumberInfo.serialNum = index + 1;
    totalNumberInfo.category = '';
    totalNumberInfo.specification = '';
    totalNumberInfo.unit = '';
    totalNumberInfo.price = 0;
    totalNumberInfo.memberPrice = 0;
    totalNumberInfo.wholePrice = 0;

    console.log('正在查询<' + totalNumberInfo.code + totalNumberInfo.name + '>的商品详细信息！');
    let productInfo = await getProductInfo(thePOSPALAUTH30220, totalNumberInfo.code);
    if (productInfo) {
      totalNumberInfo.category = productInfo.category;
      totalNumberInfo.specification = productInfo.specification;
      totalNumberInfo.unit = productInfo.productUnit;
      totalNumberInfo.price = productInfo.price;
      totalNumberInfo.memberPrice = productInfo.memberPrice;
      totalNumberInfo.wholePrice = productInfo.wholePrice;
      // console.log(totalNumberInfo);
    }

    let excelRowItem = {};
    excelRowItem.row = totalNumberInfo.serialNum + firstRow - 1;
    excelRowItem.data = [];
    excelRowItem.data.push({ column: 'B', value: totalNumberInfo.serialNum });
    excelRowItem.data.push({ column: 'C', value: totalNumberInfo.name });
    excelRowItem.data.push({ column: 'D', value: totalNumberInfo.category });
    excelRowItem.data.push({ column: 'E', value: totalNumberInfo.specification });
    excelRowItem.data.push({ column: 'F', value: totalNumberInfo.unit });
    excelRowItem.data.push({ column: 'G', value: totalNumberInfo.price, numFmt: '0.00' });
    excelRowItem.data.push({ column: 'H', value: totalNumberInfo.memberPrice, numFmt: '0.00' });
    excelRowItem.data.push({ column: 'I', value: totalNumberInfo.wholePrice, numFmt: '0.00' });
    let costPriceFormula = 'IF(OR(D' + excelRowItem.row + '=\"外购品\",D'
      + excelRowItem.row + '=\"弯麦耗材\"),I' + excelRowItem.row
      + ',IF(H' + excelRowItem.row + '<G' + excelRowItem.row
      + ',H' + excelRowItem.row + ',G' + excelRowItem.row + ')*0.7)';
    excelRowItem.data.push({ column: 'J', value: { formula: costPriceFormula, result: '公式' }, numFmt: '0.00' });
    excelRowItem.data.push({ column: 'K', value: totalNumberInfo.enterNumber, numFmt: '0' });
    excelRowItem.data.push({ column: 'L', value: totalNumberInfo.returnNumber, numFmt: '0' });
    excelRowItem.data.push({ column: 'M', value: totalNumberInfo.outNumber, numFmt: '0' });
    let finalNumberFormula = 'K' + excelRowItem.row
      + '-L' + excelRowItem.row + '-M' + excelRowItem.row;
    excelRowItem.data.push({ column: 'N', value: { formula: finalNumberFormula, result: '公式' }, numFmt: '0' });
    let totalPriceFormula = 'J' + excelRowItem.row + '*N' + excelRowItem.row;
    excelRowItem.data.push({ column: 'O', value: { formula: totalPriceFormula, result: '公式' }, numFmt: '0.00' });
    excelRowItem.data.push({ column: 'P', value: '' });

    excelRowInformation.push(excelRowItem);

    lastRow++;

    /// 测试一下
    // if (index >= 0) break;
  }

  lastRow++;
  let excelRowFooterItem1 = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', value: '' },
      { column: 'M', value: '' },
      { column: 'N', value: '' },
      { column: 'O', value: '' },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooterItem1);

  lastRow++;
  let totalPriceFormula = 'SUM(O' + firstRow + ':O' + (lastRow - 2) + ')';
  let excelRowFooterItem2 = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', value: '' },
      { column: 'M', value: '' },
      {
        column: 'N', value: '总计',
        fontBold: true
      },
      {
        column: 'O', value: { formula: totalPriceFormula, result: '公式' },
        numFmt: '0.00', fontBold: true
      },
      { column: 'P', value: '' }
    ]
  };
  THEInfo1TotalCell = 'O' + lastRow;
  excelRowInformation.push(excelRowFooterItem2);

  lastRow++;
  let excelRowFooterItem3 = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', value: '' },
      { column: 'M', value: '' },
      { column: 'N', value: '' },
      { column: 'O', value: '' },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooterItem3);

  console.log('查询销售信息完毕！');
  console.log('开始插入进货条目！');
  insertItemToWorkSheet(excelRowInformation, worksheet);
  console.log('插入进货条目完毕！');

  return lastRow;
}

const makeExcelInfo2Meta = (worksheet, lastRow) => {
  // console.log('makeExcelInfo2Meta lastRow =' + lastRow);
  lastRow++;
  {
    const placeholderRow = worksheet.getRow(lastRow);
    placeholderRow.height = 12;
    worksheet.mergeCells('B' + lastRow + ':P' + lastRow);
    let emptyCell = worksheet.getCell('B' + lastRow);
    emptyCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  lastRow++;
  {
    const titleRow = worksheet.getRow(lastRow);
    titleRow.height = 14;
    worksheet.mergeCells('B' + lastRow + ':P' + lastRow);
    THEInfo2NameCell = 'B' + lastRow;
    let titleCell = worksheet.getCell('B' + lastRow);
    titleCell.value = '报损统计';
    titleCell.font = { size: 10, bold: true, name: '等线' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    titleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  lastRow++;
  {
    worksheet.getRow(lastRow).height = 14;
    let serialNumSubTitleCell = worksheet.getCell('B' + lastRow);
    serialNumSubTitleCell.value = '序';
    serialNumSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    serialNumSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    serialNumSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    serialNumSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('C' + lastRow + ':F' + lastRow);
    let productSubTitleCell = worksheet.getCell('C' + lastRow);
    productSubTitleCell.value = '商品';
    productSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    productSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    productSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    productSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('G' + lastRow + ':J' + lastRow);
    let priceSubTitleCell = worksheet.getCell('G' + lastRow);
    priceSubTitleCell.value = '价格';
    priceSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    priceSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    priceSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    priceSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let numSubTitleCell = worksheet.getCell('K' + lastRow);
    numSubTitleCell.value = '数量';
    numSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    numSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    numSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    numSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('L' + lastRow + ':O' + lastRow);
    let totalPriceSubTitleCell = worksheet.getCell('L' + lastRow);
    totalPriceSubTitleCell.value = '总价';
    totalPriceSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    totalPriceSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    totalPriceSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    totalPriceSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let otherSubTitleCell = worksheet.getCell('P' + lastRow);
    otherSubTitleCell.value = '其它';
    otherSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    otherSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    otherSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    otherSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  lastRow++;
  {
    worksheet.getRow(lastRow).height = 14;
    let serialNumItemTitleCell = worksheet.getCell('B' + lastRow);
    serialNumItemTitleCell.value = '序号';
    serialNumItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    serialNumItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    serialNumItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBFBFBF' }
    };
    serialNumItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let productNameItemTitleCell = worksheet.getCell('C' + lastRow);
    productNameItemTitleCell.value = '商品名称';
    productNameItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productNameItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productNameItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productNameItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let productCategoryItemTitleCell = worksheet.getCell('D' + lastRow);
    productCategoryItemTitleCell.value = '商品分类';
    productCategoryItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productCategoryItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productCategoryItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productCategoryItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let productSpecificationItemTitleCell = worksheet.getCell('E' + lastRow);
    productSpecificationItemTitleCell.value = '商品规格';
    productSpecificationItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productSpecificationItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productSpecificationItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productSpecificationItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let productUnitItemTitleCell = worksheet.getCell('F' + lastRow);
    productUnitItemTitleCell.value = '单位';
    productUnitItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productUnitItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productUnitItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productUnitItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let salePriceItemTitleCell = worksheet.getCell('G' + lastRow);
    salePriceItemTitleCell.value = '销售价';
    salePriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    salePriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    salePriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    salePriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let memberPriceItemTitleCell = worksheet.getCell('H' + lastRow);
    memberPriceItemTitleCell.value = '会员价';
    memberPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    memberPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    memberPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    memberPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let wholeSalePriceItemTitleCell = worksheet.getCell('I' + lastRow);
    wholeSalePriceItemTitleCell.value = '批发价';
    wholeSalePriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    wholeSalePriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wholeSalePriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    wholeSalePriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let discardPriceItemTitleCell = worksheet.getCell('J' + lastRow);
    discardPriceItemTitleCell.value = '报损价';
    discardPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    discardPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    discardPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    discardPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let discardNumberItemTitleCell = worksheet.getCell('K' + lastRow);
    discardNumberItemTitleCell.value = '报损数';
    discardNumberItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    discardNumberItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    discardNumberItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE699' }
    };
    discardNumberItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('L' + lastRow + ':M' + lastRow);
    let discardImaginaryTotalPriceItemTitleCell = worksheet.getCell('L' + lastRow);
    discardImaginaryTotalPriceItemTitleCell.value = '报损虚总价';
    discardImaginaryTotalPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    discardImaginaryTotalPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    discardImaginaryTotalPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA9D08E' }
    };
    discardImaginaryTotalPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('N' + lastRow + ':O' + lastRow);
    let discardRealTotalPriceItemTitleCell = worksheet.getCell('N' + lastRow);
    discardRealTotalPriceItemTitleCell.value = '报损实总价';
    discardRealTotalPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    discardRealTotalPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    discardRealTotalPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA9D08E' }
    };
    discardRealTotalPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let remarkItemTitleCell = worksheet.getCell('P' + lastRow);
    remarkItemTitleCell.value = '备注';
    remarkItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    remarkItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    remarkItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF4B084' }
    };
    remarkItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }

  return lastRow;
}

const makeExcelInfo2Data = async (worksheet, thePOSPALAUTH30220, lastRow) => {
  // console.log('正在查询报损信息！');
  const numberInfoArray = await getDiscardProductList(thePOSPALAUTH30220);
  // console.log(numberInfoArray);
  let excelRowInformation = [];
  let firstRow = lastRow + 1;
  for (let index = 0; index < numberInfoArray.length; ++index) {
    let discardNumberInfo = numberInfoArray[index];
    discardNumberInfo.serialNum = index + 1;
    discardNumberInfo.category = '';
    discardNumberInfo.specification = '';
    discardNumberInfo.unit = '';
    discardNumberInfo.price = 0;
    discardNumberInfo.memberPrice = 0;
    discardNumberInfo.wholePrice = 0;

    console.log('正在查询<' + discardNumberInfo.code + discardNumberInfo.name + '>的销售信息！');
    let productInfo = await getProductInfo(thePOSPALAUTH30220, discardNumberInfo.code);
    if (productInfo) {
      discardNumberInfo.category = productInfo.category;
      discardNumberInfo.specification = productInfo.specification;
      discardNumberInfo.unit = productInfo.productUnit;
      discardNumberInfo.price = productInfo.price;
      discardNumberInfo.memberPrice = productInfo.memberPrice;
      discardNumberInfo.wholePrice = productInfo.wholePrice;
      // console.log(discardNumberInfo);
    }

    let excelRowItem = {};
    excelRowItem.row = discardNumberInfo.serialNum + firstRow - 1;
    excelRowItem.data = [];
    excelRowItem.data.push({ column: 'B', value: discardNumberInfo.serialNum });
    excelRowItem.data.push({ column: 'C', value: discardNumberInfo.name });
    excelRowItem.data.push({ column: 'D', value: discardNumberInfo.category });
    excelRowItem.data.push({ column: 'E', value: discardNumberInfo.specification });
    excelRowItem.data.push({ column: 'F', value: discardNumberInfo.unit });
    excelRowItem.data.push({ column: 'G', value: discardNumberInfo.price, numFmt: '0.00' });
    excelRowItem.data.push({ column: 'H', value: discardNumberInfo.memberPrice, numFmt: '0.00' });
    excelRowItem.data.push({ column: 'I', value: discardNumberInfo.wholePrice, numFmt: '0.00' });
    let discardPriceFormula = 'IF(OR(D' + excelRowItem.row + '=\"外购品\",D'
      + excelRowItem.row + '=\"弯麦耗材\"),I' + excelRowItem.row
      + ',IF(H' + excelRowItem.row + '<G' + excelRowItem.row
      + ',H' + excelRowItem.row + ',G' + excelRowItem.row + ')*0.7)';
    excelRowItem.data.push({ column: 'J', value: { formula: discardPriceFormula, result: '公式' }, numFmt: '0.00' });
    excelRowItem.data.push({ column: 'K', value: discardNumberInfo.discardNumber, numFmt: '0' });

    let discardTotalImaginaryPriceFormula = 'G' + excelRowItem.row + '*K' + excelRowItem.row;
    excelRowItem.data.push(
      {
        column: 'L',
        merge: 'L' + excelRowItem.row + ':M' + excelRowItem.row,
        value: { formula: discardTotalImaginaryPriceFormula, result: '公式' },
        numFmt: '0.00'
      });

    let discardTotalRealPriceFormula = 'J' + excelRowItem.row + '*K' + excelRowItem.row;
    excelRowItem.data.push(
      {
        column: 'N',
        merge: 'N' + excelRowItem.row + ':O' + excelRowItem.row,
        value: { formula: discardTotalRealPriceFormula, result: '公式' },
        numFmt: '0.00'
      });

    excelRowItem.data.push({ column: 'P', value: '' });

    excelRowInformation.push(excelRowItem);

    lastRow++;

    /// 测试一下
    // if (index >= 1) break;
  }
  // console.log(numberInfoArray);

  lastRow++;
  let excelRowFooterItem1 = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', merge: 'L' + lastRow + ':M' + lastRow, value: '' },
      { column: 'N', merge: 'N' + lastRow + ':O' + lastRow, value: '' },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooterItem1);

  lastRow++;
  let totalImaginaryPriceFormula = 'SUM(L' + firstRow + ':L' + (lastRow - 2) + ')';
  let totalRealPriceFormula = 'SUM(N' + firstRow + ':N' + (lastRow - 2) + ')';
  let excelRowFooterItem2 = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', value: '总计', fontBold: true },
      {
        column: 'M', value: { formula: totalImaginaryPriceFormula, result: '公式' },
        numFmt: '0.00', fontBold: true
      },
      { column: 'N', value: '总计', fontBold: true },
      {
        column: 'O', value: { formula: totalRealPriceFormula, result: '公式' },
        numFmt: '0.00', fontBold: true
      },
      { column: 'P', value: '' }
    ]
  };
  THEInfo2TotalCell = 'O' + lastRow;
  excelRowInformation.push(excelRowFooterItem2);

  lastRow++;
  let excelRowFooterItem3 = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', value: '' },
      { column: 'M', value: '' },
      { column: 'N', value: '' },
      { column: 'O', value: '' },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooterItem3);

  console.log('查询销售信息完毕！');
  console.log('开始插入报损条目！');
  insertItemToWorkSheet(excelRowInformation, worksheet);
  console.log('插入报损条目完毕！');

  return lastRow;
}

const makeExcelInfo3Meta = (worksheet, lastRow) => {
  lastRow++;
  /// 空行
  {
    const emptyRow = worksheet.getRow(lastRow);
    emptyRow.height = 14;
    worksheet.mergeCells('B' + lastRow + ':P' + lastRow);
    let emptyCell = worksheet.getCell('B' + lastRow);
    emptyCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  /// 标题行
  lastRow++;
  {
    const titleRow = worksheet.getRow(lastRow);
    titleRow.height = 14;
    THEInfo3NameCell = 'B' + lastRow;
    worksheet.mergeCells('B' + lastRow + ':P' + lastRow);
    let titleCell = worksheet.getCell('B' + lastRow);
    titleCell.value = '活动统计';
    titleCell.font = { size: 10, bold: true, name: '等线' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    titleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  lastRow++;
  {
    worksheet.getRow(lastRow).height = 14;
    let serialNumSubTitleCell = worksheet.getCell('B' + lastRow);
    serialNumSubTitleCell.value = '序';
    serialNumSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    serialNumSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    serialNumSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    serialNumSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('C' + lastRow + ':F' + lastRow);
    let productSubTitleCell = worksheet.getCell('C' + lastRow);
    productSubTitleCell.value = '商品';
    productSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    productSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    productSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    productSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('G' + lastRow + ':K' + lastRow);
    let priceSubTitleCell = worksheet.getCell('G' + lastRow);
    priceSubTitleCell.value = '价格';
    priceSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    priceSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    priceSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    priceSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let numSubTitleCell = worksheet.getCell('L' + lastRow);
    numSubTitleCell.value = '数量';
    numSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    numSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    numSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    numSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('M' + lastRow + ':O' + lastRow);
    let totalPriceSubTitleCell = worksheet.getCell('M' + lastRow);
    totalPriceSubTitleCell.value = '总价';
    totalPriceSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    totalPriceSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    totalPriceSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    totalPriceSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let otherSubTitleCell = worksheet.getCell('P' + lastRow);
    otherSubTitleCell.value = '其它';
    otherSubTitleCell.font = { size: 10, bold: true, name: '等线' };
    otherSubTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    otherSubTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    otherSubTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  lastRow++;
  {
    worksheet.getRow(lastRow).height = 14;
    let serialNumItemTitleCell = worksheet.getCell('B' + lastRow);
    serialNumItemTitleCell.value = '序号';
    serialNumItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    serialNumItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    serialNumItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBFBFBF' }
    };
    serialNumItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let productNameItemTitleCell = worksheet.getCell('C' + lastRow);
    productNameItemTitleCell.value = '商品名称';
    productNameItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productNameItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productNameItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productNameItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let productCategoryItemTitleCell = worksheet.getCell('D' + lastRow);
    productCategoryItemTitleCell.value = '商品分类';
    productCategoryItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productCategoryItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productCategoryItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productCategoryItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let productSpecificationItemTitleCell = worksheet.getCell('E' + lastRow);
    productSpecificationItemTitleCell.value = '商品规格';
    productSpecificationItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productSpecificationItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productSpecificationItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productSpecificationItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let productUnitItemTitleCell = worksheet.getCell('F' + lastRow);
    productUnitItemTitleCell.value = '单位';
    productUnitItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    productUnitItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    productUnitItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }
    };
    productUnitItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let salePriceItemTitleCell = worksheet.getCell('G' + lastRow);
    salePriceItemTitleCell.value = '销售价';
    salePriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    salePriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    salePriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    salePriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let memberPriceItemTitleCell = worksheet.getCell('H' + lastRow);
    memberPriceItemTitleCell.value = '会员价';
    memberPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    memberPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    memberPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    memberPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let wholeSalePriceItemTitleCell = worksheet.getCell('I' + lastRow);
    wholeSalePriceItemTitleCell.value = '批发价';
    wholeSalePriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    wholeSalePriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wholeSalePriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    wholeSalePriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let discardPriceItemTitleCell = worksheet.getCell('J' + lastRow);
    discardPriceItemTitleCell.value = '加盟价';
    discardPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    discardPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    discardPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    discardPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let activityPriceItemTitleCell = worksheet.getCell('K' + lastRow);
    activityPriceItemTitleCell.value = '活动价';
    activityPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    activityPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    activityPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }
    };
    activityPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let activityNumberItemTitleCell = worksheet.getCell('L' + lastRow);
    activityNumberItemTitleCell.value = '活动数';
    activityNumberItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    activityNumberItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    activityNumberItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE699' }
    };
    activityNumberItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('M' + lastRow + ':O' + lastRow);
    let totalPriceItemTitleCell = worksheet.getCell('M' + lastRow);
    totalPriceItemTitleCell.value = '活动总盈亏';
    totalPriceItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    totalPriceItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    totalPriceItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA9D08E' }
    };
    totalPriceItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let remarkItemTitleCell = worksheet.getCell('P' + lastRow);
    remarkItemTitleCell.value = '备注';
    remarkItemTitleCell.font = { size: 9, bold: true, name: '等线' };
    remarkItemTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    remarkItemTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF4B084' }
    };
    remarkItemTitleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }

  return lastRow;
}

const makeExcelInfo3Data = (worksheet, lastRow) => {
  let excelRowInformation = [];

  lastRow++;
  let firstRow = lastRow;
  let excelRowExampleItem = {
    row: lastRow,
    data: [
      { column: 'B', value: 1 },
      { column: 'C', value: '手工蛋挞' },
      { column: 'D', value: '现烤' },
      { column: 'E', value: '单个' },
      { column: 'F', value: '个' },
      { column: 'G', value: 3.5, numFmt: '0.00' },
      { column: 'H', value: 3.5, numFmt: '0.00' },
      { column: 'I', value: 3.5, numFmt: '0.00' },
      {
        column: 'J', value: {
          formula: 'IF(OR(D' + lastRow + '=\"外购品\",D'
            + lastRow + '=\"弯麦耗材\"),I' + lastRow
            + ',IF(H' + lastRow + '<G' + lastRow
            + ',H' + lastRow + ',G' + lastRow + ')*0.7)', result: '公式'
        }, numFmt: '0.00'
      },
      { column: 'K', value: 0.25 },
      { column: 'L', value: 2 },
      {
        column: 'M', merge: 'M' + lastRow + ':O' + lastRow,
        value: {
          formula: '(K' + lastRow + '-J' + lastRow + ')*L' + lastRow,
          result: '公式'
        },
        numFmt: '0.00'
      },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowExampleItem);

  lastRow++;
  let excelRowExample2Item = {
    row: lastRow,
    data: [
      { column: 'B', value: 2 },
      { column: 'C', value: '胡萝卜餐包' },
      { column: 'D', value: '吐司餐包' },
      { column: 'E', value: '-' },
      { column: 'F', value: '袋' },
      { column: 'G', value: 8.5, numFmt: '0.00' },
      { column: 'H', value: 8.5, numFmt: '0.00' },
      { column: 'I', value: 8.5, numFmt: '0.00' },
      {
        column: 'J', value: {
          formula: 'IF(OR(D' + lastRow + '=\"外购品\",D'
            + lastRow + '=\"弯麦耗材\"),I' + lastRow
            + ',IF(H' + lastRow + '<G' + lastRow
            + ',H' + lastRow + ',G' + lastRow + ')*0.7)', result: '公式'
        }, numFmt: '0.00'
      },
      { column: 'K', value: 5 },
      { column: 'L', value: 3 },
      {
        column: 'M', merge: 'M' + lastRow + ':O' + lastRow,
        value: {
          formula: '(K' + lastRow + '-J' + lastRow + ')*L' + lastRow,
          result: '公式'
        },
        numFmt: '0.00'
      },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowExample2Item);

  lastRow++;
  let excelRowFooter1Item = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', value: '' },
      { column: 'M', merge: 'M' + lastRow + ':O' + lastRow, value: '' },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooter1Item);

  lastRow++;
  let excelRowFooter2Item = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', value: '总计', fontBold: true },
      {
        column: 'M', merge: 'M' + lastRow + ':O' + lastRow,
        value: {
          formula: 'SUM(M' + firstRow + ':M' + (lastRow - 2) + ')',
          result: '公式'
        },
        numFmt: '0.00',
        fontBold: true
      },
      { column: 'P', value: '' }
    ]
  };
  THEInfo3TotalCell = 'M' + lastRow;
  excelRowInformation.push(excelRowFooter2Item);

  lastRow++;
  let excelRowFooter3Item = {
    row: lastRow,
    data: [
      { column: 'B', value: '' },
      { column: 'C', value: '' },
      { column: 'D', value: '' },
      { column: 'E', value: '' },
      { column: 'F', value: '' },
      { column: 'G', value: '' },
      { column: 'H', value: '' },
      { column: 'I', value: '' },
      { column: 'J', value: '' },
      { column: 'K', value: '' },
      { column: 'L', value: '' },
      { column: 'M', merge: 'M' + lastRow + ':O' + lastRow, value: '' },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooter3Item);

  console.log('开始插入合计条目！');
  insertItemToWorkSheet(excelRowInformation, worksheet);
  console.log('插入合计条目完毕！');

  return lastRow;
}

const makeExcelInfo4Meta = (worksheet, lastRow) => {
  lastRow++;
  /// 空行
  {
    const emptyRow = worksheet.getRow(lastRow);
    emptyRow.height = 14;
    worksheet.mergeCells('K' + lastRow + ':P' + lastRow);
    let emptyCell = worksheet.getCell('K' + lastRow);
    emptyCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  /// 标题行
  lastRow++;
  {
    const titleRow = worksheet.getRow(lastRow);
    titleRow.height = 14;
    worksheet.mergeCells('K' + lastRow + ':P' + lastRow);
    let titleCell = worksheet.getCell('K' + lastRow);
    titleCell.value = '合计';
    titleCell.font = { size: 10, bold: true, name: '等线' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    titleCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  /// 副标题行
  lastRow++;
  {
    const subTitleRow = worksheet.getRow(lastRow);
    subTitleRow.height = 14;
    worksheet.mergeCells('K' + lastRow + ':L' + lastRow);
    let itemCell = worksheet.getCell('K' + lastRow);
    itemCell.value = '条目';
    itemCell.font = { size: 10, bold: true, name: '等线' };
    itemCell.alignment = { horizontal: 'center', vertical: 'middle' }
    itemCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    itemCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    worksheet.mergeCells('M' + lastRow + ':O' + lastRow);
    let moneyCell = worksheet.getCell('M' + lastRow);
    moneyCell.value = '金额';
    moneyCell.font = { size: 10, bold: true, name: '等线' };
    moneyCell.alignment = { horizontal: 'center', vertical: 'middle' }
    moneyCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    moneyCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };

    let remarkCell = worksheet.getCell('P' + lastRow);
    remarkCell.value = '备注';
    remarkCell.font = { size: 10, bold: true, name: '等线' };
    remarkCell.alignment = { horizontal: 'center', vertical: 'middle' }
    remarkCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFACB9CA' }
    };
    remarkCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
  }
  return lastRow;
}

const makeExcelInfo4Data = (worksheet, lastRow) => {
  let excelRowInformation = [];

  lastRow++;
  let firstRow = lastRow;
  let excelRow1Item = {
    row: lastRow,
    data: [
      {
        column: 'K', merge: 'K' + lastRow + ':L' + lastRow,
        value: {
          formula: THEInfo1NameCell,
          result: '公式'
        }
      },
      {
        column: 'M', merge: 'M' + lastRow + ':O' + lastRow,
        value: {
          formula: THEInfo1TotalCell,
          result: '公式'
        }, numFmt: '0.00'
      },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRow1Item);

  lastRow++;
  let excelRow2Item = {
    row: lastRow,
    data: [
      {
        column: 'K', merge: 'K' + lastRow + ':L' + lastRow,
        value: {
          formula: THEInfo2NameCell,
          result: '公式'
        }
      },
      {
        column: 'M', merge: 'M' + lastRow + ':O' + lastRow,
        value: {
          formula: '-IF(' + THEInfo2TotalCell + '<' + THEInfo1TotalCell + '*0.025,'
            + THEInfo2TotalCell + ',' + THEInfo1TotalCell + '*0.025)',
          result: '公式'
        }, numFmt: '0.00'
      },
      { column: 'P', value: '以进货额0.025为限' }
    ]
  };
  excelRowInformation.push(excelRow2Item);

  lastRow++;
  let excelRow3Item = {
    row: lastRow,
    data: [
      {
        column: 'K', merge: 'K' + lastRow + ':L' + lastRow,
        value: {
          formula: THEInfo3NameCell,
          result: '公式'
        }
      },
      {
        column: 'M', merge: 'M' + lastRow + ':O' + lastRow,
        value: {
          formula: THEInfo3TotalCell,
          result: '公式'
        }, numFmt: '0.00'
      },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRow3Item);

  lastRow++;
  let excelRowFooter1Item = {
    row: lastRow,
    data: [
      { column: 'K', merge: 'K' + lastRow + ':L' + lastRow, value: '' },
      { column: 'M', merge: 'M' + lastRow + ':O' + lastRow, value: '' },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooter1Item);

  lastRow++;
  let excelRowFooter2Item = {
    row: lastRow,
    data: [
      { column: 'K', merge: 'K' + lastRow + ':L' + lastRow, value: '总计', fontBold: true },
      {
        column: 'M', merge: 'M' + lastRow + ':O' + lastRow,
        value: {
          formula: 'SUM(M' + firstRow + ':M' + (lastRow - 2) + ')',
          result: '公式'
        },
        numFmt: '0.00',
        fontBold: true
      },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooter2Item);

  lastRow++;
  let excelRowFooter3Item = {
    row: lastRow,
    data: [
      { column: 'K', merge: 'K' + lastRow + ':L' + lastRow, value: '' },
      { column: 'M', merge: 'M' + lastRow + ':O' + lastRow, value: '' },
      { column: 'P', value: '' }
    ]
  };
  excelRowInformation.push(excelRowFooter3Item);

  console.log('开始插入活动例子条目！');
  insertItemToWorkSheet(excelRowInformation, worksheet);
  console.log('插入活动例子条目完毕！');

  return lastRow;
}

const insertItemToWorkSheet = (excelRowInformation, worksheet) => {
  for (let rowIndex = 0; rowIndex < excelRowInformation.length; rowIndex++) {
    let excelRowItem = excelRowInformation[rowIndex];
    let excelRow = excelRowItem.row;
    let excelRowData = excelRowItem.data;
    for (let columnIndex = 0; columnIndex < excelRowData.length; columnIndex++) {
      let columnItemInfo = excelRowData[columnIndex];

      let merge = columnItemInfo.merge;
      if (merge) {
        worksheet.mergeCells(merge);
      }

      let columnChar = columnItemInfo.column;
      let coordinate = '' + columnChar + excelRow;
      // console.log(coordinate);
      let columnItemCell = worksheet.getCell(coordinate);
      columnItemCell.value = columnItemInfo.value;
      // console.log(columnItemInfo.value);

      columnItemCell.numFmt = columnItemInfo.numFmt;
      let fontBold = columnItemInfo.fontBold;
      columnItemCell.font = { size: 9, bold: fontBold ? fontBold : false, name: '等线' };
      columnItemCell.alignment = { horizontal: 'center', vertical: 'middle' };
      columnItemCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }
}

const siginAndGetPOSPALAUTH30220 = async () => {
  let signInUrl = 'https://beta33.pospal.cn/account/SignIn';
  let signInBody = { 'userName': 'wanmaizb', 'password': 'Rainsnow12' };
  const signInResponse = await fetch(signInUrl, {
    method: 'POST', body: JSON.stringify(signInBody),
    headers: { 'Content-Type': 'application/json' }
  });
  let setCookie = signInResponse.headers.get('set-cookie');
  let thePOSPALAUTH30220 = '';
  let cookieArray = setCookie.split('; ');
  cookieArray.forEach(element => {
    let cookieSingle = element.split('=');
    if (cookieSingle[0] === 'HttpOnly, .POSPALAUTH30220') {
      // console.log(cookieSingle[1]);
      thePOSPALAUTH30220 = cookieSingle[1];
    }
  });

  return thePOSPALAUTH30220;
}

const getProductTransferNumberInfo = async (thePOSPALAUTH30220, stockFlowType) => {
  let stockMessage = '';
  if (stockFlowType === 15) {
    stockMessage = '普通调货(进)';
  } else if (stockFlowType === 16) {
    stockMessage = '调拨退货(出)';
  } else if (stockFlowType === 13) {
    stockMessage = '普通调货(出)';
  }

  console.log('正在查询门店《' + stockMessage + '》信息！');

  let numberInfoArray = [];

  let loadProductStockFlowByPageUrl = 'https://beta33.pospal.cn/StockFlow/LoadProductStockFlowByPage';
  let loadProductStockFlowByPageBodyStr = '';
  loadProductStockFlowByPageBodyStr += 'userId=' + SHOP_USERID;
  loadProductStockFlowByPageBodyStr += '&stockFlowType=';
  loadProductStockFlowByPageBodyStr += stockFlowType; // 普通调货(进)=15, 调拨退货(出)=16, 普通调货(出)=13
  loadProductStockFlowByPageBodyStr += '&nextStockFlowUserId='; // 全部出库门店
  loadProductStockFlowByPageBodyStr += '&supplierUid=';

  let beginDay = moment(QUERYMONTH, 'YYYY.MM').startOf('month').format("YYYY.MM.DD");
  let endDay = moment(QUERYMONTH, 'YYYY.MM').endOf('month').format("YYYY.MM.DD");

  loadProductStockFlowByPageBodyStr += '&beginTime=' + beginDay + '+00%3A00%3A00';
  loadProductStockFlowByPageBodyStr += '&endTime=' + endDay + '+23%3A59%3A59';
  loadProductStockFlowByPageBodyStr += '&remarks=';
  loadProductStockFlowByPageBodyStr += '&pageIndex=1';
  loadProductStockFlowByPageBodyStr += '&pageSize=1000';
  loadProductStockFlowByPageBodyStr += '&orderColumn=';
  loadProductStockFlowByPageBodyStr += '&asc=false';

  const loadProductStockFlowByPageResponse = await fetch(loadProductStockFlowByPageUrl, {
    method: 'POST', body: loadProductStockFlowByPageBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const loadProductStockFlowByPageResponseJson = await loadProductStockFlowByPageResponse.json();
  // console.log(loadProductStockFlowByPageResponseJson);
  if (loadProductStockFlowByPageResponseJson.successed) {
    let contentView = loadProductStockFlowByPageResponseJson.contentView;
    contentView = contentView.replace(/\r\n/g, "");
    contentView = contentView.replace(/\n/g, "");

    try {
      // console.log(contentView);
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml, {
        strict: false, // 为true可能解析不正确
        normalizeTags: true
      });

      if (result) {
        let productCodeIndex = -1;
        let productNameIndex = -1;
        let productNumberIndex = -1;

        let theadTHArray = result.root.thead[0].tr[0].th;
        let theadTRLength = theadTHArray.length;
        for (let index = 0; index < theadTRLength; ++index) {
          let itemName = theadTHArray[index]._;
          if (!itemName) {
            continue;
          }
          if (itemName === '商品条码') {
            productCodeIndex = index;
            continue;
          }
          if (itemName === '商品名称') {
            productNameIndex = index;
            continue;
          }
          if (itemName === '数量') {
            productNumberIndex = index;
            continue;
          }
        }

        // console.log(productCodeIndex);
        // console.log(productNameIndex);
        // console.log(productNumberIndex);

        let tbodyTRArray = result.root.tbody[0].tr;
        let tbodyTRLength = tbodyTRArray.length;
        if (tbodyTRLength === 1) {
          let tr0Property = tbodyTRArray[0].$;
          if (tr0Property.CLASS === 'noRecord') {
            throw new Error('查找不到' + stockMessage + '的调货记录信息!!!');
          }
        }

        for (let index = 0; index < tbodyTRLength; ++index) {
          let productCode = tbodyTRArray[index].td[productCodeIndex];
          // console.log(productCode);
          let productName = tbodyTRArray[index].td[productNameIndex];
          // console.log(productName);
          let productNumber = tbodyTRArray[index].td[productNumberIndex]._;
          productNumber = parseInt(productNumber);
          // console.log(productNumber);

          let enterNumberInfoItem = { code: productCode, name: productName, number: productNumber };
          numberInfoArray.push(enterNumberInfoItem);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  console.log('已查询到门店《' + stockMessage + '》信息，共' + numberInfoArray.length + '项目');

  return numberInfoArray;
}

const getProductInfo = async (thePOSPALAUTH30220, code) => {
  let productInfo;

  let loadProductsByPageUrl = 'https://beta33.pospal.cn/Product/LoadProductsByPage';
  let loadProductsByPageBodyStr = '';
  loadProductsByPageBodyStr += 'groupBySpu=false';
  loadProductsByPageBodyStr += '&userId=3995763';
  loadProductsByPageBodyStr += '&productbrand=';
  loadProductsByPageBodyStr += '&categorysJson=%5B%5D';
  loadProductsByPageBodyStr += '&enable=1';
  loadProductsByPageBodyStr += '&supplierUid=';
  loadProductsByPageBodyStr += '&productTagUidsJson=%5B%5D';
  loadProductsByPageBodyStr += '&keyword=';
  loadProductsByPageBodyStr += code;
  loadProductsByPageBodyStr += '&categoryType=';
  loadProductsByPageBodyStr += '&pageIndex=1';
  loadProductsByPageBodyStr += '&pageSize=50';
  loadProductsByPageBodyStr += '&orderColumn=';
  loadProductsByPageBodyStr += '&asc=false';

  // groupBySpu=false&userId=3995763&productbrand=&categorysJson=%5B%5D&enable=1&supplierUid=&productTagUidsJson=%5B%5D&keyword=2007272052278&
  // categoryType=&pageIndex=1&pageSize=50&orderColumn=&asc=false
  const loadProductsByPageResponse = await fetch(loadProductsByPageUrl, {
    method: 'POST', body: loadProductsByPageBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const loadProductsByPageResponseJson = await loadProductsByPageResponse.json();
  // console.log(loadProductsByPageResponseJson);
  if (loadProductsByPageResponseJson.successed) {
    let contentView = loadProductsByPageResponseJson.contentView;
    contentView = contentView.replace(/\r\n/g, "");
    contentView = contentView.replace(/\n/g, "");

    try {
      // console.log(contentView);
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml, {
        strict: false, // 为true可能解析不正确
        normalizeTags: true
      });

      if (result) {
        let productCodeIndex = -1;
        let productNameIndex = -1;
        let productCategoryIndex = -1;
        let productSpecificationIndex = -1;
        let productUnitIndex = -1;
        let productPriceIndex = -1;
        let productMemberPriceIndex = -1;
        let productWholePriceIndex = -1;

        let theadTHArray = result.root.thead[0].tr[0].th;
        // console.log(theadTHArray);

        let theadTRLength = theadTHArray.length;
        for (let index = 0; index < theadTRLength; ++index) {
          let itemName = theadTHArray[index]._;
          if (!itemName) {
            continue;
          }
          itemName = itemName.trim();
          if (itemName === '条码') {
            productCodeIndex = index;
            continue;
          }
          if (itemName === '商品名称') {
            productNameIndex = index;
            continue;
          }
          if (itemName === '分类') {
            productCategoryIndex = index;
            continue;
          }
          if (itemName === '规格') {
            productSpecificationIndex = index;
            continue;
          }
          if (itemName === '主单位') {
            productUnitIndex = index;
            continue;
          }
          if (itemName === '销售价') {
            productPriceIndex = index;
            continue;
          }
          if (itemName === '会员价') {
            productMemberPriceIndex = index;
            continue;
          }
          if (itemName === '批发价') {
            productWholePriceIndex = index;
            continue;
          }
        }

        // console.log(productCodeIndex);
        // console.log(productNameIndex);
        // console.log(productCategoryIndex);
        // console.log(productSpecificationIndex);
        // console.log(productUnitIndex);
        // console.log(productPriceIndex);
        // console.log(productMemberPriceIndex);
        // console.log(productWholePriceIndex);

        let tbodyTRArray = result.root.tbody[0].tr;
        // console.log(tbodyTRArray);
        let rightTbodyTRItem;
        let tbodyTRLength = tbodyTRArray.length;
        if (tbodyTRLength === 1) {
          let tr0Property = tbodyTRArray[0].$;
          if (tr0Property.CLASS === 'noRecord') {
            throw new Error('查找不到' + code + '的商品记录信息!!!');
          }
        }

        // console.log(tbodyTRArray);

        for (let i = 0; i < tbodyTRArray.length; ++i) {
          let tbodyTRItem = tbodyTRArray[i];
          let productCode = tbodyTRItem.td[productCodeIndex];
          productCode = productCode.trim();
          if (productCode === code) {
            rightTbodyTRItem = tbodyTRItem;
            break;
          }
        }
        // console.log(rightTbodyTRItem);

        let productCode = rightTbodyTRItem.td[productCodeIndex];
        productCode = productCode.trim();
        // console.log(productCode);
        let productName = rightTbodyTRItem.td[productNameIndex];
        productName = productName.trim();
        // console.log(productName);
        let productCategory = rightTbodyTRItem.td[productCategoryIndex];
        productCategory = productCategory.trim();
        // console.log(productCategory);
        let productSpecification = rightTbodyTRItem.td[productSpecificationIndex];
        productSpecification = productSpecification.trim();
        // console.log(productSpecification);
        let productUnit = rightTbodyTRItem.td[productUnitIndex]._;
        productUnit = productUnit.trim();
        // console.log(productUnit);
        let productPrice = rightTbodyTRItem.td[productPriceIndex]._;
        productPrice = productPrice.trim();
        productPrice = parseFloat(productPrice);
        // console.log(productPrice);
        let productMemberPrice = rightTbodyTRItem.td[productMemberPriceIndex]._;
        productMemberPrice = productMemberPrice.trim();
        productMemberPrice = parseFloat(productMemberPrice);
        // console.log(productMemberPrice);
        let productWholePrice = rightTbodyTRItem.td[productWholePriceIndex]._;
        productWholePrice = productWholePrice.trim();
        productWholePrice = parseFloat(productWholePrice);
        // console.log(productWholePrice);

        productInfo = {
          code: productCode, name: productName,
          category: productCategory, specification: productSpecification,
          productUnit: productUnit, price: productPrice,
          memberPrice: productMemberPrice, wholePrice: productWholePrice
        };
      }
    } catch (error) {
      console.log('运行出错===>' + error);
    }
  }

  return productInfo;
}

const getDiscardProductList = async (thePOSPALAUTH30220) => {
  let numberInfoArray = [];

  let loadDiscardProductCountListUrl = 'https://beta33.pospal.cn/Inventory/LoadDiscardProductCountList';
  let loadDiscardProductCountListBodyStr = '';
  loadDiscardProductCountListBodyStr += 'userId=' + SHOP_USERID;
  loadDiscardProductCountListBodyStr += '&categoryUids=%5B%5D';
  loadDiscardProductCountListBodyStr += '&reasonName=';

  let beginDay = moment(QUERYMONTH, 'YYYY.MM').startOf('month').format("YYYY.MM.DD");
  let endDay = moment(QUERYMONTH, 'YYYY.MM').endOf('month').format("YYYY.MM.DD");

  loadDiscardProductCountListBodyStr += '&beginDateTime=' + beginDay + '+00%3A00%3A00';
  loadDiscardProductCountListBodyStr += '&endDateTime=' + endDay + '+23%3A59%3A59';
  loadDiscardProductCountListBodyStr += '&keyword=';

  const loadDiscardProductCountListResponse = await fetch(loadDiscardProductCountListUrl, {
    method: 'POST', body: loadDiscardProductCountListBodyStr,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': '.POSPALAUTH30220=' + thePOSPALAUTH30220
    }
  });
  const loadDiscardProductCountListResponseJson = await loadDiscardProductCountListResponse.json();
  // console.log(loadDiscardProductCountListResponseJson);
  if (loadDiscardProductCountListResponseJson.successed) {
    let contentView = loadDiscardProductCountListResponseJson.view;
    contentView = contentView.replace(/\r\n/g, "");
    contentView = contentView.replace(/\n/g, "");

    try {
      // console.log(contentView);
      var xml = '<?xml version="1.0" encoding="UTF-8" ?><root>' + contentView + '</root>';
      // console.log(xml);
      let result = await parseStringPromise(xml, {
        strict: false, // 为true可能解析不正确
        normalizeTags: true
      });

      if (result) {
        // console.log(result);
        let tbodyTRArray = result.root.tbody[0].tr;
        // console.log(tbodyTRArray);
        let tbodyTRLength = tbodyTRArray.length;
        if (tbodyTRLength === 1) {
          let tr0Property = tbodyTRArray[0].$;
          if (tr0Property.CLASS === 'noRecord') {
            throw new Error('查找不到报损记录信息!!!');
          }
        }

        let productCodeIndex = -1;
        let productNameIndex = -1;
        let discardNumberIndex = -1;

        let theadTHArray = result.root.thead[0].tr[0].th;
        let theadTRLength = theadTHArray.length;
        for (let index = 0; index < theadTRLength; ++index) {
          let itemName = theadTHArray[index];
          if (!itemName) {
            continue;
          }
          if (itemName === '条码') {
            productCodeIndex = index;
            continue;
          }
          if (itemName === '商品名称') {
            productNameIndex = index;
            continue;
          }
          if (itemName === '报损数量') {
            discardNumberIndex = index;
            continue;
          }
        }

        // console.log(productCodeIndex);
        // console.log(productNameIndex);
        // console.log(discardNumberIndex);
        for (let index = 0; index < tbodyTRLength; ++index) {
          let productCode = tbodyTRArray[index].td[productCodeIndex];
          // console.log(productCode);
          let productName = tbodyTRArray[index].td[productNameIndex];
          // console.log(productName);
          let discardNumber = tbodyTRArray[index].td[discardNumberIndex]._;
          discardNumber = parseInt(discardNumber);
          // console.log(discardNumber);

          let numberInfoItem = { code: productCode, name: productName, discardNumber: discardNumber };
          if (productName === '总计') continue;
          numberInfoArray.push(numberInfoItem);
        }
      }
    }
    catch (error) {
      console.log('运行出错===>' + error);
    }
  }

  return numberInfoArray;
}

const mergeEnterReturnOutInfo = (enterNumberInfoArray, returnNumberInfoArray, outNumberInfoArray) => {
  console.log('正在合并商品流转信息！');

  let totalNumberInfoArray = [];
  let codeIndexArray = {};
  /// 合并进货(进)，退货(出)，调货(出)
  enterNumberInfoArray.forEach(enterNumberInfo => {
    let totalNumberInfo = {};
    totalNumberInfo.code = enterNumberInfo.code;
    totalNumberInfo.name = enterNumberInfo.name;
    totalNumberInfo.enterNumber = enterNumberInfo.number;
    totalNumberInfo.returnNumber = 0;
    totalNumberInfo.outNumber = 0;
    totalNumberInfoArray.push(totalNumberInfo);

    codeIndexArray[enterNumberInfo.code] = totalNumberInfoArray.length - 1;
  });

  returnNumberInfoArray.forEach(returnNumberInfo => {
    let codeIndex = codeIndexArray[returnNumberInfo.code];
    if (codeIndex) {
      let totalNumberInfo = totalNumberInfoArray[codeIndex];
      totalNumberInfo.returnNumber = returnNumberInfo.number;
    } else {
      let totalNumberInfo = {};
      totalNumberInfo.code = returnNumberInfo.code;
      totalNumberInfo.name = returnNumberInfo.name;
      totalNumberInfo.enterNumber = 0;
      totalNumberInfo.returnNumber = returnNumberInfo.number;
      totalNumberInfo.outNumber = 0;
      totalNumberInfoArray.push(totalNumberInfo);

      codeIndexArray[returnNumberInfo.code] = totalNumberInfoArray.length - 1;
    }
  });

  outNumberInfoArray.forEach(normalOutNumberInfo => {
    let codeIndex = codeIndexArray[normalOutNumberInfo.code];
    if (codeIndex) {
      let totalNumberInfo = totalNumberInfoArray[codeIndex];
      totalNumberInfo.outNumber = normalOutNumberInfo.number;
    } else {
      let totalNumberInfo = {};
      totalNumberInfo.name = normalOutNumberInfo.name;
      totalNumberInfo.code = normalOutNumberInfo.code;
      totalNumberInfo.enterNumber = 0;
      totalNumberInfo.returnNumber = 0;
      totalNumberInfo.outNumber = normalOutNumberInfo.number;
      totalNumberInfoArray.push(totalNumberInfo);

      codeIndexArray[normalOutNumberInfo.code] = totalNumberInfoArray.length - 1;
    }
  });

  return totalNumberInfoArray;
}

const startBuild = async () => {
  let beginDay = moment(QUERYMONTH, 'YYYY.MM').startOf('month').format("YYYY.MM.DD");
  let endDay = moment(QUERYMONTH, 'YYYY.MM').endOf('month').format("YYYY.MM.DD");
  console.log('准备提取<<' + SHOP_NAME + '>>，从<<' + beginDay + '>>到<<' + endDay + '>>的进货数据！！！');

  /// 登录并获取验证信息
  console.log('正在登陆银豹！');
  const thePOSPALAUTH30220 = await siginAndGetPOSPALAUTH30220();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('进货对账详单');
  /// 总标题
  console.log('准备构建总表格头！');
  let theLastRow = makeExcelTitle(worksheet);
  /// 进货支出Meta
  console.log('准备构建进货表格头！');
  theLastRow = makeExcelInfo1Meta(worksheet, theLastRow);
  /// 进货支出data
  console.log('准备构建进货表格内容！');
  theLastRow = await makeExcelInfo1Data(worksheet, thePOSPALAUTH30220, theLastRow);
  /// 报损统计Meta
  console.log('准备构建报损表格头！');
  theLastRow = makeExcelInfo2Meta(worksheet, theLastRow);
  /// 报损统计data
  console.log('准备构建报损表格内容！');
  theLastRow = await makeExcelInfo2Data(worksheet, thePOSPALAUTH30220, theLastRow);
  /// 活动盈亏Meta
  console.log('准备构建活动盈亏表格头！');
  theLastRow = makeExcelInfo3Meta(worksheet, theLastRow);
  /// 报损统计data
  console.log('准备构建活动表格内容！');
  theLastRow = makeExcelInfo3Data(worksheet, theLastRow);
  /// 合计Meta
  console.log('准备构建合计表格头！');
  theLastRow = makeExcelInfo4Meta(worksheet, theLastRow);
  /// 合计data
  console.log('准备构建合计表格内容！');
  theLastRow = makeExcelInfo4Data(worksheet, theLastRow);

  await workbook.xlsx.writeFile('./' + SHOP_NAME + '_' + QUERYMONTH + '_' + '进货对账表.xlsx');

  console.log('提取完毕，请查看<<' + SHOP_NAME + '_' + QUERYMONTH + '_' + '进货对账表.xlsx>>文件！！！');
}

var args = process.argv.splice(2);
// args[0]='877461508' args[1]='品类优惠测试券'
if (args.length !== 2) {
  console.log('参数错误，第1参数：店名(教育局店|旧镇店|江滨店|汤泉世纪店|...)，第2个参数：月份(2020.12)');
} else {
  for (let index = 0; index < KShopArray.length; ++index) {
    let shop = KShopArray[index];
    if (shop.name === args[0]) {
      SHOP_USERID = shop.userId;
      SHOP_NAME = shop.name;
      break;
    }
  }
  if (SHOP_USERID === undefined) {
    console.log('第1参数错误，请输入正确店名(如：教育局店|旧镇店|江滨店|汤泉世纪店|...)');
    return;
  }

  if (args[1].indexOf('.') === -1) {
    console.log('第2参数错误，请输入正确月份(如：2020.12)');
    return;
  }
  QUERYMONTH = args[1];

  startBuild();
}

