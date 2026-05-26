import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/auth/LoginPage';
import GestionEtudiants from './pages/GestionEtudiants';
import GestionEnseignants from './pages/GestionEnseignants';
import GestionCours from './pages/GestionCours';
import NotesEtudiants from './pages/NotesEtudiants';
import AdminRapports from './pages/AdminRapports';
import AdminDashboard from './pages/AdminDashboard';
import AdminParametres from './pages/AdminParametres';
import StudentDashboard from './pages/StudentDashboard';
import MesCours from './pages/MesCours';
import MesNotes from './pages/MesNotes';
import MonEmploiDuTemps from './pages/MonEmploiDuTemps';
import StudentEnrollment from './pages/StudentEnrollment';
import TeacherStudents from './pages/TeacherStudents';
import TeacherGradeEntry from './pages/TeacherGradeEntry';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminSeed from './pages/AdminSeed';

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
            <SearchProvider>
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
                                        <Route path="inscription" element={<StudentEnrollment />} />
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
                                        <Route path="eleves" element={<TeacherStudents />} />
                                        <Route path="notes" element={<TeacherGradeEntry />} />
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
                                        <Route path="enseignants" element={<GestionEnseignants />} />
                                        <Route path="cours" element={<GestionCours />} />
                                        <Route path="notes" element={<NotesEtudiants />} />
                                        <Route path="rapports" element={<AdminRapports />} />
                                        <Route path="parametres" element={<AdminParametres />} />
                                        <Route path="seed" element={<AdminSeed />} />
                                    </Routes>
                                </AppLayout>
                            </ProtectedRoute>
                        } />

                        {/* Redirection par défaut vers le login */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </SearchProvider>
        </AuthProvider>
    );
}

export default App;