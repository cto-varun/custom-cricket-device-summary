import React, { useState, useEffect } from 'react';
import {
    Button,
    Switch,
    Input,
    Alert,
    Tooltip,
    Row,
    Col,
    notification,
} from 'antd';
import { MessageBus } from '@ivoyant/component-message-bus';
import EditTemplate from './EditTemplate';
import UnlockTemplate from './UnlockTemplate';
import { LockOutlined, UnlockOutlined, EditOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import moment from 'moment';
import Modal from '../Modal/ModalComponent';
import plugin from 'js-plugin';
import jsonata from 'jsonata';
import PortInfo from './PortInfo';
import eSimCapable from '../assets/eSimCapable.svg';
import eSimError from '../assets/eSimError.svg';
import eSimSuccess from '../assets/eSimSuccess.svg';
import { cache } from '@ivoyant/component-cache';
import VMTechnicalSoc from './VMTechnicalSoc';
import TechnicalSocSwitch from './TechnicalSocSwitch';

const handleCallProtectResp = (
    newState,
    setChecked,
    setLoading,
    successStates,
    errorStates
) => (subscriptionId, topic, eventData, closure) => {
    if (
        successStates.includes(eventData.value) ||
        errorStates.includes(eventData.value)
    ) {
        setLoading(false);
        MessageBus.unsubscribe(subscriptionId);
        if (successStates.includes(eventData.value)) {
            setChecked(newState);
        }
    }
};

const ExpandedRow = ({
    telephoneData,
    deviceUpgradeWaiveFee,
    planAndAddOns,
    robocall,
    datasources,
    subscriberInfo,
    portProtectWorkflow,
    lineLevelFeatures,
    getNetworkStatus,
    provisionalInfo,
    dropdownData,
    modalConfig,
    record,
    profilesInfo,
    resetAndUnlockFlow,
    subscribers,
    handleCloseProvisionalInfo,
    customerAdditionalInfo,
    portOutColumns,
    portInColumns,
    eSIMStatusWorkflow,
    eSIMProvisionWorkflow,
    eSIMEmailQRWorkflow,
    marketingOptInUpdateWorkflow,
    accountLevelIndicator,
    eSIMUpdateUIWorkflow,
    vmTechnicalSocWorkflow,
    accountLevelFeatures,
    voicemailTechnicalSocFeature,
}) => {
    console.log('telephoneData', telephoneData);
    // getting details of selected phone number for passing to port out info component.
    const subscriberDetailedInfo = customerAdditionalInfo?.subscribers?.find(
        (sub) => {
            return (
                sub?.subscriberDetails?.phoneNumber ===
                subscriberInfo?.phoneNumber
            );
        }
    );
    const [fieldName, setFieldName] = useState();
    const [loading, setLoading] = useState(false);
    const [portLoading, setPortLoading] = useState(false);
    const [thirdPartyLoading, setThirdPartyLoading] = useState(false);
    const [portInfoVisible, setPortInfoVisible] = useState(false); // for toggling the visibility of port info component
    const roboCalling = planAndAddOns?.currentFeatures?.find(
        ({ soc }) => soc === 'CRKCLDEF'
    );
    const vmTechnicalSocExists = planAndAddOns?.currentFeatures?.find(
        ({ soc }) => soc === 'CRKVMB'
    );

    const crkabrTechnicalSocExists = checkIfTechSocExists('CRKABR');

    function checkIfTechSocExists(socName) {
        return planAndAddOns?.currentFeatures?.find(
            ({ soc }) => soc === socName
        );
    }

    const crkabrTechnicalSocAccountFeature = accountLevelFeatures?.find(
        (af) => {
            return af.feature === 'toggleCrkabrSoc';
        }
    );

    const smsOptInIndicator = cache
        .get('customerPreferences')
        ?.find((cp) => cp?.ptn === record?.telephoneData?.telephoneNumber)
        ?.preferences?.find(
            (p) => p?.preferenceName === 'ThirdPartySmsOptInIndicator'
        )?.optInIndicator;
    const [thirdPartySmsChecked, setThirdPartySmsChecked] = useState(
        smsOptInIndicator
    );
    const thirdPartyIndicatorDisableCheck = accountLevelIndicator
        ? record?.subscriberInfo?.status === 'C'
            ? true
            : false
        : true;
    let updatePortProtect = lineLevelFeatures
        ?.find(
            ({ subscriberNumber }) =>
                telephoneData?.subscriberNumber === subscriberNumber
        )
        ?.features?.find(({ feature }) => feature === 'updatePortProtect')
        ?.enable;

    const vmTechnicalSocAccountFeature = accountLevelFeatures?.find((af) => {
        return af.feature === 'toggleVoicemailTechnicalSoc';
    });

    const vmTechnicalSocFeature = vmTechnicalSocAccountFeature?.enable
        ? lineLevelFeatures
              ?.find(
                  ({ subscriberNumber }) =>
                      telephoneData?.subscriberNumber === subscriberNumber
              )
              ?.features?.find(
                  ({ feature }) => feature === 'toggleVoicemailTechnicalSoc'
              )
        : vmTechnicalSocAccountFeature;

    const crkabrTechnicalSocFeature = vmTechnicalSocAccountFeature?.enable
        ? lineLevelFeatures
              ?.find(
                  ({ subscriberNumber }) =>
                      telephoneData?.subscriberNumber === subscriberNumber
              )
              ?.features?.find(({ feature }) => feature === 'toggleCrkabrSoc')
        : crkabrTechnicalSocAccountFeature;

    const [checked, setChecked] = useState(roboCalling ? true : false);
    const [portChecked, setPortChecked] = useState(
        subscriberInfo?.portProtectInd === 'Y'
            ? true
            : subscriberInfo?.portProtectInd === 'N'
            ? false
            : null
    );
    const [portProtectContent, setPortProtectContent] = useState(null);
    let { profile } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;

    const portProtectEnableProfile = profilesInfo?.profiles
        ?.find(({ name }) => name === profile)
        ?.categories?.find(({ name }) => name === 'portProtect')?.enable;

    const visible =
        updatePortProtect &&
        (subscriberInfo?.portProtectRequester === 'SYSTEM' && portChecked
            ? true
            : subscriberInfo?.portProtectRequester === 'USER' ||
              portChecked !== null
            ? portProtectEnableProfile
            : false);

    const [portDisabled, setPortDisabled] = useState(false);

    const getFlagInfo = ({
        disableExpr,
        disableMsg,
        featureFlagKeys,
        allowedLineStatuses,
    }) => {
        let disabled = false;
        const disabledArray = [];
        const disabledReasonsArray = [];
        let disabledReason;

        if (disableExpr) {
            disabled = jsonata(disableExpr).evaluate(record);
            if (disabled) {
                disabledReason =
                    disableMsg ||
                    'Selected operation is not allowed for Device(s) selected';
            }
        }

        if (!disabled) {
            if (featureFlagKeys && featureFlagKeys.length > 0) {
                featureFlagKeys.forEach((featureKey) => {
                    const featureFlag = plugin.invoke(
                        'features.evaluate',
                        featureKey
                    );
                    if (!featureFlag[0]?.enabled) {
                        disabledArray.push(featureFlag[0]);
                        disabledReason = featureFlag[0]?.reasons.toString();
                        disabledReasonsArray.push(disabledReason);
                    }
                });
            }
            if (!disabled && allowedLineStatuses) {
                disabled = allowedLineStatuses.includes(
                    telephoneData?.ptnStatus
                );
                disabledReason =
                    'Line selected has status not supported for this activity';
            }

            // If not disabled by account featute level checks the linelevel
            if (!disabled) {
                lineLevelFeatures?.filter(({ subscriberNumber, features }) => {
                    if (telephoneData?.subscriberNumber === subscriberNumber) {
                        features?.filter(({ feature, enable, reasons }) => {
                            if (featureFlagKeys?.includes(feature) && !enable) {
                                disabledArray.push({
                                    feature: feature,
                                    enable: enable,
                                    enabled: enable,
                                    disabled: !enable,
                                    reasons,
                                });
                                disabledReasonsArray.push(reasons?.toString());
                            }
                        });
                    }
                });
            }

            disabled =
                disabledArray.length &&
                disabledArray.every((el) => !el?.enabled);
            if (disabled) {
                disabledReason = disabledReasonsArray.toString();
            }
        }

        return { disabled, disabledReason };
    };

    const disabledUnlockIMEI = getFlagInfo(
        dropdownData.deviceMenuItems.find((dd) => dd.id === 'unlockDevice')
    );
    const disabledChangeIMEI = getFlagInfo(
        dropdownData.deviceMenuItems.find((dd) => dd.id === 'changeIMEI')
    );
    const disabledUnlockSim = getFlagInfo(
        dropdownData.networkMenuItems.find((dd) => dd.id === 'unlockSIM')
    );
    const disabledChangeSim = getFlagInfo(
        dropdownData.networkMenuItems.find((dd) => dd.id === 'changeSIM')
    );

    const handleChangeCallProtect = (newState, number) => {
        const {
            workflow,
            datasource,
            responseMapping,
            successStates,
            errorStates,
        } = robocall;
        setLoading(true);
        const value = {
            ctn: number,
            featureName: 'CALLPROTECT',
            activityType: newState ? 'ADD' : 'REMOVE',
        };
        const registrationId = workflow.concat('.').concat(number);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleCallProtectResp(
                newState,
                setChecked,
                setLoading,
                successStates,
                errorStates
            )
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
                    body: {
                        ctn: number,
                        featureName: 'CALLPROTECT',
                        activityType: newState ? 'ADD' : 'REMOVE',
                    },
                },
                responseMapping,
            },
        });
    };

    const handleCallThirdPartyResponse = (
        newState,
        setThirdPartySmsChecked,
        setThirdPartyLoading,
        successStates,
        errorStates
    ) => (subscriptionId, topic, eventData, closure) => {
        if (
            successStates.includes(eventData.value) ||
            errorStates.includes(eventData.value)
        ) {
            setThirdPartyLoading(false);
            MessageBus.unsubscribe(subscriptionId);
            if (successStates.includes(eventData.value)) {
                setThirdPartySmsChecked(newState);
                notification.success({
                    message: 'Third party SMS!',
                    description:
                        'Customer preferences has been updated successfully!',
                });
            }
        }
    };

    const handleThirdPartyUpdateCall = (newState, number) => {
        const {
            workflow,
            datasource,
            responseMapping,
            successStates,
            errorStates,
        } = marketingOptInUpdateWorkflow;
        if (accountLevelIndicator) {
            setThirdPartyLoading(true);
            const registrationId = workflow.concat('.').concat(number);
            let body = {
                subscribers: [
                    {
                        ptn: number,
                        preferences: [
                            {
                                preferenceName: 'ThirdPartySmsOptInIndicator',
                                optInIndicator: newState,
                            },
                        ],
                    },
                ],
            };
            MessageBus.subscribe(
                registrationId,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleCallThirdPartyResponse(
                    newState,
                    setThirdPartySmsChecked,
                    setThirdPartyLoading,
                    successStates,
                    errorStates
                )
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
                        body: { ...body },
                    },
                    responseMapping,
                },
            });
        }
        // else {
        //     notification.error({
        //         message: 'Third party SMS!',
        //         description:
        //             'Third party SMS update is not allowed this account!',
        //     });
        // }
    };

    const handlePortProtect = (
        newState,
        setChecked,
        setLoading,
        successStates,
        errorStates
    ) => (subscriptionId, topic, eventData, closure) => {
        if (
            successStates.includes(eventData.value) ||
            errorStates.includes(eventData.value)
        ) {
            if (successStates.includes(eventData.value)) {
                setPortDisabled(true);
                setPortChecked(newState);
                setPortProtectContent(null);
            }
            setPortLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const handleChangePortProtect = (number, status) => {
        const {
            workflow,
            datasource,
            responseMapping,
            successStates,
            errorStates,
        } = portProtectWorkflow;
        setPortLoading(true);
        const registrationId = workflow.concat('.').concat(number);
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handlePortProtect(
                status,
                setChecked,
                setLoading,
                successStates,
                errorStates
            )
        );
        const requestBody = JSON.stringify([
            {
                identifierType: 'CTN',
                identifierValue: number,
                transactionType: 'PORT_PROTECT_IND',
                transactionValue: status ? 'Y' : 'N',
            },
        ]);
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

    const handleEditDone = () => {
        setFieldName({
            ...fieldName,
            edit: undefined,
        });
    };

    const handleUnlockDone = () => {
        setFieldName({
            ...fieldName,
            unlock: undefined,
        });
    };

    const handleEditCancel = (workflow) => {
        MessageBus.unsubscribe(workflow);
        setFieldName({
            ...fieldName,
            edit: undefined,
        });
        MessageBus.send('WF.'.concat(workflow).concat('.CANCEL'), {
            header: {
                registrationId: workflow,
                workflow,
                eventType: 'CANCEL',
            },
        });
    };
    const filterColumns = () => {
        // filter columns for port out info based on column name portType
        return subscriberDetailedInfo?.subscriberDetails?.portDetails
            ?.portType === 'PORTIN'
            ? portInColumns
            : portOutColumns;
    };

    return (
        <>
            <div
                className="expandable-row-container"
                style={{ backgroundColor: '#FFFFFF' }}
            >
                <Row>
                    <Col span={10}>
                        <div className="expandable-row-item">
                            <div className="column-device">
                                <div className="column-device-property">
                                    IMEI
                                </div>
                                <div className="column-device-value">
                                    {':  '}
                                    {telephoneData.imei}
                                    {telephoneData?.eSimCompatibleDevice && (
                                        <Tooltip title="eSim capable device">
                                            <Icon
                                                component={() => (
                                                    <img src={eSimCapable} />
                                                )}
                                                className="mg-l-8"
                                                alt="eSim-capable-icon"
                                            />
                                        </Tooltip>
                                    )}

                                    {/* <Tooltip title={disabledUnlockIMEI.disabled ? disabledUnlockIMEI.disabledReason : null}>
                                        <Button
                                            icon={<LockOutlined />}
                                            className="column-edit-button"
                                            disabled={disabledUnlockIMEI.disabled}
                                        //     onClick={() => {
                                        //        MessageBus.send("UNLOCKDEVICE.ENABLE", record);
                                        //    }}
                                        onClick={() => {
                                                setFieldName({unlock:"device-unlock",edit:undefined})
                                            }}
                                        />
                                        </Tooltip> */}
                                    <Tooltip
                                        title={
                                            disabledChangeIMEI.disabled
                                                ? disabledChangeIMEI.disabledReason
                                                : null
                                        }
                                    >
                                        <Button
                                            icon={<EditOutlined />}
                                            type="text"
                                            className="column-edit-button"
                                            disabled={
                                                disabledChangeIMEI.disabled
                                            }
                                            onClick={() => {
                                                setFieldName({
                                                    edit: 'changeIMEI',
                                                    unlock: undefined,
                                                });
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                                <div className="column-device-property">
                                    SIM
                                </div>
                                <div className="column-device-value">
                                    {':  '}
                                    {telephoneData.sim}
                                    {telephoneData?.eSimCompatibleDevice &&
                                        telephoneData?.currentSimType ===
                                            'eSIM' &&
                                        telephoneData?.eSimCurrentStatus !==
                                            undefined && (
                                            <Tooltip
                                                title={`eSIM ${telephoneData?.eSimCurrentStatus}`}
                                            >
                                                <Icon
                                                    component={() =>
                                                        telephoneData?.eSimCurrentStatus ===
                                                        'Installed' ? (
                                                            <img
                                                                src={
                                                                    eSimSuccess
                                                                }
                                                            />
                                                        ) : (
                                                            <img
                                                                src={eSimError}
                                                            />
                                                        )
                                                    }
                                                    className="mg-l-8"
                                                    alt="eSim-capable-icon"
                                                />
                                            </Tooltip>
                                        )}
                                    <Tooltip
                                        title={
                                            disabledUnlockSim.disabled
                                                ? disabledUnlockSim.disabledReason
                                                : null
                                        }
                                    >
                                        <Button
                                            icon={<LockOutlined />}
                                            type="text"
                                            className="column-edit-button"
                                            disabled={
                                                disabledUnlockSim.disabled
                                            }
                                            onClick={() => {
                                                setFieldName({
                                                    unlock: 'sim-unlock',
                                                    edit: undefined,
                                                });
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            disabledChangeSim.disabled
                                                ? disabledChangeSim.disabledReason
                                                : null
                                        }
                                        // title={
                                        //     telephoneData?.eSimCompatibleDevice
                                        //         ? telephoneData?.enableESimAcount
                                        //             ? telephoneData?.enableEsim
                                        //                 ? null
                                        //                 : telephoneData?.eSimReasons
                                        //             : telephoneData?.eSimAcountReasons
                                        //         : disabledChangeSim.disabled
                                        //         ? disabledChangeSim.disabledReason
                                        //         : null
                                        // }
                                    >
                                        <Button
                                            icon={<EditOutlined />}
                                            className="column-edit-button"
                                            type="text"
                                            // disabled={
                                            //     telephoneData?.eSimCompatibleDevice
                                            //         ? telephoneData?.enableESimAcount
                                            //             ? !telephoneData?.enableEsim
                                            //             : !telephoneData?.enableESimAcount
                                            //         : disabledChangeSim.disabled
                                            // }
                                            disabled={
                                                disabledChangeSim.disabled
                                            }
                                            onClick={() => {
                                                setFieldName({
                                                    edit: 'changeSIM',
                                                    unlock: undefined,
                                                });
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                                {telephoneData.imsi
                                    ? <>
                                        <div className="column-device-property">
                                            IMSI
                                        </div>
                                        <div className="column-device-value">
                                            {':  '}
                                            {telephoneData.imsi}
                                        </div>
                                    </>
                                    : <></>
                                }
                                <div className="column-device-property in-progress-label">
                                    Port-
                                    {subscriberDetailedInfo?.subscriberDetails
                                        ?.portDetails?.portType === 'PORTOUT'
                                        ? 'Out'
                                        : 'In'}{' '}
                                    Status
                                </div>
                                <div className="column-device-value progress-btn">
                                    {':  '}
                                    <Button
                                        className="network-status-button"
                                        onClick={() => setPortInfoVisible(true)}
                                        size="small"
                                    >
                                        {
                                            subscriberDetailedInfo
                                                ?.subscriberDetails?.portDetails
                                                ?.requestStatusText
                                        }
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {fieldName?.edit && (
                        <Col span={14}>
                            <EditTemplate
                                config={modalConfig[fieldName?.edit]}
                                data={record}
                                datasources={datasources}
                                profilesInfo={profilesInfo}
                                handleCancel={handleEditCancel}
                                handleDone={handleEditDone}
                                telephoneData={telephoneData}
                                eSIMStatusWorkflow={eSIMStatusWorkflow}
                                eSIMProvisionWorkflow={eSIMProvisionWorkflow}
                                eSIMEmailQRWorkflow={eSIMEmailQRWorkflow}
                                fieldName={fieldName}
                                eSIMUpdateUIWorkflow={eSIMUpdateUIWorkflow}
                            />
                        </Col>
                    )}

                    {fieldName?.unlock && (
                        <Col span={14}>
                            <UnlockTemplate
                                id={fieldName?.unlock}
                                params={resetAndUnlockFlow[fieldName?.unlock]}
                                handleClose={handleUnlockDone}
                                datasources={datasources}
                                data={subscribers}
                                telephoneNumber={telephoneData?.telephoneNumber}
                            />
                        </Col>
                    )}

                    {fieldName?.edit === undefined &&
                        fieldName?.unlock === undefined && (
                            <>
                                <Col span={8}>
                                    {' '}
                                    <div className="expandable-row-item">
                                        <div>
                                            Robo Calling :{' '}
                                            <Switch
                                                defaultChecked={roboCalling}
                                                loading={loading}
                                                size="small"
                                                checked={checked}
                                                onChange={(checked) =>
                                                    handleChangeCallProtect(
                                                        checked,
                                                        telephoneData?.telephoneNumber
                                                    )
                                                }
                                            />
                                        </div>
                                        {visible && (
                                            <div>
                                                {portProtectEnableProfile
                                                    ? `Port Protect - ${
                                                          portChecked
                                                              ? 'Locked'
                                                              : 'Unlocked'
                                                      }`
                                                    : 'Port Request - Locked'}{' '}
                                                :{' '}
                                                <Switch
                                                    // defaultChecked={portChecked}
                                                    loading={portLoading}
                                                    size="small"
                                                    disabled={portDisabled}
                                                    checked={portChecked}
                                                    onChange={(checked) => {
                                                        setPortChecked(
                                                            !checked
                                                        );
                                                        setPortDisabled(true);
                                                        setPortProtectContent({
                                                            text: checked
                                                                ? 'Adding this CTN to the port protect list will prevent this CTN from porting out, even if the customer initiates the port request.'
                                                                : 'Removing this CTN from port protect list will allow this CTN to be ported out.',
                                                            checked: checked,
                                                        });
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {voicemailTechnicalSocFeature?.enable !==
                                            'false' && (
                                            <VMTechnicalSoc
                                                vmTechnicalSocExists={
                                                    vmTechnicalSocExists
                                                }
                                                vmTechnicalSocWorkflow={
                                                    vmTechnicalSocWorkflow
                                                }
                                                phoneNumber={
                                                    telephoneData?.telephoneNumber
                                                }
                                                vmTechnicalSocFeature={
                                                    vmTechnicalSocFeature
                                                }
                                                datasources={datasources}
                                            />
                                        )}
                                        <TechnicalSocSwitch
                                            techSwitchProps={{
                                                label: 'Stream More',
                                                techSocName: 'CRKABR',
                                                phoneNumber:
                                                    telephoneData?.telephoneNumber,
                                                datasources: datasources,
                                                techSocWorkflow: vmTechnicalSocWorkflow,
                                                techSocExists: crkabrTechnicalSocExists,
                                                techSocFeatures: crkabrTechnicalSocFeature,
                                            }}
                                        />
                                        <div className="third-party-sms">
                                            Third Party SMS Opt-In :{' '}
                                            <Switch
                                                defaultChecked={
                                                    smsOptInIndicator
                                                }
                                                loading={thirdPartyLoading}
                                                size="small"
                                                checked={thirdPartySmsChecked}
                                                onChange={(checked) =>
                                                    handleThirdPartyUpdateCall(
                                                        checked,
                                                        telephoneData?.telephoneNumber
                                                    )
                                                }
                                                disabled={
                                                    thirdPartyIndicatorDisableCheck
                                                }
                                            />
                                        </div>
                                        <Button
                                            className="network-status-button"
                                            onClick={() =>
                                                getNetworkStatus(
                                                    telephoneData?.telephoneNumber
                                                )
                                            }
                                            size="small"
                                            disabled={
                                                loading ||
                                                provisionalInfo?.find(
                                                    ({ ctn }) =>
                                                        ctn ===
                                                        telephoneData?.telephoneNumber?.toString()
                                                )
                                            }
                                            loading={
                                                loading ===
                                                telephoneData?.telephoneNumber
                                            }
                                        >
                                            Network Status
                                        </Button>
                                    </div>
                                </Col>

                                {provisionalInfo.map(({ ctn, data }) => {
                                    return (
                                        record?.telephoneData
                                            ?.telephoneNumber === ctn && (
                                            <Col span={6}>
                                                <div className="expandable-row-item">
                                                    <Alert
                                                        className="provision-alert"
                                                        message={`Provisioning Status: ${
                                                            data
                                                                ?.provisioningErrorInfo
                                                                ?.latestErrorInfo
                                                                ?.errorDescription ||
                                                            data?.provisioningStatusDescription
                                                        }`}
                                                        type="info"
                                                        showIcon
                                                        onClose={() =>
                                                            handleCloseProvisionalInfo(
                                                                ctn
                                                            )
                                                        }
                                                        closable
                                                    />
                                                    <div
                                                        style={{
                                                            borderBottom:
                                                                '1px solid #bfbfbf',
                                                        }}
                                                    ></div>
                                                </div>
                                            </Col>
                                        )
                                    );
                                })}

                                {provisionalInfo.length === 0 && (
                                    <Col span={6}>
                                        <div className="expandable-row-item">
                                            <div className="column-device">
                                                <div
                                                    style={{ width: '90px' }}
                                                    className="column-device-property"
                                                >
                                                    Plan{' '}
                                                </div>
                                                <div className="column-device-value">
                                                    {`:   `}$
                                                    {telephoneData?.planCost ||
                                                        0}
                                                </div>
                                                <div
                                                    style={{ width: '90px' }}
                                                    className="column-device-property"
                                                >
                                                    Add-Ons Cost{' '}
                                                </div>
                                                <div className="column-device-value">
                                                    {`:   `}$
                                                    {telephoneData?.addOnsCost ||
                                                        0}
                                                </div>
                                                <div
                                                    style={{ width: '90px' }}
                                                    className="column-device-property"
                                                >
                                                    Total{' '}
                                                </div>
                                                <div className="column-device-value">
                                                    {':  '}${record?.subTotal}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}

                                {deviceUpgradeWaiveFee && (
                                    <Col span={6}>
                                        <div className="expandable-row-item">
                                            <div className="device-upgrade-waive-fee">
                                                {deviceUpgradeWaiveFee?.message ||
                                                    'NA'}
                                            </div>
                                            <div>
                                                {deviceUpgradeWaiveFee?.notes ||
                                                    'NA'}
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </>
                        )}
                </Row>
            </div>
            {portProtectContent && (
                <Row>
                    <Col span={24}>
                        <div className="expandable-row-container port-protect-container">
                            <div className="expandable-row-item">
                                <div className="port-protect-proceed-text">
                                    Do you want to proceed?
                                </div>
                                <div className="port-protect-text">
                                    {portProtectContent?.text}
                                </div>
                                <div
                                    style={{ float: 'right', marginBottom: 12 }}
                                >
                                    <Button
                                        style={{ marginRight: 12 }}
                                        type="primary"
                                        onClick={() => {
                                            handleChangePortProtect(
                                                telephoneData.telephoneNumber,
                                                portProtectContent?.checked
                                            );
                                        }}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setPortDisabled(false);
                                            setPortProtectContent(null);
                                        }}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}
            {subscriberDetailedInfo?.subscriberDetails?.portDetails &&
                portInfoVisible && (
                    <PortInfo
                        setPortInfoVisible={setPortInfoVisible}
                        portInfoColumns={filterColumns}
                        portDetails={
                            subscriberDetailedInfo?.subscriberDetails
                                ?.portDetails
                        }
                    />
                )}
        </>
    );
};

export default ExpandedRow;
