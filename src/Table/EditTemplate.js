import React, { useState, useEffect } from 'react';
import { Button, Steps, Typography, Input, Tooltip, Row, Col } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import jsonata from 'jsonata';
import { MessageBus } from '@ivoyant/component-message-bus';
import PropTypes from 'prop-types';
import ESimIndex from '../ESim/ESimIndex';
import './EditTemplate.css';

const { Paragraph, Text } = Typography;

const EditTemplate = ({
    telephoneData,
    config,
    data,
    datasources,
    profilesInfo,
    handleCancel,
    handleDone,
    eSIMStatusWorkflow,
    eSIMProvisionWorkflow,
    fieldName,
    eSIMEmailQRWorkflow,
    eSIMUpdateUIWorkflow,
    ...props
}) => {
    const { modal, stepper, workflow } = config;

    const otpFlow = false; // TODO

    const { size = 'small', steps, styles, profileFlowName } = stepper;
    // let steps = otpFlow ? stepper?.optSteps : stepper?.steps;
    const step1Details = steps[0];
    const step2Details = steps[1];
    const step3Details = steps[2];
    const step4Details = steps[3] ? steps[3] : null;
    const step5Details = steps[4] ? steps[4] : null;
    const [value, setValue] = useState('');
    const [formattedValue, setFormattedValue] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(step1Details?.error || '');
    const [disableValidate, setDisableValidate] = useState(true);
    const [disableValidateOtp, setDisableValidateOtp] = useState(true);
    const [validatePending, setValidatePending] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [submitPending, setSubmitPending] = useState(false);
    const [generateOtpPending, setGenerateOtpPending] = useState(false);
    const [validateOtpPending, setValidateOtpPending] = useState(false);
    const [eventData, setEventData] = useState(undefined);
    const [sqaValue, setSqaValue] = useState({ answer: '' });
    const [simType, setSimType] = useState(false);

    const isLuhn = (value) => {
        let nCheck = 0;
        let bEven = false;
        const newValue = value.replace(/\D/g, '');
        for (let n = newValue?.length - 1; n >= 0; n--) {
            const cDigit = newValue?.charAt(n);
            let nDigit = parseInt(cDigit, 10);
            if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
            nCheck += nDigit;
            bEven = !bEven;
        }
        return nCheck % 10 === 0;
    };

    const handlechange = (inputVal, formatter, maxLength) => {
        setValue(inputVal);
        setFormattedValue(jsonata(formatter).evaluate({ value: inputVal }));
        if (inputVal.length === maxLength) {
            if (!isLuhn(inputVal)) {
                setError(true);
                setDisableValidate(true);
            } else {
                setError(false);
                setDisableValidate(false);
            }
        } else {
            setDisableValidate(true);
        }
    };

    const handleOtpChange = (inputVal, maxLength) => {
        if (!Number.isNaN(Number(inputVal))) {
            setOtpValue(inputVal);
            if (inputVal.length === maxLength) {
                setError(false);
                setDisableValidateOtp(false);
            } else {
                setDisableValidateOtp(true);
            }
        }
    };

    const handleValidateOtpResponse = (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        if (eventData) {
            setEventData(eventData);
        }
    };

    const handleSqaChange = (value) => {
        setSqaValue({
            ...sqaValue,
            answer: value,
        });
        if (value?.length) {
            setDisableValidateOtp(false);
        } else {
            setDisableValidateOtp(true);
        }
    };

    const handleValidationResponse = (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        if (eventData) {
            setEventData(eventData);
        }
    };

    const handleSubmitResponse = (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        if (eventData) {
            setEventData(eventData);
        }
    };

    useEffect(() => {
        if (eventData) {
            if (stepper.value === 'IMEI' || !otpFlow) {
                const { workflowConfig } = validatePending
                    ? step1Details
                    : step2Details;
                const { successStates, errorStates } = workflowConfig;

                if (validatePending) {
                    if (successStates.includes(eventData.value)) {
                        setValidatePending(false);
                        setValidated(true);
                        setCurrentStep(currentStep + 1);
                    }

                    if (errorStates.includes(eventData.value)) {
                        setDisableValidate(!disableValidate);
                        setErrorMessage(eventData.event.data.message);
                        setValidatePending(false);
                        setError(true);
                    }
                }

                if (submitPending) {
                    if (successStates.includes(eventData.value)) {
                        setSubmitPending(false);
                        setCurrentStep(currentStep + 1);
                        //  complete(true);
                    }
                    if (errorStates.includes(eventData.value)) {
                        setErrorMessage(eventData.event.data.message);
                        setSubmitPending(false);
                        setError(true);
                    }
                }
            }
            if (stepper.value === 'SIM' && otpFlow) {
                let generateOtpConfig = step1Details;
                let validateOtpConfig = step2Details;
                let validateSimConfig = step3Details;
                let confirmSimConfig = step4Details;

                if (generateOtpPending) {
                    if (
                        generateOtpConfig?.workflowConfig?.successStates.includes(
                            eventData.value
                        )
                    ) {
                        setGenerateOtpPending(false);

                        if (!step2Details?.otpFlow) {
                            setSqaValue(eventData.event.data.data);
                        }
                        if (currentStep === 0) {
                            setCurrentStep(currentStep + 1);
                            setEventData(undefined);
                        }
                    }
                }

                if (validateOtpPending) {
                    if (
                        validateOtpConfig?.workflowConfig?.successStates.includes(
                            eventData.value
                        )
                    ) {
                        setValidateOtpPending(false);
                        setValidated(true);
                        setCurrentStep(currentStep + 1);
                        setEventData(undefined);
                    }

                    if (
                        validateOtpConfig?.workflowConfig?.errorStates.includes(
                            eventData.value
                        )
                    ) {
                        setDisableValidate(true);
                        setErrorMessage(eventData.event.data.message);
                        setValidateOtpPending(false);
                        setError(true);
                    }
                }

                if (validatePending) {
                    if (
                        validateSimConfig?.workflowConfig?.successStates.includes(
                            eventData.value
                        )
                    ) {
                        setValidatePending(false);
                        setValidated(true);
                        setCurrentStep(currentStep + 1);
                        setEventData(undefined);
                    }

                    if (
                        validateSimConfig?.workflowConfig?.errorStates.includes(
                            eventData.value
                        )
                    ) {
                        setDisableValidate(!disableValidate);
                        setErrorMessage(eventData.event.data.message);
                        setValidatePending(false);
                        setError(true);
                    }
                }

                if (submitPending) {
                    if (
                        confirmSimConfig?.workflowConfig?.successStates.includes(
                            eventData.value
                        )
                    ) {
                        setSubmitPending(false);
                        setCurrentStep(currentStep + 1);
                        //complete(true);
                        setEventData(undefined);
                    }

                    if (
                        confirmSimConfig?.workflowConfig?.errorStates.includes(
                            eventData.value
                        )
                    ) {
                        setErrorMessage(eventData.event.data.message);
                        setSubmitPending(false);
                        setError(true);
                    }
                }
            }
        }
    }, [eventData]);

    const sendEvent = (stepDetails) => {
        const { workflowConfig } = stepDetails;
        MessageBus.send(
            'WF.'.concat(workflow).concat('.').concat(workflowConfig.event),
            {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: workflowConfig.event,
                },
                body: {
                    datasource: datasources[workflowConfig.datasource],
                    request: { value, otpValue, data, sqaValue },
                    requestMapping: workflowConfig.requestMapping,
                    responseMapping: workflowConfig.responseMapping,
                },
            }
        );
    };

    useEffect(() => {
        if (generateOtpPending) {
            setErrorMessage('');
            setError(false);
            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.subscribe(
                workflow,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleValidateOtpResponse
            );
            sendEvent(step1Details);
        }
        return () => {
            MessageBus.unsubscribe('WF.'.concat(workflow));
        };
    }, [generateOtpPending]);

    useEffect(() => {
        if (validateOtpPending) {
            setErrorMessage('');
            setError(false);
            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.subscribe(
                workflow,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleValidateOtpResponse
            );
            sendEvent(step2Details);
        }
        return () => {
            MessageBus.unsubscribe('WF.'.concat(workflow));
        };
    }, [validateOtpPending]);

    useEffect(() => {
        return () => {
            MessageBus.unsubscribe('WF.'.concat(workflow));
        };
    }, []);

    useEffect(() => {
        if (validatePending) {
            setErrorMessage('');
            setError(false);
            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.subscribe(
                workflow,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleValidationResponse
            );
            if (stepper.value === 'IMEI' || !otpFlow) {
                sendEvent(step1Details);
            } else if (stepper.value === 'SIM') {
                sendEvent(step3Details);
            }
        }
        return () => {
            MessageBus.unsubscribe('WF.'.concat(workflow));
        };
    }, [validatePending]);

    useEffect(() => {
        if (submitPending) {
            setErrorMessage('');
            setError(false);
            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.subscribe(
                workflow,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleSubmitResponse
            );

            if (stepper.value === 'IMEI' || !otpFlow) {
                sendEvent(step2Details);
            } else if (stepper.value === 'SIM') {
                sendEvent(step4Details);
            }
        }
        return () => {
            MessageBus.unsubscribe('WF.'.concat(workflow));
        };
    }, [submitPending]);

    useEffect(() => {
        return () => {
            MessageBus.unsubscribe(workflow);
        };
    }, []);
    useEffect(() => {
        if (telephoneData?.eSimCompatibleDevice) {
            setSimType(true);
        }
    }, [telephoneData]);

    return stepper.value === 'IMEI' || !otpFlow ? (
        <>
            <div className="expandable-row-item">
                <div>
                    <div>
                        <Row justify="start" gutter={[0, 4]}>
                            {simType && fieldName.edit === 'changeSIM' ? (
                                <ESimIndex
                                    setSimType={setSimType}
                                    telephoneData={telephoneData}
                                    eSIMStatusWorkflow={eSIMStatusWorkflow}
                                    eSIMProvisionWorkflow={
                                        eSIMProvisionWorkflow
                                    }
                                    eSIMEmailQRWorkflow={eSIMEmailQRWorkflow}
                                    datasources={datasources}
                                    handleCancel={handleCancel}
                                    eSIMUpdateUIWorkflow={eSIMUpdateUIWorkflow}
                                />
                            ) : (
                                <Col span={9}>
                                    <Input
                                        className="value-input"
                                        disabled={currentStep !== 0}
                                        type="text"
                                        placeholder={step1Details?.placeholder}
                                        value={formattedValue}
                                        maxLength={
                                            step1Details?.maxLength[0] +
                                            Number.parseInt(
                                                step1Details?.maxLength[0] /
                                                    step1Details?.maxLength[1],
                                                10
                                            ) -
                                            (step1Details?.maxLength[0] %
                                                step1Details?.maxLength[1] ===
                                            0
                                                ? 1
                                                : 0)
                                        }
                                        suffix={
                                            validated && (
                                                <Tooltip title="Validated">
                                                    <CheckCircleOutlined
                                                        style={{
                                                            color: '#52C41A',
                                                        }}
                                                    />
                                                </Tooltip>
                                            )
                                        }
                                        onChange={(e) =>
                                            handlechange(
                                                jsonata(
                                                    step1Details?.eventValExpr
                                                ).evaluate({
                                                    value: e.target.value,
                                                }),
                                                step1Details?.formatter,
                                                step1Details?.maxLength[0]
                                            )
                                        }
                                        onPaste={(e) => {
                                            e.target.value = e.clipboardData
                                                .getData('Text')
                                                .replace(/\s+/g, '')
                                                .slice(
                                                    0,
                                                    step1Details?.maxLength[0]
                                                );
                                            handlechange(
                                                e.target.value,
                                                step1Details?.formatter,
                                                step1Details?.maxLength[0]
                                            );
                                        }}
                                        size="small"
                                    />
                                    <div>
                                        {!validated && (
                                            <span>
                                                <Button
                                                    size="small"
                                                    className="validatebtn"
                                                    style={
                                                        disableValidate
                                                            ? {
                                                                  backgroundColor:
                                                                      '#BEC8C8',
                                                                  color:
                                                                      '#ffff',
                                                              }
                                                            : {
                                                                  backgroundColor:
                                                                      '#52C41A',
                                                                  color:
                                                                      '#ffff',
                                                              }
                                                    }
                                                    disabled={disableValidate}
                                                    loading={validatePending}
                                                    onClick={() => {
                                                        setValidatePending(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Validate
                                                </Button>
                                                <Button
                                                    size="small"
                                                    className="cancel-button"
                                                    onClick={() => {
                                                        handleCancel(workflow);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </span>
                                        )}
                                    </div>
                                </Col>
                            )}

                            <Col span={24} className="text-center">
                                {error === true && currentStep === 0 ? (
                                    <div>
                                        <Text type="danger">
                                            {errorMessage}
                                        </Text>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </Col>
                        </Row>
                    </div>
                    {validated && currentStep !== 2 && (
                        <>
                            {!error && (
                                <div style={{ display: 'flex' }}>
                                    <Paragraph
                                        style={{
                                            color: '#52C41A',
                                            margin: '5px 10px 0px 0px',
                                        }}
                                    >
                                        {jsonata(
                                            step2Details?.confirmExpr
                                        ).evaluate({ value: formattedValue })}
                                    </Paragraph>
                                    <Button
                                        className="change-btn"
                                        size="small"
                                        style={{
                                            backgroundColor: '#52C41A',
                                            color: '#ffff',
                                        }}
                                        onClick={() => setSubmitPending(true)}
                                        loading={submitPending}
                                    >
                                        Change {stepper.value}
                                    </Button>
                                    <Button
                                        className="cancel-button"
                                        size="small"
                                        onClick={() => {
                                            handleCancel(workflow);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {error && (
                                <div style={{ display: 'flex' }}>
                                    <Paragraph
                                        type="danger"
                                        style={{ margin: '5px 10px 0px 0px' }}
                                    >
                                        {errorMessage}
                                    </Paragraph>

                                    <Button
                                        className="cancel-button"
                                        size="small"
                                        onClick={() => {
                                            handleCancel(workflow);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <span
                                style={{
                                    color: '#52C41A',
                                    margin: '5px 10px 5px 0px',
                                }}
                            >
                                {step3Details?.description}
                            </span>
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => {
                                    handleDone();
                                }}
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    ) : (
        <>
            <div className="expandable-row-item">
                <div>
                    <div style={{ display: 'flex' }}>
                        <Button type="primary">Generate OTP</Button>
                        <Input maxLength={6} style={{ textAlign: 'center' }} />
                    </div>
                    <div>
                        <Input maxLength={15} style={{ textAlign: 'center' }} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditTemplate;

EditTemplate.propTypes = {
    /** config */
    config: PropTypes.object,
    /** data  passed*/
    data: PropTypes.object,
    /** Datasource passed */
    datasources: PropTypes.object,
    /** profilesInfo passed */
    profilesInfo: PropTypes.object,
    /** Function to cancel the process*/
    handleCancel: PropTypes.func,
    /** Function to complete the process after done */
    handleDone: PropTypes.func,
};
