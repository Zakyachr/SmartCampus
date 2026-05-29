import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Page d'admin pour importer des données de test dans la base de données
const AdminSeed = () => {
  // État : chargement, messages d'erreur/succès, stats de la DB
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState(null);

  // Récupère les statistiques actuelles de la base de données
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost/smartcampus/api/seed.php');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // Charge les stats au montage du composant
  React.useEffect(() => {
    fetchStats();
  }, []);

  // Lance l'importation des données de test
  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost/smartcampus/api/seed.php?action=seed', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'import');
      }

      const data = await response.json();
      setSuccess(data.message);
      
      // Rafraîchit les stats après un léger délai
      setTimeout(() => {
        fetchStats();
      }, 500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Importer les Données de Test</h1>

        {/* Affiche les statistiques actuelles de la DB */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">État actuel de la base de données</h2>
          {stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Étudiants</p>
                <p className="text-2xl font-bold text-green-600">{stats.students}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Enseignants</p>
                <p className="text-2xl font-bold text-purple-600">{stats.teachers}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Cours</p>
                <p className="text-2xl font-bold text-orange-600">{stats.courses}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Inscriptions</p>
                <p className="text-2xl font-bold text-pink-600">{stats.enrollments}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.grades}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Chargement...</p>
          )}
        </div>

        {/* Message d'erreur en cas d'import échoué */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Erreur</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Message de succès après l'import */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Succès</p>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Formulaire et bouton d'import */}
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Données à importer</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>✅ 3 nouveaux enseignants (teacher3, teacher4, teacher5)</li>
            <li>✅ 13 nouveaux étudiants (student3 à student15)</li>
            <li>✅ 6 nouveaux cours</li>
            <li>✅ Horaires et salles pour chaque cours</li>
            <li>✅ Inscriptions existantes</li>
            <li>✅ Notes pré-saisies</li>
          </ul>

          {/* Bouton pour lancer l'importation */}
          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full px-4 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Importation en cours...
              </>
            ) : (
              'Importer les données'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSeed;
