import { Box } from "@mui/material";
import type { AppDispatch, RootState } from "@src/Api";
import { fetchConfig, isSliceRecent } from "@src/Api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

function DuckPage() {
	const dispatch = useDispatch<AppDispatch>();
	const config = useSelector((state: RootState) => state.configState);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);
	return (
		<div>
			{config.DUCKS.map((duck) => (
				<Box
					key={duck}
					sx={{
						float: "left",
						textAlign: "center",
					}}
				>
					<img
						style={{
							backgroundColor: "#000",
							display: "block",
							height: "140px",
							margin: 10,
							width: "140px",
						}}
						src={"/ducks/" + duck}
						title={duck}
					/>
					{duck}
				</Box>
			))}
		</div>
	);
}
export default DuckPage;

export const GetModulePages = () => [
	{
		path: "/ducks",
		name: "Ducks",
		element: <DuckPage />,
		description: <>DUCKS! (for fun)</>,
		requires: "false",
	},
];
