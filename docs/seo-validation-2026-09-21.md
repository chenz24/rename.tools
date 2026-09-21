# SEO 修复验收记录

日期：2026-09-21。分支：`codex/seo-fix-plan`。本轮仅修改和验证，未部署。

## 教程复现

在本地生产构建的应用中，通过示例测试模式输入文件名、逐条添加规则并检查预览。没有执行真实文件重命名。

| 主题 | 界面实测输入 | 实测输出 |
| --- | --- | --- |
| 入门 | `IMG_0421.jpg`、`IMG_0422.jpg` | `2026-05-22_001.jpg`、`2026-05-22_002.jpg` |
| 照片 | `DSC_0007.JPG`、`IMG_1842.HEIC` | `2026-05-22_001_tokyo.JPG`、`2026-05-22_002_tokyo.HEIC` |
| 正则 | `2026-05-22 invoice client-a.pdf` | `invoice_client-a_2026-05-22.pdf` |
| 保留原序号 | `photo 1.jpg`、`photo 2.jpg`、`photo 10.jpg` | `001_photo.jpg`、`002_photo.jpg`、`010_photo.jpg` |
| 视频 | `show.name.s01e03.1080p.web-dl.mkv` | `Show Name S01E03.mkv` |
| 缺失 EXIF | 示例文件 `no-exif.jpg`，模板 `{exif.date}_{n}` | `{exif.date}_001.jpg`，占位符不会自动消失 |
| 缺失音频标签 | 示例文件 `love story.mp3`，音频标签模板 | `{media.track}. {media.artist} - {media.title}.mp3` |

- 新增 12 张英中界面截图：初始输入各一张、五个主题的实际预览各一张。教程改用对应图片，不再用与配方不一致的通用参考图。
- 补充模板操作：点击“添加文本”，粘贴完整模板，按 Enter 或 Tab 确认，再检查预览。
- `pnpm test`：70 项通过，其中 36 项使用教程发布的输入/输出验证规则引擎，覆盖字幕、自然排序、路径和扩展名保留及元数据变量等案例。
- 后续在 Chrome 原生文件选择器完成真实文件导入与“加载元数据”，补齐此前示例模式无法覆盖的提取链路。测试文件均为临时合成文件：8×8 JPEG 和 0.1 秒静音 WAV，未使用用户个人照片或音频，也未执行真实重命名。
- JPEG 的 EXIF `DateTimeOriginal` 为 `2026:05:22 10:30:00`，模板 `{exif.date}_{n}_tokyo`，导入顺序为无 EXIF、带 EXIF：得到 `{exif.date}_001_tokyo.jpg` 和 `2026-05-22_002_tokyo.jpg`。
- WAV 的 RIFF INFO 标签为 track=1、artist=Taylor Swift、title=Love Story（合成标签，不含歌曲音频）；模板 `{media.track}. {media.artist} - {media.title}` 得到 `01. Taylor Swift - Love Story.wav`；无标签文件保留全部字面占位符。实际解析与指南描述一致。

## 页面与语言

- 英、中、日、韩、西、法、德首页均检查了 1280px 桌面和 390px 移动端截图。
- 七种语言的首页、功能、隐私、About 共 28 个页面，在两种宽度下检查 DOM 几何尺寸：没有页面级横向溢出；各页面只有一个 H1，未发现 `MISSING_MESSAGE`。
- 七种语言逐一切换五个场景，共 35 次：每次仅显示对应场景，页面宽度保持 390px。每种语言均展开 FAQ，答案正常出现。
- 十篇英中指南检查桌面和移动端宽度。新图片在移动端实际选取 384px 图片资源，抽查图注和操作步骤未溢出。
- 工具页设置菜单补齐德语，已点击并确认切换至 `/de/app`。
- 38 个生产 HTML 页面核对 FAQ/场景正文、指南内链、canonical、hreflang、隐私文案与日期，检查通过。该检查排除了 script/style 文本。
- 工具操作期间未观察到控制台 error。

## 构建检查

- `pnpm test`：70 项通过。
- 7 个本轮修改的 TS/TSX 文件通过 Biome 检查，`git diff --check` 通过。
- `pnpm build`：前批次类型检查通过、生成 80 个静态路由；本轮追加静态 OG 修复后的 `pnpm build:cf` 同样通过类型检查，生成 73 个静态路由。减少的是 7 个图片生成路由，HTML 页面数未减少。
- `pnpm build:cf`：完成 OpenNext Cloudflare 打包，生成 `.open-next/worker.js` 与静态资源。保留项目既有的 middleware 命名弃用提示。
- 没有运行部署命令。

## 性能基线与修复

[Google PageSpeed 移动端报告](https://pagespeed.web.dev/analysis/https-rename-tools-en/i1dy1wgsl6?form_factor=mobile)，2026-09-21 11:31（GMT+8），目标为**尚未更新的线上英文首页**。

| 指标 | 线上修复前单次实验室结果 |
| --- | --- |
| Performance | 65 |
| FCP | 4.1 秒 |
| LCP | 9.8 秒 |
| TBT | 80 毫秒 |
| CLS | 0 |
| 测试条件 | Lighthouse 13.4.1，模拟 Moto G Power，Slow 4G |
| 真实用户数据 | 报告显示 No Data |

不能把该分数当作真实用户 CWV，也不能把 Lighthouse 的 SEO 100 分解释为搜索排名健康。

确认并修复的资源问题：

1. 线上报告在首页列出了工具页脚本。关闭公共页面到 `/app` 链接的自动预取，避免在阅读首页或指南时提前加载完整工具；链接仍可正常点击导航。首次进入工具时改为按需加载。
2. 产品截图原先以 `priority` 同时预加载亮色和暗色版本，缺少响应式 `sizes`，声明的宽高比也与源图不同。移除首屏外截图的预加载，按容器宽度提供 `sizes`，使用真实尺寸与自动高度。
3. 指南列表和正文截图同样增加 `sizes`。

本地生产预览确认：首页没有截图 preload，也没有工具页 `app/page-*` 脚本；390px 视口选取 384px 的亮色截图，隐藏暗色截图未产生已选取的图片 URL。指南截图加载成功，未拉伸。此次没有停用或改变统计配置。

参考：[Next.js Image 的 sizes 与图片加载说明](https://nextjs.org/docs/app/api-reference/components/image)、[Next.js Link 的 prefetch 说明](https://nextjs.org/docs/app/api-reference/components/link)。

新版本尚未上线，因此没有修复后线上 PageSpeed 分数；部署后必须按相同条件复测，再判断收益。字体、公共脚本和统计脚本如仍影响加载，应根据新报告继续定位。

## GSC 与统计后台追加核查

- [GSC 基线与后续决策](seo-gsc-baseline-2026-09-21.md)记录三个月指标、查询覆盖缺口、品牌划分、8 类索引排除原因、URL 检查、实时渲染、CWV 数据不足及部署后流程。
- GA4 的 Rename Tools Web 数据流指向正式域名，衡量 ID 与线上脚本一致；后台显示过去 48 小时持续接收数据。
- 增强型衡量已启用：浏览、滚动、出站点击、站内搜索、视频互动、文件下载、表单互动。启用不等于这些事件全部实际发生。
- “近期事件”表（过去 28 天）实际列出 `click`、`first_visit`、`page_view`、`scroll`、`session_start`、`user_engagement`，未出现自定义文件操作事件。
- 后台事件数据保留为 2 个月，用户数据保留为 14 个月，“有新的用户活动时重置”开启。界面明确说明这不影响大多数基于汇总数据的标准报告，不将其描述为所有 GA 数据的统一删除期限。
- 七语言隐私页补充实际存在的浏览、滚动和出站链接点击；相关 URL/referrer/link 参数的含义依据 [GA4 增强型衡量文档](https://support.google.com/analytics/answer/9216061)，未把文档定义冒充实际请求载荷抓包。
- 没有新增、关闭统计脚本或修改后台设置。Umami 与 Cloudflare 后台均显示登录页，尚未检查其保留设置及生产请求日志；也未逐项抓取所有统计服务的真实事件载荷。

## OG 图片 503 修复验收

- GSC 5 个 5xx 示例全部为 OG 图片；公开 HTTP 复查德文旧图片 URL 重复返回 503，正文 `error code: 1102`，韩文首次检查亦为 503。西班牙隐私页有一次 503、再次请求 200，未据此认定整个站点已无运行时问题。
- 公共 metadata 改为 `/opengraph-image.png` 静态资产。七语言旧图片路由，包括两组 GSC 版本参数，通过 middleware 308 跳转并去掉旧查询参数。
- 原 JSX 保留为离线生成脚本 `scripts/generate-opengraph-image.tsx`，运行 `pnpm generate:og` 可重新生成。PNG 为 1200×630，107,634 字节，与修改前构建图的 SHA-256 均为 `7ac1d440fe4977a23114a4140c6f7d87c12532b99d265ffce39625659a6fcd40`；图片视觉检查通过。
- `pnpm build:cf` 通过；本机 `wrangler dev --local --port 8787` 中确认：静态 PNG 200、image/png 且字节一致；21 个旧图片请求（七语言 × 无参数/两组旧参数）均为 308；七语言首页/隐私页与英中指南索引共 16 个页面 metadata/新文案通过；缺失翻译指南跳转和真实 404 均正常。
- 原有 70 项测试通过。变更的源码、JSON 及生成脚本通过 Biome，`git diff --check` 通过。Wrangler 仍有已有第三方 bundle 重复 options 提示，本机 runtime 回退到支持的 2026-03-17 兼容日期；这是本地验证限制，不等于线上配置被修改。
- 尚未部署，不能宣称生产 503 或 Google 5xx 分类已经消失；部署后按 GSC 示例复查并读取 CPU 日志。

## 待办与外部依赖

- 部署后：复查正式域名 HTTP/正文/图片/内链/结构化数据，提交 sitemap 并核对读取结果，重跑移动端性能检测，记录上线日期，再比较更新前后各 28 天 GSC 数据。
- Cloudflare 后台：需要登录后核对 CPU 超限/错误日志与已验证 Googlebot 请求，确认普通 HTML 的偶发 503 是否继续发生；本轮没有改动生产资源限制或套餐。
- Umami 后台和全部统计服务真实载荷：仍需核实保留设置及字段，现有文案不承诺未知细节。GA4 的配置、事件名称和保留设置已完成核查。
- 新任务页面、标题定位或索引策略暂不调整，原因见 GSC 基线；一键加载教程示例仍是独立增强项。
