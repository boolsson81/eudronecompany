/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Frontendens publika origin, t.ex. `https://dronare.eudronecompany.com`.
   * Krävs för produktionsbygget — se `src/lib/site.ts`.
   */
  readonly VITE_SITE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
