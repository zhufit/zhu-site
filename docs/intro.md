# ZHU Personal Site

## Astro 个人技术站工程脚手架与 TODO V1.0

---

# 1. 项目目标

建设一个长期维护的个人网站，用于：

1. 技术文章沉淀
2. 项目实践与探索记录
3. 个人技术主页展示
4. 后续扩展摄影作品展示
5. 后续根据需要扩展搜索、RSS、评论、访问统计等能力

项目不是：

- 后台管理系统
- CMS
- 多用户博客平台
- Java Web 服务
- SPA 管理后台

核心定位：

> 一个以 Git + Markdown/MDX 为内容数据源，以 Astro 为页面和构建层，以静态 HTML/CSS/JS 为最终产物的个人技术网站。

---

# 2. V1 范围

V1 开发：

```text
Home
Writing
Writing Detail
Projects
Project Detail
About
404
```

预留但不开发：

```text
Photography
```

明确暂不开发：

```text
登录
注册
用户体系
数据库
后台管理
CMS
评论
点赞
收藏
阅读量
全文搜索
RSS
复杂 SEO
SSR
后端 API
CI/CD
摄影 Lightbox
对象存储
访问统计
```

---

# 3. 技术架构

```text
                  Git Repository
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    Astro Pages      Markdown/MDX     Assets
        │               │               │
        └───────────────┼───────────────┘
                        │
                   Astro Build
                        │
                        ▼
                      dist/
                        │
                   rsync / scp
                        │
                        ▼
                 Ubuntu 云服务器
                        │
                      Caddy
                        │
                      HTTPS
                        │
                        ▼
                     Browser
```

---

# 4. 技术栈

```text
Astro
TypeScript
Markdown
MDX
Astro Content Collections
Zod Schema
Astro Components
原生 CSS
少量 Vanilla TypeScript
Git
Caddy
```

禁止第一阶段主动引入：

```text
React
Vue
Svelte
Tailwind
Bootstrap
Element Plus
Ant Design
Pinia
Redux

MySQL
PostgreSQL
Redis

Express
NestJS
Spring Boot

Docker Runtime
```

除非后续需求明确要求。

---

# 5. 核心设计原则

## 5.1 Static First

所有公开页面原则上在：

```bash
npm run build
```

阶段生成。

生产服务器：

```text
不运行 Astro Server
不运行 Node Server
不运行数据库
```

只运行：

```text
Caddy
```

---

## 5.2 Content First

文章和项目数据不硬编码到页面。

数据来自：

```text
src/content/
```

页面通过 Content Collections 查询。

---

## 5.3 UI 与内容分离

```text
Content
    ↓
Markdown / MDX

UI
    ↓
Layouts / Components / Styles

Route
    ↓
Pages
```

修改 UI 不应要求修改文章正文。

---

## 5.4 Git 是 Source of Truth

真正的数据源：

```text
Git Repository
```

服务器上的：

```text
/var/www/zhu-site
```

只是部署产物。

不要在服务器直接修改文章。

---

## 5.5 不做后台式 UI

视觉上禁止倾向：

```text
Dashboard
侧边栏后台
大量 Card
每块区域都有边框
大量阴影
大量胶囊标签
数据统计面板
```

整体方向：

```text
排版优先
大留白
弱边框
少卡片
强层级
轻动效
内容驱动
```

---

# 6. 初始化项目

要求：

```text
Node.js >= 22.12
npm
Git
```

初始化：

```bash
npm create astro@latest zhu-site
```

推荐：

```text
Template: Empty
TypeScript: Strict
Install dependencies: Yes
Initialize Git: Yes
```

进入项目：

```bash
cd zhu-site
```

添加 MDX：

```bash
npx astro add mdx
```

启动：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

生产预览：

```bash
npm run preview
```

---

# 7. 最终工程目录

```text
zhu-site/
│
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   │
│   └── static/
│       └── README.md
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── common/
│   │   │   ├── blog/
│   │   │   └── projects/
│   │   │
│   │   └── icons/
│   │
│   ├── components/
│   │   │
│   │   ├── common/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Container.astro
│   │   │   ├── PageHeader.astro
│   │   │   └── ThemeToggle.astro
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.astro
│   │   │   ├── Exploring.astro
│   │   │   ├── SelectedProjects.astro
│   │   │   └── LatestWriting.astro
│   │   │
│   │   ├── writing/
│   │   │   ├── ArticleItem.astro
│   │   │   ├── ArticleMeta.astro
│   │   │   ├── ArticleTags.astro
│   │   │   ├── ArticleToc.astro
│   │   │   └── ArticleNavigation.astro
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectItem.astro
│   │   │   ├── ProjectHero.astro
│   │   │   ├── ProjectTechStack.astro
│   │   │   ├── ProjectTimeline.astro
│   │   │   └── RelatedWriting.astro
│   │   │
│   │   └── photography/
│   │       └── .gitkeep
│   │
│   ├── config/
│   │   └── site.ts
│   │
│   ├── content/
│   │   │
│   │   ├── blog/
│   │   │   ├── java/
│   │   │   ├── spring/
│   │   │   ├── database/
│   │   │   ├── architecture/
│   │   │   ├── docker/
│   │   │   └── ai/
│   │   │
│   │   ├── projects/
│   │   │   ├── crm.md
│   │   │   ├── dianexamer.md
│   │   │   └── contract-agent.md
│   │   │
│   │   └── photography/
│   │       └── .gitkeep
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ArticleLayout.astro
│   │   ├── ProjectLayout.astro
│   │   └── PhotographyLayout.astro
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── 404.astro
│   │   │
│   │   ├── writing/
│   │   │   ├── index.astro
│   │   │   └── [...id].astro
│   │   │
│   │   ├── projects/
│   │   │   ├── index.astro
│   │   │   └── [...id].astro
│   │   │
│   │   └── photography/
│   │       └── index.astro
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── reset.css
│   │   ├── global.css
│   │   ├── typography.css
│   │   ├── article.css
│   │   └── utilities.css
│   │
│   ├── utils/
│   │   ├── content.ts
│   │   ├── date.ts
│   │   └── reading-time.ts
│   │
│   └── content.config.ts
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── CONTENT.md
│   ├── DEPLOY.md
│   └── TODO.md
│
├── .gitignore
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

---

# 8. Content Collections

创建：

```text
src/content.config.ts
```

实现：

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),

  schema: z.object({
    title: z.string(),

    description: z.string(),

    publishedAt: z.coerce.date(),

    updatedAt: z.coerce.date().optional(),

    category: z.string(),

    tags: z.array(z.string()).default([]),

    cover: z.string().optional(),

    featured: z.boolean().default(false),

    draft: z.boolean().default(false),

    series: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '**/*.{md,mdx}',
  }),

  schema: z.object({
    title: z.string(),

    summary: z.string(),

    startedAt: z.coerce.date(),

    endedAt: z.coerce.date().optional(),

    status: z.enum([
      'exploring',
      'active',
      'paused',
      'completed',
      'archived',
    ]),

    techStack: z.array(z.string()).default([]),

    cover: z.string().optional(),

    featured: z.boolean().default(false),

    order: z.number().default(0),

    draft: z.boolean().default(false),

    relatedPosts: z.array(z.string()).default([]),
  }),
});

const photography = defineCollection({
  loader: glob({
    base: './src/content/photography',
    pattern: '**/*.{md,mdx}',
  }),

  schema: z.object({
    title: z.string(),

    description: z.string().optional(),

    publishedAt: z.coerce.date(),

    shotAt: z.coerce.date().optional(),

    location: z.string().optional(),

    camera: z.string().optional(),

    lens: z.string().optional(),

    cover: z.string(),

    photos: z.array(
      z.object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
      }),
    ).default([]),

    featured: z.boolean().default(false),

    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
  projects,
  photography,
};
```

Photography Collection 仅用于预留。

V1 不开发正式 Photography UI。

---

# 9. Site Config

创建：

```text
src/config/site.ts
```

内容：

```typescript
export const SITE = {
  name: 'ZHU.',
  title: 'ZHU.',
  description: '技术、项目与正在发生的探索。',
  author: 'Zhu',

  navigation: [
    {
      name: 'Writing',
      href: '/writing',
    },
    {
      name: 'Projects',
      href: '/projects',
    },
    {
      name: 'About',
      href: '/about',
    },
  ],

  social: {
    github: '',
    email: '',
  },
};
```

不要把站点名称、作者、导航配置散落在组件中。

---

# 10. Astro Config

```text
astro.config.mjs
```

保持简单：

```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',

  integrations: [
    mdx(),
  ],
});
```

不得配置：

```text
SSR
Node Adapter
Server Mode
```

---

# 11. Blog 数据规范

文章目录：

```text
src/content/blog/
```

分类暂定：

```text
java
spring
database
architecture
docker
ai
```

示例：

```text
src/content/blog/spring/feign-dynamic-proxy.md
```

内容：

```markdown
---
title: "重新理解 Feign 动态代理"
description: "记录 Feign Client 从创建代理到完成 HTTP 调用的完整过程。"
publishedAt: 2026-10-03
category: "Spring"
tags:
  - Java
  - Spring Cloud
  - Feign
featured: true
draft: false
---

# 背景

最近重新整理 Feign 的调用机制。

## 从接口开始

正文……
```

---

# 12. Draft 规则

开发环境：

```text
允许查看 draft
```

生产构建：

```text
draft = true
```

必须过滤。

统一通过：

```text
src/utils/content.ts
```

实现。

不要在每个页面重复：

```typescript
!entry.data.draft
```

---

# 13. content.ts

至少提供以下统一查询：

```typescript
getPublishedPosts()

getLatestPosts(limit)

getFeaturedPosts()

getPostsByCategory(category)

getPostsByTag(tag)

getPublishedProjects()

getFeaturedProjects()

getProjectById(id)
```

统一负责：

```text
Draft过滤
日期排序
Featured筛选
```

页面层不实现重复数据规则。

---

# 14. 日期规范

创建：

```text
src/utils/date.ts
```

统一格式：

```text
2026.10.03
```

提供：

```typescript
formatDate(date: Date): string
```

整个网站禁止混用：

```text
2026-10-03
October 3
03/10/2026
```

---

# 15. Writing URL

采用：

```text
/writing/{content-id}
```

例如文件：

```text
blog/spring/feign-dynamic-proxy.md
```

对应：

```text
/writing/spring/feign-dynamic-proxy
```

动态路由：

```text
src/pages/writing/[...id].astro
```

通过：

```typescript
getStaticPaths()
```

生成。

---

# 16. Project 数据规范

示例：

```text
src/content/projects/contract-agent.md
```

内容：

```markdown
---
title: "Contract Agent"
summary: "合同 OCR、审核工作流以及 Agent 应用场景探索。"
startedAt: 2026-09-21

status: active

techStack:
  - Java
  - Spring Boot
  - Dify
  - DeepSeek
  - GLM-OCR

featured: true
order: 1
draft: false

relatedPosts:
  - ai/glm-ocr
  - ai/dify-agent
---

# Background

项目背景……

# Architecture

架构……

# Exploration

探索过程……

# Retrospective

阶段总结……
```

---

# 17. Project 页面不能复制 Blog 页面

Project 页面必须拥有独立视觉结构。

推荐：

```text
PROJECT NAME

Project Description

2026 → NOW


01
BACKGROUND


02
PROBLEM


03
ARCHITECTURE


04
TECH STACK


05
EXPLORATION


06
RELATED WRITING


07
RETROSPECTIVE
```

不要显示传统博客元素：

```text
作者
评论数
博客发布时间突出展示
分类面包屑
```

---

# 18. 首页

首页：

```text
/
```

第一版固定结构：

```text
HEADER


HERO

ZHU.

Java Developer
Building systems,
exploring AI,
writing what I learn.


CURRENTLY EXPLORING

AI Application
System Design
Cloud Native


SELECTED PROJECTS

Contract Agent
CRM
DianExamer


LATEST WRITING

文章 1
文章 2
文章 3


FOOTER
```

首页数据必须来自 Content Collections。

不要把：

```text
Contract Agent
CRM
DianExamer
```

直接硬编码在首页组件里。

---

# 19. Writing 页面

```text
/writing
```

推荐：

```text
WRITING

关于技术、项目和过程中留下的记录。


All
Java
Spring
Architecture
Database
Docker
AI


2026

10.03
重新理解 Feign 动态代理

09.27
Dify 部署踩坑记录

09.21
GLM-OCR 文件识别实践
```

第一版分类筛选可以：

```text
纯链接
```

不要求 SPA 筛选。

---

# 20. Article 页面

结构：

```text
CATEGORY

文章标题

Description

2026.10.03
8 min read


────────────────────────


正文


                TOC
                Background
                Architecture
                Problem
                Summary


────────────────────────


Tags

Previous / Next
```

正文最大宽度：

```text
720px ~ 780px
```

避免文章正文铺满屏幕。

---

# 21. Projects 页面

```text
/projects
```

不要做 Card Grid 后台风格。

建议：

```text
PROJECTS


01

CONTRACT AGENT

OCR / Agent / Workflow

合同 OCR、审核工作流与 Agent 应用探索。

                              Explore →


02

CRM

Microservice / RPC / Observability

企业级 Java 技术栈复盘项目。

                              Explore →


03

DIANEXAMER

Parser / Spring Boot

试题文档解析与结构化探索。

                              Explore →
```

主要依赖：

```text
编号
字体
留白
分隔
排版
```

建立层级。

---

# 22. About 页面

第一版保持简单。

包括：

```text
个人简介

当前方向

技术关键词

正在探索

GitHub

联系方式
```

不要做：

```text
技能百分比进度条

Java ████████ 95%
MySQL ███████ 90%
```

---

# 23. Photography

路由预留：

```text
/photography
```

第一期：

可以不加入 Navigation。

页面只需要：

```text
Photography

Coming later.
```

或者完全不建立公开入口。

但保留：

```text
Content Schema
Components Directory
Layout
Content Directory
```

后续不修改现有架构即可开发。

---

# 24. CSS 架构

## tokens.css

统一管理 Design Tokens。

初始版本：

```css
:root {
  --font-sans:
    Inter,
    "PingFang SC",
    "Microsoft YaHei",
    sans-serif;

  --font-mono:
    "JetBrains Mono",
    "SFMono-Regular",
    Consolas,
    monospace;

  --color-bg: #f7f7f5;
  --color-surface: #ffffff;

  --color-text: #171717;
  --color-text-secondary: #686868;
  --color-text-muted: #969696;

  --color-border: rgba(0, 0, 0, 0.08);

  --content-width: 1180px;
  --article-width: 760px;

  --radius-sm: 6px;
  --radius-md: 12px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  --transition-fast: 160ms ease;
  --transition-normal: 260ms ease;
}
```

允许开发过程中调整具体颜色。

但所有页面必须优先消费 Token。

---

# 25. reset.css

只做必要 Reset：

```text
box-sizing
body margin
img max-width
button font inherit
anchor inherit color
```

禁止引入大型 CSS Reset Framework。

---

# 26. global.css

负责：

```text
body
background
默认文字
链接
selection
全局容器
页面基础间距
```

不要放 Article 专属样式。

---

# 27. typography.css

统一：

```text
h1
h2
h3
h4
paragraph
small
code
blockquote
```

重点保证：

```text
中文
英文
代码
```

混排可读性。

---

# 28. article.css

只用于 Markdown / MDX 正文。

至少覆盖：

```text
p
h1-h4
ul
ol
blockquote
pre
code
table
img
hr
a
```

代码块必须：

```text
支持横向滚动
不会突破正文宽度
移动端正常显示
```

---

# 29. Responsive

Breakpoints 不要过度复杂。

建议：

```text
Desktop
>= 1024

Tablet
768 - 1023

Mobile
< 768
```

重点测试：

```text
1440
1280
1024
768
390
375
```

---

# 30. JavaScript 原则

默认：

```text
No Client JS
```

仅这些场景允许增加：

```text
Theme Toggle
Mobile Menu
Reading Progress
Search
Photography Lightbox
```

V1 尽量保持极少 JavaScript。

---

# 31. 图片规则

普通文章和项目图片：

```text
src/assets/images/
```

分类：

```text
blog/
projects/
common/
```

优先：

```text
WebP
AVIF
SVG
```

不要提交：

```text
RAW
巨大 PNG
几十 MB 原图
```

---

# 32. 摄影图片未来规则

原始照片：

```text
本地硬盘 / NAS / 云盘
```

网站仅保存发布版本。

未来：

```text
Astro
   │
   ├── 页面
   │
   └── Photo URL
            │
            ▼
       COS / R2 / CDN
```

不能把摄影 RAW 仓库化。

---

# 33. Header

导航：

```text
ZHU.        Writing    Projects    About
```

要求：

```text
简洁
无后台 Sidebar
支持 Mobile
当前页面状态清晰
```

V1 不显示：

```text
Photography
```

---

# 34. Footer

只需要：

```text
© Year Zhu

GitHub
```

允许增加一句简短文字。

禁止做大型 Footer Sitemap。

---

# 35. BaseLayout

负责：

```text
HTML Document
SEO Meta
Header
Main
Footer
Global CSS
```

Props：

```typescript
title?: string
description?: string
image?: string
```

统一组合：

```text
Page Title - ZHU.
```

---

# 36. ArticleLayout

负责：

```text
Article Header
Meta
Content
TOC
Tags
Article Navigation
```

文章页面不得自己重新实现这些公共结构。

---

# 37. ProjectLayout

负责：

```text
Project Hero
Content
Tech Stack
Related Writing
```

但允许项目 MDX 插入独立组件。

---

# 38. MDX 原则

普通内容：

```text
.md
```

只有确实需要组件时：

```text
.mdx
```

典型 MDX：

```text
架构交互图
Timeline
Benchmark
Demo
特殊视觉内容
```

不要所有文章都使用 MDX。

---

# 39. README

根目录 README 必须说明：

```text
项目是什么

技术栈

如何启动

如何写文章

如何发布

目录结构
```

---

# 40. docs/ARCHITECTURE.md

记录：

```text
整体架构

为什么使用 Astro

为什么不使用数据库

为什么使用 Markdown

部署结构

Photography 扩展方案
```

---

# 41. docs/CONTENT.md

记录文章规范：

```text
Frontmatter

文件命名

分类

Tag

Draft

Featured

Markdown

MDX
```

---

# 42. docs/DESIGN.md

记录：

```text
设计原则

Design Tokens

Typography

Spacing

Responsive

Component Rules
```

---

# 43. docs/DEPLOY.md

记录：

```text
Build

服务器目录

Caddy

rsync

故障恢复
```

---

# 44. docs/TODO.md

以下 TODO 同步维护到：

```text
docs/TODO.md
```

---

# TODO-00 环境验证

## 目标

确认开发机器可以正常运行 Astro。

## 内容

- [ ] 检查 Node 版本
- [ ] Node >= 22.12
- [ ] 初始化 Astro
- [ ] npm install 成功
- [ ] npm run dev 成功
- [ ] npm run build 成功

## 验收

```bash
npm run build
```

无错误。

---

# TODO-01 基础工程初始化

- [ ] 创建目录结构
- [ ] 删除 Astro 示例页面
- [ ] 创建 docs
- [ ] 创建 assets
- [ ] 创建 components
- [ ] 创建 layouts
- [ ] 创建 content
- [ ] 创建 utils
- [ ] 创建 config
- [ ] 创建 styles
- [ ] 配置 MDX
- [ ] 配置 static output

## 验收

项目目录符合脚手架。

构建成功。

---

# TODO-02 Content Collections

- [ ] 创建 content.config.ts
- [ ] 创建 Blog Collection
- [ ] 创建 Projects Collection
- [ ] 创建 Photography Collection
- [ ] Schema 类型校验
- [ ] 创建测试文章
- [ ] 创建测试项目
- [ ] 验证错误 Frontmatter 可以在构建时发现

## 验收

合法 Markdown 正常构建。

错误 Schema 构建失败。

---

# TODO-03 Content Utils

创建：

```text
src/utils/content.ts
```

实现：

- [ ] getPublishedPosts
- [ ] getLatestPosts
- [ ] getFeaturedPosts
- [ ] getPostsByCategory
- [ ] getPostsByTag
- [ ] getPublishedProjects
- [ ] getFeaturedProjects

创建：

```text
src/utils/date.ts
```

实现：

- [ ] formatDate

创建：

```text
src/utils/reading-time.ts
```

实现：

- [ ] 基础阅读时间计算

## 验收

所有 Pages 不重复实现 Draft、排序等规则。

---

# TODO-04 Design Foundation

实现：

```text
tokens.css
reset.css
global.css
typography.css
utilities.css
```

完成：

- [ ] 字体体系
- [ ] 颜色体系
- [ ] 间距体系
- [ ] 页面宽度
- [ ] Article 宽度
- [ ] Border
- [ ] Transition
- [ ] Desktop
- [ ] Mobile

## 注意

现在不要追求最终视觉效果。

先建立可统一修改的设计基础。

---

# TODO-05 Base Components

开发：

- [ ] Container
- [ ] Header
- [ ] Footer
- [ ] PageHeader

Header：

```text
ZHU.   Writing   Projects   About
```

移动端必须可用。

## 验收

所有基础页面拥有统一 Header/Footer。

---

# TODO-06 BaseLayout

开发：

```text
BaseLayout.astro
```

实现：

- [ ] HTML
- [ ] lang
- [ ] title
- [ ] description
- [ ] viewport
- [ ] favicon
- [ ] basic OG
- [ ] global CSS
- [ ] Header
- [ ] Footer

## 验收

后续页面不得重复 HTML Shell。

---

# TODO-07 首页

实现：

```text
/
```

组件：

- [ ] Hero
- [ ] Exploring
- [ ] SelectedProjects
- [ ] LatestWriting

数据：

```text
SelectedProjects
    ↓
featured Project

LatestWriting
    ↓
最新 Blog
```

禁止硬编码文章列表。

## 验收

新增文章后首页自动变化。

---

# TODO-08 Writing List

实现：

```text
/writing
```

功能：

- [ ] 获取全部已发布文章
- [ ] 日期倒序
- [ ] 按年份显示
- [ ] 显示日期
- [ ] 标题
- [ ] Description
- [ ] Category
- [ ] Tag 基础展示

暂不做 JS 动态过滤。

## 验收

新增 Markdown 后自动进入 Writing。

---

# TODO-09 Article Layout

实现：

```text
ArticleLayout.astro
```

包括：

- [ ] Category
- [ ] Title
- [ ] Description
- [ ] Published Date
- [ ] Updated Date
- [ ] Reading Time
- [ ] Content
- [ ] Tags
- [ ] Previous
- [ ] Next

---

# TODO-10 Article Dynamic Route

实现：

```text
/writing/[...id]
```

使用：

```text
getStaticPaths
render
```

生成全部文章详情。

## 验收

例如：

```text
src/content/blog/spring/feign-dynamic-proxy.md
```

最终：

```text
/writing/spring/feign-dynamic-proxy
```

正常访问。

---

# TODO-11 Article Typography

完成：

- [ ] H1
- [ ] H2
- [ ] H3
- [ ] Paragraph
- [ ] Link
- [ ] List
- [ ] Blockquote
- [ ] Inline Code
- [ ] Code Block
- [ ] Image
- [ ] Table
- [ ] HR

重点测试：

```text
中文长文章
Java Code
Shell Code
JSON
架构截图
大表格
```

---

# TODO-12 Projects List

实现：

```text
/projects
```

读取 Projects Collection。

按照：

```text
order
```

优先排序。

页面不要做传统 Card Grid。

---

# TODO-13 Project Detail

实现：

```text
/projects/[...id]
```

支持：

```text
Markdown
MDX
```

实现：

- [ ] Project Hero
- [ ] Status
- [ ] Tech Stack
- [ ] Project Content
- [ ] Related Writing

---

# TODO-14 真实内容导入

不要继续使用 Lorem Ipsum。

Projects：

- [ ] CRM
- [ ] DianExamer
- [ ] Contract Agent

Writing 至少准备：

- [ ] Feign 动态代理
- [ ] Gateway TraceId
- [ ] Dify 部署踩坑

内容暂时可以是摘要版。

重点验证真实标题长度和内容表现。

---

# TODO-15 About

实现：

```text
/about
```

内容：

```text
Introduction
Focus
Currently Exploring
Technology
GitHub
Contact
```

保持简单。

---

# TODO-16 404

实现：

```text
404.astro
```

保持整个站点视觉一致。

不要使用 Astro 默认 404。

---

# TODO-17 Responsive

逐页面验证：

```text
1440
1280
1024
768
390
375
```

检查：

- [ ] Header
- [ ] Hero
- [ ] Writing
- [ ] Article
- [ ] Code
- [ ] Table
- [ ] Projects
- [ ] Project Detail
- [ ] Footer

不得出现：

```text
Horizontal Page Overflow
文字溢出
代码撑破页面
图片撑破页面
```

---

# TODO-18 Accessibility 基础

至少完成：

- [ ] Semantic HTML
- [ ] 图片 alt
- [ ] Keyboard Focus
- [ ] Button / Anchor 正确语义
- [ ] Heading 顺序
- [ ] 色彩可读性

不要求 V1 做完整 WCAG 审计。

---

# TODO-19 Build Verification

执行：

```bash
npm run build
```

必须：

```text
0 Error
```

检查：

```text
dist/
```

确认存在：

```text
index.html

writing/

projects/

about/

404.html 或对应 Astro 构建结构

_astro/
```

---

# TODO-20 Production Preview

运行：

```bash
npm run preview
```

完整检查生产构建版本。

不要只检查：

```text
npm run dev
```

---

# TODO-21 Deployment Documentation

编写：

```text
docs/DEPLOY.md
```

目标服务器：

```text
Ubuntu
2GB RAM
40GB Disk
```

部署目录：

```text
/var/www/zhu-site
```

---

# TODO-22 Caddy

目标配置：

```text
your-domain.com {
    root * /var/www/zhu-site

    encode zstd gzip

    file_server
}
```

实际域名部署阶段再配置。

---

# TODO-23 手动部署脚本

后续增加：

```text
scripts/deploy.sh
```

基本流程：

```bash
npm run build

rsync -avz --delete \
  dist/ \
  user@server:/var/www/zhu-site/
```

服务器信息禁止硬编码提交到公共仓库。

---

# TODO-24 README 完善

必须说明：

## 开发

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## 新建文章

```text
src/content/blog/{category}/{slug}.md
```

## 草稿

```yaml
draft: true
```

## 发布

修改：

```yaml
draft: false
```

Build + Deploy。

---

# 45. 写文章工作流

创建：

```text
src/content/blog/java/thread-pool.md
```

写：

```yaml
draft: true
```

然后：

```bash
npm run dev
```

本地完成文章。

准备发布：

```yaml
draft: false
```

提交：

```bash
git add .

git commit -m "post: thread pool"
```

生产发布：

```bash
npm run build
```

上传：

```text
dist/
```

---

# 46. Git Commit 建议

使用简单规范：

```text
feat:
fix:
refactor:
style:
docs:
post:
project:
chore:
```

例如：

```text
feat: add writing pages

post: add feign dynamic proxy

project: update contract agent

style: refine article typography

fix: mobile header overflow
```

---

# 47. Codex 开发规则

Codex 实现过程中必须遵守：

## Rule 1

不要擅自增加需求。

本 TODO 没有要求的系统不要主动实现。

---

## Rule 2

不要为了“架构完整”引入：

```text
数据库
API层
Repository
Service层
用户系统
认证系统
状态管理
```

---

## Rule 3

每完成一个 TODO 阶段：

执行：

```bash
npm run build
```

如果失败，先修复。

不要带着构建错误继续开发下一个模块。

---

## Rule 4

优先使用：

```text
Astro Native
HTML
CSS
TypeScript
```

不要遇到 UI 就安装第三方组件库。

---

## Rule 5

新增 npm dependency 前必须判断：

> 原生 Astro / CSS / TS 是否已经能简单实现？

能实现则不增加依赖。

---

## Rule 6

避免过度组件化。

不要创建：

```text
Title.astro
Subtitle.astro
Text.astro
Date.astro
Space.astro
```

这种没有实际抽象价值的组件。

---

## Rule 7

同时避免超大组件。

页面如果超过合理复杂度，应抽取明确业务区块。

例如：

```text
Hero
LatestWriting
SelectedProjects
```

---

## Rule 8

Content 数据不得散落。

文章和项目数据必须来自：

```text
Content Collections
```

---

## Rule 9

视觉避免后台化。

禁止未经要求加入：

```text
左侧 Sidebar
Dashboard Card
Admin 风格 Table
大量阴影
大量边框
大量 Gradient
```

---

## Rule 10

设计修改优先修改：

```text
tokens.css
```

避免大量局部魔法数字。

---

# 48. Codex 第一轮执行范围

第一次执行不要直接做完整网站。

第一轮只完成：

```text
TODO-00
↓
TODO-01
↓
TODO-02
↓
TODO-03
↓
TODO-04
↓
TODO-05
↓
TODO-06
```

即：

```text
工程
Content
Utility
Design Foundation
Header/Footer
BaseLayout
```

完成后停止。

---

# 49. 第二轮执行范围

完成：

```text
TODO-07
TODO-08
TODO-09
TODO-10
TODO-11
```

即：

```text
首页
Writing
Article
```

---

# 50. 第三轮执行范围

完成：

```text
TODO-12
TODO-13
TODO-14
TODO-15
TODO-16
```

即：

```text
Projects
真实内容
About
404
```

---

# 51. 第四轮执行范围

完成：

```text
TODO-17
TODO-18
TODO-19
TODO-20
```

即：

```text
响应式
Accessibility
Build
Production Preview
```

---

# 52. 第五轮执行范围

最后完成：

```text
TODO-21
TODO-22
TODO-23
TODO-24
```

即：

```text
Deployment
Caddy
Deploy Script
README
```

---

# 53. V1 Definition of Done

满足以下条件才认为 V1 完成：

- [ ] 首页正常访问
- [ ] Writing 正常访问
- [ ] Markdown 可以生成文章
- [ ] MDX 可以生成文章
- [ ] Projects 正常访问
- [ ] Project Detail 正常
- [ ] Content Schema 有类型验证
- [ ] Draft 不进入生产站点
- [ ] Featured 数据正常
- [ ] 首页数据非硬编码
- [ ] 文章日期排序正确
- [ ] PC 正常
- [ ] Mobile 正常
- [ ] 无明显横向滚动问题
- [ ] npm run build 成功
- [ ] npm run preview 正常
- [ ] dist 可由普通静态服务器直接托管
- [ ] Production 不依赖 Node Runtime
- [ ] Production 不依赖数据库
- [ ] 文档完整
- [ ] Photography 架构已预留但未过度实现

---

# 54. V1 之后

V1 完成后，再单独评估：

```text
V1.1

Dark Mode
Article TOC
Reading Progress
Copy Code Button
```

之后：

```text
V1.2

Search
RSS
Sitemap
SEO
```

之后：

```text
V1.3

Photography
Gallery
Series
Lightbox
Photo Metadata
COS / R2
```

之后再考虑：

```text
Comments
Analytics
CI/CD
```

不要提前实现。

---

# 55. 最终目标架构

```text
                         ZHU.

                           │
                  Personal Website
                           │
                         Astro
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
    Writing             Projects          Photography
       │                   │                    │
 Markdown / MDX      Markdown / MDX      Markdown + Photo
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                    Content Collections
                           │
                       Astro Build
                           │
                         dist/
                           │
                         Caddy
                           │
                         HTTPS
                           │
                         User
```

核心长期原则：

> Git 保存内容，Markdown 负责写作，Astro 负责组织和展示，Caddy 负责发布。

不要让这个项目逐渐演变成一个为了写博客而维护的复杂业务系统。