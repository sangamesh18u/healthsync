import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Plus, X, CreditCard, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Billing = ({ user }) => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patientId: '', doctorId: '', visitDate: '',
    consultationFee: '', medicationFee: '', labFee: '', otherFee: '',
    paidAmount: '', notes: ''
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const token = Cookies.get('token');
    const h = { Authorization: `Bearer ${token}` };
    const [b, p, d] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing`, { headers: h }),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patients`, { headers: h }),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/staff/doctors`, { headers: h }),
    ]);
    setBills(b.data); setPatients(p.data); setDoctors(d.data);
  };

  const total = (f) => (parseFloat(f.consultationFee || 0) + parseFloat(f.medicationFee || 0) + parseFloat(f.labFee || 0) + parseFloat(f.otherFee || 0));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const token = Cookies.get('token');
      const t = total(form);
      const paid = parseFloat(form.paidAmount || 0);
      const status = paid >= t ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
      const payload = { ...form, totalAmount: t, paidAmount: paid, status, doctorId: form.doctorId || null };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false); fetchAll();
      setForm({ patientId: '', doctorId: '', visitDate: '', consultationFee: '', medicationFee: '', labFee: '', otherFee: '', paidAmount: '', notes: '' });
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const markPaid = async (bill) => {
    const token = Cookies.get('token');
    await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing/${bill.id}`, { ...bill, paidAmount: bill.totalAmount, status: 'Paid' }, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete bill?')) return;
    const token = Cookies.get('token');
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  // Revenue stats
  const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.paidAmount, 0);
  const outstanding = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);

  const statusStyle = {
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Unpaid: 'bg-red-50 text-red-700 border-red-200',
    Partial: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CreditCard className="h-6 w-6 text-emerald-600" /> Billing & Invoicing</h1>
          <p className="text-slate-500 mt-1">Generate itemized bills, track payments, and revenue.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5">
          <Plus className="h-5 w-5" /> Create Bill
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Bills</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{bills.length}</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Total Revenue Collected</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-500 uppercase tracking-wider">Outstanding Amount</p>
          <p className="text-3xl font-black text-red-600 mt-1">₹{outstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-bold">Patient</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Total Amount</th>
                <th className="p-4 font-bold">Paid</th>
                <th className="p-4 font-bold">Balance</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.length > 0 ? bills.map(b => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{b.Patient ? `${b.Patient.firstName} ${b.Patient.lastName}` : '—'}</td>
                  <td className="p-4 text-slate-600">{format(new Date(b.visitDate), 'MMM dd, yyyy')}</td>
                  <td className="p-4 font-bold text-slate-900">₹{parseFloat(b.totalAmount).toLocaleString()}</td>
                  <td className="p-4 font-semibold text-emerald-700">₹{parseFloat(b.paidAmount).toLocaleString()}</td>
                  <td className="p-4 font-semibold text-red-600">₹{(parseFloat(b.totalAmount) - parseFloat(b.paidAmount)).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="p-4 flex justify-end gap-1">
                    {b.status !== 'Paid' && (
                      <button onClick={() => markPaid(b)} title="Mark as Paid" className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(b.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No bills generated yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <h2 className="text-lg font-bold">Generate Bill</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form id="bill-form" onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Patient</label>
                  <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                    <option value="">-- Select --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Doctor</label>
                  <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                    <option value="">-- Unassigned --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Visit Date</label>
                  <input required type="date" value={form.visitDate} onChange={e => setForm({...form, visitDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-700 border-t pt-3">Itemized Fees (₹)</p>
              <div className="grid grid-cols-2 gap-4">
                {[['consultationFee','Consultation'], ['medicationFee','Medication'], ['labFee','Laboratory'], ['otherFee','Other']].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
                    <input type="number" min="0" step="0.01" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="0.00" />
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total Amount</span>
                <span className="text-xl font-black text-emerald-700">₹{total(form).toLocaleString()}</span>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
                <input type="number" min="0" step="0.01" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                <textarea rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Insurance, remarks..."></textarea>
              </div>
            </form>
            <div className="p-5 border-t flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" form="bill-form" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md">Generate Bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
