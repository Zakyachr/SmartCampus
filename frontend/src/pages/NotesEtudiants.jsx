import React, { useState, useEffect } from 'react';
import { Mail, Search, Book, Edit, X, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

const NotesEtudiants = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [selectedGradeForEdit, setSelectedGradeForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ cc1: '', cc2: '', final_exam: '' });
  const [savingGrade, setSavingGrade] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  useEffect(() => {
    fetchStudentsWithGrades();
  }, []);

  const handleEditGradeClick = (student, grade) => {
    setSelectedStudentForEdit(student);
    setSelectedGradeForEdit(grade);
    setEditFormData({
      cc1: grade.cc1 !== null ? grade.cc1.toString() : '',
      cc2: grade.cc2 !== null ? grade.cc2.toString() : '',
      final_exam: grade.final_exam !== null ? grade.final_exam.toString() : ''
    });
    setSaveError(null);
    setSaveSuccess(null);
    setShowEditModal(true);
  };

  const handleSaveGradeSubmit = async (e) => {
    e.preventDefault();
    setSavingGrade(true);
    setSaveError(null);
    setSaveSuccess(null);

    const cc1Value = editFormData.cc1 === '' ? null : parseFloat(editFormData.cc1);
    const cc2Value = editFormData.cc2 === '' ? null : parseFloat(editFormData.cc2);
    const examValue = editFormData.final_exam === '' ? null : parseFloat(editFormData.final_exam);

    if ((cc1Value !== null && (cc1Value < 0 || cc1Value > 20)) ||
        (cc2Value !== null && (cc2Value < 0 || cc2Value > 20)) ||
        (examValue !== null && (examValue < 0 || examValue > 20))) {
      setSaveError('Les notes doivent être comprises entre 0 et 20.');
      setSavingGrade(false);
      return;
    }

    try {
      const payload = {
        enrollment_id: selectedGradeForEdit.enrollment_id,
        cc1: cc1Value,
        cc2: cc2Value,
        final_exam: examValue
      };

      await apiClient.put('/grades.php', payload);
      setSaveSuccess('Notes mises à jour avec succès !');
      
      fetchStudentsWithGrades();
      
      setTimeout(() => {
        setShowEditModal(false);
      }, 1500);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Erreur lors de la mise à jour des notes');
    } finally {
      setSavingGrade(false);
    }
  };

  const calculateModalAverage = () => {
    const cc1 = editFormData.cc1 === '' ? null : parseFloat(editFormData.cc1);
    const cc2 = editFormData.cc2 === '' ? null : parseFloat(editFormData.cc2);
    const exam = editFormData.final_exam === '' ? null : parseFloat(editFormData.final_exam);

    if (cc1 !== null && cc2 !== null && exam !== null && !isNaN(cc1) && !isNaN(cc2) && !isNaN(exam)) {
      const avg = (cc1 * 0.3) + (cc2 * 0.3) + (exam * 0.4);
      return avg.toFixed(2) + '/20';
    }
    return '-';
  };

  useEffect(() => {
    // Filtrer les résultats selon la recherche
    if (searchTerm.trim() === '') {
      setFilteredData(studentsData);
    } else {
      const search = searchTerm.toLowerCase();
      setFilteredData(
        studentsData.filter(
          (s) =>
            s.first_name.toLowerCase().includes(search) ||
            s.last_name.toLowerCase().includes(search) ||
            s.email.toLowerCase().includes(search) ||
            s.student_number.toLowerCase().includes(search)
        )
      );
    }
  }, [searchTerm, studentsData]);

  const fetchStudentsWithGrades = async () => {
    try {
      setLoading(true);
      // Récupérer tous les étudiants
      const studentsRes = await apiClient.get('/students.php');
      const students = studentsRes.data;

      // Pour chaque étudiant, récupérer ses notes et cours
      const enrichedStudents = await Promise.all(
        students.map(async (student) => {
          try {
            // Récupérer les enrollments et grades
            const gradesRes = await apiClient.get(`/grades.php?student_id=${student.id}`);
            return {
              ...student,
              grades: gradesRes.data || []
            };
          } catch (err) {
            return {
              ...student,
              grades: []
            };
          }
        })
      );

      setStudentsData(enrichedStudents);
      setFilteredData(enrichedStudents);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (grades) => {
    if (!grades || grades.length === 0) return '-';
    const validGrades = grades.filter((g) => g.final_grade !== null);
    if (validGrades.length === 0) return '-';
    const avg = validGrades.reduce((sum, g) => sum + parseFloat(g.final_grade), 0) / validGrades.length;
    return avg.toFixed(2);
  };

  return (
    <div className="max-w-full">
      <h1 className="text-3xl font-bold mb-6">Suivi des Notes et Cours</h1>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Chercher par nom, email ou numéro étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg"
          />
        </div>
      </div>

      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--color-text-muted)]">Chargement des données...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredData.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-[var(--color-text-muted)]">Aucun étudiant trouvé</p>
            </div>
          ) : (
            filteredData.map((student) => (
              <div key={student.id} className="card p-6">
                {/* En-tête étudiant */}
                <div className="mb-4 pb-4 border-b border-[var(--color-border)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">
                        {student.first_name} {student.last_name}
                      </h2>
                      <div className="text-sm text-[var(--color-text-muted)] space-y-1 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {student.email}
                        </div>
                        <div>Numéro étudiant: {student.student_number}</div>
                        <div>Filière: {student.major || '-'} - {student.level || '-'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--color-primary)]">
                        {calculateAverage(student.grades)}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">Moyenne générale</div>
                    </div>
                  </div>
                </div>

                {/* Tableau des notes */}
                {student.grades && student.grades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                          <th className="px-4 py-2 text-left font-semibold">Cours</th>
                          <th className="px-4 py-2 text-center font-semibold">CC1</th>
                          <th className="px-4 py-2 text-center font-semibold">CC2</th>
                          <th className="px-4 py-2 text-center font-semibold">Examen</th>
                          <th className="px-4 py-2 text-center font-semibold">Note finale</th>
                          <th className="px-4 py-2 text-center font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.grades.map((grade, idx) => (
                          <tr key={idx} className="border-b border-[var(--color-border)] hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-800">{grade.course_title || '-'}</div>
                              <div className="text-xs text-gray-400">{grade.course_code || ''}</div>
                            </td>
                            <td className="px-4 py-3 text-center font-medium">{grade.cc1 !== null ? grade.cc1 : '-'}</td>
                            <td className="px-4 py-3 text-center font-medium">{grade.cc2 !== null ? grade.cc2 : '-'}</td>
                            <td className="px-4 py-3 text-center font-medium">{grade.final_exam !== null ? grade.final_exam : '-'}</td>
                            <td className="px-4 py-3 text-center font-bold text-[var(--color-primary)]">
                              {grade.final_grade ? parseFloat(grade.final_grade).toFixed(2) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleEditGradeClick(student, grade)}
                                className="p-2 hover:bg-green-50 rounded-lg text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-all"
                                title="Modifier les notes"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-[var(--color-text-muted)] py-4">
                    <Book className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Aucune note enregistrée
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-[var(--color-text-muted)]">
        Affichage de {filteredData.length} étudiant{filteredData.length > 1 ? 's' : ''}
      </div>

      {/* Modal modification des notes */}
      {showEditModal && selectedStudentForEdit && selectedGradeForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-xl font-bold">Modifier les notes</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {selectedStudentForEdit.first_name} {selectedStudentForEdit.last_name}
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-800">{saveError}</p>
              </div>
            )}

            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800 font-semibold">{saveSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSaveGradeSubmit} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                <div className="text-xs font-semibold text-gray-400">COURS</div>
                <div className="font-bold text-sm text-[var(--color-text)]">
                  {selectedGradeForEdit.course_title}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {selectedGradeForEdit.course_code}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">CC1 (30%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    placeholder="-"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-center"
                    value={editFormData.cc1}
                    onChange={(e) => setEditFormData({ ...editFormData, cc1: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">CC2 (30%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    placeholder="-"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-center"
                    value={editFormData.cc2}
                    onChange={(e) => setEditFormData({ ...editFormData, cc2: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Examen (40%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    placeholder="-"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-center"
                    value={editFormData.final_exam}
                    onChange={(e) => setEditFormData({ ...editFormData, final_exam: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100 my-4">
                <span className="text-xs font-semibold text-green-700">Moyenne calculée :</span>
                <span className="text-lg font-bold text-green-700">{calculateModalAverage()}</span>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50 text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingGrade || saveSuccess}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 text-sm font-semibold transition"
                >
                  {savingGrade ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesEtudiants;
