import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["vs_logo.png", "logo.png"],
			manifest: {
				name: "VedShare - Educational Marketplace",
				short_name: "VedShare",
				description: "Buy, sell, and share educational resources.",
				theme_color: "#06b6d4",
				background_color: "#111827",
				display: "standalone",
				icons: [
					{
						src: "vs_logo.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "vs_logo.png",
						sizes: "512x512",
						type: "image/png"
					},
					{
						src: "vs_logo.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable"
					}
				]
			}
		})
	],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:5001",
			},
		},
	},
});
