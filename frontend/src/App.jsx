import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/auth/LoginPage';
import GestionEtudiants from './pages/GestionEtudiants';
import StudentDashboard from './pages/StudentDashboard';
import MesCours from './pages/MesCours';
import MesNotes from './pages/MesNotes';
import MonEmploiDuTemps from './pages/MonEmploiDuTemps';

// Pages Admin (Exemples de composants à créer ensuite)
const AdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Dashboard Administrateur</h1></div>;
// Pages Teacher
const TeacherDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Dashboard Enseignant</h1></div>;
// Pages Student
// StudentDashboard imported from pages/StudentDashboard

const AppLayout = ({ children }) => (
    <Layout>
        {children}
    </Layout>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Route publique */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Routes Étudiant */}
                    <Route path="/student/*" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <AppLayout>
                                <Routes>
                                    <Route path="dashboard" element={<StudentDashboard />} />
                                    <Route path="cours" element={<MesCours />} />
                                    <Route path="notes" element={<MesNotes />} />
                                    <Route path="planning" element={<MonEmploiDuTemps />} />
                                </Routes>
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Routes Enseignant */}
                    <Route path="/teacher/*" element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                            <AppLayout>
                                <Routes>
                                    <Route path="dashboard" element={<TeacherDashboard />} />
                                    <Route path="cours" element={<MesCours />} />
                                    <Route path="notes" element={<MesNotes />} />
                                    <Route path="planning" element={<MonEmploiDuTemps />} />
                                </Routes>
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Routes Admin */}
                    <Route path="/admin/*" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AppLayout>
                                <Routes>
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="etudiants" element={<GestionEtudiants />} />
                                </Routes>
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Redirection par défaut vers le login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;