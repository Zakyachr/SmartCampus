import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const MesNotes = () => {
  const { user } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await apiClient.get('/grades.php');
        if (Array.isArray(response.data)) {
          setGrades(response.data);
        } else {
          setError(response.data?.error || 'Erreur lors du chargement des notes');
        }
      } catch (err) {
        console.error('Erreur API:', err);
        setError(err.response?.data?.error || 'Erreur lors du chargement des notes');
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-50';
    if (grade >= 14) return 'bg-green-50';
    if (grade >= 12) return 'bg-blue-50';
    if (grade >= 10) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes Notes</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-muted)]">Cours</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">CC1</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">CC2</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">Examen</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="border-b border-[var(--color-border)] hover:bg-[#F9FAFB]">
                <td className="px-6 py-4 font-semibold">{grade.course_title}</td>
                <td className={`px-6 py-4 text-center font-semibold ${getGradeColor(grade.cc1)}`}>{grade.cc1 || '-'}</td>
                <td className={`px-6 py-4 text-center font-semibold ${getGradeColor(grade.cc2)}`}>{grade.cc2 || '-'}</td>
                <td className={`px-6 py-4 text-center font-semibold ${getGradeColor(grade.final_exam)}`}>{grade.final_exam || '-'}</td>
                <td className={`px-6 py-4 text-center font-semibold text-lg ${getGradeColor(grade.final_grade)}`}>{grade.final_grade ? grade.final_grade.toFixed(2) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MesNotes;
