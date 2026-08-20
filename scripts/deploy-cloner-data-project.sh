#!/usr/bin/env bash
# Option A: Deploy PR#23 cloner edge functions to the migration data project.
# Requires SUPABASE_ACCESS_TOKEN with access to jzqgwsryxmgzcbjjddic (digitalsignal-prod).
set -euo pipefail

REF="${CLONER_DATA_PROJECT_REF:-jzqgwsryxmgzcbjjddic}"

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "ERROR: Set SUPABASE_ACCESS_TOKEN (Supabase Dashboard → Account → Access Tokens)"
  echo "  export SUPABASE_ACCESS_TOKEN=sbp_..."
  exit 1
fi

echo "Deploying cloner functions to project ref: $REF"

npx --yes supabase functions deploy shopify-cloner-worker --project-ref "$REF"
npx --yes supabase functions deploy migration-recovery-pass --project-ref "$REF"
npx --yes supabase functions deploy menu-cleanup-pass --project-ref "$REF"
npx --yes supabase functions deploy cloner-fix-collections-and-menus --project-ref "$REF"
npx --yes supabase functions deploy test-integration --project-ref "$REF"

echo "Done. Verify with:"
echo "  CLONER_SUPABASE_URL=https://${REF}.supabase.co node scripts/run-dry-run-fix-pass.mjs"
