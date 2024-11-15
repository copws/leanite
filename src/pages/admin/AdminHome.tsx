import { message, Button } from "antd";
import { publish, subscribe, unsubscribe } from "pubsub-js";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoCard from "../../components/InfoCard";
import AV from "leancloud-storage";
import { Tag, BlogMeta, arrEqual } from "../../lib";

let verified = false;
export default function AdminHome() {
  const navigate = useNavigate();
  useEffect(() => {
    subscribe("setAuth", (_, data) => {
      if (!data) {
        message.error("您需要登录");
        verified = true;
        navigate("/leanite/authentication");
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

  const upload = () => {
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
    const unmodifiedTags: AV.Object[] = [];
    const unmodifiedMetas: AV.Object[] = [];
    console.log(tags, blogMeta, tagsOriginal, blogMetaOriginal);
    for (let i in blogMeta) {
      const meta = blogMeta[i];
      if (meta.objectId.length <= 0) {
        console.log("This meta hasn't created yet, " + meta.title, meta.id);
        const newMeta = new AV.Object("BlogMeta");
        newMeta.set("title", meta.title);
        newMeta.set("reader", 1);
        newMeta.set("tags", meta.tags);
        newMeta.set("id", meta.id);
        unmodifiedMetas.push(newMeta);
      } else {
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
        if (modifiedMeta) {
          unmodifiedMetas.push(modifiedMeta);
        }
      }
    }

    for (let i in tags) {
      const tag = tags[i];
      if (tag.objectId.length <= 0) {
        console.log("This tag hasn't created yet, " + tag.name);
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
        if (original.name !== tag.name) {
          modifiedTag = AV.Object.createWithoutData("Tags", original.objectId);
          modifiedTag.set("name", tag.name);
        }
        if (!arrEqual(original.ids, tag.ids)) {
          if (!modifiedTag)
            modifiedTag = AV.Object.createWithoutData(
              "tags",
              original.objectId
            );
          modifiedTag.set("ids", tag.ids);
        }
        if (modifiedTag) {
          unmodifiedTags.push(modifiedTag);
        }
      }
    }

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
    )
      console.log("everything is up-to-date");
    else {
      AV.Object.saveAll(unmodifiedTags).then(() =>
        console.log("tag 上传成功！")
      );
      AV.Object.saveAll(unmodifiedMetas).then(() =>
        console.log("meta 上传成功！")
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
    }
  };
  return (
    <div>
      <InfoCard>
        <strong>Leanite 控制台</strong>
        <p>
          这个小按钮可以帮你把更改保存至 LeanCloud
          云端，所以更改后不要忘了保存哦！
          <br />
          但是文章内容的编辑和设置选项是直接保存的，无需通过这个按钮。
        </p>
        <Button type="primary" onClick={upload}>
          上传至云端
        </Button>
      </InfoCard>
      <InfoCard>
        <p>
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
