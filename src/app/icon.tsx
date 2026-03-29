import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
	width: 32,
	height: 32,
};
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#3b88c3",
				borderRadius: "6px",
			}}
		>
			<div
				style={{
					fontSize: 20,
					fontWeight: 900,
					color: "white",
					fontFamily: "sans-serif",
				}}
			>
				R
			</div>
		</div>,
		{
			...size,
		},
	);
}
