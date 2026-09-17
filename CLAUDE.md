# EuroDroneCompany — Shopify theme repo

## Pushing theme changes to Shopify

This session has a **Shopify MCP connector** already attached (tools named
`mcp__Shopify__*`, e.g. `get-shop-info`, `graphql_query`, `graphql_mutation`,
`graphql_schema`, `validate_graphql_codeblocks`). **Check for this connector
first** before assuming you need Shopify Admin API credentials from env vars
or a local `.env` file — the connector already carries its own auth and
needs nothing from the environment.

Do NOT go looking for `SHOPIFY_ADMIN_TOKEN` / `SUPABASE_SERVICE_ROLE_KEY` /
etc. to write a push script under `scripts/` unless the Shopify MCP
connector is genuinely unavailable in the session. Those env-var-driven
scripts (`scripts/lib/shopify-admin-client.mjs`, `scripts/fetch-theme-assets.mjs`,
...) are a fallback for sessions without the connector, not the first
option.

### Store
`ya1xhg-x6.myshopify.com` — "Europe Drone Company" (www.eudronecompany.com).

### Target preview theme
Git changes in this repo are previewed on the Shopify theme named
**"EDC Förhandsgranskning (Claude)"**. Pushing to the GitHub branch alone
does **not** update it — there is no GitHub→Shopify auto-deploy wired up in
this repo (no relevant workflow under `.github/workflows/`). After pushing
a commit, also push the changed file(s) straight to that theme via the
Shopify MCP connector.

The theme's GID can change if it's ever recreated — don't hardcode it
blindly, re-resolve it if the push fails with a not-found error:

```graphql
query {
  themes(first: 20) {
    nodes { id name role }
  }
}
```
Find the node whose `name` is `EDC Förhandsgranskning (Claude)` (role is
`UNPUBLISHED`).

### Pushing a file
Theme file writes (`themeFilesUpsert`) only work on **unpublished** themes —
writes to the live/MAIN theme are blocked by the connector. "EDC
Förhandsgranskning (Claude)" is unpublished, so this is fine.

Workflow (per the connector's own instructions — always start with
`graphql_schema`, never guess field/input names):

1. `graphql_schema` on `Mutation` → confirm `themeFilesUpsert`, then on
   `OnlineStoreThemeFilesUpsertFileInput` / `OnlineStoreThemeFileBodyInput`
   for the exact input shape.
2. `validate_graphql_codeblocks` on the constructed mutation.
3. `graphql_mutation` with the theme's `gid://shopify/OnlineStoreTheme/...`
   id and a `files` array, one entry per changed file:
   ```json
   {
     "filename": "assets/edp-header.css",
     "body": { "type": "TEXT", "value": "<full file contents>" }
   }
   ```
   `filename` is the theme-relative path exactly as it appears under
   `theme/` in this repo (e.g. `theme/assets/foo.css` → `assets/foo.css`,
   `theme/sections/header.liquid` → `sections/header.liquid`).

Push the **full** file contents each time (this is an upsert/overwrite, not
a diff/patch).

Do this for every file changed in a commit that touches anything under
`theme/`, right after pushing the git branch — don't wait to be asked
again.
