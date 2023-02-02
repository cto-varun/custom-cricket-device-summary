"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _jsonata = _interopRequireDefault(require("jsonata"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _ESimIndex = _interopRequireDefault(require("../ESim/ESimIndex"));
require("./EditTemplate.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Paragraph,
  Text
} = _antd.Typography;
const EditTemplate = _ref => {
  let {
    telephoneData,
    config,
    data,
    datasources,
    profilesInfo,
    handleCancel,
    handleDone,
    eSIMStatusWorkflow,
    eSIMProvisionWorkflow,
    fieldName,
    eSIMEmailQRWorkflow,
    eSIMUpdateUIWorkflow,
    ...props
  } = _ref;
  const {
    modal,
    stepper,
    workflow
  } = config;
  const otpFlow = false; // TODO

  const {
    size = 'small',
    steps,
    styles,
    profileFlowName
  } = stepper;
  // let steps = otpFlow ? stepper?.optSteps : stepper?.steps;
  const step1Details = steps[0];
  const step2Details = steps[1];
  const step3Details = steps[2];
  const step4Details = steps[3] ? steps[3] : null;
  const step5Details = steps[4] ? steps[4] : null;
  const [value, setValue] = (0, _react.useState)('');
  const [formattedValue, setFormattedValue] = (0, _react.useState)('');
  const [otpValue, setOtpValue] = (0, _react.useState)('');
  const [validated, setValidated] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)(false);
  const [errorMessage, setErrorMessage] = (0, _react.useState)(step1Details?.error || '');
  const [disableValidate, setDisableValidate] = (0, _react.useState)(true);
  const [disableValidateOtp, setDisableValidateOtp] = (0, _react.useState)(true);
  const [validatePending, setValidatePending] = (0, _react.useState)(false);
  const [currentStep, setCurrentStep] = (0, _react.useState)(0);
  const [submitPending, setSubmitPending] = (0, _react.useState)(false);
  const [generateOtpPending, setGenerateOtpPending] = (0, _react.useState)(false);
  const [validateOtpPending, setValidateOtpPending] = (0, _react.useState)(false);
  const [eventData, setEventData] = (0, _react.useState)(undefined);
  const [sqaValue, setSqaValue] = (0, _react.useState)({
    answer: ''
  });
  const [simType, setSimType] = (0, _react.useState)(false);
  const isLuhn = value => {
    let nCheck = 0;
    let bEven = false;
    const newValue = value.replace(/\D/g, '');
    for (let n = newValue?.length - 1; n >= 0; n--) {
      const cDigit = newValue?.charAt(n);
      let nDigit = parseInt(cDigit, 10);
      if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
      nCheck += nDigit;
      bEven = !bEven;
    }
    return nCheck % 10 === 0;
  };
  const handlechange = (inputVal, formatter, maxLength) => {
    setValue(inputVal);
    setFormattedValue((0, _jsonata.default)(formatter).evaluate({
      value: inputVal
    }));
    if (inputVal.length === maxLength) {
      if (!isLuhn(inputVal)) {
        setError(true);
        setDisableValidate(true);
      } else {
        setError(false);
        setDisableValidate(false);
      }
    } else {
      setDisableValidate(true);
    }
  };
  const handleOtpChange = (inputVal, maxLength) => {
    if (!Number.isNaN(Number(inputVal))) {
      setOtpValue(inputVal);
      if (inputVal.length === maxLength) {
        setError(false);
        setDisableValidateOtp(false);
      } else {
        setDisableValidateOtp(true);
      }
    }
  };
  const handleValidateOtpResponse = (subscriptionId, topic, eventData, closure) => {
    if (eventData) {
      setEventData(eventData);
    }
  };
  const handleSqaChange = value => {
    setSqaValue({
      ...sqaValue,
      answer: value
    });
    if (value?.length) {
      setDisableValidateOtp(false);
    } else {
      setDisableValidateOtp(true);
    }
  };
  const handleValidationResponse = (subscriptionId, topic, eventData, closure) => {
    if (eventData) {
      setEventData(eventData);
    }
  };
  const handleSubmitResponse = (subscriptionId, topic, eventData, closure) => {
    if (eventData) {
      setEventData(eventData);
    }
  };
  (0, _react.useEffect)(() => {
    if (eventData) {
      if (stepper.value === 'IMEI' || !otpFlow) {
        const {
          workflowConfig
        } = validatePending ? step1Details : step2Details;
        const {
          successStates,
          errorStates
        } = workflowConfig;
        if (validatePending) {
          if (successStates.includes(eventData.value)) {
            setValidatePending(false);
            setValidated(true);
            setCurrentStep(currentStep + 1);
          }
          if (errorStates.includes(eventData.value)) {
            setDisableValidate(!disableValidate);
            setErrorMessage(eventData.event.data.message);
            setValidatePending(false);
            setError(true);
          }
        }
        if (submitPending) {
          if (successStates.includes(eventData.value)) {
            setSubmitPending(false);
            setCurrentStep(currentStep + 1);
            //  complete(true);
          }

          if (errorStates.includes(eventData.value)) {
            setErrorMessage(eventData.event.data.message);
            setSubmitPending(false);
            setError(true);
          }
        }
      }
      if (stepper.value === 'SIM' && otpFlow) {
        let generateOtpConfig = step1Details;
        let validateOtpConfig = step2Details;
        let validateSimConfig = step3Details;
        let confirmSimConfig = step4Details;
        if (generateOtpPending) {
          if (generateOtpConfig?.workflowConfig?.successStates.includes(eventData.value)) {
            setGenerateOtpPending(false);
            if (!step2Details?.otpFlow) {
              setSqaValue(eventData.event.data.data);
            }
            if (currentStep === 0) {
              setCurrentStep(currentStep + 1);
              setEventData(undefined);
            }
          }
        }
        if (validateOtpPending) {
          if (validateOtpConfig?.workflowConfig?.successStates.includes(eventData.value)) {
            setValidateOtpPending(false);
            setValidated(true);
            setCurrentStep(currentStep + 1);
            setEventData(undefined);
          }
          if (validateOtpConfig?.workflowConfig?.errorStates.includes(eventData.value)) {
            setDisableValidate(true);
            setErrorMessage(eventData.event.data.message);
            setValidateOtpPending(false);
            setError(true);
          }
        }
        if (validatePending) {
          if (validateSimConfig?.workflowConfig?.successStates.includes(eventData.value)) {
            setValidatePending(false);
            setValidated(true);
            setCurrentStep(currentStep + 1);
            setEventData(undefined);
          }
          if (validateSimConfig?.workflowConfig?.errorStates.includes(eventData.value)) {
            setDisableValidate(!disableValidate);
            setErrorMessage(eventData.event.data.message);
            setValidatePending(false);
            setError(true);
          }
        }
        if (submitPending) {
          if (confirmSimConfig?.workflowConfig?.successStates.includes(eventData.value)) {
            setSubmitPending(false);
            setCurrentStep(currentStep + 1);
            //complete(true);
            setEventData(undefined);
          }
          if (confirmSimConfig?.workflowConfig?.errorStates.includes(eventData.value)) {
            setErrorMessage(eventData.event.data.message);
            setSubmitPending(false);
            setError(true);
          }
        }
      }
    }
  }, [eventData]);
  const sendEvent = stepDetails => {
    const {
      workflowConfig
    } = stepDetails;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(workflowConfig.event), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: workflowConfig.event
      },
      body: {
        datasource: datasources[workflowConfig.datasource],
        request: {
          value,
          otpValue,
          data,
          sqaValue
        },
        requestMapping: workflowConfig.requestMapping,
        responseMapping: workflowConfig.responseMapping
      }
    });
  };
  (0, _react.useEffect)(() => {
    if (generateOtpPending) {
      setErrorMessage('');
      setError(false);
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleValidateOtpResponse);
      sendEvent(step1Details);
    }
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('WF.'.concat(workflow));
    };
  }, [generateOtpPending]);
  (0, _react.useEffect)(() => {
    if (validateOtpPending) {
      setErrorMessage('');
      setError(false);
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleValidateOtpResponse);
      sendEvent(step2Details);
    }
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('WF.'.concat(workflow));
    };
  }, [validateOtpPending]);
  (0, _react.useEffect)(() => {
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('WF.'.concat(workflow));
    };
  }, []);
  (0, _react.useEffect)(() => {
    if (validatePending) {
      setErrorMessage('');
      setError(false);
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleValidationResponse);
      if (stepper.value === 'IMEI' || !otpFlow) {
        sendEvent(step1Details);
      } else if (stepper.value === 'SIM') {
        sendEvent(step3Details);
      }
    }
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('WF.'.concat(workflow));
    };
  }, [validatePending]);
  (0, _react.useEffect)(() => {
    if (submitPending) {
      setErrorMessage('');
      setError(false);
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleSubmitResponse);
      if (stepper.value === 'IMEI' || !otpFlow) {
        sendEvent(step2Details);
      } else if (stepper.value === 'SIM') {
        sendEvent(step4Details);
      }
    }
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('WF.'.concat(workflow));
    };
  }, [submitPending]);
  (0, _react.useEffect)(() => {
    return () => {
      _componentMessageBus.MessageBus.unsubscribe(workflow);
    };
  }, []);
  (0, _react.useEffect)(() => {
    if (telephoneData?.eSimCompatibleDevice) {
      setSimType(true);
    }
  }, [telephoneData]);
  return stepper.value === 'IMEI' || !otpFlow ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    justify: "start",
    gutter: [0, 4]
  }, simType && fieldName.edit === 'changeSIM' ? /*#__PURE__*/_react.default.createElement(_ESimIndex.default, {
    setSimType: setSimType,
    telephoneData: telephoneData,
    eSIMStatusWorkflow: eSIMStatusWorkflow,
    eSIMProvisionWorkflow: eSIMProvisionWorkflow,
    eSIMEmailQRWorkflow: eSIMEmailQRWorkflow,
    datasources: datasources,
    handleCancel: handleCancel,
    eSIMUpdateUIWorkflow: eSIMUpdateUIWorkflow
  }) : /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 9
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    className: "value-input",
    disabled: currentStep !== 0,
    type: "text",
    placeholder: step1Details?.placeholder,
    value: formattedValue,
    maxLength: step1Details?.maxLength[0] + Number.parseInt(step1Details?.maxLength[0] / step1Details?.maxLength[1], 10) - (step1Details?.maxLength[0] % step1Details?.maxLength[1] === 0 ? 1 : 0),
    suffix: validated && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
      title: "Validated"
    }, /*#__PURE__*/_react.default.createElement(_icons.CheckCircleOutlined, {
      style: {
        color: '#52C41A'
      }
    })),
    onChange: e => handlechange((0, _jsonata.default)(step1Details?.eventValExpr).evaluate({
      value: e.target.value
    }), step1Details?.formatter, step1Details?.maxLength[0]),
    onPaste: e => {
      e.target.value = e.clipboardData.getData('Text').replace(/\s+/g, '').slice(0, step1Details?.maxLength[0]);
      handlechange(e.target.value, step1Details?.formatter, step1Details?.maxLength[0]);
    },
    size: "small"
  }), /*#__PURE__*/_react.default.createElement("div", null, !validated && /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    size: "small",
    className: "validatebtn",
    style: disableValidate ? {
      backgroundColor: '#BEC8C8',
      color: '#ffff'
    } : {
      backgroundColor: '#52C41A',
      color: '#ffff'
    },
    disabled: disableValidate,
    loading: validatePending,
    onClick: () => {
      setValidatePending(true);
    }
  }, "Validate"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    size: "small",
    className: "cancel-button",
    onClick: () => {
      handleCancel(workflow);
    }
  }, "Cancel")))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24,
    className: "text-center"
  }, error === true && currentStep === 0 ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, {
    type: "danger"
  }, errorMessage)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null)))), validated && currentStep !== 2 && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, !error && /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/_react.default.createElement(Paragraph, {
    style: {
      color: '#52C41A',
      margin: '5px 10px 0px 0px'
    }
  }, (0, _jsonata.default)(step2Details?.confirmExpr).evaluate({
    value: formattedValue
  })), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "change-btn",
    size: "small",
    style: {
      backgroundColor: '#52C41A',
      color: '#ffff'
    },
    onClick: () => setSubmitPending(true),
    loading: submitPending
  }, "Change ", stepper.value), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "cancel-button",
    size: "small",
    onClick: () => {
      handleCancel(workflow);
    }
  }, "Cancel")), error && /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/_react.default.createElement(Paragraph, {
    type: "danger",
    style: {
      margin: '5px 10px 0px 0px'
    }
  }, errorMessage), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "cancel-button",
    size: "small",
    onClick: () => {
      handleCancel(workflow);
    }
  }, "Cancel"))), currentStep === 2 && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
    style: {
      color: '#52C41A',
      margin: '5px 10px 5px 0px'
    }
  }, step3Details?.description), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    size: "small",
    type: "primary",
    onClick: () => {
      handleDone();
    }
  }, "Done"))))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary"
  }, "Generate OTP"), /*#__PURE__*/_react.default.createElement(_antd.Input, {
    maxLength: 6,
    style: {
      textAlign: 'center'
    }
  })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    maxLength: 15,
    style: {
      textAlign: 'center'
    }
  })))));
};
var _default = EditTemplate;
exports.default = _default;
EditTemplate.propTypes = {
  /** config */
  config: _propTypes.default.object,
  /** data  passed*/
  data: _propTypes.default.object,
  /** Datasource passed */
  datasources: _propTypes.default.object,
  /** profilesInfo passed */
  profilesInfo: _propTypes.default.object,
  /** Function to cancel the process*/
  handleCancel: _propTypes.default.func,
  /** Function to complete the process after done */
  handleDone: _propTypes.default.func
};