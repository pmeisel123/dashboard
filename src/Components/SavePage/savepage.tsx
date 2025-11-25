import {useEffect, useState} from 'react';
import {Box, Button, InputLabel, TextField, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import MuiLink from '@mui/material/Link';
import { useNavigate } from "react-router-dom";
import Delete from '@mui/icons-material/Delete';

// Define the style for the modal content
const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

// Define the types for the component's props (if any)
interface BasicModalProps {
	name?: string
}

export const SavePageModal = (props: BasicModalProps) => {
	const [open, setOpen] = useState<boolean>(false);
	const handleClose = () => setOpen(false);
	const [name, setName] = useState<string>(props.name || '');
	const url = window.location.href.replace(/http.?:\/\/[^\/]+/, '');
	const handleOpen = () => {
		setOpen(true);
		setName('');
	};
	const save = () => {
		let savedViewJson = window.localStorage.getItem('saveViews');
		let savedViews: {[key: string]: string} = {};
		if (savedViewJson) {
			savedViews = JSON.parse(savedViewJson); 
		}
		if (!name) {
			return;
		}
		savedViews[name] = url;
		window.localStorage.setItem('saveViews', JSON.stringify(savedViews));
		window.dispatchEvent(new Event('storage'));
		setOpen(false);
	};

	return (
		<div>
			<Button color="inherit" onClick={handleOpen}  title="Give the current page, with parameters, a name and add it to the left side nav">Save Page</Button>
			<Modal
				open={open}
				onClose={handleClose}
			>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2">
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
					<Button onClick={save} disabled={!name}>Save</Button>
					<Button onClick={handleClose}>Close</Button>
				</Box>
			</Modal>
		</div>
	);
}

export const SavePageList: React.FC<{width:number}> = ({  width }) => {
	const navigate = useNavigate();
	const handleClick = (url: string) => {
		navigate(url, { replace: true });
	};
	const [savedViews, setSaveViews] = useState<{[key: string]: string}>({});
	useEffect(() => {
		const checkSavedViews = () => {
			const savedViewJson = window.localStorage.getItem('saveViews');
			if (savedViewJson) {
				setSaveViews(JSON.parse(savedViewJson));
			} else {
				setSaveViews({});
			}
		};
		checkSavedViews();
		window.addEventListener('storage', checkSavedViews)
		return () => {
			window.removeEventListener('storage', checkSavedViews)
		}
	}, []);

	const deleteSave = (name: string) => {
		let savedViewJson = window.localStorage.getItem('saveViews');
		let savedViews: {[key: string]: string} = {};
		if (!savedViewJson || !name) {
			return;
		}
		savedViews = JSON.parse(savedViewJson);
		if (!savedViews[name]) {
			return;
		}
		delete savedViews[name];
		window.localStorage.setItem('saveViews', JSON.stringify(savedViews));
		window.dispatchEvent(new Event('storage'));
	};
	if (!Object.keys(savedViews).length) {
		return;
	}
	return (
		<>
			<Box sx={{padding: 1}}>Saved Views:</Box>
			<List sx={{width: width}}>
				{Object.keys(savedViews).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase())).map((name: string) => {
					let url = savedViews[name];
					return (
						<ListItem disablePadding key={name + ' ' + url}   onClick={() => handleClick(url)} >
							<ListItemButton title={name} component={MuiLink} sx={{width: width - 10, paddingRight: 0}}>
								<ListItemText>
									<Box  sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} >
										{name}
									</Box>
								</ListItemText>
							</ListItemButton>
							<ListItemButton title={'Delete'} component={MuiLink}  sx={{minWidth: 24, padding: '10px 4px'}}  onClick={() => deleteSave(name)}>
								<ListItemIcon sx={{minWidth: 24}} ><Delete /></ListItemIcon>
							</ListItemButton>
						</ListItem>
					)
				})}
			</List>
		</>
	)
};