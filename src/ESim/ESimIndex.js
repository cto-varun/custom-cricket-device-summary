import React, { useState, useEffect } from 'react';
import ESimModal from './ESimModal';
import { Steps, Button, message } from 'antd';
import PropTypes from 'prop-types';

const ESimIndex = ({
    setSimType,
    telephoneData,
    eSIMStatusWorkflow,
    eSIMProvisionWorkflow,
    eSIMEmailQRWorkflow,
    datasources,
    handleCancel,
    eSIMUpdateUIWorkflow,
}) => {
    const [eSIMStatrtingTitle, setESIMStatrtingTitle] = useState(
        'Good news! Your device is E-Sim capable.'
    );
    const [eSIMStatrtingDescription, setESIMStatrtingDescription] = useState(
        'Would you like to activate using an E-Sim or do you have a physical Sim?'
    );

    return (
        <article className="ESim__container">
            <p style={{ opacity: '0.5' }}>
                {telephoneData?.eSimCurrentStatus
                    ? `Your E-Sim profile was ${telephoneData?.eSimCurrentStatus}`
                    : eSIMStatrtingTitle}
            </p>
            <p>
                {telephoneData?.eSimCurrentStatus
                    ? telephoneData?.eSimCurrentStatus
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
                          ?.toLowerCase() === 'disabled'
                        ? 'Do you want check your eSim status or do you want to switch to a Physical Sim?'
                        : `Do you want a new eSim or do you want to switch to a Physical Sim?`
                    : eSIMStatrtingDescription}
            </p>
            <ESimModal
                setSimType={setSimType}
                telephoneData={telephoneData}
                eSIMStatusWorkflow={eSIMStatusWorkflow}
                eSIMProvisionWorkflow={eSIMProvisionWorkflow}
                eSIMEmailQRWorkflow={eSIMEmailQRWorkflow}
                datasources={datasources}
                handleCancel={handleCancel}
                eSIMUpdateUIWorkflow={eSIMUpdateUIWorkflow}
            />
        </article>
    );
};

export default ESimIndex;

// ESimIndex.propTypes = {
//     /** eSIM check */
//     setSimType: PropTypes.bool,
//     /** line level data  passed*/
//     telephoneData: PropTypes.object,
//     /** eSIMStatusWorkflow passed */
//     eSIMStatusWorkflow: PropTypes.object,
//     /** eSIMProvisionWorkflow passed */
//     eSIMProvisionWorkflow: PropTypes.object,
//     /** eSIMEmailQRWorkflow passed */
//     eSIMEmailQRWorkflow: PropTypes.object,
//     /** datasources passed*/
//     datasources: PropTypes.object,
//     /** Function to cancel the process*/
//     handleCancel: PropTypes.func,
// };
