import { useEffect, useState } from "react";
import {
	Box,
	Button,
	InputLabel,
	TextField,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemIcon,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import MuiLink from "@mui/material/Link";
import { Link, useLocation } from "react-router-dom";
import Delete from "@mui/icons-material/Delete";
import type { FC } from "react";

// Define the style for the modal content
const style = {
	position: "absolute" as "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: 4,
};

// Define the types for the component's props (if any)
interface BasicModalProps {
	name?: string;
}

export const SavePageModal = (props: BasicModalProps) => {
	const location = useLocation();
	const [open, setOpen] = useState<boolean>(false);
	const handleClose = () => setOpen(false);
	const [name, setName] = useState<string>(props.name || "");
	const url = location.pathname + location.search;
	const handleOpen = () => {
		setOpen(true);
		setName("");
	};
	const save = () => {
		let savedViewJson = window.localStorage.getItem("saveViews");
		let savedViews: { [key: string]: string } = {};
		if (savedViewJson) {
			savedViews = JSON.parse(savedViewJson);
		}
		if (!name) {
			return;
		}
		savedViews[name] = url;
		window.localStorage.setItem("saveViews", JSON.stringify(savedViews));
		window.dispatchEvent(new Event("storage"));
		setOpen(false);
	};

	return (
		<div>
			<Button
				color="inherit"
				onClick={handleOpen}
				title="Give the current page, with parameters, a name and add it to the left side nav"
			>
				Save Page
			</Button>
			<Modal open={open} onClose={handleClose}>
				<Box sx={style}>
					<Typography
						id="modal-modal-title"
						variant="h6"
						component="h2"
					>
						Save Current Page
					</Typography>
					<InputLabel id="name">Name Of Page</InputLabel>
					<TextField
						id="name"
						value={name}
						onChange={(event) => {
							setName(event.target.value);
						}}
					/>
					<Button onClick={save} disabled={!name}>
						Save
					</Button>
					<Button onClick={handleClose}>Close</Button>
				</Box>
			</Modal>
		</div>
	);
};

export const SavePageList: FC<{
	width?: number;
	parentHandleClick?: Function;
}> = ({ width, parentHandleClick }) => {
	const [savedViews, setSaveViews] = useState<{ [key: string]: string }>({});
	const handleClick = () => {
		if (parentHandleClick) {
			parentHandleClick();
		}
	};
	const location = useLocation();

	useEffect(() => {
		const checkSavedViews = () => {
			const savedViewJson = window.localStorage.getItem("saveViews");
			if (savedViewJson) {
				setSaveViews(JSON.parse(savedViewJson));
			} else {
				setSaveViews({});
			}
		};
		checkSavedViews();
		window.addEventListener("storage", checkSavedViews);
		return () => {
			window.removeEventListener("storage", checkSavedViews);
		};
	}, []);

	const deleteSave = (name: string) => {
		let savedViewJson = window.localStorage.getItem("saveViews");
		let savedViews: { [key: string]: string } = {};
		if (!savedViewJson || !name) {
			return;
		}
		savedViews = JSON.parse(savedViewJson);
		if (!savedViews[name]) {
			return;
		}
		delete savedViews[name];
		window.localStorage.setItem("saveViews", JSON.stringify(savedViews));
		window.dispatchEvent(new Event("storage"));
	};
	if (!Object.keys(savedViews).length) {
		return;
	}
	let new_width: number | string;
	if (!width) {
		new_width = "calc(100% - 30px)";
	} else {
		new_width = width - 52;
	}
	return (
		<>
			<Box sx={{ padding: 1 }}>Saved Views:</Box>
			<List sx={{ width: width }}>
				{Object.keys(savedViews)
					.sort((a, b) =>
						a.toLowerCase().localeCompare(b.toLowerCase()),
					)
					.map((name: string) => {
						let url = savedViews[name];
						return (
							<ListItem
								disablePadding
								key={name + " " + url}
								sx={{ width: width, maxWidth: 532 }}
							>
								<ListItemButton
									title={name}
									component={Link}
									to={url}
									onClick={() => handleClick()}
									sx={{
										width: new_width,
										maxWidth: 500,
										paddingRight: 0,
									}}
									selected={
										location.pathname + location.search ==
										url
									}
								>
									<ListItemText>
										<Box
											sx={{
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{name}
										</Box>
									</ListItemText>
								</ListItemButton>
								<ListItemButton
									title={"Delete"}
									component={MuiLink}
									sx={{ width: 20, padding: "12px 4px" }}
									onClick={() => deleteSave(name)}
									selected={
										location.pathname + location.search ==
										url
									}
								>
									<ListItemIcon
										sx={{
											minWidth: 0,
											width: 24,
											padding: 0,
										}}
									>
										<Delete />
									</ListItemIcon>
								</ListItemButton>
							</ListItem>
						);
					})}
			</List>
		</>
	);
};
