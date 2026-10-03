# 自定义项目与文章

项目名称和数量不固定。一个内容文件对应一个项目，页面自动读取集合，无需改页面组件或维护 ID 白名单。项目可以为零个、三个或更多；CRM、DianExamer、Contract Agent 仅是原规格中的示例，不是必填项目。

## 新增项目

在 `src/content/projects` 新建 `.md` 文件，例如 `my-project.md`，复制以下结构后填写真实内容：

```markdown
---
title: "我的项目"
summary: "用一两句话说明项目解决的问题。"
startedAt: 2026-10-03
status: exploring
techStack: [Java, Spring Boot]
featured: false
order: 0
draft: true
relatedPosts: []
---

## 背景

介绍项目的目标与使用场景。

## 实践

记录你做了什么，以及如何验证结果。
```

以上日期、标题和技术栈是填写示例，请替换。必填字段为 title、summary、startedAt、status；状态可选 exploring、active、paused、completed、archived。endedAt 和 cover 可选，relatedPosts 填写文章内容 ID，如 spring/feign-dynamic-proxy。

## 修改、排序与展示

- 修改项目文件的元数据或正文即可更新内容。
- `/projects` 展示全部可见项目，按 order 升序、开始日期倒序、ID 升序排序，没有固定数量上限。
- 首页展示全部 `featured: true` 的可见项目；featured 为 false 的项目仍在项目列表展示。
- `draft: true` 仅开发环境可见；改为 false 后，生产构建生成列表和详情。
- 文件 `my-project.md` 对应 `/projects/my-project`；嵌套文件 `team/my-project.md` 对应 `/projects/team/my-project`。重命名或移动文件会改变 URL，已有外链需要自行处理。

## 隐藏与删除

暂时隐藏：将 draft 改为 true，重新构建并发布。永久删除：删除对应内容文件，重新构建并发布。列表、首页和详情产物会随内容自动更新，不需要修改页面代码。部署时采用 [部署文档](DEPLOY.md) 中同步清理旧文件的方式，避免服务器保留已删除的详情页面。

## 自定义文章

文章同样按内容文件增减，放在 `src/content/blog/{分类目录}/{名称}.md`。必填 title、description、publishedAt、category；tags、featured、draft 等可选。正文从 H2 开始，需要组件时使用 `.mdx`。

当前 Feign、Gateway TraceId、Dify 文件为可修改或删除的技术摘要草稿，不是必写文章，也不会进入生产页面。`content-schema-example` 等集合验证示例同样保持草稿。

## 预览与发布

运行 `npm run dev` 预览，包括草稿；运行 `npm run build` 和 `npm run preview` 检查生产可见内容，再按部署文档发布 dist。内容数量与标题由文件决定，构建后生效；本项目当前不提供在线后台编辑功能。

## 自定义 About

修改 src/config/site.ts 的 SITE.about：description 是页面摘要，introduction 为介绍段落数组，focus 为关注方向数组，technology 为技术列表。数组数量自由增减，空数组隐藏对应区块。Currently Exploring 使用 SITE.home.exploring，与首页保持一致。

GitHub 地址填写 SITE.social.github，邮箱填写 SITE.social.email（纯邮箱地址，不加 mailto:）；保持空字符串则不显示对应区块。默认介绍来自现有 Java Developer 与探索方向配置，维护者可替换成自己的真实介绍。重新构建发布后生效。
