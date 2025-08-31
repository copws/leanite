import React, { useEffect, useState } from "react";
import AV from "leancloud-storage";
import {
  Col,
  Layout,
  Row,
  Menu,
  Button,
  Space,
  Card,
  Avatar,
  Spin,
  App as AntdApp,
} from "antd";
import {
  TagsOutlined,
  ProfileOutlined,
  HomeOutlined,
  ReadOutlined,
  ControlOutlined,
  SettingOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { init, q2o, arrEqual, type Tag, type BlogMeta } from "./lib";
import InfoCard from "./components/InfoCard";
import {
  Link,
  useLocation,
  useNavigate,
  useRoutes,
  useSearchParams,
} from "react-router-dom";
import routes from "./routes";
import { subscribe, unsubscribe, publish } from "pubsub-js";
import { MdPreview } from "md-editor-rt";

const { Header, Footer, Content } = Layout;

const items = [
  {
    key: "1",
    label: <Link to="/home">首页</Link>,
    icon: <HomeOutlined />,
  },
  {
    key: "2",
    label: <Link to="/tag">标签</Link>,
    icon: <TagsOutlined />,
  },
  {
    key: "3",
    label: <Link to="/article">归档</Link>,
    icon: <ProfileOutlined />,
  },
  {
    key: "4",
    label: "阅读",
    icon: <ReadOutlined />,
  },
];

const adminItems = [
  {
    key: "5",
    label: <Link to="/adminHome">控制台</Link>,
    icon: <ControlOutlined />,
  },
  {
    key: "6",
    label: <Link to="/modifyArticle">文章管理</Link>,
    icon: <EditOutlined />,
  },
  {
    key: "7",
    label: <Link to="/modifyTags">标签管理</Link>,
    icon: <TagsOutlined />,
  },
  {
    key: "8",
    label: <Link to="/settings">设置</Link>,
    icon: <SettingOutlined />,
  },
];

interface Settings {
  name: string;
  desc: string;
  avatarURL: string;
  blogIcon: string;
  bulletin: string;
}

let authenticated = false;
let checkedInit = false;
function App() {
  const { message } = AntdApp.useApp();

  const route = useRoutes(routes);
  let blogMeta: AV.Object[] = [];
  let tags: AV.Object[] = [];
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  let [settings, setSettings] = useState<Settings>({
    name: "",
    desc: "",
    avatarURL: "",
    bulletin: "",
    blogIcon: "",
  });

  function updateBlogMeta() {
    new AV.Query("BlogMeta")
      .descending("createdAt")
      .find()
      .then((res) => {
        blogMeta = res.map((q) => q2o(q));
        localStorage.setItem(
          "blogMeta",
          JSON.stringify(blogMeta.map((o) => o.toFullJSON()))
        );
        localStorage.setItem(
          "blogMetaOriginal",
          JSON.stringify(blogMeta.map((o) => o.toFullJSON()))
        );
      });
  }
  function updateTags() {
    new AV.Query("Tags")
      .descending("createdAt")
      .find()
      .then((res) => {
        tags = res.map((q) => q2o(q));
        localStorage.setItem("tags", JSON.stringify(tags));
        localStorage.setItem("tagsOriginal", JSON.stringify(tags));
      });
  }

  function updateSettings() {
    new AV.Query("Settings").first().then((res) => {
      settings.name = res?.get("name");
      settings.desc = res?.get("desc");
      settings.avatarURL = res?.get("avatarURL");
      settings.bulletin = res?.get("bulletin");
      settings.blogIcon = res?.get("blogIcon");
      setSettings(settings);
      navigate(location.pathname + location.search);
    });
  }

  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    if (checkedInit === false) {
      checkedInit = true;
      (async () => {
        setSpinning(true);
        await new AV.Object("Init").save().then((_) =>
          new AV.Query("Init").find().then(async (res) => {
            console.log(res.length);
            if (res.length <= 1) {
              await init();
              updateBlogMeta();
              setTimeout(updateTags, 500);
              updateSettings();
              setSpinning(false);
            } else {
              console.log("init有问题");
              q2o(res[0]).destroy();
              setSpinning(false);
            }
          })
        );
      })();
    }
    updateBlogMeta();
    setTimeout(updateTags, 500);
    subscribe("updateSettings", updateSettings);
    subscribe("auth", () => {
      authenticated = true;
      navigate("/adminHome");
    });
    subscribe("isAuthed", () => publish("setAuth", authenticated));

    subscribe("openSidebar", () => setShowSidebar(true));
    subscribe("closeSidebar", () => setShowSidebar(false));

    updateSettings();
    return () => {
      unsubscribe("auth");
      unsubscribe("isAuthed");
      unsubscribe("openSidebar");
      unsubscribe("closeSidebar");
      unsubscribe("updateSettings");
    };
  }, []);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [useAdminMenu, setUseAdminMenu] = useState<boolean>(false);
  const [blogContent, setBlogContent] = useState<AV.Object | null>(null);

  useEffect(() => {
    if (
      location.pathname.includes("/adminHome") ||
      location.pathname.includes("/modify") ||
      location.pathname.includes("/settings")
    ) {
      setUseAdminMenu(true);
      if (location.pathname.includes("/modifyArticle")) setSelectedKeys(["6"]);
      else if (location.pathname.includes("/modifyTags"))
        setSelectedKeys(["7"]);
      else if (location.pathname.includes("/settings")) setSelectedKeys(["8"]);
      else setSelectedKeys(["5"]);
    } else {
      setUseAdminMenu(false);
      if (location.search.length > 0) {
        if (location.pathname.includes("/article")) {
          setSelectedKeys(["4"]);
          new AV.Query("BlogContent")
            .equalTo("id", search.get("id"))
            .find()
            .then((res) => {
              setBlogContent(q2o(res[0]));
            });
        } else setSelectedKeys(["2"]);
      } else {
        if (location.pathname.includes("/tag")) setSelectedKeys(["2"]);
        else if (location.pathname.includes("/article")) setSelectedKeys(["3"]);
        else setSelectedKeys(["1"]);
      }
    }
  }, [location]);

  const [showSidebar, setShowSidebar] = useState(true);

  const upload = () => {
    // 第一步：从 LocalStorage 里拿现在的 meta、tag 数据和原始的数据
    const tags: Tag[] = JSON.parse(localStorage.getItem("tags") as string);
    const blogMeta: BlogMeta[] = JSON.parse(
      localStorage.getItem("blogMeta") as string
    );
    let tagsOriginal: Tag[] = JSON.parse(
      localStorage.getItem("tagsOriginal") as string
    );
    let blogMetaOriginal: BlogMeta[] = JSON.parse(
      localStorage.getItem("blogMetaOriginal") as string
    );
    // 未上传的 meta、tags
    const unmodifiedTags: AV.Object[] = [];
    const unmodifiedMetas: AV.Object[] = [];
    console.log(tags, blogMeta, tagsOriginal, blogMetaOriginal);

    // 第二步：找出所有已经更改的 Meta
    for (let i in blogMeta) {
      const meta = blogMeta[i];
      if (meta.objectId.length <= 0) {
        // This meta hasn't been created yet
        console.log(
          "This meta hasn't been created yet, " + meta.title,
          meta.id
        );
        const newMeta = new AV.Object("BlogMeta");
        newMeta.set("title", meta.title);
        newMeta.set("reader", 1);
        newMeta.set("tags", meta.tags);
        newMeta.set("id", meta.id);
        newMeta.set("isDraft", meta.isDraft);
        unmodifiedMetas.push(newMeta);
      } else {
        // 修改过的 meta
        const original = blogMetaOriginal.find((om) => om.id === meta.id);
        blogMetaOriginal = blogMetaOriginal.filter((om) => om.id !== meta.id);
        if (!original) continue;
        let modifiedMeta: AV.Object | undefined = undefined;
        if (original.title !== meta.title) {
          modifiedMeta = AV.Object.createWithoutData(
            "BlogMeta",
            original.objectId
          );
          modifiedMeta.set("title", meta.title);
        }
        console.log(
          meta.title,
          original.tags,
          meta.tags,
          arrEqual(original.tags, meta.tags)
        );
        if (!arrEqual(original.tags, meta.tags)) {
          if (!modifiedMeta)
            modifiedMeta = AV.Object.createWithoutData(
              "BlogMeta",
              original.objectId
            );
          modifiedMeta.set("tags", meta.tags);
        }
        if (original.isDraft !== meta.isDraft) {
          if (!modifiedMeta)
            modifiedMeta = AV.Object.createWithoutData(
              "BlogMeta",
              original.objectId
            );
          modifiedMeta.set("isDraft", meta.isDraft);
        }
        if (modifiedMeta) {
          unmodifiedMetas.push(modifiedMeta);
        }
      }
    }

    // 第三步：Tags
    for (let i in tags) {
      const tag = tags[i];
      // 按照创建时间降序排序
      tag.ids = blogMeta
        .filter((meta) => tag.ids.includes(meta.id))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((meta) => meta.id);
      if (tag.objectId.length <= 0) {
        console.log(tag);
        console.log("This tag hasn't been created yet, " + tag.name);
        const newTag = new AV.Object("Tags");
        newTag.set("name", tag.name);
        newTag.set("ids", tag.ids);
        unmodifiedTags.push(newTag);
      } else {
        const original = tagsOriginal.find(
          (om) => om.objectId === tag.objectId
        );
        tagsOriginal = tagsOriginal.filter(
          (ot) => ot.objectId !== tag.objectId
        );
        if (!original) continue;
        let modifiedTag: AV.Object | undefined = undefined;
        console.log("original: ", original);
        if (original.name !== tag.name) {
          modifiedTag = AV.Object.createWithoutData("Tags", original.objectId);
          modifiedTag.set("name", tag.name);
        }
        if (!arrEqual(original.ids, tag.ids)) {
          if (!modifiedTag)
            modifiedTag = AV.Object.createWithoutData(
              "Tags",
              original.objectId
            );
          modifiedTag.set("ids", tag.ids);
        }
        if (modifiedTag) {
          unmodifiedTags.push(modifiedTag);
        }
      }
    }

    // 第四步：上传
    console.log(
      unmodifiedMetas,
      unmodifiedTags,
      tagsOriginal,
      blogMetaOriginal
    );
    if (
      unmodifiedMetas.length <= 0 &&
      unmodifiedTags.length <= 0 &&
      tagsOriginal.length <= 0 &&
      blogMetaOriginal.length <= 0
    ) {
      console.log("everything is up-to-date");
      message.info("当前没有需要上传的内容");
    } else {
      AV.Object.saveAll(unmodifiedTags).then(
        () => console.log("tag 上传成功！"),
        (err) => console.log("tag 上传失败，", err)
      );
      AV.Object.saveAll(unmodifiedMetas).then(
        () => console.log("meta 上传成功！"),
        (err) => console.log("meta 上传失败", err)
      );
      for (let i in tagsOriginal)
        AV.Object.createWithoutData("Tags", tagsOriginal[i].objectId).destroy();
      for (let i in blogMetaOriginal)
        AV.Object.createWithoutData(
          "BlogMeta",
          blogMetaOriginal[i].objectId
        ).destroy();
      localStorage.setItem("blogMetaOriginal", JSON.stringify(blogMeta));
      localStorage.setItem("tagsOriginal", JSON.stringify(tags));
      message.success("上传成功");
    }
  };

  return (
    <Layout
      className="App"
      style={{ backgroundColor: "#fafafa", width: "100%" }}
    >
      <Header
        style={{
          boxShadow: "0 5px 20px 0px rgba(0,0,0,0.04)",
          marginBottom: "15px",
        }}
      >
        <Link to="/home">
          <Avatar src={settings.blogIcon} />
        </Link>
        <Space style={{ float: "right" }}>
          {useAdminMenu ? (
            <Button
              type="primary"
              onClick={() => {
                upload();
                authenticated = false;
                navigate("/home");
              }}
            >
              退出登录
            </Button>
          ) : (
            <Button type="primary" onClick={() => navigate("/authentication")}>
              控制台
            </Button>
          )}
        </Space>
      </Header>
      <Content>
        <Row>
          <Col span={2} />
          <Col span={showSidebar ? 12 : 20}>{route}</Col>
          <Col span={showSidebar ? 1 : 2} />
          {showSidebar ? (
            <Col span={7}>
              {!useAdminMenu ? (
                <>
                  <InfoCard>
                    <div style={{ paddingLeft: "20px", paddingRight: "20px" }}>
                      <MdPreview value={"#### 公告\n\n" + settings.bulletin} />
                    </div>
                  </InfoCard>
                  <Card
                    style={{
                      marginTop: "30px",
                      borderRadius: "7px",
                      boxShadow: "0 0 40px 0px rgba(0,0,0,0.04)",
                      width: "100%",
                    }}
                  >
                    <Card.Meta
                      avatar={<Avatar src={settings.avatarURL} />}
                      title={settings.name}
                      description={settings.desc}
                    />
                  </Card>
                </>
              ) : (
                <InfoCard>
                  <strong>保存更改</strong>
                  <p>
                    这个小按钮可以帮你把更改保存至 LeanCloud
                    云端，所以更改后不要忘了保存哦！
                    <br />
                    如果不小心忘了也没关系，在点击“退出登录”时我们会自动帮你保存。
                  </p>
                  <Button type="primary" onClick={upload}>
                    保存更改
                  </Button>
                </InfoCard>
              )}
              <InfoCard>
                {useAdminMenu ? (
                  <Menu
                    mode="inline"
                    theme="light"
                    items={adminItems}
                    defaultSelectedKeys={["5"]}
                    selectedKeys={selectedKeys}
                    selectable={false}
                  />
                ) : (
                  <Menu
                    mode="inline"
                    theme="light"
                    items={items}
                    defaultSelectedKeys={["1"]}
                    selectedKeys={selectedKeys}
                    selectable={false}
                  />
                )}
              </InfoCard>
              <div
                style={{ marginTop: "30px", width: "100%", color: "lightgrey" }}
              >
                Leanite Blog, 版本 0.2.0
              </div>
            </Col>
          ) : (
            <></>
          )}
        </Row>
      </Content>
      <Footer style={{ backgroundColor: "rgba(0,0,0,0)" }} />
      <Spin fullscreen spinning={spinning} />
    </Layout>
  );
}

export default App;
