import React, { useState, useEffect } from 'react';

import { Modal, Typography, Divider, Button } from 'antd';
import VerticalStepperComponent from './VerticalStepperComponent';
import { MessageBus } from '@ivoyant/component-message-bus';

import './styles/ModalComponent.css';
import jsonata from 'jsonata';

const { Text, Paragraph } = Typography;

function ModalComponent({ config, data, datasources, profilesInfo, handleCloseModal = undefined, ...props }) {
    const [visible, setVisible] = useState(true);
    const [complete, setComplete] = useState(false);
    const { modal, stepper, workflow } = config;
    const { width, height, title, header1Expr, header2Expr } = modal;

    const handleDone = () => {
        if(handleCloseModal !== undefined)
        {
            handleCloseModal()
        }
        setVisible(false);
        setComplete(false);
    };

    const handleCancel = () => {
        if(handleCloseModal !== undefined)
        {
            handleCloseModal()
        }
        setVisible(false);
        MessageBus.unsubscribe(workflow);
        MessageBus.send('WF.'.concat(workflow).concat('.CANCEL'), {
            header: {
                registrationId: workflow,
                workflow,
                eventType: 'CANCEL',
            },
        });
    };

    useEffect(() => {
        if (!visible) {
            Modal.destroyAll();
        }
    }, [visible]);

    return (
        <div>
            <Modal
                open={visible}
                onCancel={() => handleCancel()}
                title={title}
                width={width}
                height={height}
                className="imei-modal"
                destroyOnClose
                closable={false}
                footer={[
                    <div className="ModalFooter">
                        {complete ? (
                            <Button
                                key="Done"
                                type="primary"
                                className="ModalButton"
                                onClick={() => handleDone()}
                            >
                                DONE
                            </Button>
                        ) : (
                            <Button
                                key="Cancel"
                                className="ModalButton"
                                onClick={() => handleCancel()}
                            >
                                CANCEL
                            </Button>
                        )}
                    </div>,
                ]}
            >
                <Paragraph>{jsonata(header1Expr).evaluate(data)}</Paragraph>
                <Text disabled>{jsonata(header2Expr).evaluate(data)}</Text>
                <Divider />
                <VerticalStepperComponent
                    data={data}
                    stepper={stepper}
                    workflow={workflow}
                    complete={setComplete}
                    datasources={datasources}
                    profilesInfo={profilesInfo}
                    {...props}
                />
            </Modal>
        </div>
    );
}
export default ModalComponent;
