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
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@react-pdf') || id.includes('react-pdf-html')) {
              return 'vendor-pdf';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('jodit') || id.includes('jodit-react')) {
              return 'vendor-editor';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('mammoth') || id.includes('html-docx-js')) {
              return 'vendor-utils';
            }
            return 'vendor'; 
          }
        },
      },
    },
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        maximumFileSizeToCacheInBytes: 10000000 
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