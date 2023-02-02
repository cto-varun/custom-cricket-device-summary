import React from 'react';
import MainTablePopover from './MainTablePopover';
import { Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const AddOnTemplate = (props) => {
    const { data = {} } = props;
    let quantity = data.quantity;
    if (Object.keys(data).length === 0) {
        return null;
    }
    return (
        <div className="ant-btn originalAddOn">
            {data.soc}
            <span className="addOnQuantityContainer">{quantity}</span>
            <MainTablePopover
                popoverContent={
                    <>
                        <div>{data.shortDescription}</div>
                        <div>${data.rate}</div>
                    </>
                }
            >
                <InfoCircleOutlined />
            </MainTablePopover>
        </div>
    );
};

export default AddOnTemplate;
