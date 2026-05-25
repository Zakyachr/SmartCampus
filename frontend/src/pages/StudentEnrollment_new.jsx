import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { AlertCircle, CheckCircle, BookOpen } from 'lucide-react';

const StudentEnrollment = () => {
  const { user } = useContext(AuthContext);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer tous les cours
        const coursesResponse = await apiClient.get('/courses.php');
        setAvailableCourses(coursesResponse.data || []);
        
        // Récupérer les cours de l'étudiant
        const enrollmentsResponse = await apiClient.get('/students.php?enrolled=true');
        if (enrollmentsResponse.data) {
          setEnrolledCourses(enrollmentsResponse.data);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.post('/enrollments.php', {
        course_id: courseId
      });
      
      setSuccess(`Inscription au cours réussie !`);
      
      // Actualiser les données
      const coursesResponse = await apiClient.get('/courses.php');
      setAvailableCourses(coursesResponse.data || []);
      const enrollmentsResponse = await apiClient.get('/students.php?enrolled=true');
      if (enrollmentsResponse.data) {
        setEnrolledCourses(enrollmentsResponse.data);
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'inscription';
      setError(errorMsg);
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(c => c.id === courseId);
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">S'inscrire à des Cours</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Erreur</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Succès</p>
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cours Disponibles */}
        <div>
          <h2 className="text-xl font-bold mb-4">Cours Disponibles</h2>
          <div className="space-y-4">
            {availableCourses.map((course) => (
              <div key={course.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{course.code}</p>
                    <p className="text-sm mt-2">
                      Prof: <span className="font-semibold">{course.teacher_first_name} {course.teacher_last_name}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {isEnrolled(course.id) ? (
                    <button disabled className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Inscrit
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                      className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {enrolling === course.id ? 'Inscription...' : 'S\'inscrire'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mes Inscriptions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Mes Inscriptions</h2>
          {enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="card p-4 bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold">{course.title}</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">{course.code}</p>
                      <p className="text-sm mt-1">
                        Prof: <span className="font-semibold">{course.teacher_first_name} {course.teacher_last_name}</span>
                      </p>
                      {course.day_of_week && (
                        <p className="text-xs text-gray-600 mt-2">
                          📅 {course.day_of_week} {course.start_time} - {course.end_time} | 🏢 {course.room}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[var(--color-text-muted)]">Vous n'êtes inscrit à aucun cours</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollment;
