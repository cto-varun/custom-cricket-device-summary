"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = _interopRequireWildcard(require("@ant-design/icons"));
var _componentCache = require("@ivoyant/component-cache");
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _eSimCapable = _interopRequireDefault(require("./assets/eSimCapable.svg"));
var _customCricketPopUp = _interopRequireDefault(require("@ivoyant/custom-cricket-pop-up"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const isLuhn = value => {
  let nCheck = 0;
  let bEven = false;
  const newValue = value.replace(/\D/g, '');
  for (let n = newValue.length - 1; n >= 0; n--) {
    const cDigit = newValue.charAt(n);
    let nDigit = parseInt(cDigit, 10);
    if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
    nCheck += nDigit;
    bEven = !bEven;
  }
  return nCheck % 10 == 0;
};
const isValidIMEI = imei => {
  return imei.trim().length === 15 && isLuhn(imei.trim());
};
const isValidSIM = sim => {
  // 89    = telecom
  // 01    = united states
  // [150] = cricket
  // {13}  = sim account
  // {1}   = luhn check digit
  return sim.match(/^(89)(01)(150|030|170|410|560|680)(\d{13})/g) != null && isLuhn(sim);
};
const isSimValid = value => !!value && isValidSIM(value);
const isIMEIValid = value => !!value && isValidIMEI(value);
const isAccountValid = value => !!value && /^\d+$/.test(value) && value.length >= 9 && value.length <= 20;
const isNumberValid = value => !!value && value.toString().length >= 10;
const promiseHandler = value => (condition, errorMessage) => new Promise((resolve, reject) => condition(value) ? resolve() : reject(new Error(errorMessage)));
const customValidator = (_ref, value) => {
  let {
    field
  } = _ref;
  const handlePromise = promiseHandler(value);
  switch (field) {
    case 'sim':
      {
        return handlePromise(isSimValid, 'Please enter a valid SIM.');
      }
    case 'imei':
      {
        return handlePromise(isIMEIValid, 'Please enter a valid IMEI.');
      }
    case 'accNum':
      {
        return handlePromise(isAccountValid, 'Please enter a valid 9 - 20 digit account number.');
      }
    case 'number':
      {
        return handlePromise(isNumberValid, 'Please enter a 10 digit phone number.');
      }
    default:
      return null;
  }
};
const AddALineForm = props => {
  const {
    accountDetails,
    customerInfo,
    lineData = '',
    editKey = '',
    handleToggle = '',
    properties,
    datasources
  } = props;
  const {
    validateAddLine,
    deviceInfo
  } = properties;
  const {
    workflow,
    datasource,
    responseMapping,
    successStates,
    errorStates
  } = validateAddLine;
  const [form] = _antd.Form.useForm();
  const [eligibleForPortIn, setEligibleForPortIn] = (0, _react.useState)(false);
  const {
    banStatus
  } = accountDetails;
  const [formValues, setformValues] = (0, _react.useState)({});
  const [portNumChecked, setPortNumChecked] = (0, _react.useState)(false);
  const [loading, setLoading] = (0, _react.useState)(false);
  const [isActiveEdit, setIsActiveEdit] = (0, _react.useState)(false);
  const [otherCarriePhoneNumber, setOtherCarriePhoneNumber] = (0, _react.useState)('');
  const [portInData, setPortInData] = (0, _react.useState)(null);
  const [portInError, setPortInError] = (0, _react.useState)(null);
  const [eSimProvision, setEsimProvision] = (0, _react.useState)(true);
  const [disableIMEIValidator, setDisableIMEIValidator] = (0, _react.useState)(true);
  const [selectedSIM, setSelectedSIM] = (0, _react.useState)('NA');
  const [validateImeiErrorMessage, setValidateImeiErrorMessage] = (0, _react.useState)('');
  const [confirmationESimPopUp, setConfirmationESimPopUp] = (0, _react.useState)(false);
  const [contentConfirmationModal, setContentConfirmationModal] = (0, _react.useState)({
    title: 'Confirmation E-Sim',
    content: 'Are you sure you want to create an E-Sim profile for this customer. Doing so could burn their physical sim (Sim Swap) and charge the customer for a new E-Sim.',
    clickFrom: 'new'
  });
  const [validateImeiErrorType, setValidateImeiErrorType] = (0, _react.useState)('info');
  const EsimIcon = props => /*#__PURE__*/_react.default.createElement(_icons.default, _extends({
    component: () => /*#__PURE__*/_react.default.createElement("img", {
      src: _eSimCapable.default
    })
  }, props));

  /** Add a line call with sim and imei validation  */
  const onFinish = values => {
    setformValues(values);
    setLoading(true);
    if (!values?.number) {
      values.number = otherCarriePhoneNumber;
    }
    const addLineValidationRequestBody = {
      imei: values.imei,
      zipCode: values.zipCode,
      eSimProvision: selectedSIM === 'e' ? eSimProvision : false
    };
    if (!eSimProvision) {
      addLineValidationRequestBody.iccid = values.sim;
    }
    if (otherCarriePhoneNumber && portNumChecked) {
      addLineValidationRequestBody.otherCarrierPhoneNumber = otherCarriePhoneNumber;
    }
    validatePostCall(addLineValidationRequestBody, values);
  };

  /** Add a line call with sim and imei validation  */
  const validatePostCall = (requestBody, values, type) => {
    const registrationId = workflow.concat('.').concat(values.imei || values.number);
    if (type === 'portIn') {
      _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), portInValidateResponse(values));
    } else {
      _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), collectValidateResponse(values, isActiveEdit, editKey));
    }
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
  const getTelephoneData = (addLineValidationRequest, addLineValidationResponse, addLineFormValues) => {
    const telephoneData = {
      telephoneNumber: addLineValidationResponse.portInEligibility?.ctn,
      imei: addLineValidationResponse.imeiValidationResult?.serialNumber,
      phoneModel: addLineValidationResponse.imeiValidationResult?.itemId,
      sim: addLineValidationResponse.iccidValidationResult?.serialNumber,
      newDeviceInfo: {
        imei: addLineValidationResponse.imeiValidationResult?.serialNumber,
        byodind: 'Y',
        //    For Now byod ind is set to Y
        itemid: addLineValidationResponse.imeiValidationResult?.itemId,
        devicesaleprice: 0.0
      },
      newSimInfo: {
        sim: addLineValidationResponse.iccidValidationResult?.serialNumber,
        imsi: addLineValidationResponse.iccidValidationResult?.additionalSerialNumber
      },
      rateCenter: {
        ...addLineValidationResponse?.rateCenter,
        zip: addLineValidationRequest?.zipCode
      }
    };
    if (addLineValidationResponse?.portInEligibility !== undefined) {
      telephoneData.portInInfo = {
        ctn: addLineValidationResponse?.portInEligibility.ctn,
        lrn: addLineValidationResponse?.portInEligibility.lrn,
        otherAccountNumber: addLineFormValues?.accNum,
        otherAccountPin: addLineFormValues?.passcode,
        otherNetworkServiceProviderId: addLineValidationResponse.portInEligibility?.otherNetworkServiceProviderId,
        winBackIndicator: addLineValidationResponse.portInEligibility?.winBackIndicator,
        zip: addLineFormValues?.zipCode?.toString(),
        taxId: addLineFormValues?.taxId ? Number(addLineFormValues?.taxId) : 9999
      };
    }
    return telephoneData;
  };

  // Collecting the validate response for add a line and updating the states and calling getPlansAndAddOns
  const collectValidateResponse = (formValues, isActiveEdit, editKey) => (subscriptionId, topic, eventData, closure) => {
    const status = eventData.value;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const responsePayload = JSON.parse(eventData?.event?.data?.request?.response);
        const simError = responsePayload?.iccidValidationResult?.faultInfo;
        const imeiError = responsePayload?.imeiValidationResult?.faultInfo;
        const rateCenterError = responsePayload?.rateCenter?.faultInfo;
        const reserveProfileError = responsePayload?.reserveProfileResponse?.error;
        if (simError || imeiError || rateCenterError || reserveProfileError) {
          let responseErrors = [];
          if (reserveProfileError) {
            setSelectedSIM('Choose-ps');
            setValidateImeiErrorType('error');
            setValidateImeiErrorMessage('Error occured while adding new line for E-sim. Would you like to continue with Physical Sim?');
          }
          if (simError) {
            responseErrors.push({
              name: 'sim',
              errors: [simError ? simError?.message : 'Error']
            });
          }
          if (imeiError) {
            responseErrors.push({
              name: 'imei',
              errors: imeiError ? [imeiError?.message] : null
            });
          }
          if (rateCenterError) {
            responseErrors.push({
              name: 'zipCode',
              errors: rateCenterError ? [rateCenterError?.message] : null
            });
          }
          form.setFields(responseErrors);
        } else {
          const subscribers = [];
          const validateAddLineRequest = JSON.parse(eventData?.event?.data?.config?.data);

          // TODO : can change based on API response
          subscribers.push({
            imei: eSimProvision ? responsePayload?.reserveProfileResponses?.reserveProfileResponse[0]?.imei : responsePayload?.imeiValidationResult?.serialNumber
          });
          if (formValues && eligibleForPortIn && portInData) {
            formValues.numSource = portInData?.otherNetworkServiceProviderName;
          }
          const requestBody = {
            billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN?.toString(),
            accountStatus: banStatus,
            profile: window[window.sessionStorage?.tabId].COM_IVOYANT_VARS?.profile,
            includeExpired: banStatus !== 'T',
            subscribers
          };
          const telephoneData = getTelephoneData(validateAddLineRequest, responsePayload, formValues);
          const newLine = {
            key: 0,
            rank: 0,
            activityType: 'ACTIVATION',
            formValues,
            telephoneData,
            plan: {
              currentPlan: {},
              newPlan: {}
            },
            technicalSocs: [],
            addOns: [],
            changes: [],
            discounts: 0,
            subTotal: 0,
            operations: {
              newLine: true,
              showIcons: true,
              disableSelection: false
            },
            additionalInfo: {
              marketingOptInIndicator: formValues?.marketingOptInIndicator,
              thirdPartyOptInIndicator: formValues?.thirdPartyOptInIndicator
            }
          };
          const newAccountInfo = {
            imei: formValues?.imei,
            sim: formValues?.sim,
            additionalInfo: {
              marketingOptInIndicator: formValues?.marketingOptInIndicator,
              thirdPartyOptInIndicator: formValues?.thirdPartyOptInIndicator
            },
            billingAddress: {
              zip: customerInfo?.adrZip,
              city: customerInfo?.adrCity,
              state: customerInfo?.adrStateCode
            },
            ban: window[window.sessionStorage?.tabId].NEW_BAN?.toString(),
            accountStatus: 'T',
            banStatus: 'T',
            accountType: customerInfo?.accountType,
            accountSubType: customerInfo?.accountSubType
          };
          //cache.put('newAccountInfo', newAccountInfo);

          _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
          window[sessionStorage?.tabId]?.navigateRoute('/dashboards/change_rate_plan', {
            addLineTentativeBan: true,
            requestBody,
            newLine
          });
        }
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      setLoading(false);
    }
  };
  const clickButtonESim = () => {
    setConfirmationESimPopUp(true);
  };

  // Validated the port in elegibiility of other carried number
  const portInValidateResponse = values => (subscriptionId, topic, eventData, closure) => {
    const status = eventData.value;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const response = JSON.parse(eventData?.event?.data?.request?.response);
        setPortInData(response?.portInEligibility);
        setOtherCarriePhoneNumber(values?.number);
        if (response?.portInEligibility?.eligibilityResults) {
          setEligibleForPortIn(true);
        } else {
          setPortInError(`Not eligible for port in : ${response?.portInEligibility?.eligibilityText}`);
        }
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      if (isFailure) {
        setPortInError(eventData?.event?.data?.message);
      }
      setLoading(false);
    }
  };

  // Validating the port in using API request
  const handleValidatePortIn = values => {
    if (values?.number !== otherCarriePhoneNumber) {
      setLoading(true);
      setPortInData(null);
      setPortInError(false);
      validatePostCall({
        otherCarrierPhoneNumber: values?.number
      }, values, 'portIn');
    }
  };
  (0, _react.useEffect)(() => {
    if (lineData !== null && lineData !== undefined) {
      let initialFormValues = lineData.formValues;
      initialFormValues = {
        ...initialFormValues,
        imei: lineData?.telephoneData?.imei || '',
        sim: lineData?.telephoneData?.sim || ''
      };
      setIsActiveEdit(true);
      form.setFieldsValue(initialFormValues);
    } else {
      setIsActiveEdit(false);
    }
  }, [lineData]);
  const handlePortNumChange = e => {
    setPortNumChecked(e.target.value);
  };
  const handleValidatePortInFailed = () => {};
  const onFinishFailed = errorInfo => {};
  const hasBlanks = fieldObj => {
    return Object.keys(fieldObj).some(field => !fieldObj[field]);
  };
  const hasErrors = errorObj => {
    return errorObj.some(field => field.errors.length > 0);
  };
  const hasErrorsOrBlanks = (fieldsError, fieldsValue) => {
    const {
      marketingOptInIndicator,
      thirdPartyOptInIndicator,
      ...allFields
    } = fieldsValue;
    const {
      number,
      passcode,
      accNum,
      taxId,
      fname,
      lname,
      email,
      ...requiredFields
    } = allFields;
    const reqFieldNames = Object.keys(requiredFields);
    const reqFieldsError = fieldsError.filter(obj => reqFieldNames.includes(obj.name[0]));
    return hasErrors(reqFieldsError) || hasBlanks(requiredFields);
  };
  const handleIMEIChange = e => {
    let imeiValue = e?.target?.value;
    setSelectedSIM('NA');
    setDisableIMEIValidator(!isValidIMEI(imeiValue));
  };

  // function to handle device api for esim compatibility check
  const handleValidateIMEI = imeiValue => (subscriptionId, topic, eventData, closure) => {
    const status = eventData.value;
    const {
      successStates,
      errorStates
    } = deviceInfo;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const hasEsim = eventData?.event?.data?.data[0]?.device?.extendedCapabilities?.find(_ref2 => {
          let {
            capabilityName,
            capabilityValue
          } = _ref2;
          return capabilityName === 'eSIMCompatible' && capabilityValue === 'T';
        });
        if (hasEsim) {
          setSelectedSIM('NS');
        } else {
          setSelectedSIM('Choose-ps');
          setValidateImeiErrorType('info');
          setValidateImeiErrorMessage('Your device is not compatible with E-Sim. Would you like to continue with Physical Sim?');
        }
      } else if (isFailure) {
        setSelectedSIM('Choose-ps');
        setValidateImeiErrorType('error');
        setValidateImeiErrorMessage('Error occured while validating IMEI for E-sim. Would you like to continue with Physical Sim?');
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      setLoading(false);
    }
  };

  // function to call device api for esim compatibility check
  const validateIMEI = () => {
    const imeiValue = form.getFieldValue('imei');
    const {
      workflow,
      datasource,
      responseMapping
    } = deviceInfo;
    const registrationId = workflow.concat('.').concat(imeiValue);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleValidateIMEI(imeiValue));
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
            accountId: imeiValue
          }
        },
        responseMapping
      }
    });
  };
  const columns = [{
    title: 'Sub Market',
    dataIndex: 'subMarket',
    key: 'subMarket'
  }, {
    title: 'Current Provider',
    dataIndex: 'otherNetworkServiceProviderName',
    key: 'otherNetworkServiceProviderName'
  }, {
    title: 'LRN',
    dataIndex: 'lrn',
    key: 'lrn'
  }, {
    title: 'Coverage',
    dataIndex: 'eligibilityResults',
    key: 'eligibilityResults',
    render: eligibilityResults => eligibilityResults ? 'Yes' : 'No'
  }, {
    title: 'State Code',
    dataIndex: 'stateCode',
    key: 'stateCode'
  }, {
    title: 'Eligibility Code',
    dataIndex: 'eligibilityCode',
    key: 'eligibilityCode'
  }];
  const tableData = portInData && [{
    key: 'portInTable',
    ...portInData
  }];
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    gutter: 24,
    style: {
      marginTop: 12,
      marginLeft: 4
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 4
  }, /*#__PURE__*/_react.default.createElement(_antd.Typography.Title, {
    level: 4
  }, "Add New Line")), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 19
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio.Group, {
    className: "add-a-line-radio",
    onChange: handlePortNumChange,
    value: portNumChecked
  }, /*#__PURE__*/_react.default.createElement(_antd.Radio, {
    value: false
  }, "Add line to a cricket number"), /*#__PURE__*/_react.default.createElement(_antd.Radio, {
    value: true
  }, "Port an existing number to add a line"))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 1
  }, /*#__PURE__*/_react.default.createElement(_icons.CloseOutlined, {
    title: "close",
    onClick: handleToggle,
    style: {
      fontSize: 18
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24,
    style: {
      marginTop: 12
    }
  }, portNumChecked && /*#__PURE__*/_react.default.createElement(_antd.Form, {
    layout: "horizontal",
    name: "port-in",
    onFinish: handleValidatePortIn,
    onFinishFailed: handleValidatePortInFailed,
    className: "addALineForm",
    style: {
      paddingLeft: 0
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 5
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    name: "number",
    validateTrigger: portNumChecked ? 'onBlur' : null,
    rules: portNumChecked ? [{
      validateTrigger: 'onBlur',
      validator: customValidator
    }] : null
  }, /*#__PURE__*/_react.default.createElement(_antd.InputNumber, {
    className: "addALine__input-number",
    placeholder: "Enter phone number",
    autoComplete: "off",
    formatter: value => {
      const x = value.toString().replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      return !x[2] ? x[1] : `(${x[1]}) ${x[2]}${x[3] ? `-${x[3]}` : ''}`;
    },
    parser: value => {
      return value.substring(0, 14).replace(/[^\d]/g, '');
    }
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 5
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    shouldUpdate: true
  }, () => /*#__PURE__*/_react.default.createElement(_antd.Button
  // block
  , {
    className: "addALine__button-validate-port",
    type: "primary",
    htmlType: "submit",
    loading: loading
    // disabled={}
  }, "Check Port Eligibility"))), eligibleForPortIn && portInData && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 6
  }, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    style: {
      height: 34
    },
    message: 'Eligible for Port In',
    type: "success",
    showIcon: true
  })), portInError && portNumChecked && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 14
  }, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: portInError,
    type: "error",
    showIcon: true
  }))))), portNumChecked && eligibleForPortIn && portInData && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
    columns: columns,
    dataSource: tableData,
    pagination: false
  }))), /*#__PURE__*/_react.default.createElement(_antd.Form, {
    form: form,
    layout: "vertical",
    name: "basic",
    onFinish: onFinish,
    onFinishFailed: onFinishFailed,
    className: "addALineForm",
    autocomplete: "new-password",
    initialValues: {
      lname: customerInfo?.lastName || '',
      fname: customerInfo?.firstName || '',
      email: customerInfo?.emailAddress || '',
      zipCode: '',
      imei: '',
      sim: '',
      passcode: '',
      accNum: '',
      taxId: '',
      marketingOptInIndicator: false,
      thirdPartyOptInIndicator: false
    }
  }, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    gutter: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, portNumChecked && eligibleForPortIn && portInData && /*#__PURE__*/_react.default.createElement(_antd.Row, {
    gutter: 16
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Passcode",
    name: "passcode",
    rules: [{
      required: true
    }],
    normalize: value => value.replace(/[^0-9]/gi, '')
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    disabled: !portNumChecked,
    autoComplete: "new-password",
    maxLength: 8,
    minLength: 4
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Account Number",
    name: "accNum",
    normalize: value => value.replace(/[^0-9]/gi, ''),
    rules: portNumChecked ? [{
      required: true,
      message: 'Please enter the Account Number'
    }] : null
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    autoComplete: "new-password",
    disabled: !portNumChecked
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 4
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Last 4 of SSN/TaxId",
    name: "taxId",
    normalize: value => value.replace(/[^0-9]/gi, '')
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    disabled: !portNumChecked,
    minLength: 4,
    maxLength: 4,
    autoComplete: "new-password"
  })))), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    gutter: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "First Name",
    name: "fname"
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    autoComplete: "new-password"
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Last Name",
    name: "lname"
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    autoComplete: "new-password"
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Email Address",
    name: "email"
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    autoComplete: "new-password"
  })))), /*#__PURE__*/_react.default.createElement(_antd.Row, {
    gutter: 24
  }, selectedSIM === 'p' && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "SIM",
    name: "sim"
    // hasFeedback
    ,
    validateTrigger: "onBlur",
    rules: [{
      required: selectedSIM === 'p',
      validateTrigger: 'onBlur',
      validator: customValidator
    }],
    normalize: value => value.replace(/[^0-9]/gi, '')
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    autoComplete: "off"
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "IMEI",
    name: "imei"
    // hasFeedback
    ,
    validateTrigger: "onBlur",
    rules: [{
      required: true,
      validateTrigger: 'onBlur',
      validator: customValidator
    }],
    normalize: value => value.replace(/[^0-9]/gi, '')
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    autoComplete: "off",
    onChange: handleIMEIChange,
    suffix: selectedSIM === 'e' ? /*#__PURE__*/_react.default.createElement(EsimIcon, null) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null)
  }), selectedSIM === 'NA' && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      marginLeft: 8
    },
    type: "primary",
    onClick: () => validateIMEI(),
    disabled: disableIMEIValidator
  }, "Validate")))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Zip Code",
    name: "zipCode",
    alidateTrigger: "onBlur",
    rules: [{
      required: true
    }]
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    minLength: 5,
    maxLength: 5,
    autoComplete: "off"
  }))))), selectedSIM === 'NS' && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    description: "Good news! Your device is E-Sim capable. Would you like to activate using an E-Sim or do you have a physical Sim?",
    type: "success",
    action: /*#__PURE__*/_react.default.createElement(_antd.Space, {
      direction: "horizontal"
    }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      onClick: () => {
        setEsimProvision(false);
        setSelectedSIM('p');
      }
    }, "Physical SIM"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      onClick: clickButtonESim,
      type: "primary"
    }, "eSIM"))
  })), selectedSIM === 'Choose-ps' && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    description: validateImeiErrorMessage,
    type: validateImeiErrorType,
    action: /*#__PURE__*/_react.default.createElement(_antd.Space, {
      direction: "horizontal"
    }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      onClick: () => {
        setEsimProvision(false);
        setSelectedSIM('p');
      }
    }, "Physical SIM"))
  }))), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    wrapperCol: {
      span: 1
    },
    name: "marketingOptInIndicator",
    label: "I wish to get promotional emails",
    valuePropName: "checked"
  }, /*#__PURE__*/_react.default.createElement(_antd.Switch, null))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    wrapperCol: {
      span: 1
    },
    name: "thirdPartyOptInIndicator",
    label: "I wish to get 3rd party SMS messages",
    valuePropName: "checked"
  }, /*#__PURE__*/_react.default.createElement(_antd.Switch, null))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 4
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    shouldUpdate: true
  }, () => /*#__PURE__*/_react.default.createElement(_antd.Button, {
    block: true,
    className: "addALine__button--add-line",
    type: "primary",
    htmlType: "submit",
    loading: loading,
    disabled: hasErrorsOrBlanks(form.getFieldsError(), form.getFieldsValue()) || !(selectedSIM === 'p' || selectedSIM === 'e') || (portNumChecked ? eligibleForPortIn && portInData ? false : true : false)
  }, "Validate line details")))))), /*#__PURE__*/_react.default.createElement(_customCricketPopUp.default, {
    confirmationESimPopUp: confirmationESimPopUp,
    setConfirmationESimPopUp: setConfirmationESimPopUp,
    statusData: setSelectedSIM,
    contentConfirmationModal: contentConfirmationModal,
    setEsimProvision: setEsimProvision
  }));
};
var _default = AddALineForm;
exports.default = _default;