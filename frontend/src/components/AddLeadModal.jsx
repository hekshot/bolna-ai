import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';

const defaultForm = { name: '', phone: '', company: '', email: '', deal_size: '' };

const FIELDS = [
  { label: 'Full Name', name: 'name',      type: 'text',  placeholder: 'Rahul Sharma',       required: true  },
  { label: 'Phone Number', name: 'phone',  type: 'tel',   placeholder: '+919876543210',       required: true  },
  { label: 'Company', name: 'company',     type: 'text',  placeholder: 'Acme Corp',           required: true  },
  { label: 'Email', name: 'email',         type: 'email', placeholder: 'rahul@acme.com',      required: false },
  { label: 'Est. Deal Size', name: 'deal_size', type: 'text', placeholder: '₹5L–10L / year', required: false },
];

export default function AddLeadModal({ onClose, onAdd }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.company) {
      setError('Name, phone, and company are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onAdd(form);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to add lead.');
    } finally {
      setLoading(false);
    }
  };

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
          className="glass rounded-2xl w-full max-w-md glow-indigo overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20">
                <UserPlus size={16} className="text-indigo-400" />
              </div>
              <h2 className="text-base font-semibold text-white">Add New Lead</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-300"
            >
              <X size={16} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-2.5 text-sm"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(({ label, name, type, placeholder, required }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={name === 'name' || name === 'phone' ? 'col-span-2' : name === 'company' ? 'col-span-2' : ''}
                >
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                    {label} {required && <span className="text-indigo-400">*</span>}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/10 transition-all"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {loading ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : <><UserPlus size={14} /> Add Lead</>}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
