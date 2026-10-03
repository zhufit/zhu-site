"""Render static pages at the TODO-17 widths using an installed headless Chrome.
Run sequentially with other content tests. Output remains outside the repository.
"""
from pathlib import Path
import functools, http.server, subprocess, threading, tempfile, os, sys

root = Path(__file__).resolve().parents[1]
chrome = os.environ.get('RESPONSIVE_CHROME', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
widths = [1440, 1280, 1024, 768, 390, 375]
report_dir = Path(tempfile.mkdtemp(prefix='zhu-responsive-'))
created = []
server = None

def create(path, text):
    target = root / path
    if target.exists(): raise RuntimeError(f'Fixture already exists: {target}')
    target.write_text(text)
    created.append(target)

def build():
    result = subprocess.run(['npm', 'run', 'build'], cwd=root, capture_output=True, text=True)
    if result.returncode: raise RuntimeError(result.stdout + result.stderr)

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

try:
    create('public/qa-responsive-image.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="900"><rect width="2400" height="900" fill="#e6e6e0"/><text x="100" y="450" font-size="80">Gateway → Service → Database</text></svg>')
    title = '响应式验证：中文长标题与连续英文' + 'LongTechnicalProjectName' * 5
    body = '\n\n'.join(['## 中文长文', '系统设计与工程实践。' * 100, '### Code', '```java\n// Java code comment\nclass Example { String value = "' + 'long-value-' * 60 + '"; }\n```', '```shell\necho "build complete"\n```', '```json\n{"status":"active"}\n```', '| 模块 | 输入 | 输出 | 状态 | 版本 | 备注 |\n| --- | --- | --- | --- | --- | --- |\n| Gateway | Request | Response | active | 1 | ' + 'long-cell-' * 40 + ' |', '![大尺寸架构图](/qa-responsive-image.svg)', '> 引用与长链接\n\nhttps://example.com/' + 'long-path-' * 50])
    create('src/content/blog/architecture/qa-responsive.md', f'---\ntitle: "{title}"\ndescription: "长摘要与中英文混排验证。"\npublishedAt: 2099-01-01\nupdatedAt: 2099-02-01\ncategory: Architecture\ntags: [Java, Spring Cloud, {"LongTag" * 30}]\ndraft: false\n---\n\n{body}')
    create('src/content/projects/qa-responsive.md', f'---\ntitle: "{title}"\nsummary: "项目摘要与长技术关键词验证。"\nstartedAt: 2099-01-01\nendedAt: 2099-02-01\nstatus: active\ntechStack: [Java, {"LongTechnology" * 30}]\ncover: /qa-responsive-image.svg\nfeatured: true\ndraft: false\nrelatedPosts: [architecture/qa-responsive]\n---\n\n{body}')
    build()
    # Diagnostic script is added only to built files and removed by the final build.
    routes = {'home':'index.html', 'writing':'writing/index.html', 'article':'writing/architecture/qa-responsive/index.html', 'projects':'projects/index.html', 'project':'projects/qa-responsive/index.html', 'about':'about/index.html', '404':'404.html'}
    diagnostic = '''<script>addEventListener('load', async () => {await document.fonts.ready; await Promise.all([...document.images].map(async image => {image.loading='eager'; try {await image.decode();} catch {}})); const width=innerWidth; const outside=[...document.querySelectorAll('body *')].filter(e=>!e.closest('pre,table,svg')&&!e.classList.contains('visually-hidden')&&getComputedStyle(e).display!=='none').filter(e=>{const r=e.getBoundingClientRect();return r.right>width+1||r.left< -1}).map(e=>e.tagName+'.'+e.className); const scrollers=[...document.querySelectorAll('.article-content pre,.article-content table')].map(e=>({tag:e.tagName,width:e.clientWidth,scroll:e.scrollWidth,overflow:getComputedStyle(e).overflowX})); const images=[...document.images].map(e=>({loaded:e.complete&&e.naturalWidth>0,width:e.getBoundingClientRect().width})); const out=document.createElement('output');out.id='qa-result';out.hidden=true;out.textContent=JSON.stringify({width,scroll:document.documentElement.scrollWidth,outside,scrollers,images});document.body.append(out);});</script>'''
    for target in routes.values():
        p=root/'dist'/target
        p.write_text(p.read_text().replace('</body>', diagnostic+'</body>'))
    server = http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(root/'dist')))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    result=subprocess.run(['node',str(root/'tools/responsive-browser.mjs'),chrome,str(report_dir),f'http://127.0.0.1:{server.server_port}', 'accessibility' if '--accessibility' in sys.argv else 'responsive'],cwd=root,timeout=180)
    print(f'Report: {report_dir}',flush=True)
    if result.returncode: raise RuntimeError('Responsive failures; inspect report')

finally:
    if server: server.shutdown();server.server_close()
    for p in created: p.unlink(missing_ok=True)
    build()
    print('Fixtures and diagnostics removed; production build restored.',flush=True)
