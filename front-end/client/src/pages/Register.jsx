import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios'; // Make sure this path is correct for your axios file

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

    // 1. Basic Validation
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setIsLoading(true);
    try {
      // 2. Call the Backend (Adjust the URL path /auth/register if needed)
      await API.post('/auth/register', { username, email, password });
      
      alert("Registration successful! Please login.");
      navigate('/login');
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create FocusFlow Account</h2>
        
        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label>Username</label>
            <input name="username" type="text" value={username} onChange={onChange} required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Email Address</label>
            <input name="email" type="email" value={email} onChange={onChange} required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input name="password" type="password" value={password} onChange={onChange} required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Confirm Password</label>
            <input name="confirmPassword" type="password" value={confirmPassword} onChange={onChange} required style={styles.input} />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{...styles.button, backgroundColor: isLoading ? '#93c5fd' : '#10b981'}}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  card: { width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '1.5rem', color: '#1e293b' },
  errorBanner: { padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px', textAlign: 'center' },
  inputGroup: { marginBottom: '1rem' },
  input: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' },
  footerText: { marginTop: '1.5rem', textAlign: 'center', fontSize: '14px', color: '#64748b' },
  link: { color: '#10b981', textDecoration: 'none', fontWeight: 'bold' }
};

export default Register;