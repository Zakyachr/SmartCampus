import React, { useState, useEffect } from 'react';
import { Mail, Plus, Eye, Users, X } from 'lucide-react';
import apiClient from '../api/apiClient';

const GestionCours = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

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

  const handleViewCourse = async (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
    setLoadingStudents(true);

    try {
      const response = await apiClient.get(`/enrollments.php?course_id=${course.id}`);
      setCourseStudents(response.data || []);
    } catch (err) {
      console.error('Erreur chargement étudiants:', err);
      setCourseStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ouvert':
        return 'bg-green-100 text-green-800';
      case 'fermé':
        return 'bg-red-100 text-red-800';
      case 'validé':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-full">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Cours</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20">
          <Plus className="w-5 h-5" />
          Ajouter un cours
        </button>
      </div>

      {/* Modal consultation des étudiants du cours */}
      {showViewModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 font-mono font-bold text-sm">{selectedCourse.code}</span>
                  <h2 className="text-xl font-bold">{selectedCourse.title}</h2>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Enseignant : {selectedCourse.teacher_first_name ? `${selectedCourse.teacher_first_name} ${selectedCourse.teacher_last_name}` : 'Non assigné'}
                  <span className="mx-2">·</span>
                  Capacité : {selectedCourse.max_capacity} places
                </p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingStudents ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                  <p className="mt-3 text-[var(--color-text-muted)]">Chargement des étudiants...</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                    <div className="p-3 rounded-full bg-purple-100">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{courseStudents.length}</p>
                      <p className="text-sm text-purple-500">étudiant{courseStudents.length > 1 ? 's' : ''} inscrit{courseStudents.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-32 h-3 bg-purple-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((courseStudents.length / (selectedCourse.max_capacity || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">{courseStudents.length}/{selectedCourse.max_capacity} places</p>
                    </div>
                  </div>

                  {/* Students list */}
                  {courseStudents.length === 0 ? (
                    <p className="text-center py-6 text-[var(--color-text-muted)]">Aucun étudiant inscrit à ce cours.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Étudiant</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Étudiant</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Filière</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Niveau</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseStudents.map((student, idx) => (
                            <tr key={student.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-gray-400 text-sm">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                                    {student.first_name[0]}{student.last_name[0]}
                                  </div>
                                  <span className="font-medium">{student.first_name} {student.last_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3" />
                                  {student.email}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{student.student_number}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{student.major || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{student.level || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
                    <tr key={course.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
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
                          <button 
                            onClick={() => handleViewCourse(course)}
                            className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors" 
                            title="Voir les étudiants inscrits"
                          >
                            <Eye className="w-4 h-4" />
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
