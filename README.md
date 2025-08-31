# Leanite

去我们的 [Leanite 开发日志](https://copws.github.io/leanite) 预览博客效果。基于 LeanCloud 和 React 的动态博客系统。练手项目，有缘维护。

核心组件：

- React.js
- UI：Ant Design
- LeanCloud：leancloud-storage
- MarkDown 编辑和预览：[md-editor-rt](https://github.com/imzbf/md-editor-rt)

## 部署

首先安装 node.js 与 npm。具体教程省略，网上很多。然后在 [LeanCloud](https://www.leancloud.cn/) 上创建一个项目。在项目设置-应用凭证上有 AppId、AppKey、REST API 服务器地址三个值。复制下来以备后用。

![img1](http://lc-0GpGhECr.cn-n1.lcfile.com/EJxTTkAMHOp4KKQG9lscwfdBVurzUwfA/Snipaste_2025-08-31_17-11-51.png)

然后 Clone 一下 leanite 的 GitHub 仓库。终端打开仓库地址，执行 npm install 安装依赖。打开 src/lib.tsx，将刚刚的 AppID、AppKey、服务器地址分别填入第 4-6 行 LEANCLOUD_APPID、LEANCLOUD_APPKEY、LEANCLOUD_SERVER_URL 这三个变量中。

打开 vite.config.ts，将“base”替换成你将部署网站的网址。

打开 src/main.tsx，将“basename”变量替换为你网址的子路径。如 "1.com/leanite/" 即为 “/leanite”，“1.com/”即为 “/”。

打开 index.html，配置 HTML 信息（这里默认大家都会一点 HTML），如网页标题，网页图标等。

终端执行 npm run build 打包。打包出来的文件在 dist/ 下。将这些部署到你的服务器/GitHub Pages 上，大功告成！

## Tip

Leanite 博客内容通过 LeanCloud 的存储库进行存储。对于开发版项目，LeanCloud 默认提供 1GB 的标准空间和 10GB 的文件存储空间。后期开发可能会将博客内容转存至文件空间中，但目前还是存储在 1GB 的标准空间中。所以对博客的长度和数量有如下限制：单篇博客不能大于 128KB（UTF-8 约 4 万字），总大小不能超过 1GB（保险起见在 5000 篇博客左右）。当然如果你购买了商用版，总大小的限制可以忽略。
