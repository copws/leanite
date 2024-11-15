import React from "react";
import { Space } from "antd";

const OptionCard = (props: { children?: React.ReactNode }) => (
  <Space style={{ marginTop: "5px" }}>{props.children}</Space>
);

export default OptionCard;
