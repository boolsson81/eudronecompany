import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildMissingProductTypeReport } from "../supabase/functions/_shared/missing-product-type-report.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const shopId = Deno.env.get("SHOP_ID") ?? "010120e6-6def-431e-8614-905cb69f85b9";
const report = await buildMissingProductTypeReport(supabase, shopId);
console.log(JSON.stringify(report));
