import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import EnterpriseNav from "@/components/EnterpriseNav";
import EnterpriseFooter from "@/components/EnterpriseFooter";
import DroneAccessories from "@/components/DroneAccessories";
import { getDroneProductBySlug } from "@/data/enterpriseDroneProducts";
import { getAccessoriesForDrones } from "@/data/droneAccessories";
import { droneUrl, DRONE_BREADCRUMB_ROOT } from "@/lib/publicSite";

export default function DroneModelAccessories() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const product = productSlug ? getDroneProductBySlug(productSlug) : undefined;
  const accessories = product ? getAccessoriesForDrones([product.name]) : [];

  if (!product || accessories.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sidan hittades inte</h1>
          <Link to="/kommersiella-dronare/produkter" className="text-orange-500 hover:underline">
            ← Tillbaka till produkter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={`Tillbehör till ${product.name} — EU Drone Company`}
        description={`Payloads, batterier, laddare och andra tillbehör till ${product.name}. ${accessories.length} produkter tillgängliga hos EU Drone Company.`}
        canonical={droneUrl(`/kommersiella-dronare/produkter/${product.slug}/tillbehor`)}
        breadcrumbs={[
          ...DRONE_BREADCRUMB_ROOT,
          { name: "Produkter", url: droneUrl("/kommersiella-dronare/produkter") },
          { name: product.name, url: droneUrl(`/kommersiella-dronare/produkter/${product.slug}`) },
          { name: "Tillbehör", url: droneUrl(`/kommersiella-dronare/produkter/${product.slug}/tillbehor`) },
        ]}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <EnterpriseNav />

        <section className="relative pt-32 pb-10 md:pt-44 md:pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-6">
              <Link to="/kommersiella-dronare" className="hover:text-white transition-colors">
                Kommersiella drönare
              </Link>
              <span>/</span>
              <Link to="/kommersiella-dronare/produkter" className="hover:text-white transition-colors">
                Produkter
              </Link>
              <span>/</span>
              <Link to={`/kommersiella-dronare/produkter/${product.slug}`} className="hover:text-white transition-colors">
                {product.name}
              </Link>
              <span>/</span>
              <span className="text-white/70">Tillbehör</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[0.95] mb-4">
              Tillbehör till {product.name}
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
              Payloads, batterier, laddare och annan utrustning som är kompatibel med {product.name}.
            </p>

            <Link
              to={`/kommersiella-dronare/produkter/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mt-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Tillbaka till {product.name}
            </Link>
          </div>
        </section>

        <DroneAccessories droneNames={[product.name]} heading={`Alla tillbehör till ${product.name}`} />

        <EnterpriseFooter />
      </div>
    </>
  );
}
