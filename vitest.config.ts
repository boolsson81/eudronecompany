import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Testerna under supabase/functions/_shared/ är Deno-moduler och körs inte här,
    // precis som i digitalsignal-repot.
    include: ["scripts/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 15000,
  },
});
