"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TechnicalSocSwitch;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function TechnicalSocSwitch(_ref) {
  let {
    techSwitchProps
  } = _ref;
  const {
    label,
    phoneNumber,
    datasources,
    techSocWorkflow,
    techSocExists,
    techSocFeatures,
    techSocName
  } = techSwitchProps;
  const [loading, setLoading] = (0, _react.useState)(false);
  const [checked, setChecked] = (0, _react.useState)(techSocExists);
  console.log('props tc', label, phoneNumber, datasources, workflow, techSocExists, techSocFeatures);
  let {
    workflow,
    datasource,
    responseMapping,
    successStates,
    errorStates
  } = techSocWorkflow;
  const handleTecSocUpdateCall = checked => {
    setLoading(true);
    setChecked(checked);
    const registrationId = workflow.concat('.').concat(phoneNumber);
    let body = {
      services: [{
        soc: techSocName,
        action: checked ? 'ADD' : 'REMOVE'
      }]
    };
    const mapping = {
      ...responseMapping,
      success: {
        success: {
          messageExpr: `'Stream More ${checked ? 'Enabled' : 'Disabled'}'`
        }
      }
    };
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleTechSocResponse(checked, successStates, errorStates));
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
          },
          params: {
            phonenumber: phoneNumber
          }
        },
        responseMapping: mapping
      }
    });
  };
  const handleTechSocResponse = (checked, successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const isSuccess = successStates.includes(eventData.value);
    const isError = errorStates.includes(eventData.value);
    if (isSuccess || isError) {
      if (isSuccess) {
        setChecked(checked);
      } else {
        setChecked(!checked);
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "third-party-sms"
  }, /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: techSocFeatures?.reasons?.toString(),
    showTitle: techSocFeatures?.reasons?.length
  }, label, " :", ' ', /*#__PURE__*/_react.default.createElement(_antd.Switch, {
    defaultChecked: checked,
    loading: loading,
    size: "small",
    checked: checked,
    onChange: checked => handleTecSocUpdateCall(checked),
    disabled: !techSocFeatures?.enable
  })));
}