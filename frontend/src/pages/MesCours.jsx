import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { BookOpen, Trophy, Users, TrendingUp, Award, BarChart3, GraduationCap } from 'lucide-react';

const MesCours = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (user?.role === 'student') {
          try {
            // Essayer d'abord le nouvel endpoint enrichi (moyenne classe + rang)
            const response = await apiClient.get('/student_courses.php');
            if (Array.isArray(response.data)) {
              setCourses(response.data);
            } else {
              throw new Error('Format invalide');
            }
          } catch (primaryErr) {
            // Fallback : utiliser grades.php qui existe déjà chez tout le monde
            console.warn('student_courses.php non disponible, fallback sur grades.php', primaryErr);
            const response = await apiClient.get('/grades.php');
            if (Array.isArray(response.data)) {
              // Transformer les données de grades.php pour correspondre au format attendu
              const mappedCourses = response.data.map(grade => ({
                course_id: grade.course_id,
                code: grade.course_code,
                title: grade.course_title,
                status: 'ouvert',
                teacher_first_name: grade.teacher_first_name,
                teacher_last_name: grade.teacher_last_name,
                cc1: grade.cc1,
                cc2: grade.cc2,
                final_exam: grade.final_exam,
                student_average: grade.final_grade ? parseFloat(grade.final_grade) : null,
                class_average: null,  // Non disponible sans student_courses.php
                rank: null,           // Non disponible sans student_courses.php
                total_students: 0,
              }));
              setCourses(mappedCourses);
            } else {
              setError('Erreur lors du chargement des cours');
            }
          }
        } else {
          // Pour les autres rôles, garder l'ancien comportement
          const response = await apiClient.get('/courses.php');
          setCourses(response.data);
        }
      } catch (err) {
        console.error('Erreur API:', err);
        setError('Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Chargement de vos cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>⚠️ {error}</p>
      </div>
    );
  }

  // Si c'est un étudiant, afficher la vue enrichie
  if (user?.role === 'student') {
    return <StudentCoursesView courses={courses} />;
  }

  // Sinon, vue par défaut (enseignant/admin)
  return <DefaultCoursesView courses={courses} />;
};

// ====== VUE ÉTUDIANT ENRICHIE ======
const StudentCoursesView = ({ courses }) => {
  // Calculer la moyenne générale de l'étudiant
  const coursesWithGrades = courses.filter(c => c.student_average !== null);
  const overallAverage = coursesWithGrades.length > 0
    ? (coursesWithGrades.reduce((sum, c) => sum + c.student_average, 0) / coursesWithGrades.length).toFixed(2)
    : null;

  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined) return '#9CA3AF';
    if (grade >= 16) return '#059669';
    if (grade >= 14) return '#10B981';
    if (grade >= 12) return '#3B82F6';
    if (grade >= 10) return '#F59E0B';
    return '#EF4444';
  };

  const getGradeBg = (grade) => {
    if (grade === null || grade === undefined) return '#F3F4F6';
    if (grade >= 16) return '#D1FAE5';
    if (grade >= 14) return '#ECFDF5';
    if (grade >= 12) return '#DBEAFE';
    if (grade >= 10) return '#FEF3C7';
    return '#FEE2E2';
  };

  const getRankBadge = (rank, total) => {
    if (!rank) return null;
    let emoji = '';
    let badgeBg = '';
    let badgeColor = '';
    if (rank === 1) { emoji = '🥇'; badgeBg = 'linear-gradient(135deg, #FDE68A, #F59E0B)'; badgeColor = '#78350F'; }
    else if (rank === 2) { emoji = '🥈'; badgeBg = 'linear-gradient(135deg, #E5E7EB, #9CA3AF)'; badgeColor = '#374151'; }
    else if (rank === 3) { emoji = '🥉'; badgeBg = 'linear-gradient(135deg, #FED7AA, #EA580C)'; badgeColor = '#7C2D12'; }
    else { emoji = ''; badgeBg = '#F3F4F6'; badgeColor = '#6B7280'; }
    return { emoji, badgeBg, badgeColor };
  };

  const getProgressWidth = (grade) => {
    if (!grade) return 0;
    return Math.min((grade / 20) * 100, 100);
  };

  const courseIcons = ['⚡', '📐', '💻', '⚙️', '🔬', '🌐', '📊', '🔧', '💾', '🎯'];
  const courseColors = [
    { bg: '#DBEAFE', accent: '#3B82F6' },
    { bg: '#DCFCE7', accent: '#10B981' },
    { bg: '#FEF3C7', accent: '#F59E0B' },
    { bg: '#FCE7F3', accent: '#EC4899' },
    { bg: '#E0E7FF', accent: '#6366F1' },
    { bg: '#CCFBF1', accent: '#14B8A6' },
    { bg: '#FEE2E2', accent: '#EF4444' },
    { bg: '#F3E8FF', accent: '#A855F7' },
    { bg: '#DBEAFE', accent: '#2563EB' },
    { bg: '#FEF9C3', accent: '#CA8A04' },
  ];

  return (
    <div>
      <h1 style={styles.pageTitle}>
        <GraduationCap size={28} style={{ color: 'var(--color-primary)' }} />
        Mes Cours
      </h1>

      {/* Carte récapitulative */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryIcon, background: 'linear-gradient(135deg, #DBEAFE, #93C5FD)' }}>
              <BookOpen size={22} color="#2563EB" />
            </div>
            <div>
              <div style={styles.summaryValue}>{courses.length}</div>
              <div style={styles.summaryLabel}>Cours inscrits</div>
            </div>
          </div>
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryIcon, background: 'linear-gradient(135deg, #DCFCE7, #86EFAC)' }}>
              <TrendingUp size={22} color="#059669" />
            </div>
            <div>
              <div style={{ ...styles.summaryValue, color: overallAverage ? getGradeColor(parseFloat(overallAverage)) : '#9CA3AF' }}>
                {overallAverage ? `${overallAverage}/20` : '-'}
              </div>
              <div style={styles.summaryLabel}>Moyenne générale</div>
            </div>
          </div>
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryIcon, background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
              <Award size={22} color="#D97706" />
            </div>
            <div>
              <div style={styles.summaryValue}>
                {coursesWithGrades.filter(c => c.student_average >= 10).length}/{coursesWithGrades.length}
              </div>
              <div style={styles.summaryLabel}>Matières validées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des cours */}
      <div style={styles.coursesGrid}>
        {courses.map((course, idx) => {
          const colorSet = courseColors[idx % courseColors.length];
          const icon = courseIcons[idx % courseIcons.length];
          const rankInfo = getRankBadge(course.rank, course.total_students);

          return (
            <div key={course.course_id} style={styles.courseCard}>
              {/* En-tête du cours */}
              <div style={styles.courseHeader}>
                <div style={{ ...styles.courseIconBox, backgroundColor: colorSet.bg }}>
                  <span style={{ fontSize: '24px' }}>{icon}</span>
                </div>
                <div style={styles.courseInfo}>
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  <span style={styles.courseCode}>{course.code}</span>
                </div>
              </div>

              {/* Professeur */}
              <div style={styles.teacherRow}>
                <span style={styles.teacherLabel}>Professeur</span>
                <span style={styles.teacherName}>
                  {course.teacher_first_name} {course.teacher_last_name}
                </span>
              </div>

              {/* Séparateur */}
              <div style={styles.divider}></div>

              {/* Notes détaillées */}
              <div style={styles.gradesSection}>
                <div style={styles.gradeRow}>
                  <span style={styles.gradeLabel}>CC1</span>
                  <span style={{ ...styles.gradeValue, color: getGradeColor(course.cc1) }}>
                    {course.cc1 !== null ? `${parseFloat(course.cc1).toFixed(1)}` : '-'}
                  </span>
                </div>
                <div style={styles.gradeRow}>
                  <span style={styles.gradeLabel}>CC2</span>
                  <span style={{ ...styles.gradeValue, color: getGradeColor(course.cc2) }}>
                    {course.cc2 !== null ? `${parseFloat(course.cc2).toFixed(1)}` : '-'}
                  </span>
                </div>
                <div style={styles.gradeRow}>
                  <span style={styles.gradeLabel}>Examen</span>
                  <span style={{ ...styles.gradeValue, color: getGradeColor(course.final_exam) }}>
                    {course.final_exam !== null ? `${parseFloat(course.final_exam).toFixed(1)}` : '-'}
                  </span>
                </div>
              </div>

              {/* Séparateur */}
              <div style={styles.divider}></div>

              {/* Moyenne de l'étudiant avec barre de progression */}
              <div style={styles.averageSection}>
                <div style={styles.averageHeader}>
                  <div style={styles.averageLabelRow}>
                    <BarChart3 size={16} color={getGradeColor(course.student_average)} />
                    <span style={styles.averageLabel}>Ma moyenne</span>
                  </div>
                  <span style={{
                    ...styles.averageBig,
                    color: getGradeColor(course.student_average),
                    backgroundColor: getGradeBg(course.student_average),
                  }}>
                    {course.student_average !== null ? `${course.student_average}/20` : '-'}
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${getProgressWidth(course.student_average)}%`,
                    backgroundColor: getGradeColor(course.student_average),
                  }}></div>
                </div>
              </div>

              {/* Moyenne de classe */}
              <div style={styles.classAvgRow}>
                <div style={styles.classAvgLeft}>
                  <Users size={14} color="#6B7280" />
                  <span style={styles.classAvgLabel}>Moy. classe</span>
                </div>
                <span style={styles.classAvgValue}>
                  {course.class_average !== null ? `${course.class_average}/20` : '-'}
                </span>
              </div>

              {/* Rang */}
              {rankInfo && (
                <div style={styles.rankRow}>
                  <div style={styles.rankLeft}>
                    <Trophy size={14} color="#D97706" />
                    <span style={styles.rankLabel}>Classement</span>
                  </div>
                  <div style={{
                    ...styles.rankBadge,
                    background: rankInfo.badgeBg,
                    color: rankInfo.badgeColor,
                  }}>
                    {rankInfo.emoji} {course.rank}<sup>e</sup> / {course.total_students}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div style={styles.emptyState}>
          <BookOpen size={48} color="#D1D5DB" />
          <p style={styles.emptyText}>Vous n'êtes inscrit à aucun cours.</p>
          <p style={styles.emptySubtext}>Rendez-vous dans la section "Inscription" pour vous inscrire à des cours.</p>
        </div>
      )}
    </div>
  );
};

// ====== VUE PAR DÉFAUT (ENSEIGNANT/ADMIN) ======
const DefaultCoursesView = ({ courses }) => {
  const icons = [
    { bg: '#DBEAFE', icon: '⚡' },
    { bg: '#DCFCE7', icon: '📐' },
    { bg: '#FEF3C7', icon: '💻' },
    { bg: '#FCE7F3', icon: '⚙️' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes Cours</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <div key={course.id} className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: icons[idx % 4].bg }}>
                {icons[idx % 4].icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{course.title}</h3>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">{course.code}</div>
                <div className="text-sm mt-2">
                  Prof: <span className="font-semibold">{course.teacher_first_name} {course.teacher_last_name}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
              <span className="badge-active">Actif</span>
              <button className="text-[var(--color-primary)]">Détails →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====== STYLES ======
const styles = {
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--color-text)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: 'var(--color-text-muted)',
    fontSize: '14px',
  },
  errorContainer: {
    padding: '24px',
    background: '#FEE2E2',
    borderRadius: '12px',
    margin: '24px',
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '600',
  },

  // Summary card
  summaryCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid var(--color-border)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  summaryIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summaryValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--color-text)',
    lineHeight: '1.2',
  },
  summaryLabel: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    marginTop: '2px',
  },

  // Courses grid
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
    gap: '24px',
  },

  // Course card
  courseCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    border: '1px solid var(--color-border)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  courseHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px',
  },
  courseIconBox: {
    width: '60px',
    height: '60px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  courseInfo: {
    flex: 1,
    minWidth: 0,
  },
  courseTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--color-text)',
    margin: 0,
    lineHeight: '1.3',
  },
  courseCode: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    background: '#F3F4F6',
    padding: '3px 10px',
    borderRadius: '6px',
    display: 'inline-block',
    marginTop: '6px',
    fontWeight: '500',
  },

  // Teacher
  teacherRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  teacherLabel: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    fontWeight: '500',
  },
  teacherName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text)',
  },

  // Divider
  divider: {
    height: '1px',
    background: 'var(--color-border)',
    margin: '16px 0',
  },

  // Grades
  gradesSection: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  gradeRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    padding: '14px 8px',
    background: '#FAFAFA',
    borderRadius: '10px',
  },
  gradeLabel: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    fontWeight: '500',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  gradeValue: {
    fontSize: '18px',
    fontWeight: '700',
  },

  // Average
  averageSection: {
    marginBottom: '12px',
  },
  averageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  averageLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  averageLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  averageBig: {
    fontSize: '16px',
    fontWeight: '700',
    padding: '6px 16px',
    borderRadius: '10px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#F3F4F6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.6s ease',
  },

  // Class average
  classAvgRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
  },
  classAvgLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  classAvgLabel: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    fontWeight: '500',
  },
  classAvgValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#6B7280',
  },

  // Rank
  rankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
  },
  rankLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rankLabel: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    fontWeight: '500',
  },
  rankBadge: {
    fontSize: '15px',
    fontWeight: '700',
    padding: '6px 16px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },

  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    gap: '12px',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text)',
    margin: 0,
  },
  emptySubtext: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
};

export default MesCours;
