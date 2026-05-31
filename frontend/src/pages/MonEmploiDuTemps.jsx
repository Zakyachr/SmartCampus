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
    const dayCourses = schedules.filter(s => s.day_of_week === day);
    
    // Dédupliquer les cours en se basant sur course_id + start_time + end_time
    const seen = new Map();
    for (const course of dayCourses) {
      const key = `${course.course_id}-${course.start_time}-${course.end_time}`;
      if (!seen.has(key)) {
        seen.set(key, course);
      }
    }
    groupedByDay[day] = Array.from(seen.values());
  });

  // Heures d'affichage typiques pour une école, par ex. 08:00 à 18:00
  const timeSlots = [...Array(11)].map((_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  // Fonction pour convertir l'heure en minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

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
                  const slotMinutes = slotHour * 60;

                  // Trouver les cours qui COMMENCENT exactement à cette heure
                  const startingSchedules = daySchedules.filter(s => {
                    const startMinutes = timeToMinutes(s.start_time);
                    return startMinutes >= slotMinutes && startMinutes < slotMinutes + 60;
                  });

                  return (
                    <td key={day + time} className="p-1 border-b h-28 align-top relative bg-white overflow-visible">
                      {startingSchedules.map((schedule, idx) => {
                        const startMinutes = timeToMinutes(schedule.start_time);
                        const endMinutes = timeToMinutes(schedule.end_time);
                        const totalDuration = endMinutes - startMinutes;
                        
                        // Position offset pour les minutes (ex: 08:30 = 0.5 * 112px)
                        const slotStartMinutes = slotHour * 60;
                        const minuteOffset = (startMinutes - slotStartMinutes) % 60;
                        const positionOffset = (minuteOffset / 60) * 112;
                        
                        // Hauteur totale du cours (en pixels)
                        const totalHeight = (totalDuration / 60) * 112;

                        return (
                          <div
                            key={idx}
                            className="absolute inset-x-1 p-2 rounded-lg flex flex-col justify-start text-xs overflow-y-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10"
                            style={{
                              top: `${positionOffset + 4}px`,
                              height: `${totalHeight}px`,
                              backgroundColor: dayColors[day] || '#f0f9ff',
                              borderLeft: '4px solid var(--color-primary)',
                              width: 'calc(100% - 8px)',
                              minHeight: '40px'
                            }}
                          >
                            <div className="font-semibold text-gray-800 leading-snug mb-1">
                              {schedule.course_title}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="whitespace-nowrap">{schedule.start_time.substring(0,5)} - {schedule.end_time.substring(0,5)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{schedule.room}</span>
                            </div>
                          </div>
                        );
                      })}
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
