import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rename.Tools - Advanced Batch File Rename";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				backgroundColor: "#000000",
				fontFamily: "Inter, sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Background Glows */}
			<div
				style={{
					position: "absolute",
					top: -100,
					left: "50%",
					transform: "translateX(-50%)",
					width: 800,
					height: 400,
					background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)",
					borderRadius: "50%",
				}}
			/>

			{/* Background Grid Layer */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Content Container */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: "100%",
					marginTop: "60px",
					zIndex: 10,
				}}
			>
				{/* Pill */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "8px 24px",
						border: "1px solid rgba(255, 255, 255, 0.8)",
						borderRadius: "100px",
						marginBottom: "24px",
					}}
				>
					<span
						style={{
							fontSize: 24,
							fontWeight: 500,
							color: "white",
							letterSpacing: "0.02em",
						}}
					>
						rename.tools
					</span>
				</div>

				{/* Headline */}
				<h1
					style={{
						fontSize: 64,
						fontWeight: 800,
						color: "white",
						letterSpacing: "-0.04em",
						lineHeight: 1.1,
						margin: 0,
						marginBottom: "50px",
						textAlign: "center",
						maxWidth: "900px",
					}}
				>
					The powerful batch file renaming utility.
				</h1>

				{/* App Mockup */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "900px",
						height: "350px", // going off the bottom slightly
						backgroundColor: "#0a0a0a",
						border: "1px solid rgba(255, 255, 255, 0.1)",
						borderTopLeftRadius: "16px",
						borderTopRightRadius: "16px",
						borderBottom: "none",
						boxShadow: "0 20px 80px rgba(0,0,0,0.8)",
						overflow: "hidden",
					}}
				>
					{/* App Header (MacOS style window controls) */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							padding: "16px 24px",
							borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
							backgroundColor: "rgba(255, 255, 255, 0.02)",
						}}
					>
						<div
							style={{
								display: "flex",
								gap: "8px",
							}}
						>
							<div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#333" }} />
							<div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#333" }} />
							<div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#333" }} />
						</div>
					</div>

					{/* App Body Layout */}
					<div
						style={{
							display: "flex",
							flex: 1,
						}}
					>
						{/* Sidebar (Rules) */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								width: "280px",
								borderRight: "1px solid rgba(255, 255, 255, 0.05)",
								padding: "24px",
								gap: "16px",
							}}
						>
							{/* Rule Card Mockup 1 */}
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									backgroundColor: "rgba(255, 255, 255, 0.03)",
									border: "1px solid rgba(255, 255, 255, 0.08)",
									padding: "16px",
									borderRadius: "8px",
									gap: "12px",
								}}
							>
								<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
									<div
										style={{
											width: 16,
											height: 16,
											borderRadius: 4,
											backgroundColor: "rgba(255,255,255,0.4)",
										}}
									/>
									<div
										style={{
											width: "50%",
											height: 12,
											backgroundColor: "rgba(255, 255, 255, 0.2)",
											borderRadius: 4,
										}}
									/>
								</div>
								<div
									style={{
										width: "100%",
										height: 32,
										backgroundColor: "rgba(255, 255, 255, 0.05)",
										borderRadius: 4,
									}}
								/>
							</div>

							{/* Rule Card Mockup 2 */}
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									backgroundColor: "rgba(255, 255, 255, 0.03)",
									border: "1px solid rgba(255, 255, 255, 0.08)",
									padding: "16px",
									borderRadius: "8px",
									gap: "12px",
								}}
							>
								<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
									<div
										style={{
											width: 16,
											height: 16,
											borderRadius: 4,
											backgroundColor: "rgba(255,255,255,0.4)",
										}}
									/>
									<div
										style={{
											width: "40%",
											height: 12,
											backgroundColor: "rgba(255, 255, 255, 0.2)",
											borderRadius: 4,
										}}
									/>
								</div>
								<div
									style={{
										width: "100%",
										height: 32,
										backgroundColor: "rgba(255, 255, 255, 0.05)",
										borderRadius: 4,
									}}
								/>
							</div>
						</div>

						{/* Main Area (Files) */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								flex: 1,
								padding: "24px",
								gap: "12px",
							}}
						>
							<div
								style={{
									display: "flex",
									gap: "16px",
									paddingBottom: "12px",
									borderBottom: "1px solid rgba(255,255,255,0.05)",
								}}
							>
								<div
									style={{
										width: "45%",
										height: 10,
										backgroundColor: "rgba(255,255,255,0.1)",
										borderRadius: 2,
									}}
								/>
								<div
									style={{
										width: "45%",
										height: 10,
										backgroundColor: "rgba(255,255,255,0.1)",
										borderRadius: 2,
									}}
								/>
							</div>

							{/* File rows */}
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										padding: "8px 0",
									}}
								>
									<div
										style={{
											width: "45%",
											height: 12,
											backgroundColor: "rgba(255, 255, 255, 0.15)",
											borderRadius: 4,
										}}
									/>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="rgba(255,255,255,0.3)"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-label="Arrow"
									>
										<path d="M5 12h14M12 5l7 7-7 7" />
									</svg>
									<div
										style={{
											width: "45%",
											height: 12,
											backgroundColor: "rgba(255, 255, 255, 0.4)",
											borderRadius: 4,
										}}
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>,
		{
			...size,
		},
	);
}
