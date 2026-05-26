import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Eye, Users } from 'lucide-react';
import apiClient from '../api/apiClient';

const GestionCours = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/courses.php');
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ouvert':
        return 'bg-green-100 text-green-800';
      case 'fermé':
        return 'bg-red-100 text-red-800';
      case 'validé':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-full">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Cours</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)]">
          <Plus className="w-5 h-5" />
          Ajouter un cours
        </button>
      </div>

      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--color-text-muted)]">Chargement des cours...</p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Titre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Enseignant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Capacité</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      Aucun cours trouvé
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]">
                      <td className="px-6 py-4 font-medium text-[var(--color-primary)]">{course.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{course.title}</div>
                        {course.description && (
                          <div className="text-sm text-[var(--color-text-muted)]">{course.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {course.teacher_first_name ? (
                          <div>
                            <div className="font-medium">{course.teacher_first_name} {course.teacher_last_name}</div>
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {course.max_capacity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Voir">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded text-red-600" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-muted)]">
            Total : {courses.length} cours
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCours;
