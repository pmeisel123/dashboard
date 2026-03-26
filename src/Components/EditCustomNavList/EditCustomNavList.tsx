import { Add, Delete } from "@mui/icons-material";
import { Grid, IconButton, TextField, Tooltip } from "@mui/material";
import type { CustomNavLinks } from "@src/Api/Types";
import type { Dispatch, FC, SetStateAction } from "react";
import { useEffect, useState } from "react";

export interface EditCustomNavLinks extends CustomNavLinks {
	key: string;
}

export const EditCustomNavList: FC<{
	links: { [key: string]: CustomNavLinks };
	setLinks: Dispatch<SetStateAction<{ [key: string]: CustomNavLinks }>>;
}> = ({ links, setLinks }) => {
	const [editLinks, setEditLinks] = useState<EditCustomNavLinks[]>([]);
	useEffect(() => {
		if (links == null) {
			setEditLinks([]);
		} else {
			const newEditLinks = Object.keys(links)
				.sort((a, b) => links[a].sort - links[b].sort)
				.map((key) => ({
					key: key,
					url: links[key].url,
					sort: links[key].sort,
				}));
			setEditLinks(newEditLinks);
		}
	}, [links]);
	const handleEditLink = (index: number, key: string, url: string, sort: number) => {
		const newEditLinks = [...editLinks];
		newEditLinks[index] = {
			key: key,
			url: url,
			sort: sort,
		};
		console.log(newEditLinks);
		setEditLinks(newEditLinks);
	};
	const handleDeleteLink = (index: number) => {
		const newEditLinks = [...editLinks];
		newEditLinks.splice(index, 1);
		setEditLinks(newEditLinks);
		updateLinks();
	};
	const handleAddLink = () => {
		const newEditLinks = [...editLinks];
		newEditLinks.push({
			key: "",
			url: "",
			sort: 0,
		});
		setEditLinks(newEditLinks);
	};
	const updateLinks = () => {
		if (editLinks.some(validateLink)) {
			return;
		}
		const newLinks: { [key: string]: CustomNavLinks } = {};
		editLinks.forEach((link) => {
			if (link.key) {
				newLinks[link.key] = {
					url: link.url,
					sort: link.sort,
				};
			}
		});
		setLinks(newLinks);
	};
	const validateKey = (link: EditCustomNavLinks) => {
		if (!link.key || link.key.trim() === "") {
			return "Link Name cannot be empty";
		}
		if (editLinks.filter((otherLink) => otherLink !== link && otherLink.key === link.key).length > 0) {
			return "Link Name must be unique";
		}
		return "";
	};
	const validateUrl = (link: EditCustomNavLinks) => {
		if (!link.url || link.url.trim() === "") {
			return "Link URL cannot be empty";
		}
		if (!/^https?:\/\//.test(link.url) && !/^\/(?!\/)/.test(link.url)) {
			return "Link URL must start with http://, https://, or /";
		}
		return "";
	};
	const validateSort = (link: EditCustomNavLinks) => {
		if (isNaN(link.sort) || link.sort <= 0) {
			return "Link Sort must be a number greater than 0";
		}
		return "";
	};
	const validateLink = (link: EditCustomNavLinks) => {
		const keyError = validateKey(link);
		if (keyError) {
			return keyError;
		}
		const urlError = validateUrl(link);
		if (urlError) {
			return urlError;
		}
		const sortError = validateSort(link);
		if (sortError) {
			return sortError;
		}
		return "";
	};

	return (
		<div>
			{editLinks.map((link, index) => (
				<Grid container spacing={2} sx={{ width: "100%", paddingTop: "10px" }} key={index}>
					<Grid size={{ xs: 12, md: 4 }}>
						<TextField
							label="Name"
							value={link.key}
							onChange={(event) => handleEditLink(index, event.target.value, link.url, link.sort)}
							onBlur={updateLinks}
							fullWidth
							error={validateKey(link) !== ""}
							helperText={validateKey(link) || " "}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<TextField
							label="URL"
							value={link.url}
							onChange={(event) => handleEditLink(index, link.key, event.target.value, link.sort)}
							onBlur={updateLinks}
							error={validateUrl(link) !== ""}
							fullWidth
							helperText={validateUrl(link) || " "}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 2 }}>
						<TextField
							label="Sort"
							type="number"
							value={link.sort}
							onChange={(event) =>
								handleEditLink(index, link.key, link.url, parseInt(event.target.value))
							}
							onBlur={updateLinks}
							error={validateSort(link) !== ""}
							fullWidth
							helperText={validateSort(link) || " "}
						/>
					</Grid>
					<Grid size={{ xs: 2 }}>
						<IconButton aria-label="delete" onClick={() => handleDeleteLink(index)}>
							<Delete titleAccess="Delete" />
						</IconButton>
					</Grid>
				</Grid>
			))}
			<Tooltip
				title={editLinks.some(validateLink) ? "Please fix validation errors before adding a new link" : ""}
				arrow
			>
				<span>
					<IconButton
						edge="end"
						aria-label="add"
						onClick={() => handleAddLink()}
						disabled={editLinks.some(validateLink)}
					>
						<Add titleAccess="Add" />
					</IconButton>
				</span>
			</Tooltip>
		</div>
	);
};
