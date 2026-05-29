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

  // Heures d'affichage typiques pour une école, par ex. 08:00 à 18:00
  const timeSlots = [...Array(11)].map((_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon Emploi du temps</h1>
      <div className="card shadow-sm border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse bg-white">
          <thead>
            <tr>
              <th className="w-20 p-4 border-b border-r bg-gray-50 text-gray-500 font-medium text-sm">
                Heure
              </th>
              {days.map(day => (
                <th key={day} className="p-4 border-b bg-gray-50 text-gray-700 font-semibold flex-1 min-w-[150px] text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time} className="group">
                <td className="p-3 border-b border-r bg-gray-50 text-xs text-gray-500 text-center font-medium">
                  {time}
                </td>
                {days.map(day => {
                  const daySchedules = groupedByDay[day] || [];
                  const slotHour = parseInt(time.split(':')[0], 10);
                  const activeSchedule = daySchedules.find(s => {
                    const sHour = parseInt(s.start_time.split(':')[0], 10);
                    return sHour === slotHour;
                  });

                  return (
                    <td key={day + time} className="p-2 border-b h-20 align-top relative">
                      {activeSchedule && (
                        <div 
                          className="absolute inset-2 p-2 rounded-lg flex flex-col justify-center text-xs overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          style={{ 
                            backgroundColor: dayColors[day] || '#f0f9ff',
                            borderLeft: `3px solid var(--color-primary)`
                          }}
                        >
                          <div className="font-semibold text-gray-800 truncate mb-1">
                            {activeSchedule.course_title}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{activeSchedule.start_time.substring(0,5)} - {activeSchedule.end_time.substring(0,5)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{activeSchedule.room}</span>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonEmploiDuTemps;
