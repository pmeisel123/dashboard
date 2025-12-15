import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { AppDispatch, RootState, WikiPageProps, WikiSpaceProps } from "@src/Api";
import { fetchWiki, fetchWikiSpaces } from "@src/Api";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import "./wiki.css";

const WikiPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride ? searchParamsOveride.toString() : {});
	const [pageId, setPage] = useState<string>(searchParams.get("PageId") || "");
	const [spaceId, setSpaceId] = useState<string>(searchParams.get("SpaceId") || "");
	const wiki: WikiPageProps = useSelector((state: RootState) => state.wikiReducer[pageId]);
	const wikiSpaces: WikiSpaceProps[] = useSelector((state: RootState) => state.wikiSpacesReducer);
	const dispatch = useDispatch<AppDispatch>();
	const loadPage = () => {
		if (pageId) {
			dispatch(fetchWiki(pageId));
		}
	};
	useEffect(() => {
		loadPage();
	}, [dispatch, pageId]);
	useEffect(() => {
		dispatch(fetchWikiSpaces());
		loadPage();
	}, []);
	useEffect(() => {
		setPage(searchParams.get("PageId") || "");
		setSpaceId(searchParams.get("SpaceId") || "");
	}, [searchParams]);

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (pageId) {
			newSearchParams.set("PageId", pageId);
		} else {
			newSearchParams.delete("PageId");
		}
		if (spaceId) {
			newSearchParams.set("SpaceId", spaceId);
		} else {
			newSearchParams.delete("SpaceId");
		}

		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [pageId, spaceId]);

	if (!wiki || !wiki.body) {
		return;
	}
	return (
		<>
			<FormControl size="small">
				<InputLabel id="Space">Space</InputLabel>
				<Select
					label="Space"
					value={spaceId}
					onChange={(event) => {
						if (event.target.value) {
							setSpaceId(event.target.value);
						}
					}}
					sx={{ minWidth: 100 }}
				>
					{wikiSpaces.map((value: WikiSpaceProps) => (
						<MenuItem key={value.id} value={value.id}>
							{value.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<h1>{wiki.title}</h1>
			<div
				className="confluence-content"
				dangerouslySetInnerHTML={{ __html: wiki.body.replace(/"\/wiki/g, '"/jira/wiki') }}
			/>
		</>
	);
};
export default WikiPage;
