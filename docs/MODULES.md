# 模块划分

来源：[intro.md](intro.md)。需求见 [REQUIREMENTS.md](REQUIREMENTS.md)，执行清单见 [TODO.md](TODO.md)。路径描述目标工程结构；当前已初始化基础工程，模块实现状态以 TODO.md 为准。

## 模块与职责

| 编号 | 模块 | 主要路径/接口 | 职责与边界 | TODO | 原文 |
| --- | --- | --- | --- | --- | --- |
| M-01 | 工程与配置 | astro.config.mjs、tsconfig.json、src/config/site.ts | 严格 TS、MDX、static output；集中管理站名、作者、导航、社交链接 | 00–01 | §6–7、9–10 |
| M-02 | 内容模型 | src/content.config.ts、src/content/{blog,projects,photography} | glob 读取 md/mdx、Zod 验证 Frontmatter；摄影仅预留 | 02、14 | §8、11、16、23 |
| M-03 | 内容查询与工具 | src/utils/{content,date,reading-time}.ts | 统一草稿过滤、排序、精选/分类/标签查询、项目查询、日期格式、阅读时间 | 03 | §12–14 |
| M-04 | 设计基础 | src/styles/{tokens,reset,global,typography,article,utilities}.css | 全局 Token、必要 reset、基础排版、正文样式；正文样式不混入 global | 04、11、17–18 | §24–29 |
| M-05 | 公共组件与布局 | components/common、layouts/BaseLayout.astro | Container、Header、Footer、PageHeader；统一 HTML、Meta、全局 CSS 和页面框架 | 05–06 | §33–35 |
| M-06 | 首页 | pages/index.astro、components/home | Hero、Exploring、SelectedProjects、LatestWriting；列表消费内容查询 | 07 | §18 |
| M-07 | Writing | pages/writing、components/writing、layouts/ArticleLayout.astro | 年份列表、嵌套 ID 静态详情、元数据、正文、标签、相邻文章；TOC 版本待确认 | 08–11 | §15、19–20、36 |
| M-08 | Projects | pages/projects、components/projects、layouts/ProjectLayout.astro | 按 order 展示、静态详情、Hero、状态、时间、技术栈、关联文章；独立视觉结构 | 12–14 | §16–17、21、37 |
| M-09 | 个人与兜底页面 | pages/about.astro、pages/404.astro | 简单个人介绍、联系方式、自定义错误页 | 15–16 | §22 |
| M-10 | 摄影扩展预留 | components/photography、content/photography、layouts/PhotographyLayout.astro | 保留扩展结构；无正式画廊、Lightbox 或对象存储，公开占位路由可选 | 01–02 | §23、32、54 |
| M-11 | 构建与质量验证 | dist、build/preview | 响应式、可访问性、静态路径、生产草稿过滤、构建产物验证 | 17–20 | §29、53 |
| M-12 | 文档与发布 | README.md、docs、scripts/deploy.sh、Caddy | 写作规范、架构/设计/部署文档、手动部署与恢复说明；环境参数外置 | 21–24 | §39–46 |

## 内容模型

具体 Zod 示例保留在原文 §8；此表归纳字段，不新增模型。

| 集合 | 必填字段 | 可选字段 | 默认值 |
| --- | --- | --- | --- |
| blog | title、description、publishedAt、category | updatedAt、cover、series | tags=[]、featured=false、draft=false |
| projects | title、summary、startedAt、status | endedAt、cover | techStack=[]、featured=false、order=0、draft=false、relatedPosts=[] |
| photography（预留） | title、publishedAt、cover | description、shotAt、location、camera、lens | photos=[]、featured=false、draft=false |

项目 status：exploring、active、paused、completed、archived。摄影 photos 每项必须有 src、alt，caption 可选；日期字段使用日期转换校验。

## 查询接口

content.ts 至少提供：getPublishedPosts、getLatestPosts(limit)、getFeaturedPosts、getPostsByCategory(category)、getPostsByTag(tag)、getPublishedProjects、getFeaturedProjects、getProjectById(id)。日期工具提供 formatDate(date: Date): string；阅读时间工具提供 calculateReadingTime(content: string): number。（§13–14、TODO-03）

TODO-03 已实现：开发环境可见草稿，生产环境统一过滤；文章日期倒序，项目 order 升序后按 startedAt 倒序，再按 ID 稳定排序。分类和标签精确匹配，未知或不可见项目返回 undefined。日期按 UTC 格式化；阅读时间返回估算分钟数。

路由和 UI 消费统一查询结果，不重复草稿过滤和排序。首页内容、项目关联文章也遵循生产可见性规则。

## 依赖与数据流

内容文件 → Content Collections/Schema → content.ts → Pages/Layouts/Components → Astro Build → dist → Caddy → 浏览器。

site.ts 提供站点配置；CSS Tokens 为布局和组件提供统一视觉基础。Pages 负责路由与组合，Layouts 负责公共结构，Components 负责具有实际复用价值的业务区块。文章正文无需随 UI 调整而改写。（§3、5、47、55）

## 发布与写作工作流

在 src/content/blog/{category}/{slug}.md 创建 draft=true 的文章 → dev 本地预览 → 完成后改为 draft=false → Git 提交 → build → 上传 dist。服务器仅存放部署产物。普通文章使用 Markdown，需要独立组件时才使用 MDX。（§38、45）

Git 提交建议前缀：feat、fix、refactor、style、docs、post、project、chore。（§46）

## 实施分轮

1. 基础：TODO-00–06，完成后停止该轮。
2. 首页与文章：TODO-07–11。
3. 项目与个人页面：TODO-12–16。
4. 质量验证：TODO-17–20。
5. 发布与文档：TODO-21–24。

分轮来自原文 §48–52，不构成本次启动开发的指令。完整目录和代码示例见原文 §7–10、24。

## 首页实施状态（TODO-07）

M-06 已实现 Hero、Exploring、SelectedProjects、LatestWriting。首页通过 Promise.all 查询精选项目与最新三篇文章，统一由 content.ts 决定可见性与排序。个人介绍配置保存在 SITE.home，不硬编码文章/项目列表。新增文章自动进入首页的验收测试已通过；真实内容和目标详情页面仍按后续任务推进。

## Writing 列表实施状态（TODO-08）

M-07 的 /writing 和 ArticleItem 已实现。页面调用 getPublishedPosts，按 UTC 年份进行展示分组；过滤、日期排序与稳定排序由 content.ts 负责。文章分类和标签为静态文本，暂无筛选路由或客户端交互。新增文章和年份边界的构建验收测试已通过，ArticleLayout 和详情路由仍在后续任务。

## 文章公共布局实施状态（TODO-09）

M-07 的 ArticleLayout、ArticleMeta、ArticleTags、ArticleNavigation 已实现；ArticleTags 同时供列表条目复用。ArticleLayout 消费可见 Post 并计算基础阅读时间，正文通过 slot 渲染，SEO 和全局框架复用 BaseLayout。

M-03 增加 getPostNavigation(id): Promise<{ previous?: Post; next?: Post }>，在可见文章序列中寻找相邻条目，previous 为更早、next 为更新；未找到当前条目返回空对象。正式 getStaticPaths/render 详情路由在 TODO-10 实现。

M-08 的 TODO-12–13 已完成：Projects 列表与静态详情共享统一可见性和排序，ProjectStatus 统一状态展示，ProjectLayout 提供 Hero、元信息、Markdown/MDX 正文和 Related Writing。getRelatedPosts 按配置顺序解析、去重并过滤缺失/不可见文章；TODO-14 已按用户要求改为自定义内容维护，项目名称与数量不固定，维护者通过内容文件自由增减。
