import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Trash2, Eye, Loader2, CheckCircle, XCircle, Clock, Sparkles, Building2, DollarSign } from 'lucide-react';

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      class: 'bg-slate-800 text-slate-300 border-slate-700',          icon: Clock,        dot: 'bg-slate-400' },
  calling:      { label: 'Live Call',    class: 'bg-amber-950 text-amber-300 border-amber-800',           icon: Loader2,      dot: 'bg-amber-400 animate-pulse' },
  qualified:    { label: 'Qualified',    class: 'bg-emerald-950 text-emerald-300 border-emerald-800',     icon: CheckCircle,  dot: 'bg-emerald-400' },
  disqualified: { label: 'Disqualified', class: 'bg-rose-950 text-rose-300 border-rose-900',              icon: XCircle,      dot: 'bg-rose-400' },
  completed:    { label: 'Completed',    class: 'bg-indigo-950 text-indigo-300 border-indigo-800',        icon: CheckCircle,  dot: 'bg-indigo-400' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon size={10} className={status === 'calling' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
};

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const AVATAR_COLORS = [
  'from-indigo-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

export default function LeadTable({ leads, onCall, onDelete, onView, callingId }) {
  if (leads.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} className="text-indigo-400" />
        </div>
        <p className="text-slate-300 font-semibold text-base">No leads yet</p>
        <p className="text-slate-600 text-sm mt-1">Click "Add Lead" to start qualifying</p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-3 px-4 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Lead</th>
            <th className="text-left py-3 px-4 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Company</th>
            <th className="text-left py-3 px-4 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Deal Size</th>
            <th className="text-left py-3 px-4 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Status</th>
            <th className="text-right py-3 px-4 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {leads.map((lead, index) => {
              const isCalling = callingId === lead.id || lead.status === 'calling';
              const hasResults = lead.qualification_status || lead.call_summary;
              const avatarColor = AVATAR_COLORS[lead.id % AVATAR_COLORS.length];

              return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {getInitials(lead.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{lead.name}</p>
                        <p className="text-xs text-slate-600">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Building2 size={12} className="text-slate-600" />
                      {lead.company}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {lead.deal_size ? (
                      <div className="flex items-center gap-1 text-slate-400">
                        <DollarSign size={11} className="text-slate-600" />
                        {lead.deal_size}
                      </div>
                    ) : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {hasResults && (
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => onView(lead)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                          title="View results"
                        >
                          <Eye size={14} />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onCall(lead.id)}
                        disabled={isCalling}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Trigger call"
                      >
                        {isCalling ? <Loader2 size={14} className="animate-spin" /> : <Phone size={14} />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(lead.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete lead"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
