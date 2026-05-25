import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { BookOpen, Save, AlertCircle } from 'lucide-react';

const TeacherGradeEntry = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.get('/courses.php');
        const teacherCourses = response.data.filter(
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
    fetchCourses();
  }, [user.id]);

  useEffect(() => {
    if (selectedCourse) {
      const fetchEnrollments = async () => {
        try {
          const response = await apiClient.get(`/grades.php?course_id=${selectedCourse}`);
          setEnrollments(response.data || []);
          
          // Initialiser les notes
          const initialGrades = {};
          response.data.forEach((enrollment) => {
            initialGrades[enrollment.enrollment_id] = {
              cc1: enrollment.cc1 || '',
              cc2: enrollment.cc2 || '',
              final_exam: enrollment.final_exam || '',
            };
          });
          setGrades(initialGrades);
        } catch (err) {
          console.error('Erreur:', err);
          setError('Erreur lors du chargement des notes');
        }
      };
      fetchEnrollments();
    }
  }, [selectedCourse]);

  const handleGradeChange = (enrollmentId, field, value) => {
    setGrades((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (enrollmentId) => {
    setSaving(enrollmentId);
    setError(null);
    setSuccess(null);

    try {
      const gradeData = grades[enrollmentId];
      const payload = {
        enrollment_id: enrollmentId,
        cc1: gradeData.cc1 ? parseFloat(gradeData.cc1) : null,
        cc2: gradeData.cc2 ? parseFloat(gradeData.cc2) : null,
        final_exam: gradeData.final_exam ? parseFloat(gradeData.final_exam) : null,
      };

      const response = await apiClient.put('/grades.php', payload);
      setSuccess('Note sauvegardée avec succès !');
      
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de la sauvegarde';
      setError(errorMsg);
    } finally {
      setSaving(null);
    }
  };

  const calculateFinal = (enrollmentId) => {
    const g = grades[enrollmentId];
    if (!g || !g.cc1 || !g.cc2 || !g.final_exam) return '-';
    
    const cc1 = parseFloat(g.cc1);
    const cc2 = parseFloat(g.cc2);
    const exam = parseFloat(g.final_exam);
    
    const final = (cc1 * 0.3) + (cc2 * 0.3) + (exam * 0.4);
    return final.toFixed(2);
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error && courses.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Saisie des Notes</h1>
        <div className="card p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)]">Vous n'avez pas de cours assignés</p>
        </div>
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Saisie des Notes</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Sélection du cours */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Sélectionner un cours:</label>
        <select
          value={selectedCourse || ''}
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

      {/* Tableau de saisie des notes */}
      {enrollments.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border)] bg-[#F9FAFB]">
            <h2 className="font-bold text-lg">
              {selectedCourseData?.title} ({enrollments.length} élève{enrollments.length > 1 ? 's' : ''})
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Pondération : CC1 (30%) + CC2 (30%) + Examen (40%)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--color-text-muted)]">Élève</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">CC1</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">CC2</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">Examen</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">Moyenne</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.enrollment_id} className="border-b border-[var(--color-border)] hover:bg-[#F9FAFB] transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{enrollment.last_name} {enrollment.first_name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{enrollment.student_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={grades[enrollment.enrollment_id]?.cc1 || ''}
                        onChange={(e) => handleGradeChange(enrollment.enrollment_id, 'cc1', e.target.value)}
                        placeholder="-"
                        className="w-16 px-2 py-1 border border-[var(--color-border)] rounded text-center"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={grades[enrollment.enrollment_id]?.cc2 || ''}
                        onChange={(e) => handleGradeChange(enrollment.enrollment_id, 'cc2', e.target.value)}
                        placeholder="-"
                        className="w-16 px-2 py-1 border border-[var(--color-border)] rounded text-center"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={grades[enrollment.enrollment_id]?.final_exam || ''}
                        onChange={(e) => handleGradeChange(enrollment.enrollment_id, 'final_exam', e.target.value)}
                        placeholder="-"
                        className="w-16 px-2 py-1 border border-[var(--color-border)] rounded text-center"
                      />
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {calculateFinal(enrollment.enrollment_id)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSaveGrade(enrollment.enrollment_id)}
                        disabled={saving === enrollment.enrollment_id}
                        className="px-3 py-1 bg-[var(--color-primary)] text-white rounded text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-1 mx-auto"
                      >
                        <Save className="w-4 h-4" />
                        {saving === enrollment.enrollment_id ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)]">Aucun élève inscrit à ce cours</p>
        </div>
      )}
    </div>
  );
};

export default TeacherGradeEntry;
