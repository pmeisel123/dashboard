import { Box } from "@mui/material";
declare const __DUCKS__: string[];
function DuckPage() {
	return (
		<div>
			{__DUCKS__.map((duck) => (
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
