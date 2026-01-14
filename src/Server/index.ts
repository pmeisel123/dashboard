import type { IncomingMessage, ServerResponse } from "node:http";
import { ConfigServer } from "./config";
import { VacationServer } from "./vacation";

export const ServerMap = (req: IncomingMessage, requestBody: string | null) => {
	if (req.url === "/server/vacation") {
		return VacationServer(req, requestBody);
	}
	if (req.url === "/server/config") {
		return ConfigServer(req, requestBody);
	}
	return false;
};

// this is a little hacky but it converts an proxy request into a server side node request
// without having a second instance of node running
export const Server = (req: IncomingMessage, res: ServerResponse) => {
	const bodyChunks: Buffer[] = [];
	req.on("data", (chunk) => {
		if (Buffer.isBuffer(chunk)) {
			bodyChunks.push(chunk);
		} else if (typeof chunk === "string") {
			bodyChunks.push(Buffer.from(chunk));
		}
	});
	req.on("end", () => {
		const requestBody = Buffer.concat(bodyChunks).toString();
		const runserver = ServerMap(req, requestBody);
		if (!runserver) {
			res.writeHead(500, { "Content-Type": "text/plain" });
			res.end("Unknown error occurred");
		} else {
			if (typeof runserver == "string") {
				res.writeHead(200, { "Content-Type": "text/json" });
				res.end(runserver);
			} else if (requestBody) {
				res.writeHead(200, { "Content-Type": "text/json" });
				res.end(requestBody);
			} else {
				res.writeHead(200, { "Content-Type": "text/plain" });
				res.end("Proxy prevented");
			}
		}
		return;
	});
};
