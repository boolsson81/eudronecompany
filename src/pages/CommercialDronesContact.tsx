import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import {
  CheckCircle2, Loader2, Radio, ArrowRight, Phone, Mail,
} from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

const INDUSTRIES = [
  "Bygg & Anläggning", "Lantbruk", "Energi & Elnät", "Fastigheter",
  "Gruvdrift", "Säkerhet & Räddning", "Film & Media", "Offentlig sektor", "Annat",
];

const NEEDS = [
  "Inspektion", "Kartläggning & 3D", "Övervakning", "Lantbruk/Precision",
  "Filmproduktion", "Utbildning & Certifiering", "Annat",
];

export default function CommercialDronesContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [need, setNeed] = useState("");
  const [requestType, setRequestType] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) { setStatus("success"); return; }

    if (!name || !email || !phone || !company || !industry || !need || !requestType || !consent) {
      setErrorMessage("Vänligen fyll i alla obligatoriska fält.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Ange en giltig e-postadress.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("capture-lead", {
        body: {
          source: "commercial_drones",
          name, email, phone, company, consent, honeypot,
          extra: {
            Bransch: industry,
            Behov: need,
            Typ: requestType,
            Meddelande: message || undefined,
          },
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.message || "Något gick fel");
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Ett fel uppstod. Försök igen.");
      setStatus("error");
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakta ActionKing Enterprise",
    url: "https://actionking.se/kommersiella-dronare/kontakt",
    mainEntity: {
      "@type": "Organization",
      name: "ActionKing Enterprise",
      telephone: "+46101025591",
      email: "Sales@actionking.se",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+46101025591",
        contactType: "sales",
        availableLanguage: "Swedish",
      },
    },
  };

  return (
    <>
      <SeoHead
        title="Kontakta oss — ActionKing Enterprise | Kommersiella drönare"
        description="Kontakta ActionKing Enterprise för offert, demo eller rådgivning om kommersiella drönare. Vi återkommer inom 24 timmar."
        canonical="https://actionking.se/kommersiella-dronare/kontakt"
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        <div className="pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-10">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">Kommersiella drönare</Link>
              <span>/</span>
              <span className="text-white/70">Kontakt</span>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-4">Kontakta oss</h1>
                <p className="text-white/50 mb-8 leading-relaxed text-lg">
                  Berätta om ditt behov så hjälper vi dig hitta rätt drönarlösning.
                  Vi återkommer inom 24 timmar med en personlig rekommendation.
                </p>
                <div className="space-y-4">
                  <a href="tel:+46101025591" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                    <Phone className="h-5 w-5 text-orange-500" />
                    <span>010-102 55 91</span>
                  </a>
                  <a href="mailto:Sales@actionking.se" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                    <Mail className="h-5 w-5 text-orange-500" />
                    <span>Sales@actionking.se</span>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {status === "success" ? (
                  <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Tack för din förfrågan!</h2>
                    <p className="text-white/60">
                      Vi har mottagit dina uppgifter och återkommer inom 24 timmar med en personlig rekommendation.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="rounded-2xl bg-[#111] border border-white/10 p-6 md:p-8 space-y-4">
                    <input
                      type="text"
                      name="honeypot"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="absolute opacity-0 pointer-events-none h-0 w-0"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70 text-sm">Namn *</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ditt namn" className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">Företag *</Label>
                        <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Företagsnamn" className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70 text-sm">E-post *</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="din@email.se" className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">Telefon *</Label>
                        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="070-123 45 67" className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70 text-sm">Bransch *</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Välj bransch" /></SelectTrigger>
                          <SelectContent>{INDUSTRIES.map((ind) => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">Primärt behov *</Label>
                        <Select value={need} onValueChange={setNeed}>
                          <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Välj behov" /></SelectTrigger>
                          <SelectContent>{NEEDS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">Jag vill *</Label>
                      <Select value={requestType} onValueChange={setRequestType}>
                        <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Välj typ av förfrågan" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offert">Få en offert</SelectItem>
                          <SelectItem value="demo">Boka en demo</SelectItem>
                          <SelectItem value="radgivning">Få rådgivning</SelectItem>
                          <SelectItem value="information">Bara få mer information</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">Meddelande (valfritt)</Label>
                      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Beskriv gärna ditt projekt eller behov..." rows={3} className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none" />
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="consent"
                        checked={consent}
                        onCheckedChange={(v) => setConsent(v === true)}
                        className="mt-0.5 border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <Label htmlFor="consent" className="text-xs text-white/50 leading-relaxed cursor-pointer">
                        Jag samtycker till att ActionKing lagrar mina uppgifter för att kontakta mig angående kommersiella drönare. *
                      </Label>
                    </div>

                    {status === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}

                    <Button type="submit" disabled={status === "submitting"} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 text-base py-3 h-auto">
                      {status === "submitting" ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Skickar...</> : <>Skicka förfrågan <ArrowRight className="h-4 w-4 ml-1" /></>}
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">ActionKing Enterprise</span>
            </div>
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} ActionKing. Auktoriserad DJI Enterprise-partner.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
