import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { SavePageModal } from "@src/Components";
import type { FC } from "react";
import { Link } from "react-router-dom"; // From react-router-dom

interface TopNavBarProps {
	toggleLeftNav: () => void; // Function to open/close Left Nav
	toggleHideTitle: () => void; // Function to hide/show Title on pages
	hideTitle: boolean;
}

const TopNavBar: FC<TopNavBarProps> = ({ toggleLeftNav, toggleHideTitle, hideTitle }) => {
	return (
		<>
			<AppBar
				position="fixed"
				sx={{
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
			>
				<Toolbar>
					<IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleLeftNav}>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Dashboard
					</Typography>
					<SavePageModal />
					<Button
						color="inherit"
						onClick={toggleHideTitle}
						title="Hide/Show the Page Titles and Description on every page"
					>
						{hideTitle ? "Show" : "Hide"} Page Titles
					</Button>
					<Button color="inherit" component={Link} to="/">
						Home
					</Button>
				</Toolbar>
			</AppBar>
			<Toolbar />
		</>
	);
};
export default TopNavBar;
