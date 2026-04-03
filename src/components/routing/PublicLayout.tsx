import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OutletFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-background font-bengali text-foreground">
    <div className="flex items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm tracking-wide text-muted-foreground">Loading...</span>
    </div>
  </div>
);

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />
      <Suspense fallback={<OutletFallback />}>
        <Outlet />
      </Suspense>
      <Footer />
    </div>
  );
}
