import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import {API_KEY, API_URL, API_USERNAME} from './globals'

// https://vite.dev/config/
console.log(__dirname);
export default defineConfig({
	define: {
		__API_URL__: JSON.stringify(API_URL),
	},
	server: {
		host: '0.0.0.0',
		port: 3000,
		allowedHosts: ['www.cybersquad.net'],
		proxy: {
			'/jira': {
				target: API_URL,
				changeOrigin: true,
				headers: {
					'Authorization': 'Basic ' + btoa(API_USERNAME + ':' + API_KEY)
				},
				rewrite: (path) => path.replace(/^\/jira/, '')
			}
		}  
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "/src"),
		},
	},
	plugins: [react()],
	optimizeDeps: {
		include: ['@mui/x-data-grid'],
	},
	build: {
		commonjsOptions: {
			esmExternals: true,
		},
	}
})
