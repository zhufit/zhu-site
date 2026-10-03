# GitHub 管理、项目部署与构建发布

Git 操作由项目维护者执行。本文提供手动操作步骤，不执行仓库初始化、提交、推送或服务器部署。当前页面实现及本地生产构建、预览验收已完成，下面的步骤用于源码管理和后续手动部署；线上部署尚未执行。

## 1. 发布方式

本地源码 → Git 提交并推送 GitHub → 本地构建与生产预览 → 上传 dist → Ubuntu 上的 Caddy → HTTPS 网站。

GitHub 保存代码、Markdown/MDX 内容和文档；服务器保存构建产物。Git push 不会自动发布网站。V1 使用手动发布，不配置 GitHub Actions、GitHub Pages 或 CI/CD。服务器不需要克隆仓库，也不需要 Node、npm 或数据库。

## 2. GitHub 仓库准备（由你执行）

GitHub 仓库已由维护者创建：[zhufit/zhu-site](https://github.com/zhufit/zhu-site)。HTTPS 地址为 https://github.com/zhufit/zhu-site.git，SSH 地址为 git@github.com:zhufit/zhu-site.git。下方使用你提供的 HTTPS 地址；认证使用已配置的凭据管理器，凭据不写进仓库地址。首次推送前由你确认远程是否为空；若已存在 README 或提交，应先检查并处理历史差异，不强制推送覆盖。

工程初始化后检查 .gitignore，至少包含以下内容，再做首次提交：

```gitignore
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
.DS_Store
*.log
```

提交 package.json、package-lock.json、src、public、配置文件、docs、tests、tools 和 vendor；不要提交凭据、私钥、真实部署参数或原始摄影文件。.env.example 仅放无敏感值的变量示例。已经被 Git 跟踪的文件不会因加入 .gitignore 自动取消跟踪，首次提交前应检查暂存内容。参见 [GitHub 忽略文件说明](https://docs.github.com/en/get-started/git-basics/ignoring-files)。

vendor/http-cache-semantics 是当前 package.json 引用的本地依赖，必须与锁文件一起提交，否则其他机器 npm ci 无法还原工程。只上传 dist 到网站目录，不上传 vendor 或源码。补丁详情见 [SECURITY.md](SECURITY.md)。

如果本地尚未初始化 Git，按顺序执行；已有仓库跳过 init，已有 origin 则先检查地址，避免重复添加：

```bash
git init
git branch -M main
git add .
git diff --cached --stat
git diff --cached
# 检查无误后继续
git commit -m "feat: initialize personal site"
git remote add origin https://github.com/zhufit/zhu-site.git
git push -u origin main
```

上面的关联和推送命令由你执行；已有 origin 时先运行 git remote -v 检查，地址正确则跳过 remote add，需要更改时使用 git remote set-url origin https://github.com/zhufit/zhu-site.git。后续在其他机器使用：

```bash
git clone https://github.com/zhufit/zhu-site.git
cd zhu-site
```

日常先检查 git status，有未提交修改时先处理，再同步远程：

```bash
git status --short
git pull --ff-only origin main
```

## 3. 本地开发与构建

当前 package.json 要求 Node >=22.12.0、npm >=9.6.5；已验证 Node v26.0.0、npm 11.12.1，Astro 7.3.5。其他机器使用满足 engines 的 Node 和项目锁文件。依赖变更使用 npm install 更新锁文件；已有锁文件的克隆与发布构建使用 npm ci。

```bash
node --version
npm --version
npm ci
npm run dev
```

文章位置为 src/content/blog/{category}/{slug}.md，项目位置为 src/content/projects。草稿使用 draft: true，准备公开时改为 false。MDX 仅用于需要组件的内容。项目名称和数量自由增减，模板与维护说明见 [CONTENT.md](CONTENT.md)；首页只展示 featured=true 的可见项目。当前所有正式内容仍是草稿，生产列表为空；准备公开时填写真实内容再修改 draft。

每次发布前执行：

```bash
npm run build
node tools/verify-build.mjs
npm run preview
```

构建必须无错误。通过终端给出的预览地址检查首页、Writing、文章详情、Projects、项目详情、About、404、移动端、图片、代码和表格。确认草稿未生成公开详情且未出现在任何列表或关联文章中。预览结束按当前 CLI 提示停止。当前 Astro CLI 会后台启动服务，可在项目目录运行以下命令查看并停止本项目预览：

```bash
npm run astro -- preview status
npm run astro -- preview stop
```

Astro 默认将构建产物输出到 dist，preview 用于本地检查，不作为生产服务器。参见 [Astro 部署文档](https://docs.astro.build/en/guides/deploy/)。

可额外运行 npm run test:preview 进行生产页面/资源与草稿隔离回归。内容集成测试会暂时修改内容目录和 dist，应顺序运行；测试完成后重新执行 build 与 verify-build 再发布。响应式与无障碍检查步骤见 [RESPONSIVE.md](RESPONSIVE.md)、[ACCESSIBILITY.md](ACCESSIBILITY.md)。

2026-10-03 本地生产预览验收已完成（TODO-20）：命令行 preview 的正式页面/资源和 404 已验证；npm run test:preview 验证临时发布的 Markdown/MDX 详情、关联链接、静态资源 MIME 和草稿隔离，结束后清理内容、停止服务并恢复正式构建。该结果不代表已完成线上部署。

## 4. 首次服务器准备

目标为 Ubuntu 云服务器（原规格为 2GB RAM、40GB Disk）。准备可 sudo 的 SSH 用户，服务器安装 rsync，域名 A 记录指向公网 IPv4；若配置 AAAA，必须有可用 IPv6。云安全组和主机防火墙允许 SSH 端口及 TCP 80/443。

本地需要 Node、npm、SSH 客户端和 rsync；服务器只需要 Caddy、rsync 与静态文件。2GB RAM/40GB Disk 是目标环境规格，构建在本地完成，不在该服务器运行 Astro 或 Node。

下面命令在服务器执行，deploy-user 替换为实际 SSH 用户：

```bash
sudo apt update
sudo apt install -y rsync
sudo install -d -m 755 -o deploy-user -g deploy-user /var/www/zhu-site
sudo install -d -m 700 -o deploy-user -g deploy-user /var/backups/zhu-site
```

目录由部署用户写入；网站目录与公开文件允许 Caddy 读取，备份目录不作为网站根目录。

新服务器按 [Caddy 官方 Ubuntu stable 安装步骤](https://caddyserver.com/docs/install#debian-ubuntu-raspbian) 配置软件源并安装；已有 Caddy 时先检查版本与已有站点，无需重复添加软件源。

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl gnupg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

官方 Ubuntu 包提供 systemd 的 caddy 服务。安装后确认：

```bash
caddy version
sudo systemctl status caddy --no-pager
```

## 5. 生产域名与 Caddy 配置

正式发布前，在本地 astro.config.mjs 的 defineConfig 中设置 site 为实际公开域名（例如 site: 'https://example.com'），保留现有 static output 和 MDX 配置，再构建、预览并提交。此值用于 BaseLayout 生成公开页面的 OG URL 和相对分享图片地址，不使用 localhost。页面需要分享封面时，通过 BaseLayout 的 image Props 传入真实图片路径或绝对 HTTP(S) 地址。


用 sudoedit /etc/caddy/Caddyfile 编辑配置。替换 example.com 为真实域名；服务器已有其他站点时保留其配置，追加本站点块。

```caddyfile
example.com {
    root * /var/www/zhu-site
    encode zstd gzip

    handle_errors {
        @notFound expression {err.status_code} == 404
        handle @notFound {
            rewrite * /404.html
            file_server
        }
    }

    file_server
}
```

TODO-16 已实现自定义错误页，当前构建已验证生成 dist/404.html，与上述规则一致；以后若更改构建结构，应同步调整路径。保持不存在的 URL 返回 HTTP 404，不增加 SPA 首页回退。根据 [Caddy handle_errors 文档](https://caddyserver.com/docs/caddyfile/directives/handle_errors)，错误处理中的 file_server 会保留原错误状态；上线时仍需用 curl 确认 404。

```bash
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
```

域名解析和网络端口正确时，Caddy 为配置的公开域名自动管理 HTTPS。证书申请问题可检查 DNS、80/443 可达性及服务日志。参见 [Caddy 自动 HTTPS 文档](https://caddyserver.com/docs/automatic-https)。

## 6. 日常提交与发布

### 6.1 提交本次版本

修改内容后先完成构建和预览检查，再由你提交并推送：

```bash
git status --short
git add .
git diff --cached
# 检查无误后继续
git commit -m "feat: update site content"
git push origin main
git status --short
git rev-parse HEAD
```

发布应基于工作区干净、已经推送的提交。记录最后输出的完整提交 ID；从不同机器发布时，先同步到该提交并重新 npm ci、build、preview。提交后若再次修改源码，需重新提交和构建。

### 6.2 配置本次发布参数

以下在本地项目根目录的 Bash 执行，替换示例值。参数保留在本地终端或本地配置中，不提交真实服务器信息。

```bash
DEPLOY_TARGET='deploy-user@server.example.com'
DEPLOY_DIR='/var/www/zhu-site'
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"
```

先确认构建入口存在，避免上传错误目录：

```bash
node tools/verify-build.mjs
test -f dist/index.html
test -f dist/404.html
```

只在该命令成功后继续。若使用非默认 SSH 端口，可在本地 ~/.ssh/config 配置服务器别名，并将 DEPLOY_TARGET 设置为该别名。

### 6.3 备份当前线上产物

首次上线没有旧版本时可跳过备份；后续发布先执行：

```bash
ssh "$DEPLOY_TARGET" "cp -a /var/www/zhu-site /var/backups/zhu-site/$RELEASE_ID"
```

备份失败则停止发布。该备份 ID 标识本次发布前的版本；在自己的发布记录中同时记录旧提交 ID、新提交 ID、时间和备份路径。

### 6.4 预演并上传

```bash
rsync -avzn --delete --chmod=D755,F644 dist/ "$DEPLOY_TARGET:$DEPLOY_DIR/"
```

检查预演输出和目标目录。--delete 会删除服务器网站目录中本地 dist 不存在的文件；因此目标目录仅用于本站构建产物。dist/ 的尾斜杠表示上传目录内的文件。

确认预演正确后执行：

```bash
rsync -avz --delete --chmod=D755,F644 dist/ "$DEPLOY_TARGET:$DEPLOY_DIR/"
```

上传退出状态必须为 0。普通静态文件更新无需重启 Caddy。这是直接覆盖发布，传输过程中可能短暂出现新旧文件混用，发布时避免并发上传；后续有明确需要时再评估版本目录切换。

### 6.5 上线验证

```bash
curl -I https://example.com/
curl -I https://example.com/writing/
curl -I https://example.com/projects/
curl -I https://example.com/about/
curl -I https://example.com/this-page-does-not-exist
```

正常页面返回 200，不存在的页面返回 404；再打开未知路径确认返回本站中文错误页，避免只检查状态码。浏览器再检查一个真实文章详情和项目详情，以及 HTTPS、图片、CSS 和移动端。文章/项目 URL 使用实际内容 ID。上传失败或验证失败时按下节恢复。

## 7. 回滚与故障排查

### 恢复发布前的静态产物

在服务器执行，将 BACKUP_ID 替换为需要恢复的备份目录名。先确认该版本存在 index.html，再进行预演：

```bash
test -f /var/backups/zhu-site/BACKUP_ID/index.html
rsync -avzn --delete /var/backups/zhu-site/BACKUP_ID/ /var/www/zhu-site/
```

仅当检查成功且预演正确后执行：

```bash
rsync -avz --delete /var/backups/zhu-site/BACKUP_ID/ /var/www/zhu-site/
```

重复上线验证并记录回滚。回滚产物不会改变 GitHub 源码；若要修复源码，由你使用修复提交或 git revert，再重新构建发布。没有备份时，可在独立目录克隆仓库并检出已知可用提交，npm ci 后重新构建，按发布流程上传。

### 常见问题

| 现象 | 检查与处理 |
| --- | --- |
| npm ci 失败 | Node 兼容性、锁文件与 package.json 是否一致、网络；依赖变更使用 npm install 更新并提交锁文件 |
| 构建失败 | Frontmatter/Schema、内容引用、MDX 和类型错误；修复后再发布 |
| 页面 404 | dist 是否有该路由文件、嵌套内容 ID 是否正确、是否误传成网站目录下的 dist 子目录 |
| 图片或样式丢失 | _astro 与图片是否全部上传、路径大小写、上传是否中断 |
| 403 或权限错误 | Caddy 用户是否可遍历父目录并读取网站文件 |
| HTTPS 失败 | A/AAAA、云安全组、主机防火墙、80/443 是否被占用 |
| 内容未更新 | 构建是否来自正确提交、目标目录是否正确、浏览器缓存 |

服务器日志检查：

```bash
sudo journalctl -u caddy -n 100 --no-pager
```

备份会占用磁盘，定期检查容量并由你清理不再需要的旧版本，保留近期可恢复版本。

## 8. 发布记录与检查清单

每次发布在你自己的运维记录中保存以下信息，真实服务器参数不提交公共仓库：

| 字段 | 填写内容 |
| --- | --- |
| 发布时间 / 操作者 | 实际时间与维护者 |
| 公开域名 | 实际 HTTPS 域名 |
| 源码版本 | 已推送的完整提交 ID |
| 本地环境 | Node/npm 版本、构建和预览结果 |
| 发布目标 | SSH 别名与 /var/www/zhu-site |
| 发布前备份 | /var/backups/zhu-site/RELEASE_ID；首次部署注明无旧版本 |
| 线上验收 | 页面、详情、CSS/图片、HTTPS、404 检查结果 |
| 回滚结果 | 如执行回滚，记录恢复的备份与再次验收结果 |


- [ ] 源码已提交并推送 GitHub，工作区干净
- [ ] 完整源码包含 vendor，npm ci、npm run build 和 verify-build 成功
- [ ] npm run preview 检查通过，生产产物无草稿
- [ ] Astro site 已配置正式域名，Caddy 配置 validate 通过
- [ ] 记录提交 ID、发布时间和备份路径
- [ ] 旧产物备份成功（首次发布除外）
- [ ] rsync 预演目标与删除列表正确
- [ ] 上传成功，线上页面、静态资源和 404 验证通过

本文件完成部署说明；Caddy 实际配置、手动脚本编写及真实上线仍需在对应开发阶段完成，不因文档编写自动标记为已部署。

## 9. 文档验收状态

TODO-21 已完成（2026-10-03）：已纳入真实仓库地址，核对实际运行版本、源码本地依赖、构建产物、生产预览生命周期、Ubuntu 安装、Caddy/404、发布备份、rsync 预演/同步、回滚与验收步骤。Bash 示例通过语法检查，引用的本地文档及工具路径存在。

尚未填写正式域名或 SSH 目标，也未连接服务器、安装 Caddy、验证服务器配置或发布网站。TODO-22 的 Caddy 配置文件与 TODO-23 部署脚本仍按后续任务推进；本地未安装 Caddy，因此本任务不宣称运行过 caddy validate。
