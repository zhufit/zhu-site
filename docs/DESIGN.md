# 设计基础

TODO-04 建立统一可修改的基础样式；最终页面视觉在后续业务页面任务中实现。完整需求来自 [intro.md](intro.md) §5、24–29，状态见 [TODO.md](TODO.md)。

## 原则

排版优先，大留白、弱边框、少卡片、强层级。使用 Astro、原生 CSS，不引入 UI/CSS 框架。字体使用系统回退，无外部字体下载；V1 保持浅色，主题切换属于后续版本。

## 样式职责与加载顺序

| 文件 | 职责 |
| --- | --- |
| src/styles/tokens.css | 字体、颜色、空间、尺寸、圆角、字号、行高和过渡 |
| src/styles/reset.css | 必要 box-sizing、body margin、图片尺寸、控件字体和链接颜色重置 |
| src/styles/global.css | 页面背景、默认文字、链接、selection 和 focus-visible |
| src/styles/typography.css | 标题、段落、small、代码字体与基础引用样式 |
| src/styles/utilities.css | 少量通用布局和可访问性工具类 |

当前由 BaseLayout 按此顺序统一导入，页面无需重复导入。Markdown/MDX 正文排版由 ArticleLayout 单独导入 article.css，选择器限定在 .article-content，不混入 global.css。

## Tokens

- 正文字体：Inter → PingFang SC → Microsoft YaHei → sans-serif；代码字体：JetBrains Mono → SFMono-Regular → Consolas → monospace。声明字体名称不会自动下载字体，实际使用取决于本机可用字体。
- 浅色背景 #f7f7f5、表面 #ffffff、正文 #171717、次级正文 #686868、弱化文字 #707068；弱化文字使用更深的灰色以保证可读性。
- 边框使用 --color-border，圆角 6/12px；后续组件自行选择是否需要边框，基础层不添加卡片或阴影。
- 间距尺度：4、8、12、16、24、32、48、64、96、128px。
- 内容最大宽度 1180px，文章最大宽度 760px。页面单侧边距 clamp(20px, 4vw, 48px)，区块上下间距 clamp(32px, 6vw, 96px)。
- 正文 1rem、行高 1.75；H1–H3 使用 clamp 随视口变化，H4 为 1.125rem；代码行高 1.6。保留浏览器默认字体缩放能力。
- 过渡为 160ms/260ms；prefers-reduced-motion: reduce 时过渡为 0ms，不强制平滑滚动。

## 共用类

| 类 | 用法 |
| --- | --- |
| container | 居中内容区，保留流式页面边距并限制最大宽度 |
| article-width | 将块级内容最大宽度限制为文章宽度；可嵌套在 container 中，或与 container 同用 |
| page-section | 应用流式区块上下间距 |
| flow | 直属兄弟元素间统一间距；可用 --flow-space 覆盖默认 24px |
| visually-hidden | 保留辅助技术可读内容，视觉隐藏；可聚焦的跳转链接需单独处理聚焦显示 |

不要通过隐藏页面横向溢出来掩盖布局问题。长文本允许换行；代码块和表格的局部滚动在正文排版阶段处理。

## Responsive 与验证范围

基础尺寸采用流式规则，无需在基础层为每个设备设置独立断点。业务布局按 Desktop >=1024、Tablet 768–1023、Mobile <768 判断是否需要调整。

| 视口宽度 | 单侧页面边距 | 默认内容区宽度 | 文章区最大可用宽度 |
| --- | --- | --- | --- |
| 1440px | 48px | 1180px | 760px |
| 1280px | 48px | 1180px | 760px |
| 1024px | 40.96px | 942.08px | 760px |
| 768px | 30.72px | 706.56px | 706.56px |
| 390px | 20px | 350px | 350px |
| 375px | 20px | 335px | 335px |

以上为 CSS 尺寸计算，不代替浏览器实测。TODO-04 已验证静态构建、样式打包、Token 引用和目标宽度计算；当前环境没有可用浏览器自动化，实际字体渲染和逐页响应式视觉检查保留在 TODO-17。

## 公共组件（TODO-05）

| 组件 | 接口与职责 |
| --- | --- |
| Container | as 可选 div/main/section/article，默认 div；narrow 限制文章宽度；透传 class、id、ARIA 等 HTML 属性，slot 放内容 |
| Header | 读取 SITE 的品牌与导航；列表当前页面标为 page、栏目详情标为 location；移动端导航换行，无折叠菜单或 JS |
| Footer | 显示构建时 UTC 年份与作者；SITE.social.github 非空时显示 GitHub 链接 |
| PageHeader | 必填 title、可选 description；统一 H1 和说明段落 |

Header 导航链接具有 48px 最小高度和可见键盘焦点。低于 768px 时导航占独立行，列表与 Footer 均支持换行；空白社交地址不生成链接。当前验证首页使用 BaseLayout 组合以上组件，未来页面不应复制 HTML Shell 或 Header/Footer。

## BaseLayout（TODO-06）

BaseLayout 提供唯一 html/head/body、Header/main/Footer 和全局样式入口，默认 lang=zh-CN。页面通过默认 slot 传入内容，Container 和 PageHeader 由页面按需要组合；不要再在 slot 内创建第二个 main。

Props：title、description、image 均为可选字符串。普通页面标题追加站点标题，首页默认使用站点标题。description 回退到 SITE.description。favicon 使用 public/favicon.svg，构建后位于网站根路径。

基础分享属性按 [Open Graph 协议](https://ogp.me/) 使用 og:title、og:description、og:type、og:site_name、og:locale。部署设置 Astro site 后生成 og:url，相对 image 转换为绝对地址；未设置 site 时不生成 localhost 分享 URL，image 仅接受可解析的绝对 HTTP(S) URL。当前没有默认分享封面，因此没有 image Props 时不输出 og:image；完整公开分享元数据需在发布前配置域名与封面。此阶段不增加复杂 SEO、Sitemap 或第三方 SEO 依赖。

## 首页（TODO-07）

首页按 Hero → Currently Exploring → Selected Projects → Latest Writing 顺序组织；Hero 使用 --text-hero 流式字号，探索方向换行展示。项目用编号、标题、技术关键词、摘要和分隔线建立层级，文章用日期、标题与摘要排列；不使用卡片网格、阴影或渐变。

首页区块采用 96px 间距，低于 768px 调整为 64px。项目移动端将 Explore 放到内容列下方，文章将日期移到独立行；网格内容列使用 minmax(0, 1fr)，避免长文本撑宽布局。页面不增加客户端 JS。当前环境无法进行浏览器视觉实测，需在 TODO-17 验证真实内容、字体和移动端布局。

Hero 和 Exploring 消费 SITE.home；SelectedProjects 和 LatestWriting 接收类型化集合条目，由首页调用统一内容工具供给数据。集合为空时保留区块标题与简短空态。所有详情链接保留内容 ID 的嵌套路径。

## Writing 列表（TODO-08）

Writing 使用 PageHeader 和按年份分段的列表。桌面年份置于条目左侧，条目由日期、标题、摘要和分类/标签组成，通过留白和弱分隔线组织内容；低于 768px 时年份与日期分别换为独立行。分类和标签使用可换行文字，不使用胶囊、卡片或客户端筛选。

ArticleItem 消费类型化 Post，日期复用 formatDate；列表标题为 H1、年份为 H2、文章标题为 H3。无标签时不生成空标签列表，无内容时显示简短空态。详情链接保留嵌套内容 ID，详情路由已在 TODO-10 实现。

## 文章布局（TODO-09）

ArticleLayout 接收 Post，使用 BaseLayout 与 narrow Container 将文章区域限制在 760px；Header 显示分类、H1、摘要及元信息，默认 slot 放正文，Footer 按内容显示标签和相邻文章导航。

ArticleMeta 统一日期与阅读时间，updatedAt 未提供时不显示更新日期。ArticleTags 提供共享的静态标签列表，空标签不渲染。ArticleNavigation 桌面两列、移动端单列，只有一侧邻居时不生成空链接；上一篇指向更早条目，下一篇指向更新条目，未知/隐藏条目的导航为空。

BaseLayout 另提供 ogType，默认 website；ArticleLayout 使用 article，并复用标题、摘要及可选封面元数据。文章正文的标题间距、表格/代码块等排版已由 TODO-11 的 article.css 实现。TOC 未提前实现。

## 文章详情路由（TODO-10）

src/pages/writing/[...id].astro 使用 getStaticPaths 与 getPublishedPosts 生成路径，以 render(post) 的 Content 作为 ArticleLayout 正文。内容 ID 原样保留，例如 spring/feign-dynamic-proxy 对应 /writing/spring/feign-dynamic-proxy。生产仅生成非草稿文章，开发可预览草稿，未知 ID 返回 404。

运行 npm run test:article-routes 验证实际静态输出与开发/预览 HTTP 访问；测试会添加并清理临时内容，结束后恢复生产构建。与其他内容集成测试按顺序运行，避免同时修改内容目录和 dist。

## 正文排版（TODO-11）

article.css 使用全局 .article-content 后代选择器覆盖 render 输出，沿用字体、颜色、空间 tokens。桌面正文 18px、行高 1.85，移动端 16px；H1–H3 使用响应式字号。文章标题由布局提供，内容建议从 H2 开始，以保持标题顺序。

代码块使用 Shiki github-dark-high-contrast 高亮背景与文字颜色，不强行覆盖主题；长代码在块内滚动，行内代码可随段落换行。表格使用局部滚动区域与弱边框，单元格内容可换行；图片保持比例并限制宽度，MDX 可使用 figure/figcaption 添加图注。长链接及连续字符串允许换行。

渲染集成测试覆盖中文长文、Java/Shell/JSON、列表、引用、图片和宽表格。实际架构截图和 1440–375px 视口的视觉检查仍需在 TODO-17 完成。

## Projects 列表（TODO-12）

/projects 组合 BaseLayout、Container、PageHeader 和 ProjectItem，通过 getPublishedProjects 获取统一排序的全部可见项目。使用横向编号行和分隔线，标题为 H2；摘要和技术栈位于主内容列，状态与开始/结束日期位于右侧，低于 768px 时元信息移至内容下方。长标题与技术关键词可换行，空技术栈不生成空段落，缺少 endedAt 时只显示开始日期。

状态展示为探索中、进行中、已暂停、已完成、已归档。日期沿用 UTC YYYY.MM.DD 格式。整行是语义链接，保留键盘焦点与嵌套项目 ID；详情路由已在 TODO-13 实现。空集合保留页面标题与简短空态，不使用卡片网格或客户端筛选。

## 项目详情（TODO-13）

ProjectLayout 接收类型化 Project，以宽 Hero 展示标题/摘要、状态/日期/技术栈，与文章 Header 保持独立结构；可选封面占容器宽度，正文使用 article-content 和 article-width 复用长文排版。低于 768px，Hero 元信息移至标题和摘要下方。MDX 正文可导入自己的组件。

ProjectStatus 同时供项目列表与详情使用。Related Writing 使用 H2 区块标题和 ArticleItem 的 H3 文章标题，getRelatedPosts 统一解析可见博客 ID，保留配置顺序并去重；没有有效关联时省略整块。无需在布局中重复排序或草稿过滤。

测试使用临时内容验证详情 HTTP 访问、MD/MDX、可选字段及关联边界，结束后恢复生产构建。真实截图和响应式视觉检查仍在 TODO-17 完成。

## About（TODO-15）

/about 使用 760px 阅读宽度、PageHeader 和带分隔线的内容区块。介绍按段落展示，Focus、Currently Exploring、Technology 使用可换行列表；桌面区块间距 48px，低于 768px 时为 32px。所有正文与联系方式允许长文本换行，空内容省略区块，无技能百分比、卡片网格或客户端脚本。

SITE.about 管理介绍、关注方向和技术列表，探索方向与社交链接复用站点已有配置。未配置联系方式时省略区块；配置后生成语义链接并沿用全局键盘焦点样式。

## 404（TODO-16）

src/pages/404.astro 复用站点布局与 760px 容器，以大号等宽 404、H1 中文标题和简短说明建立层级。返回首页、浏览文章链接具备至少 48px 点击高度，横向排列并允许移动端换行，沿用全局焦点样式。错误页不添加客户端脚本。

静态产物为 dist/404.html；本机 preview 已验证未知页面、未知文章和项目路径返回自定义内容及 HTTP 404。生产 Caddy 使用部署文档中的 handle_errors 映射到 /404.html，不做首页回退。

## 响应式验收（TODO-17）

2026-10-03 已通过 Chrome 精确 CSS 视口的七类页面 × 六个宽度检查，代表性桌面/移动端截图已复核；前文提到的等待 TODO-17 检查是各阶段的历史记录，最新结果见 RESPONSIVE.md。文章 Header 必须显式使用 minmax(0, 1fr) 网格列，并允许长英文换行，避免长标题影响整个页面宽度。代码与表格保持局部滚动，不通过隐藏页面溢出来掩盖布局问题。

## 基础无障碍（TODO-18）

全站第一个键盘入口为跳到主要内容链接，聚焦时显示并带全局描边；正文 main 可接收跳转焦点。Markdown/MDX 的 pre 与 table 由构建插件加入 tabindex=0 和名称，表格保持显式语义；代码主题使用 github-dark-high-contrast，避免灰色注释对比度过低。详细范围、颜色与内容维护说明见 ACCESSIBILITY.md。
