import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { BookOpen, Users, Calendar } from 'lucide-react';

const MesCours = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.get('/courses.php');
        setCourses(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

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

export default MesCours;
