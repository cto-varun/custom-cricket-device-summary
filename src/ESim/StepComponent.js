import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { WifiOutlined, ReloadOutlined } from '@ant-design/icons';
import { MessageBus } from '@ivoyant/component-message-bus';

const StepComponent = (props) => {
    const {
        eSIMEmailQRWorkflow,
        eSimData,
        datasources,
        emailResponseLoading,
        setEmailResponseLoading,
        resetEmailResponse,
        setResetEmailResponse,
    } = props;
    const [emaiQRResponse, setEmaiQRResponse] = useState(null);
    const [emaiQRErrResponse, setEmaiQRErrResponse] = useState(null);
    // const [emailResponseLoading, setEmailResponseLoading] = useState(false);

    const profileTitle = eSimData && eSimData?.recommendation[0]?.header;
    const profileDescription =
        eSimData && eSimData?.recommendation[0]?.description;
    const profileRecommendedTitle =
        eSimData?.recommendation[0]?.additionalInfo &&
        'Recommended Actions (Optional)';
    const profileRecommendedDescription =
        eSimData && eSimData?.recommendation[0]?.additionalInfo;

    const {
        workflow: emailQRWorkflow,
        datasource: emailQRDatasource,
        responseMapping: emailQRResponseMapping,
        successStates: emailQRSuccessStates,
        errorStates: emailQRErrorStates,
    } = eSIMEmailQRWorkflow;

    const onFinish = (values) => {
        let { ctn, iccid } = eSimData;
        sendQRCode(values, ctn, iccid);
    };

    const sendQRCode = (values, ctn, iccid) => {
        setEmailResponseLoading(true);

        const registrationId = emailQRWorkflow?.concat('.').concat(ctn);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(emailQRWorkflow).concat('.STATE.CHANGE'),
            handleEmailQRResponse(emailQRSuccessStates, emailQRErrorStates)
        );
        MessageBus.send('WF.'.concat(emailQRWorkflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: emailQRWorkflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(emailQRWorkflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: emailQRWorkflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[emailQRDatasource],
                request: {
                    body: {
                        toEmail: values?.qremail,
                        iccid: iccid,
                        ctn: ctn,
                    },
                },
                emailQRResponseMapping,
            },
        });
    };

    const handleEmailQRResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData?.value;
        const isSuccess = successStates?.includes(status);
        const isFailure = errorStates?.includes(status);

        if (isSuccess || isFailure) {
            if (isSuccess) {
                let tempResponse = eventData?.event?.data?.data;

                setEmaiQRResponse(tempResponse);
                setEmaiQRErrResponse(null);
            }

            if (isFailure) {
                // setEmaiQRErrResponse(
                //     eventData?.event?.data?.response?.data?.error?.causedBy[0]
                // );
                setEmaiQRErrResponse(
                    eventData?.event?.data?.response?.data?.error
                );
            }
            setResetEmailResponse(false);
            setEmailResponseLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const onFinishFailed = (errorInfo) => {
        //console.log('Failed:', errorInfo);
    };

    return (
        <div className="ESim__content">
            <div className="mg-b-24">
                <>
                    <h4>
                        {profileTitle} &nbsp;
                        <span style={{ opacity: '0.4' }}>
                            Customer must have access to WIFI &nbsp;
                            <WifiOutlined />
                        </span>
                    </h4>
                </>
                <p>{profileDescription}</p>
            </div>
            <div className="mg-b-24">
                <h4>
                    {props?.showRecommendation && (
                        <span>{profileRecommendedTitle} &nbsp;</span>
                    )}
                </h4>
                {props?.showRecommendation && (
                    <p>{profileRecommendedDescription}</p>
                )}
            </div>
            {eSimData?.profileState?.replace(/ /g, '')?.toLowerCase() ===
                'downloaded' && (
                <>
                    {/* <Alert
                        message="QR code was successfully sent to tony@starkindustries.com"
                        type="success"
                        showIcon
                    /> */}
                    {/* <Button>
                        eSIM Status: Download in Progress &nbsp;{' '}
                        <ReloadOutlined />
                    </Button> */}
                    <Alert
                        message="eSIM Download Status: Download in Progress"
                        type="info"
                        showIcon
                    />
                    <p
                        style={{
                            opacity: '0.7',
                            fontSize: '12px',
                            margin: '16px 0 0',
                        }}
                    >
                        {' '}
                        If customer is unable to download the eSIM, cancel and
                        restart the eSIM creation process.
                    </p>
                </>
            )}
            {props?.showInput && (
                <>
                    <div className="d-flex mg-b-16">
                        <Form
                            name="emailQRcode"
                            layout="inline"
                            initialValues={{
                                remember: true,
                            }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <Form.Item
                                name="qremail"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your email id!',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Enter your email ID"
                                    type="email"
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={emailResponseLoading}
                                >
                                    Email QR Code
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    {resetEmailResponse ? (
                        <></>
                    ) : (
                        emaiQRResponse && (
                            <Alert
                                message={emaiQRResponse?.responseDescription}
                                type="success"
                                showIcon
                            />
                        )
                    )}
                    {resetEmailResponse ? (
                        <></>
                    ) : (
                        emaiQRErrResponse && (
                            <Alert
                                message={emaiQRErrResponse?.message}
                                type="error"
                                showIcon
                            />
                        )
                    )}
                </>
            )}
        </div>
    );
};

export default StepComponent;
