"use client";

import { useState } from "react";

export function FeatureCategoryNav({
	categories,
}: {
	categories: { id: string; color: string; label: string }[];
}) {
	const [activeCategory, setActiveCategory] = useState("rules");
	return (
		<div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-5xl px-6">
				<nav className="flex gap-1 overflow-x-auto py-3">
					{categories.map((category) => (
						<button
							type="button"
							key={category.id}
							onClick={() => {
								setActiveCategory(category.id);
								document.getElementById(category.id)?.scrollIntoView({
									behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
										? "instant"
										: "smooth",
									block: "start",
								});
							}}
							aria-pressed={activeCategory === category.id}
							className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
								activeCategory === category.id
									? "bg-muted text-foreground"
									: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
							}`}
						>
							<span className={`h-2 w-2 rounded-full ${category.color}`} />
							{category.label}
						</button>
					))}
				</nav>
			</div>
		</div>
	);
}
