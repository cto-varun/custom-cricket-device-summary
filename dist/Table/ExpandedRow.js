"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _EditTemplate = _interopRequireDefault(require("./EditTemplate"));
var _UnlockTemplate = _interopRequireDefault(require("./UnlockTemplate"));
var _icons = _interopRequireWildcard(require("@ant-design/icons"));
var _moment = _interopRequireDefault(require("moment"));
var _ModalComponent = _interopRequireDefault(require("../Modal/ModalComponent"));
var _jsPlugin = _interopRequireDefault(require("js-plugin"));
var _jsonata = _interopRequireDefault(require("jsonata"));
var _PortInfo = _interopRequireDefault(require("./PortInfo"));
var _eSimCapable = _interopRequireDefault(require("../assets/eSimCapable.svg"));
var _eSimError = _interopRequireDefault(require("../assets/eSimError.svg"));
var _eSimSuccess = _interopRequireDefault(require("../assets/eSimSuccess.svg"));
var _componentCache = require("@ivoyant/component-cache");
var _VMTechnicalSoc = _interopRequireDefault(require("./VMTechnicalSoc"));
var _TechnicalSocSwitch = _interopRequireDefault(require("./TechnicalSocSwitch"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const handleCallProtectResp = (newState, setChecked, setLoading, successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
  if (successStates.includes(eventData.value) || errorStates.includes(eventData.value)) {
    setLoading(false);
    _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    if (successStates.includes(eventData.value)) {
      setChecked(newState);
    }
  }
};
const ExpandedRow = _ref => {
  let {
    telephoneData,
    deviceUpgradeWaiveFee,
    planAndAddOns,
    robocall,
    datasources,
    subscriberInfo,
    portProtectWorkflow,
    lineLevelFeatures,
    getNetworkStatus,
    provisionalInfo,
    dropdownData,
    modalConfig,
    record,
    profilesInfo,
    resetAndUnlockFlow,
    subscribers,
    handleCloseProvisionalInfo,
    customerAdditionalInfo,
    portOutColumns,
    portInColumns,
    eSIMStatusWorkflow,
    eSIMProvisionWorkflow,
    eSIMEmailQRWorkflow,
    marketingOptInUpdateWorkflow,
    accountLevelIndicator,
    eSIMUpdateUIWorkflow,
    vmTechnicalSocWorkflow,
    accountLevelFeatures,
    voicemailTechnicalSocFeature
  } = _ref;
  console.log('telephoneData', telephoneData);
  // getting details of selected phone number for passing to port out info component.
  const subscriberDetailedInfo = customerAdditionalInfo?.subscribers?.find(sub => {
    return sub?.subscriberDetails?.phoneNumber === subscriberInfo?.phoneNumber;
  });
  const [fieldName, setFieldName] = (0, _react.useState)();
  const [loading, setLoading] = (0, _react.useState)(false);
  const [portLoading, setPortLoading] = (0, _react.useState)(false);
  const [thirdPartyLoading, setThirdPartyLoading] = (0, _react.useState)(false);
  const [portInfoVisible, setPortInfoVisible] = (0, _react.useState)(false); // for toggling the visibility of port info component
  const roboCalling = planAndAddOns?.currentFeatures?.find(_ref2 => {
    let {
      soc
    } = _ref2;
    return soc === 'CRKCLDEF';
  });
  const vmTechnicalSocExists = planAndAddOns?.currentFeatures?.find(_ref3 => {
    let {
      soc
    } = _ref3;
    return soc === 'CRKVMB';
  });
  const crkabrTechnicalSocExists = checkIfTechSocExists('CRKABR');
  function checkIfTechSocExists(socName) {
    return planAndAddOns?.currentFeatures?.find(_ref4 => {
      let {
        soc
      } = _ref4;
      return soc === socName;
    });
  }
  const crkabrTechnicalSocAccountFeature = accountLevelFeatures?.find(af => {
    return af.feature === 'toggleCrkabrSoc';
  });
  const smsOptInIndicator = _componentCache.cache.get('customerPreferences')?.find(cp => cp?.ptn === record?.telephoneData?.telephoneNumber)?.preferences?.find(p => p?.preferenceName === 'ThirdPartySmsOptInIndicator')?.optInIndicator;
  const [thirdPartySmsChecked, setThirdPartySmsChecked] = (0, _react.useState)(smsOptInIndicator);
  const thirdPartyIndicatorDisableCheck = accountLevelIndicator ? record?.subscriberInfo?.status === 'C' ? true : false : true;
  let updatePortProtect = lineLevelFeatures?.find(_ref5 => {
    let {
      subscriberNumber
    } = _ref5;
    return telephoneData?.subscriberNumber === subscriberNumber;
  })?.features?.find(_ref6 => {
    let {
      feature
    } = _ref6;
    return feature === 'updatePortProtect';
  })?.enable;
  const vmTechnicalSocAccountFeature = accountLevelFeatures?.find(af => {
    return af.feature === 'toggleVoicemailTechnicalSoc';
  });
  const vmTechnicalSocFeature = vmTechnicalSocAccountFeature?.enable ? lineLevelFeatures?.find(_ref7 => {
    let {
      subscriberNumber
    } = _ref7;
    return telephoneData?.subscriberNumber === subscriberNumber;
  })?.features?.find(_ref8 => {
    let {
      feature
    } = _ref8;
    return feature === 'toggleVoicemailTechnicalSoc';
  }) : vmTechnicalSocAccountFeature;
  const crkabrTechnicalSocFeature = vmTechnicalSocAccountFeature?.enable ? lineLevelFeatures?.find(_ref9 => {
    let {
      subscriberNumber
    } = _ref9;
    return telephoneData?.subscriberNumber === subscriberNumber;
  })?.features?.find(_ref10 => {
    let {
      feature
    } = _ref10;
    return feature === 'toggleCrkabrSoc';
  }) : crkabrTechnicalSocAccountFeature;
  const [checked, setChecked] = (0, _react.useState)(roboCalling ? true : false);
  const [portChecked, setPortChecked] = (0, _react.useState)(subscriberInfo?.portProtectInd === 'Y' ? true : subscriberInfo?.portProtectInd === 'N' ? false : null);
  const [portProtectContent, setPortProtectContent] = (0, _react.useState)(null);
  let {
    profile
  } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
  const portProtectEnableProfile = profilesInfo?.profiles?.find(_ref11 => {
    let {
      name
    } = _ref11;
    return name === profile;
  })?.categories?.find(_ref12 => {
    let {
      name
    } = _ref12;
    return name === 'portProtect';
  })?.enable;
  const visible = updatePortProtect && (subscriberInfo?.portProtectRequester === 'SYSTEM' && portChecked ? true : subscriberInfo?.portProtectRequester === 'USER' || portChecked !== null ? portProtectEnableProfile : false);
  const [portDisabled, setPortDisabled] = (0, _react.useState)(false);
  const getFlagInfo = _ref13 => {
    let {
      disableExpr,
      disableMsg,
      featureFlagKeys,
      allowedLineStatuses
    } = _ref13;
    let disabled = false;
    const disabledArray = [];
    const disabledReasonsArray = [];
    let disabledReason;
    if (disableExpr) {
      disabled = (0, _jsonata.default)(disableExpr).evaluate(record);
      if (disabled) {
        disabledReason = disableMsg || 'Selected operation is not allowed for Device(s) selected';
      }
    }
    if (!disabled) {
      if (featureFlagKeys && featureFlagKeys.length > 0) {
        featureFlagKeys.forEach(featureKey => {
          const featureFlag = _jsPlugin.default.invoke('features.evaluate', featureKey);
          if (!featureFlag[0]?.enabled) {
            disabledArray.push(featureFlag[0]);
            disabledReason = featureFlag[0]?.reasons.toString();
            disabledReasonsArray.push(disabledReason);
          }
        });
      }
      if (!disabled && allowedLineStatuses) {
        disabled = allowedLineStatuses.includes(telephoneData?.ptnStatus);
        disabledReason = 'Line selected has status not supported for this activity';
      }

      // If not disabled by account featute level checks the linelevel
      if (!disabled) {
        lineLevelFeatures?.filter(_ref14 => {
          let {
            subscriberNumber,
            features
          } = _ref14;
          if (telephoneData?.subscriberNumber === subscriberNumber) {
            features?.filter(_ref15 => {
              let {
                feature,
                enable,
                reasons
              } = _ref15;
              if (featureFlagKeys?.includes(feature) && !enable) {
                disabledArray.push({
                  feature: feature,
                  enable: enable,
                  enabled: enable,
                  disabled: !enable,
                  reasons
                });
                disabledReasonsArray.push(reasons?.toString());
              }
            });
          }
        });
      }
      disabled = disabledArray.length && disabledArray.every(el => !el?.enabled);
      if (disabled) {
        disabledReason = disabledReasonsArray.toString();
      }
    }
    return {
      disabled,
      disabledReason
    };
  };
  const disabledUnlockIMEI = getFlagInfo(dropdownData.deviceMenuItems.find(dd => dd.id === 'unlockDevice'));
  const disabledChangeIMEI = getFlagInfo(dropdownData.deviceMenuItems.find(dd => dd.id === 'changeIMEI'));
  const disabledUnlockSim = getFlagInfo(dropdownData.networkMenuItems.find(dd => dd.id === 'unlockSIM'));
  const disabledChangeSim = getFlagInfo(dropdownData.networkMenuItems.find(dd => dd.id === 'changeSIM'));
  const handleChangeCallProtect = (newState, number) => {
    const {
      workflow,
      datasource,
      responseMapping,
      successStates,
      errorStates
    } = robocall;
    setLoading(true);
    const value = {
      ctn: number,
      featureName: 'CALLPROTECT',
      activityType: newState ? 'ADD' : 'REMOVE'
    };
    const registrationId = workflow.concat('.').concat(number);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleCallProtectResp(newState, setChecked, setLoading, successStates, errorStates));
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
          body: {
            ctn: number,
            featureName: 'CALLPROTECT',
            activityType: newState ? 'ADD' : 'REMOVE'
          }
        },
        responseMapping
      }
    });
  };
  const handleCallThirdPartyResponse = (newState, setThirdPartySmsChecked, setThirdPartyLoading, successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    if (successStates.includes(eventData.value) || errorStates.includes(eventData.value)) {
      setThirdPartyLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      if (successStates.includes(eventData.value)) {
        setThirdPartySmsChecked(newState);
        _antd.notification.success({
          message: 'Third party SMS!',
          description: 'Customer preferences has been updated successfully!'
        });
      }
    }
  };
  const handleThirdPartyUpdateCall = (newState, number) => {
    const {
      workflow,
      datasource,
      responseMapping,
      successStates,
      errorStates
    } = marketingOptInUpdateWorkflow;
    if (accountLevelIndicator) {
      setThirdPartyLoading(true);
      const registrationId = workflow.concat('.').concat(number);
      let body = {
        subscribers: [{
          ptn: number,
          preferences: [{
            preferenceName: 'ThirdPartySmsOptInIndicator',
            optInIndicator: newState
          }]
        }]
      };
      _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleCallThirdPartyResponse(newState, setThirdPartySmsChecked, setThirdPartyLoading, successStates, errorStates));
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
            body: {
              ...body
            }
          },
          responseMapping
        }
      });
    }
    // else {
    //     notification.error({
    //         message: 'Third party SMS!',
    //         description:
    //             'Third party SMS update is not allowed this account!',
    //     });
    // }
  };

  const handlePortProtect = (newState, setChecked, setLoading, successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    if (successStates.includes(eventData.value) || errorStates.includes(eventData.value)) {
      if (successStates.includes(eventData.value)) {
        setPortDisabled(true);
        setPortChecked(newState);
        setPortProtectContent(null);
      }
      setPortLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleChangePortProtect = (number, status) => {
    const {
      workflow,
      datasource,
      responseMapping,
      successStates,
      errorStates
    } = portProtectWorkflow;
    setPortLoading(true);
    const registrationId = workflow.concat('.').concat(number);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handlePortProtect(status, setChecked, setLoading, successStates, errorStates));
    const requestBody = JSON.stringify([{
      identifierType: 'CTN',
      identifierValue: number,
      transactionType: 'PORT_PROTECT_IND',
      transactionValue: status ? 'Y' : 'N'
    }]);
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
  const handleEditDone = () => {
    setFieldName({
      ...fieldName,
      edit: undefined
    });
  };
  const handleUnlockDone = () => {
    setFieldName({
      ...fieldName,
      unlock: undefined
    });
  };
  const handleEditCancel = workflow => {
    _componentMessageBus.MessageBus.unsubscribe(workflow);
    setFieldName({
      ...fieldName,
      edit: undefined
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.CANCEL'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'CANCEL'
      }
    });
  };
  const filterColumns = () => {
    // filter columns for port out info based on column name portType
    return subscriberDetailedInfo?.subscriberDetails?.portDetails?.portType === 'PORTIN' ? portInColumns : portOutColumns;
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-container",
    style: {
      backgroundColor: '#FFFFFF'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 10
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-property"
  }, "IMEI"), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-value"
  }, ':  ', telephoneData.imei, telephoneData?.eSimCompatibleDevice && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: "eSim capable device"
  }, /*#__PURE__*/_react.default.createElement(_icons.default, {
    component: () => /*#__PURE__*/_react.default.createElement("img", {
      src: _eSimCapable.default
    }),
    className: "mg-l-8",
    alt: "eSim-capable-icon"
  })), /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: disabledChangeIMEI.disabled ? disabledChangeIMEI.disabledReason : null
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    icon: /*#__PURE__*/_react.default.createElement(_icons.EditOutlined, null),
    type: "text",
    className: "column-edit-button",
    disabled: disabledChangeIMEI.disabled,
    onClick: () => {
      setFieldName({
        edit: 'changeIMEI',
        unlock: undefined
      });
    }
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-property"
  }, "SIM"), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-value"
  }, ':  ', telephoneData.sim, telephoneData?.eSimCompatibleDevice && telephoneData?.currentSimType === 'eSIM' && telephoneData?.eSimCurrentStatus !== undefined && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: `eSIM ${telephoneData?.eSimCurrentStatus}`
  }, /*#__PURE__*/_react.default.createElement(_icons.default, {
    component: () => telephoneData?.eSimCurrentStatus === 'Installed' ? /*#__PURE__*/_react.default.createElement("img", {
      src: _eSimSuccess.default
    }) : /*#__PURE__*/_react.default.createElement("img", {
      src: _eSimError.default
    }),
    className: "mg-l-8",
    alt: "eSim-capable-icon"
  })), /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: disabledUnlockSim.disabled ? disabledUnlockSim.disabledReason : null
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    icon: /*#__PURE__*/_react.default.createElement(_icons.LockOutlined, null),
    type: "text",
    className: "column-edit-button",
    disabled: disabledUnlockSim.disabled,
    onClick: () => {
      setFieldName({
        unlock: 'sim-unlock',
        edit: undefined
      });
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: disabledChangeSim.disabled ? disabledChangeSim.disabledReason : null
    // title={
    //     telephoneData?.eSimCompatibleDevice
    //         ? telephoneData?.enableESimAcount
    //             ? telephoneData?.enableEsim
    //                 ? null
    //                 : telephoneData?.eSimReasons
    //             : telephoneData?.eSimAcountReasons
    //         : disabledChangeSim.disabled
    //         ? disabledChangeSim.disabledReason
    //         : null
    // }
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    icon: /*#__PURE__*/_react.default.createElement(_icons.EditOutlined, null),
    className: "column-edit-button",
    type: "text"
    // disabled={
    //     telephoneData?.eSimCompatibleDevice
    //         ? telephoneData?.enableESimAcount
    //             ? !telephoneData?.enableEsim
    //             : !telephoneData?.enableESimAcount
    //         : disabledChangeSim.disabled
    // }
    ,
    disabled: disabledChangeSim.disabled,
    onClick: () => {
      setFieldName({
        edit: 'changeSIM',
        unlock: undefined
      });
    }
  }))), telephoneData.imsi ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-property"
  }, "IMSI"), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-value"
  }, ':  ', telephoneData.imsi)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-property in-progress-label"
  }, "Port-", subscriberDetailedInfo?.subscriberDetails?.portDetails?.portType === 'PORTOUT' ? 'Out' : 'In', ' ', "Status"), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-value progress-btn"
  }, ':  ', /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "network-status-button",
    onClick: () => setPortInfoVisible(true),
    size: "small"
  }, subscriberDetailedInfo?.subscriberDetails?.portDetails?.requestStatusText))))), fieldName?.edit && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 14
  }, /*#__PURE__*/_react.default.createElement(_EditTemplate.default, {
    config: modalConfig[fieldName?.edit],
    data: record,
    datasources: datasources,
    profilesInfo: profilesInfo,
    handleCancel: handleEditCancel,
    handleDone: handleEditDone,
    telephoneData: telephoneData,
    eSIMStatusWorkflow: eSIMStatusWorkflow,
    eSIMProvisionWorkflow: eSIMProvisionWorkflow,
    eSIMEmailQRWorkflow: eSIMEmailQRWorkflow,
    fieldName: fieldName,
    eSIMUpdateUIWorkflow: eSIMUpdateUIWorkflow
  })), fieldName?.unlock && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 14
  }, /*#__PURE__*/_react.default.createElement(_UnlockTemplate.default, {
    id: fieldName?.unlock,
    params: resetAndUnlockFlow[fieldName?.unlock],
    handleClose: handleUnlockDone,
    datasources: datasources,
    data: subscribers,
    telephoneNumber: telephoneData?.telephoneNumber
  })), fieldName?.edit === undefined && fieldName?.unlock === undefined && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, ' ', /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item"
  }, /*#__PURE__*/_react.default.createElement("div", null, "Robo Calling :", ' ', /*#__PURE__*/_react.default.createElement(_antd.Switch, {
    defaultChecked: roboCalling,
    loading: loading,
    size: "small",
    checked: checked,
    onChange: checked => handleChangeCallProtect(checked, telephoneData?.telephoneNumber)
  })), visible && /*#__PURE__*/_react.default.createElement("div", null, portProtectEnableProfile ? `Port Protect - ${portChecked ? 'Locked' : 'Unlocked'}` : 'Port Request - Locked', ' ', ":", ' ', /*#__PURE__*/_react.default.createElement(_antd.Switch
  // defaultChecked={portChecked}
  , {
    loading: portLoading,
    size: "small",
    disabled: portDisabled,
    checked: portChecked,
    onChange: checked => {
      setPortChecked(!checked);
      setPortDisabled(true);
      setPortProtectContent({
        text: checked ? 'Adding this CTN to the port protect list will prevent this CTN from porting out, even if the customer initiates the port request.' : 'Removing this CTN from port protect list will allow this CTN to be ported out.',
        checked: checked
      });
    }
  })), voicemailTechnicalSocFeature?.enable !== 'false' && /*#__PURE__*/_react.default.createElement(_VMTechnicalSoc.default, {
    vmTechnicalSocExists: vmTechnicalSocExists,
    vmTechnicalSocWorkflow: vmTechnicalSocWorkflow,
    phoneNumber: telephoneData?.telephoneNumber,
    vmTechnicalSocFeature: vmTechnicalSocFeature,
    datasources: datasources
  }), /*#__PURE__*/_react.default.createElement(_TechnicalSocSwitch.default, {
    techSwitchProps: {
      label: 'Stream More',
      techSocName: 'CRKABR',
      phoneNumber: telephoneData?.telephoneNumber,
      datasources: datasources,
      techSocWorkflow: vmTechnicalSocWorkflow,
      techSocExists: crkabrTechnicalSocExists,
      techSocFeatures: crkabrTechnicalSocFeature
    }
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "third-party-sms"
  }, "Third Party SMS Opt-In :", ' ', /*#__PURE__*/_react.default.createElement(_antd.Switch, {
    defaultChecked: smsOptInIndicator,
    loading: thirdPartyLoading,
    size: "small",
    checked: thirdPartySmsChecked,
    onChange: checked => handleThirdPartyUpdateCall(checked, telephoneData?.telephoneNumber),
    disabled: thirdPartyIndicatorDisableCheck
  })), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "network-status-button",
    onClick: () => getNetworkStatus(telephoneData?.telephoneNumber),
    size: "small",
    disabled: loading || provisionalInfo?.find(_ref16 => {
      let {
        ctn
      } = _ref16;
      return ctn === telephoneData?.telephoneNumber?.toString();
    }),
    loading: loading === telephoneData?.telephoneNumber
  }, "Network Status"))), provisionalInfo.map(_ref17 => {
    let {
      ctn,
      data
    } = _ref17;
    return record?.telephoneData?.telephoneNumber === ctn && /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 6
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "expandable-row-item"
    }, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
      className: "provision-alert",
      message: `Provisioning Status: ${data?.provisioningErrorInfo?.latestErrorInfo?.errorDescription || data?.provisioningStatusDescription}`,
      type: "info",
      showIcon: true,
      onClose: () => handleCloseProvisionalInfo(ctn),
      closable: true
    }), /*#__PURE__*/_react.default.createElement("div", {
      style: {
        borderBottom: '1px solid #bfbfbf'
      }
    })));
  }), provisionalInfo.length === 0 && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 6
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device"
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: '90px'
    },
    className: "column-device-property"
  }, "Plan", ' '), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-value"
  }, `:   `, "$", telephoneData?.planCost || 0), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: '90px'
    },
    className: "column-device-property"
  }, "Add-Ons Cost", ' '), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-value"
  }, `:   `, "$", telephoneData?.addOnsCost || 0), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: '90px'
    },
    className: "column-device-property"
  }, "Total", ' '), /*#__PURE__*/_react.default.createElement("div", {
    className: "column-device-value"
  }, ':  ', "$", record?.subTotal)))), deviceUpgradeWaiveFee && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 6
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "device-upgrade-waive-fee"
  }, deviceUpgradeWaiveFee?.message || 'NA'), /*#__PURE__*/_react.default.createElement("div", null, deviceUpgradeWaiveFee?.notes || 'NA')))))), portProtectContent && /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-container port-protect-container"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "expandable-row-item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "port-protect-proceed-text"
  }, "Do you want to proceed?"), /*#__PURE__*/_react.default.createElement("div", {
    className: "port-protect-text"
  }, portProtectContent?.text), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      float: 'right',
      marginBottom: 12
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      marginRight: 12
    },
    type: "primary",
    onClick: () => {
      handleChangePortProtect(telephoneData.telephoneNumber, portProtectContent?.checked);
    }
  }, "Yes"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    onClick: () => {
      setPortDisabled(false);
      setPortProtectContent(null);
    }
  }, "No")))))), subscriberDetailedInfo?.subscriberDetails?.portDetails && portInfoVisible && /*#__PURE__*/_react.default.createElement(_PortInfo.default, {
    setPortInfoVisible: setPortInfoVisible,
    portInfoColumns: filterColumns,
    portDetails: subscriberDetailedInfo?.subscriberDetails?.portDetails
  }));
};
var _default = ExpandedRow;
exports.default = _default;