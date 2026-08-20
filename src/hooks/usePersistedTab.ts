import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Keeps a page's active tab in sync with the URL "tab" param and
 * sessionStorage, so returning to the page (e.g. after switching to another
 * section in the bottom nav / sidebar and back) restores the tab you were on
 * instead of resetting to the default.
 *
 * `storageKey` must be unique per page (e.g. "purchases.activeTab").
 */
export function usePersistedTab(storageKey: string, defaultTab: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab =
    searchParams.get("tab") ||
    (typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null) ||
    defaultTab;

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    sessionStorage.setItem(storageKey, activeTab);
    const current = searchParams.get("tab");
    if (current !== activeTab) {
      const next = new URLSearchParams(searchParams);
      next.set("tab", activeTab);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab) setActiveTab(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return [activeTab, setActiveTab] as const;
}
