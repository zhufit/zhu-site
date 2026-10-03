# 基础无障碍验收

2026-10-03，TODO-18 已完成。范围为站点基础结构、图片说明、链接语义、标题顺序、键盘入口和可读配色，不是完整 WCAG 合规审计。

## 改动

- BaseLayout 的第一个链接为“跳到主要内容”，平时移出视口，键盘聚焦时显示；Enter 后焦点进入 main-content。正文使用 tabindex=-1，避免成为额外的普通 Tab 停靠点。
- 全站保留 2px 焦点描边，使用高对比度焦点色；链接由语义 a 元素提供，无可点击 div、无正数 tabindex。
- 原生 Sätteri 插件在构建时为 Markdown/MDX 的 pre、table 添加 tabindex=0 和可访问名称，允许键盘聚焦滚动区域；表格显式保留 role=table，兼容局部滚动所需的 display:block。无需客户端脚本。
- Shiki 改用 github-dark-high-contrast。默认主题的代码注释在测试中只有约 3.05:1，对比度不足；替换后测试正文及 Java/Shell/JSON 示例文字通过检查。

## 验证

```bash
python3 tools/check-responsive.py --accessibility
npm run test:article-routes
```

无障碍模式复用响应式临时内容和浏览器工具，检查七类页面在 1440px、375px 两个视口下的结构、lang、单个 main/H1、标题递进、图片 alt、非空链接名称和 href、无正数 tabindex、代码/表格焦点入口及实际文字颜色。通过真实 Tab/Enter 按键验证跳转链接的可见性、描边和正文焦点，14/14 通过。Markdown/MDX 路由回归验证插件属性与高亮主题。临时内容和诊断脚本在结束后清理并恢复生产构建。

普通文字采用至少 4.5:1，大字采用至少 3:1 的判断基准，参考 [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)。跳过重复导航的入口参考 [W3C Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)。

| 颜色与页面背景 | 对比度 |
| --- | --- |
| 主文字 #171717 / #f7f7f5 | 16.71:1 |
| 次要文字 #686868 / #f7f7f5 | 5.19:1 |
| 弱化文字 #707068 / #f7f7f5 | 4.65:1 |
| 焦点色 #315bcc / #f7f7f5 | 5.60:1 |

## 内容维护要求与范围

正文从 H2 开始，H3 属于前一个 H2，不跳级；页面 H1 由布局生成。信息图片应填写描述其用途的 alt，装饰图可用空 alt；图中复杂架构需要在正文补充文字说明。表格需要表头，链接文字说明目的。MDX 手写组件也须满足这些规则；原生插件覆盖解析为 HTML 元素的 Markdown 代码和表格，组件自行生成的内容需自行处理焦点和语义。

本次检查覆盖 Chrome 与当前模板、临时测试内容，尚未开展读屏器、各平台辅助技术、所有交互状态及完整 WCAG 条目审计。颜色检测覆盖当前可见正文及示例高亮文字，不证明所有未来代码语法配色或自定义内容都满足要求。

Astro 7 的 Markdown 使用原生 [Sätteri 处理器](https://docs.astro.build/en/guides/markdown-content/)；@astrojs/markdown-satteri 0.4.2 原已作为间接依赖安装，本次显式声明为直接依赖以配置插件，依赖审计无生产告警。
