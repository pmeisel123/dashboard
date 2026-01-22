import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import type { IncomingHttpHeaders } from "node:http";
import { IncomingMessage, ServerResponse } from "node:http";
import zlib from "node:zlib";
import path from "path";
import type { ProxyOptions } from "vite";
import { defineConfig } from "vite";
import ViteRestart from "vite-plugin-restart";
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

const logTime = () => {
	return new Date().toISOString() + " ";
};

const pendingResolvers = new Map<string, (data: CachedResponse) => void>();
const pendingPromises = new Map<string, Promise<CachedResponse>>();

const serveFromCache = (res: ServerResponse, cached: CachedResponse) => {
	// console.log(logTime() + "isCached (Bypassed): " + logKey);
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
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		serveFromCache(res, cached);
		return req.url;
	}

	if (pendingPromises.has(cacheKey)) {
		// console.log(logTime() + "Collapsing Duplicate Request: " + cacheKey);
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

	console.log(logTime() + "Received Response from Target (Cache Miss): " + path + req.url);
	const chunks: Buffer[] = [];
	proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));

	proxyRes.on("end", () => {
		const buffer = Buffer.concat(chunks);
		const url = req.url ?? "";
		const cacheKey = path + url;
		const encoding = proxyRes.headers["content-encoding"];
		let decodedBuffer: Buffer = buffer;
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

config.GITREPOS.forEach((repo, index: number) => {
	const repo_path = "/git_" + index;
	const repo_name = repo.name;
	const repo_target = repo.url.replace("https://github.com/", "https://api.github.com/repos/");

	git_proxies_name_path[repo_name] = {
		path: repo_path,
		url: repo.url,
	};

	proxies[repo_path] = {
		target: repo_target,
		changeOrigin: true,
		secure: false,
		selfHandleResponse: true,
		agent: false,
		headers: {
			Connection: "close",
			Accept: "application/vnd.github+json",
			Authorization: "Bearer " + config.GITTOKEN,
			"X-GitHub-Api-Version": "2022-11-28",
			"User-Agent": "validator",
		},
		rewrite: (path) => path.replace(new RegExp(`^${repo_path}`), ""),
		bypass: bypassFunction,
		configure: (proxy) => {
			proxy.on("proxyRes", (proxyRes, req, res) => {
				return proxyResFunction(repo_path, proxyRes, req, res);
			});
		},
	};
});
if (config.API_CONFLUENCE_URL && config.API_KEY) {
	proxies["/jirawiki/"] = {
		target: config.API_CONFLUENCE_URL,
		changeOrigin: true,
		selfHandleResponse: true,
		agent: false,
		headers: {
			Connection: "close",
			Authorization: "Basic " + btoa(config.API_USERNAME + ":" + config.API_KEY),
		},
		rewrite: (path) => path.replace(/^\/jirawiki\//, ""),
		bypass: bypassFunction,
		configure: (proxy) => {
			proxy.on("proxyRes", (proxyRes, req, res) => {
				return proxyResFunction("/jirawiki/", proxyRes, req, res);
			});
		},
	};
}

if (config.API_URL && config.API_KEY) {
	proxies["/jira/"] = {
		target: config.API_URL,
		changeOrigin: true,
		selfHandleResponse: true,
		agent: false,
		headers: {
			Connection: "close",
			Authorization: "Basic " + btoa(config.API_USERNAME + ":" + config.API_KEY),
		},
		rewrite: (path) => path.replace(/^\/jira\//, ""),
		bypass: bypassFunction,
		configure: (proxy) => {
			proxy.on("proxyRes", (proxyRes, req, res) => {
				return proxyResFunction("/jira/", proxyRes, req, res);
			});
		},
	};
}

proxies["/server/"] = {
	target: "http://127.0.0.1:" + config.PORT,
	changeOrigin: true,
	bypass: async (req: IncomingMessage, res: ServerResponse | undefined) => {
		if (!res) return;
		await new Promise<void>((resolve) => {
			Server(req, res);
			req.on("end", () => {
				resolve();
			});
		});
		return false;
	},
};

// https://vite.dev/config/
export default defineConfig({
	server: {
		host: "0.0.0.0",
		port: config.PORT,
		allowedHosts: [config.HOST],
		proxy: proxies,
		fs: {
			allow: ["src", "node_modules", "index.html"],
			deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/src/Server/**"],
		},
	},
	resolve: {
		alias: {
			"@src": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [
		react(),
		basicSsl(),
		ViteRestart({
			restart: ["./config.json"],
		}),
	],
	optimizeDeps: {
		include: ["@mui/x-data-grid"],
	},
	publicDir: "src/assets",
});
