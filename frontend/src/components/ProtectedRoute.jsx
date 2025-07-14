// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log("User = ", user);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;




// // src/components/ProtectedRoute.jsx
// import React from "react";
// import { Navigate } from "react-router-dom";
// import useAuth from "../hooks/useAuth";

// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();

//   if (user) {
//     return children;
//   }
//   return <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;
