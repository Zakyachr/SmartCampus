import React from 'react';
import { Camera, Mail, Phone, Calendar, MapPin, User, Edit, Users, Printer, MoreVertical } from 'lucide-react';

const GestionEtudiants = () => {
  const student = {
    first_name: 'Emma',
    last_name: 'Martin',
    id: 'E20230045',
    email: 'emma.martin@univ.edu',
    phone: '+33 6 12 34 56 78',
    dob: '12 mars 2002',
    address: '15 rue des Universités, 75007 Paris'
  };

  return (
    <div className="max-w-full">
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="card mb-6 p-6 flex items-center gap-6">
            <div className="relative">
              <img src="/avatar-placeholder.png" alt="Emma" className="w-20 h-20 rounded-full object-cover" />
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow"><Camera className="w-4 h-4 text-[var(--color-text-muted)]"/></button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-20px font-bold">{student.first_name} {student.last_name}</h2>
                <span className="badge-active">Étudiant actif</span>
              </div>
              <div className="text-[var(--color-text-muted)] mt-1">ID Étudiant : {student.id}</div>
              <div className="mt-3 space-y-1 text-sm text-[var(--color-text-muted)]">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4"/> {student.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4"/> {student.phone}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {student.dob}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {student.address}</div>
              </div>
            </div>

            <div className="w-64">
              <div className="text-sm text-[var(--color-text-muted)]">Filière</div>
              <div className="font-semibold">Informatique - Licence 2</div>
              <div className="mt-4 text-sm text-[var(--color-text-muted)]">Statut</div>
              <div className="font-semibold">Inscrit - 05/09/2022</div>
              <div className="mt-4 text-sm text-[var(--color-text-muted)]">Conseiller académique</div>
              <div className="font-semibold">Dr. Julien Moreau</div>
            </div>
          </div>

          <div className="card p-4 mb-6">
            <div className="flex border-b border-[var(--color-border)] pb-3">
              <div className="mr-6 pb-2 border-b-2 border-primary text-[var(--color-primary-dark)] font-semibold">Informations</div>
              <div className="mr-6 text-[var(--color-text-muted)]">Parcours académique</div>
              <div className="mr-6 text-[var(--color-text-muted)]">Cours et groupes</div>
              <div className="mr-6 text-[var(--color-text-muted)]">Documents</div>
              <div className="text-[var(--color-text-muted)]">Historique</div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">Nom complet</h3>
                <div className="text-sm">{student.first_name} {student.last_name}</div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">Email</h3>
                <div className="text-sm">{student.email}</div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">Date de naissance</h3>
                <div className="text-sm">{student.dob}</div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">Téléphone</h3>
                <div className="text-sm">{student.phone}</div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-3">Activité récente</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-[#DCFCE7]">
                 <div className="text-sm font-semibold">Inscription</div>
                 <div className="text-xs text-[var(--color-text-muted)]">05/09/2024 · Admin</div>
              </div>
              <div className="p-3 rounded-lg bg-[#DBEAFE]">
                 <div className="text-sm font-semibold">Modification</div>
                 <div className="text-xs text-[var(--color-text-muted)]">02/09/2024 · Emma</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FEF3C7]">
                 <div className="text-sm font-semibold">Ajout au groupe</div>
                 <div className="text-xs text-[var(--color-text-muted)]">28/08/2024 · Admin</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FEE2E2]">
                 <div className="text-sm font-semibold">Document</div>
                 <div className="text-xs text-[var(--color-text-muted)]">20/08/2024 · Emma</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-96">
          <div className="card p-4 mb-6">
            <h4 className="font-semibold mb-3">Actions rapides</h4>
            <div className="space-y-3">
              <button className="w-full p-3 flex items-center gap-3 border border-[var(--color-border)] rounded-lg"><User className="w-5 h-5 text-blue-600"/>Voir le profil complet</button>
              <button className="w-full p-3 flex items-center gap-3 border border-[var(--color-border)] rounded-lg"><Edit className="w-5 h-5 text-orange-500"/>Modifier les informations</button>
              <button className="w-full p-3 flex items-center gap-3 border border-[var(--color-border)] rounded-lg"><Users className="w-5 h-5 text-green-600"/>Associer à un cours / groupe</button>
              <button className="w-full p-3 flex items-center gap-3 border border-[var(--color-border)] rounded-lg"><Printer className="w-5 h-5 text-gray-500"/>Imprimer la fiche</button>
            </div>
          </div>

          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Cours et groupes associés</h4>
              <a className="text-[var(--color-primary-dark)]">+ Associer</a>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">A</div>
                  <div>
                    <div className="font-semibold">Algorithmique Avancée</div>
                    <div className="text-xs text-[var(--color-text-muted)]">INFO-201 · Groupe L2A</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-active">Actif</span>
                  <button className="p-1"><MoreVertical className="w-4 h-4 text-[var(--color-text-muted)]"/></button>
                </div>
              </li>
            </ul>
            <a className="text-[var(--color-primary-dark)] block mt-3">Voir tous les cours et groupes</a>
          </div>

          <div className="card p-4">
            <h4 className="font-semibold mb-3">Parcours académique</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4">
                        {/* Timeline simplified */}
                        <div className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                          <div className="w-6 h-6 rounded-full border-2 border-blue-600" />
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="text-sm text-[var(--color-text-muted)]">Moyenne générale : <span className="font-semibold">14.8/20</span></div>
                  <div className="text-sm text-[var(--color-text-muted)]">Crédits validés : <span className="font-semibold">60/120</span></div>
                </div>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default GestionEtudiants;
