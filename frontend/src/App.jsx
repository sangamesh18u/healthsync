import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Staff from './pages/Staff';
import MedicalRecords from './pages/MedicalRecords';
import Billing from './pages/Billing';
import MyRecords, { MyBills } from './pages/PatientViews';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, userData) => {
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('user', JSON.stringify(userData), { expires: 1 });
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />

        {isAuthenticated ? (
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/patients" element={<Patients user={user} />} />
            <Route path="/appointments" element={<Appointments user={user} />} />
            {/* Admin & Receptionist */}
            <Route path="/billing" element={<Billing user={user} />} />
            {/* Admin only */}
            <Route path="/staff" element={<Staff user={user} />} />
            {/* Doctor & Admin */}
            <Route path="/records" element={<MedicalRecords user={user} />} />
            {/* Patient-only routes */}
            <Route path="/my-records" element={<MyRecords user={user} />} />
            <Route path="/my-bills" element={<MyBills user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
