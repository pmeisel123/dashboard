import {
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Toolbar,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { SavePageList } from "@src/Components";
import { pages } from "@src/Pages/const";
import type { FC } from "react";
import { Link, useLocation } from "react-router-dom";

interface LeftNavProps {
	open: boolean;
	setLeftNavOpen: Function;
	width: number;
}

const LeftNav: FC<LeftNavProps> = ({ open, setLeftNavOpen, width }) => {
	const location = useLocation();
	const theme = useTheme();
	const isSmallOrLarger = useMediaQuery(theme.breakpoints.up("sm"));
	const handleClick = () => {
		if (!isSmallOrLarger) {
			setLeftNavOpen(false);
		}
	};
	return (
		<Drawer
			anchor="left"
			open={open}
			variant={isSmallOrLarger ? "persistent" : "temporary"}
			sx={{ width: width }}
		>
			<Toolbar />
			<List sx={{ width: width }}>
				{pages.map((page) => (
					<ListItem
						disablePadding
						key={page.path}
					>
						<ListItemButton
							title={page.name}
							component={Link}
							to={page.path}
							onClick={() => {
								handleClick();
							}}
							selected={
								location.pathname ==
								page.path
							}
						>
							<ListItemText
								primary={
									page.name
								}
							/>
						</ListItemButton>
					</ListItem>
				))}
			</List>
			<SavePageList
				width={width}
				parentHandleClick={handleClick}
			/>
		</Drawer>
	);
};
export default LeftNav;
