"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const StepComponent = props => {
  const {
    eSIMEmailQRWorkflow,
    eSimData,
    datasources,
    emailResponseLoading,
    setEmailResponseLoading,
    resetEmailResponse,
    setResetEmailResponse
  } = props;
  const [emaiQRResponse, setEmaiQRResponse] = (0, _react.useState)(null);
  const [emaiQRErrResponse, setEmaiQRErrResponse] = (0, _react.useState)(null);
  // const [emailResponseLoading, setEmailResponseLoading] = useState(false);

  const profileTitle = eSimData && eSimData?.recommendation[0]?.header;
  const profileDescription = eSimData && eSimData?.recommendation[0]?.description;
  const profileRecommendedTitle = eSimData?.recommendation[0]?.additionalInfo && 'Recommended Actions (Optional)';
  const profileRecommendedDescription = eSimData && eSimData?.recommendation[0]?.additionalInfo;
  const {
    workflow: emailQRWorkflow,
    datasource: emailQRDatasource,
    responseMapping: emailQRResponseMapping,
    successStates: emailQRSuccessStates,
    errorStates: emailQRErrorStates
  } = eSIMEmailQRWorkflow;
  const onFinish = values => {
    let {
      ctn,
      iccid
    } = eSimData;
    sendQRCode(values, ctn, iccid);
  };
  const sendQRCode = (values, ctn, iccid) => {
    setEmailResponseLoading(true);
    const registrationId = emailQRWorkflow?.concat('.').concat(ctn);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(emailQRWorkflow).concat('.STATE.CHANGE'), handleEmailQRResponse(emailQRSuccessStates, emailQRErrorStates));
    _componentMessageBus.MessageBus.send('WF.'.concat(emailQRWorkflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: emailQRWorkflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(emailQRWorkflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: emailQRWorkflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[emailQRDatasource],
        request: {
          body: {
            toEmail: values?.qremail,
            iccid: iccid,
            ctn: ctn
          }
        },
        emailQRResponseMapping
      }
    });
  };
  const handleEmailQRResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const status = eventData?.value;
    const isSuccess = successStates?.includes(status);
    const isFailure = errorStates?.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        let tempResponse = eventData?.event?.data?.data;
        setEmaiQRResponse(tempResponse);
        setEmaiQRErrResponse(null);
      }
      if (isFailure) {
        // setEmaiQRErrResponse(
        //     eventData?.event?.data?.response?.data?.error?.causedBy[0]
        // );
        setEmaiQRErrResponse(eventData?.event?.data?.response?.data?.error);
      }
      setResetEmailResponse(false);
      setEmailResponseLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const onFinishFailed = errorInfo => {
    //console.log('Failed:', errorInfo);
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "ESim__content"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mg-b-24"
  }, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h4", null, profileTitle, " \xA0", /*#__PURE__*/_react.default.createElement("span", {
    style: {
      opacity: '0.4'
    }
  }, "Customer must have access to WIFI \xA0", /*#__PURE__*/_react.default.createElement(_icons.WifiOutlined, null)))), /*#__PURE__*/_react.default.createElement("p", null, profileDescription)), /*#__PURE__*/_react.default.createElement("div", {
    className: "mg-b-24"
  }, /*#__PURE__*/_react.default.createElement("h4", null, props?.showRecommendation && /*#__PURE__*/_react.default.createElement("span", null, profileRecommendedTitle, " \xA0")), props?.showRecommendation && /*#__PURE__*/_react.default.createElement("p", null, profileRecommendedDescription)), eSimData?.profileState?.replace(/ /g, '')?.toLowerCase() === 'downloaded' && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: "eSIM Download Status: Download in Progress",
    type: "info",
    showIcon: true
  }), /*#__PURE__*/_react.default.createElement("p", {
    style: {
      opacity: '0.7',
      fontSize: '12px',
      margin: '16px 0 0'
    }
  }, ' ', "If customer is unable to download the eSIM, cancel and restart the eSIM creation process.")), props?.showInput && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex mg-b-16"
  }, /*#__PURE__*/_react.default.createElement(_antd.Form, {
    name: "emailQRcode",
    layout: "inline",
    initialValues: {
      remember: true
    },
    onFinish: onFinish,
    onFinishFailed: onFinishFailed,
    autoComplete: "off"
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    name: "qremail",
    rules: [{
      required: true,
      message: 'Please input your email id!'
    }]
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Enter your email ID",
    type: "email"
  })), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    htmlType: "submit",
    loading: emailResponseLoading
  }, "Email QR Code")))), resetEmailResponse ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null) : emaiQRResponse && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: emaiQRResponse?.responseDescription,
    type: "success",
    showIcon: true
  }), resetEmailResponse ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null) : emaiQRErrResponse && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: emaiQRErrResponse?.message,
    type: "error",
    showIcon: true
  })));
};
var _default = StepComponent;
exports.default = _default;