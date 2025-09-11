# Leanite

基于 LeanCloud 和 React 的动态博客系统。去我们的 [Leanite 开发日志](https://copws.github.io/leanite) 预览博客效果。

核心组件：

- React.js
- UI：Ant Design
- LeanCloud：leancloud-storage
- MarkDown 编辑和预览：[md-editor-rt](https://github.com/imzbf/md-editor-rt)

## 如何部署

Step 1. 到 [LeanCloud 官网](https://www.leancloud.cn/)注册一个账号，然后创建一个项目（开发版，商用版均可），在设置-应用凭证中复制 AppID、AppKey（别复制成 私钥 MasterKey 了，小心数据泄露）、REST API 服务器地址，保存备用；

Step 2. 安装 Node.js 及 NPM。将本项目代码 Clone 一份到本地，终端打开项目文件夹输入 **npm i**；

Step 3. 改代码！每个地方都要仔细检查：

1. 项目文件夹根目录（下文称 /）下 index.html，可以改网站图标和名称。图标放在 /public 目录下（网站名、图标这些设置除非重新 build，否则无法在 Leanite 设置页更改）；
2. /vite.config.ts 下第 54 行 basename 更改为你网站的网址。如果网站域名后面的斜杠后还有东西（比如常见的 GitHub Page，如本项目开发日志 copws.github.io/leanite/ 后面有 /leanite/），则须一起补上；
3. /src/lib.tsx 下第 4-6 行三个有关 LeanCloud 项目的常量 appId、appKey、serverURL 分别替换成你刚刚复制的；
4. 如果网站域名斜杠后面有刚刚所述的东西，则打开 /src/main.tsx，第32行 \<BrowserRouter> 更改为 \<BrowserRouter basename="/leanite/">，其中"/leanite/"的内容依据你网站的具体情况而定，如a.com/aaa/ 则更改为 "/aaa/"

Step 4. 终端打开项目文件夹，输入 **npm run build**。dist 文件夹下的文件就是网站内容了。你可以上传到 GitHub 部署到 Pages，或是任何服务器中。

Step 5. 等待GitHub Pages/服务器部署完毕，打开你网站的网页，Leanite 会自动帮你初始化数据库，然后就可以尽情使用了！

## 特别说明

对于开发版项目，LeanCloud 默认提供 1GB 的标准空间和 10GB  的文件存储空间。后期开发可能会将博客内容转存至文件空间中，但目前还是存储在 1GB  的标准空间中。所以对博客的长度和数量有如下限制：单篇博客不能大于 128KB（UTF-8 约 4 万字），总大小不能超过 1GB（保险起见在  5000 篇博客左右）。当然如果你购买了商用版，总大小的限制可以忽略。
