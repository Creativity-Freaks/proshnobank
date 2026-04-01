import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";

type AdminRouteProps = {
  children: React.ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const location = useLocation();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-bengali">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
