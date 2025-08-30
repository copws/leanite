import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, message, Space, Popconfirm } from "antd";
import { subscribe, publish, unsubscribe } from "pubsub-js";
import InfoCard from "../../components/InfoCard";
import AV from "leancloud-storage";
import { md5 } from "js-md5";
import OptionCard from "../../components/OptionCard";

let verified = false;
const settings = {
  name: "",
  desc: "",
  avatarURL: "",
  bulletin: "",
  blogIcon: "",
};
let id: string;
export default function Settings() {
  const navigate = useNavigate();
  const reset = () => {
    setName(settings.name);
    setDesc(settings.desc);
    setAvatarURL(settings.avatarURL);
    setBulletin(settings.bulletin);
    setBlogIcon(settings.blogIcon);
    navigate("/settings");
  };
  useEffect(() => {
    subscribe("setAuth", (_, data) => {
      if (!data) {
        message.error("您需要登录");
        verified = true;
        navigate("/authentication");
      } else {
        id = "";
        new AV.Query("Settings")
          .equalTo("owner", "admin")
          .find()
          .then((res) => {
            id = res[0].get("objectId");
            settings.name = res[0].get("name");
            settings.desc = res[0].get("desc");
            settings.avatarURL = res[0].get("avatarURL");
            settings.bulletin = res[0].get("bulletin");
            settings.blogIcon = res[0].get("blogIcon");
            reset();
          });
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

  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [avatarURL, setAvatarURL] = useState<string>("");
  const [bulletin, setBulletin] = useState<string>("");
  const [blogIcon, setBlogIcon] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleDone = () => {
    const unuploaded = AV.Object.createWithoutData("Settings", id);
    unuploaded.set("name", name);
    unuploaded.set("desc", desc);
    unuploaded.set("avatarURL", avatarURL);
    unuploaded.set("bulletin", bulletin);
    unuploaded.set("blogIcon", blogIcon);
    unuploaded.set("passkey1", md5(username + "+" + md5(password)));
    unuploaded.set("passkey2", md5(password + "+" + md5(username)));
    unuploaded.save().then(() => {
      message.success("保存成功！");
      navigate("/home");
    });
  };
  return (
    <>
      <InfoCard>
        <Space style={{ width: "100%" }}>
          <h2>设置</h2>
          <Button style={{ float: "right" }} onClick={reset}>
            撤销
          </Button>
          <Popconfirm
            title="确认保存"
            description={"你确定要保存设置吗？此操作不可撤销。"}
            onConfirm={handleDone}
            okText="确认"
            cancelText="取消"
            style={{ float: "right" }}
          >
            <Button type="primary">保存</Button>
          </Popconfirm>
        </Space>
        <h3>个人信息</h3>
        <OptionCard>
          名称：
          <Input
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="取个名字吧……"
          />
        </OptionCard>
        <OptionCard>
          简介：
          <Input
            value={desc}
            onChange={(e) => setDesc(e.currentTarget.value)}
          />
        </OptionCard>
        <OptionCard>
          头像 URL：
          <Input
            value={avatarURL}
            onChange={(e) => setAvatarURL(e.currentTarget.value)}
            placeholder="头像 URL……"
          />
        </OptionCard>
      </InfoCard>
      <InfoCard>
        <h3>公告板</h3>
        <OptionCard>
          <Space direction="vertical">
            公告信息：
            <Input.TextArea
              value={bulletin}
              style={{ width: "100%" }}
              onChange={(e) => setBulletin(e.currentTarget.value)}
              placeholder="写些什么吧……"
            />
          </Space>
        </OptionCard>
      </InfoCard>
      <InfoCard>
        <h3>博客配置</h3>
        <OptionCard>
          博客左上角图标 URL：
          <Input
            value={blogIcon}
            onChange={(e) => setBlogIcon(e.currentTarget.value)}
            placeholder="图标 URL……"
          />
        </OptionCard>
      </InfoCard>
      <InfoCard>
        <h3>账号信息</h3>
        由于您的账号密码被加密存储，我们并不知道具体信息。所以此处没有提供您之前的信息，敬请谅解！
        <OptionCard>
          用户名：
          <Input
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            placeholder="用户名"
          />
        </OptionCard>
        <OptionCard>
          密码：
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="密码"
          />
        </OptionCard>
      </InfoCard>
    </>
  );
}
