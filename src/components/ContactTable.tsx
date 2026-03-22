import { useState } from 'react';
import { Contact } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface ContactTableProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export function ContactTable({ contacts, onEdit, onDelete }: ContactTableProps) {
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <p className="text-slate-500 text-lg">Aucune demande enregistrée pour le moment.</p>
        <p className="text-slate-400 text-sm mt-2">Cliquez sur "Ajouter un contact" pour commencer.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Prospect': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Converti': return 'bg-green-100 text-green-800 border-green-200';
      case 'Non-converti': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getInterestColor = (interest: string) => {
    switch (interest) {
      case 'très motivé': return 'text-green-600 font-medium';
      case 'inscription probable': return 'text-emerald-600 font-bold';
      case 'visite souhaitée': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parent</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Enfant(s)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Niveau(x)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">A faire</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {contacts.map((contact) => {
              const isConfirmed = contact.status === 'Converti';
              return (
                <tr key={contact.id} className={isConfirmed ? 'bg-green-50/40' : 'hover:bg-slate-50 transition-colors'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="font-medium text-slate-900">{contact.lastName}</div>
                    {contact.fatherPhone && <div className="text-xs text-slate-500 mt-0.5">Père: {contact.fatherPhone}</div>}
                    {contact.motherPhone && <div className="text-xs text-slate-500 mt-0.5">Mère: {contact.motherPhone}</div>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {contact.children?.map((child, idx) => (
                      <div key={idx} className={idx > 0 ? "mt-2" : ""}>
                        {child.firstName}
                        <div className="text-xs text-slate-500">{child.birthDate && !isNaN(new Date(child.birthDate).getTime()) ? format(new Date(child.birthDate), 'dd/MM/yyyy') : 'N/A'}</div>
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {contact.children?.map((child, idx) => (
                      <div key={idx} className={idx > 0 ? "mt-2" : ""}>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {child.requestedLevel?.split(' ')[0] || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    <div>{contact.toDo}</div>
                    {contact.appointmentDate && !isNaN(new Date(contact.appointmentDate).getTime()) && (
                      <div className="text-xs text-indigo-600 font-medium mt-0.5">
                        {format(new Date(contact.appointmentDate), 'dd/MM à HH:mm')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => onEdit(contact)} 
                        disabled={isConfirmed}
                        className={`flex items-center p-1.5 rounded transition-colors ${isConfirmed ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} 
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setContactToDelete(contact.id!)} 
                        disabled={isConfirmed}
                        className={`flex items-center p-1.5 rounded transition-colors ${isConfirmed ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`} 
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {contactToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Voulez-vous vraiment supprimer définitivement ce contact ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setContactToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                ANNULER
              </button>
              <button
                onClick={() => {
                  onDelete(contactToDelete);
                  setContactToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium"
              >
                CONFIRMER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
