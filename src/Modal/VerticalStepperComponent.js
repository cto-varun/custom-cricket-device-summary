import React, { useState, useEffect } from 'react';
import { Button, Steps, Typography, Input, Row, Col } from 'antd';
import jsonata from 'jsonata';
import { MessageBus } from '@ivoyant/component-message-bus';

import './styles/VerticalStepperComponent.css';

const { Step } = Steps;
const { Paragraph, Text } = Typography;

function VerticalStepperComponent({
    stepper,
    workflow,
    otpFlow,
    data,
    datasources,
    complete,
    profilesInfo,
    ...props
}) {
    const { size = 'small', steps, styles, profileFlowName } = stepper;
    // let steps = otpFlow ? stepper?.optSteps : stepper?.steps;
    const statusReasonCode = data?.subscriberInfo?.statusReasonCode;
    const resourceStatusReason =
        data?.subscriberInfo?.deviceDetails?.currentDevice
            ?.resourceStatusReason;
    const lostOrStolen =
        statusReasonCode === 'ST' ||
        statusReasonCode === 'TO' ||
        resourceStatusReason === 'LOST' ||
        resourceStatusReason === 'STOLEN';
    const suspendedLostOrStolen = false;
    // data?.subscriberInfo?.status === 'S' &&
    // (statusReasonCode === 'ST' || statusReasonCode === 'TO');
    const alternateFlow = false;
    // lostOrStolen && stepper.value === 'SIM';
    const step1Details = alternateFlow ? steps[0]?.alternateFlow : steps[0];
    const step2Details = alternateFlow ? steps[1]?.alternateFlow : steps[1];
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

    const step1Error = () => {
        return error === true && currentStep === 0;
    };

    const handlechange = (inputVal, formatter, maxLength) => {
        if (!Number.isNaN(Number(inputVal))) {
            setValue(inputVal);
            setFormattedValue(jsonata(formatter).evaluate({ value: inputVal }));
            if (inputVal.length === maxLength) {
                if (!isLuhn(inputVal)) {
                    setError(true);
                } else {
                    setError(false);
                    setDisableValidate(!disableValidate);
                }
            }
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
                        complete(true);
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
                        complete(true);
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

    // Below is a temporary solution since the original component was hardcoded. This should be changed
    // to use a component mapping function like mapComponents in App.js
    return stepper.value === 'IMEI' || !otpFlow ? (
        <Steps
            direction="vertical"
            size={size}
            current={currentStep}
            className="imei-stepper"
        >
            <Step
                disabled
                key="1"
                title={
                    <div className={styles.stepDiv}>
                        <Paragraph className={styles.stepTitle}>
                            {step1Details?.title}
                        </Paragraph>
                        <Text
                            disabled
                            onClick={
                                currentStep > 0
                                    ? () => {
                                          setCurrentStep(0);
                                      }
                                    : null
                            }
                        >
                            STEP 1
                        </Text>
                    </div>
                }
                description={
                    <Row type="flex" align-items="center">
                        <Col span={24}>
                            {validated === false ? (
                                <Row
                                    justify="start"
                                    gutter={[0, 4]}
                                    className="stepper-step-description-container"
                                >
                                    <Col span={9}>
                                        <Input
                                            type="text"
                                            placeholder={
                                                step1Details?.placeholder
                                            }
                                            value={formattedValue}
                                            className={step1Error() && 'error'}
                                            maxLength={
                                                step1Details?.maxLength[0] +
                                                Number.parseInt(
                                                    step1Details?.maxLength[0] /
                                                        step1Details
                                                            ?.maxLength[1],
                                                    10
                                                ) -
                                                (step1Details?.maxLength[0] %
                                                    step1Details
                                                        ?.maxLength[1] ===
                                                0
                                                    ? 1
                                                    : 0)
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
                                            size="small"
                                        />
                                    </Col>
                                    <Col>
                                        <Button
                                            size="small"
                                            disabled={disableValidate}
                                            loading={validatePending}
                                            className="validate-btn"
                                            onClick={() => {
                                                setValidatePending(true);
                                            }}
                                        >
                                            VALIDATE
                                        </Button>
                                    </Col>
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
                            ) : (
                                <></>
                            )}

                            {currentStep > 0 ? (
                                <div>
                                    <Text type="success">{formattedValue}</Text>
                                </div>
                            ) : (
                                <></>
                            )}
                        </Col>
                    </Row>
                }
            />
            <Step
                key="2"
                title={
                    <div className={styles.stepDiv}>
                        <Paragraph className={styles.stepTitle}>
                            {step2Details?.title}
                        </Paragraph>
                        <Text disabled>STEP 2</Text>
                    </div>
                }
                description={
                    // eslint-disable-next-line no-nested-ternary
                    currentStep === 1 ? (
                        <div className="stepper-step-description-container">
                            <div>
                                <Paragraph>
                                    {jsonata(
                                        step2Details?.confirmExpr
                                    ).evaluate({ value: formattedValue })}
                                </Paragraph>
                                <Button
                                    className="confirm-btn"
                                    onClick={() => setSubmitPending(true)}
                                >
                                    CONFIRM
                                </Button>
                            </div>
                        </div>
                    ) : currentStep > 1 ? (
                        <Text type="success"> {step2Details?.success}</Text>
                    ) : (
                        <></>
                    )
                }
                disabled
            />

            <Step
                key="3"
                title={
                    <div className={styles.stepDiv}>
                        <Paragraph className={styles.stepTitle}>
                            {step3Details.title}
                        </Paragraph>
                        <Text disabled>STEP 3</Text>
                    </div>
                }
                description={
                    currentStep === 2 ? (
                        <div className="stepper-step-description-container">
                            <Paragraph>{step3Details.description}</Paragraph>
                            <Text>New {step3Details.equipmentType}:</Text>
                            <Text
                                type="success"
                                style={{ paddingRight: '20px' }}
                            >
                                {' '}
                                {formattedValue}
                            </Text>
                            <Text> Old {step3Details.equipmentType}:</Text>
                            <Text style={{ fontWeight: '500', color: 'black' }}>
                                {' '}
                                {jsonata(
                                    step3Details.oldEquipmentExpr
                                ).evaluate(data)}
                            </Text>
                        </div>
                    ) : (
                        <></>
                    )
                }
                disabled
            />
        </Steps>
    ) : (
        <Steps
            direction="vertical"
            size={size}
            current={currentStep}
            className="imei-stepper"
        >
            <Step
                key="0"
                title={
                    <div className={styles.stepDiv}>
                        <Paragraph className={styles.stepTitle}>
                            {suspendedLostOrStolen
                                ? 'Action required'
                                : step1Details?.title}
                        </Paragraph>
                        <Text disabled>STEP 1</Text>
                    </div>
                }
                description={
                    // eslint-disable-next-line no-nested-ternary
                    suspendedLostOrStolen ? (
                        <>
                            {' '}
                            This line is suspended for lost or stolen. To change
                            the Sim you will need to unsuspend the line and then
                            try again.{' '}
                        </>
                    ) : currentStep === 0 ? (
                        <div className="stepper-step-description-container">
                            <div>
                                <Paragraph>
                                    {jsonata(
                                        step1Details?.confirmExpr
                                    ).evaluate({ value: formattedValue })}
                                </Paragraph>
                                <Button
                                    className="confirm-btn"
                                    onClick={() => setGenerateOtpPending(true)}
                                >
                                    {step1Details?.title}
                                </Button>
                                {profilesInfo?.profiles
                                    .find(
                                        (item) =>
                                            item.name ===
                                            window[sessionStorage.tabId]
                                                .COM_IVOYANT_VARS.profile
                                    )
                                    ?.categories.find(
                                        (item) => item.name === 'otpBypass'
                                    )
                                    ?.flows.includes(profileFlowName) && (
                                    <Button
                                        className="confirm-btn"
                                        onClick={() => setCurrentStep(2)}
                                    >
                                        Bypass Flow
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Text type="success"> {step1Details?.success}</Text>
                    )
                }
                disabled
            />
            <Step
                disabled
                key="1"
                title={
                    <div className={styles.stepDiv}>
                        <Paragraph className={styles.stepTitle}>
                            {step2Details?.title}
                        </Paragraph>
                        <Text
                            disabled
                            onClick={
                                currentStep > 0
                                    ? () => {
                                          setCurrentStep(0);
                                      }
                                    : null
                            }
                        >
                            STEP 2
                        </Text>
                    </div>
                }
                description={
                    currentStep >= 1 ? (
                        <Row type="flex" align-items="center">
                            <Col span={24}>
                                {currentStep === 1 ? (
                                    <Row
                                        justify="start"
                                        gutter={[0, 4]}
                                        className="stepper-step-description-container"
                                    >
                                        <Col span={16}>
                                            {step2Details?.otpFlow ? (
                                                <>
                                                    <Button
                                                        className="confirm-btn"
                                                        onClick={() =>
                                                            setGenerateOtpPending(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        RESEND OTP
                                                    </Button>
                                                    <Input
                                                        type="text"
                                                        placeholder={
                                                            step2Details?.placeholder
                                                        }
                                                        value={
                                                            step2Details?.otpFlow
                                                                ? otpValue
                                                                : sqaValue?.answe ||
                                                                  ''
                                                        }
                                                        className={
                                                            step1Error() &&
                                                            'error'
                                                        }
                                                        maxLength={
                                                            step2Details
                                                                ?.maxLength[0]
                                                        }
                                                        onChange={(e) => {
                                                            if (
                                                                step2Details?.otpFlow
                                                            ) {
                                                                handleOtpChange(
                                                                    jsonata(
                                                                        step2Details?.eventValExpr
                                                                    ).evaluate({
                                                                        value:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                    step2Details
                                                                        ?.maxLength[0]
                                                                );
                                                            } else {
                                                                setSqaValue({
                                                                    ...sqaValue,
                                                                    answer:
                                                                        e.target
                                                                            .value,
                                                                });
                                                            }
                                                        }}
                                                        size="small"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        {sqaValue?.question}
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        placeholder={
                                                            step2Details?.placeholder
                                                        }
                                                        value={
                                                            sqaValue?.answer ||
                                                            ''
                                                        }
                                                        className={
                                                            step1Error() &&
                                                            'error'
                                                        }
                                                        onChange={(e) =>
                                                            handleSqaChange(
                                                                e.target.value
                                                            )
                                                        }
                                                        size="small"
                                                    />
                                                </>
                                            )}
                                        </Col>
                                        <Col>
                                            <Button
                                                size="small"
                                                disabled={disableValidateOtp}
                                                loading={validateOtpPending}
                                                className={`validate-btn ${
                                                    step2Details?.otpFlow
                                                        ? 'validate-otp'
                                                        : 'validate-customer'
                                                }`}
                                                onClick={() => {
                                                    setValidateOtpPending(true);
                                                }}
                                            >
                                                VALIDATE
                                            </Button>
                                        </Col>
                                        <Col span={16} className="text-center">
                                            {error === true &&
                                            currentStep === 1 ? (
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
                                ) : (
                                    <></>
                                )}
                                {currentStep > 1 ? (
                                    <div>
                                        <Text type="success">
                                            {step2Details?.success}
                                        </Text>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )
                }
            />
            <Step
                disabled
                key="2"
                title={
                    <div className={styles.stepDiv}>
                        <Paragraph className={styles.stepTitle}>
                            {step3Details.title}
                        </Paragraph>
                        <Text
                            disabled
                            onClick={
                                currentStep > 0
                                    ? () => {
                                          setCurrentStep(0);
                                      }
                                    : null
                            }
                        >
                            STEP 3
                        </Text>
                    </div>
                }
                description={
                    <Row type="flex" align-items="center">
                        {currentStep >= 2 ? (
                            <Col span={24}>
                                {currentStep === 2 ? (
                                    <Row
                                        justify="start"
                                        gutter={[0, 4]}
                                        className="stepper-step-description-container"
                                    >
                                        <Col span={9}>
                                            <Input
                                                type="text"
                                                placeholder={
                                                    step3Details.placeholder
                                                }
                                                value={formattedValue}
                                                className={
                                                    step1Error() && 'error'
                                                }
                                                maxLength={
                                                    step3Details.maxLength[0] +
                                                    Number.parseInt(
                                                        step3Details
                                                            .maxLength[0] /
                                                            step3Details
                                                                .maxLength[1],
                                                        10
                                                    ) -
                                                    (step3Details.maxLength[0] %
                                                        step3Details
                                                            .maxLength[1] ===
                                                    0
                                                        ? 1
                                                        : 0)
                                                }
                                                onChange={(e) =>
                                                    handlechange(
                                                        jsonata(
                                                            step3Details?.eventValExpr
                                                        ).evaluate({
                                                            value:
                                                                e.target.value,
                                                        }),
                                                        step3Details?.formatter,
                                                        step3Details
                                                            .maxLength[0]
                                                    )
                                                }
                                                size="small"
                                            />
                                        </Col>
                                        <Col>
                                            <Button
                                                size="small"
                                                disabled={disableValidate}
                                                loading={validatePending}
                                                className="validate-btn"
                                                onClick={() => {
                                                    setValidatePending(true);
                                                }}
                                            >
                                                VALIDATE
                                            </Button>
                                        </Col>
                                        <Col span={16} className="text-center">
                                            {error === true &&
                                            currentStep === 2 ? (
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
                                ) : (
                                    <></>
                                )}

                                {currentStep > 2 ? (
                                    <div>
                                        <Text type="success">
                                            {formattedValue}
                                        </Text>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </Col>
                        ) : (
                            <></>
                        )}
                    </Row>
                }
            />
            <Step
                key="3"
                title={
                    <div className={styles.stepDiv}>
                        <Paragraph className={styles.stepTitle}>
                            {step4Details.title}
                        </Paragraph>
                        <Text disabled>STEP 4</Text>
                    </div>
                }
                description={
                    // eslint-disable-next-line no-nested-ternary
                    currentStep === 3 ? (
                        <div className="stepper-step-description-container">
                            <div>
                                <Paragraph>
                                    {jsonata(
                                        step4Details.confirmExpr
                                    ).evaluate({ value: formattedValue })}
                                </Paragraph>
                                <Button
                                    className="confirm-btn"
                                    onClick={() => setSubmitPending(true)}
                                >
                                    CONFIRM
                                </Button>
                            </div>
                        </div>
                    ) : currentStep > 3 ? (
                        <Text type="success"> {step4Details.success}</Text>
                    ) : (
                        <></>
                    )
                }
                disabled
            />

            <Step
                key="4"
                title={
                    <div className={styles.stepDiv}>
                        <Paragraph className={styles.stepTitle}>
                            {step5Details.title}
                        </Paragraph>
                        <Text disabled>STEP 5</Text>
                    </div>
                }
                description={
                    currentStep === 4 ? (
                        <div className="stepper-step-description-container">
                            <Paragraph>{step5Details.description}</Paragraph>
                            <Text>New {step5Details.equipmentType}:</Text>
                            <Text
                                type="success"
                                style={{ paddingRight: '20px' }}
                            >
                                {' '}
                                {formattedValue}
                            </Text>
                            <Text> Old {step5Details.equipmentType}:</Text>
                            <Text style={{ fontWeight: '500', color: 'black' }}>
                                {' '}
                                {jsonata(
                                    step5Details.oldEquipmentExpr
                                ).evaluate(data)}
                            </Text>
                        </div>
                    ) : (
                        <></>
                    )
                }
                disabled
            />
        </Steps>
    );
}
export default VerticalStepperComponent;
