import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [react(), tailwindcss(), svgr()],
	server: {
		proxy: {
			"/api": {
				target: "https://lightidea.org:8007",
				changeOrigin: true,
				secure: false,
				rewrite: path => path.replace(/^\/api/, ""),
			},
		},
	},
	build: {
		// Enable code splitting for better caching
		rollupOptions: {
			output: {
				manualChunks: {
					// Vendor chunks - split large libraries
					"vendor-react": ["react", "react-dom"],
					"vendor-redux": ["@reduxjs/toolkit", "react-redux"],
					"vendor-router": ["react-router"],
					"vendor-i18n": ["i18next", "react-i18next"],
					"vendor-utils": ["axios", "react-toastify"],
				},
			},
		},
		// Optimize chunk size
		chunkSizeWarningLimit: 500,
		// Enable minification
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true, // Remove console.log in production
				drop_debugger: true,
			},
		},
		// Disable source maps for smaller builds
		sourcemap: false,
	},
	// Optimize dependencies
	optimizeDeps: {
		include: ["react", "react-dom", "react-router", "@reduxjs/toolkit", "react-redux"],
	},
	// Performance optimizations
	esbuild: {
		// Remove console and debugger in production
		drop: mode === "production" ? ["console", "debugger"] : [],
	},
}));
