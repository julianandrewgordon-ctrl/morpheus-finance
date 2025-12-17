import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const processEnv = { ...process.env, ...env };

  // PASTE YOUR SUPABASE VALUES HERE
  // This acts as a safety net if the environment variables fail
  const FALLBACK_URL = "https://bsozxnzrqqtalrouotik.supabase.co";
  const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzb3p4bnpycXF0YWxyb3VvdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjMxNjQsImV4cCI6MjA3OTYzOTE2NH0.jslsKLQZh5xi3NWVAHWidvLX0jb96f-rcpLx7YOsUKY";

  return {
    plugins: [react()],
    server: {
      allowedHosts: true,
      host: true,
    },
    preview: {
      allowedHosts: true,
      host: true,
    },
    define: {
      // If the environment variable is found, use it. 
      // If NOT found (undefined), fall back to the hardcoded string.
      "process.env.VITE_SUPABASE_URL": JSON.stringify(processEnv.VITE_SUPABASE_URL || FALLBACK_URL),
      "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(processEnv.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY),

      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(processEnv.VITE_SUPABASE_URL || FALLBACK_URL),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(processEnv.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY),
    },
  };
});

