import { motion } from 'framer-motion';
import { Users, Phone, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

const CARDS = [
  { key: 'total_leads',        label: 'Total Leads',   icon: Users,        color: 'from-indigo-500 to-blue-500',   glow: 'rgba(99,102,241,0.2)'  },
  { key: 'pending',            label: 'Pending',       icon: Clock,        color: 'from-slate-500 to-slate-400',   glow: 'rgba(148,163,184,0.2)' },
  { key: 'calling',            label: 'Live Calls',    icon: Phone,        color: 'from-amber-500 to-orange-500',  glow: 'rgba(245,158,11,0.2)'  },
  { key: 'qualified',          label: 'Qualified',     icon: CheckCircle,  color: 'from-emerald-500 to-green-400', glow: 'rgba(16,185,129,0.2)'  },
  { key: 'disqualified',       label: 'Disqualified',  icon: XCircle,      color: 'from-rose-500 to-red-400',      glow: 'rgba(244,63,94,0.2)'   },
  { key: 'qualification_rate', label: 'Qual. Rate',    icon: TrendingUp,   color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.2)'  },
];

const StatCard = ({ icon: Icon, label, value, color, glow, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
    className="glass glass-hover rounded-2xl p-4 flex items-center gap-3 cursor-default transition-all duration-300"
    style={{ boxShadow: `0 0 25px ${glow}` }}
  >
    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-lg flex-shrink-0`}>
      <Icon size={16} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest truncate">{label}</p>
      <p className="text-2xl font-bold text-white leading-tight">{value}</p>
    </div>
  </motion.div>
);

export default function StatsBar({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {CARDS.map((c, i) => (
        <StatCard
          key={c.key}
          icon={c.icon}
          label={c.label}
          value={c.key === 'qualification_rate' ? `${stats[c.key]}%` : stats[c.key]}
          color={c.color}
          glow={c.glow}
          index={i}
        />
      ))}
    </div>
  );
}
