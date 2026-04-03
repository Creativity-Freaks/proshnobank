import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

const OutletFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background font-bengali text-foreground">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
  </div>
);

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background font-bengali flex flex-col">
      <div className="flex-1">
        <Suspense fallback={<OutletFallback />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
