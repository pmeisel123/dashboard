import type { ConfigProps, ConfigPropsFile } from "./Types";

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

export const postConfigApi = async (config: ConfigPropsFile) => {
	const url = "/server/config";
	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(config),
	};
	const response = await fetch(url, requestOptions);
	const data = await response;
	return data;
};
