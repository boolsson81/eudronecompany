import { createClient } from "@supabase/supabase-js";
import { getSupabaseFrontendEnv } from "@/lib/supabaseEnv";

const { url: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY } = getSupabaseFrontendEnv();

// Otypad klient. Databasen delas med DigitalSignal, men de genererade typerna
// (src/integrations/supabase/types.ts, ~58k rader) genereras och underhålls där.
// Att spegla dem hit skulle bara ge en fil som garanterat glider isär.
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
