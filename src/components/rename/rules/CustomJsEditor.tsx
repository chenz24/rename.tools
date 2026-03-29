import { ChevronDown, Maximize2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { JsCodeEditor } from "@/components/rename/JsCodeEditor";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCustomJsDraftStore } from "@/hooks/useCustomJsDraftStore";
import type { CustomJsConfig } from "@/lib/rename/types";

interface CustomJsEditorProps {
	ruleId: string;
	config: CustomJsConfig;
	onChange: (c: Partial<CustomJsConfig>) => void;
}

const JS_EXAMPLES = [
	{
		key: "datePrefix",
		code: `function rename(options) {
  const { name } = options;
  // Add date prefix YYYY-MM-DD
  const date = new Date().toISOString().slice(0, 10);
  return date + "_" + name;
}`,
	},
	{
		key: "sequenceNumber",
		code: `function rename(options) {
  const { name, index } = options;
  // Format sequence as 001, 002, ...
  const num = String(index + 1).padStart(3, '0');
  return num + "_" + name;
}`,
	},
	{
		key: "extractNumbers",
		code: `function rename(options) {
  const { name } = options;
  // Extract numbers and pad with zeros
  const match = name.match(/\\d+/);
  if (match) {
    const num = String(parseInt(match[0])).padStart(4, '0');
    return name.replace(/\\d+/, num);
  }
  return name;
}`,
	},
	{
		key: "cleanupName",
		code: `function rename(options) {
  const { name } = options;
  // Remove special chars, replace spaces
  return name
    .replace(/[^a-zA-Z0-9\\u4e00-\\u9fa5\\s_-]/g, '')
    .replace(/\\s+/g, '_')
    .toLowerCase();
}`,
	},
	{
		key: "conditionalPrefix",
		code: `function rename(options) {
  const { name, ext } = options;
  // Add prefix based on file type
  if (['jpg', 'png', 'gif'].includes(ext)) {
    return 'img_' + name;
  } else if (['mp4', 'mov', 'avi'].includes(ext)) {
    return 'vid_' + name;
  }
  return name;
}`,
	},
	{
		key: "useModifiedTime",
		code: `function rename(options) {
  const { name, modifiedTime } = options;
  // Add file modified date as prefix
  if (modifiedTime) {
    const date = new Date(modifiedTime).toISOString().slice(0, 10);
    return date + "_" + name;
  }
  return name;
}`,
	},
] as const;

function ExpandedJsEditor({ ruleId }: { ruleId: string }) {
	const t = useTranslations("rename.rules.customJs");
	const draftCode = useCustomJsDraftStore(
		React.useCallback((state) => state.sessions[ruleId]?.draftCode ?? "", [ruleId]),
	);
	const draftError = useCustomJsDraftStore(
		React.useCallback((state) => state.sessions[ruleId]?.draftError ?? null, [ruleId]),
	);

	const handleCodeChange = React.useCallback(
		(newCode: string) => {
			useCustomJsDraftStore.getState().setDraftCode(ruleId, newCode);
		},
		[ruleId],
	);

	const handleValidate = React.useCallback(
		(errorMsg: string | null) => {
			useCustomJsDraftStore.getState().setDraftError(ruleId, errorMsg);
		},
		[ruleId],
	);

	return (
		<>
			<div className="flex-1 min-h-0">
				<JsCodeEditor
					value={draftCode}
					onChange={handleCodeChange}
					onValidate={handleValidate}
					minHeight={400}
					maxHeight={800}
					className="h-full"
				/>
			</div>
			{draftError && (
				<div className="shrink-0 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded border border-destructive/20">
					<span className="font-medium">{t("error")}:</span> {draftError}
				</div>
			)}
		</>
	);
}

export function CustomJsEditor({ ruleId, config, onChange }: CustomJsEditorProps) {
	const t = useTranslations("rename.rules.customJs");
	const [error, setError] = React.useState<string | null>(config.lastError ?? null);
	const [isExpanded, setIsExpanded] = React.useState(false);
	const onChangeRef = React.useRef(onChange);
	onChangeRef.current = onChange;

	React.useEffect(() => {
		setError(config.lastError ?? null);
	}, [config.lastError]);

	const handleCodeChange = React.useCallback((newCode: string) => {
		let lastError: string | undefined;
		try {
			new Function("name", "ext", "index", newCode);
		} catch (e) {
			lastError = e instanceof Error ? e.message : String(e);
		}
		setError(lastError ?? null);
		onChangeRef.current({ code: newCode, lastError });
	}, []);

	const handleDialogClose = React.useCallback(
		(open: boolean) => {
			if (!open) {
				const store = useCustomJsDraftStore.getState();
				store.cancelSession(ruleId);
				store.clearSession(ruleId);
			}
			setIsExpanded(open);
		},
		[ruleId],
	);

	const handleValidate = React.useCallback((errorMsg: string | null) => {
		setError(errorMsg);
	}, []);

	const openExpandedEditor = React.useCallback(() => {
		useCustomJsDraftStore.getState().startSession(ruleId, config.code, config.lastError);
		setIsExpanded(true);
	}, [ruleId, config.code, config.lastError]);

	const confirmExpandedEditor = React.useCallback(() => {
		const store = useCustomJsDraftStore.getState();
		const payload = store.confirmSession(ruleId);
		if (payload) {
			onChangeRef.current(payload);
			setError(payload.lastError ?? null);
		}
		store.clearSession(ruleId);
		setIsExpanded(false);
	}, [ruleId]);

	const cancelExpandedEditor = React.useCallback(() => {
		const store = useCustomJsDraftStore.getState();
		store.cancelSession(ruleId);
		store.clearSession(ruleId);
		setIsExpanded(false);
	}, [ruleId]);

	const insertExample = React.useCallback(
		(code: string) => {
			if (isExpanded) {
				const store = useCustomJsDraftStore.getState();
				store.setDraftCode(ruleId, code);
				store.setDraftError(ruleId, null);
				return;
			}
			onChangeRef.current({ code, lastError: undefined });
			setError(null);
		},
		[isExpanded, ruleId],
	);

	const aiPromptTemplate = `我正在使用 javascript 进行文件的批量重命名工作，请按照需求补充完成重命名函数。

需求：<准确描述你的需求>
参考案例：<将 abc.txt 修改为 001_abc.txt>

需要填充的模板函数：

function rename(options) {
  const { name, ext, fullName, index, size, modifiedTime } = options;
  // your code here
  return name;
}

参数说明:
- name: 文件名 (不含扩展名)
- ext: 扩展名 (不含点, 如 "jpg")
- fullName: 完整文件名
- index: 文件序号 (从0开始)
- size: 文件大小 (字节)
- modifiedTime: 文件修改时间戳

返回值：新文件名 (字符串类型)`;

	return (
		<>
			<div className="space-y-1.5">
				<div className="flex items-center justify-between gap-2">
					<p className="text-[11px] text-muted-foreground flex-1">{t("hint")}</p>
					<div className="flex items-center gap-1">
						<Popover>
							<PopoverTrigger asChild>
								<Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
									<Sparkles className="h-3.5 w-3.5" />
								</Button>
							</PopoverTrigger>
							<PopoverContent side="left" align="start" className="w-80">
								<div className="space-y-2">
									<h4 className="font-medium text-sm">{t("aiPromptTitle")}</h4>
									<p className="text-xs text-muted-foreground">{t("aiPromptDesc")}</p>
									<pre className="text-[10px] bg-muted p-2 rounded overflow-auto max-h-48 whitespace-pre-wrap">
										{aiPromptTemplate}
									</pre>
									<Button
										size="sm"
										variant="outline"
										className="w-full text-xs h-7"
										onClick={() => navigator.clipboard.writeText(aiPromptTemplate)}
									>
										{t("copyPrompt")}
									</Button>
								</div>
							</PopoverContent>
						</Popover>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-6 text-[11px] px-2 gap-1"
								>
									{t("insertExample")}
									<ChevronDown className="h-3 w-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-44">
								{JS_EXAMPLES.map((example) => (
									<DropdownMenuItem
										key={example.key}
										onClick={() => insertExample(example.code)}
										className="text-xs"
									>
										{t(`examples.${example.key}`)}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0"
							onClick={openExpandedEditor}
						>
							<Maximize2 className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
				<JsCodeEditor
					value={config.code}
					onChange={handleCodeChange}
					onValidate={handleValidate}
					minHeight={140}
				/>
				{error && (
					<div className="text-[11px] text-destructive bg-destructive/10 px-2 py-1.5 rounded border border-destructive/20">
						<span className="font-medium">{t("error")}:</span> {error}
					</div>
				)}
			</div>

			<Dialog open={isExpanded} onOpenChange={handleDialogClose}>
				<DialogContent className="max-w-[70vw] sm:max-w-2xl w-[1200px] h-[85vh] flex flex-col">
					<DialogHeader className="shrink-0">
						<DialogTitle className="flex items-center justify-between">
							<span>{t("expandedTitle")}</span>
							<div className="flex items-center gap-1">
								<Popover>
									<PopoverTrigger asChild>
										<Button type="button" variant="ghost" size="sm" className="h-7 px-2 gap-1">
											<Sparkles className="h-3.5 w-3.5" />
											{t("aiPromptTitle")}
										</Button>
									</PopoverTrigger>
									<PopoverContent side="bottom" align="end" className="w-96">
										<div className="space-y-2">
											<p className="text-xs text-muted-foreground">{t("aiPromptDesc")}</p>
											<pre className="text-[10px] bg-muted p-2 rounded overflow-auto max-h-60 whitespace-pre-wrap">
												{aiPromptTemplate}
											</pre>
											<Button
												size="sm"
												variant="outline"
												className="w-full text-xs h-7"
												onClick={() => navigator.clipboard.writeText(aiPromptTemplate)}
											>
												{t("copyPrompt")}
											</Button>
										</div>
									</PopoverContent>
								</Popover>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="h-7 text-xs px-2 gap-1"
										>
											{t("insertExample")}
											<ChevronDown className="h-3 w-3" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-44">
										{JS_EXAMPLES.map((example) => (
											<DropdownMenuItem
												key={example.key}
												onClick={() => insertExample(example.code)}
												className="text-xs"
											>
												{t(`examples.${example.key}`)}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</DialogTitle>
					</DialogHeader>
					<ExpandedJsEditor ruleId={ruleId} />
					<DialogFooter className="shrink-0">
						<Button variant="outline" onClick={cancelExpandedEditor}>
							{t("cancel")}
						</Button>
						<Button onClick={confirmExpandedEditor}>{t("confirm")}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
