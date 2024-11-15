import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import AV from "leancloud-storage";
import { LEANCLOUD_SERVER_URL, LEANCLOUD_APPID, LEANCLOUD_APPKEY } from "./lib";

AV.init({
  appId: LEANCLOUD_APPID,
  appKey: LEANCLOUD_APPKEY,
  serverURL: LEANCLOUD_SERVER_URL,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerBg: "white",
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
