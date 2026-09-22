import { type GuideLocale, getGuideLocale } from "./locales";
import { taskGuides } from "./task-guides";
import de from "./translations/de.json";
import es from "./translations/es.json";
import fr from "./translations/fr.json";
import ja from "./translations/ja.json";
import ko from "./translations/ko.json";

export { getGuideIndexCopy, guideIndexCopy } from "./copy";
export { GUIDE_LOCALES, getGuideLocale, isIndexableGuideLocale } from "./locales";

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
	publishedAt?: string;
	updatedAt?: string;
	title: string;
	description: string;
	intro: string;
	categoryLabel: string;
	sections: GuideSection[];
}

export interface Guide<L extends GuideLocale = GuideLocale> {
	slug: string;
	category: GuideCategory;
	publishedAt: string;
	updatedAt: string;
	readingTime: number;
	relatedSlugs: string[];
	content: Record<L, LocalizedGuideContent>;
}

export interface LocalizedGuide extends Omit<Guide, "content"> {
	locale: GuideLocale;
	title: string;
	description: string;
	intro: string;
	categoryLabel: string;
	sections: GuideSection[];
}

export type BaseGuide = Guide<"en" | "zh">;

const baseGuides: BaseGuide[] = [
	{
		slug: "batch-file-rename-basics",
		category: "getting-started",
		publishedAt: "2026-05-22",
		updatedAt: "2026-09-21",
		readingTime: 9,
		relatedSlugs: [
			"sequence-file-numbering",
			"add-prefix-suffix-to-filenames",
			"replace-spaces-in-filenames",
		],
		content: {
			en: {
				title: "Bulk file renaming basics: import, preview, execute",
				description:
					"Learn the safest bulk rename workflow: add files, build a rule chain, inspect the preview, resolve conflicts, and execute locally.",
				intro:
					"Bulk renaming works best when you treat it like a reviewable change: import a small set, add one rule at a time, and only execute after the preview is clean.",
				categoryLabel: "Getting started",
				sections: [
					{
						title: "Start in Sample Test Mode",
						body: [
							"Sample Test Mode is the safest way to learn the interface because it does not ask for file permissions and cannot change anything on disk. You paste or generate filenames, then test the same rules you would use on real files.",
							"Start with IMG_0421.jpg and IMG_0422.jpg, one per line, to reproduce the screenshots and the next rule chain. Later, add documents and video filenames to check how your rules affect different names.",
						],
						image: {
							src: "/guides/screenshots/samples-en.png",
							alt: "Two imported camera filenames, before adding rules.",
							caption: "Two imported camera filenames, before adding rules.",
						},
						steps: [
							"Open the app and click Try Sample Test Mode in the file panel.",
							"Paste one filename per line, including the extension, such as IMG_0421.jpg.",
							"Click Import Files inside the sample panel.",
							"Confirm the file list and preview both show the same unchanged names.",
							"Keep Scope set to Name so the first rules do not accidentally rewrite extensions.",
						],
					},
					{
						title: "Build one rule at a time",
						body: [
							"To enter a template below, click Add Text, paste the complete template including braces, then press Enter or Tab to apply it. It becomes draggable text and variable blocks; check the updated preview before continuing.",
							"A reliable bulk rename workflow is a sequence of small, reviewable edits. Add the cleanup rule first, check the preview, then add numbering. If the preview changes something unexpected, the last rule you added is the easiest place to look.",
							"The first rule demonstrates removing a prefix. The Sequence template then replaces the whole name with a fixed date and a padded number; the prefix cleanup is optional when you use this whole-name template.",
						],
						image: {
							src: "/guides/screenshots/basics-en.png",
							alt: "Fixed-date template produces 2026-05-22_001.jpg and 2026-05-22_002.jpg. Scroll the rule panel to inspect each rule.",
							caption:
								"Fixed-date template produces 2026-05-22_001.jpg and 2026-05-22_002.jpg. Scroll the rule panel to inspect each rule.",
						},
						steps: [
							"Keep Scope set to Name. Add Find & Replace: Find IMG_, Replace with empty. The first preview becomes 0421.jpg.",
							"Add Sequence after Find & Replace: Numeric, Start value 1, Step 1, Zero padding 3, global scope. Leave Preserve original numbers and Sort before numbering off for this example.",
							"Set the Sequence template to 2026-05-22_{n}. A non-empty template replaces the entire name, so 0421 is discarded while .jpg is preserved by Name scope.",
							"The date is literal so you can reproduce the example on any day. Use {date}_{n} for the current UTC date instead, or {exif.date}_{n} after loading photo metadata for the capture date.",
							"Import IMG_0421.jpg and IMG_0422.jpg in that order. Confirm 2026-05-22_001.jpg and 2026-05-22_002.jpg in the preview.",
						],
						examples: [
							{
								before: "IMG_0421.jpg",
								after: "2026-05-22_001.jpg",
								note: "Name scope; Sequence template 2026-05-22_{n}, start 1, step 1, padding 3.",
							},
							{
								before: "IMG_0422.jpg",
								after: "2026-05-22_002.jpg",
							},
						],
					},
					{
						title: "Read the preview like a checklist",
						body: [
							"The preview panel is not just a visual nicety; it is the review step. Scan the Original column first, then the New Name column, and look for changes that do not match the rule you thought you wrote.",
							"Use Affected Only when the list is long. It hides unchanged files so you can focus on what will actually be renamed. Use Conflicts Only whenever the conflict count is non-zero, because duplicate target names must be fixed before execution.",
						],
						steps: [
							"Check that every changed file still has the correct extension.",
							"Check that no new name is empty or only a number.",
							"Check that numbering order matches the file order you want.",
							"Check Conflicts Only before execution, even if the list looks clean.",
						],
						examples: [
							{
								before: "report (final).docx",
								after: "005report (final).docx",
								note: "Separate cautionary example: with a blank Sequence template, Position Start, start 1 and padding 3, the fifth selected file keeps its old name after 005.",
							},
						],
					},
					{
						title: "Execute directly or export a script",
						body: [
							"In Chromium browsers, Rename.Tools can directly rename files selected through the File System Access API. In Firefox or Safari, or when you want a reviewable command-line workflow, export a script instead.",
							"Script export is also useful for teams: one person can build and review the rename plan in the browser, then run the generated Bash or PowerShell script in a controlled folder.",
						],
						steps: [
							"For real files, start with a small folder or a copied test folder.",
							"Click Export Plan if you want a plain mapping of old names to new names.",
							"Click Export Script when direct browser renaming is not available or you prefer terminal execution.",
							"Click Execute Rename only after the preview and conflict checks are clean.",
							"After execution, use Undo immediately if you notice a mistake.",
						],
					},
					{
						title: "Common first-run mistakes",
						body: [
							"Most mistakes come from applying a rule to more files than intended. If only photos should change, filter the file list first or build the rule so it matches only photo-style names.",
							"Another common mistake is changing the full filename when you only wanted to change the name part. Keep Scope on Name for most workflows; switch to Ext or Full only when the guide or your own plan explicitly requires it.",
						],
						examples: [
							{
								before: "movie.name.s01e03.1080p.mkv",
								after: "006movie.name.s01e03.1080p.mkv",
								note: "Separate cautionary example: a blank Sequence template, Position Start, start 1 and padding 3 prefixes the sixth selected file with 006.",
							},
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
						title: "先用示例测试模式练习",
						body: [
							"示例测试模式是学习界面最安全的方式：它不需要文件权限，也不会修改磁盘上的真实文件。你只需要粘贴或生成一些文件名，就能测试和真实文件完全一样的规则链。",
							"先每行输入一个文件名：IMG_0421.jpg、IMG_0422.jpg，以复现截图和下一节规则链。之后可加入文档和视频文件名，检查规则对不同名称的影响。",
						],
						image: {
							src: "/guides/screenshots/samples-zh.png",
							alt: "导入两个相机文件名，尚未添加规则。",
							caption: "导入两个相机文件名，尚未添加规则。",
						},
						steps: [
							"打开应用，在文件面板点击“试用示例测试模式”。",
							"每行输入一个文件名，包含扩展名，例如 IMG_0421.jpg。",
							"点击示例面板中的“导入文件”。",
							"确认文件列表和预览面板都显示相同的未变化文件名。",
							"保持作用域为“名称”，避免第一轮规则意外修改扩展名。",
						],
					},
					{
						title: "一次只添加一条规则",
						body: [
							"输入下文模板时，点击“添加文本”，粘贴含花括号的完整模板，再按 Enter 或 Tab 确认。模板会拆成可拖动的文本与变量块；确认预览已更新后再继续。",
							"可靠的批量重命名应该由一组小而可检查的步骤组成。先添加清理规则，检查预览，再添加编号规则。如果预览出现异常，最近添加的规则通常就是排查入口。",
							"第一条规则用于演示移除前缀。随后序号模板将整个名称替换为固定日期与补零编号；使用这种整名模板时，前缀清理步骤实际上可以省略。",
						],
						image: {
							src: "/guides/screenshots/basics-zh.png",
							alt: "固定日期模板生成 2026-05-22_001.jpg 和 2026-05-22_002.jpg。滚动规则面板可查看每条规则。",
							caption:
								"固定日期模板生成 2026-05-22_001.jpg 和 2026-05-22_002.jpg。滚动规则面板可查看每条规则。",
						},
						steps: [
							"保持作用域为“名称”。添加查找替换：查找 IMG_，替换为空。第一步预览应为 0421.jpg。",
							"在查找替换后添加序号：数字，起始值 1，步长 1，补零 3 位，全局作用域。本例关闭“保留原始编号”和“编号前排序”。",
							"将序号模板设为 2026-05-22_{n}。非空模板会替换整个名称，因此移除原编号 0421；“名称”作用域会保留 .jpg。",
							"示例日期是固定文字，方便在任何日期复现。使用 {date}_{n} 可取当前 UTC 日期；加载照片元数据后，使用 {exif.date}_{n} 可取拍摄日期。",
							"依次导入 IMG_0421.jpg、IMG_0422.jpg，确认预览结果分别为 2026-05-22_001.jpg、2026-05-22_002.jpg。",
						],
						examples: [
							{
								before: "IMG_0421.jpg",
								after: "2026-05-22_001.jpg",
								note: "名称作用域；序号模板 2026-05-22_{n}，起始 1，步长 1，补零 3 位。",
							},
							{
								before: "IMG_0422.jpg",
								after: "2026-05-22_002.jpg",
							},
						],
					},
					{
						title: "像清单一样阅读预览",
						body: [
							"预览面板不只是展示效果，它就是执行前的审查步骤。先看原文件名，再看新文件名，重点找出和你预期不一致的变化。",
							"文件较多时使用“仅受影响”视图，只看真正会被改名的文件。如果冲突数量不为零，一定切到“仅冲突”视图，因为重复目标名必须先处理。",
						],
						steps: [
							"检查每个变化后的文件是否仍保留正确扩展名。",
							"检查是否出现空文件名或只有数字的文件名。",
							"检查编号顺序是否符合你想要的文件顺序。",
							"执行前切换到“仅冲突”视图，确认没有重复目标名。",
						],
						examples: [
							{
								before: "report (final).docx",
								after: "005report (final).docx",
								note: "独立的错误示例：序号模板留空、位置选开头、起始 1、补零 3 位时，第五个选中文件的旧名称会保留在 005 后面。",
							},
						],
					},
					{
						title: "直接执行还是导出脚本",
						body: [
							"在 Chromium 浏览器中，通过 File System Access API 选择的真实文件可以直接重命名。若使用 Firefox、Safari，或希望先走命令行审查流程，可以选择导出脚本。",
							"脚本导出也适合团队场景：一个人用浏览器构建并检查重命名方案，再在受控文件夹中运行生成的 Bash 或 PowerShell 脚本。",
						],
						steps: [
							"处理真实文件时，先从小文件夹或复制出来的测试文件夹开始。",
							"如果想保存旧名到新名的映射，点击“导出方案”。",
							"如果浏览器不能直接重命名，或你更偏好终端流程，点击“导出脚本”。",
							"只有当预览和冲突检查都干净时，才点击“执行重命名”。",
							"执行后如果立即发现错误，优先使用内置撤销。",
						],
					},
					{
						title: "首次使用常见错误",
						body: [
							"大多数错误来自规则影响了过多文件。如果只想处理照片，应先筛选文件列表，或让规则只匹配照片类文件名。",
							"另一个常见错误是选择了完整文件名作用域，而实际只想修改名称部分。多数工作流都应保持作用域为“名称”；只有明确要修改扩展名或完整文件名时再切换。",
						],
						examples: [
							{
								before: "movie.name.s01e03.1080p.mkv",
								after: "006movie.name.s01e03.1080p.mkv",
								note: "独立的错误示例：序号模板留空、位置选开头、起始 1、补零 3 位时，第六个选中文件会被加上 006 前缀。",
							},
						],
					},
				],
			},
		},
	},
	{
		slug: "organize-photos-by-date-sequence",
		category: "photos",
		publishedAt: "2026-05-22",
		updatedAt: "2026-09-21",
		readingTime: 10,
		relatedSlugs: ["batch-file-rename-basics", "sequence-file-numbering"],
		content: {
			en: {
				title: "Batch Rename Photos by Date & Sequence",
				description:
					"Rename camera photos with date prefixes and padded sequence numbers so albums stay sortable and easy to scan.",
				intro:
					"Camera filenames are rarely meaningful. Choose a fixed event date or read each photo’s EXIF capture date, then add sequence numbers. The runnable example below uses a fixed date, not EXIF.",
				categoryLabel: "Photos",
				sections: [
					{
						title: "Choose a stable photo naming pattern",
						body: [
							"A good photo filename should still make sense after it leaves Rename.Tools. Put the date first, then a padded sequence number, then an optional place, client, event, or camera label.",
							"Use four-digit years and two-digit months and days. That keeps alphabetical sorting aligned with time order in Finder, Explorer, cloud drives, NAS folders, and media backup tools.",
							"Decide whether the name should describe when the photo was taken, where it belongs, or both. For personal albums, date plus location is usually enough. For client work, add the project or shoot name so exported files remain recognizable.",
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
							"To enter a template below, click Add Text, paste the complete template including braces, then press Enter or Tab to apply it. It becomes draggable text and variable blocks; check the updated preview before continuing.",
							"Use Find & Replace or Remove to strip camera prefixes when they do not carry useful meaning. Then use Sequence with padding so every file receives a predictable number.",
							"For the fixed-date example, keep import order. The Sequence rule can also sort by filename or modified time before numbering. EXIF date is available in a naming template, but there is currently no EXIF-date sort option.",
						],
						image: {
							src: "/guides/screenshots/photos-en.png",
							alt: "The fixed-date Tokyo template replaces the name and preserves .JPG and .HEIC.",
							caption:
								"The fixed-date Tokyo template replaces the name and preserves .JPG and .HEIC.",
						},
						steps: [
							"Import DSC_0007.JPG and IMG_1842.HEIC in that order, and keep Scope on Name.",
							"Add Sequence: Numeric, start 1, step 1, padding 3, global scope; keep sorting and Preserve original numbers off.",
							"Set the template to 2026-05-22_{n}_tokyo. It replaces the whole name, so you do not need a separate camera-prefix removal rule.",
							"This produces 2026-05-22_001_tokyo.JPG and 2026-05-22_002_tokyo.HEIC. The date and tokyo are fixed example text.",
							"For real capture dates, load image metadata and change the template to {exif.date}_{n}_tokyo. {date} instead uses the current UTC date, not the capture date.",
							"Missing EXIF leaves the literal {exif.date} in the preview. Filter those files into a separate batch and use a known date; do not execute unresolved placeholders.",
						],
					},
					{
						title: "When EXIF metadata helps",
						body: [
							"Choose the date source deliberately: 2026-05-22 is text you enter; {exif.date} reads DateTimeOriginal, falling back to CreateDate; {date} is the current UTC date. File modified time is a separate property and may change when files are copied.",
							"If EXIF is missing, the preview keeps {exif.date} literally. Separate those files and enter a known date or keep their existing names. Never silently replace an unknown capture date with today’s date.",
							"Renaming a RAW filename does not imply RAW metadata support. GPS variables produce coordinates, not city names; tokyo in this guide is a label you enter yourself.",
							"If the photos include EXIF dates, load metadata and prefer EXIF date variables over today's date. This is useful when files were copied, downloaded, exported from a phone, or edited after they were taken.",
							"EXIF is not guaranteed. Screenshots, social media exports, edited images, and some HEIC conversions may have missing or changed metadata. A known event label is a useful alternative when the capture date cannot be verified.",
							"When EXIF dates differ from file modified times, trust the value that matches your organizing goal. For a vacation album, capture date is usually better. For a delivery folder, export date may be more useful.",
						],
					},
					{
						title: "Quality check before renaming photos",
						body: [
							"Before execution, scan the first few and last few preview rows. This catches sorting mistakes, especially when filenames include numbers with different lengths.",
							"If the preview includes non-photo files, stop and filter the list. Mixing photos, documents, and videos in one sequence can create technically valid names that are not useful later.",
						],
						steps: [
							"Confirm every target name begins with the intended date.",
							"Confirm sequence numbers are padded consistently, such as 001, 002, and 003.",
							"Confirm .jpg, .png, .heic, and .raw-style extensions were not rewritten.",
							"Switch to Affected Only and scan for files that should have stayed unchanged.",
						],
						examples: [
							{
								before: "Vacation/IMG_0421.jpg",
								after: "Vacation/2026-05-22_001_tokyo.jpg",
								note: "Use the same fixed-date template on a fresh one-file batch. The folder path is unchanged; only the filename is renamed.",
							},
						],
					},
					{
						title: "Separate photos by source when needed",
						body: [
							"Phone photos, DSLR files, screenshots, RAW exports, and edited copies often need different naming rules. If one rule chain starts getting complicated, split the files into smaller batches instead of forcing every case into one workflow.",
							"For example, camera photos may use EXIF date plus sequence, screenshots may use the modified date, and edited exports may use a project label plus version number. Smaller batches produce cleaner names and make preview review faster.",
						],
						steps: [
							"Use folders or filters to separate camera photos, screenshots, and edited exports.",
							"Create one preset for capture-based names and another for export-based names.",
							"Keep RAW and edited JPEG files in separate batches if they should not share the same sequence.",
							"Use a short event label only when the folder name alone is not enough context.",
						],
						examples: [
							{
								before: "Edits/final_export_3.jpg",
								after: "Edits/client-a_2026-05-22_v03.jpg",
								note: "A separate preset: Name scope; Sequence padding 2, Preserve original numbers on, extract pattern (\\d+), template client-a_2026-05-22_v{n}. The Edits folder is unchanged.",
							},
						],
					},
				],
			},
			zh: {
				title: "按日期和序号整理照片",
				description: "用日期前缀和补零序号重命名相机照片，让相册保持可排序、易浏览、易查找。",
				intro:
					"相机文件名往往不够直观。先选择固定活动日期或每张照片的 EXIF 拍摄日期，再添加序号。下方可运行示例使用固定日期，不读取 EXIF。",
				categoryLabel: "照片整理",
				sections: [
					{
						title: "选择稳定的照片命名格式",
						body: [
							"好的照片文件名应该离开 Rename.Tools 后依然清楚。建议把日期放在最前面，然后是补零序号，最后可选地点、客户、活动或相机标签。",
							"年份用四位，月份和日期用两位。这样在 Finder、Explorer、网盘、NAS 或备份工具中按字母排序时，也会自然符合时间顺序。",
							"先决定文件名要表达什么：拍摄时间、归属地点，还是两者都要。个人相册通常日期加地点就够了；客户项目则建议加入项目名或拍摄主题，方便交付后识别。",
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
							"输入下文模板时，点击“添加文本”，粘贴含花括号的完整模板，再按 Enter 或 Tab 确认。模板会拆成可拖动的文本与变量块；确认预览已更新后再继续。",
							"如果相机前缀没有实际意义，可以用查找替换或删除规则清理掉。然后用带补零的序号规则，让每张照片获得稳定编号。",
							"固定日期示例使用导入顺序。序号规则也可以先按文件名或修改时间排序再编号。EXIF 日期可用于命名模板，但目前没有按 EXIF 日期排序的选项。",
						],
						image: {
							src: "/guides/screenshots/photos-zh.png",
							alt: "固定日期与 tokyo 模板替换名称，并保留 .JPG、.HEIC 扩展名。",
							caption: "固定日期与 tokyo 模板替换名称，并保留 .JPG、.HEIC 扩展名。",
						},
						steps: [
							"按顺序导入 DSC_0007.JPG、IMG_1842.HEIC，保持作用域为“名称”。",
							"添加序号：数字，起始 1，步长 1，补零 3 位，全局作用域；关闭排序和“保留原始编号”。",
							"模板设为 2026-05-22_{n}_tokyo。模板会替换整个名称，不需要再单独删除相机前缀。",
							"预览应为 2026-05-22_001_tokyo.JPG、2026-05-22_002_tokyo.HEIC。日期和 tokyo 是固定的示例文字。",
							"实际按拍摄日期命名时，先加载图像元数据，再将模板改为 {exif.date}_{n}_tokyo。{date} 代表当前 UTC 日期，不是拍摄日期。",
							"缺少 EXIF 时，预览会保留字面量 {exif.date}。请将这些文件分批处理并填写已知日期，不要执行含未解析占位符的结果。",
						],
					},
					{
						title: "什么时候使用 EXIF 元数据",
						body: [
							"先选清楚日期来源：2026-05-22 是手动输入的文字；{exif.date} 优先读取 DateTimeOriginal，缺少时使用 CreateDate；{date} 是当前 UTC 日期。文件修改时间是另一项属性，复制文件后可能改变。",
							"缺少 EXIF 时，预览会保留字面量 {exif.date}。请把这些文件分开，填写已知日期或保留原名，不要把未知拍摄日期默认为今天。",
							"能修改 RAW 文件名不代表支持读取 RAW 元数据。GPS 变量输出坐标而非城市名；本文的 tokyo 是你手动填写的标签。",
							"如果照片带有 EXIF 拍摄时间，建议先加载元数据，再使用 EXIF 日期变量，而不是今天的日期。文件被复制、下载、从手机导出或后期编辑过时，这一点尤其有用。",
							"EXIF 并不总是存在。截图、社交平台导出的图片、后期处理后的图片，以及部分 HEIC 转换文件都可能缺少或改变元数据。无法确认拍摄日期时，可以改用已知的活动标签。",
							"当 EXIF 日期和文件修改时间不一致时，选择更符合整理目标的那个。旅行相册通常更适合拍摄日期；交付目录则可能更适合导出日期。",
						],
					},
					{
						title: "执行前的照片检查清单",
						body: [
							"执行前先检查预览的前几行和最后几行。这样最容易发现排序错误，尤其是原文件名里包含不同长度数字时。",
							"如果预览里混入了非照片文件，先停下来筛选。把照片、文档和视频放进同一个序号规则里，虽然能生成合法文件名，但后续并不好管理。",
						],
						steps: [
							"确认每个目标名都以预期日期开头。",
							"确认序号补零一致，例如 001、002、003。",
							"确认 .jpg、.png、.heic、raw 类扩展名没有被改写。",
							"切到“仅受影响”视图，检查是否有本应保持不变的文件也被改名。",
						],
						examples: [
							{
								before: "Vacation/IMG_0421.jpg",
								after: "Vacation/2026-05-22_001_tokyo.jpg",
								note: "在新的单文件批次中使用同一固定日期模板。文件夹路径不变，只修改文件名。",
							},
						],
					},
					{
						title: "必要时按来源拆分照片",
						body: [
							"手机照片、相机照片、截图、RAW 导出和修图成片往往需要不同命名规则。如果一条规则链开始变得很复杂，通常应该拆成更小批次，而不是强行覆盖所有情况。",
							"例如相机照片可以使用 EXIF 日期加序号，截图可以使用修改日期，修图导出则更适合项目标签加版本号。小批次更容易得到干净名称，也更容易检查预览。",
						],
						steps: [
							"用文件夹或筛选器分开相机照片、截图和修图导出。",
							"为拍摄日期命名和导出日期命名分别保存预设。",
							"如果 RAW 和成片不应共享同一序号，就分批处理。",
							"只有当文件夹名信息不够时，才在文件名里添加简短活动标签。",
						],
						examples: [
							{
								before: "Edits/final_export_3.jpg",
								after: "Edits/client-a_2026-05-22_v03.jpg",
								note: "使用独立预设：名称作用域；序号补零 2 位，开启保留原始编号，提取模式 (\\d+)，模板 client-a_2026-05-22_v{n}。Edits 文件夹不变。",
							},
						],
					},
				],
			},
		},
	},
	{
		slug: "regex-batch-rename",
		category: "patterns",
		publishedAt: "2026-05-22",
		updatedAt: "2026-09-21",
		readingTime: 11,
		relatedSlugs: ["batch-file-rename-basics", "sequence-file-numbering"],
		content: {
			en: {
				title: "Bulk Rename Files with Regex: Examples & Patterns",
				description:
					"Learn practical regex bulk rename patterns for removing clutter, rearranging dates, and extracting useful filename parts.",
				intro:
					"Regex is the most powerful rename rule when filenames share a pattern. Use it when simple find and replace cannot describe the change precisely.",
				categoryLabel: "Patterns",
				sections: [
					{
						title: "Start with one clear pattern",
						body: [
							"Regex works best when filenames are consistent. Match only the part you intend to change, and keep the replacement readable. A narrow pattern is easier to review than a clever pattern that tries to solve every filename at once.",
							"Use capture groups when you need to keep useful parts and rearrange them in a new order. In Rename.Tools, the replacement can use $1, $2, and later groups to put captured pieces back into the new name.",
							"Before writing the regex, describe the filename in plain language: where is the date, where is the title, where is the episode code, and which parts should be deleted. That description often becomes the pattern.",
						],
						examples: [
							{
								before: "2026-05-22 invoice client-a.pdf",
								after: "invoice_client-a_2026-05-22.pdf",
								note: "Name scope. Regex ^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$, replacement $2_$1, no flags; then Find & Replace every space with _.",
							},
							{
								before: "movie.name.s01e03.1080p.mkv",
								after: "movie name S01E03.mkv",
								note: "Name scope. Regex ^(.+)\\.s(\\d+)e(\\d+).*$, replacement $1 S$2E$3, flag i; then Find & Replace every dot with a space.",
							},
						],
					},
					{
						title: "Useful regex rename patterns",
						body: [
							"These patterns are good starting points. Preview them on a small file set before applying them to a folder with thousands of files. If one pattern feels fragile, split the workflow into a regex rule plus a simple Find & Replace cleanup rule.",
							"Keep the Flags field intentional. Use i for case-insensitive matching, g when you want every occurrence replaced, and avoid m unless you are working with multi-line text pasted into filenames.",
						],
						image: {
							src: "/guides/screenshots/regex-en.png",
							alt: "Date capture groups and space cleanup produce invoice_client-a_2026-05-22.pdf.",
							caption:
								"Date capture groups and space cleanup produce invoice_client-a_2026-05-22.pdf.",
						},
						steps: [
							"Keep Scope on Name. Add Regex Replace; enter a pattern without surrounding / delimiters. Each recipe below is independent.",
							"Remove bracketed notes: pattern \\s*\\[[^\\]]+\\], replacement empty, flags g.",
							"Move a leading date to the end: pattern ^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$, replacement $2_$1, flags empty. Add Find & Replace for spaces if you want underscores throughout.",
							"Normalize episode casing: pattern s(\\d+)e(\\d+), replacement S$1E$2, flags gi.",
							"Collapse repeated whitespace: pattern \\s+, replacement one literal space, flags g.",
							"Preview matching and nonmatching filenames before applying a pattern to a real folder.",
						],
					},
					{
						title: "Keep regex safe",
						body: [
							"Avoid overly broad patterns like .* unless you really mean to replace everything. If a replacement produces empty names, duplicate names, or removes more text than expected, stop and narrow the match.",
							"When the regex rule is hard to reason about, split the workflow into two or three simpler rules. The preview will be easier to audit, and future you will understand the preset more quickly.",
							"Regex does not need to be the first rule. Often the clearest workflow is to clean obvious text with Find & Replace, use regex for the structural transformation, then apply Case/Style or Sequence as the final polish.",
						],
					},
					{
						title: "Debug a pattern with the preview",
						body: [
							"When a regex does not work, do not immediately make it more complex. First check whether the pattern is matching the right text at all. A good debugging trick is to replace with a visible marker such as MATCH_$1 so you can see what was captured.",
							"Then restore the real replacement once the captured groups are correct. This workflow is slower for one filename, but much faster for a folder with hundreds of files.",
						],
						steps: [
							"Test the regex on three to five representative filenames first.",
							"Temporarily replace with a marker such as match_$1_$2.",
							"Confirm the preview shows the captured parts you expected.",
							"Restore the final replacement after the groups are correct.",
							"Switch to Affected Only to ensure unrelated filenames were not matched.",
						],
						examples: [
							{
								before: "client-a_invoice_2026-05-22_final.pdf",
								after: "invoice_client-a_2026-05-22.pdf",
								note: "Name scope. Pattern ^([^_]+)_([^_]+)_(\\d{4}-\\d{2}-\\d{2})_final$, replacement $2_$1_$3, flags empty.",
							},
						],
					},
					{
						title: "Know when not to use regex",
						body: [
							"Regex is powerful, but it is not always the clearest tool. If you only need to replace one literal word, use Find & Replace. If you only need numbering, use Sequence. If you need case conversion, use Case/Style.",
							"The best rule chain is often a combination: simple rules for simple edits, regex only for the structural part, and a final preview pass to verify the result. This keeps presets easier to maintain and safer for future batches.",
						],
						steps: [
							"Use Find & Replace for fixed words or separators.",
							"Use Remove/Cleanup for repeated clutter such as brackets or symbols.",
							"Use Regex Replace when the useful parts must be captured and rearranged.",
							"Save regex presets only after testing them on several filename variants.",
						],
						examples: [
							{
								before: "My Vacation Photos.jpg",
								after: "my-vacation-photos.jpg",
								note: "This is a Case/Style job, not a regex job.",
							},
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
							"正则最适合处理格式一致的文件名。只匹配你真正想改变的部分，并让替换结果保持可读。窄一点的模式通常比试图一次解决所有文件名的复杂模式更安全。",
							"如果需要保留并重排有用片段，就使用捕获组。在 Rename.Tools 里，替换文本可以用 $1、$2 等引用捕获到的内容。",
							"写正则前，先用自然语言描述文件名结构：日期在哪里，标题在哪里，剧集编号在哪里，哪些部分要删除。这个描述往往就是正则模式的雏形。",
						],
						examples: [
							{
								before: "2026-05-22 invoice client-a.pdf",
								after: "invoice_client-a_2026-05-22.pdf",
								note: "名称作用域。正则 ^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$，替换为 $2_$1，标志留空；再用查找替换将所有空格替换为 _。",
							},
							{
								before: "movie.name.s01e03.1080p.mkv",
								after: "movie name S01E03.mkv",
								note: "名称作用域。正则 ^(.+)\\.s(\\d+)e(\\d+).*$，替换为 $1 S$2E$3，标志 i；再用查找替换将所有点号替换为空格。",
							},
						],
					},
					{
						title: "常用正则重命名模式",
						body: [
							"下面这些模式适合作为起点。先用少量文件预览确认，再应用到包含大量文件的文件夹。如果一个正则看起来很脆弱，可以拆成一条正则规则加一条简单查找替换规则。",
							"Flags 字段也要有意识地设置。大小写不统一时用 i，需要替换所有出现位置时用 g；除非处理多行文本，否则通常不需要 m。",
						],
						image: {
							src: "/guides/screenshots/regex-zh.png",
							alt: "日期捕获组加空格清理，生成 invoice_client-a_2026-05-22.pdf。",
							caption: "日期捕获组加空格清理，生成 invoice_client-a_2026-05-22.pdf。",
						},
						steps: [
							"保持作用域为“名称”。添加正则替换，模式两侧不加 /。以下配方分别使用，不是依次叠加的规则链。",
							"移除方括号备注：模式 \\s*\\[[^\\]]+\\]，替换为空，标志 g。",
							"把开头日期移到末尾：模式 ^(\\d{4}-\\d{2}-\\d{2})\\s+(.+)$，替换为 $2_$1，标志留空。如需全部使用下划线，再用查找替换处理空格。",
							"统一剧集大小写：模式 s(\\d+)e(\\d+)，替换为 S$1E$2，标志 gi。",
							"压缩重复空白：模式 \\s+，替换为一个真实空格，标志 g。",
							"预览匹配及不匹配的文件名，再将规则用于真实文件夹。",
						],
					},
					{
						title: "让正则保持安全",
						body: [
							"除非确实要替换全部内容，否则避免使用过宽的 .*。如果替换后出现空名称、重复名称，或删除了比预期更多的文本，先停下来缩小匹配范围。",
							"当一条正则难以判断时，把工作流拆成两三条更简单的规则。这样预览更容易检查，之后保存为预设也更容易理解。",
							"正则不一定要放在第一条规则。很多时候，最清晰的流程是先用查找替换清理明显文本，再用正则完成结构转换，最后用大小写或序号规则收尾。",
						],
					},
					{
						title: "用预览调试正则",
						body: [
							"正则不生效时，不要马上把它写得更复杂。先确认它到底有没有匹配到正确内容。一个实用技巧是暂时把替换文本设为 MATCH_$1，这样可以直接在预览里看到捕获到了什么。",
							"当捕获组正确后，再恢复真正的替换格式。这个方法处理单个文件时看似慢，但面对几百个文件时反而更快、更稳。",
						],
						steps: [
							"先用 3 到 5 个代表性文件名测试正则。",
							"临时把替换结果设为 match_$1_$2 之类的可见标记。",
							"确认预览中显示的捕获内容符合预期。",
							"捕获组正确后，再恢复最终替换格式。",
							"切到“仅受影响”视图，确认无关文件没有被匹配。",
						],
						examples: [
							{
								before: "client-a_invoice_2026-05-22_final.pdf",
								after: "invoice_client-a_2026-05-22.pdf",
								note: "名称作用域。模式 ^([^_]+)_([^_]+)_(\\d{4}-\\d{2}-\\d{2})_final$，替换为 $2_$1_$3，标志留空。",
							},
						],
					},
					{
						title: "知道什么时候不该用正则",
						body: [
							"正则很强，但不一定总是最清晰的工具。如果只是替换一个固定词，用查找替换即可；如果只是编号，用序号规则；如果只是大小写转换，用大小写规则更合适。",
							"最好的规则链往往是组合式的：简单规则处理简单修改，正则只负责结构转换，最后再通过预览确认结果。这样保存下来的预设也更容易维护、更安全。",
						],
						steps: [
							"固定词或分隔符替换优先使用查找替换。",
							"括号、符号等重复杂乱内容可先用删除/清理规则。",
							"需要捕获并重排有用片段时，再使用正则替换。",
							"正则预设一定要在多个文件名变体上测试后再保存。",
						],
						examples: [
							{
								before: "My Vacation Photos.jpg",
								after: "my-vacation-photos.jpg",
								note: "这是大小写/风格转换任务，不需要正则。",
							},
						],
					},
				],
			},
		},
	},
	{
		slug: "sequence-file-numbering",
		category: "numbering",
		publishedAt: "2026-05-22",
		updatedAt: "2026-09-21",
		readingTime: 9,
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
							"To enter a template below, click Add Text, paste the complete template including braces, then press Enter or Tab to apply it. It becomes draggable text and variable blocks; check the updated preview before continuing.",
							"Without padding, file managers may sort 10 before 2. Padding fixes that by making every number the same width, so alphabetical sorting matches numeric order.",
							"Use 2 digits for small albums, 3 digits for hundreds of files, and 4 digits when the folder may grow over time. Choosing one extra digit is usually harmless; choosing too few can create a messy rename later.",
							"Padding is especially important when files will be uploaded to cloud drives, shared with clients, imported into editing software, or archived in systems that use simple alphabetical ordering.",
						],
						image: {
							src: "/guides/screenshots/sequence-en.png",
							alt: "Preserve original numbers keeps 1, 2 and 10 as 001, 002 and 010.",
							caption: "Preserve original numbers keeps 1, 2 and 10 as 001, 002 and 010.",
						},
						examples: [
							{
								before: "photo 1.jpg, photo 2.jpg, photo 10.jpg",
								after: "001_photo.jpg, 002_photo.jpg, 010_photo.jpg",
								note: "Name scope; Sequence padding 3, Preserve original numbers on, pattern (\\d+), template {n}_photo. This preserves 10 rather than assigning a new third number.",
							},
						],
					},
					{
						title: "Choose the right sequence scope",
						body: [
							"Global numbering is best when the full batch should be one ordered set. Per-folder numbering is better for albums, chapters, exports, or client folders that should each start at 001.",
							"Per-extension and per-category scopes are useful when one folder contains different file types. For example, screenshots and videos can each get their own numbering without being mixed into the same sequence.",
						],
						steps: [
							"Use global scope for one album or one export batch.",
							"Use per-folder scope when each folder should keep its own sequence.",
							"Use per-extension scope when images, videos, and documents should be numbered separately.",
							"Sort before numbering when imported order is not reliable.",
							"Use natural sort for names such as file1, file2, and file10.",
						],
					},
					{
						title: "Combine sequences with templates",
						body: [
							"A sequence rule can do more than add a number. Combine {n}, {name}, dates, folder names, or metadata variables to create names that are structured but still readable.",
							"Templates are strongest when the stable sorting part comes first. A pattern like {date}_{n}_{name} sorts by date first, then by sequence. A pattern like {name}_{n}_{date} may be more readable, but it will group by original name instead.",
						],
						examples: [
							{
								before: "scan.jpg",
								after: "archive_2026_001_scan.jpg",
								note: "Name scope; Numeric Sequence, start 1, step 1, padding 3, template archive_2026_{n}_{name}, Preserve original numbers off.",
							},
						],
					},
					{
						title: "Preserve numbers when the original order matters",
						body: [
							"Some files already contain useful numbers: scanned pages, exported frames, chapter files, or camera burst shots. In those cases, you may not want to generate a new sequence from import order.",
							"Use Preserve original numbers when the number inside the filename is already the source of truth. Rename.Tools can extract that number, pad it consistently, and keep the relationship between old and new names clear.",
						],
						steps: [
							"Enable Preserve original numbers in the Sequence rule.",
							"Keep the extract pattern as (\\d+) for simple filenames with one number.",
							"Use a more specific pattern when filenames contain several numbers, such as page-(\\d+).",
							"Set padding to 3 and template to page_{n}_scan for the example below. Keep Scope on Name.",
							"Preview files where extraction fails; they will fall back to normal sequencing.",
						],
						examples: [
							{
								before: "page-7-scan.jpg",
								after: "page_007_scan.jpg",
								note: "Preserving the original page number avoids changing document order.",
							},
						],
					},
					{
						title: "Decide the order before you number",
						body: [
							"Sequence numbering is only as good as the order behind it. Import order can be convenient, but it is not always stable across browsers, folders, or operating systems.",
							"For predictable results, choose the sort order intentionally before numbering. Name sorting works well for camera files, modified time can work for documents, and extension sorting is useful when you are numbering each file type separately.",
						],
						steps: [
							"Use Sort before numbering when imported order is not meaningful.",
							"Choose File name for camera-style filenames that already sort correctly.",
							"Choose Modified time for document batches that were created or exported in order.",
							"Preview the first and last numbers to confirm the ordering is right.",
						],
						examples: [
							{
								before: "scan10.jpg, scan2.jpg, scan1.jpg",
								after: "003_scan10.jpg, 002_scan2.jpg, 001_scan1.jpg",
								note: "Name scope; start 1, step 1, padding 3, template {n}_{name}, Preserve original numbers off; enable Sort before numbering, File name, Ascending, Natural sort. Results are shown in original input order; scan10 receives 003, not 010.",
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
							"输入下文模板时，点击“添加文本”，粘贴含花括号的完整模板，再按 Enter 或 Tab 确认。模板会拆成可拖动的文本与变量块；确认预览已更新后再继续。",
							"如果不补零，某些文件管理器可能把 10 排在 2 前面。补零能让所有数字长度一致，让字母排序和数字顺序保持一致。",
							"小相册可用 2 位，数百个文件建议 3 位，如果文件夹未来还会增长，可以用 4 位。多留一位通常没什么坏处；位数太少，后续反而可能需要再次整理。",
							"当文件要上传网盘、交付客户、导入剪辑软件或放入只按字母排序的归档系统时，补零尤其重要。",
						],
						image: {
							src: "/guides/screenshots/sequence-zh.png",
							alt: "保留原有序号将 1、2、10 补零为 001、002、010。",
							caption: "保留原有序号将 1、2、10 补零为 001、002、010。",
						},
						examples: [
							{
								before: "photo 1.jpg, photo 2.jpg, photo 10.jpg",
								after: "001_photo.jpg, 002_photo.jpg, 010_photo.jpg",
								note: "名称作用域；序号补零 3 位，开启保留原始编号，模式 (\\d+)，模板 {n}_photo。这里保留原编号 10，而不是给第三个文件重新编号。",
							},
						],
					},
					{
						title: "选择合适的序号作用域",
						body: [
							"全局编号适合把整个批次当成一个有序集合。按文件夹编号更适合相册、章节、导出目录或客户文件夹，让每个文件夹都从 001 开始。",
							"按扩展名或按文件类型编号适合混合文件夹。比如截图和视频可以分别编号，而不是混在同一个序列里。",
						],
						steps: [
							"单个相册或单次导出批次使用全局作用域。",
							"每个文件夹都要单独编号时使用按文件夹作用域。",
							"图片、视频、文档需要分别编号时使用按扩展名作用域。",
							"导入顺序不可靠时，先排序再编号。",
							"处理 file1、file2、file10 这类名称时，开启自然排序。",
						],
					},
					{
						title: "把序号和模板组合",
						body: [
							"序号规则不只是添加数字。可以组合 {n}、{name}、日期、文件夹名或元数据变量，生成结构清晰且可读的新名称。",
							"模板最重要的是把稳定排序字段放在前面。比如 {date}_{n}_{name} 会先按日期排序，再按序号排序；而 {name}_{n}_{date} 更像自然语言，但排序时会先按原名称分组。",
						],
						examples: [
							{
								before: "scan.jpg",
								after: "archive_2026_001_scan.jpg",
								note: "名称作用域；数字序号，起始 1，步长 1，补零 3 位，模板 archive_2026_{n}_{name}，关闭保留原始编号。",
							},
						],
					},
					{
						title: "原始编号有意义时不要重排",
						body: [
							"有些文件本来就带有重要编号：扫描页、导出帧、章节文件或连拍照片。这种情况下，不一定要按导入顺序重新生成序号。",
							"当文件名里的数字就是顺序来源时，可以使用“保留原始编号”。Rename.Tools 会提取原编号，统一补零，并保持新旧文件名之间的关系清晰。",
						],
						steps: [
							"在序号规则中开启“保留原始编号”。",
							"简单文件名可以保留提取模式 (\\d+)。",
							"如果文件名里有多个数字，使用更具体的模式，例如 page-(\\d+)。",
							"下例补零设为 3 位，模板设为 page_{n}_scan，作用域保持为“名称”。",
							"预览提取失败的文件；它们会回退到普通序号逻辑。",
						],
						examples: [
							{
								before: "page-7-scan.jpg",
								after: "page_007_scan.jpg",
								note: "保留原始页码可以避免打乱文档顺序。",
							},
						],
					},
					{
						title: "先决定顺序，再添加编号",
						body: [
							"序号是否有用，取决于背后的排序是否正确。导入顺序很方便，但在不同浏览器、文件夹或操作系统中不一定稳定。",
							"为了结果可预测，编号前应明确选择排序方式。相机文件通常适合按名称排序，文档批次可以按修改时间排序，按扩展名排序则适合不同文件类型分别编号。",
						],
						steps: [
							"当导入顺序没有意义时，开启“编号前排序”。",
							"相机类文件名通常选择按文件名排序。",
							"按创建或导出顺序整理文档时，可选择修改时间。",
							"检查预览中的第一个和最后一个编号，确认顺序正确。",
						],
						examples: [
							{
								before: "scan10.jpg, scan2.jpg, scan1.jpg",
								after: "003_scan10.jpg, 002_scan2.jpg, 001_scan1.jpg",
								note: "名称作用域；起始 1，步长 1，补零 3 位，模板 {n}_{name}，关闭保留原始编号；开启编号前排序，选择文件名、升序、自然排序。结果按原输入顺序列出，scan10 得到 003，而不是 010。",
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
		publishedAt: "2026-05-22",
		updatedAt: "2026-09-21",
		readingTime: 10,
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
							"A practical music pattern is track number first, then artist, then title. It sorts correctly in folders and still makes sense when files are copied to a USB drive, phone, DJ library, or media server.",
							"If your files do not have reliable tags, start with the existing filename and use Sequence for track order. You can still clean separators and casing without depending on metadata.",
						],
						steps: [
							"Import one album at a time when track order matters.",
							"To enter a template below, click Add Text, paste the complete template including braces, then press Enter or Tab to apply it. It becomes draggable text and variable blocks; check the updated preview before continuing.",
							"Load metadata if the files have reliable audio tags.",
							"Add a Sequence rule and set its template to {media.track}. {media.artist} - {media.title}. A non-empty template replaces the whole name; this template uses tag track numbers, not generated {n} numbers.",
							"Keep Scope set to Name so audio extensions remain unchanged.",
							"Metadata cannot be loaded from pasted sample names. For real files, load audio tags first. Missing tags leave literal placeholders; fix the tags or use a separate {n}. {name} template before executing.",
						],
						examples: [
							{
								before: "love story.mp3",
								after: "01. Taylor Swift - Love Story.mp3",
								note: "Requires tags: track 1, artist Taylor Swift, title Love Story.",
							},
							{
								before: "track_07.flac",
								after: "07. Artist - Song Title.flac",
								note: "Requires tags: track 7, artist Artist, title Song Title.",
							},
						],
					},
					{
						title: "Video and episode cleanup",
						body: [
							"Video files often include dots, quality tags, release group names, and inconsistent episode casing. Use regex to extract the show and episode code, then clean separators with find and replace.",
							"When you have a TMDb API key, use the media scraper to match episodes and bring in better titles before generating final names. If you do not want to use TMDb, you can still standardize S01E03-style filenames with regex alone.",
							"For media servers, consistency matters more than clever wording. Choose one pattern for a library and reuse it across seasons.",
						],
						image: {
							src: "/guides/screenshots/media-en.png",
							alt: "Regex, separator cleanup and Title Case produce Show Name S01E03.mkv. Scroll the rule panel to see all three rules.",
							caption:
								"Regex, separator cleanup and Title Case produce Show Name S01E03.mkv. Scroll the rule panel to see all three rules.",
						},
						steps: [
							"Keep Scope on Name. Add Regex Replace: ^(.+)\\.s(\\d+)e(\\d+).*$, replacement $1 S$2E$3, flags i.",
							"Add Find & Replace: find a literal dot, replace with a space, Match all on. The .mkv extension is unchanged because Scope is Name.",
							"Add Case/Style: Title Case, style None. This makes the show name readable while preserving S01E03.",
							"This recipe expects a dot before the episode code. Files with different separators need their own pattern; preview unmatched files.",
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
							"For shared libraries, prefer predictable patterns over clever names. A boring format that sorts correctly is easier to maintain and easier for other tools to parse.",
							"Before renaming a large library, test one album or one season. Media libraries often contain edge cases: bonus tracks, specials, trailers, commentary files, subtitles, and multi-part episodes.",
						],
					},
					{
						title: "Handle subtitles and extras separately",
						body: [
							"Subtitle files need to keep the same base name as the video file so players can auto-detect them. Do not run a video-only cleanup on .srt or .ass files unless the resulting base names still match.",
							"Extras such as trailers, interviews, samples, and behind-the-scenes clips should usually be filtered into a separate batch. They often do not follow the same S01E03 pattern as episodes.",
						],
						steps: [
							"Filter video files and subtitle files separately when their naming rules differ.",
							"After renaming episodes, compare subtitle base names with matching video names.",
							"Keep extras in a separate folder or add a clear suffix such as extras or trailer.",
							"Export a plan before renaming a mixed media folder.",
						],
						examples: [
							{
								before: "show.name.s01e03.1080p.en.srt",
								after: "Show Name S01E03.en.srt",
								note: "Use a separate subtitle chain: Name scope; regex ^(.+)\\.s(\\d+)e(\\d+).*\\.([a-z]{2})$, replacement $1 S$2E$3, flags i; replace dots with spaces; Title Case; finally Insert .en at End for this English subtitle batch.",
							},
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
							"一个实用格式是曲目号在前，随后是艺术家和标题。这样在文件夹里能正确排序，复制到 U 盘、手机、DJ 曲库或媒体服务器后也能看懂。",
							"如果文件标签并不可靠，可以先基于现有文件名和序号整理。即使不依赖元数据，也可以清理分隔符、统一大小写，并保留曲目顺序。",
						],
						steps: [
							"曲目顺序重要时，一次只导入一个专辑。",
							"输入下文模板时，点击“添加文本”，粘贴含花括号的完整模板，再按 Enter 或 Tab 确认。模板会拆成可拖动的文本与变量块；确认预览已更新后再继续。",
							"如果音频标签可靠，先加载元数据。",
							"添加序号规则，将模板设为 {media.track}. {media.artist} - {media.title}。非空模板替换整个名称；这里使用标签中的曲目编号，不是新生成的 {n}。",
							"保持作用域为“名称”，避免音频扩展名被修改。",
							"粘贴的示例文件名没有可读取的元数据。真实文件需先加载音频标签。缺失标签会保留占位符，请修复标签或另用 {n}. {name} 模板，再执行。",
						],
						examples: [
							{
								before: "love story.mp3",
								after: "01. Taylor Swift - Love Story.mp3",
								note: "需要标签：曲目 1、艺术家 Taylor Swift、标题 Love Story。",
							},
							{
								before: "track_07.flac",
								after: "07. Artist - Song Title.flac",
								note: "需要标签：曲目 7、艺术家 Artist、标题 Song Title。",
							},
						],
					},
					{
						title: "视频与剧集清理",
						body: [
							"视频文件常包含点号、清晰度标签、发布组名称和不统一的集数大小写。可以用正则提取剧名和集数代码，再用查找替换清理分隔符。",
							"如果你有 TMDb API Key，可以使用媒体刮削功能匹配剧集，并在生成最终名称前引入更准确的标题。如果不想使用 TMDb，也可以只用正则统一 S01E03 这类剧集格式。",
							"对媒体服务器来说，一致性比聪明的命名更重要。给一个媒体库选择一种格式，并跨季复用。",
						],
						image: {
							src: "/guides/screenshots/media-zh.png",
							alt: "正则、分隔符清理和标题式大小写生成 Show Name S01E03.mkv。滚动规则面板可查看全部三条规则。",
							caption:
								"正则、分隔符清理和标题式大小写生成 Show Name S01E03.mkv。滚动规则面板可查看全部三条规则。",
						},
						steps: [
							"保持作用域为“名称”。添加正则替换：模式 ^(.+)\\.s(\\d+)e(\\d+).*$，替换为 $1 S$2E$3，标志 i。",
							"添加查找替换：查找一个点号，替换为一个空格，开启全部匹配。“名称”作用域会保留 .mkv 扩展名。",
							"添加大小写/风格：标题式，风格选无。这样规范剧名并保留 S01E03。",
							"该配方要求剧集编号前是点号；其他分隔符需要调整模式，请检查未匹配的文件。",
							"执行前预览整季文件。",
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
							"共享媒体库更适合可预测的格式，而不是过于聪明的命名。能正确排序、容易被其他工具解析的普通格式，更适合长期维护。",
							"大规模重命名前，先测试一个专辑或一季。媒体库经常有特殊情况：bonus track、特别篇、预告片、花絮、字幕、多段剧集等。",
						],
					},
					{
						title: "字幕和花絮要分开处理",
						body: [
							"字幕文件需要和视频文件保持相同基础名称，播放器才能自动识别。不要把只适合视频的清理规则直接套到 .srt 或 .ass 文件上，除非结果仍然和视频名称匹配。",
							"预告片、访谈、sample、幕后花絮等 extras 通常不符合 S01E03 规则，建议筛选成单独批次处理。",
						],
						steps: [
							"视频和字幕规则不同时，分别筛选处理。",
							"重命名剧集后，检查字幕基础名称是否仍和视频一致。",
							"花絮文件可以放入单独文件夹，或添加 extras、trailer 等清晰后缀。",
							"处理混合媒体文件夹前，先导出方案审查。",
						],
						examples: [
							{
								before: "show.name.s01e03.1080p.en.srt",
								after: "Show Name S01E03.en.srt",
								note: "字幕使用独立规则链：名称作用域；正则 ^(.+)\\.s(\\d+)e(\\d+).*\\.([a-z]{2})$，替换为 $1 S$2E$3，标志 i；点号替换为空格；标题式；最后为这批英文字幕在末尾插入 .en。",
							},
						],
					},
				],
			},
		},
	},
	...taskGuides,
];

const translations: Record<
	Exclude<GuideLocale, "en" | "zh">,
	Record<string, LocalizedGuideContent>
> = { de, es, fr, ja, ko };

export const guides: Guide[] = baseGuides.map((guide) => ({
	...guide,
	content: {
		...guide.content,
		de: translations.de[guide.slug],
		es: translations.es[guide.slug],
		fr: translations.fr[guide.slug],
		ja: translations.ja[guide.slug],
		ko: translations.ko[guide.slug],
	},
}));

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
		publishedAt: content.publishedAt ?? guide.publishedAt,
		updatedAt: content.updatedAt ?? guide.updatedAt,
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
