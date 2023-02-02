"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DeviceSummaryTable;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _PlanTemplate = _interopRequireDefault(require("./Table/PlanTemplate"));
var _AddOnTemplate = _interopRequireDefault(require("./Table/AddOnTemplate"));
var _ExpandedRow = _interopRequireDefault(require("./Table/ExpandedRow"));
var _AddALineForm = _interopRequireDefault(require("./Table/AddALineForm"));
var _DeviceSummaryDropdowns = _interopRequireDefault(require("./Dropdowns/DeviceSummaryDropdowns"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _shortid = _interopRequireDefault(require("shortid"));
var _jsPlugin = _interopRequireDefault(require("js-plugin"));
var _UnlockTemplate = _interopRequireDefault(require("./Table/UnlockTemplate"));
var _moment = _interopRequireDefault(require("moment"));
var _jsonata = _interopRequireDefault(require("jsonata"));
require("./index.css");
var _componentCache = require("@ivoyant/component-cache");
var _UnlockDevice = _interopRequireDefault(require("./Table/UnlockDevice"));
var _getProfilesAvailable = _interopRequireDefault(require("./utils/getProfilesAvailable"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const getTableColumnsData = (deviceSummaryFeatureFlagging, customer360view, customerAdditionalInfo, recommendations, text, accountDetails, subscribers, deviceInfo, profilesInfo, imsiCategory) => {
  const subscribersUpdated = customer360view?.account.subscribers;
  let filteredData = text !== '' ? subscribersUpdated.filter(_ref => {
    let {
      subscriberDetails
    } = _ref;
    return subscriberDetails?.phoneNumber.includes(text);
  }) : subscribersUpdated;
  const accountFeatures = deviceSummaryFeatureFlagging?.accountFeatures;
  const lineLevelFeatures = deviceSummaryFeatureFlagging?.lineLevelFeatures;
  const subscribersAdditionalInfo = customerAdditionalInfo?.subscribers;
  let tempdeviceData = [];
  filteredData?.filter(function (fd) {
    return lineLevelFeatures?.some(function (lf) {
      if (fd.subscriberId == lf.subscriberNumber) {
        return lf.features.map(i => {
          if (i.feature === 'eSIM') {
            return tempdeviceData.push({
              ...fd,
              enableEsim: i?.enable,
              eSimReasons: i?.reasons
            });
          }
        });
      }
    });
  });
  if (subscribersAdditionalInfo && subscribersAdditionalInfo.length > 0) {
    filteredData = tempdeviceData;
    tempdeviceData = [];
    filteredData?.filter(function (fd) {
      return subscribersAdditionalInfo?.some(function (lf) {
        if (fd.subscriberId == lf.subscriberId) {
          return tempdeviceData.push({
            ...fd,
            eSimCurrentStatus: lf?.subscriberDetails?.deviceDetails?.currentDevice?.esimProfileStatusResponse?.profileState
          });
        }
      });
    });
    filteredData = tempdeviceData;
  }
  if (lineLevelFeatures && lineLevelFeatures.length > 0) {
    filteredData = tempdeviceData;
    tempdeviceData = [];
    filteredData?.filter(function (fd) {
      return lineLevelFeatures?.some(function (lf) {
        if (fd.subscriberId == lf.subscriberNumber) {
          return lf.features.map(i => {
            if (i.feature === 'voicemailPasswordReset') {
              return tempdeviceData.push({
                ...fd,
                enableVMReset: i?.enable,
                vmResetReasons: i?.reasons
              });
            }
          });
        }
      });
    });
    if (tempdeviceData.length > 0) {
      filteredData = tempdeviceData;
    } else {
      filteredData = filteredData.map(item => {
        return {
          ...item,
          enableVMReset: true,
          vmResetReasons: ''
        };
      });
    }
  }
  const eSimAcountFeature = accountFeatures?.filter(af => {
    return af.feature === 'eSIM';
  });
  const columns = filteredData && filteredData.map((dataItem, i) => {
    const enableEsim = dataItem?.enableEsim;
    const eSimReasons = dataItem?.eSimReasons;
    const enableVMReset = dataItem?.enableVMReset;
    const vmResetReasons = dataItem?.vmResetReasons;
    const eSimCurrentStatus = dataItem?.eSimCurrentStatus;
    const telephoneNumber = dataItem.subscriberDetails?.phoneNumber;
    const subscriberNumber = dataItem.subscriberId;
    const currentDevice = dataItem.subscriberDetails?.deviceDetails?.currentDevice;
    const currentRatePlan = dataItem.services?.ratePlans?.current || [];
    const totalRate = dataItem.services?.totalRate;
    const currentFeatures = dataItem.services?.addOns?.current || [];
    const ptnStatus = dataItem.subscriberDetails?.status;
    const {
      statusReasonCode,
      statusDate,
      statusDescription,
      initActivationDate,
      status
    } = dataItem?.subscriberDetails;
    const additionalInfoOnSubscriberDetails = customerAdditionalInfo?.subscribers?.find(_ref2 => {
      let {
        subscriberDetails
      } = _ref2;
      return subscriberDetails?.phoneNumber === telephoneNumber;
    });
    const portOut = additionalInfoOnSubscriberDetails?.subscriberDetails?.portProtectInfo?.blockPortOutIndicator;
    const additionalInfoOnCurrentDevice = additionalInfoOnSubscriberDetails?.subscriberDetails?.deviceDetails?.currentDevice;

    // const byod = additionalInfoOnCurrentDevice?.byod;
    // console.log('byod ', byod, additionalInfoOnCurrentDevice);

    const serviceRestrictionInfo = additionalInfoOnSubscriberDetails?.subscriberDetails?.serviceRestrictionInfo;
    const planCost = dataItem.services?.ratePlans?.current?.reduce((a, b) => a + parseInt(b['rate'] || 0), 0);
    const addOnsCost = dataItem.services?.addOns?.current?.reduce((a, b) => a + parseInt(b['rate'] || 0), 0);

    // const subscriberAdditionalInfo = customerAdditionalInfo?.subscribers?.filter(
    //     (sub) => sub?.subscriberDetails?.phoneNumber === telephoneNumber
    // )[0];

    const imsiInfomation = (0, _getProfilesAvailable.default)(profilesInfo, imsiCategory) ? currentDevice?.imsi : null;
    return {
      key: i,
      billingAccountNumber: accountDetails.billingAccountNumber,
      telephoneData: {
        telephoneNumber,
        subscriberNumber,
        activationDate: additionalInfoOnCurrentDevice?.additionalDetails?.deviceTenure?.activationDate,
        imei: currentDevice?.imei,
        imsi: imsiInfomation,
        phoneModel: currentDevice?.model,
        sim: currentDevice?.sim,
        os: currentDevice?.os,
        ptnStatus,
        potentialUnlockDate: additionalInfoOnCurrentDevice?.additionalDetails?.deviceTenure?.potentialUnlockDate || null,
        tenureNotMet: additionalInfoOnCurrentDevice?.additionalDetails?.deviceTenure?.potentialUnlockDate,
        daysLeftToUnlock: additionalInfoOnCurrentDevice?.additionalDetails?.deviceTenure?.daysLeftToUnlock || null,
        nextDiscountDate: serviceRestrictionInfo?.nextDeviceDiscountEligibleDate,
        eligibleForDiscount: !(serviceRestrictionInfo?.deviceDiscountRestricted === undefined ? true : serviceRestrictionInfo?.deviceDiscountRestricted),
        planAndAddOns: {
          currentRatePlan,
          currentFeatures
        },
        statusReasonCode,
        statusDescription,
        planCost,
        addOnsCost,
        statusDate,
        initActivationDate,
        status,
        portOut,
        features: lineLevelFeatures?.find(feature => feature?.subscriberNumber === subscriberNumber)?.features,
        eSimCompatibleDevice: currentDevice?.eSimCompatibleDevice,
        currentSimType: currentDevice?.simType,
        enableEsim,
        eSimReasons,
        enableESimAcount: eSimAcountFeature[0]?.enable,
        eSimAcountReasons: eSimAcountFeature[0]?.reasons,
        eSimCurrentStatus,
        enableVMReset,
        vmResetReasons
      },
      subscriberInfo: subscribers?.find(_ref3 => {
        let {
          subscriberId
        } = _ref3;
        return subscriberId === subscriberNumber;
      })?.subscriberDetails,
      plan: {
        currentRatePlan
      },
      deviceUpgradeWaiveFee: recommendations?.attributes?.find(_ref4 => {
        let {
          value
        } = _ref4;
        return value === subscriberNumber;
      }) ? recommendations : null,
      planAndAddOns: {
        currentRatePlan,
        currentFeatures
      },
      subTotal: totalRate
    };
  });
  return columns;
};
function DeviceSummaryTable(props) {
  const {
    properties,
    parentProps
  } = props;
  const {
    datasources
  } = parentProps;
  const {
    eSIMEmailQRWorkflow,
    eSIMProvisionWorkflow,
    eSIMStatusWorkflow,
    robocall,
    workflowConfig,
    customerInfoWorkflow,
    portProtectWorkflow,
    resetAndUnlockFlow,
    portOutColumns,
    imsiCategory,
    portInColumns,
    validateAddLine,
    marketingOptInWorkflow,
    marketingOptInUpdateWorkflow,
    eSIMUpdateUIWorkflow,
    vmTechnicalSocWorkflow
  } = properties; // robocall config

  let {
    additionalRecommendations,
    subscribersInfo,
    className,
    accountDetails,
    profilesInfo,
    customerAdditionalInfo,
    customer360view,
    deviceInfo,
    customerInfo,
    deviceSummaryFeatureFlagging,
    accountLevelFeatures,
    voicemailTechnicalSocFeature,
    deviceUnlockOverrideReasons
  } = props.data.data;
  const {
    ebbQualifiedPlans = []
  } = props?.data?.data?.ebbQualifiedPlans;
  const deviceSummaryClassName = `device-summary${className ? ` ${className}` : ''}`;
  const [filterText, setFilterText] = (0, _react.useState)('');
  const [isDeviceSelected, setIsDeviceSelected] = (0, _react.useState)(false);
  const [selectedRows, setSelectedRows] = (0, _react.useState)([]);
  const [provisionalInfo, setProvisionalInfo] = (0, _react.useState)([]);
  const [error, setError] = (0, _react.useState)('');
  const [loading, setLoading] = (0, _react.useState)(false);
  const subscribers = subscribersInfo?.subscribers;
  const recommendations = additionalRecommendations?.recommendations?.find(_ref5 => {
    let {
      featureName
    } = _ref5;
    return featureName === 'deviceUpgradeWaiveFee';
  });
  const [edit, setEdit] = (0, _react.useState)({});
  const [customerInfoLoading, setCustomerInfoLoading] = (0, _react.useState)(false);
  const [selectedRowKeys, setSelectedRowKeys] = (0, _react.useState)([]);
  const [viweAllPlanRows, setViewAllPlanRows] = (0, _react.useState)([]);
  const [showResetVoicemail, setShowResetVoicemail] = (0, _react.useState)({});
  const [showUnlockDevice, setShowUnlockDevice] = (0, _react.useState)({});
  const [showAddLineForm, setShowAddLineForm] = (0, _react.useState)(false);
  const accountLevelIndicator = accountLevelFeatures?.find(ff => ff?.feature === 'ThirdPartySmsOptInIndicator')?.enable;
  const vmResetPasswordAccount = accountLevelFeatures?.filter(af => {
    return af.feature === 'voicemailPasswordReset';
  });
  const {
    workflow,
    datasource,
    responseMapping,
    successStates,
    errorStates
  } = workflowConfig;
  const toggleAddLineForm = () => {
    setShowAddLineForm(!showAddLineForm);
  };
  const handleSearch = value => {
    setFilterText(value);
  };
  const handleCustomerPreferencesResponse = (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      const response = eventData?.event?.data?.data?.successData ? JSON.parse(eventData?.event?.data?.data?.successData) : eventData?.event?.data?.data?.successData;
      if (isSuccess) {
        _componentCache.cache.put('customerPreferences', response?.subscribers);
      }
      if (isFailure) {
        setError(eventData?.event?.data?.message);
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  function getCustomerPreferences() {
    const {
      workflow,
      datasource,
      responseMapping,
      successStates,
      errorStates
    } = marketingOptInWorkflow;
    const submitEvent = 'SUBMIT';
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleCustomerPreferencesResponse);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: submitEvent
      },
      body: {
        datasource: parentProps.datasources[datasource],
        request: {
          params: {
            ban: window[sessionStorage?.tabId].NEW_BAN
          }
        },
        responseMapping
      }
    });
  }
  (0, _react.useEffect)(() => {
    getCustomerPreferences();
  }, []);
  const handleResponse = number => (subscriptionId, topic, eventData, closure) => {
    const status = eventData?.value;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const response = JSON.parse(eventData?.event?.data?.request?.response);
        const responseNumber = eventData?.event?.data?.request?.responseURL?.split('/status/')[1] || number;
        setProvisionalInfo([...provisionalInfo, {
          ctn: responseNumber,
          data: response
        }]);
      }
      if (isFailure) {
        setError(eventData?.event?.data?.message);
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const getNetworkStatus = ctn => {
    setError('');
    setLoading(ctn);
    const registrationId = workflow.concat('.').concat(ctn);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse(ctn));
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
          params: {
            phoneNumber: ctn
          }
        },
        responseMapping
      }
    });
  };
  const handleCustomerInfoResponse = (number, successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const status = eventData?.value;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        setEdit({
          ...edit,
          [number]: false
        });
      }
      if (isFailure) {
        setError(eventData?.event?.data?.message);
      }
      setCustomerInfoLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const onFinish = (values, telephoneNumber) => {
    setCustomerInfoLoading(true);
    const {
      workflow,
      datasource,
      responseMapping,
      successStates,
      errorStates
    } = customerInfoWorkflow;
    const reqBody = {
      subscriberInfo: [{
        phoneNumber: telephoneNumber,
        subscriberName: {
          firstName: values?.fname,
          lastName: values?.lname
        }
      }]
    };
    const registrationId = workflow.concat('.').concat(telephoneNumber);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleCustomerInfoResponse(telephoneNumber, successStates, errorStates));
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
          params: {
            accountId: window[window.sessionStorage?.tabId].NEW_BAN
          },
          body: reqBody
        },
        responseMapping
      }
    });
  };

  //    getFlagInfo is currently used to check whether or not enable the device unlock feature in each line
  const getFlagInfo = (_ref6, record, telephoneData) => {
    let {
      disableExpr,
      disableMsg,
      featureFlagKeys,
      allowedLineStatuses
    } = _ref6;
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
        lineLevelFeatures?.filter(_ref7 => {
          let {
            subscriberNumber,
            features
          } = _ref7;
          if (telephoneData?.subscriberNumber === subscriberNumber) {
            features?.filter(_ref8 => {
              let {
                feature,
                enable,
                reasons
              } = _ref8;
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
  const handleCloseProvisionalInfo = number => {
    const newValue = provisionalInfo?.filter(_ref9 => {
      let {
        ctn
      } = _ref9;
      return ctn !== number?.toString();
    });
    setProvisionalInfo(newValue);
  };
  const handleCloseUnlockTemplate = telephoneNumber => {
    setShowResetVoicemail({
      ...showResetVoicemail,
      [telephoneNumber]: false
    });
    setShowUnlockDevice({
      ...showUnlockDevice,
      [telephoneNumber]: false
    });
  };

  // To expand the add ons in each line
  const addToViewAll = index => setViewAllPlanRows([...viweAllPlanRows, index]);

  // To collapse the add ons in each line
  const removeFromViewAll = index => setViewAllPlanRows(viweAllPlanRows.filter(e => e !== index));
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      if (selectedRowKeys.length > 0) {
        setIsDeviceSelected(true);
      } else {
        setIsDeviceSelected(false);
      }
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: record => ({
      disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name
    }),
    renderCell: (checked, record, index, originNode) => {
      if (record.key === -1) return null;
      let bgColor = '#d5dce5';
      if (record?.activityType === 'ADDLINE') {
        bgColor = '#eaff8f';
      } else {
        const ptnStatus = record?.telephoneData?.ptnStatus;
        if (ptnStatus) {
          if (ptnStatus === 'A') {
            bgColor = '#60a630';
          } else if (ptnStatus === 'S') {
            bgColor = '#ffa940';
          } else if (ptnStatus === 'C') {
            bgColor = '#d35d43';
          }
        }
      }
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "checkbox-cell"
      }, originNode, /*#__PURE__*/_react.default.createElement("div", {
        className: "checkbox-cell-color-indicator",
        style: {
          backgroundColor: bgColor
        }
      }));
    }
  };
  const getPortStatusLayout = (statusReasonCode, statusDate, statusDescription, status) => {
    if (statusReasonCode && statusReasonCode?.toLowerCase() === 'po' && status && status?.toLowerCase() === 'c') {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
        span: 11
      }, /*#__PURE__*/_react.default.createElement(_antd.Tag, {
        style: {
          marginTop: 4,
          height: 24,
          color: '#333',
          fontSize: '12px',
          fontFamilly: 'inherit'
        },
        icon: /*#__PURE__*/_react.default.createElement(_icons.IssuesCloseOutlined, null),
        color: "danger"
      }, statusDescription)), /*#__PURE__*/_react.default.createElement(_antd.Col, {
        span: 12
      }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
        span: 14
      }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
        style: {
          fontSize: '12px',
          fontFamilly: 'inherit'
        }
      }, "Port Out Date :-", ' '), /*#__PURE__*/_react.default.createElement(_antd.Col, {
        style: {
          fontSize: '12px',
          fontFamilly: 'inherit'
        }
      }, (0, _moment.default)(statusDate).format('YYYY-MM-DD'))))));
    }
  };
  const StatusChangeDateViewer = _ref10 => {
    let {
      statusDate,
      status,
      statusDescription
    } = _ref10;
    let statusMessage;
    let icon;
    if (status === 'S') {
      statusMessage = 'Suspended';
      icon = /*#__PURE__*/_react.default.createElement(_icons.InfoCircleOutlined, {
        className: "green-tick-solid",
        style: {
          color: 'orange'
        }
      });
    } else if (status === 'C' || status === 'N') {
      statusMessage = 'Cancelled';
      icon = /*#__PURE__*/_react.default.createElement(_icons.InfoCircleOutlined, {
        className: "green-tick-solid",
        style: {
          color: 'red'
        }
      });
    } else if (status === 'A' || status === 'O') {
      statusMessage = 'Activated';
      icon = /*#__PURE__*/_react.default.createElement(_icons.InfoCircleOutlined, {
        className: "green-tick-solid"
      });
    } else {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
    }
    return /*#__PURE__*/_react.default.createElement("span", {
      className: "status-date-popover"
    }, /*#__PURE__*/_react.default.createElement(_antd.Popover, {
      placement: "right",
      color: "black",
      trigger: "hover",
      overlayClassName: "custom-popover",
      content: /*#__PURE__*/_react.default.createElement("div", {
        style: {
          background: 'black',
          fontWeight: '500',
          fontSize: '13px',
          color: 'white'
        }
      }, statusMessage, " on :", ' ', /*#__PURE__*/_react.default.createElement("span", {
        style: {
          color: '#52c41a'
        }
      }, statusDate, ' '), status === 'S' && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, "due to", ' ', /*#__PURE__*/_react.default.createElement("span", {
        style: {
          color: '#52c41a'
        }
      }, statusDescription)))
    }, icon));
  };
  const columns = data => [{
    title: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "device-search-box"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Input, {
      className: "device-search-input",
      placeholder: "Search by number",
      value: filterText,
      onChange: e => handleSearch(e.target.value),
      suffix: /*#__PURE__*/_react.default.createElement(_icons.SearchOutlined, {
        style: {
          color: filterText ? '#1890ff' : '#d5dce5'
        }
      })
    })), /*#__PURE__*/_react.default.createElement("div", {
      style: {
        marginLeft: 'auto',
        marginRight: '20px'
      }
    }, isDeviceSelected && /*#__PURE__*/_react.default.createElement(_DeviceSummaryDropdowns.default, {
      selectedRows: selectedRows,
      dropdownData: properties.dropdownData,
      modalConfig: properties.modalData,
      datasources: datasources,
      profilesInfo: profilesInfo,
      lineLevelFeatures: lineLevelFeatures
    })))),
    dataIndex: 'telephoneData',
    key: 'telephoneData',
    width: '100%',
    colSpan: 3,
    render: (data, row, index) => {
      const {
        statusReasonCode,
        statusDate,
        statusDescription,
        status,
        portOut,
        features
      } = data;
      const subInfo = subscribers?.find(_ref11 => {
        let {
          subscriberId
        } = _ref11;
        return subscriberId === data?.subscriberNumber;
      });
      let viewAll = viweAllPlanRows.includes(index);
      let currentFeatures = [];
      if (data?.planAndAddOns?.currentFeatures.length !== 0) {
        currentFeatures = viewAll ? data?.planAndAddOns?.currentFeatures : [data?.planAndAddOns?.currentFeatures[0]];
      }
      const unlockDeviceFeature = features?.find(_ref12 => {
        let {
          feature
        } = _ref12;
        return feature === 'unlockDevice';
      });
      const unlockOverrideProfile = profilesInfo?.profiles.find(_ref13 => {
        let {
          name
        } = _ref13;
        return name === window[sessionStorage.tabId].COM_IVOYANT_VARS.profile;
      })?.categories.find(_ref14 => {
        let {
          name
        } = _ref14;
        return name === 'deviceUnlockOverride';
      });
      const [disableVMResetButton, setDisableVMResetButton] = (0, _react.useState)(false);
      const [vmResetButtonTooltip, setVMResetButtonTooltip] = (0, _react.useState)('');
      (0, _react.useEffect)(() => {
        if (vmResetPasswordAccount[0]?.enable === true && data?.enableVMReset === true) {
          setDisableVMResetButton(false);
          setVMResetButtonTooltip('');
        } else {
          setDisableVMResetButton(true);
          setVMResetButtonTooltip(vmResetPasswordAccount[0]?.reasons[0] || data?.vmResetReasons[0] || 'Reset Voicemail password is disabled');
        }
      }, [vmResetPasswordAccount[0]?.enable, data?.enableVMReset]);
      const additionalInfoOnSubscriberDetails = customerAdditionalInfo?.subscribers?.find(_ref15 => {
        let {
          subscriberDetails
        } = _ref15;
        return subscriberDetails?.phoneNumber === data?.telephoneNumber;
      });
      const additionalInfoOnCurrentDevice = additionalInfoOnSubscriberDetails?.subscriberDetails?.deviceDetails?.currentDevice;
      const byod = additionalInfoOnCurrentDevice?.byod;
      return {
        children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 11
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "column-device"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "column-device-mobile-wrapper"
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "column-device-telephone-number",
          style: {
            color: 'black'
          }
        }, data.telephoneNumber, /*#__PURE__*/_react.default.createElement(StatusChangeDateViewer, {
          statusDate: data.status === 'A' ? data?.initActivationDate : data?.statusDate,
          status: data?.status,
          statusDescription: data?.statusDescription
        }), /*#__PURE__*/_react.default.createElement(_antd.Button, {
          icon: /*#__PURE__*/_react.default.createElement("svg", {
            version: "1.1",
            id: "Layer_1",
            xmlns: "http://www.w3.org/2000/svg",
            x: "0px",
            y: "0px",
            viewBox: "0 0 122.88 122",
            xmlSpace: "preserve",
            style: {
              width: '14px',
              marginBottom: '-1px'
            }
          }, /*#__PURE__*/_react.default.createElement("g", null, /*#__PURE__*/_react.default.createElement("path", {
            d: "M32.57,41.96c5.28,0,10.06,2.14,13.52,5.6c3.46,3.46,5.6,8.24,5.6,13.52c0,4.53-1.58,8.69-4.21,11.97h28.53 c-2.63-3.28-4.21-7.44-4.21-11.97c0-5.28,2.14-10.06,5.6-13.52c3.46-3.46,8.24-5.6,13.52-5.6c5.28,0,10.06,2.14,13.52,5.6 c3.46,3.46,5.6,8.24,5.6,13.52c0,5.28-2.14,10.06-5.6,13.52c-3.46,3.46-8.24,5.6-13.52,5.6H33.86c-0.13,0-0.26-0.01-0.39-0.02 c-0.3,0.01-0.59,0.02-0.89,0.02c-5.28,0-10.06-2.14-13.52-5.6c-3.46-3.46-5.6-8.24-5.6-13.52c0-5.28,2.14-10.06,5.6-13.52 C22.51,44.1,27.29,41.96,32.57,41.96L32.57,41.96z M16.11,0h90.66c4.43,0,8.46,1.81,11.38,4.73c2.92,2.92,4.73,6.95,4.73,11.38 v89.79c0,4.43-1.81,8.46-4.73,11.38c-2.92,2.92-6.95,4.73-11.38,4.73H16.11c-4.43,0-8.46-1.81-11.38-4.73 C1.81,114.36,0,110.33,0,105.9V16.11c0-4.43,1.81-8.46,4.73-11.38C7.65,1.81,11.67,0,16.11,0L16.11,0z M106.77,7.16H16.11 c-2.46,0-4.69,1.01-6.32,2.63c-1.62,1.62-2.63,3.86-2.63,6.32v89.79c0,2.46,1.01,4.69,2.63,6.32c1.62,1.62,3.86,2.63,6.32,2.63 h90.66c2.46,0,4.69-1.01,6.32-2.63c1.62-1.62,2.63-3.86,2.63-6.32V16.11c0-2.46-1.01-4.69-2.63-6.32 C111.47,8.17,109.23,7.16,106.77,7.16L106.77,7.16z M99.4,52.62c-2.17-2.17-5.16-3.51-8.46-3.51c-3.31,0-6.3,1.34-8.46,3.51 c-2.17,2.17-3.51,5.16-3.51,8.46c0,3.31,1.34,6.3,3.51,8.46c2.17,2.17,5.16,3.51,8.46,3.51c3.31,0,6.3-1.34,8.46-3.51 c2.17-2.17,3.51-5.16,3.51-8.46C102.91,57.78,101.57,54.79,99.4,52.62L99.4,52.62z M41.04,52.62c-2.17-2.17-5.16-3.51-8.46-3.51 c-3.31,0-6.3,1.34-8.46,3.51c-2.17,2.17-3.51,5.16-3.51,8.46c0,3.31,1.34,6.3,3.51,8.46c2.17,2.17,5.16,3.51,8.46,3.51 c3.31,0,6.3-1.34,8.46-3.51c2.17-2.17,3.51-5.16,3.51-8.46C44.54,57.78,43.2,54.79,41.04,52.62L41.04,52.62z"
          }))),
          className: "column-edit-button",
          style: disableVMResetButton ? {
            opacity: 0.5
          } : {
            opacity: 1
          },
          onClick: () => {
            setShowResetVoicemail({
              ...showResetVoicemail,
              [data?.telephoneNumber]: true
            });
            setEdit({
              ...edit,
              [data?.telephoneNumber]: false
            });
          },
          disabled: disableVMResetButton,
          title: vmResetButtonTooltip
        })), /*#__PURE__*/_react.default.createElement("div", {
          className: "column-device"
        }, byod && /*#__PURE__*/_react.default.createElement("span", {
          style: {
            color: '#52c41a',
            paddingRight: '5px',
            fontSize: '14px'
          }
        }, "BYOD"), /*#__PURE__*/_react.default.createElement("span", {
          className: "column-device-value subscriber-name"
        }, `${subInfo?.subscriberDetails?.name.firstName} ${subInfo?.subscriberDetails?.name?.lastName}`, /*#__PURE__*/_react.default.createElement(_antd.Button, {
          icon: /*#__PURE__*/_react.default.createElement(_icons.EditOutlined, null),
          className: "column-edit-button",
          onClick: () => {
            setEdit({
              ...edit,
              [data?.telephoneNumber]: true
            });
            setShowResetVoicemail({
              ...showResetVoicemail,
              [data?.telephoneNumber]: false
            });
          }
        })))), subInfo?.subscriberDetails?.isPortedIn && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
          style: {
            marginTop: 4,
            height: 24
          },
          icon: /*#__PURE__*/_react.default.createElement(_icons.CheckCircleOutlined, null),
          color: "success"
        }, "Ported In")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_PlanTemplate.default, {
          rowIndex: index,
          data: data.planAndAddOns,
          ebbQualifiedPlans: ebbQualifiedPlans
        }), currentFeatures.length !== 0 && currentFeatures.map(item => /*#__PURE__*/_react.default.createElement(_AddOnTemplate.default, {
          data: item,
          rowIndex: index,
          key: _shortid.default.generate()
        })), data?.planAndAddOns?.currentFeatures.length > 1 && (viewAll ? /*#__PURE__*/_react.default.createElement(_antd.Button, {
          type: "link",
          className: "viewAllButton",
          onClick: () => removeFromViewAll(index)
        }, "View Less") : /*#__PURE__*/_react.default.createElement(_antd.Button, {
          type: "link",
          className: "viewAllButton",
          onClick: () => addToViewAll(index)
        }, data?.planAndAddOns?.currentFeatures.length - 1, ' ', "More")))), edit[data?.telephoneNumber] && /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 12
        }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 18
        }, /*#__PURE__*/_react.default.createElement(_antd.Form, {
          name: "basic",
          layout: "inline",
          initialValues: {
            lname: subInfo?.subscriberDetails?.name?.lastName || '',
            fname: subInfo?.subscriberDetails?.name?.firstName || ''
          },
          onFinish: values => onFinish(values, data?.telephoneNumber),
          style: {
            marginRight: 12
          },
          size: "small"
        }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          name: "fname",
          style: {
            marginBottom: 8
          },
          rules: [{
            required: true,
            message: 'Please enter first name'
          }]
        }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
          placeholder: "First Name",
          autoComplete: "off"
        })), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          name: "lname",
          rules: [{
            required: true,
            message: 'Please enter last name'
          }],
          style: {
            marginBottom: 8
          }
        }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
          placeholder: "Last Name",
          autoComplete: "off"
        })), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
          type: "primary",
          htmlType: "submit",
          style: {
            marginRight: 4
          },
          loading: customerInfoLoading
        }, "Apply & Save"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
          type: "default",
          onClick: () => setEdit({
            ...edit,
            [data?.telephoneNumber]: false
          })
        }, "Close")))))), !edit[data?.telephoneNumber] && !showResetVoicemail[data?.telephoneNumber] && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: showUnlockDevice[data?.telephoneNumber] ? 4 : 12
        }, /*#__PURE__*/_react.default.createElement("div", {
          style: {
            fontSize: '12px'
          }
        }, data.phoneModel && /*#__PURE__*/_react.default.createElement("div", {
          className: "column-device-value"
        }, "Model :", ' ', data.phoneModel, ' ', '  ', /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
          placement: "right",
          title: !unlockDeviceFeature?.enable ? unlockDeviceFeature?.reasons?.toString() : data?.potentialUnlockDate ? `Potential Unlock Date: ${(0, _moment.default)(data?.potentialUnlockDate).format('MM-DD-YYYY')} ( ${(0, _moment.default)().to((0, _moment.default)(data?.potentialUnlockDate))} )` : null
        }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
          icon: /*#__PURE__*/_react.default.createElement(_icons.LockOutlined, null),
          className: "column-edit-button",
          type: "text",
          disabled: !unlockDeviceFeature?.enable ? true : data?.daysLeftToUnlock > 0 && !unlockOverrideProfile ? true : false,
          onClick: () => setShowUnlockDevice({
            ...showUnlockDevice,
            [data?.telephoneNumber]: true
          })
        }))), /*#__PURE__*/_react.default.createElement("div", {
          className: "column-device-value",
          style: {
            margin: '5px 0 8px 0'
          }
        }, "Eligible for device discounts ", ':  ', data?.eligibleForDiscount ? 'Yes' : 'No'), /*#__PURE__*/_react.default.createElement("div", {
          className: "column-device-value"
        }, "Discount Eligibility Date ", ':  ', data?.nextDiscountDate ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, `${(0, _moment.default)(data?.nextDiscountDate).format('MM-DD-YYYY')} ( ${(0, _moment.default)().to((0, _moment.default)(data?.nextDiscountDate))} )`, /*#__PURE__*/_react.default.createElement(_icons.CheckCircleFilled, {
          className: "green-tick-solid"
        })) : data?.eligibleForDiscount ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, `${(0, _moment.default)().format('MM-DD-YYYY')}`, /*#__PURE__*/_react.default.createElement(_icons.CheckCircleFilled, {
          className: "green-tick-solid"
        })) : 'Not Available'), status && status?.toLowerCase() !== 'c' && statusReasonCode?.toLowerCase() !== 'po' && portOut &&
        /*#__PURE__*/
        // added condition so that port out should only appears if it is not ported out yet and blockport indicator is true for the same phone number
        _react.default.createElement("div", {
          className: "column-device-value"
        }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 24
        }, /*#__PURE__*/_react.default.createElement(_antd.Tag, {
          style: {
            marginTop: 4,
            height: 24,
            color: '#f00',
            fontSize: '12px',
            fontFamilly: 'inherit'
          },
          icon: /*#__PURE__*/_react.default.createElement(_icons.IssuesCloseOutlined, null),
          color: "danger"
        }, "Port Out is in progress"))))), showUnlockDevice[data?.telephoneNumber] && /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 8
        }, /*#__PURE__*/_react.default.createElement(_UnlockDevice.default, {
          id: "device-unlock",
          imei: data?.imei,
          android: data?.os === 'Android',
          params: resetAndUnlockFlow['device-unlock'],
          handleClose: number => handleCloseUnlockTemplate(number),
          data: subscribers,
          datasources: datasources,
          telephoneNumber: data?.telephoneNumber,
          profilesInfo: profilesInfo,
          deviceUnlockOverrideReasons: deviceUnlockOverrideReasons
        }))), showResetVoicemail[data?.telephoneNumber] && /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 12
        }, /*#__PURE__*/_react.default.createElement(_UnlockTemplate.default, {
          id: "reset-vm-pass",
          params: resetAndUnlockFlow.resetVM,
          handleClose: handleCloseUnlockTemplate,
          data: subscribers,
          datasources: datasources,
          telephoneNumber: data?.telephoneNumber
        })), getPortStatusLayout(statusReasonCode, statusDate, statusDescription, status), /*#__PURE__*/_react.default.createElement(_antd.Col, {
          span: 1
        }, /*#__PURE__*/_react.default.createElement("div", {
          style: {
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center'
          }
        }, /*#__PURE__*/_react.default.createElement("a", {
          className: "ant-dropdown-link",
          style: {
            color: 'black',
            display: 'inline-block',
            verticalAlign: 'middle'
          },
          onClick: () => setSelectedRowKeys(selectedRowKeys[0] === row.key ? [] : [row.key])
        }, selectedRowKeys[0] === row.key ? /*#__PURE__*/_react.default.createElement(_icons.CaretDownOutlined, null) : /*#__PURE__*/_react.default.createElement(_icons.CaretLeftOutlined, null))))))
      };
    }
  }];
  const columnsData = getTableColumnsData(deviceSummaryFeatureFlagging, customer360view, customerAdditionalInfo, recommendations, filterText, accountDetails, subscribers, deviceInfo, profilesInfo, imsiCategory);
  // lineLevel features data from feature flagging
  let lineLevelFeaturesData = _jsPlugin.default.invoke('features.evaluate', null, [], true);
  let lineLevelFeatures = lineLevelFeaturesData && lineLevelFeaturesData[0];
  const locale = {
    emptyText: showAddLineForm ? /*#__PURE__*/_react.default.createElement(_AddALineForm.default, {
      accountDetails: accountDetails,
      customerInfo: customerInfo,
      properties: properties,
      datasources: datasources,
      handleToggle: toggleAddLineForm
    }) : /*#__PURE__*/_react.default.createElement("div", {
      style: {
        textAlign: 'left'
      }
    }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      onClick: toggleAddLineForm
    }, "Add New Line"))
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: deviceSummaryClassName
  }, error && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    className: "provision-alert",
    message: error,
    type: "error",
    showIcon: true,
    closable: true
  }), /*#__PURE__*/_react.default.createElement(_antd.Table, {
    className: "device-summary-table",
    tableLayout: "auto",
    rowSelection: {
      type: 'checkbox',
      ...rowSelection
    },
    rowClassName: () => {
      record => true ? 'row-styles-while-expanded' : 'row-styles';
    },
    dataSource: columnsData,
    columns: columns(columnsData),
    expandable: {
      expandedRowKeys: selectedRowKeys,
      expandedRowRender: record => {
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ExpandedRow.default, _extends({}, record, {
          datasources: datasources,
          robocall: robocall,
          modalConfig: properties.modalData,
          portProtectWorkflow: portProtectWorkflow,
          lineLevelFeatures: lineLevelFeatures,
          getNetworkStatus: getNetworkStatus,
          provisionalInfo: provisionalInfo,
          handleCloseProvisionalInfo: handleCloseProvisionalInfo,
          dropdownData: properties.dropdownData,
          profilesInfo: profilesInfo,
          resetAndUnlockFlow: resetAndUnlockFlow,
          record: record,
          subscribers: subscribers,
          customerAdditionalInfo: customerAdditionalInfo,
          portOutColumns: portOutColumns,
          portInColumns: portInColumns,
          eSIMStatusWorkflow: eSIMStatusWorkflow,
          eSIMProvisionWorkflow: eSIMProvisionWorkflow,
          eSIMEmailQRWorkflow: eSIMEmailQRWorkflow,
          marketingOptInUpdateWorkflow: marketingOptInUpdateWorkflow,
          accountLevelIndicator: accountLevelIndicator,
          eSIMUpdateUIWorkflow: eSIMUpdateUIWorkflow,
          vmTechnicalSocWorkflow: vmTechnicalSocWorkflow,
          accountLevelFeatures: accountLevelFeatures,
          voicemailTechnicalSocFeature: voicemailTechnicalSocFeature
        })));
      }
    },
    scroll: {
      y: 580
    },
    locale: locale
  }));
}