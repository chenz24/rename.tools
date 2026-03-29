"use client";

import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { MetadataIndicator } from "@/components/rename/MetadataViewer";
import { Checkbox } from "@/components/ui/checkbox";
import type { FileEntry } from "@/lib/rename/types";

interface TreeNode {
	name: string;
	path: string;
	files: FileEntry[];
	children: Map<string, TreeNode>;
}

interface Props {
	files: FileEntry[];
	onToggle: (id: string) => void;
}

function buildTree(files: FileEntry[]): TreeNode {
	const root: TreeNode = {
		name: "",
		path: "",
		files: [],
		children: new Map(),
	};

	for (const f of files) {
		const rp = f.relativePath;
		if (!rp || !rp.includes("/")) {
			root.files.push(f);
			continue;
		}
		const parts = rp.split("/");
		parts.pop();
		let node = root;
		let pathSoFar = "";
		for (const part of parts) {
			pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;
			if (!node.children.has(part)) {
				node.children.set(part, {
					name: part,
					path: pathSoFar,
					files: [],
					children: new Map(),
				});
			}
			node = node.children.get(part)!;
		}
		node.files.push(f);
	}

	return root;
}

function countFiles(node: TreeNode): number {
	let count = node.files.length;
	for (const child of node.children.values()) {
		count += countFiles(child);
	}
	return count;
}

function FolderNode({
	node,
	depth,
	onToggle,
}: {
	node: TreeNode;
	depth: number;
	onToggle?: (id: string) => void;
}) {
	const [open, setOpen] = useState(true);
	const totalFiles = useMemo(() => countFiles(node), [node]);

	return (
		<div className="relative">
			{/* Tree guide line */}
			{depth > 0 && (
				<div
					className="absolute top-0 bottom-0 border-l border-border/40"
					style={{ left: `${depth * 16 + 3}px` }}
				/>
			)}
			<button
				type="button"
				className="flex items-center gap-1.5 w-full py-1 text-xs hover:bg-accent/50 rounded-md transition-colors group"
				style={{ paddingLeft: `${depth * 16 + 6}px`, paddingRight: "8px" }}
				onClick={() => setOpen(!open)}
			>
				<ChevronRight
					className={`h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
				/>
				{open ? (
					<FolderOpen className="h-4 w-4 shrink-0 text-primary" />
				) : (
					<Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
				)}
				<span className="truncate font-medium text-foreground/90 group-hover:text-foreground">
					{node.name}
				</span>
				<span className="ml-auto rounded-full bg-muted/60 px-1.5 py-px text-[10px] text-muted-foreground tabular-nums shrink-0">
					{totalFiles}
				</span>
			</button>
			{open && (
				<div className="relative">
					<FolderContents node={node} depth={depth + 1} onToggle={onToggle} />
				</div>
			)}
		</div>
	);
}

function FolderContents({
	node,
	depth,
	onToggle,
}: {
	node: TreeNode;
	depth: number;
	onToggle?: (id: string) => void;
}) {
	const sortedChildren = useMemo(
		() => Array.from(node.children.values()).sort((a, b) => a.name.localeCompare(b.name)),
		[node.children],
	);

	return (
		<>
			{sortedChildren.map((child) => (
				<FolderNode key={child.path} node={child} depth={depth} onToggle={onToggle} />
			))}
			{node.files.map((f) => (
				<FileItem key={f.id} file={f} depth={depth} onToggle={onToggle} />
			))}
		</>
	);
}

function FileItem({
	file: f,
	depth,
	onToggle,
}: {
	file: FileEntry;
	depth: number;
	onToggle?: (id: string) => void;
}) {
	return (
		<div className="relative group">
			{/* Tree guide line */}
			{depth > 0 && (
				<div
					className="absolute top-0 bottom-0 border-l border-border/40"
					style={{ left: `${depth * 16 + 3}px` }}
				/>
			)}
			<div
				className={`flex items-center gap-2 rounded-md py-1 text-xs transition-all cursor-default ${
					f.selected ? "bg-primary/6" : "hover:bg-accent/40"
				}`}
				style={{
					paddingLeft: `${depth * 16 + 10}px`,
					paddingRight: "8px",
				}}
			>
				<Checkbox
					checked={f.selected}
					onCheckedChange={() => onToggle?.(f.id)}
					className="size-3.5 shrink-0"
				/>
				<File className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
				<span
					className={`truncate flex-1 min-w-0 ${
						f.selected ? "text-foreground" : "text-foreground/70 group-hover:text-foreground/90"
					}`}
				>
					{f.name}
				</span>
				<div className="shrink-0">
					<MetadataIndicator metadata={f.metadata} state={f.metadataState} />
				</div>
			</div>
		</div>
	);
}

export function FileTree({ files, onToggle }: Props) {
	const tree = useMemo(() => buildTree(files), [files]);
	const hasTree = tree.children.size > 0;

	if (!hasTree) {
		return (
			<div className="space-y-px">
				{files.map((f) => (
					<FileItem key={f.id} file={f} depth={0} onToggle={onToggle} />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-px">
			<FolderContents node={tree} depth={0} onToggle={onToggle} />
		</div>
	);
}
