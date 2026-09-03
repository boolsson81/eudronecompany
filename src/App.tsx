import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Loader2 } from "lucide-react";

const Login = lazy(() => import("./pages/Login"));

// Publika sidor — samma sökvägar som i digitalsignal-SPA:n, så att 301:orna
// bara behöver byta domän. Se docs/FRONTEND_MIGRATION.md.
const CommercialDrones = lazy(() => import("./pages/CommercialDrones"));
const CommercialDronesContact = lazy(() => import("./pages/CommercialDronesContact"));
const CommercialDronesProducts = lazy(() => import("./pages/CommercialDronesProducts"));
const CommercialDroneCameras = lazy(() => import("./pages/CommercialDroneCameras"));
const CommercialDroneCamera = lazy(() => import("./pages/CommercialDroneCamera"));
const CommercialDroneIndustry = lazy(() => import("./pages/CommercialDroneIndustry"));
const CommercialDroneSolution = lazy(() => import("./pages/CommercialDroneSolution"));
const DroneComparisons = lazy(() => import("./pages/DroneComparisons"));
const DroneComparisonArticle = lazy(() => import("./pages/DroneComparisonArticle"));
const DroneCameraComparison = lazy(() => import("./pages/DroneCameraComparison"));
const DroneRegulations = lazy(() => import("./pages/DroneRegulations"));
const DroneRegulationCategory = lazy(() => import("./pages/DroneRegulationCategory"));
const DroneTrainingRequirement = lazy(() => import("./pages/DroneTrainingRequirement"));
const DroneConfiguration = lazy(() => import("./pages/DroneConfiguration"));
const CustomParts = lazy(() => import("./pages/CustomParts"));

// Driftsvyer
const ShopifyCloner = lazy(() => import("./pages/ShopifyCloner"));
const ShopifyDroneClone = lazy(() => import("./pages/admin/ShopifyDroneClone"));
const ProductCompliance = lazy(() => import("./pages/admin/ProductCompliance"));
const AdminDroneRegulations = lazy(() => import("./pages/admin/AdminDroneRegulations"));

// Inköp
const TradeFairs = lazy(() => import("./pages/admin/TradeFairs"));
const TradeFairEvent = lazy(() => import("./pages/admin/TradeFairEvent"));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<CommercialDrones />} />
            <Route path="/login" element={<Login />} />

            <Route path="/kommersiella-dronare" element={<CommercialDrones />} />
            <Route path="/kommersiella-dronare/kontakt" element={<CommercialDronesContact />} />
            <Route path="/kommersiella-dronare/produkter" element={<CommercialDronesProducts />} />
            <Route path="/kommersiella-dronare/kameror" element={<CommercialDroneCameras />} />
            <Route path="/kommersiella-dronare/kameror/:cameraSlug" element={<CommercialDroneCamera />} />
            <Route path="/kommersiella-dronare/jamforelser" element={<DroneComparisons />} />
            <Route path="/kommersiella-dronare/jamforelser/:comparisonSlug" element={<DroneComparisonArticle />} />
            <Route path="/kommersiella-dronare/jamfor-kameror" element={<DroneCameraComparison />} />
            <Route path="/kommersiella-dronare/specialtillverkning" element={<CustomParts />} />
            <Route path="/kommersiella-dronare/regelverk" element={<DroneRegulations />} />
            <Route path="/kommersiella-dronare/regelverk/:categorySlug" element={<DroneRegulationCategory />} />
            <Route path="/kommersiella-dronare/utbildning/:trainingSlug" element={<DroneTrainingRequirement />} />
            <Route path="/kommersiella-dronare/konfiguration/:configSlug" element={<DroneConfiguration />} />
            <Route path="/kommersiella-dronare/:slug" element={<CommercialDroneIndustry />} />
            <Route path="/kommersiella-dronare/:slug/:solutionSlug" element={<CommercialDroneSolution />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/shopify-cloner" replace />} />
              <Route path="shopify-cloner" element={<ShopifyCloner />} />
              <Route path="shopify-cloner/:migrationId" element={<ShopifyCloner />} />
              <Route path="shopify-drone-clone" element={<ShopifyDroneClone />} />
              <Route path="product-compliance" element={<ProductCompliance />} />
              <Route path="drone-regulations" element={<AdminDroneRegulations />} />
              <Route path="trade-fairs" element={<TradeFairs />} />
              <Route path="trade-fairs/:slug" element={<TradeFairEvent />} />
            </Route>

            <Route path="*" element={<Navigate to="/kommersiella-dronare" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}
