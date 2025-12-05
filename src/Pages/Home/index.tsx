import { Box, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { SavePageList } from "@src/Components";
import { pages } from "@src/Pages/const";
import { Link } from "react-router-dom";

function HomePage() {
	return (
		<Box>
			{pages.map((page) => (
				<ListItem disablePadding key={page.path}>
					<ListItemButton title={page.name} component={Link} to={page.path}>
						<ListItemText primary={page.name} secondary={page.description} />
					</ListItemButton>
				</ListItem>
			))}
			<SavePageList />
		</Box>
	);
}
export default HomePage;
