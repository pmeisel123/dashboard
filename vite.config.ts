/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import forge from "node-forge";
import fs from "node:fs";
import type { IncomingHttpHeaders } from "node:http";
import { IncomingMessage, ServerResponse } from "node:http";
import zlib from "node:zlib";
import path from "path";
import type { Plugin, ProxyOptions } from "vite";
import ViteRestart from "vite-plugin-restart";
import { defineConfig } from "vitest/config";
import type { ConfigPropsFile, RepoNamePaths } from "./src/Api/Types";
import { Server, loadConfig } from "./src/Server/";

const config: ConfigPropsFile = loadConfig();
const proxies: { [key: string]: ProxyOptions } = {};
const git_proxies_name_path: { [key: string]: RepoNamePaths } = {};
interface CachedResponse {
	body: Buffer;
	headers: IncomingHttpHeaders;
	timestamp: number;
}
interface SlackAPIResponse {
	ok: boolean;
	error?: string;
}

const apiCache = new Map<string, CachedResponse>();
const CACHE_TTL = 60 * 1000; // 1 minutes
const FORBIDDEN_HTTP2_HEADERS = ["connection", "keep-alive", "proxy-connection", "transfer-encoding", "upgrade", "te"];

const INTERNAL_URL = (config.USE_SSL ? "https" : "http") + "://127.0.0.1:" + config.PORT;

const certsDir = path.resolve(__dirname, "./certs");
const certKeyPath = path.join(certsDir, "dashboard.key");
const certCrtPath = path.join(certsDir, "dashboard.crt");

if (config.USE_SSL && (!fs.existsSync(certKeyPath) || !fs.existsSync(certCrtPath))) {
	try {
		if (!fs.existsSync(certsDir)) {
			fs.mkdirSync(certsDir, { recursive: true });
		}

		console.log("Generating separate dashboard.key and dashboard.crt files...");

		// Generate a new RSA key pair
		const keys = forge.pki.rsa.generateKeyPair(2048);
		const cert = forge.pki.createCertificate();

		cert.publicKey = keys.publicKey;
		cert.serialNumber = "01";
		cert.validity.notBefore = new Date();
		cert.validity.notAfter = new Date();
		cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10); // Valid for 10 year

		const attrs = [
			{ name: "commonName", value: config.HOST || "localhost" },
			{ name: "countryName", value: "US" },
			{ name: "organizationName", value: "Dashboard" },
			{ name: "organizationalUnitName", value: "Dashboard" },
		];

		cert.setSubject(attrs);
		cert.setIssuer(attrs);

		// Set Subject Alternative Names (SAN) so modern browsers accept it
		cert.setExtensions([
			{
				name: "subjectAltName",
				altNames: [
					{ type: 2, value: "localhost" },
					{ type: 2, value: config.HOST || "0.0.0.0" },
					{ type: 7, ip: "127.0.0.1" },
					{ type: 7, ip: "0.0.0.0" },
				],
			},
		]);

		// Self-sign the certificate
		cert.sign(keys.privateKey, forge.md.sha256.create());

		// Convert to PEM standard format strings
		const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
		const pemCert = forge.pki.certificateToPem(cert);

		// Write files to disk matching production names
		fs.writeFileSync(certKeyPath, pemKey);
		fs.writeFileSync(certCrtPath, pemCert);

		console.log("Certificates generated successfully.");
	} catch (error) {
		console.error("Failed to programmatically generate development certificates:", error);
	}
}
const hasCerts = fs.existsSync(certKeyPath) && fs.existsSync(certCrtPath);

const log = (type: string, req: IncomingMessage, url_start: string | null, message: string) => {
	const userAgent = req.headers["user-agent"] || "unknown";
	const remoteIp = req.socket.remoteAddress || "unknown";
	console.log(
		new Date().toISOString() +
			" " +
			"[" +
			type +
			"] " +
			message +
			" request: " +
			(url_start || "") +
			(req.url || "") +
			(type === "CACHE" ? "" : ` from IP:${remoteIp}, User Agent:${userAgent}`),
	);
};

const pendingResolvers = new Map<string, (data: CachedResponse) => void>();
const pendingPromises = new Map<string, Promise<CachedResponse>>();

const serveFromCache = (res: ServerResponse, cached: CachedResponse) => {
	Object.entries(cached.headers).forEach(([key, val]) => {
		if (val !== undefined && !FORBIDDEN_HTTP2_HEADERS.includes(key.toLowerCase())) {
			res.setHeader(key, val);
		}
	});
	res.setHeader("X-Cache", "HIT");
	res.setHeader("content-length", Buffer.byteLength(cached.body));
	res.end(cached.body);
};

// From Google AI, prevents vite from displaying the full allowed paths when a bad file is called
function genericErrorPlugin(): Plugin {
	return {
		name: "generic-error-interceptor",
		configureServer(server) {
			server.middlewares.use((_req: IncomingMessage, res: ServerResponse, next: () => void) => {
				const chunks: Buffer[] = [];

				const originalWrite = res.write.bind(res);
				const originalEnd = res.end.bind(res);

				type StreamCallback = (error?: Error | null) => void;

				res.write = function (
					chunk: Uint8Array | string,
					encodingOrCb?: BufferEncoding | StreamCallback,
					cb?: StreamCallback,
				): boolean {
					if (res.statusCode && res.statusCode !== 403) {
						return originalWrite(chunk, encodingOrCb as BufferEncoding, cb);
					}
					if (chunk) {
						chunks.push(typeof chunk === "string" ? Buffer.from(chunk, "utf8") : Buffer.from(chunk));
					}
					return true;
				};

				res.end = function (
					chunk?: Uint8Array | string | (() => void),
					encodingOrCb?: BufferEncoding | (() => void),
					cb?: () => void,
				): ServerResponse {
					if (res.statusCode && res.statusCode !== 403) {
						return originalEnd(chunk as Uint8Array | string, encodingOrCb as BufferEncoding, cb);
					}

					if (chunk && typeof chunk !== "function") {
						chunks.push(typeof chunk === "string" ? Buffer.from(chunk, "utf8") : Buffer.from(chunk));
					}

					const body = Buffer.concat(chunks).toString("utf8");

					if (res.statusCode === 403 && body.includes("outside of Vite serving allow list")) {
						res.setHeader("Content-Type", "text/plain");

						const cleanMessage =
							"403 Forbidden: Requested file is outside of the permitted project workspace.";
						res.setHeader("Content-Length", Buffer.byteLength(cleanMessage));

						const finalEncoding: BufferEncoding = typeof encodingOrCb === "string" ? encodingOrCb : "utf8";
						const finalCallback =
							typeof chunk === "function"
								? chunk
								: typeof encodingOrCb === "function"
									? encodingOrCb
									: cb;

						return originalEnd(cleanMessage, finalEncoding, finalCallback);
					}

					const finalEncoding: BufferEncoding = typeof encodingOrCb === "string" ? encodingOrCb : "utf8";
					const finalCallback =
						typeof chunk === "function" ? chunk : typeof encodingOrCb === "function" ? encodingOrCb : cb;

					return originalEnd(Buffer.concat(chunks), finalEncoding, finalCallback);
				};

				next();
			});
		},
	};
}

const bypassFunction = (timeout?: number) => {
	const localTimeout = typeof timeout !== "undefined" ? timeout : CACHE_TTL;
	const bypassFunctionInner = async (req: IncomingMessage, res: ServerResponse | undefined) => {
		if (!res || req.method !== "GET") {
			// Request to /server is handled by the Server function, which can handle non-GET requests. All other endpoints should only allow GET requests.
			log("Blocked", req, "", `Non-GET method (${req.method}) rejected for (${req.url})`);
			if (res) {
				res.writeHead(405, { "Content-Type": "text/plain", Allow: "GET" });
				res.end("405 Method Not Allowed: Only GET requests are permitted on this endpoint.");
			}
			return req.url;
		}
		const cacheKey = req.url ?? "";

		const cached = apiCache.get(cacheKey);
		// This is mostly to prevent duplicate calls
		// The browser will cache for 10 minutes
		// But will rerequest if the user reloads the page
		if (cached) {
			if (Date.now() - cached.timestamp < localTimeout) {
				serveFromCache(res, cached);
				return req.url;
			} else {
				apiCache.delete(cacheKey);
				if (pendingPromises.has(cacheKey)) {
					pendingPromises.delete(cacheKey);
					pendingResolvers.delete(cacheKey);
				}
			}
		}

		if (pendingPromises.has(cacheKey)) {
			const result = await Promise.race([
				pendingPromises.get(cacheKey)!,
				new Promise<null>((r) => setTimeout(() => r(null), 30000)),
			]);
			if (result) {
				serveFromCache(res, result);
				return req.url;
			}
			pendingPromises.delete(cacheKey);
			pendingResolvers.delete(cacheKey);
		}

		let resolver: (data: CachedResponse) => void;
		const promise = new Promise<CachedResponse>((resolve) => {
			resolver = resolve;
		});

		pendingPromises.set(cacheKey, promise);
		pendingResolvers.set(cacheKey, resolver!);

		return;
	};
	return bypassFunctionInner;
};

type CustomResponseHook = (
	decodedBuffer: Buffer,
	res: ServerResponse,
	req: IncomingMessage,
	url: string,
) => Promise<boolean> | boolean;

const proxyResFunction = (
	path: string,
	proxyRes: IncomingMessage,
	req: IncomingMessage,
	res: ServerResponse,
	customResponse?: CustomResponseHook,
) => {
	if (proxyRes.statusCode === 304 || proxyRes.headers["content-length"] === "0") {
		Object.entries(proxyRes.headers).forEach(([key, val]) => {
			if (val !== undefined && !FORBIDDEN_HTTP2_HEADERS.includes(key.toLowerCase())) {
				res.setHeader(key, val);
			}
		});
		res.end();
		return;
	}

	log("PROXY", req, path, "(Cache Miss):");
	const chunks: Buffer[] = [];
	proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));

	proxyRes.on("end", () => {
		void (async () => {
			const buffer = Buffer.concat(chunks);
			const url = req.url ?? "";
			const cacheKey = path + url;
			const encoding = proxyRes.headers["content-encoding"];
			let decodedBuffer: Buffer = buffer;
			if (encoding) {
				try {
					if (encoding === "gzip") {
						decodedBuffer = zlib.gunzipSync(buffer);
					} else if (encoding === "deflate") {
						decodedBuffer = zlib.inflateSync(buffer);
					} else if (encoding === "br") {
						decodedBuffer = zlib.brotliDecompressSync(buffer);
					} else {
						console.log("unknown encoding", encoding);
					}
				} catch (e) {
					console.error("Decompression failed", e);
				}
			}

			if (customResponse) {
				const fullyHandled = await customResponse(decodedBuffer, res, req, url);
				if (fullyHandled) {
					return; // Stop execution here if the hook took over the response stream
				}
			}
			const newCacheEntry: CachedResponse = {
				body: decodedBuffer,
				headers: { ...proxyRes.headers, "content-encoding": "identity" },
				timestamp: Date.now(),
			};

			apiCache.set(cacheKey, newCacheEntry);

			const resolver = pendingResolvers.get(cacheKey);
			if (resolver) {
				resolver(newCacheEntry);
				pendingResolvers.delete(cacheKey);
				pendingPromises.delete(cacheKey);
			}
			setTimeout(() => {
				// log("CACHE", req, path, "Clearing cached response:");
				apiCache.delete(cacheKey);
				pendingResolvers.delete(cacheKey);
				pendingPromises.delete(cacheKey);
			}, CACHE_TTL * 2);

			Object.entries(proxyRes.headers).forEach(([key, val]) => {
				if (val !== undefined && !FORBIDDEN_HTTP2_HEADERS.includes(key.toLowerCase())) {
					if (key.toLowerCase() === "content-encoding") {
						res.setHeader(key, "identity");
					} else {
						res.setHeader(key, val);
					}
				}
			});

			res.setHeader("content-length", Buffer.byteLength(decodedBuffer));
			res.end(decodedBuffer);
		})();
	});
};

const setProxy = (
	url: string,
	target: string,
	headers: { [key: string]: string },
	customResponse?: CustomResponseHook,
	bypassTime?: number,
) => {
	proxies[url] = {
		target: target,
		changeOrigin: true,
		selfHandleResponse: true,
		secure: true,
		agent: false,
		headers: {
			Connection: "close",
			...headers,
		},
		rewrite: (path) => path.replace(new RegExp(`^${url}`), ""),
		bypass: bypassFunction(bypassTime),
		configure: (proxy) => {
			proxy.on("proxyRes", (proxyRes, req, res) => {
				void proxyResFunction(url, proxyRes, req, res, customResponse);
			});
		},
	};
};

config.GITREPOS.forEach((repo, index: number) => {
	const repo_path = "/git_" + index;
	const repo_name = repo.name;
	const repo_target = repo.url.replace("https://github.com/", "https://api.github.com/repos/");

	git_proxies_name_path[repo_name] = {
		path: repo_path,
		url: repo.url,
	};

	setProxy(repo_path, repo_target, {
		Accept: "application/vnd.github+json",
		Authorization: "Bearer " + config.GITTOKEN,
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "dashboard",
	});
});

const jira_proxies = {
	"/jirawiki/": config.API_CONFLUENCE_URL,
	"/jira/": config.API_URL,
};

for (const [url, target] of Object.entries(jira_proxies)) {
	if (target && config.API_KEY) {
		setProxy(url, target, {
			Accept: "application/json",
			Authorization: "Basic " + Buffer.from(config.API_USERNAME + ":" + config.API_KEY).toString("base64"),
		});
	}
}

const slackAutoJoinHookWrapper: (token: string | undefined) => CustomResponseHook = (token) => {
	const slackAutoJoinHook: CustomResponseHook = async (
		decodedBuffer: Buffer,
		_res: ServerResponse,
		_req: IncomingMessage,
		url: string,
	) => {
		try {
			const jsonResponse = JSON.parse(decodedBuffer.toString()) as SlackAPIResponse;
			if (!jsonResponse.ok && jsonResponse.error === "not_in_channel") {
				console.log(`[Hook] Slack API response indicates bot is not in channel. Attempting auto-join...`);

				const searchParams = new URLSearchParams(url.split("?")[1] ?? "");
				const channelId = searchParams.get("channel");
				const authorizationToken = token ? `Bearer ${token}` : undefined;

				if (channelId && authorizationToken) {
					console.log(`[Hook] Bot missing from channel ${channelId}. Auto-joining...`);
					const joinRes = await fetch("https://slack.com/api/conversations.join", {
						method: "POST",
						headers: {
							Authorization: authorizationToken, // Dynamic configurations verified
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ channel: channelId }),
					});

					const joinData = (await joinRes.json()) as { ok: boolean; error?: string };

					if (joinData.ok) {
						const cacheKey = url ?? "";

						const cached = apiCache.get(cacheKey);
						if (cached) {
							apiCache.delete(cacheKey);
						}
						return false;
					}
				}
			}
		} catch {
			// Non-JSON or parsing issues fail safely back to regular proxy response routing
		}
		return false;
	};
	return slackAutoJoinHook;
};

if (config.SLACK_TOKENS && Object.keys(config.SLACK_TOKENS).length > 0) {
	for (const [key, token] of Object.entries(config.SLACK_TOKENS)) {
		if (key && token) {
			setProxy(
				"/slack/" + key,
				"https://slack.com/api/",
				{
					Accept: "application/json",
					Authorization: "Bearer " + token,
				},
				slackAutoJoinHookWrapper(token),
				5 * 1000,
			);
		}
	}
}

proxies["/server/"] = {
	target: INTERNAL_URL,
	changeOrigin: true,
	bypass: async (req: IncomingMessage, res: ServerResponse | undefined) => {
		if (res) {
			const handled = await Server(req, res);
			if (handled) return req.url;
		}
		return false;
	},
};

proxies["^/.*\\.(git|env|crt|pem|test.ts)"] = {
	target: INTERNAL_URL,
	changeOrigin: true,
	bypass: (req: IncomingMessage, res: ServerResponse | undefined) => {
		const match = req.url?.match(/\.(git|env|crt|pem)/i);
		const targetFile = match ? match[0] : "sensitive files";

		log("Blocked", req, "", "access attempt");
		if (res) {
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end(`You think you can access ${targetFile}? Think again.`);
		}
		return false;
	},
};

proxies["/src/Server"] = {
	// technicall there is nothing secure under /src/Server but block it anyway
	target: INTERNAL_URL,
	changeOrigin: true,
	bypass: (req: IncomingMessage, res: ServerResponse | undefined) => {
		log("Blocked", req, "", "access attempt");
		if (res) {
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end("Not Found");
		}
		return false;
	},
};

proxies["^(?!/(index\\.html|vacation\\.csv|favicon\\.ico))/[^/?]+\\.[^/?]+(?:\\?|$)"] = {
	// This is a catch all for any request that looks like it's trying to access a file directly at the root, except for index.html and vacation.csv which need to be accessed directly
	target: INTERNAL_URL,
	changeOrigin: true,
	bypass: (req: IncomingMessage, res: ServerResponse | undefined) => {
		log("Blocked", req, "", "access attempt");
		if (res) {
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end("Not Found");
		}
		return false;
	},
};
proxies["^(@fs|.*/etc)"] = {
	// Another block
	target: INTERNAL_URL,
	changeOrigin: true,
	bypass: (req: IncomingMessage, res: ServerResponse | undefined) => {
		log("Blocked", req, "", "access attempt");
		if (res) {
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end("Not Found");
		}
		return false;
	},
};

proxies["/"] = {
	target: INTERNAL_URL,
	changeOrigin: true,
	bypass: (req: IncomingMessage, res: ServerResponse | undefined) => {
		const maliciousIpPattern =
			/^(138\.68\.230\.|27.115\.|204\.76\.|36\.70\.|45\.148\.10\.151|195\.178\.110\.15|2\.57\.121\.25|2\.57\.122\.238|92\.118\.39\.56|15\.197\.148\.33|172\.67\.128\.220|173\.254\.31\.34|216\.144\.210\.189|89\.124\.77\.148|128\.71\.76\.84|5\.34\.98\.239|67\.213|64\.62\.156)/;
		const clientIp = req.socket?.remoteAddress;
		if (req && req.url) {
			if (clientIp && maliciousIpPattern.test(clientIp)) {
				log("Blocked4", req, "", "access attempt from suspicious IP:");
				if (res) {
					res.writeHead(404, { "Content-Type": "text/plain" });
					res.end("Not Found");
				}
				return false;
			}
			if (clientIp && !clientIp.match(/96\.230\.98/)) {
				log("REQUEST", req, "", "received from outside IP:");
			} else if (!req.url.match(/^\/(src|node_modules|@|vacation.csv|ducks)/)) {
				log("REQUEST", req, "", "received:");
			}
			return req.url;
		}
		return false;
	},
};

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./vitest.setup.ts"],
	},
	server: {
		host: "0.0.0.0",
		port: config.PORT,
		allowedHosts: [config.HOST],
		proxy: proxies,
		fs: {
			allow: ["src", "node_modules", "index.html"],
			// this should be redundant with the proxy rules but is an extra layer of security to prevent accidental exposure of sensitive files
			deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/src/Server/**"],
		},
		warmup: {
			clientFiles: ["./src/main.tsx", "./index.html"],
		},
		https:
			config.USE_SSL && hasCerts
				? {
						key: fs.readFileSync(certKeyPath),
						cert: fs.readFileSync(certCrtPath),
					}
				: undefined,
	},
	resolve: {
		alias: {
			"@src": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [
		react(),
		ViteRestart({
			restart: ["./config.json"],
		}),
		genericErrorPlugin(),
	],
	optimizeDeps: {
		include: ["@mui/x-data-grid"],
		holdUntilCrawlEnd: true,
	},
	publicDir: "src/assets",
});
