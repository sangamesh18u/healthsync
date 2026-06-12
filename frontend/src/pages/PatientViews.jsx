import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FileText, CreditCard, Calendar, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

// Patient-specific views that fetch their own data
const MyRecords = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = Cookies.get('token');
        const h = { Authorization: `Bearer ${token}` };
        const pRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patients`, { headers: h });
        const me = pRes.data.find(p => p.email === user.email);
        if (me) {
          const rRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/records/patient/${me.id}`, { headers: h });
          setRecords(rRes.data);
        }
      } catch { }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="h-6 w-6 text-blue-600" /> My Medical Records</h1>
        <p className="text-slate-500 mt-1">Your personal health history — visits, diagnoses, and prescriptions.</p>
      </div>
      {loading ? <p className="text-center text-slate-500 py-8">Loading...</p> : records.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 p-16 text-center">
          <ClipboardList className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-500">No records yet</p>
          <p className="text-slate-400 mt-2">Your doctor will add records after each visit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(r => (
            <div key={r.id} className="bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{r.diagnosis}</p>
                  <p className="text-sm text-slate-500 mt-1">Visit on {format(new Date(r.visitDate), 'MMMM dd, yyyy')} · {r.doctor ? `Dr. ${r.doctor.name}` : 'Unknown Doctor'}</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Medical Record</span>
              </div>
              {r.prescription && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Prescription</p>
                  <p className="text-sm text-amber-900">{r.prescription}</p>
                </div>
              )}
              {r.labResults && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Lab Results</p>
                  <p className="text-sm text-emerald-900">{r.labResults}</p>
                </div>
              )}
              {r.notes && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Doctor's Notes</p>
                  <p className="text-sm text-slate-700">{r.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MyBills = ({ user }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = Cookies.get('token');
        const h = { Authorization: `Bearer ${token}` };
        const [pRes, bRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patients`, { headers: h }),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/billing`, { headers: h }),
        ]);
        const me = pRes.data.find(p => p.email === user.email);
        if (me) setBills(bRes.data.filter(b => b.patientId === me.id));
      } catch { }
      setLoading(false);
    };
    fetch();
  }, []);

  const statusStyle = {
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Unpaid: 'bg-red-50 text-red-700 border-red-200',
    Partial: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CreditCard className="h-6 w-6 text-emerald-600" /> My Bills</h1>
        <p className="text-slate-500 mt-1">View your invoices and payment history.</p>
      </div>
      {loading ? <p className="text-center text-slate-500 py-8">Loading...</p> : bills.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 p-16 text-center">
          <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-500">No bills yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map(b => (
            <div key={b.id} className="bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <p className="font-bold text-slate-900">Bill for {format(new Date(b.visitDate), 'MMMM dd, yyyy')}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{b.doctor ? `Consulting Dr. ${b.doctor.name}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle[b.status]}`}>{b.status}</span>
                  <p className="text-2xl font-black text-slate-900">₹{parseFloat(b.totalAmount).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[['Consultation', b.consultationFee], ['Medication', b.medicationFee], ['Laboratory', b.labFee], ['Other', b.otherFee]].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">₹{parseFloat(val || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {b.status !== 'Paid' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-600 flex items-center gap-2">
                  <span>Balance Due: ₹{(parseFloat(b.totalAmount) - parseFloat(b.paidAmount)).toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecords;
