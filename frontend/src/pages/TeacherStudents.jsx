import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import apiClient from '../api/apiClient';
import { Users, BookOpen } from 'lucide-react';

const TeacherStudents = () => {
  const { user } = useContext(AuthContext);
  const { searchQuery } = useContext(SearchContext);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les cours du prof
        const coursesResponse = await apiClient.get('/courses.php');
        const teacherCourses = coursesResponse.data.filter(
          (c) => c.teacher_id === user.id
        );
        setCourses(teacherCourses);
        
        if (teacherCourses.length > 0) {
          setSelectedCourse(teacherCourses[0].id);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  useEffect(() => {
    if (selectedCourse) {
      const fetchStudents = async () => {
        try {
          const response = await apiClient.get(`/enrollments.php?course_id=${selectedCourse}`);
          setStudents(response.data || []);
        } catch (err) {
          console.error('Erreur:', err);
          setError('Erreur lors du chargement des élèves');
        }
      };
      fetchStudents();
    }
  }, [selectedCourse]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  if (courses.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Mes Élèves</h1>
        <div className="card p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)]">Vous n'avez pas de cours assignés</p>
        </div>
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  // Filtrer les élèves selon la recherche
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      (student.student_number && student.student_number.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes Élèves</h1>

      {/* Sélection du cours */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Sélectionner un cours:</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-white"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des élèves */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-[var(--color-border)] bg-[#F9FAFB]">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            {selectedCourseData?.title} ({filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''}{searchQuery && ` / ${students.length} total`})
          </h2>
        </div>

        {filteredStudents.length > 0 ? (
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-muted)]">Numéro Étudiant</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-muted)]">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-muted)]">Prénom</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-muted)]">Niveau</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-muted)]">Filière</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-[var(--color-border)] hover:bg-[#F9FAFB] transition">
                  <td className="px-6 py-4 font-mono text-sm">{student.student_number}</td>
                  <td className="px-6 py-4 font-semibold">{student.last_name}</td>
                  <td className="px-6 py-4">{student.first_name}</td>
                  <td className="px-6 py-4 text-sm">{student.level}</td>
                  <td className="px-6 py-4 text-sm">{student.major}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[var(--color-text-muted)]">{searchQuery ? 'Aucun élève trouvé correspondant à votre recherche' : 'Aucun élève inscrit à ce cours'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudents;
