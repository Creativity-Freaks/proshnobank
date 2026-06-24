import { AdminProvider } from "@/contexts/AdminContext";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminOverview() {
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  );
}
