import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// MORPHEUS PRODUCTION CONFIG
// Generated: Dec 17, 2025
export default defineConfig({
  plugins: [react()],

  // 1. Allow Replit to serve the file
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5000,
  },
  preview: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5000,
  },

});