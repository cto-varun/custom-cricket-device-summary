import React, { useState, useEffect } from 'react';
import {
    Typography,
    Form,
    Input,
    InputNumber,
    Button,
    Checkbox,
    Switch,
    Row,
    Col,
    Alert,
    Radio,
    Table,
    Space,
} from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import { cache } from '@ivoyant/component-cache';
import { MessageBus } from '@ivoyant/component-message-bus';
import eSimCapable from './assets/eSimCapable.svg';
import ESimPopUp from '@ivoyant/custom-cricket-pop-up';

const isLuhn = (value) => {
    let nCheck = 0;
    let bEven = false;
    const newValue = value.replace(/\D/g, '');
    for (let n = newValue.length - 1; n >= 0; n--) {
        const cDigit = newValue.charAt(n);
        let nDigit = parseInt(cDigit, 10);
        if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
        nCheck += nDigit;
        bEven = !bEven;
    }
    return nCheck % 10 == 0;
};
const isValidIMEI = (imei) => {
    return imei.trim().length === 15 && isLuhn(imei.trim());
};
const isValidSIM = (sim) => {
    // 89    = telecom
    // 01    = united states
    // [150] = cricket
    // {13}  = sim account
    // {1}   = luhn check digit
    return (
        sim.match(/^(89)(01)(150|030|170|410|560|680)(\d{13})/g) != null &&
        isLuhn(sim)
    );
};
const isSimValid = (value) => !!value && isValidSIM(value);
const isIMEIValid = (value) => !!value && isValidIMEI(value);
const isAccountValid = (value) =>
    !!value && /^\d+$/.test(value) && value.length >= 9 && value.length <= 20;
const isNumberValid = (value) => !!value && value.toString().length >= 10;
const promiseHandler = (value) => (condition, errorMessage) =>
    new Promise((resolve, reject) =>
        condition(value) ? resolve() : reject(new Error(errorMessage))
    );
const customValidator = ({ field }, value) => {
    const handlePromise = promiseHandler(value);
    switch (field) {
        case 'sim': {
            return handlePromise(isSimValid, 'Please enter a valid SIM.');
        }
        case 'imei': {
            return handlePromise(isIMEIValid, 'Please enter a valid IMEI.');
        }
        case 'accNum': {
            return handlePromise(
                isAccountValid,
                'Please enter a valid 9 - 20 digit account number.'
            );
        }
        case 'number': {
            return handlePromise(
                isNumberValid,
                'Please enter a 10 digit phone number.'
            );
        }
        default:
            return null;
    }
};
const AddALineForm = (props) => {
    const {
        accountDetails,
        customerInfo,
        lineData = '',
        editKey = '',
        handleToggle = '',
        properties,
        datasources,
    } = props;
    const { validateAddLine, deviceInfo } = properties;
    const {
        workflow,
        datasource,
        responseMapping,
        successStates,
        errorStates,
    } = validateAddLine;
    const [form] = Form.useForm();
    const [eligibleForPortIn, setEligibleForPortIn] = useState(false);
    const { banStatus } = accountDetails;
    const [formValues, setformValues] = useState({});
    const [portNumChecked, setPortNumChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isActiveEdit, setIsActiveEdit] = useState(false);
    const [otherCarriePhoneNumber, setOtherCarriePhoneNumber] = useState('');
    const [portInData, setPortInData] = useState(null);
    const [portInError, setPortInError] = useState(null);
    const [eSimProvision, setEsimProvision] = useState(true);
    const [disableIMEIValidator, setDisableIMEIValidator] = useState(true);
    const [selectedSIM, setSelectedSIM] = useState('NA');
    const [validateImeiErrorMessage, setValidateImeiErrorMessage] = useState(
        ''
    );
    const [confirmationESimPopUp, setConfirmationESimPopUp] = useState(false);
    const [contentConfirmationModal, setContentConfirmationModal] = useState({
            title: 'Confirmation E-Sim',
            content: 'Are you sure you want to create an E-Sim profile for this customer. Doing so could burn their physical sim (Sim Swap) and charge the customer for a new E-Sim.',
            clickFrom: 'new'
        });
    const [validateImeiErrorType, setValidateImeiErrorType] = useState('info');

    const EsimIcon = (props) => (
        <Icon component={() => <img src={eSimCapable} />} {...props} />
    );

    /** Add a line call with sim and imei validation  */
    const onFinish = (values) => {
        setformValues(values);
        setLoading(true);
        if (!values?.number) {
            values.number = otherCarriePhoneNumber;
        }
        const addLineValidationRequestBody = {
            imei: values.imei,
            zipCode: values.zipCode,
            eSimProvision: selectedSIM === 'e' ? eSimProvision : false,
        };
        if (!eSimProvision) {
            addLineValidationRequestBody.iccid = values.sim;
        }
        if (otherCarriePhoneNumber && portNumChecked) {
            addLineValidationRequestBody.otherCarrierPhoneNumber = otherCarriePhoneNumber;
        }
        validatePostCall(addLineValidationRequestBody, values);
    };

    /** Add a line call with sim and imei validation  */
    const validatePostCall = (requestBody, values, type) => {
        const registrationId = workflow
            .concat('.')
            .concat(values.imei || values.number);
        if (type === 'portIn') {
            MessageBus.subscribe(
                registrationId,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),

                portInValidateResponse(values)
            );
        } else {
            MessageBus.subscribe(
                registrationId,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                collectValidateResponse(values, isActiveEdit, editKey)
            );
        }
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

    const getTelephoneData = (
        addLineValidationRequest,
        addLineValidationResponse,
        addLineFormValues
    ) => {
        const telephoneData = {
            telephoneNumber: addLineValidationResponse.portInEligibility?.ctn,
            imei: addLineValidationResponse.imeiValidationResult?.serialNumber,
            phoneModel: addLineValidationResponse.imeiValidationResult?.itemId,
            sim: addLineValidationResponse.iccidValidationResult?.serialNumber,
            newDeviceInfo: {
                imei:
                    addLineValidationResponse.imeiValidationResult
                        ?.serialNumber,
                byodind: 'Y', //    For Now byod ind is set to Y
                itemid: addLineValidationResponse.imeiValidationResult?.itemId,
                devicesaleprice: 0.0,
            },
            newSimInfo: {
                sim:
                    addLineValidationResponse.iccidValidationResult
                        ?.serialNumber,
                imsi:
                    addLineValidationResponse.iccidValidationResult
                        ?.additionalSerialNumber,
            },
            rateCenter: {
                ...addLineValidationResponse?.rateCenter,
                zip: addLineValidationRequest?.zipCode,
            },
        };
        if (addLineValidationResponse?.portInEligibility !== undefined) {
            telephoneData.portInInfo = {
                ctn: addLineValidationResponse?.portInEligibility.ctn,
                lrn: addLineValidationResponse?.portInEligibility.lrn,
                otherAccountNumber: addLineFormValues?.accNum,
                otherAccountPin: addLineFormValues?.passcode,
                otherNetworkServiceProviderId:
                    addLineValidationResponse.portInEligibility
                        ?.otherNetworkServiceProviderId,
                winBackIndicator:
                    addLineValidationResponse.portInEligibility
                        ?.winBackIndicator,
                zip: addLineFormValues?.zipCode?.toString(),
                taxId: addLineFormValues?.taxId
                    ? Number(addLineFormValues?.taxId)
                    : 9999,
            };
        }

        return telephoneData;
    };

    // Collecting the validate response for add a line and updating the states and calling getPlansAndAddOns
    const collectValidateResponse = (formValues, isActiveEdit, editKey) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData.value;
        const isSuccess = successStates.includes(status);
        const isFailure = errorStates.includes(status);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                const responsePayload = JSON.parse(
                    eventData?.event?.data?.request?.response
                );
                const simError =
                    responsePayload?.iccidValidationResult?.faultInfo;
                const imeiError =
                    responsePayload?.imeiValidationResult?.faultInfo;
                const rateCenterError = responsePayload?.rateCenter?.faultInfo;
                const reserveProfileError =
                    responsePayload?.reserveProfileResponse?.error;

                if (
                    simError ||
                    imeiError ||
                    rateCenterError ||
                    reserveProfileError
                ) {
                    let responseErrors = [];
                    if (reserveProfileError) {
                        setSelectedSIM('Choose-ps');
                        setValidateImeiErrorType('error');
                        setValidateImeiErrorMessage(
                            'Error occured while adding new line for E-sim. Would you like to continue with Physical Sim?'
                        );
                    }
                    if (simError) {
                        responseErrors.push({
                            name: 'sim',
                            errors: [simError ? simError?.message : 'Error'],
                        });
                    }
                    if (imeiError) {
                        responseErrors.push({
                            name: 'imei',
                            errors: imeiError ? [imeiError?.message] : null,
                        });
                    }
                    if (rateCenterError) {
                        responseErrors.push({
                            name: 'zipCode',
                            errors: rateCenterError
                                ? [rateCenterError?.message]
                                : null,
                        });
                    }
                    form.setFields(responseErrors);
                } else {
                    const subscribers = [];
                    const validateAddLineRequest = JSON.parse(
                        eventData?.event?.data?.config?.data
                    );

                    // TODO : can change based on API response
                    subscribers.push({
                        imei: eSimProvision
                            ? responsePayload?.reserveProfileResponses
                                  ?.reserveProfileResponse[0]?.imei
                            : responsePayload?.imeiValidationResult
                                  ?.serialNumber,
                    });

                    if (formValues && eligibleForPortIn && portInData) {
                        formValues.numSource =
                            portInData?.otherNetworkServiceProviderName;
                    }

                    const requestBody = {
                        billingAccountNumber: window[
                            window.sessionStorage?.tabId
                        ].NEW_BAN?.toString(),
                        accountStatus: banStatus,
                        profile:
                            window[window.sessionStorage?.tabId]
                                .COM_IVOYANT_VARS?.profile,
                        includeExpired: banStatus !== 'T',
                        subscribers,
                    };

                    const telephoneData = getTelephoneData(
                        validateAddLineRequest,
                        responsePayload,
                        formValues
                    );

                    const newLine = {
                        key: 0,
                        rank: 0,
                        activityType: 'ACTIVATION',
                        formValues,
                        telephoneData,
                        plan: {
                            currentPlan: {},
                            newPlan: {},
                        },
                        technicalSocs: [],
                        addOns: [],
                        changes: [],
                        discounts: 0,
                        subTotal: 0,
                        operations: {
                            newLine: true,
                            showIcons: true,
                            disableSelection: false,
                        },
                        additionalInfo: {
                            marketingOptInIndicator:
                                formValues?.marketingOptInIndicator,
                            thirdPartyOptInIndicator:
                                formValues?.thirdPartyOptInIndicator,
                        },
                    };

                    const newAccountInfo = {
                        imei: formValues?.imei,
                        sim: formValues?.sim,
                        additionalInfo: {
                            marketingOptInIndicator:
                                formValues?.marketingOptInIndicator,
                            thirdPartyOptInIndicator:
                                formValues?.thirdPartyOptInIndicator,
                        },
                        billingAddress: {
                            zip: customerInfo?.adrZip,
                            city: customerInfo?.adrCity,
                            state: customerInfo?.adrStateCode,
                        },
                        ban: window[
                            window.sessionStorage?.tabId
                        ].NEW_BAN?.toString(),
                        accountStatus: 'T',
                        banStatus: 'T',
                        accountType: customerInfo?.accountType,
                        accountSubType: customerInfo?.accountSubType,
                    };
                    //cache.put('newAccountInfo', newAccountInfo);

                    MessageBus.unsubscribe(subscriptionId);
                    window[sessionStorage?.tabId]?.navigateRoute(
                        '/dashboards/change_rate_plan',
                        {
                            addLineTentativeBan: true,
                            requestBody,
                            newLine,
                        }
                    );
                }
            }
            MessageBus.unsubscribe(subscriptionId);
            setLoading(false);
        }
    };

    const clickButtonESim = () => {
        setConfirmationESimPopUp(true)
    }

    // Validated the port in elegibiility of other carried number
    const portInValidateResponse = (values) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData.value;
        const isSuccess = successStates.includes(status);
        const isFailure = errorStates.includes(status);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                const response = JSON.parse(
                    eventData?.event?.data?.request?.response
                );
                setPortInData(response?.portInEligibility);
                setOtherCarriePhoneNumber(values?.number);
                if (response?.portInEligibility?.eligibilityResults) {
                    setEligibleForPortIn(true);
                } else {
                    setPortInError(
                        `Not eligible for port in : ${response?.portInEligibility?.eligibilityText}`
                    );
                }
            }
            MessageBus.unsubscribe(subscriptionId);

            if (isFailure) {
                setPortInError(eventData?.event?.data?.message);
            }
            setLoading(false);
        }
    };

    // Validating the port in using API request
    const handleValidatePortIn = (values) => {
        if (values?.number !== otherCarriePhoneNumber) {
            setLoading(true);
            setPortInData(null);
            setPortInError(false);
            validatePostCall(
                { otherCarrierPhoneNumber: values?.number },
                values,
                'portIn'
            );
        }
    };

    useEffect(() => {
        if (lineData !== null && lineData !== undefined) {
            let initialFormValues = lineData.formValues;
            initialFormValues = {
                ...initialFormValues,
                imei: lineData?.telephoneData?.imei || '',
                sim: lineData?.telephoneData?.sim || '',
            };
            setIsActiveEdit(true);
            form.setFieldsValue(initialFormValues);
        } else {
            setIsActiveEdit(false);
        }
    }, [lineData]);

    const handlePortNumChange = (e) => {
        setPortNumChecked(e.target.value);
    };

    const handleValidatePortInFailed = () => {};

    const onFinishFailed = (errorInfo) => {};

    const hasBlanks = (fieldObj) => {
        return Object.keys(fieldObj).some((field) => !fieldObj[field]);
    };

    const hasErrors = (errorObj) => {
        return errorObj.some((field) => field.errors.length > 0);
    };

    const hasErrorsOrBlanks = (fieldsError, fieldsValue) => {
        const {
            marketingOptInIndicator,
            thirdPartyOptInIndicator,
            ...allFields
        } = fieldsValue;
        const {
            number,
            passcode,
            accNum,
            taxId,
            fname,
            lname,
            email,
            ...requiredFields
        } = allFields;
        const reqFieldNames = Object.keys(requiredFields);
        const reqFieldsError = fieldsError.filter((obj) =>
            reqFieldNames.includes(obj.name[0])
        );
        return hasErrors(reqFieldsError) || hasBlanks(requiredFields);
    };

    const handleIMEIChange = (e) => {
        let imeiValue = e?.target?.value;
        setSelectedSIM('NA');
        setDisableIMEIValidator(!isValidIMEI(imeiValue));
    };

    // function to handle device api for esim compatibility check
    const handleValidateIMEI = (imeiValue) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData.value;
        const { successStates, errorStates } = deviceInfo;
        const isSuccess = successStates.includes(status);
        const isFailure = errorStates.includes(status);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                const hasEsim = eventData?.event?.data?.data[0]?.device?.extendedCapabilities?.find(
                    ({ capabilityName, capabilityValue }) =>
                        capabilityName === 'eSIMCompatible' &&
                        capabilityValue === 'T'
                );
                if (hasEsim) {
                    setSelectedSIM('NS');
                } else {
                    setSelectedSIM('Choose-ps');
                    setValidateImeiErrorType('info');
                    setValidateImeiErrorMessage(
                        'Your device is not compatible with E-Sim. Would you like to continue with Physical Sim?'
                    );
                }
            } else if (isFailure) {
                setSelectedSIM('Choose-ps');
                setValidateImeiErrorType('error');
                setValidateImeiErrorMessage(
                    'Error occured while validating IMEI for E-sim. Would you like to continue with Physical Sim?'
                );
            }

            MessageBus.unsubscribe(subscriptionId);
            setLoading(false);
        }
    };

    // function to call device api for esim compatibility check
    const validateIMEI = () => {
        const imeiValue = form.getFieldValue('imei');
        const { workflow, datasource, responseMapping } = deviceInfo;

        const registrationId = workflow.concat('.').concat(imeiValue);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleValidateIMEI(imeiValue)
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
                    params: { accountId: imeiValue },
                },
                responseMapping,
            },
        });
    };

    const columns = [
        {
            title: 'Sub Market',
            dataIndex: 'subMarket',
            key: 'subMarket',
        },
        {
            title: 'Current Provider',
            dataIndex: 'otherNetworkServiceProviderName',
            key: 'otherNetworkServiceProviderName',
        },
        {
            title: 'LRN',
            dataIndex: 'lrn',
            key: 'lrn',
        },
        {
            title: 'Coverage',
            dataIndex: 'eligibilityResults',
            key: 'eligibilityResults',
            render: (eligibilityResults) => (eligibilityResults ? 'Yes' : 'No'),
        },
        {
            title: 'State Code',
            dataIndex: 'stateCode',
            key: 'stateCode',
        },
        {
            title: 'Eligibility Code',
            dataIndex: 'eligibilityCode',
            key: 'eligibilityCode',
        },
    ];

    const tableData = portInData && [{ key: 'portInTable', ...portInData }];

    return (
        <>
            <Row gutter={24} style={{ marginTop: 12, marginLeft: 4 }}>
                <Col span={4}>
                    <Typography.Title level={4}>Add New Line</Typography.Title>
                </Col>
                <Col span={19}>
                    <Radio.Group
                        className="add-a-line-radio"
                        onChange={handlePortNumChange}
                        value={portNumChecked}
                    >
                        <Radio value={false}>
                            Add line to a cricket number
                        </Radio>
                        <Radio value={true}>
                            Port an existing number to add a line
                        </Radio>
                    </Radio.Group>
                </Col>
                <Col span={1}>
                    <CloseOutlined
                        title="close"
                        onClick={handleToggle}
                        style={{ fontSize: 18 }}
                    />
                </Col>
                <Col span={24} style={{ marginTop: 12 }}>
                    {portNumChecked && (
                        <Form
                            layout="horizontal"
                            name="port-in"
                            onFinish={handleValidatePortIn}
                            onFinishFailed={handleValidatePortInFailed}
                            className="addALineForm"
                            style={{ paddingLeft: 0 }}
                        >
                            <Row>
                                <Col span={5}>
                                    <Form.Item
                                        name="number"
                                        validateTrigger={
                                            portNumChecked ? 'onBlur' : null
                                        }
                                        rules={
                                            portNumChecked
                                                ? [
                                                      {
                                                          validateTrigger:
                                                              'onBlur',
                                                          validator: customValidator,
                                                      },
                                                  ]
                                                : null
                                        }
                                    >
                                        <InputNumber
                                            className="addALine__input-number"
                                            placeholder="Enter phone number"
                                            autoComplete="off"
                                            formatter={(value) => {
                                                const x = value
                                                    .toString()
                                                    .replace(/\D/g, '')
                                                    .match(
                                                        /(\d{0,3})(\d{0,3})(\d{0,4})/
                                                    );
                                                return !x[2]
                                                    ? x[1]
                                                    : `(${x[1]}) ${x[2]}${
                                                          x[3] ? `-${x[3]}` : ''
                                                      }`;
                                            }}
                                            parser={(value) => {
                                                return value
                                                    .substring(0, 14)
                                                    .replace(/[^\d]/g, '');
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item shouldUpdate>
                                        {() => (
                                            <Button
                                                // block
                                                className="addALine__button-validate-port"
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                // disabled={}
                                            >
                                                Check Port Eligibility
                                            </Button>
                                        )}
                                    </Form.Item>
                                </Col>
                                {eligibleForPortIn && portInData && (
                                    <Col span={6}>
                                        <Alert
                                            style={{
                                                height: 34,
                                            }}
                                            message={'Eligible for Port In'}
                                            type="success"
                                            showIcon
                                        />
                                    </Col>
                                )}
                                {portInError && portNumChecked && (
                                    <Col span={14}>
                                        <Alert
                                            message={portInError}
                                            type="error"
                                            showIcon
                                        />
                                    </Col>
                                )}
                            </Row>
                        </Form>
                    )}
                </Col>
                {portNumChecked && eligibleForPortIn && portInData && (
                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            pagination={false}
                        />
                    </Col>
                )}
            </Row>
            <Form
                form={form}
                layout="vertical"
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                className="addALineForm"
                autocomplete="new-password"
                initialValues={{
                    lname: customerInfo?.lastName || '',
                    fname: customerInfo?.firstName || '',
                    email: customerInfo?.emailAddress || '',
                    zipCode: '',
                    imei: '',
                    sim: '',
                    passcode: '',
                    accNum: '',
                    taxId: '',
                    marketingOptInIndicator: false,
                    thirdPartyOptInIndicator: false,
                }}
            >
                <>
                    <Row gutter={24}>
                        <Col span={24}>
                            {portNumChecked && eligibleForPortIn && portInData && (
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item
                                            label="Passcode"
                                            name="passcode"
                                            rules={[
                                                {
                                                    required: true,
                                                },
                                            ]}
                                            normalize={(value) =>
                                                value.replace(/[^0-9]/gi, '')
                                            }
                                        >
                                            <Input
                                                disabled={!portNumChecked}
                                                autoComplete="new-password"
                                                maxLength={8}
                                                minLength={4}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            label="Account Number"
                                            name="accNum"
                                            normalize={(value) => value.replace(/[^0-9]/gi, '')}
                                            rules={
                                                portNumChecked
                                                    ? [
                                                          {
                                                              required: true,
                                                              message:
                                                                  'Please enter the Account Number',
                                                          },
                                                      ]
                                                    : null
                                            }
                                        >
                                            <Input
                                                autoComplete="new-password"
                                                disabled={!portNumChecked}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item
                                            label="Last 4 of SSN/TaxId"
                                            name="taxId"
                                            normalize={(value) =>
                                                value.replace(/[^0-9]/gi, '')
                                            }
                                        >
                                            <Input
                                                disabled={!portNumChecked}
                                                minLength={4}
                                                maxLength={4}
                                                autoComplete="new-password"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Form.Item label="First Name" name="fname">
                                        <Input autoComplete="new-password" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Last Name" name="lname">
                                        <Input autoComplete="new-password" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Email Address"
                                        name="email"
                                    >
                                        <Input autoComplete="new-password" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                {selectedSIM === 'p' && (
                                    <Col span={8}>
                                        <Form.Item
                                            label="SIM"
                                            name="sim"
                                            // hasFeedback
                                            validateTrigger="onBlur"
                                            rules={[
                                                {
                                                    required:
                                                        selectedSIM === 'p',
                                                    validateTrigger: 'onBlur',
                                                    validator: customValidator,
                                                },
                                            ]}
                                            normalize={(value) =>
                                                value.replace(/[^0-9]/gi, '')
                                            }
                                        >
                                            <Input autoComplete="off" />
                                        </Form.Item>
                                    </Col>
                                )}

<                               Col span={8}>
                                    <Form.Item
                                        label="IMEI"
                                        name="imei"
                                        // hasFeedback
                                        validateTrigger="onBlur"
                                        rules={[
                                            {
                                                required: true,
                                                validateTrigger: 'onBlur',
                                                validator: customValidator,
                                            },
                                        ]}
                                        normalize={(value) =>
                                            value.replace(/[^0-9]/gi, '')
                                        }
                                    >
                                        <div style={{ display: 'flex' }}>
                                            <Input
                                                autoComplete="off"
                                                onChange={handleIMEIChange}
                                                suffix={
                                                    selectedSIM === 'e' ? (
                                                        <EsimIcon />
                                                    ) : (
                                                        <></>
                                                    )
                                                }
                                            />
                                            {selectedSIM === 'NA' && (
                                                <Button
                                                    style={{ marginLeft: 8 }}
                                                    type="primary"
                                                    onClick={() =>
                                                        validateIMEI()
                                                    }
                                                    disabled={
                                                        disableIMEIValidator
                                                    }
                                                >
                                                    Validate
                                                </Button>
                                            )}
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Zip Code"
                                        name="zipCode"
                                        alidateTrigger="onBlur"
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input
                                            minLength={5}
                                            maxLength={5}
                                            autoComplete="off"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        {selectedSIM === 'NS' && (
                            <Col span={24}>
                                <Alert
                                    description="Good news! Your device is E-Sim capable.
                                    Would you like to activate using an E-Sim or
                                    do you have a physical Sim?"
                                    type="success"
                                    action={
                                        <Space direction="horizontal">
                                            <Button
                                                onClick={() => {
                                                    setEsimProvision(false);
                                                    setSelectedSIM('p');
                                                }}
                                            >
                                                Physical SIM
                                            </Button>
                                            <Button
                                                onClick={clickButtonESim}
                                                type="primary"
                                            >
                                                eSIM
                                            </Button>
                                        </Space>
                                    }
                                />
                            </Col>
                        )}
                        {selectedSIM === 'Choose-ps' && (
                            <Col span={24}>
                                <Alert
                                    description={validateImeiErrorMessage}
                                    type={validateImeiErrorType}
                                    action={
                                        <Space direction="horizontal">
                                            <Button
                                                onClick={() => {
                                                    setEsimProvision(false);
                                                    setSelectedSIM('p');
                                                }}
                                            >
                                                Physical SIM
                                            </Button>
                                        </Space>
                                    }
                                />
                            </Col>
                        )}
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Form.Item
                                wrapperCol = {{span: 1}}
                                name="marketingOptInIndicator"
                                label="I wish to get promotional emails"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                wrapperCol = {{span: 1}}
                                name="thirdPartyOptInIndicator"
                                label="I wish to get 3rd party SMS messages"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item shouldUpdate>
                                {() => (
                                    <Button
                                        block
                                        className="addALine__button--add-line"
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        disabled={
                                            hasErrorsOrBlanks(
                                                form.getFieldsError(),
                                                form.getFieldsValue()
                                            ) ||
                                            !(
                                                selectedSIM === 'p' ||
                                                selectedSIM === 'e'
                                            ) ||
                                            (portNumChecked
                                                ? eligibleForPortIn &&
                                                  portInData
                                                    ? false
                                                    : true
                                                : false)
                                        }
                                    >
                                        Validate line details
                                    </Button>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            </Form>
           <ESimPopUp
                confirmationESimPopUp={confirmationESimPopUp}
                setConfirmationESimPopUp={setConfirmationESimPopUp}
                statusData={setSelectedSIM}
                contentConfirmationModal={contentConfirmationModal}
                setEsimProvision={setEsimProvision}
            />
        </>
    );
};
export default AddALineForm;
