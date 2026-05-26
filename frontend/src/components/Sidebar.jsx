import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, BookOpen, BarChart2, Settings, LogOut, Calendar, UserCheck, PenTool } from 'lucide-react';

const SmartCampusLogo = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 48 46">
    <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
  </svg>
);

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const menus = {
    admin: [
      { path: '/admin/dashboard', label: 'Tableau de bord', icon: Home },
      { path: '/admin/etudiants', label: 'Étudiants', icon: Users },
      { path: '/admin/seed', label: 'Importer Données', icon: BookOpen },
      { path: '/admin/enseignants', label: 'Enseignants', icon: Users },
      { path: '/admin/cours', label: 'Cours', icon: BookOpen },
      { path: '/admin/rapports', label: 'Rapports', icon: BarChart2 },
      { path: '/admin/parametres', label: 'Paramètres', icon: Settings },
    ],
    teacher: [
      { path: '/teacher/dashboard', label: 'Tableau de bord', icon: Home },
      { path: '/teacher/cours', label: 'Mes Cours', icon: BookOpen },
      { path: '/teacher/eleves', label: 'Mes Élèves', icon: Users },
      { path: '/teacher/notes', label: 'Saisie des Notes', icon: PenTool },
      { path: '/teacher/planning', label: 'Emploi du temps', icon: Calendar },
    ],
    student: [
      { path: '/student/dashboard', label: 'Tableau de bord', icon: Home },
      { path: '/student/cours', label: 'Mes Cours', icon: BookOpen },
      { path: '/student/inscription', label: 'S\'inscrire aux Cours', icon: UserCheck },
      { path: '/student/notes', label: 'Mes Notes', icon: BarChart2 },
      { path: '/student/planning', label: 'Mon Emploi du temps', icon: Calendar },
    ]
  };

  const currentMenu = user ? menus[user.role] : menus.admin;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar-custom hidden md:flex flex-col">
      <div className="sidebar-logo px-6 py-5">
        <div className="flex items-center gap-3">
          <SmartCampusLogo className="w-8 h-8 flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-lg tracking-tight">SMARTCAMPUS</div>
            <div className="text-sm text-[var(--color-text-muted)]">Université Connectée</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {currentMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary text-white shadow' : 'text-[#94A3B8] hover:bg-[#243B45] hover:text-white'}`}
            >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center text-white font-bold text-sm">
            {user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : 'U'}
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">{user ? `${user.first_name} ${user.last_name}` : 'Utilisateur'}</div>
            <div className="text-sm text-[var(--color-text-muted)] capitalize">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-md hover:bg-white/5 transition-colors" title="Déconnexion">
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
