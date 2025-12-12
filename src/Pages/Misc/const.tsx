import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Textfit } from "react-textfit";

const useParentSize = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

	useLayoutEffect(() => {
		if (ref.current && ref.current.parentElement) {
			const parentElement = ref.current.parentElement;

			if (parentElement) {
				const updateSize = () => {
					setSize({
						width: parentElement.clientWidth,
						height: parentElement.clientHeight,
					});
				};

				updateSize();

				const resizeObserver = new ResizeObserver(updateSize);
				resizeObserver.observe(parentElement);

				return () => {
					resizeObserver.disconnect();
				};
			}
		}
	}, []);

	return { ref, size };
};

export const StyledTextfit = ({ children }: { children: ReactNode }) => {
	const { ref, size } = useParentSize();
	return (
		<div ref={ref} style={{ height: size.height, width: size.width, textAlign: "center", margin: 'auto' }}>
			<Textfit
				key={size.height + "x" + size.width}
				mode="multi"
				min={1}
				max={1000}
				style={{ height: size.height - 5, width: size.width - 55, margin: 'auto' }}
			>
				{children}
			</Textfit>
		</div>
	);
};
