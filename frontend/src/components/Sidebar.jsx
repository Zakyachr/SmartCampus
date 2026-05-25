import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, BookOpen, BarChart2, Settings, LogOut, GraduationCap, Calendar, UserCheck, PenTool } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const menus = {
    admin: [
      { path: '/admin/dashboard', label: 'Tableau de bord', icon: Home },
      { path: '/admin/etudiants', label: 'Étudiants', icon: Users },
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
          <GraduationCap className="w-7 h-7 text-white" />
          <div>
            <div className="text-white font-bold text-lg">SMARTCAMPUS</div>
            <div className="text-sm text-[var(--color-text-muted)]">Université Connectée</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {currentMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-white shadow' : 'text-[#94A3B8] hover:bg-[#243B45]'}`}
            >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <img src={(user && user.avatar) || '/avatar-placeholder.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <div className="text-white font-semibold">{user ? `${user.first_name} ${user.last_name}` : 'Utilisateur'}</div>
            <div className="text-sm text-[var(--color-text-muted)] capitalize">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-md hover:bg-white/5">
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
