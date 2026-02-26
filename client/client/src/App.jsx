import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/LogIn.jsx';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* If user goes to "/", send them to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;