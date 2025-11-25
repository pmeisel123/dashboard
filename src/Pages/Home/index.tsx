import {SavePageList} from '@src/Components';
import { pages } from '@src/Pages/const';
import {Box, ListItem, ListItemButton, ListItemText } from '@mui/material';
import MuiLink from '@mui/material/Link';

function HomePage() {
	return (
		<Box>
			{
				pages.map((page) => (
					<ListItem disablePadding key={page.path} >
						<ListItemButton title={page.name} component={MuiLink} href={page.path}>
							<ListItemText primary={page.name} secondary={page.description} />
						</ListItemButton>
					</ListItem>
				))
			}
			<SavePageList width={500} />
		</Box>
	)
}
export default HomePage;
