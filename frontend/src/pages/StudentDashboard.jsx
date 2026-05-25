import React from 'react';
import { User, BookOpen, Calendar, Star } from 'lucide-react';

const StudentDashboard = () => (
  <div>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Mon tableau de bord</h1>
      <p className="text-[var(--color-text-muted)]">Bienvenue — aperçu rapide</p>
    </div>
    <div className="grid grid-cols-4 gap-6">
      <div className="card p-4 flex items-center gap-4">
        <div className="rounded-md bg-blue-50 p-3"><User className="w-6 h-6 text-blue-600"/></div>
        <div>
          <div className="text-2xl font-bold">24</div>
          <div className="text-sm text-[var(--color-text-muted)]">Cours inscrits</div>
        </div>
      </div>
      <div className="card p-4 flex items-center gap-4">
        <div className="rounded-md bg-green-50 p-3"><BookOpen className="w-6 h-6 text-green-600"/></div>
        <div>
          <div className="text-2xl font-bold">14.8</div>
          <div className="text-sm text-[var(--color-text-muted)]">Moyenne générale</div>
        </div>
      </div>
      <div className="card p-4 flex items-center gap-4">
        <div className="rounded-md bg-indigo-50 p-3"><Calendar className="w-6 h-6 text-indigo-600"/></div>
        <div>
          <div className="text-2xl font-bold">60</div>
          <div className="text-sm text-[var(--color-text-muted)]">Crédits validés</div>
        </div>
      </div>
      <div className="card p-4 flex items-center gap-4">
        <div className="rounded-md bg-yellow-50 p-3"><Star className="w-6 h-6 text-yellow-600"/></div>
        <div>
          <div className="text-2xl font-bold">3</div>
          <div className="text-sm text-[var(--color-text-muted)]">Tâches récentes</div>
        </div>
      </div>
    </div>
  </div>
);

export default StudentDashboard;
