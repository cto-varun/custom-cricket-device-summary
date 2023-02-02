import React from 'react';
import { Row, Col, Card, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import './PortInfoStyle.css';

export default function PortInfo({
    portDetails,
    portInfoColumns,
    setPortInfoVisible,
}) {
    const requestNumberFlex = {
        display: 'flex',
        gap: '30px',
    };

    const insideRequestNumber = {
        display: 'flex',
        gap: '10px',
    };

    const portOut = {
        display: 'flex',
        gap: '5px',
    };

    const portOutTextStyle = {
        color: '#48bf08',
    };

    const requestNumberStyle = {
        color: '#8c8c8c',
    };

    const parentCartStyle = {
        marginTop: '15px',
        color: '#1f1f1f',
    };

    const fontStyle = {
        fontSize: '0.8rem',
        lineHeight: '22px',
        textAlign: 'left',
    };

    const gridGutter = 8;

    const getConcatValue = (portColumnObject) =>
        portColumnObject?.concat
            ? '/' + portDetails[portColumnObject?.concat]
            : ''; // concat api column if present in the object of columns;
    const renderValue = (portColumnObject) => {
        // to render value based on type
        return portColumnObject && portColumnObject?.type === 'string' // check if the type is string
            ? portDetails[portColumnObject?.name] +
                  getConcatValue(portColumnObject)
            : portColumnObject.type === 'date' && // check if the type is date
              portDetails[portColumnObject?.name] && // and api has that column name
              portDetails[portColumnObject?.name] !== '' // and that date column is not empty
            ? moment(portDetails[portColumnObject?.name]).format('YYYY/MM/DD') // return beautified date with moment
            : portColumnObject.type === 'time' && // check if the type is date
              portDetails[portColumnObject?.name] && // and api has that column name
              portDetails[portColumnObject?.name] !== ''
            ? portDetails[portColumnObject?.name].slice(10, 19)
            : false; // else part for date condition
    };

    const portOutInfoDesign = (portColumnObject, index) => {
        if (portDetails[portColumnObject?.name])
            return (
                <div
                    key={index}
                    style={{
                        boxShadow: 'none',
                        background: '#fff',
                        padding: '2px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    hoverable={false}
                >
                    {renderValue(portColumnObject) && (
                        <Row
                            gutter={gridGutter}
                            style={{
                                flex: '1',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Col className="gutter-row" span={12}>
                                <div style={fontStyle}>
                                    {portColumnObject?.label}
                                </div>
                            </Col>
                            <Col className="gutter-row" span={12}>
                                <div style={fontStyle}>
                                    {': '}
                                    {renderValue(portColumnObject)}
                                </div>
                            </Col>
                        </Row>
                    )}
                </div>
            );
        return null;
    };

    return (
        <Row style={parentCartStyle}>
            <Col span={24} style={{ background: '#fff' }}>
                <Card
                    title={
                        <div style={portOut}>
                            <div>
                                {portDetails?.portType === 'PORTOUT'
                                    ? 'Port Out'
                                    : 'Port In'}{' '}
                                -
                            </div>
                            <div style={portOutTextStyle}>
                                {portDetails?.requestStatusText}
                            </div>
                        </div>
                    }
                    extra={
                        <div style={requestNumberFlex}>
                            <div style={insideRequestNumber}>
                                <div style={(requestNumberStyle, fontStyle)}>
                                    Request Number :
                                </div>
                                <div style={fontStyle}>
                                    {portDetails?.requestNumber}
                                </div>
                            </div>
                            <Button
                                icon={<CloseOutlined />}
                                className="column-edit-button"
                                onClick={() => {
                                    setPortInfoVisible(false);
                                }}
                            />
                        </div>
                    }
                    bodyStyle={{ background: '#fff' }}
                    style={{
                        width: '100%',
                        borderBottom: '2px solid #ced4da',
                    }}
                >
                    <div className="portOutDesignContainer">
                        {portInfoColumns()?.map(portOutInfoDesign)}
                    </div>
                </Card>
            </Col>
        </Row>
    );
}
