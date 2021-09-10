
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
    { index: 5, name: '005 - 弯麦(假日店)', userId: '4339546' },
    { index: 6, name: '006 - 弯麦(狮头店)', userId: '4359267' },
    { index: 7, name: '007 - 弯麦(盘陀店)', userId: '4382444' }
  ];
};

const getAllOrderShopName = () => {
  return [
    '001 - 弯麦(教育局店)',
    '002 - 弯麦(旧镇店)',
    '003 - 弯麦(江滨店)',
    '004 - 弯麦(汤泉店)',
    '005 - 弯麦(假日店)',
    '006 - 弯麦(狮头店)',
    '007 - 弯麦(盘陀店)'
  ];
};

const getOrderTemplates = () => {
  return [
    { index: 0, name: '全部模板', templateId: '', templateUid: '' },
    { index: 1, name: '现烤类', templateId: '187', templateUid: '1595310806940367327' },
    { index: 2, name: '西点类', templateId: '189', templateUid: '1595397637628133418' },
    { index: 3, name: '常温类', templateId: '183', templateUid: '1595077654714716554' },
    { index: 4, name: '吐司餐包类', templateId: '182', templateUid: '1595077405589137749' }
  ];
};

const getAllOrderTemplateName = () => {
  return [
    '现烤类',
    '西点类',
    '常温类',
    '吐司餐包类',
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
    '吐司餐包类': 4,
  };
};

// 'HP DeskJet 3630 series' 或者 'EPSON LQ-735K ESC/P2'
const getA4PrinterName = () => {
  return 'HP DeskJet 3630 series';
};

const getA4PrinterIndex = () => {
  return 0;
};

const getPageName4A4Printer = () => {
  return 'A4';
};

const getNeedlePrinterName = () => {
  return 'EPSON LQ-735K ESC/P2';
};

const getNeedlePrinterIndex = () => {
  return 1;
};

const getPageName4NeedlePrinter = () => {
  return '针打三等分';
};

export {
  getTest,
  getAllShop,
  getAllOrderShopName,
  getOrderTemplates,
  getAllOrderTemplateName,
  getProductSortIdArray,
  getTemplateSortIdArray,
  getA4PrinterName,
  getA4PrinterIndex,
  getPageName4A4Printer,
  getNeedlePrinterName,
  getNeedlePrinterIndex,
  getPageName4NeedlePrinter
}