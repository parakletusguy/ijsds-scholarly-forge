import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc"; // <--- REMOVE
import react from "@vitejs/plugin-react"; // <--- ADD
import path from "path";
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

    // macrosPlugin(), // <-- 1. REMOVE THIS
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