import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Slimmad variant av DigitalSignals useTenant. Driftsvyerna här behöver bara
// tenant-id:t för att filtrera shops och product_compliance — inte moduler,
// features, branding eller plan-tiers.
export interface Tenant {
  id: string;
  name?: string | null;
}

export function useTenant(): { tenant: Tenant | null; loading: boolean } {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setTenant(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const tenantId = (profile as { tenant_id?: string } | null)?.tenant_id;
      if (!tenantId) {
        if (mounted) {
          setTenant(null);
          setLoading(false);
        }
        return;
      }

      const { data: row } = await supabase.from("tenants").select("id, name").eq("id", tenantId).maybeSingle();
      if (mounted) {
        setTenant((row as Tenant | null) ?? { id: tenantId });
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  return { tenant, loading };
}
