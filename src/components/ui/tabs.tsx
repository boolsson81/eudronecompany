import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

type TabsRootProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  /** Optional explicit storage key. Defaults to pathname + defaultValue/value. Set to null to disable persistence. */
  persistKey?: string | null;
};

const STORAGE_PREFIX = "tab:";

function getStoredTab(key: string): string | null {
  try {
    return typeof window !== "undefined" ? localStorage.getItem(STORAGE_PREFIX + key) : null;
  } catch {
    return null;
  }
}

function setStoredTab(key: string, value: string) {
  try {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_PREFIX + key, value);
  } catch {
    /* ignore */
  }
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsRootProps
>(({ persistKey, value, defaultValue, onValueChange, ...props }, ref) => {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const seed = (value as string | undefined) ?? (defaultValue as string | undefined) ?? "tabs";
  // React.useId() disambiguates multiple <Tabs> instances on the same route that
  // happen to share the same seed (e.g. two tab groups both starting on "overview") —
  // without it they'd derive the same storage key and read/write each other's state.
  const autoId = React.useId();
  const storageKey = persistKey === null ? null : persistKey || `${pathname}|${seed}|${autoId}`;

  const isControlled = value !== undefined;

  // Uncontrolled: manage state internally, seeded from storage
  const [internalValue, setInternalValue] = React.useState<string | undefined>(() => {
    if (isControlled) return undefined;
    if (storageKey) {
      const stored = getStoredTab(storageKey);
      if (stored) return stored;
    }
    return defaultValue as string | undefined;
  });

  // Controlled: restore stored value once on mount by calling parent's onValueChange
  const restoredRef = React.useRef(false);
  React.useEffect(() => {
    if (!isControlled || !storageKey || restoredRef.current) return;
    restoredRef.current = true;
    const stored = getStoredTab(storageKey);
    if (stored && stored !== value) {
      onValueChange?.(stored);
    }
  }, [isControlled, storageKey, value, onValueChange]);

  const handleChange = React.useCallback(
    (next: string) => {
      if (storageKey) setStoredTab(storageKey, next);
      if (isControlled) {
        onValueChange?.(next);
      } else {
        setInternalValue(next);
        onValueChange?.(next);
      }
    },
    [storageKey, isControlled, onValueChange],
  );

  return (
    <TabsPrimitive.Root
      ref={ref}
      {...(isControlled ? { value } : { value: internalValue, defaultValue })}
      onValueChange={handleChange}
      {...props}
    />
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 scrollbar-none">
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto min-w-full md:min-w-0",
        className,
      )}
      {...props}
    />
  </div>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-call-action data-[state=active]:text-call-action-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
