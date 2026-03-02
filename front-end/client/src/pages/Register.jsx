import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios'; 

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setIsLoading(true);
    try {
      await API.post('/auth/register', { username, email, password });
      alert("Registration successful! Please login.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      {/* --- REGISTER CARD --- */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-50 relative overflow-hidden">
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-100 mb-4 text-2xl">
            🌱
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Join the Fleet</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Start your journey to peak productivity</p>
        </div>

        {/* --- ERROR BANNER --- */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
            <input 
              name="username" type="text" value={username} onChange={onChange} required 
              placeholder="Ace_Pilot"
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-200 transition-all font-medium text-slate-700 placeholder:text-slate-300" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <input 
              name="email" type="email" value={email} onChange={onChange} required 
              placeholder="pilot@focusflow.com"
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-200 transition-all font-medium text-slate-700 placeholder:text-slate-300" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <input 
                name="password" type="password" value={password} onChange={onChange} required 
                placeholder="••••"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-200 transition-all font-medium text-slate-700 placeholder:text-slate-300" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
              <input 
                name="confirmPassword" type="password" value={confirmPassword} onChange={onChange} required 
                placeholder="••••"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-200 transition-all font-medium text-slate-700 placeholder:text-slate-300" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-4
              ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 hover:shadow-emerald-200'}`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Complete Registry'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Already registered? {' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 transition-colors font-black underline underline-offset-4">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;