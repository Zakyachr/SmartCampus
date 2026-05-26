import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Eye, X } from 'lucide-react';
import apiClient from '../api/apiClient';

const GestionEnseignants = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/teachers.php');
      setTeachers(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des enseignants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.post('/teachers.php', formData);
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        department: ''
      });
      fetchTeachers();
    } catch (err) {
      alert('Erreur lors de l\'ajout de l\'enseignant: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-full">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Enseignants</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)]">
          <Plus className="w-5 h-5" />
          Ajouter un enseignant
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold">Ajouter un enseignant</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
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
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg col-span-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Département"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg col-span-2"
                  required
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
          <p className="text-[var(--color-text-muted)]">Chargement des enseignants...</p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Département</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      Aucun enseignant trouvé
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]">
                      <td className="px-6 py-4 font-medium">{teacher.first_name} {teacher.last_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {teacher.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">{teacher.department || '-'}</td>
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
            Total : {teachers.length} enseignant{teachers.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEnseignants;
