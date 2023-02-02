"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var AntIcons = _interopRequireWildcard(require("@ant-design/icons"));
var _jsonata = _interopRequireDefault(require("jsonata"));
require("./UnlockTemplate.css");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _fineTune = _interopRequireDefault(require("../../../../../src/utils/fineTune"));
var _jsPlugin = _interopRequireDefault(require("js-plugin"));
var _componentFeatureFlagging = require("@ivoyant/component-feature-flagging");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const UnlockTemplate = _ref => {
  let {
    id,
    params,
    datasources,
    data,
    handleClose,
    telephoneNumber,
    ...props
  } = _ref;
  const {
    Option
  } = _antd.Select;
  const {
    Text
  } = _antd.Typography;
  const [value, setValue] = (0, _react.useState)(undefined);
  function usePrevious(value) {
    const ref = (0, _react.useRef)();
    (0, _react.useEffect)(() => {
      ref.current = value;
    });
    return ref.current;
  }
  const {
    modalProps,
    workflow,
    successStates,
    errorStates,
    responseMapping,
    requestMapping,
    allowClear = false,
    selectMeta,
    fineTune,
    className,
    lockIcon,
    featureFlagDisableKeys,
    enableEvent,
    show = true
  } = params;
  const {
    composeElement
  } = new _fineTune.default(className, fineTune?.overideTypeName || '_one-step', fineTune);
  const {
    optionExpr,
    placeholder,
    selectedDataKey
  } = selectMeta;
  const datasource = datasources[params.datasource.id];
  const lineDetails = data.map(d => {
    return {
      telephoneNumber: d.subscriberDetails?.phoneNumber,
      sim: d.subscriberDetails?.deviceDetails?.currentDevice?.sim,
      imei: d.subscriberDetails?.deviceDetails?.currentDevice?.imei
    };
  });
  const [visible, setVisible] = (0, _react.useState)(true);
  const [pending, setPending] = (0, _react.useState)(false);
  const [result, setResult] = (0, _react.useState)('unset');
  const [selectedData, setSelectedData] = (0, _react.useState)(telephoneNumber);
  const [request, setRequest] = (0, _react.useState)('');
  const [alertMessage, setAlertMessage] = (0, _react.useState)(undefined);
  const prevResult = usePrevious({
    result,
    pending,
    visible
  });
  let options = [];
  if (optionExpr) {
    options = (0, _jsonata.default)(`[${optionExpr}]`).evaluate(data);
  }
  const handleStateChange = (subscriptionId, topic, eventData) => {
    if (successStates.includes(eventData.value)) {
      setAlertMessage(eventData.event.data.data.message);
      setPending(false);
      setResult(eventData.event.data.data.isError ? 'error' : 'success');
    } else if (errorStates.includes(eventData.value)) {
      setAlertMessage(eventData.event.data.message);
      setPending(false);
      setResult('error');
    }
  };
  const onEnableEvent = (subscriptionId, topic, eventData, closure) => {
    if (eventData && eventData[0]?.telephoneData?.telephoneNumber) {
      setSelectedData(eventData[0]?.telephoneData?.telephoneNumber);
    }
    setVisible(!visible);
  };

  // As of now the getForm is not required since we are using phone number in each line for unlock
  const getForm = () => {
    return /*#__PURE__*/_react.default.createElement(_antd.Input, {
      onChange: e => {
        setSelectedData(e);
      },
      disabled: true,
      size: "small",
      disable: true,
      className: "select-input",
      placeholder: placeholder,
      allowClear: allowClear,
      style: modalProps[result]?.formStyle,
      defaultValue: telephoneNumber
    })
    //     {options.map((option) => (
    //         <Option key={option} value={option}>
    //             {option}
    //         </Option>
    //     ))}
    // </Input>
    ;
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
            height: "auto",
            padding: "5px"
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
            height: "auto",
            padding: "5px"
          }
        });
        break;
      default:
    }
    return alert;
  };
  const toggleModal = () => {
    setVisible(!visible);
  };
  const onCancel = () => {
    setResult('unset');
    setVisible(!visible);
  };
  const onSubmit = () => {
    setPending(true);
    const requestData = {
      lineDetails
    };
    requestData[selectedDataKey] = selectedData;
    setRequest(requestData);
  };
  const getFooter = () => {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "ok",
      onClick: onSubmit,
      loading: pending,
      className: "ok-btn",
      style: modalProps[result]?.okButtonStyle,
      type: "primary",
      size: "small"
    }, modalProps[result]?.okButtonText), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "cancel",
      className: "cancel-btn",
      onClick: onCancel,
      disabled: pending,
      style: modalProps[result]?.cancelButtonStyle,
      size: "small"
    }, modalProps[result]?.cancelButtonText));
  };
  (0, _react.useEffect)(() => {
    if (!visible) {
      _componentMessageBus.MessageBus.unsubscribe(id);
      id === "sim-unlock" ? handleClose() : handleClose(telephoneNumber);
    }
  }, [visible, result]);
  (0, _react.useEffect)(() => {
    if (pending) {
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: id,
          workflow,
          eventType: 'INIT'
        }
      });
    }
  }, [pending]);
  (0, _react.useEffect)(() => {
    if (prevResult?.pending && !pending && result === 'unset' && prevResult?.result === 'failure') {
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.CANCEL'), {
        header: {
          registrationId: id,
          workflow,
          eventType: 'CANCEL'
        }
      });
    }
  }, [pending, result]);
  (0, _react.useEffect)(() => {
    if (pending && request) {
      _componentMessageBus.MessageBus.subscribe(id, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleStateChange);
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
        header: {
          registrationId: id,
          workflow,
          eventType: 'SUBMIT'
        },
        body: {
          datasource,
          request,
          requestMapping,
          responseMapping
        }
      });
    }
  }, [pending, request]);
  (0, _react.useEffect)(() => {
    if (enableEvent) {
      _componentMessageBus.MessageBus.subscribe(id.concat('.enable'), enableEvent, onEnableEvent);
    }
    return () => {
      if (enableEvent) {
        _componentMessageBus.MessageBus.unsubscribe(id.concat('.enable'));
      }
    };
  }, []);
  const Flex = composeElement();
  const LockIcon = AntIcons[lockIcon];
  const getFeatureData = featureKey => {
    const featureFlag = _jsPlugin.default.invoke('features.evaluate', featureKey);
    return featureFlag && featureFlag[0];
  };
  const featureFlag = show ? params.featureFlagKey && getFeatureData(params.featureFlagKey) : undefined;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item",
    style: {
      border: "none"
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, null, modalProps[result]?.info || modalProps?.default?.info)), /*#__PURE__*/_react.default.createElement("div", null, getMessage()), getFooter());
};
var _default = UnlockTemplate;
exports.default = _default;
UnlockTemplate.propTypes = {
  /** id can be either sim or imei */
  id: _propTypes.default.string,
  /**p arams passed */
  params: _propTypes.default.object,
  /** data  passed*/
  data: _propTypes.default.object,
  /** Datasource passed */
  datasources: _propTypes.default.object,
  /** Function to close the component */
  handleClosehandleDone: _propTypes.default.func,
  /** telephone number */
  telephoneNumber: _propTypes.default.string
};