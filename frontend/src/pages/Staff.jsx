import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Plus, X, UserCog, Trash2, Pencil, Shield } from 'lucide-react';

const ROLES = ['admin', 'doctor', 'nurse', 'receptionist'];
const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Dermatology', 'Radiology', 'Emergency'];
const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  doctor: 'bg-blue-100 text-blue-700 border-blue-200',
  nurse: 'bg-teal-100 text-teal-700 border-teal-200',
  receptionist: 'bg-purple-100 text-purple-700 border-purple-200',
  patient: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const Staff = ({ user }) => {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'doctor', department: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    const token = Cookies.get('token');
    const res = await axios.get('http://localhost:5000/api/staff', { headers: { Authorization: `Bearer ${token}` } });
    setStaff(res.data);
  };

  const openCreate = () => { setEditTarget(null); setForm({ name: '', email: '', password: '', role: 'doctor', department: '' }); setIsModalOpen(true); setError(''); };
  const openEdit = (s) => { setEditTarget(s); setForm({ name: s.name, email: s.email, password: '', role: s.role, department: s.department || '' }); setIsModalOpen(true); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = Cookies.get('token');
      const headers = { Authorization: `Bearer ${token}` };
      if (editTarget) {
        await axios.put(`http://localhost:5000/api/staff/${editTarget.id}`, form, { headers });
      } else {
        await axios.post('http://localhost:5000/api/staff', form, { headers });
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    const token = Cookies.get('token');
    await axios.delete(`http://localhost:5000/api/staff/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchStaff();
  };

  const filtered = filter === 'all' ? staff : staff.filter(s => s.role === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><UserCog className="h-6 w-6 text-blue-600" /> Staff & Department Management</h1>
          <p className="text-slate-500 mt-1">Manage doctors, nurses, and other hospital staff.</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5">
          <Plus className="h-5 w-5" /> Add Staff
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...ROLES].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border transition-all ${filter === r ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}>
            {r === 'all' ? 'All Staff' : r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(s => (
          <div key={s.id} className="bg-white/40 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{s.name}</p>
                  <p className="text-sm text-slate-500">{s.email}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${ROLE_COLORS[s.role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                <Shield className="h-3 w-3 inline mr-1" />{s.role}
              </span>
              {s.department && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold">{s.department}</span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 flex flex-col items-center text-slate-400">
            <UserCog className="h-16 w-16 text-slate-300 mb-3" />
            <p className="text-lg font-medium">No staff members found.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{editTarget ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dr. John Smith" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@hospital.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password {editTarget && <span className="text-slate-400 font-normal">(leave blank to keep current)</span>}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- None --</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md">{editTarget ? 'Save Changes' : 'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
