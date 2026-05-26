import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, Award, BarChart2, UserCheck, Clock } from 'lucide-react';
import apiClient from '../api/apiClient';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await apiClient.get('/dashboard.php');
      setData(response.data);
    } catch (err) {
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="mt-4 text-[var(--color-text-muted)]">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-[var(--color-text-muted)]">Erreur de chargement</div>;

  const statCards = [
    { label: 'Étudiants', value: data.total_students || 0, icon: Users, color: 'from-purple-500 to-purple-700', bgLight: 'from-purple-50 to-purple-100' },
    { label: 'Enseignants', value: data.total_teachers || 0, icon: GraduationCap, color: 'from-blue-500 to-blue-700', bgLight: 'from-blue-50 to-blue-100' },
    { label: 'Cours', value: data.total_courses || 0, icon: BookOpen, color: 'from-cyan-500 to-cyan-700', bgLight: 'from-cyan-50 to-cyan-100' },
    { label: 'Inscriptions', value: data.total_enrollments || 0, icon: UserCheck, color: 'from-emerald-500 to-emerald-700', bgLight: 'from-emerald-50 to-emerald-100' },
  ];

  return (
    <div className="max-w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Vue d'ensemble du campus numérique</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="card p-5 card-glow" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgLight}`}>
                <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} bg-clip-text`} style={{ color: stat.color.includes('purple') ? '#863bff' : stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('cyan') ? '#06b6d4' : '#10b981' }} />
              </div>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Performance + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="card p-6 card-glow">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
            Performance Académique
          </h2>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-text-muted)]">Moyenne générale</span>
                <span className="text-xl font-bold text-[var(--color-primary)]">{data.global_average || 0}<span className="text-sm text-gray-400">/20</span></span>
              </div>
              <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] rounded-full transition-all duration-1000"
                  style={{ width: `${((data.global_average || 0) / 20) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-text-muted)]">Taux de réussite</span>
                <span className="text-xl font-bold text-green-600">{data.pass_rate || 0}%</span>
              </div>
              <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${data.pass_rate || 0}%` }}
                />
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-[var(--color-text-muted)]">Étudiants admis</span>
              </div>
              <p className="text-sm mt-1">
                <span className="font-bold text-green-600">{data.pass_rate}%</span> des étudiants ont une moyenne ≥ 10/20
              </p>
            </div>
          </div>
        </div>

        {/* Distribution par filière */}
        <div className="card p-6 card-glow">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[var(--color-primary)]" />
            Répartition par Filière
          </h2>
          {(data.students_by_major || []).length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-center py-4">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {(data.students_by_major || []).map((item, idx) => {
                const maxCount = Math.max(...(data.students_by_major || []).map(i => i.count));
                const colors = ['#863bff', '#47bfff', '#10b981', '#f59e0b', '#ef4444'];
                const color = colors[idx % colors.length];
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.major || 'Non définie'}</span>
                      <span className="text-sm font-bold" style={{ color }}>{item.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(item.count / maxCount) * 100}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Distribution par niveau */}
          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3">Par Niveau</h3>
            <div className="flex gap-3">
              {(data.students_by_level || []).map((item, idx) => (
                <div key={idx} className="flex-1 text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                  <p className="text-lg font-bold text-[var(--color-primary)]">{item.count}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.level || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top courses */}
        <div className="card p-6 card-glow">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
            Cours Populaires
          </h2>
          <div className="space-y-3">
            {(data.top_courses || []).map((course, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 
                  idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                  idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 
                  'bg-gradient-to-br from-purple-300 to-purple-500'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{course.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {course.code} · {course.teacher_first_name ? `${course.teacher_first_name} ${course.teacher_last_name}` : 'Non assigné'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[var(--color-primary)]">{course.enrollment_count}</p>
                  <p className="text-xs text-gray-400">/{course.max_capacity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent enrollments */}
      <div className="card p-6 card-glow">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--color-primary)]" />
          Dernières Inscriptions
        </h2>
        {(data.recent_enrollments || []).length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-center py-4">Aucune inscription récente</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-[var(--color-border)]">
                  <th className="py-3 text-left">Étudiant</th>
                  <th className="py-3 text-left">Cours</th>
                  <th className="py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {(data.recent_enrollments || []).map((enrollment, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                          {enrollment.first_name?.[0]}{enrollment.last_name?.[0]}
                        </div>
                        <span className="font-medium text-sm">{enrollment.first_name} {enrollment.last_name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-[var(--color-text-muted)]">{enrollment.course_title}</td>
                    <td className="py-3 text-sm text-[var(--color-text-muted)]">
                      {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
