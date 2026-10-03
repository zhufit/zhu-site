# 本地安全补丁

来源：npm http-cache-semantics@4.2.0。保留上游版本号与 BSD-2-Clause 许可证；这不是上游正式修复版本。

漏洞：[GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp)。参考 [上游问题 #56](https://github.com/kornelski/http-cache-semantics/issues/56) 的修复建议；上游 PR #58 尚未合并，本补丁不是直接采用未经合并的分支。

改动：evaluateRequest 在处理任何缓存命中或 stale 分支前，拒绝 no-cache、不可存储响应、Vary:*、共享 proxy-revalidate、未显式 public/immutable 的共享 Set-Cookie。要求同步重新验证。保留普通过期公共内容的 max-stale、显式 cookie opt-in 和私有缓存行为；对象序列化恢复后规则仍生效。

安装：根 package.json 的本地依赖与 overrides 的 $http-cache-semantics 引用将该传递依赖指向本目录；必须将 vendor 与锁文件一并提交。使用 npm ci 可复现。不要只改 node_modules，也不要通过伪造上游版本号清除审计。

验证：npm run test:security。测试先在原始 4.2.0 复现漏洞，再检查本地补丁。

维护：上游发布兼容修复后，移除 override 与 vendor，更新锁文件，再运行安全回归、构建和审计。
