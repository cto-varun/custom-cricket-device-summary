"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _MainTablePopover = _interopRequireDefault(require("./MainTablePopover"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const AddOnTemplate = props => {
  const {
    data = {}
  } = props;
  let quantity = data.quantity;
  if (Object.keys(data).length === 0) {
    return null;
  }
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "ant-btn originalAddOn"
  }, data.soc, /*#__PURE__*/_react.default.createElement("span", {
    className: "addOnQuantityContainer"
  }, quantity), /*#__PURE__*/_react.default.createElement(_MainTablePopover.default, {
    popoverContent: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", null, data.shortDescription), /*#__PURE__*/_react.default.createElement("div", null, "$", data.rate))
  }, /*#__PURE__*/_react.default.createElement(_icons.InfoCircleOutlined, null)));
};
var _default = AddOnTemplate;
exports.default = _default;