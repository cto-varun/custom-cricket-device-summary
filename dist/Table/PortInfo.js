"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PortInfo;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _moment = _interopRequireDefault(require("moment"));
require("./PortInfoStyle.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function PortInfo(_ref) {
  let {
    portDetails,
    portInfoColumns,
    setPortInfoVisible
  } = _ref;
  const requestNumberFlex = {
    display: 'flex',
    gap: '30px'
  };
  const insideRequestNumber = {
    display: 'flex',
    gap: '10px'
  };
  const portOut = {
    display: 'flex',
    gap: '5px'
  };
  const portOutTextStyle = {
    color: '#48bf08'
  };
  const requestNumberStyle = {
    color: '#8c8c8c'
  };
  const parentCartStyle = {
    marginTop: '15px',
    color: '#1f1f1f'
  };
  const fontStyle = {
    fontSize: '0.8rem',
    lineHeight: '22px',
    textAlign: 'left'
  };
  const gridGutter = 8;
  const getConcatValue = portColumnObject => portColumnObject?.concat ? '/' + portDetails[portColumnObject?.concat] : ''; // concat api column if present in the object of columns;
  const renderValue = portColumnObject => {
    // to render value based on type
    return portColumnObject && portColumnObject?.type === 'string' // check if the type is string
    ? portDetails[portColumnObject?.name] + getConcatValue(portColumnObject) : portColumnObject.type === 'date' &&
    // check if the type is date
    portDetails[portColumnObject?.name] &&
    // and api has that column name
    portDetails[portColumnObject?.name] !== '' // and that date column is not empty
    ? (0, _moment.default)(portDetails[portColumnObject?.name]).format('YYYY/MM/DD') // return beautified date with moment
    : portColumnObject.type === 'time' &&
    // check if the type is date
    portDetails[portColumnObject?.name] &&
    // and api has that column name
    portDetails[portColumnObject?.name] !== '' ? portDetails[portColumnObject?.name].slice(10, 19) : false; // else part for date condition
  };

  const portOutInfoDesign = (portColumnObject, index) => {
    if (portDetails[portColumnObject?.name]) return /*#__PURE__*/_react.default.createElement("div", {
      key: index,
      style: {
        boxShadow: 'none',
        background: '#fff',
        padding: '2px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
      hoverable: false
    }, renderValue(portColumnObject) && /*#__PURE__*/_react.default.createElement(_antd.Row, {
      gutter: gridGutter,
      style: {
        flex: '1',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      className: "gutter-row",
      span: 12
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: fontStyle
    }, portColumnObject?.label)), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      className: "gutter-row",
      span: 12
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: fontStyle
    }, ': ', renderValue(portColumnObject)))));
    return null;
  };
  return /*#__PURE__*/_react.default.createElement(_antd.Row, {
    style: parentCartStyle
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24,
    style: {
      background: '#fff'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Card, {
    title: /*#__PURE__*/_react.default.createElement("div", {
      style: portOut
    }, /*#__PURE__*/_react.default.createElement("div", null, portDetails?.portType === 'PORTOUT' ? 'Port Out' : 'Port In', ' ', "-"), /*#__PURE__*/_react.default.createElement("div", {
      style: portOutTextStyle
    }, portDetails?.requestStatusText)),
    extra: /*#__PURE__*/_react.default.createElement("div", {
      style: requestNumberFlex
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: insideRequestNumber
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: (requestNumberStyle, fontStyle)
    }, "Request Number :"), /*#__PURE__*/_react.default.createElement("div", {
      style: fontStyle
    }, portDetails?.requestNumber)), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      icon: /*#__PURE__*/_react.default.createElement(_icons.CloseOutlined, null),
      className: "column-edit-button",
      onClick: () => {
        setPortInfoVisible(false);
      }
    })),
    bodyStyle: {
      background: '#fff'
    },
    style: {
      width: '100%',
      borderBottom: '2px solid #ced4da'
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "portOutDesignContainer"
  }, portInfoColumns()?.map(portOutInfoDesign)))));
}