"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _ESimModal = _interopRequireDefault(require("./ESimModal"));
var _antd = require("antd");
var _propTypes = _interopRequireDefault(require("prop-types"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const ESimIndex = _ref => {
  let {
    setSimType,
    telephoneData,
    eSIMStatusWorkflow,
    eSIMProvisionWorkflow,
    eSIMEmailQRWorkflow,
    datasources,
    handleCancel,
    eSIMUpdateUIWorkflow
  } = _ref;
  const [eSIMStatrtingTitle, setESIMStatrtingTitle] = (0, _react.useState)('Good news! Your device is E-Sim capable.');
  const [eSIMStatrtingDescription, setESIMStatrtingDescription] = (0, _react.useState)('Would you like to activate using an E-Sim or do you have a physical Sim?');
  return /*#__PURE__*/_react.default.createElement("article", {
    className: "ESim__container"
  }, /*#__PURE__*/_react.default.createElement("p", {
    style: {
      opacity: '0.5'
    }
  }, telephoneData?.eSimCurrentStatus ? `Your E-Sim profile was ${telephoneData?.eSimCurrentStatus}` : eSIMStatrtingTitle), /*#__PURE__*/_react.default.createElement("p", null, telephoneData?.eSimCurrentStatus ? telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase() === 'reserved' || telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase() === 'readytoinstall' || telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase() === 'downloaded' || telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase() === 'disabled' ? 'Do you want check your eSim status or do you want to switch to a Physical Sim?' : `Do you want a new eSim or do you want to switch to a Physical Sim?` : eSIMStatrtingDescription), /*#__PURE__*/_react.default.createElement(_ESimModal.default, {
    setSimType: setSimType,
    telephoneData: telephoneData,
    eSIMStatusWorkflow: eSIMStatusWorkflow,
    eSIMProvisionWorkflow: eSIMProvisionWorkflow,
    eSIMEmailQRWorkflow: eSIMEmailQRWorkflow,
    datasources: datasources,
    handleCancel: handleCancel,
    eSIMUpdateUIWorkflow: eSIMUpdateUIWorkflow
  }));
};
var _default = ESimIndex; // ESimIndex.propTypes = {
//     /** eSIM check */
//     setSimType: PropTypes.bool,
//     /** line level data  passed*/
//     telephoneData: PropTypes.object,
//     /** eSIMStatusWorkflow passed */
//     eSIMStatusWorkflow: PropTypes.object,
//     /** eSIMProvisionWorkflow passed */
//     eSIMProvisionWorkflow: PropTypes.object,
//     /** eSIMEmailQRWorkflow passed */
//     eSIMEmailQRWorkflow: PropTypes.object,
//     /** datasources passed*/
//     datasources: PropTypes.object,
//     /** Function to cancel the process*/
//     handleCancel: PropTypes.func,
// };
exports.default = _default;