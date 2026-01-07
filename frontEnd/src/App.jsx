import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./Auth/AuthContext";
import RequireAuth from "./Auth/RequireAuth";
import RequireRole from "./Auth/RequireRole";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

import OperatorDashboard from "./pages/Operator/OperatorHome";
import LeagueOwnerDashboard from "./pages/LeagueOwner/LeagueOwnerHome";
import PlayerDashboard from "./pages/Player/PlayerHome";
import AdvertiserDashboard from "./pages/Advertiser/AdvertiserHome";
import SpectatorDashboard from "./pages/Spectator/SpectatorHome";

function AppRoutes() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Root route - redirect based on auth status and role */}
      <Route 
        path="/" 
        element={
          user ? (
            // User is logged in - redirect to their role page
            user.role === 'operator' ? <Navigate to="/operator" replace /> :
            user.role === 'leagueOwner' ? <Navigate to="/league-owner" replace /> :
            user.role === 'player' ? <Navigate to="/player" replace /> :
            <Navigate to="/login" replace />
          ) : (
            // User not logged in - redirect to login
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Public routes - redirect to role page if already logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" replace /> : <Register />} 
      />
      
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/operator"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["operator"]}>
              <OperatorDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/league-owner"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["leagueOwner"]}>
              <LeagueOwnerDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/player"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["player"]}>
              <PlayerDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/advertiser"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["advertiser"]}>
              <PlayerDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/spectator"
        element={
              <SpectatorDashboard />
        }
      />
    </Routes>
    
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}