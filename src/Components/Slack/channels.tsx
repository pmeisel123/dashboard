import { Link } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import type { ChannelProp } from "@src/Api";
import { CustomDataGrid } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";

export const SlackChannels: FC<{
	channels: { [key: string]: ChannelProp };
	setChannel: Dispatch<SetStateAction<string>>;
}> = ({ channels, setChannel }) => {
	return (
		<>
			<CustomDataGrid
				rows={Object.values(channels)}
				localStorageName="SlackChannels"
				columns={[
					{
						field: "name",
						headerName: "Name",
						width: 200,
						renderCell: (params: GridRenderCellParams<ChannelProp>) => {
							if (params.value) {
								return (
									<>
										<Link
											href="#"
											onClick={(e) => {
												console.log("Clicked channel: ", params.value);
												e.preventDefault();
												setChannel(params.value);
											}}
										>
											{params.value}
										</Link>
									</>
								);
							} else {
								return null;
							}
						},
					},
					{ field: "num_members", headerName: "Members", width: 100 },
					{ field: "description", headerName: "Description", width: 300 },
					{ field: "topic", headerName: "Topic", width: 300 },
				]}
			/>
		</>
	);
};
