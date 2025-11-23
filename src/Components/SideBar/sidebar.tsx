import {Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar}	from '@mui/material';
import { Link } from 'react-router-dom'; // From react-router-dom
import {SavePageList} from '@src/Components/SavePage';

interface SidebarProps {
	open: boolean;
	width: number;
}

const SideBar: React.FC<SidebarProps> = ({ open, width }) => {
	return (
		<Drawer
			anchor="left"
			open={open}
			variant="persistent"
			sx={{width: width}}
		>
			<Toolbar />
			<List sx={{width: width}}>
				<ListItem disablePadding>
					<ListItemButton component={Link} to="/">
						<ListItemText primary="Home" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component={Link} to="/Estimator">
						<ListItemText primary="Estimator" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component={Link} to="/MyTickets">
						<ListItemText primary="My Tickets" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component={Link} to="/holidays">
						<ListItemText primary="Holidays" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component={Link} to="/whoisout">
						<ListItemText primary="Who Is Out" />
					</ListItemButton>
				</ListItem>
			</List>
			<SavePageList />
		</Drawer>
	);
};
export default SideBar;