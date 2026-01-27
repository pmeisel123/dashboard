import { Box, Checkbox, FormControlLabel, ListItem, ListItemButton, ListItemText } from "@mui/material";
import type { AppDispatch, RootState } from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import { SavePageList } from "@src/Components";
import { pageTestRequires } from "@src/Pages/pageRegistry";
import { pages } from "@src/Pages/pages";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

function HomePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [showHidden, setShowHidden] = useState<boolean>(searchParams.get("showHidden") == "true");
	const config = useSelector((state: RootState) => state.configState);
	const dispatch = useDispatch<AppDispatch>();
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);

	useEffect(() => {
		setShowHidden(searchParams.get("showHidden") == "true");
	}, [searchParams]);

	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());

		if (showHidden) {
			newSearchParams.set("showHidden", "true");
		} else {
			newSearchParams.delete("showHidden");
		}

		if (searchParams.toString() != newSearchParams.toString()) {
			setSearchParams(newSearchParams);
		}
	}, [showHidden]);
	return (
		<Box>
			{pages.map((page) => {
				if (
					"requires" in page &&
					typeof page.requires === "string" &&
					!pageTestRequires(page.requires, config)
				) {
					return;
				}
				return (
					<ListItem disablePadding key={page.path}>
						<ListItemButton component="div" sx={{ cursor: "default" }}>
							<ListItemText
								primary={
									<Link
										to={page.path}
										style={{ fontWeight: "bold", textDecoration: "none", color: "inherit" }}
									>
										<div>{page.name}</div>
									</Link>
								}
								secondary={
									<Box component="span" sx={{ display: "block" }}>
										{page.description}
									</Box>
								}
							/>
						</ListItemButton>
					</ListItem>
				);
			})}
			<FormControlLabel
				control={
					<Checkbox
						checked={showHidden}
						onChange={() => {
							setShowHidden(!showHidden);
						}}
						name="Show Hidden Pages"
						value={showHidden}
					/>
				}
				label="Show Hidden Pages"
			/>
			{showHidden && (
				<>
					{pages.map((page) => {
						if (
							"requires" in page &&
							typeof page.requires === "string" &&
							!pageTestRequires(page.requires, config)
						) {
							return (
								<ListItem disablePadding key={page.path} sx={{ backgroundColor: "#DDD" }}>
									<ListItemButton component="div" sx={{ cursor: "default" }}>
										<ListItemText
											primary={
												<Link
													to={page.path}
													style={{
														fontWeight: "bold",
														textDecoration: "none",
														color: "inherit",
													}}
												>
													<div>{page.name}</div>
												</Link>
											}
											secondary={
												<Box component="span" sx={{ display: "block" }}>
													{page.description}
												</Box>
											}
										/>
									</ListItemButton>
								</ListItem>
							);
						}
					})}
				</>
			)}
			<SavePageList />
		</Box>
	);
}
export default HomePage;

export const GetModulePages = () => [
	{
		path: "/",
		name: "Home",
		element: <HomePage />,
		description: <>Landing Page for the application.</>,
	},
];
