# 依赖安全修复记录

## 问题与修复

2026-10-03 安装时 npm audit 报告 3 项 high：http-cache-semantics 4.2.0，以及依赖链上的 Astro 和 MDX。这三项来自同一个 [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) 漏洞。

当前 npm 最新版本仍为 4.2.0，公告没有补丁版本，[上游 PR #58](https://github.com/kornelski/http-cache-semantics/pull/58) 尚未合并。因此本项目保留原始 4.2.0 代码和 BSD-2-Clause 许可证，制作本地修补版本。补丁依据 [上游问题 #56](https://github.com/kornelski/http-cache-semantics/issues/56) 描述的复用限制，不降级 Astro，不伪造上游安全版本号，也不关闭 npm audit。

vendor/http-cache-semantics/index.js 在缓存命中或 stale 分支之前检查响应复用限制，阻止客户端 max-stale 绕过共享 Set-Cookie、proxy-revalidate、no-cache、no-store、private 等限制。普通公共内容的 stale 复用、显式公开 cookie 和私有缓存正常复用仍保留。

## 安装与验证

根 package.json 将 http-cache-semantics 定义为 file:./vendor/http-cache-semantics，并通过 overrides 的 $http-cache-semantics 引用统一约束 Astro 的传递依赖。保留原始包名与版本 4.2.0，private=true 防止误发布。

vendor 与锁文件必须一并提交。只修改 node_modules 不构成可复现修复。

```bash
npm ci
npm ls http-cache-semantics
npm run test:security
npm run test:content
npm run build
npm audit
```

安全回归直接从 Astro 的依赖解析位置加载该库，验证实际使用的代码。原始版本复现了 5 种受限响应被 max-stale 绕过；本地补丁通过全部 9 项回归，包括序列化恢复与正常缓存行为。

联网审计在替换后返回 0 vulnerabilities。npm 不会对本地修补源码进行漏洞分析，因此审计清零本身不是补丁正确性的证明；漏洞行为回归与依赖解析验证才是本次修复的依据。

## 后续维护

上游发布兼容的正式修复后，移除本地依赖与 override，更新锁文件，运行同一套安全回归、集合验证、构建和审计，确认通过后再删除 vendor。本地补丁需要随上游更新审查，不能自动替换为原始 4.2.0。
