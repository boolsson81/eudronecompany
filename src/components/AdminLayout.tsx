import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Driftsvyerna grupperade. "Inköp" är EU Drone Companys inköpsyta; resten av den
 * gruppen (Inköpsdashboard, Leverantörer, Produkter, Prisbevakning, Ecosystem,
 * Supplier Opportunities) ligger i DigitalSignal-appen — se
 * docs/TRADE_FAIR_MODULE.md § Var modulen hamnade.
 */
const NAV_GROUPS: { label: string; items: { to: string; label: string }[] }[] = [
  {
    label: "Inköp",
    items: [{ to: "/admin/trade-fairs", label: "Mässor & Events" }],
  },
  {
    label: "Drift",
    items: [
      { to: "/admin/shopify-cloner", label: "Shopify Cloner" },
      { to: "/admin/shopify-drone-clone", label: "Drone Clone" },
      { to: "/admin/product-compliance", label: "Produktcompliance" },
      { to: "/admin/drone-regulations", label: "Regelverk" },
    ],
  },
];

/** Skyddar driftsvyerna. Rollerna kommer från samma databas som DigitalSignal. */
export default function AdminLayout() {
  const { user, role, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div>
          <h1 className="text-lg font-semibold">Saknar behörighet</h1>
          <p className="text-sm text-muted-foreground">
            Driftsvyerna kräver rollen admin eller global_admin. Din roll: {role ?? "ingen"}.
          </p>
        </div>
        <Button variant="outline" onClick={() => void signOut()}>
          Logga ut
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <span className="font-semibold">EuroDroneParts drift</span>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV_GROUPS.map((group, index) => (
              <div key={group.label} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden className="mx-1 h-4 w-px bg-border" />}
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{group.label}</span>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-1.5 text-sm transition-colors",
                        isActive ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => void signOut()}>
            Logga ut
          </Button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
