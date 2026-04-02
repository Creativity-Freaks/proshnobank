import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";

type TeacherRouteProps = {
  children: React.ReactNode;
};

const TeacherRoute = ({ children }: TeacherRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { hasRole: canAccessTeacherDashboard, isLoading: roleLoading } = useRoleCheck([
    "admin",
    "moderator",
    "teacher",
  ]);
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-bengali">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/teacher-login" replace state={{ from: location.pathname }} />;
  }

  if (!canAccessTeacherDashboard) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default TeacherRoute;
