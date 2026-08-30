import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useAuthContext,
} from "../context/AuthContext";

function GuestRoute() {
  const {
    user,
    loading,
    isAuthenticated,
    isAdmin,
  } = useAuthContext();

  const location =
    useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          color: "#666",
          fontSize: "14px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  if (isAdmin) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  const from =
    location.state?.from;

  const fromPath =
    from?.pathname || "";

  const fromSearch =
    from?.search || "";

  const fromHash =
    from?.hash || "";

  if (
    fromPath &&
    !fromPath.startsWith("/admin") &&
    fromPath !== "/login" &&
    fromPath !== "/register"
  ) {
    return (
      <Navigate
        to={`${fromPath}${fromSearch}${fromHash}`}
        replace
      />
    );
  }

  return (
    <Navigate
      to="/"
      replace
    />
  );
}

export default GuestRoute;