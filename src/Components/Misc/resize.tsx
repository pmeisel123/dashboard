import type { RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";

interface Size {
	width: number;
	height: number;
}

export function useResizeObserver<T extends HTMLElement>(): [RefObject<T | null>, Size] {
	const [size, setSize] = useState<Size>({ width: 0, height: 0 });
	const targetRef = useRef<T>(null);

	useLayoutEffect(() => {
		const element = targetRef.current;
		if (!element) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;

			const boxSize = Array.isArray(entry.contentBoxSize)
				? entry.contentBoxSize[0]
				: (entry.contentBoxSize as unknown as ResizeObserverSize);

			setSize({
				width: boxSize.inlineSize,
				height: boxSize.blockSize,
			});
		});

		observer.observe(element);

		return () => observer.disconnect();
	}, []);

	return [targetRef, size];
}
