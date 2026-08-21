import { Link, ListItemText, MenuItem, Select } from "@mui/material";
import type {
	AppDispatch,
	ChannelProp,
	MessageProp,
	RootState,
	RoutePageProps,
	SlackEmojisProp,
	SlackUserProp,
} from "@src/Api";
import { fetchConfig, getChannelApi, getChannelsApi, getEmojisApi, getSlackUsersApi, isSliceRecent } from "@src/Api";
import { SlackChannel, SlackChannels } from "@src/Components";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useSearchParams } from "react-router-dom";

const Slack: FC<{
	searchParamsOveride?: URLSearchParams;
}> = ({ searchParamsOveride }) => {
	const { isDashboard } = useOutletContext<{ isDashboard?: boolean }>();
	const [searchParams, setSearchParams] = useSearchParams(searchParamsOveride || undefined);
	const [instance, setInstance] = useState<string>(searchParams.get("instance") || "");
	const [channels, setChannels] = useState<{ [key: string]: ChannelProp }>({});
	const [channel, setChannel] = useState<string>(searchParams.get("channel") || "");
	const [users, setUsers] = useState<{ [key: string]: SlackUserProp }>({});
	const [emojis, setEmojis] = useState<SlackEmojisProp>({});
	const [messages, setMessages] = useState<MessageProp[]>([]);
	const [lastUpdated, setLastUpdated] = useState(Date.now());
	const config = useSelector((state: RootState) => state.configState);
	const dispatch = useDispatch<AppDispatch>();
	const loadParams = () => {
		let localInstance = searchParams.get("instance") || "";
		if (!localInstance && config && config.SLACK_TOKEN_KEYS && config.SLACK_TOKEN_KEYS.length == 1) {
			localInstance = config.SLACK_TOKEN_KEYS[0];
		}
		setChannel(searchParams.get("channel") || "");
		setInstance(localInstance);
	};

	useEffect(() => {
		loadParams();
	}, [searchParams]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (instance) {
			newSearchParams.set("instance", instance);
		} else {
			newSearchParams.delete("instance");
		}
		if (channel) {
			newSearchParams.set("channel", channel);
		} else {
			newSearchParams.delete("channel");
		}
		setSearchParams(newSearchParams);
	}, [instance, channel]);
	useEffect(() => {
		if (!isSliceRecent(config)) {
			dispatch(fetchConfig());
		}
	}, [dispatch]);
	useEffect(() => {
		if (instance && config && config.SLACK_TOKEN_KEYS && config.SLACK_TOKEN_KEYS.includes(instance)) {
			const fetchData = async () => {
				const data = await getChannelsApi(instance);
				setChannels(data);
			};
			fetchData();
			const fetchEmojis = async () => {
				const data = await getEmojisApi(instance);
				setEmojis(data);
			};
			fetchEmojis();
			const fetchUsers = async () => {
				const data = await getSlackUsersApi(instance);
				setUsers(data);
			};
			fetchUsers();
		}
	}, [instance, config]);
	useEffect(() => {
		setMessages([]);
		if (instance && channel && config && config.SLACK_TOKEN_KEYS && config.SLACK_TOKEN_KEYS.includes(instance)) {
			const fetchData = async () => {
				let channelId = channels[channel]?.id;
				const data = await getChannelApi(instance, channelId);
				setMessages(data);
				setLastUpdated(Date.now());
			};
			fetchData();
			const intervalId = setInterval(() => {
				fetchData();
			}, 60000); // Refresh every minute
			return () => clearInterval(intervalId);
		}
	}, [instance, channel, channels, config, users]);

	if (channel) {
		return (
			<>
				{!isDashboard && (
					<Link
						href="#"
						onClick={(e) => {
							e.preventDefault();
							setChannel("");
						}}
					>
						&lt; Back to Channel List
					</Link>
				)}
				<SlackChannel
					messages={messages}
					channel={channels[channel]}
					emojis={emojis}
					users={users}
					lastUpdated={lastUpdated}
					channels={channels}
				/>
			</>
		);
	}
	return (
		<>
			{config && config.SLACK_TOKEN_KEYS && config.SLACK_TOKEN_KEYS.length > 0 && (
				<Select
					value={instance}
					onChange={(e) => setInstance(e.target.value)}
					displayEmpty
					sx={{ minWidth: 200 }}
				>
					{config.SLACK_TOKEN_KEYS.map((key) => (
						<MenuItem key={key} value={key}>
							<ListItemText primary={key} />
						</MenuItem>
					))}
				</Select>
			)}
			{instance && channels && Object.keys(channels).length > 0 && (
				<SlackChannels channels={channels} setChannel={setChannel} />
			)}
		</>
	);
};

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/SlackChannel/",
		name: "Slack Channel",
		element: <Slack />,
		description: <>Portal to access Slack Channels (useful for dashboards)</>,
		requires: "SLACK_TOKENS",
	},
];
