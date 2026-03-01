import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login'; 
import Register from './pages/Register'; // Import the new Register page
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder for Dashboard
const Dashboard = () => <div className="p-10 text-center"><h1>Welcome to your FocusFlow Dashboard!</h1></div>;

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <strong className="text-xl">FocusFlow</strong>
        <div className="flex gap-4">
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="hover:underline">Register</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;