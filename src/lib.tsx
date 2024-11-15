import { message } from "antd";
import AV from "leancloud-storage";
import marked from "./marked";

export function init() {
  const done = new AV.Object("Init");
  const leaniteInfo = new AV.Object("LeaniteInfo");
  leaniteInfo.set("version", "0.1.0");
  const blogMeta = new AV.Object("BlogMeta");
  blogMeta.set("title", "Hello World!");
  blogMeta.set("id", "1");
  blogMeta.set("reader", 1); //显示时候要减1！！
  blogMeta.set("tags", ["Leanite"]);
  const blogContent = new AV.Object("BlogContent");
  blogContent.set("title", "Hello World!");
  blogContent.set("id", "1");
  blogContent.set(
    "content",
    `**欢迎使用 Leanite！**这是你的第一篇博客。\n\n访问 [Leanite 的 GitHub 仓库](https://github.com/copws/leanite/) 获取更多信息。`
  );
  const settings = new AV.Object("Settings");
  settings.set("owner", "admin");
  settings.set("bulletin", "Hello, World!")
  const tag = new AV.Object("Tags");
  tag.set("name", "Leanite");
  tag.set("ids", ["1"]);

  AV.Object.saveAll([
    done,
    leaniteInfo,
    blogMeta,
    blogContent,
    settings,
    tag,
  ]).then(
    (_) => message.success("初始化成功！"),
    (_) => message.error("初始化失败")
  );
}

export function MDParse(str: string | null) {
  if (str) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: marked(str) as string,
        }}
      />
    );
  }
}

export const q2o = (q: AV.Queriable) =>
  AV.parseJSON(q.toFullJSON()) as AV.Object;

export interface BlogMeta {
  title: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  reader: number;
  tags: string[];
  objectId: string;
}

export interface Tag {
  createdAt: string;
  updatedAt: string;
  objectId: string;
  name: string;
  ids: string[];
}

export function arrEqual(m1: string[], m2: string[]) {
  for (let i in m1) {
    const element = m1[i];
    if (!m2.find((m) => m === element)) {
      return false;
    }
  }
  return true;
}

export const LEANCLOUD_APPID = "6etdzH2DJEoNM5Dq80rfyljk-gzGzoHsz";
export const LEANCLOUD_APPKEY = "3EThSFNCw1QZRRN2JyGNneq5";
export const LEANCLOUD_SERVER_URL = "https://6etdzh2d.lc-cn-n1-shared.com";

export const blank = <text style={{ color: "rgba(255,255,255,0)" }}>iii</text>;
