import React, { useState, useEffect, useRef  } from 'react';
import { Button, Modal, Typography, Alert, Select, Badge, Input } from 'antd';
import * as AntIcons from '@ant-design/icons';
import jsonata from 'jsonata';
import './UnlockTemplate.css';
import PropTypes from 'prop-types';

import { MessageBus } from '@ivoyant/component-message-bus';
import FineTune from '../../../../../src/utils/fineTune';
import plugin from 'js-plugin';
import { FeatureFlaggingTooltip } from '@ivoyant/component-feature-flagging';

const UnlockTemplate = ({id,params,datasources,data,handleClose,telephoneNumber, ...props}) => {
const { Option } = Select;
const { Text } = Typography;

    const [value, setValue] = useState(undefined)

    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }

    const {
        modalProps,
        workflow,
        successStates,
        errorStates,
        responseMapping,
        requestMapping,
        allowClear = false,
        selectMeta,
        fineTune,
        className,
        lockIcon,
        featureFlagDisableKeys,
        enableEvent,
        show = true
    } = params;

    const { composeElement } = new FineTune(
        className,
        fineTune?.overideTypeName || '_one-step',
        fineTune
    );

    const { optionExpr, placeholder, selectedDataKey } = selectMeta;
    const datasource = datasources[params.datasource.id];

    const lineDetails = data.map(d => {
        return {
            telephoneNumber : d.subscriberDetails?.phoneNumber,
            sim :  d.subscriberDetails?.deviceDetails?.currentDevice?.sim,
            imei : d.subscriberDetails?.deviceDetails?.currentDevice?.imei
        }
    })

    const [visible, setVisible] = useState(true);
    const [pending, setPending] = useState(false);
    const [result, setResult] = useState('unset');
    const [selectedData, setSelectedData] = useState(telephoneNumber);
    const [request, setRequest] = useState('');
    const [alertMessage, setAlertMessage] = useState(undefined);

    const prevResult = usePrevious({ result, pending, visible });

    let options = [];

    if (optionExpr) {
        options = jsonata(`[${optionExpr}]`).evaluate(data);
    }

    const handleStateChange = (subscriptionId, topic, eventData) => {
        if (successStates.includes(eventData.value)) {
            setAlertMessage(eventData.event.data.data.message);
            setPending(false);
            setResult(eventData.event.data.data.isError ? 'error' : 'success');
        } else if (errorStates.includes(eventData.value)) {
            setAlertMessage(eventData.event.data.message);
            setPending(false);
            setResult('error');
        }
    };

    const onEnableEvent = (subscriptionId, topic, eventData, closure) => {
        if(eventData && eventData[0]?.telephoneData?.telephoneNumber) {
            setSelectedData(eventData[0]?.telephoneData?.telephoneNumber);
        }
        setVisible(!visible);
    };

    // As of now the getForm is not required since we are using phone number in each line for unlock
    const getForm = () => {
        return (
            <Input
                onChange={(e) => {
                    setSelectedData(e);
                }}
                disabled={true}
                size="small"
                disable
                className="select-input"
                placeholder={placeholder}
                allowClear={allowClear}
                style={modalProps[result]?.formStyle}
                defaultValue={telephoneNumber}
             />
            //     {options.map((option) => (
            //         <Option key={option} value={option}>
            //             {option}
            //         </Option>
            //     ))}
            // </Input>
        );
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
                        className='unlock-alert'
                        style={{height:"auto",padding:"5px"}}
                    />
                );
                break;
            case 'error':
                alert = (
                    <Alert
                        message={alertMessage}
                        type="error"
                        showIcon
                        className='unlock-alert'
                        style={{height:"auto",padding:"5px"}}
                    />
                );
                break;
            default:
        }
        return alert;
    };

    const toggleModal = () => {
        setVisible(!visible);
    };

    const onCancel = () => {
        setResult('unset');
        setVisible(!visible);
    };

    const onSubmit = () => {
        setPending(true);
        const requestData = { lineDetails };
        requestData[selectedDataKey] = selectedData;
        setRequest(requestData);
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

    useEffect(() => {
        if (!visible) {
            MessageBus.unsubscribe(id);
            id === "sim-unlock" ? handleClose() : handleClose(telephoneNumber)
        }
    }, [visible, result]);

    useEffect(() => {
        if (pending) {
            MessageBus.send('WF.'. concat(workflow).concat('.INIT'), {
                header: { registrationId: id, workflow, eventType: 'INIT' },
            });
        }
    }, [pending]);

    useEffect(() => {
        if (
            prevResult?.pending &&
            !pending &&
            result === 'unset' &&
            prevResult?.result === 'failure'
        ) {
            MessageBus.send('WF.'.concat(workflow).concat('.CANCEL'), {
                header: { registrationId: id, workflow, eventType: 'CANCEL' },
            });
        }
    }, [pending, result]);

    useEffect(() => {
        if (pending && request) {
            MessageBus.subscribe(
                id,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleStateChange
            );
            MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
                header: { registrationId: id, workflow, eventType: 'SUBMIT' },
                body: {
                    datasource,
                    request,
                    requestMapping,
                    responseMapping,
                },
            });
        }
    }, [pending, request]);

    useEffect(() => {
        if (enableEvent) {
            MessageBus.subscribe(
                id.concat('.enable'),
                enableEvent,
                onEnableEvent
            );
        }

        return () => {
            if (enableEvent) {
                MessageBus.unsubscribe(id.concat('.enable'));
            }
        };
    }, []);

    const Flex = composeElement();

    const LockIcon = AntIcons[lockIcon];

    const getFeatureData = (featureKey) => {
        const featureFlag = plugin.invoke('features.evaluate', featureKey);
        return featureFlag && featureFlag[0];
    };

    const featureFlag = show ? params.featureFlagKey && getFeatureData(params.featureFlagKey) : undefined;
    
    return (
        <div className="expandable-row-item" style={{border:"none"}}>
            <div>
                <Text>
                    {modalProps[result]?.info || modalProps?.default?.info}
                </Text>
            </div>
            <div>
            {
            // As of now the getForm is not required since we are using phone number in each line for unlock
            /* {getForm()} */}
            {getMessage()}
            </div>
            {getFooter()}
        </div>
    );
};

export default UnlockTemplate;

UnlockTemplate.propTypes = {
    /** id can be either sim or imei */
    id: PropTypes.string,
    /**p arams passed */
    params:PropTypes.object,
    /** data  passed*/
    data: PropTypes.object,
    /** Datasource passed */
    datasources: PropTypes.object,
     /** Function to close the component */
    handleClosehandleDone: PropTypes.func,
    /** telephone number */
    telephoneNumber: PropTypes.string,
};
