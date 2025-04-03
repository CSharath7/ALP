import React from "react";
import { Navigate, Outlet,  } from "react-router-dom";
function ProtectedRoute() {
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "Your session has timed out. Please log in again." }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
