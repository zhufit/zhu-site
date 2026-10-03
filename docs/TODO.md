# TODO 执行清单

来源：[intro.md](intro.md) §44、TODO-00–24。以下保留原始任务编号、内容和验收标准，任务状态随开发进度更新。需求见 [REQUIREMENTS.md](REQUIREMENTS.md)，模块对应关系见 [MODULES.md](MODULES.md)。

## 执行顺序

| 轮次 | 任务 | 交付 |
| --- | --- | --- |
| 1 | TODO-00–06 | 工程、内容模型、工具、设计基础、公共组件、BaseLayout |
| 2 | TODO-07–11 | 首页、文章列表与详情、正文排版 |
| 3 | TODO-12–16 | 项目列表与详情、真实内容、About、404 |
| 4 | TODO-17–20 | 响应式、可访问性、构建和生产预览 |
| 5 | TODO-21–24 | 部署文档、Caddy、手动脚本、README |

每完成一个开发阶段必须先通过 npm run build；第一轮完成后停止，再按后续轮次推进。（原文 §47–52）

## 原清单遗漏的补充项

以下均来自已有要求，属于拆分时补齐的追踪项，不新增产品范围。

- [x] TODO-01 / M-01：创建 src/config/site.ts，集中管理站点名称、作者、导航、社交链接。（§9）
- [x] TODO-03 / M-03：实现 getProjectById(id)；原文 §13 有要求，TODO-03 未列出。
- [x] TODO-01 / M-10：保留摄影组件目录、内容目录和 Layout；正式摄影 UI 留待后续。（§23）
- [x] TODO-02 / M-10：创建摄影 Content Schema。（§8）
- [ ] TODO-21–24 / M-12：补齐 docs/ARCHITECTURE.md、CONTENT.md、DESIGN.md；原文 §40–42 有要求，但原任务清单未单列。
- [ ] TODO-19–20 / M-11：核对生产构建不生成草稿详情，列表、精选和关联文章不暴露草稿。（§12、53）
- [ ] 开发前明确 TOC 版本归属、分类筛选范围、项目排序细则、阅读时间与文章导航规则；差异见 REQUIREMENTS.md。

## 原始任务

### TODO-00 环境验证

状态：已完成（2026-10-03）。Node v26.0.0、npm 11.12.1、Astro 7.3.5；npm install 成功，开发服务首页 HTTP 200，npm run build 成功并生成 dist/index.html。采用官方手动初始化方式保留现有 docs，未执行 Git 操作。

#### 目标

确认开发机器可以正常运行 Astro。

#### 内容

- [x] 检查 Node 版本
- [x] Node >= 22.12
- [x] 初始化 Astro
- [x] npm install 成功
- [x] npm run dev 成功
- [x] npm run build 成功

#### 验收

```bash
npm run build
```

无错误。

---

### TODO-01 基础工程初始化

状态：已完成（2026-10-03）。基础目录与 .gitkeep 已建立；未引入 Astro 示例页，验证首页已使用 SITE 配置；MDX 8.0.2 与 static output 已配置。临时 MDX 页面编译成功，移除验证页面后 npm run build 再次通过。业务组件、样式、集合与路由按后续任务实现，未提前创建空业务实现。

- [x] 创建目录结构
- [x] 删除 Astro 示例页面
- [x] 创建 docs
- [x] 创建 assets
- [x] 创建 components
- [x] 创建 layouts
- [x] 创建 content
- [x] 创建 utils
- [x] 创建 config
- [x] 创建 styles
- [x] 配置 MDX
- [x] 配置 static output

#### 验收

项目目录符合脚手架。

构建成功。

---

### TODO-02 Content Collections

状态：已完成（2026-10-03）。src/content.config.ts 已定义 Blog、Projects、Photography 三个集合，与原规格字段、默认值、日期转换和状态枚举一致。新增 Markdown/MDX 测试文章与 Markdown 测试项目，均为 draft=true；Photography 仅预留 Schema，无正式 UI。

验收记录：npm run test:content 验证集合加载、嵌套 ID、默认值、日期转换、Markdown/MDX 渲染；缺失标题、错误日期、字符串布尔值、非法项目状态与照片缺失 alt 均使构建失败。测试临时文件和路由已清理，最终 npm run build 成功。摄影目录无发布内容，空集合提示属当前预留状态。

- [x] 创建 content.config.ts
- [x] 创建 Blog Collection
- [x] 创建 Projects Collection
- [x] 创建 Photography Collection
- [x] Schema 类型校验
- [x] 创建测试文章
- [x] 创建测试项目
- [x] 验证错误 Frontmatter 可以在构建时发现

#### 验收

合法 Markdown 正常构建。

错误 Schema 构建失败。

---

### TODO-03 Content Utils

状态：已完成（2026-10-03）。内容查询集中在 src/utils/content.ts：开发环境允许草稿，生产过滤草稿；所有精选、分类、标签与项目 ID 查询复用统一可见性规则。文章按发布日期倒序；项目按 order 升序、startedAt 倒序；相同排序值按内容 ID 升序稳定输出。分类和标签精确匹配，未知项目或生产草稿返回 undefined。

日期工具按 UTC 输出 YYYY.MM.DD，非法日期抛出 RangeError。calculateReadingTime 返回估算分钟数：中文 300 字/分钟、英文 200 词/分钟，混排合计向上取整；有文字至少 1 分钟，空内容为 0。基本去除 Frontmatter、HTML 标签、图片与链接目标；代码文本参与估算，复杂 MDX 不作完整语法分析。

验证：npm run test:utils 通过 3 项日期/阅读时间测试与真实 Astro 生产构建、开发 HTTP 服务的查询集成测试；覆盖草稿隔离、排序、精选、分类/标签、ID 查询、limit=0 和非法 limit。临时路由、内容和服务已清理；最终 npm run build 通过。

创建：

```text
src/utils/content.ts
```

实现：

- [x] getPublishedPosts
- [x] getLatestPosts
- [x] getFeaturedPosts
- [x] getPostsByCategory
- [x] getPostsByTag
- [x] getPublishedProjects
- [x] getFeaturedProjects
- [x] getProjectById（补齐原文 §13 的查询接口）

创建：

```text
src/utils/date.ts
```

实现：

- [x] formatDate

创建：

```text
src/utils/reading-time.ts
```

实现：

- [x] 基础阅读时间计算

#### 验收

所有 Pages 不重复实现 Draft、排序等规则。

---

### TODO-04 Design Foundation

状态：已完成（2026-10-03）。五个基础样式文件已创建并按顺序接入验证首页：字体、颜色、间距、1180px 内容宽度、760px 文章宽度、边框/圆角和过渡统一由 Token 管理；流式字号、页面边距与区块间距覆盖桌面和移动端。补充 focus-visible、selection、减少动效偏好，未引入样式框架或主题切换。

验证：npm run build 成功，生产 HTML 包含打包样式；Token 引用和 1440/1280/1024/768/390/375px 布局尺寸计算通过。当前浏览器工具不可用，未进行浏览器视觉实测；逐页视觉验收保留在 TODO-17。职责与使用方式见 [DESIGN.md](DESIGN.md)。

实现：

```text
tokens.css
reset.css
global.css
typography.css
utilities.css
```

完成：

- [x] 字体体系
- [x] 颜色体系
- [x] 间距体系
- [x] 页面宽度
- [x] Article 宽度
- [x] Border
- [x] Transition
- [x] Desktop
- [x] Mobile

#### 注意

现在不要追求最终视觉效果。

先建立可统一修改的设计基础。

---

### TODO-05 Base Components

状态：已完成（2026-10-03）。Container、Header、Footer、PageHeader 已实现并接入当前唯一基础页面（验证首页）。Container 支持块级标签、文章宽度、class 与 HTML 属性；Header 读取 SITE.navigation，桌面横排、移动端换行显示全部导航，无客户端 JS；精确路径使用 aria-current=page，详情路径使用 aria-current=location。Footer 展示构建年份和作者，配置 GitHub 地址后才显示有效链接。PageHeader 统一标题及可选描述。

验收：npm run build 成功；构建产物验证首页、临时 Writing 列表、详情和相似前缀路由的导航状态、Container 渲染、Footer 和无客户端 JS。临时路由全部清理，最终产物仅保留首页。浏览器工具仍不可用，移动端实现使用可换行布局和 48px 导航触达高度，实际视觉检查保留在 TODO-17；公共 HTML Shell 在 TODO-06 实现。

开发：

- [x] Container
- [x] Header
- [x] Footer
- [x] PageHeader

Header：

```text
ZHU.   Writing   Projects   About
```

移动端必须可用。

#### 验收

所有基础页面拥有统一 Header/Footer。

---

### TODO-06 BaseLayout

状态：已完成（2026-10-03）。BaseLayout.astro 统一 HTML Document、zh-CN、UTF-8、viewport、页面标题、description、favicon、基础 OG、五个全局 CSS、Header、Main 和 Footer。接收 title/description/image 可选 Props；页面标题统一为“页面标题 - ZHU.”，首页及空标题使用站点标题，空描述回退到站点描述。首页已迁移，页面只组织业务内容，不再重复 HTML Shell。

验收：npm run build 成功；构建产物核对唯一 HTML/head/body/main、标题和描述默认值/覆盖/转义、favicon 复制、OG 属性、全局 CSS 与无客户端 JS。临时配置 site 验证正式页面 URL 与相对分享图片解析成功；未配置域名时省略 og:url 和相对 og:image，绝对 HTTP(S) 图片可直接传入。临时路由全部清理，最终构建通过。实际域名和分享封面仍由部署/内容阶段配置。

第一轮 TODO-00–06 已完成；按原文 §48 停止本轮，不提前执行 TODO-07。

开发：

```text
BaseLayout.astro
```

实现：

- [x] HTML
- [x] lang
- [x] title
- [x] description
- [x] viewport
- [x] favicon
- [x] basic OG
- [x] global CSS
- [x] Header
- [x] Footer

#### 验收

后续页面不得重复 HTML Shell。

---

### TODO-07 首页

状态：已完成（2026-10-03）。首页已通过 BaseLayout 和 Container 组合 Hero、Exploring、SelectedProjects、LatestWriting。个人角色、介绍与探索方向集中在 SITE.home；精选项目调用 getFeaturedProjects，最新三篇文章调用 getLatestPosts(3)，页面和组件不重复草稿过滤或排序。项目/文章标题、摘要、技术栈、日期与嵌套 ID 链接均来自集合数据；空集合显示简短空态，未硬编码文章或项目列表。

验收：npm run test:home 通过真实构建验证，覆盖最新三篇的倒序与数量限制、精选项目排序、非精选排除、草稿排除及新增文章自动更新；只有一个 H1，无客户端 JS。临时内容全部清理，最终 npm run build 通过。现有文章与项目均为测试草稿，因此生产首页呈现空态；真实内容导入仍在 TODO-14，目标详情路由按后续任务实现。

构建提示：保留空 Photography 集合提示；当前 Astro/MDX 工具链在查询集合时还会提示内部 use astro:head-inject 指令警告，本次首页数据与输出验证正常。浏览器视觉检查仍在 TODO-17。

实现：

```text
/
```

组件：

- [x] Hero
- [x] Exploring
- [x] SelectedProjects
- [x] LatestWriting

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

#### 验收

新增文章后首页自动变化。

---

### TODO-08 Writing List

状态：已完成（2026-10-03）。/writing 使用 BaseLayout、Container、PageHeader 和 ArticleItem，统一调用 getPublishedPosts；按 UTC 年份分组并保持查询返回的日期倒序，不在页面重复草稿过滤和排序。展示完整 YYYY.MM.DD 日期、标题、摘要、分类和基础标签；空标签不渲染列表，空内容显示简短空态。分类和标签仅静态展示，不添加筛选路由或客户端 JS。

验收：npm run test:writing 通过真实静态构建验证，覆盖全部已发布文章、同日期稳定顺序、多年份分组、跨时区年份边界、分类/标签与摘要、草稿过滤、嵌套 ID 链接、当前导航和新增 Markdown 自动进入列表。临时内容已清理，最终 npm run build 成功；生产列表因当前内容均为草稿而显示空态。已有工具链警告沿用 TODO-07 记录，浏览器视觉验收仍在 TODO-17。

实现：

```text
/writing
```

功能：

- [x] 获取全部已发布文章
- [x] 日期倒序
- [x] 按年份显示
- [x] 显示日期
- [x] 标题
- [x] Description
- [x] Category
- [x] Tag 基础展示

暂不做 JS 动态过滤。

#### 验收

新增 Markdown 后自动进入 Writing。

---

### TODO-09 Article Layout

状态：已完成（2026-10-03）。ArticleLayout 接收类型化 Post，组合 BaseLayout、760px Container、文章 Header、ArticleMeta、默认正文 slot、ArticleTags 和 ArticleNavigation。展示分类、标题、摘要、发布日期、可选更新时间和统一估算阅读时间；标签组件同时由 Writing 列表复用。文章 OG 类型为 article，标题/描述/分享图片复用 BaseLayout。

导航：content.ts 新增 getPostNavigation(id)，复用可见文章的日期倒序。上一篇指向更早条目，下一篇指向更新条目；缺失边界不显示空链接，未知或生产不可见文章返回空导航。组件不重复草稿过滤和排序。

验收：npm run test:article-layout 使用临时路由验证 Markdown/MDX slot、日期/更新时间、阅读时间、标签、OG、相邻文章及草稿隔离；无更新时间/无标签时不生成对应内容，最新文章无下一篇。npm run test:writing 回归通过，临时路由和内容已清理，最终 npm run build 成功。正式详情路由仍在 TODO-10，正文精细排版仍在 TODO-11；TOC 按已记录的版本边界留待后续。

实现：

```text
ArticleLayout.astro
```

包括：

- [x] Category
- [x] Title
- [x] Description
- [x] Published Date
- [x] Updated Date
- [x] Reading Time
- [x] Content
- [x] Tags
- [x] Previous
- [x] Next

---

### TODO-10 Article Dynamic Route

状态：已完成（2026-10-03）。新增 src/pages/writing/[...id].astro，以 getStaticPaths 获取统一可见文章查询结果，保留内容 ID 的嵌套路径，使用 render 渲染 Markdown/MDX 并接入 ArticleLayout。

- [x] 生成全部可见文章详情，兼容根级与分类目录内容 ID。
- [x] 生产不生成草稿详情，开发环境支持草稿预览。
- [x] 复用文章元信息、标签与相邻文章导航。

验收：npm run test:article-routes 验证真实路由的静态生成、Markdown/MDX 正文、Writing 列表链接、嵌套/根级路径、生产 HTTP 200/草稿 404、开发草稿 HTTP 200 及未知文章 404。临时内容清理后重新构建。当前正式内容仍为草稿，生产暂不生成详情页；新增发布文章后自动生成。正文精细排版继续留在 TODO-11。

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

#### 验收

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

### TODO-11 Article Typography

状态：已完成（2026-10-03）。新增 src/styles/article.css，由 ArticleLayout 导入；所有选择器限定在 .article-content，直接覆盖 Markdown/MDX 输出，避免影响站点导航、列表和文章元信息。正文支持中英文混排、分级标题、段落/列表/引用、链接、行内代码、代码块、图片/图注、表格及分隔线。移动端缩小正文与内边距；代码保留缩进并局部横向滚动，宽表格局部滚动，图片按比例限制在文章宽度内。

验收：扩展 npm run test:article-routes 的临时 Markdown 文章，覆盖中文长文、嵌套与有序列表、引用、行内代码、Java/Shell/JSON 高亮代码、图片 alt、宽表格和分隔线；真实路由及开发/生产草稿隔离测试通过。npm run test:article-layout 回归与 npm run build 通过，临时内容已清理。当前无可用浏览器控制会话，尚未完成真实架构截图及各视口视觉验收，留在 TODO-17 响应式检查；构建保留此前记录的 photography 空集合与 MDX 指令警告。

完成：

- [x] H1
- [x] H2
- [x] H3
- [x] Paragraph
- [x] Link
- [x] List
- [x] Blockquote
- [x] Inline Code
- [x] Code Block
- [x] Image
- [x] Table
- [x] HR

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

### TODO-12 Projects List

状态：已完成（2026-10-03）。新增 /projects 静态列表与类型化 ProjectItem，使用 getPublishedProjects 读取项目集合，统一按 order 升序、startedAt 倒序、ID 升序展示。列表采用编号行与弱分隔线，展示标题、摘要、技术栈、中文状态、开始及可选结束日期；移动端元信息移至正文下方，集合为空时显示空态，不添加客户端 JS。

- [x] Projects Collection 查询与统一排序。
- [x] 行式布局、项目元信息、嵌套详情链接与空态。
- [x] 生产草稿过滤及新增内容自动更新。

验收：npm run test:projects 使用临时项目验证 order 优先、同 order 日期/ID 排序、全部非精选项目可见、草稿隔离、五种状态、技术栈、可选结束日期、嵌套 ID 链接、导航高亮及新增项目自动更新；测试清理内容并恢复构建。npm run build 成功生成 /projects/index.html。当前正式项目均为草稿，生产列表显示空态；项目详情路由留待 TODO-13，浏览器视口视觉验收留待 TODO-17。构建保留此前已记录的两项警告。

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

### TODO-13 Project Detail

状态：已完成（2026-10-03）。新增 /projects/[...id]，通过 getStaticPaths、getPublishedProjects 和 render 生成 Markdown/MDX 详情，保留嵌套内容 ID。ProjectLayout 使用宽 Hero、摘要、状态、开始/可选结束日期、技术栈与可选封面，正文复用 article.css 的 760px 阅读区域。ProjectStatus 统一列表和详情的中文状态文案。

Related Writing 复用 ArticleItem，getRelatedPosts 按 relatedPosts 配置顺序解析可见文章、去重并省略缺失条目；生产不展示草稿文章链接，开发允许预览草稿，最终关联列表为空时不生成空区块。

验收：npm run test:project-detail 验证真实 Markdown/MDX 正文、嵌套详情路径、状态/日期/技术栈/封面、可选字段省略、关联文章顺序及重复/缺失/草稿过滤、生产 HTTP 200 与草稿/未知 ID 404、开发草稿 HTTP 200。npm run test:projects 回归与 npm run build 通过，临时内容已清理。当前项目内容均为草稿，生产尚无详情页，发布后自动生成；真实内容导入留在 TODO-14，浏览器视觉验收留在 TODO-17。构建保留此前记录的两项警告。

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

- [x] Project Hero
- [x] Status
- [x] Tech Stack
- [x] Project Content
- [x] Related Writing

---

### TODO-14 自定义内容维护

状态：已完成（2026-10-03，按用户最新要求调整）。项目名称和数量由维护者自由增减，CRM、DianExamer、Contract Agent 作为原规格示例，不再强制导入固定三个项目。首页、Projects 列表和详情均从 Content Collections 动态生成，无项目白名单或固定数量上限；首页仅展示 featured=true 的可见项目。

- [x] 支持以 Markdown/MDX 文件新增、修改、删除任意项目。
- [x] 支持 order 排序、featured 首页展示、draft 暂时隐藏。
- [x] 提供 docs/CONTENT.md 的字段模板及内容维护、预览和发布说明。
- [x] 验证超过三个项目、新增、删除与隐藏后的列表和详情产物自动更新。

验收：npm run test:projects 验证五个可见项目、新增第六项、删除项目后列表与旧详情消失、改为草稿后列表与详情消失，结束后清理临时内容并恢复构建。npm run build 通过。当前正式项目均为草稿，生产列表显示空态，数量由后续维护者自行决定。

已准备 Feign 动态代理、Gateway TraceId、Dify 三篇带官方来源的技术摘要草稿，允许自由修改或删除，不作为个人经历发布，也不固定文章数量。临时启用发布状态验证过首页、Writing 列表、详情和阅读时间，已恢复 draft: true。真实项目经历由维护者自行填写；正文标题和各视口视觉验收仍在 TODO-17 完成。原始规格保留在 intro.md，后续以本任务和用户最新要求为准。

---

### TODO-15 About

状态：已完成（2026-10-03）。新增 /about 静态页面，组合 BaseLayout、760px Container、PageHeader，展示 Introduction、Focus、Currently Exploring 与 Technology。介绍/关注方向/技术列表在 SITE.about 配置，探索方向复用 SITE.home.exploring；GitHub 与 Contact 使用 SITE.social，未填写时省略整个区块，不生成空链接或虚构联系方式。保持分隔线与留白布局，无客户端 JS。

- [x] About 页面与导航高亮。
- [x] 介绍、关注方向、探索方向和技术列表可配置，空列表省略。
- [x] GitHub 与邮箱按配置展示，未配置时隐藏。

验收：构建产物检查确认正文、单个 H1、导航高亮及无客户端脚本；临时配置验证 GitHub 链接、mailto 邮箱、自定义技术列表与空列表省略，已恢复原配置。npm run build 成功生成 /about/index.html。当前 GitHub/邮箱仍未填写，维护者可自行配置；视口视觉验收留在 TODO-17，构建保留此前记录的两项警告。

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

### TODO-16 404

状态：已完成（2026-10-03）。新增 src/pages/404.astro，复用 BaseLayout、Header/Footer 和 760px Container，采用大号 404、中文说明、弱分隔线与留白，提供返回首页、浏览文章的语义链接。链接保留键盘焦点与移动端换行，无客户端 JS。

- [x] 自定义 404 页面及站点一致的公共布局。
- [x] 返回首页与浏览文章入口。
- [x] 静态错误页与未知路径 HTTP 404 验证。

验收：npm run build 生成 dist/404.html，与 docs/DEPLOY.md 的 Caddy 错误页路径一致。检查单个 H1/main、公共 Header/Footer、正文与链接；本机 preview 验证普通未知路径、未知项目、未知文章返回自定义正文与 HTTP 404，首页返回 200。验证后停止预览服务。未执行服务器部署，线上 Caddy 仍由维护者按部署文档配置；视口视觉验收留在 TODO-17，构建保留此前记录的两项警告。

实现：

```text
404.astro
```

保持整个站点视觉一致。

不要使用 Astro 默认 404。

---

### TODO-17 Responsive

状态：已完成（2026-10-03）。使用已安装的 Chrome 无界面模式与精确视口设置，验证首页、Writing、文章详情、Projects、项目详情、About 和 404 在 1440/1280/1024/768/390/375px 下的布局，共 42 项通过。临时内容覆盖长中文/连续英文标题、长标签和技术关键词、中文长文、Java/Shell/JSON、宽表格与 2400px 架构示意图，避免仅检查空态。

修复 ArticleLayout Header 的隐式网格列被连续英文标题撑宽：明确 grid-template-columns: minmax(0, 1fr)，并允许长字符串换行。页面整体及普通元素无横向溢出，代码块/表格仅局部横向滚动，图片加载完成且受容器宽度限制；桌面与移动端代表性截图已复核。

验收：python3 tools/check-responsive.py 通过 42/42；脚本保存完整/首屏截图及 JSON 报告到临时目录，清理测试内容、诊断脚本和临时服务器并恢复生产构建。npm run test:article-layout 回归与 npm run build 通过。结果与复跑步骤见 docs/RESPONSIVE.md。当前验证为 Chrome 桌面浏览器的指定 CSS 视口，不等同于各真实设备及其他浏览器全面测试。

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

- [x] Header
- [x] Hero
- [x] Writing
- [x] Article
- [x] Code
- [x] Table
- [x] Projects
- [x] Project Detail
- [x] Footer

不得出现：

```text
Horizontal Page Overflow
文字溢出
代码撑破页面
图片撑破页面
```

---

### TODO-18 Accessibility 基础

状态：已完成（2026-10-03）。BaseLayout 新增键盘可见的跳到主要内容链接与可接收焦点的 main；保持全局焦点描边。构建时使用 Astro 原生 Sätteri 插件为 Markdown/MDX 代码块和表格加入焦点入口与可访问名称，表格显式保留语义。高亮主题改为 github-dark-high-contrast，修复默认代码注释约 3.05:1 的对比度问题。

验收：python3 tools/check-responsive.py --accessibility 验证七类页面在 1440/375px 下的语义、图片 alt、链接名称/目标、标题顺序、无正数 tabindex、代码/表格焦点、文字对比度，以及实际 Tab/Enter 的跳转链接可见性/描边/正文焦点，14/14 通过。npm run test:article-routes 验证 Markdown/MDX 插件属性及主题，响应式 42 项回归与最终构建通过。@astrojs/markdown-satteri 0.4.2 从已有间接依赖改为直接声明，npm audit --omit=dev 为 0 告警。临时内容已清理；完整范围、颜色数据及内容维护要求见 docs/ACCESSIBILITY.md，不宣称完成全面 WCAG 审计。

至少完成：

- [x] Semantic HTML
- [x] 图片 alt
- [x] Keyboard Focus
- [x] Button / Anchor 正确语义
- [x] Heading 顺序
- [x] 色彩可读性

不要求 V1 做完整 WCAG 审计。

---

### TODO-19 Build Verification

状态：已完成（2026-10-03）。npm run build 成功，退出码 0、0 Error，输出模式 static。确认 dist 包含 index.html、writing/index.html、projects/index.html、about/index.html、404.html 及非空 _astro 资源目录，共 5 个 HTML 页面。

- [x] 生产静态构建成功，无构建错误。
- [x] 必需页面与打包资源完整。
- [x] 37 个本地 href/src 引用及页面锚点存在，无 QA 内容或诊断脚本遗留。
- [x] 当前 6 个草稿未生成详情，草稿标题未进入生产 HTML。

验收：新增 node tools/verify-build.mjs，可在构建后检查必需产物、所有 HTML 的 main/H1 数量、本地链接/资源和锚点、QA 标记。检查通过；当前草稿内容使首页、Writing、Projects 显示空态，详情动态路由已在此前临时发布内容测试中通过，不误将空集合视为构建遗漏。构建仍有 photography 空集合及 MDX head-inject 指令两项已知警告，未宣称 0 Warning。生产 preview 留在 TODO-20，本任务未执行部署或 Git 操作。

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

### TODO-20 Production Preview

状态：已完成（2026-10-03）。执行 npm run preview -- --host 127.0.0.1 --port 4322 检查正式静态产物，首页、Writing、Projects、About 均返回 200 text/html，favicon 返回 200 image/svg+xml，未知路径返回 404 text/html；验证后已停止本次预览服务。

- [x] 使用生产构建和 preview，未以 dev 替代验收。
- [x] 正式页面、静态 CSS/图片与自定义 404 可访问。
- [x] 临时发布的 Markdown/MDX 文章及项目详情、列表和关联链接可访问，草稿不公开。
- [x] 清理临时内容后重建并复查当前正式页面、空态及旧详情 404。

验收：新增 npm run test:preview，通过 Astro 静态 preview 递归访问页面中的本地 href/src，共检查 14 个临时构建页面/资源的 HTTP 状态、CSS/图片 MIME、公共布局、正文渲染、详情链接及草稿隔离；验证未知/草稿路由返回自定义 404。清理临时内容后重新构建、重启 preview 检查正式页面和已删除详情，最终再次恢复构建。node tools/verify-build.mjs 通过，保留 5 个正式 HTML 和 37 个本地引用。响应式/无障碍视觉与键盘验收已在 TODO-17–18 完成，本任务补充生产服务器访问验证；当前正式内容仍为草稿，因此列表为空。构建保留此前记录的两项警告，未部署至服务器或执行 Git 操作。

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

### TODO-21 Deployment Documentation

状态：已完成（2026-10-03）。完善 docs/DEPLOY.md，使用已创建的 zhufit/zhu-site 仓库地址；说明 Git 由维护者执行、完整源码必须包含 vendor 本地依赖、实际 Node/npm/Astro 版本、npm ci 与构建/产物验证、当前后台 preview 的停止命令。补齐 Ubuntu 2GB RAM/40GB Disk 目标环境的准备、Caddy stable 安装、域名与 HTTPS、自定义 404、备份、rsync 预演/发布、回滚、故障排查与发布记录模板，目标目录 /var/www/zhu-site。

- [x] GitHub 源码管理与完整工程还原说明。
- [x] 本地开发、构建、生产预览及产物检查。
- [x] Ubuntu/Caddy/HTTPS/404 部署步骤。
- [x] 手动发布、备份、回滚及验收记录。

验收：核对官方 Caddy 安装/错误处理与 Astro CLI 资料，文档 20 个 Bash 代码块通过 bash -n，仅检查语法，未执行其中命令；本地文档引用及源码工具路径检查通过。正式域名与服务器参数仍由维护者填写，未执行 Git 操作、服务器连接或上线。Caddy 文件与手动部署脚本留在 TODO-22–23；当前本机未安装 Caddy，未宣称已验证服务器配置。

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

### TODO-22 Caddy

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

### TODO-23 手动部署脚本

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

### TODO-24 README 完善

必须说明：

#### 开发

```bash
npm install
npm run dev
```

#### Build

```bash
npm run build
```

#### 新建文章

```text
src/content/blog/{category}/{slug}.md
```

#### 草稿

```yaml
draft: true
```

#### 发布

修改：

```yaml
draft: false
```

Build + Deploy。

---

## 环境与依赖验证记录（2026-10-03）

- TODO-00：Node v26.0.0、npm 11.12.1、Astro 7.3.5；安装、dev 首页 HTTP 200 与静态构建通过。
- TODO-01：MDX 8.0.2；临时 MDX 页面正确渲染站名，移除后最终产物仅有验证首页。
- 初始 npm audit：3 项 high 告警（http-cache-semantics 及其影响的 Astro、MDX）。已通过本地依赖补丁修复；原始 4.2.0 的 5 种绕过场景可复现，修补后 9 项安全回归全部通过。
- 最终验证：干净 npm ci 安装成功，Astro 的缓存依赖解析到 vendor 修补版本，npm run test:security、npm run test:content 与 npm run build 均通过，联网 npm audit 为 0 vulnerabilities。详细说明见 [SECURITY.md](SECURITY.md)。审计不分析本地源码，修复效果以回归测试为依据。
- [x] 依赖漏洞修复：保留许可证与原版本号的本地补丁，通过 overrides 固定依赖，支持 npm ci 重装，完成漏洞回归与审计验证。
- [ ] 后续依赖维护：上游发布正式兼容修复后移除本地依赖和 override，更新锁文件，再运行回归、构建与审计。
