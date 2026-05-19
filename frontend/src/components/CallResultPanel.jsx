import { X, CheckCircle, XCircle, Clock, Phone, DollarSign, User, Calendar, RotateCcw } from 'lucide-react';

const statusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-600';
  const s = status.toLowerCase();
  if (s === 'qualified' || s === 'yes' || s === 'true') return 'bg-green-100 text-green-700';
  if (s === 'disqualified' || s === 'no' || s === 'false' || s === 'not interested') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="p-1.5 bg-gray-100 rounded-md mt-0.5">
        <Icon size={14} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-700 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
};

export default function CallResultPanel({ lead, onClose }) {
  if (!lead) return null;

  const qualStatus = lead.qualification_status;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Call Results</h2>
            <p className="text-sm text-gray-500">{lead.name} · {lead.company}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusColor(qualStatus)}`}>
              {qualStatus?.toLowerCase() === 'qualified' || qualStatus?.toLowerCase() === 'yes'
                ? <CheckCircle size={14} />
                : qualStatus?.toLowerCase() === 'disqualified' || qualStatus?.toLowerCase() === 'no'
                ? <XCircle size={14} />
                : <Clock size={14} />}
              {qualStatus || 'Pending Analysis'}
            </span>
            {lead.call_duration && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Phone size={12} />
                {Math.round(lead.call_duration)}s
              </span>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">BANT Qualification</p>
            <InfoRow icon={DollarSign} label="Budget Range" value={lead.budget_range} />
            <InfoRow icon={User} label="Decision Maker" value={lead.is_decision_maker} />
            <InfoRow icon={Calendar} label="Timeline" value={lead.timeline} />
            <InfoRow icon={RotateCcw} label="Follow-Up Requested" value={lead.follow_up_requested} />
          </div>

          {lead.call_summary && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Call Summary</p>
              <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-xl p-4 leading-relaxed">
                {lead.call_summary}
              </p>
            </div>
          )}

          {lead.transcript && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Transcript</p>
              <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                  {lead.transcript}
                </pre>
              </div>
            </div>
          )}

          {!lead.qualification_status && !lead.call_summary && (
            <div className="text-center py-6 text-gray-400">
              <Clock size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Call results will appear here once the conversation is complete.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
