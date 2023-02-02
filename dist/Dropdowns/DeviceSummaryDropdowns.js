"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = _interopRequireWildcard(require("@ant-design/icons"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _componentLinkButton = _interopRequireDefault(require("@ivoyant/component-link-button"));
var _globe = _interopRequireDefault(require("./icons/globe.svg"));
var _invoices = _interopRequireDefault(require("./icons/invoices.svg"));
var _smartphone = _interopRequireDefault(require("./icons/smartphone.svg"));
var _ModalComponent = _interopRequireDefault(require("../Modal/ModalComponent"));
require("./dropdowns.css");
var _jsonata = _interopRequireDefault(require("jsonata"));
var _jsPlugin = _interopRequireDefault(require("js-plugin"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  SubMenu
} = _antd.Menu;
const GlobeIcon = /*#__PURE__*/_react.default.createElement(_icons.default, {
  component: () => /*#__PURE__*/_react.default.createElement("img", {
    src: _globe.default
  }),
  className: "device-summary-dropdown-icon globe-icon",
  alt: "globe-icon"
});
const InvoiceIcon = /*#__PURE__*/_react.default.createElement(_icons.default, {
  component: () => /*#__PURE__*/_react.default.createElement("img", {
    src: _invoices.default
  }),
  className: "device-summary-dropdown-icon invoices-icon",
  alt: "invoices-icon"
});
const SmartPhoneIcon = /*#__PURE__*/_react.default.createElement(_icons.default, {
  component: () => /*#__PURE__*/_react.default.createElement("img", {
    src: _smartphone.default
  }),
  className: "device-summary-dropdown-icon smartphone-icon",
  alt: "smartphone-icon"
});
const DeviceSummaryDropdowns = _ref => {
  let {
    selectedRows,
    dropdownData,
    modalConfig,
    datasources,
    profilesInfo,
    lineLevelFeatures
  } = _ref;
  const [modalId, setModalId] = (0, _react.useState)(undefined);
  const getFlagInfo = function (disableExpr, disableMsg, featureKeys, allowedLineStatuses) {
    let maxSelections = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 9;
    let disabled = false;
    const disabledArray = [];
    const disabledReasonsArray = [];
    let disabledReason;
    if (selectedRows.length > maxSelections) {
      disabled = true;
      disabledReason = 'Only ' + maxSelections + ' line(s) should be selected to enable this activity';
    } else if (disableExpr) {
      disabled = (0, _jsonata.default)(disableExpr).evaluate(selectedRows);
      if (disabled) {
        disabledReason = disableMsg || 'Selected operation is not allowed for Device(s) selected';
      }
    }
    if (!disabled) {
      if (featureKeys && featureKeys.length > 0) {
        featureKeys.forEach(featureKey => {
          const featureFlag = _jsPlugin.default.invoke('features.evaluate', featureKey);
          if (!featureFlag[0]?.enabled) {
            disabledArray.push(featureFlag[0]);
            disabledReason = featureFlag[0]?.reasons.toString();
            disabledReasonsArray.push(disabledReason);
          }
        });
      }
      if (!disabled && allowedLineStatuses) {
        disabled = selectedRows.filter(sr => allowedLineStatuses.includes(sr?.telephoneData?.ptnStatus)).length != selectedRows.length;
        disabledReason = 'Line selected has status not supported for this activity';
      }

      // If not disabled by account featute level checks the linelevel
      if (!disabled) {
        selectedRows.filter(_ref2 => {
          let {
            telephoneData
          } = _ref2;
          lineLevelFeatures?.filter(_ref3 => {
            let {
              subscriberNumber,
              features
            } = _ref3;
            if (telephoneData?.subscriberNumber === subscriberNumber) {
              features?.filter(_ref4 => {
                let {
                  feature,
                  enable,
                  reasons
                } = _ref4;
                if (featureKeys?.includes(feature) && !enable) {
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
  const addFlagInfo = menuItems => {
    return menuItems.map(mi => {
      return {
        ...mi,
        featureFlag: getFlagInfo(mi.disableExpr, mi.disableMsg, mi.featureFlagKeys, mi.allowedLineStatuses, mi.maxSelections)
      };
    });
  };
  const getMenuItem = (type, menuItem, idx) => {
    return menuItem.target && menuItem.target.type === 'link' ? /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
      key: type + idx,
      className: "device-summary-dropdown-menu-item"
    }, menuItem.featureFlag.disabled ? /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
      title: menuItem.featureFlag.disabled ? 'Disabled : ' + menuItem.featureFlag.disabledReason : null,
      placement: "right"
    }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      disabled: menuItem.featureFlag.disabled,
      type: "text",
      block: true,
      style: {
        textAlign: 'left',
        paddingLeft: 0
      }
    }, menuItem.name)) : /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
      className: "submit-button",
      size: "small",
      href: menuItem.target.link,
      routeData: selectedRows,
      src: menuItem.id,
      disabled: menuItem.featureFlag.disabled,
      type: "text",
      block: true,
      style: {
        textAlign: 'left',
        paddingLeft: 0
      }
    }, /*#__PURE__*/_react.default.createElement("span", null, menuItem.name))) : /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
      key: type + idx,
      className: "device-summary-dropdown-menu-item",
      onClick: () => {
        if (!menuItem.featureFlag.disabled) {
          if (menuItem.event) {
            _componentMessageBus.MessageBus.send(menuItem.event, selectedRows);
          } else if (modalConfig[menuItem.id]) setModalId(menuItem.id);
        }
      }
    }, /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
      title: menuItem.featureFlag.disabled ? 'Disabled : ' + menuItem.featureFlag.disabledReason : null,
      placement: "right"
    }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      disabled: menuItem.featureFlag.disabled,
      type: "text",
      block: true,
      style: {
        textAlign: 'left',
        paddingLeft: 0
      }
    }, menuItem.name)));
  };
  const getMenuItems = (type, menuItems) => {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, menuItems.filter(mi => mi?.showForProfiles ? mi.showForProfiles.includes(window[window.sessionStorage?.tabId].COM_IVOYANT_VARS.profile) : true).map((menuItem, idx) => getMenuItem(type, menuItem, idx))), modalId && /*#__PURE__*/_react.default.createElement(_ModalComponent.default, {
      config: modalConfig[modalId],
      data: selectedRows[0],
      datasources: datasources,
      profilesInfo: profilesInfo
    }));
  };
  const menu = /*#__PURE__*/_react.default.createElement(_antd.Menu, null, getMenuItems('Device', addFlagInfo(dropdownData.deviceMenuItems.filter(_ref5 => {
    let {
      id
    } = _ref5;
    return id !== 'unlockDevice' && id !== 'changeIMEI';
  }))), getMenuItems('Network', addFlagInfo(dropdownData.networkMenuItems.filter(_ref6 => {
    let {
      id
    } = _ref6;
    return id !== 'unlockSIM' && id !== 'changeSIM';
  }))), getMenuItems('Plan', addFlagInfo(dropdownData.planMenuItems)));
  (0, _react.useEffect)(() => {
    if (modalId) {
      setTimeout(() => {
        setModalId(undefined);
      }, 750);
    }
  }, [modalId]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
    menu: menu
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "ant-dropdown-link",
    onClick: e => e.preventDefault()
  }, /*#__PURE__*/_react.default.createElement(_icons.default, {
    component: () => /*#__PURE__*/_react.default.createElement("img", {
      src: _smartphone.default
    }),
    className: "device-summary-dropdown-icon smartphone-icon",
    alt: "smartphone-icon"
  }), "More Changes ", /*#__PURE__*/_react.default.createElement(_icons.DownOutlined, null))));
};
var _default = DeviceSummaryDropdowns;
exports.default = _default;