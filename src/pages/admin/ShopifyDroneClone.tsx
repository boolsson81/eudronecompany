import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Play, ListChecks, Upload, Palette } from "lucide-react";

// Fixed source/target shops for this operation.
const SOURCE_SHOP = { id: "010120e6-6def-431e-8614-905cb69f85b9", name: "ActionKing", domain: "actionking.se" };
const TARGET_SHOP = { id: "e6ad2afc-e468-49a7-8d33-9b1837419ed8", name: "EUDroneParts", domain: "ya1xhg-x6.myshopify.com" };

type Migration = { id: string; status: string; stats: any; error: string | null };
type Item = { object_type: string; approval_status: string | null; publish_status: string | null; error: string | null };
type Log = { id: string; event: string; message: string | null; level: string | null; created_at: string };

export default function ShopifyDroneClone() {
  const [migrationId, setMigrationId] = useState<string | null>(() => localStorage.getItem("drone_clone_migration_id"));
  const [migration, setMigration] = useState<Migration | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [themeResult, setThemeResult] = useState<any>(null);

  async function refresh(id = migrationId) {
    if (!id) return;
    const { data, error } = await supabase.functions.invoke("shopify-drone-clone", { body: { action: "status", migration_id: id } });
    if (error) return;
    setMigration(data.migration);
    setItems(data.items || []);
    setLogs(data.logs || []);
  }

  useEffect(() => {
    if (!migrationId) return;
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [migrationId]);

  async function start() {
    setBusy("start");
    try {
      const { data, error } = await supabase.functions.invoke("shopify-drone-clone", {
        body: { action: "start", source_shop_id: SOURCE_SHOP.id, target_shop_id: TARGET_SHOP.id, conflict: "merge" },
      });
      if (error) throw error;
      setMigrationId(data.migration.id);
      localStorage.setItem("drone_clone_migration_id", data.migration.id);
      toast.success("Migration skapad");
    } catch (e: any) { toast.error(e.message || "Kunde inte skapa migration"); }
    finally { setBusy(null); }
  }

  async function scan() {
    if (!migrationId) return;
    setBusy("scan");
    try {
      const { data, error } = await supabase.functions.invoke("shopify-drone-clone", { body: { action: "scan", migration_id: migrationId } });
      if (error) throw error;
      toast.success(`Scan klar: ${data.stats?.products_drone || 0} produkter, ${data.stats?.collections_drone || 0} collections`);
      refresh();
    } catch (e: any) { toast.error(e.message || "Scan misslyckades"); }
    finally { setBusy(null); }
  }

  async function publishBatch() {
    if (!migrationId) return;
    setBusy("publish");
    try {
      const { data, error } = await supabase.functions.invoke("shopify-drone-clone", { body: { action: "publish", migration_id: migrationId, limit: 20 } });
      if (error) throw error;
      toast.success(`Batch klar: ok=${data.ok} fail=${data.fail} skipped=${data.skipped}${data.done ? " — alla klara!" : ""}`);
      refresh();
    } catch (e: any) { toast.error(e.message || "Publicering misslyckades"); }
    finally { setBusy(null); }
  }

  async function cloneTheme() {
    setBusy("theme");
    setThemeResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("shopify-clone-theme", {
        body: { source_shop_id: SOURCE_SHOP.id, target_shop_id: TARGET_SHOP.id },
      });
      if (error) throw error;
      setThemeResult(data);
      toast.success(`Tema kopierat: ${data.copied} assets`);
    } catch (e: any) { toast.error(e.message || "Tema-kopiering misslyckades"); }
    finally { setBusy(null); }
  }

  function reset() {
    localStorage.removeItem("drone_clone_migration_id");
    setMigrationId(null); setMigration(null); setItems([]); setLogs([]);
  }

  const itemCounts = {
    total: items.length,
    products: items.filter((i) => i.object_type === "product").length,
    collections: items.filter((i) => i.object_type === "collection").length,
    published: items.filter((i) => i.publish_status === "published").length,
    failed: items.filter((i) => i.publish_status === "failed").length,
    pending: items.filter((i) => !i.publish_status).length,
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Drönar-migrering: ActionKing → EUDroneParts</h1>
        <p className="text-sm text-muted-foreground mt-1">Kopierar alla drönar-relaterade produkter, collections, metafields, bilder och tema.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Butiker</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Källa</div>
            <div className="text-muted-foreground">{SOURCE_SHOP.name} · {SOURCE_SHOP.domain}</div>
          </div>
          <div>
            <div className="font-medium">Mål</div>
            <div className="text-muted-foreground">{TARGET_SHOP.name} · {TARGET_SHOP.domain}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Steg 1–3: Produkter & Collections</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={start} disabled={!!busy} variant="outline">
              {busy === "start" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              1. Skapa migration
            </Button>
            <Button onClick={scan} disabled={!migrationId || !!busy} variant="outline">
              {busy === "scan" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ListChecks className="h-4 w-4 mr-2" />}
              2. Scanna källa
            </Button>
            <Button onClick={publishBatch} disabled={!migrationId || !!busy || itemCounts.pending === 0}>
              {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              3. Publicera batch ({itemCounts.pending})
            </Button>
            {migrationId && <Button variant="ghost" onClick={reset}>Återställ</Button>}
          </div>

          {migration && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">Status: {migration.status}</Badge>
                <Badge variant="outline">Items: {itemCounts.total}</Badge>
                <Badge variant="outline">Produkter: {itemCounts.products}</Badge>
                <Badge variant="outline">Collections: {itemCounts.collections}</Badge>
                <Badge>Publicerade: {itemCounts.published}</Badge>
                {itemCounts.failed > 0 && <Badge variant="destructive">Fel: {itemCounts.failed}</Badge>}
                <Badge variant="secondary">Kvar: {itemCounts.pending}</Badge>
              </div>
              {migration.error && <div className="text-sm text-destructive">{migration.error}</div>}
              {migration.stats && (
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{JSON.stringify(migration.stats, null, 2)}</pre>
              )}
            </div>
          )}

          {logs.length > 0 && (
            <div className="border rounded-lg max-h-72 overflow-y-auto divide-y">
              {logs.map((l) => (
                <div key={l.id} className="p-2 text-xs flex gap-3">
                  <span className="text-muted-foreground shrink-0 w-32">{new Date(l.created_at).toLocaleTimeString()}</span>
                  <span className={`font-medium shrink-0 w-32 ${l.level === "error" ? "text-destructive" : ""}`}>{l.event}</span>
                  <span className="text-muted-foreground">{l.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Tema-kopiering</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Hämtar publicerat tema från {SOURCE_SHOP.name} och skapar det som ett opublicerat tema i {TARGET_SHOP.name}.
            Du publicerar det manuellt i Shopify Admin när du granskat det.
          </p>
          <Button onClick={cloneTheme} disabled={!!busy} variant="outline">
            {busy === "theme" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Palette className="h-4 w-4 mr-2" />}
            Kopiera tema
          </Button>
          {themeResult && (
            <div className="text-sm space-y-1">
              <div>Källa: {themeResult.source_theme?.name}</div>
              <div>Mål: <a className="underline" href={themeResult.target_theme?.preview_url} target="_blank" rel="noopener noreferrer">{themeResult.target_theme?.name}</a></div>
              <div>Assets kopierade: <strong>{themeResult.copied}</strong>{themeResult.failed > 0 && <> · Fel: <span className="text-destructive">{themeResult.failed}</span></>}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
