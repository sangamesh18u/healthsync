import { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Activity, FileText, User as UserIcon, CreditCard, ShieldPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { format, isToday, isAfter, startOfDay } from 'date-fns';

const Dashboard = ({ user }) => {
  const isPatient = user?.role === 'patient';
  
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [patientsRes, appointmentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/patients', { headers }),
          axios.get('http://localhost:5000/api/appointments', { headers })
        ]);
        
        setPatients(patientsRes.data);
        setAppointments(appointmentsRes.data);

        if (user?.role === 'patient') {
          const myProfile = patientsRes.data.find(p => p.email === user.email);
          if (myProfile) {
            try {
              const [recordsRes, billsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/records/patient/${myProfile.id}`, { headers }),
                axios.get('http://localhost:5000/api/billing', { headers })
              ]);
              setRecords(recordsRes.data);
              setBills(billsRes.data.filter(b => b.patientId === myProfile.id));
            } catch (err) {
              console.error('Failed fetching extended patient data', err);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Compute Data for Admin
  const totalPatients = patients.length;
  const todayAppointments = appointments.filter(a => isToday(new Date(a.date))).length;
  const pendingConsultations = appointments.filter(a => a.status === 'Scheduled').length;
  const recentPatients = [...patients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const upcomingAdminAppointments = [...appointments]
    .filter(a => a.status === 'Scheduled' && isAfter(new Date(a.date), startOfDay(new Date())) || isToday(new Date(a.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  // Compute Data for Patient
  const myProfile = patients.find(p => p.email === user?.email);
  const myAppointments = myProfile ? appointments.filter(a => a.patientId === myProfile.id) : [];
  const myUpcomingVisits = myAppointments.filter(a => a.status === 'Scheduled' && (isAfter(new Date(a.date), startOfDay(new Date())) || isToday(new Date(a.date))));
  const recentRecords = [...records].slice(0, 3);
  const pendingBills = bills.filter(b => b.status !== 'Paid');
  const recentBills = [...bills].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)).slice(0, 3);

  const adminStats = [
    { name: 'Total Patients', value: totalPatients.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Today Appointments', value: todayAppointments.toString(), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending Consultations', value: pendingConsultations.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Active Doctors', value: '4', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  const patientStats = [
    { name: 'Upcoming Visits', value: myUpcomingVisits.length.toString(), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Medical Records', value: records.length.toString(), icon: ShieldPlus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending Bills', value: pendingBills.length.toString(), icon: CreditCard, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const stats = isPatient ? patientStats : adminStats;

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium bg-white/40 backdrop-blur-md rounded-2xl">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-700 mt-2 text-lg font-medium">
          {isPatient ? 'Your comprehensive health portal. Access all your appointments, records, and bills below.' : 'Here is the overall summary of the hospital operations today.'}
        </p>
        {isPatient && !myProfile && (
          <div className="mt-4 p-4 bg-amber-100 border border-amber-300 rounded-xl text-amber-800 font-semibold">
            Please register your patient profile in the "Patients" tab to link your health records to this account!
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md border border-slate-100 p-6 flex items-center transform transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} mr-5`}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{stat.name}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
        {isPatient && (
          <Link to="/appointments" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md p-6 flex items-center justify-center transform transition-transform hover:-translate-y-1 hover:shadow-lg">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-90" />
              <p className="font-bold text-lg">Book Appointment</p>
            </div>
          </Link>
        )}
      </div>

      {/* Detailed Sections */}
      <div className={`grid grid-cols-1 gap-8 ${isPatient ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        
        {/* Column 1: Appointments */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md border border-slate-100 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600"/> {isPatient ? 'Next Appointments' : 'Upcoming'}</h2>
            <Link to="/appointments" className="text-sm text-blue-700 font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4 flex-1">
            {(isPatient ? myUpcomingVisits.slice(0, 4) : upcomingAdminAppointments).length > 0 ? (
              (isPatient ? myUpcomingVisits.slice(0, 4) : upcomingAdminAppointments).map(apt => (
                <div key={apt.id} className="p-4 bg-white/60 border border-slate-200 rounded-xl">
                  <p className="font-bold text-slate-900">{format(new Date(apt.date), 'MMM dd, yyyy')} at {apt.time}</p>
                  <p className="text-sm text-slate-600 font-medium mt-1">{isPatient ? `Dr. ${apt.doctor?.name || 'Unassigned'}` : `${apt.Patient?.firstName} ${apt.Patient?.lastName}`}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">{apt.status}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 font-medium italic">No upcoming appointments.</p>
            )}
          </div>
        </div>

        {/* Column 2: Patient Specific (Records) or Admin Specific (Recent Patients) */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md border border-slate-100 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {isPatient ? <><ShieldPlus className="h-5 w-5 text-emerald-600"/> Latest Records</> : <><UserIcon className="h-5 w-5 text-blue-600"/> Recent Patients</>}
            </h2>
            <Link to={isPatient ? '/my-records' : '/patients'} className="text-sm text-blue-700 font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4 flex-1">
            {isPatient ? (
              recentRecords.length > 0 ? (
                recentRecords.map(r => (
                  <div key={r.id} className="p-4 bg-white/60 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-900 truncate">{r.diagnosis}</p>
                    <p className="text-sm text-slate-600 font-medium mt-1">Visit: {format(new Date(r.visitDate), 'MMM dd, yyyy')}</p>
                    {r.prescription && <p className="text-xs text-slate-500 mt-2 truncate">Rx: {r.prescription}</p>}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 font-medium italic">No medical records found.</p>
              )
            ) : (
              recentPatients.length > 0 ? (
                recentPatients.map(p => (
                  <div key={p.id} className="p-4 bg-white/60 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Added {format(new Date(p.createdAt), 'MMM dd')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 font-medium italic">No recent patients.</p>
              )
            )}
          </div>
        </div>

        {/* Column 3: Patient Specific (Bills) */}
        {isPatient && (
          <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md border border-slate-100 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><CreditCard className="h-5 w-5 text-red-600"/> Recent Bills</h2>
              <Link to="/my-bills" className="text-sm text-blue-700 font-bold hover:underline">View All</Link>
            </div>
            <div className="space-y-4 flex-1">
              {recentBills.length > 0 ? (
                recentBills.map(b => (
                  <div key={b.id} className="p-4 bg-white/60 border border-slate-200 rounded-xl flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">₹{parseFloat(b.totalAmount).toLocaleString()}</p>
                      <p className="text-xs text-slate-600 font-medium mt-1">{format(new Date(b.visitDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                      b.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 font-medium italic">No bills found.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
