import { App, Button } from "antd";
import { publish, subscribe, unsubscribe } from "pubsub-js";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoCard from "../../components/InfoCard";
import AV from "leancloud-storage";
import { type Tag, type BlogMeta, arrEqual } from "../../lib";

let verified = false;
export default function AdminHome() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  useEffect(() => {
    subscribe("setAuth", (_, data) => {
      if (!data) {
        message.error("您需要登录");
        verified = true;
        navigate("/authentication");
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

  return (
    <div>
      <InfoCard>
        <p>
          <h2>Leanite 控制台</h2>
          <strong>使用说明</strong>
          <br />
          <br />
          控制台中，你可以更改文章、标签及设置。
          <br />
          具体帮助详见 <a href="https://github.com/copws/leanite">GitHub</a>。
        </p>
      </InfoCard>
    </div>
  );
}
