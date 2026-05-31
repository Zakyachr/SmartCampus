import axios from 'axios';

// Configuration de base pour interagir avec l'API PHP
const apiClient = axios.create({
    baseURL: 'http://localhost/SmartCampus/api', // Ajusté selon le dossier MAMP
    withCredentials: true, // Crucial pour envoyer les cookies de session PHP
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercepteur pour gérer les erreurs 401 (session expirée)
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Déterminer si c'est une expiration de session
            const errorMsg = error.response?.data?.error || '';
            if (errorMsg.includes('Session expirée') || errorMsg.includes('Non autorisé')) {
                // Rediriger vers la page de login
                window.location.href = '/login';
                // Optionnel : afficher un message
                localStorage.setItem('sessionExpired', 'true');
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;