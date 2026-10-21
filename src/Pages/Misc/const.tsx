import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Textfit } from "react-textfit";

const useParentSize = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useLayoutEffect(() => {
		const element = ref.current;
		if (!element) return;

		const updateSize = () => {
			setSize({
				width: element.clientWidth,
				height: element.clientHeight,
			});
		};

		const resizeObserver = new ResizeObserver(updateSize);
		resizeObserver.observe(element);

		updateSize();

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	return { ref, size };
};

export const StyledTextfit = ({ children }: { children: ReactNode }) => {
	const { ref, size } = useParentSize();

	const paddingX = 40;
	const paddingY = 20;

	const targetWidth = Math.max(0, size.width - paddingX);
	const targetHeight = Math.max(0, size.height - paddingY);

	return (
		<Box
			ref={ref}
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				overflow: "hidden",
				boxSizing: "border-box",
			}}
		>
			{size.width > 0 && size.height > 0 && (
				<Textfit
					mode="multi"
					min={1}
					max={1000}
					key={`${targetWidth}-${targetHeight}-${String(children)}`}
					throttle={16}
					style={{
						width: targetWidth,
						height: targetHeight,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
						overflowWrap: "anywhere",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							textAlign: "center",
							width: "100%",
							height: "100%",
						}}
					>
						{children}
					</div>
				</Textfit>
			)}
		</Box>
	);
};
