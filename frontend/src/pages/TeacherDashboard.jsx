import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Clock, Users, FileText, BookOpen } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [studentsToday, setStudentsToday] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(false);

  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = new Date();
  const dayName = days[today.getDay()];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all courses for this teacher
        const coursesRes = await apiClient.get('/courses.php');
        const teacherCourses = coursesRes.data.filter(c => c.teacher_id === user.id);
        setAllCourses(teacherCourses);

        // Fetch today's schedule
        const schedulesRes = await apiClient.get('/schedules.php');
        const todayClasses = schedulesRes.data.filter(
          s => s.day_of_week === dayName && 
               teacherCourses.some(c => c.id === s.course_id)
        );
        setTodaySchedule(todayClasses);

        // Fetch students enrolled in today's courses
        if (todayClasses.length > 0) {
          const courseIds = todayClasses.map(s => s.course_id);
          const studentSet = new Set();
          const allStudents = [];

          for (const courseId of courseIds) {
            try {
              const enrollRes = await apiClient.get(`/enrollments.php?course_id=${courseId}`);
              enrollRes.data.forEach(enroll => {
                const key = `${enroll.first_name}_${enroll.last_name}`;
                if (!studentSet.has(key)) {
                  studentSet.add(key);
                  allStudents.push(enroll);
                }
              });
            } catch (err) {
              console.error('Error fetching enrollments:', err);
            }
          }
          setStudentsToday(allStudents);
        }

        // Fetch recent grades
        try {
          const gradesRes = await apiClient.get('/grades.php');
          const recentGradesList = gradesRes.data.slice(0, 5);
          setRecentGrades(recentGradesList);
        } catch (err) {
          console.error('Error fetching grades:', err);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id, dayName]);

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 h-screen grid grid-cols-2 gap-4 bg-gray-100">
      {/* Section 1: Emploi du temps du jour */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Emploi du temps - {dayName}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((schedule, idx) => {
                const course = allCourses.find(c => c.id === schedule.course_id);
                return (
                  <div key={idx} className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                    <p className="font-semibold text-gray-800">{course?.title}</p>
                    <p className="text-sm text-gray-600">
                      ⏱️ {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                    </p>
                    <p className="text-sm text-gray-600">📍 {schedule.room}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Aucun cours aujourd'hui</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Étudiants du jour */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Étudiants du jour ({studentsToday.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {studentsToday.length > 0 ? (
            <div className="space-y-2">
              {studentsToday.map((student, idx) => (
                <div key={idx} className="bg-green-50 p-3 rounded border-l-4 border-green-600">
                  <p className="font-semibold text-gray-800">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-xs text-gray-600">{student.student_number}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Aucun étudiant aujourd'hui</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Saisie des notes */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-800">Notes récentes</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {recentGrades.length > 0 ? (
            <div className="space-y-2">
              {recentGrades.map((grade, idx) => (
                <div key={idx} className="bg-orange-50 p-3 rounded border-l-4 border-orange-600">
                  <p className="font-semibold text-sm text-gray-800">
                    {grade.first_name} {grade.last_name}
                  </p>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                    <span className="bg-white p-1 rounded">CC1: {grade.cc1 || '-'}</span>
                    <span className="bg-white p-1 rounded">CC2: {grade.cc2 || '-'}</span>
                    <span className="bg-white p-1 rounded font-bold text-orange-600">
                      {grade.final_grade || '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Aucune note disponible</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowGradeModal(true)}
          className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition"
        >
          ✎ Saisir les notes
        </button>
      </div>

      {/* Section 4: Mes cours */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Mes cours ({allCourses.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {allCourses.length > 0 ? (
            <div className="space-y-2">
              {allCourses.map((course, idx) => (
                <div key={idx} className="bg-purple-50 p-3 rounded border-l-4 border-purple-600">
                  <p className="font-semibold text-gray-800">{course.code}</p>
                  <p className="text-sm text-gray-700">{course.title}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                    <span>Capacité: {course.max_capacity}</span>
                    <span className={`px-2 py-1 rounded ${
                      course.status === 'ouvert' ? 'bg-green-200 text-green-800' :
                      course.status === 'fermé' ? 'bg-red-200 text-red-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Aucun cours</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Saisie des notes */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Saisir les notes</h3>
            <p className="text-gray-600 mb-6">
              Accédez à la page complète de saisie des notes pour modifier les évaluations des étudiants.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowGradeModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition"
              >
                Annuler
              </button>
              <a
                href="/teacher/notes"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition text-center"
              >
                Aller aux notes
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
