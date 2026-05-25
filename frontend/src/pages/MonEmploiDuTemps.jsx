import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Clock, MapPin } from 'lucide-react';

const MonEmploiDuTemps = () => {
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await apiClient.get('/schedules.php');
        setSchedules(response.data);
      } catch (err) {
        setError('Erreur lors du chargement de l\'emploi du temps');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const dayColors = { Lundi: '#DBEAFE', Mardi: '#DCFCE7', Mercredi: '#FEF3C7', Jeudi: '#FCE7F3', Vendredi: '#FEE2E2' };

  const groupedByDay = {};
  days.forEach(day => {
    groupedByDay[day] = schedules.filter(s => s.day_of_week === day);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon Emploi du temps</h1>
      <div className="space-y-6">
        {days.map(day => (
          <div key={day} className="card">
            <div className="px-6 py-4 bg-[#F9FAFB] border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-lg">{day}</h3>
            </div>
            <div className="divide-y">
              {groupedByDay[day] && groupedByDay[day].length > 0 ? (
                groupedByDay[day].map((schedule) => (
                  <div key={schedule.id} className="p-6 hover:bg-[#F9FAFB]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: dayColors[day] }}>
                        <Clock className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{schedule.course_title}</h4>
                        <div className="text-sm text-[var(--color-text-muted)] mt-1">{schedule.code}</div>
                        <div className="flex gap-6 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                            {schedule.room}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-[var(--color-text-muted)]">Pas de cours ce jour</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonEmploiDuTemps;
