import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Eye, Calendar, X, Award, BookOpen, TrendingUp, Edit, Search } from 'lucide-react';
import apiClient from '../api/apiClient';

const GestionEtudiants = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [studentRank, setStudentRank] = useState(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    student_number: '',
    major: '',
    level: '',
    major: '',
    level: '',
    date_of_birth: ''
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    student_number: '',
    major: '',
    level: '',
    date_of_birth: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/students.php');
      setStudents(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des étudiants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.post('/students.php', formData);
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        student_number: '',
        major: '',
        level: '',
        date_of_birth: ''
      });
      fetchStudents();
    } catch (err) {
      alert('Erreur lors de l\'ajout de l\'étudiant: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.put(`/students.php?id=${editFormData.id}`, editFormData);
      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      alert('Erreur lors de la modification de l\'étudiant: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (student) => {
    setEditFormData({
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      student_number: student.student_number,
      major: student.major || '',
      level: student.level || '',
      date_of_birth: student.date_of_birth || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteStudent = async (id) => {
    try {
      setDeleting(true);
      await apiClient.delete(`/students.php?id=${id}`);
      setShowDeleteConfirm(null);
      fetchStudents();
    } catch (err) {
      alert('Erreur lors de la suppression: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
    setLoadingGrades(true);

    try {
      // Fetch grades for this student
      const gradesResponse = await apiClient.get(`/grades.php?student_id=${student.id}`);
      setStudentGrades(gradesResponse.data || []);

      // Calculate rank: get all students' averages
      const allStudentsResponse = await apiClient.get('/students.php');
      const allStudents = allStudentsResponse.data;
      
      // For ranking, we need all students' grades
      const allGradesPromises = allStudents.map(async (s) => {
        try {
          const res = await apiClient.get(`/grades.php?student_id=${s.id}`);
          const grades = res.data || [];
          const graded = grades.filter(g => g.final_grade !== null);
          const avg = graded.length > 0 
            ? graded.reduce((sum, g) => sum + parseFloat(g.final_grade), 0) / graded.length 
            : null;
          return { id: s.id, average: avg };
        } catch {
          return { id: s.id, average: null };
        }
      });

      const allAverages = await Promise.all(allGradesPromises);
      const ranked = allAverages
        .filter(a => a.average !== null)
        .sort((a, b) => b.average - a.average);
      
      const rank = ranked.findIndex(a => a.id === student.id) + 1;
      setStudentRank(rank > 0 ? { rank, total: ranked.length } : null);
    } catch (err) {
      console.error('Erreur chargement notes:', err);
      setStudentGrades([]);
    } finally {
      setLoadingGrades(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined) return 'text-gray-400';
    if (grade >= 16) return 'text-green-600';
    if (grade >= 14) return 'text-blue-600';
    if (grade >= 12) return 'text-yellow-600';
    if (grade >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadge = (grade) => {
    if (grade === null || grade === undefined) return { text: 'N/A', bg: 'bg-gray-100 text-gray-500' };
    if (grade >= 16) return { text: 'Très Bien', bg: 'bg-green-100 text-green-700' };
    if (grade >= 14) return { text: 'Bien', bg: 'bg-blue-100 text-blue-700' };
    if (grade >= 12) return { text: 'Assez Bien', bg: 'bg-yellow-100 text-yellow-700' };
    if (grade >= 10) return { text: 'Passable', bg: 'bg-orange-100 text-orange-700' };
    return { text: 'Insuffisant', bg: 'bg-red-100 text-red-700' };
  };

  // Extraire les filières et niveaux uniques pour les dropdowns
  const uniqueMajors = [...new Set(students.map(s => s.major).filter(Boolean))].sort();
  const uniqueLevels = [...new Set(students.map(s => s.level).filter(Boolean))].sort();

  // Filtrer les étudiants selon la recherche et les filtres filière/niveau
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      (student.student_number && student.student_number.toLowerCase().includes(query))
    );
    const matchesMajor = selectedMajor === '' || student.major === selectedMajor;
    const matchesLevel = selectedLevel === '' || student.level === selectedLevel;
    
    return matchesSearch && matchesMajor && matchesLevel;
  });

  const studentAvg = studentGrades.length > 0
    ? studentGrades.filter(g => g.final_grade).reduce((sum, g) => sum + parseFloat(g.final_grade), 0) / studentGrades.filter(g => g.final_grade).length
    : null;

  return (
    <div className="max-w-full">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Gestion des Étudiants</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="search-container">
            <input 
              className="search-input" 
              placeholder="Rechercher un étudiant..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="search-icon w-4 h-4" />
          </div>

          <select 
            className="filter-select"
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
          >
            <option value="">Toutes les filières</option>
            {uniqueMajors.map((major, idx) => (
              <option key={idx} value={major}>{major}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Tous les niveaux</option>
            {uniqueLevels.map((level, idx) => (
              <option key={idx} value={level}>{level}</option>
            ))}
          </select>

          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20">
            <Plus className="w-5 h-5" />
            Ajouter un étudiant
          </button>
        </div>
      </div>

      {/* Modal ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold">Ajouter un étudiant</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
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
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="text"
                  placeholder="Numéro étudiant"
                  value={formData.student_number}
                  onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="date"
                  placeholder="Date de naissance"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Filière"
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Niveau (ex: ING2)"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
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

      {/* Modal modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold">Modifier un étudiant</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="text"
                  placeholder="Numéro étudiant"
                  value={editFormData.student_number}
                  onChange={(e) => setEditFormData({...editFormData, student_number: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
                <input
                  type="date"
                  placeholder="Date de naissance"
                  value={editFormData.date_of_birth}
                  onChange={(e) => setEditFormData({...editFormData, date_of_birth: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Filière"
                  value={editFormData.major}
                  onChange={(e) => setEditFormData({...editFormData, major: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Niveau (ex: ING2)"
                  value={editFormData.level}
                  onChange={(e) => setEditFormData({...editFormData, level: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
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
              Cette action est irréversible et supprimera toutes ses notes et inscriptions.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm.id)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal consultation étudiant */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center text-white font-bold">
                  {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">{selectedStudent.student_number} · {selectedStudent.major || 'N/A'} · {selectedStudent.level || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingGrades ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                  <p className="mt-3 text-[var(--color-text-muted)]">Chargement des notes...</p>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">Moyenne Générale</span>
                      </div>
                      <p className={`text-2xl font-bold ${getGradeColor(studentAvg)}`}>
                        {studentAvg ? studentAvg.toFixed(2) : 'N/A'}<span className="text-sm text-gray-400">/20</span>
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-medium text-amber-600">Classement</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">
                        {studentRank ? `${studentRank.rank}` : 'N/A'}
                        <span className="text-sm text-gray-400">/{studentRank?.total || '?'}</span>
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Mention</span>
                      </div>
                      {(() => {
                        const badge = getGradeBadge(studentAvg);
                        return <p className={`text-lg font-bold ${badge.bg.split(' ')[1]}`}>{badge.text}</p>;
                      })()}
                    </div>
                  </div>

                  {/* Grades table */}
                  <h3 className="font-semibold mb-3 text-lg">Détail des notes</h3>
                  {studentGrades.length === 0 ? (
                    <p className="text-center py-6 text-[var(--color-text-muted)]">Aucune note enregistrée pour cet étudiant.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cours</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CC1</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CC2</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Examen</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Moyenne</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Résultat</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentGrades.map((grade, idx) => {
                            const badge = getGradeBadge(grade.final_grade ? parseFloat(grade.final_grade) : null);
                            return (
                              <tr key={idx} className="border-t border-[var(--color-border)] hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="font-medium">{grade.course_title || 'N/A'}</div>
                                  <div className="text-xs text-gray-400">{grade.course_code || ''}</div>
                                </td>
                                <td className={`px-4 py-3 text-center font-medium ${getGradeColor(grade.cc1 ? parseFloat(grade.cc1) : null)}`}>
                                  {grade.cc1 != null ? parseFloat(grade.cc1).toFixed(1) : '-'}
                                </td>
                                <td className={`px-4 py-3 text-center font-medium ${getGradeColor(grade.cc2 ? parseFloat(grade.cc2) : null)}`}>
                                  {grade.cc2 != null ? parseFloat(grade.cc2).toFixed(1) : '-'}
                                </td>
                                <td className={`px-4 py-3 text-center font-medium ${getGradeColor(grade.final_exam ? parseFloat(grade.final_exam) : null)}`}>
                                  {grade.final_exam != null ? parseFloat(grade.final_exam).toFixed(1) : '-'}
                                </td>
                                <td className={`px-4 py-3 text-center font-bold text-lg ${getGradeColor(grade.final_grade ? parseFloat(grade.final_grade) : null)}`}>
                                  {grade.final_grade != null ? parseFloat(grade.final_grade).toFixed(2) : '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                                    {badge.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
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
          <p className="text-[var(--color-text-muted)]">Chargement des étudiants...</p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Numéro Étudiant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date de naissance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Filière</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Niveau</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      {searchQuery ? 'Aucun étudiant trouvé correspondant à votre recherche' : 'Aucun étudiant trouvé'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="px-6 py-4 font-medium">{student.first_name} {student.last_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.student_number}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {formatDate(student.date_of_birth)}
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.major || '-'}</td>
                      <td className="px-6 py-4">{student.level || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewStudent(student)}
                            className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors" 
                            title="Voir les notes et classement"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(student)}
                            className="p-2 hover:bg-orange-50 rounded text-orange-600 transition-colors" 
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(student)}
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
            Total : {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''} {(searchQuery || selectedMajor || selectedLevel) ? `(${students.length} au total)` : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEtudiants;
