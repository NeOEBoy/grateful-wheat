"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[335],{

/***/ 83960:
/*!***********************************!*\
  !*** ./src/pages/Order/index.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/slicedToArray.js */ 5574);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/regeneratorRuntime.js */ 15009);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/asyncToGenerator.js */ 99289);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ 67294);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! antd */ 45360);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! antd */ 29820);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! antd */ 15867);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ant-design/pro-components */ 1524);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ant-design/pro-components */ 26359);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ant-design/pro-components */ 2236);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @ant-design/pro-components */ 184);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @ant-design/pro-components */ 98097);
/* harmony import */ var _services_demo__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/services/demo */ 18580);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! moment */ 30381);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var moment_locale_zh_cn__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! moment/locale/zh-cn */ 83839);
/* harmony import */ var moment_locale_zh_cn__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(moment_locale_zh_cn__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ 85893);







var _services$UserControl = _services_demo__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z.UserController,
  getOrders = _services$UserControl.getOrders,
  removeOrder = _services$UserControl.removeOrder;




moment__WEBPACK_IMPORTED_MODULE_5___default().locale('zh-cn');

/**
 * 删除订单
 * @param selectedRows
 */
var handleRemove = /*#__PURE__*/function () {
  var _ref = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2___default()( /*#__PURE__*/E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1___default()().mark(function _callee(selectedRows) {
    var hide, removeResult;
    return E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1___default()().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          hide = antd__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .ZP.loading('正在删除');
          if (selectedRows) {
            _context.next = 3;
            break;
          }
          return _context.abrupt("return", true);
        case 3:
          _context.prev = 3;
          _context.next = 6;
          return removeOrder({
            ids: selectedRows.map(function (row) {
              return row.id;
            })
          });
        case 6:
          removeResult = _context.sent;
          hide();
          if (removeResult.success) {
            antd__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .ZP.success('删除成功');
          }
          return _context.abrupt("return", true);
        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](3);
          hide();
          return _context.abrupt("return", false);
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 12]]);
  }));
  return function handleRemove(_x) {
    return _ref.apply(this, arguments);
  };
}();
var KTableColumnsConfig = [{
  title: '序',
  dataIndex: 'index',
  valueType: 'indexBorder',
  width: 36
}, {
  title: '图片',
  dataIndex: 'images',
  valueType: 'text',
  render: function render(_, record) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
      style: {
        width: 60,
        height: 60
      },
      alt: "",
      src: "http://gratefulwheat.ruyue.xyz/".concat(_[0])
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
  title: '图片',
  dataIndex: 'images',
  valueType: 'text',
  render: function render(_, record) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
      style: {
        width: 60,
        height: 60
      },
      alt: "",
      src: "http://gratefulwheat.ruyue.xyz/".concat(_[0])
    });
  }
}, {
  title: '订单号',
  key: 'text',
  dataIndex: '_id',
  valueType: 'text'
  // ellipsis: true,
  // copyable: true,
}, {
  title: '日期',
  key: 'createdAt',
  dataIndex: 'createdAt',
  valueType: 'dateTime'
  // ellipsis: true,
  // copyable: true,
}, {
  title: '门店',
  key: 'shop',
  dataIndex: 'shop',
  valueType: 'text'
  // ellipsis: true,
  // copyable: true,
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
}, {
  title: '备注',
  key: 'remarks',
  dataIndex: 'remarks',
  valueType: 'text'
  // ellipsis: true,
  // copyable: true,
}];

var Order = function Order() {
  /// 订单列表
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]),
    _useState2 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default()(_useState, 2),
    selectedRows = _useState2[0],
    setSelectedRows = _useState2[1];
  var tableActionRef = (0,react__WEBPACK_IMPORTED_MODULE_3__.useRef)();

  /// 当前条目设置
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false),
    _useState4 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default()(_useState3, 2),
    createOrUpdateModalOpen = _useState4[0],
    setCreateOrUpdateModalOpen = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(),
    _useState6 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default()(_useState5, 2),
    currentRow = _useState6[0],
    setCurrentRow = _useState6[1];
  var tableColumnsConfig = [].concat(KTableColumnsConfig, [{
    title: '操作',
    dataIndex: 'option',
    valueType: 'option',
    width: 80,
    render: function render(_, record) {
      return [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("a", {
        onClick: function onClick() {
          setCurrentRow(record);
          setCreateOrUpdateModalOpen(true);
        },
        children: "\u67E5\u770B"
      }, "view")];
    }
  }]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_10__/* .PageContainer */ ._z, {
    title: false,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .Z, {
      headerTitle: "",
      actionRef: tableActionRef,
      rowKey: "id",
      size: "small",
      cardBordered: true,
      search: false,
      pagination: {
        pageSize: 10
      },
      request: getOrders,
      columns: tableColumnsConfig,
      rowSelection: {
        onChange: function onChange(_, selectedRows) {
          setSelectedRows(selectedRows);
        }
      }
    }), (selectedRows === null || selectedRows === void 0 ? void 0 : selectedRows.length) > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_12__/* .FooterToolbar */ .S, {
      extra: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        children: ["\u5DF2\u9009\u62E9", ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("a", {
          style: {
            fontWeight: 600
          },
          children: selectedRows.length
        }), ' ', "\u9879"]
      }),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .ZP, {
        onClick: /*#__PURE__*/E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2___default()( /*#__PURE__*/E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1___default()().mark(function _callee2() {
          var _tableActionRef$curre, _tableActionRef$curre2;
          return E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1___default()().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return handleRemove(selectedRows);
              case 2:
                setSelectedRows([]);
                (_tableActionRef$curre = tableActionRef.current) === null || _tableActionRef$curre === void 0 || (_tableActionRef$curre2 = _tableActionRef$curre.reloadAndRest) === null || _tableActionRef$curre2 === void 0 || _tableActionRef$curre2.call(_tableActionRef$curre);
              case 4:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        })),
        children: "\u6279\u91CF\u5220\u9664"
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_14__/* .DrawerForm */ .a, {
      open: createOrUpdateModalOpen,
      onOpenChange: function onOpenChange(open) {
        setCreateOrUpdateModalOpen(open);
        !open && currentRow && setCurrentRow(undefined);
      },
      onFinish: /*#__PURE__*/function () {
        var _ref3 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2___default()( /*#__PURE__*/E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1___default()().mark(function _callee3(value) {
          return E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_regeneratorRuntime_js__WEBPACK_IMPORTED_MODULE_1___default()().wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                console.log('onFinish value = ' + value);
                setCreateOrUpdateModalOpen(false);
                currentRow && setCurrentRow(undefined);
              case 3:
              case "end":
                return _context3.stop();
            }
          }, _callee3);
        }));
        return function (_x2) {
          return _ref3.apply(this, arguments);
        };
      }(),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_15__/* .ProDescriptions */ .vY, {
        dataSource: currentRow,
        columns: KDescriptionsColumnsConfig
      })
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
  addOrder: function() { return addOrder; },
  addUser: function() { return addUser; },
  deleteUser: function() { return deleteUser; },
  getOrders: function() { return getOrders; },
  getUserDetail: function() { return getUserDetail; },
  modifyUser: function() { return modifyUser; },
  queryUserList: function() { return queryUserList; },
  removeOrder: function() { return removeOrder; }
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

/** 获取订单列表 GET /api/order */
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

/** 新建订单 POST /api/order */
function _getOrders() {
  _getOrders = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params, options) {
    return regeneratorRuntime_default()().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          return _context6.abrupt("return", (0,_umi_production_exports.request)('/api/cake/orders', objectSpread2_default()({
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
function addOrder(_x14, _x15) {
  return _addOrder.apply(this, arguments);
}

/** 删除订单 DELETE /api/order */
function _addOrder() {
  _addOrder = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee7(body, options) {
    return regeneratorRuntime_default()().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          return _context7.abrupt("return", (0,_umi_production_exports.request)('/api/cake/orders', objectSpread2_default()({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            data: body
          }, options || {})));
        case 1:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return _addOrder.apply(this, arguments);
}
function removeOrder(_x16, _x17) {
  return _removeOrder.apply(this, arguments);
}
function _removeOrder() {
  _removeOrder = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee8(body, options) {
    return regeneratorRuntime_default()().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          return _context8.abrupt("return", (0,_umi_production_exports.request)('/cake/orders', objectSpread2_default()({
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            data: body
          }, options || {})));
        case 1:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return _removeOrder.apply(this, arguments);
}
;// CONCATENATED MODULE: ./src/services/demo/index.ts
/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！


/* harmony default export */ var demo = ({
  UserController: UserController_namespaceObject
});

/***/ })

}]);