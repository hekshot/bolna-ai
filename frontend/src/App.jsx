import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Bot, Zap, Wifi } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import StatsBar from './components/StatsBar';
import LeadTable from './components/LeadTable';
import AddLeadModal from './components/AddLeadModal';
import CallResultPanel from './components/CallResultPanel';
import { getLeads, createLead, deleteLead, triggerCall, getStats } from './api';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [callingId, setCallingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [leadsData, statsData] = await Promise.all([getLeads(), getStats()]);
      setLeads(leadsData);
      setStats(statsData);
    } catch {
      toast.error('Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 8000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleAddLead = async (formData) => {
    const newLead = await createLead(formData);
    setLeads(prev => [newLead, ...prev]);
    await fetchAll();
    toast.success(`Lead "${newLead.name}" added`, { icon: '🎯' });
  };

  const handleCall = async (id) => {
    setCallingId(id);
    try {
      const updated = await triggerCall(id);
      setLeads(prev => prev.map(l => l.id === id ? updated : l));
      toast.success('Call triggered! Alex is dialing...', { icon: '📞' });
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to trigger call');
    } finally {
      setCallingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    await getStats().then(setStats);
    toast('Lead deleted', { icon: '🗑️' });
  };

  return (
    <div className="min-h-screen grid-bg">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' },
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06]" style={{ background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30">
                <Bot size={20} className="text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080b14] animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Bolna Lead Qualifier</h1>
              <p className="text-[11px] text-slate-600 flex items-center gap-1">
                <Wifi size={9} /> AI Voice Agent · BANT Qualification
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={fetchAll}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-white/5 border border-white/5 transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Plus size={15} />
              Add Lead
            </motion.button>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 mb-6 flex items-start gap-4 border-indigo-500/10"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))' }}
        >
          <div className="p-2 rounded-xl bg-indigo-500/20 mt-0.5 flex-shrink-0">
            <Zap size={16} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-white">AI-Powered BANT Qualification</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Add a lead → click <span className="text-emerald-400 font-medium">Call</span> → Alex (Bolna Voice AI) dials them → qualifies on Budget, Authority, Need & Timeline → webhook updates dashboard automatically.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0 text-xs">
            {[['B', 'Budget', 'emerald'], ['A', 'Authority', 'indigo'], ['N', 'Need', 'amber'], ['T', 'Timeline', 'violet']].map(([l, label, c]) => (
              <div key={l} className="text-center">
                <div className={`w-7 h-7 rounded-lg bg-${c}-500/20 text-${c}-400 flex items-center justify-center font-bold text-sm mb-1`}>{l}</div>
                <span className="text-slate-700 text-[9px] uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lead Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Leads</h2>
              {leads.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">{leads.length}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-refreshes every 8s
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-indigo-500/50" />
                <p className="text-sm text-slate-600">Loading leads...</p>
              </motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LeadTable
                  leads={leads}
                  onCall={handleCall}
                  onDelete={handleDelete}
                  onView={setSelectedLead}
                  callingId={callingId}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onAdd={handleAddLead} />}
      {selectedLead && <CallResultPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
