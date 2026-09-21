import type { Guide } from "./content";

export const taskGuides: Guide[] = [
	{
		slug: "add-prefix-suffix-to-filenames",
		category: "getting-started",
		publishedAt: "2026-09-21",
		updatedAt: "2026-09-21",
		readingTime: 5,
		relatedSlugs: [
			"replace-spaces-in-filenames",
			"sequence-file-numbering",
			"batch-file-rename-basics",
		],
		content: {
			en: {
				title: "Add a Prefix or Suffix to Multiple Filenames",
				description:
					"Batch add project names, client prefixes or version suffixes while keeping original filenames and extensions. Try the rules with sample names before applying them locally.",
				intro:
					"Keep the useful part of each filename and add a shared label around it. A project prefix groups related documents; a version suffix marks a review batch without replacing the original name.",
				categoryLabel: "Everyday tasks",
				sections: [
					{
						title: "Add a project prefix and a review suffix",
						body: [
							"This recipe adds client-a_ at the beginning and _review at the end of the name, before the extension. Both are literal text: change them to the client and version you actually need. You can use either rule on its own.",
							"Keep Scope set to Name. End means the end of the name being edited; with Full scope, a suffix would go after .pdf instead. Name scope preserves the extension and avoids that mistake.",
						],
						steps: [
							"Choose Try this example above, review the two Add/Insert rules, then choose Try with sample filenames.",
							"For your own rule chain, set Scope to Name. Add Add/Insert, enter client-a_ as the text and choose Start.",
							"Add a second Add/Insert rule, enter _review and choose End. Keep it after the prefix rule.",
							"Check proposal.pdf → client-a_proposal_review.pdf. Edit either text field to customize the shared labels.",
						],
						examples: [
							{ before: "proposal.pdf", after: "client-a_proposal_review.pdf" },
							{ before: "budget.xlsx", after: "client-a_budget_review.xlsx" },
						],
					},
					{
						title: "Choose separators and preserve meaningful names",
						body: [
							"The separator is part of the text you insert. Enter client-a_ rather than client-a if you want an underscore between the prefix and the existing name. A suffix such as _review follows the same rule.",
							"Insert does not renumber or replace the original filename. For a prefix alone, use only the Start rule; for a suffix alone, use only the End rule. If every file needs a new numbered name, use the sequence guide instead.",
						],
						examples: [
							{
								before: "proposal.pdf",
								after: "client-a_proposal.pdf",
								note: "Only the Start rule: client-a_.",
							},
							{
								before: "proposal.pdf",
								after: "proposal_review.pdf",
								note: "Only the End rule: _review.",
							},
						],
					},
					{
						title: "Do not add the same label twice",
						body: [
							"Insert adds text even if it is already present. Applying the prefix again to client-a_proposal.pdf produces client-a_client-a_proposal.pdf. Keep already-labelled files out of the selected batch, or review them separately.",
							"For mixed batches, a conditional regex can avoid repeating this specific prefix: pattern ^(?!client-a_), replacement client-a_, no flags, Name scope. This is case-sensitive, so Client-A_ is a different prefix. Try both matching and already-labelled names before choosing this alternative.",
						],
						examples: [
							{
								before: "proposal.pdf",
								after: "client-a_proposal.pdf",
								note: "Conditional regex ^(?!client-a_) → client-a_, no flags.",
							},
							{
								before: "client-a_proposal.pdf",
								after: "client-a_proposal.pdf",
								note: "The same conditional regex leaves this prefix intact.",
							},
						],
					},
					{
						title: "Move from sample names to real files",
						body: [
							"Sample names are only a preview and do not grant access to files. Clear the sample list, keep the rules, and select the real files you want to change. Inspect the whole preview again; check long filenames, existing labels and any reported conflicts.",
							"Supported desktop Chrome and Edge browsers can rename local files after you grant access. On browsers without direct file access, preview names in sample mode and export a rename script. Review the script and run it in the folder containing the corresponding files.",
							"Renaming changes names, not document contents or formats. It may affect links from other applications that expect the old names. Keep important originals backed up and execute only after the preview matches your intended result.",
						],
					},
				],
			},
			zh: {
				title: "批量给文件名添加前缀或后缀",
				description:
					"保留原文件名和扩展名，批量添加项目名、客户前缀或版本后缀。先用示例验证规则，再在本地应用。",
				intro:
					"保留每个文件名中有用的部分，再加上统一标记。项目前缀方便归类，版本后缀可以标记待审阅文件，而不必重写整个名称。",
				categoryLabel: "日常任务",
				sections: [
					{
						title: "添加客户前缀与审阅后缀",
						body: [
							"这个配方在名称开头添加 client-a_，在名称末尾、扩展名前添加 _review。两项都是固定文本，使用时换成自己的客户名和版本标记；也可以只使用其中一条规则。",
							"作用域保持“名称”。“末尾”指当前编辑部分的末尾；如果作用域选择“完整”，后缀会加在 .pdf 后面。名称作用域可以保留扩展名，避免这种错误。",
						],
						steps: [
							"点击上方“试用这个示例”，查看两条添加/插入规则，再选择“用示例文件名试用”。",
							"自行配置时，将作用域设为“名称”，添加“添加/插入”规则，文本填 client-a_，位置选“开头”。",
							"再添加一条“添加/插入”，文本填 _review，位置选“末尾”，排在前缀规则之后。",
							"检查 proposal.pdf → client-a_proposal_review.pdf。修改任意文本即可调整统一标记。",
						],
						examples: [
							{ before: "proposal.pdf", after: "client-a_proposal_review.pdf" },
							{ before: "budget.xlsx", after: "client-a_budget_review.xlsx" },
						],
					},
					{
						title: "保留原名称，明确分隔符",
						body: [
							"分隔符是插入文本的一部分。如果希望前缀和原名称之间有下划线，应填 client-a_，而不是 client-a。_review 后缀同理。",
							"插入规则不会重新编号，也不会替换原文件名。只添加前缀时，仅保留“开头”规则；只添加后缀时，仅保留“末尾”规则。如果需要用数字替换整个名称，请阅读序号指南。",
						],
						examples: [
							{
								before: "proposal.pdf",
								after: "client-a_proposal.pdf",
								note: "只使用开头插入规则：client-a_。",
							},
							{
								before: "proposal.pdf",
								after: "proposal_review.pdf",
								note: "只使用末尾插入规则：_review。",
							},
						],
					},
					{
						title: "避免重复添加同一标记",
						body: [
							"插入规则不会自动判断标记是否已经存在。对 client-a_proposal.pdf 再加一次前缀，会得到 client-a_client-a_proposal.pdf。应取消选择已经标记的文件，或把它们分开处理。",
							"混合批次也可以使用条件正则避免重复添加这个特定前缀：模式 ^(?!client-a_)，替换为 client-a_，标志留空，作用域为名称。此规则区分大小写，Client-A_ 会被视为不同前缀。使用前，同时测试没有前缀和已有前缀的名称。",
						],
						examples: [
							{
								before: "proposal.pdf",
								after: "client-a_proposal.pdf",
								note: "条件正则 ^(?!client-a_) → client-a_，标志留空。",
							},
							{
								before: "client-a_proposal.pdf",
								after: "client-a_proposal.pdf",
								note: "同一条件正则保留已有的前缀。",
							},
						],
					},
					{
						title: "从示例切换到真实文件",
						body: [
							"示例文件名仅用于预览，不会授予真实文件访问权限。清空示例列表，保留规则，再选择需要处理的真实文件。重新检查完整预览，特别注意长名称、已有标记和冲突提示。",
							"支持的桌面版 Chrome、Edge 可以在授权后直接重命名本地文件。不支持直接文件访问的浏览器，可在示例模式预览并导出重命名脚本；先审查脚本，再到对应文件所在目录运行。",
							"重命名只修改名称，不改变文件内容或格式，但可能影响其他应用对旧文件名的引用。重要文件应保留备份，确认预览符合预期后再执行。",
						],
					},
				],
			},
		},
	},
	{
		slug: "replace-spaces-in-filenames",
		category: "patterns",
		publishedAt: "2026-09-21",
		updatedAt: "2026-09-21",
		readingTime: 5,
		relatedSlugs: [
			"add-prefix-suffix-to-filenames",
			"regex-batch-rename",
			"batch-file-rename-basics",
		],
		content: {
			en: {
				title: "Replace Spaces in Filenames with Underscores or Hyphens",
				description:
					"Batch replace or remove spaces in filenames, preserve extensions, and handle repeated whitespace. Compare literal replacement with regex using tested examples.",
				intro:
					"Normalize separators before sharing a folder or using filenames in a project. Choose whether each space becomes an underscore, a hyphen or nothing, then check repeated spaces and naming collisions before applying the change.",
				categoryLabel: "Everyday tasks",
				sections: [
					{
						title: "Replace every ordinary space with an underscore",
						body: [
							"Use Find & Replace for a literal space. The Find field contains one press of the space bar, not the word space or the two characters \\s. Enable Replace all to change every occurrence.",
							"The Try this example button opens this exact rule. Confirm Try with sample filenames to see both a normal name and a name containing two consecutive spaces. No file access is needed for this test.",
						],
						steps: [
							"Set Scope to Name so extensions remain unchanged.",
							"Add Find & Replace. Enter one ordinary space in Find and _ in Replace with.",
							"Enable Replace all and leave By position off.",
							"Check the preview. Two spaces become two underscores because this is a character-for-character replacement.",
						],
						examples: [
							{ before: "Quarterly Report 2026.pdf", after: "Quarterly_Report_2026.pdf" },
							{ before: "draft  final.txt", after: "draft__final.txt" },
						],
					},
					{
						title: "Choose hyphens or remove spaces entirely",
						body: [
							"For hyphens, change Replace with to -. To remove ordinary spaces, leave Replace with empty. Neither setting changes the letter case or other punctuation.",
							"Removing separators can make names harder to read: My Report becomes MyReport. Keep the distinction between replacing spaces and converting to snake_case; case conversion can also split words and change existing separators.",
						],
						examples: [
							{
								before: "My Report.pdf",
								after: "My-Report.pdf",
								note: "Find one ordinary space; replace all with -.",
							},
							{
								before: "My Report.pdf",
								after: "MyReport.pdf",
								note: "Find one ordinary space; replace all with empty text.",
							},
						],
					},
					{
						title: "Collapse repeated whitespace with regex",
						body: [
							"If you want several consecutive whitespace characters to become one separator, use Regex Replace instead of the literal rule: pattern \\s+, replacement _, flags g. It matches whitespace runs, including tabs where the filesystem permits them.",
							"A leading or trailing run also becomes an underscore. To remove surrounding whitespace first, put a separate Regex Replace rule before it: pattern ^\\s+|\\s+$, empty replacement, flags g. This trimming step is optional and is not included in the basic example button.",
						],
						examples: [
							{
								before: "draft  final.txt",
								after: "draft_final.txt",
								note: "Only Regex Replace: \\s+ → _, flags g.",
							},
							{
								before: "  My Report  .pdf",
								after: "My_Report.pdf",
								note: "First trim ^\\s+|\\s+$ with empty replacement and flags g, then \\s+ → _ with flags g.",
							},
						],
					},
					{
						title: "Review collisions and mixed naming styles",
						body: [
							"Report Final.pdf and Report_Final.pdf both end up as Report_Final.pdf when spaces become underscores. Select a different label, exclude one file, or resolve the conflict in the preview before executing. Collapsing whitespace can create similar collisions.",
							"This cleanup changes filenames, not folder names or document contents. A Name-scoped rule preserves .pdf and other extensions; it does not convert file formats. Existing references to old filenames may need updating.",
							"After testing, clear the sample list and import your real files in a supported desktop browser such as Chrome or Edge. Review the complete batch and execute only when the names are correct. If direct file access is unavailable, use sample names to generate a script, review it, and run it in the corresponding folder.",
						],
					},
				],
			},
			zh: {
				title: "批量把文件名空格替换为下划线或连字符",
				description:
					"批量替换或删除文件名空格，保留扩展名，并处理连续空白。用经过验证的示例比较普通替换与正则替换。",
				intro:
					"分享文件夹或整理项目文件前，可以先统一名称中的分隔符。选择将每个空格改为下划线、连字符或直接删除，再检查连续空格和重名冲突。",
				categoryLabel: "日常任务",
				sections: [
					{
						title: "把每个普通空格替换为下划线",
						body: [
							"普通空格使用“查找替换”即可。查找框中按一次空格键，不是输入“空格”二字，也不是输入 \\s。开启“全部替换”以修改每一处空格。",
							"“试用这个示例”按钮会打开这条规则。确认“用示例文件名试用”后，可以同时看到普通名称和含两个连续空格的名称。测试不需要文件访问权限。",
						],
						steps: [
							"将作用域设为“名称”，保留扩展名。",
							"添加“查找替换”，查找框输入一个普通空格，替换框输入 _。",
							"开启“全部替换”，关闭“按位置”。",
							"检查预览。两个空格会变成两个下划线，因为这条规则逐个替换字符。",
						],
						examples: [
							{ before: "Quarterly Report 2026.pdf", after: "Quarterly_Report_2026.pdf" },
							{ before: "draft  final.txt", after: "draft__final.txt" },
						],
					},
					{
						title: "改用连字符，或直接删除空格",
						body: [
							"需要连字符时，将替换内容改为 -。需要删除普通空格时，将替换框留空。两种设置都不会改变字母大小写或其他标点。",
							"删除分隔符可能降低可读性，例如 My Report 会变成 MyReport。替换空格与 snake_case 风格转换不同；风格转换还可能拆分单词、改变现有分隔符。",
						],
						examples: [
							{
								before: "My Report.pdf",
								after: "My-Report.pdf",
								note: "查找一个普通空格，全部替换为 -。",
							},
							{
								before: "My Report.pdf",
								after: "MyReport.pdf",
								note: "查找一个普通空格，全部替换为空。",
							},
						],
					},
					{
						title: "用正则合并连续空白",
						body: [
							"如果希望连续多个空白只变成一个分隔符，请用“正则替换”代替普通替换：模式 \\s+，替换为 _，标志 g。它匹配连续空白，也包括文件系统允许的制表符。",
							"开头或末尾的空白也会变成下划线。若希望先删除两端空白，可在前面加一条独立正则：模式 ^\\s+|\\s+$，替换留空，标志 g。这一步是可选项，不包含在基础试用按钮中。",
						],
						examples: [
							{
								before: "draft  final.txt",
								after: "draft_final.txt",
								note: "仅使用正则 \\s+ → _，标志 g。",
							},
							{
								before: "  My Report  .pdf",
								after: "My_Report.pdf",
								note: "先用 ^\\s+|\\s+$ 删除两端空白，再用 \\s+ → _，两条规则标志均为 g。",
							},
						],
					},
					{
						title: "检查重名与混合命名方式",
						body: [
							"将空格改为下划线时，Report Final.pdf 和 Report_Final.pdf 都会得到 Report_Final.pdf。执行前应修改其中一个名称、取消选择其中一个文件，或在预览中解决冲突。合并连续空白也可能产生同类冲突。",
							"这项清理只改文件名，不修改文件夹名或文件内容。名称作用域会保留 .pdf 等扩展名，不会转换文件格式。其他应用中引用旧文件名的地方可能需要同步更新。",
							"测试后清空示例列表，在支持的桌面浏览器（如 Chrome、Edge）中导入真实文件。检查整个批次，确认名称正确后再执行。如果浏览器不支持直接文件访问，可以用示例名称生成脚本，审查后在对应目录中运行。",
						],
					},
				],
			},
		},
	},
];
