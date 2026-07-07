import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

export const alt = "Rename.Tools - Advanced Bulk File Renamer";

export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";
export const dynamic = "force-static";
export const dynamicParams = false;

const featureLabels = ["Regex", "Sequences", "Case styles", "Local files"];

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default function Image() {
	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#07090d",
				color: "#ffffff",
				fontFamily: "Arial, sans-serif",
				position: "relative",
				overflow: "hidden",
				padding: "62px 80px 54px",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)",
					backgroundSize: "42px 42px",
					backgroundPosition: "center center",
				}}
			/>
			<div
				style={{
					position: "absolute",
					right: -220,
					top: -220,
					width: 620,
					height: 620,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(30, 144, 255, 0.34) 0%, rgba(30, 144, 255, 0) 68%)",
				}}
			/>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
					position: "relative",
					zIndex: 1,
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 14,
					}}
				>
					<div
						style={{
							width: 44,
							height: 44,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							borderRadius: 12,
							backgroundColor: "#ffffff",
							color: "#07090d",
							fontSize: 28,
							fontWeight: 900,
						}}
					>
						R
					</div>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<div style={{ fontSize: 30, fontWeight: 800 }}>Rename.Tools</div>
						<div style={{ marginTop: 2, fontSize: 18, color: "#aeb7c8" }}>
							Privacy-first file renaming
						</div>
					</div>
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						padding: "12px 20px",
						border: "1px solid rgba(255,255,255,0.2)",
						borderRadius: 999,
						backgroundColor: "rgba(255,255,255,0.08)",
						color: "#d6deec",
						fontSize: 18,
						fontWeight: 700,
					}}
				>
					Web app. No upload required.
				</div>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: 760,
					position: "relative",
					zIndex: 1,
				}}
			>
				<div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1 }}>Bulk Rename Files Online</div>
				<div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.35, color: "#b8c2d6" }}>
					Rename hundreds of files with regex, sequences, case transforms, and instant previews in
					your browser.
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "flex-end",
					justifyContent: "space-between",
					width: "100%",
					position: "relative",
					zIndex: 1,
				}}
			>
				<div style={{ display: "flex", gap: 12 }}>
					{featureLabels.map((label) => (
						<div
							key={label}
							style={{
								display: "flex",
								padding: "10px 14px",
								border: "1px solid rgba(255,255,255,0.16)",
								borderRadius: 999,
								backgroundColor: "rgba(255,255,255,0.08)",
								color: "#eef3ff",
								fontSize: 16,
								fontWeight: 700,
							}}
						>
							{label}
						</div>
					))}
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: 340,
						height: 166,
						border: "1px solid rgba(255,255,255,0.18)",
						borderRadius: 18,
						overflow: "hidden",
						backgroundColor: "rgba(10,14,22,0.92)",
						boxShadow: "0 28px 90px rgba(0,0,0,0.52)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							height: 40,
							padding: "0 14px",
							borderBottom: "1px solid rgba(255,255,255,0.12)",
						}}
					>
						<div style={{ display: "flex", gap: 7 }}>
							<div
								style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#ff5f57" }}
							/>
							<div
								style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#ffbd2e" }}
							/>
							<div
								style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#28c840" }}
							/>
						</div>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
						<div style={{ display: "flex", gap: 10 }}>
							<div style={{ width: 96, height: 16, borderRadius: 6, backgroundColor: "#1e90ff" }} />
							<div
								style={{ width: 174, height: 16, borderRadius: 6, backgroundColor: "#263244" }}
							/>
						</div>
						<div style={{ display: "flex", gap: 10 }}>
							<div
								style={{ width: 132, height: 16, borderRadius: 6, backgroundColor: "#263244" }}
							/>
							<div
								style={{ width: 154, height: 16, borderRadius: 6, backgroundColor: "#33d69f" }}
							/>
						</div>
						<div style={{ display: "flex", gap: 10 }}>
							<div
								style={{ width: 112, height: 16, borderRadius: 6, backgroundColor: "#263244" }}
							/>
							<div
								style={{ width: 184, height: 16, borderRadius: 6, backgroundColor: "#ffd166" }}
							/>
						</div>
						<div style={{ display: "flex", gap: 10 }}>
							<div style={{ width: 82, height: 16, borderRadius: 6, backgroundColor: "#263244" }} />
							<div
								style={{ width: 210, height: 16, borderRadius: 6, backgroundColor: "#fb7185" }}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>,
		size,
	);
}
