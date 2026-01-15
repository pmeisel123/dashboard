import { Box, Button } from "@mui/material";
import type { AppDispatch, RootState } from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import type { Dispatch, FC, ReactNode, SetStateAction } from "react";
import { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { isExternalLink } from "./const";

const ExternalLink: FC<{ to: string; children: ReactNode }> = ({ to, children, ...props }) => {
	if (isExternalLink(to)) {
		return (
			<a href={to} target="_blank" rel="noopener noreferrer" {...props}>
				{children}
			</a>
		);
	}
	return (
		<Link to={to} {...props}>
			{children}
		</Link>
	);
};
const ListDashboard: FC<{
	setDashboard: Dispatch<SetStateAction<string>>;
}> = ({ setDashboard }) => {
	const dispatch = useDispatch<AppDispatch>();
	const config = useSelector((state: RootState) => state.configState);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);
	if (Object.keys(config.DASHBOARDS).length == 0) {
		return (
			<>
				Need to configure a dashboard in <Link to="/EditConfig">Edit Config</Link>
			</>
		);
	}
	return (
		<>
			{Object.keys(config.DASHBOARDS).map((key) => (
				<Fragment key={key}>
					<div>
						<Button
							sx={{
								textDecoration: "underline",
								"&:hover": {
									textDecoration: "underline",
								},
							}}
							onClick={() => {
								setDashboard(config.DASHBOARDS[key].key);
							}}
						>
							{config.DASHBOARDS[key].name}
						</Button>
					</div>
					<Box>
						{config.DASHBOARDS[key].pages.map((page, index) => (
							<Box
								sx={{
									paddingLeft: 5,
								}}
								key={index + page.name}
							>
								{"url" in page && <ExternalLink to={page.url}>{page.name}</ExternalLink>}
								{page && "split" in page && (
									<>
										{page.name}:
										{page.pages.map((subpage, subindex) => (
											<Box
												sx={{
													paddingLeft: 5,
												}}
												key={index + " " + subindex + subpage.name}
											>
												<ExternalLink to={subpage.url}>{subpage.name}</ExternalLink>
											</Box>
										))}
									</>
								)}
							</Box>
						))}
					</Box>
				</Fragment>
			))}
		</>
	);
};

export default ListDashboard;
