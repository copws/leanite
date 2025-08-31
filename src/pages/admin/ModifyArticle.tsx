import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Button,
  Input,
  List,
  Popconfirm,
  Space,
  Tag as AntdTag,
  Divider,
  App,
} from "antd";
import { subscribe, publish, unsubscribe } from "pubsub-js";
import { type Tag, type BlogMeta, q2o } from "../../lib";
import InfoCard from "../../components/InfoCard";
import { MdEditor } from "md-editor-rt";
import AV from "leancloud-storage";
import { md5 } from "js-md5";
import "md-editor-rt/lib/style.css";

let verified = false;
export default function ModifyArticle() {
  const { message } = App.useApp();
  let [tags, _setTags] = useState<Tag[]>([]);
  const setTags = (tgs: Tag[]) => {
    localStorage.setItem("tags", JSON.stringify(tgs));
    _setTags(tgs);
  };
  let [blogMeta, _setBlogMeta] = useState<BlogMeta[]>([]);
  const setBlogMeta = (bm: BlogMeta[]) => {
    localStorage.setItem("blogMeta", JSON.stringify(bm));
    _setBlogMeta(bm);
  };
  const navigate = useNavigate();
  let [search] = useSearchParams();
  const id = search.get("id");
  const createNew = search.get("new");
  let currentMeta: BlogMeta = {
    title: "",
    createdAt: "",
    id: "",
    objectId: "",
    reader: 0,
    tags: [],
    updatedAt: "",
    isDraft: true,
  };

  useEffect(() => {
    subscribe("setAuth", (_, data) => {
      if (!data) {
        message.error("您需要登录");
        verified = true;
        navigate("/authentication");
      } else {
        console.log("%");
        setTags(JSON.parse(localStorage.getItem("tags") as string));
        setBlogMeta(
          JSON.parse(localStorage.getItem("blogMeta") as string) as any[]
        );
      }
    });
    if (!verified) {
      publish("isAuthed");
    }
    return () => {
      unsubscribe("setAuth");
      verified = false;
    };
  }, []);

  //edit
  const [editValue, setEditValue] = useState<string>();
  const [editTitle, setEditTitle] = useState<string>("");
  const [currentContent, setCurrentContent] = useState<AV.Object>();

  if (id && editTitle.length <= 0) {
    publish("closeSidebar");
    if (!createNew) {
      currentMeta = blogMeta.find((meta) => meta.id === id) as BlogMeta;
    } else {
      currentMeta = {
        objectId: "",
        createdAt: "",
        updatedAt: "",
        title: "默认标题",
        tags: [],
        reader: 0,
        id: "",
        isDraft: true,
      };
    }
    console.log(currentMeta);
    setEditTitle(currentMeta.title);
    if (!createNew) navigate("/modifyArticle?id=" + id);
    else navigate("/modifyArticle?id=" + id + "&new=1");
  }

  const saveArticle = (isDraft: boolean) => () => {
    if (!createNew) {
      const metaIndex = blogMeta.findIndex((meta) => meta.id === id);
      blogMeta[metaIndex].title = editTitle;
      blogMeta[metaIndex].isDraft = isDraft;
      setBlogMeta(blogMeta);
    }
    currentContent?.set("title", editTitle);
    currentContent?.set("content", editValue);
    currentContent?.set("isDraft", isDraft);
    currentContent?.save().then(
      (res) => {
        message.success("成功");
        if (createNew) {
          blogMeta.push({
            objectId: "",
            createdAt: "",
            title: editTitle,
            tags: [],
            reader: 0,
            id: res.get("id"),
            updatedAt: "",
            isDraft: isDraft,
          });
        }
        setBlogMeta(blogMeta);
        publish("openSidebar");
        navigate("/modifyArticle");
      },
      (err) => message.error("出错了！" + err)
    );
  };

  return (
    <div>
      {id && blogMeta.length > 0 ? (
        <>
          <InfoCard>
            <Space direction="horizontal">
              <strong>标题：</strong>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.currentTarget.value)}
                style={{ width: "50vw" }}
              />
              <Popconfirm
                title="确认"
                description={"你确定要发布文章吗？此操作不可撤销。"}
                onConfirm={saveArticle(false)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary">发布文章</Button>
              </Popconfirm>
              <Popconfirm
                title="确认"
                description={"你确定要保存草稿吗？此操作不可撤销。"}
                onConfirm={saveArticle(true)}
                okText="确认"
                cancelText="取消"
              >
                <Button>保存草稿</Button>
              </Popconfirm>
              <Popconfirm
                title="确认"
                description={"你确定要取消吗？此操作不可撤销。"}
                onConfirm={() => {
                  setEditTitle("");
                  setEditValue("");
                  setCurrentContent(undefined);
                  navigate("/modifyArticle");
                }}
                okText="确认"
                cancelText="取消"
              >
                <Button>取消</Button>
              </Popconfirm>
            </Space>
          </InfoCard>
          <MdEditor
            value={editValue}
            onChange={(e) => {
              setEditValue(e);
            }}
            style={{
              marginTop: "30px",
              border: 0,
            }}
            previewTheme="github"
          />
        </>
      ) : (
        <InfoCard>
          <List
            header="文章总览"
            pagination={{
              position: "bottom",
              align: "center",
              pageSize: 5,
              total: blogMeta.length,
            }}
            footer={
              <Button
                onClick={() => {
                  const content = new AV.Object("BlogContent");
                  content.set("id", md5(new Date().toString() + Math.random()));
                  content.set("content", "");
                  content.set("title", "");
                  console.log(content);
                  setCurrentContent(content);
                  navigate("/modifyArticle?id=" + content.get("id") + "&new=1");
                }}
                type="primary"
                style={{ float: "right" }}
              >
                创建新文章
              </Button>
            }
            dataSource={blogMeta}
            renderItem={(meta) => {
              const index = blogMeta.findIndex((m) => m === meta);
              function deleteArticle() {
                for (let i in meta.tags) {
                  const index = tags.findIndex(
                    (tag) => tag.name === meta.tags[i]
                  );
                  tags[index].ids = tags[index].ids.filter(
                    (id) => id !== meta.id
                  );
                }
                setTags(tags);
              }
              return (
                <List.Item
                  actions={[
                    <Button
                      onClick={() => {
                        new AV.Query("BlogContent")
                          .equalTo("id", meta.id)
                          .find()
                          .then((res) => {
                            setEditValue(q2o(res[0]).get("content"));
                            setCurrentContent(q2o(res[0]));
                            navigate("/modifyArticle?id=" + meta.id);
                          });
                        navigate("/modifyArticle?id=" + meta.id);
                      }}
                    >
                      编辑
                    </Button>,
                    <Popconfirm
                      title="删除文章"
                      description="你确定要删除文章吗？"
                      onConfirm={() => {
                        deleteArticle();
                        blogMeta.splice(index, 1);
                        setBlogMeta(blogMeta);
                        console.log(tags);
                        navigate("/modifyArticle");
                      }}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button danger>删除</Button>
                    </Popconfirm>,
                  ]}
                >
                  <Link to={"/article?id=" + meta.id}>
                    {meta.title.trimEnd()}
                    <Divider type="vertical" />
                    {meta.isDraft ? (
                      <AntdTag color="orange">草稿</AntdTag>
                    ) : (
                      <AntdTag color="green">已发布</AntdTag>
                    )}
                  </Link>
                </List.Item>
              );
            }}
          />
        </InfoCard>
      )}
    </div>
  );
}
