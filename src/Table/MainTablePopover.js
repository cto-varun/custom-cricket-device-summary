import React from "react";
import { Popover } from "antd";

const MainTablePopover = (props) => {
  const {
    popoverContent = "",
    popoverTitle = null,
    popoverTrigger = "hover",
    children = null
  } = props;
  if (children === null) {
    return null;
  }
  if (popoverContent === "") {
    return children;
  }
  return (
    <Popover
      content={popoverContent}
      title={popoverTitle}
      trigger={popoverTrigger}
    >
      {children}
    </Popover>
  );
};

export default MainTablePopover;
