import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';

const SmartCampusLogo = ({ className = "w-12 h-12" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 48 46">
        <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
    </svg>
);

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // 'student' or 'teacher'
    const [major, setMajor] = useState('');
    const [level, setLevel] = useState('ING1');
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        const payload = {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            role,
            ...(role === 'student' ? { major, level } : { department })
        };

        try {
            await apiClient.post('/register.php', payload);
            setSuccess('Compte créé avec succès ! Redirection vers la page de connexion...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue lors de l’inscription.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Logo top-right */}
            <div className="absolute top-6 right-8 flex items-center gap-3" style={{ animation: 'fadeInDown 0.8s ease forwards' }}>
                <span className="text-gray-400 text-sm font-medium tracking-wide hidden sm:block">SmartCampus</span>
                <SmartCampusLogo className="w-10 h-10" />
            </div>

            {/* Register Card */}
            <div className="max-w-md w-full" style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
                    {/* Logo & Title */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-3">
                            <SmartCampusLogo className="w-14 h-14" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Créer un compte
                        </h1>
                        <p className="mt-1 text-gray-500 text-sm">
                            Rejoignez la plateforme SmartCampus
                        </p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg animate-pulse">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Prénom</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-950 placeholder-gray-400 text-sm transition-all focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-green-100"
                                    placeholder="Jean"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-950 placeholder-gray-400 text-sm transition-all focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-green-100"
                                    placeholder="Dupont"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Adresse e-mail</label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-950 placeholder-gray-400 text-sm transition-all focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-green-100"
                                placeholder="jean.dupont@etu.univ.fr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Mot de passe</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-950 placeholder-gray-400 text-sm transition-all focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-green-100"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Rôle</label>
                            <select
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-950 text-sm bg-white focus:outline-none focus:border-[#2ECC71]"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="student">Étudiant</option>
                                <option value="teacher">Enseignant</option>
                            </select>
                        </div>

                        {role === 'student' ? (
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Filière</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-950 text-xs bg-white focus:outline-none focus:border-[#2ECC71]"
                                        value={major}
                                        onChange={(e) => setMajor(e.target.value)}
                                        required
                                    >
                                        <option value="">Sélectionner...</option>
                                        <option value="Informatique">Informatique</option>
                                        <option value="Mathematiques">Mathématiques</option>
                                        <option value="Physique">Physique</option>
                                        <option value="Biologie">Biologie</option>
                                        <option value="Génie Logiciel">Génie Logiciel</option>
                                        <option value="Systèmes Embarqués">Systèmes Embarqués</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Niveau</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-950 text-xs bg-white focus:outline-none focus:border-[#2ECC71]"
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        required
                                    >
                                        <option value="ING1">ING1</option>
                                        <option value="ING2">ING2</option>
                                        <option value="ING3">ING3</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Département d'enseignement</label>
                                <select
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-950 text-sm bg-white focus:outline-none focus:border-[#2ECC71]"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Informatique">Informatique</option>
                                    <option value="Mathématiques">Mathématiques</option>
                                    <option value="Physique">Physique</option>
                                    <option value="Biologie">Biologie</option>
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-2 ${isLoading || success
                                ? 'bg-green-400 cursor-not-allowed'
                                : 'bg-[#27AE60] hover:bg-[#1A2E35] hover:shadow-lg hover:shadow-green-200'
                                }`}
                        >
                            {isLoading ? 'Création du compte...' : 'S’inscrire'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <span className="text-xs text-gray-400">Déjà inscrit ? </span>
                        <Link to="/login" className="text-xs font-semibold text-[#27AE60] hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </div>

            {/* Animations CSS */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;
