# 需求说明

来源：[intro.md](intro.md)，本文件提炼产品范围和验收要求；工程职责见 [MODULES.md](MODULES.md)，执行清单见 [TODO.md](TODO.md)。原始文档保留供追溯。本次仅整理文档，不代表功能已实现。

## 目标与边界

建设长期维护的个人技术站，沉淀技术文章、项目实践与探索，展示个人主页，并预留摄影展示能力。Git 是内容唯一事实来源，Markdown/MDX 是内容载体，Astro 生成静态站点，Caddy 提供 HTTPS 访问。

V1 不建设后台、CMS、多用户平台或 Java Web 服务。服务器不运行 Node、Astro Server 或数据库，不直接修改文章。（原文 §1–5）

## V1 页面需求

| 编号 | 页面 | 要求 | 原文 |
| --- | --- | --- | --- |
| R-01 | 首页 `/` | Header、Hero、当前探索、精选项目、最新文章、Footer；项目和文章列表来自 Content Collections，新增内容后自动更新 | §18 |
| R-02 | Writing `/writing` | 已发布文章按日期倒序、按年份展示；显示日期、标题、摘要、分类和基础标签；分类可用链接，不要求客户端动态筛选 | §19、TODO-08 |
| R-03 | 文章 `/writing/{content-id}` | 保留嵌套内容 ID；展示分类、标题、摘要、发布时间、可选更新时间、阅读时间、正文、标签、上一篇/下一篇；支持 Markdown 和 MDX | §15、20、36、TODO-09–11 |
| R-04 | Projects `/projects` | 读取项目集合，优先按 order 排序；通过编号、字体、留白和分隔建立层级 | §21、TODO-12 |
| R-05 | 项目 `/projects/{content-id}` | 独立于博客的视觉结构，展示项目说明、状态、时间、技术栈、正文和关联文章；支持 Markdown/MDX | §16–17、37、TODO-13 |
| R-06 | About `/about` | 简介、当前方向、技术关键词、正在探索、GitHub 和联系方式；保持简单 | §22、TODO-15 |
| R-07 | 404 | 自定义页面，视觉与站点一致 | TODO-16 |
| R-08 | Photography 预留 | 保留 Schema、内容目录、组件目录和 Layout；V1 不开发正式 UI，不进入导航；可无公开入口或仅占位页面 | §23 |

## 内容与数据规则

- 文章和项目必须由 Content Collections 查询，内容、UI、路由分离。（§5、8、13）
- 开发环境允许预览草稿；生产构建过滤所有 draft=true 内容，统一在 content.ts 处理，页面不重复数据规则。（§12–13）
- 文章按日期排序，支持 featured、category、tags；项目支持 featured、order、status、techStack、relatedPosts。（§8、13、16）
- 展示日期统一为 `YYYY.MM.DD`；文章正文最大宽度 720–780px。（§14、20）
- 普通内容使用 `.md`，确需组件才使用 `.mdx`；普通图片保存在 src/assets/images，优先 WebP/AVIF/SVG，不提交 RAW 或巨大原图。（§31、38）
- 项目名称与数量可自由增减，以内容文件动态生成首页、列表与详情；CRM、DianExamer、Contract Agent 为原规格示例，不是固定项目。文章也可自由维护，内容须真实，允许摘要版。（TODO-14，2026-10-03 用户调整）

## 视觉与质量要求

排版优先、大留白、弱边框、少卡片、强层级、轻动效。避免后台 Sidebar、Dashboard、卡片网格、大量阴影/边框/渐变及技能百分比进度条。统一使用 Design Tokens，保证中英文与代码混排可读。（§5、17、21–22、24–28、47）

Header 显示 ZHU.、Writing、Projects、About，当前页面状态清楚，移动端可用；Footer 显示版权年份与 GitHub。基础 Layout 统一标题、description、viewport、favicon、基础 OG 和全局样式。（§33–36、TODO-06）

验证 1440、1280、1024、768、390、375px 宽度。代码块可局部横向滚动，页面、图片、表格不撑破布局。具备语义 HTML、图片 alt、键盘焦点、正确按钮/链接语义、标题顺序和可读颜色。（§28–29、TODO-17–18）

## 技术与交付约束

- 使用 Astro、严格 TypeScript、Markdown/MDX、Content Collections、Zod、Astro Components、原生 CSS 和少量原生 TypeScript；原文环境基线为 Node >=22.12。（§4、6）
- 静态输出，不使用 SSR、Node Adapter 或 Server Mode。第一阶段不主动引入 React/Vue/Svelte、UI/CSS 框架、状态管理、数据库、后端框架或 Docker Runtime。（§4、10）
- 默认无客户端 JS，仅在明确交互需要时增加；允许场景不代表该功能已进入 V1。（§30、54）
- 每完成一个开发 TODO 阶段先通过 npm run build，再继续；新增依赖前判断原生能力能否简单实现，避免无价值组件拆分。（§47）
- 构建产物 dist 通过 rsync/scp 发布到 Ubuntu 的 /var/www/zhu-site，由 Caddy 托管；服务器信息不硬编码到公共仓库。（§3、TODO-21–23）
- 完善根 README、ARCHITECTURE、CONTENT、DESIGN、DEPLOY 和 TODO 文档。（§39–44）

## 版本范围

V1 暂不开发登录、注册、用户体系、数据库、后台、CMS、评论、点赞、收藏、阅读量、全文搜索、RSS、复杂 SEO、SSR、后端 API、CI/CD、摄影 Lightbox、对象存储、访问统计。（§2）

| 后续版本 | 评估内容 |
| --- | --- |
| V1.1 | Dark Mode、Article TOC、Reading Progress、Copy Code Button |
| V1.2 | Search、RSS、Sitemap、SEO |
| V1.3 | Photography、Gallery、Series、Lightbox、Photo Metadata、COS/R2 |
| 更晚 | Comments、Analytics、CI/CD |

以上是后续评估项，不提前实现。（§54）

## 待确认与原文差异

1. §20、36 把 TOC 列入文章结构，但 §54 将 Article TOC 放到 V1.1，TODO-09 也未包含 TOC；暂按后续版本记录，开发前确认。
2. 工程目录列出 ThemeToggle，但 Dark Mode 属于 V1.1；V1 不因目录示例自动开发主题切换。
3. 分类筛选在 §19 为推荐方案，TODO-08 仅明确基础展示；筛选链接的目标路由与实现范围尚未规定。
4. TODO-03 已确定项目 order 升序、startedAt 倒序、ID 升序；文章发布日期倒序、ID 升序。日期按 UTC 格式化；阅读时间按中文 300 字/分钟、英文 200 词/分钟混排估算。TODO-09 已确定上一篇指向更早条目、下一篇指向更新条目；实际域名与联系方式仍待后续确定。

## V1 完成定义

以下清单从原文 §53 提取，状态不表示已完成。

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
