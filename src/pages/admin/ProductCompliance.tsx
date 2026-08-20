// @ts-nocheck -- Migration split-brain: generated types.ts targets a different project schema.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Globe, AlertTriangle, CheckCircle2, Loader2, Database, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type OriginSource = "supplier_api" | "default_cn" | "manual_override";

interface ProductComplianceRow {
  id: string;
  shop_id: string;
  sku: string;
  product_title: string | null;
  hs_code: string | null;
  country_of_origin: string;
  origin_verified: boolean;
  origin_source: OriginSource | null;
  origin_last_verified_at: string | null;
  contains_battery: boolean;
  compliance_review_required: boolean;
  compliance_review_reasons: string[];
  compliance_status?: string | null;
  auto_publish_blocked: boolean;
  auto_publish_block_reason: string | null;
  force_publish?: boolean;
  is_published?: boolean;
  synced_to_shopify_at: string | null;
}

interface KpiSnapshot {
  snapshot_date: string;
  total_sunsky: number;
  published_count: number;
  blocked_count: number;
  review_required_count: number;
  fallback_cn_count: number;
  missing_hs_count: number;
  risk_product_count: number;
  battery_product_count: number;
  manual_override_count: number;
  compliance_ready_count: number;
}

function originBadge(row: ProductComplianceRow) {
  if (row.origin_verified) {
    return (
      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Verifierat ({row.country_of_origin})
      </Badge>
    );
  }
  if (row.origin_source === "default_cn") {
    return (
      <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
        Standard CN
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-destructive/15 text-destructive">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Ej verifierat
    </Badge>
  );
}

const ORIGIN_SOURCES: { value: OriginSource | "all"; label: string }[] = [
  { value: "all", label: "Alla källor" },
  { value: "supplier_api", label: "Leverantörs-API" },
  { value: "default_cn", label: "Standard CN" },
  { value: "manual_override", label: "Manuell" },
];

export default function ProductCompliance() {
  const { tenant } = useTenant();
  const tenantId = tenant?.id;
  const [rows, setRows] = useState<ProductComplianceRow[]>([]);
  const [shops, setShops] = useState<{ id: string; name: string }[]>([]);
  const [shopId, setShopId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "yes" | "no">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "yes" | "no">("all");
  const [editing, setEditing] = useState<ProductComplianceRow | null>(null);
  const [editCountry, setEditCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [trend7, setTrend7] = useState<KpiSnapshot[]>([]);
  const [trend30, setTrend30] = useState<KpiSnapshot[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!tenantId) return;
    void (async () => {
      const { data } = await supabase.from("shops").select("id, name").eq("tenant_id", tenantId);
      setShops(data ?? []);
      if (data?.[0]?.id) setShopId(data[0].id);
    })();
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    void loadData();
  }, [tenantId, shopId]);

  async function loadData() {
    setLoading(true);
    let q = supabase.from("product_compliance").select("*").eq("tenant_id", tenantId!).order("updated_at", { ascending: false });
    if (shopId) q = q.eq("shop_id", shopId);
    const { data, error } = await q;
    if (error) {
      toast.error("Kunde inte ladda compliance-data: " + error.message);
      setRows([]);
    } else {
      setRows((data as ProductComplianceRow[]) ?? []);
    }
    if (shopId) {
      const since30 = new Date();
      since30.setDate(since30.getDate() - 30);
      const { data: snapshots } = await supabase
        .from("compliance_kpi_snapshots")
        .select("*")
        .eq("shop_id", shopId)
        .gte("snapshot_date", since30.toISOString().slice(0, 10))
        .order("snapshot_date", { ascending: true });
      const snaps = (snapshots as KpiSnapshot[]) ?? [];
      setTrend30(snaps);
      setTrend7(snaps.slice(-7));
    }
    setLoading(false);
  }

  const countries = useMemo(() => {
    const set = new Set(rows.map((r) => r.country_of_origin).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (verifiedFilter === "yes" && !r.origin_verified) return false;
      if (verifiedFilter === "no" && r.origin_verified) return false;
      if (sourceFilter !== "all" && r.origin_source !== sourceFilter) return false;
      if (countryFilter !== "all" && r.country_of_origin !== countryFilter) return false;
      if (reviewFilter === "yes" && !r.compliance_review_required) return false;
      if (reviewFilter === "no" && r.compliance_review_required) return false;
      if (statusFilter !== "all" && r.compliance_status !== statusFilter) return false;
      return true;
    });
  }, [rows, verifiedFilter, sourceFilter, countryFilter, reviewFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    published: rows.filter((r) => r.is_published).length,
    verified: rows.filter((r) => r.origin_verified).length,
    defaultCn: rows.filter((r) => r.origin_source === "default_cn").length,
    missingHs: rows.filter((r) => !r.hs_code).length,
    reviewRequired: rows.filter((r) => r.compliance_status === "review_required" || r.compliance_review_required).length,
    blocked: rows.filter((r) => r.compliance_status === "blocked" || r.auto_publish_blocked).length,
    ready: rows.filter((r) => r.compliance_status === "compliance_ready").length,
    risk: rows.filter((r) => r.compliance_review_required).length,
    battery: rows.filter((r) => r.contains_battery).length,
    manualOverride: rows.filter((r) => r.origin_source === "manual_override" || r.force_publish).length,
  }), [rows]);

  async function saveManualOverride() {
    if (!editing || !shopId) return;
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("compliance-sync", {
        body: {
          action: "manual_override",
          shop_id: shopId,
          sku: editing.sku,
          country_of_origin: editCountry.toUpperCase(),
        },
      });
      if (error) throw error;
      toast.success("Ursprungsland uppdaterat");
      setEditing(null);
      await loadData();
    } catch (e: unknown) {
      toast.error("Kunde inte spara: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }

  if (!tenantId) return <div className="p-6">Laddar...</div>;

  return (
    <div className="space-y-4 p-3 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Produktcompliance
          </h1>
          <p className="text-sm text-muted-foreground">
            Ursprungsland, HS-kod och publiceringsregler för SUNSKY-import
          </p>
        </div>
        {shops.length > 1 && (
          <Select value={shopId} onValueChange={setShopId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Butik" />
            </SelectTrigger>
            <SelectContent>
              {shops.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button variant="outline" asChild>
          <Link to="/admin/product-compliance/backfill-sunsky">
            <Database className="h-4 w-4 mr-2" /> Backfill SUNSKY
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs">SUNSKY totalt</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.total}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs">Publicerade</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.published}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs text-destructive">Blockerade</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.blocked}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs text-amber-600">Review</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.reviewRequired}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs text-emerald-600">Redo</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.ready}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs text-amber-600">Fallback CN</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.defaultCn}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs">Utan HS</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.missingHs}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs">Risk</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.risk}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs">Batteri</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.battery}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs">Overrides</CardTitle></CardHeader><CardContent className="text-xl font-bold">{stats.manualOverride}</CardContent></Card>
      </div>

      {(trend7.length > 0 || trend30.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Trend (blockerade / redo)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Senaste 7 dagar: {trend7.map((s) => `${s.snapshot_date}: ${s.blocked_count} blocked / ${s.compliance_ready_count} ready`).join(" · ") || "—"}</p>
            <p>30 dagar: {trend30.length} snapshots</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: Alla</SelectItem>
            <SelectItem value="compliance_ready">compliance_ready</SelectItem>
            <SelectItem value="review_required">review_required</SelectItem>
            <SelectItem value="blocked">blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Totalt</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.total}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-600">Verifierade</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.verified}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-amber-600">Standard CN</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.defaultCn}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Granskning krävs</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.reviewRequired}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-destructive">Publicering blockerad</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.blocked}</CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={verifiedFilter} onValueChange={(v) => setVerifiedFilter(v as typeof verifiedFilter)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Ursprung verifierat" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Verifierat: Alla</SelectItem>
            <SelectItem value="yes">Verifierat: Ja</SelectItem>
            <SelectItem value="no">Verifierat: Nej</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Ursprungskälla" /></SelectTrigger>
          <SelectContent>
            {ORIGIN_SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Land" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla länder</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={reviewFilter} onValueChange={(v) => setReviewFilter(v as typeof reviewFilter)}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Compliance review" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Review: Alla</SelectItem>
            <SelectItem value="yes">Review krävs</SelectItem>
            <SelectItem value="no">Review ej krävs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground p-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Laddar...
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead>HS-kod</TableHead>
                <TableHead>Ursprung</TableHead>
                <TableHead>Källa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Publicering</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Inga produkter matchar filtren
                  </TableCell>
                </TableRow>
              ) : filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{row.product_title}</TableCell>
                  <TableCell>{row.hs_code || "—"}</TableCell>
                  <TableCell>{originBadge(row)}</TableCell>
                  <TableCell className="text-xs">{row.origin_source ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.compliance_status ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    {row.compliance_review_required ? (
                      <Badge variant="outline" className="bg-amber-500/15 text-amber-700">
                        Ja
                        {row.compliance_review_reasons?.length > 0 && (
                          <span className="ml-1 hidden lg:inline">({row.compliance_review_reasons[0]})</span>
                        )}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Nej</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.auto_publish_blocked ? (
                      <Badge variant="destructive">Blockerad</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(row);
                        setEditCountry(row.country_of_origin);
                      }}
                    >
                      Redigera
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manuell överskrivning — {editing?.sku}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="origin-country">Ursprungsland (ISO 3166-1 alpha-2)</Label>
            <Input
              id="origin-country"
              value={editCountry}
              onChange={(e) => setEditCountry(e.target.value.toUpperCase())}
              placeholder="CN"
              maxLength={2}
            />
            <p className="text-xs text-muted-foreground">
              Manuell överskrivning sätter origin_source=manual_override och origin_verified=true.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Avbryt</Button>
            <Button onClick={saveManualOverride} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Spara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
