# ZHU Personal Site

以 Git 和 Markdown/MDX 管理内容、由 Astro 构建的个人技术站。GitHub 保存源码，静态产物由 Ubuntu 上的 Caddy 托管。

源码仓库：[zhufit/zhu-site](https://github.com/zhufit/zhu-site)（HTTPS：https://github.com/zhufit/zhu-site.git）。

## 当前进度

TODO-00–21 已完成，第二轮进行中。首页、Writing 列表、文章公共布局、详情路由、正文排版、Projects 列表、项目详情、About 和自定义 404 已实现。当前内容均为草稿，生产首页、Writing 和 Projects 显示空态；发布文章后自动生成详情页面，发布项目后自动生成项目详情页面。

## 技术栈与环境

Astro、TypeScript Strict、官方 MDX 集成；使用 Content Collections 和统一内容查询工具；使用原生 CSS 设计基础。
Node >=22.12.0、npm >=9.6.5。本次验证环境为 Node v26.0.0、npm 11.12.1，依赖版本以 package-lock.json 为准。

## 本地运行

```bash
npm ci
npm run dev
```

按终端显示的地址访问。开发服务停止方式以终端提示为准。

```bash
npm run build
npm run preview
```

生产输出为 dist；preview 仅用于本地检查。服务器不需要 Node Runtime。

## 目录

- src/pages：路由与页面，当前已实现首页、Writing 列表/文章详情、Projects 列表/详情、About 和自定义 404。
- src/config/site.ts：站名、作者、导航和社交信息。
- src/content：文章、项目与摄影内容；src/content.config.ts 统一验证 Frontmatter。
- src/components/common：Container、Header、Footer、PageHeader。
- src/layouts/BaseLayout.astro：统一页面 HTML Shell、基础 SEO、全局 CSS 和 Header/Footer。
- src/layouts/ArticleLayout.astro：文章元信息、正文 slot、标签与相邻文章导航。
- src/components/home：Hero、Exploring、SelectedProjects、LatestWriting。
- src/components/writing：ArticleItem、ArticleMeta、ArticleTags、ArticleNavigation。
- src/components/projects：ProjectItem 项目列表行、ProjectStatus 共享状态文案。
- src/layouts/ProjectLayout.astro：宽 Hero、项目元信息、正文与关联文章。
- src/components 其他目录和其余业务布局：后续任务实现。
- src/styles：Token、必要 Reset、全局样式、排版和少量布局工具类。
- src/utils：内容查询、日期格式化与基础阅读时间计算。
- src/assets：文章、项目、通用图片和图标。
- public：原样复制的公开资源。
- docs：需求、模块、任务、部署与依赖修复文档。
- vendor/http-cache-semantics：带许可证的本地安全修补依赖。
- tests：缓存漏洞回归和内容集合构建验证。

空目录用 .gitkeep 保留。第一阶段不创建未来页面、业务组件或样式的空实现；摄影仅预留目录和 Layout，不开放路由。

## 内容与发布

项目名称和数量可自由增减，不固定为三个。新增或删除 src/content/projects 中的内容文件即可；首页展示 featured 项目，Projects 展示全部可见项目。模板及维护说明见 [自定义内容文档](docs/CONTENT.md)。

文章放在 src/content/blog/{category}/{slug}.md，项目放在 src/content/projects；需要组件时使用 .mdx。草稿使用 draft: true，正式发布改为 false，生产查询会统一过滤草稿，开发预览允许查看草稿。

由维护者执行 Git 提交与推送，再构建、预览并手动上传 dist。完整步骤见 [部署文档](docs/DEPLOY.md)，当前任务进度见 [TODO](docs/TODO.md)，全部资料见 [文档索引](docs/README.md)。

初始化使用 [Astro 官方手动安装方式](https://docs.astro.build/en/install-and-setup/#manual-setup)，保留已有文档，不自动操作 Git。

## 验证与本地依赖补丁

```bash
npm run test:security
npm run test:content
npm run test:utils
npm run test:home
npm run test:writing
npm run test:article-layout
```

内容验证测试会创建临时内容与路由、验证错误 Schema 导致构建失败，并在结束时清理临时文件、恢复生产构建。

缓存依赖的安全修补版本通过本地依赖和 overrides 固定使用。vendor 目录、package.json 和 package-lock.json 必须一起提交，以便 npm ci 正确安装。修复范围和后续升级方式见 [依赖修复记录](docs/SECURITY.md)。

内容查询的排序规则与接口见 [模块文档](docs/MODULES.md)。test:utils 会临时启动仅监听本机的 Astro 开发服务，验证开发/生产可见性；运行环境需允许监听本地端口。

站点导航、作者和社交链接统一配置在 src/config/site.ts。GitHub 地址为空时 Footer 不显示空链接；填写实际个人主页地址后显示。

新页面应使用 BaseLayout 包裹业务内容，不重复编写 html/head/body、Header/Footer 或全局 CSS。Props 为 title、description、image；未配置 Astro site 时不输出本地分享 URL。发布前的域名配置见 [部署文档](docs/DEPLOY.md)。

首页的角色、介绍和探索方向在 SITE.home 配置；精选项目来自 featured=true 的可见项目，最新文章来自日期倒序前三篇。新增内容后重新构建即可更新首页。test:home 使用临时内容验证自动更新，结束时清理并恢复最终构建。

Writing 页面位于 /writing，显示全部可见文章，按 UTC 年份分组并保留日期倒序。分类和标签当前仅做展示。test:writing 验证跨年分组、草稿隔离和新增 Markdown 自动进入列表，结束时清理临时内容并恢复构建。

ArticleLayout 接收可见 Post，默认 slot 放入 render(post) 返回的 Content；调用方应使用统一内容查询获取条目。上一篇为更早文章，下一篇为更新文章，均由 getPostNavigation 查询。test:article-layout 使用临时详情路由验证布局并在结束时清理；正式路由为 /writing/[...id]，test:article-routes 验证真实 Markdown/MDX 路由、生产草稿隔离与开发草稿预览。

Projects 列表使用 getPublishedProjects，按 order 升序、startedAt 倒序、ID 升序展示全部可见项目，不要求 featured。ProjectItem 展示状态、摘要、技术栈和日期；详情链接保留嵌套 ID。npm run test:projects 验证排序、草稿过滤及新增内容自动更新，并清理临时内容。内容集成测试应依次运行。

项目详情由 /projects/[...id] 与 ProjectLayout 生成，支持 Markdown/MDX、可选封面和 endedAt。relatedPosts 填写博客内容 ID（例如 spring/feign-dynamic-proxy），关联文章按配置顺序展示，自动去重、省略缺失及生产草稿。npm run test:project-detail 验证实际渲染、关联文章与开发/生产访问。

About 页面内容在 src/config/site.ts 的 SITE.about 中修改；支持多段 introduction、任意数量 focus 和 technology。Currently Exploring 复用 SITE.home.exploring，GitHub/邮箱在 SITE.social 设置；空配置自动隐藏对应区块。修改后重新构建发布生效。

响应式检查已覆盖七类页面与六个指定宽度。运行 python3 tools/check-responsive.py 可复跑 Chrome 验收，依赖本机 Python 3、Node 和 Chrome；详情见 [响应式验收](docs/RESPONSIVE.md)。脚本临时修改内容与 dist，应与其他内容测试顺序运行。

基础无障碍验收见 [ACCESSIBILITY.md](docs/ACCESSIBILITY.md)。运行 python3 tools/check-responsive.py --accessibility 可检查语义、颜色及键盘跳转；正文图片说明和标题层级由内容维护者保持，MDX 自定义组件也需提供适当焦点与语义。

构建后运行 node tools/verify-build.mjs 检查必需页面、打包资源、本地 href/src 引用和页面锚点。TODO-19 已通过：5 个生产 HTML、37 个本地引用、6 个草稿隔离，0 Error；仍保留摄影空集合与 MDX 指令两项已知警告。当前生产内容均为草稿，因此暂无文章/项目详情产物。

生产预览验收运行 npm run test:preview：临时发布 Markdown/MDX 文章和项目，构建后启动静态 preview，递归检查页面、CSS/图片、详情及草稿/未知路由 404；清理后重新构建并复查正式产物。此测试需要本机端口权限，与其他内容测试按顺序运行。命令行预览使用 npm run preview，结束后按 CLI 显示的停止方式关闭。

部署文档已按当前工程与 zhufit/zhu-site 仓库完善，包含首次服务器准备、完整源码还原、构建/预览、备份发布、回滚和发布记录。Git 操作仍由维护者执行；文档完成不代表已上线。下一阶段为 Caddy 配置与手动部署脚本。
