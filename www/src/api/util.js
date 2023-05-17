
const getTest = () => {
  return false;
};

const getWWWHost = () => {
  let wwwHost;
  if (getTest()) {
    wwwHost = 'http://localhost:4000';
  } else {
    let domainNameRule = /^(([-\u4E00-\u9FA5a-z0-9]{1,63})\.)+([\u4E00-\u9FA5a-z]{2,63})\.?$/
    if (domainNameRule.test(document.domain)) {
      wwwHost = 'http://gratefulwheat.ruyue.xyz';
    } else if (document.domain === 'localhost') {
      wwwHost = 'http://localhost:4000';
    } else {
      wwwHost = 'http://123.207.119.232';
    }
  }
  // console.log('wwwHost = ' + wwwHost);
  return wwwHost;
}

const getAllShop = () => {
  return [
    { index: 0, name: '全部门店', userId: '' },
    { index: 1, name: '001 - 弯麦(教育局店)', userId: '3995767' },
    { index: 2, name: '002 - 弯麦(旧镇店)', userId: '3995771' },
    { index: 3, name: '003 - 弯麦(江滨店)', userId: '4061089' },
    { index: 4, name: '004 - 弯麦(汤泉店)', userId: '4061092' },
    { index: 5, name: '005 - 弯麦(盘陀店)', userId: '4339546' },
    { index: 6, name: '006 - 弯麦(狮头店)', userId: '4359267' },
    { index: 7, name: '007 - 弯麦(联营店)', userId: '4382444' }
  ];
};

const getAllShopExceptAll = () => {
  return [
    { index: 0, name: '001 - 弯麦(教育局店)', userId: '3995767' },
    { index: 1, name: '002 - 弯麦(旧镇店)', userId: '3995771' },
    { index: 2, name: '003 - 弯麦(江滨店)', userId: '4061089' },
    { index: 3, name: '004 - 弯麦(汤泉店)', userId: '4061092' },
    { index: 4, name: '005 - 弯麦(盘陀店)', userId: '4339546' },
    { index: 5, name: '006 - 弯麦(狮头店)', userId: '4359267' },
    { index: 6, name: '007 - 弯麦(联营店)', userId: '4382444' }
  ];
};

const getAllOrderShopName = () => {
  return [
    '001 - 弯麦(教育局店)',
    '002 - 弯麦(旧镇店)',
    '003 - 弯麦(江滨店)',
    '004 - 弯麦(汤泉店)',
    '005 - 弯麦(盘陀店)',
    '006 - 弯麦(狮头店)',
    '007 - 弯麦(联营店)'
  ];
};

const getOrderTemplates = () => {
  return [
    { index: 0, name: '全部模板', templateId: '', templateUid: '' },
    { index: 1, name: '西点类', templateId: '189', templateUid: '1595397637628133418' },
    { index: 2, name: '常温类', templateId: '183', templateUid: '1595077654714716554' },
    { index: 3, name: '现烤类', templateId: '187', templateUid: '1595310806940367327' },
    { index: 4, name: '餐包类', templateId: '182', templateUid: '1595077405589137749' },
    { index: 5, name: '吐司类', templateId: '2873', templateUid: '1649149816769757925' }
  ];
};

const getOrderTypes = () => {
  return [
    { index: 0, name: '全部类型', id: '' },
    { index: 1, name: '直营店-日常单', id: '163' },
    { index: 2, name: '德林-火烧铺1店', id: '320' },
    { index: 3, name: '德林-火烧铺2店', id: '323' },
    { index: 4, name: '德林-学府店', id: '322' },
    { index: 5, name: '德林-假日店', id: '321' },
    { index: 6, name: '直营-江滨店', id: '325' },
    { index: 7, name: '测试单', id: '326' },
    { index: 8, name: '-', id: '400' }
  ];
};

const getAllCategorysExceptAll = () => {
  return [
    { index: 0, name: '现烤面包', categoryId: '1593049816479739965' },
    { index: 1, name: '西点慕斯', categoryId: '1592989355905414162' },
    { index: 2, name: '常温蛋糕', categoryId: '1593049881212199906' },
    { index: 3, name: '吐司面包', categoryId: '1593049854760654816' },
    { index: 4, name: '餐包面包', categoryId: '1626767161867698544' }

  ];
};

const getOrderTimeType = () => {
  return [
    { index: 0, name: '订货时间', timeType: '0' },
    { index: 1, name: '到货时间', timeType: '2' }
  ];
};


const getAllOrderTemplateName = () => {
  return [
    '现烤类',
    '西点类',
    '常温类',
    '餐包类',
    '吐司类',
  ];
};

const getProductSortIdArray = () => {
  return {
    /// 现烤
    '187-2006251756022': 1, //高钙片
    '187-2006291720144': 2, //焗烤三明治
    '187-2007261431428': 3, //奶酪杯
    '187-2006261548488': 4, //芝士鸡排三明治
    '187-2006251720443': 5, //手工蛋挞
    '187-2007171555580': 6, //全麦熏鸡三明治
    /// 吐司餐包
    '182-2106241432414': 1, //枫糖小吐司
    '182-2106281603003': 2, //红豆小吐司		
    '182-2106281600071': 3, //坚果小吐司			
    '182-2106281603355': 4, //南瓜小吐司				
    '182-2106241433091': 5, //松松小吐司					
    '182-2106281601535': 6, //椰蓉小吐司				
    '182-2010291510063': 7, //纯奶拉丝大吐司					
  };
};

const getTemplateSortIdArray = () => {
  return {
    '现烤类': 1,
    '西点类': 2,
    '常温类': 3,
    '餐包类': 4,
    '吐司类': 5,
  };
};

const getJustPrintWorkshopTemplates = () => {
  return ['现烤类', '西点类', '常温类', '餐包类', '吐司类'];
};

const getFlowType = () => {
  return [
    { index: 0, name: '全部货单', flowTypeId: '' },
    { index: 1, name: '门店进货单', flowTypeId: '12' },
    { index: 2, name: '普通调货单', flowTypeId: '10' },
    { index: 3, name: '调拨退货单', flowTypeId: '23' },
    { index: 4, name: '普通出库单', flowTypeId: '17' },
    { index: 5, name: '采购退货单', flowTypeId: '14' },
  ];
};

const getOrderCashiers = () => {
  return [
    { index: 0, name: '全部收银员', id: '' },
    { index: 1, name: '德林-火烧铺1店', id: '1' },
    { index: 2, name: '德林-火烧铺2店', id: '2' },
    { index: 3, name: '德林-学府店', id: '3' },
    { index: 4, name: '德林-假日店', id: '4' },
    { index: 5, name: '直营-江滨店', id: '5' },
    { index: 6, name: '徐碧莲', id: '6' },
    { index: 7, name: '王荣慧', id: '7' }
  ];
};

// 'EPSON L380 Series' 或者 'EPSON LQ-735K ESC/P2'
const KA4PrinterName = 'EPSON L380 Series';
const getA4PrinterName = () => {
  return KA4PrinterName;
};

const getA4PrinterIndex = (LODOP) => {
  let a4PrinterIndex = -1;
  var iPrinterCount = LODOP.GET_PRINTER_COUNT();
  for (let i = 0; i < iPrinterCount; i++) {
    let name = LODOP.GET_PRINTER_NAME(i);
    if (name === KA4PrinterName) {
      a4PrinterIndex = i;
      break;
    }
  };
  return a4PrinterIndex;
};

const getPageName4A4Printer = () => {
  return 'A4';
};

const KNeedlePrinterName = 'EPSON LQ-735K ESC/P2';
const getNeedlePrinterName = () => {
  return KNeedlePrinterName;
};

const getNeedlePrinterIndex = (LODOP) => {
  let needlePrinterIndex = -1;
  var iPrinterCount = LODOP.GET_PRINTER_COUNT();
  for (let i = 0; i < iPrinterCount; i++) {
    let name = LODOP.GET_PRINTER_NAME(i);
    if (name === KNeedlePrinterName) {
      needlePrinterIndex = i;
      break;
    }
  };
  return needlePrinterIndex;
};

const getPageName4NeedlePrinter = () => {
  return '针打三等分';
};

const KLabelPrinterName = '炫印P3(标签)';
const getLabelPrinterName = () => {
  return KLabelPrinterName;
};

const getLabelPrinterIndex = (LODOP) => {
  let labelPrinterIndex = -1;
  var iPrinterCount = LODOP.GET_PRINTER_COUNT();
  for (let i = 0; i < iPrinterCount; i++) {
    let name = LODOP.GET_PRINTER_NAME(i);
    if (name === KLabelPrinterName) {
      labelPrinterIndex = i;
      break;
    }
  };
  return labelPrinterIndex;
};

export {
  getTest,
  getWWWHost,
  getAllShop,
  getAllShopExceptAll,
  getAllCategorysExceptAll,
  getAllOrderShopName,
  getOrderTemplates,
  getOrderTypes,
  getOrderTimeType,
  getAllOrderTemplateName,
  getFlowType,
  getOrderCashiers,
  getProductSortIdArray,
  getTemplateSortIdArray,
  getJustPrintWorkshopTemplates,
  getA4PrinterName,
  getA4PrinterIndex,
  getPageName4A4Printer,
  getNeedlePrinterName,
  getNeedlePrinterIndex,
  getPageName4NeedlePrinter,
  getLabelPrinterName,
  getLabelPrinterIndex
}