import React, { useState, useEffect, useContext } from 'react';
import { Mail, Plus, Trash2, Eye, Calendar, X } from 'lucide-react';
import apiClient from '../api/apiClient';
import { SearchContext } from '../context/SearchContext';

const GestionEtudiants = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { searchQuery } = useContext(SearchContext);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    student_number: '',
    major: '',
    level: '',
    date_of_birth: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/students.php');
      setStudents(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des étudiants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.post('/students.php', formData);
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        student_number: '',
        major: '',
        level: '',
        date_of_birth: ''
      });
      fetchStudents();
    } catch (err) {
      alert('Erreur lors de l\'ajout de l\'étudiant: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Filtrer les étudiants selon la recherche
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      (student.student_number && student.student_number.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-full">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Étudiants</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)]">
          <Plus className="w-5 h-5" />
          Ajouter un étudiant
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold">Ajouter un étudiant</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Numéro étudiant"
                  value={formData.student_number}
                  onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                  required
                />
                <input
                  type="date"
                  placeholder="Date de naissance"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Filière"
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Niveau (ex: ING2)"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--color-text-muted)]">Chargement des étudiants...</p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Numéro Étudiant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date de naissance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Filière</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Niveau</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      {searchQuery ? 'Aucun étudiant trouvé correspondant à votre recherche' : 'Aucun étudiant trouvé'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]">
                      <td className="px-6 py-4 font-medium">{student.first_name} {student.last_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.student_number}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {formatDate(student.date_of_birth)}
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.major || '-'}</td>
                      <td className="px-6 py-4">{student.level || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Voir">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded text-red-600" title="Supprimer">
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
            Total : {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''} {searchQuery && `(${students.length} au total)`}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEtudiants;
