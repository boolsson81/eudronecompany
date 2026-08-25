import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, BookOpen, Scale, GraduationCap, FileText, ExternalLink, Eye, CheckCircle2 } from "lucide-react";
import { DRONE_CATEGORIES, TRAINING_REQUIREMENTS } from "@/data/droneRegulations";

const faqItems = [
  {
    q: "Behöver kunden registrera sig som drönaroperatör?",
    a: "Ja, alla som flyger drönare i kommersiellt syfte (eller drönare över 250 g / med kamera) måste registrera sig som UAS-operatör hos Transportstyrelsen. Operatörsnumret ska märkas på drönaren.",
  },
  {
    q: "Vilken utbildning krävs för att flyga enterprise-drönare?",
    a: "Minst A1/A3-onlinekurs och -prov (gratis via Transportstyrelsen). För närflygning behövs A2-certifikat. För Specific-kategorin krävs STS-certifikat eller motsvarande.",
  },
  {
    q: "Får kunden flyga i kontrollerat luftrum (CTR)?",
    a: "Inte utan tillstånd. Ansökan görs via Transportstyrelsen eller godkänd U-space-tjänst. Många flygplatser har etablerade zoner med automatiserade tillståndsprocesser.",
  },
  {
    q: "Vad gäller för BVLOS-flygning (utom synhåll)?",
    a: "BVLOS kräver Specific-kategorins tillstånd. STS-02 tillåter BVLOS med observatör upp till 2 km. Längre BVLOS kräver fullständig SORA-process.",
  },
  {
    q: "Gäller samma regler i hela EU?",
    a: "Grundreglerna är EU-gemensamma (EU 2019/947 och 2019/945), men varje land kan ha geografiska zoner med lokala restriktioner. I Sverige hanterar Transportstyrelsen dessa.",
  },
  {
    q: "Behöver kunden försäkring?",
    a: "Ja, alla drönare som flygs kommersiellt eller väger över 20 kg kräver ansvarsförsäkring. Rekommenderas starkt för alla enterprise-användare.",
  },
  {
    q: "Var hittar man aktuella flygförbudszoner?",
    a: "Drönarkartan (drönarkarta.se) från Transportstyrelsen, eller Luftfartsverkets AIP och NOTAM-tjänster.",
  },
  {
    q: "Vilka DJI Enterprise-drönare hamnar i vilken kategori?",
    a: "DJI Mavic 3E/M3T (under 900g) kan flygas i A1 med C1-märkning. M30/M300/M350 (tyngre) kräver A2 eller A3. För BVLOS/Dock-flygning krävs Specific-kategori.",
  },
];

const transportstyrLinks = [
  { title: "Transportstyrelsen – Drönare (startsida)", url: "https://www.transportstyrelsen.se/dronare", desc: "Officiell myndighetssida med all information om drönare, regler och registrering" },
  { title: "Utbildning & prov – A1/A3", url: "https://www.transportstyrelsen.se/sv/luftfart/dronare/utbildning-och-prov/", desc: "Boka och genomför den obligatoriska onlinekursen och provet för A1/A3" },
  { title: "Utbildningsmaterial – Studiehandledning", url: "https://www.transportstyrelsen.se/sv/luftfart/dronare/utbildning-och-prov/studiematerial/", desc: "Transportstyrelsens officiella studiematerial och handledningar inför drönarproven" },
  { title: "Registrera dig som UAS-operatör", url: "https://www.transportstyrelsen.se/sv/luftfart/dronare/registrera-dig/", desc: "Registrera dig eller ditt företag som drönaroperatör – ett lagkrav för kommersiell flygning" },
  { title: "Regler för drönare – Översikt", url: "https://www.transportstyrelsen.se/sv/luftfart/dronare/regler-for-dronare/", desc: "Samlad översikt av gällande regler, kategorier och begränsningar" },
];

const usefulLinks = [
  { title: "EASA – Drones", url: "https://www.easa.europa.eu/en/domains/drones-air-mobility", desc: "EU-regler och vägledning från EASA" },
  { title: "Drönarkartan", url: "https://www.dronekartan.se/", desc: "Interaktiv karta med flygzoner och restriktioner i Sverige" },
  { title: "LFV – Luftfartsverket", url: "https://www.lfv.se/", desc: "Luftrumsinformation, NOTAM och U-space" },
];

const sellingPoints = [
  "Hjälp kunden förstå vilken kategori deras användningsfall kräver",
  "Rekommendera rätt utbildning INNAN leverans – ökar kundnöjdhet",
  "Vid Dock/BVLOS: förvarna om SORA-process (kan ta 3–6 månader)",
  "Erbjud vår utbildningstjänst som tilläggsvärde vid offert",
  "Ha koll på kundernas operatörsregistrering – det är lagkrav",
];

export default function AdminDroneRegulations() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Drönaregler & Utbildningskrav i Sverige</h1>
        </div>
        <p className="text-muted-foreground">
          Intern säljguide: Översikt av EU:s drönarregler (EASA) som gäller i Sverige, med fokus på enterprise-användning.
        </p>
      </div>

      {/* Sales tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Säljtips — Regelverk som försäljningsargument
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {sellingPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* EASA categories from shared data */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          EASA-kategorier
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DRONE_CATEGORIES.map((cat) => (
            <Card key={cat.slug}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{cat.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{cat.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Max vikt: {cat.maxWeight}</Badge>
                  <Badge variant="outline">Ålder: {cat.pilotAge}</Badge>
                  {cat.requiresRegistration && <Badge variant="outline" className="bg-amber-500/10 text-amber-700">Registrering krävs</Badge>}
                  {cat.requiresInsurance && <Badge variant="outline" className="bg-red-500/10 text-red-700">Försäkring krävs</Badge>}
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Utbildning: {cat.trainingRequired}</p>
                </div>
                {cat.allowedDrones.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="drones">
                      <AccordionTrigger className="text-sm py-2">DJI-drönare i denna kategori ({cat.allowedDrones.length})</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {cat.allowedDrones.map((d, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="font-medium text-foreground">{d.name}</span>
                              <Badge variant="outline" className="text-[10px] shrink-0">{d.classLabel}</Badge>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Training requirements per industry */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5 text-primary" />
          Utbildningskrav per bransch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRAINING_REQUIREMENTS.map((tr) => (
            <Card key={tr.slug}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <tr.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">{tr.title.replace("Utbildningskrav för ", "")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{tr.description}</p>
                <Badge variant="outline" className="text-xs">{tr.requiredCategory}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Utbildningskrav tabell */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5" />
            Utbildningskrav per kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Kategori</th>
                  <th className="text-left py-3 px-2 font-semibold">Utbildning</th>
                  <th className="text-left py-3 px-2 font-semibold">Prov</th>
                  <th className="text-left py-3 px-2 font-semibold">Giltighetstid</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-2"><Badge variant="outline" className="bg-emerald-500/10 text-emerald-700">A1/A3</Badge></td>
                  <td className="py-3 px-2">Onlinekurs (ca 4-6 timmar)</td>
                  <td className="py-3 px-2">40 flervalsfrågor, 75% för godkänt</td>
                  <td className="py-3 px-2">5 år</td>
                </tr>
                <tr>
                  <td className="py-3 px-2"><Badge variant="outline" className="bg-amber-500/10 text-amber-700">A2</Badge></td>
                  <td className="py-3 px-2">Teoretisk kurs + praktisk självutvärdering</td>
                  <td className="py-3 px-2">30 flervalsfrågor, 75% för godkänt</td>
                  <td className="py-3 px-2">5 år</td>
                </tr>
                <tr>
                  <td className="py-3 px-2"><Badge variant="outline" className="bg-amber-500/10 text-amber-700">STS</Badge></td>
                  <td className="py-3 px-2">Teoretisk kurs + praktisk utbildning</td>
                  <td className="py-3 px-2">Teori + praktiskt prov hos godkänd enhet</td>
                  <td className="py-3 px-2">5 år</td>
                </tr>
                <tr>
                  <td className="py-3 px-2"><Badge variant="outline" className="bg-red-500/10 text-red-700">Certified</Badge></td>
                  <td className="py-3 px-2">Fjärrpilotlicens (Part-FCL)</td>
                  <td className="py-3 px-2">Fullständig licensprocess</td>
                  <td className="py-3 px-2">Enligt licens</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5" />
            Vanliga frågor (intern referens)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Transportstyrelsen */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-primary" />
            Transportstyrelsen – Drönare & Utbildning
          </CardTitle>
          <CardDescription>
            Direktlänkar till Transportstyrelsens officiella sidor för drönare, utbildningsmaterial och registrering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transportstyrLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-lg border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{link.title}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="h-5 w-5" />
            Övriga användbara länkar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {usefulLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{link.title}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
