import React, { useState, useEffect } from 'react';
import { Settings, Building2, GraduationCap, Shield, Bell, Save, RotateCcw, CheckCircle } from 'lucide-react';

// Paramètres par défaut du système (campus, académique, système, notifications)
const defaultSettings = {
  campus: {
    name: 'SmartCampus',
    address: '123 Avenue de l\'Innovation, 75001 Paris',
    email: 'contact@smartcampus.edu',
    phone: '+33 1 23 45 67 89',
    website: 'https://smartcampus.edu',
  },
  academic: {
    pass_threshold: 10,
    mention_ab: 12,
    mention_b: 14,
    mention_tb: 16,
    cc1_weight: 30,
    cc2_weight: 30,
    exam_weight: 40,
    max_courses_per_student: 5,
    academic_year: '2025-2026',
  },
  system: {
    maintenance_mode: false,
    default_course_capacity: 30,
    default_password: 'password',
    allow_student_enrollment: true,
    auto_grade_calculation: true,
    session_timeout: 120,
  },
  notifications: {
    email_notifications: true,
    enrollment_alerts: true,
    grade_alerts: true,
    capacity_alerts: true,
    alert_threshold: 90,
  }
};

// Page d'administration : configuration centralisée de tous les paramètres système
const AdminParametres = () => {
  // État : paramètres actuels, feedback sauvegarde, section active
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('campus');

  // Charge les paramètres depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('smartcampus_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  // Enregistre les paramètres en localStorage avec feedback utilisateur
  const handleSave = () => {
    localStorage.setItem('smartcampus_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Réinitialise tous les paramètres aux valeurs par défaut
  const handleReset = () => {
    if (window.confirm('Réinitialiser tous les paramètres par défaut ?')) {
      setSettings(defaultSettings);
      localStorage.removeItem('smartcampus_settings');
    }
  };

  // Met à jour un paramètre spécifique dans sa section
  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  // Sections de configuration (navigation latérale)
  const sections = [
    { id: 'campus', label: 'Campus', icon: Building2 },
    { id: 'academic', label: 'Académique', icon: GraduationCap },
    { id: 'system', label: 'Système', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // Composant réutilisable : champ de saisie texte/nombre avec label et indice
  const InputField = ({ label, value, onChange, type = 'text', hint, suffix }) => (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] focus:ring-2 focus:ring-green-200 outline-none transition-all text-sm"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-[var(--color-text-muted)] mt-1">{hint}</p>}
    </div>
  );

  // Composant réutilisable : bouton de basculement on/off avec label
  const ToggleField = ({ label, value, onChange, hint }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
        {hint && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${value ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
      >
        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 shadow ${value ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Configuration globale du campus numérique</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              Paramètres sauvegardés
            </div>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50 text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 text-sm"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="flex gap-6">
      {/* Navigation : sélection des sections */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-[var(--color-primary)] border border-green-100' 
                    : 'text-[var(--color-text-muted)] hover:bg-gray-50'
                }`}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu : formulaires de chaque section */}
        <div className="flex-1">
          {/* Section 1 : Informations du campus */}
          {activeSection === 'campus' && (
            <div className="card p-6 card-glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                  <Building2 className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Informations du Campus</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Identité et coordonnées de l'établissement</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nom du campus" value={settings.campus.name} onChange={(v) => updateSetting('campus', 'name', v)} />
                <InputField label="Email de contact" value={settings.campus.email} onChange={(v) => updateSetting('campus', 'email', v)} type="email" />
                <InputField label="Adresse" value={settings.campus.address} onChange={(v) => updateSetting('campus', 'address', v)} />
                <InputField label="Téléphone" value={settings.campus.phone} onChange={(v) => updateSetting('campus', 'phone', v)} />
                <InputField label="Site web" value={settings.campus.website} onChange={(v) => updateSetting('campus', 'website', v)} />
              </div>
            </div>
          )}

          {/* Section 2 : Paramètres académiques (seuils, pondérations) */}
          {activeSection === 'academic' && (
            <div className="card p-6 card-glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                  <GraduationCap className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Paramètres Académiques</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Seuils de notes, pondérations et limites</p>
                </div>
              </div>
              {/* Définition des notes seuils pour les mentions */}
              <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Seuils de Mention</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField label="Seuil de passage" value={settings.academic.pass_threshold} onChange={(v) => updateSetting('academic', 'pass_threshold', v)} type="number" suffix="/20" hint="Note minimum pour valider un cours" />
                <InputField label="Mention Assez Bien" value={settings.academic.mention_ab} onChange={(v) => updateSetting('academic', 'mention_ab', v)} type="number" suffix="/20" />
                <InputField label="Mention Bien" value={settings.academic.mention_b} onChange={(v) => updateSetting('academic', 'mention_b', v)} type="number" suffix="/20" />
                <InputField label="Mention Très Bien" value={settings.academic.mention_tb} onChange={(v) => updateSetting('academic', 'mention_tb', v)} type="number" suffix="/20" />
              </div>

              {/* Pondérations avec validation de la somme = 100% */}
              <div className="border-t border-[var(--color-border)] pt-6 mb-6">
                <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Pondérations</h3>
                <div className="grid grid-cols-3 gap-4">
                  <InputField label="CC1" value={settings.academic.cc1_weight} onChange={(v) => updateSetting('academic', 'cc1_weight', v)} type="number" suffix="%" hint="Poids du contrôle continu 1" />
                  <InputField label="CC2" value={settings.academic.cc2_weight} onChange={(v) => updateSetting('academic', 'cc2_weight', v)} type="number" suffix="%" hint="Poids du contrôle continu 2" />
                  <InputField label="Examen Final" value={settings.academic.exam_weight} onChange={(v) => updateSetting('academic', 'exam_weight', v)} type="number" suffix="%" hint="Poids de l'examen final" />
                </div>
                {(settings.academic.cc1_weight + settings.academic.cc2_weight + settings.academic.exam_weight) !== 100 && (
                  <p className="text-xs text-red-500 mt-2">⚠️ La somme des pondérations doit être égale à 100% (actuellement {settings.academic.cc1_weight + settings.academic.cc2_weight + settings.academic.exam_weight}%)</p>
                )}
              </div>

              <div className="border-t border-[var(--color-border)] pt-6">
                <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Limites d'inscription</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Max cours par étudiant" value={settings.academic.max_courses_per_student} onChange={(v) => updateSetting('academic', 'max_courses_per_student', v)} type="number" />
                  <InputField label="Année académique" value={settings.academic.academic_year} onChange={(v) => updateSetting('academic', 'academic_year', v)} />
                </div>
              </div>
            </div>
          )}

          {/* Section 3 : Paramètres système (maintenance, timeouts) */}
          {activeSection === 'system' && (
            <div className="card p-6 card-glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                  <Shield className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Paramètres Système</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Maintenance, sécurité et configuration technique</p>
                </div>
              </div>
              
              {/* Toggles pour les modes système */}
              <div className="space-y-1 mb-6">
                <ToggleField 
                  label="Mode maintenance" 
                  value={settings.system.maintenance_mode} 
                  onChange={(v) => updateSetting('system', 'maintenance_mode', v)}
                  hint="Désactive temporairement l'accès au système pour tous les utilisateurs"
                />
                <ToggleField 
                  label="Inscription étudiants" 
                  value={settings.system.allow_student_enrollment} 
                  onChange={(v) => updateSetting('system', 'allow_student_enrollment', v)}
                  hint="Permet aux étudiants de s'inscrire eux-mêmes aux cours"
                />
                <ToggleField 
                  label="Calcul automatique des moyennes" 
                  value={settings.system.auto_grade_calculation} 
                  onChange={(v) => updateSetting('system', 'auto_grade_calculation', v)}
                  hint="Calcul automatique de la moyenne finale selon les pondérations"
                />
              </div>

              {/* Configuration des valeurs par défaut */}
              {/* Configuration des valeurs par défaut */}
              <div className="border-t border-[var(--color-border)] pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Capacité par défaut des cours" value={settings.system.default_course_capacity} onChange={(v) => updateSetting('system', 'default_course_capacity', v)} type="number" hint="Nombre de places par défaut lors de la création d'un cours" />
                  <InputField label="Timeout de session" value={settings.system.session_timeout} onChange={(v) => updateSetting('system', 'session_timeout', v)} type="number" suffix="min" hint="Durée d'inactivité avant déconnexion automatique" />
                  <InputField label="Mot de passe par défaut" value={settings.system.default_password} onChange={(v) => updateSetting('system', 'default_password', v)} hint="Mot de passe attribué aux nouveaux comptes créés" />
                </div>
              </div>
            </div>
          )}

          {/* Section 4 : Configuration des notifications */}
          {activeSection === 'notifications' && (
            <div className="card p-6 card-glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                  <Bell className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Notifications</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Gestion des alertes et notifications du système</p>
                </div>
              </div>
              
              {/* Toggles pour les alertes et notifications */}
              <div className="space-y-1 mb-6">
                <ToggleField 
                  label="Notifications par email" 
                  value={settings.notifications.email_notifications} 
                  onChange={(v) => updateSetting('notifications', 'email_notifications', v)}
                  hint="Envoyer des emails lors d'événements importants"
                />
                <ToggleField 
                  label="Alertes d'inscription" 
                  value={settings.notifications.enrollment_alerts} 
                  onChange={(v) => updateSetting('notifications', 'enrollment_alerts', v)}
                  hint="Notifier l'admin lorsqu'un étudiant s'inscrit à un cours"
                />
                <ToggleField 
                  label="Alertes de notes" 
                  value={settings.notifications.grade_alerts} 
                  onChange={(v) => updateSetting('notifications', 'grade_alerts', v)}
                  hint="Notifier lorsqu'un enseignant saisit ou modifie des notes"
                />
                <ToggleField 
                  label="Alertes de capacité" 
                  value={settings.notifications.capacity_alerts} 
                  onChange={(v) => updateSetting('notifications', 'capacity_alerts', v)}
                  hint="Alerter quand un cours approche sa capacité maximale"
                />
              </div>

              <div className="border-t border-[var(--color-border)] pt-6">
                <InputField 
                  label="Seuil d'alerte de capacité" 
                  value={settings.notifications.alert_threshold} 
                  onChange={(v) => updateSetting('notifications', 'alert_threshold', v)} 
                  type="number" 
                  suffix="%" 
                  hint="Déclencher une alerte quand un cours atteint ce pourcentage de remplissage" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminParametres;
