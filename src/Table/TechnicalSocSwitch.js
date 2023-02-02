import React, { useState } from 'react';
import { Switch, Tooltip } from 'antd';
import { MessageBus } from '@ivoyant/component-message-bus';

export default function TechnicalSocSwitch({ techSwitchProps }) {
    const {
        label,
        phoneNumber,
        datasources,
        techSocWorkflow,
        techSocExists,
        techSocFeatures,
        techSocName,
    } = techSwitchProps;
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(techSocExists);

    console.log(
        'props tc',
        label,
        phoneNumber,
        datasources,
        workflow,
        techSocExists,
        techSocFeatures
    );
    let {
        workflow,
        datasource,
        responseMapping,
        successStates,
        errorStates,
    } = techSocWorkflow;

    const handleTecSocUpdateCall = (checked) => {
        setLoading(true);
        setChecked(checked);
        const registrationId = workflow.concat('.').concat(phoneNumber);
        let body = {
            services: [
                {
                    soc: techSocName,
                    action: checked ? 'ADD' : 'REMOVE',
                },
            ],
        };
        const mapping = {
            ...responseMapping,
            success: {
                success: {
                    messageExpr: `'Stream More ${
                        checked ? 'Enabled' : 'Disabled'
                    }'`,
                },
            },
        };

        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleTechSocResponse(checked, successStates, errorStates)
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

    const handleTechSocResponse = (checked, successStates, errorStates) => (
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
                title={techSocFeatures?.reasons?.toString()}
                showTitle={techSocFeatures?.reasons?.length}
            >
                {label} :{' '}
                <Switch
                    defaultChecked={checked}
                    loading={loading}
                    size="small"
                    checked={checked}
                    onChange={(checked) => handleTecSocUpdateCall(checked)}
                    disabled={!techSocFeatures?.enable}
                />
            </Tooltip>
        </div>
    );
}
