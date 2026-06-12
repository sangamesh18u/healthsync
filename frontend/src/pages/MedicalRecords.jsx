import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Plus, X, ClipboardList, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';

const MedicalRecords = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patientId: '', doctorId: user.role === 'doctor' ? user.id : '',
    visitDate: '', diagnosis: '', prescription: '', labResults: '', notes: ''
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };
    const [recs, pts, docs] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/records`, { headers }),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patients`, { headers }),
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/staff/doctors`, { headers }),
    ]);
    setRecords(recs.data);
    setPatients(pts.data);
    setDoctors(docs.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = Cookies.get('token');
      const payload = { ...form };
      if (!payload.doctorId) payload.doctorId = null;
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/records`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false);
      fetchAll();
      setForm({ patientId: '', doctorId: user.role === 'doctor' ? user.id : '', visitDate: '', diagnosis: '', prescription: '', labResults: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    const token = Cookies.get('token');
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/records/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const filtered = records.filter(r => {
    if (!searchTerm) return true;
    const name = r.Patient ? `${r.Patient.firstName} ${r.Patient.lastName}`.toLowerCase() : '';
    return name.includes(searchTerm.toLowerCase()) || r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="h-6 w-6 text-blue-600" /> Medical Records</h1>
          <p className="text-slate-500 mt-1">Diagnoses, prescriptions, and lab results all in one place.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5">
          <Plus className="h-5 w-5" /> Add Record
        </button>
      </div>

      <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <input
            type="text" placeholder="Search by patient or diagnosis..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-bold">Patient</th>
                <th className="p-4 font-bold">Visit Date</th>
                <th className="p-4 font-bold">Diagnosis</th>
                <th className="p-4 font-bold">Doctor</th>
                <th className="p-4 font-bold">Lab Results</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{r.Patient ? `${r.Patient.firstName} ${r.Patient.lastName}` : '—'}</td>
                  <td className="p-4 text-slate-600 font-medium">{format(new Date(r.visitDate), 'MMM dd, yyyy')}</td>
                  <td className="p-4 text-slate-700 max-w-xs">
                    <p className="font-semibold truncate">{r.diagnosis}</p>
                    {r.prescription && <p className="text-xs text-slate-500 mt-0.5 truncate">Rx: {r.prescription}</p>}
                  </td>
                  <td className="p-4 text-slate-600">{r.doctor ? `Dr. ${r.doctor.name}` : '—'}</td>
                  <td className="p-4">
                    {r.labResults ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">Available</span>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No medical records found.</p>
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
              <h2 className="text-lg font-bold">Add Medical Record</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form id="rec-form" onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Patient</label>
                  <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">-- Select --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Doctor</label>
                  <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">-- Unassigned --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Visit Date</label>
                  <input required type="date" value={form.visitDate} onChange={e => setForm({...form, visitDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Diagnosis</label>
                <textarea required rows="2" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Enter diagnosis details..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Prescription</label>
                <textarea rows="2" value={form.prescription} onChange={e => setForm({...form, prescription: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Medications prescribed..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Lab Results</label>
                <textarea rows="2" value={form.labResults} onChange={e => setForm({...form, labResults: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Lab test findings..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                <textarea rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Additional notes..."></textarea>
              </div>
            </form>
            <div className="p-5 border-t flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" form="rec-form" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md">Save Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
