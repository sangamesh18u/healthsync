import { useState } from 'react';
import { HeartPulse, Lock, Mail } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundImage: "url('/doctor_bg.png')", backgroundSize: 'cover', backgroundPosition: 'top right' }}>
      <div className="absolute inset-0 bg-blue-900/20"></div>
      
      <div className="max-w-md w-full bg-white/40 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-white/20">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center border-b border-blue-500/50">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl transform hover:scale-105 transition-transform">
            <HeartPulse className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">HealthSync HMS</h2>
          <p className="text-blue-100 mt-2 font-medium">Welcome back to your portal</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium shadow-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold p-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            
            <p className="text-center text-sm text-slate-600 font-medium pt-2">
              Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">Register here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
