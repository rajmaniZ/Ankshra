// import {
//   Navigate,
//   Outlet,
//   useLocation,
// } from "react-router-dom";

// import {
//   useAuthContext,
// } from "../context/AuthContext";

// function AdminRoute() {
//   const {
//     user,
//     loading,
//     isAuthenticated,
//   } = useAuthContext();

//   const location =
//     useLocation();

//   if (loading) {
//     return (
//       <div
//         style={{
//           minHeight: "60vh",
//           display: "grid",
//           placeItems: "center",
//         }}
//       >
//         Loading...
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <Navigate
//         to="/login"
//         state={{
//           from: location,
//         }}
//         replace
//       />
//     );
//   }

//   const role = String(
//     user?.role || "",
//   )
//     .trim()
//     .toLowerCase();

//   if (role !== "admin") {
//     return (
//       <Navigate
//         to="/"
//         replace
//       />
//     );
//   }

//   return <Outlet />;
// }

// export default AdminRoute;


import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useAuthContext,
} from "../context/AuthContext";

function AdminRoute() {
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
          fontSize: "14px",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminRoute;