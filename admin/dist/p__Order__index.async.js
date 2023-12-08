"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[335],{

/***/ 83960:
/*!***********************************!*\
  !*** ./src/pages/Order/index.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/regeneratorRuntime.js */ 15009);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/asyncToGenerator.js */ 99289);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/slicedToArray.js */ 5574);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ 67294);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! antd */ 29820);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! antd */ 96074);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! antd */ 15867);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ant-design/pro-components */ 1524);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ant-design/pro-components */ 57062);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ant-design/pro-components */ 37476);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ant-design/pro-components */ 98097);
/* harmony import */ var _services_demo__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/services/demo */ 18580);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! moment */ 30381);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var moment_locale_zh_cn__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! moment/locale/zh-cn */ 83839);
/* harmony import */ var moment_locale_zh_cn__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(moment_locale_zh_cn__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ 85893);






// import QRCode from 'qrcode';
var QRCode = __webpack_require__(/*! qrcode */ 92592);

var getOrders = _services_demo__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z.UserController.getOrders;




moment__WEBPACK_IMPORTED_MODULE_5___default().locale('zh-cn');
var PrintHTML = __webpack_require__(/*! react-print-html */ 39934);
var KTableColumnsConfig = [{
  title: '序',
  dataIndex: 'index',
  valueType: 'indexBorder',
  width: 36
}, {
  title: '图片',
  dataIndex: 'images',
  valueType: 'text',
  render: function render(_) {
    var imageSource = "";
    if (_[0].indexOf('data:image') !== -1) {
      imageSource = _[0];
    } else {
      imageSource = "http://gratefulwheat.ruyue.xyz/".concat(_[0]);
    }
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
      style: {
        width: 60,
        height: 60
      },
      alt: "",
      src: imageSource
    });
  }
}, {
  title: '订单号',
  dataIndex: '_id',
  valueType: 'text'
}, {
  title: '日期',
  dataIndex: 'createdAt',
  valueType: 'dateTime'
}, {
  title: '名称',
  dataIndex: 'name',
  valueType: 'text'
}, {
  title: '奶油',
  dataIndex: 'cream',
  valueType: 'text'
}, {
  title: '大小',
  dataIndex: 'size',
  valueType: 'text'
}, {
  title: '门店',
  dataIndex: 'shop',
  valueType: 'text'
}, {
  title: '姓名',
  dataIndex: 'pickUpName',
  valueType: 'text'
}, {
  title: '电话',
  dataIndex: 'phoneNumber',
  valueType: 'text'
}];
var KDescriptionsColumnsConfig = [{
  title: '预定日期',
  key: 'createdAt',
  dataIndex: 'createdAt',
  valueType: 'dateTime'
}, {
  title: '名称',
  dataIndex: 'name',
  valueType: 'text'
}, {
  title: '描述',
  dataIndex: 'description',
  valueType: 'text'
}, {
  title: '图片',
  dataIndex: 'images',
  valueType: 'text',
  render: function render(_) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
      style: {
        width: 44,
        height: 44
      },
      alt: "",
      src: "http://gratefulwheat.ruyue.xyz/".concat(_[0])
    });
  }
}, {
  title: '奶油',
  dataIndex: 'cream',
  valueType: 'text'
}, {
  title: '大小',
  dataIndex: 'size',
  valueType: 'text'
}, {
  title: '大小附加',
  dataIndex: 'sizeExtra',
  valueType: 'text'
}, {
  title: '高度',
  dataIndex: 'height',
  valueType: 'text'
}, {
  title: '价格',
  dataIndex: 'price',
  valueType: 'text'
}, {
  title: '夹心',
  dataIndex: 'fillings',
  valueType: 'text'
}, {
  title: '蜡烛',
  dataIndex: 'candle',
  valueType: 'text'
}, {
  title: '蜡烛额外',
  dataIndex: 'candleExtra',
  valueType: 'text'
}, {
  title: '火柴盒',
  dataIndex: 'kindling',
  valueType: 'text'
}, {
  title: '帽子',
  dataIndex: 'hat',
  valueType: 'text'
}, {
  title: '餐具',
  dataIndex: 'plates',
  valueType: 'text'
}, {
  title: '取货日期',
  dataIndex: 'pickUpDay',
  valueType: 'text'
}, {
  title: '取货时间',
  dataIndex: 'pickUpTime',
  valueType: 'text'
}, {
  title: '取货方式',
  dataIndex: 'pickUpType',
  valueType: 'text'
}, {
  title: '门店',
  dataIndex: 'shop',
  valueType: 'text'
}, {
  title: '地址',
  dataIndex: 'address',
  valueType: 'text'
}, {
  title: '姓名',
  dataIndex: 'pickUpName',
  valueType: 'text'
}, {
  title: '电话',
  dataIndex: 'phoneNumber',
  valueType: 'text'
}, {
  title: '备注',
  key: 'remarks',
  dataIndex: 'remarks',
  valueType: 'text'
  // ellipsis: true,
  // copyable: true,
}];

var Order = function Order() {
  var _currentRow$images, _currentRow$images2, _currentRow$images3, _currentRow$fillings, _currentRow$fillings2, _currentRow$fillings3;
  /// 当前条目设置
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false),
    _useState2 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2___default()(_useState, 2),
    createOrUpdateModalOpen = _useState2[0],
    setCreateOrUpdateModalOpen = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(),
    _useState4 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2___default()(_useState3, 2),
    currentRow = _useState4[0],
    setCurrentRow = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)('dummy4init'),
    _useState6 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2___default()(_useState5, 2),
    image4QRCode = _useState6[0],
    setImage4QRCode = _useState6[1];
  var divRef = (0,react__WEBPACK_IMPORTED_MODULE_3__.useRef)(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);

  var tableColumnsConfig = [].concat(KTableColumnsConfig, [{
    title: '操作',
    dataIndex: 'option',
    valueType: 'option',
    width: 80,
    render: function render(_, record) {
      return [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("a", {
        onClick: function onClick() {
          setImage4QRCode('dummy4init');
          setCurrentRow(record);
          setCreateOrUpdateModalOpen(true);
        },
        children: "\u67E5\u770B"
      }, "view")];
    }
  }]);
  var _theDiv4CaptureWidth = 760;
  var theDiv4CaptureHeight = _theDiv4CaptureWidth * 148 / 210;
  var _theDiv4CaptureStyle = {
    width: _theDiv4CaptureWidth,
    height: theDiv4CaptureHeight,
    background: 'white',
    borderRadius: 8,
    border: '1px dotted #000000'
  };
  var _theLeftDivInTheDiv4CaptureStyle = {
    width: theDiv4CaptureHeight - 180,
    height: theDiv4CaptureHeight - 180 + 40,
    "float": "left",
    marginLeft: 8,
    borderRadius: 8,
    border: '2px dotted #008B8B'
  };
  var _theRightDivInTheDiv4CaptureStyle = {
    "float": "right",
    width: _theDiv4CaptureWidth - theDiv4CaptureHeight + 160
  };
  var orderingTime = moment__WEBPACK_IMPORTED_MODULE_5___default()(currentRow === null || currentRow === void 0 ? void 0 : currentRow.createdAt).format('YYYY年M月D日 HH:mm:ss');
  ;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_9__/* .PageContainer */ ._z, {
    title: false,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
      headerTitle: "\u8BA2\u5355\u5217\u8868",
      rowKey: "_id",
      size: "small",
      cardBordered: true,
      search: false,
      pagination: {
        pageSize: 10
      },
      request: getOrders,
      columns: tableColumnsConfig
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_11__/* .ModalForm */ .Y, {
      modalProps: {
        style: {
          top: 10
        },
        destroyOnClose: true
      },
      width: 1400,
      open: createOrUpdateModalOpen,
      onOpenChange: function onOpenChange(open) {
        setCreateOrUpdateModalOpen(open);
        !open && currentRow && setCurrentRow(undefined);
      },
      onFinish: /*#__PURE__*/function () {
        var _ref = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1___default()( /*#__PURE__*/E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_0___default()().mark(function _callee(value) {
          return E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_0___default()().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                console.log('onFinish value = ' + value);
                setCreateOrUpdateModalOpen(false);
                currentRow && setCurrentRow(undefined);
              case 3:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }(),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_12__/* .ProDescriptions */ .vY, {
        title: "\u8BA2\u5355\u8BE6\u60C5",
        column: 6,
        dataSource: currentRow,
        columns: KDescriptionsColumnsConfig
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
        style: {
          textAlign: 'center'
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        style: {
          opacity: 1
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          ref: divRef,
          style: _theDiv4CaptureStyle,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
            id: "qrcode",
            style: {
              textAlign: 'right',
              position: 'absolute',
              paddingRight: 18,
              paddingTop: 10,
              width: _theDiv4CaptureWidth,
              height: 150
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
              style: {
                fontSize: 12,
                fontWeight: 'bold'
              },
              children: "\u7535\u5B50\u8BA2\u8D2D\u5355\u4E8C\u7EF4\u7801"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
              style: {
                width: 135,
                height: 135
              },
              onLoad: function onLoad() {},
              onError: /*#__PURE__*/E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1___default()( /*#__PURE__*/E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_0___default()().mark(function _callee2() {
                var cakeOrderUrl, qrOpts, qrCode;
                return E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_0___default()().wrap(function _callee2$(_context2) {
                  while (1) switch (_context2.prev = _context2.next) {
                    case 0:
                      if (!(image4QRCode == 'dummy4init')) {
                        _context2.next = 7;
                        break;
                      }
                      cakeOrderUrl = "http://gratefulwheat.ruyue.xyz/cakeOrder?_id=".concat(currentRow._id);
                      qrOpts = {
                        errorCorrectionLevel: 'L',
                        type: 'image/jpeg',
                        quality: 0.8,
                        margin: 2,
                        color: {
                          dark: "#000000ff",
                          light: "#ffffffff"
                        }
                      };
                      _context2.next = 5;
                      return QRCode.toDataURL(cakeOrderUrl, qrOpts);
                    case 5:
                      qrCode = _context2.sent;
                      setImage4QRCode(qrCode);
                    case 7:
                    case "end":
                      return _context2.stop();
                  }
                }, _callee2);
              })),
              preview: false,
              src: image4QRCode
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
            style: {
              textAlign: 'left',
              position: 'absolute',
              paddingLeft: 20,
              width: _theDiv4CaptureWidth,
              fontSize: 14,
              paddingTop: 10
            },
            children: "\u8BA2\u8D2D\u65F6\u95F4\uFF1A".concat(orderingTime)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
            style: {
              fontSize: 22,
              fontWeight: 'bold',
              textAlign: 'center',
              paddingTop: 6,
              paddingBottom: 6
            },
            children: "\u86CB\u7CD5\u8BA2\u8D2D\u5355"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
              style: _theLeftDivInTheDiv4CaptureStyle,
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
                style: {
                  fontSize: 20,
                  textAlign: 'center',
                  paddingTop: 4,
                  paddingBottom: 4,
                  fontWeight: 'bold',
                  background: '#D8D8D8',
                  borderBottom: '1px dashed black'
                },
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  children: "\u300A".concat(currentRow === null || currentRow === void 0 ? void 0 : currentRow.name, "\u300B")
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
                  style: {
                    position: 'relative'
                  },
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
                    preview: false,
                    src: (currentRow === null || currentRow === void 0 || (_currentRow$images = currentRow.images) === null || _currentRow$images === void 0 ? void 0 : _currentRow$images[0].indexOf('data:image')) !== -1 ? currentRow === null || currentRow === void 0 || (_currentRow$images2 = currentRow.images) === null || _currentRow$images2 === void 0 ? void 0 : _currentRow$images2[0] : "http://gratefulwheat.ruyue.xyz/".concat(currentRow === null || currentRow === void 0 || (_currentRow$images3 = currentRow.images) === null || _currentRow$images3 === void 0 ? void 0 : _currentRow$images3[0])
                  })
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
                  style: {
                    marginTop: 16
                  },
                  preview: false,
                  src: "/\u5F2F\u9EA6logo\u957F.png"
                })]
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
              style: _theRightDivInTheDiv4CaptureStyle,
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .Z, {
                orientation: "left",
                dashed: true,
                style: {
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: 8
                },
                children: "\u5236\u4F5C"
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u5976\u6CB9\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'green'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.cream
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u5C3A\u5BF8\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'green'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.size
                }), (currentRow === null || currentRow === void 0 ? void 0 : currentRow.size) === '数字蜡烛' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'green'
                  },
                  children: " | ".concat(currentRow === null || currentRow === void 0 ? void 0 : currentRow.sizeExtra)
                }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'green'
                  },
                  children: " | ".concat(currentRow === null || currentRow === void 0 ? void 0 : currentRow.height)
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u4EF7\u683C\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.price
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14
                  },
                  children: "\u5143"
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u5939\u5FC3\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 16,
                    color: 'green'
                  },
                  children: (currentRow === null || currentRow === void 0 || (_currentRow$fillings = currentRow.fillings) === null || _currentRow$fillings === void 0 ? void 0 : _currentRow$fillings.length) !== undefined && (currentRow === null || currentRow === void 0 || (_currentRow$fillings2 = currentRow.fillings) === null || _currentRow$fillings2 === void 0 ? void 0 : _currentRow$fillings2.length) > 0 ? currentRow === null || currentRow === void 0 || (_currentRow$fillings3 = currentRow.fillings) === null || _currentRow$fillings3 === void 0 ? void 0 : _currentRow$fillings3.join('+') : '没有夹心'
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u8721\u70DB\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 16,
                    color: 'blue'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.candle
                }), (currentRow === null || currentRow === void 0 ? void 0 : currentRow.candle) === '数字蜡烛' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 16,
                    color: 'blue'
                  },
                  children: "(".concat(currentRow === null || currentRow === void 0 ? void 0 : currentRow.candleExtra, ")")
                }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {}), (currentRow === null || currentRow === void 0 ? void 0 : currentRow.kindling) === '火柴盒' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 16,
                    color: 'blue'
                  },
                  children: "+\u706B\u67F4\u76D2"
                }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {})]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u5E3D\u5B50\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 16,
                    color: 'blue'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.hat
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u9910\u5177\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 16,
                    color: 'blue'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.plates
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 16,
                    color: 'blue'
                  },
                  children: "\u5957"
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .Z, {
                orientation: "left",
                style: {
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: 8
                },
                children: "\u53D6\u8D27"
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u65F6\u95F4\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'red'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.pickUpDay
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'red'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.pickUpTime
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u65B9\u5F0F\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.pickUpType
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u95E8\u5E97\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.shop
                })]
              }), (currentRow === null || currentRow === void 0 ? void 0 : currentRow.pickUpType) === '商家配送' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u5730\u5740\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'red'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.address
                })]
              }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u59D3\u540D\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'red'
                  },
                  children: "".concat(currentRow === null || currentRow === void 0 ? void 0 : currentRow.pickUpName, "\uFF08").concat(currentRow === null || currentRow === void 0 ? void 0 : currentRow.phoneNumber, "\uFF09")
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .Z, {
                orientation: "left",
                style: {
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: 8
                },
                children: "\u5176\u5B83"
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
                style: {
                  marginTop: 4,
                  marginBottom: 4,
                  marginRight: 8
                },
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  children: "\u5907\u6CE8\uFF1A"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
                  style: {
                    fontSize: 18,
                    color: 'red',
                    wordWrap: 'break-word'
                  },
                  children: currentRow === null || currentRow === void 0 ? void 0 : currentRow.remarks
                })]
              })]
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
          style: {
            marginTop: 20
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_14__/* ["default"] */ .ZP, {
            danger: true,
            type: "primary",
            style: {
              width: 160,
              height: 80
            },
            onClick: function onClick() {
              PrintHTML(divRef.current);
            },
            children: "\u6253\u5370"
          })
        })]
      })]
    })]
  });
};
/* harmony default export */ __webpack_exports__["default"] = (Order);

/***/ }),

/***/ 18580:
/*!************************************************!*\
  !*** ./src/services/demo/index.ts + 1 modules ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Z: function() { return /* binding */ demo; }
});

// NAMESPACE OBJECT: ./src/services/demo/UserController.ts
var UserController_namespaceObject = {};
__webpack_require__.r(UserController_namespaceObject);
__webpack_require__.d(UserController_namespaceObject, {
  addUser: function() { return addUser; },
  deleteUser: function() { return deleteUser; },
  getOrders: function() { return getOrders; },
  getUserDetail: function() { return getUserDetail; },
  modifyUser: function() { return modifyUser; },
  queryUserList: function() { return queryUserList; }
});

// EXTERNAL MODULE: ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/regeneratorRuntime.js
var regeneratorRuntime = __webpack_require__(15009);
var regeneratorRuntime_default = /*#__PURE__*/__webpack_require__.n(regeneratorRuntime);
// EXTERNAL MODULE: ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/objectSpread2.js
var objectSpread2 = __webpack_require__(97857);
var objectSpread2_default = /*#__PURE__*/__webpack_require__.n(objectSpread2);
// EXTERNAL MODULE: ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/asyncToGenerator.js
var asyncToGenerator = __webpack_require__(99289);
var asyncToGenerator_default = /*#__PURE__*/__webpack_require__.n(asyncToGenerator);
// EXTERNAL MODULE: ./src/.umi-production/exports.ts + 35 modules
var _umi_production_exports = __webpack_require__(80854);
;// CONCATENATED MODULE: ./src/services/demo/UserController.ts



/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！


/** 此处后端没有提供注释 GET /api/v1/queryUserList */
function queryUserList(_x, _x2) {
  return _queryUserList.apply(this, arguments);
}

/** 此处后端没有提供注释 POST /api/v1/user */
function _queryUserList() {
  _queryUserList = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee(params, options) {
    return regeneratorRuntime_default()().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", (0,_umi_production_exports.request)('/api/v1/queryUserList', objectSpread2_default()({
            method: 'GET',
            params: objectSpread2_default()({}, params)
          }, options || {})));
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _queryUserList.apply(this, arguments);
}
function addUser(_x3, _x4) {
  return _addUser.apply(this, arguments);
}

/** 此处后端没有提供注释 GET /api/v1/user/${param0} */
function _addUser() {
  _addUser = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee2(body, options) {
    return regeneratorRuntime_default()().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          return _context2.abrupt("return", (0,_umi_production_exports.request)('/api/v1/user', objectSpread2_default()({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            data: body
          }, options || {})));
        case 1:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _addUser.apply(this, arguments);
}
function getUserDetail(_x5, _x6) {
  return _getUserDetail.apply(this, arguments);
}

/** 此处后端没有提供注释 PUT /api/v1/user/${param0} */
function _getUserDetail() {
  _getUserDetail = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee3(params, options) {
    var param0;
    return regeneratorRuntime_default()().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          param0 = params.userId;
          return _context3.abrupt("return", (0,_umi_production_exports.request)("/api/v1/user/".concat(param0), objectSpread2_default()({
            method: 'GET',
            params: objectSpread2_default()({}, params)
          }, options || {})));
        case 2:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _getUserDetail.apply(this, arguments);
}
function modifyUser(_x7, _x8, _x9) {
  return _modifyUser.apply(this, arguments);
}

/** 此处后端没有提供注释 DELETE /api/v1/user/${param0} */
function _modifyUser() {
  _modifyUser = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee4(params, body, options) {
    var param0;
    return regeneratorRuntime_default()().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          param0 = params.userId;
          return _context4.abrupt("return", (0,_umi_production_exports.request)("/api/v1/user/".concat(param0), objectSpread2_default()({
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            params: objectSpread2_default()({}, params),
            data: body
          }, options || {})));
        case 2:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _modifyUser.apply(this, arguments);
}
function deleteUser(_x10, _x11) {
  return _deleteUser.apply(this, arguments);
}

/** 获取订单列表 GET /apis/order */
function _deleteUser() {
  _deleteUser = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee5(params, options) {
    var param0;
    return regeneratorRuntime_default()().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          param0 = params.userId;
          return _context5.abrupt("return", (0,_umi_production_exports.request)("/api/v1/user/".concat(param0), objectSpread2_default()({
            method: 'DELETE',
            params: objectSpread2_default()({}, params)
          }, options || {})));
        case 2:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return _deleteUser.apply(this, arguments);
}
function getOrders(_x12, _x13) {
  return _getOrders.apply(this, arguments);
}
function _getOrders() {
  _getOrders = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params, options) {
    return regeneratorRuntime_default()().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          return _context6.abrupt("return", (0,_umi_production_exports.request)('/apis/cake/orders', objectSpread2_default()({
            method: 'GET',
            params: objectSpread2_default()({}, params)
          }, options || {})));
        case 1:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _getOrders.apply(this, arguments);
}
;// CONCATENATED MODULE: ./src/services/demo/index.ts
/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！


/* harmony default export */ var demo = ({
  UserController: UserController_namespaceObject
});

/***/ })

}]);