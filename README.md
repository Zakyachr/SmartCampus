# SmartCampus - La gestion académique de notre époque

SmartCampus est une plateforme web dynamique développée pour les écoles d'ingénieurs. Elle intègre une architecture client-serveur stricte séparant le frontend (React) du backend (PHP/MySQL).

## 🛠️ Stack Technologique
* **Frontend** : React.js (Vite), React Router, Tailwind CSS, Axios
* **Backend** : PHP 8+ (API REST), PDO (Requêtes préparées)
* **Base de données** : MySQL 8+

## 🚀 Guide d'installation

### 1. Préparation de la Base de Données
1. Lancez votre serveur local (XAMPP, WAMP, MAMP, ou Docker).
2. Ouvrez phpMyAdmin (ou votre client SQL préféré).
3. Importez le fichier `sql/schema.sql`. Cela créera la base `smartcampus_db`, toutes les tables, et insérera des données de test.

### 2. Configuration du Backend (API PHP)
1. Placez le dossier `smartcampus` (contenant le sous-dossier `api/`) dans le répertoire public de votre serveur web (ex: `htdocs` ou `www`).
   * *Note : L'API doit être accessible via l'URL `http://localhost/smartcampus/api`.*
2. Ouvrez le fichier `api/config/db.php`.
3. Vérifiez et modifiez si besoin les identifiants MySQL :
   ```php
   $user = 'root'; // Votre utilisateur MySQL
   $pass = '';     // Votre mot de passe MySQL