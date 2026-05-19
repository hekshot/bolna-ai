import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Bot, Zap } from 'lucide-react';
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
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [leadsData, statsData] = await Promise.all([getLeads(), getStats()]);
      setLeads(leadsData);
      setStats(statsData);
    } catch {
      showToast('Failed to load data. Is the backend running?', 'error');
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
    showToast(`Lead "${newLead.name}" added successfully`);
  };

  const handleCall = async (id) => {
    setCallingId(id);
    try {
      const updated = await triggerCall(id);
      setLeads(prev => prev.map(l => l.id === id ? updated : l));
      showToast('Call triggered! Bolna agent is dialing...');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to trigger call', 'error');
    } finally {
      setCallingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    await getStats().then(setStats);
    showToast('Lead deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bolna Lead Qualifier</h1>
              <p className="text-xs text-gray-400">AI Voice Agent for B2B Sales Qualification</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Lead
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Use Case Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 mb-6 text-white flex items-start gap-4">
          <div className="p-2 bg-white/20 rounded-xl mt-0.5">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-base">AI-Powered BANT Qualification</h3>
            <p className="text-sm text-blue-100 mt-1">
              Add a lead and click <strong>Call</strong> — the Bolna Voice AI agent will call them, qualify on Budget, Authority, Need & Timeline, and update the dashboard automatically via webhook.
            </p>
          </div>
        </div>

        {/* Lead Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-800">
              Leads {leads.length > 0 && <span className="text-gray-400 font-normal ml-1">({leads.length})</span>}
            </h2>
            <p className="text-xs text-gray-400">Auto-refreshes every 8s</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <RefreshCw size={28} className="animate-spin mx-auto mb-2 opacity-40" />
              <p className="text-sm">Loading leads...</p>
            </div>
          ) : (
            <LeadTable
              leads={leads}
              onCall={handleCall}
              onDelete={handleDelete}
              onView={setSelectedLead}
              callingId={callingId}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onAdd={handleAddLead} />}
      {selectedLead && <CallResultPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-gray-800'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
