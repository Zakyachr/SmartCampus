import React, { useState, useEffect } from 'react';
import { Mail, Plus, Eye, Users, X, Trash2, Edit, Calendar, Search, Filter, Unlock } from 'lucide-react';
import apiClient from '../api/apiClient';

// Composant de gestion complète des cours : CRUD, horaires, visualisation des inscriptions
const GestionCours = () => {
  // État principal
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals et sélections
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Recherche et filtrage
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [sortBy, setSortBy] = useState('title_asc');

  // Modals CRUD
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    day_of_week: 'Lundi',
    start_time: '08:00',
    end_time: '10:00',
    room: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    teacher_id: '',
    max_capacity: 30
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    code: '',
    title: '',
    description: '',
    teacher_id: '',
    max_capacity: 30
  });

  // Initialisation : charger les cours et enseignants
  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  // Récupère la liste des enseignants pour les formulaires
  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/teachers.php');
      setTeachers(response.data);
    } catch (err) {
      console.error('Erreur chargement enseignants:', err);
    }
  };

  // Crée un nouveau cours
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.post('/courses.php', formData);
      setShowAddModal(false);
      setFormData({
        code: '',
        title: '',
        description: '',
        teacher_id: '',
        max_capacity: 30
      });
      fetchCourses();
    } catch (err) {
      alert('Erreur lors de l\'ajout du cours: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Modifie un cours existant
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.put(`/courses.php?id=${editFormData.id}`, editFormData);
      setShowEditModal(false);
      fetchCourses();
    } catch (err) {
      alert('Erreur lors de la modification du cours: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (course) => {
    setEditFormData({
      id: course.id,
      code: course.code,
      title: course.title,
      description: course.description || '',
      teacher_id: course.teacher_id || '',
      max_capacity: course.max_capacity || 30
    });
    setShowEditModal(true);
  };

  // Récupère tous les cours de la base de données
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/courses.php');
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charge et affiche les étudiants inscrits à un cours
  const handleViewCourse = async (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
    setLoadingStudents(true);

    try {
      const response = await apiClient.get(`/enrollments.php?course_id=${course.id}`);
      setCourseStudents(response.data || []);
    } catch (err) {
      console.error('Erreur chargement étudiants:', err);
      setCourseStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Supprime un cours (et ses inscriptions/notes associées)
  const handleDeleteCourse = async (courseId) => {
    try {
      setDeleting(true);
      await apiClient.delete(`/courses.php?id=${courseId}`);
      setShowDeleteConfirm(null);
      fetchCourses();
    } catch (err) {
      alert("Erreur lors de la suppression : " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  // Rétablit l'accès à un cours validé (permet au prof de remodifier les notes)
  const handleRevokeValidation = async (course) => {
    if (!window.confirm(`Êtes-vous sûr ? Cela permettra au professeur de modifier à nouveau les notes du cours "${course.title}".`)) {
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.patch(`/courses.php?id=${course.id}`, { action: 'unvalidate' });
      alert('L\'accès au cours a été rétabli. Le professeur peut maintenant modifier les notes.');
      fetchCourses();
    } catch (err) {
      alert("Erreur lors du rétablissement de l'accès : " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Charge et prépare l'édition de l'horaire d'un cours
  const handleViewSchedule = async (course) => {
    setSelectedCourse(course);
    setLoadingStudents(true);
    setShowScheduleModal(true);
    setCurrentSchedule(null);
    setScheduleFormData({
      day_of_week: 'Lundi',
      start_time: '08:00',
      end_time: '10:00',
      room: ''
    });
    
    try {
      const res = await apiClient.get('/schedules.php');
      const schedule = res.data.find(s => s.course_id === course.id);
      if (schedule) {
        setCurrentSchedule(schedule);
        setScheduleFormData({
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time.substring(0, 5),
          end_time: schedule.end_time.substring(0, 5),
          room: schedule.room
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Crée ou modifie l'horaire d'un cours
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...scheduleFormData, course_id: selectedCourse.id };
      if (currentSchedule) {
        await apiClient.put(`/schedules.php?id=${currentSchedule.id}`, payload);
      } else {
        await apiClient.post('/schedules.php', payload);
      }
      alert('Horaire enregistré avec succès.');
      setShowScheduleModal(false);
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!window.confirm("Supprimer l'horaire de ce cours ?")) return;
    try {
      setSubmitting(true);
      await apiClient.delete(`/schedules.php?id=${currentSchedule.id}`);
      setCurrentSchedule(null);
      alert('Horaire supprimé.');
      setShowScheduleModal(false);
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Retourne les couleurs CSS selon le statut du cours
  const getStatusColor = (status) => {
    switch(status) {
      case 'ouvert':
        return 'bg-green-100 text-green-800';
      case 'fermé':
        return 'bg-red-100 text-red-800';
      case 'validé':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Applique filtrage et tri aux cours
  const filteredAndSortedCourses = courses
    .filter(course => {
      if (statusFilter !== 'tous' && course.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = (course.title || '').toLowerCase();
        const code = (course.code || '').toLowerCase();
        if (!title.includes(query) && !code.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'code_asc') return (a.code || '').localeCompare(b.code || '');
      if (sortBy === 'code_desc') return (b.code || '').localeCompare(a.code || '');
      return 0;
    });

  return (
    <div className="max-w-full">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Gestion des Cours</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 whitespace-nowrap">
          <Plus className="w-5 h-5" />
          Ajouter un cours
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre ou code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-white"
          />
        </div>
        <div className="relative min-w-[150px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border border-[var(--color-border)] rounded-lg appearance-none bg-white"
          >
            <option value="tous">Tous les statuts</option>
            <option value="ouvert">Ouvert</option>
            <option value="validé">Validé</option>
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-[var(--color-border)] rounded-lg bg-white min-w-[150px]"
        >
          <option value="title_asc">Titre (A-Z)</option>
          <option value="title_desc">Titre (Z-A)</option>
          <option value="code_asc">Code (A-Z)</option>
          <option value="code_desc">Code (Z-A)</option>
        </select>
      </div>

      {/* Modal pour créer un nouveau cours */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold">Ajouter un cours</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Code (ex: CS101)"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Titre"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-2 px-4 py-2 border border-[var(--color-border)] rounded-lg"
                />
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                >
                  <option value="">Sélectionner un enseignant</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Capacité Max"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({...formData, max_capacity: parseInt(e.target.value) || ''})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                  min="1"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                >
                  {submitting ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour modifier un cours existant */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold">Modifier un cours</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Code (ex: CS101)"
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Titre"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="col-span-2 px-4 py-2 border border-[var(--color-border)] rounded-lg"
                />
                <select
                  value={editFormData.teacher_id}
                  onChange={(e) => setEditFormData({...editFormData, teacher_id: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                >
                  <option value="">Sélectionner un enseignant</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Capacité Max"
                  value={editFormData.max_capacity}
                  onChange={(e) => setEditFormData({...editFormData, max_capacity: parseInt(e.target.value) || ''})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                  min="1"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour gérer les horaires et la salle du cours */}
      {showScheduleModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Horaires : {selectedCourse.code}</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {loadingStudents ? (
              <p className="text-center py-4">Chargement...</p>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Jour</label>
                  <select
                    value={scheduleFormData.day_of_week}
                    onChange={e => setScheduleFormData({...scheduleFormData, day_of_week: e.target.value})}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg"
                    required
                  >
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Début</label>
                    <input
                      type="time"
                      value={scheduleFormData.start_time}
                      onChange={e => setScheduleFormData({...scheduleFormData, start_time: e.target.value})}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Fin</label>
                    <input
                      type="time"
                      value={scheduleFormData.end_time}
                      onChange={e => setScheduleFormData({...scheduleFormData, end_time: e.target.value})}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Salle</label>
                  <input
                    type="text"
                    value={scheduleFormData.room}
                    onChange={e => setScheduleFormData({...scheduleFormData, room: e.target.value})}
                    placeholder="Ex: Amphi A, Salle 101"
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  {currentSchedule && (
                    <button
                      type="button"
                      onClick={handleDeleteSchedule}
                      disabled={submitting}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      Supprimer l'horaire
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                  >
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal pour confirmer la suppression d'un cours */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-[var(--color-text-muted)] mb-6">
              Êtes-vous sûr de vouloir supprimer le cours <strong>{showDeleteConfirm.code} - {showDeleteConfirm.title}</strong> ? 
              Cette action est irréversible et supprimera également toutes les inscriptions et les notes associées.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteCourse(showDeleteConfirm.id)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour afficher les étudiants inscrits à un cours */}
      {showViewModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 font-mono font-bold text-sm">{selectedCourse.code}</span>
                  <h2 className="text-xl font-bold">{selectedCourse.title}</h2>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Enseignant : {selectedCourse.teacher_first_name ? `${selectedCourse.teacher_first_name} ${selectedCourse.teacher_last_name}` : 'Non assigné'}
                  <span className="mx-2">·</span>
                  Capacité : {selectedCourse.max_capacity} places
                </p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingStudents ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                  <p className="mt-3 text-[var(--color-text-muted)]">Chargement des étudiants...</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                    <div className="p-3 rounded-full bg-purple-100">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{courseStudents.length}</p>
                      <p className="text-sm text-purple-500">étudiant{courseStudents.length > 1 ? 's' : ''} inscrit{courseStudents.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-32 h-3 bg-purple-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((courseStudents.length / (selectedCourse.max_capacity || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">{courseStudents.length}/{selectedCourse.max_capacity} places</p>
                    </div>
                  </div>

                  {/* Students list */}
                  {courseStudents.length === 0 ? (
                    <p className="text-center py-6 text-[var(--color-text-muted)]">Aucun étudiant inscrit à ce cours.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Étudiant</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Étudiant</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Filière</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Niveau</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseStudents.map((student, idx) => (
                            <tr key={student.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-gray-400 text-sm">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                                    {student.first_name[0]}{student.last_name[0]}
                                  </div>
                                  <span className="font-medium">{student.first_name} {student.last_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3" />
                                  {student.email}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{student.student_number}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{student.major || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{student.level || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--color-text-muted)]">Chargement des cours...</p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Titre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Enseignant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Capacité</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      Aucun cours trouvé
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedCourses.map((course) => (
                    <tr key={course.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--color-primary)]">{course.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{course.title}</div>
                        {course.description && (
                          <div className="text-sm text-[var(--color-text-muted)]">{course.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {course.teacher_first_name ? (
                          <div>
                            <div className="font-medium">{course.teacher_first_name} {course.teacher_last_name}</div>
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {course.max_capacity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewCourse(course)}
                            className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors" 
                            title="Voir les étudiants inscrits"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewSchedule(course)}
                            className="p-2 hover:bg-purple-50 rounded text-purple-600 transition-colors" 
                            title="Gérer les horaires"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          {course.status === 'validé' && (
                            <button 
                              onClick={() => handleRevokeValidation(course)}
                              disabled={submitting}
                              className="p-2 hover:bg-orange-50 rounded text-orange-600 transition-colors disabled:opacity-50" 
                              title="Rétablir l'accès - Permettre au professeur de modifier les notes"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => openEditModal(course)}
                            className="p-2 hover:bg-orange-50 rounded text-orange-600 transition-colors" 
                            title="Modifier le cours"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(course)}
                            className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors" 
                            title="Supprimer le cours"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-muted)]">
            Total : {filteredAndSortedCourses.length} cours
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCours;
