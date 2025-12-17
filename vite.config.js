import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  // Combine loaded env vars with actual process env vars (for Replit Deployments)
  const processEnv = { ...process.env, ...env };

  return {
    plugins: [react()],
    // 1. FIX THE HOST BLOCK (Allows all Replit URLs)
    server: {
      allowedHosts: true,
      host: true,
    },
    preview: {
      allowedHosts: true,
      host: true,
    },
    // 2. FIX THE MISSING SECRETS (The Bridge)
    define: {
      "process.env.VITE_SUPABASE_URL": JSON.stringify(processEnv.VITE_SUPABASE_URL),
      "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(processEnv.VITE_SUPABASE_ANON_KEY),
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(processEnv.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(processEnv.VITE_SUPABASE_ANON_KEY),
    },
  };
});