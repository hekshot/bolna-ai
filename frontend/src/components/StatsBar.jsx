import { Users, Phone, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function StatsBar({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <StatCard icon={Users} label="Total Leads" value={stats.total_leads} color="bg-blue-500" />
      <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-gray-400" />
      <StatCard icon={Phone} label="Calling" value={stats.calling} color="bg-yellow-500" />
      <StatCard icon={CheckCircle} label="Qualified" value={stats.qualified} color="bg-green-500" />
      <StatCard icon={XCircle} label="Disqualified" value={stats.disqualified} color="bg-red-400" />
      <StatCard icon={TrendingUp} label="Qual. Rate" value={`${stats.qualification_rate}%`} color="bg-purple-500" />
    </div>
  );
}
