import React, { useEffect, useState, type MouseEvent } from "react";
import {
  message,
  List,
  Button,
  Input,
  Popconfirm,
  Checkbox,
  Space,
  Modal,
} from "antd";
import { subscribe, publish, unsubscribe } from "pubsub-js";
import InfoCard from "../../components/InfoCard";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { type BlogMeta, type Tag } from "../../lib";

let verified = false;
export default function ModifyTags() {
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
  let [renameState, setRenameState] = useState<boolean[]>(
    new Array<boolean>(tags.length).fill(false)
  );
  let [search] = useSearchParams();
  let name = search.get("name");
  const navigate = useNavigate();
  useEffect(() => {
    subscribe("setAuth", (_, data) => {
      if (!data) {
        message.error("您需要登录");
        verified = true;
        navigate("/authentication");
      } else {
        setTags(JSON.parse(localStorage.getItem("tags") as string));
        setBlogMeta(JSON.parse(localStorage.getItem("blogMeta") as string));
      }
    });
    if (!verified) {
      publish("isAuthed");
    }
    return () => {
      unsubscribe("setAuth");
      verified = false;
    };
  }, [navigate]);

  function renameTags(index: number, oldName: string) {
    const tag = tags[index];
    for (let i in blogMeta) {
      if (tag.ids.includes(blogMeta[i].id)) {
        blogMeta[i].tags = blogMeta[i].tags.filter((name) => name !== oldName);
        blogMeta[i].tags.push(tag.name);
      }
    }
    setBlogMeta(blogMeta);
    console.log(blogMeta);
  }

  function deleteTags(index: number) {
    const tag = tags[index];
    for (let i in blogMeta) {
      blogMeta[i].tags = blogMeta[i].tags.filter((name) => name !== tag.name);
    }
    setBlogMeta(blogMeta);
    console.log(blogMeta);
    renameState.splice(index, 1);
    setRenameState(renameState);
  }

  let [isCreating, setIsCreating] = useState<boolean>(false);
  let [createValue, setCreateValue] = useState<string>("");
  const handleCreateDone = () => {
    if (createValue.length > 0) {
      tags.push({
        name: createValue,
        ids: [],
        objectId: "",
        createdAt: "",
        updatedAt: "",
      });
      setTags(tags);
    }
    setIsCreating(false);
    setCreateValue("");
    navigate("/modifyTags");
  };

  // modifyArticlesInOneTag
  let [isModifying, setIsModifying] = useState<boolean>(false);
  let [checked, setChecked] = useState<string[]>([]);
  const currentTag = tags?.find((o) => o.name === name) as Tag;
  return (
    <div>
      <InfoCard>
        {name && tags.length > 0 ? (
          !isModifying ? (
            <List
              header={<div>{name}</div>}
              pagination={{
                position: "bottom",
                align: "center",
                pageSize: 5,
                total: currentTag.ids.length,
              }}
              footer={
                <Space direction="horizontal" style={{ float: "right" }}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setIsModifying(true);
                      navigate("/modifyTags?name=" + name);
                    }}
                  >
                    添加或删除文章……
                  </Button>
                  <Link to="/modifyTags">
                    <Button>返回上一级</Button>
                  </Link>
                </Space>
              }
              dataSource={currentTag?.ids}
              renderItem={(item: string) => {
                return (
                  <List.Item>
                    <Link to={"/article?id=" + item}>
                      {blogMeta.find((m) => m.id === item)?.title}
                    </Link>
                  </List.Item>
                );
              }}
            />
          ) : (
            <Checkbox.Group
              style={{ width: "100%" }}
              onChange={(checkedValues) => {
                console.log("checked = ", checkedValues);
                setChecked(checkedValues);
              }}
              defaultValue={currentTag?.ids}
            >
              <List
                style={{ width: "100%" }}
                pagination={{
                  position: "bottom",
                  align: "center",
                  pageSize: 5,
                  total: blogMeta.length,
                }}
                header={<div>{name}</div>}
                footer={
                  <Button
                    onClick={() => {
                      console.log(currentTag);
                      //handleFinish
                      if (currentTag.ids === checked) return;
                      for (let i in checked) {
                        const item = checked[i];
                        const index = blogMeta.findIndex((o) => o.id === item);
                        if (
                          !currentTag?.ids.includes(item) &&
                          !blogMeta[index].tags.includes(currentTag.name)
                        ) {
                          blogMeta[index].tags.push(currentTag.name);
                        } else
                          currentTag.ids = currentTag.ids.filter(
                            (id) => id !== item
                          );
                      }
                      for (let i in currentTag.ids) {
                        const item = currentTag.ids[i];
                        const index = blogMeta.findIndex((o) => o.id === item);
                        blogMeta[index].tags = blogMeta[index].tags.filter(
                          (tag) => tag !== currentTag?.name
                        );
                      }
                      setBlogMeta(blogMeta);
                      tags[tags.findIndex((o) => o.name === name)].ids =
                        checked;
                      setTags(tags);
                      setIsModifying(false);
                      navigate("/modifyTags?name=" + name);
                    }}
                    type="primary"
                    style={{ float: "right" }}
                  >
                    完成
                  </Button>
                }
                dataSource={blogMeta}
                renderItem={(meta) => (
                  <List.Item>
                    <Checkbox value={meta.id}>{meta.title}</Checkbox>
                  </List.Item>
                )}
              />
            </Checkbox.Group>
          )
        ) : (
          <List
            header={<div>标签总览</div>}
            pagination={{
              position: "bottom",
              align: "center",
              pageSize: 5,
              total: tags.length,
            }}
            footer={
              <Space style={{ float: "right" }}>
                <Button
                  type="primary"
                  onClick={() => {
                    setIsCreating(true);
                    navigate("/modifyTags");
                  }}
                >
                  添加新标签
                </Button>
              </Space>
            }
            dataSource={tags}
            renderItem={(item) => {
              const index = tags.findIndex((t) => t === item);
              const handleRenameDone = (
                e:
                  | React.FocusEvent<HTMLInputElement, Element>
                  | React.KeyboardEvent<HTMLInputElement>
              ) => {
                const oldName = tags[index].name;
                if (oldName !== e.currentTarget.value) {
                  tags[index].name = e.currentTarget.value;
                  renameTags(index, oldName);
                  setTags(tags);
                }
                renameState[index] = false;
                setRenameState(renameState);
                navigate("/modifyTags");
              };
              return (
                <List.Item
                  actions={[
                    <Button
                      onClick={() => {
                        renameState[index] = true;
                        setRenameState(renameState);
                        navigate("/modifyTags");
                      }}
                    >
                      重命名
                    </Button>,
                    <Popconfirm
                      title="删除标签"
                      description="你确定要删除标签吗？"
                      onConfirm={() => {
                        deleteTags(index);
                        tags.splice(index, 1);
                        setTags(tags);
                        navigate("/modifyTags");
                      }}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button danger>删除</Button>
                    </Popconfirm>,
                  ]}
                  key={index}
                >
                  {renameState[index] ? (
                    <Input
                      defaultValue={item.name}
                      defaultChecked
                      onPressEnter={handleRenameDone}
                      onBlur={handleRenameDone}
                    />
                  ) : (
                    <Link to={"/modifyTags?name=" + item.name}>
                      {item.name}
                    </Link>
                  )}
                </List.Item>
              );
            }}
          />
        )}
      </InfoCard>
      <Modal
        open={isCreating}
        title="创建新标签"
        onCancel={(_) => {
          setIsCreating(false);
          setCreateValue("");
          navigate("/modifyTags");
        }}
        onOk={handleCreateDone}
      >
        <Space direction="horizontal">
          标签名称：
          <Input
            placeholder="新标签名称"
            defaultChecked
            value={createValue}
            onChange={(e) => setCreateValue(e.currentTarget.value)}
            onPressEnter={handleCreateDone}
            onBlur={handleCreateDone}
          />
        </Space>
        <Space style={{ marginTop: "15px" }}>
          你稍后可以在标签管理页面添加所属的文章。
        </Space>
      </Modal>
    </div>
  );
}
