"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _VerticalStepperComponent = _interopRequireDefault(require("./VerticalStepperComponent"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
require("./styles/ModalComponent.css");
var _jsonata = _interopRequireDefault(require("jsonata"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const {
  Text,
  Paragraph
} = _antd.Typography;
function ModalComponent(_ref) {
  let {
    config,
    data,
    datasources,
    profilesInfo,
    handleCloseModal = undefined,
    ...props
  } = _ref;
  const [visible, setVisible] = (0, _react.useState)(true);
  const [complete, setComplete] = (0, _react.useState)(false);
  const {
    modal,
    stepper,
    workflow
  } = config;
  const {
    width,
    height,
    title,
    header1Expr,
    header2Expr
  } = modal;
  const handleDone = () => {
    if (handleCloseModal !== undefined) {
      handleCloseModal();
    }
    setVisible(false);
    setComplete(false);
  };
  const handleCancel = () => {
    if (handleCloseModal !== undefined) {
      handleCloseModal();
    }
    setVisible(false);
    _componentMessageBus.MessageBus.unsubscribe(workflow);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.CANCEL'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'CANCEL'
      }
    });
  };
  (0, _react.useEffect)(() => {
    if (!visible) {
      _antd.Modal.destroyAll();
    }
  }, [visible]);
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    open: visible,
    onCancel: () => handleCancel(),
    title: title,
    width: width,
    height: height,
    className: "imei-modal",
    destroyOnClose: true,
    closable: false,
    footer: [/*#__PURE__*/_react.default.createElement("div", {
      className: "ModalFooter"
    }, complete ? /*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "Done",
      type: "primary",
      className: "ModalButton",
      onClick: () => handleDone()
    }, "DONE") : /*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "Cancel",
      className: "ModalButton",
      onClick: () => handleCancel()
    }, "CANCEL"))]
  }, /*#__PURE__*/_react.default.createElement(Paragraph, null, (0, _jsonata.default)(header1Expr).evaluate(data)), /*#__PURE__*/_react.default.createElement(Text, {
    disabled: true
  }, (0, _jsonata.default)(header2Expr).evaluate(data)), /*#__PURE__*/_react.default.createElement(_antd.Divider, null), /*#__PURE__*/_react.default.createElement(_VerticalStepperComponent.default, _extends({
    data: data,
    stepper: stepper,
    workflow: workflow,
    complete: setComplete,
    datasources: datasources,
    profilesInfo: profilesInfo
  }, props))));
}
var _default = ModalComponent;
exports.default = _default;