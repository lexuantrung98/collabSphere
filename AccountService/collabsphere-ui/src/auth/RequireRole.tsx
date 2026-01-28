import { Navigate, Outlet } from "react-router-dom";
import { getRole } from "../auth/authStorage";

interface Props {
  allowedRoles: string[];
}

export default function RequireRole({ allowedRoles }: Props) {
  const role = getRole();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
