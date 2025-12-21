import { Box, Checkbox, FormControlLabel, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { SavePageList } from "@src/Components";
import { pages } from "@src/Pages/pages";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function HomePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [showHidden, setShowHidden] = useState<boolean>(searchParams.get("showHidden") == "true");

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
				if ("requires" in page && !page.requires) {
					return;
				}
				return (
					<ListItem disablePadding key={page.path}>
						<ListItemButton title={page.name} component={Link} to={page.path}>
							<ListItemText primary={page.name} secondary={page.description} />
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
						if ("requires" in page && !page.requires) {
							return (
								<ListItem disablePadding key={page.path} sx={{ backgroundColor: "#DDD" }}>
									<ListItemButton title={page.name} component={Link} to={page.path}>
										<ListItemText primary={page.name} secondary={page.description} />
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
