import { Box } from "@mui/material";
declare const __DUCKS__: string[];
function DuckPage() {
	return (
		<>
			{__DUCKS__.map((duck) => (
				<Box key={duck} sx={{ float: "left" }}>
					<img
						style={{
							height: "140px",
							width: "140px",
							backgroundColor: "#000",
							margin: 10,
						}}
						src={
							"/src/assets/ducks/" +
							duck
						}
					/>
					<br />
					{duck}
				</Box>
			))}
		</>
	);
}
export default DuckPage;
