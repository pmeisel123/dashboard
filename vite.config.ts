import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import {
	API_KEY,
	API_URL,
	API_USERNAME,
	CUSTOM_FIELDS,
	DONE_STATUS,
	VACATION_KEY,
	DASHBOARDS
} from "./globals";

// https://vite.dev/config/
export default defineConfig({
	define: {
		__API_URL__: JSON.stringify(API_URL),
		__VACATION_KEY__: JSON.stringify(VACATION_KEY),
		__DONE_STATUS__: JSON.stringify(DONE_STATUS),
		__CUSTOM_FIELDS__: JSON.stringify(CUSTOM_FIELDS || {}),
		__DASHBOARDS__: JSON.stringify(DASHBOARDS || {}),
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
					proxy.on('proxyRes', (_proxyRes, req) => {
						console.log('Received Response from Target:', req.url);
					});
				}
			},
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
