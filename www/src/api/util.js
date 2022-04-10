
const getTest = () => {
  return false;
};

const getAllShop = () => {
  return [
    { index: 0, name: '全部门店', userId: '' },
    { index: 1, name: '001 - 弯麦(教育局店)', userId: '3995767' },
    { index: 2, name: '002 - 弯麦(旧镇店)', userId: '3995771' },
    { index: 3, name: '003 - 弯麦(江滨店)', userId: '4061089' },
    { index: 4, name: '004 - 弯麦(汤泉店)', userId: '4061092' },
    { index: 5, name: '005 - 弯麦(盘陀店)', userId: '4339546' },
    { index: 6, name: '006 - 弯麦(狮头店)', userId: '4359267' },
    { index: 7, name: '007 - 弯麦(漳浦立人)', userId: '4382444' }
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
    { index: 6, name: '007 - 弯麦(漳浦立人)', userId: '4382444' }
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
    '007 - 弯麦(漳浦立人)'
  ];
};

const getOrderTemplates = () => {
  return [
    { index: 0, name: '全部模板', templateId: '', templateUid: '' },
    { index: 1, name: '现烤类', templateId: '187', templateUid: '1595310806940367327' },
    { index: 2, name: '西点类', templateId: '189', templateUid: '1595397637628133418' },
    { index: 3, name: '常温类', templateId: '183', templateUid: '1595077654714716554' },
    { index: 4, name: '餐包类', templateId: '182', templateUid: '1595077405589137749' },
    { index: 5, name: '吐司类', templateId: '2873', templateUid: '1649149816769757925' }
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
    '187-2006261548488': 4, //鸡排三明治
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
  return ['常温类', '餐包类', '吐司类'];
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

// 'HP DeskJet 3630 series' 或者 'EPSON LQ-735K ESC/P2'
const KA4PrinterName = 'HP DeskJet 3630 series';
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

export {
  getTest,
  getAllShop,
  getAllShopExceptAll,
  getAllCategorysExceptAll,
  getAllOrderShopName,
  getOrderTemplates,
  getOrderTimeType,
  getAllOrderTemplateName,
  getFlowType,
  getProductSortIdArray,
  getTemplateSortIdArray,
  getJustPrintWorkshopTemplates,
  getA4PrinterName,
  getA4PrinterIndex,
  getPageName4A4Printer,
  getNeedlePrinterName,
  getNeedlePrinterIndex,
  getPageName4NeedlePrinter
}