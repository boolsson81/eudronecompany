import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Radio, ChevronDown, Menu, X } from "lucide-react";
import { INDUSTRY_DATA } from "@/data/commercialDroneIndustries";

interface EnterpriseNavProps {
  onCtaClick?: () => void;
}

export default function EnterpriseNav({ onCtaClick }: EnterpriseNavProps) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const navItems = [
    {
      key: "industries",
      label: "Användningsområden",
      children: INDUSTRY_DATA.map((ind) => ({
        label: ind.title,
        href: `/kommersiella-dronare/${ind.slug}`,
        icon: ind.icon,
      })),
    },
    {
      key: "products",
      label: "Produkter",
      href: "/kommersiella-dronare/produkter",
    },
    {
      key: "comparisons",
      label: "Jämförelser",
      href: "/kommersiella-dronare/jamforelser",
    },
    {
      key: "cameras",
      label: "Kameror",
      href: "/kommersiella-dronare/kameror",
    },
    {
      key: "camera-comparison",
      label: "Jämför kameror",
      href: "/kommersiella-dronare/jamfor-kameror",
    },
    {
      key: "accessories",
      label: "Tillbehör",
      href: "/kommersiella-dronare#accessories",
    },
    {
      key: "custom-parts",
      label: "Specialtillverkning",
      href: "/kommersiella-dronare/specialtillverkning",
    },
    {
      key: "faq",
      label: "Vanliga frågor",
      href: "/kommersiella-dronare#faq",
    },
    {
      key: "contact",
      label: "Kontakt",
      href: "/kommersiella-dronare/kontakt",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/kommersiella-dronare" className="flex items-center gap-3">
          <Radio className="h-6 w-6 text-orange-500" />
          <span className="font-bold text-lg tracking-tight text-white">
            EU Drone Company <span className="text-orange-500">Enterprise</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {navItems.map((item) =>
            "children" in item && item.children ? (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.key)}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center gap-1 px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  {item.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === item.key ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === item.key && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2 max-h-[70vh] overflow-y-auto">
                      {item.children.map((child) => {
                        const Icon = child.icon;
                        const isActive = location.pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isActive
                                ? "bg-orange-500/10 text-orange-400"
                                : "text-white/70 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-orange-500/70" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a
                key={item.key}
                href={item.href}
                className="px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/kommersiella-dronare/kontakt">
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white border-0"
            >
              Begär offert
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-white/10 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) =>
              "children" in item && item.children ? (
                <div key={item.key}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.key ? null : item.key)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-white/70 hover:text-white rounded-md"
                  >
                    {item.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === item.key ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === item.key && (
                    <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5 mb-2">
                      {item.children.map((child) => {
                        const Icon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white rounded-md"
                          >
                            <Icon className="h-3.5 w-3.5 text-orange-500/70" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  className="block px-3 py-2.5 text-sm text-white/70 hover:text-white rounded-md"
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
