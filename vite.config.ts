import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {API_KEY, API_URL, API_USERNAME} from './globals'

// https://vite.dev/config/
export default defineConfig({
	define: {
		__API_KEY__: JSON.stringify(API_KEY),
		__API_URL__: JSON.stringify(API_URL),
		__API_USERNAME__: JSON.stringify(API_USERNAME),
	},
	server: {
		host: '0.0.0.0',
		port: 3000,
		allowedHosts: ['www.cybersquad.net'],
		proxy: {
			'/rest': { // Any request starting with /api
				target: API_URL, // The URL of your backend server
				changeOrigin: true, // Recommended for virtual hosted sites
			}
		}  
	},
	plugins: [react()],
	optimizeDeps: {
		include: ['@mui/x-data-grid'], // Explicitly include for optimization
	},
	build: {
		commonjsOptions: {
			esmExternals: true,
		},
	}
})
