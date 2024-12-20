import React from "react";
import { BlogMeta } from "../lib";
import { Space, Tag } from "antd";
import { Link } from "react-router-dom";

const MetaView = (props: { meta: BlogMeta }) => {
  const { meta } = props;

  return (
    <Space direction="horizontal">
      <strong>
        <Link to={"/leanite/article?id=" + meta.id} style={{ color: "black" }}>
          {meta.title}
        </Link>
      </strong>
      {meta.tags.map((tag) => (
        <Tag>
          <Link to={"/leanite/tag?name=" + tag}>{tag}</Link>
        </Tag>
      ))}
      <div style={{ color: "grey" }}>
        {new Date(meta.createdAt).toLocaleDateString()}
      </div>
    </Space>
  );
};

export default MetaView;
