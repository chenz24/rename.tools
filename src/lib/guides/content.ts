export const GUIDE_LOCALES = ["en", "zh"] as const;

export type GuideLocale = (typeof GUIDE_LOCALES)[number];

export type GuideCategory = "getting-started" | "photos" | "patterns" | "numbering" | "media";

export interface GuideExample {
	before: string;
	after: string;
	note?: string;
}

export interface GuideImage {
	src: string;
	alt: string;
	caption?: string;
}

export interface GuideSection {
	title: string;
	body: string[];
	steps?: string[];
	examples?: GuideExample[];
	image?: GuideImage;
}

export interface LocalizedGuideContent {
	title: string;
	description: string;
	intro: string;
	categoryLabel: string;
	sections: GuideSection[];
}

export interface Guide {
	slug: string;
	category: GuideCategory;
	updatedAt: string;
	readingTime: number;
	relatedSlugs: string[];
	content: Record<GuideLocale, LocalizedGuideContent>;
}

export interface LocalizedGuide extends Omit<Guide, "content"> {
	locale: GuideLocale;
	title: string;
	description: string;
	intro: string;
	categoryLabel: string;
	sections: GuideSection[];
}

export const guideIndexCopy: Record<
	GuideLocale,
	{
		title: string;
		description: string;
		eyebrow: string;
		heading: string;
		intro: string;
		allGuides: string;
		featured: string;
		updated: string;
		minRead: string;
		relatedGuides: string;
		startRenaming: string;
		readGuide: string;
		backToGuides: string;
		ctaTitle: string;
		ctaDesc: string;
	}
> = {
	en: {
		title: "Guides - Rename.Tools",
		description:
			"Practical guides for batch file renaming with Rename.Tools: regex, sequences, photo organization, music libraries, and video filenames.",
		eyebrow: "Guides",
		heading: "Practical file renaming guides",
		intro:
			"Learn reliable workflows for cleaning up photos, media libraries, downloads, and archive folders with live preview and local processing.",
		allGuides: "All guides",
		featured: "Featured workflows",
		updated: "Updated",
		minRead: "min read",
		relatedGuides: "Related guides",
		startRenaming: "Start renaming",
		readGuide: "Read guide",
		backToGuides: "Back to guides",
		ctaTitle: "Ready to try the workflow?",
		ctaDesc:
			"Open Rename.Tools, add a few sample files, and preview every rule before touching the real filenames.",
	},
	zh: {
		title: "使用指南 - Rename.Tools",
		description:
			"Rename.Tools 批量文件重命名实用指南：正则表达式、序号、照片整理、音乐库和剧集文件名整理。",
		eyebrow: "使用指南",
		heading: "实用的文件重命名指南",
		intro: "学习如何用实时预览和本地处理工作流，安全整理照片、媒体库、下载文件和归档文件夹。",
		allGuides: "全部指南",
		featured: "精选工作流",
		updated: "更新于",
		minRead: "分钟阅读",
		relatedGuides: "相关指南",
		startRenaming: "开始重命名",
		readGuide: "阅读指南",
		backToGuides: "返回指南",
		ctaTitle: "准备试试这个工作流？",
		ctaDesc: "打开 Rename.Tools，先添加几个示例文件，用预览确认每条规则后再处理真实文件名。",
	},
};

export const guides: Guide[] = [
	{
		slug: "batch-file-rename-basics",
		category: "getting-started",
		updatedAt: "2026-05-22",
		readingTime: 5,
		relatedSlugs: ["sequence-file-numbering", "regex-batch-rename"],
		content: {
			en: {
				title: "Batch file renaming basics: import, preview, execute",
				description:
					"Learn the safest Rename.Tools workflow: add files, build a rule chain, inspect the preview, resolve conflicts, and execute locally.",
				intro:
					"Batch renaming works best when you treat it like a reviewable change: import a small set, add one rule at a time, and only execute after the preview is clean.",
				categoryLabel: "Getting started",
				sections: [
					{
						title: "Use the preview as your safety layer",
						body: [
							"Rename.Tools never needs an upload for normal file renaming. The browser reads your selected files locally and shows a proposed new name for every selected item.",
							"Start with a simple rule, confirm the preview, then add the next rule. This makes mistakes easy to spot before anything changes on disk.",
						],
						image: {
							src: "/guides/screenshots/app-sample-files.png",
							alt: "Rename.Tools sample test mode with six imported filenames and an unchanged preview",
							caption:
								"Use Sample Test Mode to rehearse a workflow before selecting real files from your device.",
						},
						steps: [
							"Open the app and add files or a folder.",
							"Choose whether rules apply to the name, extension, or full filename.",
							"Add a rule such as Find & Replace, Insert, Sequence, or Regex.",
							"Review changed files and conflict warnings in the preview panel.",
							"Execute only when every new name looks correct.",
						],
					},
					{
						title: "A simple first workflow",
						body: [
							"This example removes camera prefixes, adds a date, and gives each file a stable number. It is a good pattern for learning because every step is visible.",
						],
						image: {
							src: "/guides/screenshots/app-sequence-preview.png",
							alt: "Rename.Tools rule chain with Find and Replace plus Sequence rules updating the preview",
							caption:
								"Add rules one by one and check the preview after each change. Here the sequence rule updates all six sample files.",
						},
						examples: [
							{
								before: "IMG_0421.jpg",
								after: "2026-05-22_001.jpg",
								note: "Remove IMG_, insert a date prefix, then add a padded sequence.",
							},
							{
								before: "IMG_0422.jpg",
								after: "2026-05-22_002.jpg",
							},
						],
					},
					{
						title: "Before you execute",
						body: [
							"Look for unchanged files, duplicate target names, and unexpected extension changes. If you are using Firefox or Safari, export a script instead of direct browser renaming.",
							"Keep the first real run small. Once the rule chain is proven, reuse it on larger folders or save it as a preset.",
						],
					},
				],
			},
			zh: {
				title: "批量重命名入门：导入、预览、执行",
				description:
					"学习 Rename.Tools 最稳妥的工作流：添加文件、构建规则链、检查预览、处理冲突，并在本地执行重命名。",
				intro:
					"批量重命名最好像代码变更一样先审查：先导入少量文件，一次添加一条规则，预览确认无误后再执行。",
				categoryLabel: "入门",
				sections: [
					{
						title: "把预览当作安全层",
						body: [
							"Rename.Tools 的常规重命名不需要上传文件。浏览器在本地读取你选择的文件，并为每个文件显示拟生成的新名称。",
							"先加一条简单规则，确认预览，再添加下一条规则。这样可以在真正改名之前发现问题。",
						],
						image: {
							src: "/guides/screenshots/app-sample-files.png",
							alt: "Rename.Tools 示例测试模式，已导入 6 个示例文件并显示未变化的预览",
							caption: "用示例测试模式先演练工作流，再选择设备中的真实文件。",
						},
						steps: [
							"打开应用，添加文件或文件夹。",
							"选择规则作用于文件名、扩展名还是完整文件名。",
							"添加查找替换、插入、序号或正则等规则。",
							"在预览面板检查变更文件和冲突提示。",
							"所有新名称都确认正确后再执行。",
						],
					},
					{
						title: "一个简单的首次工作流",
						body: [
							"这个例子会移除相机前缀、添加日期，并为每个文件生成稳定编号。它很适合入门，因为每一步都能在预览里看到。",
						],
						image: {
							src: "/guides/screenshots/app-sequence-preview.png",
							alt: "Rename.Tools 规则链中包含查找替换和序号规则，预览面板实时显示结果",
							caption:
								"逐条添加规则，并在每一步后检查预览。这里的序号规则更新了全部 6 个示例文件。",
						},
						examples: [
							{
								before: "IMG_0421.jpg",
								after: "2026-05-22_001.jpg",
								note: "移除 IMG_，插入日期前缀，再添加补零序号。",
							},
							{
								before: "IMG_0422.jpg",
								after: "2026-05-22_002.jpg",
							},
						],
					},
					{
						title: "执行前检查什么",
						body: [
							"重点检查未变化文件、重复目标名，以及是否意外修改了扩展名。如果使用 Firefox 或 Safari，可以导出脚本而不是直接在浏览器里改名。",
							"第一次真实执行建议选小批量文件。规则链验证稳定后，再复用到更大的文件夹，或保存为预设。",
						],
					},
				],
			},
		},
	},
	{
		slug: "organize-photos-by-date-sequence",
		category: "photos",
		updatedAt: "2026-05-22",
		readingTime: 6,
		relatedSlugs: ["batch-file-rename-basics", "sequence-file-numbering"],
		content: {
			en: {
				title: "Organize photos by date and sequence number",
				description:
					"Rename camera photos with date prefixes and padded sequence numbers so albums stay sortable and easy to scan.",
				intro:
					"Camera filenames are unique but rarely meaningful. A date plus sequence pattern keeps photos chronological, portable, and easy to search later.",
				categoryLabel: "Photos",
				sections: [
					{
						title: "Choose a stable photo naming pattern",
						body: [
							"A good photo name should sort correctly outside the app. Put the date first, then a padded sequence number, then an optional place or event label.",
							"Use four-digit years and two-digit months and days. That keeps alphabetical sorting aligned with time order.",
						],
						examples: [
							{
								before: "DSC_0007.JPG",
								after: "2026-05-22_001_tokyo.JPG",
							},
							{
								before: "IMG_1842.HEIC",
								after: "2026-05-22_002_tokyo.HEIC",
							},
						],
					},
					{
						title: "Build the rule chain",
						body: [
							"Use Find & Replace or Remove to strip camera prefixes when they do not carry useful meaning. Then use Sequence with a template so the final name is generated in one predictable pass.",
						],
						image: {
							src: "/guides/screenshots/app-sequence-preview.png",
							alt: "Rename.Tools photo cleanup workflow showing camera filenames converted with a sequence rule",
							caption:
								"The sequence preview makes it easy to confirm ordering before you rename an entire photo folder.",
						},
						steps: [
							"Sort the imported photos by name or modified time.",
							"Add a Sequence rule with padding set to 3 or 4.",
							"Use a template like {date}_{n}_trip or {exif.date}_{n}_trip when EXIF metadata is loaded.",
							"Keep extension scope on filename only unless you intentionally want to change extensions.",
						],
					},
					{
						title: "When EXIF metadata helps",
						body: [
							"If the photos include EXIF dates, load metadata and prefer EXIF date variables over today's date. This is useful when files were copied, downloaded, or edited after they were taken.",
							"Keep a fallback workflow for screenshots and exported images, because they may not include camera metadata.",
						],
					},
				],
			},
			zh: {
				title: "按日期和序号整理照片",
				description: "用日期前缀和补零序号重命名相机照片，让相册保持可排序、易浏览、易查找。",
				intro:
					"相机文件名通常唯一，但不够直观。日期加序号的格式能保持时间顺序，也方便跨设备搜索和归档。",
				categoryLabel: "照片整理",
				sections: [
					{
						title: "选择稳定的照片命名格式",
						body: [
							"好的照片文件名应该离开应用后依然能正确排序。建议把日期放在最前面，然后是补零序号，最后可选地点或事件标签。",
							"年份用四位，月份和日期用两位。这样按字母排序时也会自然符合时间顺序。",
						],
						examples: [
							{
								before: "DSC_0007.JPG",
								after: "2026-05-22_001_tokyo.JPG",
							},
							{
								before: "IMG_1842.HEIC",
								after: "2026-05-22_002_tokyo.HEIC",
							},
						],
					},
					{
						title: "构建规则链",
						body: [
							"如果相机前缀没有实际意义，可以用查找替换或删除规则清理掉。然后用序号规则和模板一次生成稳定的新名称。",
						],
						image: {
							src: "/guides/screenshots/app-sequence-preview.png",
							alt: "Rename.Tools 照片清理工作流，通过序号规则转换相机文件名",
							caption: "序号预览能帮你在处理整个照片文件夹前确认排序是否正确。",
						},
						steps: [
							"按名称或修改时间排序导入的照片。",
							"添加序号规则，把补零位数设置为 3 或 4。",
							"模板使用 {date}_{n}_trip；如果已加载 EXIF，可使用 {exif.date}_{n}_trip。",
							"除非明确要修改扩展名，否则规则作用域保持为仅文件名。",
						],
					},
					{
						title: "什么时候使用 EXIF 元数据",
						body: [
							"如果照片带有 EXIF 拍摄时间，建议先加载元数据，再使用 EXIF 日期变量，而不是今天的日期。文件被复制、下载或编辑过时，这一点尤其有用。",
							"截图和导出图片可能没有相机元数据，因此也要准备一个不依赖 EXIF 的备用规则链。",
						],
					},
				],
			},
		},
	},
	{
		slug: "regex-batch-rename",
		category: "patterns",
		updatedAt: "2026-05-22",
		readingTime: 7,
		relatedSlugs: ["batch-file-rename-basics", "sequence-file-numbering"],
		content: {
			en: {
				title: "Use regular expressions for batch file renaming",
				description:
					"Learn practical regex rename patterns for removing clutter, rearranging dates, and extracting useful filename parts.",
				intro:
					"Regex is the most powerful rename rule when filenames share a pattern. Use it when simple find and replace cannot describe the change precisely.",
				categoryLabel: "Patterns",
				sections: [
					{
						title: "Start with one clear pattern",
						body: [
							"Regex works best when filenames are consistent. Match only the part you intend to change, and keep the replacement readable.",
							"Use capture groups when you need to keep useful parts and rearrange them in a new order.",
						],
						examples: [
							{
								before: "2026-05-22 invoice client-a.pdf",
								after: "invoice_client-a_2026-05-22.pdf",
								note: "Capture the date and title, then swap their order.",
							},
							{
								before: "movie.name.s01e03.1080p.mkv",
								after: "movie name S01E03.mkv",
							},
						],
					},
					{
						title: "Useful regex rename patterns",
						body: [
							"These patterns are good starting points. Preview them on a small file set before applying them to a folder with thousands of files.",
						],
						image: {
							src: "/guides/screenshots/app-regex-preview.png",
							alt: "Rename.Tools regex rule extracting a video episode code and updating the preview",
							caption:
								"Regex rules are easiest to audit when the preview shows the exact captured parts and replacement result.",
						},
						steps: [
							"Remove bracketed notes: \\s*\\[[^\\]]+\\]",
							"Move leading date to the end: ^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$ -> $2_$1",
							"Normalize episode casing: s(\\d+)e(\\d+) -> S$1E$2",
							"Collapse repeated spaces: \\s+ -> single space",
						],
					},
					{
						title: "Keep regex safe",
						body: [
							"Avoid overly broad patterns like .* unless you really mean to replace everything. If a replacement produces empty names or duplicates, stop and narrow the match.",
							"When the regex rule is hard to reason about, split the workflow into two or three simpler rules. The preview will be easier to audit.",
						],
					},
				],
			},
			zh: {
				title: "用正则表达式批量重命名",
				description:
					"学习实用的正则重命名模式，用于清理杂乱字符、重排日期、提取文件名中的关键信息。",
				intro:
					"当文件名具有共同模式时，正则是最强大的重命名规则。简单查找替换无法精确描述变更时，就适合使用正则。",
				categoryLabel: "模式规则",
				sections: [
					{
						title: "从一个清晰模式开始",
						body: [
							"正则最适合处理格式一致的文件名。只匹配你真正想改变的部分，并让替换结果保持可读。",
							"如果需要保留并重排有用片段，就使用捕获组。",
						],
						examples: [
							{
								before: "2026-05-22 invoice client-a.pdf",
								after: "invoice_client-a_2026-05-22.pdf",
								note: "捕获日期和标题，再交换顺序。",
							},
							{
								before: "movie.name.s01e03.1080p.mkv",
								after: "movie name S01E03.mkv",
							},
						],
					},
					{
						title: "常用正则重命名模式",
						body: [
							"下面这些模式适合作为起点。先用少量文件预览确认，再应用到包含大量文件的文件夹。",
						],
						image: {
							src: "/guides/screenshots/app-regex-preview.png",
							alt: "Rename.Tools 正则规则提取视频剧集编号，并在预览中显示更新结果",
							caption: "正则规则最适合配合预览检查：能直接看到捕获内容和替换结果是否符合预期。",
						},
						steps: [
							"移除方括号备注：\\s*\\[[^\\]]+\\]",
							"把开头日期移到末尾：^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$ -> $2_$1",
							"统一剧集大小写：s(\\d+)e(\\d+) -> S$1E$2",
							"压缩重复空格：\\s+ -> 单个空格",
						],
					},
					{
						title: "让正则保持安全",
						body: [
							"除非确实要替换全部内容，否则避免使用过宽的 .*。如果替换后出现空名称或重复名称，先停下来缩小匹配范围。",
							"当一条正则难以判断时，把工作流拆成两三条更简单的规则。这样预览更容易检查。",
						],
					},
				],
			},
		},
	},
	{
		slug: "sequence-file-numbering",
		category: "numbering",
		updatedAt: "2026-05-22",
		readingTime: 5,
		relatedSlugs: ["organize-photos-by-date-sequence", "batch-file-rename-basics"],
		content: {
			en: {
				title: "Create stable filenames with sequence numbering",
				description:
					"Use padded sequence numbers, sorting, and per-folder numbering to create filenames that stay organized everywhere.",
				intro:
					"Sequence numbers are simple, but the setup matters. Padding, sort order, and scope determine whether names stay stable after export, upload, or archive.",
				categoryLabel: "Numbering",
				sections: [
					{
						title: "Use padding for reliable sorting",
						body: [
							"Without padding, file managers may sort 10 before 2. Padding fixes that by making every number the same width.",
							"Use 2 digits for small albums, 3 digits for hundreds of files, and 4 digits when the folder may grow over time.",
						],
						image: {
							src: "/guides/screenshots/app-sequence-preview.png",
							alt: "Rename.Tools sequence rule preview with zero-padded numbers applied to sample files",
							caption:
								"Zero padding is visible immediately in the preview, so sorting problems are easy to catch before execution.",
						},
						examples: [
							{
								before: "photo 1.jpg, photo 2.jpg, photo 10.jpg",
								after: "001_photo.jpg, 002_photo.jpg, 010_photo.jpg",
							},
						],
					},
					{
						title: "Choose the right sequence scope",
						body: [
							"Global numbering is best when the full batch should be one ordered set. Per-folder numbering is better for albums, chapters, exports, or client folders that should each start at 001.",
						],
						steps: [
							"Use global scope for one album or one export batch.",
							"Use per-folder scope when each folder should keep its own sequence.",
							"Use per-extension scope when images, videos, and documents should be numbered separately.",
							"Sort before numbering when imported order is not reliable.",
						],
					},
					{
						title: "Combine sequences with templates",
						body: [
							"A sequence rule can do more than add a number. Combine {n}, {name}, dates, folder names, or metadata variables to create names that are structured but still readable.",
						],
						examples: [
							{
								before: "scan.jpg",
								after: "archive_2026_001_scan.jpg",
							},
						],
					},
				],
			},
			zh: {
				title: "用序号规则生成稳定文件名",
				description: "使用补零序号、排序和按文件夹编号，生成在任何地方都能保持有序的文件名。",
				intro:
					"序号看似简单，但设置很关键。补零、排序和作用域会决定文件导出、上传或归档后是否依然稳定。",
				categoryLabel: "序号编号",
				sections: [
					{
						title: "用补零保证可靠排序",
						body: [
							"如果不补零，某些文件管理器可能把 10 排在 2 前面。补零能让所有数字长度一致，排序更稳定。",
							"小相册可用 2 位，数百个文件建议 3 位，如果文件夹未来还会增长，可以用 4 位。",
						],
						image: {
							src: "/guides/screenshots/app-sequence-preview.png",
							alt: "Rename.Tools 序号规则预览，示例文件被添加补零编号",
							caption: "补零效果会立刻显示在预览里，因此可以在执行前发现排序问题。",
						},
						examples: [
							{
								before: "photo 1.jpg, photo 2.jpg, photo 10.jpg",
								after: "001_photo.jpg, 002_photo.jpg, 010_photo.jpg",
							},
						],
					},
					{
						title: "选择合适的序号作用域",
						body: [
							"全局编号适合把整个批次当成一个有序集合。按文件夹编号更适合相册、章节、导出目录或客户文件夹，让每个文件夹都从 001 开始。",
						],
						steps: [
							"单个相册或单次导出批次使用全局作用域。",
							"每个文件夹都要单独编号时使用按文件夹作用域。",
							"图片、视频、文档需要分别编号时使用按扩展名作用域。",
							"导入顺序不可靠时，先排序再编号。",
						],
					},
					{
						title: "把序号和模板组合",
						body: [
							"序号规则不只是添加数字。可以组合 {n}、{name}、日期、文件夹名或元数据变量，生成结构清晰且可读的新名称。",
						],
						examples: [
							{
								before: "scan.jpg",
								after: "archive_2026_001_scan.jpg",
							},
						],
					},
				],
			},
		},
	},
	{
		slug: "organize-music-video-files",
		category: "media",
		updatedAt: "2026-05-22",
		readingTime: 6,
		relatedSlugs: ["regex-batch-rename", "sequence-file-numbering"],
		content: {
			en: {
				title: "Organize music libraries and video episode filenames",
				description:
					"Clean up music files and video episodes with metadata variables, sequence rules, regex patterns, and TMDb-assisted matching.",
				intro:
					"Media files often arrive with noisy release names. Rename.Tools can turn them into predictable names for players, media servers, and shared folders.",
				categoryLabel: "Media",
				sections: [
					{
						title: "Music library naming",
						body: [
							"For albums, filenames should preserve track order and remain readable outside the music player. If tags are available, load metadata and use artist, title, album, or track variables.",
						],
						examples: [
							{
								before: "love story.mp3",
								after: "01. Taylor Swift - Love Story.mp3",
							},
							{
								before: "track_07.flac",
								after: "07. Artist - Song Title.flac",
							},
						],
					},
					{
						title: "Video and episode cleanup",
						body: [
							"Video files often include dots, quality tags, release group names, and inconsistent episode casing. Use regex to extract the show and episode code, then clean separators with find and replace.",
							"When you have a TMDb API key, use the media scraper to match episodes and bring in better titles before generating final names.",
						],
						image: {
							src: "/guides/screenshots/app-regex-preview.png",
							alt: "Rename.Tools regex preview converting a noisy episode filename into a cleaner S01E03 name",
							caption:
								"Start with one episode pattern, confirm the preview, then apply the same rule to the rest of the season.",
						},
						steps: [
							"Normalize separators by replacing dots or underscores with spaces.",
							"Use regex to preserve S01E03 style episode numbers.",
							"Remove quality tags like 720p, 1080p, WEB-DL, or BluRay when they are not needed.",
							"Preview the full season before executing.",
						],
						examples: [
							{
								before: "show.name.s01e03.1080p.web-dl.mkv",
								after: "Show Name S01E03.mkv",
							},
						],
					},
					{
						title: "Keep media server compatibility",
						body: [
							"Use consistent separators and avoid changing extensions unless you are intentionally converting files elsewhere. Rename.Tools changes names, not media formats.",
							"For shared libraries, prefer predictable patterns over clever names. A boring format that sorts correctly is easier to maintain.",
						],
					},
				],
			},
			zh: {
				title: "整理音乐库与剧集文件名",
				description:
					"用元数据变量、序号规则、正则模式和 TMDb 辅助匹配，清理音乐文件和视频剧集文件名。",
				intro:
					"媒体文件常常带着杂乱的发布信息。Rename.Tools 可以把它们整理成适合播放器、媒体服务器和共享文件夹的稳定名称。",
				categoryLabel: "媒体整理",
				sections: [
					{
						title: "音乐库命名",
						body: [
							"专辑文件名应该保留曲目顺序，并且离开播放器后依然可读。如果音频标签可用，先加载元数据，再使用艺术家、标题、专辑或曲目号变量。",
						],
						examples: [
							{
								before: "love story.mp3",
								after: "01. Taylor Swift - Love Story.mp3",
							},
							{
								before: "track_07.flac",
								after: "07. Artist - Song Title.flac",
							},
						],
					},
					{
						title: "视频与剧集清理",
						body: [
							"视频文件常包含点号、清晰度标签、发布组名称和不统一的集数大小写。可以用正则提取剧名和集数代码，再用查找替换清理分隔符。",
							"如果你有 TMDb API Key，可以使用媒体刮削功能匹配剧集，并在生成最终名称前引入更准确的标题。",
						],
						image: {
							src: "/guides/screenshots/app-regex-preview.png",
							alt: "Rename.Tools 正则预览，把杂乱的剧集文件名转换成更清晰的 S01E03 名称",
							caption: "先从一个剧集模式开始，确认预览正确后，再应用到整季文件。",
						},
						steps: [
							"把点号或下划线替换为空格，统一分隔符。",
							"用正则保留 S01E03 这种剧集编号。",
							"在不需要时移除 720p、1080p、WEB-DL、BluRay 等质量标签。",
							"执行前先预览完整季的文件。",
						],
						examples: [
							{
								before: "show.name.s01e03.1080p.web-dl.mkv",
								after: "Show Name S01E03.mkv",
							},
						],
					},
					{
						title: "保持媒体服务器兼容",
						body: [
							"使用统一分隔符，除非你在其他工具里真正转换了格式，否则不要修改扩展名。Rename.Tools 只改文件名，不转换媒体格式。",
							"共享媒体库更适合可预测的格式，而不是过于聪明的命名。能正确排序的普通格式更容易长期维护。",
						],
					},
				],
			},
		},
	},
];

export function isIndexableGuideLocale(locale: string): locale is GuideLocale {
	return GUIDE_LOCALES.includes(locale as GuideLocale);
}

export function getGuideLocale(locale: string): GuideLocale {
	return locale === "zh" ? "zh" : "en";
}

export function getGuideIndexCopy(locale: string) {
	return guideIndexCopy[getGuideLocale(locale)];
}

export function getAllGuides(locale: string): LocalizedGuide[] {
	const guideLocale = getGuideLocale(locale);
	return guides.map((guide) => localizeGuide(guide, guideLocale));
}

export function getGuideBySlug(slug: string, locale: string): LocalizedGuide | undefined {
	const guide = guides.find((item) => item.slug === slug);
	return guide ? localizeGuide(guide, getGuideLocale(locale)) : undefined;
}

export function getRelatedGuides(guide: LocalizedGuide, locale: string): LocalizedGuide[] {
	return guide.relatedSlugs
		.map((slug) => getGuideBySlug(slug, locale))
		.filter((item): item is LocalizedGuide => item != null);
}

export function getGuidePrimaryImage(guide: LocalizedGuide): GuideImage | undefined {
	return guide.sections.find((section) => section.image)?.image;
}

export function getGuideSlugs(): string[] {
	return guides.map((guide) => guide.slug);
}

function localizeGuide(guide: Guide, locale: GuideLocale): LocalizedGuide {
	const content = guide.content[locale];
	return {
		slug: guide.slug,
		category: guide.category,
		updatedAt: guide.updatedAt,
		readingTime: guide.readingTime,
		relatedSlugs: guide.relatedSlugs,
		locale,
		title: content.title,
		description: content.description,
		intro: content.intro,
		categoryLabel: content.categoryLabel,
		sections: content.sections,
	};
}
