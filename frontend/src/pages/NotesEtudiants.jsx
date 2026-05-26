import React, { useState, useEffect } from 'react';
import { Mail, Search, Book } from 'lucide-react';
import apiClient from '../api/apiClient';

const NotesEtudiants = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudentsWithGrades();
  }, []);

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
                        </tr>
                      </thead>
                      <tbody>
                        {student.grades.map((grade, idx) => (
                          <tr key={idx} className="border-b border-[var(--color-border)]">
                            <td className="px-4 py-3">{grade.course_title || '-'}</td>
                            <td className="px-4 py-3 text-center">{grade.cc1 || '-'}</td>
                            <td className="px-4 py-3 text-center">{grade.cc2 || '-'}</td>
                            <td className="px-4 py-3 text-center">{grade.final_exam || '-'}</td>
                            <td className="px-4 py-3 text-center font-semibold">
                              {grade.final_grade ? parseFloat(grade.final_grade).toFixed(2) : '-'}
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
    </div>
  );
};

export default NotesEtudiants;
