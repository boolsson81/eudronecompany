import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePersistedTab } from "@/hooks/usePersistedTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Store, Plus, ShieldCheck, Sparkles, Eye, Upload, ListChecks, Database, AlertTriangle, CheckCircle2, RefreshCw, Download, Link2, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type StoreRole = "source" | "target";
interface ClonerStore {
  id: string;
  role: StoreRole;
  label: string;
  shop_domain: string;
  primary_domain: string | null;
  shop_name: string | null;
  currency: string | null;
  api_version: string;
  last_validated_at: string | null;
}

interface Migration {
  id: string;
  name: string;
  source_store_id: string;
  target_store_id: string;
  mode: "dry_run" | "create_only" | "update_existing" | "skip_existing";
  scope: { types?: string[] };
  transformation: Record<string, string>;
  ai_engine: "lovable" | "claude";
  status: string;
  stats: Record<string, any>;
  error: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
}

interface MigrationItem {
  id: string;
  object_type: string;
  source_id: string;
  source_handle: string | null;
  source_payload: any;
  transformed_payload: any | null;
  diff: Record<string, { before: any; after: any }> | null;
  approval_status: string;
  publish_status: string;
  target_id: string | null;
  error: string | null;
}

interface ClonerLog {
  id: string;
  created_at: string;
  level: string;
  event: string;
  object_type: string | null;
  object_id: string | null;
  message: string | null;
}

const OBJECT_TYPES: { id: string; label: string }[] = [
  { id: "product", label: "Produkter" },
  { id: "collection", label: "Kollektioner" },
  { id: "page", label: "Sidor" },
  { id: "blog", label: "Bloggar" },
  { id: "article", label: "Blogartiklar" },
  { id: "menu", label: "Navigationsmenyer" },
  { id: "redirect", label: "Redirects" },
  { id: "file", label: "Filer / media" },
  { id: "customer", label: "Kunder" },
  { id: "segment", label: "Kundsegment" },
  { id: "discountCode", label: "Rabattkoder" },
  { id: "automaticDiscount", label: "Automatiska rabatter" },
  { id: "metaobjectDefinition", label: "Metaobject-definitioner" },
  { id: "metaobject", label: "Metaobjects" },
  { id: "metafieldDefinition", label: "Metafield-definitioner" },
  { id: "shopPolicy", label: "Policies (privacy/refund/ToS)" },
  { id: "locale", label: "Locales / översättningar" },
  { id: "theme", label: "Teman (alla teman + assets)" },
];

export default function ShopifyCloner() {
  const { migrationId } = useParams();
  const navigate = useNavigate();

  const [stores, setStores] = useState<ClonerStore[]>([]);
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [currentMigration, setCurrentMigration] = useState<Migration | null>(null);
  const [items, setItems] = useState<MigrationItem[]>([]);
  const [contentItems, setContentItems] = useState<MigrationItem[]>([]);
  const [fileCount, setFileCount] = useState<number>(0);
  const [logs, setLogs] = useState<ClonerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = usePersistedTab("ShopifyCloner.activeTab", "stores");
  const [busy, setBusy] = useState<string | null>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [publishProgress, setPublishProgress] = useState<{
    running: boolean;
    total: number;
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    currentBatch: number;
  } | null>(null);

  // store dialog
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState<{ role: StoreRole; label: string; shop_domain: string; access_token: string }>({
    role: "source", label: "", shop_domain: "", access_token: "",
  });

  // migration dialog
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [newMigration, setNewMigration] = useState<{ name: string; source_store_id: string; target_store_id: string; types: string[] }>({
    name: "", source_store_id: "", target_store_id: "", types: OBJECT_TYPES.filter((t) => t.id !== "redirect").map((t) => t.id),
  });

  // Urval & ordning för transformering
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [orderMode, setOrderMode] = useState<"title_asc" | "title_desc" | "type_asc" | "newest" | "oldest">("title_asc");
  const [batchSize, setBatchSize] = useState<number>(25);
  const [onlyUntransformed, setOnlyUntransformed] = useState<boolean>(true);



  const loadAll = async () => {
    setLoading(true);
    const [{ data: s }, { data: m }] = await Promise.all([
      supabase.from("cloner_stores" as any).select("id, role, label, shop_domain, primary_domain, shop_name, currency, api_version, last_validated_at").order("created_at", { ascending: false }),
      supabase.from("cloner_migrations" as any).select("*").order("created_at", { ascending: false }),
    ]);
    setStores((s || []) as any);
    setMigrations((m || []) as any);
    if (migrationId) {
      const found = (m || []).find((x: any) => x.id === migrationId) as any;
      if (found) {
        setCurrentMigration(found);
        await loadItemsAndLogs(found.id);
      }
    }
    setLoading(false);
  };

  const loadItemsAndLogs = async (mid: string) => {
    // Files can be 30k+ rows and blow past the 1000-row default. Fetch each
    // object type separately so pages/blogs/articles are never skipped by a
    // large product/file result set or unstable cross-type pagination.
    const PAGE_SIZE = 1000;
    const itemTypes = Array.from(new Set([
      ...OBJECT_TYPES.map((t) => t.id),
      "translation",
      "shippingZone",
      "giftCard",
      "checkoutBranding",
    ])).filter((type) => type !== "file" && !["page", "blog", "article"].includes(type));
    const { data: migrationRow } = await supabase
      .from("cloner_migrations" as any)
      .select("tenant_id, stats, status, updated_at")
      .eq("id", mid)
      .maybeSingle();
    const tenantId = (migrationRow as any)?.tenant_id;
    if (migrationRow) {
      setCurrentMigration((prev) => prev?.id === mid ? { ...prev, ...(migrationRow as any) } : prev);
    }
    const scoped = (query: any) => tenantId ? query.eq("tenant_id", tenantId) : query;

    const loadType = async (objectType: string) => {
      const typeItems: any[] = [];
      let from = 0;
      while (true) {
        const { data: chunk, error } = await scoped(
          supabase
            .from("cloner_migration_items" as any)
            .select("*")
            .eq("migration_id", mid)
            .eq("object_type", objectType)
        )
          .order("id", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error || !chunk) break;
        typeItems.push(...chunk);
        if (chunk.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
        if (from > 50000) break; // safety cap
      }
      return typeItems;
    };

    const loadContentType = async (objectType: "page" | "blog" | "article") => {
      const rows: any[] = [];
      let from = 0;
      while (true) {
        const { data: chunk, error } = await scoped(
          supabase
            .from("cloner_migration_items" as any)
            .select("*")
            .eq("migration_id", mid)
            .eq("object_type", objectType)
        )
          .order("source_handle", { ascending: true, nullsFirst: false })
          .range(from, from + PAGE_SIZE - 1);
        if (error || !chunk) {
          console.warn(`Kunde inte läsa ${objectType} från migrationen`, error);
          break;
        }
        rows.push(...chunk);
        if (chunk.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }
      return rows;
    };

    const contentGroups = await Promise.all([loadContentType("page"), loadContentType("blog"), loadContentType("article")]);
    const loadedContent = contentGroups.flat() as any;
    setContentItems(loadedContent);

    const [itemGroups, { count: fc }, { data: lg }] = await Promise.all([
      Promise.all(itemTypes.map(loadType)),
      scoped(
        supabase
          .from("cloner_migration_items" as any)
          .select("id", { count: "exact", head: true })
          .eq("migration_id", mid)
          .eq("object_type", "file")
      ),
      scoped(
        supabase
          .from("cloner_logs" as any)
          .select("*")
          .eq("migration_id", mid)
      )
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    setItems([...loadedContent, ...itemGroups.flat()] as any);
    setFileCount(fc || 0);
    setLogs((lg || []) as any);
  };


  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [migrationId]);
  useEffect(() => { if (migrationId && currentMigration) setTab("setup"); }, [migrationId, currentMigration]);

  // ===== Stores =====
  const saveStore = async () => {
    if (!newStore.label || !newStore.shop_domain || !newStore.access_token) {
      toast.error("Fyll i alla fält");
      return;
    }
    setBusy("save-store");
    const { data, error } = await supabase.functions.invoke("shopify-cloner-connect", { body: newStore });
    setBusy(null);
    if (error || (data as any)?.error) {
      toast.error(`Anslutning misslyckades: ${(data as any)?.error || error?.message}`);
      return;
    }
    toast.success(`Ansluten: ${(data as any).shop?.name}`);
    setStoreDialogOpen(false);
    setNewStore({ role: "source", label: "", shop_domain: "", access_token: "" });
    loadAll();
  };

  const deleteStore = async (id: string) => {
    if (!confirm("Ta bort denna butiksanslutning?")) return;
    await supabase.from("cloner_stores" as any).delete().eq("id", id);
    loadAll();
  };

  // ===== Migration =====
  const createMigration = async () => {
    if (!newMigration.name || !newMigration.source_store_id || !newMigration.target_store_id) {
      toast.error("Välj namn, källa och mål"); return;
    }
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("user_id", (await supabase.auth.getUser()).data.user?.id || "").maybeSingle();
    if (!profile?.tenant_id) { toast.error("Ingen tenant"); return; }
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase.from("cloner_migrations" as any).insert({
      tenant_id: profile.tenant_id,
      created_by: user!.id,
      name: newMigration.name,
      source_store_id: newMigration.source_store_id,
      target_store_id: newMigration.target_store_id,
      mode: "dry_run",
      scope: { types: newMigration.types.length ? newMigration.types : ["product", "collection", "page"] },
      transformation: {},
      ai_engine: "lovable",
      status: "draft",
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setMigrationDialogOpen(false);
    setNewMigration({ name: "", source_store_id: "", target_store_id: "", types: OBJECT_TYPES.filter((t) => t.id !== "redirect").map((t) => t.id) });
    toast.success("Migration skapad");
    navigate(`/admin/shopify-cloner/${(data as any).id}`);

  };

  const updateMigration = async (patch: Partial<Migration>) => {
    if (!currentMigration) return;
    const { error } = await supabase.from("cloner_migrations" as any).update(patch).eq("id", currentMigration.id);
    if (error) { toast.error(error.message); return; }
    setCurrentMigration({ ...currentMigration, ...patch } as Migration);
  };

  const runScan = async () => {
    if (!currentMigration) return;
    const heavyTypes = ["customer", "product", "file", "metaobject", "translation", "article"];
    const scopeTypes = currentMigration.scope.types || [];
    if (scopeTypes.some((t: string) => heavyTypes.includes(t))) {
      await queueJob("scan", 5);
      toast.info("Stora datamängder skannas i bakgrunden i mindre batchar för att undvika timeout.");
      return;
    }

    setBusy("scan");
    const { data, error } = await supabase.functions.invoke("shopify-cloner-scan", { body: { migration_id: currentMigration.id } });
    setBusy(null);
    if (error || (data as any)?.error) { toast.error((data as any)?.error || error?.message || "Scan failed"); return; }
    toast.success(`Scan klar: ${Object.entries((data as any).stats || {}).map(([k, v]) => `${k}=${v}`).join(", ")}`);
    loadItemsAndLogs(currentMigration.id);
  };

  const runTransform = async (limit = 25, itemIds?: string[]) => {
    if (!currentMigration) return;
    setBusy("transform");
    const body: any = { migration_id: currentMigration.id };
    if (itemIds && itemIds.length) body.item_ids = itemIds;
    else body.limit = limit;
    const { data, error } = await supabase.functions.invoke("shopify-cloner-transform", { body });
    setBusy(null);
    if (error || (data as any)?.error) { toast.error((data as any)?.error || error?.message || "Transform failed"); return; }
    toast.success(`Transformerade ${(data as any).ok}, fel: ${(data as any).fail}`);
    loadItemsAndLogs(currentMigration.id);
  };

  const runPublishBatch = async (continuous = false) => {
    if (!currentMigration) return;
    const isDryRun = currentMigration.mode === "dry_run";
    setPublishProgress({
      running: true,
      total: publishQueueStats.pendingTotal,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      currentBatch: 0,
    });

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    let batch = 0;

    try {
      while (true) {
        batch++;
        setBusy("publish");
        const { data, error } = await supabase.functions.invoke("shopify-cloner-publish", {
          body: { migration_id: currentMigration.id, limit: batchSize },
        });
        if (error || (data as any)?.error) {
          toast.error((data as any)?.error || error?.message || "Publish failed");
          break;
        }
        const r = data as any;
        const batchTotal = (r.created || 0) + (r.updated || 0) + (r.skipped || 0) + (r.failed || 0);
        totalCreated += r.created || 0;
        totalUpdated += r.updated || 0;
        totalSkipped += r.skipped || 0;
        totalFailed += r.failed || 0;
        setPublishProgress({
          running: true,
          total: publishQueueStats.pendingTotal,
          processed: totalCreated + totalUpdated + totalSkipped + totalFailed,
          created: totalCreated,
          updated: totalUpdated,
          skipped: totalSkipped,
          failed: totalFailed,
          currentBatch: batch,
        });
        await loadItemsAndLogs(currentMigration.id);
        if (!continuous || batchTotal === 0 || isDryRun) break;
        if (totalCreated + totalUpdated + totalSkipped + totalFailed >= publishQueueStats.pendingTotal) break;
      }
      toast.success(
        `${isDryRun ? "Dry run" : "Klart"}: skapade ${totalCreated}, uppdaterade ${totalUpdated}, hoppade över ${totalSkipped}, fel ${totalFailed}`,
      );
    } finally {
      setBusy(null);
      setPublishProgress((p) => (p ? { ...p, running: false } : null));
    }
  };

  const runPublish = () => setPublishConfirmOpen(true);

  const runLinkCollections = async () => {
    if (!currentMigration) return;
    setBusy("link-collections");
    const { data, error } = await supabase.functions.invoke("shopify-cloner-publish", {
      body: { migration_id: currentMigration.id, link_collections: true, limit: 100 },
    });
    setBusy(null);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Collection linking failed");
      return;
    }
    const r = data as any;
    toast.success(
      `Kollektionslänkning: ${r.collections_linked} länkar, ${r.products_processed} produkter, ${r.link_failed} fel`,
    );
    loadItemsAndLogs(currentMigration.id);
  };

  const downloadCloneReport = () => {
    if (!currentMigration) return;
    const report = {
      generated_at: new Date().toISOString(),
      migration: {
        id: currentMigration.id,
        name: currentMigration.name,
        mode: currentMigration.mode,
        status: currentMigration.status,
        stats: currentMigration.stats,
      },
      source_store: sourceStore ? { label: sourceStore.label, shop_domain: sourceStore.shop_domain, primary_domain: sourceStore.primary_domain } : null,
      target_store: targetStore ? { label: targetStore.label, shop_domain: targetStore.shop_domain, primary_domain: targetStore.primary_domain } : null,
      summary: {
        ...dashStats,
        ...publishQueueStats,
      },
      items: items.map((it) => ({
        object_type: it.object_type,
        source_id: it.source_id,
        source_handle: it.source_handle,
        approval_status: it.approval_status,
        publish_status: it.publish_status,
        target_id: it.target_id,
        error: it.error,
      })),
      logs: logs.map((l) => ({
        created_at: l.created_at,
        level: l.level,
        event: l.event,
        object_type: l.object_type,
        object_id: l.object_id,
        message: l.message,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shopify-clone-report-${currentMigration.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Clone-rapport nedladdad");
  };

  const runRemap = async () => {
    if (!currentMigration) return;
    setBusy("publish");
    const { data, error } = await supabase.functions.invoke("shopify-cloner-publish", { body: { migration_id: currentMigration.id, remap_metafields: true, limit: 200 } });
    setBusy(null);
    if (error || (data as any)?.error) { toast.error((data as any)?.error || error?.message || "Remap failed"); return; }
    const r = data as any;
    toast.success(`Metafält‑remap klar: ${r.remap_items} objekt, ${r.remap_references} referenser, fel ${r.remap_failed}`);
    loadItemsAndLogs(currentMigration.id);
  };

  const runActivateTheme = async () => {
    if (!currentMigration) return;
    setBusy("publish");
    const { data, error } = await supabase.functions.invoke("shopify-cloner-publish", { body: { migration_id: currentMigration.id, activate_theme: true } });
    setBusy(null);
    if (error || (data as any)?.error) { toast.error((data as any)?.error || error?.message || "Aktivering misslyckades"); return; }
    toast.success("Temat är nu aktivt i målbutiken");
    loadItemsAndLogs(currentMigration.id);
  };

  const runRemapThemeSettings = async () => {
    if (!currentMigration) return;
    setBusy("publish");
    const { data, error } = await supabase.functions.invoke("shopify-cloner-publish", { body: { migration_id: currentMigration.id, remap_theme_settings: true } });
    setBusy(null);
    if (error || (data as any)?.error) { toast.error((data as any)?.error || error?.message || "Remap misslyckades"); return; }
    const r = data as any;
    toast.success(`Tema-inställningar remappade: ${r.updated}/${r.scanned} JSON-assets uppdaterade`);
    loadItemsAndLogs(currentMigration.id);
  };

  const updateImageOptimization = async (patch: Record<string, unknown>) => {
    if (!currentMigration) return;
    const current = (currentMigration.transformation as any) || {};
    const nextImg = { ...(current.imageOptimization || { enabled: true, format: "webp", maxWidth: 2048, quality: 82 }), ...patch };
    const nextTransform = { ...current, imageOptimization: nextImg };
    const { error } = await supabase.from("cloner_migrations").update({ transformation: nextTransform }).eq("id", currentMigration.id);
    if (error) { toast.error(error.message); return; }
    setCurrentMigration({ ...currentMigration, transformation: nextTransform } as any);
  };

  const [imageTest, setImageTest] = useState<{ open: boolean; loading: boolean; data: any | null }>({ open: false, loading: false, data: null });
  const runImageTest = async (sample = 5) => {
    if (!currentMigration) return;
    setImageTest({ open: true, loading: true, data: null });
    const { data, error } = await supabase.functions.invoke("shopify-cloner-publish", {
      body: { migration_id: currentMigration.id, image_test: true, image_test_sample: sample },
    });
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Bildtest misslyckades");
      setImageTest({ open: false, loading: false, data: null });
      return;
    }
    setImageTest({ open: true, loading: false, data });
  };



  const queueJob = async (jobType: "scan" | "transform" | "publish", batch = 25) => {
    if (!currentMigration) return;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("user_id", (await supabase.auth.getUser()).data.user?.id || "").maybeSingle();
    if (!profile?.tenant_id) { toast.error("Ingen tenant"); return; }
    const { error } = await supabase.from("cloner_jobs" as any).insert({
      migration_id: currentMigration.id,
      tenant_id: profile.tenant_id,
      job_type: jobType,
      batch_size: batch,
      payload: jobType === "scan" ? { types: currentMigration.scope.types } : {},
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`${jobType} köad i bakgrunden (batch ${batch}). Cron triggas varje minut.`);
    loadItemsAndLogs(currentMigration.id);
  };

  const setApproval = async (itemId: string, status: "approved" | "rejected") => {
    await supabase.from("cloner_migration_items" as any).update({ approval_status: status }).eq("id", itemId);
    loadItemsAndLogs(currentMigration!.id);
  };

  const bulkApprove = async () => {
    if (!currentMigration) return;
    await supabase.from("cloner_migration_items" as any).update({ approval_status: "approved" }).eq("migration_id", currentMigration.id).eq("approval_status", "pending");
    toast.success("Alla väntande godkända");
    loadItemsAndLogs(currentMigration.id);
  };

  const dashStats = useMemo(() => {
    const total = items.length;
    const approved = items.filter((i) => i.approval_status === "approved").length;
    const transformed = items.filter((i) => i.transformed_payload).length;
    const published = items.filter((i) => i.publish_status === "published").length;
    const failed = items.filter((i) => i.publish_status === "failed").length;
    const products = items.filter((i) => i.object_type === "product");
    const missingSeo = products.filter((p) => !p.source_payload?.seo?.title || !p.source_payload?.seo?.description).length;
    const missingImages = products.filter((p) => !(p.source_payload?.media?.nodes?.length)).length;
    const missingMetafields = products.filter((p) => !(p.source_payload?.metafields?.nodes?.length)).length;
    const skipped = items.filter((i) => i.publish_status === "skipped").length;
    return { total, approved, transformed, published, failed, skipped, missingSeo, missingImages, missingMetafields, products: products.length };
  }, [items]);

  const sourceStore = useMemo(
    () => stores.find((s) => s.id === currentMigration?.source_store_id) ?? null,
    [stores, currentMigration?.source_store_id],
  );
  const targetStore = useMemo(
    () => stores.find((s) => s.id === currentMigration?.target_store_id) ?? null,
    [stores, currentMigration?.target_store_id],
  );

  const publishQueueStats = useMemo(() => {
    const approvedPending = items.filter(
      (i) => i.approval_status === "approved" && i.publish_status !== "published",
    );
    const pendingProducts = approvedPending.filter((i) => i.object_type === "product").length;
    const pendingCollections = approvedPending.filter((i) => i.object_type === "collection").length;
    const completed = items.filter((i) => i.publish_status === "published").length;
    const skippedItems = items.filter((i) => i.publish_status === "skipped").length;
    const failedItems = items.filter((i) => i.publish_status === "failed").length;
    const estimatedSeconds = pendingProducts * 2.5 + pendingCollections * 1.5 + approvedPending.length * 0.5;
    return {
      pendingTotal: approvedPending.length,
      pendingProducts,
      pendingCollections,
      completed,
      skipped: skippedItems,
      failed: failedItems,
      estimatedMinutes: Math.max(1, Math.ceil(estimatedSeconds / 60)),
    };
  }, [items]);

  // Tillgängliga produkttyper från skannade objekt
  const availableProductTypes = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      if (it.object_type !== "product") continue;
      const pt = (it.source_payload?.productType || "").trim() || "(utan typ)";
      map.set(pt, (map.get(pt) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  // Tillgängliga leverantörer (vendor) från skannade objekt
  const availableVendors = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      if (it.object_type !== "product") continue;
      const v = (it.source_payload?.vendor || "").trim() || "(utan leverantör)";
      map.set(v, (map.get(v) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  // Extrahera leverantörer från metafält (custom.leverantor / supplier)
  const getItemSuppliers = (it: MigrationItem): string[] => {
    const nodes = (it.source_payload?.metafields?.nodes || []) as any[];
    const out: string[] = [];
    for (const n of nodes) {
      const key = (n?.key || "").toLowerCase();
      if (key !== "leverantor" && key !== "leverantör" && key !== "supplier") continue;
      const raw = n?.value;
      if (raw == null || raw === "") continue;
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) parsed.forEach((x) => x && out.push(String(x).trim()));
        else out.push(String(parsed).trim());
      } catch {
        out.push(String(raw).trim());
      }
    }
    return out.filter(Boolean);
  };

  // Tillgängliga leverantörer (metafält) från skannade objekt
  const availableSuppliers = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      if (it.object_type !== "product") continue;
      const suppliers = getItemSuppliers(it);
      if (!suppliers.length) {
        map.set("(utan leverantör)", (map.get("(utan leverantör)") || 0) + 1);
      } else {
        for (const s of suppliers) map.set(s, (map.get(s) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  // Urval baserat på filter + ordning
  const orderedSelection = useMemo(() => {
    let list = items.filter((i) => i.object_type === "product");
    if (selectedProductTypes.length) {
      list = list.filter((i) => {
        const pt = (i.source_payload?.productType || "").trim() || "(utan typ)";
        return selectedProductTypes.includes(pt);
      });
    }
    if (selectedVendors.length) {
      list = list.filter((i) => {
        const v = (i.source_payload?.vendor || "").trim() || "(utan leverantör)";
        return selectedVendors.includes(v);
      });
    }
    if (selectedSuppliers.length) {
      list = list.filter((i) => {
        const suppliers = getItemSuppliers(i);
        if (!suppliers.length) return selectedSuppliers.includes("(utan leverantör)");
        return suppliers.some((s) => selectedSuppliers.includes(s));
      });
    }
    if (onlyUntransformed) list = list.filter((i) => !i.transformed_payload);
    const getTitle = (i: MigrationItem) => (i.source_payload?.title || i.source_handle || "").toLowerCase();
    const getType = (i: MigrationItem) => (i.source_payload?.productType || "").toLowerCase();
    const getDate = (i: MigrationItem) =>
      i.source_payload?.createdAt || i.source_payload?.publishedAt || i.source_payload?.updatedAt || "";
    list = [...list].sort((a, b) => {
      switch (orderMode) {
        case "title_asc": return getTitle(a).localeCompare(getTitle(b));
        case "title_desc": return getTitle(b).localeCompare(getTitle(a));
        case "type_asc": return getType(a).localeCompare(getType(b)) || getTitle(a).localeCompare(getTitle(b));
        case "newest": return getDate(b).localeCompare(getDate(a));
        case "oldest": return getDate(a).localeCompare(getDate(b));
      }
    });
    return list;
  }, [items, selectedProductTypes, selectedVendors, selectedSuppliers, orderMode, onlyUntransformed]);

  const runSelection = () => {
    const ids = orderedSelection.slice(0, batchSize).map((i) => i.id);
    if (!ids.length) { toast.error("Inga produkter matchar urvalet"); return; }
    runTransform(batchSize, ids);
  };

  // ===== Urval för sidor, bloggar & artiklar =====
  const [contentTab, setContentTab] = useState<"page" | "blog" | "article">("page");
  const [contentQuery, setContentQuery] = useState("");
  const [contentSelected, setContentSelected] = useState<Record<string, Set<string>>>({
    page: new Set(), blog: new Set(), article: new Set(),
  });

  const contentItemsByType = useMemo(() => {
    const groups: Record<string, MigrationItem[]> = { page: [], blog: [], article: [] };
    for (const it of contentItems) {
      if (it.object_type in groups) groups[it.object_type].push(it);
    }
    for (const k of Object.keys(groups)) {
      groups[k].sort((a, b) =>
        ((a.source_payload?.title || a.source_handle || "") as string)
          .localeCompare((b.source_payload?.title || b.source_handle || "") as string)
      );
    }
    return groups;
  }, [contentItems]);

  const scannedContentCounts = useMemo(() => {
    const scanned = ((currentMigration?.stats as any)?.scanned || {}) as Record<string, unknown>;
    return {
      page: Number(scanned.page || 0),
      blog: Number(scanned.blog || 0),
      article: Number(scanned.article || 0),
    };
  }, [currentMigration?.stats]);

  const filteredContentItems = useMemo(() => {
    const q = contentQuery.trim().toLowerCase();
    const list = contentItemsByType[contentTab] || [];
    if (!q) return list;
    return list.filter((i) =>
      ((i.source_payload?.title || "") + " " + (i.source_handle || "")).toLowerCase().includes(q)
    );
  }, [contentItemsByType, contentTab, contentQuery]);

  const toggleContentItem = (id: string, checked: boolean) => {
    setContentSelected((prev) => {
      const next = { ...prev, [contentTab]: new Set(prev[contentTab]) };
      if (checked) next[contentTab].add(id); else next[contentTab].delete(id);
      return next;
    });
  };

  const setContentSelectAllVisible = (checked: boolean) => {
    setContentSelected((prev) => {
      const next = { ...prev, [contentTab]: new Set(prev[contentTab]) };
      for (const it of filteredContentItems) {
        if (checked) next[contentTab].add(it.id); else next[contentTab].delete(it.id);
      }
      return next;
    });
  };

  const applyContentApproval = async (
    mode: "approve_selected" | "reject_unselected" | "approve_only_selected"
  ) => {
    const all = contentItemsByType[contentTab];
    const selected = contentSelected[contentTab];
    if (!all.length) { toast.error("Inga objekt skannade"); return; }
    if (!selected.size && mode !== "reject_unselected") { toast.error("Inga valda"); return; }

    const toApprove: string[] = [];
    const toReject: string[] = [];
    for (const it of all) {
      const isSel = selected.has(it.id);
      if (mode === "approve_selected" && isSel) toApprove.push(it.id);
      else if (mode === "reject_unselected" && !isSel) toReject.push(it.id);
      else if (mode === "approve_only_selected") {
        if (isSel) toApprove.push(it.id); else toReject.push(it.id);
      }
    }

    try {
      if (toApprove.length) {
        await supabase.from("cloner_migration_items" as any)
          .update({ approval_status: "approved" }).in("id", toApprove);
      }
      if (toReject.length) {
        await supabase.from("cloner_migration_items" as any)
          .update({ approval_status: "rejected" }).in("id", toReject);
      }
      toast.success(`Uppdaterat: ${toApprove.length} godkända, ${toReject.length} avvisade`);
      if (currentMigration) await loadItemsAndLogs(currentMigration.id);
    } catch (e: any) {
      toast.error(e?.message || "Kunde inte uppdatera urval");
    }
  };

  const runTransformContentSelection = () => {
    const ids = Array.from(contentSelected[contentTab]);
    if (!ids.length) { toast.error("Inga valda"); return; }
    runTransform(ids.length, ids);
  };


  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0"><Store className="h-6 w-6 text-primary" /></div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">Shopify Store Cloner</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Klona och transformera Shopify-butiker med AI</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />Uppdatera
          </Button>
        </div>
      </div>

      <Tabs persistKey={null} value={tab} onValueChange={setTab}>
        <div className="-mx-3 sm:mx-0 overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto mx-3 sm:mx-0">
            <TabsTrigger value="stores"><Store className="h-4 w-4 mr-1" />Butiker</TabsTrigger>
            <TabsTrigger value="migrations"><ListChecks className="h-4 w-4 mr-1" />Migrationer</TabsTrigger>
            {currentMigration && <>
              <TabsTrigger value="setup"><Sparkles className="h-4 w-4 mr-1" />Setup</TabsTrigger>
              <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1" />Preview</TabsTrigger>
              <TabsTrigger value="publish"><Upload className="h-4 w-4 mr-1" />Publicera</TabsTrigger>
              <TabsTrigger value="mapping"><Database className="h-4 w-4 mr-1" />Mappning</TabsTrigger>
              <TabsTrigger value="logs"><AlertTriangle className="h-4 w-4 mr-1" />Logg</TabsTrigger>
              <TabsTrigger value="dashboard"><CheckCircle2 className="h-4 w-4 mr-1" />Dashboard</TabsTrigger>
            </>}
          </TabsList>
        </div>

        {/* ============ STORES ============ */}
        <TabsContent value="stores" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={async () => {
                setBusy("import-connected");
                try {
                  const { data, error } = await supabase.functions.invoke("shopify-cloner-import-connected", { body: {} });
                  if (error || (data as any)?.error) {
                    toast.error(`Kunde inte importera: ${(data as any)?.error || error?.message}`);
                    return;
                  }
                  const imported = (data as any)?.imported ?? 0;
                  const results = (data as any)?.results ?? [];
                  if (imported > 0) toast.success(`${imported} butik(er) importerade`);
                  else toast.message("Inga nya butiker att importera", {
                    description: results.map((r: any) => `${r.shop}: ${r.status}`).join(" • "),
                  });
                  await loadAll();
                } catch (err: any) {
                  toast.error(`Kunde inte importera: ${err?.message || "okänt fel"}`);
                } finally {
                  setBusy(null);
                }
              }}
              disabled={busy === "import-connected"}
            >
              {busy === "import-connected" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Importera redan anslutna
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => setStoreDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Lägg till butik</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {stores.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant={s.role === "source" ? "secondary" : "default"}>{s.role === "source" ? "Källa" : "Mål"}</Badge>
                      {s.label}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => deleteStore(s.id)}>Ta bort</Button>
                  </div>
                  <CardDescription className="text-xs">{s.shop_domain}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div><strong>{s.shop_name}</strong></div>
                  <div className="text-muted-foreground">Domän: {s.primary_domain || "—"}</div>
                  <div className="text-muted-foreground">Valuta: {s.currency || "—"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />Validerad {s.last_validated_at ? new Date(s.last_validated_at).toLocaleString() : "—"}
                  </div>
                </CardContent>
              </Card>
            ))}
            {stores.length === 0 && !loading && (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Inga butiker kopplade ännu. Lägg till källa och mål för att börja.</CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* ============ MIGRATIONS LIST ============ */}
        <TabsContent value="migrations" className="space-y-4">
          <div className="flex justify-end">
            <Button className="w-full sm:w-auto" onClick={() => setMigrationDialogOpen(true)} disabled={stores.length < 2}>
              <Plus className="h-4 w-4 mr-2" />Ny migration
            </Button>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden space-y-2">
            {migrations.map((m) => {
              const src = stores.find((s) => s.id === m.source_store_id);
              const tgt = stores.find((s) => s.id === m.target_store_id);
              const lastRun = m.completed_at || m.updated_at || m.created_at;
              return (
                <Card key={m.id} className="cursor-pointer active:bg-accent/40" onClick={() => navigate(`/admin/shopify-cloner/${m.id}`)}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm break-words">{m.name}</div>
                      <Badge className="shrink-0">{m.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground break-all">
                      {src?.label || "?"} → {tgt?.label || "?"}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px]">{m.mode}</Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {lastRun ? new Date(lastRun).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }) : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {migrations.length === 0 && (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Inga migrationer</CardContent></Card>
            )}
          </div>

          {/* Desktop: table */}
          <Card className="hidden sm:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>Källa → Mål</TableHead>
                    <TableHead>Läge</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Senast körd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {migrations.map((m) => {
                    const src = stores.find((s) => s.id === m.source_store_id);
                    const tgt = stores.find((s) => s.id === m.target_store_id);
                    const lastRun = m.completed_at || m.updated_at || m.created_at;
                    return (
                      <TableRow
                        key={m.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/shopify-cloner/${m.id}`)}
                      >
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="text-xs">{src?.label} → {tgt?.label}</TableCell>
                        <TableCell><Badge variant="outline">{m.mode}</Badge></TableCell>
                        <TableCell><Badge>{m.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {lastRun ? new Date(lastRun).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {migrations.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Inga migrationer</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ MIGRATION TABS ============ */}
        {currentMigration && (
          <>
            <TabsContent value="setup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Innehållsväljare</CardTitle>
                  <CardDescription>Välj vilka objekttyper som ska klonas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {OBJECT_TYPES.map((t) => {
                      const checked = (currentMigration.scope.types || []).includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={checked} onCheckedChange={(c) => {
                            const types = new Set(currentMigration.scope.types || []);
                            if (c) types.add(t.id); else types.delete(t.id);
                            updateMigration({ scope: { ...currentMigration.scope, types: Array.from(types) } } as any);
                          }} />
                          <span className="text-sm">{t.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-2 flex-wrap">
                    <Button onClick={runScan} disabled={busy === "scan"}>
                      {busy === "scan" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                      Skanna källa
                    </Button>
                    <Button variant="outline" onClick={() => queueJob("scan", 5)}>Kö-köra scan (bakgrund)</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skanningsresultat</CardTitle>
                  <CardDescription>
                    Antal objekt som hittades i källbutiken per typ. Saknas en typ? Bocka i den i "Innehållsväljare" ovan och kör "Skanna källa" igen.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">
                      Inga objekt skannade ännu. Kör "Skanna källa" först.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {OBJECT_TYPES.map((t) => {
                        const count = t.id === "file"
                          ? fileCount
                          : t.id === "page"
                            ? Math.max(contentItemsByType.page.length, scannedContentCounts.page)
                            : t.id === "blog"
                              ? Math.max(contentItemsByType.blog.length, scannedContentCounts.blog)
                              : t.id === "article"
                                ? Math.max(contentItemsByType.article.length, scannedContentCounts.article)
                                : items.filter((i) => i.object_type === t.id).length;
                        const included = (currentMigration.scope.types || []).includes(t.id);
                        return (
                          <div
                            key={t.id}
                            className={`rounded-md border p-2 text-xs flex flex-col gap-0.5 ${count === 0 ? "opacity-60" : ""}`}
                          >
                            <span className="text-muted-foreground">{t.label}</span>
                            <span className="text-lg font-semibold tabular-nums">{count}</span>
                            {!included && (
                              <span className="text-[10px] text-amber-600">ej i scope</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>


              {(contentItemsByType.page.length > 0 || scannedContentCounts.page > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sidor hittade</CardTitle>
                    <CardDescription>
                      {contentItemsByType.page.length || scannedContentCounts.page} sidor finns skannade för den här migrationen.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contentItemsByType.page.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto border rounded-md bg-background">
                        {contentItemsByType.page.map((it) => (
                          <label
                            key={it.id}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-muted/50 border-b last:border-b-0"
                          >
                            <Checkbox
                              checked={contentSelected.page.has(it.id)}
                              onCheckedChange={(c) => {
                                setContentTab("page");
                                setContentSelected((prev) => {
                                  const next = { ...prev, page: new Set(prev.page) };
                                  if (c) next.page.add(it.id); else next.page.delete(it.id);
                                  return next;
                                });
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">{it.source_payload?.title || it.source_handle}</div>
                              <div className="truncate text-muted-foreground text-[10px]">{it.source_handle}</div>
                            </div>
                            <Badge variant={it.approval_status === "approved" ? "default" : it.approval_status === "rejected" ? "destructive" : "secondary"} className="text-[10px] shrink-0">
                              {it.approval_status}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        Scan-statistiken visar sidor, men listan har inte laddats ännu. Klicka på Uppdatera.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}


              <Card>
                <CardHeader>
                  <CardTitle>Produkter: urval & ordning</CardTitle>
                  <CardDescription>
                    Välj vilka produkttyper som ska migreras och i vilken ordning. Du kan köra lite i taget.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableProductTypes.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">
                      Inga produkter skannade ännu. Kör "Skanna källa" först.
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">
                            Produkttyper ({selectedProductTypes.length || "alla"} valda)
                          </Label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-[11px] text-primary underline"
                              onClick={() => setSelectedProductTypes(availableProductTypes.map(([t]) => t))}
                            >Markera alla</button>
                            <button
                              type="button"
                              className="text-[11px] text-primary underline"
                              onClick={() => setSelectedProductTypes([])}
                            >Rensa</button>
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto border rounded-md p-2 space-y-1 bg-background">
                          {availableProductTypes.map(([pt, count]) => (
                            <label key={pt} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-1">
                              <Checkbox
                                checked={selectedProductTypes.includes(pt)}
                                onCheckedChange={(c) => {
                                  setSelectedProductTypes((prev) =>
                                    c ? [...prev, pt] : prev.filter((x) => x !== pt)
                                  );
                                }}
                              />
                              <span className="truncate flex-1">{pt}</span>
                              <span className="text-muted-foreground text-[10px]">{count} st</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {availableVendors.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">
                              Leverantörer / vendor ({selectedVendors.length || "alla"} valda)
                            </Label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="text-[11px] text-primary underline"
                                onClick={() => setSelectedVendors(availableVendors.map(([v]) => v))}
                              >Markera alla</button>
                              <button
                                type="button"
                                className="text-[11px] text-primary underline"
                                onClick={() => setSelectedVendors([])}
                              >Rensa</button>
                            </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto border rounded-md p-2 space-y-1 bg-background">
                            {availableVendors.map(([v, count]) => (
                              <label key={v} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-1">
                                <Checkbox
                                  checked={selectedVendors.includes(v)}
                                  onCheckedChange={(c) => {
                                    setSelectedVendors((prev) =>
                                      c ? [...prev, v] : prev.filter((x) => x !== v)
                                    );
                                  }}
                                />
                                <span className="truncate flex-1">{v}</span>
                                <span className="text-muted-foreground text-[10px]">{count} st</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {availableSuppliers.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">
                              Leverantör (metafält) ({selectedSuppliers.length || "alla"} valda)
                            </Label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="text-[11px] text-primary underline"
                                onClick={() => setSelectedSuppliers(availableSuppliers.map(([v]) => v))}
                              >Markera alla</button>
                              <button
                                type="button"
                                className="text-[11px] text-primary underline"
                                onClick={() => setSelectedSuppliers([])}
                              >Rensa</button>
                            </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto border rounded-md p-2 space-y-1 bg-background">
                            {availableSuppliers.map(([v, count]) => (
                              <label key={v} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-1">
                                <Checkbox
                                  checked={selectedSuppliers.includes(v)}
                                  onCheckedChange={(c) => {
                                    setSelectedSuppliers((prev) =>
                                      c ? [...prev, v] : prev.filter((x) => x !== v)
                                    );
                                  }}
                                />
                                <span className="truncate flex-1">{v}</span>
                                <span className="text-muted-foreground text-[10px]">{count} st</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}




                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Ordning</Label>
                          <Select value={orderMode} onValueChange={(v) => setOrderMode(v as any)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="title_asc">Titel A → Ö</SelectItem>
                              <SelectItem value="title_desc">Titel Ö → A</SelectItem>
                              <SelectItem value="type_asc">Produkttyp (grupperad)</SelectItem>
                              <SelectItem value="newest">Nyast först</SelectItem>
                              <SelectItem value="oldest">Äldst först</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Batch-storlek</Label>
                          <Select value={String(batchSize)} onValueChange={(v) => setBatchSize(Number(v))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                              <SelectItem value="250">250</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Filter</Label>
                          <label className="flex items-center gap-2 h-10 px-3 border rounded-md text-xs cursor-pointer">
                            <Checkbox
                              checked={onlyUntransformed}
                              onCheckedChange={(c) => setOnlyUntransformed(Boolean(c))}
                            />
                            Endast otransformerade
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                        <div className="text-xs text-muted-foreground">
                          {orderedSelection.length} produkter matchar · kommer transformera de första{" "}
                          <strong>{Math.min(batchSize, orderedSelection.length)}</strong> enligt vald ordning
                        </div>
                        <Button
                          onClick={runSelection}
                          disabled={busy === "transform" || orderedSelection.length === 0}
                        >
                          {busy === "transform" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                          Transformera urval ({Math.min(batchSize, orderedSelection.length)})
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sidor, bloggar & artiklar</CardTitle>
                  <CardDescription>
                    Välj exakt vilka sidor, bloggar och artiklar som ska importeras. Övriga kan avvisas så att de hoppas över vid publicering.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Tabs value={contentTab} onValueChange={(v) => setContentTab(v as any)}>
                    <TabsList>
                      <TabsTrigger value="page">Sidor ({Math.max(contentItemsByType.page.length, scannedContentCounts.page)})</TabsTrigger>
                      <TabsTrigger value="blog">Bloggar ({Math.max(contentItemsByType.blog.length, scannedContentCounts.blog)})</TabsTrigger>
                      <TabsTrigger value="article">Artiklar ({Math.max(contentItemsByType.article.length, scannedContentCounts.article)})</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={contentQuery}
                      onChange={(e) => setContentQuery(e.target.value)}
                      placeholder="Sök på titel eller handle..."
                      className="h-9"
                    />
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setContentSelectAllVisible(true)}>
                        Markera synliga
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setContentSelectAllVisible(false)}>
                        Avmarkera
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {contentSelected[contentTab].size} valda av {contentItemsByType[contentTab].length}
                    {contentQuery && ` · ${filteredContentItems.length} träffar`}
                  </div>

                  <div className="max-h-72 overflow-y-auto border rounded-md bg-background">
                    {filteredContentItems.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic px-3 py-6 text-center">
                        Inga objekt – kör "Skanna källa" först eller justera sökningen.
                      </div>
                    ) : filteredContentItems.map((it) => {
                      const isSel = contentSelected[contentTab].has(it.id);
                      return (
                        <label
                          key={it.id}
                          className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-muted/50 border-b last:border-b-0"
                        >
                          <Checkbox
                            checked={isSel}
                            onCheckedChange={(c) => toggleContentItem(it.id, Boolean(c))}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">
                              {it.source_payload?.title || it.source_handle}
                            </div>
                            <div className="truncate text-muted-foreground text-[10px]">
                              {it.source_handle}
                            </div>
                          </div>
                          <Badge
                            variant={
                              it.approval_status === "approved" ? "default" :
                              it.approval_status === "rejected" ? "destructive" : "secondary"
                            }
                            className="text-[10px] shrink-0"
                          >
                            {it.approval_status}
                          </Badge>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" onClick={() => applyContentApproval("approve_selected")}>
                      Godkänn valda ({contentSelected[contentTab].size})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => applyContentApproval("approve_only_selected")}>
                      Importera bara valda (avvisa övriga)
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => applyContentApproval("reject_unselected")}>
                      Avvisa övriga
                    </Button>
                    <Button size="sm" variant="secondary" onClick={runTransformContentSelection} disabled={busy === "transform"}>
                      {busy === "transform" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Transformera valda
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>

                <CardHeader>
                  <CardTitle>Transformeringsmotor</CardTitle>
                  <CardDescription>Definiera nytt varumärke, marknad och AI-strategi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const t: any = currentMigration.transformation || {};
                    const set = (key: string, v: string) =>
                      updateMigration({ transformation: { ...currentMigration.transformation, [key]: v } } as any);

                    const PRESETS: Record<string, string[]> = {
                      language: ["Svenska", "English", "Norsk", "Dansk", "Suomi", "Deutsch", "Français", "Español", "Italiano", "Nederlands", "Polski"],
                      target_market: ["Sverige", "Norge", "Danmark", "Finland", "Norden", "Tyskland", "UK", "EU", "USA", "Globalt"],
                      target_customer: ["B2C konsument", "B2B företag", "Proffs / hantverkare", "Hobbyanvändare", "Premium / lyx", "Budget / prisjägare", "Återförsäljare"],
                      tone: ["Professionellt", "Vänligt", "Säljande", "Tekniskt", "Lekfullt", "Lyxigt", "Minimalistiskt", "Inspirerande"],
                      seo_strategy: [
                        "Maximera organisk trafik via long-tail keywords och kategorisidor",
                        "Fokus på lokala sökningar (stad + produktkategori)",
                        "Bygg topical authority via guider, jämförelser och FAQ",
                        "Konverteringsdrivna produktsidor (titel, meta, schema, recensioner)",
                        "Internationell SEO med hreflang per marknad",
                      ],
                      geo_strategy: [
                        "Optimera för ChatGPT, Perplexity och Google AI Overviews via tydliga FAQ + schema.org",
                        "Strukturerad data (Product, FAQPage, HowTo) på alla viktiga sidor",
                        "Korta, citerbara svar överst på varje sida för LLM-extraktion",
                        "Bygg auktoritet via externa omnämnanden och E-E-A-T-signaler",
                        "Multispråk + entiteter (Wikidata, sameAs) för AI-igenkänning",
                      ],
                    };

                    const PresetField = ({ k, label, multiline = false, multi = false }: { k: string; label: string; multiline?: boolean; multi?: boolean }) => {
                      const presets = PRESETS[k] || [];
                      const val = t[k] || "";

                      if (multi) {
                        const selected: string[] = Array.isArray(val)
                          ? val
                          : (typeof val === "string" && val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []);
                        const toggle = (p: string) => {
                          const next = selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p];
                          set(k, next.join(", "));
                        };
                        const customExtras = selected.filter((s) => !presets.includes(s)).join(", ");
                        return (
                          <div className="space-y-1">
                            <Label className="text-xs">
                              {label} {selected.length > 0 && <span className="text-muted-foreground">({selected.length} valda)</span>}
                            </Label>
                            <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background p-2">
                              {presets.map((p) => {
                                const on = selected.includes(p);
                                return (
                                  <button
                                    type="button"
                                    key={p}
                                    onClick={() => toggle(p)}
                                    className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"}`}
                                  >
                                    {on ? "✓ " : ""}{p}
                                  </button>
                                );
                              })}
                            </div>
                            <Input
                              value={customExtras}
                              onChange={(e) => {
                                const extras = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                const keepPresets = selected.filter((s) => presets.includes(s));
                                set(k, [...keepPresets, ...extras].join(", "));
                              }}
                              placeholder="Egna val (kommaseparerade)…"
                              className="text-xs"
                            />
                          </div>
                        );
                      }

                      const isPreset = presets.includes(val);
                      const isCustom = !!val && !isPreset;
                      const selectValue = !val ? "" : isPreset ? val : "__custom__";
                      return (
                        <div className="space-y-1">
                          <Label className="text-xs">{label}</Label>
                          <select
                            value={selectValue}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "__custom__") {
                                set(k, isCustom ? val : " ");
                              } else {
                                set(k, v);
                              }
                            }}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="" disabled>{`Välj ${label.toLowerCase()}…`}</option>
                            {presets.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                            <option value="__custom__">Annat (skriv eget)…</option>
                          </select>
                          {isCustom && (
                            multiline ? (
                              <Textarea rows={2} value={val} onChange={(e) => set(k, e.target.value)} placeholder="Skriv eget…" />
                            ) : (
                              <Input value={val} onChange={(e) => set(k, e.target.value)} placeholder="Skriv eget…" />
                            )
                          )}
                        </div>
                      );
                    };

                    return (
                      <>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Gammalt varumärke</Label>
                            <Input value={t.old_brand || ""} onChange={(e) => set("old_brand", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nytt varumärke</Label>
                            <Input value={t.new_brand || ""} onChange={(e) => set("new_brand", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Gammal domän</Label>
                            <Input value={t.old_domain || ""} onChange={(e) => set("old_domain", e.target.value)} placeholder="exempel.se" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Ny domän</Label>
                            <Input value={t.new_domain || ""} onChange={(e) => set("new_domain", e.target.value)} placeholder="nydoman.se" />
                          </div>
                          <PresetField k="language" label="Språk" />
                          <PresetField k="target_market" label="Målmarknad" multi />
                          <PresetField k="target_customer" label="Målkund" multi />
                          <PresetField k="tone" label="Tonläge" />
                        </div>
                        <PresetField k="seo_strategy" label="SEO-strategi" multiline />
                        <PresetField k="geo_strategy" label="GEO / AI-sök-strategi" multiline />
                      </>
                    );
                  })()}


                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">AI-motor</Label>
                      <select
                        value={currentMigration.ai_engine}
                        onChange={(e) => updateMigration({ ai_engine: e.target.value as any })}
                        className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="lovable">Lovable AI (Gemini 3 Flash)</option>
                        <option value="claude">Claude (Anthropic)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Publiceringsläge</Label>
                      <select
                        value={currentMigration.mode}
                        onChange={(e) => updateMigration({ mode: e.target.value as any })}
                        className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="dry_run">Dry run (inget skapas)</option>
                        <option value="create_only">Endast skapa nya</option>
                        <option value="update_existing">Uppdatera befintliga (per handle)</option>
                        <option value="skip_existing">Hoppa över befintliga</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 flex-wrap">
                    <Button onClick={() => runTransform(25)} disabled={busy === "transform"}>
                      {busy === "transform" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Transformera 25 objekt
                    </Button>
                    <Button variant="outline" onClick={() => runTransform(100)} disabled={busy === "transform"}>Transformera 100</Button>
                    <Button variant="outline" onClick={() => queueJob("transform", 50)}>Kö-köra alla (bakgrund, 50/batch)</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">{items.length} objekt · {dashStats.transformed} transformerade · {dashStats.approved} godkända</div>
                <Button variant="outline" size="sm" onClick={bulkApprove}>Godkänn alla väntande</Button>
              </div>
              <div className="space-y-3">
                {items.filter((i) => i.transformed_payload).slice(0, 50).map((it) => (
                  <Card key={it.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-2 flex-col sm:flex-row">
                        <div>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{it.object_type}</Badge>
                            {it.source_payload?.title || it.source_handle}
                          </CardTitle>
                          <CardDescription className="text-xs">{it.source_handle}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant={it.approval_status === "approved" ? "default" : it.approval_status === "rejected" ? "destructive" : "secondary"}>{it.approval_status}</Badge>
                          <Button size="sm" variant="outline" onClick={() => setApproval(it.id, "approved")}>Godkänn</Button>
                          <Button size="sm" variant="ghost" onClick={() => setApproval(it.id, "rejected")}>Avvisa</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      {it.diff && Object.entries(it.diff).map(([field, val]) => (
                        <div key={field} className="grid md:grid-cols-2 gap-2 border-t pt-2">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">{field} — original</div>
                            <div className="text-xs whitespace-pre-wrap line-clamp-6 bg-muted/30 p-2 rounded">{String(val.before ?? "—").slice(0, 800)}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-primary mb-1">{field} — transformerad</div>
                            <div className="text-xs whitespace-pre-wrap line-clamp-6 bg-primary/5 p-2 rounded">{String(val.after ?? "—").slice(0, 800)}</div>
                          </div>
                        </div>
                      ))}
                      {it.error && <div className="text-destructive text-xs">{it.error}</div>}
                    </CardContent>
                  </Card>
                ))}
                {items.filter((i) => i.transformed_payload).length === 0 && (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">Inga transformerade objekt ännu. Kör Setup → Transformera.</CardContent></Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="publish" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Publicera till målbutik</CardTitle>
                  <CardDescription>
                    Alla produkter skapas som <strong>DRAFT</strong> tills lagerflöde är verifierat. Läge:{" "}
                    <Badge variant="outline">{currentMigration.mode}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 rounded-lg border p-3 bg-muted/30">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Källbutik</div>
                      <div className="font-medium flex items-center gap-2">
                        <Store className="h-4 w-4 shrink-0" />
                        {sourceStore?.label || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">{sourceStore?.shop_domain || "—"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Målbutik</div>
                      <div className="font-medium flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0" />
                        {targetStore?.label || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">{targetStore?.shop_domain || "—"}</div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                    <div className="border rounded p-2">
                      <div className="text-xs text-muted-foreground">Väntar publicering</div>
                      <div className="text-xl font-semibold">{publishQueueStats.pendingTotal}</div>
                      <div className="text-xs text-muted-foreground">{publishQueueStats.pendingProducts} produkter · {publishQueueStats.pendingCollections} kollektioner</div>
                    </div>
                    <div className="border rounded p-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Uppskattad tid</div>
                      <div className="text-xl font-semibold">~{publishQueueStats.estimatedMinutes} min</div>
                    </div>
                    <div className="border rounded p-2">
                      <div className="text-xs text-muted-foreground">Klara</div>
                      <div className="text-xl font-semibold text-green-600">{publishQueueStats.completed}</div>
                    </div>
                    <div className="border rounded p-2">
                      <div className="text-xs text-muted-foreground">Fel / överhoppade</div>
                      <div className="text-xl font-semibold">
                        <span className="text-destructive">{publishQueueStats.failed}</span>
                        {" / "}
                        <span>{publishQueueStats.skipped}</span>
                      </div>
                    </div>
                  </div>

                  {publishProgress && (
                    <div className="border rounded-lg p-3 space-y-2 bg-primary/5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {publishProgress.running ? "Publicerar…" : "Senaste körning"}
                        </span>
                        <span className="text-muted-foreground">
                          Batch {publishProgress.currentBatch} · {publishProgress.processed} bearbetade
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${publishProgress.total ? Math.min(100, (publishProgress.processed / publishProgress.total) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Skapade: {publishProgress.created}</span>
                        <span>Uppdaterade: {publishProgress.updated}</span>
                        <span>Överhoppade: {publishProgress.skipped}</span>
                        <span className="text-destructive">Fel: {publishProgress.failed}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={runPublish} disabled={busy === "publish" || publishQueueStats.pendingTotal === 0}>
                      {busy === "publish" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      Kör publicering ({batchSize}/batch)
                    </Button>
                    <Button variant="outline" onClick={() => runPublishBatch(true)} disabled={busy === "publish" || publishQueueStats.pendingTotal === 0}>
                      Publicera alla (kontinuerligt)
                    </Button>
                    <Button variant="outline" onClick={() => queueJob("publish", 50)}>Kö-publicera alla (bakgrund, 50/batch)</Button>
                    <Button variant="secondary" onClick={runLinkCollections} disabled={busy === "link-collections"}>
                      {busy === "link-collections" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                      Länka kollektioner (retroaktivt)
                    </Button>
                    <Button variant="outline" onClick={downloadCloneReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Ladda ner rapport
                    </Button>
                    <Button variant="secondary" onClick={runRemap} disabled={busy === "publish"}>
                      Remappa metafält‑GIDs (efter publicering)
                    </Button>
                    <Button variant="secondary" onClick={runRemapThemeSettings} disabled={busy === "publish"}>
                      Remap tema-inställningar (settings_data.json)
                    </Button>
                    <Button variant="default" onClick={runActivateTheme} disabled={busy === "publish"}>
                      Aktivera tema (publicera som main)
                    </Button>
                  </div>

                  {/* Theme selection */}
                  {items.some((i) => i.object_type === "theme") && (
                    <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <div className="text-sm font-medium">Välj teman att importera</div>
                          <div className="text-xs text-muted-foreground">
                            Endast godkända teman publiceras. Avvisa de teman du inte vill kopiera över.
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const ids = items.filter((i) => i.object_type === "theme").map((i) => i.id);
                                const { error } = await supabase.from("cloner_migration_items" as any)
                                  .update({ approval_status: "approved" }).in("id", ids);
                                if (error) throw error;
                                loadItemsAndLogs(currentMigration!.id);
                              } catch (err: any) {
                                toast.error(`Kunde inte godkänna teman: ${err?.message || "okänt fel"}`);
                              }
                            }}
                          >Godkänn alla</Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              try {
                                const ids = items.filter((i) => i.object_type === "theme").map((i) => i.id);
                                const { error } = await supabase.from("cloner_migration_items" as any)
                                  .update({ approval_status: "rejected" }).in("id", ids);
                                if (error) throw error;
                                loadItemsAndLogs(currentMigration!.id);
                              } catch (err: any) {
                                toast.error(`Kunde inte avvisa teman: ${err?.message || "okänt fel"}`);
                              }
                            }}
                          >Avvisa alla</Button>
                        </div>
                      </div>
                      <div className="space-y-1 max-h-64 overflow-auto">
                        {items.filter((i) => i.object_type === "theme").map((it) => {
                          const th = (it.source_payload as any)?.theme || {};
                          const assetsCount = (it.source_payload as any)?.assets_count ?? ((it.source_payload as any)?.assetMeta?.length ?? 0);
                          const isApproved = it.approval_status === "approved";
                          return (
                            <label
                              key={it.id}
                              className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-muted/50 border-b last:border-b-0"
                            >
                              <Checkbox
                                checked={isApproved}
                                onCheckedChange={(checked) => setApproval(it.id, checked ? "approved" : "rejected")}
                              />
                              <span className="font-medium truncate">{th.name || it.source_id}</span>
                              {th.role && <Badge variant="outline" className="text-[10px]">{th.role}</Badge>}
                              <span className="text-muted-foreground ml-auto shrink-0">{assetsCount} assets</span>
                              <Badge
                                variant={isApproved ? "default" : it.approval_status === "rejected" ? "destructive" : "secondary"}
                                className="text-[10px] shrink-0"
                              >
                                {it.approval_status}
                              </Badge>
                              {it.publish_status === "published" && (
                                <Badge variant="outline" className="text-[10px] shrink-0">publicerad</Badge>
                              )}
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        "Aktivera tema" sätter det först publicerade temat som main. Vill du aktivera ett annat – godkänn endast det temat och kör publicering igen.
                      </p>
                    </div>
                  )}


                  {/* Image optimization */}
                  <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="text-sm font-medium">Bildoptimering vid uppladdning</div>
                        <div className="text-xs text-muted-foreground">
                          Konverterar JPG/PNG → WebP och begränsar bredden. Shopify CDN levererar sedan AVIF automatiskt till stödda webbläsare.
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!(currentMigration.transformation as any)?.imageOptimization?.enabled}
                          onChange={(e) => updateImageOptimization({ enabled: e.target.checked })}
                        />
                        Aktivera
                      </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className="text-xs space-y-1">
                        <span className="block text-muted-foreground">Format</span>
                        <select
                          className="w-full border rounded px-2 py-1 bg-background"
                          value={(currentMigration.transformation as any)?.imageOptimization?.format || "webp"}
                          onChange={(e) => updateImageOptimization({ format: e.target.value })}
                        >
                          <option value="webp">WebP (rekommenderat)</option>
                          <option value="jpg">JPG (fallback)</option>
                        </select>
                      </label>
                      <label className="text-xs space-y-1">
                        <span className="block text-muted-foreground">Max bredd (px)</span>
                        <input
                          type="number" min={512} max={4096} step={64}
                          className="w-full border rounded px-2 py-1 bg-background"
                          value={(currentMigration.transformation as any)?.imageOptimization?.maxWidth ?? 2048}
                          onChange={(e) => updateImageOptimization({ maxWidth: Number(e.target.value) })}
                        />
                      </label>
                      <label className="text-xs space-y-1">
                        <span className="block text-muted-foreground">Kvalitet (40–95)</span>
                        <input
                          type="number" min={40} max={95}
                          className="w-full border rounded px-2 py-1 bg-background"
                          value={(currentMigration.transformation as any)?.imageOptimization?.quality ?? 82}
                          onChange={(e) => updateImageOptimization({ quality: Number(e.target.value) })}
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => runImageTest(5)} disabled={imageTest.loading}>
                        {imageTest.loading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Eye className="h-3 w-3 mr-2" />}
                        Testa 5 bilder (utan att ladda upp)
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => runImageTest(15)} disabled={imageTest.loading}>
                        Testa 15 bilder
                      </Button>
                      <span className="text-xs text-muted-foreground self-center">
                        Visar filnamn, alt-text, format, bredd och filstorlek innan publicering.
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Publicering kör bara objekt med <code>approval_status=approved</code>. Bakgrundsjobbet processas av cron varje minut.
                    Rekommenderad slut-sekvens: <strong>1)</strong> Publicera innehåll. <strong>2)</strong> Remappa metafält‑GIDs. <strong>3)</strong> Remap tema-inställningar. <strong>4)</strong> Aktivera tema.
                  </p>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Typ</TableHead>
                        <TableHead>Källa-ID</TableHead>
                        <TableHead>Källa-handle</TableHead>
                        <TableHead>Mål-ID</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.slice(0, 200).map((it) => (
                        <TableRow key={it.id}>
                          <TableCell><Badge variant="outline" className="text-xs">{it.object_type}</Badge></TableCell>
                          <TableCell className="text-xs">{it.source_id}</TableCell>
                          <TableCell className="text-xs">{it.source_handle || "—"}</TableCell>
                          <TableCell className="text-xs">{it.target_id || "—"}</TableCell>
                          <TableCell><Badge variant={it.publish_status === "published" ? "default" : it.publish_status === "failed" ? "destructive" : "secondary"}>{it.publish_status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-2">
              {logs.map((l) => (
                <Card key={l.id}>
                  <CardContent className="py-2 text-xs flex items-start gap-3">
                    <Badge variant={l.level === "error" ? "destructive" : l.level === "warn" ? "secondary" : "outline"}>{l.level}</Badge>
                    <div className="flex-1">
                      <div><strong>{l.event}</strong> {l.object_type ? `· ${l.object_type}` : ""} {l.object_id ? `· ${l.object_id}` : ""}</div>
                      {l.message && <div className="text-muted-foreground">{l.message}</div>}
                    </div>
                    <div className="text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleTimeString()}</div>
                  </CardContent>
                </Card>
              ))}
              {logs.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">Inga loggar än</CardContent></Card>}
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {[
                  ["Totalt", dashStats.total],
                  ["Produkter", dashStats.products],
                  ["Transformerade", dashStats.transformed],
                  ["Godkända", dashStats.approved],
                  ["Publicerade", dashStats.published],
                  ["Överhoppade", dashStats.skipped],
                  ["Misslyckade", dashStats.failed],
                  ["Saknar SEO", dashStats.missingSeo],
                  ["Saknar bilder", dashStats.missingImages],
                  ["Saknar metafields", dashStats.missingMetafields],
                ].map(([label, value]) => (
                  <Card key={label as string}>
                    <CardContent className="pt-4">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="text-2xl font-bold">{value as number}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* ===== Store dialog ===== */}
      <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anslut Shopify-butik</DialogTitle>
            <DialogDescription>Ange Admin API access token. Tokens lagras säkert serverside och visas aldrig i frontend.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Roll</Label>
              <Select value={newStore.role} onValueChange={(v) => setNewStore({ ...newStore, role: v as StoreRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="source">Källa (hämta från)</SelectItem>
                  <SelectItem value="target">Mål (skriva till)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Etikett</Label>
              <Input value={newStore.label} onChange={(e) => setNewStore({ ...newStore, label: e.target.value })} placeholder="EU Drone Company produktion" />
            </div>
            <div className="space-y-1">
              <Label>Shopify-domän</Label>
              <Input value={newStore.shop_domain} onChange={(e) => setNewStore({ ...newStore, shop_domain: e.target.value })} placeholder="mystore.myshopify.com" />
            </div>
            <div className="space-y-1">
              <Label>Admin API access token</Label>
              <Input type="password" value={newStore.access_token} onChange={(e) => setNewStore({ ...newStore, access_token: e.target.value })} placeholder="shpat_..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoreDialogOpen(false)}>Avbryt</Button>
            <Button onClick={saveStore} disabled={busy === "save-store"}>
              {busy === "save-store" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              Validera & spara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Migration dialog ===== */}
      <Dialog open={migrationDialogOpen} onOpenChange={setMigrationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ny migration</DialogTitle>
            <DialogDescription>Välj källa och målbutik. Lägget är "dry run" som standard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Namn</Label>
              <Input value={newMigration.name} onChange={(e) => setNewMigration({ ...newMigration, name: e.target.value })} placeholder="EU Drone Company → EU Drone Company" />
            </div>
            <div className="space-y-1">
              <Label>Källa</Label>
              <Select value={newMigration.source_store_id} onValueChange={(v) => setNewMigration({ ...newMigration, source_store_id: v })}>
                <SelectTrigger><SelectValue placeholder="Välj källbutik" /></SelectTrigger>
                <SelectContent>
                  {stores.filter((s) => s.id !== newMigration.target_store_id).map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Mål</Label>
              <Select value={newMigration.target_store_id} onValueChange={(v) => setNewMigration({ ...newMigration, target_store_id: v })}>
                <SelectTrigger><SelectValue placeholder="Välj målbutik" /></SelectTrigger>
                <SelectContent>
                  {stores.filter((s) => s.id !== newMigration.source_store_id).map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Data att migrera</Label>
                <div className="flex gap-2 text-xs">
                  <button type="button" className="text-primary hover:underline" onClick={() => setNewMigration({ ...newMigration, types: OBJECT_TYPES.map((t) => t.id) })}>Markera alla</button>
                  <span className="text-muted-foreground">·</span>
                  <button type="button" className="text-primary hover:underline" onClick={() => setNewMigration({ ...newMigration, types: [] })}>Avmarkera alla</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                {OBJECT_TYPES.map((t) => {
                  const checked = newMigration.types.includes(t.id);
                  return (
                    <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setNewMigration({
                          ...newMigration,
                          types: e.target.checked
                            ? [...newMigration.types, t.id]
                            : newMigration.types.filter((x) => x !== t.id),
                        })}
                      />
                      <span>{t.label}</span>
                    </label>
                  );
                })}
              </div>
              {newMigration.types.length === 0 && (
                <p className="text-xs text-destructive">Välj minst en datatyp att migrera.</p>
              )}
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMigrationDialogOpen(false)}>Avbryt</Button>
            <Button onClick={createMigration}>Skapa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish confirmation dialog */}
      <Dialog open={publishConfirmOpen} onOpenChange={setPublishConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekräfta publicering</DialogTitle>
            <DialogDescription>
              Granska sammanfattningen innan du skriver till målbutiken. Produkter skapas alltid som DRAFT.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2 rounded border p-3 bg-muted/30">
              <div>
                <div className="text-xs text-muted-foreground">Från</div>
                <div className="font-medium">{sourceStore?.label}</div>
                <div className="text-xs">{sourceStore?.shop_domain}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Till</div>
                <div className="font-medium">{targetStore?.label}</div>
                <div className="text-xs">{targetStore?.shop_domain}</div>
              </div>
            </div>
            <ul className="space-y-1 list-disc pl-5">
              <li><strong>{publishQueueStats.pendingProducts}</strong> produkter väntar publicering</li>
              <li><strong>{publishQueueStats.pendingCollections}</strong> kollektioner väntar publicering</li>
              <li>Totalt <strong>{publishQueueStats.pendingTotal}</strong> godkända objekt i kön</li>
              <li>Uppskattad tid: <strong>~{publishQueueStats.estimatedMinutes} min</strong> (batch {batchSize})</li>
              <li>Läge: <strong>{currentMigration?.mode === "dry_run" ? "Dry run — inget skapas i Shopify" : currentMigration?.mode}</strong></li>
            </ul>
            {currentMigration?.mode !== "dry_run" && (
              <div className="flex gap-2 rounded border border-amber-500/50 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  Detta skriver data till <strong>{targetStore?.label}</strong>. Produkter förblir DRAFT men kollektioner, sidor och redirects skapas i målbutiken.
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishConfirmOpen(false)}>Avbryt</Button>
            <Button
              onClick={() => {
                setPublishConfirmOpen(false);
                runPublishBatch(false);
              }}
              disabled={busy === "publish"}
            >
              {currentMigration?.mode === "dry_run" ? "Kör dry run" : "Bekräfta och publicera"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image test result dialog */}
      <Dialog open={imageTest.open} onOpenChange={(o) => setImageTest((s) => ({ ...s, open: o }))}>
        <DialogContent className="max-w-5xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bildtest – konvertering och validering</DialogTitle>
            <DialogDescription>
              Inget laddas upp. Resultatet visar hur bilderna kommer döpas, taggas (alt) och konverteras vid publicering.
            </DialogDescription>
          </DialogHeader>
          {imageTest.loading && (
            <div className="py-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Hämtar och analyserar bilder...</div>
          )}
          {!imageTest.loading && imageTest.data && (
            <div className="space-y-4">
              {(() => {
                const s = imageTest.data.summary || {};
                const saved = s.savedBytes || 0;
                const orig = s.originalBytes || 0;
                const pct = orig ? Math.round((saved / orig) * 100) : 0;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="border rounded p-2"><div className="text-2xl font-semibold">{s.products || 0}</div><div className="text-xs text-muted-foreground">Produkter</div></div>
                    <div className="border rounded p-2"><div className="text-2xl font-semibold">{s.images || 0}</div><div className="text-xs text-muted-foreground">Bilder</div></div>
                    <div className="border rounded p-2"><div className="text-2xl font-semibold text-green-600">{s.ok || 0}</div><div className="text-xs text-muted-foreground">OK</div></div>
                    <div className="border rounded p-2"><div className="text-2xl font-semibold text-amber-600">{s.warnings || 0}</div><div className="text-xs text-muted-foreground">Varningar</div></div>
                    <div className="border rounded p-2"><div className="text-2xl font-semibold text-destructive">{s.errors || 0}</div><div className="text-xs text-muted-foreground">Fel</div></div>
                    <div className="border rounded p-2 col-span-2 sm:col-span-5"><div className="text-sm">Sparat: <strong>{(saved / 1024).toFixed(0)} KB</strong> av {(orig / 1024).toFixed(0)} KB ({pct}%)</div></div>
                  </div>
                );
              })()}

              {(imageTest.data.results || []).map((p: any) => (
                <Card key={p.item_id}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">{p.product_title || p.product_handle}</CardTitle>
                    <CardDescription className="text-xs">Handle: <code>{p.product_handle}</code></CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {p.images.map((img: any) => (
                      <div key={img.position} className="border rounded p-3 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3">
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Original</div>
                          <img src={img.originalUrl} alt="" className="w-full h-24 object-contain bg-muted rounded" loading="lazy" />
                          <div className="text-xs text-muted-foreground">Efter (WebP)</div>
                          <img src={img.newUrl} alt="" className="w-full h-24 object-contain bg-muted rounded" loading="lazy" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <Badge variant={img.status === "ok" ? "default" : img.status === "warn" ? "secondary" : "destructive"}>
                              {img.status === "ok" ? "OK" : img.status === "warn" ? "Varning" : "Fel"}
                            </Badge>
                            {img.savingsPercent != null && (
                              <span className="text-xs">Storleksminskning: <strong>{img.savingsPercent}%</strong></span>
                            )}
                          </div>
                          <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                            <div><span className="text-muted-foreground">Filnamn:</span> <code>{img.newFilename}</code></div>
                            <div><span className="text-muted-foreground">Originalfil:</span> <code className="break-all">{img.originalFilename || "—"}</code></div>
                            <div><span className="text-muted-foreground">Alt-text:</span> {img.suggestedAlt || <em>tom</em>}</div>
                            <div><span className="text-muted-foreground">Original-alt:</span> {img.originalAlt || <em className="text-amber-600">saknas</em>}</div>
                            <div><span className="text-muted-foreground">Format:</span> {img.newContentType || "—"}</div>
                            <div><span className="text-muted-foreground">Mått:</span> {img.newWidth ? `${img.newWidth}×${img.newHeight}` : "—"}</div>
                            <div><span className="text-muted-foreground">Filstorlek:</span> {img.newSize ? `${(img.newSize / 1024).toFixed(0)} KB` : "—"}</div>
                            <div><span className="text-muted-foreground">Original:</span> {img.originalSize ? `${(img.originalSize / 1024).toFixed(0)} KB` : "—"} {img.originalWidth ? `(${img.originalWidth}×${img.originalHeight})` : ""}</div>
                          </div>
                          <ul className="text-xs space-y-0.5">
                            {img.checks.map((c: any, i: number) => (
                              <li key={i} className="flex gap-2">
                                <span className={c.level === "ok" ? "text-green-600" : c.level === "warn" ? "text-amber-600" : "text-destructive"}>
                                  {c.level === "ok" ? "✓" : c.level === "warn" ? "⚠" : "✕"}
                                </span>
                                <span><strong>{c.label}:</strong> {c.detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                    {p.images.length === 0 && <div className="text-xs text-muted-foreground">Inga bilder på denna produkt.</div>}
                  </CardContent>
                </Card>
              ))}
              {(imageTest.data.results || []).length === 0 && (
                <div className="text-center text-muted-foreground py-8">Inga produkter att testa.</div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageTest({ open: false, loading: false, data: null })}>Stäng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
