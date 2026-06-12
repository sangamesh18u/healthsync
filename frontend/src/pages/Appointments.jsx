import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Plus, Search, Calendar as CalendarIcon, Clock, X, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

const Appointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: user.role === 'doctor' ? user.id : '',
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (user.role === 'patient') {
        const myProfile = res.data.find(p => p.email === user.email);
        setPatients(myProfile ? [myProfile] : []);
        if (myProfile) {
          setFormData(prev => ({ ...prev, patientId: myProfile.id }));
        }
      } else {
        setPatients(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch patients', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Prevent booking if patient profile is missing
    if (user.role === 'patient' && patients.length === 0) {
      setErrorMsg('You must create a profile in "My Records" first.');
      return;
    }

    try {
      const token = Cookies.get('token');
      const payload = { ...formData };
      if (!payload.doctorId) {
        payload.doctorId = null; // Set to null if empty to avoid DB foreign key errors
      }
      if (!payload.patientId) {
        setErrorMsg('Please select a patient.');
        return;
      }

      await axios.post('http://localhost:5000/api/appointments', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchAppointments();
      setFormData({
        patientId: user.role === 'patient' && patients.length > 0 ? patients[0].id : '', 
        doctorId: user.role === 'doctor' ? user.id : '', 
        date: '', time: '', reason: ''
      });
    } catch (error) {
      console.error('Failed to create appointment', error);
      setErrorMsg(error.response?.data?.message || 'Failed to book appointment. Check details.');
    }
  };

  // Only show relevant appointments based on role
  let displayAppointments = appointments;
  if (user.role === 'doctor') {
    displayAppointments = appointments.filter(a => a.doctorId === user.id);
  } else if (user.role === 'patient') {
    // patient views their own appointments based on email link
    const myProfile = patients.find(p => p.email === user.email);
    if (myProfile) {
      displayAppointments = appointments.filter(a => a.patientId === myProfile.id);
    } else {
      displayAppointments = [];
    }
  }

  const filteredAppointments = displayAppointments.filter(a => 
    a.Patient && `${a.Patient.firstName} ${a.Patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments Schedule</h1>
          <p className="text-slate-500 mt-1">Book and manage clinic visits efficiently.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center transition-all shadow-md transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Book Appointment
        </button>
      </div>

      <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        {user.role !== 'patient' && (
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-bold uppercase tracking-wider">Patient</th>
                <th className="p-4 font-bold uppercase tracking-wider">Doctor</th>
                <th className="p-4 font-bold uppercase tracking-wider">Date & Time</th>
                <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center mr-3 text-slate-500">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-900">
                          {apt.Patient ? `${apt.Patient.firstName} ${apt.Patient.lastName}` : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                        {apt.doctor ? `Dr. ${apt.doctor.name}` : 'Not assigned'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-slate-800 font-bold mb-1">
                        <CalendarIcon className="h-4 w-4 mr-2 text-emerald-600" />
                        {format(new Date(apt.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-slate-500 text-sm font-medium">
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        {apt.time}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        apt.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium max-w-xs truncate">
                      {apt.reason || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <CalendarIcon className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium">No appointments found.</p>
                      {user.role === 'patient' && patients.length === 0 && (
                         <p className="text-sm mt-1 text-red-500">Please create your patient profile first in "My Records" to book an appointment.</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Book New Appointment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 bg-white p-1 rounded-md shadow-sm border border-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              <form id="appointment-form" onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Patient</label>
                  <select required value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm">
                    {user.role !== 'patient' && <option value="">-- Choose Patient --</option>}
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                    ))}
                  </select>
                </div>
                {user.role !== 'doctor' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Doctor ID</label>
                    <input type="number" required placeholder="Enter Doctor User ID (e.g. 1)" value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                    <input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Visit</label>
                  <textarea rows="3" required placeholder="Describe symptoms or reason..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm rounded-xl font-bold transition-colors">
                Cancel
              </button>
              <button type="submit" form="appointment-form" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 shadow-md text-white rounded-xl font-bold transition-all transform hover:-translate-y-0.5">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
