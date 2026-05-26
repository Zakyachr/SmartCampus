import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SmartCampusLogo = ({ className = "w-12 h-12" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 48 46">
        <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
    </svg>
);

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await login(email, password);
            // Redirection dynamique basée sur le rôle retourné par l'API
            navigate(`/${data.user.role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue lors de la connexion.');
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

            {/* Login Card */}
            <div className="max-w-md w-full" style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <SmartCampusLogo className="w-16 h-16" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            SmartCampus
                        </h1>
                        <p className="mt-2 text-gray-500 text-sm">
                            Plateforme de gestion académique
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse e-mail
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-green-100"
                                placeholder="votre@email.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-green-100"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading
                                ? 'bg-green-400 cursor-not-allowed'
                                : 'bg-[#27AE60] hover:bg-[#1A2E35] hover:shadow-lg hover:shadow-green-200'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Connexion en cours...
                                </span>
                            ) : 'Se connecter'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-center text-xs text-gray-400">
                            © 2026 SmartCampus — Campus Numérique
                        </p>
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
            `}</style>
        </div>
    );
};

export default LoginPage;