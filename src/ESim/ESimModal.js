import React, { useEffect, useState } from 'react';
import { Modal, Steps, Button, message, Alert, Tooltip } from 'antd';
import StepComponent from './StepComponent';
import { MessageBus } from '@ivoyant/component-message-bus';
import { cache } from '@ivoyant/component-cache';
import 'antd/dist/reset.css';
import ESimPopUp from '@ivoyant/custom-cricket-pop-up';

const { Step } = Steps;

const ESimModal = ({
    setSimType,
    telephoneData,
    eSIMStatusWorkflow,
    eSIMProvisionWorkflow,
    eSIMEmailQRWorkflow,
    datasources,
    handleCancel,
    eSIMUpdateUIWorkflow,
}) => {
    const [statusStep, setStatusStep] = useState(undefined);
    const [eSimData, setESimData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isConcernModalVisible, setIsConcernModalVisible] = useState(false);
    const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
    const [current, setCurrent] = useState(0);
    const [provisionLoading, setProvisionLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [eSIMErrMsg, setESIMErrMsg] = useState(null);
    const [eSIMNetworkStatus, setESIMNetworkStatus] = useState(null);
    const [emailResponseLoading, setEmailResponseLoading] = useState(false);
    const [resetEmailResponse, setResetEmailResponse] = useState(false);
    const [confirmationESimPopUp, setConfirmationESimPopUp] = useState(false);
    const [contentConfirmationModal, setContentConfirmationModal] = useState({
            title: 'Confirmation E-Sim',
            content: 'Are you sure you want to create an E-Sim profile for this customer. Doing so could burn their physical sim (Sim Swap) and charge the customer for a new E-Sim.',
            clickFrom: 'payment'
        });

    //Profile states
    const {
        workflow: esimStatusWorkflow,
        datasource: esimStatusDatasource,
        responseMapping: esimStatusResponseMapping,
        successStates: esimStatusSuccessStates,
        errorStates: esimStatusErrorStates,
    } = eSIMStatusWorkflow;

    const {
        workflow: provisionWorkflow,
        datasource: provisionDatasource,
        responseMapping: provisionResponseMapping,
        successStates: provisionSuccessStates,
        errorStates: provisionErrorStates,
    } = eSIMProvisionWorkflow;
    const {
        workflow: updateEsimUIWorkflow,
        datasource: updateEsimUIDatasource,
        responseMapping: updateEsimUIResponseMapping,
        successStates: updateEsimUISuccessStates,
        errorStates: updateEsimUIErrorStates,
    } = eSIMUpdateUIWorkflow;

    const updateOnClose = (ctn) => {
        const registrationId = updateEsimUIWorkflow.concat('.').concat(ctn);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(updateEsimUIWorkflow).concat('.STATE.CHANGE'),
            handleEsimUpdateUIResponse
        );
        MessageBus.send('WF.'.concat(updateEsimUIWorkflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: updateEsimUIWorkflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(updateEsimUIWorkflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: updateEsimUIWorkflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[updateEsimUIDatasource],
                request: {
                    params: { accountId: ctn },
                },
                updateEsimUIResponseMapping,
            },
        });
    };

    const getESIMStatus = (ctn) => {
        setStatusLoading(true);
        const registrationId = esimStatusWorkflow.concat('.').concat(ctn);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(esimStatusWorkflow).concat('.STATE.CHANGE'),
            handleESIMStatusResponse(ctn)
        );
        MessageBus.send('WF.'.concat(esimStatusWorkflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: esimStatusWorkflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(esimStatusWorkflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: esimStatusWorkflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[esimStatusDatasource],
                request: {
                    params: { ctn: ctn },
                },
                esimStatusResponseMapping,
            },
        });
    };

    const getESIMProvision = (ctn) => {
        setProvisionLoading(true);
        const registrationId = provisionWorkflow?.concat('.').concat(ctn);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(provisionWorkflow).concat('.STATE.CHANGE'),
            handleESIMProvisionResponse(ctn)
        );
        MessageBus.send('WF.'.concat(provisionWorkflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: provisionWorkflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(provisionWorkflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: provisionWorkflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[provisionDatasource],
                request: {
                    params: { ctn: ctn },
                },
                provisionResponseMapping,
            },
        });
    };

    const handleESIMStatusResponse = (number) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData?.value;
        const isSuccess = esimStatusSuccessStates?.includes(status);
        const isFailure = esimStatusErrorStates?.includes(status);

        if (isSuccess || isFailure) {
            if (isSuccess) {
                const response = JSON.parse(
                    eventData?.event?.data?.request?.response
                );

                setStatusStep(
                    eventData?.event?.data?.data?.profileState
                        ?.replace(/ /g, '')
                        ?.toLowerCase()
                );
                setESimData(eventData?.event?.data?.data);
                setESIMNetworkStatus(
                    eventData?.event?.data?.data?.networkProvisioningStatus
                        ?.provisioningStatusDescription ||
                        'Not available at this moment'
                );
                setIsModalVisible(true);
                cache.put('eSimCacheData', eventData?.event?.data?.data);
                setESIMErrMsg(false);
            }

            if (isFailure) {
                setESIMErrMsg(
                    eventData?.event?.data?.response?.data?.message ||
                        eventData?.event?.data?.response?.data?.error
                            ?.causedBy[0]?.message
                );
            }
            setStatusLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const handleESIMProvisionResponse = (number) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData?.value;
        const isSuccess = provisionSuccessStates?.includes(status);
        const isFailure = provisionErrorStates?.includes(status);

        if (isSuccess || isFailure) {
            if (isSuccess) {
                const response = JSON.parse(
                    eventData?.event?.data?.request?.response
                );

                setStatusStep(
                    eventData?.event?.data?.data?.profileState
                        ?.replace(/ /g, '')
                        ?.toLowerCase()
                );
                setESimData(eventData?.event?.data?.data);
                setESIMNetworkStatus(
                    eventData?.event?.data?.data?.networkProvisioningStatus
                        ?.provisioningStatusDescription ||
                        'Not available at this moment'
                );
                setIsModalVisible(true);
                cache.put('eSimCacheData', eventData?.event?.data?.data);
                setESIMErrMsg(false);
            }

            if (isFailure) {
                setESIMErrMsg(eventData?.event?.data?.response?.data?.message);
            }
            setResetEmailResponse(true);
            setProvisionLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const handleEsimUpdateUIResponse = (number) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData?.value;
        const isSuccess = updateEsimUISuccessStates?.includes(status);
        const isFailure = updateEsimUIErrorStates?.includes(status);

        if (isSuccess || isFailure) {
            if (isSuccess) {
            }

            if (isFailure) {
            }

            MessageBus.unsubscribe(subscriptionId);
        }
    };

    // show steps modal or main esim modal
    const showStepsModal = () => {
        let esimProfileStep = telephoneData?.eSimCurrentStatus
            ?.replace(/ /g, '')
            ?.toLowerCase();
        if (esimProfileStep === 'deleted' || esimProfileStep === 'unusable') {
            setIsConcernModalVisible(true);
        } else if (
            esimProfileStep === 'reserved' ||
            esimProfileStep === 'readytoinstall' ||
            esimProfileStep === 'downloaded' ||
            esimProfileStep === 'disabled'
        ) {
            getESIMStatus(telephoneData?.telephoneNumber);
        } else {
            //getESIMProvision(telephoneData?.telephoneNumber);
            setConfirmationESimPopUp(true)
        }
    };

    // cancel and restart functionality
    const handleCancelandRestart = () => {
        setIsConcernModalVisible(true);
    };

    //ok functionality of steps modal
    const handleStepsOk = () => {
        setIsModalVisible(false);
    };

    //ok functionality of concern modal
    const handleConernOk = () => {
        setIsConcernModalVisible(false);
        getESIMProvision(telephoneData?.telephoneNumber);
    };

    //cancel functionality of main esim modal with steps
    const handleStepsCancel = () => {
        let esimProfileStep = eSimData?.profileState
            ?.replace(/ /g, '')
            ?.toLowerCase();

        if (esimProfileStep === 'installed') {
            setIsModalVisible(false);
            setSimType(false);
            handleCancel('CHANGESIM');
            updateOnClose(telephoneData.telephoneNumber);
        } else {
            setIsCloseModalVisible(true);
        }
    };

    //ok functionality of close modal
    const handleCloseOk = () => {
        setIsCloseModalVisible(false);
        setIsModalVisible(false);
        setSimType(false);
        handleCancel('CHANGESIM');
        updateOnClose(telephoneData.telephoneNumber);
    };

    //cancel functionality of close modal(when CLOSE is pressed)
    const handleCloseCancel = () => {
        setIsCloseModalVisible(false);
    };

    //cancel functionality of concern modal
    const handleConernCancel = () => {
        setIsConcernModalVisible(false);
    };

    //enable physycal sim flow
    const showPhysicalSim = () => {
        setSimType(false);
    };

    const ESimTitle = () => {
        return (
            <div className="ESimTitle">
                <div className="d-flex">
                    <h5> Download eSim Profile</h5>
                    <span className="mg-x-16">|</span>
                    <h5>
                        <span>CTN</span>
                        {telephoneData?.telephoneNumber}
                    </h5>
                </div>
                <div className="pd-x-24">
                    <h5>
                        <span>IMEI</span>
                        {telephoneData?.imei}
                    </h5>
                </div>
            </div>
        );
    };

    const ESimFooter = () => {
        let esimProfileStep = eSimData?.profileState
            ?.replace(/ /g, '')
            ?.toLowerCase();
        return (
            <div className="ESimTitle">
                <div className="d-flex">
                    <p>
                        Network Status:{' '}
                        {eSIMNetworkStatus && (
                            <span style={{ color: '#389E0D' }}>
                                {eSIMNetworkStatus}
                            </span>
                        )}
                    </p>
                </div>
                <div>
                    {esimProfileStep === 'installed' ? (
                        <></>
                    ) : (
                        <Button
                            onClick={() =>
                                handleCancelandRestart(
                                    telephoneData?.telephoneNumber
                                )
                            }
                            loading={provisionLoading}
                            disabled={emailResponseLoading}
                            className="ghost-primary-btn"
                        >
                            CANCEL & RESTART
                        </Button>
                    )}
                    {esimProfileStep === 'installed' ? (
                        <></>
                    ) : (
                        <Button
                            type="primary"
                            onClick={() =>
                                getESIMStatus(telephoneData?.telephoneNumber)
                            }
                            loading={statusLoading}
                            disabled={emailResponseLoading}
                        >
                            REFRESH STATUS
                        </Button>
                    )}

                    <Button onClick={() => handleStepsCancel()}>CLOSE</Button>
                </div>
            </div>
        );
    };

    const steps = [
        {
            content: StepComponent({
                showInput: false,
                showRecommendation: true,
                eSIMEmailQRWorkflow,
                eSimData,
                emailResponseLoading,
                setEmailResponseLoading,
            }),
        },
        {
            content: StepComponent({
                showInput: true,
                showRecommendation: true,
                eSIMEmailQRWorkflow,
                datasources,
                eSimData,
                emailResponseLoading,
                setEmailResponseLoading,
                resetEmailResponse,
                setResetEmailResponse,
            }),
        },
        {
            content: StepComponent({
                showInput: false,
                showRecommendation: true,
                eSIMEmailQRWorkflow,
                datasources,
                eSimData,
                emailResponseLoading,
                setEmailResponseLoading,
            }),
        },
        {
            content: StepComponent({
                showInput: false,
                showRecommendation: true,
                eSIMEmailQRWorkflow,
                datasources,
                eSimData,
                emailResponseLoading,
                setEmailResponseLoading,
            }),
        },
    ];

    //USEEFFECTS

    //useEffect to populate the stpes to UI
    useEffect(() => {
        if (statusStep === 'deleted') {
            setStatusStep('deleted');
        } else if (statusStep === 'disabled') {
            setStatusStep('disabled');
        } else if (statusStep === 'unusable') {
            setStatusStep('unusable');
        } else if (
            statusStep === 'reserved' ||
            statusStep === 'readytoinstall' ||
            statusStep === 'installed' ||
            statusStep === 'downloaded'
        ) {
            setStatusStep('installed');
        }
    }, [statusStep]);

    //useEffect to set the current step
    //
    useEffect(() => {
        let esimProfileStep = eSimData?.profileState
            ?.replace(/ /g, '')
            ?.toLowerCase();
        if (esimProfileStep === 'reserved') {
            setCurrent(0);
        }
        if (esimProfileStep === 'readytoinstall') {
            setCurrent(1);
        } else if (esimProfileStep === 'downloaded') {
            setCurrent(2);
        } else if (
            esimProfileStep === 'installed' ||
            esimProfileStep === 'disabled' ||
            esimProfileStep === 'deleted' ||
            esimProfileStep === 'unusable'
        ) {
            setCurrent(3);
        }
    }, [eSimData]);

    return (
        <>
            {telephoneData?.eSimCurrentStatus
                ?.replace(/ /g, '')
                ?.toLowerCase() === 'reserved' ||
            telephoneData?.eSimCurrentStatus
                ?.replace(/ /g, '')
                ?.toLowerCase() === 'readytoinstall' ||
            telephoneData?.eSimCurrentStatus
                ?.replace(/ /g, '')
                ?.toLowerCase() === 'downloaded' ||
            telephoneData?.eSimCurrentStatus
                ?.replace(/ /g, '')
                ?.toLowerCase() === 'disabled' ? (
                <Tooltip
                    title={
                        telephoneData?.enableESimAcount
                            ? telephoneData?.enableEsim
                                ? null
                                : telephoneData?.eSimReasons
                            : telephoneData?.eSimAcountReasons
                    }
                >
                    <Button
                        onClick={showStepsModal}
                        loading={statusLoading}
                        style={{ marginRight: '4px' }}
                        disabled={
                            telephoneData?.enableESimAcount
                                ? !telephoneData?.enableEsim
                                : !telephoneData?.enableESimAcount
                        }
                    >
                        View eSIM Status
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip
                    title={
                        telephoneData?.enableESimAcount
                            ? telephoneData?.enableEsim
                                ? null
                                : telephoneData?.eSimReasons
                            : telephoneData?.eSimAcountReasons
                    }
                >
                    <Button
                        onClick={showStepsModal}
                        loading={provisionLoading}
                        style={{ marginRight: '4px' }}
                        disabled={
                            telephoneData?.enableESimAcount
                                ? !telephoneData?.enableEsim
                                : !telephoneData?.enableESimAcount
                        }
                    >
                        eSIM
                    </Button>
                </Tooltip>
            )}

            <Button type="primary" onClick={showPhysicalSim}>
                Physical SIM
            </Button>
            <div>
                {eSIMErrMsg && (
                    <Alert
                        message={eSIMErrMsg}
                        type="error"
                        showIcon
                        style={{
                            border: 0,
                            padding: '6px',
                            marginTop: '8px',
                        }}
                    />
                )}
            </div>
            <Modal
                title="Are you sure you want to provision a new eSIM?"
                open={isConcernModalVisible}
                onOk={handleConernOk}
                onCancel={handleConernCancel}
                zIndex={1002}
            >
                <p>
                    This will cancel the current request and request a new E-Sim
                    profile, do you want to proceed?
                </p>
            </Modal>
            <Modal
                title="Are you sure you want to close?"
                open={isCloseModalVisible}
                onOk={handleCloseOk}
                onCancel={handleCloseCancel}
                zIndex={1003}
            >
                <p>
                    This will cancel the current request and you will have to
                    start from beginning, do you want to proceed?
                </p>
            </Modal>

            <Modal
                title={ESimTitle()}
                open={isModalVisible}
                onOk={handleStepsOk}
                onCancel={handleStepsCancel}
                width={1000}
                footer={ESimFooter()}
                className="ESim__modal"
                zIndex={1000}
            >
                <div className="ESim__steps-container">
                    <Steps progressDot current={current} direction="vertical">
                        <Step title="RESERVED" />
                        <Step title="READY TO INSTALL" />
                        <Step title="DOWNLOADING" />
                        {/* {statusStep === 'installed' ? (
                            <Step title="INSTALLED" />
                        ) : statusStep === 'disabled' ? (
                            <Step title="DISABLED" />
                        ) : statusStep === 'deleted' ? (
                            <Step title="DELETED" />
                        ) : statusStep === 'unusable' ? (
                            <Step title="UNUSABLE" />
                        ) : (
                            <></>
                        )} */}
                        {statusStep && (
                            <Step title={statusStep?.toUpperCase()} />
                        )}
                    </Steps>
                    <div className="ESim__steps-content">
                        <div className="steps-content">
                            {steps[current].content}
                        </div>
                    </div>
                </div>
                {eSIMErrMsg && (
                    <Alert
                        message={eSIMErrMsg}
                        type="error"
                        showIcon
                        style={{ margin: '0' }}
                    />
                )}
            </Modal>

            <ESimPopUp
                confirmationESimPopUp={confirmationESimPopUp}
                setConfirmationESimPopUp={setConfirmationESimPopUp}
                statusData={getESIMProvision}
                telephoneData={telephoneData}
                contentConfirmationModal={contentConfirmationModal}
            />
        </>
    );
};

export default ESimModal;
