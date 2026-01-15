import { Add, Delete, SubdirectoryArrowRight } from "@mui/icons-material";
import { Box, Grid, IconButton, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import type {
	DashboardPageProps,
	DashboardPageSplitFourWaysProps,
	DashboardPageSplitSidewaysProps,
	DashboardPageSplitUpDownProps,
	DashboardSinglePageProps,
	fourPages,
	twoPages,
} from "@src/Api/Types";
import type { FC } from "react";

export const EditPages: FC<{
	pages: DashboardPageProps[];
	setPages: (pages: DashboardPageProps[]) => void;
	subPage: boolean;
}> = ({ pages, setPages, subPage }) => {
	const addPage = () => {
		const newItems = [...pages];
		newItems.push({
			name: "",
			url: "",
		});
		setPages(newItems);
	};
	const deletePage = (index: number) => {
		const newItems = [...pages];
		newItems.splice(index, 1);
		setPages(newItems);
	};
	const updateName = (index: number, newValue: string) => {
		const newItems = [...pages];
		newItems[index] = {
			...newItems[index],
			name: newValue,
		};
		setPages(newItems);
	};

	const updateUrl = (index: number, newValue: string) => {
		const newItems = [...pages];
		const targetPage = newItems[index];
		if ("url" in targetPage) {
			newItems[index] = { ...targetPage, url: newValue };
		}
		setPages(newItems);
	};

	const updateSubPages = (index: number) => {
		return (newSubPages: DashboardPageProps[]) => {
			const newItems = [...pages];
			const targetPage = newItems[index];

			if (targetPage && "pages" in targetPage) {
				if (targetPage.split === "fourways") {
					newItems[index] = {
						...targetPage,
						pages: newSubPages as fourPages,
					};
				} else {
					newItems[index] = {
						...targetPage,
						pages: newSubPages as twoPages,
					};
				}
			}

			setPages(newItems);
		};
	};
	const updateSplit = (index: number, newValue: "single" | "sideways" | "updown" | "fourways") => {
		const newItems = [...pages];
		const oldPage = pages[index];
		let oldValue = "single";
		if ("split" in oldPage) {
			oldValue = oldPage.split;
		}
		if (oldValue == newValue) {
			return;
		}
		if (newValue == "single" && "split" in oldPage) {
			const baseSplit: DashboardSinglePageProps = {
				name: oldPage.name,
				url: "",
			};
			if ("pages" in oldPage) {
				baseSplit.url = oldPage.pages[0].url;
			}
			newItems[index] = baseSplit;
		}
		if (newValue == "sideways" || newValue == "updown") {
			const baseSplit: DashboardPageSplitSidewaysProps | DashboardPageSplitUpDownProps = {
				name: oldPage.name,
				split: newValue,
				pages: [
					{ name: "", url: "" },
					{ name: "", url: "" },
				],
			};
			if ("url" in oldPage) {
				baseSplit.pages[0].url = oldPage.url;
			} else {
				baseSplit.pages[0] = oldPage.pages[0];
				if (oldPage.pages[1]) baseSplit.pages[1] = oldPage.pages[1];
			}
			newItems[index] = baseSplit;
		}
		if (newValue == "fourways") {
			const baseSplit: DashboardPageSplitFourWaysProps = {
				name: oldPage.name,
				split: newValue,
				pages: [
					{ name: "", url: "" },
					{ name: "", url: "" },
					{ name: "", url: "" },
					{ name: "", url: "" },
				],
			};
			if ("url" in oldPage) {
				baseSplit.pages[0].url = oldPage.url;
			} else {
				baseSplit.pages[0] = oldPage.pages[0];
				if (oldPage.pages[1]) baseSplit.pages[1] = oldPage.pages[1];
			}
			newItems[index] = baseSplit;
		}
		setPages(newItems);
	};
	return (
		<Box sx={{ marginLeft: subPage ? "50px" : "30px" }}>
			<InputLabel id="pages">
				{!subPage && (
					<>
						Pages
						<IconButton edge="end" aria-label="delete" onClick={() => addPage()}>
							<Add titleAccess="Add" />
						</IconButton>
					</>
				)}
			</InputLabel>
			{pages.map((page, index) => {
				let pagetype: "single" | "sideways" | "updown" | "fourways" = "single";
				if ("split" in page) {
					pagetype = page.split;
				}
				return (
					<Box key={index}>
						<Grid container spacing={2} sx={{ width: "100%", marginBottom: "10px" }}>
							<Grid sx={{ width: "30px", paddingTop: "7px", display: { xs: "none", md: "block" } }}>
								{subPage && <SubdirectoryArrowRight />}
								{!subPage && (
									<IconButton aria-label="delete" onClick={() => deletePage(index)}>
										<Delete titleAccess="Delete" />
									</IconButton>
								)}
							</Grid>
							<Grid size={{ xs: 12, md: 4 }} sx={{ backgroundColor: subPage ? "#EEF" : "" }}>
								<TextField
									label="Name"
									value={page.name}
									onChange={(event) => {
										updateName(index, event.target.value);
									}}
									fullWidth
								/>
							</Grid>
							{!subPage && (
								<Grid size={{ xs: 12, md: 2 }}>
									<Select
										label="Type"
										value={pagetype}
										onChange={(event) => {
											updateSplit(index, event.target.value);
										}}
										sx={{ width: "100%" }}
									>
										<MenuItem value="single">Single Page</MenuItem>
										<MenuItem value="sideways">Split Left And Right</MenuItem>
										<MenuItem value="updown">Split Up And Down</MenuItem>
										<MenuItem value="fourways">Split Four Ways</MenuItem>
									</Select>
								</Grid>
							)}
							{"url" in page && (
								<Grid size={{ xs: 12, md: 4 }} sx={{ backgroundColor: subPage ? "#EEF" : "" }}>
									<TextField
										label="URL"
										value={page.url}
										onChange={(event) => {
											updateUrl(index, event.target.value);
										}}
										fullWidth
									/>
								</Grid>
							)}
						</Grid>
						{"pages" in page && (
							<EditPages pages={page.pages} setPages={updateSubPages(index)} subPage={true} />
						)}
					</Box>
				);
			})}
		</Box>
	);
};
