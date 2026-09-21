# Google 搜索基线与后续决策

核查日期：2026-09-21。数据来自已登录的 rename.tools Google Search Console 域名资源；本分支尚未部署，下面均是线上旧版表现。

## 统计口径

- GSC：网络搜索，2026-06-19 至 2026-09-18（界面“3 个月”，按 Google 报告的太平洋时间日界线），未添加国家、设备、页面或查询过滤器。
- 总计：81 次点击、2,224 次曝光、CTR 3.6%、平均排名 27.3。CTR 原始比值为 81 / 2224 = 3.642%；平均排名沿用 GSC，不简单平均各行排名。
- 完整读取界面提供的 97 条查询、38 个页面、106 个国家/地区、3 种设备。国家和设备汇总分别与 81/2,224 一致。
- 查询表合计只有 24 次点击、457 次曝光，不能把它当作全量搜索需求。Google 会隐去低频查询；本表不足 1,000 行，未触及界面行数上限。
- 页面表曝光合计 2,335，与域名总曝光 2,224 的差异保留：页面与资源的聚合方式不同，不强行归一，也不把曝光差额当作数据错误。
- 报告截止日、后台“上次更新”、本次读取日期分别记录；不把 9 月 21 日当作表现数据截止日。

来源：[GSC 效果报告](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Arename.tools)、[Google 指标定义](https://support.google.com/webmasters/answer/7042828)、[数据聚合](https://support.google.com/webmasters/answer/17011364)、[匿名查询与时区](https://support.google.com/webmasters/answer/17010575)。

## 落地页、国家与设备

| 页面 | 点击 | 曝光 | CTR | 平均排名 |
| --- | ---: | ---: | ---: | ---: |
| /en | 56 | 1,396 | 4% | 33.0 |
| /de | 13 | 230 | 5.7% | 19.0 |
| /en/guides/organize-photos-by-date-sequence | 3 | 267 | 1.1% | 10.0 |
| /zh/guides/regex-batch-rename | 2 | 89 | 2.2% | 29.6 |
| /zh | 2 | 28 | 7.1% | 15.4 |
| /zh/app | 2 | 12 | 16.7% | 8.9 |
| /es | 2 | 6 | 33.3% | 3.8 |
| / | 1 | 1 | 100% | 1.0 |
| /en/guides/organize-music-video-files | 0 | 56 | 0% | 20.2 |
| /en/guides/regex-batch-rename | 0 | 53 | 0% | 27.2 |
| /en/guides/sequence-file-numbering | 0 | 36 | 0% | 17.4 |
| /en/guides/batch-file-rename-basics | 0 | 23 | 0% | 19.7 |

英文首页贡献 56 次点击，德文首页 13 次；照片指南为已有指南中曝光最多的页面（267）。这支持优先完善现有首页和照片指南，但无法单凭 1.1% CTR 认定标题有问题。对照片指南增加精确页面过滤后，三个月总计仍为 3/267，但查询表显示“无数据”，无法按实际词意进一步调整标题。

| 国家/地区（按点击排序前 10） | 点击 | 曝光 | CTR | 平均排名 |
| --- | ---: | ---: | ---: | ---: |
| 德国 | 14 | 226 | 6.2% | 16.3 |
| 美国 | 8 | 301 | 2.7% | 17.3 |
| 印度 | 4 | 172 | 2.3% | 39.2 |
| 英国 | 4 | 86 | 4.7% | 20.2 |
| 西班牙 | 4 | 31 | 12.9% | 24.1 |
| 台湾 | 4 | 20 | 20% | 5.2 |
| 越南 | 3 | 158 | 1.9% | 38.4 |
| 印度尼西亚 | 3 | 73 | 4.1% | 42.2 |
| 荷兰 | 3 | 44 | 6.8% | 24.0 |
| 中国 | 3 | 29 | 10.3% | 7.4 |

| 设备 | 点击 | 曝光 | CTR | 平均排名 |
| --- | ---: | ---: | ---: | ---: |
| 桌面 | 64 | 1,900 | 3.4% | 29.3 |
| 移动设备 | 17 | 310 | 5.5% | 15.6 |
| 平板电脑 | 0 | 14 | 0% | 7.4 |

设备和国家样本较小；不以这些聚合差异判断设备体验或地域算法导致排名差异。

## 查询与品牌边界

| 查询 | 点击 | 曝光 | CTR | 平均排名 |
| --- | ---: | ---: | ---: | ---: |
| rename tool | 11 | 134 | 8.2% | 15.6 |
| rename tools | 10 | 52 | 19.2% | 3.4 |
| renaming tool | 1 | 11 | 9.1% | 21.2 |
| dateien umbenennen tool | 1 | 7 | 14.3% | 33.1 |
| lewat web aja | 1 | 1 | 100% | 1.0 |
| rename | 0 | 37 | 0% | 39.4 |
| rename files | 0 | 18 | 0% | 48.7 |
| batch rename tool | 0 | 7 | 0% | 30.7 |
| datei umbenennen tool | 0 | 7 | 0% | 34.1 |
| mass renaming tool | 0 | 7 | 0% | 47.4 |
| rename file | 0 | 7 | 0% | 64.7 |
| file renamer online | 0 | 7 | 0% | 66.1 |

品牌拆分采用三类，避免把通用需求当成品牌流量：

- 明确品牌：包含 `rename.tools` 或 `renametools`，本次可见查询中没有记录；不表示全站品牌点击为零。
- 歧义词：精确 `rename tool`、`rename tools`，共 21 次点击 / 186 次曝光；既可能是品牌，也可能是通用需求，不强行分类。
- 其他可见查询：3 次点击 / 271 次曝光。其余 57 次点击、1,767 次曝光未在查询表列出，无法分类。

泛词 `batch rename tool` 平均排名 30.7，`file renamer online` 66.1，且曝光只有 7 次。已有非品牌词可见度较弱，但数据不足以量化全部非品牌流量或证明与 Bing 的差距来自某一原因。

## 收录与抓取

[GSC 页面索引报告](https://search.google.com/search-console/index?resource_id=sc-domain%3Arename.tools) 上次更新标为 2026-09-18：50 个已收录、68 个未收录。118 个已知 URL 包括资源文件、历史地址和参数变体，不能用当前 sitemap 的 61 个规范页面作其分母。个别示例的抓取日期晚于报告更新标记，保留两者，不把汇总视作所有 URL 同一时点状态。

| 未收录原因 | 数量 | 样本核查与处置 |
| --- | ---: | --- |
| noindex | 29 | 全是英中之外的指南/指南索引，最后抓取为 6–7 月；本次公开 HTTP 复查 29/29 已为 308 跳转，目标均为英文对应页。等待重抓取，不去掉必要跳转。 |
| 重定向 | 19 | HTTP/www、无语言前缀、根目录、ref 参数入口及一个韩文指南，属于规范化或翻译回退地址。 |
| 5xx | 5 | 全是带旧版本参数的 OG 图片。德文地址重复复现 503、正文 `error code: 1102`；韩文首次批量检查也返回 503。英文和中文抽查 200。新增静态图片修复，见下文。 |
| robots 屏蔽 | 4 | 旧 `/_next/static/media/*.woff2` 字体 URL；当前公开 robots 已允许该路径。不是核心 HTML 页面被屏蔽。 |
| 404 | 3 | `https://rename.tools/&`、`http://rename.tools/$`、旧 apple-icon 地址。异常路径不应伪装成正常首页；旧图标本次跟随跳转后已返回 200 image/png，部署后仍做回归。 |
| 备用规范页 | 2 | `/en?ref=producthunt`、`/en?ref=https://githubhelp.com`，保留指向 `/en` 的规范化。 |
| 已抓取未收录 | 5 | ja/es/fr 隐私页、HTTP 韩文首页、HTTP manifest；不是英文核心指南集体未收录。隐私页保持可访问，不为收录制造无关内容。 |
| 软 404 | 1 | `/ja/app` 的 4 月记录；GSC 显示 8 月 11 日验证已通过，仍保留示例。 |

三个核心 URL 的索引检查：

| URL | Google 索引 | 上次抓取（界面显示） | Google canonical |
| --- | --- | --- | --- |
| `/en` | 已收录；允许抓取与索引；抓取成功 | 2026-09-06 00:06:16 | 自身 |
| `/en/app` | 已收录；允许抓取与索引；抓取成功 | 2026-07-03 15:02:39 | 自身 |
| `/en/guides/organize-photos-by-date-sequence` | 已收录；允许抓取与索引；抓取成功；1 项有效面包屑 | 2026-07-31 13:52:14 | 自身 |

三者的实时测试也通过：2026-09-21 12:00–12:04（本地 GMT+8），HTTP 200、全部资源加载、可以索引；实际查看 Google 智能手机渲染截图，首页和指南正文正常，工具显示桌面式文件/规则/预览界面。照片指南唯一控制台消息是 Google 渲染器拒绝 Service Worker 注册，并未阻止正文或资源加载。实时测试不能代表新分支已上线，也不保证排名。

[站点地图报告](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Arename.tools) 的已提交列表为空，三个核心 URL 也显示“未检测到任何引荐站点地图”。公开 robots 正确声明 `https://rename.tools/sitemap.xml`。这不能证明 Google 从未发现 sitemap，但需要在部署后主动提交并核对读取结果。

## 已据此追加的修复

1. 将固定 OG 图从线上 `ImageResponse` 生成改为 `public/opengraph-image.png` 静态资产；各公共页 metadata 直接使用 PNG。
2. 旧七语言 `/[locale]/opengraph-image`（含旧查询参数）以 308 跳转到静态文件，保留已被 Google 发现的地址兼容性。
3. 原图绘制代码保留在 `scripts/generate-opengraph-image.tsx`，改图时运行 `pnpm generate:og`。生成 PNG 与原本 Next 构建产物的 SHA-256 完全相同，没有改变图像内容。
4. 问题定位为可复现的 Worker 超限响应及不必要的在线图像计算。未读取到生产 CPU 日志，不能声称已证明所有 5xx 的唯一原因；西班牙隐私页有一次 503、复查 200，需上线后继续关注普通 HTML。

[Cloudflare 1102 定义](https://developers.cloudflare.com/workers/observability/errors/)为超出 Worker CPU 时限。没有变更 Cloudflare 套餐、资源限制或生产设置。

## 内容和性能决策

- 继续采用已经完成的 SSR 正文、教程准确性、真实示例图、相关内链与资源加载优化。
- 先观察英文首页、德文首页和照片指南。查询样本不足以支持新增前缀、Plex、Windows/Mac 等独立页面；本轮第 7 项决策为暂不扩页。
- `/en/app` 已索引且自规范，但三个月页面表现表中没有它的记录；未观察到首页与工具页反复争夺查询的证据，不改 canonical、不加 noindex。没有记录不等于未索引。
- [GSC CWV](https://search.google.com/search-console/core-web-vitals?resource_id=sc-domain%3Arename.tools) 更新至 9 月 19 日，桌面和移动均显示近 90 天数据不足；保留 PageSpeed 实验室基线，不能评价真实用户 CWV 是否合格。

## 部署后的明确顺序

1. 发布本分支；记录实际日期。先检查静态 PNG 200、七语言旧图地址 308、原有 canonical/hreflang/sitemap 和正文。
2. 在 GSC 域名资源提交 `https://rename.tools/sitemap.xml`；确认成功读取及发现页面数。对首页、工具页、重点指南执行实时检查，再按需请求重新索引。
3. 复核历史 5xx 与 noindex 样本；当前已正常且适合验证的问题再启动“验证修正情况”。不把正常重定向/参数页排除当作错误全部清零。
4. 使用同样条件复测 PageSpeed；若普通 HTML 仍有 1102，读取 Cloudflare Worker CPU/错误日志以及已验证 Googlebot 请求记录，单独处理运行时或缓存问题。当前 Cloudflare 后台停在登录页，未取得日志。
5. 以实际发布日前 28 个完整 GSC 日为前期，待发布后有 28 个完整日及处理延迟后对比；保持网络搜索、国家、设备及品牌划分口径。另记录重抓取日期，避免把发布即刻当作 Google 已重新处理的时点。

本次没有提交 sitemap、请求索引、启动验证或部署，也没有调整任何统计后台配置。
