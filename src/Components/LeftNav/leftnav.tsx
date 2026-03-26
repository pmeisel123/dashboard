import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import type { AppDispatch, RootState } from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import { SavePageList } from "@src/Components";
import { pageTestRequires } from "@src/Pages/pageRegistry";
import { pages } from "@src/Pages/pages";
import type { FC } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
	const config = useSelector((state: RootState) => state.configState);
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);
	const handleClick = () => {
		if (!isSmallOrLarger) {
			setLeftNavOpen(false);
		}
	};
	return (
		<Drawer anchor="left" open={open} variant={isSmallOrLarger ? "persistent" : "temporary"} sx={{ width: width }}>
			<Toolbar />
			<List sx={{ width: width }}>
				{pages.map((page) => {
					if (
						"requires" in page &&
						typeof page.requires === "string" &&
						!pageTestRequires(page.requires, config)
					) {
						return;
					}
					return (
						<ListItem disablePadding key={page.path}>
							<ListItemButton
								title={page.name}
								component={Link}
								to={page.path}
								onClick={() => {
									handleClick();
								}}
								selected={location.pathname == page.path}
							>
								<ListItemText primary={page.name} />
							</ListItemButton>
						</ListItem>
					);
				})}
				{config.CUSTOM_NAV_LINKS &&
					Object.keys(config.CUSTOM_NAV_LINKS)
						.sort(
							(a, b) =>
								(config.CUSTOM_NAV_LINKS?.[a]?.sort ?? 0) - (config.CUSTOM_NAV_LINKS?.[b]?.sort ?? 0),
						)
						.map((key) => {
							const linkData = config.CUSTOM_NAV_LINKS?.[key];
							if (!linkData) return null;

							return (
								<ListItem disablePadding key={key}>
									<ListItemButton
										title={key}
										component={Link}
										to={linkData.url}
										onClick={handleClick}
										selected={location.pathname + location.search === linkData.url}
										target={linkData.url.startsWith("http") ? "_blank" : undefined}
									>
										<ListItemText primary={key} />
									</ListItemButton>
								</ListItem>
							);
						})}
			</List>
			<SavePageList width={width} parentHandleClick={handleClick} />
		</Drawer>
	);
};
export default LeftNav;
