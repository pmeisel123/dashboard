import react from "@vitejs/plugin-react";
import * as fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import type { ProxyOptions} from "vite";
import {
	API_KEY,
	API_URL,
	API_USERNAME,
	CUSTOM_FIELDS,
	DASHBOARDS,
	DASHBOARD_DUCKS,
	DASHBOARD_SPEED_SECONDS,
	DONE_STATUS,
	VACATION_KEY,
	GITKEY,
	GITREPOS,
} from "./globals";

const git_proxies: {[key: string]: ProxyOptions} = {};
const git_proxies_name_path: {[key: string]:string}  = {};
GITREPOS.forEach((repo, index: number) => {
	const repo_path = '/git_' + index;
	const repo_name = repo.name;
	const repo_target = repo.url.replace('https://github.com/', 'https://api.github.com/repos/');

	git_proxies_name_path[repo_name] = repo_path;

	git_proxies[repo_path] = {
	    target: repo_target,
	    changeOrigin: true,
	    secure: false,
	    headers: {
	      Accept: 'application/vnd.github+json',
	      Authorization: 'Bearer ' + GITKEY,
	      'X-GitHub-Api-Version': '2022-11-28',
	      'User-Agent': 'validator'
	    },
	    rewrite: (path) => path.replace(new RegExp(`^${repo_path}`), ""),
	};
});
console.log(git_proxies);
const ducks = fs.readdirSync("./src/assets/ducks/");
// https://vite.dev/config/
export default defineConfig({
	define: {
		__API_URL__: JSON.stringify(API_URL),
		__VACATION_KEY__: JSON.stringify(VACATION_KEY),
		__DONE_STATUS__: JSON.stringify(DONE_STATUS),
		__CUSTOM_FIELDS__: JSON.stringify(CUSTOM_FIELDS || {}),
		__DASHBOARDS__: JSON.stringify(DASHBOARDS || {}),
		__DASHBOARD_SPEED_SECONDS__: JSON.stringify(
			DASHBOARD_SPEED_SECONDS || {},
		),
		__DUCKS__: JSON.stringify(ducks),
		__DASHBOARD_DUCKS__: JSON.stringify(DASHBOARD_DUCKS),
		__GIT_REPOS__: JSON.stringify(git_proxies_name_path),
	},
	server: {
		host: "0.0.0.0",
		port: 3000,
		allowedHosts: ["www.cybersquad.net"],
		proxy: {
			"/jira": {
				target: API_URL,
				changeOrigin: true,
				headers: {
					Authorization:
						"Basic " + btoa(API_USERNAME + ":" + API_KEY),
				},
				rewrite: (path) => path.replace(/^\/jira/, ""),
				configure: (proxy) => {
					proxy.on("proxyRes", (_proxyRes, req) => {
						console.log("Received Response from Target:", req.url);
					});
				},
			},
			...git_proxies
		},
		fs: {
			deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
			allow: ["src", "node_modules", "index.html"],
		},
	},
	resolve: {
		alias: {
			"@src": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [react()],
	optimizeDeps: {
		include: ["@mui/x-data-grid"],
	},
	build: {
		commonjsOptions: {
			esmExternals: true,
		},
	},
});
