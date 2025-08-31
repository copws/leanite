import { message } from "antd";
import AV from "leancloud-storage";

export const LEANCLOUD_APPID = "appID";
export const LEANCLOUD_APPKEY = "appKey";
export const LEANCLOUD_SERVER_URL = "serverURL";

export async function init() {
  console.log("正在初始化")
  const done = new AV.Object("Init");
  await done.save();

  const blogMeta = new AV.Object("BlogMeta");
  blogMeta.set("title", "Hello World!");
  blogMeta.set("id", "1");
  blogMeta.set("reader", 1); //显示时候要减1！！
  blogMeta.set("tags", ["Leanite"]);
  blogMeta.set("isDraft", false);
  await blogMeta.save();
  console.log("meta")

  const blogContent = new AV.Object("BlogContent");
  blogContent.set("title", "Hello World!");
  blogContent.set("id", "1");
  blogContent.set(
    "content",
    `欢迎使用 Leanite！这是你的第一篇博客。我们已为你成功初始化你的 LeanCloud 数据库。恭喜你已经完成了 Leanite 的部署。
## 介绍一下 Leanite 吧
Leanite 是**基于 React.js 和 LeanCloud 云服务器的动态博客系统**。从现在开始，你在 Leanite 上的所有数据均会被保存在 LeanCloud 上你的数据库中。LeanCloud 对于你的数据有相应的隐私政策，所以不必担心你的数据会泄露，感兴趣可以自行查阅（作者和 LeanCloud 官方无关！只是一个小用户）。

对于开发版项目，LeanCloud 默认提供 1GB 的标准空间和 10GB 的文件存储空间。后期开发可能会将博客内容转存至文件空间中，但目前还是存储在 1GB 的标准空间中。所以对博客的长度和数量有如下限制：单篇博客不能大于 128KB（UTF-8 约 4 万字），总大小不能超过 1GB（保险起见在 5000 篇博客左右）。当然如果你购买了商用版，总大小的限制可以忽略。

## 关于使用
Leanite 的设计应该还是十分易用的，只需要你掌握基本的 MarkDown 语法即可使用（公告栏也支持 MarkDown 哦！）。“首页”展示了最近的 5 条博客。“标签”展示了博客的分类。“归档”页面展示了你记录博客的历程。

要写博客或是进行其它设置，你需要登录管理员账号（**默认用户名密码均为 admin**，之后可以在设置页更改）。写博客时，博客可以存草稿或是发布出去。你还可以使用标签方便的管理你的博客。除此之外你还可以在“设置”页自定义一些信息。后面会开放更多的设置选项。

还有在管理员页面进行任何更改之后都不要忘记保存哦！否则会有一些诡异的事情发生。更改不保存，亲人两行泪。
    `
  );
  blogContent.set("isDraft", false);
  await blogContent.save();
  console.log("content")

  const settings = new AV.Object("Settings");
  settings.set(
    "bulletin",
    "欢迎使用 Leanite！\n\n要设置公告内容，请登录管理员账号，在“设置”页操作。"
  );
  settings.set(
    "avatarURL",
    "http://lc-6etdzh2d.cn-n1.lcfile.com/HE7ePMwKDptJHqMi04x4ASrI9e78SEzy/27_16_34_19_bxs-pyramid.png"
  );
  settings.set(
    "blogIcon",
    "http://lc-6etdzh2d.cn-n1.lcfile.com/HE7ePMwKDptJHqMi04x4ASrI9e78SEzy/27_16_34_19_bxs-pyramid.png"
  );
  settings.set("name", "Leanite 博客");
  settings.set("desc", "转到“设置”更新描述");
  settings.set("passkey1", "3badf0f910f3dbe49c67c9c0feddf4ce");
  settings.set("passkey2", "3badf0f910f3dbe49c67c9c0feddf4ce");
  await settings.save();
  console.log("settings")

  const tag = new AV.Object("Tags");
  tag.set("name", "Leanite");
  tag.set("ids", ["1"]);
  await tag.save();
  console.log("tag")
}

// LeanCloud 传回来的数据是 AV.Queriable，同时应对 AV.Object 与 AV.File 两种情况
// AV.Queriable 转 AV.Object
// q: LeanCloud 查询结果
// 返回值：对应的 AV.Object
export const q2o = (q: AV.Queriable) =>
  AV.parseJSON(q.toFullJSON()) as AV.Object;

// 标准头文件 BlogMeta 接口
export interface BlogMeta {
  title: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  reader: number;
  tags: string[];
  objectId: string;
  isDraft: boolean;
}

export interface Tag {
  createdAt: string;
  updatedAt: string;
  objectId: string;
  name: string;
  ids: string[];
}

export function arrEqual(m1: string[], m2: string[]) {
  if (m1.length !== m2.length) return false;
  for (let i in m1) {
    if (m1[i] !== m2[i]) return false;
  }
  return true;
}

export const blank = <text style={{ color: "rgba(255,255,255,0)" }}>iii</text>;
