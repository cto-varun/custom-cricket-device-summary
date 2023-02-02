"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _MainTablePopover = _interopRequireDefault(require("./MainTablePopover"));
var _icons = require("@ant-design/icons");
require("./PlanTemplate.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const PlanTemplate = props => {
  const {
    data: {
      currentRatePlan = []
    },
    ebbQualifiedPlans = []
  } = props;
  const isEbbPlan = val => {
    return ebbQualifiedPlans.length > 0 && ebbQualifiedPlans.find(item => item.name === val);
  };
  if (currentRatePlan.length === 0) {
    return /*#__PURE__*/_react.default.createElement("div", null, "Error: no current plan");
  }
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "ant-btn defaultPlanButton"
  }, isEbbPlan(currentRatePlan[0].soc) && /*#__PURE__*/_react.default.createElement("span", {
    key: currentRatePlan[0].soc,
    className: "device-summary-item__ebb"
  }), currentRatePlan[0].soc, ' ', /*#__PURE__*/_react.default.createElement(_MainTablePopover.default, {
    popoverContent: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", null, currentRatePlan[0].shortDescription))
  }, /*#__PURE__*/_react.default.createElement(_icons.InfoCircleOutlined, null)));
};
var _default = PlanTemplate;
exports.default = _default;