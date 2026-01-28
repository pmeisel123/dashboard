import { Box, Checkbox, FormControlLabel, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import type { AppDispatch, RootState, RoutePageProps } from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import { SavePageList } from "@src/Components";
import { pageTestRequires } from "@src/Pages/pageRegistry";
import { pages } from "@src/Pages/pages";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

const HomePageItem = (page: RoutePageProps) => {
	return (
		<ListItem disablePadding key={page.path}>
			<ListItemButton
				component="div"
				sx={{ position: "relative", p: 0 }} // Ensure relative for absolute link
			>
				{/* LINK: Handles status bar & navigation for everything except zIndex: 2 */}
				<Link
					to={page.path}
					style={{
						position: "absolute",
						inset: 0,
						zIndex: 1,
					}}
					aria-label={page.name}
				/>

				<ListItemText
					sx={{ px: 2, py: 1 }}
					primary={
						<Typography variant="body1" sx={{ fontWeight: "bold", position: "relative", zIndex: 0 }}>
							{page.name}
						</Typography>
					}
					secondary={
						<Box
							component="span"
							sx={{
								display: "block",
								mt: 0.5,
								position: "relative",
								zIndex: 2, // Sits ABOVE the link overlay to be clickable
								pointerEvents: "none",
								/* Re-enable clicks ONLY for anchors inside the description */
								"& a": {
									pointerEvents: "auto",
								},
							}}
						>
							{page.description}
						</Box>
					}
				/>
			</ListItemButton>
		</ListItem>
	);
};

const HomePage = () => {
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
				return <HomePageItem key={page.path} {...page} />;
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
							return <HomePageItem key={page.path} {...page} />;
						}
					})}
				</>
			)}
			<SavePageList />
		</Box>
	);
};

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/",
		name: "Home",
		element: <HomePage />,
		description: <>Landing Page for the application.</>,
	},
];
