import React, { useEffect, useState } from "react";
import AV from "leancloud-storage";
import {
  Col,
  Layout,
  Row,
  Menu,
  Affix,
  Button,
  Space,
  Card,
  Avatar,
  Divider,
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
import { init, q2o, type BlogMeta } from "./lib";
import InfoCard from "./components/InfoCard";
import { Link, useLocation, useNavigate, useRoutes, useSearchParams } from "react-router-dom";
import routes from "./routes";
import { subscribe, unsubscribe, publish } from "pubsub-js";
import { MdCatalog } from "md-editor-rt";

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

new AV.Object("Init").save().then((_) =>
  new AV.Query("Init").find().then((res) => {
    console.log(res.length);
    if (res.length <= 1) init();
    else q2o(res[0]).destroy();
  })
);

let authenticated = false;
function App() {
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
    new AV.Query("BlogMeta").find().then((res) => {
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
    new AV.Query("Tags").find().then((res) => {
      tags = res.map((q) => q2o(q));
      localStorage.setItem("tags", JSON.stringify(tags));
      localStorage.setItem("tagsOriginal", JSON.stringify(tags));
    });
  }
  useEffect(() => {
    updateBlogMeta();
    setTimeout(updateTags, 500);
    new AV.Query("Settings")
      .equalTo("owner", "admin")
      .find()
      .then((res) => {
        settings.name = res[0].get("name");
        settings.desc = res[0].get("desc");
        settings.avatarURL = res[0].get("avatarURL");
        settings.bulletin = res[0].get("bulletin");
        settings.blogIcon = res[0].get("blogIcon");
        setSettings(settings);
        navigate(location.pathname + location.search);
      });
    subscribe("auth", () => {
      authenticated = true;
      navigate("/adminHome");
    });
    subscribe("isAuthed", () => publish("setAuth", authenticated));
    return () => {
      unsubscribe("auth");
    };
  }, []);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [useAdminMenu, setUseAdminMenu] = useState<boolean>(false);
  useEffect(() => {
    if (
      location.pathname.includes("/adminHome") ||
      location.pathname.includes("/modify") ||
      location.pathname.includes("/settings")
    ) {
      setUseAdminMenu(true);
      if (location.pathname.includes("/modifyArticle"))
        setSelectedKeys(["6"]);
      else if (location.pathname.includes("/modifyTags"))
        setSelectedKeys(["7"]);
      else if (location.pathname.includes("/settings"))
        setSelectedKeys(["8"]);
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
        else if (location.pathname.includes("/article"))
          setSelectedKeys(["3"]);
        else setSelectedKeys(["1"]);
      }
    }
  }, [location]);

  let [blogContent, setBlogContent] = useState<AV.Object>();

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
              danger
              type="primary"
              onClick={() => {
                authenticated = false;
                navigate("/home");
              }}
            >
              退出登录
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate("/authentication")}
            >
              控制台
            </Button>
          )}
        </Space>
      </Header>
      <Content>
        <Row>
          <Col span={2} />
          <Col span={12}>{route}</Col>
          <Col span={1} />
          <Col span={7}>
            <InfoCard>
              <h3>公告</h3>
              <div style={{ textAlign: "center" }}>{settings.bulletin}</div>
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
              Leanite Blog, 版本 0.1.0
            </div>
          </Col>
        </Row>
      </Content>
      <Footer style={{ backgroundColor: "rgba(0,0,0,0)" }} />
    </Layout>
  );
}

export default App;
