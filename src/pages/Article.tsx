// import React, { useState, useEffect } from "react";
import {
  useSearchParams,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AV from "leancloud-storage";
import { q2o, type BlogMeta } from "../lib";
import React, { useEffect, useState } from "react";
import InfoCard from "../components/InfoCard";
import { Space, Divider, Tag, Breadcrumb } from "antd";
import MetaView from "../components/MetaView";
import { HomeOutlined } from "@ant-design/icons";
import { MdPreview } from "md-editor-rt";

let prevId = "";
const Article = () => {
  const location = useLocation();
  const [search] = useSearchParams();
  let [blogContent, setBlogContent] = useState<AV.Object>();
  let [blogMeta, setBlogMeta] = useState<BlogMeta[]>([]);
  let [articles, setArticles] = useState<BlogMeta[][]>([[]]);
  const id = search.get("id");
  const navigate = useNavigate();
  useEffect(() => {
    blogMeta = JSON.parse(localStorage.getItem("blogMeta") as string);
    setBlogMeta(blogMeta);
    console.log(location.search, id);
    if (id && prevId !== id) {
      prevId = id;
      new AV.Query("BlogContent")
        .equalTo("id", id)
        .find()
        .then((res) => {
          setBlogContent(q2o(res[0]));
        });
      new AV.Query("BlogMeta")
        .equalTo("id", id)
        .find()
        .then((res) =>
          setTimeout(() => q2o(res[0]).increment("reader", 1).save(), 5000)
        );
    }
    if (!id && (articles.length <= 0 || articles[0].length <= 0)) {
      articles = [];
      let y = Infinity;
      for (let i in blogMeta) {
        const meta = blogMeta[i];
        const y2 = new Date(meta.createdAt).getFullYear();
        if (y2 < y) {
          articles.push([meta]);
          y = y2;
        } else {
          articles[articles.length - 1].push(meta);
        }
      }
      setArticles(articles);
      navigate("/leanite/article");
    }
  }, [location]);
  let metaNow: BlogMeta = {
    title: "",
    createdAt: "",
    id: "",
    objectId: "",
    reader: 1,
    tags: [],
    updatedAt: "",
  };
  if (id && blogMeta.length > 0) {
    metaNow = blogMeta.find((meta) => meta.id === id) as BlogMeta;
  }
  return (
    <div>
      <div>
        {id ? (
          <>
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
                    title: (
                      <Link to={"/leanite/article?id=" + id}>
                        {metaNow.title}
                      </Link>
                    ),
                  },
                ]}
              />
            </InfoCard>
            <InfoCard key={Math.random()}>
              <h1>{metaNow.title}</h1>
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
              <MdPreview value={(blogContent?.get("content"))}></MdPreview>
            </InfoCard>
          </>
        ) : (
          <>
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
                    title: <Link to="/leanite/article">归档</Link>,
                  },
                ]}
              />
            </InfoCard>
            {articles.length > 0 && articles[0].length > 0 ? (
              articles.map((arr) => (
                <InfoCard>
                  <h3>{new Date(arr[0].createdAt).getFullYear()}</h3>
                  {arr.map((meta) => (
                    <MetaView meta={meta} />
                  ))}
                </InfoCard>
              ))
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Article;
