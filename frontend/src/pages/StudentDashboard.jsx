import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, TrendingUp, Users, Clock, RefreshCw } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Récupérer les notes
      const gradesRes = await apiClient.get('/grades.php');
      setGrades(gradesRes.data);

      // Récupérer les cours
      const coursesRes = await apiClient.get('/courses.php');
      setCourses(coursesRes.data);

      // Récupérer l'emploi du temps
      const schedulesRes = await apiClient.get('/schedules.php');
      setSchedules(schedulesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Calculer les statistiques
  const enrolledCourseCount = grades.length > 0 ? grades.length : 0;
  
  // Calculer la moyenne générale en utilisant les notes finales valides
  let averageGrade = 0;
  if (grades.length > 0) {
    const validGrades = grades.filter(g => g.final_grade && !isNaN(g.final_grade));
    if (validGrades.length > 0) {
      averageGrade = (validGrades.reduce((sum, g) => sum + parseFloat(g.final_grade), 0) / validGrades.length).toFixed(2);
    }
  }

  const recentGrades = grades.slice(-5).reverse();

  // Récupérer les cours inscrits (unique)
  const studentEnrolledCourses = [...new Map(
    grades.map(g => [g.course_id, {
      id: g.course_id,
      title: g.course_title,
      code: g.course_code
    }])
  ).values()];

  // Aujourd'hui
  const today = new Date();
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayName = days[today.getDay()];

  // Emploi du temps d'aujourd'hui
  const todaySchedule = schedules.filter(s => s.day_of_week === dayName);

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Mon tableau de bord étudiant</h1>
          <p className="text-[var(--color-text-muted)]">Bienvenue {user?.first_name} — aperçu rapide</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition disabled:opacity-50"
          title="Rafraîchir les données"
        >
          <RefreshCw className={`w-5 h-5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Section 1: Statistiques (4 cartes) */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="rounded-md bg-blue-50 p-3"><BookOpen className="w-6 h-6 text-blue-600"/></div>
          <div>
            <div className="text-2xl font-bold">{enrolledCourseCount}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Cours inscrits</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="rounded-md bg-green-50 p-3"><TrendingUp className="w-6 h-6 text-green-600"/></div>
          <div>
            <div className="text-2xl font-bold">{averageGrade}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Moyenne générale</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="rounded-md bg-indigo-50 p-3"><Calendar className="w-6 h-6 text-indigo-600"/></div>
          <div>
            <div className="text-2xl font-bold">{grades.length}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Notes obtenues</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="rounded-md bg-yellow-50 p-3"><User className="w-6 h-6 text-yellow-600"/></div>
          <div>
            <div className="text-2xl font-bold">{user?.first_name} {user?.last_name}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Profil</div>
          </div>
        </div>
      </div>

      {/* Grille 2x2 pour les 4 sections principales */}
      <div className="grid grid-cols-2 gap-6">
        {/* Section 2: Emploi du temps d'aujourd'hui */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Emploi du temps - {dayName}</h2>
          </div>
          <div className="space-y-3">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((schedule, idx) => (
                <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-semibold text-blue-900">
                    {courses.find(c => c.id === schedule.course_id)?.title || 'Cours'}
                  </div>
                  <div className="text-sm text-blue-700">
                    ⏰ {schedule.start_time} - {schedule.end_time}
                  </div>
                  <div className="text-sm text-blue-700">
                    📍 {schedule.room}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--color-text-muted)]">Aucun cours aujourd'hui</p>
            )}
          </div>
        </div>

        {/* Section 3: Mes cours */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Mes cours ({studentEnrolledCourses.length})</h2>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {studentEnrolledCourses.length > 0 ? (
              studentEnrolledCourses.map((course, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-semibold">{course.code}</div>
                  <div className="text-sm text-gray-600">{course.title}</div>
                </div>
              ))
            ) : (
              <p className="text-[var(--color-text-muted)]">Aucun cours inscrit</p>
            )}
          </div>
        </div>

        {/* Section 4: Notes récentes */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Mes notes récentes</h2>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentGrades.length > 0 ? (
              recentGrades.map((grade, idx) => (
                <div key={idx} className="bg-green-50 p-3 rounded-lg">
                  <div className="font-semibold text-green-900">{grade.course_code || 'N/A'}</div>
                  <div className="text-sm text-green-700">
                    CC1: {grade.cc1 || '-'} | CC2: {grade.cc2 || '-'} | Exam: {grade.final_exam || '-'}
                  </div>
                  <div className="text-sm font-semibold text-green-900">
                    Moyenne: {grade.final_grade || '-'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--color-text-muted)]">Aucune note disponible</p>
            )}
          </div>
        </div>

        {/* Section 5: Résumé des notes par cours */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Résumé par cours</h2>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {studentEnrolledCourses.length > 0 ? (
              studentEnrolledCourses.map((course, idx) => {
                const courseGrades = grades.filter(g => g.course_title === course.title);
                const courseAverage = courseGrades.length > 0
                  ? (courseGrades.reduce((sum, g) => sum + (g.final_grade || 0), 0) / courseGrades.length).toFixed(2)
                  : '-';
                return (
                  <div key={idx} className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-900">{course.code}</div>
                    <div className="text-sm text-purple-700">Moyenne: {courseAverage}</div>
                  </div>
                );
              })
            ) : (
              <p className="text-[var(--color-text-muted)]">Pas de données</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
