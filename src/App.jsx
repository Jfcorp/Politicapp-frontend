import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Zones from './pages/zones/Zones';
import Voters from './pages/voters/Voters';
import Leaders from './pages/leaders/Leaders';

// Componente de Protección de Rutas
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas (War Room) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Aquí agregaremos las otras rutas: */}
              <Route path="/voters" element={<Voters />} />
              <Route path="/zones" element={<Zones />} />
              <Route path="/leaders" element={<Leaders />} />

              {/* Redirección raíz */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;