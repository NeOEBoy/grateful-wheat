
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
    { name: '所有门店', userId: '' },
    { name: '001 - 弯麦(教育局店)', userId: '3995767' },
    { name: '004 - 弯麦(汤泉店)', userId: '4061092' },
    { name: '005 - 弯麦(盘陀店)', userId: '4339546' },
    { name: '007 - 弯麦(联营店)', userId: '4382444' }
  ];
};

const getAllShopExceptAll = () => {
  return [
    { name: '001 - 弯麦(教育局店)', userId: '3995767' },
    { name: '004 - 弯麦(汤泉店)', userId: '4061092' },
    { name: '005 - 弯麦(盘陀店)', userId: '4339546' },
    { name: '007 - 弯麦(联营店)', userId: '4382444' }
  ];
};

const getAllOrderShopName = () => {
  return [
    '001 - 弯麦(教育局店)',
    '004 - 弯麦(汤泉店)',
    '005 - 弯麦(盘陀店)',
    '007 - 弯麦(联营店)'
  ];
};

const getOrderTemplates = () => {
  return [
    { name: '所有模板', templateId: '', templateUid: '' },
    { name: '全部类型', templateId: '4974', templateUid: '1688217806649695085' },
  ];
};

const getOrderTypes = () => {
  return [
    { name: '所有类型', id: '' },
    { name: '直营店-日常单', id: '163' },
    { name: '德林-火烧铺1店', id: '320' },
    { name: '德林-火烧铺2店', id: '323' },
    { name: '德林-假日店', id: '321' },
    { name: '德林-府前街店', id: '326' },
    { name: '德林-学府店', id: '322' },
    { name: '锦客隆-西湖店', id: '325' },
    { name: '德林-湖滨店', id: '348' },
    { name: '预留类型-2', id: '349' },
    { name: '预留类型-3', id: '350' },
    { name: '-', id: '400' }
  ];
};

const getAllCategorysExceptAll = () => {
  return [
    { name: '现烤面包', categoryId: '1593049816479739965' },
    { name: '西点慕斯', categoryId: '1592989355905414162' },
    { name: '常温蛋糕', categoryId: '1593049881212199906' },
    { name: '吐司面包', categoryId: '1593049854760654816' },
    { name: '餐包面包', categoryId: '1626767161867698544' }

  ];
};

const getOrderTimeType = () => {
  return [
    { name: '订货时间', timeType: '0' },
    { name: '到货时间', timeType: '2' }
  ];
};

const getAllOrderTemplateName = () => {
  return [
    '全部类型'
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
    '182-2106241433091': 5, //肉松小吐司					
    '182-2106281601535': 6, //椰蓉小吐司				
    '182-2010291510063': 7, //纯奶拉丝大吐司					
  };
};

const getTemplateSortIdArray = () => {
  return {
    '全部类型': 1
  };
};

const getJustPrintWorkshopTemplates = () => {
  return ['全部类型'];
};

const getFlowType = () => {
  return [
    { name: '所有货单', flowTypeId: '' },
    { name: '门店进货单', flowTypeId: '12' },
    { name: '普通调货单', flowTypeId: '10' },
    { name: '调拨退货单', flowTypeId: '23' },
    { name: '普通出库单', flowTypeId: '17' },
    { name: '采购退货单', flowTypeId: '14' },
  ];
};

const getOrderCashiers = () => {
  return [
    { name: '所有收银员', id: '' },
    { name: '德林-火烧铺1店', id: '1' },
    { name: '德林-火烧铺2店', id: '2' },
    { name: '德林-学府店', id: '3' },
    { name: '德林-假日店', id: '4' },
    { name: '德林-府前街店', id: '5' },
    { name: '锦客隆-西湖店', id: '6' },
    { name: '徐碧莲', id: '7' },
    { name: '王荣慧', id: '8' }
  ];
};

const getCategory4ProductPlanPrint = () => {
  return [
    {
      'pDepartment': '前场',
      'pCategory': ['弯麦小蛋糕', '弯麦西点慕斯', '弯麦小饮料']//分类名称和银豹系统一致
    },
    {
      'pDepartment': '后场',
      'pCategory': ['弯麦常温蛋糕']
    },
    {
      'pDepartment': '后场',
      'pCategory': ['弯麦现烤面包']
    },
    {
      'pDepartment': '后场',
      'pCategory': ['弯麦餐包面包']
    },
    {
      'pDepartment': '后场',
      'pCategory': ['弯麦切片面包', '弯麦吐司面包']
    }];
}

const getCategory4ProductDistributePrint = () => {
  return [
    {
      'pDepartment': '前场',
      'pCategory': ['弯麦小蛋糕', '弯麦西点慕斯', '弯麦小饮料']//分类名称和银豹系统一致
    },
    {
      'pDepartment': '后场',
      'pCategory': ['弯麦现烤面包', '弯麦常温蛋糕']
    },
    {
      'pDepartment': '后场',
      'pCategory': ['弯麦餐包面包']
    },
    {
      'pDepartment': '后场',
      'pCategory': ['弯麦切片面包', '弯麦吐司面包']
    }];
}


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
  getCategory4ProductPlanPrint,
  getCategory4ProductDistributePrint,
  getA4PrinterName,
  getA4PrinterIndex,
  getPageName4A4Printer,
  getNeedlePrinterName,
  getNeedlePrinterIndex,
  getPageName4NeedlePrinter,
  getLabelPrinterName,
  getLabelPrinterIndex
}