import React from 'react';
import MainTablePopover from './MainTablePopover';
import { InfoCircleOutlined } from '@ant-design/icons';
import './PlanTemplate.css';

const PlanTemplate = (props) => {
    const {
        data: { currentRatePlan = [] },
        ebbQualifiedPlans = [],
    } = props;
    const isEbbPlan = (val) => {
        return (
            ebbQualifiedPlans.length > 0 &&
            ebbQualifiedPlans.find((item) => item.name === val)
        );
    };
    if (currentRatePlan.length === 0) {
        return <div>Error: no current plan</div>;
    }
    return (
        <div className="ant-btn defaultPlanButton">

{isEbbPlan(currentRatePlan[0].soc) && (
                <span key={currentRatePlan[0].soc} className="device-summary-item__ebb">
                </span>
            )}
            {currentRatePlan[0].soc}{' '}
            
            <MainTablePopover
                popoverContent={
                    <>
                        <div>{currentRatePlan[0].shortDescription}</div>
                    </>
                }
            >
                <InfoCircleOutlined /> 
            </MainTablePopover>
        </div>
    );
};

export default PlanTemplate;
