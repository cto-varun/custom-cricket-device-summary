"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
require("./UnlockTemplate.css");
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const UnlockDevice = _ref => {
  let {
    id,
    params,
    datasources,
    imei,
    android,
    data,
    handleClose,
    telephoneNumber,
    profilesInfo,
    deviceUnlockOverrideReasons,
    ...props
  } = _ref;
  const {
    Text
  } = _antd.Typography;
  const {
    modalProps,
    successStates,
    errorStates,
    allowClear = false,
    responseMapping,
    workflow,
    datasource
  } = params;
  const unlockOverrideProfile = profilesInfo?.profiles.find(_ref2 => {
    let {
      name
    } = _ref2;
    return name === window[sessionStorage.tabId].COM_IVOYANT_VARS.profile;
  })?.categories.find(_ref3 => {
    let {
      name
    } = _ref3;
    return name === 'deviceUnlockOverride';
  });
  const [visible, setVisible] = (0, _react.useState)(true);
  const [pending, setPending] = (0, _react.useState)(false);
  const [result, setResult] = (0, _react.useState)(unlockOverrideProfile ? 'override' : 'default');
  const [reasonText, setReasonText] = (0, _react.useState)('');
  const [isTenureNotMet, setIsTenureNotMet] = (0, _react.useState)(false);
  const [reason, setReason] = (0, _react.useState)('Select reason for override');
  const [tenureMessage, setTenureMessage] = (0, _react.useState)('');
  const [alertMessage, setAlertMessage] = (0, _react.useState)(undefined);
  const [disableUnlock, SetDisableUnlockButton] = (0, _react.useState)(false);
  const overrideTenure = unlockOverrideProfile;
  const handleStateChange = (subscriptionId, topic, eventData) => {
    const isSuccess = successStates.includes(eventData.value);
    const isError = errorStates.includes(eventData.value);
    if (isSuccess || isError) {
      if (isSuccess) {
        const successData = eventData.event.data.data;
        setIsTenureNotMet(successData?.tenureNotMet);
        setTenureMessage(successData?.tenureNotMet ? successData?.message : '');
        setAlertMessage(successData?.unlockCode ? `${successData?.message} Unlock code is ${successData?.unlockCode}` : successData?.message);
        setPending(false);
        setResult(successData?.tenureNotMet && unlockOverrideProfile ? 'override' : successData?.tenureNotMet ? 'error' : 'success');
        SetDisableUnlockButton(successData?.tenureNotMet && unlockOverrideProfile ? reason === 'Select reason for override' ? true : reason === 'Other' && !reasonText ? true : false : false);
      } else if (isError) {
        setAlertMessage(eventData.event.data.message);
        setPending(false);
        setResult('error');
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const getMessage = () => {
    let alert;
    switch (result) {
      case 'success':
        alert = /*#__PURE__*/_react.default.createElement(_antd.Alert, {
          message: alertMessage,
          type: "success",
          showIcon: true,
          className: "unlock-alert",
          style: {
            height: 'auto',
            padding: '5px'
          }
        });
        break;
      case 'error':
        alert = /*#__PURE__*/_react.default.createElement(_antd.Alert, {
          message: alertMessage,
          type: "error",
          showIcon: true,
          className: "unlock-alert",
          style: {
            height: 'auto',
            padding: '5px'
          }
        });
        break;
      default:
    }
    return alert;
  };
  const onCancel = () => {
    setResult('default');
    setVisible(!visible);
    setIsTenureNotMet(false);
    setReason('Select reason for override');
    setTenureMessage('');
    setReasonText('');
    setAlertMessage('');
    setPending(false);
    SetDisableUnlockButton(false);
    handleClose(telephoneNumber);
  };
  const onSubmit = () => {
    setPending(true);
    const registrationId = workflow.concat('.').concat(telephoneNumber);
    let requestBody = {
      ctn: window[sessionStorage?.tabId].NEW_CTN,
      ban: window[sessionStorage?.tabId].NEW_BAN,
      imei: imei,
      overrideTenure: overrideTenure ? true : false
    };
    if (overrideTenure) {
      requestBody.overrideReason = reason;
      if (reason === 'Other') {
        requestBody.overrideReasonDetails = reasonText;
      }
    }
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleStateChange);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          body: requestBody
        },
        responseMapping
      }
    });
  };
  const getFooter = () => {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "ok",
      onClick: onSubmit,
      loading: pending,
      className: "ok-btn",
      style: modalProps[result]?.okButtonStyle,
      type: "primary",
      size: "small",
      disabled: disableUnlock
    }, modalProps[result]?.okButtonText), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "cancel",
      className: "cancel-btn",
      onClick: onCancel,
      disabled: pending,
      style: modalProps[result]?.cancelButtonStyle,
      size: "small"
    }, modalProps[result]?.cancelButtonText));
  };
  _react.default.useEffect(() => {
    SetDisableUnlockButton(unlockOverrideProfile ? reason === 'Select reason for override' ? true : reason === 'Other' && !reasonText ? true : false : false);
  }, [unlockOverrideProfile]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item"
  }, /*#__PURE__*/_react.default.createElement("div", null, unlockOverrideProfile ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, null, tenureMessage)), /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: "Select reason for override",
    onChange: e => {
      setReason(e);
      if (e === 'Other' && reasonText === '') {
        SetDisableUnlockButton(true);
      } else {
        SetDisableUnlockButton(false);
      }
    },
    size: "small",
    className: "unlock-device-input",
    value: reason
  }, deviceUnlockOverrideReasons?.reasons?.map(value => /*#__PURE__*/_react.default.createElement(Option, {
    key: value
  }, value))), reason === 'Other' && /*#__PURE__*/_react.default.createElement(_antd.Input, {
    onChange: e => {
      setReasonText(e.target.value);
      if (e.target.value) {
        SetDisableUnlockButton(false);
      } else {
        SetDisableUnlockButton(true);
      }
    },
    className: "unlock-device-input",
    placeholder: "Input Reason for Override",
    size: "small",
    value: reasonText,
    allowClear: allowClear
  })) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, result !== 'success' && /*#__PURE__*/_react.default.createElement(Text, null, android ? modalProps?.default?.android : modalProps?.default?.apple))), /*#__PURE__*/_react.default.createElement("div", null, getMessage()), getFooter());
};
var _default = UnlockDevice;
exports.default = _default;