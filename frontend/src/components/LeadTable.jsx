import { Phone, Trash2, Eye, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      bg: 'bg-gray-100',   text: 'text-gray-600',   icon: Clock },
  calling:      { label: 'Calling...',   bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Loader2 },
  qualified:    { label: 'Qualified',    bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle },
  disqualified: { label: 'Disqualified', bg: 'bg-red-100',    text: 'text-red-600',    icon: XCircle },
  completed:    { label: 'Completed',    bg: 'bg-blue-100',   text: 'text-blue-700',   icon: CheckCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon size={11} className={status === 'calling' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
};

export default function LeadTable({ leads, onCall, onDelete, onView, callingId }) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-base font-medium">No leads yet</p>
        <p className="text-sm mt-1">Click "Add Lead" to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Lead</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Company</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Deal Size</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leads.map(lead => {
            const isCalling = callingId === lead.id || lead.status === 'calling';
            const hasResults = lead.qualification_status || lead.call_summary;

            return (
              <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                <td className="py-3 px-4">
                  <p className="font-semibold text-gray-800">{lead.name}</p>
                  <p className="text-xs text-gray-400">{lead.phone}</p>
                </td>
                <td className="py-3 px-4 text-gray-600">{lead.company}</td>
                <td className="py-3 px-4 text-gray-500">{lead.deal_size || '—'}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    {hasResults && (
                      <button
                        onClick={() => onView(lead)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                        title="View results"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => onCall(lead.id)}
                      disabled={isCalling}
                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Trigger call"
                    >
                      {isCalling ? <Loader2 size={15} className="animate-spin" /> : <Phone size={15} />}
                    </button>
                    <button
                      onClick={() => onDelete(lead.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      title="Delete lead"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
