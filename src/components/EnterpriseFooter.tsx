import { Radio } from "lucide-react";
import { COMPANY_ADDRESS_LINE, COMPANY_CONTACT } from "@/lib/companyContact";

/**
 * Sidfoten för de publika drönarsidorna.
 *
 * Låg tidigare inline och identisk i nio sidkomponenter. Den bröts ut när
 * organisationsnummer och postadress skulle in — uppgifter som ska stå på varje
 * sida och som inte bör underhållas på nio ställen.
 */
export default function EnterpriseFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-orange-500" />
            <span className="font-semibold">{COMPANY_CONTACT.brandName} Enterprise</span>
          </div>
          <p className="text-sm text-white/40 text-center md:text-right">
            © {new Date().getFullYear()} {COMPANY_CONTACT.brandName}. Auktoriserad DJI
            Enterprise-partner.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-white/30">
          <p>
            {COMPANY_CONTACT.legalName} · Org.nr {COMPANY_CONTACT.orgNumber}
          </p>
          <p>
            {COMPANY_ADDRESS_LINE} · {COMPANY_CONTACT.address.country}
          </p>
        </div>
      </div>
    </footer>
  );
}
