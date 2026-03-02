import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public Roads: Anyone can see these */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private Road: The Bouncer (ProtectedRoute) guards this room */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* The Default Road: If they go to '/', send them to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* 404 Road: If the URL is nonsense, send them to Login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

// Architecture Tip: Keep styles outside the component function 
// so they aren't "re-created" every time the component renders.
const styles = {
  dashboardLayout: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: { color: '#2563eb', margin: 0 },
  userControls: { display: 'flex', alignItems: 'center', gap: '1rem' },
  username: { color: '#475569', fontSize: '0.9rem' },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  mainContent: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem 1rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center',
  },
  cardTitle: { marginBottom: '1.5rem', color: '#1e293b' }
};

export default App;
