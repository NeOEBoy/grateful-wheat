"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[311],{

/***/ 76048:
/*!***********************************************!*\
  !*** ./src/pages/Table/index.tsx + 7 modules ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ pages_Table; }
});

// EXTERNAL MODULE: ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/slicedToArray.js
var slicedToArray = __webpack_require__(5574);
var slicedToArray_default = /*#__PURE__*/__webpack_require__.n(slicedToArray);
// EXTERNAL MODULE: ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/regeneratorRuntime.js
var regeneratorRuntime = __webpack_require__(15009);
var regeneratorRuntime_default = /*#__PURE__*/__webpack_require__.n(regeneratorRuntime);
// EXTERNAL MODULE: ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/objectSpread2.js
var objectSpread2 = __webpack_require__(97857);
var objectSpread2_default = /*#__PURE__*/__webpack_require__.n(objectSpread2);
// EXTERNAL MODULE: ./node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/asyncToGenerator.js
var asyncToGenerator = __webpack_require__(99289);
var asyncToGenerator_default = /*#__PURE__*/__webpack_require__.n(asyncToGenerator);
// EXTERNAL MODULE: ./src/services/demo/index.ts + 1 modules
var demo = __webpack_require__(18580);
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-layout/es/components/PageContainer/index.js + 7 modules
var PageContainer = __webpack_require__(1524);
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-table/es/Table.js + 70 modules
var Table = __webpack_require__(26359);
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-layout/es/components/FooterToolbar/index.js + 2 modules
var FooterToolbar = __webpack_require__(2236);
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-descriptions/es/index.js + 6 modules
var es = __webpack_require__(98097);
// EXTERNAL MODULE: ./node_modules/antd/es/message/index.js
var message = __webpack_require__(45360);
// EXTERNAL MODULE: ./node_modules/antd/es/divider/index.js + 1 modules
var divider = __webpack_require__(96074);
// EXTERNAL MODULE: ./node_modules/antd/es/button/index.js + 8 modules
var es_button = __webpack_require__(15867);
// EXTERNAL MODULE: ./node_modules/antd/es/drawer/index.js + 9 modules
var drawer = __webpack_require__(89574);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(67294);
// EXTERNAL MODULE: ./node_modules/antd/es/modal/index.js + 1 modules
var modal = __webpack_require__(5914);
// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(85893);
;// CONCATENATED MODULE: ./src/pages/Table/components/CreateForm.tsx



var CreateForm = function CreateForm(props) {
  var modalVisible = props.modalVisible,
    _onCancel = props.onCancel;
  return /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.Z, {
    destroyOnClose: true,
    title: "\u65B0\u5EFA",
    width: 420,
    open: modalVisible,
    onCancel: function onCancel() {
      return _onCancel();
    },
    footer: null,
    children: props.children
  });
};
/* harmony default export */ var components_CreateForm = (CreateForm);
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-form/es/layouts/StepsForm/index.js + 2 modules
var StepsForm = __webpack_require__(38020);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js + 1 modules
var esm_slicedToArray = __webpack_require__(97685);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/objectSpread2.js
var esm_objectSpread2 = __webpack_require__(1413);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js + 1 modules
var objectWithoutProperties = __webpack_require__(91);
// EXTERNAL MODULE: ./node_modules/rc-util/es/hooks/useMergedState.js
var useMergedState = __webpack_require__(21770);
// EXTERNAL MODULE: ./node_modules/antd/es/form/index.js + 21 modules
var es_form = __webpack_require__(65520);
// EXTERNAL MODULE: ./node_modules/antd/es/popover/index.js
var popover = __webpack_require__(55241);
// EXTERNAL MODULE: ./node_modules/omit.js/es/index.js
var omit_js_es = __webpack_require__(97435);
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-form/es/components/Field/index.js + 52 modules
var Field = __webpack_require__(56499);
;// CONCATENATED MODULE: ./node_modules/@ant-design/pro-form/es/components/Text/index.js



var _excluded = ["fieldProps", "proFieldProps"],
  _excluded2 = ["fieldProps", "proFieldProps"];







var valueType = 'text';
/**
 * 文本组件
 *
 * @param
 */
var ProFormText = function ProFormText(_ref) {
  var fieldProps = _ref.fieldProps,
    proFieldProps = _ref.proFieldProps,
    rest = (0,objectWithoutProperties/* default */.Z)(_ref, _excluded);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(Field/* default */.Z, (0,esm_objectSpread2/* default */.Z)({
    valueType: valueType,
    fieldProps: fieldProps,
    filedConfig: {
      valueType: valueType
    },
    proFieldProps: proFieldProps
  }, rest));
};
var PasssWordStrength = function PasssWordStrength(props) {
  var _useMountMergeState = (0,useMergedState/* default */.Z)(props.open || false, {
      value: props.open,
      onChange: props.onOpenChange
    }),
    _useMountMergeState2 = (0,esm_slicedToArray/* default */.Z)(_useMountMergeState, 2),
    open = _useMountMergeState2[0],
    setOpen = _useMountMergeState2[1];
  return /*#__PURE__*/(0,jsx_runtime.jsx)(es_form/* default */.Z.Item, {
    shouldUpdate: true,
    noStyle: true,
    children: function children(form) {
      var _props$statusRender;
      var value = form.getFieldValue(props.name || []);
      return /*#__PURE__*/(0,jsx_runtime.jsx)(popover/* default */.Z, (0,esm_objectSpread2/* default */.Z)((0,esm_objectSpread2/* default */.Z)({
        getPopupContainer: function getPopupContainer(node) {
          if (node && node.parentNode) {
            return node.parentNode;
          }
          return node;
        },
        onOpenChange: setOpen,
        content: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
          style: {
            padding: '4px 0'
          },
          children: [(_props$statusRender = props.statusRender) === null || _props$statusRender === void 0 ? void 0 : _props$statusRender.call(props, value), props.strengthText ? /*#__PURE__*/(0,jsx_runtime.jsx)("div", {
            style: {
              marginTop: 10
            },
            children: /*#__PURE__*/(0,jsx_runtime.jsx)("span", {
              children: props.strengthText
            })
          }) : null]
        }),
        overlayStyle: {
          width: 240
        },
        placement: "right"
      }, props.popoverProps), {}, {
        open: open,
        children: props.children
      }));
    }
  });
};
var Password = function Password(_ref2) {
  var fieldProps = _ref2.fieldProps,
    proFieldProps = _ref2.proFieldProps,
    rest = (0,objectWithoutProperties/* default */.Z)(_ref2, _excluded2);
  var _useState = (0,react.useState)(false),
    _useState2 = (0,esm_slicedToArray/* default */.Z)(_useState, 2),
    open = _useState2[0],
    setOpen = _useState2[1];
  if (fieldProps !== null && fieldProps !== void 0 && fieldProps.statusRender && rest.name) {
    return /*#__PURE__*/(0,jsx_runtime.jsx)(PasssWordStrength, {
      name: rest.name,
      statusRender: fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.statusRender,
      popoverProps: fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.popoverProps,
      strengthText: fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.strengthText,
      open: open,
      onOpenChange: setOpen,
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(Field/* default */.Z, (0,esm_objectSpread2/* default */.Z)({
        valueType: "password",
        fieldProps: (0,esm_objectSpread2/* default */.Z)((0,esm_objectSpread2/* default */.Z)({}, (0,omit_js_es/* default */.Z)(fieldProps, ['statusRender', 'popoverProps', 'strengthText'])), {}, {
          onBlur: function onBlur(e) {
            var _fieldProps$onBlur;
            fieldProps === null || fieldProps === void 0 || (_fieldProps$onBlur = fieldProps.onBlur) === null || _fieldProps$onBlur === void 0 || _fieldProps$onBlur.call(fieldProps, e);
            setOpen(false);
          },
          onClick: function onClick(e) {
            var _fieldProps$onClick;
            fieldProps === null || fieldProps === void 0 || (_fieldProps$onClick = fieldProps.onClick) === null || _fieldProps$onClick === void 0 || _fieldProps$onClick.call(fieldProps, e);
            setOpen(true);
          }
        }),
        proFieldProps: proFieldProps,
        filedConfig: {
          valueType: valueType
        }
      }, rest))
    });
  }
  return /*#__PURE__*/(0,jsx_runtime.jsx)(Field/* default */.Z, (0,esm_objectSpread2/* default */.Z)({
    valueType: "password",
    fieldProps: fieldProps,
    proFieldProps: proFieldProps,
    filedConfig: {
      valueType: valueType
    }
  }, rest));
};
var WrappedProFormText = ProFormText;
WrappedProFormText.Password = Password;

// @ts-ignore
// eslint-disable-next-line no-param-reassign
WrappedProFormText.displayName = 'ProFormComponent';
/* harmony default export */ var Text = (WrappedProFormText);
;// CONCATENATED MODULE: ./node_modules/@ant-design/pro-form/es/components/TextArea/index.js


var TextArea_excluded = ["fieldProps", "proFieldProps"];



/**
 * 文本选择组件
 *
 * @param
 */

var ProFormTextArea = function ProFormTextArea(_ref, ref) {
  var fieldProps = _ref.fieldProps,
    proFieldProps = _ref.proFieldProps,
    rest = (0,objectWithoutProperties/* default */.Z)(_ref, TextArea_excluded);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(Field/* default */.Z, (0,esm_objectSpread2/* default */.Z)({
    ref: ref,
    valueType: "textarea",
    fieldProps: fieldProps,
    proFieldProps: proFieldProps
  }, rest));
};
/* harmony default export */ var TextArea = (/*#__PURE__*/react.forwardRef(ProFormTextArea));
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-utils/es/runFunction/index.js
var runFunction = __webpack_require__(22270);
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-form/es/FieldContext.js
var FieldContext = __webpack_require__(66758);
;// CONCATENATED MODULE: ./node_modules/@ant-design/pro-form/es/components/Select/index.js


var Select_excluded = ["fieldProps", "children", "params", "proFieldProps", "mode", "valueEnum", "request", "showSearch", "options"],
  Select_excluded2 = ["fieldProps", "children", "params", "proFieldProps", "mode", "valueEnum", "request", "options"];





/**
 * 选择框
 *
 * @param
 */
var ProFormSelectComponents = function ProFormSelectComponents(_ref, ref) {
  var fieldProps = _ref.fieldProps,
    children = _ref.children,
    params = _ref.params,
    proFieldProps = _ref.proFieldProps,
    mode = _ref.mode,
    valueEnum = _ref.valueEnum,
    request = _ref.request,
    showSearch = _ref.showSearch,
    options = _ref.options,
    rest = (0,objectWithoutProperties/* default */.Z)(_ref, Select_excluded);
  var context = (0,react.useContext)(FieldContext/* default */.Z);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(Field/* default */.Z, (0,esm_objectSpread2/* default */.Z)((0,esm_objectSpread2/* default */.Z)({
    valueEnum: (0,runFunction/* runFunction */.h)(valueEnum),
    request: request,
    params: params,
    valueType: "select",
    filedConfig: {
      customLightMode: true
    },
    fieldProps: (0,esm_objectSpread2/* default */.Z)({
      options: options,
      mode: mode,
      showSearch: showSearch,
      getPopupContainer: context.getPopupContainer
    }, fieldProps),
    ref: ref,
    proFieldProps: proFieldProps
  }, rest), {}, {
    children: children
  }));
};
var SearchSelect = /*#__PURE__*/react.forwardRef(function (_ref2, ref) {
  var fieldProps = _ref2.fieldProps,
    children = _ref2.children,
    params = _ref2.params,
    proFieldProps = _ref2.proFieldProps,
    mode = _ref2.mode,
    valueEnum = _ref2.valueEnum,
    request = _ref2.request,
    options = _ref2.options,
    rest = (0,objectWithoutProperties/* default */.Z)(_ref2, Select_excluded2);
  var props = (0,esm_objectSpread2/* default */.Z)({
    options: options,
    mode: mode || 'multiple',
    labelInValue: true,
    showSearch: true,
    suffixIcon: null,
    autoClearSearchValue: true,
    optionLabelProp: 'label'
  }, fieldProps);
  var context = (0,react.useContext)(FieldContext/* default */.Z);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(Field/* default */.Z, (0,esm_objectSpread2/* default */.Z)((0,esm_objectSpread2/* default */.Z)({
    valueEnum: (0,runFunction/* runFunction */.h)(valueEnum),
    request: request,
    params: params,
    valueType: "select",
    filedConfig: {
      customLightMode: true
    },
    fieldProps: (0,esm_objectSpread2/* default */.Z)({
      getPopupContainer: context.getPopupContainer
    }, props),
    ref: ref,
    proFieldProps: proFieldProps
  }, rest), {}, {
    children: children
  }));
});
var ProFormSelect = /*#__PURE__*/react.forwardRef(ProFormSelectComponents);
var ProFormSearchSelect = SearchSelect;
var WrappedProFormSelect = ProFormSelect;
WrappedProFormSelect.SearchSelect = ProFormSearchSelect;

// @ts-ignore
// eslint-disable-next-line no-param-reassign
WrappedProFormSelect.displayName = 'ProFormComponent';
/* harmony default export */ var Select = (WrappedProFormSelect);
// EXTERNAL MODULE: ./node_modules/antd/es/radio/index.js
var es_radio = __webpack_require__(55742);
// EXTERNAL MODULE: ./node_modules/@ant-design/pro-form/es/BaseForm/createField.js + 16 modules
var createField = __webpack_require__(83607);
;// CONCATENATED MODULE: ./node_modules/@ant-design/pro-form/es/components/Radio/index.js


var Radio_excluded = ["fieldProps", "options", "radioType", "layout", "proFieldProps", "valueEnum"];






var RadioGroup = /*#__PURE__*/react.forwardRef(function (_ref, ref) {
  var fieldProps = _ref.fieldProps,
    options = _ref.options,
    radioType = _ref.radioType,
    layout = _ref.layout,
    proFieldProps = _ref.proFieldProps,
    valueEnum = _ref.valueEnum,
    rest = (0,objectWithoutProperties/* default */.Z)(_ref, Radio_excluded);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(Field/* default */.Z, (0,esm_objectSpread2/* default */.Z)((0,esm_objectSpread2/* default */.Z)({
    valueType: radioType === 'button' ? 'radioButton' : 'radio',
    ref: ref,
    valueEnum: (0,runFunction/* runFunction */.h)(valueEnum, undefined)
  }, rest), {}, {
    fieldProps: (0,esm_objectSpread2/* default */.Z)({
      options: options,
      layout: layout
    }, fieldProps),
    proFieldProps: proFieldProps,
    filedConfig: {
      customLightMode: true
    }
  }));
});

/**
 * Radio
 *
 * @param
 */
var ProFormRadioComponents = /*#__PURE__*/react.forwardRef(function (_ref2, ref) {
  var fieldProps = _ref2.fieldProps,
    children = _ref2.children;
  return /*#__PURE__*/(0,jsx_runtime.jsx)(es_radio/* default */.ZP, (0,esm_objectSpread2/* default */.Z)((0,esm_objectSpread2/* default */.Z)({}, fieldProps), {}, {
    ref: ref,
    children: children
  }));
});
var ProFormRadio = (0,createField/* createField */.G)(ProFormRadioComponents, {
  valuePropName: 'checked',
  ignoreWidth: true
});
var WrappedProFormRadio = ProFormRadio;
WrappedProFormRadio.Group = RadioGroup;
WrappedProFormRadio.Button = es_radio/* default.Button */.ZP.Button;

// @ts-ignore
// eslint-disable-next-line no-param-reassign
WrappedProFormRadio.displayName = 'ProFormComponent';
/* harmony default export */ var Radio = (WrappedProFormRadio);
;// CONCATENATED MODULE: ./node_modules/@ant-design/pro-form/es/components/DateTimePicker/index.js


var DateTimePicker_excluded = ["fieldProps", "proFieldProps"];




var DateTimePicker_valueType = 'dateTime';

/**
 * 时间日期选择组件
 *
 * @param
 */
var ProFormDateTimePicker = /*#__PURE__*/react.forwardRef(function (_ref, ref) {
  var fieldProps = _ref.fieldProps,
    proFieldProps = _ref.proFieldProps,
    rest = (0,objectWithoutProperties/* default */.Z)(_ref, DateTimePicker_excluded);
  var context = (0,react.useContext)(FieldContext/* default */.Z);
  return /*#__PURE__*/(0,jsx_runtime.jsx)(Field/* default */.Z, (0,esm_objectSpread2/* default */.Z)({
    ref: ref,
    fieldProps: (0,esm_objectSpread2/* default */.Z)({
      getPopupContainer: context.getPopupContainer
    }, fieldProps),
    valueType: DateTimePicker_valueType,
    proFieldProps: proFieldProps,
    filedConfig: {
      valueType: DateTimePicker_valueType,
      customLightMode: true
    }
  }, rest));
});
/* harmony default export */ var DateTimePicker = (ProFormDateTimePicker);
;// CONCATENATED MODULE: ./src/pages/Table/components/UpdateForm.tsx





var UpdateForm = function UpdateForm(props) {
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(StepsForm/* StepsForm */.L0, {
    stepsProps: {
      size: 'small'
    },
    stepsFormRender: function stepsFormRender(dom, submitter) {
      return /*#__PURE__*/(0,jsx_runtime.jsx)(modal/* default */.Z, {
        width: 640,
        bodyStyle: {
          padding: '32px 40px 48px'
        },
        destroyOnClose: true,
        title: "\u89C4\u5219\u914D\u7F6E",
        open: props.updateModalVisible,
        footer: submitter,
        onCancel: function onCancel() {
          return props.onCancel();
        },
        children: dom
      });
    },
    onFinish: props.onSubmit,
    children: [/*#__PURE__*/(0,jsx_runtime.jsxs)(StepsForm/* StepsForm */.L0.StepForm, {
      initialValues: {
        name: props.values.name,
        nickName: props.values.nickName
      },
      title: "\u57FA\u672C\u4FE1\u606F",
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Text, {
        width: "md",
        name: "name",
        label: "\u89C4\u5219\u540D\u79F0",
        rules: [{
          required: true,
          message: '请输入规则名称！'
        }]
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(TextArea, {
        name: "desc",
        width: "md",
        label: "\u89C4\u5219\u63CF\u8FF0",
        placeholder: "\u8BF7\u8F93\u5165\u81F3\u5C11\u4E94\u4E2A\u5B57\u7B26",
        rules: [{
          required: true,
          message: '请输入至少五个字符的规则描述！',
          min: 5
        }]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(StepsForm/* StepsForm */.L0.StepForm, {
      initialValues: {
        target: '0',
        template: '0'
      },
      title: "\u914D\u7F6E\u89C4\u5219\u5C5E\u6027",
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Select, {
        width: "md",
        name: "target",
        label: "\u76D1\u63A7\u5BF9\u8C61",
        valueEnum: {
          0: '表一',
          1: '表二'
        }
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(Select, {
        width: "md",
        name: "template",
        label: "\u89C4\u5219\u6A21\u677F",
        valueEnum: {
          0: '规则模板一',
          1: '规则模板二'
        }
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(Radio.Group, {
        name: "type",
        width: "md",
        label: "\u89C4\u5219\u7C7B\u578B",
        options: [{
          value: '0',
          label: '强'
        }, {
          value: '1',
          label: '弱'
        }]
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsxs)(StepsForm/* StepsForm */.L0.StepForm, {
      initialValues: {
        type: '1',
        frequency: 'month'
      },
      title: "\u8BBE\u5B9A\u8C03\u5EA6\u5468\u671F",
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(DateTimePicker, {
        name: "time",
        label: "\u5F00\u59CB\u65F6\u95F4",
        rules: [{
          required: true,
          message: '请选择开始时间！'
        }]
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(Select, {
        name: "frequency",
        label: "\u76D1\u63A7\u5BF9\u8C61",
        width: "xs",
        valueEnum: {
          month: '月',
          week: '周'
        }
      })]
    })]
  });
};
/* harmony default export */ var components_UpdateForm = (UpdateForm);
;// CONCATENATED MODULE: ./src/pages/Table/index.tsx













var _services$UserControl = demo/* default */.Z.UserController,
  addUser = _services$UserControl.addUser,
  queryUserList = _services$UserControl.queryUserList,
  deleteUser = _services$UserControl.deleteUser,
  modifyUser = _services$UserControl.modifyUser;

/**
 * 添加节点
 * @param fields
 */
var handleAdd = /*#__PURE__*/function () {
  var _ref = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee(fields) {
    var hide;
    return regeneratorRuntime_default()().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          hide = message/* default */.ZP.loading('正在添加');
          _context.prev = 1;
          _context.next = 4;
          return addUser(objectSpread2_default()({}, fields));
        case 4:
          hide();
          message/* default */.ZP.success('添加成功');
          return _context.abrupt("return", true);
        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](1);
          hide();
          message/* default */.ZP.error('添加失败请重试！');
          return _context.abrupt("return", false);
        case 14:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 9]]);
  }));
  return function handleAdd(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * 更新节点
 * @param fields
 */
var handleUpdate = /*#__PURE__*/function () {
  var _ref2 = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee2(fields) {
    var hide;
    return regeneratorRuntime_default()().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          hide = message/* default */.ZP.loading('正在配置');
          _context2.prev = 1;
          _context2.next = 4;
          return modifyUser({
            userId: fields.id || ''
          }, {
            name: fields.name || '',
            nickName: fields.nickName || '',
            email: fields.email || ''
          });
        case 4:
          hide();
          message/* default */.ZP.success('配置成功');
          return _context2.abrupt("return", true);
        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](1);
          hide();
          message/* default */.ZP.error('配置失败请重试！');
          return _context2.abrupt("return", false);
        case 14:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 9]]);
  }));
  return function handleUpdate(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 *  删除节点
 * @param selectedRows
 */
var handleRemove = /*#__PURE__*/function () {
  var _ref3 = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee3(selectedRows) {
    var hide, _selectedRows$find;
    return regeneratorRuntime_default()().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          hide = message/* default */.ZP.loading('正在删除');
          if (selectedRows) {
            _context3.next = 3;
            break;
          }
          return _context3.abrupt("return", true);
        case 3:
          _context3.prev = 3;
          _context3.next = 6;
          return deleteUser({
            userId: ((_selectedRows$find = selectedRows.find(function (row) {
              return row.id;
            })) === null || _selectedRows$find === void 0 ? void 0 : _selectedRows$find.id) || ''
          });
        case 6:
          hide();
          message/* default */.ZP.success('删除成功，即将刷新');
          return _context3.abrupt("return", true);
        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](3);
          hide();
          message/* default */.ZP.error('删除失败，请重试');
          return _context3.abrupt("return", false);
        case 16:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[3, 11]]);
  }));
  return function handleRemove(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var TableList = function TableList() {
  var _useState = (0,react.useState)(false),
    _useState2 = slicedToArray_default()(_useState, 2),
    createModalVisible = _useState2[0],
    handleModalVisible = _useState2[1];
  var _useState3 = (0,react.useState)(false),
    _useState4 = slicedToArray_default()(_useState3, 2),
    updateModalVisible = _useState4[0],
    handleUpdateModalVisible = _useState4[1];
  var _useState5 = (0,react.useState)({}),
    _useState6 = slicedToArray_default()(_useState5, 2),
    stepFormValues = _useState6[0],
    setStepFormValues = _useState6[1];
  var actionRef = (0,react.useRef)();
  var _useState7 = (0,react.useState)(),
    _useState8 = slicedToArray_default()(_useState7, 2),
    row = _useState8[0],
    setRow = _useState8[1];
  var _useState9 = (0,react.useState)([]),
    _useState10 = slicedToArray_default()(_useState9, 2),
    selectedRowsState = _useState10[0],
    setSelectedRows = _useState10[1];
  var columns = [{
    title: '名称',
    dataIndex: 'name',
    tip: '名称是唯一的 key',
    formItemProps: {
      rules: [{
        required: true,
        message: '名称为必填项'
      }]
    }
  }, {
    title: '昵称',
    dataIndex: 'nickName',
    valueType: 'text'
  }, {
    title: '性别',
    dataIndex: 'gender',
    hideInForm: true,
    valueEnum: {
      0: {
        text: '男',
        status: 'MALE'
      },
      1: {
        text: '女',
        status: 'FEMALE'
      }
    }
  }, {
    title: '操作',
    dataIndex: 'option',
    valueType: 'option',
    render: function render(_, record) {
      return /*#__PURE__*/(0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
        children: [/*#__PURE__*/(0,jsx_runtime.jsx)("a", {
          onClick: function onClick() {
            handleUpdateModalVisible(true);
            setStepFormValues(record);
          },
          children: "\u914D\u7F6E"
        }), /*#__PURE__*/(0,jsx_runtime.jsx)(divider/* default */.Z, {
          type: "vertical"
        }), /*#__PURE__*/(0,jsx_runtime.jsx)("a", {
          href: "",
          children: "\u8BA2\u9605\u8B66\u62A5"
        })]
      });
    }
  }];
  return /*#__PURE__*/(0,jsx_runtime.jsxs)(PageContainer/* PageContainer */._z, {
    header: {
      title: 'CRUD 示例'
    },
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)(Table/* default */.Z, {
      headerTitle: "\u67E5\u8BE2\u8868\u683C",
      actionRef: actionRef,
      rowKey: "id",
      search: {
        labelWidth: 120
      },
      toolBarRender: function toolBarRender() {
        return [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.ZP, {
          type: "primary",
          onClick: function onClick() {
            return handleModalVisible(true);
          },
          children: "\u65B0\u5EFA"
        }, "1")];
      },
      request: /*#__PURE__*/function () {
        var _ref4 = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee4(params, sorter, filter) {
          var _yield$queryUserList, data, success;
          return regeneratorRuntime_default()().wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return queryUserList(objectSpread2_default()(objectSpread2_default()({}, params), {}, {
                  // FIXME: remove @ts-ignore
                  // @ts-ignore
                  sorter: sorter,
                  filter: filter
                }));
              case 2:
                _yield$queryUserList = _context4.sent;
                data = _yield$queryUserList.data;
                success = _yield$queryUserList.success;
                return _context4.abrupt("return", {
                  data: (data === null || data === void 0 ? void 0 : data.list) || [],
                  success: success
                });
              case 6:
              case "end":
                return _context4.stop();
            }
          }, _callee4);
        }));
        return function (_x4, _x5, _x6) {
          return _ref4.apply(this, arguments);
        };
      }(),
      columns: columns,
      rowSelection: {
        onChange: function onChange(_, selectedRows) {
          return setSelectedRows(selectedRows);
        }
      }
    }), (selectedRowsState === null || selectedRowsState === void 0 ? void 0 : selectedRowsState.length) > 0 && /*#__PURE__*/(0,jsx_runtime.jsxs)(FooterToolbar/* FooterToolbar */.S, {
      extra: /*#__PURE__*/(0,jsx_runtime.jsxs)("div", {
        children: ["\u5DF2\u9009\u62E9", ' ', /*#__PURE__*/(0,jsx_runtime.jsx)("a", {
          style: {
            fontWeight: 600
          },
          children: selectedRowsState.length
        }), ' ', "\u9879\xA0\xA0"]
      }),
      children: [/*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.ZP, {
        onClick: /*#__PURE__*/asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee5() {
          var _actionRef$current, _actionRef$current$re;
          return regeneratorRuntime_default()().wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return handleRemove(selectedRowsState);
              case 2:
                setSelectedRows([]);
                (_actionRef$current = actionRef.current) === null || _actionRef$current === void 0 || (_actionRef$current$re = _actionRef$current.reloadAndRest) === null || _actionRef$current$re === void 0 || _actionRef$current$re.call(_actionRef$current);
              case 4:
              case "end":
                return _context5.stop();
            }
          }, _callee5);
        })),
        children: "\u6279\u91CF\u5220\u9664"
      }), /*#__PURE__*/(0,jsx_runtime.jsx)(es_button/* default */.ZP, {
        type: "primary",
        children: "\u6279\u91CF\u5BA1\u6279"
      })]
    }), /*#__PURE__*/(0,jsx_runtime.jsx)(components_CreateForm, {
      onCancel: function onCancel() {
        return handleModalVisible(false);
      },
      modalVisible: createModalVisible,
      children: /*#__PURE__*/(0,jsx_runtime.jsx)(Table/* default */.Z, {
        onSubmit: /*#__PURE__*/function () {
          var _ref6 = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee6(value) {
            var success;
            return regeneratorRuntime_default()().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  _context6.next = 2;
                  return handleAdd(value);
                case 2:
                  success = _context6.sent;
                  if (success) {
                    handleModalVisible(false);
                    if (actionRef.current) {
                      actionRef.current.reload();
                    }
                  }
                case 4:
                case "end":
                  return _context6.stop();
              }
            }, _callee6);
          }));
          return function (_x7) {
            return _ref6.apply(this, arguments);
          };
        }(),
        rowKey: "id",
        type: "form",
        columns: columns
      })
    }), stepFormValues && Object.keys(stepFormValues).length ? /*#__PURE__*/(0,jsx_runtime.jsx)(components_UpdateForm, {
      onSubmit: /*#__PURE__*/function () {
        var _ref7 = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee7(value) {
          var success;
          return regeneratorRuntime_default()().wrap(function _callee7$(_context7) {
            while (1) switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return handleUpdate(value);
              case 2:
                success = _context7.sent;
                if (success) {
                  handleUpdateModalVisible(false);
                  setStepFormValues({});
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              case 4:
              case "end":
                return _context7.stop();
            }
          }, _callee7);
        }));
        return function (_x8) {
          return _ref7.apply(this, arguments);
        };
      }(),
      onCancel: function onCancel() {
        handleUpdateModalVisible(false);
        setStepFormValues({});
      },
      updateModalVisible: updateModalVisible,
      values: stepFormValues
    }) : null, /*#__PURE__*/(0,jsx_runtime.jsx)(drawer/* default */.Z, {
      width: 600,
      open: !!row,
      onClose: function onClose() {
        setRow(undefined);
      },
      closable: false,
      children: (row === null || row === void 0 ? void 0 : row.name) && /*#__PURE__*/(0,jsx_runtime.jsx)(es/* ProDescriptions */.vY, {
        column: 2,
        title: row === null || row === void 0 ? void 0 : row.name,
        request: /*#__PURE__*/asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee8() {
          return regeneratorRuntime_default()().wrap(function _callee8$(_context8) {
            while (1) switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt("return", {
                  data: row || {}
                });
              case 1:
              case "end":
                return _context8.stop();
            }
          }, _callee8);
        })),
        params: {
          id: row === null || row === void 0 ? void 0 : row.name
        },
        columns: columns
      })
    })]
  });
};
/* harmony default export */ var pages_Table = (TableList);

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

/** 新建订单 POST /apis/order */
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
function addOrder(_x14, _x15) {
  return _addOrder.apply(this, arguments);
}

/** 删除订单 DELETE /apis/order */
function _addOrder() {
  _addOrder = asyncToGenerator_default()( /*#__PURE__*/regeneratorRuntime_default()().mark(function _callee7(body, options) {
    return regeneratorRuntime_default()().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          return _context7.abrupt("return", (0,_umi_production_exports.request)('/apis/cake/orders', objectSpread2_default()({
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
          return _context8.abrupt("return", (0,_umi_production_exports.request)('/apis/cake/orders', objectSpread2_default()({
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