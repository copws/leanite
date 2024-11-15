import React, { useEffect } from "react";
import { md5 } from "js-md5";
import { Form, FormProps, Input, Button, message } from "antd";
import InfoCard from "../components/InfoCard";
import { publish } from "pubsub-js";
import AV from "leancloud-storage";

type FieldType = {
  username?: string;
  password?: string;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
  if (
    md5((values.username as string) + "+" + md5(values.password as string)) ===
      passkey1 &&
    md5((values.password as string) + "+" + md5(values.username as string)) ===
      passkey2
  ) {
    message.success("验证成功！");
    publish("auth");
  } else message.error("验证失败！");
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  for (let i in errorInfo.errorFields)
    message.error(errorInfo.errorFields[i].errors);
};

let passkey1: string;
let passkey2: string;
export default function Authentication() {
  useEffect(() => {
    new AV.Query("Settings")
      .equalTo("owner", "admin")
      .find()
      .then((res) => {
        const i = res[0];
        passkey1 = i.get("passkey1");
        passkey2 = i.get("passkey2");
      });
  }, []);

  return (
    <InfoCard>
      <Form
        name="basic"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
          <h3>管理员登录</h3>
        </Form.Item>
        <Form.Item<FieldType>
          label="账号"
          name="username"
          rules={[{ required: true, message: "请输入管理员账号" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入管理员密码" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
          <Button type="primary" htmlType="submit">
            确认
          </Button>
        </Form.Item>
      </Form>
    </InfoCard>
  );
}
