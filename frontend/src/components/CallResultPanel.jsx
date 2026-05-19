import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Clock, Phone, DollarSign, User, Calendar, RotateCcw, FileText, MessageSquare } from 'lucide-react';

const isQualified = (s) => s && ['qualified','yes','true'].includes(s.toLowerCase());
const isDisqualified = (s) => s && ['disqualified','no','false','not interested'].includes(s.toLowerCase());

const BANT = [
  { key: 'budget_range',       label: 'Budget',         icon: DollarSign,   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'is_decision_maker',  label: 'Decision Maker', icon: User,         color: 'text-indigo-400',  bg: 'bg-indigo-500/10'  },
  { key: 'timeline',           label: 'Timeline',       icon: Calendar,     color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  { key: 'follow_up_requested',label: 'Follow-Up',      icon: RotateCcw,    color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
];

export default function CallResultPanel({ lead, onClose }) {
  if (!lead) return null;
  const qualStatus = lead.qualification_status;
  const qualified = isQualified(qualStatus);
  const disqualified = isDisqualified(qualStatus);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col ${qualified ? 'glow-green' : disqualified ? 'glow-red' : 'glow-indigo'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${qualified ? 'bg-emerald-500/20' : disqualified ? 'bg-rose-500/20' : 'bg-slate-500/20'}`}>
                {qualified ? <CheckCircle size={16} className="text-emerald-400" />
                  : disqualified ? <XCircle size={16} className="text-rose-400" />
                  : <Clock size={16} className="text-slate-400" />}
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Call Results</h2>
                <p className="text-xs text-slate-500">{lead.name} · {lead.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lead.call_duration && (
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <Phone size={10} /> {Math.round(lead.call_duration)}s
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {/* Qualification badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
                qualified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : disqualified ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-slate-500/10 border-slate-500/30 text-slate-300'
              }`}
            >
              {qualified ? <CheckCircle size={14} /> : disqualified ? <XCircle size={14} /> : <Clock size={14} />}
              {qualStatus || 'Pending Analysis'}
            </motion.div>

            {/* BANT Cards */}
            <div>
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-3">BANT Qualification</p>
              <div className="grid grid-cols-2 gap-2">
                {BANT.map(({ key, label, icon: Icon, color, bg }, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`rounded-xl p-3 border border-white/5 ${bg}`}
                  >
                    <div className={`flex items-center gap-1.5 mb-1.5 ${color}`}>
                      <Icon size={11} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium">{lead[key] || <span className="text-slate-600 italic text-xs">Not captured</span>}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {lead.call_summary && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText size={10} /> Call Summary
                </p>
                <p className="text-sm text-slate-300 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 leading-relaxed">
                  {lead.call_summary}
                </p>
              </motion.div>
            )}

            {/* Transcript */}
            {lead.transcript && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MessageSquare size={10} /> Transcript
                </p>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 max-h-44 overflow-y-auto">
                  <pre className="text-xs text-slate-500 whitespace-pre-wrap font-mono leading-relaxed">
                    {lead.transcript}
                  </pre>
                </div>
              </motion.div>
            )}

            {!lead.qualification_status && !lead.call_summary && (
              <div className="text-center py-8">
                <Clock size={28} className="mx-auto mb-2 text-slate-700" />
                <p className="text-sm text-slate-600">Results will appear once the call completes.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
