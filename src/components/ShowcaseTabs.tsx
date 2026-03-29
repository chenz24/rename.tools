"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { type ElementType, useState } from "react";

type ShowcaseItem = {
	id: string;
	icon: ElementType;
	color: string;
	bgColor: string;
	borderColor: string;
	screenshot: string;
	tab: string;
	title: string;
	desc: string;
};

type ShowcaseTabsProps = {
	badge: string;
	title: string;
	desc: string;
	items: ShowcaseItem[];
};

export function ShowcaseTabs({ badge, title, desc, items }: ShowcaseTabsProps) {
	const [activeItem, setActiveItem] = useState(items[0]);

	return (
		<section className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
			<div className="pointer-events-none absolute -right-24 top-12 h-56 w-56 rounded-full bg-violet-500/6 blur-3xl" />
			<div className="pointer-events-none absolute -left-20 bottom-8 h-48 w-48 rounded-full bg-rose-500/6 blur-3xl" />

			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-500" />
				<span className="font-medium">{badge}</span>
				<ChevronRight className="h-4 w-4" />
			</div>

			<h2 className="mt-4 whitespace-pre-line text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
				{title}
			</h2>

			<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
				{desc}
			</p>

			<div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:gap-8 lg:grid-cols-12">
				<div className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3 ring-1 ring-border/40 sm:rounded-2xl sm:p-4 lg:col-span-4">
					{items.map((item) => {
						const Icon = item.icon;
						const isActive = activeItem.id === item.id;

						return (
							<button
								type="button"
								key={item.id}
								onClick={() => setActiveItem(item)}
								className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-200 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3 ${
									isActive
										? `${item.bgColor} border-l-2 ${item.borderColor} ring-1 ring-border shadow-xs`
										: "border-l-2 border-transparent hover:bg-muted/50"
								}`}
							>
								<Icon
									className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${
										isActive ? item.color : "text-muted-foreground group-hover:text-foreground"
									}`}
									strokeWidth={1.5}
								/>
								<span
									className={`flex-1 text-xs font-medium sm:text-sm ${
										isActive
											? "text-foreground"
											: "text-muted-foreground group-hover:text-foreground"
									}`}
								>
									{item.tab}
								</span>
								<ChevronRight
									className={`h-4 w-4 transition-all duration-200 ${
										isActive
											? `${item.color} opacity-100`
											: "translate-x-1 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
									}`}
								/>
							</button>
						);
					})}
				</div>

				<div className="lg:col-span-8">
					<div className="mb-4 sm:mb-6">
						<h3 className="text-lg font-semibold text-foreground sm:text-xl">{activeItem.title}</h3>
						<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2">
							{activeItem.desc}
						</p>
					</div>

					<div className="rounded-xl bg-gradient-to-b from-border/60 to-transparent p-[1px] sm:rounded-2xl">
						<div className="overflow-hidden rounded-xl bg-muted/50 shadow-sm ring-1 ring-border/50 sm:rounded-2xl">
							<div className="border-b bg-background/70 px-3 py-1.5 sm:px-4 sm:py-2">
								<div className="h-1.5 w-16 rounded-full bg-muted-foreground/20 sm:w-20" />
							</div>
							<div className="relative aspect-video overflow-hidden bg-muted">
								<Image
									src={activeItem.screenshot}
									alt={activeItem.title}
									fill
									className="object-cover"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
