import { Add, Delete, Info } from "@mui/icons-material";
import { Checkbox, Grid, IconButton, MenuItem, Select, TextField } from "@mui/material";
import type { AnnouncementsType, DashboardProps } from "@src/Api/Types";
import { HtmlTooltip } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";
import { Link } from "react-router-dom";

export const EditAnnouncementTab: FC<{
	dashboards: { [key: string]: DashboardProps };
	announcements: AnnouncementsType[];
	setAnnouncements: Dispatch<SetStateAction<AnnouncementsType[]>>;
}> = ({ dashboards, announcements, setAnnouncements }) => {
	const handleAnnouncementChange = (index: number, field: keyof AnnouncementsType, value: string | boolean) => {
		const updated = announcements.map((item, i) => {
			if (i !== index) return item;
			return {
				...item,
				[field]: value,
			};
		});
		setAnnouncements(updated);
	};
	const handleAddAnnouncement = () => {
		setAnnouncements([...announcements, { url: "", dashboard: "", screen_regex: "", override: false }]);
	};
	const handleRemoveAnnouncement = (index: number) => {
		const newAnnouncements = [...announcements];
		newAnnouncements.splice(index, 1);
		setAnnouncements(newAnnouncements);
	};
	return (
		<>
			<IconButton edge="end" aria-label="delete" onClick={() => handleAddAnnouncement()}>
				<Add titleAccess="Add" />
			</IconButton>
			<Grid container spacing={2}>
				<Grid size={{ xs: 1 }}>Delete</Grid>
				<Grid size={{ xs: 4 }}>
					URL
					<HtmlTooltip
						title={
							<>
								Use <Link to="/Text">Text</Link> to generate a url to display text
							</>
						}
						disableInteractive={false}
						arrow
						placement="right"
					>
						<Info style={{ cursor: "pointer" }} color="action" />
					</HtmlTooltip>
				</Grid>
				<Grid size={{ xs: 3 }}>Dashboards</Grid>
				<Grid size={{ xs: 3 }}>Device Regex</Grid>
				<Grid size={{ xs: 1 }}>Override</Grid>
			</Grid>
			{announcements.map((announcement, index) => (
				<Grid container spacing={2} key={index}>
					<Grid size={{ xs: 1 }}>
						<IconButton edge="end" aria-label="delete" onClick={() => handleRemoveAnnouncement(index)}>
							<Delete titleAccess="Delete" />
						</IconButton>
					</Grid>
					<Grid size={{ xs: 4 }}>
						<TextField
							value={announcement.url}
							onChange={(event) => {
								handleAnnouncementChange(index, "url", event.target.value);
							}}
							fullWidth
						/>
					</Grid>
					<Grid size={{ xs: 3 }}>
						<Select
							value={announcement.dashboard || ""}
							onChange={(event) => {
								handleAnnouncementChange(index, "dashboard", event.target.value);
							}}
							displayEmpty
							fullWidth
						>
							<MenuItem value="">All</MenuItem>
							{Object.keys(dashboards).map((key) => (
								<MenuItem key={key} value={key}>
									{dashboards[key].name}
								</MenuItem>
							))}
						</Select>
					</Grid>
					<Grid size={{ xs: 3 }}>
						<TextField
							value={announcement.screen_regex}
							onChange={(event) => {
								handleAnnouncementChange(index, "screen_regex", event.target.value);
							}}
							fullWidth
						/>
					</Grid>
					<Grid size={{ xs: 1 }}>
						<Checkbox
							checked={announcement.override}
							onChange={(event) => {
								handleAnnouncementChange(index, "override", event.target.checked);
							}}
						/>
					</Grid>
				</Grid>
			))}
		</>
	);
};
