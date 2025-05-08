import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import routes from './routes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {routes.publicRoutes.map((route) => (
        <Route 
          key={route.path}
          path={route.path}
          element={route.element}
          exact={route.exact}
        />
      ))}

      {/* Protected Routes */}
      {routes.privateRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<ProtectedRoute>{route.element}</ProtectedRoute>}
          exact={route.exact}
        />
      ))}

      {/* Special Routes */}
      {routes.specialRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
};

export default AppRoutes;
