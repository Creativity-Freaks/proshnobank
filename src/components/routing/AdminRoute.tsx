type AdminRouteProps = {
  children: React.ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  // TODO: Add proper authentication check when needed
  // For now, allow all admin routes to be accessible
  return children;
};

export default AdminRoute;
