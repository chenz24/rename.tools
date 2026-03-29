import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rename.Tools - Advanced Batch File Rename";

// Use 2400x1260 "Retina" size to fix embedded image blurriness (Satori downsamples strictly).
export const size = {
	width: 2400,
	height: 1260,
};
export const contentType = "image/png";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function Image({ params }: Props) {
	const { locale } = await params;

	const headline =
		locale === "zh"
			? "Rename.Tools - 强大、安全的在线批量文件重命名工具。"
			: "Rename.Tools - Advanced Online Batch File Rename Tool.";

	// Load the local screenshot image as an ArrayBuffer, supported by Next.js Edge OG
	const imageData = await fetch(
		new URL("../../../public/screenshots/product_screenshot.png", import.meta.url),
	).then((res) => res.arrayBuffer());

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				backgroundColor: "#080808", // Very dark black-gray matching reference
				fontFamily: "Inter, sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Fine grid background layer */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(to right, rgba(255, 255, 255, 0.06) 2px, transparent 2px), linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 2px, transparent 2px)",
					backgroundSize: "56px 56px", // Doubled density for retina
					backgroundPosition: "center center",
				}}
			/>

			{/* Subtle central glow to make text pop gently */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: "50%",
					transform: "translateX(-50%)",
					width: 2000,
					height: 1000,
					background: "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 60%)",
					borderRadius: "50%",
					pointerEvents: "none",
				}}
			/>

			{/* Top-aligned content container */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: "100%",
					marginTop: "140px",
					zIndex: 10,
				}}
			>
				{/* The Pill: strictly mimicking myogimage.com's bordered rounded rect */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "12px 48px",
						border: "2px solid #ffffff", // pure white border
						borderRadius: "200px",
						marginBottom: "56px",
						backgroundColor: "rgba(0,0,0,0.4)", // Slight transparency over grid
					}}
				>
					<span
						style={{
							fontSize: 44,
							fontWeight: 500,
							color: "#ffffff",
							letterSpacing: "0.01em",
							fontFamily: "monospace, sans-serif", // Clean system font look
						}}
					>
						rename.tools
					</span>
				</div>

				{/* The Headline: large, bold, pure white, with tight letter spacing */}
				<h1
					style={{
						fontSize: 136,
						fontWeight: 900,
						color: "#ffffff",
						letterSpacing: "-0.04em",
						lineHeight: 1.1,
						margin: 0,
						marginBottom: "100px",
						textAlign: "center",
						maxWidth: "1920px",
					}}
				>
					{headline}
				</h1>

				{/* Product Screenshot embedded container */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "1800px",
						height: "800px", // Deliberately cutting off the bottom like in the reference
						border: "2px solid rgba(255, 255, 255, 0.15)",
						borderTopLeftRadius: "32px",
						borderTopRightRadius: "32px",
						borderBottom: "none",
						boxShadow: "0 60px 200px rgba(0,0,0,0.9)", // Deep shadow to lift it off the grid
						overflow: "hidden",
						backgroundColor: "#000",
					}}
				>
					<img
						src={imageData as any}
						alt="Product screenshot"
						style={{
							width: "1800px",
							// Omitting objectFit/height allows it to naturally proportion and crop with overflow:hidden.
						}}
					/>
				</div>
			</div>
		</div>,
		{
			...size,
		},
	);
}
