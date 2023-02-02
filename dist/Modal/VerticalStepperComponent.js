"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _jsonata = _interopRequireDefault(require("jsonata"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
require("./styles/VerticalStepperComponent.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Step
} = _antd.Steps;
const {
  Paragraph,
  Text
} = _antd.Typography;
function VerticalStepperComponent(_ref) {
  let {
    stepper,
    workflow,
    otpFlow,
    data,
    datasources,
    complete,
    profilesInfo,
    ...props
  } = _ref;
  const {
    size = 'small',
    steps,
    styles,
    profileFlowName
  } = stepper;
  // let steps = otpFlow ? stepper?.optSteps : stepper?.steps;
  const statusReasonCode = data?.subscriberInfo?.statusReasonCode;
  const resourceStatusReason = data?.subscriberInfo?.deviceDetails?.currentDevice?.resourceStatusReason;
  const lostOrStolen = statusReasonCode === 'ST' || statusReasonCode === 'TO' || resourceStatusReason === 'LOST' || resourceStatusReason === 'STOLEN';
  const suspendedLostOrStolen = false;
  // data?.subscriberInfo?.status === 'S' &&
  // (statusReasonCode === 'ST' || statusReasonCode === 'TO');
  const alternateFlow = false;
  // lostOrStolen && stepper.value === 'SIM';
  const step1Details = alternateFlow ? steps[0]?.alternateFlow : steps[0];
  const step2Details = alternateFlow ? steps[1]?.alternateFlow : steps[1];
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
  const step1Error = () => {
    return error === true && currentStep === 0;
  };
  const handlechange = (inputVal, formatter, maxLength) => {
    if (!Number.isNaN(Number(inputVal))) {
      setValue(inputVal);
      setFormattedValue((0, _jsonata.default)(formatter).evaluate({
        value: inputVal
      }));
      if (inputVal.length === maxLength) {
        if (!isLuhn(inputVal)) {
          setError(true);
        } else {
          setError(false);
          setDisableValidate(!disableValidate);
        }
      }
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
            complete(true);
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
            complete(true);
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

  // Below is a temporary solution since the original component was hardcoded. This should be changed
  // to use a component mapping function like mapComponents in App.js
  return stepper.value === 'IMEI' || !otpFlow ? /*#__PURE__*/_react.default.createElement(_antd.Steps, {
    direction: "vertical",
    size: size,
    current: currentStep,
    className: "imei-stepper"
  }, /*#__PURE__*/_react.default.createElement(Step, {
    disabled: true,
    key: "1",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: styles.stepDiv
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      className: styles.stepTitle
    }, step1Details?.title), /*#__PURE__*/_react.default.createElement(Text, {
      disabled: true,
      onClick: currentStep > 0 ? () => {
        setCurrentStep(0);
      } : null
    }, "STEP 1")),
    description: /*#__PURE__*/_react.default.createElement(_antd.Row, {
      type: "flex",
      "align-items": "center"
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 24
    }, validated === false ? /*#__PURE__*/_react.default.createElement(_antd.Row, {
      justify: "start",
      gutter: [0, 4],
      className: "stepper-step-description-container"
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 9
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      type: "text",
      placeholder: step1Details?.placeholder,
      value: formattedValue,
      className: step1Error() && 'error',
      maxLength: step1Details?.maxLength[0] + Number.parseInt(step1Details?.maxLength[0] / step1Details?.maxLength[1], 10) - (step1Details?.maxLength[0] % step1Details?.maxLength[1] === 0 ? 1 : 0),
      onChange: e => handlechange((0, _jsonata.default)(step1Details?.eventValExpr).evaluate({
        value: e.target.value
      }), step1Details?.formatter, step1Details?.maxLength[0]),
      size: "small"
    })), /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      size: "small",
      disabled: disableValidate,
      loading: validatePending,
      className: "validate-btn",
      onClick: () => {
        setValidatePending(true);
      }
    }, "VALIDATE")), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 24,
      className: "text-center"
    }, error === true && currentStep === 0 ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, {
      type: "danger"
    }, errorMessage)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null), currentStep > 0 ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, {
      type: "success"
    }, formattedValue)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null)))
  }), /*#__PURE__*/_react.default.createElement(Step, {
    key: "2",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: styles.stepDiv
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      className: styles.stepTitle
    }, step2Details?.title), /*#__PURE__*/_react.default.createElement(Text, {
      disabled: true
    }, "STEP 2")),
    description:
    // eslint-disable-next-line no-nested-ternary
    currentStep === 1 ? /*#__PURE__*/_react.default.createElement("div", {
      className: "stepper-step-description-container"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Paragraph, null, (0, _jsonata.default)(step2Details?.confirmExpr).evaluate({
      value: formattedValue
    })), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      className: "confirm-btn",
      onClick: () => setSubmitPending(true)
    }, "CONFIRM"))) : currentStep > 1 ? /*#__PURE__*/_react.default.createElement(Text, {
      type: "success"
    }, " ", step2Details?.success) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null),
    disabled: true
  }), /*#__PURE__*/_react.default.createElement(Step, {
    key: "3",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: styles.stepDiv
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      className: styles.stepTitle
    }, step3Details.title), /*#__PURE__*/_react.default.createElement(Text, {
      disabled: true
    }, "STEP 3")),
    description: currentStep === 2 ? /*#__PURE__*/_react.default.createElement("div", {
      className: "stepper-step-description-container"
    }, /*#__PURE__*/_react.default.createElement(Paragraph, null, step3Details.description), /*#__PURE__*/_react.default.createElement(Text, null, "New ", step3Details.equipmentType, ":"), /*#__PURE__*/_react.default.createElement(Text, {
      type: "success",
      style: {
        paddingRight: '20px'
      }
    }, ' ', formattedValue), /*#__PURE__*/_react.default.createElement(Text, null, " Old ", step3Details.equipmentType, ":"), /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        fontWeight: '500',
        color: 'black'
      }
    }, ' ', (0, _jsonata.default)(step3Details.oldEquipmentExpr).evaluate(data))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null),
    disabled: true
  })) : /*#__PURE__*/_react.default.createElement(_antd.Steps, {
    direction: "vertical",
    size: size,
    current: currentStep,
    className: "imei-stepper"
  }, /*#__PURE__*/_react.default.createElement(Step, {
    key: "0",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: styles.stepDiv
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      className: styles.stepTitle
    }, suspendedLostOrStolen ? 'Action required' : step1Details?.title), /*#__PURE__*/_react.default.createElement(Text, {
      disabled: true
    }, "STEP 1")),
    description:
    // eslint-disable-next-line no-nested-ternary
    suspendedLostOrStolen ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, ' ', "This line is suspended for lost or stolen. To change the Sim you will need to unsuspend the line and then try again.", ' ') : currentStep === 0 ? /*#__PURE__*/_react.default.createElement("div", {
      className: "stepper-step-description-container"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Paragraph, null, (0, _jsonata.default)(step1Details?.confirmExpr).evaluate({
      value: formattedValue
    })), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      className: "confirm-btn",
      onClick: () => setGenerateOtpPending(true)
    }, step1Details?.title), profilesInfo?.profiles.find(item => item.name === window[sessionStorage.tabId].COM_IVOYANT_VARS.profile)?.categories.find(item => item.name === 'otpBypass')?.flows.includes(profileFlowName) && /*#__PURE__*/_react.default.createElement(_antd.Button, {
      className: "confirm-btn",
      onClick: () => setCurrentStep(2)
    }, "Bypass Flow"))) : /*#__PURE__*/_react.default.createElement(Text, {
      type: "success"
    }, " ", step1Details?.success),
    disabled: true
  }), /*#__PURE__*/_react.default.createElement(Step, {
    disabled: true,
    key: "1",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: styles.stepDiv
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      className: styles.stepTitle
    }, step2Details?.title), /*#__PURE__*/_react.default.createElement(Text, {
      disabled: true,
      onClick: currentStep > 0 ? () => {
        setCurrentStep(0);
      } : null
    }, "STEP 2")),
    description: currentStep >= 1 ? /*#__PURE__*/_react.default.createElement(_antd.Row, {
      type: "flex",
      "align-items": "center"
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 24
    }, currentStep === 1 ? /*#__PURE__*/_react.default.createElement(_antd.Row, {
      justify: "start",
      gutter: [0, 4],
      className: "stepper-step-description-container"
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 16
    }, step2Details?.otpFlow ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      className: "confirm-btn",
      onClick: () => setGenerateOtpPending(true)
    }, "RESEND OTP"), /*#__PURE__*/_react.default.createElement(_antd.Input, {
      type: "text",
      placeholder: step2Details?.placeholder,
      value: step2Details?.otpFlow ? otpValue : sqaValue?.answe || '',
      className: step1Error() && 'error',
      maxLength: step2Details?.maxLength[0],
      onChange: e => {
        if (step2Details?.otpFlow) {
          handleOtpChange((0, _jsonata.default)(step2Details?.eventValExpr).evaluate({
            value: e.target.value
          }), step2Details?.maxLength[0]);
        } else {
          setSqaValue({
            ...sqaValue,
            answer: e.target.value
          });
        }
      },
      size: "small"
    })) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", null, sqaValue?.question), /*#__PURE__*/_react.default.createElement(_antd.Input, {
      type: "text",
      placeholder: step2Details?.placeholder,
      value: sqaValue?.answer || '',
      className: step1Error() && 'error',
      onChange: e => handleSqaChange(e.target.value),
      size: "small"
    }))), /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      size: "small",
      disabled: disableValidateOtp,
      loading: validateOtpPending,
      className: `validate-btn ${step2Details?.otpFlow ? 'validate-otp' : 'validate-customer'}`,
      onClick: () => {
        setValidateOtpPending(true);
      }
    }, "VALIDATE")), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 16,
      className: "text-center"
    }, error === true && currentStep === 1 ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, {
      type: "danger"
    }, errorMessage)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null), currentStep > 1 ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, {
      type: "success"
    }, step2Details?.success)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null)
  }), /*#__PURE__*/_react.default.createElement(Step, {
    disabled: true,
    key: "2",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: styles.stepDiv
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      className: styles.stepTitle
    }, step3Details.title), /*#__PURE__*/_react.default.createElement(Text, {
      disabled: true,
      onClick: currentStep > 0 ? () => {
        setCurrentStep(0);
      } : null
    }, "STEP 3")),
    description: /*#__PURE__*/_react.default.createElement(_antd.Row, {
      type: "flex",
      "align-items": "center"
    }, currentStep >= 2 ? /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 24
    }, currentStep === 2 ? /*#__PURE__*/_react.default.createElement(_antd.Row, {
      justify: "start",
      gutter: [0, 4],
      className: "stepper-step-description-container"
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 9
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      type: "text",
      placeholder: step3Details.placeholder,
      value: formattedValue,
      className: step1Error() && 'error',
      maxLength: step3Details.maxLength[0] + Number.parseInt(step3Details.maxLength[0] / step3Details.maxLength[1], 10) - (step3Details.maxLength[0] % step3Details.maxLength[1] === 0 ? 1 : 0),
      onChange: e => handlechange((0, _jsonata.default)(step3Details?.eventValExpr).evaluate({
        value: e.target.value
      }), step3Details?.formatter, step3Details.maxLength[0]),
      size: "small"
    })), /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      size: "small",
      disabled: disableValidate,
      loading: validatePending,
      className: "validate-btn",
      onClick: () => {
        setValidatePending(true);
      }
    }, "VALIDATE")), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 16,
      className: "text-center"
    }, error === true && currentStep === 2 ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, {
      type: "danger"
    }, errorMessage)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null), currentStep > 2 ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Text, {
      type: "success"
    }, formattedValue)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null))
  }), /*#__PURE__*/_react.default.createElement(Step, {
    key: "3",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: styles.stepDiv
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      className: styles.stepTitle
    }, step4Details.title), /*#__PURE__*/_react.default.createElement(Text, {
      disabled: true
    }, "STEP 4")),
    description:
    // eslint-disable-next-line no-nested-ternary
    currentStep === 3 ? /*#__PURE__*/_react.default.createElement("div", {
      className: "stepper-step-description-container"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Paragraph, null, (0, _jsonata.default)(step4Details.confirmExpr).evaluate({
      value: formattedValue
    })), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      className: "confirm-btn",
      onClick: () => setSubmitPending(true)
    }, "CONFIRM"))) : currentStep > 3 ? /*#__PURE__*/_react.default.createElement(Text, {
      type: "success"
    }, " ", step4Details.success) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null),
    disabled: true
  }), /*#__PURE__*/_react.default.createElement(Step, {
    key: "4",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: styles.stepDiv
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      className: styles.stepTitle
    }, step5Details.title), /*#__PURE__*/_react.default.createElement(Text, {
      disabled: true
    }, "STEP 5")),
    description: currentStep === 4 ? /*#__PURE__*/_react.default.createElement("div", {
      className: "stepper-step-description-container"
    }, /*#__PURE__*/_react.default.createElement(Paragraph, null, step5Details.description), /*#__PURE__*/_react.default.createElement(Text, null, "New ", step5Details.equipmentType, ":"), /*#__PURE__*/_react.default.createElement(Text, {
      type: "success",
      style: {
        paddingRight: '20px'
      }
    }, ' ', formattedValue), /*#__PURE__*/_react.default.createElement(Text, null, " Old ", step5Details.equipmentType, ":"), /*#__PURE__*/_react.default.createElement(Text, {
      style: {
        fontWeight: '500',
        color: 'black'
      }
    }, ' ', (0, _jsonata.default)(step5Details.oldEquipmentExpr).evaluate(data))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null),
    disabled: true
  }));
}
var _default = VerticalStepperComponent;
exports.default = _default;