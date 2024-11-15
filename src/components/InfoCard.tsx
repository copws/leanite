import React, { ReactNode } from "react";
import { Space } from "antd";
import "./InfoCard.css"

export default function InfoCard(props: { children?: ReactNode }) {
  return (
    <Space
      direction="vertical"
      style={{
        marginTop: "30px",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "7px",
        boxShadow: "0 0 40px 0px rgba(0,0,0,0.04)",
        width: "100%",
      }}
    >
      {props.children}
    </Space>
  );
}
