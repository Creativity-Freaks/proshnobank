import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const AdminWorkspace = lazy(() => import("@/components/admin/AdminWorkspace"));

const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background font-bengali">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
  </div>
);

export default function AdminOverview() {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminWorkspace />
    </Suspense>
  );
}
