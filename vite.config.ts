import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // Canonical-URL:erna byggs av VITE_SITE_ORIGIN (src/lib/site.ts). Utan den
  // skulle sidorna gå live utan canonical alls, eller — som före flytten hit —
  // med en canonical mot fel domän. Avbryt bygget i stället.
  if (command === "build" && !env.VITE_SITE_ORIGIN?.trim()) {
    throw new Error(
      "VITE_SITE_ORIGIN saknas. Sätt den till frontendens publika origin " +
        "(t.ex. https://dronare.eudronecompany.com) innan bygget. " +
        "Se docs/FRONTEND_MIGRATION.md § Måldomän.",
    );
  }

  return {
    server: { host: "::", port: 8080 },
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  };
});
