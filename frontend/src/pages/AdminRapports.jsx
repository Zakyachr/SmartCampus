import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, BarChart3, Filter } from 'lucide-react';
import apiClient from '../api/apiClient';

const AdminRapports = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer tous les étudiants avec leurs notes
        const studentsRes = await apiClient.get('/students.php');
        const gradesRes = await apiClient.get('/grades.php');

        // Récupérer aussi les notes pour les admins
        let allGrades = [];
        try {
          const adminGradesRes = await apiClient.get('/grades.php');
          allGrades = adminGradesRes.data || [];
        } catch (e) {
          console.log('Impossible de récupérer toutes les notes');
        }

        // Calculer les moyennes par étudiant
        const studentMap = {};
        studentsRes.data.forEach(student => {
          const studentGrades = gradesRes.data.filter(g => 
            g.first_name === student.first_name && g.last_name === student.last_name
          );
          
          const validGrades = studentGrades.filter(g => g.final_grade && !isNaN(g.final_grade));
          const average = validGrades.length > 0
            ? (validGrades.reduce((sum, g) => sum + parseFloat(g.final_grade), 0) / validGrades.length).toFixed(2)
            : '-';
          
          studentMap[student.id] = {
            ...student,
            average: average,
            courseCount: studentGrades.length
          };
        });

        const studentsWithAverage = Object.values(studentMap);
        setStudents(studentsWithAverage);

        // Extraire les niveaux uniques
        const uniqueLevels = [...new Set(studentsWithAverage.map(s => s.level))];
        setLevels(uniqueLevels);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer par niveau
  const filteredStudents = selectedLevel === 'all' 
    ? students 
    : students.filter(s => s.level === selectedLevel);

  // Trier par moyenne (décroissant)
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aAvg = a.average === '-' ? -1 : parseFloat(a.average);
    const bAvg = b.average === '-' ? -1 : parseFloat(b.average);
    return bAvg - aAvg;
  });

  // Statistiques globales
  const totalStudents = students.length;
  const averageOfAverages = students.length > 0
    ? (students.reduce((sum, s) => {
        const avg = s.average === '-' ? 0 : parseFloat(s.average);
        return sum + avg;
      }, 0) / students.length).toFixed(2)
    : 0;

  const topStudent = sortedStudents.length > 0 ? sortedStudents[0] : null;
  const bottomStudent = sortedStudents.length > 0 ? sortedStudents[sortedStudents.length - 1] : null;

  if (loading) {
    return <div className="p-6">Chargement des rapports...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Rapports Académiques</h1>
        <p className="text-[var(--color-text-muted)]">Classement des étudiants par moyenne générale</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-4">
          <div className="rounded-md bg-blue-50 p-3"><BarChart3 className="w-6 h-6 text-blue-600"/></div>
          <div>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Total étudiants</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="rounded-md bg-green-50 p-3"><TrendingUp className="w-6 h-6 text-green-600"/></div>
          <div>
            <div className="text-2xl font-bold">{averageOfAverages}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Moyenne générale</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="rounded-md bg-yellow-50 p-3"><Award className="w-6 h-6 text-yellow-600"/></div>
          <div>
            <div className="text-lg font-bold">{topStudent?.average || '-'}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Meilleure moyenne</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="rounded-md bg-red-50 p-3"><Filter className="w-6 h-6 text-red-600"/></div>
          <div>
            <div className="text-lg font-bold">{bottomStudent?.average || '-'}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Plus basse moyenne</div>
          </div>
        </div>
      </div>

      {/* Filtre par niveau */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-[var(--color-text)] font-semibold">Filtrer par niveau:</label>
        <select 
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="all">Tous les niveaux</option>
          {levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {/* Tableau de classement */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Niveau</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Filière</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Nombre de cours</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Moyenne générale</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length > 0 ? (
              sortedStudents.map((student, index) => (
                <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      {index > 2 && <span className="font-bold text-gray-500">#{index + 1}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-semibold">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                      {student.level}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{student.major}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 font-semibold">
                      {student.courseCount}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full font-bold ${
                      student.average === '-' ? 'bg-gray-100 text-gray-800' :
                      parseFloat(student.average) >= 15 ? 'bg-green-100 text-green-800' :
                      parseFloat(student.average) >= 12 ? 'bg-blue-100 text-blue-800' :
                      parseFloat(student.average) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.average}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Aucun étudiant trouvé pour ce filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Classement par niveau */}
      {levels.length > 0 && selectedLevel === 'all' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Récapitulatif par niveau</h2>
          <div className="grid grid-cols-1 gap-6">
            {levels.map(level => {
              const levelStudents = students.filter(s => s.level === level);
              const levelAverage = levelStudents.length > 0
                ? (levelStudents.reduce((sum, s) => {
                    const avg = s.average === '-' ? 0 : parseFloat(s.average);
                    return sum + avg;
                  }, 0) / levelStudents.length).toFixed(2)
                : 0;
              
              const topInLevel = [...levelStudents].sort((a, b) => {
                const aAvg = a.average === '-' ? -1 : parseFloat(a.average);
                const bAvg = b.average === '-' ? -1 : parseFloat(b.average);
                return bAvg - aAvg;
              })[0];

              return (
                <div key={level} className="card p-6 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{level}</h3>
                      <p className="text-sm text-gray-600">{levelStudents.length} étudiant(s)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{levelAverage}</div>
                      <div className="text-sm text-gray-600">Moyenne du niveau</div>
                    </div>
                  </div>
                  {topInLevel && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-600 mb-1">🏆 Meilleur étudiant</p>
                      <p className="font-bold">{topInLevel.first_name} {topInLevel.last_name}</p>
                      <p className="text-sm text-gray-600">Moyenne: {topInLevel.average}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRapports;
