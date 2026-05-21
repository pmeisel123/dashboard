import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import type { IncomingHttpHeaders } from "node:http";
import { IncomingMessage, ServerResponse } from "node:http";
import zlib from "node:zlib";
import path from "path";
import type { ProxyOptions } from "vite";
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

const apiCache = new Map<string, CachedResponse>();
const CACHE_TTL = 60 * 1000; // 1 minute
const FORBIDDEN_HTTP2_HEADERS = ["connection", "keep-alive", "proxy-connection", "transfer-encoding", "upgrade", "te"];

const INTERNAL_URL = (config.USE_SSL ? "https" : "http") + "://127.0.0.1:" + config.PORT;
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

const bypassFunction = async (req: IncomingMessage, res: ServerResponse | undefined) => {
	if (!res || req.method !== "GET") return;
	const cacheKey = req.url ?? "";

	const cached = apiCache.get(cacheKey);
	// This is mostly to prevent duplicate calls
	// The browser will cache for 10 minutes
	// But will rerequest if the user reloads the page
	if (cached) {
		if (Date.now() - cached.timestamp < CACHE_TTL) {
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

const proxyResFunction = (path: string, proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
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
	});
};

const setProxy = (repo_path: string, target: string, headers: { [key: string]: string }) => {
	proxies[repo_path] = {
		target: target,
		changeOrigin: true,
		selfHandleResponse: true,
		secure: true,
		agent: false,
		headers: {
			Connection: "close",
			...headers,
		},
		rewrite: (path) => path.replace(new RegExp(`^${repo_path}`), ""),
		bypass: bypassFunction,
		configure: (proxy) => {
			proxy.on("proxyRes", (proxyRes, req, res) => proxyResFunction(repo_path, proxyRes, req, res));
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

proxies["/server/"] = {
	target: INTERNAL_URL,
	changeOrigin: true,
	bypass: (req: IncomingMessage, res: ServerResponse | undefined) => {
		if (res) {
			Server(req, res);
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

proxies["^(?!/(index\\.html|vacation\\.csv|favicon\\.ico))/[^/]+\\.[^/]+$"] = {
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

proxies["/"] = {
	target: INTERNAL_URL,
	changeOrigin: true,
	bypass: (req: IncomingMessage, res: ServerResponse | undefined) => {
		const maliciousIpPattern =
			/^(138\.68\.230\.|27.115\.|204\.76\.|36\.70\.|45\.148\.10\.151|195\.178\.110\.15|2\.57\.121\.25|2\.57\.122\.238|92\.118\.39\.56|15\.197\.148\.33|172\.67\.128\.220|173\.254\.31\.34|216\.144\.210\.189|89\.124\.77\.148|128\.71\.76\.84|5\.34\.98\.239|67\.213|64\.62\.156)/;
		const clientIp = req.socket?.remoteAddress;
		if (req && req.url) {
			if (clientIp && maliciousIpPattern.test(clientIp)) {
				log("Blocked", req, "", "access attempt from suspicious IP:");
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

// https://vite.dev/config/
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
	},
	resolve: {
		alias: {
			"@src": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [
		react(),
		config.USE_SSL
			? basicSsl({
					certDir: "./certs/",
					name: "dashboard",
				})
			: null,
		ViteRestart({
			restart: ["./config.json"],
		}),
	],
	optimizeDeps: {
		include: ["@mui/x-data-grid"],
		holdUntilCrawlEnd: true,
	},
	publicDir: "src/assets",
});
