import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Plus, Search, MoreVertical, X, User } from 'lucide-react';
import { format } from 'date-fns';

const Patients = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    contactNumber: '',
    email: user.role === 'patient' ? user.email : '',
    address: '',
    medicalHistory: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter if it's a patient user, they only see their own records matching email.
      if (user.role === 'patient') {
        setPatients(res.data.filter(p => p.email === user.email));
      } else {
        setPatients(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch patients', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/patients', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchPatients();
      setFormData({
        firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', 
        contactNumber: '', email: user.role === 'patient' ? user.email : '', address: '', medicalHistory: ''
      });
    } catch (error) {
      console.error('Failed to create patient', error);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contactNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user.role === 'patient' ? 'My Health Records' : 'Patient Directory'}</h1>
          <p className="text-slate-500 mt-1">Manage personal profiles and medical history.</p>
        </div>
        {(user.role === 'admin' || user.role === 'receptionist' || user.role === 'patient') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center transition-all shadow-md transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            {user.role === 'patient' ? 'Add My Details' : 'New Patient'}
          </button>
        )}
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
                placeholder="Search patients by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-bold uppercase tracking-wider">Patient Details</th>
                <th className="p-4 font-bold uppercase tracking-wider">Age & Gender</th>
                <th className="p-4 font-bold uppercase tracking-wider">Contact Info</th>
                <th className="p-4 font-bold uppercase tracking-wider">Registered Date</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{patient.firstName} {patient.lastName}</div>
                          <div className="text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">ID: PT-{patient.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</div>
                      <div className="text-sm text-slate-500">{patient.gender}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      <div className="font-medium">{patient.contactNumber}</div>
                      <div className="text-sm text-slate-500">{patient.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-700 font-medium">{format(new Date(patient.createdAt), 'MMM dd, yyyy')}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <User className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium">No patient records found.</p>
                      <p className="text-sm mt-1">Click the "Add" button to create a new record.</p>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Patient Registration Form</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 bg-white p-1 rounded-md shadow-sm border border-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="patient-form" onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                    <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                    <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" required value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Contact Number</label>
                    <input type="tel" required value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" readOnly={user.role === 'patient'} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${user.role === 'patient' ? 'bg-slate-200' : 'bg-slate-50'}`} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                    <textarea rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"></textarea>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Medical History (Optional)</label>
                    <textarea rows="3" value={formData.medicalHistory} onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm rounded-xl font-bold transition-colors">
                Cancel
              </button>
              <button type="submit" form="patient-form" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 shadow-md text-white rounded-xl font-bold transition-all transform hover:-translate-y-0.5">
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
