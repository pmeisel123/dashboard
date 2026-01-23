import type { ConfigProps, ConfigPropsFile } from "./Types";

//  Create a function to get the config from the server
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

// Create a function to post the config to the server
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
