"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[368],{

/***/ 51325:
/*!********************************!*\
  !*** ./src/pages/WS/index.tsx ***!
  \********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/slicedToArray.js */ 5574);
/* harmony import */ var E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_pro_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/pro-components */ 1524);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 67294);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ 85893);





var WS = function WS() {
  // 创建 WebSocket 实例
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(),
    _useState2 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default()(_useState, 2),
    socket = _useState2[0],
    setSocket = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(''),
    _useState4 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default()(_useState3, 2),
    message = _useState4[0],
    setMessage = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false),
    _useState6 = E_soucecode_grateful_wheat_admin_node_modules_umijs_babel_preset_umi_node_modules_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default()(_useState5, 2),
    isConnected = _useState6[0],
    setIsConnected = _useState6[1];

  // 建立 WebSocket 连接
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(function () {
    var newSocket = new WebSocket('ws://localhost:9001/ws4Order');
    newSocket.onopen = function () {
      setIsConnected(true);
      setSocket(newSocket);
    };
    newSocket.onmessage = function (event) {
      setMessage(event.data);
    };
    newSocket.onclose = function () {
      setIsConnected(false);
      setSocket(undefined);
    };
    return function () {
      newSocket.close();
    };
  }, []);

  // 发送消息
  var sendMessage = function sendMessage(e) {
    if (socket && socket.readyState === 1) {
      socket.send(message);
      setMessage('');
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_ant_design_pro_components__WEBPACK_IMPORTED_MODULE_3__/* .PageContainer */ ._z, {
    header: {
      title: 'WS 示例'
    },
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
      children: isConnected ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          value: message,
          onChange: function onChange(e) {
            return setMessage(e.target.value);
          }
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          onClick: sendMessage,
          children: "\u53D1\u9001"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
          children: message
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
        children: "\u8FDE\u63A5\u4E2D..."
      })
    })
  });
};
/* harmony default export */ __webpack_exports__["default"] = (WS);

/***/ })

}]);