<div align="center">

# Rename.Tools

**强大的浏览器端批量文件重命名工具**

支持正则表达式、规则链、实时预览 — 所有操作本地完成，保护隐私。

[![GitHub License](https://img.shields.io/github/license/chenz24/rename.tools)](https://github.com/chenz24/rename.tools/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/chenz24/rename.tools)](https://github.com/chenz24/rename.tools)

[在线体验](https://rename.tools) · [报告问题](https://github.com/chenz24/rename.tools/issues) · [功能建议](https://github.com/chenz24/rename.tools/issues)

[English](./README.md) | 简体中文

</div>

---

## ✨ 功能特性

- **100% 本地处理** — 文件永不离开你的设备，所有操作通过浏览器 File System Access API 完成。
- **规则链** — 组合多个重命名规则（查找替换、正则、序号、大小写/样式、自定义 JS）依次执行。
- **实时预览** — 配置规则时即时查看变更，执行前检测冲突。
- **元数据支持** — 提取图片 EXIF 数据和音频标签，实现智能重命名。
- **剧集刮削** — 自动匹配视频文件与 TMDb 的剧集信息（需要网络和 TMDb API Key）。
- **导出脚本** — 生成 bash 或 PowerShell 脚本，支持离线执行。
- **撤销支持** — 界面内置撤销功能，还可导出撤销脚本用于命令行回滚。
- **离线可用** — 首次加载后无需网络（注：剧集刮削功能需要网络和 TMDb API Key）。
- **多语言** — 支持中文和英文。

## 🖼️ 截图

![Rename.Tools 界面](public/screenshots/product_screenshot.png)

## 🚀 快速开始

### 环境要求

- Node.js >= 20（参见 `.nvmrc`）
- pnpm

### 安装

```bash
# 克隆仓库
git clone https://github.com/chenz24/rename.tools.git
cd rename.tools

# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env.local

# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| **框架** | [Next.js 16](https://nextjs.org)（App Router, Turbopack） |
| **UI** | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| **状态管理** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **拖拽** | [@dnd-kit](https://dndkit.com/) |
| **元数据** | [exifr](https://github.com/MikeKovaworker/exifr), [music-metadata-browser](https://github.com/Borewit/music-metadata-browser) |
| **国际化** | [next-intl](https://next-intl.dev) |
| **代码检查** | [Biome](https://biomejs.dev) |
| **语言** | TypeScript |

## 📖 使用方法

### 快速上手

1. **导入文件** — 拖拽文件/文件夹或使用文件选择器
2. **添加规则** — 构建包含多个重命名操作的规则链
3. **预览** — 实时查看变更，自动检测冲突
4. **执行** — 直接在本地重命名文件

### 可用规则类型

| 规则 | 描述 |
|------|------|
| **查找替换** | 文本替换，支持大小写敏感和位置选项 |
| **正则替换** | 完整正则支持，包括捕获组和反向引用 |
| **添加/插入** | 在开头、结尾或指定位置插入文本 |
| **序号** | 自动编号，可自定义起始值、步长和位数 |
| **大小写/样式** | 大写、小写、首字母大写、短横线命名等 |
| **移除/清理** | 按数量、范围或类型（数字、符号等）移除字符 |
| **自定义 JS** | 编写自己的转换函数 |

### 模板变量

在插入规则中使用变量：

- `{name}` — 原始文件名
- `{n}` — 序号
- `{date}`, `{time}`, `{datetime}` — 当前日期/时间
- `{exifDate}`, `{exifCamera}` — EXIF 元数据
- `{mediaArtist}`, `{mediaTitle}`, `{mediaAlbum}` — 音频标签

## 🌐 浏览器支持

| 浏览器 | 直接重命名 | 导出脚本 |
|--------|-----------|----------|
| Chrome / Edge / Brave / Arc | ✅ | ✅ |
| Firefox / Safari | ❌ | ✅ |

> 直接重命名需要 File System Access API（仅 Chromium 内核浏览器支持）。其他浏览器可使用示例测试模式或导出脚本。

## 📦 脚本命令

| 命令 | 描述 |
|------|------|
| `pnpm dev` | 启动 Turbopack 开发服务器 |
| `pnpm build` | 生产环境构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 使用 Biome 检查代码 |
| `pnpm format` | 使用 Biome 格式化代码 |
| `pnpm check` | 检查 + 格式化（自动修复） |

## 🔒 隐私保护

Rename.Tools 采用 **隐私优先架构**：

- **无上传** — 文件通过浏览器 API 访问，从不传输
- **无服务端处理** — 所有重命名逻辑在客户端运行
- **无数据留存** — 关闭标签页后一切消失
- **无账号** — 无需注册、无追踪、不分析你的文件

## ❓ 常见问题

**Rename.Tools 真的免费吗？**
是的，完全免费且开源。没有高级版、试用期或隐藏费用。

**我的文件会上传到服务器吗？**
不会。Rename.Tools 完全在浏览器中运行。文件通过 File System Access API 访问，从不离开你的设备。

**支持哪些浏览器？**
Rename.Tools 在 Chromium 内核浏览器（Chrome、Edge、Brave、Arc）中效果最佳。Firefox 和 Safari 可使用示例测试模式或导出脚本。

**可以撤销重命名操作吗？**
可以。Rename.Tools 在界面中提供了内置撤销按钮来恢复上次重命名操作。如有需要，你还可以导出撤销脚本用于命令行回滚。

**可以处理多少文件？**
Rename.Tools 可以在单次批量操作中处理数千个文件。性能取决于你的浏览器和设备能力。

**完全离线可用吗？**
首次加载页面后大部分功能可离线使用。但剧集刮削功能需要网络访问和 TMDb API Key 来查询 TMDb API。

## 🤝 参与贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本项目
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 发起 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com) 提供精美组件
- [TMDb](https://www.themoviedb.org) 提供剧集数据 API
- 所有帮助改进本项目的贡献者

---

<div align="center">

**[⬆ 返回顶部](#renametools)**

用 ❤️ 制作 by [chenz24](https://github.com/chenz24)

</div>
