import { InputLabel, TextField } from "@mui/material";
import type { FC } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { StyledTextfit } from "./const";

export const TextPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride ? searchParamsOveride.toString() : {});
	const [text, setText] = useState<string>(searchParams.get("text") || "");
	const [localText, setLocalText] = useState<string>(searchParams.get("text") || "");
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

	useLayoutEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		setText((searchParamsOveride ? searchParamsOveride.get("text") : searchParams.get("text")) || "");
	}, [searchParams, searchParamsOveride]);

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (searchParams) {
			newSearchParams.set("text", text);
		} else {
			newSearchParams.delete("text");
		}

		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [text]);

	const handleOnChange = (value: string) => {
		setLocalText(value);
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			setText(value);
		}, 1000);
	};
	const getStyle = () => {
		if (!isDashboard) {
			return {
				maxWidth: "calc(100% - 40px)",
				maxHeight: windowSize.height - 200,
			};
		}
		return {};
	};
	return (
		<>
			{!isDashboard && (
				<>
					<InputLabel id="search">Text</InputLabel>
					<TextField
						id="search"
						value={localText}
						onChange={(event) => {
							handleOnChange(event.target.value);
						}}
					/>
				</>
			)}
			<div style={getStyle()}>
				<StyledTextfit key={text}>{text}</StyledTextfit>
			</div>
		</>
	);
};
