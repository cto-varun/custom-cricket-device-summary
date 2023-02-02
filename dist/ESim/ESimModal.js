"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _StepComponent = _interopRequireDefault(require("./StepComponent"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _componentCache = require("@ivoyant/component-cache");
require("antd/dist/reset.css");
var _customCricketPopUp = _interopRequireDefault(require("@ivoyant/custom-cricket-pop-up"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Step
} = _antd.Steps;
const ESimModal = _ref => {
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
  const [statusStep, setStatusStep] = (0, _react.useState)(undefined);
  const [eSimData, setESimData] = (0, _react.useState)(null);
  const [isModalVisible, setIsModalVisible] = (0, _react.useState)(false);
  const [isConcernModalVisible, setIsConcernModalVisible] = (0, _react.useState)(false);
  const [isCloseModalVisible, setIsCloseModalVisible] = (0, _react.useState)(false);
  const [current, setCurrent] = (0, _react.useState)(0);
  const [provisionLoading, setProvisionLoading] = (0, _react.useState)(false);
  const [statusLoading, setStatusLoading] = (0, _react.useState)(false);
  const [eSIMErrMsg, setESIMErrMsg] = (0, _react.useState)(null);
  const [eSIMNetworkStatus, setESIMNetworkStatus] = (0, _react.useState)(null);
  const [emailResponseLoading, setEmailResponseLoading] = (0, _react.useState)(false);
  const [resetEmailResponse, setResetEmailResponse] = (0, _react.useState)(false);
  const [confirmationESimPopUp, setConfirmationESimPopUp] = (0, _react.useState)(false);
  const [contentConfirmationModal, setContentConfirmationModal] = (0, _react.useState)({
    title: 'Confirmation E-Sim',
    content: 'Are you sure you want to create an E-Sim profile for this customer. Doing so could burn their physical sim (Sim Swap) and charge the customer for a new E-Sim.',
    clickFrom: 'payment'
  });

  //Profile states
  const {
    workflow: esimStatusWorkflow,
    datasource: esimStatusDatasource,
    responseMapping: esimStatusResponseMapping,
    successStates: esimStatusSuccessStates,
    errorStates: esimStatusErrorStates
  } = eSIMStatusWorkflow;
  const {
    workflow: provisionWorkflow,
    datasource: provisionDatasource,
    responseMapping: provisionResponseMapping,
    successStates: provisionSuccessStates,
    errorStates: provisionErrorStates
  } = eSIMProvisionWorkflow;
  const {
    workflow: updateEsimUIWorkflow,
    datasource: updateEsimUIDatasource,
    responseMapping: updateEsimUIResponseMapping,
    successStates: updateEsimUISuccessStates,
    errorStates: updateEsimUIErrorStates
  } = eSIMUpdateUIWorkflow;
  const updateOnClose = ctn => {
    const registrationId = updateEsimUIWorkflow.concat('.').concat(ctn);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(updateEsimUIWorkflow).concat('.STATE.CHANGE'), handleEsimUpdateUIResponse);
    _componentMessageBus.MessageBus.send('WF.'.concat(updateEsimUIWorkflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: updateEsimUIWorkflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(updateEsimUIWorkflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: updateEsimUIWorkflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[updateEsimUIDatasource],
        request: {
          params: {
            accountId: ctn
          }
        },
        updateEsimUIResponseMapping
      }
    });
  };
  const getESIMStatus = ctn => {
    setStatusLoading(true);
    const registrationId = esimStatusWorkflow.concat('.').concat(ctn);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(esimStatusWorkflow).concat('.STATE.CHANGE'), handleESIMStatusResponse(ctn));
    _componentMessageBus.MessageBus.send('WF.'.concat(esimStatusWorkflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: esimStatusWorkflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(esimStatusWorkflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: esimStatusWorkflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[esimStatusDatasource],
        request: {
          params: {
            ctn: ctn
          }
        },
        esimStatusResponseMapping
      }
    });
  };
  const getESIMProvision = ctn => {
    setProvisionLoading(true);
    const registrationId = provisionWorkflow?.concat('.').concat(ctn);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(provisionWorkflow).concat('.STATE.CHANGE'), handleESIMProvisionResponse(ctn));
    _componentMessageBus.MessageBus.send('WF.'.concat(provisionWorkflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: provisionWorkflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(provisionWorkflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: provisionWorkflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[provisionDatasource],
        request: {
          params: {
            ctn: ctn
          }
        },
        provisionResponseMapping
      }
    });
  };
  const handleESIMStatusResponse = number => (subscriptionId, topic, eventData, closure) => {
    const status = eventData?.value;
    const isSuccess = esimStatusSuccessStates?.includes(status);
    const isFailure = esimStatusErrorStates?.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const response = JSON.parse(eventData?.event?.data?.request?.response);
        setStatusStep(eventData?.event?.data?.data?.profileState?.replace(/ /g, '')?.toLowerCase());
        setESimData(eventData?.event?.data?.data);
        setESIMNetworkStatus(eventData?.event?.data?.data?.networkProvisioningStatus?.provisioningStatusDescription || 'Not available at this moment');
        setIsModalVisible(true);
        _componentCache.cache.put('eSimCacheData', eventData?.event?.data?.data);
        setESIMErrMsg(false);
      }
      if (isFailure) {
        setESIMErrMsg(eventData?.event?.data?.response?.data?.message || eventData?.event?.data?.response?.data?.error?.causedBy[0]?.message);
      }
      setStatusLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleESIMProvisionResponse = number => (subscriptionId, topic, eventData, closure) => {
    const status = eventData?.value;
    const isSuccess = provisionSuccessStates?.includes(status);
    const isFailure = provisionErrorStates?.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const response = JSON.parse(eventData?.event?.data?.request?.response);
        setStatusStep(eventData?.event?.data?.data?.profileState?.replace(/ /g, '')?.toLowerCase());
        setESimData(eventData?.event?.data?.data);
        setESIMNetworkStatus(eventData?.event?.data?.data?.networkProvisioningStatus?.provisioningStatusDescription || 'Not available at this moment');
        setIsModalVisible(true);
        _componentCache.cache.put('eSimCacheData', eventData?.event?.data?.data);
        setESIMErrMsg(false);
      }
      if (isFailure) {
        setESIMErrMsg(eventData?.event?.data?.response?.data?.message);
      }
      setResetEmailResponse(true);
      setProvisionLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleEsimUpdateUIResponse = number => (subscriptionId, topic, eventData, closure) => {
    const status = eventData?.value;
    const isSuccess = updateEsimUISuccessStates?.includes(status);
    const isFailure = updateEsimUIErrorStates?.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {}
      if (isFailure) {}
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };

  // show steps modal or main esim modal
  const showStepsModal = () => {
    let esimProfileStep = telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase();
    if (esimProfileStep === 'deleted' || esimProfileStep === 'unusable') {
      setIsConcernModalVisible(true);
    } else if (esimProfileStep === 'reserved' || esimProfileStep === 'readytoinstall' || esimProfileStep === 'downloaded' || esimProfileStep === 'disabled') {
      getESIMStatus(telephoneData?.telephoneNumber);
    } else {
      //getESIMProvision(telephoneData?.telephoneNumber);
      setConfirmationESimPopUp(true);
    }
  };

  // cancel and restart functionality
  const handleCancelandRestart = () => {
    setIsConcernModalVisible(true);
  };

  //ok functionality of steps modal
  const handleStepsOk = () => {
    setIsModalVisible(false);
  };

  //ok functionality of concern modal
  const handleConernOk = () => {
    setIsConcernModalVisible(false);
    getESIMProvision(telephoneData?.telephoneNumber);
  };

  //cancel functionality of main esim modal with steps
  const handleStepsCancel = () => {
    let esimProfileStep = eSimData?.profileState?.replace(/ /g, '')?.toLowerCase();
    if (esimProfileStep === 'installed') {
      setIsModalVisible(false);
      setSimType(false);
      handleCancel('CHANGESIM');
      updateOnClose(telephoneData.telephoneNumber);
    } else {
      setIsCloseModalVisible(true);
    }
  };

  //ok functionality of close modal
  const handleCloseOk = () => {
    setIsCloseModalVisible(false);
    setIsModalVisible(false);
    setSimType(false);
    handleCancel('CHANGESIM');
    updateOnClose(telephoneData.telephoneNumber);
  };

  //cancel functionality of close modal(when CLOSE is pressed)
  const handleCloseCancel = () => {
    setIsCloseModalVisible(false);
  };

  //cancel functionality of concern modal
  const handleConernCancel = () => {
    setIsConcernModalVisible(false);
  };

  //enable physycal sim flow
  const showPhysicalSim = () => {
    setSimType(false);
  };
  const ESimTitle = () => {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "ESimTitle"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "d-flex"
    }, /*#__PURE__*/_react.default.createElement("h5", null, " Download eSim Profile"), /*#__PURE__*/_react.default.createElement("span", {
      className: "mg-x-16"
    }, "|"), /*#__PURE__*/_react.default.createElement("h5", null, /*#__PURE__*/_react.default.createElement("span", null, "CTN"), telephoneData?.telephoneNumber)), /*#__PURE__*/_react.default.createElement("div", {
      className: "pd-x-24"
    }, /*#__PURE__*/_react.default.createElement("h5", null, /*#__PURE__*/_react.default.createElement("span", null, "IMEI"), telephoneData?.imei)));
  };
  const ESimFooter = () => {
    let esimProfileStep = eSimData?.profileState?.replace(/ /g, '')?.toLowerCase();
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "ESimTitle"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "d-flex"
    }, /*#__PURE__*/_react.default.createElement("p", null, "Network Status:", ' ', eSIMNetworkStatus && /*#__PURE__*/_react.default.createElement("span", {
      style: {
        color: '#389E0D'
      }
    }, eSIMNetworkStatus))), /*#__PURE__*/_react.default.createElement("div", null, esimProfileStep === 'installed' ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null) : /*#__PURE__*/_react.default.createElement(_antd.Button, {
      onClick: () => handleCancelandRestart(telephoneData?.telephoneNumber),
      loading: provisionLoading,
      disabled: emailResponseLoading,
      className: "ghost-primary-btn"
    }, "CANCEL & RESTART"), esimProfileStep === 'installed' ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null) : /*#__PURE__*/_react.default.createElement(_antd.Button, {
      type: "primary",
      onClick: () => getESIMStatus(telephoneData?.telephoneNumber),
      loading: statusLoading,
      disabled: emailResponseLoading
    }, "REFRESH STATUS"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      onClick: () => handleStepsCancel()
    }, "CLOSE")));
  };
  const steps = [{
    content: (0, _StepComponent.default)({
      showInput: false,
      showRecommendation: true,
      eSIMEmailQRWorkflow,
      eSimData,
      emailResponseLoading,
      setEmailResponseLoading
    })
  }, {
    content: (0, _StepComponent.default)({
      showInput: true,
      showRecommendation: true,
      eSIMEmailQRWorkflow,
      datasources,
      eSimData,
      emailResponseLoading,
      setEmailResponseLoading,
      resetEmailResponse,
      setResetEmailResponse
    })
  }, {
    content: (0, _StepComponent.default)({
      showInput: false,
      showRecommendation: true,
      eSIMEmailQRWorkflow,
      datasources,
      eSimData,
      emailResponseLoading,
      setEmailResponseLoading
    })
  }, {
    content: (0, _StepComponent.default)({
      showInput: false,
      showRecommendation: true,
      eSIMEmailQRWorkflow,
      datasources,
      eSimData,
      emailResponseLoading,
      setEmailResponseLoading
    })
  }];

  //USEEFFECTS

  //useEffect to populate the stpes to UI
  (0, _react.useEffect)(() => {
    if (statusStep === 'deleted') {
      setStatusStep('deleted');
    } else if (statusStep === 'disabled') {
      setStatusStep('disabled');
    } else if (statusStep === 'unusable') {
      setStatusStep('unusable');
    } else if (statusStep === 'reserved' || statusStep === 'readytoinstall' || statusStep === 'installed' || statusStep === 'downloaded') {
      setStatusStep('installed');
    }
  }, [statusStep]);

  //useEffect to set the current step
  //
  (0, _react.useEffect)(() => {
    let esimProfileStep = eSimData?.profileState?.replace(/ /g, '')?.toLowerCase();
    if (esimProfileStep === 'reserved') {
      setCurrent(0);
    }
    if (esimProfileStep === 'readytoinstall') {
      setCurrent(1);
    } else if (esimProfileStep === 'downloaded') {
      setCurrent(2);
    } else if (esimProfileStep === 'installed' || esimProfileStep === 'disabled' || esimProfileStep === 'deleted' || esimProfileStep === 'unusable') {
      setCurrent(3);
    }
  }, [eSimData]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase() === 'reserved' || telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase() === 'readytoinstall' || telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase() === 'downloaded' || telephoneData?.eSimCurrentStatus?.replace(/ /g, '')?.toLowerCase() === 'disabled' ? /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: telephoneData?.enableESimAcount ? telephoneData?.enableEsim ? null : telephoneData?.eSimReasons : telephoneData?.eSimAcountReasons
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    onClick: showStepsModal,
    loading: statusLoading,
    style: {
      marginRight: '4px'
    },
    disabled: telephoneData?.enableESimAcount ? !telephoneData?.enableEsim : !telephoneData?.enableESimAcount
  }, "View eSIM Status")) : /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: telephoneData?.enableESimAcount ? telephoneData?.enableEsim ? null : telephoneData?.eSimReasons : telephoneData?.eSimAcountReasons
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    onClick: showStepsModal,
    loading: provisionLoading,
    style: {
      marginRight: '4px'
    },
    disabled: telephoneData?.enableESimAcount ? !telephoneData?.enableEsim : !telephoneData?.enableESimAcount
  }, "eSIM")), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    onClick: showPhysicalSim
  }, "Physical SIM"), /*#__PURE__*/_react.default.createElement("div", null, eSIMErrMsg && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: eSIMErrMsg,
    type: "error",
    showIcon: true,
    style: {
      border: 0,
      padding: '6px',
      marginTop: '8px'
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    title: "Are you sure you want to provision a new eSIM?",
    open: isConcernModalVisible,
    onOk: handleConernOk,
    onCancel: handleConernCancel,
    zIndex: 1002
  }, /*#__PURE__*/_react.default.createElement("p", null, "This will cancel the current request and request a new E-Sim profile, do you want to proceed?")), /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    title: "Are you sure you want to close?",
    open: isCloseModalVisible,
    onOk: handleCloseOk,
    onCancel: handleCloseCancel,
    zIndex: 1003
  }, /*#__PURE__*/_react.default.createElement("p", null, "This will cancel the current request and you will have to start from beginning, do you want to proceed?")), /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    title: ESimTitle(),
    open: isModalVisible,
    onOk: handleStepsOk,
    onCancel: handleStepsCancel,
    width: 1000,
    footer: ESimFooter(),
    className: "ESim__modal",
    zIndex: 1000
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "ESim__steps-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Steps, {
    progressDot: true,
    current: current,
    direction: "vertical"
  }, /*#__PURE__*/_react.default.createElement(Step, {
    title: "RESERVED"
  }), /*#__PURE__*/_react.default.createElement(Step, {
    title: "READY TO INSTALL"
  }), /*#__PURE__*/_react.default.createElement(Step, {
    title: "DOWNLOADING"
  }), statusStep && /*#__PURE__*/_react.default.createElement(Step, {
    title: statusStep?.toUpperCase()
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "ESim__steps-content"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "steps-content"
  }, steps[current].content))), eSIMErrMsg && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: eSIMErrMsg,
    type: "error",
    showIcon: true,
    style: {
      margin: '0'
    }
  })), /*#__PURE__*/_react.default.createElement(_customCricketPopUp.default, {
    confirmationESimPopUp: confirmationESimPopUp,
    setConfirmationESimPopUp: setConfirmationESimPopUp,
    statusData: getESIMProvision,
    telephoneData: telephoneData,
    contentConfirmationModal: contentConfirmationModal
  }));
};
var _default = ESimModal;
exports.default = _default;