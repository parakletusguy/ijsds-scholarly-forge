import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";
// import macrosPlugin from "vite-plugin-babel-macros" // <-- 1. REMOVE THIS

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // react({ // <--- REMOVE OLD CONFIG
    //   plugins: [
    //     ['@swc/plugin-styled-components', {}]
    //   ]
    // }),
    
    // 2. CONFIGURE react() TO USE THE MACRO PLUGIN
    react({
      babel: {
        plugins: ["babel-plugin-macros"],
      },
    }),
    VitePWA({ 
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}']
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {},
    'process.version': '""' // <-- ADD THIS LINE
  }
}));