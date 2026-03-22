import { Contact } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users } from 'lucide-react';

interface DashboardProps {
  contacts: Contact[];
}

export function Dashboard({ contacts }: DashboardProps) {
  const totalRequests = contacts.length;

  // Statut data
  const statusData = [
    { name: 'Prospect', value: contacts.filter(c => c.status === 'Prospect').length },
    { name: 'Converti', value: contacts.filter(c => c.status === 'Converti').length },
    { name: 'Non-converti', value: contacts.filter(c => c.status === 'Non-converti').length },
  ].filter(d => d.value > 0);

  const STATUS_COLORS = {
    'Prospect': '#3B82F6', // blue-500
    'Converti': '#10B981', // emerald-500
    'Non-converti': '#64748B', // slate-500
  };

  // Canal data
  const channelData = [
    { name: 'Téléphone', value: contacts.filter(c => c.channel === 'téléphone').length },
    { name: 'Message', value: contacts.filter(c => c.channel === 'message').length },
    { name: 'Rencontre', value: contacts.filter(c => c.channel === 'rencontre').length },
  ].filter(d => d.value > 0);

  const CHANNEL_COLORS = {
    'Téléphone': '#6CAB65', // green
    'Message': '#6CABC6', // cyan
    'Rencontre': '#E9454C', // red
  };

  // Source data
  const sourceData = [
    { name: 'Facebook', value: contacts.filter(c => c.source === 'Facebook').length },
    { name: 'Instagram', value: contacts.filter(c => c.source === 'Instagram').length },
    { name: 'Radio', value: contacts.filter(c => c.source === 'Radio').length },
    { name: 'Mall of Sousse', value: contacts.filter(c => c.source === 'Mall of Sousse').length },
    { name: 'Parrainage', value: contacts.filter(c => c.source === 'Parrainage').length },
    { name: 'Site web', value: contacts.filter(c => c.source === 'Site web').length },
    { name: 'Affichage', value: contacts.filter(c => c.source === 'Affichage').length },
    { name: 'JPO', value: contacts.filter(c => c.source === 'JPO').length },
    { name: 'Bouche à oreille', value: contacts.filter(c => c.source === 'Bouche à oreille').length },
  ].filter(d => d.value > 0);

  const SOURCE_COLORS = [
    '#2C337B', '#E9454C', '#F6A650', '#6CAB65', '#6CABC6', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="mb-8">
      {/* Total Requests Card */}
      <div className="bg-white rounded-xl shadow-sm border-l-4 border-[#2C337B] p-6 flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total des demandes</p>
          <p className="text-4xl font-bold text-slate-900">{totalRequests}</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 text-[#2C337B]">
          <Users className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statut Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Répartition par Statut</h3>
        <div className="w-full h-64">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} demande(s)`, 'Total']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Canal Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Répartition par Canal</h3>
        <div className="w-full h-64">
          {channelData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.name as keyof typeof CHANNEL_COLORS]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} demande(s)`, 'Total']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Source Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Répartition par Source</h3>
        <div className="w-full h-64">
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} demande(s)`, 'Total']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">Aucune donnée</div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
