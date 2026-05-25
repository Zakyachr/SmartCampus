import axios from 'axios';

// Configuration de base pour interagir avec l'API PHP
const apiClient = axios.create({
    baseURL: 'http://localhost/smartcampus/api', // Ajuster selon le virtual host local
    withCredentials: true, // Crucial pour envoyer les cookies de session PHP
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default apiClient;