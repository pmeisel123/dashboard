import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import type { AppDispatch, RootState, WikiPageProps, WikiPagesProps, WikiSpaceProps } from "@src/Api";
import { fetchWiki, fetchWikiPages, fetchWikiSpaces } from "@src/Api";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useSearchParams } from "react-router-dom";
import "./wiki.css";

declare const __API_CONFLUENCE_URL__: string;

const WikiPage: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride ? searchParamsOveride.toString() : {});
	const [pageId, setPageId] = useState<string>(searchParams.get("PageId") || "");
	const [spaceKey, setSpaceKey] = useState<string>(searchParams.get("SpaceKey") || "");
	const [loading, setLoading] = useState<boolean>(true);
	const wikiSpaces: WikiSpaceProps[] = useSelector((state: RootState) => state.wikiSpacesReducer);
	const wikiPages: WikiPagesProps[] = useSelector((state: RootState) => state.wikiPagesReducer[spaceKey]);
	const wiki: WikiPageProps = useSelector((state: RootState) => state.wikiReducer[pageId]);
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
		setPageId(searchParams.get("PageId") || "");
		setSpaceKey(searchParams.get("SpaceKey") || "");
	}, [searchParams]);

	useEffect(() => {
		dispatch(fetchWikiPages(spaceKey)).then((data) => {
			const payload = data.payload as WikiPagesProps[];
			if (!payload || !payload.some((item) => item.id === pageId)) {
				setPageId("");
			}
			setLoading(false);
		});
	}, [spaceKey]);

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (pageId) {
			newSearchParams.set("PageId", pageId);
		} else {
			newSearchParams.delete("PageId");
		}
		if (spaceKey) {
			newSearchParams.set("SpaceKey", spaceKey);
		} else {
			newSearchParams.delete("SpaceKey");
		}

		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [pageId, spaceKey]);

	const wiki_directory = __API_CONFLUENCE_URL__.replace(/https?:\/\/[^/]*/, "");
	const wiki_regex1 = new RegExp('"' + wiki_directory, "g");
	const wiki_regex2 = new RegExp("'" + wiki_directory, "g");

	return (
		<>
			{!isDashboard && wikiSpaces && !!wikiSpaces.length && (
				<Grid container spacing={2} sx={{ paddingBottom: 1 }}>
					<Grid>
						<FormControl size="small">
							<InputLabel id="Space">Space</InputLabel>
							<Select
								label="Space"
								value={spaceKey}
								onChange={(event) => {
									if (event.target.value) {
										setLoading(true);
										setSpaceKey(event.target.value);
									}
								}}
								sx={{ minWidth: 100 }}
							>
								{wikiSpaces.map((value: WikiSpaceProps) => (
									<MenuItem key={value.key} value={value.key}>
										{value.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<Grid>
						{wikiPages && !!wikiPages.length && (
							<FormControl size="small">
								<InputLabel id="Page">Page</InputLabel>
								{!!loading && (
									<Select label="Page" value="" sx={{ minWidth: 100 }}>
										<MenuItem key="" value="">
											Loading
										</MenuItem>
									</Select>
								)}
								{!loading && (
									<Select
										label="Page"
										value={pageId}
										onChange={(event) => {
											if (event.target.value) {
												setPageId(event.target.value);
											}
										}}
										sx={{ minWidth: 100 }}
									>
										{wikiPages.map((value: WikiPagesProps) => (
											<MenuItem key={value.id} value={value.id}>
												{value.title}
											</MenuItem>
										))}
									</Select>
								)}
							</FormControl>
						)}
					</Grid>
					<Grid>
						{!!pageId && (
							<a
								href={
									__API_CONFLUENCE_URL__.replace(/\/$/, "") +
									"/spaces/" +
									spaceKey +
									"/pages/" +
									pageId
								}
								target="_blank"
							>
								View in Confluence
							</a>
						)}
					</Grid>
				</Grid>
			)}
			{wiki && (
				<>
					<h1>{wiki.title}</h1>
					<div
						className="confluence-content"
						dangerouslySetInnerHTML={{
							__html: wiki.body.replace(wiki_regex1, '"/jirawiki/').replace(wiki_regex2, "'/jirawiki/"),
						}}
					/>
				</>
			)}
		</>
	);
};
export default WikiPage;
