import {Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar}	from '@mui/material';
import { Link } from 'react-router-dom'; // From react-router-dom
import {SavePageList} from '@src/Components';
import { pages } from '@src/Pages/const';

interface LeftNavProps {
	open: boolean;
	width: number;
}

const LeftNav: React.FC<LeftNavProps> = ({ open, width }) => {
	return (
		<Drawer
			anchor="left"
			open={open}
			variant="persistent"
			sx={{width: width}}
		>
			<Toolbar />
			
			<List sx={{width: width}}>
				{
					pages.map((page) => (
						<ListItem disablePadding key={page.path} >
							<ListItemButton title={page.name} component={Link} to={page.path}>
								<ListItemText primary={page.name} />
							</ListItemButton>
						</ListItem>
					))
				}
			</List>
			<SavePageList width={width} />
		</Drawer>
	);
};
export default LeftNav;