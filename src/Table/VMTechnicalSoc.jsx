import React, { useState } from 'react';
import { Switch, Tooltip } from 'antd';
import { MessageBus } from '@ivoyant/component-message-bus';

export default function VMTechnicalSoc({
    phoneNumber,
    datasources,
    vmTechnicalSocExists,
    vmTechnicalSocFeature,
    vmTechnicalSocWorkflow,
}) {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(vmTechnicalSocExists);

    let {
        workflow,
        datasource,
        responseMapping,
        successStates,
        errorStates,
    } = vmTechnicalSocWorkflow;

    const handleVMSocUpdateCall = (checked) => {
        setLoading(true);
        setChecked(checked);
        const registrationId = workflow.concat('.').concat(phoneNumber);
        let body = {
            services: [
                {
                    soc: 'CRKVMB',
                    action: checked ? 'ADD' : 'REMOVE',
                },
            ],
        };
        const mapping = {
            ...responseMapping,
            success: {
                success: {
                    messageExpr: `'Voicemail has been ${
                        checked ? 'added' : 'removed'
                    }'`,
                },
            },
        };

        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleVMSocResponse(checked, successStates, errorStates)
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
                    params: { phonenumber: phoneNumber },
                },
                responseMapping: mapping,
            },
        });
    };

    const handleVMSocResponse = (checked, successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const isSuccess = successStates.includes(eventData.value);
        const isError = errorStates.includes(eventData.value);
        if (isSuccess || isError) {
            if (isSuccess) {
                setChecked(checked);
            } else {
                setChecked(!checked);
            }
            setLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    return (
        <div className="third-party-sms">
            <Tooltip
                title={vmTechnicalSocFeature?.reasons?.toString()}
                showTitle={vmTechnicalSocFeature?.reasons?.length}
            >
                Voicemail :{' '}
                <Switch
                    defaultChecked={checked}
                    loading={loading}
                    size="small"
                    checked={checked}
                    onChange={(checked) => handleVMSocUpdateCall(checked)}
                    disabled={!vmTechnicalSocFeature?.enable}
                />
            </Tooltip>
        </div>
    );
}
