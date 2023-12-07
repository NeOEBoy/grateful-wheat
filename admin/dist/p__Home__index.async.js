"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[371],{

/***/ 17153:
/*!**********************************************!*\
  !*** ./src/pages/Home/index.tsx + 5 modules ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ Home; }
});

// EXTERNAL MODULE: ./node_modules/antd/es/layout/index.js + 4 modules
var layout = __webpack_require__(21612);
// EXTERNAL MODULE: ./node_modules/antd/es/row/index.js
var row = __webpack_require__(71230);
// EXTERNAL MODULE: ./node_modules/antd/es/typography/index.js + 15 modules
var typography = __webpack_require__(35132);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(67294);
;// CONCATENATED MODULE: ./src/components/Guide/Guide.less?modules
// extracted by mini-css-extract-plugin
/* harmony default export */ var Guidemodules = ({"title":"title___xIGPY"});
// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(85893);
;// CONCATENATED MODULE: ./src/components/Guide/Guide.tsx





// 脚手架示例组件
var Guide = function Guide(props) {
  var name = props.name;
  return /*#__PURE__*/(0,jsx_runtime.jsx)(layout/* default */.Z, {
    children: /*#__PURE__*/(0,jsx_runtime.jsx)(row/* default */.Z, {
      children: /*#__PURE__*/(0,jsx_runtime.jsxs)(typography/* default */.Z.Title, {
        level: 3,
        className: Guidemodules.title,
        children: ["\u6B22\u8FCE\u4F7F\u7528 ", /*#__PURE__*/(0,jsx_runtime.jsx)("strong", {
          children: name
        }), " \uFF01"]
      })
    })
  });
};
/* harmony default export */ var Guide_Guide = (Guide);
;// CONCATENATED MODULE: ./src/components/Guide/index.ts

/* harmony default export */ var components_Guide = (Guide_Guide);
;// CONCATENATED MODULE: ./src/utils/format.ts
// 示例方法，没有实际意义
function trim(str) {
  return str.trim();
}
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-layout/es/components/PageContainer/index.js + 7 modules
var PageContainer = __webpack_require__(1524);
// EXTERNAL MODULE: ./src/.umi-production/exports.ts + 35 modules
var _umi_production_exports = __webpack_require__(80854);
;// CONCATENATED MODULE: ./src/pages/Home/index.less?modules
// extracted by mini-css-extract-plugin
/* harmony default export */ var Homemodules = ({"container":"container___ulS8A"});
;// CONCATENATED MODULE: ./src/pages/Home/index.tsx






var HomePage = function HomePage() {
  var _useModel = (0,_umi_production_exports.useModel)('global'),
    name = _useModel.name;
  return /*#__PURE__*/(0,jsx_runtime.jsx)(PageContainer/* PageContainer */._z, {
    ghost: true,
    children: /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
      className: Homemodules.container,
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(components_Guide, {
        name: trim(name)
      })
    })
  });
};
/* harmony default export */ var Home = (HomePage);

/***/ })

}]);