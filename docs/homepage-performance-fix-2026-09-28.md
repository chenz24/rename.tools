# 首页加载性能修复

日期：2026-09-28。分支：`codex/homepage-performance`。本轮为本地修复与生产产物验证，尚未部署，不能将结果解释为线上 Lighthouse 已提分。

## 改动

- 首次 Service Worker 安装、接管不再刷新页面。只有用户点击更新提示中的 Refresh 后才刷新一次。已有 waiting worker 也会提示更新；事件监听器、定时器与异步注册都在卸载时正确清理。离线资源预缓存延后到 window.load。
- 移除全局 Noto Sans SC webfont，中文使用系统字体；保留 Geist，Geist Mono 不再预加载。
- 首页亮暗截图改用预生成的 384/640/960/1440/1920 像素 WebP，保留响应式 sizes、懒加载、原始宽高比。图片采用内容哈希文件名，`public/_headers` 为该目录设置一年 immutable 缓存。首页截图不再依赖 `/_next/image` 或 Cloudflare Images binding。
- 公共翻译 provider 仅发送 header/footer/error/notFound/guideLinks。首页演示、功能页、工具页分别获得 home、features、rename 文案；服务端页面继续使用完整服务端翻译。
- GA SDK 改为 lazyOnload，初始化配置仍在 afterInteractive 阶段入队；没有修改 GA 的页面访问事件配置或 URL 参数。Umami 保持原加载时机，避免延迟现有工具事件。

## 可量化结果

除特别注明外，下表比较此前线上首页审计与当前本地生产产物，字节均为十进制。它们是资源变化，不是相同网络条件下的得分对照。

| 项目 | 修复前 | 修复后 |
| --- | --- | --- |
| 新会话首次访问文档导航 | 两次，SW 接管后自动刷新 | 一次，SW 正常接管 |
| 首页 CSS 解压体积 | 408,456 B | 129,973 B，约减少 68% |
| HTML 中字体 preload | 3 个 | 1 个 |
| 英文客户端翻译 JSON | 46,118 B | 6,432 B，约减少 86% |
| 412px、DPR 1.75 的亮色截图 | 返回 3348×1844 PNG，225,078 B | 选中 960px WebP，47,148 B，约减少 79% |
| 截图缓存 | 图片转换响应未获得有效 TTL | `public, max-age=31536000, immutable` |
| 英文首页 HTML | 线上响应约 188 KB | 本地预渲染 142,889 B |

CSS 和文案统计为未压缩大小；不能将这些数字当成传输节省量。原样线上报告有重复导航和超时警告，不能用它的 70 分与本地版本比较。用户提供的 89 分尚缺原始报告与测试设备信息。

中文采用系统字体后，不同操作系统的字形会略有区别。GA SDK 延后可能漏记 SDK 就绪前离开的极短访问；Umami 保持原行为。上线后应结合 GA 数据确认这一取舍。

## 验证

- `pnpm test`：8 个文件、313 项测试全部通过。新增 6 项 SW 生命周期测试覆盖首次接管、已有等待更新、后续更新、用户确认、清理与失败处理。
- `pnpm build:cf`：最终版本通过 TypeScript、112 个静态页面生成、OpenNext 打包与本地静态缓存填充。没有执行部署。
- 修改的源文件通过 Biome，`git diff --check` 通过。
- 本地 Wrangler 生产产物浏览器检查：7 种语言的首页、功能页、工具页共 21 个页面均有正确语言和正文，无控制台错误、无横向溢出。
- 新会话首页 `navigation.type` 为 navigate，SW 已接管，文档请求仅一次。
- 英文和中文移动首屏、英文桌面、亮暗截图已截图检查；首页交互案例切换正常，配方入口可打开规则审阅弹窗。
- 10 张生成图片均验证 WebP 格式、声明宽度、原图比例和文件名内容哈希；浏览器实际请求及缓存头也通过验证。
- 外部统计请求在本地浏览器验收中被模拟，避免污染生产数据；GA SDK 在 load 之后请求且没有首屏 preload。没有声称 GA 后台入库已验证。
- 最终构建再次验证 GA 保持原 config 入队；首页到功能页、工具页的 SPA 导航新增文档请求为 0。配方可用示例文件生成预览，已访问工具页可离线重新加载。缺失 URL 正常返回 404（该项测试有预期的 404 资源日志）。

构建仍有项目原有的 middleware 命名弃用提示，Wrangler 预览对依赖生成代码有 duplicate options 警告；构建和页面检查正常。

## 维护与上线复测

更换 `public/screenshots/product_screenshot*.png` 后运行 `pnpm generate:screenshots`，一并提交生成的 WebP 与 `src/components/home/product-screenshots.json`。脚本使用固定版本 sharp，生成内容哈希路径，并仅清理自身旧产物。

本地复现：`pnpm test`、`pnpm build:cf`、`pnpm exec wrangler dev --ip 127.0.0.1 --port 8787 --local`。构建需要访问 Google Fonts 下载保留的 Geist 字体。

上线后在相同 Lighthouse 版本、设备和测试位置对 `/en`、`/zh` 分别做至少三次冷启动检测，记录中位数、LCP/FCP/TBT/CLS/Speed Index；另行确认 `/` 到 `/en` 的重定向耗时。不要用本地服务器得分作为线上提升承诺。

参考：[OpenNext 图片优化](https://opennext.js.org/cloudflare/howtos/image)、[Cloudflare 静态资源响应头](https://developers.cloudflare.com/workers/static-assets/headers/)、[GA 页面访问配置](https://developers.google.com/analytics/devguides/collection/ga4/views)。
