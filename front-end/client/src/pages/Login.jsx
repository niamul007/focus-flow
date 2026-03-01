import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log("🚀 Attempting Login...");
      await login(email, password);
      
      // Small delay ensures state is updated before we move
      console.log("✅ Success! Redirecting to Dashboard...");
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check server/credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login to FocusFlow</h2>
        {error && <div style={styles.errorBanner}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required style={styles.input} />
          </div>
          <button type="submit" disabled={isLoading} style={{...styles.button, backgroundColor: isLoading ? '#93c5fd' : '#2563eb'}}>
            {isLoading ? 'Verifying...' : 'Login'}
          </button>
        </form>
        <p style={styles.footerText}>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  card: { width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '1.5rem' },
  errorBanner: { padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  inputGroup: { marginBottom: '1rem' },
  input: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  footerText: { marginTop: '1.5rem', textAlign: 'center', fontSize: '14px' }
};

export default Login;