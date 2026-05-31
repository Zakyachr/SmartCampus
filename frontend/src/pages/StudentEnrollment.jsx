// Importations des dépendances React et des composants externes
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext'; // Contexte d'authentification
import apiClient from '../api/apiClient'; // Client API pour les requêtes
import { AlertCircle, CheckCircle, BookOpen, Trash2 } from 'lucide-react'; // Icônes

// Composant StudentEnrollment : permet aux étudiants de s'inscrire/désinscrire des cours
const StudentEnrollment = () => {
  // Récupération de l'utilisateur connecté depuis le contexte
  const { user } = useContext(AuthContext);
  
  // États du composant
  const [availableCourses, setAvailableCourses] = useState([]); // Liste de tous les cours disponibles
  const [enrolledCourses, setEnrolledCourses] = useState([]); // Cours auxquels l'étudiant est inscrit
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Message d'erreur
  const [success, setSuccess] = useState(null); // Message de succès
  const [enrolling, setEnrolling] = useState(null); // ID du cours en cours d'inscription/désinscription
  const [enrollmentEnabled, setEnrollmentEnabled] = useState(true); // Vérification si l'inscription est activée

  // Effet : charge les données au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier si l'inscription est activée
        const settings = JSON.parse(localStorage.getItem('smartcampus_settings') || '{}');
        if (settings.system && settings.system.allow_student_enrollment === false) {
          setEnrollmentEnabled(false);
          setError('Les inscriptions aux cours sont actuellement désactivées par l\'administrateur.');
        }

        // Récupérer tous les cours
        const coursesResponse = await apiClient.get('/courses.php');
        setAvailableCourses(coursesResponse.data || []);
        
        // Récupérer les cours de l'étudiant actuellement connecté
        const enrollmentsResponse = await apiClient.get('/students.php?enrolled=true');
        if (enrollmentsResponse.data) {
          setEnrolledCourses(enrollmentsResponse.data);
        }
      } catch (err) {
        console.error('Erreur:', err);
        if (!error) setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fonction : inscrire l'étudiant à un cours
  const handleEnroll = async (courseId) => {
    // Vérifier si l'inscription est activée
    if (!enrollmentEnabled) {
      setError('Les inscriptions sont actuellement désactivées. Veuillez contacter l\'administration.');
      return;
    }

    setEnrolling(courseId); // Marquer le cours comme en cours d'inscription
    setError(null);
    setSuccess(null);

    try {
      // Envoyer la demande d'inscription au serveur
      const response = await apiClient.post('/enrollments.php', {
        course_id: courseId
      });
      
      setSuccess(`Inscription au cours réussie !`);
      
      // Rafraîchir les données après une inscription réussie
      const coursesResponse = await apiClient.get('/courses.php');
      setAvailableCourses(coursesResponse.data || []);
      const enrollmentsResponse = await apiClient.get('/students.php?enrolled=true');
      if (enrollmentsResponse.data) {
        setEnrolledCourses(enrollmentsResponse.data);
      }
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'inscription';
      setError(errorMsg);
    } finally {
      setEnrolling(null); // Fin du chargement
    }
  };

  // Fonction : se désinscrire d'un cours
  const handleUnenroll = async (courseId) => {
    // Confirmer l'action avec l'utilisateur
    if (!window.confirm("Êtes-vous sûr de vouloir vous désinscrire de ce cours ?")) return;
    
    setEnrolling(courseId); // Marquer le cours comme en cours de désinscription
    setError(null);
    setSuccess(null);

    try {
      // Envoyer la demande de désinscription au serveur
      await apiClient.delete(`/enrollments.php?course_id=${courseId}`);
      setSuccess(`Désinscription réussie.`);
      
      // Rafraîchir les données après une désinscription réussie
      const coursesResponse = await apiClient.get('/courses.php');
      setAvailableCourses(coursesResponse.data || []);
      const enrollmentsResponse = await apiClient.get('/students.php?enrolled=true');
      setEnrolledCourses(enrollmentsResponse.data || []);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de la désinscription';
      setError(errorMsg);
    } finally {
      setEnrolling(null); // Fin du chargement
    }
  };

  // Fonction utilitaire : vérifie si l'étudiant est inscrit à un cours
  const isEnrolled = (courseId) => {
    return enrolledCourses.some(c => c.id === courseId);
  };

  // Afficher l'écran de chargement si les données sont en cours de récupération
  if (loading) return <div className="p-6">Chargement...</div>;

  // Rendu du composant
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">S'inscrire à des Cours</h1>

      {/* Affichage du message d'erreur s'il existe */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Erreur</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Affichage du message de succès s'il existe */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Succès</p>
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Conteneur en deux colonnes : Cours disponibles et Mes inscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne 1 : Afficher tous les cours disponibles */}
        <div>
          <h2 className="text-xl font-bold mb-4">Cours Disponibles</h2>
          <div className="space-y-4">
            {/* Boucler sur chaque cours disponible */}
            {availableCourses.map((course) => (
              <div key={course.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Afficher le titre et le code du cours */}
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{course.code}</p>
                    
                    {/* Afficher le nom de l'enseignant */}
                    <p className="text-sm mt-2">
                      Prof: <span className="font-semibold">{course.teacher_first_name} {course.teacher_last_name}</span>
                    </p>
                  </div>
                </div>
                
                {/* Bouton d'inscription ou de désinscription selon le statut */}
                <div className="mt-4 flex items-center gap-2">
                  {isEnrolled(course.id) ? (
                    // Bouton de désinscription (rouge) si l'étudiant est déjà inscrit
                    <button 
                      onClick={() => handleUnenroll(course.id)}
                      disabled={enrolling === course.id}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-200 transition"
                      title="Se désinscrire"
                    >
                      <Trash2 className="w-4 h-4" />
                      {enrolling === course.id ? '...' : 'Désinscription'}
                    </button>
                  ) : (
                    // Bouton d'inscription (bleu) si l'étudiant n'est pas encore inscrit
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id || !enrollmentEnabled}
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

        {/* Colonne 2 : Afficher les cours auxquels l'étudiant est inscrit */}
        <div>
          <h2 className="text-xl font-bold mb-4">Mes Inscriptions</h2>
          
          {/* Afficher la liste des inscriptions si l'étudiant est inscrit à au moins un cours */}
          {enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {/* Boucler sur chaque cours inscrit */}
              {enrolledCourses.map((course) => (
                <div key={course.id} className="card p-4 bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    {/* Icône de livre */}
                    <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      {/* Afficher les informations du cours */}
                      <h3 className="font-bold">{course.title}</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">{course.code}</p>
                      <p className="text-sm mt-1">
                        Prof: <span className="font-semibold">{course.teacher_first_name} {course.teacher_last_name}</span>
                      </p>
                      
                      {/* Afficher l'horaire et la salle si disponibles */}
                      {course.day_of_week && (
                        <p className="text-xs text-gray-600 mt-2">
                          📅 {course.day_of_week} {course.start_time} - {course.end_time} | 🏢 {course.room}
                        </p>
                      )}
                    </div>
                    
                    {/* Bouton pour se désinscrire */}
                    <button 
                      onClick={() => handleUnenroll(course.id)}
                      disabled={enrolling === course.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                      title="Se désinscrire"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Afficher un message si l'étudiant n'est inscrit à aucun cours
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
