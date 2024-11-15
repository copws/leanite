import { Space } from "antd";
import React from "react";
import './MiniCard.css'

const MiniCard = (props: { children: React.ReactNode }) => {
  const { children } = props;
  return (
    <Space
      direction="horizontal"
      className="leanite-minicard"
    >
      {children}
    </Space>
  );
};

export default MiniCard;
