import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Eye, X, BookOpen, Users, BarChart2 } from 'lucide-react';
import apiClient from '../api/apiClient';

const GestionEnseignants = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherStudents, setTeacherStudents] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/teachers.php');
      setTeachers(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des enseignants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.post('/teachers.php', formData);
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        department: ''
      });
      fetchTeachers();
    } catch (err) {
      alert('Erreur lors de l\'ajout de l\'enseignant: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      setDeleting(true);
      await apiClient.delete(`/teachers.php?id=${id}`);
      setShowDeleteConfirm(null);
      fetchTeachers();
    } catch (err) {
      alert('Erreur lors de la suppression: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleViewTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
    setLoadingDetails(true);

    try {
      // Get all courses to filter by this teacher
      const coursesResponse = await apiClient.get('/courses.php');
      const allCourses = coursesResponse.data || [];
      const tCourses = allCourses.filter(c => c.teacher_id == teacher.id);
      setTeacherCourses(tCourses);

      // For each course, get enrolled students
      const studentsMap = {};
      for (const course of tCourses) {
        try {
          const studentsResponse = await apiClient.get(`/enrollments.php?course_id=${course.id}`);
          studentsMap[course.id] = studentsResponse.data || [];
        } catch {
          studentsMap[course.id] = [];
        }
      }
      setTeacherStudents(studentsMap);
    } catch (err) {
      console.error('Erreur chargement détails:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="max-w-full">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Enseignants</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20">
          <Plus className="w-5 h-5" />
          Ajouter un enseignant
        </button>
      </div>

      {/* Modal ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold">Ajouter un enseignant</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg col-span-2 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="text"
                  placeholder="Département"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg col-span-2 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-[var(--color-text-muted)] mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{showDeleteConfirm.first_name} {showDeleteConfirm.last_name}</strong> ? 
              Ses cours seront conservés mais n'auront plus d'enseignant assigné.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteTeacher(showDeleteConfirm.id)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal consultation enseignant */}
      {showViewModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center text-white font-bold">
                  {selectedTeacher.first_name[0]}{selectedTeacher.last_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedTeacher.first_name} {selectedTeacher.last_name}</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Département : {selectedTeacher.department || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                  <p className="mt-3 text-[var(--color-text-muted)]">Chargement des détails...</p>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">Cours enseignés</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{teacherCourses.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Total Étudiants</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {Object.values(teacherStudents).reduce((sum, arr) => sum + arr.length, 0)}
                      </p>
                    </div>
                  </div>

                  {/* Courses list */}
                  {teacherCourses.length === 0 ? (
                    <p className="text-center py-6 text-[var(--color-text-muted)]">Aucun cours assigné à cet enseignant.</p>
                  ) : (
                    <div className="space-y-4">
                      {teacherCourses.map((course) => (
                        <div key={course.id} className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-[var(--color-primary)]">{course.code}</span>
                              <span className="mx-2 text-gray-300">·</span>
                              <span className="font-medium">{course.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                              <Users className="w-4 h-4" />
                              <span>{(teacherStudents[course.id] || []).length} / {course.max_capacity}</span>
                            </div>
                          </div>
                          
                          {(teacherStudents[course.id] || []).length > 0 ? (
                            <div className="px-4 py-2">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-xs text-gray-500 uppercase">
                                    <th className="py-2 text-left">Étudiant</th>
                                    <th className="py-2 text-left">Email</th>
                                    <th className="py-2 text-left">N° Étudiant</th>
                                    <th className="py-2 text-left">Filière</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(teacherStudents[course.id] || []).map((student) => (
                                    <tr key={student.id} className="border-t border-gray-100 text-sm">
                                      <td className="py-2 font-medium">{student.first_name} {student.last_name}</td>
                                      <td className="py-2 text-gray-500">{student.email}</td>
                                      <td className="py-2 text-gray-500">{student.student_number}</td>
                                      <td className="py-2 text-gray-500">{student.major || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-400 text-center">Aucun étudiant inscrit</div>
                          )}
                        </div>
                      ))}
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
          <p className="text-[var(--color-text-muted)]">Chargement des enseignants...</p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Département</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      Aucun enseignant trouvé
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="px-6 py-4 font-medium">{teacher.first_name} {teacher.last_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {teacher.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">{teacher.department || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewTeacher(teacher)}
                            className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors" 
                            title="Voir les cours et étudiants"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(teacher)}
                            className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors" 
                            title="Supprimer"
                          >
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
            Total : {teachers.length} enseignant{teachers.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEnseignants;
