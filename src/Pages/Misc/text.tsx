import type { FC } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { StyledTextfit } from "./const";

export const TextPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const [searchParams] = useSearchParams(searchParamsOveride ? searchParamsOveride.toString() : {});
	const [text, setText] = useState<string>(searchParams.get("text") || "");
	useEffect(() => {
		setText((searchParamsOveride ? searchParamsOveride.get("text") : searchParams.get("text")) || "");
	}, [searchParams, searchParamsOveride]);

	return <StyledTextfit>{text}</StyledTextfit>;
};
