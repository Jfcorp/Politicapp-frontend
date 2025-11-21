import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from "@/components/ThemeToggle"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"
import {
  LayoutDashboard,
  Users,
  Map,
  Target,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // DEFINICIÓN DE MENÚ CON ROLES PERMITIDOS
  const allNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Coordinador', 'Digitador']
    },
    {
      name: 'Electores',
      href: '/voters',
      icon: Users,
      roles: ['Admin', 'Coordinador'] // Oculto para Digitador
    },
    {
      name: 'Zonas',
      href: '/zones',
      icon: Map,
      roles: ['Admin', 'Coordinador'] // Oculto para Digitador
    },
    {
      name: 'Líderes',
      href: '/leaders',
      icon: Target,
      roles: ['Admin', 'Coordinador', 'Digitador']
    },
  ];

  // FILTRAR NAVEGACIÓN SEGÚN EL ROL DEL USUARIO
  const navigation = allNavigation.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Móvil Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">P</div>
            <h1 className="text-lg font-bold tracking-wider">POLÍTICA PRO</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-md border-2 border-slate-800">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.nombre}</p>
              <div className="flex items-center mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-900/50"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 mr-4">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">
              Panel de Control
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:block">Modo Visual</span>
            <ThemeToggle />
          </div>
        </header>

        {/* Área Scrollable */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/50">
          <div className="p-4 md:p-8 min-h-[calc(100vh-4rem-80px)]">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}