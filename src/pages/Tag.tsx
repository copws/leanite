import React, { useEffect, useState } from "react";
import { List, Space, Breadcrumb } from "antd";
import InfoCard from "../components/InfoCard";
import { Link, useSearchParams } from "react-router-dom";
import MetaView from "../components/MetaView";
import MiniCard from "../components/MiniCard";
import type { Tag as TagType, BlogMeta } from "../lib";
import { HomeOutlined } from "@ant-design/icons";

export default function Tag() {
  let [tags, setTags] = useState<TagType[]>([]);
  let [blogMeta, setBlogMeta] = useState<BlogMeta[]>([]);
  let [search] = useSearchParams();
  let name = search.get("name");
  useEffect(() => {
    setTags(JSON.parse(localStorage.getItem("tags") as string));
    setBlogMeta(
      JSON.parse(localStorage.getItem("blogMeta") as string) as any[]
    );
  }, []);

  return (
    <div>
      <InfoCard>
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/leanite/home">
                  <HomeOutlined />
                </Link>
              ),
            },
            {
              title: <Link to="/leanite/tag">标签</Link>,
            },
          ]}
        />
        <Space style={{ marginTop: "15px" }}>
          <Link style={{ color: "black" }} to="/leanite/tag">
            <MiniCard>
              <strong>标签总览</strong>
            </MiniCard>
          </Link>
          {tags.map((tag) => (
            <Link style={{ color: "black" }} to={"/leanite/tag?name=" + tag.name}>
              <MiniCard>
                <strong>{"#" + tag.name}</strong>
              </MiniCard>
            </Link>
          ))}
        </Space>
      </InfoCard>

      <InfoCard>
        {name && tags.length > 0 ? (
          <List
            header={<div>{name}</div>}
            dataSource={tags.find((o) => o.name === name)?.ids}
            renderItem={(item: string) => (
              <List.Item>
                <MetaView
                  meta={blogMeta.find((m) => m.id === item) as BlogMeta}
                />
              </List.Item>
            )}
          />
        ) : (
          <List
            header={<div>标签总览</div>}
            dataSource={tags}
            renderItem={(item) => (
              <List.Item>
                <Link to={"/leanite/tag?name=" + item.name}>{item.name}</Link>
              </List.Item>
            )}
          />
        )}
      </InfoCard>
    </div>
  );
}
