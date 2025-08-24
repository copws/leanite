import React, { useEffect, useState } from "react";
import { Breadcrumb, Divider, Space, Tag } from "antd";
import InfoCard from "../components/InfoCard";
import AV from "leancloud-storage";
import { type BlogMeta } from "../lib";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import { MdPreview } from "md-editor-rt";

export default function Home() {
  const [responses, setResponses] = useState<AV.Queriable[]>([]);
  const [blogMeta, setBlogMeta] = useState<BlogMeta[]>([]);

  useEffect(() => {
    setBlogMeta(
      JSON.parse(localStorage.getItem("blogMeta") as string) as any[]
    );
    (async () => {
      setResponses(
        await new AV.Query("BlogContent")
          .descending("createdAt")
          .limit(5)
          .find()
      );
    })();
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
              title: <Link to="/leanite/home">首页</Link>,
            },
          ]}
        />
      </InfoCard>
      {responses.map((q) => {
        const metaNow = blogMeta.find(
          (meta) => meta.id === q.get("id")
        ) as BlogMeta;
        return (
          <InfoCard key={Math.random()}>
            <h2>
              <Link
                to={"/leanite/article?id=" + q.get("id")}
                style={{ color: "black" }}
              >
                {q.get("title")}
              </Link>
            </h2>
            <Space style={{ color: "grey" }}>
              阅读量：{metaNow.reader - 1}
              <Divider type="vertical" />
              发布：
              {new Date(metaNow.createdAt).toLocaleDateString()}
              <Divider type="vertical" />
              标签：
              {metaNow?.tags.length > 0
                ? metaNow.tags.map((tag) => (
                    <Tag>
                      <Link to={"/leanite/tag?name=" + tag}>{tag}</Link>
                    </Tag>
                  ))
                : "无"}
            </Space>
            <MdPreview value={(q.get("content"))}></MdPreview>
          </InfoCard>
        );
      })}
    </div>
  );
}
