import type { AppDispatch, ChannelProp, RootState, RoutePageProps } from "@src/Api";
import { fetchConfig, getChannelsApi, isSliceRecent } from "@src/Api";
import { CustomDataGrid } from "@src/Components";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const SlackChannel: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride || undefined);
	const [instance, setInstance] = useState<string>(
		searchParams.get("instance") || window.localStorage.getItem("instance") || "",
	);
	const [channel, setChannel] = useState<{ [key: string]: ChannelProp }>({});
	const config = useSelector((state: RootState) => state.configState);
	const dispatch = useDispatch<AppDispatch>();
	const loadParams = () => {
		let localInstance = searchParams.get("instance") || window.localStorage.getItem("instance") || "";
		if (!localInstance && config && config.SLACK_TOKEN_KEYS && config.SLACK_TOKEN_KEYS.length == 1) {
			localInstance = config.SLACK_TOKEN_KEYS[0];
		}
		setInstance(localInstance);
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);
	useEffect(() => {
		if (instance && config && config.SLACK_TOKEN_KEYS && config.SLACK_TOKEN_KEYS.includes(instance)) {
			console.log("here");
			console.log(instance);
			const fetchData = async () => {
				const data = await getChannelsApi(instance);
				console.log("Fetched channels: ", Object.values(data));
				setChannel(data);
			};
			fetchData();
		}
	}, [instance, config]);
	return (
		<>
			{Object.values(channel).length}
			<CustomDataGrid
				title="Slack Channels"
				rows={Object.values(channel)}
				columns={[
					{ field: "name", headerName: "Name", width: 200 },
					{ field: "num_members", headerName: "Members", width: 100 },
					{ field: "description", headerName: "Description", width: 300 },
					{ field: "topic", headerName: "Topic", width: 300 },
				]}
			/>
		</>
	);
};

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/SlackChannel/",
		name: "Slack Channel",
		element: <SlackChannel />,
		description: <>List Slack Channels</>,
		//		requires: "APIURL",
	},
];
