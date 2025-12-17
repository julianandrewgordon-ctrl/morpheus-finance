import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// MORPHEUS PRODUCTION CONFIG
// Generated: Dec 17, 2025
export default defineConfig({
  plugins: [react()],

  // 1. Allow Replit to serve the file
  server: {
    allowedHosts: true,
    host: true,
  },
  preview: {
    allowedHosts: true,
    host: true,
  },

  // 2. Hardcode the keys directly into the build
  // This bypasses all environment variable complexity
  define: {
    "process.env.VITE_SUPABASE_URL": JSON.stringify("https://bsozxnzrqqtalrouotik.supabase.co"),
    "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzb3p4bnpycXF0YWxyb3VvdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjMxNjQsImV4cCI6MjA3OTYzOTE2NH0.jslsKLQZh5xi3NWVAHWidvLX0jb96f-rcpLx7YOsUKY"),

    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://bsozxnzrqqtalrouotik.supabase.co"),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzb3p4bnpycXF0YWxyb3VvdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjMxNjQsImV4cCI6MjA3OTYzOTE2NH0.jslsKLQZh5xi3NWVAHWidvLX0jb96f-rcpLx7YOsUKY"),
  },
});