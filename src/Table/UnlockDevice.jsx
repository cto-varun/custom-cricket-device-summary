import React, { useState } from 'react';
import { Button, Typography, Alert, Input, Select } from 'antd';
import './UnlockTemplate.css';
import { MessageBus } from '@ivoyant/component-message-bus';

const UnlockDevice = ({
    id,
    params,
    datasources,
    imei,
    android,
    data,
    handleClose,
    telephoneNumber,
    profilesInfo,
    deviceUnlockOverrideReasons,
    ...props
}) => {
    const { Text } = Typography;

    const {
        modalProps,
        successStates,
        errorStates,
        allowClear = false,
        responseMapping,
        workflow,
        datasource,
    } = params;

    const unlockOverrideProfile = profilesInfo?.profiles
        .find(
            ({ name }) =>
                name === window[sessionStorage.tabId].COM_IVOYANT_VARS.profile
        )
        ?.categories.find(({ name }) => name === 'deviceUnlockOverride');

    const [visible, setVisible] = useState(true);
    const [pending, setPending] = useState(false);
    const [result, setResult] = useState(
        unlockOverrideProfile ? 'override' : 'default'
    );
    const [reasonText, setReasonText] = useState('');
    const [isTenureNotMet, setIsTenureNotMet] = useState(false);
    const [reason, setReason] = useState('Select reason for override');
    const [tenureMessage, setTenureMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState(undefined);
    const [disableUnlock, SetDisableUnlockButton] = useState(false);

    const overrideTenure = unlockOverrideProfile;

    const handleStateChange = (subscriptionId, topic, eventData) => {
        const isSuccess = successStates.includes(eventData.value);
        const isError = errorStates.includes(eventData.value);
        if (isSuccess || isError) {
            if (isSuccess) {
                const successData = eventData.event.data.data;
                setIsTenureNotMet(successData?.tenureNotMet);
                setTenureMessage(
                    successData?.tenureNotMet ? successData?.message : ''
                );
                setAlertMessage(
                    successData?.unlockCode
                        ? `${successData?.message} Unlock code is ${successData?.unlockCode}`
                        : successData?.message
                );
                setPending(false);
                setResult(
                    successData?.tenureNotMet && unlockOverrideProfile
                        ? 'override'
                        : successData?.tenureNotMet
                        ? 'error'
                        : 'success'
                );
                SetDisableUnlockButton(
                    successData?.tenureNotMet && unlockOverrideProfile
                        ? reason === 'Select reason for override'
                            ? true
                            : reason === 'Other' && !reasonText
                            ? true
                            : false
                        : false
                );
            } else if (isError) {
                setAlertMessage(eventData.event.data.message);
                setPending(false);
                setResult('error');
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const getMessage = () => {
        let alert;
        switch (result) {
            case 'success':
                alert = (
                    <Alert
                        message={alertMessage}
                        type="success"
                        showIcon
                        className="unlock-alert"
                        style={{ height: 'auto', padding: '5px' }}
                    />
                );
                break;
            case 'error':
                alert = (
                    <Alert
                        message={alertMessage}
                        type="error"
                        showIcon
                        className="unlock-alert"
                        style={{ height: 'auto', padding: '5px' }}
                    />
                );
                break;
            default:
        }
        return alert;
    };

    const onCancel = () => {
        setResult('default');
        setVisible(!visible);
        setIsTenureNotMet(false);
        setReason('Select reason for override');
        setTenureMessage('');
        setReasonText('');
        setAlertMessage('');
        setPending(false);
        SetDisableUnlockButton(false);
        handleClose(telephoneNumber);
    };

    const onSubmit = () => {
        setPending(true);

        const registrationId = workflow.concat('.').concat(telephoneNumber);

        let requestBody = {
            ctn: window[sessionStorage?.tabId].NEW_CTN,
            ban: window[sessionStorage?.tabId].NEW_BAN,
            imei: imei,
            overrideTenure: overrideTenure ? true : false,
        };

        if (overrideTenure) {
            requestBody.overrideReason = reason;
            if (reason === 'Other') {
                requestBody.overrideReasonDetails = reasonText;
            }
        }

        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleStateChange
        );

        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'INIT',
            },
        });

        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
                request: {
                    body: requestBody,
                },
                responseMapping,
            },
        });
    };

    const getFooter = () => {
        return (
            <div>
                <Button
                    key="ok"
                    onClick={onSubmit}
                    loading={pending}
                    className="ok-btn"
                    style={modalProps[result]?.okButtonStyle}
                    type="primary"
                    size="small"
                    disabled={disableUnlock}
                >
                    {modalProps[result]?.okButtonText}
                </Button>
                <Button
                    key="cancel"
                    className="cancel-btn"
                    onClick={onCancel}
                    disabled={pending}
                    style={modalProps[result]?.cancelButtonStyle}
                    size="small"
                >
                    {modalProps[result]?.cancelButtonText}
                </Button>
            </div>
        );
    };

    React.useEffect(() => {
        SetDisableUnlockButton(
            unlockOverrideProfile
                ? reason === 'Select reason for override'
                    ? true
                    : reason === 'Other' && !reasonText
                    ? true
                    : false
                : false
        );
    }, [unlockOverrideProfile]);

    return (
        <div className="expandable-row-item">
            <div>
                {unlockOverrideProfile ? (
                    <>
                        <div>
                            <Text>{tenureMessage}</Text>
                        </div>
                        <Select
                            placeholder="Select reason for override"
                            onChange={(e) => {
                                setReason(e);
                                if (e === 'Other' && reasonText === '') {
                                    SetDisableUnlockButton(true);
                                } else {
                                    SetDisableUnlockButton(false);
                                }
                            }}
                            size="small"
                            className="unlock-device-input"
                            value={reason}
                        >
                            {deviceUnlockOverrideReasons?.reasons?.map(
                                (value) => (
                                    <Option key={value}>{value}</Option>
                                )
                            )}
                        </Select>
                        {reason === 'Other' && (
                            <Input
                                onChange={(e) => {
                                    setReasonText(e.target.value);
                                    if (e.target.value) {
                                        SetDisableUnlockButton(false);
                                    } else {
                                        SetDisableUnlockButton(true);
                                    }
                                }}
                                className="unlock-device-input"
                                placeholder="Input Reason for Override"
                                size="small"
                                value={reasonText}
                                allowClear={allowClear}
                            />
                        )}
                    </>
                ) : (
                    <>
                        {result !== 'success' && (
                            <Text>
                                {android
                                    ? modalProps?.default?.android
                                    : modalProps?.default?.apple}
                            </Text>
                        )}
                    </>
                )}
            </div>
            <div>{getMessage()}</div>
            {getFooter()}
        </div>
    );
};

export default UnlockDevice;
