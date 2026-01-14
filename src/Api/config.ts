import type { ConfigProps } from "./Types";

export const getConfigApi = async () => {
	const url = "/server/config";
	const paramaters = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	let response = await fetch(url, paramaters);
	const ajax_result: ConfigProps = await response.json();
	return ajax_result;
};
