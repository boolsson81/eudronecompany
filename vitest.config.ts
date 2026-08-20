import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Testerna under supabase/functions/_shared/ är Deno-moduler och körs inte här,
    // precis som i digitalsignal-repot.
    include: ["scripts/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 15000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
