import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // While the app is checking the token, show a spinner or text
  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  // If the bouncer doesn't see a user, go to login
  if (!user) {
    console.log("🚫 Bouncer says: No User Found. Redirecting to Login.");
    return <Navigate to="/login" />;
  }

  // If user exists, let them in!
  return children;
};

export default ProtectedRoute;