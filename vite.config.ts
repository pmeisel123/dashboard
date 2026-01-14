import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "path";
import type { ProxyOptions } from "vite";
import { defineConfig } from "vite";
import ViteRestart from "vite-plugin-restart";
import type { ConfigPropsFile, RepoNamePaths } from "./src/Api/Types";
import { Server, loadConfig } from "./src/Server/";

const config: ConfigPropsFile = loadConfig();
const proxies: { [key: string]: ProxyOptions } = {};
const git_proxies_name_path: { [key: string]: RepoNamePaths } = {};
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
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: "Bearer " + config.GITTOKEN,
			"X-GitHub-Api-Version": "2022-11-28",
			"User-Agent": "validator",
		},
		configure: (proxy) => {
			proxy.on("proxyRes", (_proxyRes, req) => {
				console.log("Received Response from Target:", repo_target + req.url);
			});
		},
		rewrite: (path) => path.replace(new RegExp(`^${repo_path}`), ""),
	};
});
if (config.API_CONFLUENCE_URL && config.API_KEY) {
	proxies["/jirawiki"] = {
		target: config.API_CONFLUENCE_URL,
		changeOrigin: true,
		headers: {
			Authorization: "Basic " + btoa(config.API_USERNAME + ":" + config.API_KEY),
		},
		rewrite: (path) => path.replace(/^\/jirawiki\//, ""),
		configure: (proxy) => {
			proxy.on("proxyRes", (_proxyRes, req) => {
				console.log("Received Response from Target:", config.API_CONFLUENCE_URL + req.url);
			});
		},
	};
}

if (config.API_URL && config.API_KEY) {
	proxies["/jira/"] = {
		target: config.API_URL,
		changeOrigin: true,
		headers: {
			Authorization: "Basic " + btoa(config.API_USERNAME + ":" + config.API_KEY),
		},
		rewrite: (path) => path.replace(/^\/jira\//, ""),
		configure: (proxy) => {
			proxy.on("proxyRes", (_proxyRes, req) => {
				console.log("Received Response from Target:", req.url);
			});
		},
	};
}

proxies["/server"] = {
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
