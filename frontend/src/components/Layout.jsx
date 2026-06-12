import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Users, Calendar, LogOut, HeartPulse, FileText,
  CreditCard, UserCog, Stethoscope, ClipboardList, User
} from 'lucide-react';

const ROLE_NAV = {
  admin: [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Medical Records', href: '/records', icon: ClipboardList },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Staff', href: '/staff', icon: UserCog },
  ],
  doctor: [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'My Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Medical Records', href: '/records', icon: ClipboardList },
  ],
  nurse: [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Medical Records', href: '/records', icon: ClipboardList },
  ],
  receptionist: [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Billing', href: '/billing', icon: CreditCard },
  ],
  patient: [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'My Records', href: '/my-records', icon: FileText },
    { name: 'Book Appointment', href: '/appointments', icon: Calendar },
    { name: 'My Bills', href: '/my-bills', icon: CreditCard },
  ],
};

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700',
  doctor: 'bg-blue-100 text-blue-700',
  nurse: 'bg-teal-100 text-teal-700',
  receptionist: 'bg-purple-100 text-purple-700',
  patient: 'bg-emerald-100 text-emerald-700',
};

const Layout = ({ user, onLogout }) => {
  const location = useLocation();
  const navigation = ROLE_NAV[user?.role] || ROLE_NAV.patient;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/doctor_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="bg-white/50 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">HealthSync</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Info + Logout */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-none">{user?.name}</p>
                  <span className={`text-xs font-bold capitalize px-1.5 py-0.5 rounded mt-0.5 inline-block ${ROLE_COLORS[user?.role] || 'bg-slate-100 text-slate-600'}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 relative z-10 py-6 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
