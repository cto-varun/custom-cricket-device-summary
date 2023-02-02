"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const MainTablePopover = props => {
  const {
    popoverContent = "",
    popoverTitle = null,
    popoverTrigger = "hover",
    children = null
  } = props;
  if (children === null) {
    return null;
  }
  if (popoverContent === "") {
    return children;
  }
  return /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    content: popoverContent,
    title: popoverTitle,
    trigger: popoverTrigger
  }, children);
};
var _default = MainTablePopover;
exports.default = _default;