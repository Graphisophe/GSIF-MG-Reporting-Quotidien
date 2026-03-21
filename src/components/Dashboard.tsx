import { Contact } from '../types';
import { Users, Phone, MessageSquare, Calendar, Eye, FileText } from 'lucide-react';

interface DashboardProps {
  contacts: Contact[];
}

export function Dashboard({ contacts }: DashboardProps) {
  const totalRequests = contacts.length;
  const calls = contacts.filter(c => c.channel === 'téléphone').length;
  const messages = contacts.filter(c => c.channel === 'message').length;
  const appointments = contacts.filter(c => c.actionTaken === 'rendez-vous fixé').length;
  const visits = contacts.filter(c => c.channel === 'rencontre').length;
  const advancedFiles = contacts.filter(c => c.actionTaken === 'dossier envoyé' || c.actionTaken === 'rendez-vous fixé').length;

  const cards = [
    { title: 'Total demandes', value: totalRequests, icon: Users, color: 'bg-blue-50 text-[#2C337B]', border: 'border-[#2C337B]' },
    { title: 'Appels', value: calls, icon: Phone, color: 'bg-green-50 text-[#6CAB65]', border: 'border-[#6CAB65]' },
    { title: 'Messages', value: messages, icon: MessageSquare, color: 'bg-cyan-50 text-[#6CABC6]', border: 'border-[#6CABC6]' },
    { title: 'Rendez-vous', value: appointments, icon: Calendar, color: 'bg-orange-50 text-[#F6A650]', border: 'border-[#F6A650]' },
    { title: 'Rencontres', value: visits, icon: Eye, color: 'bg-red-50 text-[#E9454C]', border: 'border-[#E9454C]' },
    { title: 'Dossiers avancés', value: advancedFiles, icon: FileText, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`bg-white rounded-xl shadow-sm border-l-4 ${card.border} p-4 flex flex-col justify-between`}>
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
              <div className={`p-1.5 rounded-lg ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
